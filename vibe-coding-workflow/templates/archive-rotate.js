#!/usr/bin/env node
/**
 * archive-rotate.js — 记忆热区/冷区自动旋转（memory-rules §3.5 的机械化执行）
 * =============================================================================
 * 用途：把 memory/ 下两个热区文件的历史内容机械归档到 memory/archive/，防热区
 *       无界增长（delivery-gate 会在 >30KB 警告、>50KB 阻塞）。只搬不删。
 *
 * 默认处理 agent-activity-log.md，两通道：
 *   ① 日期旋转：首列含 YYYY-MM-DD 且早于 keep-days 的表格行 → 整行入档
 *   ② 超长行压缩：>compact-chars 的行原文入档，热区替换为 ≤160 字符存根 + 指针
 *
 * --pc 额外处理 project-context.md（module-017）：
 *   >pc-limit 字符且命中「✅ 完成 / | module-NNN / | adr-」的历史行 → 原文入档 +
 *   热区留 ≤pc-stub 字符存根；🔵 进行中/规划行保持完整（当前状态可读性优先）。
 *
 * 安全机制（两文件一致）：写前逐行去向自校验（每条原始非空行必须可在
 *   归档原文/热区原文/热区存根三处之一寻回，任一失败连盘都不碰）；.bak 兜底；
 *   归档文件同名自动加序号；--dry-run 走完整校验不落盘；幂等（无可旋转 exit 0）。
 *
 * 用法：node templates/archive-rotate.js [--dry-run] [--keep-days N] [--compact-chars N]
 *              [--pc] [--pc-limit N] [--pc-stub N] [targetDir]
 * 退出码：0 = 成功（含"无可旋转"）；1 = 断言失败或 I/O 错误（原文件未动）
 * =============================================================================
 */
'use strict';
const fs = require('fs');
const path = require('path');

// ---------- 参数 ----------
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const wantPc = args.includes('--pc');
function opt(name, def) {
  const i = args.indexOf('--' + name);
  if (i === -1) return def;
  const v = Number(args[i + 1]);
  if (!Number.isFinite(v) || v < 0) { console.error(`[rotate] --${name} 需要非负数字`); process.exit(1); }
  return v;
}
const keepDays = opt('keep-days', 14);
const compactChars = opt('compact-chars', 500);
const pcLimit = opt('pc-limit', 400);
const pcStub = opt('pc-stub', 120);
const dirArg = args.find((a, i) => !a.startsWith('--') && !String(args[i - 1] || '').match(/^--(keep-days|compact-chars|pc-limit|pc-stub)$/));
const TARGET = dirArg || process.cwd();
const MEM = path.join(TARGET, 'memory');
const ARCHIVE = path.join(MEM, 'archive');
const STAMP = new Date().toISOString().slice(0, 10);

function kb(n) { return (n / 1024).toFixed(1) + 'KB'; }
function die(m) { console.error(`[rotate] FAIL: ${m}（原文件未动）`); process.exit(1); }

// 归档文件名避让
function archivePathFor(base) {
  fs.mkdirSync(ARCHIVE, { recursive: true });
  let p = path.join(ARCHIVE, base), n = 2;
  while (fs.existsSync(p)) p = path.join(ARCHIVE, base.replace(/\.md$/, `-${n++}.md`));
  return p;
}
// 写前自校验：每条原始非空行 = 归档原文 ∨ 新热区原文 ∨ 存根（前 40 字符匹配 + 指针）
function selfCheck(origLines, archiveBody, newContent, pointerMark) {
  const lost = origLines.filter(l => l.trim() !== '').filter(orig => {
    const bare = orig.replace(/\r$/, '');
    if (archiveBody.includes(bare)) return false;
    if (newContent.includes(bare)) return false;
    const head = bare.slice(0, 40);
    return !newContent.split('\n').some(l => l.replace(/\r$/, '').startsWith(head) && l.includes(pointerMark));
  });
  if (lost.length) die(`写前自校验失败：${lost.length} 条原始行无去向（首条: ${lost[0].slice(0, 60)}）`);
}
// 守恒断言：入档 + 保留 = 总非空行
function conserveCheck(origLines, droppedSet) {
  const nonEmpty = origLines.filter(l => l.trim() !== '').length;
  const archived = [...droppedSet.values()].filter(l => l.trim() !== '').length;
  const kept = origLines.filter((l, i) => !droppedSet.has(i) && l.trim() !== '').length;
  if (archived + kept !== nonEmpty) die(`行数守恒校验失败：${archived}+${kept}≠${nonEmpty}`);
}
const crlfOf = (lines) => /\r$/.test(lines[0] || '');

// ===========================================================================
// 文件一：agent-activity-log.md（日期旋转 + 超长行压缩）
// ===========================================================================
const LOG = path.join(MEM, 'agent-activity-log.md');
if (!fs.existsSync(LOG)) die(`未找到 ${LOG}`);
const raw = fs.readFileSync(LOG, 'utf8');
const lines = raw.split('\n');
const crlf = crlfOf(lines);
const cut = new Date(Date.now() - keepDays * 86400e3).toISOString().slice(0, 10);

const toArchive = []; // {index, line, mode} —— date=从热区移除 / compact=热区留存根
lines.forEach((line, i) => {
  const bare = line.replace(/\r$/, '');
  if (!bare.trim()) return;
  const m = bare.match(/^\|\s*(\d{4}-\d{2}-\d{2})/);
  if (m && m[1] < cut) { toArchive.push({ index: i, line, mode: 'date' }); return; }
  if (bare.length > compactChars) { toArchive.push({ index: i, line, mode: 'compact' }); return; }
});
toArchive.sort((a, b) => a.index - b.index);
const dropped = new Map(toArchive.map(x => [x.index, x.line]));
conserveCheck(lines, dropped);

const dateHits = toArchive.filter(x => x.mode === 'date').length;
const longHits = toArchive.filter(x => x.mode === 'compact').length;
const archiveBytes = toArchive.reduce((s, x) => s + x.line.length + 1, 0);
console.log(`[rotate] 热区现状 ${kb(Buffer.byteLength(raw))} | 计划入档 ${toArchive.length} 行（日期旋转 ${dateHits} / 超长压缩 ${longHits}，约 ${kb(archiveBytes)}）| keep-days=${keepDays} compact-chars=${compactChars}${dryRun ? ' | [dry-run] 未落盘' : ''}`);

let arcLogPath = null;
if (toArchive.length) {
  const cr = (s) => crlf ? s + '\r' : s;
  const archiveBody = [
    cr(`# Agent 活动日志自动归档（${STAMP} archive-rotate）`),
    cr(''),
    cr(`> 由 templates/archive-rotate.js 生成：日期旋转 ${dateHits} 行 + 超长行压缩 ${longHits} 行（原文）。`),
    cr('> 明细权威来源仍是 specs/module-XXX/ 各报告。本文件只读不写。'),
    cr(''),
    ...toArchive.map(x => x.line),
    cr(''),
  ].join('\n');
  const newLines = lines.map((line, i) => {
    if (!dropped.has(i)) return line;
    if (toArchive.find(x => x.index === i).mode === 'date') return null; // 整行移除
    const bare = line.replace(/\r$/, '');
    const stub = bare.slice(0, 160) + `…→archive/agent-activity-log-${STAMP}-auto.md`;
    return crlf ? stub + '\r' : stub;
  }).filter(l => l !== null);
  const newContent = newLines.join('\n');
  selfCheck(lines, archiveBody, newContent, '→archive/agent-activity-log');
  if (!dryRun) {
    arcLogPath = archivePathFor(`agent-activity-log-${STAMP}-auto.md`);
    fs.copyFileSync(LOG, LOG + '.bak');
    fs.writeFileSync(arcLogPath, archiveBody);
    fs.writeFileSync(LOG, newContent);
    console.log(`[rotate] 热区 ${kb(Buffer.byteLength(raw))} → ${kb(Buffer.byteLength(fs.readFileSync(LOG, 'utf8')))}（.bak 已留存）`);
    console.log(`[rotate] 归档 → ${path.relative(TARGET, arcLogPath)}（${toArchive.length} 行原文）`);
  }
} else {
  console.log('[rotate] agent-activity-log 无可旋转内容');
}

// ===========================================================================
// 文件二（--pc）：project-context.md（历史条目压缩，🔵 进行中保持完整）
// ===========================================================================
if (wantPc) {
  const PC = path.join(MEM, 'project-context.md');
  if (!fs.existsSync(PC)) die(`--pc 未找到 ${PC}`);
  const pcRaw = fs.readFileSync(PC, 'utf8');
  const pcLines = pcRaw.split('\n');
  const pcCrlf = crlfOf(pcLines);
  const targets = new Map();
  pcLines.forEach((l, i) => {
    const bare = l.replace(/\r$/, '');
    if (bare.length > pcLimit && /(✅ 完成|\| module-\d+|\| adr-\d+)/.test(bare)) targets.set(i, bare);
  });
  conserveCheck(pcLines, targets);
  console.log(`[pc] project-context 现状 ${kb(Buffer.byteLength(pcRaw))} | 计划压缩 ${targets.size} 条历史长行（约 ${kb([...targets.values()].reduce((a, l) => a + l.length + 1, 0))}）| pc-limit=${pcLimit}${dryRun ? ' | [dry-run] 未落盘' : ''}`);

  if (targets.size) {
    const cr = (s) => pcCrlf ? s + '\r' : s;
    const pcBase = `project-context-${STAMP}-auto.md`;
    const archiveBody = [
      cr(`# 项目上下文历史条目归档（${STAMP} archive-rotate --pc）`),
      cr(''),
      cr(`> 由 templates/archive-rotate.js --pc 生成：>${pcLimit} 字符的「✅ 完成/模块清单/ADR」行原文入档，`),
      cr('> 热区留 ≤' + pcStub + ' 字符存根；🔵 进行中/规划条目保持完整。明细权威来源 specs/ 与 docs/adr/。只读不写。'),
      cr(''),
      ...targets.values(),
      cr(''),
    ].join('\n');
    const pcNewLines = pcLines.map((l, i) => {
      if (!targets.has(i)) return l;
      const stub = targets.get(i).slice(0, pcStub) + `…→memory/archive/${pcBase}`;
      return pcCrlf ? stub + '\r' : stub;
    });
    const pcNewContent = pcNewLines.join('\n');
    selfCheck(pcLines, archiveBody, pcNewContent, `→memory/archive/${pcBase}`);
    if (!dryRun) {
      const pcArcPath = archivePathFor(pcBase);
      fs.copyFileSync(PC, PC + '.bak');
      fs.writeFileSync(pcArcPath, archiveBody);
      fs.writeFileSync(PC, pcNewContent);
      console.log(`[pc] project-context ${kb(Buffer.byteLength(pcRaw))} → ${kb(Buffer.byteLength(fs.readFileSync(PC, 'utf8')))}（.bak 已留存）`);
      console.log(`[pc] 归档 → ${path.relative(TARGET, pcArcPath)}（${targets.size} 条原文）`);
    }
  } else {
    console.log('[pc] project-context 无可压缩内容');
  }
}

if (dryRun) console.log('[rotate] [dry-run] 守恒与去向校验通过，未落盘');
console.log('[rotate] 全部通过 ✅');
process.exit(0);
