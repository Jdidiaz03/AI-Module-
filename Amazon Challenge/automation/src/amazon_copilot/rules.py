from __future__ import annotations

from typing import Any


def _round(value: float, digits: int = 2) -> float:
    return round(value + 1e-12, digits)


def classify_service_fit(case: dict[str, Any], config: dict[str, Any]) -> dict[str, Any]:
    guardrails = config["service_guardrails"]
    supported_regions = guardrails["supported_regions"]
    unsupported_regions = guardrails["unsupported_regions"]
    unsupported_services = guardrails["unsupported_services"]

    supported_scope: list[dict[str, Any]] = []
    blocked_scope: list[dict[str, Any]] = []
    review_scope: list[dict[str, Any]] = []
    supported_geo_share = 0.0
    weighted_multiplier_numerator = 0.0

    for item in case["geography"]:
        region = item["region"]
        share = float(item["share"])
        base = {
            "id": region,
            "label": item["label"],
            "share": share,
            "evidence": item.get("evidence", []),
        }
        if region in supported_regions:
            supported_geo_share += share
            multiplier = guardrails["region_multipliers"].get(region, 1.0)
            weighted_multiplier_numerator += share * multiplier
            supported_scope.append({**base, "reason": f"{item['label']} is in supported challenge scope."})
        else:
            blocked_scope.append({
                **base,
                "reason": unsupported_regions.get(region, f"{item['label']} is outside supported challenge scope."),
            })

    for req in case.get("requirements", []):
        status = req["status"]
        row = {
            "id": req["id"],
            "label": req["label"],
            "evidence": req.get("evidence", []),
        }
        if status == "supported":
            supported_scope.append({**row, "reason": "Requirement aligns with Amazon Shipping challenge scope."})
        elif status == "blocked":
            blocked_scope.append({
                **row,
                "reason": unsupported_services.get(req["id"], "Requirement is outside current challenge scope."),
            })
        else:
            review_scope.append({
                **row,
                "reason": "Requirement needs human validation before it can be promised commercially.",
            })

    parcel_adjustment = float(case["parcel_profile_adjustment"]["serviceable_share_after_weight_and_size_limits"])
    raw_daily = estimate_raw_daily_volume(case)
    raw_annual = estimate_raw_annual_volume(case)
    serviceable_daily = raw_daily * supported_geo_share * parcel_adjustment
    serviceable_annual = raw_annual * supported_geo_share * parcel_adjustment
    region_multiplier = (
        weighted_multiplier_numerator / supported_geo_share
        if supported_geo_share
        else 1.0
    )

    out_of_scope_share = max(0.0, 1.0 - supported_geo_share)
    serviceable_share = supported_geo_share * parcel_adjustment

    return {
        "supported_scope": supported_scope,
        "blocked_scope": blocked_scope,
        "review_scope": review_scope,
        "supported_geo_share": _round(supported_geo_share, 4),
        "out_of_scope_geo_share": _round(out_of_scope_share, 4),
        "parcel_profile_adjustment": parcel_adjustment,
        "serviceable_share": _round(serviceable_share, 4),
        "raw_daily_volume": int(round(raw_daily)),
        "raw_annual_volume": int(round(raw_annual)),
        "serviceable_daily_volume": int(round(serviceable_daily)),
        "serviceable_annual_volume": int(round(serviceable_annual)),
        "region_multiplier": _round(region_multiplier, 4),
        "parcel_adjustment_reason": case["parcel_profile_adjustment"]["reason"],
        "parcel_adjustment_evidence": case["parcel_profile_adjustment"].get("evidence", []),
    }


def estimate_raw_daily_volume(case: dict[str, Any]) -> float:
    baseline_daily = case["volume"].get("baseline_daily_parcels")
    if baseline_daily:
        return float(baseline_daily)
    annual = case["volume"].get("annual_parcels")
    if annual:
        return float(annual) / 365.0
    raise ValueError(f"Case {case['id']} has no annual or daily volume.")


def estimate_raw_annual_volume(case: dict[str, Any]) -> float:
    annual = case["volume"].get("annual_parcels")
    if annual:
        return float(annual)
    baseline_daily = case["volume"].get("baseline_daily_parcels")
    if baseline_daily:
        return float(baseline_daily) * 365.0
    raise ValueError(f"Case {case['id']} has no annual or daily volume.")
