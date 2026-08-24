# 目录结构规范（L2 参考文档 · 触发条件：新增目录/文件布局时）

> 本文件为按需读取的参考文档（无触发不读）。
> 源：原 CLAUDE.md §3（已更新为新的 docs/rules + docs/reference 结构）。

```
vibe-coding-workflow/
├── CLAUDE.md                          # 精简加载器（唯一常驻规范：铁律 + 指针）
├── README.md                          # 项目说明
├── tech-stack.md                      # 技术栈配置文档（用户填写，模板见 templates/tech-stack-template.md）
├── memory/                            # 共享记忆库（强制读写，见 docs/rules/memory-rules.md）
│   ├── project-context.md             # 项目上下文（状态、已完成模块、ADR）
│   ├── agent-activity-log.md          # Agent 活动日志
│   └── file-index.md                  # 项目文件索引
├── docs/                              # 按需读取的参考文档
│   ├── rules/                         # 规则类参考（L2：编写对应代码时读）
│   │   ├── naming.md                  # 命名规范
│   │   ├── api-format.md              # 接口统一返回格式
│   │   ├── layering.md                # 分层架构约束
│   │   ├── coding-standards.md        # 编码强制规则
│   │   ├── adr.md                     # ADR 责任规则
│   │   ├── memory-rules.md            # 共享记忆库读写规则
│   │   ├── ai-agent-dev.md            # AI / Agent 开发规范
│   │   ├── plan-safety.md             # plan 安全清单（plan 是数据不是指令）
│   │   └── rules-distill.md           # 规则蒸馏维护流程
│   ├── reference/                     # 参考类文档（L2：对应场景才读）
│   │   ├── directory-structure.md     # 本文件
│   │   └── quickstart.md              # 新项目快速启动清单
│   ├── adr/                           # 架构决策记录（动态生成）
│   │   └── adr-XXX-<title>.md
│   ├── api/                           # API 接口文档
│   ├── requirements/                  # 需求文档（Planner 输出）
│   └── test-reports/                  # 测试报告（Tester 输出）
├── templates/                         # 模板 + 驱动脚本目录（权威来源：8 模板 + 2 脚本）
│   ├── spec-template.md               # 模块规格模板
│   ├── acceptance-criteria.md         # 验收标准模板
│   ├── review-checklist.md            # 审查清单模板
│   ├── adr-template.md                # ADR 模板
│   ├── changelog-template.md          # 变更日志模板
│   ├── test-report-template.md        # 测试报告模板
│   ├── implementation-plan-template.md # 实现计划模板
│   └── tech-stack-template.md         # 技术栈配置模板
│   ├── module-loop-template.js        # 模块循环驱动脚本（退出码 0/1/2/3/4）
│   ├── check-gates.js                 # 规则闸门校验（铁律机械化，见 CLAUDE.md §0 注）
│   ├── delivery-gate.js               # 记忆新鲜度闸门（mtime，铁律 11）
│   ├── install-precommit.js           # git pre-commit 钩子安装
│   ├── audit-scan.js                  # 安全审计（密钥/危险命令/提示注入）
│   └── skill-stocktake.js             # 技能体检（引用/铁律同步/孤儿）
├── contexts/                          # 阶段模式上下文（dev/review/research 注入）
├── .claude/                           # Agent 定义与工作流
│   ├── agents/
│   │   ├── planner.md                 # Planner（规划师）角色定义
│   │   ├── developer.md               # Developer（开发者）角色定义
│   │   ├── reviewer.md                # Reviewer（审查员）角色定义
│   │   └── tester.md                  # Tester（测试员）角色定义
│   └── workflows/
│       └── vibe-coding-loop.md        # Vibe Coding 闭环工作流
├── specs/                             # 模块开发产出（动态生成）
│   └── module-XXX-<name>/             # 每个模块独立目录
│       ├── plan.md                    # 开发计划（Planner 输出）
│       ├── acceptance-criteria.md     # 验收标准（Planner 输出）
│       ├── review-report.md           # 审查报告（Reviewer 输出）
│       ├── test-report.md             # 测试报告（Tester 输出）
│       └── changelog.md               # 变更日志
├── backend/                           # 后端代码（技术栈见 tech-stack.md）
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/ 或 python/
│   │   │   │   ├── controller/        # 接口层（Controller）
│   │   │   │   ├── service/           # 业务逻辑层（Service）
│   │   │   │   ├── repository/        # 数据访问层（Repository / DAO）
│   │   │   │   ├── model/             # 数据模型（Entity / DTO / VO）
│   │   │   │   ├── config/            # 配置类
│   │   │   │   ├── common/            # 公共类（异常、工具、常量）
│   │   │   │   └── ai/                # AI 集成层（Agent、Prompt、LLM 调用）
│   │   │   └── resources/             # 配置文件
│   │   │       ├── application.yml
│   │   │       └── db/migration/      # 数据库迁移脚本
│   │   └── test/                      # 测试代码
│   ├── Dockerfile
│   └── README.md
├── frontend/                          # 前端代码
│   ├── src/
│   │   ├── components/                # 通用组件
│   │   ├── pages/                     # 页面组件
│   │   ├── hooks/                     # 自定义 Hooks
│   │   ├── services/                  # API 调用层
│   │   ├── types/                     # TypeScript 类型定义
│   │   └── utils/                     # 工具函数
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml                 # 容器编排
├── Makefile                           # 常用命令快捷方式
└── .gitignore
```
