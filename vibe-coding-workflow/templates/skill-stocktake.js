#!/usr/bin/env node
/**
 * skill-stocktake.js — 技能体检
 * =============================================================================
 * 用途：把本技能的「单源权威」纪律机械化——检查引用完整性、铁律表同步、孤儿文件、
 *       关键文件存在性。纯 Node 零依赖。
 *
 * 用法：node templates/skill-stocktake.js [--skill <技能根>]   # 默认 templates/..
 *
 * 检查项：
 *   1. 引用完整性（CRIT）：CLAUDE.md 的 @路径 与 SKILL.md 的反引号路径，文件必须存在
 *   2. 铁律同步：条数不一致 → CRIT；逐条文本差异 → WARN（两表本就详略不同，不判全文相等）
 *   3. 孤儿文件（WARN）：docs/rules、docs/reference、contexts、templates 下未被任何索引文档引用
 *   4. 关键文件存在性（CRIT）：CLAUDE.md/SKILL.md/核心脚本/agents 四件套/workflow
 *
 * 退出码：0 = 通过（可含 WARN）；1 = 存在关键问题（CRIT）。
 * =============================================================================
 */
'use strict';

const fs = require('fs');
const path = require('path');

const argIdx = (n) => process.argv.indexOf(n);
const skillRoot = argIdx('--skill') >= 0 ? path.resolve(process.argv[argIdx('--skill') + 1]) : path.resolve(__dirname, '..');

let critical = 0;
let warnings = 0;

function log(msg) { console.log(`[stocktake] ${msg}`); }
function crit(msg) { critical++; console.log(`[CRIT] ${msg}`); }
function warn(msg) { warnings++; console.log(`[WARN] ${msg}`); }

const read = (f) => { try { return fs.readFileSync(f, 'utf8'); } catch (_) { return null; } };

// ---------------------------------------------------------------------------
// 检查 4：关键文件存在性
// ---------------------------------------------------------------------------
const REQUIRED = [
  'CLAUDE.md', 'SKILL.md',
  '.claude/agents/planner.md', '.claude/agents/developer.md', '.claude/agents/reviewer.md', '.claude/agents/tester.md',
  '.claude/workflows/vibe-coding-loop.md',
  'templates/module-loop-template.js', 'templates/check-gates.js', 'templates/delivery-gate.js',
  'templates/install-precommit.js', 'templates/audit-scan.js',
];
function checkRequired() {
  for (const rel of REQUIRED) {
    if (!fs.existsSync(path.join(skillRoot, rel))) crit(`关键文件缺失: ${rel}`);
  }
}

// ---------------------------------------------------------------------------
// 检查 1：引用完整性（CLAUDE.md @ 引用 + SKILL.md 反引号路径）
// ---------------------------------------------------------------------------
// CLAUDE.md：@ 引用 = 技能/项目相对路径；SKILL.md：反引号路径 = 技能相对文件
// ALLOW_MISSING：文档里泛指的「项目级生成物/用户文件」，不属于技能包，跳过存在性检查
const ALLOW_MISSING = new Set(['plan.md', 'acceptance-criteria.md', 'tech-stack.md', 'changelog.md', 'review-report.md', 'test-report.md']);
const CLAUDE_REF_RE = /@([\w./-]+\.(?:md|js))/g;
const SKILL_REF_RE = /`([\w./-]+\.(?:md|js))`/g;
function checkRefs() {
  const claude = read(path.join(skillRoot, 'CLAUDE.md')) || '';
  const skill = read(path.join(skillRoot, 'SKILL.md')) || '';
  const seen = new Set();
  const verify = (rel) => {
    if (seen.has(rel) || ALLOW_MISSING.has(rel)) return;
    seen.add(rel);
    if (!fs.existsSync(path.join(skillRoot, rel))) crit(`引用文件不存在: ${rel}`);
  };
  CLAUDE_REF_RE.lastIndex = 0;
  let m;
  while ((m = CLAUDE_REF_RE.exec(claude)) !== null) verify(m[1]);
  SKILL_REF_RE.lastIndex = 0;
  while ((m = SKILL_REF_RE.exec(skill)) !== null) verify(m[1]);
}

// ---------------------------------------------------------------------------
// 检查 2：铁律同步（条数 CRIT，逐条差异 WARN）
// ---------------------------------------------------------------------------
function parseRules(text) {
  const rows = [];
  const re = /^\| (\d+) \| (.+?) \| .+ \| .+ \|$/gm;
  let m;
  while ((m = re.exec(text)) !== null) rows.push({ n: Number(m[1]), rule: m[2].trim() });
  return rows;
}
function checkRulesSync() {
  const claude = read(path.join(skillRoot, 'CLAUDE.md')) || '';
  const skill = read(path.join(skillRoot, 'SKILL.md')) || '';
  const a = parseRules(claude);
  const b = parseRules(skill);
  // CLAUDE.md 现为英文精简版、SKILL.md 保留中文全文，逐条文本比对不再适用（纯 WARN 噪音）；
  // 仅校验条数一致，条数不一致视为 CRIT。
  if (a.length !== b.length) {
    crit(`铁律条数不一致: CLAUDE.md ${a.length} 条 vs SKILL.md ${b.length} 条`);
  }
}

// ---------------------------------------------------------------------------
// 检查 3：孤儿文件（未被任何索引文档引用）
// ---------------------------------------------------------------------------
const SCAN_DIRS = ['docs/rules', 'docs/reference', 'contexts', 'templates'];
function collectFiles(dir, out) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (_) { return; }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) collectFiles(p, out);
    else if (/\.(md|js)$/.test(e.name)) out.push({ rel: path.relative(skillRoot, p).replace(/\\/g, '/'), base: e.name });
  }
}
function checkOrphans() {
  const indexDocs = ['CLAUDE.md', 'SKILL.md', 'docs/reference/directory-structure.md']
    .map(f => read(path.join(skillRoot, f)) || '').join('\n');
  const files = [];
  for (const d of SCAN_DIRS) collectFiles(path.join(skillRoot, d), files);
  for (const f of files) {
    if (!indexDocs.includes(f.rel) && !indexDocs.includes(f.base)) warn(`孤儿文件（未被任何索引文档引用）: ${f.rel}`);
  }
}

// ---------------------------------------------------------------------------
function main() {
  log(`skill-stocktake: ${skillRoot}`);
  checkRequired();
  checkRefs();
  checkRulesSync();
  checkOrphans();
  if (critical) {
    console.error(`[stocktake] ${critical} 项关键问题（退出码 1）`);
    process.exit(1);
  }
  if (warnings) log(`${warnings} 项警告（不阻断）`);
  log('体检通过 ✅');
  process.exit(0);
}

main();
