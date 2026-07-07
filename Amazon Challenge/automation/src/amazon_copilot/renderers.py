from __future__ import annotations

import json
from pathlib import Path
from typing import Any


def write_case_outputs(case_output: dict[str, Any], output_dir: Path) -> None:
    case_id = case_output["case_id"]
    json_path = output_dir / f"{case_id}_analysis.json"
    md_path = output_dir / f"{case_id}_recommendation.md"
    json_path.write_text(json.dumps(case_output, indent=2, ensure_ascii=False), encoding="utf-8")
    md_path.write_text(render_markdown(case_output), encoding="utf-8")
    write_dashboard_index(output_dir)


def write_loop_report(report: dict[str, Any], output_dir: Path) -> None:
    (output_dir / "loop_report.json").write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    (output_dir / "loop_report.md").write_text(render_loop_report(report), encoding="utf-8")
    write_dashboard_index(output_dir)


def write_dashboard_index(output_dir: Path) -> None:
    rows: list[dict[str, Any]] = []
    for path in sorted(output_dir.glob("*_analysis.json")):
        try:
            payload = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            continue
        analysis = payload.get("analysis", {})
        rows.append({
            "case_id": payload.get("case_id"),
            "company": analysis.get("company", payload.get("case_id")),
            "file": f"automation/outputs/{path.name}",
            "recommendation_file": f"automation/outputs/{payload.get('case_id')}_recommendation.md",
            "passed": payload.get("passed", False),
            "iterations": payload.get("iterations"),
        })
    index = {
        "generated_at": __import__("datetime").datetime.now(__import__("datetime").UTC).isoformat(),
        "cases": rows,
    }
    (output_dir / "dashboard_index.json").write_text(json.dumps(index, indent=2, ensure_ascii=False), encoding="utf-8")


def render_markdown(case_output: dict[str, Any]) -> str:
    analysis = case_output["analysis"]
    service_fit = analysis["service_fit"]
    pricing = analysis["pricing_recommendation"]
    lines = [
        f"# {analysis['company']} Opportunity Recommendation",
        "",
        f"**Recommendation:** {analysis['recommendation']}",
        "",
        "## Executive Summary",
        analysis["executive_summary"],
        "",
        "## Serviceable Scope",
        f"- Raw annual volume: {service_fit['raw_annual_volume']:,}",
        f"- Serviceable annual volume: {service_fit['serviceable_annual_volume']:,}",
        f"- Serviceable daily volume: {service_fit['serviceable_daily_volume']:,}",
        f"- Serviceable share: {service_fit['serviceable_share']:.1%}",
        f"- Parcel adjustment: {service_fit['parcel_adjustment_reason']}",
        "",
        "## Blocked Scope",
    ]
    for item in service_fit["blocked_scope"]:
        lines.append(f"- {item['label']}: {item['reason']}")
    lines.extend(["", "## Pricing Scenarios"])
    if pricing.get("pricing_blocked"):
        lines.append(f"- Pricing blocked: {pricing.get('blocked_reason', 'No compliant pricing scenario was generated.')}")
    else:
        for scenario in pricing["scenarios"]:
            lines.extend([
                f"### {scenario['label']}",
                f"- Price: EUR {scenario['price_per_parcel_eur']:.2f} per parcel",
                f"- Margin: {scenario['target_margin']:.0%}",
                f"- Approval: {scenario['approval_status']}",
                f"- Annual contribution: EUR {scenario['annual_contribution_eur']:,}",
                f"- Rationale: {scenario['rationale']}",
                f"- Trade-offs: {scenario['trade_offs']}",
                f"- Negotiation: {scenario['negotiation_strategy']}",
            ])
    lines.extend(["", "## Risk Assessment", f"Risk level: {analysis['risk_assessment']['level']}"])
    for risk in analysis["risk_assessment"]["risks"]:
        lines.append(f"- [{risk['severity']}] {risk['risk']}: {risk['mitigation']}")
    lines.extend(["", "## Follow-Up Actions"])
    for action in analysis["required_follow_up_actions"]:
        lock = "blocks export" if action["blocks_export"] else "does not block export"
        lines.append(f"- {action['owner']}: {action['question']} ({lock})")
    lines.extend(["", "## Client Proposal Draft"])
    for section in analysis["client_proposal"]["sections"]:
        lines.extend([f"### {section['heading']}", section["body"], ""])
    lines.extend(["## Sources Used"])
    for source in analysis["sources_used"]:
        lines.append(f"- {source['id']}: {source['source']} - {source['locator']} - {source['claim']}")
    lines.extend(["", "## Loop Validation"])
    lines.append(f"- Iterations: {case_output['iterations']}")
    lines.append(f"- Passed: {case_output['passed']}")
    for validator in case_output["validator_results"]:
        lines.append(f"- {validator['agent']}: {validator['status']}")
    return "\n".join(lines) + "\n"


def render_loop_report(report: dict[str, Any]) -> str:
    lines = [
        "# Loop Prompting Automation Report",
        "",
        f"Passed all KPIs: {report['passed_all_kpis']}",
        f"Cases processed: {report['cases_processed']}",
        f"Rule version: {report['rule_version']}",
        "",
        "## Case Results",
    ]
    for case in report["case_results"]:
        lines.append(f"- {case['case_id']}: passed={case['passed']} iterations={case['iterations']}")
        for result in case["validator_results"]:
            lines.append(f"  - {result['agent']}: {result['status']} ({result['finding_count']} findings)")
    return "\n".join(lines) + "\n"
