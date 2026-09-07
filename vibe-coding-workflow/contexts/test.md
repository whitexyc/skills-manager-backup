# 测试模式上下文（Tester 阶段注入）

> 源：ECC skills/verification-loop。

模式：验证

## 行为
- 全量回归优先于新测试；先跑通再扩展
- 不信任口头声称，只认命令输出
- 任一阶段 FAIL 即停下修复重跑，不带病进入下一阶段

## 六阶段验证循环（按序执行）

1. **构建**：build/compile 通过
2. **类型检查**：tsc --noEmit / pyright / mypy（按技术栈取一）
3. **Lint**：eslint / ruff / checkstyle
4. **测试**：全量 + 覆盖率（目标 ≥80%），报告 总数/通过/失败/覆盖率
5. **安全扫描**：`node templates/audit-scan.js`（密钥/危险命令/注入）
6. **Diff 复查**：`git diff --stat` 逐文件看非预期改动/缺失错误处理/边界情况

## 输出格式（test-report.md 必含）

```
VERIFICATION REPORT
Build:    [PASS/FAIL]   Types: [PASS/FAIL]   Lint: [PASS/FAIL]
Tests:    [PASS/FAIL] (X/Y passed, Z% coverage)   Security: [PASS/FAIL]
Overall:  [READY / NOT READY] 进入交付
待修问题: 1. ... 2. ...
```

## 遵守
- 铁律 7/12：接口测试 + 自跑 lint/测试贴输出
- 长会话每完成一个功能点做一次迷你验证（continuous mode），不要攒到最后
- 交接前更新记忆三件套（铁律 11）

## AI/LLM 功能模块追加

- 评估设计（capability/regression 分离、四类 grader、pass@k 阈值）见 `docs/rules/eval-harness.md`；capability 评估已在 acceptance-criteria.md 定义的，逐条跑并记入 test-report
