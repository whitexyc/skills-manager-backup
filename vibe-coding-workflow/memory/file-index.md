# 项目文件索引

> 📋 本文件是项目的**分类汇总式**动态索引表，记录当前实际存在的所有重要文件及其内容摘要。
> 粒度规则：**每模块 1 行 + 每入口文件 1 行，非逐文件登记**。
> 新 Agent 加入时，先读本文件快速定位需要的文件（定位辅助），再读 `memory/project-context.md` 了解当前状态。

---

## 使用说明

### 索引维护规则（分类汇总式粒度）

1. **谁维护**：产出文件的 Agent 负责追加/更新索引条目
2. **何时维护**：模块完成时追加模块行；入口/非常规文件产出后立即追加
3. **模块层**：每个 `specs/module-XXX-<name>/` 只占 1 行（5 件套产出 + 一句话模块说明），不逐文件展开
4. **源码层**：只登记入口/非常规文件（新 Controller、新 Service、新 DDL、新配置、新 Agent），常规 CRUD 文件不逐行登记
5. **ADR/测试**：按模块聚合登记，不逐文件展开
6. **不删除**：文件被删除时，标记状态为「🗑️ 已废弃」但不删除索引行
7. **按类型分组**：文件按类型分组，组内按模块编号排列

### 索引条目格式

```
| 文件路径 | 模块 | 类型 | 内容摘要 | 创建时间 | 最后更新 | 状态 |
```

| 字段 | 说明 |
|------|------|
| **文件路径** | 相对于项目根目录的路径 |
| **模块** | 所属模块编号（全局文件填 `-`） |
| **类型** | 规范 / 计划 / 代码 / 审查 / 测试 / 决策 / 配置 / 文档 |
| **内容摘要** | 一句话描述文件内容（≤30字） |
| **创建时间** | YYYY-MM-DD |
| **最后更新** | YYYY-MM-DD |
| **状态** | 🟢 活跃 / 🟡 待更新 / 🔴 已废弃 / 🗑️ 已删除 |

---

## 1. 项目规范文件

| 文件路径 | 模块 | 类型 | 内容摘要 | 创建时间 | 最后更新 | 状态 |
|----------|------|------|----------|----------|----------|------|
| `CLAUDE.md` | - | 规范 | 项目核心规范：技术栈、命名、接口、分层、编码规则 | 2026-07-28 | 2026-07-28 | 🟢 |
| `.claude/agents/planner.md` | - | 配置 | Planner 角色定义 | 2026-07-28 | 2026-07-28 | 🟢 |
| `.claude/agents/developer.md` | - | 配置 | Developer 角色定义 | 2026-07-28 | 2026-07-28 | 🟢 |
| `.claude/agents/reviewer.md` | - | 配置 | Reviewer 角色定义 | 2026-07-28 | 2026-07-28 | 🟢 |
| `.claude/agents/tester.md` | - | 配置 | Tester 角色定义 | 2026-07-28 | 2026-07-28 | 🟢 |
| `.claude/workflows/vibe-coding-loop.md` | - | 配置 | 闭环工作流编排定义 | 2026-07-28 | 2026-07-28 | 🟢 |
| `.gitignore` | - | 配置 | Git 忽略规则（Java/Python/Node/IDE/构建） | 2026-07-28 | 2026-07-28 | 🟢 |

---

## 2. 模板文件

| 文件路径 | 模块 | 类型 | 内容摘要 | 创建时间 | 最后更新 | 状态 |
|----------|------|------|----------|----------|----------|------|
| `templates/spec-template.md` | - | 文档 | 功能规格说明书模板 | 2026-07-28 | 2026-07-28 | 🟢 |
| `templates/review-checklist.md` | - | 文档 | 代码审查清单模板 | 2026-07-28 | 2026-07-28 | 🟢 |
| `templates/adr-template.md` | - | 文档 | 架构决策记录模板 | 2026-07-28 | 2026-07-28 | 🟢 |
| `templates/acceptance-criteria.md` | - | 文档 | 验收标准模板 | 2026-07-28 | 2026-07-28 | 🟢 |
| `templates/changelog-template.md` | - | 文档 | 变更日志模板（Developer 用） | 2026-07-28 | 2026-07-28 | 🟢 |
| `templates/test-report-template.md` | - | 文档 | 测试报告模板（Tester 用） | 2026-07-28 | 2026-07-28 | 🟢 |
| `templates/implementation-plan-template.md` | - | 文档 | 实现计划模板（Developer 编码前用） | 2026-07-28 | 2026-07-28 | 🟢 |

---

## 3. 记忆库文件

| 文件路径 | 模块 | 类型 | 内容摘要 | 创建时间 | 最后更新 | 状态 |
|----------|------|------|----------|----------|----------|------|
| `memory/project-context.md` | - | 文档 | 共享记忆库：项目状态、模块清单、ADR索引 | 2026-07-28 | 2026-07-28 | 🟢 |
| `memory/agent-activity-log.md` | - | 文档 | Agent 活动日志（每模块每阶段 1 行，PLAN/CODE/REVIEW/TEST） | 2026-07-28 | 2026-07-28 | 🟢 |
| `memory/file-index.md` | - | 文档 | 本文件：项目文件分类汇总索引（每模块 1 行 + 每入口文件 1 行） | 2026-07-28 | 2026-07-28 | 🟢 |
| `memory/logs/module-XXX.md` | - | 日志 | 按模块归档的可选补充存档（每模块一个文件，非必需） | 2026-07-28 | 2026-07-28 | 🟢 |

---

## 4. 模块产出文件

> 每个模块完成时在此追加 **1 行汇总**（5 件套产出 + 一句话模块说明），不逐文件登记。

### 模块文件命名规则

```
specs/module-XXX-<name>/
├── plan.md                    # Planner 产出
├── acceptance-criteria.md     # Planner 产出（Tester 签署验收）
├── changelog.md               # Developer 产出
├── review-report.md           # Reviewer 产出
└── test-report.md             # Tester 产出
```

### 模块汇总（每模块 1 行）

| 模块 | 5 件套产出（目录） | 一句话模块说明 | 创建时间 | 最后更新 | 状态 |
|------|--------------------|----------------|----------|----------|------|
| — | `specs/module-XXX-<name>/` | 暂无模块产出 | — | — | — |

---

## 5. 架构决策记录（ADR）

| 文件路径 | 模块 | 类型 | 内容摘要 | 创建时间 | 最后更新 | 状态 |
|----------|------|------|----------|----------|----------|------|
| — | — | — | 暂无 ADR | — | — | — |

> ADR 文件存放于 `docs/adr/adr-XXX-<title>.md`

---

## 6. 源代码文件

> 只登记入口/非常规文件：新 Controller、新 Service、新 DDL、新配置、新 Agent。
> 常规 CRUD 文件不逐行登记，按模块聚合。

### 后端代码

| 文件路径 | 模块 | 类型 | 内容摘要 | 创建时间 | 最后更新 | 状态 |
|----------|------|------|----------|----------|----------|------|
| — | — | — | 暂无后端代码 | — | — | — |

### 前端代码

| 文件路径 | 模块 | 类型 | 内容摘要 | 创建时间 | 最后更新 | 状态 |
|----------|------|------|----------|----------|----------|------|
| — | — | — | 暂无前端代码 | — | — | — |

---

## 7. 测试代码文件

> 测试代码按模块聚合登记（模块汇总见第 4 节），不逐文件展开。

| 文件路径 | 模块 | 类型 | 内容摘要 | 创建时间 | 最后更新 | 状态 |
|----------|------|------|----------|----------|----------|------|
| — | — | — | 暂无测试代码 | — | — | — |

---

## 8. 数据库迁移文件

| 文件路径 | 模块 | 类型 | 内容摘要 | 创建时间 | 最后更新 | 状态 |
|----------|------|------|----------|----------|----------|------|
| — | — | — | 暂无迁移文件 | — | — | — |

---

## 快速查找指南

### 新 Agent 入场流程

```
1. 读 memory/project-context.md → 了解项目当前状态和进度（状态新鲜度优先）
2. 读 file-index.md（本文件） → 定位辅助：了解项目有哪些文件、在哪
3. 读 memory/agent-activity-log.md → 了解各模块各阶段最近活动（每模块 4 行）
4. 读 CLAUDE.md → 了解项目规范和编码规则
5. 读自己的角色定义文件 → 了解自己的职责
6. 开始工作
```

> **入场自检**：若发现本文件 / `agent-activity-log.md` 与 `project-context.md` 不一致（如缺 module-XXX 行），先补齐再工作，并向 team-lead 报告差异。

### 按需查找

| 我想找... | 看哪个章节 |
|----------|-----------|
| 项目规范和技术栈 | 第1节 + `CLAUDE.md` |
| 某个模块的开发计划 | 第4节 → `specs/module-XXX-<name>/plan.md` |
| 某个模块的验收标准 | 第4节 → `specs/module-XXX-<name>/acceptance-criteria.md` |
| 某个模块的代码变更 | 第4节 → `specs/module-XXX-<name>/changelog.md` |
| 审查报告 | 第4节 → `specs/module-XXX-<name>/review-report.md` |
| 测试报告 | 第4节 → `specs/module-XXX-<name>/test-report.md` |
| 架构决策记录 | 第5节 → `docs/adr/` |
| 后端源代码 | 第6节 |
| 前端源代码 | 第6节 |
| 测试代码 | 第7节 |
| 数据库迁移 | 第8节 |
| 模板文件 | 第2节 |
| 之前 Planner 做了什么 | `memory/agent-activity-log.md` → 筛选 `[PLAN]` 阶段行 |
| 之前 Developer 做了什么 | `memory/agent-activity-log.md` → 筛选 `[CODE]` 阶段行 |
| 之前 Reviewer 做了什么 | `memory/agent-activity-log.md` → 筛选 `[REVIEW]` 阶段行 |
| 之前 Tester 做了什么 | `memory/agent-activity-log.md` → 筛选 `[TEST]` 阶段行 |
| 某个模块的处理过程 | `memory/agent-activity-log.md` → 按模块编号筛选（每模块 4 行） |
| 项目当前状态 | `memory/project-context.md` |

### 文件类型速查

| 类型 | 文件位置 | 谁产出 |
|------|----------|--------|
| 规范 | `CLAUDE.md` | team-lead |
| 角色定义 | `.claude/agents/*.md` | team-lead |
| 工作流 | `.claude/workflows/*.md` | team-lead |
| 模板 | `templates/*.md` | team-lead |
| 开发计划 | `specs/module-XXX-<name>/plan.md` | Planner |
| 验收标准 | `specs/module-XXX-<name>/acceptance-criteria.md` | Planner |
| 变更日志 | `specs/module-XXX-<name>/changelog.md` | Developer |
| 审查报告 | `specs/module-XXX-<name>/review-report.md` | Reviewer |
| 测试报告 | `specs/module-XXX-<name>/test-report.md` | Tester |
| ADR | `docs/adr/adr-XXX-<title>.md` | 发现者撰写，Planner 审批 |
| 源代码 | `backend/src/` 或 `frontend/src/` | Developer |
| 测试代码 | `backend/src/test/` 或 `frontend/src/` | Tester |
| 数据库迁移 | `backend/src/main/resources/db/migration/` | Developer |
| Agent 活动日志 | `memory/agent-activity-log.md` | 各阶段执行者（每模块每阶段 1 行） |

---

> **维护规则**：本文件由所有 Agent 共同维护。
> 粒度：每模块 1 行 + 每入口/非常规文件 1 行（非逐文件登记）。
> 文件位置：`memory/file-index.md`
