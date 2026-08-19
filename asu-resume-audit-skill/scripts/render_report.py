#!/usr/bin/env python3
"""从统一 JSON 数据生成中文 HTML 和 PDF 简历证据审计报告。"""

from __future__ import annotations

import argparse
import json
import re
from collections import Counter
from pathlib import Path
from typing import Any
from xml.sax.saxutils import escape


STATUS_ZH = {
    "corroborated": "已证实",
    "partially_corroborated": "部分证实",
    "contradicted": "存在直接矛盾",
    "unsupported": "缺乏支持",
    "unverifiable": "暂不可核验",
}
RISK_ZH = {"low": "低", "medium": "中", "high": "高", "critical": "严重"}
CONFIDENCE_ZH = {"low": "低", "medium": "中", "high": "高"}


def normalize_pdf_text(value: Any) -> str:
    """把 PDF 中容易造成断行或字体问题的破折号统一为 ASCII。"""
    text = "" if value is None else str(value)
    return (
        text.replace("\u2010", "-")
        .replace("\u2011", "-")
        .replace("\u2012", "-")
        .replace("\u2013", "-")
        .replace("\u2014", "-")
        .replace("\u2212", "-")
        .replace("\u00b7", " / ")
    )


def ptext(value: Any) -> str:
    return escape(normalize_pdf_text(value)).replace("\n", "<br/>")


def load_data(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def render_html(data: dict[str, Any], template_path: Path, output_path: Path) -> None:
    template = template_path.read_text(encoding="utf-8")
    payload = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    payload = payload.replace("</", "<\\/")
    if "__REPORT_JSON__" not in template:
        raise ValueError(f"HTML 模板缺少 __REPORT_JSON__ 占位符：{template_path}")
    html = template.replace("__REPORT_JSON__", payload)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(html, encoding="utf-8")


def build_pdf(data: dict[str, Any], output_path: Path) -> None:
    try:
        from reportlab.lib import colors
        from reportlab.lib.enums import TA_CENTER, TA_LEFT
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
        from reportlab.lib.units import mm
        from reportlab.pdfbase import pdfmetrics
        from reportlab.pdfbase.cidfonts import UnicodeCIDFont
        from reportlab.platypus import (
            LongTable,
            PageBreak,
            Paragraph,
            SimpleDocTemplate,
            Spacer,
            Table,
            TableStyle,
        )
    except ImportError as exc:
        raise SystemExit("缺少 reportlab。请运行：python3 -m pip install reportlab") from exc

    output_path.parent.mkdir(parents=True, exist_ok=True)
    try:
        pdfmetrics.registerFont(UnicodeCIDFont("STSong-Light"))
        font_name = "STSong-Light"
    except Exception:
        font_name = "Helvetica"

    palette = {
        "ivory": colors.HexColor("#FAF9F5"),
        "slate": colors.HexColor("#141413"),
        "clay": colors.HexColor("#D97757"),
        "oat": colors.HexColor("#E3DACC"),
        "olive": colors.HexColor("#788C5D"),
        "gray100": colors.HexColor("#F0EEE6"),
        "gray300": colors.HexColor("#D1CFC5"),
        "gray500": colors.HexColor("#87867F"),
        "gray700": colors.HexColor("#3D3D3A"),
        "rust": colors.HexColor("#B04A3F"),
        "info": colors.HexColor("#5C7CA3"),
        "warning": colors.HexColor("#C78E3F"),
    }

    styles = getSampleStyleSheet()
    body = ParagraphStyle(
        "中文正文",
        parent=styles["BodyText"],
        fontName=font_name,
        fontSize=9.4,
        leading=14,
        textColor=palette["gray700"],
        wordWrap="CJK",
        spaceAfter=5,
    )
    small = ParagraphStyle(
        "中文小字",
        parent=body,
        fontSize=7.8,
        leading=11,
        textColor=palette["gray500"],
    )
    title = ParagraphStyle(
        "中文标题",
        parent=body,
        fontSize=24,
        leading=31,
        textColor=palette["slate"],
        alignment=TA_LEFT,
        spaceAfter=8,
    )
    subtitle = ParagraphStyle(
        "中文副标题",
        parent=body,
        fontSize=12,
        leading=18,
        textColor=palette["gray700"],
        spaceAfter=12,
    )
    h2 = ParagraphStyle(
        "中文二级标题",
        parent=body,
        fontSize=16,
        leading=22,
        textColor=palette["slate"],
        spaceBefore=12,
        spaceAfter=9,
        keepWithNext=True,
    )
    h3 = ParagraphStyle(
        "中文三级标题",
        parent=body,
        fontSize=12,
        leading=17,
        textColor=palette["slate"],
        spaceBefore=7,
        spaceAfter=5,
        keepWithNext=True,
    )
    badge = ParagraphStyle(
        "标签",
        parent=small,
        alignment=TA_CENTER,
        textColor=palette["slate"],
    )
    cell = ParagraphStyle("表格正文", parent=body, fontSize=7.8, leading=11, spaceAfter=0)
    cell_small = ParagraphStyle("表格小字", parent=small, fontSize=7.0, leading=9.5, spaceAfter=0)

    metadata = data.get("metadata", {})
    summary = data.get("summary", {})
    claims = data.get("claims", [])
    sources = data.get("sources", [])
    patterns = data.get("patterns", [])
    timeline = data.get("timeline", [])
    next_steps = data.get("next_steps", [])
    counts = Counter(c.get("status") for c in claims)

    doc = SimpleDocTemplate(
        str(output_path),
        pagesize=A4,
        rightMargin=17 * mm,
        leftMargin=17 * mm,
        topMargin=17 * mm,
        bottomMargin=17 * mm,
        title=normalize_pdf_text(metadata.get("title", "简历真实性审计报告")),
        author=normalize_pdf_text(metadata.get("analyst", "asu-resume-audit-skill")),
    )
    story: list[Any] = []
    story.append(Paragraph("证据优先 / 简历主张审计", small))
    story.append(Paragraph(ptext(metadata.get("title", "简历真实性审计报告")), title))
    story.append(Paragraph(ptext(metadata.get("subject", "未命名审计对象")), subtitle))
    meta_line = " · ".join(
        [
            "范围：" + normalize_pdf_text(metadata.get("scope", "未说明")),
            "生成时间：" + normalize_pdf_text(metadata.get("generated_at", "未说明")),
            "分析者：" + normalize_pdf_text(metadata.get("analyst", "未说明")),
        ]
    )
    story.append(Paragraph(ptext(meta_line), small))
    story.append(Spacer(1, 7 * mm))

    story.append(Paragraph("证据结论总览", h2))
    status_order = [
        "corroborated",
        "partially_corroborated",
        "contradicted",
        "unsupported",
        "unverifiable",
    ]
    metric_cells = []
    metric_colors = [palette["olive"], palette["info"], palette["rust"], palette["warning"], palette["gray500"]]
    for status, color in zip(status_order, metric_colors):
        metric_cells.append(
            Table(
                [[Paragraph(str(counts.get(status, 0)), ParagraphStyle("数字", parent=title, fontSize=20, leading=22, alignment=TA_CENTER))],
                 [Paragraph(ptext(STATUS_ZH[status]), badge)]],
                colWidths=[30 * mm],
                rowHeights=[13 * mm, 8 * mm],
                style=TableStyle([
                    ("BACKGROUND", (0, 0), (-1, -1), colors.white),
                    ("BOX", (0, 0), (-1, -1), 0.7, palette["gray300"]),
                    ("LINEBEFORE", (0, 0), (0, -1), 3, color),
                    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                    ("LEFTPADDING", (0, 0), (-1, -1), 4),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 4),
                ]),
            )
        )
    story.append(Table([metric_cells], colWidths=[33 * mm] * 5, style=TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP")])))
    story.append(Spacer(1, 4 * mm))
    conclusion_box = Table(
        [[Paragraph(ptext(summary.get("conclusion", "尚未形成结论。")), body)]],
        colWidths=[168 * mm],
        style=TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.white),
            ("BOX", (0, 0), (-1, -1), 0.7, palette["gray300"]),
            ("LINEBEFORE", (0, 0), (0, -1), 3, palette["clay"]),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
            ("RIGHTPADDING", (0, 0), (-1, -1), 10),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ]),
    )
    story.append(conclusion_box)
    if metadata.get("disclaimer"):
        story.append(Paragraph(ptext(metadata["disclaimer"]), small))
    if summary.get("limitations"):
        story.append(Paragraph("已知限制", h3))
        for item in summary["limitations"]:
            story.append(Paragraph("- " + ptext(item), body))

    story.append(Paragraph("审计流程", h2))
    flow_data = [[
        Paragraph("解析简历<br/><font size='7'>文本 / 图片 / PDF</font>", badge),
        Paragraph("拆分主张<br/><font size='7'>角色 / 范围 / 指标</font>", badge),
        Paragraph("检索证据<br/><font size='7'>官方 / GitHub / 档案</font>", badge),
        Paragraph("交叉核验<br/><font size='7'>支持 / 矛盾 / 缺口</font>", badge),
        Paragraph("生成报告<br/><font size='7'>JSON / HTML / PDF</font>", badge),
    ]]
    story.append(Table(flow_data, colWidths=[33.5 * mm] * 5, rowHeights=[17 * mm], style=TableStyle([
        ("BACKGROUND", (0, 0), (-2, -1), colors.white),
        ("BACKGROUND", (-1, 0), (-1, -1), palette["oat"]),
        ("BOX", (0, 0), (-1, -1), 0.7, palette["gray300"]),
        ("INNERGRID", (0, 0), (-1, -1), 0.7, palette["gray300"]),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ])))

    high_ids = set(summary.get("highest_risk", []))
    high_claims = [c for c in claims if c.get("id") in high_ids or c.get("risk") == "critical"]
    if not high_claims:
        high_claims = claims[:5]
    story.append(Paragraph("最高风险主张", h2))
    high_rows = [[
        Paragraph("编号", cell_small),
        Paragraph("简历主张", cell_small),
        Paragraph("结论", cell_small),
        Paragraph("风险", cell_small),
        Paragraph("核心分析", cell_small),
    ]]
    for claim in high_claims:
        high_rows.append([
            Paragraph(ptext(claim.get("id")), cell_small),
            Paragraph(ptext(claim.get("resume_text") or claim.get("normalized_claim")), cell),
            Paragraph(ptext(STATUS_ZH.get(claim.get("status"), claim.get("status"))), cell_small),
            Paragraph(ptext(RISK_ZH.get(claim.get("risk"), claim.get("risk"))), cell_small),
            Paragraph(ptext(claim.get("analysis")), cell),
        ])
    story.append(LongTable(high_rows, repeatRows=1, colWidths=[13 * mm, 42 * mm, 21 * mm, 13 * mm, 79 * mm], style=TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), palette["gray100"]),
        ("BOX", (0, 0), (-1, -1), 0.6, palette["gray300"]),
        ("INNERGRID", (0, 0), (-1, -1), 0.35, palette["gray300"]),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ])))

    story.append(PageBreak())
    story.append(Paragraph("完整主张与证据矩阵", h2))
    for claim in claims:
        if claim.get("page_break_before"):
            story.append(PageBreak())
        evidence_for = "、".join(claim.get("evidence_for", [])) or "无"
        evidence_against = "、".join(claim.get("evidence_against", [])) or "无"
        steps = claim.get("verification_steps", [])
        block = [
            [Paragraph(ptext(claim.get("id")), cell_small), Paragraph(ptext(claim.get("normalized_claim")), cell)],
            [Paragraph("状态", cell_small), Paragraph(ptext(STATUS_ZH.get(claim.get("status"), claim.get("status"))), cell)],
            [Paragraph("风险 / 置信度", cell_small), Paragraph(ptext(f"{RISK_ZH.get(claim.get('risk'), claim.get('risk'))} / {CONFIDENCE_ZH.get(claim.get('confidence'), claim.get('confidence'))}"), cell)],
            [Paragraph("证据", cell_small), Paragraph(ptext(f"支持：{evidence_for}；反向：{evidence_against}"), cell)],
            [Paragraph("分析", cell_small), Paragraph(ptext(claim.get("analysis")), cell)],
            [Paragraph("下一步", cell_small), Paragraph("<br/>".join("- " + ptext(x) for x in steps) or "无", cell)],
        ]
        claim_table = Table(block, colWidths=[27 * mm, 141 * mm], style=TableStyle([
            ("BACKGROUND", (0, 0), (0, -1), palette["gray100"]),
            ("BOX", (0, 0), (-1, -1), 0.6, palette["gray300"]),
            ("INNERGRID", (0, 0), (-1, -1), 0.35, palette["gray300"]),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ]))
        story.extend([claim_table, Spacer(1, 3 * mm)])

    story.append(Paragraph("识别到的包装与夸大模式", h2))
    for pattern in patterns:
        if pattern.get("page_break_before"):
            story.append(PageBreak())
        signals = "；".join(pattern.get("signals", [])) or "无"
        pattern_table = Table([
            [Paragraph(ptext(pattern.get("name")), h3)],
            [Paragraph(ptext(pattern.get("description")), body)],
            [Paragraph(ptext("观察信号：" + signals), body)],
            [Paragraph(ptext("反向证据/合理解释：" + (pattern.get("counter_evidence") or "无")), body)],
            [Paragraph(ptext("置信度：" + CONFIDENCE_ZH.get(pattern.get("confidence"), pattern.get("confidence"))), small)],
        ], colWidths=[168 * mm], style=TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.white),
            ("BOX", (0, 0), (-1, -1), 0.6, palette["gray300"]),
            ("LINEBEFORE", (0, 0), (0, -1), 3, palette["clay"]),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]))
        story.extend([pattern_table, Spacer(1, 3 * mm)])

    if timeline:
        story.append(Paragraph("时间线", h2))
        time_rows = [[Paragraph("日期", cell_small), Paragraph("事件", cell_small), Paragraph("详情", cell_small), Paragraph("来源", cell_small)]]
        for item in timeline:
            time_rows.append([
                Paragraph(ptext(item.get("date")), cell_small),
                Paragraph(ptext(item.get("title")), cell),
                Paragraph(ptext(item.get("detail")), cell),
                Paragraph(ptext("、".join(item.get("source_ids", [])) or "无"), cell_small),
            ])
        story.append(LongTable(time_rows, repeatRows=1, colWidths=[28 * mm, 39 * mm, 78 * mm, 23 * mm], style=TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), palette["gray100"]),
            ("BOX", (0, 0), (-1, -1), 0.6, palette["gray300"]),
            ("INNERGRID", (0, 0), (-1, -1), 0.35, palette["gray300"]),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 5),
            ("RIGHTPADDING", (0, 0), (-1, -1), 5),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ])))

    story.append(Paragraph("下一步核验", h2))
    for index, item in enumerate(next_steps, 1):
        story.append(Paragraph(ptext(f"{index}. {item}"), body))

    story.append(Paragraph("来源与证据等级", h2))
    for source in sources:
        label = f"{source.get('id')} · {source.get('title')}"
        url = normalize_pdf_text(source.get("url", ""))
        if url and re.match(r"^https?://", url):
            heading = f'<link href="{escape(url)}" color="#D97757">{ptext(label)}</link>'
        else:
            heading = ptext(label)
        source_block = [
            Paragraph(heading, h3),
            Paragraph(ptext(" · ".join(str(x) for x in [source.get("type"), source.get("publisher"), source.get("accessed_at"), "等级 " + str(source.get("reliability", "?"))] if x)), small),
        ]
        if source.get("notes"):
            source_block.append(Paragraph(ptext(source.get("notes")), body))
        story.extend(source_block)

    def decorate_page(canvas, document):
        canvas.saveState()
        canvas.setStrokeColor(palette["gray300"])
        canvas.setLineWidth(0.5)
        canvas.line(17 * mm, 12 * mm, 193 * mm, 12 * mm)
        canvas.setFont(font_name, 7)
        canvas.setFillColor(palette["gray500"])
        canvas.drawString(17 * mm, 8 * mm, "asu-resume-audit-skill / 证据快照")
        canvas.drawRightString(193 * mm, 8 * mm, f"第 {document.page} 页")
        canvas.restoreState()

    doc.build(story, onFirstPage=decorate_page, onLaterPages=decorate_page)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="生成中文简历真实性审计 HTML/PDF")
    parser.add_argument("--input", required=True, type=Path, help="报告 JSON 数据")
    parser.add_argument("--html", required=True, type=Path, help="HTML 输出路径")
    parser.add_argument("--pdf", required=True, type=Path, help="PDF 输出路径")
    parser.add_argument("--template", type=Path, help="可选 HTML 模板路径")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    skill_root = Path(__file__).resolve().parents[1]
    template = args.template or skill_root / "assets" / "report_template.html"
    data = load_data(args.input)
    render_html(data, template, args.html)
    build_pdf(data, args.pdf)
    print(f"HTML 已生成：{args.html.resolve()}")
    print(f"PDF 已生成：{args.pdf.resolve()}")


if __name__ == "__main__":
    main()
