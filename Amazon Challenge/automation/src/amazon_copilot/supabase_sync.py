from __future__ import annotations

import json
import os
import ssl
from datetime import UTC, datetime
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from .data import AUTOMATION_ROOT, WORKSPACE_ROOT, load_cases, load_config, load_json


class SupabaseConfigError(RuntimeError):
    pass


class SupabaseRequestError(RuntimeError):
    pass


def load_env_file(path: Path) -> None:
    if not path.exists():
        return
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        os.environ.setdefault(key, value)


def load_supabase_env() -> tuple[str, str]:
    load_env_file(WORKSPACE_ROOT / ".env")
    load_env_file(AUTOMATION_ROOT / ".env")
    url = os.environ.get("SUPABASE_URL", "").rstrip("/")
    key = os.environ.get("SUPABASE_ANON_KEY", "")
    if not url or not key:
        raise SupabaseConfigError("Missing SUPABASE_URL or SUPABASE_ANON_KEY. Add them to .env.")
    return url, key


class SupabaseRestClient:
    def __init__(self, url: str, anon_key: str) -> None:
        self.url = url.rstrip("/")
        self.anon_key = anon_key

    def upsert(self, table: str, rows: list[dict[str, Any]], on_conflict: str) -> list[dict[str, Any]]:
        if not rows:
            return []
        query = urlencode({"on_conflict": on_conflict}, safe=",")
        endpoint = f"{self.url}/rest/v1/{table}?{query}"
        body = json.dumps(rows, ensure_ascii=False).encode("utf-8")
        request = Request(
            endpoint,
            data=body,
            method="POST",
            headers={
                "apikey": self.anon_key,
                "Authorization": f"Bearer {self.anon_key}",
                "Content-Type": "application/json",
                "Prefer": "resolution=merge-duplicates,return=representation",
            },
        )
        try:
            with urlopen(request, timeout=20, context=ssl_context()) as response:
                payload = response.read().decode("utf-8")
                return json.loads(payload) if payload else []
        except HTTPError as exc:
            details = exc.read().decode("utf-8", errors="replace")
            raise SupabaseRequestError(
                f"Supabase rejected upsert to {table} with HTTP {exc.code}: {details}"
            ) from exc
        except URLError as exc:
            raise SupabaseRequestError(f"Could not reach Supabase: {exc}") from exc


def ssl_context() -> ssl.SSLContext:
    try:
        import certifi

        return ssl.create_default_context(cafile=certifi.where())
    except Exception:
        return ssl.create_default_context()


def sync_outputs(case: str = "all", output_dir: Path | None = None, dry_run: bool = False) -> dict[str, Any]:
    out_dir = output_dir or (AUTOMATION_ROOT / "outputs")
    case_outputs = load_case_outputs(case, out_dir)
    run_rows, source_rows, document_rows = build_supabase_rows(case_outputs)
    summary = {
        "dry_run": dry_run,
        "runs": len(run_rows),
        "sources": len(source_rows),
        "documents": len(document_rows),
        "case_ids": [row["case_id"] for row in run_rows],
    }
    if dry_run:
        return summary

    url, key = load_supabase_env()
    client = SupabaseRestClient(url, key)
    synced = {
        "runs": client.upsert("amazon_copilot_runs", run_rows, "run_key"),
        "sources": client.upsert("amazon_copilot_sources", source_rows, "run_key,evidence_id"),
        "documents": client.upsert("amazon_copilot_documents", document_rows, "source_file"),
    }
    return {**summary, "synced": {name: len(rows) for name, rows in synced.items()}}


def load_case_outputs(case: str, output_dir: Path) -> list[dict[str, Any]]:
    if case == "all":
        paths = sorted(output_dir.glob("*_analysis.json"))
    else:
        paths = [output_dir / f"{case}_analysis.json"]
    missing = [path for path in paths if not path.exists()]
    if missing:
        names = ", ".join(str(path) for path in missing)
        raise FileNotFoundError(f"Missing automation output: {names}. Run automation/run.py first.")
    return [load_json(path) for path in paths]


def build_supabase_rows(case_outputs: list[dict[str, Any]]) -> tuple[list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]]]:
    config = load_config()
    cases = {case["id"]: case for case in load_cases()}
    now = datetime.now(UTC).isoformat()
    run_rows: list[dict[str, Any]] = []
    source_rows: list[dict[str, Any]] = []
    document_index: dict[str, dict[str, Any]] = {}

    for output in case_outputs:
        analysis = output["analysis"]
        service_fit = analysis["service_fit"]
        score = analysis["opportunity_score"]["score"]
        win_probability = analysis["win_probability_score"]["probability"]
        run_key = f"{output['case_id']}:{output['rule_version']}:latest"
        run_rows.append({
            "run_key": run_key,
            "case_id": output["case_id"],
            "company": analysis["company"],
            "recommendation": analysis["recommendation"],
            "passed": bool(output["passed"]),
            "iterations": int(output["iterations"]),
            "opportunity_score": int(score),
            "win_probability": float(win_probability),
            "serviceable_daily_volume": int(service_fit["serviceable_daily_volume"]),
            "serviceable_annual_volume": int(service_fit["serviceable_annual_volume"]),
            "export_status": analysis["export_status"],
            "payload": output,
            "updated_at": now,
        })

        for source in analysis["sources_used"]:
            source_rows.append({
                "run_key": run_key,
                "case_id": output["case_id"],
                "evidence_id": source["id"],
                "source": source["source"],
                "locator": source["locator"],
                "claim": source["claim"],
                "payload": source,
                "updated_at": now,
            })

        fixture = cases[output["case_id"]]
        for source_file in fixture["source_files"]:
            current = document_index.setdefault(source_file, {
                "source_file": source_file,
                "case_ids": [],
                "original_folder": config["source_pack"]["original_folder"],
                "working_extracts_folder": config["source_pack"]["working_extracts_folder"],
                "payload": {
                    "source_file": source_file,
                    "cases": [],
                    "rule_version": config["rule_version"],
                },
                "updated_at": now,
            })
            if output["case_id"] not in current["case_ids"]:
                current["case_ids"].append(output["case_id"])
                current["payload"]["cases"].append(output["case_id"])

    return run_rows, source_rows, list(document_index.values())
