# 功能规格说明书 — Module-XXX: <模块名称>

> 本文件由 **Planner** 输出，作为模块开发的唯一权威规格文档。
> Developer 严格按本文件编码，Reviewer 和 Tester 按本文件验收。

---

## 1. 模块元信息

| 字段 | 内容 |
|------|------|
| 模块编号 | module-XXX |
| 模块名称 | <模块名称> |
| 版本号 | <版本号>-module-XXX（例：1.0.0-module-001） |
| 优先级 | P0 / P1 / P2 |
| 预估代码量 | 功能代码 ≤ 200 行（默认，不含注释/docstring/测试）；含注释/测试总行数约 <XXX> 行。默认按功能代码口径预估；若 plan 已按含注释/测试口径预估且实际吻合，自动豁免 ≤200/≤300 行上限，无需额外审批 |
| 创建日期 | YYYY-MM-DD |
| 最后更新 | YYYY-MM-DD |
| 负责人 | Planner: <姓名>, Developer: <姓名> |

---

## 2. 需求描述

### 2.1 需求来源

- 来源类型：用户输入 / 需求文档 / 变更请求
- 原始描述：<用户原始需求原文>

### 2.2 用户故事

```
作为 <角色>
我想要 <功能>
以便 <达成目标>
```

### 2.3 验收场景（BDD 格式）

```
场景 1：<场景名称>
  假设 <前置条件>
  当 <用户操作>
  那么 <预期结果>

场景 2：<场景名称>
  假设 <前置条件>
  当 <用户操作>
  那么 <预期结果>
```

### 2.4 非功能需求

| 类别 | 要求 |
|------|------|
| 响应时间 | <如：P99 ≤ 500ms> |
| 并发量 | <如：≥ 100 QPS> |
| 可用性 | <如：99.9%> |
| 安全级别 | <如：需登录认证 / 公开接口> |

---

## 3. 技术方案

### 3.1 涉及文件

| 文件路径 | 操作类型 | 说明 |
|----------|----------|------|
| `backend/src/main/java/.../controller/XxxController.java` | 新增 / 修改 | <说明> |
| `backend/src/main/java/.../service/XxxService.java` | 新增 / 修改 | <说明> |
| `backend/src/main/java/.../service/impl/XxxServiceImpl.java` | 新增 / 修改 | <说明> |
| `backend/src/main/java/.../repository/XxxRepository.java` | 新增 / 修改 | <说明> |
| `backend/src/main/java/.../model/entity/XxxEntity.java` | 新增 / 修改 | <说明> |
| `backend/src/main/java/.../model/dto/XxxRequestDTO.java` | 新增 | <说明> |
| `backend/src/main/java/.../model/vo/XxxResponseVO.java` | 新增 | <说明> |
| `backend/src/main/resources/db/migration/Vxxx__xxx.sql` | 新增 | <说明> |

### 3.2 数据库变更

#### 新建表

```sql
-- 表名: xxx_table_name
-- 说明: <表用途>
CREATE TABLE xxx_table_name (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    status      VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE xxx_table_name IS '<表注释>';
COMMENT ON COLUMN xxx_table_name.name IS '<字段注释>';
```

#### 修改现有表

```sql
-- 表名: xxx_existing_table
-- 说明: <变更说明>
ALTER TABLE xxx_existing_table ADD COLUMN new_field VARCHAR(50);
```

### 3.3 API 接口定义

#### 接口 1：<接口功能描述>

```yaml
请求方法: POST
请求路径: /api/v1/xxx-resources
认证要求: 需要 / 不需要
请求体:
  {
    "field_1": "string（必填，最大长度 100）",
    "field_2": 0（必填，整数，最小值 1）
  }

成功响应 (200):
  {
    "code": 0,
    "msg": "success",
    "data": {
      "id": 1,
      "name": "xxx",
      "created_at": "2026-01-01T00:00:00Z"
    },
    "timestamp": 1690000000000,
    "request_id": "uuid-v4"
  }

错误响应:
  - 400: 参数校验失败 → { "code": 400, "msg": "field_1 不能为空", "data": {...} }
  - 409: 资源冲突 → { "code": 409, "msg": "名称已存在", "data": {...} }
  - 500: 服务器错误 → { "code": 500, "msg": "服务器内部错误", "data": null }
```

#### 接口 2：<接口功能描述>

```yaml
请求方法: GET
请求路径: /api/v1/xxx-resources/{id}
认证要求: 需要
路径参数:
  - id: long（必填，资源 ID）

成功响应 (200):
  {
    "code": 0,
    "msg": "success",
    "data": {
      "id": 1,
      "name": "xxx"
    },
    "timestamp": 1690000000000,
    "request_id": "uuid-v4"
  }

错误响应:
  - 404: 资源不存在 → { "code": 404, "msg": "资源不存在", "data": null }
  - 500: 服务器错误 → { "code": 500, "msg": "服务器内部错误", "data": null }
```

### 3.4 业务逻辑说明

#### 核心流程

```
1. Controller 接收请求，校验参数（@Valid）
2. Controller 调用 XxxService.xxxMethod(RequestDTO)
3. Service 执行业务逻辑：
   a. 校验业务规则（如唯一性检查）
   b. 调用 Repository 操作数据库
   c. 调用外部服务（如有）
   d. 组装返回结果
4. Controller 将 ResponseVO 包装为统一格式返回
```

#### 关键业务规则

| 序号 | 规则描述 | 实现位置 |
|------|----------|----------|
| 1 | <规则 1，如：用户名不可重复> | XxxServiceImpl.checkUnique() |
| 2 | <规则 2，如：密码需加密存储> | XxxServiceImpl.createUser() |
| 3 | <规则 3> | |

### 3.5 异常处理

| 异常场景 | 异常类型 | HTTP Code | 处理方式 |
|----------|----------|-----------|----------|
| <如：用户名已存在> | DuplicateResourceException | 409 | 返回友好提示 |
| <如：参数校验失败> | MethodArgumentNotValidException | 400 | 全局异常处理器处理 |
| <如：数据库连接失败> | DataAccessException | 500 | 记录 ERROR 日志，返回通用错误 |

---

## 4. 验收标准

> 详细验收标准见同目录下的 `acceptance-criteria.md`
> 以下仅列出核心验收项概要。

### 4.1 可运行的验证命令

```bash
# 单元测试
./gradlew test --tests "com.xxx.service.XxxServiceTest"

# 集成测试
./gradlew test --tests "com.xxx.controller.XxxControllerTest"

# API 手动测试
curl -X POST http://localhost:8080/api/v1/xxx-resources \
  -H "Content-Type: application/json" \
  -d '{"field_1": "test", "field_2": 1}'

# 编译检查
./gradlew build
```

### 4.2 预期输出

```
# 单元测试预期输出
BUILD SUCCESSFUL
Tests: 5 passed, 0 failed

# API 预期响应
{"code":0,"msg":"success","data":{"id":1,...},...}
```

### 4.3 失败诊断方法

| 失败现象 | 可能原因 | 排查步骤 |
|----------|----------|----------|
| 编译失败 | 依赖缺失 / 语法错误 | 1) 检查 import 2) 执行 `./gradlew dependencies` |
| 数据库连接失败 | 配置错误 / 服务未启动 | 1) 检查 application.yml 2) 执行 `docker ps` |
| 404 错误 | 路径拼写错误 / 未注册 | 1) 检查 @RequestMapping 路径 2) 执行 `./gradlew bootRun` |
| 500 错误 | 业务逻辑异常 | 1) 查看应用日志 2) 检查堆栈信息 |
| 测试用例无法收集（async 用例） | 缺 pytest-asyncio 插件 | 1) 安装 pytest-asyncio 2) 确认 pytest 配置 `asyncio_mode` |
| pip sdist 深路径安装失败 | Windows 长路径限制 | 1) 缩短项目路径 2) 改用 `uv` 安装 |
| 依赖编译失败 | 缺编译器 / 构建工具 | 1) 安装编译器（VS Build Tools / gcc）2) 使用预编译 wheel |
| 前端单测环境性失败 | service 未 mock / 依赖服务不可用 | 1) 检查 service 是否已 mock 2) 核对 jsdom / 测试配置 |

---

## 5. 依赖关系

### 5.1 上游依赖（本模块依赖的已完成模块）

| 依赖模块 | 依赖内容 | 状态 |
|----------|----------|------|
| module-001: <模块名> | <如：需要 User 实体类> | ✅ 已完成 |
| module-002: <模块名> | <如：需要 AuthService.getCurrentUser()> | ✅ 已完成 |

### 5.2 下游依赖（依赖本模块的待开发模块）

| 被依赖模块 | 提供内容 | 状态 |
|------------|----------|------|
| module-XXX: <模块名> | <如：提供 XxxService.createXxx()> | 📋 待开发 |

### 5.3 外部依赖

| 外部服务 | 用途 | 可用性要求 |
|----------|------|------------|
| <如：OpenAI API> | <如：文本生成> | 99.5% |
| <如：Redis> | <如：缓存> | 99.9% |

---

## 6. 风险点与注意事项

### 6.1 已知风险

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|----------|
| <风险 1，如：AI API 超时> | 高 / 中 / 低 | 高 / 中 / 低 | <如：设置 30s 超时 + 重试 3 次> |
| <风险 2，如：并发写冲突> | 高 / 中 / 低 | 高 / 中 / 低 | <如：使用乐观锁> |

### 6.2 技术注意事项

- [ ] 需要注意的边界条件：<如：空值处理、超长输入>
- [ ] 需要注意的兼容性问题：<如：旧版本 API 兼容>
- [ ] 需要注意的性能瓶颈：<如：大表查询需加索引>
- [ ] 需要注意的安全隐患：<如：参数注入、敏感信息泄露>

### 6.3 开发建议

- <建议 1，如：优先实现核心路径，边界条件可后续补充>
- <建议 2，如：异常处理可复用 common 模块中的全局异常处理器>
- <建议 3，如：测试数据使用 @BeforeEach 统一初始化>

---

## 7. 变更记录

| 版本 | 日期 | 变更内容 | 变更人 |
|------|------|----------|--------|
| v1 | YYYY-MM-DD | 初始版本 | Planner |
| | | | |

---

## 8. 审批记录

| 角色 | 姓名 | 审批结果 | 日期 | 备注 |
|------|------|----------|------|------|
| Planner | | ✅ 通过 | | |
| Reviewer | | ⏳ 待审查 | | |
| Tester | | ⏳ 待测试 | | |

---

> **下一步**：Developer 根据本规格说明书开始编码实现。
> 本文件与 CLAUDE.md 保持一致，所有规范要求以 CLAUDE.md 为准。
