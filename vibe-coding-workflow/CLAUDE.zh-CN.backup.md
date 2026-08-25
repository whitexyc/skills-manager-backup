# CLAUDE.md — Vibe Coding 闭环工作流 · 精简加载器

> 本文件是项目**唯一常驻规范**（Claude Code 每次会话自动加载），只写铁律与指针，不重复定义细节。
> 细节全部按 L0/L1/L2 渐进披露（入场顺序见 SKILL.md）：**无触发不读取**——文档越多，全量读入越触发 context rot（token 越多、模型准确回忆能力越差）。
>
> **单源权威**：详细规范在 `docs/rules/`、`docs/reference/`、`.claude/`、`templates/`、`memory/` 中。修改铁律时须与 `SKILL.md` 铁律区同步。

## 0. 铁律（违反 = 阶段不通过，无需提醒）

| # | 铁律 | 验证方式 | 违反后果 |
|---|------|----------|----------|
| 1 | 编码前必须先产出 `plan.md` + `acceptance-criteria.md`；Planner 只输出规划文档，绝不写代码（轻量模式豁免：文档级/脚本小改可直接执行，但必须留 changelog + 记忆行） | 脚本查文件存在 | 退出码 2 |
| 2 | 一次只开发一个 module-XXX；新增生产代码 ≤200 行（docstring/注释/测试豁免） | `git diff --numstat` | 阶段不通过 |
| 3 | 单个方法 ≤50 行、单个类 ≤500 行；超限必须拆分，特殊情况须在 plan.md 说明理由 | 静态分析/脚本 | Review 驳回 |
| 4 | 所有 public/导出方法必须有 Javadoc / Docstring / JSDoc；魔法数字必须命名常量并注释 | checkstyle / pylint / ESLint | Review 驳回 |
| 5 | 严禁空 catch / 吞异常（空 catch 块、裸 except）；业务异常统一继承 `BusinessException`（确定性脚本的 I/O 容错 catch 带注释说明即豁免） | 正则/静态扫描 | Review 驳回 |
| 6 | 严禁跨层调用（Controller→Repository 直连、反向依赖、循环依赖）；Entity 禁止暴露到 Controller 层（DTO 隔离） | ArchUnit / import 检查 | Review 驳回 |
| 7 | 所有 API 统一返回 `{code, msg, data, timestamp, request_id}` | 接口测试 | Test 驳回 |
| 8 | 关键业务操作必须有 INFO 日志（入参摘要 + 结果 + 耗时）；异常日志含 `request_id`；禁打敏感信息 | 日志扫描 | Review 驳回 |
| 9 | 安全红线：禁 SQL 字符串拼接（参数化查询）、禁硬编码密钥/明文密码（BCrypt/Argon2） | semgrep / gitleaks | Review 驳回 |
| 10 | 架构变更必须走 ADR：发现者撰写 → Planner 审批（accepted/rejected/needs-discussion）→ 更新 project-context.md ADR 索引 | docs/adr/ 索引核对 | 不算完成 |
| 11 | 记忆三件套：**入场先读**（project-context → file-index → activity-log），**阶段退出前必须写入本模块记录** | `verifyMemory` + `delivery-gate`（mtime 24h 新鲜度） | 退出码 3 / 4 |
| 12 | 交接前自跑 lint + 测试并贴命令输出为证；交付文档必须用 `templates/` 对应模板，不得自创格式 | changelog/报告内容校验 | 不算完成 |
| 13 | 脚本类工具必须纯 Node 内置模块 + 头部用途注释（用法/退出码/环境变量） | 代码检查 | 不算完成 |
| 14 | 闸门/审计类脚本必须配套「可机械断言的夹具用例」 | 夹具矩阵 | 不算完成 |

> 注：验证方式列**已部分脚本化**——`templates/check-gates.js` 在模块循环 DEVELOP/REVIEW 阶段自动执行（铁律 2/3/4/5/9/12 + 审查证据），`templates/delivery-gate.js` 在 TEST 后校验记忆 mtime 新鲜度（铁律 11），任一失败 → 退出码 4；`templates/install-precommit.js` 可挂 git pre-commit 钩子（暂存区拦截）。可经 `config.gates.enabled=false` 关闭。启发式检查（正则/括号平衡）不能替代 Review。

## 1. 角色与闭环（指针）

| 角色 | 职责一句话 | 定义文件 |
|------|-----------|----------|
| Planner | 需求拆解 → 输出 plan.md + acceptance-criteria.md；维护 project-context.md 待办 | @.claude/agents/planner.md |
| Developer | 按 plan 实现，产出代码 + changelog.md；失败自修复（≤3 次） | @.claude/agents/developer.md |
| Reviewer | 读全文件（不只 diff）审查，产出 review-report.md（每项附 文件:行号 证据） | @.claude/agents/reviewer.md |
| Tester | 全量回归（100%）+ 新测试，产出 test-report.md | @.claude/agents/tester.md |

- 四阶段闭环（Plan→Develop→Review→Test）、超时监控、回退路径 → @.claude/workflows/vibe-coding-loop.md
- 模块循环驱动脚本（退出码 0/1/2/3/4）→ templates/module-loop-template.js；规则闸门 → templates/check-gates.js；记忆闸门 → templates/delivery-gate.js；pre-commit 安装 → templates/install-precommit.js
- Planner 可按模块复杂度扩展同一角色多实例（如 Developer-Frontend/Backend），在 plan.md 中明确

## 2. 按需查阅索引（无触发不读）

| 触发场景 | 文件 |
|----------|------|
| 编写代码（命名/注释） | @docs/rules/naming.md |
| 编写 Controller / API | @docs/rules/api-format.md |
| 设计结构（分层/DTO/AI 层） | @docs/rules/layering.md |
| 编码细则（注释/异常/日志/长度/安全） | @docs/rules/coding-standards.md |
| 架构决策（ADR 规则） | @docs/rules/adr.md |
| 记忆库读写规则 | @docs/rules/memory-rules.md |
| 涉及 LLM 调用 / Agent 编排 | @docs/rules/ai-agent-dev.md |
| 新增目录 / 文件布局 | @docs/reference/directory-structure.md |
| 新项目初始化 | @docs/reference/quickstart.md |
| 环境报错 / 权限拦截 / Windows 坑 | environment-troubleshooting.md |
| 安全审计（密钥/危险命令/注入） | node templates/audit-scan.js（--with-md 含 .md 注入检查） |
| 提交 / 分支 / 版本号 | @.claude/workflows/vibe-coding-loop.md §6 |
| 拿到 plan.md 准备开发 | @docs/rules/plan-safety.md |
| 阶段模式上下文（dev/review/research） | @contexts/dev.md · @contexts/review.md · @contexts/research.md |
| 技能体检（引用/铁律同步/孤儿） | node templates/skill-stocktake.js（--skill 指定技能根） |
| 定期维护铁律 | @docs/rules/rules-distill.md |

## 3. 共享记忆（强制读写）

三件套：
- `memory/project-context.md` — 项目状态（待办/进行中/已完成/ADR 索引）
- `memory/file-index.md` — 文件索引（每模块 1 行 + 入口文件 1 行）
- `memory/agent-activity-log.md` — 活动日志（每模块每阶段 1 行）

**读**：每次入场/开工先读三件套（状态新鲜度优先，见 SKILL.md L0/L1/L2），任何阶段不得跳过。
**写**：阶段退出前必须完成本阶段强制写入；交接消息附「已更新记忆库文件清单」，否则下一阶段不得启动。更新规则见 @docs/rules/memory-rules.md。

## 4. 技术栈

- 技术栈**不预设固定选项**：用户填写 `tech-stack.md`（模板 @templates/tech-stack-template.md），或与 Planner 确认后代填。
- 技术栈变更必须更新 `tech-stack.md` 并记录 ADR。
- 首个模块启动前，Planner 必须确认 tech-stack.md 已填写完整（后端/数据库/中间件/前端/AI 供应商/CI/CD/部署方式）。
