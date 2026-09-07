#!/usr/bin/env node
/**
 * install-precommit.js — 安装 git pre-commit 钩子
 * =============================================================================
 * 用途：把 check-gates.js 的 precommit 模式挂到项目 .git/hooks/pre-commit，
 *       实现「提交前自动代码闸门」（DSH 无 Claude Code hooks 的等价替代）。
 *
 * 用法：node templates/install-precommit.js [项目根（默认 cwd）]
 *
 * 行为：非 git 仓库 → 退出 1；已存在 pre-commit 钩子 → 拒绝覆盖，退出 1；
 *       成功 → 写入可执行 sh 脚本并提示。
 * =============================================================================
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = process.argv[2] || process.cwd();
const gatesPath = path.resolve(__dirname, 'check-gates.js');

function gitDir() {
  try {
    const out = execFileSync('git', ['rev-parse', '--git-dir'], { cwd: root, encoding: 'utf8' }).trim();
    return path.resolve(root, out);
  } catch (_) { return null; }
}

function main() {
  const gd = gitDir();
  if (!gd) {
    console.error(`[install-precommit] 不是 git 仓库: ${root}`);
    process.exit(1);
  }
  if (!fs.existsSync(gatesPath)) {
    console.error(`[install-precommit] check-gates.js 不存在: ${gatesPath}`);
    process.exit(1);
  }
  const hookPath = path.join(gd, 'hooks', 'pre-commit');
  if (fs.existsSync(hookPath)) {
    console.error(`[install-precommit] 已存在 pre-commit 钩子，拒绝覆盖: ${hookPath}`);
    console.error('  请手工合并后删除该文件再重试。');
    process.exit(1);
  }
  const nodeCmd = process.execPath.replace(/\\/g, '/');
  const gates = gatesPath.replace(/\\/g, '/');
  const script =
    '#!/bin/sh\n' +
    '# installed by vibe-coding-workflow install-precommit.js\n' +
    `"${nodeCmd}" "${gates}" precommit || exit 1\n`;
  fs.writeFileSync(hookPath, script, { mode: 0o755 });
  console.log(`[install-precommit] 已安装: ${hookPath}`);
  console.log('[install-precommit] 之后每次 git commit 前自动执行 check-gates.js precommit（铁律 3/4/5/9）');
  process.exit(0);
}

main();
