# 评估驱动开发 / Eval Harness（L2 参考文档 · 触发条件：AI/LLM 功能的验收标准设计或评估体系搭建时）

> 本文件为按需读取的参考文档（无触发不读）。
> 源：ECC skills/eval-harness。
> 核心：**评估是 AI 开发的单元测试**——先定义"怎么算对"，再写实现；评估定义随代码版本管理。

## 原则

- 实现之前先定义评估：capability（新能力能不能做到）与 regression（原有行为没被改坏）分开列
- capability 评估写进 plan.md 的 acceptance-criteria.md（Planner 阶段完成，对接铁律 1）
- 优先确定性 grader：code > rule > model > human，能用下位就不用上位

## 四类 Grader

| 类型 | 适用 | 示例 |
|------|------|------|
| code | 可断言的确定性结果 | 测试通过 / 文件存在 / 构建成功 |
| rule | 格式与约束 | 正则 / schema / JSON 结构校验 |
| model | 开放式输出质量（LLM-as-judge） | 按 rubric 打 1-5 分并写理由 |
| human | 歧义、安全、高风险裁决 | 标记 `[HUMAN REVIEW REQUIRED]` + 风险等级 |

安全相关评估**永不全自动通过**，必须留 human grader。

## 指标与阈值

- `pass@1`：一次直通率——直接可靠性
- `pass@3`：3 次内成功率 ≥ 90%——capability 评估的实用门槛
- `pass^3`：连续 3 次全过 = 100%——回归评估与发布关键路径的稳定性门槛

## 反模式

- 把提示词过拟合到已知评估样例上（评估分高，真实场景拉胯）
- 只测 happy path；只追通过率不管成本与延迟漂移
- 不稳定的 grader（同一输出两次打分不同）放进发布闸门

## 产物布局

```
evals/<feature>.md      评估定义（capability + regression + 指标）
evals/<feature>.log     运行历史（每次 append PASS/FAIL + pass@k）
docs/releases/<ver>/eval-summary.md   发布快照
```

> 与本技能对接：Planner 在 acceptance-criteria.md 里定义 capability 评估；Tester 六阶段验证（contexts/test.md）之后对 AI 功能追加评估报告；报告进 changelog 证据链（铁律 12）。
