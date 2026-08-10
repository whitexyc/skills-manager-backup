# 技术栈配置文档

> **使用说明**：项目初始化时填写此文档。可由用户直接填写，或与 Planner 沟通后由 Planner 代为填写。
> 技术栈变更时必须更新此文档并记录 ADR。
> 模板文件：`templates/tech-stack-template.md`

---

## 1. 项目信息

- **项目名称**：<项目名>
- **项目简介**：<一句话描述>
- **创建时间**：YYYY-MM-DD
- **最后更新**：YYYY-MM-DD HH:mm

---

## 2. 后端技术栈

| 维度 | 选型 | 版本 | 配置说明 |
|------|------|------|----------|
| 语言 | <如 Java / Python / Go / Node.js> | <版本> | |
| 框架 | <如 Spring Boot / FastAPI / Gin / Express> | <版本> | |
| ORM / 数据访问 | <如 MyBatis-Plus / SQLAlchemy / GORM / Prisma> | <版本> | |
| API 文档工具 | <如 SpringDoc OpenAPI / FastAPI 内置 / Swagger> | <版本> | |

### 后端中间件配置

| 中间件 | 用途 | 版本 | 配置参数 |
|--------|------|------|----------|
| <如 Redis> | <缓存> | <7.0> | <maxmemory=2gb, eviction=allkeys-lru> |
| <如 RabbitMQ> | <消息队列> | <3.12> | <prefetch_count=50> |
| <如 Kafka> | | | |
| | | | |

---

## 3. 前端技术栈

| 维度 | 选型 | 版本 | 配置说明 |
|------|------|------|----------|
| 框架 | <如 React / Vue / Svelte> | <版本> | |
| 语言 | <如 TypeScript> | <版本> | |
| 构建工具 | <如 Vite / Webpack> | <版本> | |
| UI 组件库 | <如 Ant Design / Material UI> | <版本> | |
| 状态管理 | <如 Zustand / Redux / Pinia> | <版本> | |
| HTTP 客户端 | <如 Axios / fetch> | <版本> | |

---

## 4. 数据库

| 维度 | 选型 | 版本 | 配置说明 |
|------|------|------|----------|
| 主数据库 | <如 PostgreSQL / MySQL / MongoDB> | <版本> | <连接池、字符集等> |
| 数据库迁移工具 | <如 Flyway / Alembic / Prisma Migrate> | <版本> | |

### 数据库连接配置

```
# 示例格式，按实际技术栈填写
DB_HOST=<host>
DB_PORT=<port>
DB_NAME=<database>
DB_USER=<username>
DB_POOL_SIZE=<pool_size>
```

---

## 5. AI 集成

| 维度 | 选型 | 配置说明 |
|------|------|----------|
| AI 模型供应商 | <如 OpenAI / Claude / 本地模型> | |
| SDK / 框架 | <如 LangChain / OpenAI SDK / Spring AI> | |
| 模型名称 | <如 gpt-4 / claude-3-opus> | |
| API 版本 | <版本> | |
| Rate Limit | <如 60 req/min> | |

---

## 6. 基础设施

| 维度 | 选型 | 配置说明 |
|------|------|----------|
| 容器化 | <如 Docker / Podman> | |
| 编排 | <如 Docker Compose / Kubernetes> | |
| CI/CD | <如 GitHub Actions / GitLab CI / Jenkins> | |
| 部署方式 | <如 云服务器 / Serverless / 云原生> | |
| 日志收集 | <如 ELK / Loki / CloudWatch> | |
| 监控告警 | <如 Prometheus + Grafana / Datadog> | |

---

## 7. 测试框架

| 类型 | 框架 | 版本 | 配置说明 |
|------|------|------|----------|
| 单元测试 | <如 JUnit 5 / pytest / Vitest> | <版本> | |
| 集成测试 | <如 TestContainers / pytest + httpx> | <版本> | |
| E2E 测试 | <如 Playwright / Cypress> | <版本> | |
| Mock 工具 | <如 Mockito / pytest-mock / msw> | <版本> | |

---

## 8. Agent 运行环境与权限配置

> 本工作流依赖 Claude Code 子代理执行各角色任务。运行环境与权限配置直接影响子代理可用性与命令执行成功率，建议在项目初始化时一并确认。

| 配置项 | 取值 / 校验方式 |
|--------|------------------|
| `CLAUDE_CODE_SUBAGENT_MODEL` | 指向可用模型；在 `.claude/settings.json` 的 `env` 块覆盖 |
| 子代理可用性校验 | 启动 1 个最小子代理做冒烟验证，应正常返回而非 400 |
| 权限 allow 白名单 | 作为权限分类器不可用时的兜底：`PowerShell(git*|python*|pip*|uv*)` + `Write(*.md|*.py)` |
| Windows 已知坑 | 长路径限制（开启 longpaths / 缩短项目路径）；pip sdist 深路径安装失败（改用 `uv` / 预编译 wheel）；原生依赖编译失败（缺编译器 → 安装 VS Build Tools / gcc） |

> 更多症状→根因→修复见技能 `environment-troubleshooting.md` 与工作流 §2 环境预检清单。

---

## 9. 变更记录

| 日期 | 变更内容 | ADR 编号 |
|------|----------|----------|
| YYYY-MM-DD | 初始化技术栈 | — |

---

> **提醒**：每次技术栈变更后：
> 1. 更新本文档
> 2. 在 `docs/adr/` 下创建 ADR 记录决策
> 3. 更新 `memory/project-context.md` 中的技术栈摘要
> 4. 通知所有 Agent 技术栈已变更
