# 审查模式上下文（Reviewer 阶段注入）

> 源：ECC contexts/review.md（module-002 吸收，按本技能铁律适配）。

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

## 遵守
- 铁律 6/7/8 + review-checklist.md 逐项核验
- 任一 ❌ 项 → 模块不得进入测试阶段
