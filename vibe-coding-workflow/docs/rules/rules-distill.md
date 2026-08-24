# 规则蒸馏维护流程（L2 参考文档 · 触发条件：定期维护铁律时）

> 源：ECC skills/rules-distill（module-002 吸收）。

## 目的

让 12 条铁律随真实使用**演化**，而不是靠人定期想起来改。数据源 = 闸门驳回记录 + 违规台账。

## 流程（确定性收集 + LLM 裁决，两阶段）

### Phase 1 收集（确定性脚本）

- **闸门自动收集**：`check-gates.js` / `delivery-gate.js` 每次失败自动追加 `memory/violations.md`（`GATE_MODULE`/`GATE_VIOLATIONS_FILE` 可配，无需手工）
- 收集 `memory/agent-activity-log.md` 中被驳回模块的「违反规则」标注
- 台账：`memory/violations.md`（自动追加，含模块/铁律/日期/原因；轮次与聚合在蒸馏阶段处理）

台账格式：

```
| 模块 | 铁律 | 日期 | 原因 |
|------|------|------|------|
| module-003 | 4（注释缺失） | 2026-08-23 | public 方法无 docstring |

### Phase 2 裁决（LLM 交叉阅读）

- 把台账 + 现有铁律全文交给 LLM 交叉阅读
- 判据：
  - 同一原则反复出现 → **升级/加粗**为铁律
  - 铁律长期零命中 → **降级/删除**
  - 误报集中的规则 → **调整验证方式或阈值**（GATE_MAX_*）

## 输出

- `CLAUDE.md §0` 铁律表增删改（**必须**同步 `SKILL.md` 铁律区）
- `check-gates.js` / `delivery-gate.js` 阈值或正则调优建议

## 频率

- 每完成 5-10 个模块，或每月一次
- 触发入口：Planner 或用户主动发起「铁律蒸馏」
