from __future__ import annotations

import copy
from pathlib import Path
from typing import Any

from .data import ensure_output_dir, load_cases, load_config
from .pricing import build_pricing
from .recommendations import build_recommendation
from .renderers import write_case_outputs, write_loop_report
from .rules import classify_service_fit
from .validators import all_validator_agents


def run_all_cases(output_dir: Path | None = None, max_iterations: int | None = None) -> dict[str, Any]:
    config = load_config()
    out_dir = ensure_output_dir(output_dir)
    limit = max_iterations or int(config["kpis"]["max_loop_iterations"])
    case_results = [run_case(case, config, out_dir, limit) for case in load_cases()]
    report = {
        "rule_version": config["rule_version"],
        "automation_mode": "offline_local_deterministic_loop",
        "cases_processed": len(case_results),
        "passed_all_kpis": all(item["passed"] for item in case_results),
        "case_results": summarize_case_results(case_results),
    }
    write_loop_report(report, out_dir)
    return report


def run_one_case(case_id: str, output_dir: Path | None = None, max_iterations: int | None = None) -> dict[str, Any]:
    config = load_config()
    out_dir = ensure_output_dir(output_dir)
    limit = max_iterations or int(config["kpis"]["max_loop_iterations"])
    for case in load_cases():
        if case["id"] == case_id:
            return run_case(case, config, out_dir, limit)
    raise KeyError(f"Unknown case id: {case_id}")


def run_case(case: dict[str, Any], config: dict[str, Any], output_dir: Path, max_iterations: int) -> dict[str, Any]:
    working_case = copy.deepcopy(case)
    history: list[dict[str, Any]] = []
    validator_agents = all_validator_agents()
    latest_output: dict[str, Any] | None = None

    for iteration in range(1, max_iterations + 1):
        service_fit = classify_service_fit(working_case, config)
        pricing = build_pricing(working_case, service_fit, config)
        analysis = build_recommendation(working_case, service_fit, pricing, config)
        latest_output = {
            "case_id": working_case["id"],
            "rule_version": config["rule_version"],
            "automation_mode": "offline_local_deterministic_loop",
            "pipeline_trace": [
                "source_pack_loaded",
                "facts_normalized",
                "service_guardrails_applied",
                "pricing_scenarios_generated",
                "recommendation_rendered",
                "validator_agents_reviewed",
            ],
            "analysis": analysis,
            "iterations": iteration,
            "passed": False,
            "validator_results": [],
            "repair_history": history,
        }
        validator_results = []
        all_findings = []
        for agent in validator_agents:
            findings = agent.review(latest_output, working_case, config)
            validator_results.append({
                "agent": agent.name,
                "status": "pass" if not findings else "fail",
                "finding_count": len(findings),
                "findings": findings,
            })
            all_findings.extend(findings)
        latest_output["validator_results"] = validator_results
        if not all_findings:
            latest_output["passed"] = True
            write_case_outputs(latest_output, output_dir)
            return latest_output
        history.append({
            "iteration": iteration,
            "findings": all_findings,
            "repair": "Regenerated from deterministic rules after findings. No prompt-only override allowed.",
        })
        working_case = repair_case(working_case, all_findings)

    assert latest_output is not None
    write_case_outputs(latest_output, output_dir)
    return latest_output


def repair_case(case: dict[str, Any], findings: list[dict[str, Any]]) -> dict[str, Any]:
    repaired = copy.deepcopy(case)
    # The current fixtures should pass in one iteration. This repair hook is
    # intentionally conservative: it can only add review flags, never remove
    # hard guardrails or increase serviceable volume.
    for finding in findings:
        if finding["step"] == "human review":
            repaired.setdefault("requirements", []).append({
                "id": "human_review_gate",
                "label": "Human review gate",
                "status": "review",
                "evidence": ["FIN-01", "SVC-01"],
            })
    return repaired


def summarize_case_results(case_results: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [
        {
            "case_id": item["case_id"],
            "passed": item["passed"],
            "iterations": item["iterations"],
            "recommendation": item["analysis"]["recommendation"],
            "serviceable_annual_volume": item["analysis"]["service_fit"]["serviceable_annual_volume"],
            "validator_results": [
                {
                    "agent": result["agent"],
                    "status": result["status"],
                    "finding_count": result["finding_count"],
                }
                for result in item["validator_results"]
            ],
        }
        for item in case_results
    ]
