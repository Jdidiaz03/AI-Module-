from __future__ import annotations

import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from amazon_copilot.pipeline import run_all_cases  # noqa: E402
from amazon_copilot.supabase_sync import build_supabase_rows, sync_outputs  # noqa: E402


class SupabaseSyncTest(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.output_dir = Path(self.tmp.name)
        run_all_cases(output_dir=self.output_dir)

    def test_dry_run_counts_rows(self) -> None:
        result = sync_outputs(case="all", output_dir=self.output_dir, dry_run=True)
        self.assertEqual(result["runs"], 3)
        self.assertGreaterEqual(result["sources"], 30)
        self.assertGreaterEqual(result["documents"], 6)
        self.assertEqual(sorted(result["case_ids"]), ["iberia_outfitters", "pink_papaya", "tecnomania"])

    def test_rows_have_expected_supabase_keys(self) -> None:
        outputs = [
            __import__("json").loads((self.output_dir / "pink_papaya_analysis.json").read_text()),
        ]
        runs, sources, documents = build_supabase_rows(outputs)
        self.assertEqual(runs[0]["run_key"], "pink_papaya:amazon-shipping-industry-challenge-2026-v1:latest")
        self.assertEqual(runs[0]["serviceable_daily_volume"], 2888)
        self.assertTrue(any(row["evidence_id"] == "PAPA-FRA-02" for row in sources))
        self.assertTrue(any(row["source_file"] == "Opportunity2_PinkPapaya.docx" for row in documents))


if __name__ == "__main__":
    unittest.main()
