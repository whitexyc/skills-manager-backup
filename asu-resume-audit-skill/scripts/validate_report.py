#!/usr/bin/env python3
"""校验报告 JSON、HTML 自包含性与 PDF 基本完整性。"""

from __future__ import annotations

import argparse
import json
import math
import re
import sys
from pathlib import Path
from urllib.parse import urlparse


ALLOWED_STATUSES = {
    "corroborated",
    "partially_corroborated",
    "contradicted",
    "unsupported",
    "unverifiable",
}
ALLOWED_RISKS = {"low", "medium", "high", "critical"}
ALLOWED_CONFIDENCE = {"low", "medium", "high"}


def fail(errors: list[str], message: str) -> None:
    errors.append(message)


def validate_metric(claim: dict, errors: list[str]) -> None:
    metric = claim.get("metric")
    if metric is None:
        return

    cid = claim.get("id", "<无编号>")
    if not isinstance(metric, dict):
        fail(errors, f"{cid} metric 必须是对象")
        return

    ratio_keys = {"numerator", "denominator", "displayed_percent"}
    if not ratio_keys <= set(metric):
        return

    try:
        expected = float(metric["numerator"]) / float(metric["denominator"]) * 100
        displayed = float(metric["displayed_percent"])
    except (TypeError, ValueError, ZeroDivisionError):
        fail(errors, f"{cid} metric 指标字段无法计算")
    else:
        if not math.isclose(expected, displayed, abs_tol=0.5):
            fail(errors, f"{cid} metric 百分比与分子分母不一致")


def validate_data(data: dict, errors: list[str]) -> None:
    metadata = data.get("metadata", {})
    for key in ("title", "subject", "generated_at"):
        if not metadata.get(key):
            fail(errors, f"metadata.{key} 缺失")

    sources = data.get("sources")
    claims = data.get("claims")
    if not isinstance(sources, list) or not sources:
        fail(errors, "sources 必须是非空数组")
        sources = []
    if not isinstance(claims, list) or not claims:
        fail(errors, "claims 必须是非空数组")
        claims = []

    source_ids = {s.get("id") for s in sources if s.get("id")}
    if len(source_ids) != len(sources):
        fail(errors, "source id 缺失或重复")
    for source in sources:
        sid = source.get("id", "<无编号>")
        url = source.get("url")
        if url:
            parsed = urlparse(str(url))
            if parsed.scheme not in {"http", "https"} or not parsed.netloc:
                fail(errors, f"{sid} URL 必须使用 http 或 https：{url}")
    claim_ids = {c.get("id") for c in claims if c.get("id")}
    if len(claim_ids) != len(claims):
        fail(errors, "claim id 缺失或重复")

    for claim in claims:
        cid = claim.get("id", "<无编号>")
        for key in ("normalized_claim", "status", "risk", "confidence", "analysis"):
            if not claim.get(key):
                fail(errors, f"{cid} 缺少 {key}")
        if claim.get("status") not in ALLOWED_STATUSES:
            fail(errors, f"{cid} status 非法：{claim.get('status')}")
        if claim.get("risk") not in ALLOWED_RISKS:
            fail(errors, f"{cid} risk 非法：{claim.get('risk')}")
        if claim.get("confidence") not in ALLOWED_CONFIDENCE:
            fail(errors, f"{cid} confidence 非法：{claim.get('confidence')}")
        validate_metric(claim, errors)
        for sid in claim.get("evidence_for", []) + claim.get("evidence_against", []):
            if sid not in source_ids:
                fail(errors, f"{cid} 引用了不存在的 source id：{sid}")

    for pattern in data.get("patterns", []):
        for cid in pattern.get("claim_ids", []):
            if cid not in claim_ids:
                fail(errors, f"模式 {pattern.get('name')} 引用了不存在的 claim id：{cid}")

    for item in data.get("timeline", []):
        for sid in item.get("source_ids", []):
            if sid not in source_ids:
                fail(errors, f"时间线 {item.get('title')} 引用了不存在的 source id：{sid}")


def validate_html(path: Path, data: dict, errors: list[str]) -> None:
    if not path.exists() or path.stat().st_size < 10_000:
        fail(errors, f"HTML 不存在或体积异常：{path}")
        return
    html = path.read_text(encoding="utf-8")
    if "__REPORT_JSON__" in html:
        fail(errors, "HTML 仍包含未替换的数据占位符")
    if re.search(r"<script[^>]+src\s*=", html, re.I):
        fail(errors, "HTML 引用了外部脚本，不是自包含文件")
    if re.search(r"<link[^>]+rel=[\"']?stylesheet", html, re.I):
        fail(errors, "HTML 引用了外部样式表，不是自包含文件")
    subject = str(data.get("metadata", {}).get("subject", ""))
    if subject and subject not in html:
        fail(errors, "HTML 中未找到报告对象名称")
    for claim in data.get("claims", [])[:3]:
        if str(claim.get("id")) not in html:
            fail(errors, f"HTML 中未找到 claim id：{claim.get('id')}")


def validate_pdf(path: Path, errors: list[str]) -> None:
    if not path.exists() or path.stat().st_size < 5_000:
        fail(errors, f"PDF 不存在或体积异常：{path}")
        return
    with path.open("rb") as handle:
        if handle.read(4) != b"%PDF":
            fail(errors, "PDF 文件头无效")
    try:
        from pypdf import PdfReader

        reader = PdfReader(str(path))
        if not reader.pages:
            fail(errors, "PDF 没有页面")
    except ImportError:
        pass
    except Exception as exc:
        fail(errors, f"PDF 解析失败：{exc}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="校验中文简历真实性审计报告")
    parser.add_argument("--data", required=True, type=Path)
    parser.add_argument("--html", required=True, type=Path)
    parser.add_argument("--pdf", required=True, type=Path)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    errors: list[str] = []
    try:
        data = json.loads(args.data.read_text(encoding="utf-8"))
    except Exception as exc:
        print(f"JSON 读取失败：{exc}", file=sys.stderr)
        raise SystemExit(1)
    validate_data(data, errors)
    validate_html(args.html, data, errors)
    validate_pdf(args.pdf, errors)
    if errors:
        print("校验失败：", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        raise SystemExit(1)
    print("校验通过：JSON 结构、证据引用、HTML 自包含性和 PDF 基本完整性均正常。")


if __name__ == "__main__":
    main()
