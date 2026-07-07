from __future__ import annotations

import json
import os
import sys
import tempfile
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler
from pathlib import Path
from typing import Any

PROJECT_ROOT = Path(__file__).resolve().parents[1]
AUTOMATION_ROOT = PROJECT_ROOT / "automation"
sys.path.insert(0, str(PROJECT_ROOT))
sys.path.insert(0, str(AUTOMATION_ROOT / "src"))

from amazon_copilot.data import load_config  # noqa: E402
from amazon_copilot.emailer import send_or_queue_result_email  # noqa: E402
from amazon_copilot.pipeline import run_case  # noqa: E402
from automation.server import build_dynamic_case  # noqa: E402


class handler(BaseHTTPRequestHandler):
    def do_POST(self) -> None:
        try:
            payload = self.read_json_body()
            case = build_dynamic_case(payload)
            config = load_config()
            os.environ.setdefault("AMAZON_COPILOT_OUTBOX_DIR", str(Path(tempfile.gettempdir()) / "amazon-copilot-outbox"))
            with tempfile.TemporaryDirectory() as tmp:
                output = run_case(case, config, Path(tmp), int(config["kpis"]["max_loop_iterations"]))
            email_result = send_or_queue_result_email(payload.get("email", ""), output)
            output["delivery"] = {
                "email": email_result,
                "recipient": payload.get("email", ""),
            }
            self.write_json({
                "ok": True,
                "case_id": output["case_id"],
                "company": output["analysis"]["company"],
                "recommendation": output["analysis"]["recommendation"],
                "dashboard_url": f"/dashboard.html?case={output['case_id']}",
                "email": email_result,
                "output": output,
            })
        except Exception as error:
            self.write_json({"ok": False, "error": str(error)}, status=HTTPStatus.BAD_REQUEST)

    def do_GET(self) -> None:
        self.write_json({
            "ok": True,
            "service": "Amazon Shipping Opportunity Copilot review API",
            "methods": ["POST"],
        })

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
