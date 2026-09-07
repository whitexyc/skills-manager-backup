# 功能规格说明书 — Module-XXX: <模块名称>

> 本文件由 **Planner** 输出，作为模块开发的唯一权威规格文档。
> Developer 严格按本文件编码，Reviewer 和 Tester 按本文件验收。
> 简单模块可用本模板精简填写；复杂模块（多子任务/BDD 场景/审批链）改用 `templates/implementation-plan-template.md`。

---

## 1. 模块元信息

| 字段 | 内容 |
|------|------|
| 模块编号 | module-XXX |
| 模块名称 | <模块名称> |
| 版本号 | <版本号>-module-XXX（例：1.0.0-module-001） |
| 优先级 | P0 / P1 / P2 |
| 预估代码量 | 功能代码 ≤ 200 行（默认口径，不含注释/docstring/测试）；若按含注释/测试口径预估且实际吻合，自动豁免上限 |
| 创建/更新日期 | YYYY-MM-DD |
| 负责人 | Planner: <姓名>, Developer: <姓名> |

---

## 2. 需求描述

### 2.1 需求来源与用户故事

- 来源类型：用户输入 / 需求文档 / 变更请求；原始描述：<用户原文>
- 用户故事：作为 <角色>，我想要 <功能>，以便 <达成目标>

### 2.2 验收场景（BDD，复杂模块必填）

```
场景 1：<场景名称>
  假设 <前置条件>
  当 <用户操作>
  那么 <预期结果>
```

### 2.3 非功能需求

| 类别 | 要求 |
|------|------|
| 响应时间 | <如：P99 ≤ 500ms> |
| 并发量 | <如：≥ 100 QPS> |
| 安全级别 | <如：需登录认证 / 公开接口> |

---

## 3. 技术方案

### 3.1 涉及文件

| 文件路径 | 操作类型 | 说明 |
|----------|----------|------|
| `backend/.../controller/XxxController.java` | 新增 / 修改 | <说明> |
| `backend/.../service/XxxService.java` | 新增 / 修改 | <说明> |
| `backend/.../resources/db/migration/Vxxx__xxx.sql` | 新增 | <说明> |

> 每个子任务都须列全文件路径——Developer 不应猜测文件结构。

### 3.2 数据库变更（无则删本节）

```sql
-- 表名: xxx_table_name；说明: <表用途>
CREATE TABLE xxx_table_name (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### 3.3 API 接口定义（每接口一段；统一响应格式一次示例即可，错误响应列错误码）

```yaml
请求方法: POST
请求路径: /api/v1/xxx-resources
认证要求: 需要 / 不需要
请求体: { "field_1": "string（必填）", "field_2": 0 }
成功响应 (200):
  { "code": 0, "msg": "success", "data": {...}, "timestamp": ..., "request_id": "uuid" }
错误响应:
  - 400: 参数校验失败 → { "code": 400, "msg": "field_1 不能为空", ... }
  - 409: 资源冲突 → { "code": 409, "msg": "名称已存在", ... }
```

### 3.4 业务逻辑与异常

- 核心流程：<按步骤列出 Controller→Service→Repository 的职责与数据流>
- 关键业务规则：

| 序号 | 规则描述 | 实现位置 |
|------|----------|----------|
| 1 | <规则 1> | XxxServiceImpl.checkUnique() |

| 异常场景 | 异常类型 | HTTP Code | 处理方式 |
|----------|----------|-----------|----------|
| <如：资源已存在> | DuplicateResourceException | 409 | 返回友好提示 |

---

## 4. 验收标准

> 详细验收标准见同目录 `acceptance-criteria.md`，此处仅列核心项与验证命令。

### 4.1 可运行的验证命令与预期输出

```bash
# 单元测试（预期：Tests: N passed, 0 failed）
./gradlew test --tests "com.xxx.service.XxxServiceTest"
# API 手动验证（预期：{"code":0,"msg":"success",...}）
curl -X POST http://localhost:8080/api/v1/xxx-resources -H "Content-Type: application/json" -d '{...}'
```

### 4.2 失败诊断

> 通用失败现象 → 排查步骤对照表见 `environment-troubleshooting.md`，不在本模板重复。

---

## 5. 依赖关系

| 方向 | 模块/服务 | 依赖内容 | 状态 |
|------|-----------|----------|------|
| 上游 | module-001 | <需要 User 实体> | ✅ 已完成 |
| 下游 | module-XXX | <提供 XxxService.createXxx()> | 📋 待开发 |
| 外部 | <如 OpenAI API / Redis> | <用途> | 可用性要求 |

---

## 6. 风险点

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|----------|
| <如：AI API 超时> | 高/中/低 | 高/中/低 | <如：30s 超时 + 重试 3 次> |

- [ ] 边界条件：<如空值/超长输入>
- [ ] 兼容性 / 性能 / 安全注意事项：<逐条列出，无则写"无">

---

## 7. 变更记录与审批

| 版本 | 日期 | 变更内容 | 变更人 |
|------|------|----------|--------|
| v1 | YYYY-MM-DD | 初始版本 | Planner |

| 角色 | 审批结果 | 日期 | 备注 |
|------|----------|------|------|
| Planner | ✅ 通过 | | |
| Reviewer | ⏳ 待审查 | | |
| Tester | ⏳ 待测试 | | |

---

> **下一步**：Developer 根据本规格说明书开始编码实现。
> 本文件与 CLAUDE.md 保持一致，所有规范要求以 CLAUDE.md 为准。
