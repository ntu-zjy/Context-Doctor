# Context Doctor - 跨框架指令实现参考

本文档详细描述如何在各 Agent 框架中定制全局指令，实现 `/contextdoctor` 和 `/repair` 命令。

---

## 1. Claude Code

### 框架概述
Claude Code 使用 **Skill 系统** 实现自定义指令。Skills 是 Claude Code 的扩展机制，允许用户创建可复用的命令和工作流。

### 指令配置路径

| 范围 | 路径 |
|------|------|
| 个人全局 | `~/.claude/skills/<skill-name>/SKILL.md` |
| 项目级 | `.claude/skills/<skill-name>/SKILL.md` |
| 插件级 | `<plugin>/skills/<skill-name>/SKILL.md` |

### 文件结构

```
.claude/skills/contextdoctor/
├── SKILL.md              # 主要指令文件（必需）
├── report-template.html  # HTML报告模板
└── scripts/
    └── generate-report.mjs # 报告生成脚本
```

### SKILL.md 格式

```yaml
---
name: contextdoctor
description: 检查当前对话上下文是否存在污染，生成可视化HTML报告
when_to_use: 当用户想要检查上下文健康度、发现指令冲突或优化对话质量时使用
argument-hint: '[输出文件路径]'
disable-model-invocation: false
allowed-tools: Read Write Bash
---

# Context Doctor - 上下文污染检测

请分析当前对话历史，检测以下污染类型：

## 检测维度

1. **Skill/Plugin 冲突**
   - 检查已加载的 skills 是否存在功能重叠
   - 识别互相冲突的工具权限设置
   - 标记冗余的插件加载

2. **指令矛盾**
   - 扫描用户历史指令中的前后不一致
   - 识别目标变更导致的上下文漂移
   - 检测隐含假设冲突

3. **错误累积**
   - 追踪早期错误对后续推理的影响
   - 识别基于错误假设的连锁反应

## 分析流程

1. 读取对话历史（如有权限）
2. 执行污染检测算法
3. 计算综合健康评分（0-100）
4. 生成分级报告（严重/警告/建议）
5. 输出 HTML 可视化报告

## 报告格式

参考设计风格：Starbucks 暖色调设计系统
- 主色：Starbucks Green (`#006241`)
- 强调色：Green Accent (`#00754A`)
- 深色带：House Green (`#1E3932`)
- 画布：Neutral Warm (`#f2f0eb`)

报告保存位置：默认 `~/.contextdoctor/reports/context-doctor-report-{timestamp}-{lang}.html`，支持 `--lang` 和 `--output` 参数
```

### 安装方式

```bash
# 创建个人级全局 skill
mkdir -p ~/.claude/skills/contextdoctor
mkdir -p ~/.claude/skills/contextdoctor/scripts

# 创建 SKILL.md 文件
cat > ~/.claude/skills/contextdoctor/SKILL.md << 'EOF'
[SKILL 内容如上]
EOF

# 可选：添加报告模板和脚本
```

### 使用方式

```bash
# 自动检测（Claude 会在适当时机自动调用）
"请检查我的上下文健康状况"

# 手动调用
/contextdoctor
/contextdoctor ./my-report.html
```

---

## 2. OpenAI Codex CLI

### 框架概述
Codex CLI 使用 **Skills 系统** 实现自定义行为。Skills 通过 `$skill-name` 语法调用，或在提示词中自然描述时由 Codex 自动匹配。

> **注意**：Codex CLI 的 `/` 斜杠命令是内置系统命令（如 `/model`、`/clear` 等），**不支持用户自定义斜杠命令**。Context Doctor 通过 `$contextdoctor` 或自然语言触发。

### 指令配置路径

| 范围 | 路径 |
|------|------|
| 项目级 | `.agents/skills/<skill-name>/` |
| 用户全局 | `~/.agents/skills/<skill-name>/` |
| 系统级 | `/etc/codex/skills/<skill-name>/` |

### 文件结构

```
.agents/skills/contextdoctor/
├── SKILL.md              # 主要指令文件（必需）
└── scripts/              # 可选脚本
```

### SKILL.md 格式

```markdown
---
name: contextdoctor
description: 检查当前对话上下文是否存在污染，生成可视化HTML报告
---

请分析当前对话历史，检测以下污染类型：

## 检测维度

1. **工具冲突**：检查已加载的 skills 是否存在功能重叠
2. **指令矛盾**：识别用户历史指令中的前后不一致
3. **错误累积**：追踪早期错误对后续推理的影响

## 分析流程

1. 扫描对话历史
2. 执行污染检测
3. 计算综合健康评分（0-100）
4. 生成分级报告（严重/警告/建议）
5. 输出 HTML 可视化报告

## 报告格式

参考设计风格：Starbucks 暖色调设计系统

报告保存位置：默认 `~/.contextdoctor/reports/context-doctor-report-{timestamp}-{lang}.html`，支持 `--lang` 和 `--output` 参数
```

### 安装方式

```bash
# 项目级安装
mkdir -p .agents/skills/contextdoctor
cat > .agents/skills/contextdoctor/SKILL.md << 'EOF'
---
name: contextdoctor
description: 检查当前对话上下文是否存在污染，生成可视化HTML报告
---

请分析当前对话历史，检测污染类型，生成 HTML 可视化报告。
EOF

# 全局安装
mkdir -p ~/.agents/skills/contextdoctor
# 复制相同 SKILL.md 到上述目录
```

### 使用方式

```bash
# 显式调用 skill
$contextdoctor

# 自然语言触发（Codex 自动匹配）
"请检查我的上下文健康状况"
"帮我诊断当前对话的污染问题"
```

---

## 3. Cursor

### 框架概述
Cursor 提供多种方式扩展 AI 行为：**Custom Commands**（自定义命令）、**Rules**（规则文件）、**Notepads**（笔记本）。

### 方式一：Custom Commands（推荐）

#### 配置路径

| 范围 | 路径 |
|------|------|
| 用户全局 | `~/.cursor/commands/` |
| 项目级 | `.cursor/commands/` |

#### 命令文件格式

```json
// .cursor/commands/contextdoctor.json
{
  "name": "contextdoctor",
  "description": "检查当前上下文的污染，输出HTML可视化报告",
  "prompt": "请作为 Context Doctor 分析当前对话和项目上下文，检测以下污染类型：\n\n1. **工具冲突**：检查 .cursor/rules/ 中的规则冲突\n2. **指令矛盾**：识别用户历史提示中的前后不一致\n3. **错误累积**：追踪早期错误对后续的影响\n\n输出要求：\n- 生成 HTML 可视化报告\n- 采用 Starbucks 设计风格（暖色调）\n- 包含综合评分（0-100）\n- 按严重/警告/建议分级\n\n报告保存到：~/.contextdoctor/reports/ 目录（带时间戳命名），支持 `--lang` 和 `--output` 参数",
  "key": "ctrl+shift+c"
}
```

```json
// .cursor/commands/repair.json
{
  "name": "repair",
  "description": "检查上下文污染并提供修复方案",
  "prompt": "执行完整的上下文污染检测（同 /contextdoctor），并额外提供：\n\n1. 针对每个问题的具体修复建议\n2. 推荐的上下文清理步骤\n3. 优化后的对话重启建议\n4. 修复脚本（如适用）\n\n输出修复报告和可执行的解决方案。"
}
```

### 方式二：Project Rules

#### 配置路径
- `.cursorrules`（项目根目录）
- `.cursor/rules/*.md`

#### .cursorrules 格式

```markdown
# Context Doctor 全局规则

## 指令定义

### /contextdoctor
当用户输入 `/contextdoctor` 时：
1. 暂停当前任务
2. 分析整个对话历史的污染情况
3. 生成 HTML 报告
4. 报告风格：Starbucks 设计系统

### /repair
当用户输入 `/repair` 时：
1. 执行完整污染检测
2. 提供自动修复方案
3. 生成修复前后的对比报告

## 污染检测规则

**严重级（Critical）**：
- 工具权限冲突导致的安全风险
- 核心目标完全矛盾的指令
- 系统级配置错误

**警告级（Warning）**：
- 部分重叠的工具功能
- 轻微的目标漂移
- 潜在的性能问题

**建议级（Suggestion）**：
- 可以优化的上下文结构
- 冗余但不冲突的指令
- 更好的实践建议
```

### 方式三：Notepads（笔记本）

#### 配置路径
- `.cursor/notepads/context-doctor.md`

#### 使用方法

在 Cursor 中：
1. 创建 Notepad 命名为 "Context Doctor"
2. 内容填写检测逻辑和报告模板
3. 使用时通过 `@Context Doctor` 引用

### 安装方式

```bash
# 项目级安装 - 使用 Custom Commands
mkdir -p .cursor/commands

# contextdoctor 命令
cat > .cursor/commands/contextdoctor.json << 'EOF'
{
  "name": "contextdoctor",
  "description": "检查当前上下文的污染，输出HTML可视化报告",
  "prompt": "请作为 Context Doctor 分析当前对话上下文..."
}
EOF

# repair 命令
cat > .cursor/commands/repair.json << 'EOF'
{
  "name": "repair",
  "description": "检查上下文污染并提供修复方案",
  "prompt": "执行上下文污染检测并提供修复建议..."
}
EOF

# 可选：添加项目规则
mkdir -p .cursor/rules
cat > .cursor/rules/context-doctor.md << 'EOF'
# Context Doctor 规则
[规则内容]
EOF
```

### 使用方式

```bash
# 在 Cursor 编辑器中
/contextdoctor    # 触发检测
/repair           # 触发修复

# 或使用快捷键（如果配置了 key）
Ctrl+Shift+C      # 示例快捷键
```

---

## 4. OpenCode (已归档，转为 Crush)

### 框架概述
**OpenCode 已归档**（2025年9月），项目继续作为 **Crush** 开发。以下信息适用于原 OpenCode 和 Crush 的配置。

### 指令配置路径

| 范围 | 路径 |
|------|------|
| 用户全局 | `~/.config/opencode/commands/` |
| 项目级 | `.opencode/commands/` |
| 配置合并 | `opencode.jsonc` |

### 方式一：Markdown 命令文件

```markdown
# .opencode/commands/contextdoctor.md

---
description: 检查当前上下文的污染，输出HTML可视化报告
agent: explore
subtask: true
---

请作为 Context Doctor 分析当前对话上下文，检测以下污染类型：

## 检测维度
1. **工具冲突**：检查已加载的 commands 是否存在功能重叠
2. **指令矛盾**：识别用户历史提示中的前后不一致
3. **错误累积**：追踪早期错误对后续推理的影响

## 输出要求
- 生成 HTML 可视化报告
- 采用 Starbucks 设计风格（暖色调）
- 包含综合评分（0-100）
- 按严重/警告/建议分级

## 报告位置
$ARGUMENTS 支持 `--lang=zh|en|ja|ko` 和 `--output=自定义路径`，默认保存到 `~/.contextdoctor/reports/`（带时间戳）
```

```markdown
# .opencode/commands/repair.md

---
description: 检查上下文污染并提供修复方案
agent: explore
subtask: true
---

执行完整的上下文污染检测，并额外提供：

1. 针对每个问题的具体修复建议
2. 推荐的上下文清理步骤
3. 优化后的对话重启建议

使用参数：$ARGUMENTS
```

### 方式二：JSON 配置文件

```jsonc
// opencode.jsonc
{
  "command": {
    "contextdoctor": {
      "template": "请作为 Context Doctor 分析当前对话上下文...",
      "description": "检查当前上下文的污染，输出HTML可视化报告",
      "agent": "explore",
      "subtask": true
    },
    "repair": {
      "template": "执行完整污染检测并提供修复建议...",
      "description": "检查上下文污染并提供修复方案",
      "agent": "explore",
    }
  }
}
```

### 模板特性

| 特性 | 语法 | 说明 |
|------|------|------|
| 全部参数 | `$ARGUMENTS` | 所有传入的参数 |
| 位置参数 | `$1`, `$2`, `$3` | 第 N 个参数 |
| Shell 执行 | `` !`command` `` | 执行命令并注入输出 |
| 文件引用 | `@filename` | 自动包含文件内容 |

### 安装方式

```bash
# 项目级安装
mkdir -p .opencode/commands

# contextdoctor 命令
cat > .opencode/commands/contextdoctor.md << 'EOF'
---
description: 检查当前上下文的污染，输出HTML可视化报告
agent: explore
---

请分析当前对话上下文，检测污染类型...
EOF

# repair 命令
cat > .opencode/commands/repair.md << 'EOF'
---
description: 检查上下文污染并提供修复方案
agent: explore
---

执行检测并提供修复建议...
EOF

# 或全局安装
mkdir -p ~/.config/opencode/commands
# 复制相同文件到上述目录
```

### 使用方式

```bash
# 在 OpenCode TUI 中
/contextdoctor    # 触发检测
/repair           # 触发修复

# 带参数
/contextdoctor ./my-report.html
/repair --auto-fix
```

### 与 Crush 的迁移

Crush（OpenCode 的继任者）使用类似的配置但 JSON 格式：

```bash
# Crush 配置
mkdir -p .crush
cat > .crush/commands.json << 'EOF'
{
  "contextdoctor": {
    "prompt": "检查上下文污染...",
    "description": "上下文污染检测"
  }
}
EOF
```

---

## 5. 框架对比总结

| 特性 | Claude Code | Codex CLI | Cursor | Crush |
|------|-------------|-----------|--------|-------|
| **配置格式** | YAML + Markdown | YAML + Markdown | JSON + Markdown | JSON |
| **全局安装** | `~/.claude/skills/` | `~/.agents/skills/` | `~/.cursor/commands/` | `~/.config/crush/` |
| **项目安装** | `.claude/skills/` | `.agents/skills/` | `.cursor/commands/` | `.crush.json` |
| **调用方式** | `/skill-name` | `$skill-name` 或自然语言 | `/command` | 直接输入 |
| **支持参数** | 是 | 是 | 是 | 是 |
| **自动触发** | 是 | 是（描述匹配） | 否 | 否 |
| **前端支持** | CLI | CLI | IDE 集成 | CLI |

---

## 6. 统一安装脚本

为简化多框架安装，提供统一安装脚本：

```bash
#!/bin/bash
# install-context-doctor.sh

INSTALL_DIR="${1:-$HOME}"

echo "🩺 Installing Context Doctor..."

# Claude Code
if command -v claude &> /dev/null; then
    echo "📦 Installing for Claude Code..."
    mkdir -p "$HOME/.claude/skills/contextdoctor"
    cat > "$HOME/.claude/skills/contextdoctor/SKILL.md" << 'SKILL_EOF'
---
name: contextdoctor
description: 检查当前对话上下文是否存在污染，生成可视化HTML报告
disable-model-invocation: false
---

# Context Doctor 指令

请分析当前对话，检测：
1. Skill/Plugin 冲突
2. 指令矛盾
3. 错误累积

生成 HTML 报告使用 Starbucks 设计风格。
SKILL_EOF
    echo "✅ Claude Code skill installed"
fi

# Codex CLI
if command -v codex &> /dev/null; then
    echo "📦 Installing for Codex CLI..."
    mkdir -p "$HOME/.agents/skills/contextdoctor"
    cat > "$HOME/.agents/skills/contextdoctor/SKILL.md" << 'CODEX_EOF'
---
name: contextdoctor
description: 检查当前对话上下文是否存在污染，生成可视化HTML报告
---

请分析当前对话历史，检测污染类型，生成 HTML 可视化报告，保存到 ~/.contextdoctor/reports/。
CODEX_EOF
    mkdir -p "$HOME/.agents/skills/repair"
    cat > "$HOME/.agents/skills/repair/SKILL.md" << 'REPAIR_EOF'
---
name: repair
description: 检查上下文污染并提供自动修复方案
---

执行完整的上下文污染检测，并针对每个问题提供具体修复建议，生成修复报告。
REPAIR_EOF
    echo "✅ Codex CLI skills installed"
fi

# Cursor
if [ -d "$HOME/.cursor" ] || [ -d ".cursor" ]; then
    echo "📦 Installing for Cursor..."
    mkdir -p "$HOME/.cursor/commands"
    cat > "$HOME/.cursor/commands/contextdoctor.json" << 'CURSOR_EOF'
{
  "name": "contextdoctor",
  "description": "检查当前上下文的污染，输出HTML可视化报告",
  "prompt": "请作为 Context Doctor 分析当前对话上下文..."
}
CURSOR_EOF
    echo "✅ Cursor commands installed"
fi

echo "🎉 Context Doctor installation complete!"
```

---

## 参考文档

- [Claude Code Skills 文档](https://code.claude.com/docs/en/skills)
- [OpenAI Codex CLI GitHub](https://github.com/openai/codex)
- [Cursor 文档](https://cursor.com/docs)
- [Crush GitHub](https://github.com/charmbracelet/crush)
