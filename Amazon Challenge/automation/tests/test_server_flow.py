from __future__ import annotations

import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))
sys.path.insert(0, str(ROOT))

from amazon_copilot.data import load_config  # noqa: E402
from amazon_copilot.emailer import send_or_queue_result_email  # noqa: E402
from amazon_copilot.pipeline import run_case  # noqa: E402
from server import build_dynamic_case  # noqa: E402


class ServerFlowTest(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.output_dir = Path(self.tmp.name)
        self.config = load_config()

    def test_supported_form_submission_generates_dashboard_output(self) -> None:
        case = build_dynamic_case({
            "company": "Demo Moda",
            "email": "buyer@example.com",
            "monthly_volume": "12000",
            "primary_region": "Spain peninsula",
            "notes": "Campaign peaks need tracking visibility and weekend support.",
        })

        output = run_case(case, self.config, self.output_dir, 4)

        self.assertTrue(output["passed"])
        self.assertGreater(output["analysis"]["service_fit"]["serviceable_annual_volume"], 0)
        self.assertEqual(len(output["analysis"]["pricing_recommendation"]["scenarios"]), 3)
        self.assertTrue((self.output_dir / "dashboard_index.json").exists())

    def test_unsupported_only_submission_blocks_pricing(self) -> None:
        case = build_dynamic_case({
            "company": "Lisbon Returns Co",
            "email": "ops@example.com",
            "monthly_volume": "8000",
            "primary_region": "Portugal",
            "notes": "Needs returns and reverse logistics for marketplace sellers.",
        })

        output = run_case(case, self.config, self.output_dir, 4)
        service_fit = output["analysis"]["service_fit"]
        pricing = output["analysis"]["pricing_recommendation"]

        self.assertTrue(output["passed"])
        self.assertEqual(service_fit["serviceable_annual_volume"], 0)
        self.assertTrue(pricing["pricing_blocked"])
        self.assertEqual(pricing["scenarios"], [])
        self.assertIn("no-go", output["analysis"]["recommendation"].lower())
        blocked_ids = {item["id"] for item in service_fit["blocked_scope"]}
        self.assertIn("client_returns", blocked_ids)

    def test_email_is_queued_without_smtp(self) -> None:
        case = build_dynamic_case({
            "company": "Queue Check",
            "email": "queue@example.com",
            "monthly_volume": "5000",
            "primary_region": "Spain peninsula",
            "notes": "Standard home delivery.",
        })
        output = run_case(case, self.config, self.output_dir, 4)

        with patch.dict("os.environ", {
            "AMAZON_COPILOT_OUTBOX_DIR": str(self.output_dir / "outbox"),
            "SMTP_HOST": "",
            "SMTP_USERNAME": "",
            "SMTP_PASSWORD": "",
            "SMTP_FROM": "",
        }, clear=False):
            result = send_or_queue_result_email("queue@example.com", output)

        self.assertEqual(result["status"], "queued")
        self.assertTrue(Path(result["path"]).exists())


if __name__ == "__main__":
    unittest.main()
