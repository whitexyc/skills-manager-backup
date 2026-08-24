# ADR 责任规则（L2 参考文档 · 触发条件：架构决策时）

> 本文件为按需读取的参考文档（无触发不读）。铁律提炼见 `CLAUDE.md §0` 第 10 条。
> 源：原 CLAUDE.md §9.5 + ECC skills/architecture-decision-records（module-002 补强）。
> ADR 模板见 `templates/adr-template.md`。

## 核心原则

ADR 由**发现者**发起撰写，由 Planner 审批决策。

| 触发场景 | 谁发现 | 谁写 ADR | 谁审批 | 审批后动作 |
|----------|--------|----------|--------|-----------|
| 技术选型决策（选 PostgreSQL、选 FastAPI 等） | Planner | Planner | 用户/team-lead | 更新 project-context.md ADR 索引 |
| 开发中发现架构需要调整 | Developer | Developer | Planner | 通知 Planner 审批，等待确认后继续 |
| 审查中发现架构变更 | Reviewer | Reviewer | Planner | 在 review-report.md 中标注，Planner 审批后更新 |
| 测试中发现架构问题 | Tester | Tester | Planner | 在 test-report.md 中标注，通知 Planner |

## ADR 生命周期状态机

```
proposed → accepted → [deprecated | superseded by ADR-NNNN]
```

- **proposed**：讨论中，未生效
- **accepted**：生效并被执行
- **deprecated**：不再相关（如功能移除）
- **superseded**：被新 ADR 替代（必须链接 ADR-NNNN）

## 决策信号清单（检测到即主动建议记录）

**显式信号**：
- 「就用 X 吧」「我们决定用 X」「let's go with X」
- 「记一条 ADR」「Record this as an ADR」

**隐式信号**（不自动创建，先建议）：
- 比较两个框架/库并得出结论
- 数据库 schema 设计选择且陈述了理由
- 架构模式取舍（单体 vs 微服务、REST vs GraphQL）
- 认证/授权策略决定
- 部署基础设施选型

## ADR 流程

```
发现者撰写 ADR → 提交 docs/adr/adr-XXX-<title>.md → 通知 Planner 审批
→ Planner 审批（accepted / rejected / needs-discussion）
→ 审批通过 → 更新 project-context.md ADR 索引
→ 审批不通过 → 标记为 deprecated，记录原因
```

## 索引格式（docs/adr/README.md）

```markdown
| ADR | 标题 | 状态 | 日期 |
|-----|------|------|------|
| [0001](0001-xxx.md) | 决策标题 | accepted | 2026-XX-XX |
```

## 质量 Do / Don't

**Do**：
- 具体——「用 Prisma ORM」而非「用 ORM」
- 记录 why——理由比结果重要
- 列出被否决的替代方案——后人需要知道考虑过什么
- 诚实写后果——每个决策都有取舍
- 2 分钟内可读完；用现在时（「We use X」）

**Don't**：
- 记录琐碎决定（变量命名/格式化不算 ADR）
- 写论文（context 超 10 行即过长）
- 省略替代方案（「just picked it」不算理由）
- ADR 过期不标记（superseded 必须链接替代者）

## 与其他环节集成

- **Reviewer**：PR 引入架构变更但无对应 ADR → review-report 中标记
- **Tester**：测试中发现架构问题 → test-report 标注并通知 Planner
- **Planner**：提议架构变更时，主动建议创建 ADR
