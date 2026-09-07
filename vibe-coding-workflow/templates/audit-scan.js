#!/usr/bin/env node
/**
 * audit-scan.js — 安全审计脚本（AgentShield 思路的轻量本地版）
 * =============================================================================
 * 用途：把「审计 agent/脚本/配置的安全面」做成确定性检查——密钥泄露、危险命令、
 *       提示注入模式。纯 Node 零依赖，风格对齐 check-gates.js / delivery-gate.js。
 *
 * 用法：
 *   node templates/audit-scan.js                     # 扫当前目录（代码/配置文件）
 *   node templates/audit-scan.js --path <项目根>     # 指定目标
 *   node templates/audit-scan.js --with-md           # 额外扫 .md 的提示注入模式（WARN）
 *
 * 分类策略：
 *   - 代码/配置文件（.js/.ts/.py/.json/.yaml/.yml/.env 系列/.toml/.sh/.ps1/.mjs/.cjs）：
 *       密钥泄露（CRIT）+ 危险命令（CRIT，跳过注释行）
 *   - .md（仅 --with-md）：提示注入模式（WARN，永不阻断）——避免文档示例误报
 *   - 跳过目录：node_modules/.git/.mnemon/.dsh/dist/build/.ua/.codegraph/.trash-*
 *
 * 退出码：0 = 通过；1 = 存在关键问题（CRIT）。
 * 诚实声明：正则启发式，`password=长字面量` 等可能误报；阈值 12+ 字符。
 * =============================================================================
 */
'use strict';

const fs = require('fs');
const path = require('path');

const argIdx = (n) => process.argv.indexOf(n);
const target = argIdx('--path') >= 0 ? process.argv[argIdx('--path') + 1] : process.cwd();
const withMd = process.argv.includes('--with-md');
const root = path.resolve(target);

const CODE_EXTS = ['.js', '.ts', '.py', '.json', '.yaml', '.yml', '.toml', '.sh', '.ps1', '.mjs', '.cjs'];
const SKIP_DIR = /(^|\/)(node_modules|\.git|\.mnemon|\.dsh|dist|build|\.ua|\.codegraph|\.trash-?[^/]*)(\/|$)/;
const SKIP_FILE = /(package-lock|pnpm-lock|yarn\.lock|\.min\.)/;

let critical = 0;
let warnings = 0;

function log(msg) { console.log(`[audit] ${msg}`); }
function crit(msg, loc) { critical++; console.log(`[CRIT] ${msg} (${loc})`); }
function warn(msg, loc) { warnings++; console.log(`[WARN] ${msg} (${loc})`); }

// 密钥泄露（高置信度）
const SECRET_RE = [
  /sk-[A-Za-z0-9]{16,}/g,
  /ghp_[A-Za-z0-9]{30,}/g,
  /AKIA[0-9A-Z]{16}/g,
  /(api[_-]?key|secret|token|passwd|password)\s*[:=]\s*["'][A-Za-z0-9_\-]{12,}["']/gi,
  /BEGIN (RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY/g,
];
// 危险命令（跳过注释行）
const DANGER_RE = [
  /\brm\s+-rf\s+(\/|\$HOME|~|\*)/,
  /curl[^\n|]*\|\s*(ba)?sh\b/,
  /git\s+checkout\s+(-f|--force)|\bgit\s+reset\s+--hard\b/,
  /find\s+[^\n]*\s-exec\s+(rm|sh|bash)\b/,
  /\bchmod\s+777\b/,
  /eval\s*\(\s*process\.env/,
];
// 提示注入模式（.md，WARN）
const INJECT_RE = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions|rules|prompts?)/i,
  /disregard\s+(all\s+)?(previous|prior)\s+/i,
  /bypass\s+(validation|security|safety|rules)/i,
  /do not tell the (user|human)/i,
];

function walk(dir) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (_) { return; }
  for (const e of entries) {
    if (e.name.startsWith('.') && !e.name.startsWith('.env')) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (SKIP_DIR.test(e.name)) continue;
      walk(p);
    } else if (!SKIP_FILE.test(e.name)) {
      const ext = path.extname(e.name).toLowerCase();
      if (CODE_EXTS.includes(ext) || e.name.startsWith('.env') || (withMd && ext === '.md')) scanFile(p);
    }
  }
}

function scanFile(file) {
  let text;
  try { text = fs.readFileSync(file, 'utf8'); } catch (_) { return; }
  const isMd = path.extname(file).toLowerCase() === '.md';
  const lines = text.split(/\r?\n/);
  lines.forEach((line, i) => {
    const loc = `${path.relative(root, file)}:${i + 1}`;
    if (isMd) {
      for (const re of INJECT_RE) { re.lastIndex = 0; if (re.test(line)) { warn(`疑似提示注入模式: ${line.trim().slice(0, 60)}`, loc); break; } }
    } else {
      for (const re of SECRET_RE) { re.lastIndex = 0; if (re.test(line)) { crit(`疑似密钥泄露: ${line.trim().slice(0, 60)}`, loc); break; } }
      if (!/^\s*(#|\/\/)/.test(line)) {
        for (const re of DANGER_RE) { re.lastIndex = 0; if (re.test(line)) { crit(`危险命令: ${line.trim().slice(0, 60)}`, loc); break; } }
      }
    }
  });
}

function main() {
  log(`audit-scan: ${root}${withMd ? ' (+md 注入检查)' : ''}`);
  walk(root);
  if (critical) {
    console.error(`[audit] ${critical} 项关键问题（退出码 1）`);
    process.exit(1);
  }
  if (warnings) log(`${warnings} 项警告（不阻断）`);
  log('审计通过 ✅');
  process.exit(0);
}

main();
