#!/usr/bin/env node
/**
 * check-gates.js — 规则闸门校验脚本（Vibe Coding 闭环工作流）
 * =============================================================================
 * 作用：把 CLAUDE.md §0 铁律中「可机械校验」的条目落地为确定性脚本。
 *       由 module-loop-template.js 在 DEVELOP / REVIEW 阶段退出前自动执行，
 *       任一 gate 失败 → 非零退出码（循环脚本转退出码 4：规则 gate 未通过）。
 *
 * 用法：
 *   node templates/check-gates.js develop     # 代码闸门（铁律 2/3/4/5/9/12）
 *   node templates/check-gates.js review      # 审查证据闸门（review-report 须含 文件:行号 证据）
 *   node templates/check-gates.js precommit   # 提交前闸门（git 暂存区，铁律 3/4/5/9；经 install-precommit.js 挂载）
 *   node templates/check-gates.js develop -v  # 详细输出（含 [OK]）
 *
 * 环境变量：
 *   GATE_ENABLED=false        整体关闭（等价 config.gates.enabled=false）
 *   GATE_DIFF_BASE=develop    diff 基准（默认自动：origin/develop → develop → main → HEAD~1）
 *   GATE_MODULE=module-XXX    当前模块号（违规台账行使用，模块循环自动注入）
 *   GATE_VIOLATIONS_FILE=...  违规台账路径（默认 cwd/memory/violations.md）
 *   GATE_MAX_MODULE_LINES=200 铁律 2 上限
 *   GATE_MAX_METHOD_LINES=50  铁律 3 方法上限
 *   GATE_MAX_CLASS_LINES=500  铁律 3 类上限
 *   GATE_REVIEW_EVIDENCE_MIN=3 审查证据最少出现次数
 *
 * 退出码：0 = 全部通过；非 0 = 存在失败项（逐条打印 [FAIL] 与 file:line）。
 *
 * 诚实声明：除「新增行数」为精确 git 统计外，其余均为启发式检查
 * （正则/括号平衡近似），用于拦截明显违规，不能替代 Review。
 * 误报可经 config.gates 关闭单项（见模块循环脚本 §9.1 配置说明）。
 * =============================================================================
 */
'use strict';

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// 配置（可经 env 覆盖）
// ---------------------------------------------------------------------------
const CFG = {
  maxModuleLines: Number(process.env.GATE_MAX_MODULE_LINES) || 200,
  maxMethodLines: Number(process.env.GATE_MAX_METHOD_LINES) || 50,
  maxClassLines: Number(process.env.GATE_MAX_CLASS_LINES) || 500,
  reviewEvidenceMin: Number(process.env.GATE_REVIEW_EVIDENCE_MIN) || 3,
  sourceExts: ['.java', '.py', '.ts', '.tsx', '.js', '.jsx'],
  testPathRe: /(^|\/)(test|tests|__tests__|spec)(\/|\.)|\.(test|spec)\./,
  ignoreDirRe: /(^|\/)(node_modules|dist|build|\.git|\.claude|docs|specs|memory|templates|frontend)(\/|$)/,
};

const phase = (process.argv[2] || 'develop').toLowerCase();
const PRE_COMMIT = phase === 'precommit';
const verbose = process.argv.includes('-v') || process.argv.includes('--verbose');
let failures = 0;
const failMsgs = [];

function log(msg) { console.log(`[gate] ${msg}`); }
function ok(rule, msg) { if (verbose) log(`[OK]   铁律${rule} ${msg}`); }
function fail(rule, msg) { failures++; failMsgs.push(`铁律${rule}: ${msg}`); console.log(`[FAIL] 铁律${rule} ${msg}`); appendViolation(rule, msg); }

// 违规台账：失败时自动追加 memory/violations.md（GATE_VIOLATIONS_FILE 可覆盖；GATE_MODULE 由模块循环注入）
function appendViolation(rule, msg) {
  try {
    const esc = (s) => String(s).replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
    const trunc = (s) => Array.from(s).slice(0, 80).join('');
    const file = process.env.GATE_VIOLATIONS_FILE || path.join(process.cwd(), 'memory', 'violations.md');
    const mod = trunc(esc(process.env.GATE_MODULE || 'unknown'));
    const date = new Date().toISOString().slice(0, 10);
    const ruleS = esc(rule);
    const reason = trunc(esc(msg));
    if (!fs.existsSync(file)) {
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, '# 违规台账（check-gates/delivery-gate 自动收集）\n\n> 格式：模块 | 铁律 | 日期 | 原因；轮次与聚合见 docs/rules/rules-distill.md。\n\n| 模块 | 铁律 | 日期 | 原因 |\n|------|------|------|------|\n');
    }
    fs.appendFileSync(file, `| ${mod} | ${ruleS} | ${date} | ${reason} |\n`);
  } catch (_) { /* 台账写入失败不阻断闸门 */ }
}

// ---------------------------------------------------------------------------
// git / 文件发现
// ---------------------------------------------------------------------------
function run(cmd, args) {
  try { return execFileSync(cmd, args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }); }
  catch (e) {
    if (e && (e.code === 'ERR_CHILD_PROCESS_STDIO_MAXBUFFER' || String(e.message).includes('maxBuffer'))) {
      console.warn('[gate][warn] git 输出超过 64MB 上限，结果可能不完整（静默失效风险）');
    }
    return '';
  }
}

function guessBase() {
  // GATE_DIFF_BASE 环境变量优先；随后按 origin/develop → develop → main → HEAD~1 探测。
  // 跳过与 HEAD 相同的候选（如直接在 main 上开发时 main...HEAD 为空 diff，
  // 会导致 gitChangedFiles 回退扫全部未提交文件——2026-08-26 实测 bug）
  const candidates = (process.env.GATE_DIFF_BASE ? [process.env.GATE_DIFF_BASE] : [])
    .concat(['origin/develop', 'develop', 'main', 'HEAD~1']);
  let head;
  try { head = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(); } catch (_) { head = null; }
  for (const b of candidates) {
    try {
      const r = execFileSync('git', ['rev-parse', '--verify', b], { encoding: 'utf8' }).trim();
      if (!head || r !== head) return b;
    } catch (_) {}
  }
  return null;
}

function gitChangedFiles() {
  const base = guessBase();
  if (!base) return null;
  let files = run('git', ['diff', '--name-only', `${base}...HEAD`]).split('\n').map(s => s.trim()).filter(Boolean);
  if (!files.length) files = run('git', ['diff', '--name-only', 'HEAD']).split('\n').map(s => s.trim()).filter(Boolean);
  return files.filter(f => fs.existsSync(f));
}

// 生产代码变更文件（测试/文档豁免）；precommit 模式取 git 暂存区
function gitStagedFiles() {
  let files = run('git', ['diff', '--cached', '--name-only', '--diff-filter=ACM']).split('\n').map(s => s.trim()).filter(Boolean);
  if (!files.length) files = run('git', ['diff', '--cached', '--name-only']).split('\n').map(s => s.trim()).filter(Boolean);
  return files.filter(f => fs.existsSync(f));
}

function changedSourceFiles() {
  if (PRE_COMMIT) {
    const staged = gitStagedFiles();
    if (staged.length) return staged.filter(f => CFG.sourceExts.includes(path.extname(f)) && !CFG.testPathRe.test(f) && !CFG.ignoreDirRe.test(f));
    return [];
  }
  const changed = gitChangedFiles();
  if (changed && changed.length) {
    return changed.filter(f => CFG.sourceExts.includes(path.extname(f)) && !CFG.testPathRe.test(f) && !CFG.ignoreDirRe.test(f));
  }
  return walkSourceFiles(process.cwd());
}

function walkSourceFiles(dir, out = []) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (_) { return out; }
  for (const e of entries) {
    if (e.name.startsWith('.') || CFG.ignoreDirRe.test(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walkSourceFiles(p, out);
    else if (CFG.sourceExts.includes(path.extname(e.name)) && !CFG.testPathRe.test(p.replace(/\\/g, '/'))) out.push(p);
  }
  return out;
}

// ---------------------------------------------------------------------------
// 铁律 2：新增生产代码行数（git 精确统计）
// ---------------------------------------------------------------------------
function gateModuleLines() {
  const base = guessBase();
  if (!base) { log('[warn] 无可用 git diff 基准，跳过「新增生产代码 ≤ ' + CFG.maxModuleLines + ' 行」闸门'); return; }
  const out = run('git', ['diff', '--numstat', `${base}...HEAD`]);
  let added = 0;
  for (const line of out.split('\n')) {
    const m = line.trim().split(/\t+/);
    if (m.length < 3) continue;
    const n = Number(m[0]);
    const file = m[2];
    if (Number.isFinite(n) && n > 0 && CFG.sourceExts.includes(path.extname(file)) && !CFG.testPathRe.test(file) && !CFG.ignoreDirRe.test(file)) added += n;
  }
  log(`[gate] 新增生产代码 ${added} 行（上限 ${CFG.maxModuleLines}）`);
  if (added > CFG.maxModuleLines) fail(2, `新增生产代码 ${added} 行 > ${CFG.maxModuleLines}（测试/注释豁免；复杂模块须经 plan.md 申请放宽）`);
  else ok(2, `新增生产代码 ${added} ≤ ${CFG.maxModuleLines}`);
}

// ---------------------------------------------------------------------------
// 铁律 3/4：方法/类行数 + 文档注释（启发式：括号平衡 + 缩进）
// ---------------------------------------------------------------------------
function braceScan(lines) {
  // 返回 [{kind:'method'|'class'|'block', start, end, sig}]
  const out = [];
  let depth = 0;
  let cur = null;
  const classRe = /\b(class|interface|enum|type|trait|struct)\b[^;{]*\{/;
  const methodRe = /[A-Za-z_$][\w$<>\[\], .]*[A-Za-z_$]\s*\([^;{}]*\)\s*(\{|throws\b)/;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const opens = (line.match(/\{/g) || []).length;
    const closes = (line.match(/\}/g) || []).length;
    const net = opens - closes;
    if (depth === 0 && net > 0) {
      const trimmed = line.trim();
      if (classRe.test(trimmed)) cur = { kind: 'class', start: i };
      else if (methodRe.test(trimmed)) cur = { kind: 'method', start: i };
      else cur = { kind: 'block', start: i };
      depth = net;
    } else if (depth > 0) {
      depth += net;
      if (depth <= 0) { if (cur) { cur.end = i; out.push(cur); } cur = null; depth = 0; }
    }
  }
  return out;
}

function pyScan(lines) {
  const out = [];
  let cur = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const indent = (line.match(/^\s*/)[0]).length;
    const t = line.trim();
    if (/^(async\s+)?def\s+|^class\s/.test(t)) {
      if (cur) { cur.end = i - 1; out.push(cur); }
      cur = { kind: /^class\s/.test(t) ? 'class' : 'method', start: i, indent };
    } else if (cur && t !== '' && !t.startsWith('#') && indent <= cur.indent) {
      cur.end = i - 1; out.push(cur); cur = null;
    }
  }
  if (cur) { cur.end = lines.length - 1; out.push(cur); }
  return out;
}

function hasDocAbove(lines, start) {
  for (let i = start - 1; i >= 0; i--) {
    const t = lines[i].trim();
    if (t === '') continue;
    if (t.startsWith('/**') || t.startsWith('/*') || t.startsWith('///')) return true;
    if (t.startsWith('"""') || t.startsWith("'''")) return true;
    if (t.startsWith('#')) return true;
    if (t.startsWith('@') || t.startsWith('*') || t.startsWith('//')) continue; // 注解/延续注释
    return false; // 碰到代码行
  }
  return false;
}

// Python docstring 在 def 下方，单独处理
function hasDocBelow(lines, start) {
  for (let i = start + 1; i < Math.min(start + 5, lines.length); i++) {
    const t = lines[i].trim();
    if (t.startsWith('"""') || t.startsWith("'''")) return true;
    if (t !== '' && !t.startsWith('#') && !t.startsWith('@')) return false;
  }
  return false;
}

function gateCodeShape() {
  const startFails = failures;
  const files = changedSourceFiles();
  if (!files.length) { log('[gate] 无变更的生产代码文件，跳过 铁律3/4/5/9 代码闸门'); return; }
  log(`扫描 ${files.length} 个生产代码文件`);
  let methods = 0, classes = 0, missingDoc = 0;
  for (const file of files) {
    let text;
    try { text = fs.readFileSync(file, 'utf8'); } catch (_) { continue; }
    const lines = text.split(/\r?\n/);
    const isPy = file.endsWith('.py');
    const units = isPy ? pyScan(lines) : braceScan(lines);
    for (const u of units) {
      const len = u.end - u.start + 1;
      if (u.kind === 'class') {
        classes++;
        if (len > CFG.maxClassLines) fail(3, `类超长 ${len} 行 > ${CFG.maxClassLines}: ${file}:${u.start + 1}`);
      } else if (u.kind === 'method') {
        methods++;
        if (len > CFG.maxMethodLines) fail(3, `方法超长 ${len} 行 > ${CFG.maxMethodLines}: ${file}:${u.start + 1}`);
        if (!(isPy ? hasDocBelow(lines, u.start) : hasDocAbove(lines, u.start))) { missingDoc++; fail(4, `public/导出方法缺文档注释: ${file}:${u.start + 1}`); }
      }
    }
  }
  if (failures === startFails) {
    ok(3, `方法 ${methods} 个 / 类 ${classes} 个，行数均在限制内`);
    ok(4, `方法文档注释齐全（检查 ${methods} 个方法）`);
  }
  if (missingDoc) log(`缺文档注释方法数: ${missingDoc}`);
}

// ---------------------------------------------------------------------------
// 铁律 5：空 catch / 裸 except（行扫描 + 括号平衡）
// ---------------------------------------------------------------------------
function gateEmptyCatch() {
  const startFails = failures;
  const files = changedSourceFiles();
  for (const file of files) {
    let text;
    try { text = fs.readFileSync(file, 'utf8'); } catch (_) { continue; }
    const lines = text.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/\bcatch\s*\([^)]*\)/.test(line)) {
        // 找到 catch 后的首个 {（允许换行，如 catch (e) 换行后 { 的空块）
        let braceLine = -1;
        for (let k = i; k < Math.min(i + 5, lines.length); k++) {
          if (lines[k].includes('{')) { braceLine = k; break; }
        }
        if (braceLine === -1) continue;
        // 括号匹配，检查函数体是否为空
        let depth = 0, j = braceLine;
        const body = [];
        let started = false;
        for (; j < lines.length; j++) {
          const o = (lines[j].match(/\{/g) || []).length;
          const c = (lines[j].match(/\}/g) || []).length;
          if (!started && o > 0) { started = true; }
          depth += o - c;
          if (started && j > braceLine) body.push(lines[j].trim());
          if (started && depth <= 0) break;
        }
        const nonComment = body.filter(l => l !== '' && !l.startsWith('//') && !l.startsWith('*') && !l.startsWith('/*'));
        if (nonComment.length === 0) fail(5, `空 catch 块（吞异常）: ${file}:${i + 1}`);
      }
      if (/^\s*except[^:]*:\s*(#.*)?$/.test(line)) {
        const next = (lines[i + 1] || '').trim();
        if (next === 'pass' || next === '...') fail(5, `裸 except + pass（吞异常）: ${file}:${i + 1}`);
      }
    }
  }
  if (failures === startFails) ok(5, '未发现空 catch / 裸 except');
}

// ---------------------------------------------------------------------------
// 铁律 9：SQL 拼接 / 硬编码密钥
// ---------------------------------------------------------------------------
function gateSecurity() {
  const startFails = failures;
  const sqlConcatRe = /["'`][^"'`]*(select|insert|update|delete|from|where)[^"'`]*["'`]\s*\+|f["'][^"']*(select|insert|update|delete)[^"']*["']|["'`]select[^"'`]*["'`]\s*%/gi;
  const secretRe = /(api[_-]?key|secret|passwd|password)\s*[:=]\s*["'][A-Za-z0-9_\-]{8,}["']|sk-[A-Za-z0-9]{16,}/gi;
  const files = changedSourceFiles();
  for (const file of files) {
    let text;
    try { text = fs.readFileSync(file, 'utf8'); } catch (_) { continue; }
    const lines = text.split(/\r?\n/);
    lines.forEach((line, idx) => {
      if (sqlConcatRe.test(line)) fail(9, `疑似 SQL 字符串拼接: ${file}:${idx + 1}: ${line.trim().slice(0, 80)}`);
      if (secretRe.test(line)) fail(9, `疑似硬编码密钥/口令: ${file}:${idx + 1}: ${line.trim().slice(0, 80)}`);
    });
  }
  if (failures === startFails) ok(9, '未发现 SQL 拼接 / 硬编码密钥');
}

// ---------------------------------------------------------------------------
// 铁律 12：changelog 须含验证命令输出（DEVELOP 阶段）
// ---------------------------------------------------------------------------
function gateChangelogEvidence() {
  const specRoot = path.join(process.cwd(), 'specs');
  const changelogs = [];
  (function walk(dir) {
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (_) { return; }
    for (const e of entries) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name === 'changelog.md') changelogs.push(p);
    }
  })(specRoot);
  if (!changelogs.length) { fail(12, 'specs/**/changelog.md 不存在（Developer 未产出变更日志）'); return; }
  const latest = changelogs.sort().pop();
  const text = fs.readFileSync(latest, 'utf8');
  const fenceRe = /```[^\n]*\n([\s\S]*?)```/g;
  let hasCommandBlock = false;
  let fm;
  while ((fm = fenceRe.exec(text)) !== null) {
    if (/\b(git|make|pytest|npm|mvn|gradle|python|node|uv|pip|docker|\.\/(test|run))\b/.test(fm[1])) { hasCommandBlock = true; break; }
  }
  if (!hasCommandBlock) fail(12, `${latest} 中未发现「验证命令 + 输出」代码块（自跑 lint/测试并贴输出为证）`);
  else ok(12, `${latest} 含验证命令输出`);
}

// ---------------------------------------------------------------------------
// REVIEW 阶段：review-report 证据闸门（文件:行号）
// ---------------------------------------------------------------------------
function gateReviewEvidence() {
  const specRoot = path.join(process.cwd(), 'specs');
  const reports = [];
  (function walk(dir) {
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (_) { return; }
    for (const e of entries) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name === 'review-report.md') reports.push(p);
    }
  })(specRoot);
  if (!reports.length) { fail('Review', 'specs/**/review-report.md 不存在'); return; }
  const latest = reports.sort().pop();
  const text = fs.readFileSync(latest, 'utf8');
  const evidence = text.match(/[A-Za-z0-9_\-./]+\.(java|py|ts|tsx|js|jsx):\d+/g) || [];
  if (evidence.length < CFG.reviewEvidenceMin) {
    fail('Review', `${latest} 证据不足：文件:行号 引用仅 ${evidence.length} 处 < ${CFG.reviewEvidenceMin}（每项 ✅/❌ 必须附证据）`);
  } else ok('Review', `${latest} 含 ${evidence.length} 处 文件:行号 证据`);
}

// ---------------------------------------------------------------------------
function main() {
  if (process.env.GATE_ENABLED === 'false') { log('已禁用（GATE_ENABLED=false）'); process.exit(0); }
  log(`phase=${phase} 起始`);
  if (phase === 'review') {
    gateReviewEvidence();
  } else if (phase === 'precommit') {
    gateCodeShape();
    gateEmptyCatch();
    gateSecurity();
  } else {
    gateModuleLines();
    gateCodeShape();
    gateEmptyCatch();
    gateSecurity();
    gateChangelogEvidence();
  }
  if (failures) {
    console.error(`[gate] ${failures} 项未通过（含 ${failMsgs.length} 条明细），退出码非 0`);
    process.exit(1);
  }
  log('全部规则通过 ✅');
  process.exit(0);
}

main();
