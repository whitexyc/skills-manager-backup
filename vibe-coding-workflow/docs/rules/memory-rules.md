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

## 3.5 热区/冷区（防记忆无界增长）

85 模块实测教训：project-context 涨到 114KB、activity-log 涨到 297KB 后，"入场先读"在物理上已不可执行。规则：

- **project-context.md 是热区（目标 ≤30KB）**：只放当前状态——概述、已完成模块清单（每行：编号+短名+版本+日期+状态；**明细禁入名称列**）、ADR 索引（1 行/条，详情在 docs/adr/）、当前迭代状态（只留本迭代条目）
- **agent-activity-log.md 是热区**：每模块每阶段 1 行，**单行 ≤200 字符**；超长结论写进 specs/ 对应报告或 `memory/logs/<role>/`，此行只留摘要+指针
- **冷区 = `memory/archive/`**：按内容类型归档（`activity-log-日期.md` / `project-context-日期.md` / `adr-rows-日期.md` / `module-rows-日期.md`），只读不写，头部注明切分来源与日期
- **归档时机与工具**：delivery-gate 机械校验热区尺寸（>30KB 警告、>50KB 阻塞，GATE_HOT_*_KB 可调），超限即归档。机械化：`node templates/archive-rotate.js [--dry-run] [--keep-days 14] [--compact-chars 500] [--pc]`——日期旋转（早于 keep-days 的日期行整行入档）+ 超长行压缩（>`compact-chars` 的行原文入档、热区留 ≤160 字符存根+指针）；**--pc 同时处理 project-context**：>400 字符的「✅ 完成/模块清单/ADR」行原文入档、留 120 字符存根，🔵 进行中/规划行保持完整；两文件统一写前守恒与逐行去向自校验、.bak、归档名避让（module-017）
- 入场只读热区；需要历史时按热区内的指针进冷区，**默认不读**

## 4. 强制条款

> 任一阶段退出前必须完成本阶段强制记忆库写入，交接 SendMessage 中附「已更新记忆库文件清单」，否则下一阶段不得启动。

## 5. 动作类型标签（agent-activity-log.md 使用）

`[PLAN]` `[CLARIFY]` `[CODE]` `[FIX]` `[BUILD]` `[REVIEW]` `[ADR]` `[TEST]` `[REGRESSION]` `[BLOCKED]` `[UNBLOCKED]` `[HANDOFF]` `[CONTEXT]` `[CORRECT]` `[ESCALATE]`

活动记录单表格式：每模块每阶段 1 行（PLAN/CODE/REVIEW/TEST 交接各 1 行）；历史记录不删除、不修改；如需更正，追加一条 `[CORRECT]` 记录。

```
| 时间 | 模块 | 阶段 | 执行者 | 动作标签 | 产出文件 | 状态 |
|------|------|------|--------|----------|----------|------|
```
