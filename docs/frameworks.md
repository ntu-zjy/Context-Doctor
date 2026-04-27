# 支持的 AI Agent 框架

Context Doctor 支持以下主流 AI Agent 框架：

## 已支持的框架

### 1. Claude Code

Anthropic 官方推出的终端 AI 编程助手。

**特点**：
- Skill 系统支持自定义指令
- 支持自动触发和手动调用
- 可以打包为插件分发

**安装方式**：
```bash
mkdir -p ~/.claude/skills/contextdoctor
cp SKILL.md ~/.claude/skills/contextdoctor/
```

**使用方式**：
```bash
/contextdoctor
/repair
```

**官方文档**：https://code.claude.com/docs/en/skills

---

### 2. OpenAI Codex CLI

OpenAI 官方推出的命令行 AI 编程工具。

**特点**：
- 使用 `codex.md` 进行项目配置
- 支持自定义 Agent
- 轻量级 Rust 实现

**安装方式**：
```bash
mkdir -p ~/.codex
cp codex.md ~/.codex/
```

**使用方式**：
```bash
codex /contextdoctor
codex /repair
```

**官方文档**：https://github.com/openai/codex

---

### 3. Cursor

基于 VS Code 的 AI 编程编辑器。

**特点**：
- Custom Commands 支持自定义指令
- Project Rules 支持项目级规则
- Notepads 支持知识库

**安装方式**：
```bash
mkdir -p ~/.cursor/commands
cp contextdoctor.json ~/.cursor/commands/
```

**使用方式**：
```bash
/contextdoctor
/repair
```

**官方文档**：https://cursor.com/docs

---

### 4. OpenCode（已归档）

原开源 AI 编程助手，使用 Go 开发。

**状态**：⚠️ 项目已归档（2025年9月），转为 Crush 继续开发。

**安装方式**：
```bash
mkdir -p ~/.config/opencode/commands
cp contextdoctor.md ~/.config/opencode/commands/
```

**使用方式**：
```bash
/contextdoctor
/repair
```

**官方文档**：https://github.com/opencode-ai/opencode（已归档）

---

### 5. Crush

Charm 公司开发的终端 AI 编程助手，OpenCode 的继任者。

**特点**：
- Bubble Tea TUI 界面
- 支持多种 LLM 提供商
- JSON 配置格式

**安装方式**：
```bash
# 配置目录
mkdir -p ~/.config/crush
cp crush.json ~/.config/crush/
```

**使用方式**：
```bash
contextdoctor
repair
```

**官方文档**：https://github.com/charmbracelet/crush

---

## 功能对比

| 功能 | Claude Code | Codex CLI | Cursor | OpenCode/Crush |
|------|-------------|-----------|--------|----------------|
| 自定义命令 | ✅ Skills | ✅ codex.md | ✅ Custom Commands | ✅ Commands |
| 自动触发 | ✅ | ❌ | ❌ | ❌ |
| 项目级配置 | ✅ | ✅ | ✅ | ✅ |
| 全局配置 | ✅ | ✅ | ✅ | ✅ |
| 参数传递 | ✅ | ⚠️ 有限 | ✅ | ✅ |
| 插件系统 | ✅ | ❌ | ❌ | ✅ |
| IDE 集成 | ❌ | ⚠️ 扩展 | ✅ 原生 | ❌ |

## 选择合适的框架

### 推荐 Claude Code 如果你：
- 主要使用终端工作
- 需要自动触发的能力
- 想要打包分发自定义功能

### 推荐 Codex CLI 如果你：
- 已经是 ChatGPT 付费用户
- 偏好轻量级工具
- 需要与 OpenAI 生态集成

### 推荐 Cursor 如果你：
- 习惯使用 VS Code
- 需要可视化界面
- 想要 IDE 的原生体验

### 推荐 Crush 如果你：
- 喜欢 TUI 界面
- 使用多种 LLM 提供商
- 偏好 Go 语言工具

## 添加新框架支持

如果你想为 Context Doctor 添加新框架支持，请参考：

1. 研究目标框架的自定义指令机制
2. 在 `plugins/contextdoctor/` 下创建新目录
3. 实现框架特定的配置格式
4. 更新 `docs/COMMANDS_REFERENCE.md`
5. 提交 Pull Request

---

**注意**：框架版本更新可能导致配置格式变化，请参考官方文档获取最新信息。
