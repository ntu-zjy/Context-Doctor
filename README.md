# 🩺 Context Doctor 守护您的Agent上下文健康

<p align="center">
  <img src="docs/assets/contextdoctor-logo.svg" width="128" height="128" alt="Context Doctor Logo">
</p>

<p align="center">
  <b>上下文污染检测与修复工具</b>
</p>

<p align="center">
  <a href="README.md">中文</a> |
  <a href="README.en.md">English</a> |
  <a href="README.ja.md">日本語</a> |
  <a href="README.ko.md">한국어</a>
</p>

---

## 🎯 解决的问题

在使用 AI Agent（Claude Code、Codex、Cursor 等）时，你是否遇到过：

1. **提示词前后矛盾** - 之前的指令与当前目标冲突，导致 AI 困惑
2. **Skill/Plugin 冲突** - 加载了太多工具，它们互相干扰或功能重叠
3. **错误累积** - 早期的一个小错误导致后续所有推理都偏离轨道

**Context Doctor** 帮你检测并修复这些「上下文污染」问题。

---

## ✨ 特性

- 🔍 **智能检测** - 自动识别 3 大类污染：Skill 冲突、指令矛盾、错误累积
- 📊 **可视化报告** - 美观的 HTML 报告，采用 Starbucks 设计系统
- 🌍 **多语言支持** - 中文、英文、日文、韩文，报告内可一键切换
- 📅 **时间戳管理** - 报告自动保存到 `~/.contextdoctor/reports/`，按时间排序
- 🔧 **一键修复** - 不仅检测问题，还提供具体的修复方案
- 🚀 **极简安装** - 一条命令安装到所有支持的 Agent 框架
- 🎨 **框架灵活** - 支持 Claude Code、Codex CLI、Cursor、OpenCode/Crush

---

## 📦 安装

### 方式一：自动安装脚本

```bash
# 下载项目后执行安装脚本
node scripts/install.mjs
```

### 方式二：手动安装

#### Claude Code

```bash
# 创建技能目录
mkdir -p ~/.claude/skills/contextdoctor
mkdir -p ~/.claude/skills/repair

# 复制技能文件（假设你在项目目录）
cp plugins/contextdoctor/skills/contextdoctor/SKILL.md ~/.claude/skills/contextdoctor/
cp plugins/contextdoctor/skills/repair/SKILL.md ~/.claude/skills/repair/
```

#### Codex CLI

```bash
# 创建全局 skill 目录
mkdir -p ~/.agents/skills/contextdoctor
mkdir -p ~/.agents/skills/repair

# 复制 skill 文件
cp plugins/contextdoctor/skills/contextdoctor/SKILL.md ~/.agents/skills/contextdoctor/
cp plugins/contextdoctor/skills/repair/SKILL.md ~/.agents/skills/repair/
```

#### Cursor

```bash
# 创建命令目录
mkdir -p ~/.cursor/commands

# 复制命令配置
cp plugins/contextdoctor/.cursor-plugin/plugin.json ~/.cursor/commands/contextdoctor.json

# 创建 repair 命令
cat > ~/.cursor/commands/repair.json << 'EOF'
{
  "name": "repair",
  "description": "检查上下文污染并提供修复方案",
  "prompt": "执行上下文污染检测并提供修复建议"
}
EOF
```

#### OpenCode / Crush

```bash
# 创建命令目录
mkdir -p ~/.config/opencode/commands

# 复制命令文件
cp plugins/contextdoctor/commands/contextdoctor.md ~/.config/opencode/commands/

# 创建 repair 命令
cat > ~/.config/opencode/commands/repair.md << 'EOF'
---
description: 检查上下文污染并提供修复方案
---

执行上下文污染检测并提供修复建议
EOF
```

---

## 🚀 使用

### 检查上下文污染

```bash
/contextdoctor
```

生成 HTML 报告，显示：
- 综合健康评分（0-100）
- 污染类型分布
- 具体问题列表
- 修复优先级建议

#### 多语言支持

```bash
/contextdoctor --lang=en    # 英文报告
/contextdoctor --lang=ja    # 日文报告
/contextdoctor --lang=ko    # 韩文报告
```

#### 自定义输出路径

```bash
/contextdoctor --output=./my-report.html
```

### 获取修复方案

```bash
/repair
```

在检测报告基础上，额外提供：
- 每个问题的具体修复步骤
- 可直接复制使用的修复文本
- 推荐的上下文清理策略

### 报告位置

报告默认保存到 `~/.contextdoctor/reports/`，文件名格式：
```
context-doctor-report-2025-01-15T10-30-00-zh.html
context-doctor-repair-2025-01-15T10-35-00-en.html
```

历史报告按时间戳排序，方便追踪上下文健康趋势。

---

## 📊 报告预览

<p align="center">
  <img src="img/screenshot_cc_conversation.png" width="800" alt="CLI 使用示例">
  <br>
  <em>在 Claude Code 中直接运行 <code>/contextdoctor</code>，一键生成 HTML 可视化报告</em>
</p>

<p align="center">
  <img src="img/Snipaste_2026-04-27_16-49-33.png" width="800" alt="健康评分总览">
  <br>
  <em>综合健康评分总览 — 一眼掌握上下文状态，评分环颜色随严重程度变化</em>
</p>

<p align="center">
  <img src="img/Snipaste_2026-04-27_16-50-48.png" width="800" alt="评分明细与问题分布">
  <br>
  <em>评分扣分明细 + 问题分布图表 — 清晰展示评分来源，仅在存在问题时显示</em>
</p>

<p align="center">
  <img src="img/Snipaste_2026-04-27_16-50-33.png" width="800" alt="问题详情列表">
  <br>
  <em>问题详情列表 — 红色（严重）、金色（警告）、绿色（建议）分级展示，CSS 指示器替代 emoji</em>
</p>

<p align="center">
  <img src="img/Snipaste_2026-04-27_16-50-19.png" width="800" alt="多语言切换">
  <br>
  <em>多语言界面 — 中文/英文/日文/韩文一键切换，偏好自动持久化</em>
</p>

报告特点：
- 🎨 **Starbucks 设计系统** - 温暖的色调，舒适的阅读体验
- 🌍 **多语言界面** - 中文/英文/日文/韩文一键切换
- 📅 **时间戳命名** - 自动保存到 `~/.contextdoctor/reports/`，方便历史追踪
- 📱 **响应式布局** - 支持桌面和移动设备
- 🌈 **严重等级颜色** - 红色（严重）、金色（警告）、绿色（建议）
- 📈 **动态图表** - 直观展示问题分布

---

## 🏗️ 支持的框架

| 框架 | 安装方式 | 指令 |
|------|----------|------|
| Claude Code | Skill 系统 | `/contextdoctor`, `/repair` |
| OpenAI Codex | Skills 系统 (`.agents/skills/`) | `$contextdoctor`, `$repair` |
| Cursor | Custom Commands | `/contextdoctor`, `/repair` |
| OpenCode | `commands/` 目录 | `/contextdoctor`, `/repair` |
| Crush | JSON 配置 | `contextdoctor`, `repair` |

---

## 📖 文档

- [COMMANDS_REFERENCE.md](docs/COMMANDS_REFERENCE.md) - 各框架指令实现参考
- [DESIGN.md](docs/DESIGN.md) - 报告设计规范（Starbucks 设计系统）
- [Begin.md](docs/Begin.md) - 项目需求文档

---

## 🛠️ 开发

```bash
# 克隆仓库
git clone https://github.com/contextdoctor/contextdoctor.git
cd contextdoctor

# 安装依赖
npm install

# 运行测试
npm test

# 构建插件
npm run build
```

---

## 🤝 贡献

欢迎贡献代码、提交 Issue 或改进文档！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

---

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

<p align="center">
  🩺 <b>Context Doctor</b> - 守护您的对话上下文健康
</p>
