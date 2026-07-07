from __future__ import annotations

import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from amazon_copilot.pipeline import run_all_cases  # noqa: E402


class AutomationKPITest(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.report = run_all_cases(output_dir=Path(self.tmp.name))

    def test_all_cases_pass_kpis(self) -> None:
        self.assertTrue(self.report["passed_all_kpis"])
        self.assertEqual(self.report["cases_processed"], 3)

    def test_tecnomania_scope_and_pricing(self) -> None:
        case = self._case("tecnomania")
        self.assertTrue(case["passed"])
        self.assertLess(case["serviceable_annual_volume"], 2920000)
        self.assertIn("conditional", case["recommendation"].lower())

    def test_pink_papaya_spain_first_volume(self) -> None:
        case = self._case("pink_papaya")
        self.assertTrue(case["passed"])
        self.assertEqual(case["serviceable_annual_volume"], 1054120)
        self.assertIn("spain-first", case["recommendation"].lower())

    def test_dummy_company_runs_through_pipeline(self) -> None:
        case = self._case("iberia_outfitters")
        self.assertTrue(case["passed"])
        self.assertEqual(case["serviceable_annual_volume"], 765912)
        self.assertIn("conditional", case["recommendation"].lower())

    def test_outputs_are_written(self) -> None:
        output_dir = Path(self.tmp.name)
        expected = [
            "loop_report.json",
            "loop_report.md",
            "tecnomania_analysis.json",
            "tecnomania_recommendation.md",
            "pink_papaya_analysis.json",
            "pink_papaya_recommendation.md",
            "iberia_outfitters_analysis.json",
            "iberia_outfitters_recommendation.md",
        ]
        for name in expected:
            self.assertTrue((output_dir / name).exists(), name)

    def _case(self, case_id: str) -> dict:
        for case in self.report["case_results"]:
            if case["case_id"] == case_id:
                return case
        raise AssertionError(f"Case not found: {case_id}")


if __name__ == "__main__":
    unittest.main()
