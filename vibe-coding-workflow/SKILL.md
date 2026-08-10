---
name: vibe-coding-workflow
description: Use when setting up a multi-agent software project with Planner/Developer/Reviewer/Tester roles in a closed-loop workflow, or when joining an existing project that uses module-XXX numbering, specs/ directories, and shared project-context.md memory.
---

# Vibe Coding 闭环工作流

## Overview

A structured 4-agent closed-loop workflow (Plan → Develop → Review → Test) for production software delivery. Uses Claude Code Teammate Mode with specialized agent roles, template-driven document outputs, and shared memory for cross-agent state synchronization.

The entire workflow specification lives in the project's `CLAUDE.md`. Agent definitions are in `.claude/agents/`. The workflow orchestration is in `.claude/workflows/vibe-coding-loop.md`. Templates are in `templates/`.

## When to Use

- You want a **repeatable multi-agent pipeline** for software projects
- You need **clear role separation** (one agent plans, another codes, another reviews, another tests)
- You want **template-driven consistency** across specs, changelogs, review reports, and test reports
- You need **shared project memory** that all agents read/write

**Do NOT use** for one-off tasks, simple scripts, or projects where a single agent suffices.

## Quick Reference

| Component | Location | Purpose |
|-----------|----------|---------|
| Project specification | `CLAUDE.md` (root) | Complete workflow rules, coding standards, architecture |
| Agent definitions | `.claude/agents/*.md` | Individual role prompts (Planner/Developer/Reviewer/Tester) |
| Workflow orchestration | `.claude/workflows/vibe-coding-loop.md` | Phase sequencing, handoff protocols, error recovery |
| Templates (8) | `templates/*.md` | plan, acceptance-criteria, changelog, review-report, test-report, ADR, implementation-plan, tech-stack |
| Shared memory | `memory/project-context.md` + `memory/file-index.md` + `memory/agent-activity-log.md` | Three-file memory system: status (project-context) / index (file-index) / activity log (agent-activity-log) |
| Activity log | `memory/agent-activity-log.md` | Per-module per-phase activity: 1 row per phase (PLAN/CODE/REVIEW/TEST) |
| Environment troubleshooting | `environment-troubleshooting.md` | Common environment issue fixes (subagent model / permission allowlist / Windows pitfalls / real-DB smoke test) |
| Module specs | `specs/module-XXX-<name>/` | Per-module deliverables (plan, changelog, review, test reports) |

## Key Principles

These principles are encoded in `CLAUDE.md` and all agent definitions — read those files for the full specification:

- **Spec before code**: Planner outputs `plan.md` + `acceptance-criteria.md` before any coding begins
- **One module at a time**: Each iteration processes exactly one `module-XXX` (default ≤ 200 new lines)
- **4-phase closed loop**: Plan → Develop → Review → Test, each with defined input/output documents and exit criteria
- **3-retry max per phase**: Each phase has explicit retry limits before escalation to Planner; may request relaxation (e.g. 3→8) when there's evidence of progress — the default cap is not a hard ceiling
- **Active monitoring**: The orchestrator (Planner) checks agent status every 2-5 minutes and intervenes immediately on timeout
- **Shared memory**: three-file system — `memory/project-context.md` (status) / `memory/file-index.md` (index) / `memory/agent-activity-log.md` (activity log) — read/written by all agents at phase transitions
- **ADR for architecture decisions**: Architecture changes are recorded as `docs/adr/adr-XXX-<title>.md`
- **Template-driven**: Every deliverable uses a predefined template from `templates/`

## Startup Checklist

When initializing a new project:

1. Copy `CLAUDE.md`, `.claude/`, `memory/`, and `templates/` to project root
2. Fill `tech-stack.md` (tech stack config, template at `templates/tech-stack-template.md`)
3. Configure environment pre-check: verify `CLAUDE_CODE_SUBAGENT_MODEL` points to a working model (smoke-test with 1 subagent — expect a normal response, not a 400), and set a baseline permission `allow` allowlist (e.g. `PowerShell(git*|python*|pip*|uv*|make*|npm*)` + `Write(*.md|*.py)`)
4. Initialize `memory/project-context.md` with project name and tech stack
5. Initialize `memory/agent-activity-log.md` and `memory/file-index.md`
6. Initialize Git repo: `main` + `develop` branches
7. Planner outputs first module-001 plan

## Common Mistakes

- **Skipping templates**: Every document (plan, changelog, review, test) MUST use its template — do not invent ad-hoc formats
- **Planner writing code**: Planner's output is `plan.md` + `acceptance-criteria.md` — never source files
- **Developer exceeding plan scope**: Only implement items listed in `plan.md` — no unsolicited features
- **Reviewer reading diff only**: Must read full file contents, not just git diff
- **Tester skipping regression**: Full test suite must pass (100% regression), not just new tests
- **Parallel module development**: Only one module active at a time — no concurrent module work
- **Ignoring shared memory**: Always read the three memory files (`project-context.md` / `file-index.md` / `agent-activity-log.md`) at phase start, write them at phase end

## Agent Onboarding Order

New agents joining the project should read in this order:

1. `memory/project-context.md` — current state (freshness first)
2. `memory/file-index.md` — project file map (locating aid)
3. `memory/agent-activity-log.md` — per-module per-phase activity (4 rows per module)
4. `CLAUDE.md` — full rules and standards
5. `.claude/agents/<role>.md` — own role definition
6. `.claude/workflows/vibe-coding-loop.md` — workflow orchestration

## Related

This skill provides the workflow framework. Components it references:
- Each agent definition (`.claude/agents/*.md`) — role-specific prompts
- `templates/` — all 8 document templates
- `memory/project-context.md` — shared state template (with `file-index.md` and `agent-activity-log.md`, the three-file memory system)
- `environment-troubleshooting.md` — common environment issue fixes (subagent model / permission allowlist / Windows pitfalls / real-DB smoke test)
- `.claude/workflows/vibe-coding-loop.md` — orchestration details, phase timing, error recovery paths, Git branch strategy, config parameters
