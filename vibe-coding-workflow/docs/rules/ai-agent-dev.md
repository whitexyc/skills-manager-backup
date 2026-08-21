# AI / Agent 开发规范（L2 参考文档 · 触发条件：涉及 LLM 调用 / Agent 编排时）

> 本文件为按需读取的参考文档（无触发不读）。
> 源：原 CLAUDE.md §13。

## 1. LLM 调用规范

- 所有 LLM 调用统一通过 `ai_service` 或 `AiService` 封装
- Prompt 模板统一管理在 `ai/prompt/` 目录
- 每次 LLM 调用必须设置超时时间（默认 30 秒）
- 所有 LLM 响应必须记录到日志（INFO 级别，脱敏后）

## 2. Agent 编排规范

- Agent 定义使用配置文件 + 代码结合的方式
- Agent 之间的消息传递使用结构化格式
- Agent 执行链路必须有完整的追踪 ID

## 3. Function Calling / Tool 规范

- Tool 定义必须包含：名称、描述、参数 schema、返回值 schema
- Tool 执行必须有异常处理和超时机制
- Tool 调用必须记录到审计日志
