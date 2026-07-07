from __future__ import annotations

import json
from pathlib import Path
from typing import Any


AUTOMATION_ROOT = Path(__file__).resolve().parents[2]
WORKSPACE_ROOT = AUTOMATION_ROOT.parent
CONFIG_PATH = AUTOMATION_ROOT / "config" / "challenge_rules.json"
FIXTURES_PATH = AUTOMATION_ROOT / "fixtures" / "opportunities.json"


def load_json(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def load_config() -> dict[str, Any]:
    return load_json(CONFIG_PATH)


def load_cases() -> list[dict[str, Any]]:
    payload = load_json(FIXTURES_PATH)
    return payload["cases"]


def get_case(case_id: str) -> dict[str, Any]:
    for case in load_cases():
        if case["id"] == case_id:
            return case
    known = ", ".join(case["id"] for case in load_cases())
    raise KeyError(f"Unknown case '{case_id}'. Known cases: {known}")


def ensure_output_dir(path: Path | None = None) -> Path:
    output_dir = path or (AUTOMATION_ROOT / "outputs")
    output_dir.mkdir(parents=True, exist_ok=True)
    return output_dir
