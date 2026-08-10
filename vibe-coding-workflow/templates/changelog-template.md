# 变更日志 — module-XXX: <模块名称>

> 📋 本文件由 Developer 维护，记录该模块开发过程中的所有代码变更。
> Reviewer 审查时以此文件为依据了解变更范围。

---

## 模块信息

| 字段 | 内容 |
|------|------|
| 模块编号 | module-XXX |
| 模块名称 | <模块名称> |
| 开发计划 | `specs/module-XXX-<name>/plan.md` |
| 验收标准 | `specs/module-XXX-<name>/acceptance-criteria.md` |
| Git 分支 | `feature/module-XXX-<name>` |
| 开发者 | Developer |

---

## 变更记录

> 每次代码提交追加一条记录（时间正序，最新在底部）。

### 变更 1: <简短描述>

| 字段 | 内容 |
|------|------|
| 时间 | YYYY-MM-DD HH:mm |
| 变更类型 | feat（新功能）/ fix（修复）/ refactor（重构） |
| Git Commit | `<commit-hash>` |
| 提交信息 | `[feat] module-XXX: <简短描述>` |

#### 变更文件列表

| 文件路径 | 操作 | 变更说明 |
|----------|------|----------|
| `backend/src/main/java/.../controller/UserController.java` | 新增 | 用户注册接口 |
| `backend/src/main/java/.../service/UserService.java` | 新增 | 注册业务逻辑 |
| `backend/src/main/java/.../repository/UserRepository.java` | 新增 | 用户数据访问 |
| `backend/src/main/resources/db/migration/V001__create_users.sql` | 新增 | 建表迁移脚本 |

#### 关键设计说明

- 密码使用 BCrypt 加密，盐值轮数 12
- 用户名唯一约束在数据库层和 Service 层双重校验
- Controller 统一返回 `{code, msg, data, timestamp, request_id}` 格式

#### 自测结果

| 测试项 | 结果 |
|--------|------|
| 编译通过 | ✅ |
| 本地启动 | ✅ |
| 接口自测 | ✅ POST /api/v1/users 返回 200 |
| 异常输入测试 | ✅ 空用户名返回 400 |

#### 记忆库同步

| 记忆库文件 | 本次修改 |
|------------|----------|
| `memory/project-context.md` | <状态变更，如：模块状态 → 👀 待审查> |
| `memory/file-index.md` | <索引更新，如：追加 changelog.md 与新增源码/迁移文件索引行> |
| `memory/agent-activity-log.md` | <活动追加，如：追加 [CODE]/[BUILD]/[HANDOFF] 记录> |

---

### 变更 2: <修复/迭代的描述>

> 格式同上，每次提交追加一个变更块（含『变更文件列表』『关键设计说明』『自测结果』『记忆库同步』）

---

## 变更汇总

| 统计项 | 值 |
|--------|-----|
| 总变更次数 | 1 |
| 新增文件数 | 4 |
| 修改文件数 | 0 |
| 新增代码行数 | 180 |
| 修复轮次 | 0 |
| 记忆库更新次数 | 3 |

---

## 待审查事项

> Developer 标记需要 Reviewer 特别关注的点

- [ ] 密码加密强度是否足够
- [ ] 用户名唯一校验是否需要加分布式锁
- [ ] 迁移脚本是否需要回滚脚本
