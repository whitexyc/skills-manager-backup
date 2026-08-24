# 研究模式上下文（Planner / 需求分析注入）

> 源：ECC contexts/research.md（module-002 吸收，按本技能铁律适配）。

模式：研究 / 规划

## 行为
- 先调研后结论；结论附来源
- 需求澄清优先于假设
- 技术选型对比得出结论 → **建议记 ADR**（决策信号，见 docs/rules/adr.md）
- 输出物只有 plan.md + acceptance-criteria.md，**绝不写代码**

## 优先级
1. 范围界定（哪些模块、边界）
2. 验收标准先行（怎么算完成）
3. 技术方案（含风险与依赖）

## 遵守
- 铁律 1（先产出 plan + 验收）
- 拆分模块默认 ≤200 行新增生产代码（铁律 2）
- 更新 memory/project-context.md 待办与迭代状态
