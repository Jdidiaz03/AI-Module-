from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"
sys.path.insert(0, str(SRC))

from amazon_copilot.supabase_sync import sync_outputs  # noqa: E402


def main() -> int:
    parser = argparse.ArgumentParser(description="Sync Amazon Copilot outputs to Supabase.")
    parser.add_argument("--case", default="all", help="Case id to sync, or 'all'.")
    parser.add_argument("--output-dir", default=str(ROOT / "outputs"), help="Automation output directory.")
    parser.add_argument("--dry-run", action="store_true", help="Build rows without sending them to Supabase.")
    args = parser.parse_args()

    result = sync_outputs(case=args.case, output_dir=Path(args.output_dir), dry_run=args.dry_run)
    print(json.dumps(result, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
