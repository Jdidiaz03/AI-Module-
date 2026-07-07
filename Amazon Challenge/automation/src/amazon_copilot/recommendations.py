from __future__ import annotations

from typing import Any


def build_recommendation(
    case: dict[str, Any],
    service_fit: dict[str, Any],
    pricing: dict[str, Any],
    config: dict[str, Any],
) -> dict[str, Any]:
    score = opportunity_score(case, service_fit, pricing)
    win_probability = win_probability_score(case, service_fit, score)
    risk = risk_assessment(case, service_fit)
    recommendation = recommendation_label(case, risk)
    followups = required_followups(case, service_fit)

    return {
        "case_id": case["id"],
        "company": case["display_name"],
        "recommendation": recommendation,
        "executive_summary": executive_summary(case, service_fit, recommendation),
        "service_fit": service_fit,
        "opportunity_score": score,
        "risk_assessment": risk,
        "pricing_recommendation": pricing,
        "commercial_strategy": commercial_strategy(case, service_fit, pricing),
        "required_follow_up_actions": followups,
        "client_proposal": client_proposal(case, service_fit, pricing, recommendation),
        "win_probability_score": win_probability,
        "sources_used": sources_used(case),
        "human_review_required": True,
        "export_status": "locked_until_human_approval",
        "source_pack": config["source_pack"],
    }


def recommendation_label(case: dict[str, Any], risk: dict[str, Any]) -> str:
    if risk["serviceable_annual_volume"] <= 0:
        return "No-go: submitted scope is outside Amazon Shipping service guardrails."
    if case["decision_hint"] == "conditional_pursue_spain_first":
        return "Conditional pursue: Spain-first proposal with explicit France gap."
    if risk["level"] == "High":
        return "Conditional pursue: price only serviceable scope and require leadership review."
    return "Pursue with scoped commercial proposal."


def executive_summary(case: dict[str, Any], service_fit: dict[str, Any], recommendation: str) -> str:
    blocked_labels = ", ".join(item["label"] for item in service_fit["blocked_scope"][:4])
    article = "an" if case["sector"][:1].lower() in {"a", "e", "i", "o", "u"} else "a"
    return (
        f"{case['short_name']} is {article} {case['sector']} opportunity at {case['stage']} stage. "
        f"The automation recommends {recommendation.lower()} Serviceable volume is "
        f"{service_fit['serviceable_annual_volume']:,} parcels annually "
        f"({service_fit['serviceable_daily_volume']:,} daily), not the full raw opportunity. "
        f"Key exclusions include {blocked_labels}."
    )


def opportunity_score(case: dict[str, Any], service_fit: dict[str, Any], pricing: dict[str, Any]) -> dict[str, Any]:
    if service_fit["serviceable_annual_volume"] <= 0:
        return {
            "score": 0,
            "scale": "0-100",
            "drivers": [
                "No supported Amazon Shipping geography remains after guardrails",
                "No pricing can be generated for unsupported-only scope",
                "Human follow-up is required before a customer-facing proposal",
            ],
            "evidence": ["FIN-01", "SVC-01"],
        }
    service_fit_points = 35 * service_fit["serviceable_share"]
    volume_points = 20 if service_fit["serviceable_annual_volume"] >= 1000000 else 14
    pain_fit_points = 18 if len(case.get("pain_points", [])) >= 3 else 12
    finance_points = 15 if pricing["recommended_scenario_id"] == "balanced" else 10
    complexity_penalty = min(18, 3 * len(service_fit["blocked_scope"]) + 2 * len(service_fit["review_scope"]))
    score = int(round(service_fit_points + volume_points + pain_fit_points + finance_points + 12 - complexity_penalty))
    score = max(0, min(100, score))
    return {
        "score": score,
        "scale": "0-100",
        "drivers": [
            "Serviceable share after geographic and parcel-profile filtering",
            "Annual serviceable volume",
            "Strength of customer pain points",
            "Target-margin pricing feasibility",
            "Operational complexity from blocked or review-needed scope",
        ],
        "evidence": ["FIN-01", "SVC-01"],
    }


def win_probability_score(case: dict[str, Any], service_fit: dict[str, Any], score: dict[str, Any]) -> dict[str, Any]:
    if service_fit["serviceable_annual_volume"] <= 0:
        return {
            "probability": 0.05,
            "method": "Rule-based proxy using service fit, pricing feasibility, complexity, and comparable opportunity logic.",
            "evidence": ["FIN-01", "SVC-01"],
        }
    probability = 0.35 + (score["score"] / 100.0) * 0.35
    probability -= 0.03 * len(service_fit["blocked_scope"])
    if case["id"] == "pink_papaya":
        probability -= 0.08
    if case["id"] == "tecnomania":
        probability -= 0.04
    probability = max(0.05, min(0.85, probability))
    return {
        "probability": round(probability, 2),
        "method": "Rule-based proxy using service fit, pricing feasibility, complexity, and comparable opportunity logic.",
        "evidence": ["FIN-01", "SVC-01"],
    }


def risk_assessment(case: dict[str, Any], service_fit: dict[str, Any]) -> dict[str, Any]:
    risks = []
    for item in service_fit["blocked_scope"]:
        risks.append({
            "severity": "High",
            "risk": item["label"],
            "mitigation": "Exclude from Amazon Shipping proposal or route to a separate partner/workaround outside the priced scope.",
            "evidence": item.get("evidence", []),
        })
    for item in service_fit["review_scope"]:
        risks.append({
            "severity": "Medium",
            "risk": item["label"],
            "mitigation": "Confirm details with customer and operations before customer-facing commitment.",
            "evidence": item.get("evidence", []),
        })
    for conflict in case.get("contradictions", []):
        risks.append({
            "severity": "High",
            "risk": f"Contradiction: {conflict['topic']}",
            "mitigation": f"Resolve customer alignment. Position A: {conflict['position_a']} Position B: {conflict['position_b']}",
            "evidence": conflict.get("evidence", []),
        })
    level = "High" if any(item["severity"] == "High" for item in risks) else "Medium"
    return {
        "level": level,
        "risks": risks,
        "serviceable_annual_volume": service_fit["serviceable_annual_volume"],
    }


def commercial_strategy(case: dict[str, Any], service_fit: dict[str, Any], pricing: dict[str, Any]) -> dict[str, Any]:
    if service_fit["serviceable_annual_volume"] <= 0:
        positioning = (
            "Do not present a commercial proposal until the customer provides supported Spain or Balearic scope."
        )
    elif case["id"] == "pink_papaya":
        positioning = (
            "Lead with a Spain-first peak resilience and home-delivery recovery plan. "
            "Be direct that France is not in current scope and needs a separate timeline or partner answer."
        )
    elif case["id"] == "tecnomania":
        positioning = (
            "Lead with serviceable Iberian Spain scope, high-value proof-of-delivery controls, "
            "and strict carve-outs for Portugal, returns, heavy parcels, and PUDO fallback."
        )
    else:
        positioning = (
            "Lead with serviceable Spain scope, campaign-peak readiness, tracking reliability, "
            "and strict carve-outs for unsupported geography, returns, oversize parcels, and PUDO fallback."
        )
    return {
        "positioning": positioning,
        "recommended_pricing_anchor": pricing["recommended_scenario_id"],
        "talk_tracks": [
            "Peak resilience and maintained delivery attempts",
            "Transparent pricing tied to serviceable scope",
            "Evidence-backed exclusions to avoid overpromising",
            "Human-reviewed proposal before export",
        ],
    }


def required_followups(case: dict[str, Any], service_fit: dict[str, Any]) -> list[dict[str, Any]]:
    if service_fit["serviceable_annual_volume"] <= 0:
        return [
            {
                "owner": "Business Development",
                "question": "Ask the customer to resubmit or split out supported Spain/Balearic volume before pricing.",
                "blocks_export": True,
                "evidence": ["SVC-01"],
            },
            {
                "owner": "Human Reviewer",
                "question": "Confirm that no serviceable Amazon Shipping scope remains in the submitted opportunity.",
                "blocks_export": True,
                "evidence": ["FIN-01", "SVC-01"],
            },
        ]
    followups = [
        {
            "owner": "Business Development",
            "question": "Confirm that the customer accepts Amazon Shipping pricing only for serviceable scope.",
            "blocks_export": True,
            "evidence": ["SVC-01"],
        },
        {
            "owner": "Pricing",
            "question": "Review the balanced scenario before customer-facing proposal release.",
            "blocks_export": True,
            "evidence": ["FIN-01"],
        },
    ]
    if case["id"] == "tecnomania":
        followups.extend([
            {
                "owner": "Operations",
                "question": "Validate parcel-level exclusion method for over-15kg and oversize electronics before contract language.",
                "blocks_export": True,
                "evidence": ["TECM-WGT-01", "TECM-DIM-01"],
            },
            {
                "owner": "Business Development",
                "question": "Confirm whether Tecnomania accepts separate handling for Portugal, Canary/Ceuta/Melilla, returns, and PUDO fallback.",
                "blocks_export": True,
                "evidence": ["TECM-GEO-01", "TECM-RET-01", "TECM-PUDO-01"],
            },
        ])
    if case["id"] == "pink_papaya":
        followups.extend([
            {
                "owner": "Business Development",
                "question": "Resolve Lucia vs Marta contradiction on whether France can be phased after Spain.",
                "blocks_export": True,
                "evidence": ["PAPA-FRA-01", "PAPA-FRA-02"],
            },
            {
                "owner": "Operations",
                "question": "Request Papaya Home SKU weights and dimensions, especially anything above 15kg or 80x80x60cm.",
                "blocks_export": True,
                "evidence": ["PAPA-HOME-01"],
            },
        ])
    return followups


def client_proposal(
    case: dict[str, Any],
    service_fit: dict[str, Any],
    pricing: dict[str, Any],
    recommendation: str,
) -> dict[str, Any]:
    balanced = next((item for item in pricing["scenarios"] if item["id"] == pricing["recommended_scenario_id"]), None)
    exclusions = [item["label"] for item in service_fit["blocked_scope"]]
    if balanced:
        pricing_body = (
            f"Balanced scenario: EUR {balanced['price_per_parcel_eur']:.2f} per parcel at "
            f"{int(balanced['target_margin'] * 100)}% target contribution margin."
        )
    else:
        pricing_body = pricing.get(
            "blocked_reason",
            "No compliant pricing scenario was generated for this submitted scope.",
        )
    return {
        "title": f"Amazon Shipping Proposal for {case['short_name']}",
        "status": "draft_locked_pending_human_review",
        "customer_ready_after_approval": True,
        "sections": [
            {
                "heading": "Executive Recommendation",
                "body": recommendation,
            },
            {
                "heading": "Proposed Scope",
                "body": (
                    f"Amazon Shipping proposes to serve {service_fit['serviceable_annual_volume']:,} "
                    f"annual parcels within supported Spain scope, subject to parcel-level eligibility checks."
                ),
            },
            {
                "heading": "Pricing Anchor",
                "body": pricing_body,
            },
            {
                "heading": "Explicit Exclusions",
                "body": "; ".join(exclusions),
            },
            {
                "heading": "Implementation Plan",
                "body": "Confirm scope, validate parcel data, complete API readiness review, run peak-readiness governance, then release final proposal.",
            },
        ],
    }


def sources_used(case: dict[str, Any]) -> list[dict[str, str]]:
    return [
        {
            "id": evidence_id,
            "source": item["source"],
            "locator": item["locator"],
            "claim": item["claim"],
        }
        for evidence_id, item in sorted(case["evidence"].items())
    ]
