from __future__ import annotations

from typing import Any


def build_pricing(case: dict[str, Any], service_fit: dict[str, Any], config: dict[str, Any]) -> dict[str, Any]:
    model = config["cost_model"]
    guardrails = config["financial_guardrails"]
    premium_costs = config["service_guardrails"]["premium_service_cost_eur"]

    annual_volume = int(service_fit["serviceable_annual_volume"])
    daily_volume = int(service_fit["serviceable_daily_volume"])
    if annual_volume <= 0 or daily_volume <= 0:
        return {
            "currency": model["currency"],
            "cost_row": None,
            "weighted_base_cost_eur": 0,
            "region_multiplier": service_fit["region_multiplier"],
            "scenarios": [],
            "recommended_scenario_id": None,
            "pricing_blocked": True,
            "blocked_reason": "No serviceable volume remains after applying Amazon Shipping challenge guardrails.",
            "guardrails": {
                "target_contribution_margin": guardrails["target_contribution_margin"],
                "minimum_contribution_margin": guardrails["minimum_contribution_margin"],
                "vp_approval_below": guardrails["vp_approval_below"],
                "automatic_no_go_below": guardrails["automatic_no_go_below"],
            },
        }

    row = select_cost_row(service_fit["serviceable_daily_volume"], model["volume_rows"])
    base_cost = weighted_base_cost(case["pricing_weight_mix"], row["base_cost_eur_by_weight_band"])
    regionalized_base_cost = base_cost * float(service_fit["region_multiplier"])

    scenarios: list[dict[str, Any]] = []
    for scenario in model["pricing_scenarios"]:
        premium_services = choose_premium_services(case, scenario["id"])
        premium_cost = sum(float(premium_costs[item]) for item in premium_services)
        cost_per_parcel = regionalized_base_cost + premium_cost
        target_margin = float(scenario["target_margin"])
        price_per_parcel = cost_per_parcel / (1.0 - target_margin)
        contribution_per_parcel = price_per_parcel - cost_per_parcel
        annual_revenue = price_per_parcel * annual_volume
        annual_contribution = contribution_per_parcel * annual_volume
        scenarios.append({
            "id": scenario["id"],
            "label": scenario["label"],
            "target_margin": round(target_margin, 4),
            "approval_status": approval_status(target_margin, guardrails),
            "cost_per_parcel_eur": round(cost_per_parcel, 2),
            "price_per_parcel_eur": round(price_per_parcel, 2),
            "contribution_per_parcel_eur": round(contribution_per_parcel, 2),
            "annual_serviceable_volume": annual_volume,
            "annual_revenue_eur": int(round(annual_revenue)),
            "annual_contribution_eur": int(round(annual_contribution)),
            "premium_services": premium_services,
            "rationale": scenario["positioning"],
            "trade_offs": scenario_tradeoffs(scenario["id"], premium_services),
            "negotiation_strategy": negotiation_strategy(scenario["id"], case),
            "evidence": ["FIN-01", "SVC-01"],
        })

    recommended = "balanced"
    return {
        "currency": model["currency"],
        "cost_row": row["id"],
        "weighted_base_cost_eur": round(base_cost, 2),
        "region_multiplier": service_fit["region_multiplier"],
        "scenarios": scenarios,
        "recommended_scenario_id": recommended,
        "pricing_blocked": False,
        "guardrails": {
            "target_contribution_margin": guardrails["target_contribution_margin"],
            "minimum_contribution_margin": guardrails["minimum_contribution_margin"],
            "vp_approval_below": guardrails["vp_approval_below"],
            "automatic_no_go_below": guardrails["automatic_no_go_below"],
        },
    }


def select_cost_row(daily_volume: int, rows: list[dict[str, Any]]) -> dict[str, Any]:
    for row in rows:
        max_daily = row["max_daily"]
        if daily_volume >= int(row["min_daily"]) and (max_daily is None or daily_volume <= int(max_daily)):
            return row
    return rows[0]


def weighted_base_cost(weight_mix: dict[str, float], costs: dict[str, float]) -> float:
    total_weight = sum(float(value) for value in weight_mix.values())
    if total_weight <= 0:
        raise ValueError("Weight mix must have positive total weight.")
    cost = 0.0
    for band, share in weight_mix.items():
        if band not in costs:
            raise KeyError(f"Missing cost for weight band {band}.")
        cost += (float(share) / total_weight) * float(costs[band])
    return cost


def choose_premium_services(case: dict[str, Any], scenario_id: str) -> list[str]:
    recommended = case.get("premium_services_recommended", [])
    if not recommended:
        return []
    if scenario_id == "aggressive":
        return recommended[:1]
    return recommended


def approval_status(margin: float, guardrails: dict[str, Any]) -> str:
    if margin < float(guardrails["automatic_no_go_below"]):
        return "automatic_no_go"
    if margin < float(guardrails["vp_approval_below"]):
        return "vp_approval_required"
    if margin < float(guardrails["minimum_contribution_margin"]):
        return "margin_exception"
    return "within_guardrails"


def scenario_tradeoffs(scenario_id: str, premium_services: list[str]) -> str:
    premium_note = (
        f" Includes {', '.join(premium_services)} premium controls."
        if premium_services
        else " Keeps premium services optional."
    )
    if scenario_id == "aggressive":
        return "Maximizes price competitiveness but leaves little room for concessions." + premium_note
    if scenario_id == "balanced":
        return "Balances competitiveness with the 21% target margin and keeps negotiation room." + premium_note
    return "Protects margin and execution risk, but may weaken price-score competitiveness." + premium_note


def negotiation_strategy(scenario_id: str, case: dict[str, Any]) -> str:
    if scenario_id == "aggressive":
        return "Use as a floor only after the customer confirms all unsupported scope is removed or split."
    if scenario_id == "balanced":
        return "Lead with this option and frame it around service reliability, peak readiness, and transparent pricing."
    if case["id"] == "tecnomania":
        return "Use as the executive-safe option for high-value electronics with OTP/SOD and strict scope carve-outs."
    if case["id"] == "pink_papaya":
        return "Use if Pink Papaya prioritizes peak resilience and CX protection over lowest Spain-only rate."
    return f"Use if {case['short_name']} prioritizes service certainty and scope discipline over the lowest possible rate."
