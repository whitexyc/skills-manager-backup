# 命名规范（L2 参考文档 · 触发条件：编写代码时）

> 本文件为按需读取的参考文档（无触发不读）。铁律提炼见 `CLAUDE.md §0` 与 `SKILL.md`。
> 源：原 CLAUDE.md §4。

## 1. 通用规则

| 类别 | 规范 | 示例 |
|------|------|------|
| 文件命名 | Python: `snake_case`，TypeScript: `camelCase` | `user_service.py`、`userController.ts` |
| 目录命名 | `snake_case` 或 `kebab-case` | `module-001-user-auth/`、`src/common/` |
| Git 分支 | `feature/module-XXX-brief-desc` | `feature/module-001-user-register` |
| Git 提交信息 | `[类型] 模块-XXX: 简要描述` | `[feat] module-001: 实现用户注册接口` |

## 2. Java 命名规范

| 类别 | 规范 | 示例 |
|------|------|------|
| 类名 | `PascalCase` | `UserController`、`UserService` |
| 方法名 | `camelCase` | `createUser()`、`findByEmail()` |
| 变量名 | `camelCase` | `userName`、`isActive` |
| 常量 | `UPPER_SNAKE_CASE` | `MAX_RETRY_COUNT`、`API_VERSION` |
| 包名 | 全小写，点分隔 | `com.project.controller` |
| 数据库表名 | `snake_case` | `user_profiles`、`order_items` |
| 数据库字段名 | `snake_case` | `created_at`、`updated_by` |

## 3. Python 命名规范

| 类别 | 规范 | 示例 |
|------|------|------|
| 类名 | `PascalCase` | `UserService`、`UserRepository` |
| 函数/方法名 | `snake_case` | `create_user()`、`find_by_email()` |
| 变量名 | `snake_case` | `user_name`、`is_active` |
| 常量 | `UPPER_SNAKE_CASE` | `MAX_RETRY_COUNT`、`API_VERSION` |
| 模块名 | `snake_case` | `user_service.py`、`auth_utils.py` |

## 4. TypeScript / React 命名规范

| 类别 | 规范 | 示例 |
|------|------|------|
| 组件文件 | `PascalCase.tsx` | `UserProfile.tsx`、`LoginForm.tsx` |
| 工具/服务文件 | `camelCase.ts` | `apiClient.ts`、`userService.ts` |
| 接口/类型 | `PascalCase`，不使用 `I` 前缀（遵循现代 TypeScript 规范） | `User`、`UserService` |
| 变量/函数 | `camelCase` | `userName`、`handleSubmit()` |
| CSS 类名 | `kebab-case` 或 BEM | `user-profile__avatar--active` |

## 5. API 端点命名

| 类别 | 规范 | 示例 |
|------|------|------|
| 路径 | `kebab-case`，名词复数 | `/api/v1/user-profiles` |
| 查询参数 | `snake_case` | `?page_size=20&order_by=created_at` |
| 请求/响应体字段 | `snake_case` | `{ "user_name": "张三", "created_at": "..." }` |
