# CLAUDE.md — Vibe Coding Workflow · Lean Loader

> Single always-resident spec (auto-loaded by Claude Code). Iron rules and pointers only — details are never duplicated here.
> Progressive disclosure (L0/L1/L2, onboarding order in SKILL.md): do not read without a trigger. Full-document loading causes context rot.
>
> **Single source of truth**: detailed specs live in `docs/rules/`, `docs/reference/`, `.claude/`, `templates/`, `memory/`.
> Keep the iron-rule COUNT in sync with the SKILL.md rule table (SKILL.md is the Chinese human-facing layer; its backup is `CLAUDE.zh-CN.backup.md`).

## 0. Iron Rules (violation = phase failure, no reminders needed)

| # | Rule | Verification | Consequence |
|---|------|--------------|-------------|
| 1 | Produce plan.md + acceptance-criteria.md before coding; Planner never writes code. Light mode exempt: doc-level / small script changes may execute directly, but must leave changelog + memory rows | script checks files | exit code 2 |
| 2 | One module-XXX at a time; ≤200 new production LOC (docstrings/comments/tests exempt) | git diff --numstat | phase blocked |
| 3 | Methods ≤50 lines, classes ≤500 lines; split when exceeded or justify in plan.md | static analysis | review rejected |
| 4 | All public/exported methods have Javadoc / Docstring / JSDoc; magic numbers become named constants | checkstyle / pylint / ESLint | review rejected |
| 5 | No empty catch / swallowed exceptions; business exceptions extend BusinessException. Exempt: commented I/O-tolerance catches in deterministic scripts | regex/static scan | review rejected |
| 6 | No cross-layer calls, reverse deps, or cycles; Entities never reach Controllers (DTO isolation) | ArchUnit / import check | review rejected |
| 7 | Every API returns {code, msg, data, timestamp, request_id} | API tests | test rejected |
| 8 | INFO logs on key operations (args summary + result + duration); exceptions carry request_id; never log sensitive data | log scan | review rejected |
| 9 | No SQL string concatenation (parameterize); no hardcoded secrets or plain passwords (BCrypt/Argon2) | semgrep / gitleaks | review rejected |
| 10 | Architecture changes go through ADR: author writes → Planner approves → index updated | docs/adr/ audit | not done |
| 11 | Memory trio: read on entry, write this module's record before phase exit | verifyMemory + delivery-gate (24h mtime freshness) | exit 3/4 |
| 12 | Self-run lint + tests and paste command output as evidence; deliverables use templates/ | changelog/report content check | not done |
| 13 | Script tools use Node built-ins only + header comment (usage / exit codes / env vars) | code check | not done |
| 14 | Gate/audit scripts ship mechanically assertable fixture cases | fixture matrix | not done |

> Partially scripted: templates/check-gates.js runs at DEVELOP/REVIEW exit (rules 2/3/4/5/9/12 + review evidence); templates/delivery-gate.js validates memory mtime freshness after TEST (rule 11). Any failure → exit code 4. install-precommit.js wires git pre-commit interception. Disable via config.gates.enabled=false. Heuristic checks do not replace Review.

## 1. Roles & Loop (pointers)

| Role | One-liner | Definition |
|------|-----------|------------|
| Planner | requirement breakdown → plan.md + acceptance-criteria.md; maintains project-context backlog | @.claude/agents/planner.md |
| Developer | implement per plan → code + changelog.md; self-repair ≤3 retries | @.claude/agents/developer.md |
| Reviewer | full-file review → review-report.md with file:line evidence per item | @.claude/agents/reviewer.md |
| Tester | full regression + new tests → test-report.md | @.claude/agents/tester.md |

- Dispatch model: the orchestrator (main session) instantiates `templates/module-loop-template.js`, dispatches all four roles as subagents, and routes between phases — each role's output file (plan.md / changelog.md / review-report.md / test-report.md) is the phase-completion signal the driver polls
- Loop, timeout monitoring, fallback paths → @.claude/workflows/vibe-coding-loop.md
- Module loop driver (exit codes 0-4) → templates/module-loop-template.js · gates → templates/check-gates.js · memory gate → templates/delivery-gate.js · pre-commit → templates/install-precommit.js
- Planner may spawn multiple instances of a role for complex modules; declare in plan.md

## 2. On-demand Index (no trigger, no read)

| Trigger | File |
|---------|------|
| Coding (naming/comments) | @docs/rules/naming.md |
| Controller / API work | @docs/rules/api-format.md |
| Structure design (layering/DTO/AI) | @docs/rules/layering.md |
| Coding details (comments/errors/logs/length/security) | @docs/rules/coding-standards.md |
| Architecture decisions (ADR rules) | @docs/rules/adr.md |
| Memory read/write rules | @docs/rules/memory-rules.md |
| LLM calls / Agent orchestration | @docs/rules/ai-agent-dev.md |
| New directories / file layout | @docs/reference/directory-structure.md |
| Project bootstrap | @docs/reference/quickstart.md |
| Env errors / permission blocks / Windows quirks | environment-troubleshooting.md |
| Security audit (secrets/dangerous commands/injection) | node templates/audit-scan.js (--with-md adds .md injection scan) |
| Dispatching role subagents (orchestrator) | @templates/dispatch-prompt-template.md |
| Commits / branches / versions | @.claude/workflows/vibe-coding-loop.md §6 |
| Starting dev from a plan | @docs/rules/plan-safety.md |
| Phase-mode context (dev/review/research) | @contexts/dev.md · @contexts/review.md · @contexts/research.md |
| Skill health check (refs/rule sync/orphans) | node templates/skill-stocktake.js (--skill <root>) |
| Periodic iron-rule maintenance | @docs/rules/rules-distill.md |

## 3. Shared Memory (mandatory read/write)

- memory/project-context.md — project status (backlog/in-progress/done/ADR index)
- memory/file-index.md — file index (1 row per module + entry files)
- memory/agent-activity-log.md — activity log (1 row per module per phase)

Read on entry; write before phase exit; handoff message lists updated files, else the next phase cannot start. Rules → @docs/rules/memory-rules.md.

## 4. Tech Stack

Not pre-set: user fills tech-stack.md (template @templates/tech-stack-template.md) or confirms with Planner. Stack changes require updating tech-stack.md + an ADR. Before module-001, Planner verifies completeness (backend/db/middleware/frontend/AI vendor/CI/deploy).
