# 快速启动清单（L2 参考文档 · 触发条件：新项目初始化时）

> 本文件为按需读取的参考文档（无触发不读）。
> 源：原 CLAUDE.md §14。

新项目启动时，Planner 需按顺序完成以下步骤：

- [ ] 1. 确认 `tech-stack.md` 已填写完整（技术栈、中间件及配置）
- [ ] 2. **校验子代理模型可用性**：确认 `CLAUDE_CODE_SUBAGENT_MODEL` 指向可用模型（必要时在 `.claude/settings.json` 的 `env` 块覆盖），启动 1 个子代理做冒烟验证（应正常返回而非 400）
- [ ] 3. **配置基线权限 allow 白名单**：检查 `.claude/settings.json` 是否已配置权限 allow 白名单（建议如 `PowerShell(git*|python*|pip*|uv*|make*|npm*)` + `Write(*.md|*.py)`），避免 auto 模式依赖 LLM 分类器导致命令被拦
- [ ] 4. 初始化项目目录结构
- [ ] 5. 创建 `CLAUDE.md`（本技能副本或引用）
- [ ] 6. 创建 `memory/project-context.md` 模板并填入初始信息
- [ ] 7. 初始化 Git 仓库，创建 `main` / `develop` 分支
- [ ] 8. 配置 CI/CD 流水线
- [ ] 9. 输出第一个模块（module-001）的 `plan.md` 和 `acceptance-criteria.md`
- [ ] 10. 通知 Developer 开始开发
