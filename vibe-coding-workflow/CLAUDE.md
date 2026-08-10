# CLAUDE.md — Vibe Coding 闭环工作流项目规范

> 本文件是整个 Vibe Coding 工作流的核心规范文件，所有 Agent（Planner、Developer、Reviewer、Tester）必须严格遵循本文件定义的规则和流程。

## 目录

| 章节 | 标题 | 简要描述 |
|------|------|----------|
| 1 | [项目概述](#1-项目概述) | 项目背景、核心方法论与 4 Agent 角色概览 |
| 2 | [技术栈](#2-技术栈) | 技术栈配置文档机制与项目初始化确认项 |
| 3 | [目录结构规范](#3-目录结构规范) | 项目完整目录结构定义（含 memory/、templates/、.claude/） |
| 4 | [命名规范](#4-命名规范) | 各语言（Java/Python/TypeScript）文件、变量、类命名规则 |
| 5 | [接口规范（统一返回格式）](#5-接口规范统一返回格式) | API 统一响应结构、状态码、分页与错误响应格式 |
| 6 | [分层架构约束](#6-分层架构约束) | 三层架构（Controller/Service/Repository）与依赖规则 |
| 7 | [编码强制规则](#7-编码强制规则) | 注释覆盖率、异常捕获、日志输出、代码长度、安全编码 |
| 8 | [版本管理规范](#8-版本管理规范) | 语义化版本号（X.Y.Z-module-XXX）与 Git 分支策略 |
| 9 | [Vibe Coding 工作流闭环](#9-vibe-coding-工作流闭环) | 4 Agent 角色定义、闭环流程、完工终审、ADR 规则、快速审查通道 |
| 10 | [共享记忆库规范](#10-共享记忆库规范) | 项目上下文、Agent 活动日志、文件索引与新 Agent 入场流程 |
| 11 | [验收标准模板](#11-验收标准模板) | 模块验收标准的字段结构（功能/接口/代码质量/测试/文档） |
| 12 | [模块开发计划模板](#12-模块开发计划模板) | 模块 plan.md 的字段结构（元信息/需求/技术方案/依赖/风险） |
| 13 | [AI / Agent 开发规范](#13-ai--agent-开发规范) | LLM 调用、Agent 编排、Function Calling / Tool 规范 |
| 14 | [快速启动清单](#14-快速启动清单) | 新项目启动的 10 步操作清单（含环境预检） |
| 15 | [附录：常用命令](#15-附录常用命令) | 构建、测试、Git、数据库迁移、Docker 常用命令与常见环境问题排查 |

---

## 1. 项目概述

本项目基于 Claude Code Teammate Mode 搭建闭环 Vibe Coding 工作流，通过 4 个专业化 Agent 角色协同完成软件需求的完整生命周期。

### 1.1 核心方法论

| 原则 | 说明 |
|------|------|
| **规范前置** | 工程化流程先行，规则/规范定义在编码之前 |
| **分步迭代** | 每个功能模块独立拆分，逐模块交付 |
| **版本管理** | 每次变更生成唯一版本号，支持回退 |
| **模块拆分** | 单一模块默认 ≤ 200 行，特殊情况可在 plan.md 说明理由后调整 |
| **共享记忆** | 统一记忆库三文件体系（`memory/project-context.md` 状态 / `memory/file-index.md` 索引 / `memory/agent-activity-log.md` 日志）保持上下文同步；三个文件均为强制维护项，粒度与更新规则见 §10.5 |
| **验收驱动** | 每个模块定义明确的验收标准，通过后进入下一模块 |

---

## 2. 技术栈

### 2.1 技术栈配置文档

项目技术栈**不预设固定选项**，由用户在项目初始化时填写 `tech-stack.md`（模板见 `templates/tech-stack-template.md`）。

**填写方式**（二选一）：
1. 用户直接填写 `tech-stack.md` 后启动工作流
2. 启动时与 Planner 沟通确认技术栈，由 Planner 代为填写

**文档内容**：后端框架、前端框架、数据库、缓存、消息队列、ORM、AI 集成、API 文档工具、测试框架、CI/CD、部署方式，以及所有中间件及其配置参数。

**更新规则**：技术栈变更时必须更新 `tech-stack.md` 并记录 ADR。

### 2.2 项目初始化确认项

在启动首个模块前，Planner 必须确认 `tech-stack.md` 已填写完整：
- [ ] 后端框架及版本
- [ ] 数据库类型及版本
- [ ] 中间件清单及配置（缓存、消息队列等）
- [ ] 前端框架及版本
- [ ] AI 模型供应商
- [ ] CI/CD 工具
- [ ] 部署方式

---

## 3. 目录结构规范

```
vibe-coding-workflow/
├── CLAUDE.md                          # 本规范文件（所有 Agent 的入口引用）
├── README.md                          # 项目说明
├── tech-stack.md                      # 技术栈配置文档（用户填写，模板见 templates/tech-stack-template.md）
├── memory/                            # 共享记忆库
│   ├── project-context.md             # 项目上下文（状态、已完成模块、ADR）
│   ├── agent-activity-log.md          # Agent 活动日志
│   └── file-index.md                  # 项目文件索引
├── templates/                         # 模板文件目录（权威模板来源，共 8 个）
│   ├── spec-template.md               # 模块规格模板
│   ├── acceptance-criteria.md         # 验收标准模板
│   ├── review-checklist.md            # 审查清单模板
│   ├── adr-template.md                # ADR 模板
│   ├── changelog-template.md          # 变更日志模板
│   ├── test-report-template.md        # 测试报告模板
│   ├── implementation-plan-template.md # 实现计划模板
│   └── tech-stack-template.md         # 技术栈配置模板
├── .claude/                           # Agent 定义与工作流
│   ├── agents/
│   │   ├── planner.md                 # Planner（规划师）角色定义
│   │   ├── developer.md               # Developer（开发者）角色定义
│   │   ├── reviewer.md                # Reviewer（审查员）角色定义
│   │   └── tester.md                  # Tester（测试员）角色定义
│   └── workflows/
│       └── vibe-coding-loop.md        # Vibe Coding 闭环工作流
├── specs/                             # 模块开发产出（动态生成）
│   └── module-XXX-<name>/             # 每个模块独立目录
│       ├── plan.md                    # 开发计划（Planner 输出）
│       ├── acceptance-criteria.md     # 验收标准（Planner 输出）
│       ├── review-report.md           # 审查报告（Reviewer 输出）
│       ├── test-report.md             # 测试报告（Tester 输出）
│       └── changelog.md               # 变更日志
├── docs/                              # 文档目录
│   ├── adr/                           # 架构决策记录（ADR）
│   │   └── adr-XXX-<title>.md
│   ├── api/                           # API 接口文档
│   ├── requirements/                  # 需求文档（Planner 输出）
│   └── test-reports/                  # 测试报告（Tester 输出）
├── backend/                           # 后端代码（技术栈见 tech-stack.md）
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/ 或 python/
│   │   │   │   ├── controller/        # 接口层（Controller）
│   │   │   │   ├── service/           # 业务逻辑层（Service）
│   │   │   │   ├── repository/        # 数据访问层（Repository / DAO）
│   │   │   │   ├── model/             # 数据模型（Entity / DTO / VO）
│   │   │   │   ├── config/            # 配置类
│   │   │   │   ├── common/           # 公共类（异常、工具、常量）
│   │   │   │   └── ai/                # AI 集成层（Agent、Prompt、LLM 调用）
│   │   │   └── resources/             # 配置文件
│   │   │       ├── application.yml
│   │   │       └── db/migration/      # 数据库迁移脚本
│   │   └── test/                      # 测试代码
│   ├── Dockerfile
│   └── README.md
├── frontend/                          # 前端代码
│   ├── src/
│   │   ├── components/                # 通用组件
│   │   ├── pages/                     # 页面组件
│   │   ├── hooks/                     # 自定义 Hooks
│   │   ├── services/                  # API 调用层
│   │   ├── types/                     # TypeScript 类型定义
│   │   └── utils/                     # 工具函数
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml                 # 容器编排
├── Makefile                           # 常用命令快捷方式
└── .gitignore
```

---

## 4. 命名规范

### 4.1 通用规则

| 类别 | 规范 | 示例 |
|------|------|------|
| 文件命名 | Python: `snake_case`，TypeScript: `camelCase` | `user_service.py`、`userController.ts` |
| 目录命名 | `snake_case` 或 `kebab-case` | `module-001-user-auth/`、`src/common/` |
| Git 分支 | `feature/module-XXX-brief-desc` | `feature/module-001-user-register` |
| Git 提交信息 | `[类型] 模块-XXX: 简要描述` | `[feat] module-001: 实现用户注册接口` |

### 4.2 Java 命名规范

| 类别 | 规范 | 示例 |
|------|------|------|
| 类名 | `PascalCase` | `UserController`、`UserService` |
| 方法名 | `camelCase` | `createUser()`、`findByEmail()` |
| 变量名 | `camelCase` | `userName`、`isActive` |
| 常量 | `UPPER_SNAKE_CASE` | `MAX_RETRY_COUNT`、`API_VERSION` |
| 包名 | 全小写，点分隔 | `com.project.controller` |
| 数据库表名 | `snake_case` | `user_profiles`、`order_items` |
| 数据库字段名 | `snake_case` | `created_at`、`updated_by` |

### 4.3 Python 命名规范

| 类别 | 规范 | 示例 |
|------|------|------|
| 类名 | `PascalCase` | `UserService`、`UserRepository` |
| 函数/方法名 | `snake_case` | `create_user()`、`find_by_email()` |
| 变量名 | `snake_case` | `user_name`、`is_active` |
| 常量 | `UPPER_SNAKE_CASE` | `MAX_RETRY_COUNT`、`API_VERSION` |
| 模块名 | `snake_case` | `user_service.py`、`auth_utils.py` |

### 4.4 TypeScript / React 命名规范

| 类别 | 规范 | 示例 |
|------|------|------|
| 组件文件 | `PascalCase.tsx` | `UserProfile.tsx`、`LoginForm.tsx` |
| 工具/服务文件 | `camelCase.ts` | `apiClient.ts`、`userService.ts` |
| 接口/类型 | `PascalCase`，不使用 `I` 前缀（遵循现代 TypeScript 规范） | `User`、`UserService` |
| 变量/函数 | `camelCase` | `userName`、`handleSubmit()` |
| CSS 类名 | `kebab-case` 或 BEM | `user-profile__avatar--active` |

### 4.5 API 端点命名

| 类别 | 规范 | 示例 |
|------|------|------|
| 路径 | `kebab-case`，名词复数 | `/api/v1/user-profiles` |
| 查询参数 | `snake_case` | `?page_size=20&order_by=created_at` |
| 请求/响应体字段 | `snake_case` | `{ "user_name": "张三", "created_at": "..." }` |

---

## 5. 接口规范（统一返回格式）

### 5.1 统一响应结构

所有 API 接口必须遵循统一返回格式：

```json
{
  "code": 0,
  "msg": "success",
  "data": {},
  "timestamp": 1690000000000,
  "request_id": "uuid-v4"
}
```

### 5.2 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `code` | `int` | 是 | 状态码：`0` 表示成功，非 `0` 表示失败 |
| `msg` | `string` | 是 | 状态描述信息 |
| `data` | `object / array / null` | 否 | 响应数据，成功时返回 |
| `timestamp` | `long` | 是 | 服务器时间戳（毫秒） |
| `request_id` | `string` | 是 | 请求追踪 ID，用于日志关联 |

### 5.3 状态码规范

| code | 含义 | 说明 |
|------|------|------|
| `0` | 成功 | 请求处理成功 |
| `400` | 参数错误 | 请求参数校验失败 |
| `401` | 未认证 | 用户未登录或 Token 过期 |
| `403` | 无权限 | 用户无此操作权限 |
| `404` | 资源不存在 | 请求的资源未找到 |
| `409` | 冲突 | 资源状态冲突（如重复创建） |
| `500` | 服务器错误 | 服务端内部异常 |
| `503` | 服务不可用 | 依赖服务不可用（如 AI API 超时） |

> **业务错误码**：HTTP 状态码不够细分时，可在 `data` 中增加 `biz_code` 字段携带业务错误码。建议按模块分段：
>
> | 段位 | 模块 | 示例 |
> |------|------|------|
> | 1xxx | 用户模块 | `1001`=用户名已存在，`1002`=密码强度不足 |
> | 2xxx | 订单模块 | `2001`=库存不足，`2002`=订单状态非法 |
> | 3xxx | 支付模块 | `3001`=余额不足，`3002`=重复支付 |
> | 9xxx | 通用业务 | `9001`=限流，`9002`=操作过于频繁 |

### 5.4 分页响应结构

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total": 100,
      "total_pages": 5
    }
  },
  "timestamp": 1690000000000,
  "request_id": "uuid-v4"
}
```

### 5.5 错误响应结构

```json
{
  "code": 400,
  "msg": "用户名不能为空",
  "data": {
    "field": "user_name",
    "reason": "required_field_missing"
  },
  "timestamp": 1690000000000,
  "request_id": "uuid-v4"
}
```

---

## 6. 分层架构约束

### 6.1 三层架构

```
┌─────────────────────────────────────────┐
│            接口层（Controller）           │
│  - 参数校验、格式转换                     │
│  - 调用业务层、返回统一格式               │
│  - 不包含业务逻辑                         │
├─────────────────────────────────────────┤
│         业务逻辑层（Service）              │
│  - 核心业务逻辑                           │
│  - 事务管理                               │
│  - 调用数据层和外部服务                    │
│  - 不直接处理 HTTP 请求/响应              │
├─────────────────────────────────────────┤
│       数据访问层（Repository / DAO）       │
│  - 数据库 CRUD 操作                      │
│  - 不包含业务逻辑                         │
│  - 不处理事务（事务交由业务层管理）         │
└─────────────────────────────────────────┘
```

### 6.2 依赖规则

- **只能自上而下依赖**：Controller → Service → Repository
- **严禁反向依赖**：Repository 不能依赖 Service，Service 不能依赖 Controller
- **严禁跨层调用**：Controller 不能直接调用 Repository
- **同层服务调用**：Service 之间可以通过依赖注入互相调用，但不能形成循环依赖

### 6.3 数据传输对象（DTO）约束

| 对象类型 | 使用层级 | 说明 |
|----------|----------|------|
| `RequestDTO` | Controller 接收参数 | 仅用于接口入参，包含校验注解 |
| `ResponseVO` | Controller 返回数据 | 仅用于接口出参，可脱敏处理 |
| `Entity` / `Model` | Service ↔ Repository | 数据库表映射，不可暴露给 Controller |
| `Event / Command` | Service 内部 | 跨服务传递的业务对象 |

### 6.4 AI 集成层约束

AI 相关代码统一放置在 `src/main/ai/` 或 `src/ai/` 目录下：

```
ai/
├── agent/          # Agent 定义与编排
├── prompt/         # Prompt 模板管理
├── llm/            # LLM 调用封装（OpenAI / Claude / 本地模型）
├── memory/         # 记忆/上下文管理
├── tool/           # Tool / Function Calling 定义
└── config/         # AI 相关配置
```

---

## 7. 编码强制规则

### 7.1 注释覆盖率

- **所有 public 方法必须有 Javadoc / Docstring 注释**
- **复杂业务逻辑（≥10 行）必须添加行内注释**
- **魔法数字必须定义常量并添加注释**
- **TODO / FIXME / HACK 标记必须附带 JIRA 编号或说明**

```java
/**
 * 用户注册
 *
 * @param request 注册请求参数，包含用户名、密码、邮箱
 * @return 注册成功的用户信息
 * @throws DuplicateUserException 用户名或邮箱已存在
 */
public UserVO register(RegisterRequest request) {
    // 密码加密：使用 BCrypt，盐值轮数为 12
    String encodedPassword = passwordEncoder.encode(request.getPassword());
    // ...
}
```

### 7.2 异常捕获

- **严禁吞掉异常（空 catch 块）**
- **严禁在 Controller 层捕获异常后不做处理**
- **所有业务异常必须继承统一的 `BusinessException`**
- **全局异常处理器必须记录完整的堆栈信息到日志**

```java
// 正确示例
try {
    aiService.generateResponse(prompt);
} catch (AIServiceException e) {
    log.error("AI 服务调用失败, request_id: {}, prompt: {}", requestId, prompt, e);
    throw new BusinessException(ErrorCode.AI_SERVICE_UNAVAILABLE, "AI 服务暂不可用，请稍后重试", e);
}
```

```python
# 正确示例
try:
    result = await ai_service.generate_response(prompt)
except AIServiceError as e:
    logger.error(f"AI 服务调用失败, request_id={request_id}, prompt={prompt[:100]}", exc_info=True)
    raise BusinessException(ErrorCode.AI_SERVICE_UNAVAILABLE, "AI 服务暂不可用，请稍后重试") from e
```

### 7.3 日志输出

| 日志级别 | 使用场景 | 示例 |
|----------|----------|------|
| `ERROR` | 系统错误、需要人工介入 | 数据库连接失败、AI API 超时 |
| `WARN` | 可恢复的异常、降级处理 | 缓存未命中、重试成功 |
| `INFO` | 关键业务流程节点 | 用户注册成功、模块开发完成 |
| `DEBUG` | 调试详细信息 | SQL 参数绑定、方法入参出参 |
| `TRACE` | 极细粒度追踪 | 循环内变量值 |

**强制要求**：
- 每个关键业务操作必须有 `INFO` 级别日志（入参摘要 + 结果 + 耗时）
- 异常日志必须包含完整 `request_id` 用于追踪链路
- 生产环境禁止输出用户敏感信息（密码、手机号、身份证号等）

### 7.4 代码长度限制

| 维度 | 默认上限 | 说明 |
|------|----------|------|
| 单个方法/函数 | ≤ 50 行 | 超过则必须拆分；特殊情况（如长 switch、配置初始化）可在 plan.md 说明理由后放宽 |
| 单个类/模块 | ≤ 500 行 | 超过则考虑按职责拆分；特殊情况可在 plan.md 说明理由后放宽 |
| 单个模块（module） | ≤ 200 行新增代码 | Vibe Coding 单次迭代默认上限；复杂模块可在 plan.md 中申请调整并说明理由。**口径**：只统计生产代码新增行，docstring/注释/测试代码单列统计且默认豁免（Tester 产出不占模块行数上限） |

### 7.5 安全编码规范

- [ ] **SQL 注入防护**：使用参数化查询，严禁字符串拼接 SQL
- [ ] **XSS 防护**：用户输入输出时转义 HTML 特殊字符
- [ ] **CSRF 防护**：所有状态变更请求必须验证 Token
- [ ] **密码安全**：使用 BCrypt / Argon2，禁止明文存储
- [ ] **API Key 安全**：敏感配置使用环境变量或密钥管理服务，禁止硬编码
- [ ] **依赖安全**：定期检查 `npm audit` / `pip audit` / OWASP Dependency-Check

---

## 8. 版本管理规范

### 8.1 语义化版本号

```
主版本号.次版本号.修订号 - 模块编号
例：1.2.0-module-003
```

| 数字 | 递增条件 |
|------|----------|
| 主版本号 | 不兼容的 API 变更、架构升级 |
| 次版本号 | 新增向下兼容的功能 |
| 修订号 | Bug 修复、向下兼容的改动 |

### 8.2 Git 分支策略

```
main                        # 稳定主分支
├── develop                 # 开发分支
│   ├── feature/module-001  # 功能分支（每个模块一个分支）
│   │   ├── fix/module-001  # 修复分支
│   │   └── ...
│   └── feature/module-002
└── release/v1.0.0          # 发布分支
```

### 8.3 提交信息规范

```
[类型] 模块-XXX: 简短描述

详细描述（可选）

关联: #issue-number
```

**类型标签**：
- `[feat]` — 新功能
- `[fix]` — Bug 修复
- `[refactor]` — 重构
- `[docs]` — 文档
- `[test]` — 测试
- `[chore]` — 构建/工具

---

## 9. Vibe Coding 工作流闭环

### 9.1 Agent 角色定义与扩展

#### 基础角色（4 个固定角色）

每个角色至少 1 个 Agent 实例。

| 角色 | 职责 |
|------|------|
| Planner（规划师） | 需求分析与任务拆解（固定 1 个） |
| Developer（开发者） | 编码实现 |
| Reviewer（审查员） | 代码审查 |
| Tester（测试员） | 测试与验收 |

#### 按需扩展（Planner 决定）

**Planner 可根据模块复杂度决定为同一角色启动多个 Agent 实例**，例如：

| 场景 | 扩展方式 |
|------|----------|
| 全栈模块（前后端分离） | Developer-Frontend + Developer-Backend |
| 多语言/多服务模块 | Developer-ServiceA + Developer-ServiceB |
| 独立审查视角 | Reviewer-Frontend + Reviewer-Backend（分别审查不同端） |
| 多端测试 | Tester-Unit + Tester-E2E |

**扩展规则**：
- 由 Planner 在 plan.md 中明确每个模块由哪些 Agent 实例负责
- 同名角色的多个 Agent 独立工作，通过 SendMessage 向 Planner 汇报
- Reviewer 发现跨 Agent 不一致时通知 Planner 协调
- 所有 Agent 实例共享 `memory/project-context.md`

#### Planner（规划师）

**角色定位**：需求分析与任务拆解

**核心职责**：
1. 接收用户原始需求，进行需求澄清与确认
2. 将需求拆解为可独立开发的模块（每个模块默认 ≤ 200 行代码，特殊情况可在 plan.md 中说明理由后调整）
3. 定义每个模块的验收标准（Acceptance Criteria）
4. 输出模块开发计划文档 `specs/module-XXX-<name>/plan.md`
5. 维护 `memory/project-context.md` 中的待办事项和迭代状态
6. 处理需求变更，更新开发计划
7. 发起 ADR（架构决策记录）——**ADR 责任规则见第 9.5 节**

**输出物**：
- `specs/module-XXX-<name>/plan.md` — 开发计划（含验收标准）
- `docs/adr/adr-XXX-<title>.md` — 架构决策记录（按需）
- 更新 `memory/project-context.md` — 维护项目状态

**工作流程**：
```
用户需求 → Planner 分析 → 需求确认 → 模块拆分 → 定义验收标准 → 输出 plan.md → 通知 Developer
```

---

#### Developer（开发者）

**角色定位**：代码实现与模块交付

**核心职责**：
1. 严格按照 Planner 输出的 `plan.md` 进行代码实现
2. 遵循本文件中的命名规范、接口规范、分层约束
3. 每个模块独立开发，完成后生成版本记录
4. 主动引用 `memory/project-context.md` 获取项目上下文
5. 遇到阻塞问题（如依赖未就绪）立即反馈
6. 开发失败时分析原因并修复（最多重试 3 次）
7. 开发完成后通知 Reviewer 进行审查

**输出物**：
- 模块源代码（Controller + Service + Repository + 测试骨架）
- `specs/module-XXX-<name>/changelog.md` — 变更日志
- 数据库迁移脚本（如有）

**编码规范**：
- 每天多轮 review 代替整块代码交付
- 优先实现核心路径，异常处理逐步补齐
- 代码提交前必须通过本地编译

**工作流程**：
```
接收 plan.md → 获取上下文（memory/project-context.md）→ 编码实现 → 自测通过 → 更新 changelog → 通知 Reviewer
```

---

#### Reviewer（审查员）

**角色定位**：质量把关与架构一致性

**核心职责**：
1. 审查 Developer 提交的代码是否符合 CLAUDE.md 规范
2. 检查代码与 `plan.md` 验收标准的一致性
3. 验证架构约束（分层隔离、依赖方向）
4. 检查安全编码规范（SQL 注入、XSS、密码安全）
5. 审查过程中如发现架构变更，无论通过与否都应记录 ADR
6. 审查不通过时指出具体问题，要求 Developer 修复
7. 审查通过后通知 Tester 进入测试阶段

**审查检查清单**：
审查清单模板文件位于 `templates/review-checklist.md`，以下为结构概要（完整清单请参考该文件）：
- 命名规范检查（snake_case / camelCase）
- 接口返回格式检查（统一结构）
- 分层架构检查（Controller / Service / Repository）
- 依赖方向检查（无跨层调用、无反向依赖）
- 异常处理检查（无空 catch）
- 日志记录检查
- 安全性检查（SQL 注入、XSS、CSRF、密码安全）
- 代码长度限制检查

**输出物**：
- `specs/module-XXX-<name>/review-report.md` — 审查报告
- `docs/adr/adr-XXX-<title>.md` — 架构决策记录（如有架构变更）

**工作流程**：
```
接收代码提交 → 执行审查检查清单 → 通过：记录审查报告 → 通知 Tester
                                    不通过：记录问题 → 通知 Developer 修复
```

---

#### Tester（测试员）

**角色定位**：测试用例编写与验收

**核心职责**：
1. 根据 `plan.md` 中的验收标准编写测试用例
2. 编写单元测试（默认覆盖率 ≥ 80%，可按模块情况调整）和集成测试
3. 运行回归测试，确保已有功能不被破坏
4. 生成测试报告，明确通过/失败的验收项
5. 测试失败时输出详细失败信息，通知 Developer 修复
6. 异常场景兜底：网络超时、AI API 异常、数据库故障
7. 测试全部通过后标记模块为完成
8. **真实环境冒烟（强制前置）**：对含 DB/外部依赖交互的模块，测试通过前必须用真实 DB（或真实依赖）跑一次冒烟，至少覆盖验收标准核心路径，作为测试通过的强制前置
9. **环境性失败归因（强制）**：测试报告须区分「环境问题导致的失败/跳过（依赖缺失、未 mock、collection 失败）」与「真实回归」；前者修环境或测试，后者才通知 Developer 修复

**测试类型**：
| 类型 | 默认覆盖率要求 | 说明 |
|------|----------------|------|
| 单元测试 | ≥ 80% | Service 层和工具类；核心业务逻辑建议提高，非核心工具类可降低（需在 plan.md 说明） |
| 集成测试 | ≥ 60% | Controller 层和数据库交互；特殊情况可调整 |
| 回归测试 | 100% | 已有测试不得失败（硬性要求，不可调整） |

**输出物**：
- `specs/module-XXX-<name>/test-report.md` — 测试报告
- 测试代码文件（`*Test.java` / `*_test.py`）

**工作流程**：
```
接收审查通过通知 → 编写测试用例 → 运行单元测试 → 运行集成测试 → 运行回归测试
  → 全部通过：标记模块完成 → 更新 memory/project-context.md
  → 有失败：输出失败详情 → 通知 Developer 修复
```

#### 完工终审（Post-Completion Review）

当所有模块开发、审查、测试全部完成后，**必须启动一个独立的审查 Agent** 进行最终验证。此 Agent 不是 Reviewer（审查员）角色的复用，而是针对"全项目完工"的专项审查。

**触发条件**：
- Tester 完成最后一个模块的测试
- project-context.md 中所有模块状态均为"已完成"

**审查内容**：
1. 全项目文档一致性验证（所有 plan.md / changelog.md / review-report.md / test-report.md 交叉比对）
2. 技术栈配置与实际代码一致性（对比 `tech-stack.md` 与实际依赖版本）
3. 全部 ADR 链完整性（决策是否都有记录、是否有遗漏的架构变更）
4. 最终安全审计（全量代码，而非仅单个模块的增量审查）
5. 已知技术债务清单汇总

**输出物**：
- `REVIEW-FINAL.md` — 项目完工终审报告，含最终评分和遗留问题清单

**审查标准**：与 Reviewer 相同——每个问题必须有根因分析 + 修复示例，禁止留钩子。

---
### 9.2 闭环流程

```
                        ┌─────────┐
                        │  用户   │
                        │  需求   │
                        └────┬────┘
                             ▼
                   ┌──────────────────┐
                   │     Planner      │
                   │  需求拆解 & 计划  │
                   │ 记忆:待办更新     │
                   └────────┬─────────┘
                            │ plan.md + 验收标准
                            ▼
                   ┌──────────────────┐
           ┌───────│    Developer     │◄──────────────┐
           │       │   编码实现        │               │
           │       │ 记忆:状态流转+    │               │
           │       │ file-index+日志   │               │
           │       └────────┬─────────┘               │
           │                │ 代码提交                 │
           │                ▼                          │
           │       ┌──────────────────┐               │
           │       │    Reviewer      │───不通过───────┘
           │       │   代码审查        │
           │       │ 记忆:审查结论+日志 │
           │       └────────┬─────────┘
           │                │ 审查通过
           │                ▼
           │       ┌──────────────────┐
           └───────│     Tester       │
          不通过   │   测试 & 验收      │
                   │ 记忆:完成+日志     │
                   └────────┬─────────┘
                            │ 测试通过
                            ▼
                   ┌──────────────────┐
                   │  模块完成         │
                   │  更新上下文记忆    │
                   │  进入下一模块      │
                   └────────┬─────────┘
                            │ 全部模块完成
                            ▼
                   ┌──────────────────┐
                   │  Final Reviewer  │
                   │  完工终审         │
                   │  (独立Agent启动)  │
                   └────────┬─────────┘
                            │ REVIEW-FINAL.md
                            ▼
                   ┌──────────────────┐
                   │  项目交付 ✅      │
                   └──────────────────┘
```

**进入下一模块的前置检查**：`specs` 5 件套（`plan.md` / `acceptance-criteria.md` / `review-report.md` / `test-report.md` / `changelog.md`）+ 记忆三文件（`project-context.md` / `file-index.md` / `agent-activity-log.md`）均已更新。

### 9.3 回退与重试机制

1. **Developer 失败**：最多重试 3 次，超过则回退到 Planner 重新评估方案
2. **Reviewer 不通过**：Developer 修复后重新提交，最多 3 轮
3. **Tester 失败**：Developer 修复（不限次数），但每次修复后需 Reviewer 快速确认
4. **模块阻塞**：如果连续 3 次无法通过，将该模块标记为 `blocked`，Planner 重新拆解
5. **重试上限可申请放宽**：存在进展证据时（已复现根因 / 已缩小范围 / 已有复现测试），当前执行者可向 Planner / team-lead 申请放宽重试上限（如 3→8），批准后在 `agent-activity-log` 记录 `[ESCALATE]` 标签

> **定时检查**：Agent 卡住/超时的定时检查与介入处置见工作流 `vibe-coding-loop.md` §5.0。

### 9.4 快速审查通道

Tester 测试失败 → Developer 修复后，不需走完整 Review 流程，Reviewer 快速确认修复范围。

**适用条件**：修复变更 ≤ 50 行
**退出条件**：

| 退出条件 | 结果 | 后续动作 |
|----------|------|----------|
| 修复变更通过 + 回归测试通过 | ✅ 快速审查通过 | 通知 Tester 重新运行失败测试 |
| 修复变更有问题 / 回归测试失败 | ❌ 快速审查不通过 | 回退到完整 Review 流程 |
| 快速审查连续 2 次不通过 | 🚫 升级为完整审查 | 通知 team-lead |
| 修复变更超过 50 行 | ⚠️ 自动升级为完整审查 | 走正常 Review 流程 |

### 9.5 ADR 责任规则

**核心原则**：ADR 由**发现者**发起撰写，由 Planner 审批决策。

| 触发场景 | 谁发现 | 谁写 ADR | 谁审批 | 审批后动作 |
|----------|--------|----------|--------|-----------|
| 技术选型决策（选 PostgreSQL、选 FastAPI 等） | Planner | Planner | 用户/team-lead | 更新 project-context.md ADR 索引 |
| 开发中发现架构需要调整 | Developer | Developer | Planner | 通知 Planner 审批，等待确认后继续 |
| 审查中发现架构变更 | Reviewer | Reviewer | Planner | 在 review-report.md 中标注，Planner 审批后更新 |
| 测试中发现架构问题 | Tester | Tester | Planner | 在 test-report.md 中标注，通知 Planner |

**ADR 流程**：
```
发现者撰写 ADR → 提交 docs/adr/adr-XXX-<title>.md → 通知 Planner 审批
→ Planner 审批（accepted / rejected / needs-discussion）
→ 审批通过 → 更新 project-context.md ADR 索引
→ 审批不通过 → 标记为 deprecated，记录原因
```

---

## 10. 共享记忆库规范

### 10.1 `memory/project-context.md` 结构

所有 Agent 共享使用 `memory/project-context.md` 文件，文件位于 `memory/` 目录下。该文件是项目唯一的共享上下文入口。

```markdown
# 项目上下文记忆库

## 1. 项目概述
- 项目名称: <项目名>
- 项目简介: <一句话描述>
- 创建时间: YYYY-MM-DD
- 最后更新: YYYY-MM-DD HH:mm

## 2. 技术栈
> 详见 `tech-stack.md`，此处仅保留摘要。
- 后端: <见 tech-stack.md>
- 前端: <见 tech-stack.md>
- 数据库: <见 tech-stack.md>
- 中间件: <见 tech-stack.md>
- AI 供应商: <见 tech-stack.md>
- 部署: Docker Compose

## 3. 已完成模块清单
| 模块编号 | 模块名称 | 版本号 | 完成时间 | 状态 |
|----------|----------|--------|----------|------|
| module-001 | 用户注册 | 1.0.0-module-001 | 2026-XX-XX | ✅ |
| module-002 | 用户登录 | 1.0.0-module-002 | 2026-XX-XX | ✅ |

## 4. 架构决策记录（ADR）索引
| ADR 编号 | 决策标题 | 状态 | 日期 |
|----------|----------|------|------|
| adr-001 | 选择 PostgreSQL 作为主数据库 | 已采纳 | 2026-XX-XX |
| adr-002 | 选择 OpenAI 作为默认 AI 供应商 | 已采纳 | 2026-XX-XX |

## 5. 当前迭代状态
- 当前迭代版本: v1.0.0
- 正在进行的模块: module-003（用户权限管理）
- 下一个待开发模块: module-004（AI Agent 对话）

## 6. 待办事项
- [ ] module-003: 用户权限管理 → 分配给 Developer
- [ ] module-004: AI Agent 对话 → 待 Planner 输出计划

## 7. 关键技术决策记录
- 所有 API 返回格式统一为 {code, msg, data, timestamp, request_id}
- 使用 JWT 进行用户认证
- 前端使用 React + TypeScript + Vite
- AI 调用统一通过 ai_service 封装，支持供应商切换
```

### 10.2 Agent 活动日志（每模块每阶段 1 行）

**文件**：`memory/agent-activity-log.md`（活动记录单表，不按 Agent / 按天拆分文件）

**设计原则**：
- **每模块每阶段 1 行**：活动记录精简为单表，每模块 4 行（PLAN/CODE/REVIEW/TEST 交接各 1 行）
- 历史记录不删除、不修改；如需更正，追加一条 `[CORRECT]` 记录

**活动记录表格式**：

```
| 时间 | 模块 | 阶段 | 执行者 | 动作标签 | 产出文件 | 状态 |
|------|------|------|--------|----------|----------|------|
```

**动作类型标签**：`[PLAN]` `[CLARIFY]` `[CODE]` `[FIX]` `[BUILD]` `[REVIEW]` `[ADR]` `[TEST]` `[REGRESSION]` `[BLOCKED]` `[UNBLOCKED]` `[HANDOFF]` `[CONTEXT]` `[CORRECT]` `[ESCALATE]`

> 如保留 `memory/logs/` 目录，则改为每模块一个文件 `memory/logs/module-XXX.md`。

### 10.3 项目文件索引（file-index.md）

文件位置：`memory/file-index.md`

本文件是项目的动态索引表，**按分类汇总式粒度**登记项目文件。文件头写明粒度规则：**每模块 1 行 + 每入口文件 1 行，非逐文件**。新 Agent 入场时**先读此文件快速定位需要的文件**。

**维护规则**：
- **模块层**：每个 `specs/module-XXX-<name>/` 只占 1 行（5 件套产出 + 一句话模块说明）
- **源码层**：只登记入口/非常规文件（新 Controller、新 Service、新 DDL、新配置、新 Agent），常规 CRUD 文件不逐行登记
- **ADR / 测试**：按模块聚合登记
- 文件被删除时，标记状态为「🗑️ 已废弃」但不删除索引行
- 格式：`| 文件路径 | 模块 | 类型 | 内容摘要 | 创建时间 | 最后更新 | 状态 |`

### 10.4 新 Agent 入场阅读顺序

新 Agent 加入团队时，按以下顺序阅读文件（**状态新鲜度优先**）：

```
1. memory/project-context.md    → 了解项目当前状态和进度（入场必读第一位）
2. memory/file-index.md         → 定位辅助：了解项目有哪些文件、在哪
3. memory/agent-activity-log.md → 了解之前每个 Agent 做了什么
4. CLAUDE.md                    → 了解项目规范和编码规则
5. .claude/agents/<自己的角色>.md → 了解自己的职责
6. .claude/workflows/vibe-coding-loop.md → 了解工作流流程
```

**入场自检**：新 Agent 发现 `file-index.md` / `agent-activity-log.md` 与 `project-context.md` 不一致（如缺 module-XXX 行）时，先补齐再工作，并向 team-lead 报告差异。

### 10.5 记忆库更新规则

记忆库三文件均为**强制维护项**，按分层规则更新：

**① 强制项（每模块必做，阶段退出前置）**

| 文件 | 粒度 | 更新人 |
|------|------|--------|
| `memory/project-context.md` | 模块状态流转（待办→开发中→待审查→已完成）+ 待办更新 | 各阶段执行者 |
| `memory/file-index.md` | 每模块 1 行汇总 + 新增入口/非常规文件 1 行 | 各阶段执行者 |
| `memory/agent-activity-log.md` | 每阶段交接 1 行（每模块 4 行：PLAN/CODE/REVIEW/TEST） | 各阶段执行者 |

**② 按需项**

| 触发事件 | 更新内容 |
|----------|----------|
| 产生 / 审批 ADR | project-context.md ADR 索引更新 |
| 关键技术决策 | project-context.md 关键技术决策记录 |
| 模块阻塞 / 解除阻塞 | agent-activity-log.md 追加 `[BLOCKED]` / `[UNBLOCKED]` 记录 |

**③ 可选 / 批处理项**：日统计、工作量周报、归档（不阻塞流程）。

> **强制条款**：任一阶段退出前必须完成本阶段强制记忆库写入，交接 SendMessage 中附「已更新记忆库文件清单」，否则下一阶段不得启动。

---

## 11. 验收标准模板

每个模块的 `acceptance-criteria.md` 必须遵循 `templates/acceptance-criteria.md` 模板。模板核心结构见本节，详细模板见 `templates/acceptance-criteria.md`：

1. **功能验收** — 核心功能、边界条件、异常场景
2. **接口验收** — 返回格式、错误处理、端点命名
3. **代码质量验收** — 注释覆盖率、命名规范、分层架构、代码长度、编译检查
4. **测试验收** — 单元测试（默认 ≥ 80%，可调整）、集成测试（默认 ≥ 60%，可调整）、回归测试（100%，不可调整）
5. **文档验收** — 变更记录、接口文档、设计说明
6. **验收执行结果** — 分项统计、失败详情、验收结论（通过/不通过/有条件通过）

---

## 12. 模块开发计划模板

每个模块的 `plan.md` 必须遵循 `templates/spec-template.md` 模板。模板核心结构见本节，详细模板见 `templates/spec-template.md`：

0. **Agent 配置清单** — 本模块由哪些 Agent 实例负责（例如 Developer-Frontend + Developer-Backend）
1. **模块元信息** — 模块编号（module-XXX）、名称、版本号、优先级、预估代码量（默认 ≤ 200 行，可调整）
2. **需求描述** — 需求来源、用户故事、验收场景（BDD 格式）、非功能需求
3. **技术方案** — 涉及文件、数据库变更（DDL）、API 接口定义、业务逻辑说明、异常处理
4. **验收标准** — 引用同目录下的 `acceptance-criteria.md`，含可运行的验证命令
5. **依赖关系** — 上游依赖（已完成模块）、下游依赖（待开发模块）、外部服务依赖
6. **风险点与注意事项** — 已知风险及缓解措施、技术注意事项、开发建议
7. **变更记录** — 版本、日期、变更内容、变更人
8. **审批记录** — Planner / Reviewer / Tester 审批状态

---

## 13. AI / Agent 开发规范

### 13.1 LLM 调用规范

- 所有 LLM 调用统一通过 `ai_service` 或 `AiService` 封装
- Prompt 模板统一管理在 `ai/prompt/` 目录
- 每次 LLM 调用必须设置超时时间（默认 30 秒）
- 所有 LLM 响应必须记录到日志（INFO 级别，脱敏后）

### 13.2 Agent 编排规范

- Agent 定义使用配置文件 + 代码结合的方式
- Agent 之间的消息传递使用结构化格式
- Agent 执行链路必须有完整的追踪 ID

### 13.3 Function Calling / Tool 规范

- Tool 定义必须包含：名称、描述、参数 schema、返回值 schema
- Tool 执行必须有异常处理和超时机制
- Tool 调用必须记录到审计日志

---

## 14. 快速启动清单

新项目启动时，Planner 需按顺序完成以下步骤：

- [ ] 1. 确认 `tech-stack.md` 已填写完整（技术栈、中间件及配置）
- [ ] 2. **校验子代理模型可用性**：确认 `CLAUDE_CODE_SUBAGENT_MODEL` 指向可用模型（必要时在 `.claude/settings.json` 的 `env` 块覆盖），启动 1 个子代理做冒烟验证（应正常返回而非 400）
- [ ] 3. **配置基线权限 allow 白名单**：检查 `.claude/settings.json` 是否已配置权限 allow 白名单（建议如 `PowerShell(git*|python*|pip*|uv*|make*|npm*)` + `Write(*.md|*.py)`），避免 auto 模式依赖 LLM 分类器导致命令被拦
- [ ] 4. 初始化项目目录结构
- [ ] 5. 创建 `CLAUDE.md`（本文件副本或引用）
- [ ] 6. 创建 `memory/project-context.md` 模板并填入初始信息
- [ ] 7. 初始化 Git 仓库，创建 `main` / `develop` 分支
- [ ] 8. 配置 CI/CD 流水线
- [ ] 9. 输出第一个模块（module-001）的 `plan.md` 和 `acceptance-criteria.md`
- [ ] 10. 通知 Developer 开始开发

---

## 15. 附录：常用命令

### 15.1 常见环境问题排查

> 常见环境问题排查（子代理模型 400 / 权限拦截 / async 用例未收集 / Windows 原生依赖 / mock 掩盖真实缺陷）→ 见 [environment-troubleshooting.md](environment-troubleshooting.md)。

```bash
# 项目构建
make build          # 构建项目
make test           # 运行测试
make lint           # 代码检查

# Git 操作
git checkout -b feature/module-XXX-brief    # 创建功能分支
git commit -m "[feat] module-XXX: 描述"     # 提交代码
git push origin feature/module-XXX-brief    # 推送分支

# 数据库迁移（Java / Flyway）
./gradlew flywayMigrate
# 或（Python / Alembic）
alembic upgrade head

# Docker
docker-compose up -d          # 启动所有服务
docker-compose logs -f app    # 查看应用日志
```
