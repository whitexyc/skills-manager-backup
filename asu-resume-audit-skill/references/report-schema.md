# 审计报告数据格式

渲染器接收 UTF-8 JSON，未知字段会被忽略。

```json
{
  "metadata": {
    "title": "简历主张真实性审计",
    "subject": "公开资料对象或匿名候选人",
    "generated_at": "2026-08-13T12:00:00+08:00",
    "scope": "公开来源简历主张审计",
    "analyst": "Codex",
    "disclaimer": "结论描述现有证据，不评价人格，也不构成法律认定。"
  },
  "summary": {
    "conclusion": "一段校准后的总括结论。",
    "highest_risk": ["C-001", "C-004"],
    "limitations": ["无法取得内部雇佣记录"]
  },
  "sources": [
    {
      "id": "S-001",
      "title": "官方项目 README",
      "url": "https://example.com",
      "type": "official_record",
      "publisher": "项目组织",
      "accessed_at": "2026-08-13",
      "reliability": "A",
      "notes": "同期公开记录"
    }
  ],
  "claims": [
    {
      "id": "C-001",
      "category": "open_source_role",
      "resume_text": "简历中的短句原文",
      "normalized_claim": "被核验的原子化命题",
      "status": "partially_corroborated",
      "risk": "high",
      "confidence": "high",
      "evidence_for": ["S-002"],
      "evidence_against": ["S-001"],
      "metric": {
        "numerator": 200,
        "denominator": 2000,
        "displayed_percent": 10
      },
      "analysis": "说明真实事实锚点、扩大部分与最终结论。",
      "verification_steps": ["要求提供正式 Maintainer 任命记录"],
      "page_break_before": false
    }
  ],
  "patterns": [
    {
      "name": "角色升格",
      "description": "Contributor 活动被描述为核心作者身份。",
      "signals": ["核心作者措辞", "已合并工件有限"],
      "claim_ids": ["C-001"],
      "counter_evidence": "存在一个有意义的已合并 PR。",
      "confidence": "medium",
      "page_break_before": false
    }
  ],
  "timeline": [
    {
      "date": "2026-03-11",
      "title": "PR 合并",
      "detail": "一个有明确边界的前端修复被合并。",
      "source_ids": ["S-003"]
    }
  ],
  "next_steps": [
    "要求提供声称子系统对应的设计文档与代码所有权记录。"
  ]
}
```

## 必填字段

- `metadata.title`、`metadata.subject`、`metadata.generated_at`；
- 至少一个 `source`；
- 至少一个 `claim`；
- 每条 Claim 必须包含 `id`、`normalized_claim`、`status`、`risk`、`confidence`、`analysis`；
- 所有引用的 Source ID 必须存在；
- Pattern 中引用的 Claim ID 必须存在。

证据来源的 `url` 为可选字段；提供时必须是完整的 `http` 或 `https` URL。渲染器会忽略其他协议和相对路径，避免在自包含报告中生成可执行或本地链接。

允许的状态：

```text
corroborated
partially_corroborated
contradicted
unsupported
unverifiable
```

允许的风险：

```text
low
medium
high
critical
```

允许的置信度：

```text
low
medium
high
```

字段标识保持英文，所有用户可见内容使用中文。

Claim 可选使用 `metric` 对象记录明确的比例口径。只有同时提供 `numerator`、`denominator` 和 `displayed_percent` 时，校验器才会按 `numerator / denominator * 100` 重算，并允许 0.5 个百分点的舍入误差。缺少任一字段时不会推断；分母为零或字段不可转换为数字会导致校验失败。

通过或失败的比例校验仅说明已提供数字之间的关系，不能单独证明候选人存在虚假陈述。可能存在未披露分母时，应在 Claim 的分析和报告限制中说明。

`claims[]` 与 `patterns[]` 可选使用 `page_break_before: true` 控制长报告的 A4 分页；它只影响 PDF，不改变 HTML 内容。
