# 派发提示词模板（编排者专用）

> 编排者（主会话）按模块循环派发子 agent 时，复制对应角色模板、填占位符后派发。
> 角色文件定义"你是谁"，本模板定义"这次具体做什么"——两者缺一不可。
>
> 占位符：`{MODULE}`=module-XXX-名称 · `{SPEC_DIR}`=specs/module-XXX-名称 · `{ROOT}`=项目根 · `{TASK}`=本模块任务要点
>
> 派发通用规则：
> 1. 每条派发提示词必须让子 agent **自包含可执行**——它看不到主会话上下文，一切依赖信息写进提示词或指向文件
> 2. 单次派发压到分钟级可完成的单元；大模块拆多次派发（每次一个清晰交付物）
> 3. 子 agent 返回后，编排者核对产出文件存在 + 三记忆文件更新，再路由下一阶段

---

## 通用头部（每个角色模板都以这段开头）

```
你是本模块循环中被派发的 {角色名} 子 agent。开工前按顺序读取：
1. 你的角色定义：{ROOT}\.claude\agents\{role}.md —— 严格按其职责、约束、自检清单执行
2. {ROOT}\CLAUDE.md —— 14 条铁律（违反即阶段失败）
3. 本模块计划：{ROOT}\{SPEC_DIR}\plan.md
4. 验收标准：{ROOT}\{SPEC_DIR}\acceptance-criteria.md
5. 记忆三件套：{ROOT}\memory\project-context.md → file-index.md → agent-activity-log.md

硬性要求：
- 产出文件写好 + 三记忆文件追加本模块（{MODULE}）记录，才算完成
- 返回消息必须包含：产出文件路径、三记忆文件已更新确认、遗留问题（如有）
- 铁律违反、方案不可行、计划矛盾——立即在返回消息中上报，不要自行变通
```

---

## Planner 派发模板

```
{通用头部}

本模块任务：{TASK}

产出（缺一不可）：
1. {ROOT}\{SPEC_DIR}\plan.md —— 按 planner.md §3.3 格式：需求描述 / 子任务拆分（每个子任务
   列出涉及文件的具体路径 + 预估行数，生产代码合计 ≤ 200 行）/ 技术方案 / 风险
2. {ROOT}\{SPEC_DIR}\acceptance-criteria.md —— 每个验收项必须附可运行验证命令与预期输出
3. 三记忆文件更新（file-index 两条索引行 + activity-log [PLAN]/[HANDOFF] + project-context 待办）

注意：只规划不编码；需求模糊处在 plan.md「待澄清」小节列出，不要自行假设。
```

## Developer 派发模板

```
{通用头部}

本模块任务：{TASK}
计划版本：{SPEC_DIR}\plan.md v{N}（若有变更记录，以最新版为准）

产出（缺一不可）：
1. 按 plan.md 子任务清单完成编码——只实现计划内内容，不擅自扩展
2. 本地验证通过（命令与预期输出贴进 changelog）
3. {ROOT}\{SPEC_DIR}\changelog.md —— 变更文件列表 / 关键设计说明 / 验证命令输出
4. 三记忆文件更新（project-context 状态→👀待审查 + file-index 源码索引行 + activity-log [CODE]/[HANDOFF]）

注意：先输出实现计划再动手；修复必须带回归测试；重试上限 3 次，超限上报勿硬刚。
```

## Reviewer 派发模板

```
{通用头部}

审查对象：{SPEC_DIR}\changelog.md 所列的全部变更文件
审查基准：plan.md + acceptance-criteria.md

产出（缺一不可）：
1. {ROOT}\{SPEC_DIR}\review-report.md —— 按 reviewer.md §3.3 格式：结论（通过/不通过）、
   问题列表（每条含 文件:行号 + 严重级别 + 可执行修复建议）、验收标准逐项核对、安全评估
2. 三记忆文件更新（project-context 审查结论 + file-index 报告条目 + activity-log [REVIEW]/[HANDOFF]）

注意：必须读完整文件而非只看 diff；每个问题必须有行号；结论只有 通过/不通过 两种。
```

## Tester 派发模板

```
{通用头部}

测试对象：{SPEC_DIR}\changelog.md 所列变更 + 全量回归
测试依据：acceptance-criteria.md（每验收项至少一个用例）

产出（缺一不可）：
1. 新增测试代码（正常路径 + 边界 + 异常兜底三态覆盖）
2. {ROOT}\{SPEC_DIR}\test-report.md —— 按 tester.md §3.3 格式：概览（总数/通过/失败/跳过）、
   失败详情（含失败类型：环境性/真实回归）、验收项逐项核对、真实环境冒烟记录
3. 三记忆文件更新（project-context 状态 + file-index 测试产出行 + activity-log [TEST]/[HANDOFF]）

注意：回归必须全量跑且 100% 通过；被跳过/未收集的用例一律视为失败；环境性失败修基建重跑不阻塞，
真实回归才反馈修复；含 DB/外部依赖的模块必须真实环境冒烟（禁止 mock 充数）。
```

---

## 回退/重派发模板（审查或测试不通过时）

```
{对应角色通用头部}

上一轮未通过，本轮为修复轮（第 {N}/{上限} 轮）：
- 问题清单：{SPEC_DIR}\review-report.md（或 test-report.md）——逐项修复，不新增范围
- 修复每个 bug 必须同时新增回归测试
- 修复后重新产出 changelog.md（版本号 +1）并更新三记忆文件
```
