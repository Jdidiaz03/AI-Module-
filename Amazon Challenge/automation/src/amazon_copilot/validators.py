from __future__ import annotations

from typing import Any


class ValidatorAgent:
    name = "Validator"

    def review(self, output: dict[str, Any], case: dict[str, Any], config: dict[str, Any]) -> list[dict[str, Any]]:
        raise NotImplementedError

    def finding(self, severity: str, step: str, expected: str, actual: str, blocks_export: bool = True) -> dict[str, Any]:
        return {
            "agent": self.name,
            "severity": severity,
            "step": step,
            "expected": expected,
            "actual": actual,
            "blocks_export": blocks_export,
        }


class CodeQualityAgent(ValidatorAgent):
    name = "Code Quality Agent"

    def review(self, output: dict[str, Any], case: dict[str, Any], config: dict[str, Any]) -> list[dict[str, Any]]:
        findings: list[dict[str, Any]] = []
        trace = output.get("pipeline_trace", [])
        if len(trace) < 5:
            findings.append(self.finding("P1", "pipeline trace", "Extraction, guardrails, pricing, recommendation, and validation stages exposed.", str(trace)))
        if output.get("rule_version") != config["rule_version"]:
            findings.append(self.finding("P1", "rule version", "Output records the active challenge rule version.", str(output.get("rule_version"))))
        if not output.get("automation_mode", "").startswith("offline"):
            findings.append(self.finding("P2", "execution mode", "Automation defaults to offline/local execution.", str(output.get("automation_mode")), False))
        if output["analysis"]["service_fit"]["raw_annual_volume"] == output["analysis"]["service_fit"]["serviceable_annual_volume"] and output["analysis"]["service_fit"]["blocked_scope"]:
            findings.append(self.finding("P0", "serviceable volume", "Blocked scope reduces priced volume.", "Raw and serviceable volume are identical."))
        return findings


class ProjectAlignmentAgent(ValidatorAgent):
    name = "Project Alignment Agent"

    def review(self, output: dict[str, Any], case: dict[str, Any], config: dict[str, Any]) -> list[dict[str, Any]]:
        findings: list[dict[str, Any]] = []
        analysis = output["analysis"]
        required = config["kpis"]["required_outputs"]
        for key in required:
            if key not in analysis or analysis[key] in (None, "", [], {}):
                findings.append(self.finding("P0", "required outputs", f"Output includes {key}.", f"Missing or empty {key}."))

        pricing = analysis["pricing_recommendation"]
        scenarios = pricing.get("scenarios", [])
        if pricing.get("pricing_blocked"):
            if scenarios:
                findings.append(self.finding("P0", "pricing scenarios", "Blocked pricing does not include customer-facing scenarios.", f"Found {len(scenarios)}."))
            if analysis["service_fit"]["serviceable_annual_volume"] > 0:
                findings.append(self.finding("P0", "pricing block", "Pricing is blocked only when no serviceable scope remains.", str(analysis["service_fit"])))
        else:
            if len(scenarios) != 3:
                findings.append(self.finding("P0", "pricing scenarios", "Exactly three pricing scenarios.", f"Found {len(scenarios)}."))
            for scenario in scenarios:
                margin = float(scenario["target_margin"])
                if margin < config["financial_guardrails"]["minimum_contribution_margin"] and scenario["approval_status"] != "vp_approval_required":
                    findings.append(self.finding("P0", "margin guardrails", "Margins below 13% need approval flag.", str(scenario)))
                if margin < config["financial_guardrails"]["automatic_no_go_below"]:
                    findings.append(self.finding("P0", "no-go guardrail", "Margins below 9% are automatic no-go.", str(scenario)))
                for field in ("rationale", "trade_offs", "negotiation_strategy"):
                    if not scenario.get(field):
                        findings.append(self.finding("P1", "pricing rationale", f"Scenario has {field}.", str(scenario)))

        if not analysis.get("human_review_required"):
            findings.append(self.finding("P0", "human review", "Human review required before export.", "Not required."))
        if analysis.get("export_status") != "locked_until_human_approval":
            findings.append(self.finding("P0", "export lock", "Export locked until human approval.", str(analysis.get("export_status"))))

        source_ids = {item["id"] for item in analysis.get("sources_used", [])}
        if "FIN-01" not in source_ids or "SVC-01" not in source_ids:
            findings.append(self.finding("P1", "sources used", "Finance and service guardrail sources included.", str(sorted(source_ids))))
        return findings


class KPITrialAgent(ValidatorAgent):
    name = "KPI Trial Agent"

    def review(self, output: dict[str, Any], case: dict[str, Any], config: dict[str, Any]) -> list[dict[str, Any]]:
        findings: list[dict[str, Any]] = []
        analysis = output["analysis"]
        service_fit = analysis["service_fit"]
        blocked_ids = {item["id"] for item in service_fit["blocked_scope"]}
        review_ids = {item["id"] for item in service_fit["review_scope"]}

        if case["id"] == "tecnomania":
            required_blocked = {"portugal_mainland", "portugal_islands", "canary_ceuta_melilla", "client_returns", "pudo", "heavy_bulky"}
            missing = required_blocked - blocked_ids
            if missing:
                findings.append(self.finding("P0", "Tecnomania guardrails", f"Blocked scope includes {sorted(required_blocked)}.", f"Missing {sorted(missing)}."))
            if service_fit["serviceable_annual_volume"] >= service_fit["raw_annual_volume"]:
                findings.append(self.finding("P0", "Tecnomania pricing volume", "Does not price unsupported full 2.92M volume.", str(service_fit)))
            proposal_text = " ".join(section["body"] for section in analysis["client_proposal"]["sections"]).lower()
            if "portugal" in proposal_text and "explicit exclusions" not in " ".join(section["heading"].lower() for section in analysis["client_proposal"]["sections"]):
                findings.append(self.finding("P0", "Tecnomania proposal", "Unsupported Portugal is not promised.", proposal_text))

        if case["id"] == "pink_papaya":
            if "france" not in blocked_ids:
                findings.append(self.finding("P0", "Pink Papaya France", "France is blocked or explicitly out of current scope.", str(blocked_ids)))
            if "heavy_bulky" not in review_ids:
                findings.append(self.finding("P1", "Papaya Home", "Bulky/heavy Papaya Home items are review-needed.", str(review_ids)))
            contradictions = analysis["risk_assessment"].get("risks", [])
            if not any("France timing" in item["risk"] for item in contradictions):
                findings.append(self.finding("P0", "France contradiction", "Lucia/Marta France contradiction is surfaced.", str(contradictions)))
            expected_daily = 2888
            actual_daily = int(service_fit["serviceable_daily_volume"])
            if abs(actual_daily - expected_daily) > 5:
                findings.append(self.finding("P1", "Pink Papaya serviceable volume", "Spain-only serviceable daily volume is about 2,888.", str(actual_daily)))
        return findings


def all_validator_agents() -> list[ValidatorAgent]:
    return [CodeQualityAgent(), ProjectAlignmentAgent(), KPITrialAgent()]
