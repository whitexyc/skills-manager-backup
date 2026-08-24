#!/usr/bin/env node
/**
 * delivery-gate.js — 记忆写入新鲜度闸门（确定性 mtime 校验，零 AI 推断）
 * =============================================================================
 * 移植自 ECC skills/delivery-gate（module-001）。用途：机械强制「记忆三件套
 * 定期更新」——铁律 11 的落地：文件 mtime 超窗即阻塞，不依赖 LLM 自觉。
 * 由 module-loop-template.js 在 TEST 阶段完成后自动执行（失败 → 退出码 4），
 * 也可独立运行：node templates/delivery-gate.js
 *
 * 检查项：
 *   1. 记忆三件套新鲜度  fs.statSync mtime，关键文件超窗 → 阻塞
 *   2. 合理化借口检测    正则扫描 specs/ 最新 changelog/test-report 尾部（仅警告，永不阻塞）
 *   3. 磁盘空间          默认关闭，设 GATE_DISK_MIN_GB 开启
 *
 * 环境变量：
 *   GATE_ENABLED=false        整体关闭
 *   GATE_MEMORY_HOURS=24      新鲜窗口（小时）
 *   GATE_MEMORY_CRITICAL      关键文件（默认 project-context.md,agent-activity-log.md）
 *   GATE_DISK_MIN_GB=0        磁盘下限 GB（0=关闭）
 *
 * 退出码：0 = 通过；1 = 存在阻塞项。
 * =============================================================================
 */
'use strict';

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// 配置（可经 env 覆盖）
// ---------------------------------------------------------------------------
const CFG = {
  memoryHours: Number(process.env.GATE_MEMORY_HOURS) || 24,
  critical: (process.env.GATE_MEMORY_CRITICAL || 'project-context.md,agent-activity-log.md')
    .split(',').map(s => s.trim()).filter(Boolean),
  diskMinGB: Number(process.env.GATE_DISK_MIN_GB) || 0,
  memoryDir: 'memory',
};
const MEMORY_FILES = ['project-context.md', 'file-index.md', 'agent-activity-log.md'];

let failures = 0;

function log(msg) { console.log(`[delivery] ${msg}`); }
function fail(msg) { failures++; console.log(`[FAIL] 铁律11 ${msg}`); appendViolation('11', msg); }

// 违规台账：失败时自动追加 memory/violations.md（规则同 check-gates.js）
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

function warn(msg) { console.log(`[WARN] ${msg}`); }

function hoursSince(ms) { return (Date.now() - ms) / 3600e3; }

// ---------------------------------------------------------------------------
// 检查 1：记忆三件套新鲜度（关键文件超窗 → 阻塞）
// ---------------------------------------------------------------------------
function gateMemoryFreshness() {
  const missing = [];
  for (const f of MEMORY_FILES) {
    const p = path.join(CFG.memoryDir, f);
    if (!fs.existsSync(p)) { missing.push(f); continue; }
    const h = hoursSince(fs.statSync(p).mtimeMs);
    const isCritical = CFG.critical.includes(f);
    if (h > CFG.memoryHours) {
      if (isCritical) fail(`记忆文件未在 ${CFG.memoryHours}h 内更新: ${p}（${h.toFixed(1)}h 前，关键文件）`);
      else warn(`记忆文件未在 ${CFG.memoryHours}h 内更新: ${p}（${h.toFixed(1)}h 前，非关键）`);
    } else {
      log(`[OK] ${p} mtime ${h.toFixed(1)}h 前（≤${CFG.memoryHours}h）`);
    }
  }
  if (missing.length) fail(`记忆文件缺失: ${missing.join(', ')}`);
}

// ---------------------------------------------------------------------------
// 检查 2：合理化借口检测（启发式，只警告不阻塞）
// ---------------------------------------------------------------------------
const RATIONALIZATION_RE =
  /跳过(测试|验证)|先(不|别)管(测试|验证)|暂(时|且)(不|跳过)(测试|验证)|回头再(测|补|写)|下次(再|一定)补|先上线再说|ship it first|pre-?existing bug|skip (the )?tests? (for now|temporarily)|will fix later/i;

function gateRationalization() {
  const specRoot = path.join(process.cwd(), 'specs');
  const texts = [];
  (function walk(dir) {
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (_) { return; }
    for (const e of entries) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (/^(changelog|test-report)\.md$/.test(e.name)) {
        try { texts.push(fs.readFileSync(p, 'utf8')); } catch (_) {}
      }
    }
  })(specRoot);
  let hits = 0;
  for (const t of texts) {
    for (const line of t.split(/\r?\n/).slice(-60)) {
      if (RATIONALIZATION_RE.test(line)) { hits++; warn(`检测到合理化借口模式: ${line.trim().slice(0, 80)}`); }
    }
  }
  if (!hits) log('[OK] 未发现合理化借口模式');
}

// ---------------------------------------------------------------------------
// 检查 3：磁盘空间（默认关闭）
// ---------------------------------------------------------------------------
function gateDisk() {
  if (!CFG.diskMinGB) { log('[skip] 磁盘检查关闭（GATE_DISK_MIN_GB 未设）'); return; }
  try {
    const s = fs.statfsSync(process.cwd());
    const freeGB = (s.bavail * s.bsize) / (1024 ** 3);
    if (freeGB < CFG.diskMinGB) fail(`磁盘剩余 ${freeGB.toFixed(1)}GB < ${CFG.diskMinGB}GB`);
    else log(`[OK] 磁盘剩余 ${freeGB.toFixed(1)}GB`);
  } catch (_) { log('[warn] statfs 不可用，跳过磁盘检查'); }
}

// ---------------------------------------------------------------------------
function main() {
  if (process.env.GATE_ENABLED === 'false') { log('已禁用（GATE_ENABLED=false）'); process.exit(0); }
  log(`记忆新鲜窗口 ${CFG.memoryHours}h | 关键文件: ${CFG.critical.join(', ')}`);
  gateMemoryFreshness();
  gateRationalization();
  gateDisk();
  if (failures) {
    console.error(`[delivery] ${failures} 项未通过（退出码 1）`);
    process.exit(1);
  }
  log('全部通过 ✅');
  process.exit(0);
}

main();
