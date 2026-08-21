---
name: vibe-coding-workflow
description: Use when setting up a multi-agent software project with Planner/Developer/Reviewer/Tester roles in a closed-loop workflow, or when joining an existing project that uses module-XXX numbering, specs/ directories, and shared project-context.md memory.
---

# Vibe Coding 闭环工作流

4 角色闭环（Plan → Develop → Review → Test）+ 模板化文档 + 共享记忆的生产级软件交付工作流。

## 铁律（违反 = 阶段不通过，无需提醒）

> 与项目 `CLAUDE.md §0` 同步维护——修改须两处同步。验证方式列已部分脚本化：`templates/check-gates.js` 在模块循环 DEVELOP/REVIEW 阶段自动执行（失败退出码 4，可经 config.gates.enabled=false 关闭）。

| # | 铁律 | 验证方式 | 违反后果 |
|---|------|----------|----------|
| 1 | 编码前先产出 plan.md + acceptance-criteria.md；Planner 绝不写代码 | 脚本查文件 | 退出码 2 |
| 2 | 一次一个 module-XXX；新增生产代码 ≤200 行 | git diff --numstat | 阶段不通过 |
| 3 | 方法 ≤50 行、类 ≤500 行；超限拆分或 plan.md 说明 | 静态分析 | Review 驳回 |
| 4 | public/导出方法必须有 Javadoc/Docstring/JSDoc；魔法数字命名常量 | checkstyle/pylint/ESLint | Review 驳回 |
| 5 | 严禁空 catch/吞异常；业务异常统一 BusinessException | 正则扫描 | Review 驳回 |
| 6 | 严禁跨层/反向/循环依赖；Entity 不暴露到 Controller（DTO） | ArchUnit/import 检查 | Review 驳回 |
| 7 | API 统一 {code, msg, data, timestamp, request_id} | 接口测试 | Test 驳回 |
| 8 | INFO 日志（入参摘要+耗时）；异常含 request_id；禁打敏感信息 | 日志扫描 | Review 驳回 |
| 9 | 禁 SQL 拼接、禁硬编码密钥/明文密码 | semgrep/gitleaks | Review 驳回 |
| 10 | 架构变更走 ADR：发现者写 → Planner 审批 → 更新索引 | docs/adr/ 核对 | 不算完成 |
| 11 | 入场先读记忆三件套，阶段退出前必写 | verifyMemory | 退出码 3 |
| 12 | 交接前自跑 lint+测试贴输出；文档用 templates/ 模板 | 内容校验 | 不算完成 |

## 角色（一句话 + 指针）

| 角色 | 职责一句话 | 定义文件 |
|------|-----------|----------|
| Planner | 出 plan.md + acceptance-criteria.md，不写代码 | .claude/agents/planner.md |
| Developer | 按 plan 实现，产出代码 + changelog.md | .claude/agents/developer.md |
| Reviewer | 读全文件审查，report 附 文件:行号 证据 | .claude/agents/reviewer.md |
| Tester | 全量回归 + 新测试，产出 test-report.md | .claude/agents/tester.md |

四阶段闭环/超时/回退 → `.claude/workflows/vibe-coding-loop.md`
模块循环驱动脚本 → `templates/module-loop-template.js`

## 入场阅读顺序（L0/L1/L2 渐进披露，无触发不读）

**L0 常驻（每次会话必读）：**
1. `memory/project-context.md` → 项目状态（第一位）
2. `CLAUDE.md` → 铁律与指针（本技能）

**L1 按需（任务相关才读）：**
3. `memory/file-index.md` → 定位文件
4. `specs/module-XXX/` → 涉及模块时读 plan/changelog
5. `memory/agent-activity-log.md` → 追溯历史

**L2 深度（被追问/决策依据才读）：**
6. `docs/rules/` → 命名/接口/分层/编码细则
7. `docs/adr/` → 决策依据
8. `docs/reference/` → 目录结构/快速启动

> 每个文档自带触发条件——没有触发就不读，节省的 token 就是准确率。

## 快速启动（新项目 7 步）

1. 拷贝 `CLAUDE.md`、`.claude/`、`memory/`、`templates/`、`docs/` 到项目根
2. 填 `tech-stack.md`
3. 环境预检：`CLAUDE_CODE_SUBAGENT_MODEL` 冒烟验证 + 权限 allow 白名单
4. 初始化 memory 三件套
5. git init：`main` + `develop`
6. Planner 输出 module-001 的 plan.md + acceptance-criteria.md
7. 启动模块循环驱动

## 常见错误（这不算完成）

- 跳过模板自创格式；Planner 写代码；超 plan 范围加功能
- Reviewer 只看 diff 不看全文件；Tester 跳过回归只跑新测试
- changelog 只列文件名不写设计说明；声称测试通过但不贴命令输出
- 并行开发多个模块；入场不读记忆三件套；交接不写记忆库

## 相关文件

- 环境排查 → `environment-troubleshooting.md`
- 记忆库读写规则 → `docs/rules/memory-rules.md`
