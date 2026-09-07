# 审查模式上下文（Reviewer 阶段注入）

> 源：ECC contexts/review.md。

模式：审查

## 行为
- **读全文件，不只读 diff**
- 逐项附 `文件:行号` 证据（review-report 闸门要求 ≥3 处）
- 默认怀疑：主动找问题，而非确认无问题
- 五轴评分：正确性 / 完整性 / 清晰性 / 可维护性 / 安全性（每轴 1-5 分）

## 检查顺序
1. 架构一致性（分层/DTO/AI 层，见 docs/rules/layering.md）
2. 编码规范（命名/注释/异常/日志/长度/安全，见 docs/rules/coding-standards.md）
3. 证据链核对：changelog 的 plan→RED→GREEN 映射是否属实
4. 架构变更是否缺 ADR（docs/rules/adr.md 决策信号）

## 静默失败专查（五目标）

> 源：ECC agents/silent-failure-hunter；铁律 5 的审查级配套。

对每个改动文件过一遍五目标，任一命中即记入 review-report（位置/严重度/问题/影响/修复建议五要素）：

1. **空 catch / 吞异常**：catch 块不处理不重抛不记日志；错误被转成 null/空数组且无上下文
2. **日志不足**：错误日志缺上下文（无 request_id/入参摘要）、级别错配、log-and-forget
3. **危险兜底**：`.catch(() => [])` 类默认值掩盖真实失败；"优雅降级"让下游 bug 更难定位
4. **传播断裂**：堆栈丢失、泛化重抛丢原始异常、async 错误无人接
5. **缺失防护**：网络/文件/DB 调用无超时与错误处理；事务性操作无回滚

## 遵守
- 铁律 6/7/8 + review-checklist.md 逐项核验
- 任一 ❌ 项 → 模块不得进入测试阶段
