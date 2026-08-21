# ADR 责任规则（L2 参考文档 · 触发条件：架构决策时）

> 本文件为按需读取的参考文档（无触发不读）。铁律提炼见 `CLAUDE.md §0` 第 10 条。
> 源：原 CLAUDE.md §9.5。ADR 模板见 `templates/adr-template.md`。

## 核心原则

ADR 由**发现者**发起撰写，由 Planner 审批决策。

| 触发场景 | 谁发现 | 谁写 ADR | 谁审批 | 审批后动作 |
|----------|--------|----------|--------|-----------|
| 技术选型决策（选 PostgreSQL、选 FastAPI 等） | Planner | Planner | 用户/team-lead | 更新 project-context.md ADR 索引 |
| 开发中发现架构需要调整 | Developer | Developer | Planner | 通知 Planner 审批，等待确认后继续 |
| 审查中发现架构变更 | Reviewer | Reviewer | Planner | 在 review-report.md 中标注，Planner 审批后更新 |
| 测试中发现架构问题 | Tester | Tester | Planner | 在 test-report.md 中标注，通知 Planner |

## ADR 流程

```
发现者撰写 ADR → 提交 docs/adr/adr-XXX-<title>.md → 通知 Planner 审批
→ Planner 审批（accepted / rejected / needs-discussion）
→ 审批通过 → 更新 project-context.md ADR 索引
→ 审批不通过 → 标记为 deprecated，记录原因
```
