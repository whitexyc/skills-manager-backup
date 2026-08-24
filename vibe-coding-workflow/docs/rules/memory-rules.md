# 共享记忆库读写规则（L2 参考文档 · 触发条件：阶段交接/入场时）

> 本文件为按需读取的参考文档（无触发不读）。铁律提炼见 `CLAUDE.md §0` 第 11 条。
> 源：原 CLAUDE.md §10.5（含 §10.2 动作标签）。

## 0. 总原则：先读后写，写入是阶段退出前置

- **读**：每次入场/开工，先读三件套（顺序：project-context → file-index → activity-log），状态新鲜度优先，任何阶段不得跳过。
- **写**：阶段退出前必须完成本阶段强制写入；交接消息附「已更新记忆库文件清单」，否则下一阶段不得启动。
- **新鲜度（mtime 闸门）**：三件套必须在最近 `GATE_MEMORY_HOURS`（默认 24h）内更新过——`templates/delivery-gate.js` 用文件修改时间确定性校验（关键文件：project-context.md、agent-activity-log.md），超窗即阻塞（模块循环退出码 4）。

## 1. 强制项（每模块必做，阶段退出前置）

| 文件 | 粒度 | 更新人 |
|------|------|--------|
| `memory/project-context.md` | 模块状态流转（待办→开发中→待审查→已完成）+ 待办更新 | 各阶段执行者 |
| `memory/file-index.md` | 每模块 1 行汇总 + 新增入口/非常规文件 1 行 | 各阶段执行者 |
| `memory/agent-activity-log.md` | 每阶段交接 1 行（每模块 4 行：PLAN/CODE/REVIEW/TEST） | 各阶段执行者 |

## 2. 按需项

| 触发事件 | 更新内容 |
|----------|----------|
| 产生 / 审批 ADR | project-context.md ADR 索引更新 |
| 关键技术决策 | project-context.md 关键技术决策记录 |
| 模块阻塞 / 解除阻塞 | agent-activity-log.md 追加 `[BLOCKED]` / `[UNBLOCKED]` 记录 |

## 3. 可选 / 批处理项

日统计、工作量周报、归档（不阻塞流程）。

## 4. 强制条款

> 任一阶段退出前必须完成本阶段强制记忆库写入，交接 SendMessage 中附「已更新记忆库文件清单」，否则下一阶段不得启动。

## 5. 动作类型标签（agent-activity-log.md 使用）

`[PLAN]` `[CLARIFY]` `[CODE]` `[FIX]` `[BUILD]` `[REVIEW]` `[ADR]` `[TEST]` `[REGRESSION]` `[BLOCKED]` `[UNBLOCKED]` `[HANDOFF]` `[CONTEXT]` `[CORRECT]` `[ESCALATE]`

活动记录单表格式：每模块每阶段 1 行（PLAN/CODE/REVIEW/TEST 交接各 1 行）；历史记录不删除、不修改；如需更正，追加一条 `[CORRECT]` 记录。

```
| 时间 | 模块 | 阶段 | 执行者 | 动作标签 | 产出文件 | 状态 |
|------|------|------|--------|----------|----------|------|
```
