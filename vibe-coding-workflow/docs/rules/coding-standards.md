# 编码强制规则（L2 参考文档 · 触发条件：编写实现时）

> 本文件为按需读取的参考文档（无触发不读）。铁律提炼见 `CLAUDE.md §0` 第 3/4/5/8/9 条。
> 源：原 CLAUDE.md §7。

## 1. 注释覆盖率

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

## 2. 异常捕获

- **严禁吞掉异常（空 catch 块）**
- **严禁在 Controller 层捕获异常后不做处理**
- **所有业务异常必须继承统一的 `BusinessException`**
- **全局异常处理器必须记录完整的堆栈信息到日志**
- **豁免（铁律 5）**：确定性脚本（闸门/审计类）对文件 I/O 的容错 catch，只要带注释说明即为合法，不属于吞异常

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

## 3. 日志输出

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

## 4. 代码长度限制

| 维度 | 默认上限 | 说明 |
|------|----------|------|
| 单个方法/函数 | ≤ 50 行 | 超过则必须拆分；特殊情况（如长 switch、配置初始化）可在 plan.md 说明理由后放宽 |
| 单个类/模块 | ≤ 500 行 | 超过则考虑按职责拆分；特殊情况可在 plan.md 说明理由后放宽 |
| 单个模块（module） | ≤ 200 行新增代码 | Vibe Coding 单次迭代默认上限；复杂模块可在 plan.md 中申请调整并说明理由。**口径**：只统计生产代码新增行，docstring/注释/测试代码单列统计且默认豁免（Tester 产出不占模块行数上限） |

## 5. 安全编码规范

- [ ] **SQL 注入防护**：使用参数化查询，严禁字符串拼接 SQL
- [ ] **XSS 防护**：用户输入输出时转义 HTML 特殊字符
- [ ] **CSRF 防护**：所有状态变更请求必须验证 Token
- [ ] **密码安全**：使用 BCrypt / Argon2，禁止明文存储
- [ ] **API Key 安全**：敏感配置使用环境变量或密钥管理服务，禁止硬编码
- [ ] **依赖安全**：定期检查 `npm audit` / `pip audit` / OWASP Dependency-Check
