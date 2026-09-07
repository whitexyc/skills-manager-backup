#!/usr/bin/env node
/**
 * module-loop-template.js — 模块循环驱动脚本模板（Vibe Coding 闭环工作流）
 * =============================================================================
 * 作用：把每模块手写的 module-XXX-loop.js 沉淀为可复用模板，各模块仅传参实例化复用，
 *      避免各版本行为不一致。工作流 §9.2「执行脚本」小节给出实例化命令与参数说明。
 *
 * 边界：脚本只做【驱动】，不做业务判断；各阶段具体内容以
 *       .claude/workflows/vibe-coding-loop.md §4 为准（驱动方负责读取角色文档并执行）。
 *
 * 用法：
 *   node templates/module-loop-template.js <模块编号> <模块名称> [--no-resume]
 *   例：node templates/module-loop-template.js 024 knowledge-panel
 *        → 驱动 specs/module-024-knowledge-panel/ 的 Plan→Develop→Review→Test 四阶段
 *
 * 断点续跑（默认开启）：启动时检测各阶段完成信号，已完成阶段跳过、从中断处继续——
 *   PLAN=plan.md+acceptance-criteria.md 存在 · DEVELOP=changelog.md 存在 ·
 *   REVIEW=review-report.md 结论通过 · TEST=test-report.md 结论通过且三记忆含本模块。
 *   报告存在但结论非通过时，旧报告自动改名 *.round-<时间戳>.md 让位（存在性=完成信号），
 *   配合派发验尸规则（module-011）先清残留再重派。--no-resume 强制全流程重跑。
 *
 * 退出码：
 *   0 = 四阶段全部完成（产出就绪 + 三记忆文件校验通过）
 *   1 = 阶段超时（每阶段总时长超过 LOOP_PHASE_TIMEOUT，默认 30 分钟）
 *   2 = 重试耗尽（轮次达上限，可经 §5.5 升级申请放宽后以更高上限重跑）
 *   3 = 三记忆文件缺项（阶段退出前置校验失败，缺 project-context / agent-activity-log / file-index 任一）
 *   4 = 规则/记忆闸门未通过（templates/check-gates.js 或 templates/delivery-gate.js 校验失败，见其 [FAIL] 输出；可经 config.gates.enabled=false 关闭）
 *
 * 介入钩子（环境变量覆盖）：
 *   LOOP_MONITOR_INTERVAL  — §5.0 定时检查轮询间隔（秒），默认 300（5 分钟）
 *   LOOP_PHASE_TIMEOUT     — 单阶段总超时（秒），默认 1800
 *
 * 配置：轮次上限读取 .claude/config.json 覆盖 workflow §9.1 默认值；
 *       §5.5 升级放宽上限（max_*_escalated）仅在经 Planner 批准后生效。
 * =============================================================================
 */
'use strict';

const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');

// ---------------------------------------------------------------------------
// 配置加载（workflow §9.1：默认值 + .claude/config.json 覆盖）
// ---------------------------------------------------------------------------
const CONFIG_PATH = path.resolve(process.cwd(), '.claude', 'config.json');

function loadConfig() {
  const defaults = {
    max_planner_retry: 3,
    max_developer_retry: 3,
    max_reviewer_rounds: 3,
    max_tester_retry: 3,
    max_reviewer_rounds_escalated: 8,
    max_tester_retry_escalated: 8,
    gates: { enabled: true },        // 规则闸门开关（false=跳过 check-gates.js）
  };
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const user = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
      return { ...defaults, ...user };
    }
  } catch (err) {
    console.warn(`[warn] config.json 读取失败，使用默认值: ${err.message}`);
  }
  return defaults;
}

const config = loadConfig();

// ---------------------------------------------------------------------------
// 参数解析
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('用法: node module-loop-template.js <模块编号> <模块名称>');
  console.error('示例: node module-loop-template.js 024 knowledge-panel');
  process.exit(2);
}
const MODULE_NUM = args[0];
const MODULE_NAME = args[1];
const MODULE = `module-${MODULE_NUM}-${MODULE_NAME}`;
const SPEC_DIR = path.join('specs', MODULE);
const MEMORY = {
  projectContext: path.join('memory', 'project-context.md'),
  activityLog: path.join('memory', 'agent-activity-log.md'),
  fileIndex: path.join('memory', 'file-index.md'),
};
const MONITOR_INTERVAL = (Number(process.env.LOOP_MONITOR_INTERVAL) || 300) * 1000;
const PHASE_TIMEOUT = (Number(process.env.LOOP_PHASE_TIMEOUT) || 1800) * 1000;

// ---------------------------------------------------------------------------
// 工具函数
// ---------------------------------------------------------------------------
function now() { return new Date().toISOString(); }
function log(phase, msg) { console.log(`[${now()}] [${phase}] ${msg}`); }

// 同步 sleep（避免引入外部依赖）
function sleepSync(ms) {
  const sab = new SharedArrayBuffer(4);
  const arr = new Int32Array(sab);
  Atomics.wait(arr, 0, 0, ms);
}

// 轮次上限：{base, escalated}，配合 §5.5 升级申请
function roundLimit(phaseKey) {
  const base = config[`max_${phaseKey}`] ?? 3;
  const escalated = config[`max_${phaseKey}_escalated`] ?? 8;
  return { base, escalated };
}

// §5.0 定时检查循环：等待阶段文档产出，超时或重试耗尽则返回对应退出码
function waitForDocs(phase, docs, maxAttempts) {
  const start = Date.now();
  let attempt = 0;
  while (Date.now() - start < PHASE_TIMEOUT && attempt < maxAttempts) {
    const missing = docs.filter((d) => !fs.existsSync(d));
    if (missing.length === 0) return { code: 0 };
    log(phase, `[check] 第 ${attempt + 1}/${maxAttempts} 次未就绪，待产出: ${missing.join(', ')}`);
    sleepSync(MONITOR_INTERVAL);
    attempt++;
  }
  if (attempt >= maxAttempts) return { code: 2 }; // 重试耗尽（§5.5 可申请放宽）
  return { code: 1 }; // 阶段总超时
}

// 三记忆文件强制校验：阶段退出前置，缺文件或未写入本模块记录 → 退出码 3（§7.3 交接前置校验）
// 三文件是脚手架预置的，只查存在不查内容会让退出码 3 形同虚设；须校验内容含本模块标识行。
function verifyMemory(phase) {
  const MODULE_TOKEN = `module-${MODULE_NUM}`;
  const unready = Object.entries(MEMORY).filter(([key, f]) => {
    if (!fs.existsSync(f)) return true; // 文件缺失
    const content = fs.readFileSync(f, 'utf8');
    // 已写入判定：内容中出现本模块标识（如 module-024）所在行
    return !content.split('\n').some((line) => line.includes(MODULE_TOKEN));
  });
  if (unready.length) {
    log(phase, `[FAIL] 三记忆文件缺项或未写入本模块记录，阶段不得退出: ${unready.map(([k]) => k).join(', ')}`);
    return false;
  }
  log(phase, '[OK] 三记忆文件均已更新（含本模块记录）');
  return true;
}

// §0 铁律机械化闸门：DEVELOP/REVIEW 阶段退出前执行 templates/check-gates.js（退出码 4）
function runGates(phase) {
  const gatesEnabled = config.gates && config.gates.enabled !== false;
  if (!gatesEnabled) { log(phase, '[GATE] 已禁用（config.gates.enabled=false），跳过规则校验'); return; }
  log(phase, '[GATE] 执行规则校验（templates/check-gates.js）...');
  const res = spawnSync(process.execPath, [path.join(__dirname, 'check-gates.js'), phase.toLowerCase()], { stdio: 'inherit', env: { ...process.env, GATE_MODULE: MODULE } });
  if (res.status !== 0) {
    console.error(`退出码 4: ${phase} 阶段规则 gate 未通过（详见上方 [FAIL] 输出；可经 config.gates.enabled=false 关闭）`);
    process.exit(4);
  }
  log(phase, '[GATE] 规则校验通过');
}

// §铁律 11 记忆新鲜度闸门：TEST 阶段完成后执行 templates/delivery-gate.js（mtime 确定性校验）
function runDeliveryGate() {
  const gatesEnabled = config.gates && config.gates.enabled !== false;
  if (!gatesEnabled) { log('DELIVERY', '[GATE] 已禁用（config.gates.enabled=false），跳过'); return; }
  log('DELIVERY', '[GATE] 执行记忆新鲜度校验（templates/delivery-gate.js）...');
  const res = spawnSync(process.execPath, [path.join(__dirname, 'delivery-gate.js')], { stdio: 'inherit', env: { ...process.env, GATE_MODULE: MODULE } });
  if (res.status !== 0) {
    console.error('退出码 4: 记忆闸门未通过（delivery-gate.js 输出见上；可经 config.gates.enabled=false 关闭）');
    process.exit(4);
  }
  log('DELIVERY', '[GATE] 记忆新鲜度校验通过');
}

// ---------------------------------------------------------------------------
// 断点续跑：启动时检测各阶段完成信号（存在性=完成信号的设计推论）
// ---------------------------------------------------------------------------
const RESUME = !args.includes('--no-resume');

// 报告结论解析：取首条含「结论:」的行——含「通过」不含「不通过」=pass；反之=fail；
// 两者并存（模板未填）或无该行=unknown（按未完成处理，保守方向）
function reportVerdict(f) {
  if (!fs.existsSync(f)) return 'missing';
  for (const line of fs.readFileSync(f, 'utf8').split('\n')) {
    if (!/结论[::]/.test(line)) continue;
    const hasPass = /通过/.test(line);
    const hasFail = /不通过/.test(line);
    if (hasPass && !hasFail) return 'pass';
    if (hasFail && !hasPass) return 'fail';
  }
  return 'unknown';
}

// 三记忆文件是否都已含本模块标识（verifyMemory 的非致命版，用于 TEST 完成判定）
function memoryHasModule() {
  const MODULE_TOKEN = `module-${MODULE_NUM}`;
  return Object.values(MEMORY).every((f) => {
    if (!fs.existsSync(f)) return false;
    return fs.readFileSync(f, 'utf8').split('\n').some((line) => line.includes(MODULE_TOKEN));
  });
}

// 信号存在但结论非通过 → 旧报告改名让位（waitForDocs 以存在性为信号，不复位会秒过）
function resetStaleReport(phase, f) {
  if (!fs.existsSync(f)) return;
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const renamed = f.replace(/\.md$/, `.round-${ts}.md`);
  fs.renameSync(f, renamed);
  log(phase, `[resume] 旧报告结论非通过，改名让位: ${path.basename(renamed)}（重驱动前先按派发验尸规则清理残留）`);
}

function detectResume() {
  if (!RESUME) { log('RESUME', '--no-resume：忽略既有信号，全流程重跑'); return { plan: false, develop: false, review: false, test: false }; }
  const planDone = fs.existsSync(path.join(SPEC_DIR, 'plan.md')) && fs.existsSync(path.join(SPEC_DIR, 'acceptance-criteria.md'));
  const developDone = fs.existsSync(path.join(SPEC_DIR, 'changelog.md'));
  const reviewReport = path.join(SPEC_DIR, 'review-report.md');
  const testReport = path.join(SPEC_DIR, 'test-report.md');
  const reviewVerdict = reportVerdict(reviewReport);
  const testVerdict = reportVerdict(testReport);
  log('RESUME', `断点续跑检测: PLAN=${planDone ? '完成' : '未完成'} DEVELOP=${developDone ? '完成' : '未完成'} REVIEW=${reviewVerdict} TEST=${testVerdict}${memoryHasModule() ? '+记忆✓' : '+记忆✗'}`);
  if (planDone && developDone && reviewVerdict === 'pass' && testVerdict === 'pass' && memoryHasModule()) {
    console.error(`退出码 0 前置提示: ${MODULE} 四阶段信号均已满足，无需重跑（确认无误则本模块已完成；如需强制重跑用 --no-resume）`);
    process.exit(0);
  }
  // 为重驱动复位过期信号（结论非通过的报告）
  if (developDone && reviewVerdict !== 'pass') resetStaleReport('RESUME', reviewReport);
  if (reviewVerdict === 'pass' && testVerdict !== 'pass') resetStaleReport('RESUME', testReport);
  return {
    plan: planDone,
    develop: developDone,
    review: reviewVerdict === 'pass',
    test: testVerdict === 'pass' && memoryHasModule(),
  };
}

// ---------------------------------------------------------------------------
// 阶段驱动（各阶段内容以 workflow §4.1-4.4 为准，此处仅做驱动与校验）
// ---------------------------------------------------------------------------
function runPhase(name, roleDoc, docs, limitKey) {
  const { base, escalated } = roundLimit(limitKey);
  log(name, `驱动 ${roleDoc}: 执行 workflow 对应阶段（轮次上限 ${base}，升级放宽 ${escalated}）`);
  const res = waitForDocs(name, docs, base);
  if (res.code === 1) { console.error('退出码 1: 阶段超时'); process.exit(1); }
  if (res.code === 2) {
    console.error(`退出码 2: 重试耗尽（上限 ${base}；存在进展证据可经 §5.5 升级放宽至 ${escalated}）`);
    process.exit(2);
  }
  if (!verifyMemory(name)) process.exit(3);
  log(name, '完成：产出就绪 + 三记忆文件校验通过');
}

function main() {
  console.log(`===== 模块循环驱动: ${MODULE} =====`);
  console.log(
    `配置: 监控=${MONITOR_INTERVAL / 1000}s | retry=${config.max_planner_retry}/${config.max_developer_retry}/${config.max_reviewer_rounds}/${config.max_tester_retry}` +
      ` | escalated=${config.max_reviewer_rounds_escalated}/${config.max_tester_retry_escalated}`
  );

  const sig = detectResume();
  if (sig.plan) log('PLAN', '[resume] 信号已满足，跳过');
  else runPhase('PLAN', '.claude/agents/planner.md', [
    path.join(SPEC_DIR, 'plan.md'),
    path.join(SPEC_DIR, 'acceptance-criteria.md'),
  ], 'planner_retry');

  if (sig.develop) log('DEVELOP', '[resume] 信号已满足，跳过');
  else runPhase('DEVELOP', '.claude/agents/developer.md', [
    path.join(SPEC_DIR, 'changelog.md'),
  ], 'developer_retry');

  runGates('DEVELOP');

  if (sig.review) log('REVIEW', '[resume] 信号已满足，跳过');
  else runPhase('REVIEW', '.claude/agents/reviewer.md', [
    path.join(SPEC_DIR, 'review-report.md'),
  ], 'reviewer_rounds');

  runGates('REVIEW');

  if (sig.test) log('TEST', '[resume] 信号已满足，跳过');
  else runPhase('TEST', '.claude/agents/tester.md', [
    path.join(SPEC_DIR, 'test-report.md'),
  ], 'tester_retry');

  runDeliveryGate();

  console.log(`===== ${MODULE} 四阶段完成：specs 5 件套 + 三记忆文件就绪，进入模块完成判定 =====`);
  process.exit(0);
}

main();
