#!/usr/bin/env node

/**
 * Context Doctor 全局安装脚本
 * Global Installation Script
 */

import { existsSync, mkdirSync, writeFileSync, copyFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { homedir } from 'os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function detectFrameworks() {
  const frameworks = [];

  // Check Claude Code
  try {
    const { execSync } = await import('child_process');
    execSync('which claude', { stdio: 'ignore' });
    frameworks.push('claude');
  } catch {}

  // Check Codex
  try {
    const { execSync } = await import('child_process');
    execSync('which codex', { stdio: 'ignore' });
    frameworks.push('codex');
  } catch {}

  // Check Cursor (typically has app directory)
  if (existsSync('/Applications/Cursor.app') ||
      existsSync(`${homedir()}/Applications/Cursor.app`)) {
    frameworks.push('cursor');
  }

  // Check OpenCode/Crush
  try {
    const { execSync } = await import('child_process');
    execSync('which opencode', { stdio: 'ignore' });
    frameworks.push('opencode');
  } catch {}

  try {
    const { execSync } = await import('child_process');
    execSync('which crush', { stdio: 'ignore' });
    frameworks.push('crush');
  } catch {}

  return frameworks;
}

async function installForClaude() {
  log('\n📦 Installing for Claude Code...', 'cyan');

  const skillDir = resolve(homedir(), '.claude/skills/contextdoctor');

  if (!existsSync(skillDir)) {
    mkdirSync(skillDir, { recursive: true });
  }

  // Copy SKILL.md
  const skillSource = resolve(rootDir, 'plugins/contextdoctor/skills/contextdoctor/SKILL.md');
  const skillTarget = resolve(skillDir, 'SKILL.md');
  copyFileSync(skillSource, skillTarget);

  // Copy repair skill
  const repairDir = resolve(homedir(), '.claude/skills/repair');
  if (!existsSync(repairDir)) {
    mkdirSync(repairDir, { recursive: true });
  }
  const repairSource = resolve(rootDir, 'plugins/contextdoctor/skills/repair/SKILL.md');
  const repairTarget = resolve(repairDir, 'SKILL.md');
  copyFileSync(repairSource, repairTarget);

  log('✅ Claude Code skills installed', 'green');
  log('   Commands: /contextdoctor, /repair');
}

async function installForCodex() {
  log('\n📦 Installing for Codex CLI...', 'cyan');

  const codexDir = resolve(homedir(), '.codex');

  if (!existsSync(codexDir)) {
    mkdirSync(codexDir, { recursive: true });
  }

  // Create codex.md with Context Doctor instructions
  const codexMd = `# Context Doctor

## /contextdoctor

检查当前对话上下文的污染情况，生成 HTML 可视化报告。

**检测内容**：
- 工具配置冲突
- 用户指令前后矛盾
- 累积性错误传播

**输出**：HTML 报告文件

## /repair

执行完整的上下文污染检测，并提供自动修复方案。

**额外功能**：
- 针对每个问题的具体修复建议
- 推荐的上下文清理步骤
- 优化后的对话重启建议
`;

  writeFileSync(resolve(codexDir, 'codex.md'), codexMd);

  log('✅ Codex CLI config installed', 'green');
  log('   Commands: /contextdoctor, /repair');
}

async function installForCursor() {
  log('\n📦 Installing for Cursor...', 'cyan');

  const commandsDir = resolve(homedir(), '.cursor/commands');

  if (!existsSync(commandsDir)) {
    mkdirSync(commandsDir, { recursive: true });
  }

  // Create contextdoctor.json
  const contextDoctorJson = {
    name: "contextdoctor",
    description: "检查当前上下文的污染，输出HTML可视化报告",
    prompt: "请作为 Context Doctor 分析当前对话上下文，检测以下污染类型：\n\n1. **工具冲突**：检查配置中的规则冲突\n2. **指令矛盾**：识别用户历史提示中的前后不一致\n3. **错误累积**：追踪早期错误对后续的影响\n\n输出要求：\n- 生成 HTML 可视化报告\n- 采用 Starbucks 设计风格（暖色调）\n- 包含综合评分（0-100）\n- 按严重/警告/建议分级",
    key: "ctrl+shift+c"
  };

  writeFileSync(
    resolve(commandsDir, 'contextdoctor.json'),
    JSON.stringify(contextDoctorJson, null, 2)
  );

  // Create repair.json
  const repairJson = {
    name: "repair",
    description: "检查上下文污染并提供修复方案",
    prompt: "执行上下文污染检测并提供修复建议：\n\n1. 针对每个问题的具体修复建议\n2. 推荐的上下文清理步骤\n3. 优化后的对话重启建议\n4. 修复脚本（如适用）\n\n输出修复报告和可执行的解决方案。"
  };

  writeFileSync(
    resolve(commandsDir, 'repair.json'),
    JSON.stringify(repairJson, null, 2)
  );

  log('✅ Cursor commands installed', 'green');
  log('   Commands: /contextdoctor, /repair');
}

async function installForOpenCode() {
  log('\n📦 Installing for OpenCode/Crush...', 'cyan');

  const commandsDir = resolve(homedir(), '.config/opencode/commands');

  if (!existsSync(commandsDir)) {
    mkdirSync(commandsDir, { recursive: true });
  }

  // Copy command files
  const contextDoctorSource = resolve(rootDir, 'plugins/contextdoctor/commands/contextdoctor.md');
  const contextDoctorTarget = resolve(commandsDir, 'contextdoctor.md');
  copyFileSync(contextDoctorSource, contextDoctorTarget);

  // Create repair command
  const repairMd = `---
description: 检查上下文污染并提供修复方案
agent: explore
model: anthropic/claude-3-5-sonnet-20241022
subtask: true
---

# Context Doctor 修复指令

执行完整的上下文污染检测，并提供自动修复方案。

## 修复内容

1. 针对每个问题的具体修复步骤
2. 可直接复制使用的修复文本
3. 推荐的上下文清理策略

## 参数

$ARGUMENTS - 输出文件路径（可选）
`;

  writeFileSync(resolve(commandsDir, 'repair.md'), repairMd);

  log('✅ OpenCode/Crush commands installed', 'green');
  log('   Commands: /contextdoctor, /repair');
}

async function main() {
  log('🩺 Context Doctor Installer', 'cyan');
  log('========================\n', 'cyan');

  const frameworks = detectFrameworks();

  if (frameworks.length === 0) {
    log('⚠️  No supported frameworks detected.', 'yellow');
    log('   Please install Claude Code, Codex CLI, Cursor, or OpenCode first.', 'yellow');

    log('\n📋 Manual Installation:', 'blue');
    log('   See README.md for framework-specific instructions');
    return;
  }

  log(`✅ Detected frameworks: ${frameworks.join(', ')}`, 'green');

  for (const framework of frameworks) {
    switch (framework) {
      case 'claude':
        await installForClaude();
        break;
      case 'codex':
        await installForCodex();
        break;
      case 'cursor':
        await installForCursor();
        break;
      case 'opencode':
      case 'crush':
        await installForOpenCode();
        break;
    }
  }

  log('\n🎉 Installation complete!', 'green');
  log('\n💡 Usage:', 'blue');
  log('   /contextdoctor  - 检查上下文污染');
  log('   /repair         - 检查并提供修复方案');
  log('\n📖 Documentation:', 'blue');
  log('   https://contextdoctor.dev/docs');
}

main().catch(err => {
  log(`\n❌ Error: ${err.message}`, 'red');
  process.exit(1);
});
