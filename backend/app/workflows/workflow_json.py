"""
Đọc định nghĩa checklist HR từ JSON — không hardcode công ty trong Python.
"""
from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)


def load_workflows_full(path: str) -> tuple[dict[str, Any], dict[str, list[str]]] | None:
    p = Path(path.strip())
    if not p.is_file():
        logger.warning("WORKFLOWS_JSON_PATH không tồn tại: %s", path)
        return None
    try:
        data = json.loads(p.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as e:
        logger.warning("Không đọc được workflows JSON (%s): %s", path, e)
        return None
    workflows = data.get("workflows")
    if not isinstance(workflows, dict):
        logger.warning("File %s thiếu key 'workflows' (object)", path)
        return None
    keywords = data.get("intent_keywords")
    out_k: dict[str, list[str]] = {}
    if isinstance(keywords, dict):
        for k, v in keywords.items():
            if isinstance(v, list):
                out_k[str(k)] = [str(x) for x in v]
            elif isinstance(v, str):
                out_k[str(k)] = [v]
    return workflows, out_k


def load_workflow_overrides(path: str) -> tuple[dict[str, Any], dict[str, list[str]]] | None:
    p = Path(path.strip())
    if not p.is_file():
        logger.warning("WORKFLOWS_JSON_PATH không tồn tại: %s", path)
        return None
    try:
        data = json.loads(p.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as e:
        logger.warning("Không đọc được workflows JSON (%s): %s", path, e)
        return None
    workflows = data.get("workflows")
    keywords = data.get("intent_keywords")
    w_ok = isinstance(workflows, dict)
    k_ok = isinstance(keywords, dict)
    if not w_ok and not k_ok:
        logger.warning("File workflows JSON cần có 'workflows' và/hoặc 'intent_keywords' (object): %s", path)
        return None
    out_w: dict[str, Any] = workflows if w_ok else {}
    out_k: dict[str, list[str]] = {}
    if isinstance(keywords, dict):
        for k, v in keywords.items():
            if isinstance(v, list):
                out_k[str(k)] = [str(x) for x in v]
            elif isinstance(v, str):
                out_k[str(k)] = [v]
    return out_w, out_k


def merge_workflow_dicts(base: dict, extra: dict) -> None:
    for wf_id, langs in extra.items():
        if not isinstance(langs, dict):
            continue
        if wf_id not in base:
            base[wf_id] = {}
        for lang, spec in langs.items():
            if not isinstance(spec, dict):
                continue
            if lang not in base[wf_id]:
                base[wf_id][lang] = {}
            base[wf_id][lang].update(spec)


def merge_intent_keywords(base: dict[str, list[str]], extra: dict[str, list[str]]) -> None:
    for k, words in extra.items():
        if k in base:
            seen = set(base[k])
            for w in words:
                if w not in seen:
                    base[k].append(w)
                    seen.add(w)
        else:
            base[k] = list(words)
