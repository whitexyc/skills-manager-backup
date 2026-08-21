# 分层架构约束（L2 参考文档 · 触发条件：设计结构时）

> 本文件为按需读取的参考文档（无触发不读）。铁律提炼见 `CLAUDE.md §0` 第 6 条。
> 源：原 CLAUDE.md §6。

## 1. 三层架构

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

## 2. 依赖规则

- **只能自上而下依赖**：Controller → Service → Repository
- **严禁反向依赖**：Repository 不能依赖 Service，Service 不能依赖 Controller
- **严禁跨层调用**：Controller 不能直接调用 Repository
- **同层服务调用**：Service 之间可以通过依赖注入互相调用，但不能形成循环依赖

## 3. 数据传输对象（DTO）约束

| 对象类型 | 使用层级 | 说明 |
|----------|----------|------|
| `RequestDTO` | Controller 接收参数 | 仅用于接口入参，包含校验注解 |
| `ResponseVO` | Controller 返回数据 | 仅用于接口出参，可脱敏处理 |
| `Entity` / `Model` | Service ↔ Repository | 数据库表映射，不可暴露给 Controller |
| `Event / Command` | Service 内部 | 跨服务传递的业务对象 |

## 4. AI 集成层约束

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
