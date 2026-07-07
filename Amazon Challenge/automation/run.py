from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"
sys.path.insert(0, str(SRC))

from amazon_copilot.pipeline import run_all_cases, run_one_case  # noqa: E402
from amazon_copilot.supabase_sync import sync_outputs  # noqa: E402


def main() -> int:
    parser = argparse.ArgumentParser(description="Run the Amazon Shipping Opportunity Copilot automation.")
    parser.add_argument("--case", default="all", help="Case id to run, or 'all'.")
    parser.add_argument("--output-dir", default=str(ROOT / "outputs"), help="Directory for JSON and Markdown outputs.")
    parser.add_argument("--max-iterations", type=int, default=None, help="Maximum validator loop iterations.")
    parser.add_argument("--sync-supabase", action="store_true", help="Sync generated output rows to Supabase after the run.")
    parser.add_argument("--dry-run-sync", action="store_true", help="Build Supabase rows without sending them.")
    args = parser.parse_args()

    output_dir = Path(args.output_dir)
    if args.case == "all":
        report = run_all_cases(output_dir=output_dir, max_iterations=args.max_iterations)
    else:
        report = run_one_case(args.case, output_dir=output_dir, max_iterations=args.max_iterations)
    if args.sync_supabase or args.dry_run_sync:
        report = {
            "automation": report,
            "supabase": sync_outputs(case=args.case, output_dir=output_dir, dry_run=args.dry_run_sync),
        }

    print(json.dumps(report, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
