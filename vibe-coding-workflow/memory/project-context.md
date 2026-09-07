# 项目上下文记忆库

> 📋 本文件是 Vibe Coding 工作流的共享记忆库，所有 Agent（Planner、Developer、Reviewer、Tester）共享使用。
> 每次操作后由对应角色更新本文件，保持上下文同步。
> **最后更新者请修改「最后更新」时间戳。**
> **热区约束**：本文件只放当前状态，目标 ≤30KB——模块清单每行只留"编号+短名+版本+日期+状态"，ADR 索引 1 行/条，历史迭代明细与超长行归档到 `memory/archive/`（规则见 `docs/rules/memory-rules.md` §3.5）。

---

## 1. 项目概述

| 字段 | 内容 |
|------|------|
| 项目名称 | <项目名称> |
| 项目简介 | <一句话描述项目目标和核心功能> |
| 创建时间 | YYYY-MM-DD |
| 最后更新 | YYYY-MM-DD HH:mm（更新人：<姓名>） |
| 当前版本 | v0.1.0 |

---

## 2. 技术栈

| 类别 | 选型 | 备注 |
|------|------|------|
| 后端框架 | Java 17 + Spring Boot 3.x / Python 3.11+ + FastAPI | 待确认 |
| 数据库 | PostgreSQL 15+ | |
| 缓存 | Redis 7+ | |
| 消息队列 | RabbitMQ / Kafka | |
| 前端框架 | React 18 + TypeScript + Vite | |
| AI 供应商 | OpenAI / Claude / 本地模型 | 待确认 |
| API 文档 | SpringDoc OpenAPI / FastAPI 内置 OpenAPI | |
| 测试框架 | JUnit 5 + Mockito / pytest + pytest-asyncio | |
| CI/CD | GitHub Actions / GitLab CI | 待确认 |
| 部署方式 | Docker Compose / Kubernetes | 待确认 |

---

## 3. 团队成员

Vibe Coding 闭环工作流通过 4 个专业化 Agent 协同工作：

| Agent | 角色名称 | 核心职责 | 当前状态 |
|-------|----------|----------|----------|
| **Planner** | 规划师 | 需求分析、模块拆解、制定开发计划和验收标准 | ⏳ 待启动 |
| **Developer** | 开发者 | 代码实现、模块交付、自测 | ⏳ 待启动 |
| **Reviewer** | 审查员 | 代码审查、架构一致性检查、安全审计 | ⏳ 待启动 |
| **Tester** | 测试员 | 测试用例编写、单元/集成/回归测试、验收 | ⏳ 待启动 |

### 3.1 Agent 间协作规则

- Planner → Developer：通过 `plan.md` + `acceptance-criteria.md` 交付
- Developer → Reviewer：通过代码提交 + `changelog.md` 通知审查
- Reviewer → Developer：审查不通过时通过 `review-report.md` 反馈问题
- Reviewer → Tester：审查通过后通知开始测试
- Tester → Developer：测试不通过时通过 `test-report.md` 反馈失败详情
- Tester → 团队：测试通过后更新本文件模块状态为 ✅

### 3.2 通讯规则

- 所有 Agent 通过 Teammate Mode 内置消息系统通讯
- 最终结果必须发送给 team-lead
- 阻塞问题需要立即通知 team-lead 或相关角色

---

## 4. 已完成模块清单

| 模块编号 | 模块名称 | 版本号 | 状态 | 验收结果 | Tester | 完成日期 |
|----------|----------|--------|------|----------|--------|----------|
| — | 暂无已完成模块 | — | — | — | — | — |

> 状态图例：✅ 已完成 | 🔧 开发中 | 👀 审查中 | 🧪 测试中 | 🚫 阻塞 | 📋 待开发

---

## 5. 架构决策记录（ADR）索引

| ADR 编号 | 标题 | 状态 | 日期 | 决策者 |
|----------|------|------|------|--------|
| — | 暂无 ADR | — | — | — |

> 状态图例：📝 proposed（提议中） | ✅ accepted（已采纳） | ❌ deprecated（已废弃） | 🔄 superseded（已被取代）
> ADR 文件存放于 `docs/adr/adr-XXX-<title>.md`

---

## 6. 当前迭代状态

### 6.1 迭代信息

| 字段 | 内容 |
|------|------|
| 当前迭代 | 第 1 轮迭代 |
| 正在开发模块 | 无（等待 Planner 输出首份计划） |
| 模块状态 | 📋 待启动 |
| 当前阶段 | 初始化 |

### 6.2 阻塞项

| 阻塞项 | 原因 | 影响模块 | 报告人 | 报告时间 |
|--------|------|----------|--------|----------|
| — | 暂无阻塞 | — | — | — |

### 6.3 工作流程图

```
阶段 1：初始化 ✅ → 阶段 2：Planner 制定计划（⏳） → 阶段 3：Developer 开发 → 阶段 4：Reviewer 审查 → 阶段 5：Tester 测试 → 回到阶段 2（下一模块）
```

---

## 7. 待办事项

### 7.1 短期任务（当前迭代）

- [ ] 项目初始化：确认技术栈选型（由 Planner 向用户确认）
- [ ] 项目初始化：创建项目目录结构和基础框架
- [ ] 项目初始化：配置 CI/CD 流水线
- [ ] module-001：Planner 输出第一个模块的开发计划

### 7.2 中期任务（未来迭代）

- [ ] 待 Planner 根据需求拆解后补充

### 7.3 技术债务

| 编号 | 债务描述 | 来源模块 | 计划修复版本 | 记录人 |
|------|----------|----------|--------------|--------|
| — | 暂无技术债务 | — | — | — |

---

## 8. 注意事项

### 8.1 团队约定

1. **规范优先**：所有代码必须符合 CLAUDE.md 定义的规范，Reviewer 将严格检查
2. **单一模块 ≤ 200 行**：超过 200 行需拆分，降低单次审查和测试的复杂度
3. **先走通闭环再加速**：首轮迭代重点是验证流程，后续迭代才是功能完善
4. **文档即合约**：plan.md 是 Developer 的唯一开发依据，不接受超出计划的功能
5. **及时沟通**：遇到阻塞立即通知，不要硬扛（Developer 最多重试 3 次）

### 8.2 关键约束

- 所有 API 必须返回统一格式 `{code, msg, data, timestamp, request_id}`
- Controller → Service → Repository，严格单向依赖
- 密码使用 BCrypt/Argon2，禁止明文存储
- API Key / 密钥使用环境变量，禁止硬编码
- 敏感信息不得输出到日志

### 8.3 文件命名速查

| 类型 | 格式 | 示例 |
|------|------|------|
| 模块计划 | `specs/module-XXX-name/plan.md` | `specs/module-001-user-auth/plan.md` |
| 变更日志 | `specs/module-XXX-name/changelog.md` | `specs/module-001-user-auth/changelog.md` |
| 审查报告 | `specs/module-XXX-name/review-report.md` | `specs/module-001-user-auth/review-report.md` |
| 测试报告 | `specs/module-XXX-name/test-report.md` | `specs/module-001-user-auth/test-report.md` |
| ADR | `docs/adr/adr-XXX-<title>.md` | `docs/adr/adr-001-choose-postgresql.md` |
| Git 分支 | `feature/module-XXX-brief` | `feature/module-001-user-register` |

---

## 9. 历史教训

> 在此记录项目过程中学到的经验教训，帮助团队避免重复踩坑。

| 日期 | 教训 | 来源 | 影响 |
|------|------|------|------|
| — | 暂无记录 | — | — |

---

## 更新日志

| 日期 | 更新人 | 更新内容 |
|------|--------|----------|
| YYYY-MM-DD | <初始化人> | 创建项目上下文记忆库初始模板 |

---

> **维护规则**：本文件由所有 Agent 共同维护。
> 每个 Agent 在完成自己的职责后，需更新本文件中的相关部分。
> 具体更新规则参见 `docs/rules/memory-rules.md`。
