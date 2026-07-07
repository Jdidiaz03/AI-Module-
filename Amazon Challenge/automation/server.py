from __future__ import annotations

import json
import re
import sys
import time
import uuid
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent
WORKSPACE_ROOT = ROOT.parent
SRC = ROOT / "src"
sys.path.insert(0, str(SRC))

from amazon_copilot.data import ensure_output_dir, load_config  # noqa: E402
from amazon_copilot.emailer import send_or_queue_result_email  # noqa: E402
from amazon_copilot.pipeline import run_case  # noqa: E402
from amazon_copilot.renderers import write_case_outputs  # noqa: E402


class ReviewServer(SimpleHTTPRequestHandler):
    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, directory=str(WORKSPACE_ROOT), **kwargs)

    def do_POST(self) -> None:
        if self.path != "/api/review":
            self.send_error(HTTPStatus.NOT_FOUND, "Unknown endpoint")
            return
        try:
            payload = self.read_json_body()
            case = build_dynamic_case(payload)
            intake_path = write_intake(case["id"], payload, case)
            config = load_config()
            output = run_case(case, config, ensure_output_dir(), int(config["kpis"]["max_loop_iterations"]))
            email_result = send_or_queue_result_email(payload.get("email", ""), output)
            output["delivery"] = {
                "email": email_result,
                "recipient": payload.get("email", ""),
            }
            write_case_outputs(output, ensure_output_dir())
            self.write_json({
                "ok": True,
                "case_id": output["case_id"],
                "company": output["analysis"]["company"],
                "recommendation": output["analysis"]["recommendation"],
                "dashboard_url": f"/dashboard.html?case={output['case_id']}",
                "analysis_file": f"/automation/outputs/{output['case_id']}_analysis.json",
                "recommendation_file": f"/automation/outputs/{output['case_id']}_recommendation.md",
                "intake_file": str(intake_path.relative_to(WORKSPACE_ROOT)),
                "email": email_result,
                "output": output,
            })
        except Exception as error:
            self.write_json({"ok": False, "error": str(error)}, status=HTTPStatus.BAD_REQUEST)

    def read_json_body(self) -> dict[str, Any]:
        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length)
        if not raw:
            return {}
        return json.loads(raw.decode("utf-8"))

    def write_json(self, payload: dict[str, Any], status: HTTPStatus = HTTPStatus.OK) -> None:
        data = json.dumps(payload, indent=2, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)


def build_dynamic_case(payload: dict[str, Any]) -> dict[str, Any]:
    company = str(payload.get("company") or "Submitted Opportunity").strip()
    email = str(payload.get("email") or "").strip()
    if not email or "@" not in email:
        raise ValueError("A valid email is required so the review result can be sent or queued.")
    monthly_volume = int(float(payload.get("monthly_volume") or 0))
    if monthly_volume <= 0:
        raise ValueError("Estimated monthly parcel volume must be greater than zero.")
    case_id = f"submitted_{slugify(company)}_{int(time.time() * 1000)}_{uuid.uuid4().hex[:8]}"
    notes = str(payload.get("notes") or "")
    primary_region = str(payload.get("primary_region") or "Mixed or unknown")
    annual_volume = monthly_volume * 12
    prefix = evidence_prefix(company)
    geography = geography_from_region(primary_region, prefix)
    requirements = requirements_from_notes(notes, prefix)
    has_heavy_review = any(item["id"] == "heavy_bulky" for item in requirements)
    source_name = f"Form_Intake_{case_id}.json"
    evidence = build_evidence(prefix, source_name, company, annual_volume, primary_region, notes)
    return {
        "id": case_id,
        "display_name": company,
        "short_name": company.split()[0],
        "opportunity_type": str(payload.get("opportunity_type") or "Submitted review"),
        "sector": "submitted ecommerce opportunity",
        "stage": "Submitted / Automation review",
        "source_files": [source_name, "PL_Industry_Challenge.xlsx", "README_Industry_Challenge.docx", "Amazon_Shipping_AI_Copilot.pptx"],
        "volume": {
            "annual_parcels": annual_volume,
            "baseline_daily_parcels": None,
            "peak_multiplier": 3.0 if "peak" in notes.lower() else 1.5,
            "start_date": None,
        },
        "geography": geography,
        "parcel_profile_adjustment": {
            "serviceable_share_after_weight_and_size_limits": 0.94 if has_heavy_review else 1.0,
            "reason": "Submitted notes mention heavy, bulky, or oversize items that need parcel-level validation." if has_heavy_review else "Submitted notes do not indicate weight or dimension issues; parcel profile remains assumed serviceable pending validation.",
            "evidence": [f"{prefix}-PARCEL-01"],
        },
        "pricing_weight_mix": {
            "0_0_5": 0.16,
            "0_5_1": 0.22,
            "1_2": 0.32,
            "2_5": 0.22,
            "5_10": 0.06,
            "10_15": 0.02,
        },
        "requirements": requirements,
        "pain_points": pain_points_from_notes(notes),
        "premium_services_recommended": ["SOD"] if re.search(r"high.value|signature|proof|fraud|dispute", notes, re.I) else [],
        "decision_hint": "conditional_pursue",
        "evidence": evidence,
    }


def geography_from_region(primary_region: str, prefix: str) -> list[dict[str, Any]]:
    region = primary_region.lower()
    if "spain peninsula" in region:
        rows = [("spain_peninsula", "Spain - Iberian Peninsula", 1.0)]
    elif "balear" in region:
        rows = [("balearic_islands", "Spain - Balearic Islands", 1.0)]
    elif "portugal" in region:
        rows = [("portugal_mainland", "Portugal - Mainland", 1.0)]
    elif "france" in region:
        rows = [("france", "France", 1.0)]
    else:
        rows = [
            ("spain_peninsula", "Spain - Iberian Peninsula", 0.72),
            ("balearic_islands", "Spain - Balearic Islands", 0.08),
            ("portugal_mainland", "Portugal - Mainland", 0.10),
            ("france", "France", 0.10),
        ]
    return [{"region": key, "label": label, "share": share, "evidence": [f"{prefix}-GEO-01"]} for key, label, share in rows]


def requirements_from_notes(notes: str, prefix: str) -> list[dict[str, Any]]:
    lower = notes.lower()
    requirements = [
        {"id": "home_delivery", "label": "Home delivery", "status": "supported", "evidence": [f"{prefix}-SVC-01"]},
        {"id": "tracking_api", "label": "Tracking and status visibility", "status": "supported", "evidence": [f"{prefix}-TECH-01"]},
    ]
    if re.search(r"weekend|saturday|sunday|peak|campaign|drop", lower):
        requirements.append({"id": "weekend_delivery", "label": "Weekend or peak support", "status": "supported", "evidence": [f"{prefix}-PEAK-01"]})
    if re.search(r"pudo|pickup|pick-up|locker|collection point", lower):
        requirements.append({"id": "pudo", "label": "Pickup point or locker request", "status": "blocked", "evidence": [f"{prefix}-PUDO-01"]})
    if re.search(r"return|returns|reverse", lower):
        requirements.append({"id": "client_returns", "label": "Returns or reverse logistics request", "status": "blocked", "evidence": [f"{prefix}-RET-01"]})
    if re.search(r"heavy|bulky|oversize|large|furniture|appliance", lower):
        requirements.append({"id": "heavy_bulky", "label": "Heavy, bulky, or oversize items", "status": "review", "evidence": [f"{prefix}-PARCEL-01"]})
    return requirements


def build_evidence(prefix: str, source_name: str, company: str, annual_volume: int, primary_region: str, notes: str) -> dict[str, dict[str, str]]:
    evidence = {
        f"{prefix}-VOL-01": {"source": source_name, "locator": "Submitted form / volume", "claim": f"{company} submitted an estimated annual volume of {annual_volume:,} parcels."},
        f"{prefix}-GEO-01": {"source": source_name, "locator": "Submitted form / primary region", "claim": f"Primary region submitted as {primary_region}."},
        f"{prefix}-SVC-01": {"source": source_name, "locator": "Submitted form / service needs", "claim": "Home delivery is assumed as the core ecommerce delivery need."},
        f"{prefix}-TECH-01": {"source": source_name, "locator": "Submitted form / workflow assumption", "claim": "Tracking visibility is included as a standard review requirement."},
        f"{prefix}-PARCEL-01": {"source": source_name, "locator": "Submitted form / notes", "claim": notes or "No parcel-profile notes were submitted."},
        f"{prefix}-PEAK-01": {"source": source_name, "locator": "Submitted form / notes", "claim": notes or "No peak notes were submitted."},
        f"{prefix}-PUDO-01": {"source": source_name, "locator": "Submitted form / notes", "claim": notes or "No PUDO notes were submitted."},
        f"{prefix}-RET-01": {"source": source_name, "locator": "Submitted form / notes", "claim": notes or "No returns notes were submitted."},
        "FIN-01": {"source": "PL_Industry_Challenge.xlsx", "locator": "Read Me / Finance Guardrails per deal", "claim": "Target margin 21%, minimum margin 13%, VP approval below 13%, automatic no-go below 9%."},
        "SVC-01": {"source": "Amazon_Shipping_AI_Copilot.pptx", "locator": "Service guardrails slide", "claim": "Supported challenge scope is Peninsular Spain and Balearics, 1-2 day delivery, OTP/SOD, max 15kg, max 80x80x60cm."},
    }
    return evidence


def pain_points_from_notes(notes: str) -> list[str]:
    if not notes.strip():
        return ["Submitted review requires validation against Amazon Shipping service and pricing guardrails."]
    sentences = [item.strip() for item in re.split(r"[.\n]", notes) if item.strip()]
    return sentences[:3] or ["Submitted review requires validation against Amazon Shipping service and pricing guardrails."]


def write_intake(case_id: str, payload: dict[str, Any], case: dict[str, Any]) -> Path:
    intake_dir = ROOT / "intakes"
    intake_dir.mkdir(parents=True, exist_ok=True)
    path = intake_dir / f"{case_id}.json"
    path.write_text(json.dumps({"submitted": payload, "normalized_case": case}, indent=2, ensure_ascii=False), encoding="utf-8")
    return path


def slugify(value: str) -> str:
    cleaned = re.sub(r"[^a-z0-9]+", "_", value.lower()).strip("_")
    return cleaned or "opportunity"


def evidence_prefix(company: str) -> str:
    letters = re.sub(r"[^A-Za-z]", "", company).upper()
    return (letters[:4] or "FORM")


def main() -> int:
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    server = ThreadingHTTPServer(("localhost", port), ReviewServer)
    print(f"Serving Amazon Copilot app on http://localhost:{port}")
    print("Use Ctrl+C to stop.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server.")
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
