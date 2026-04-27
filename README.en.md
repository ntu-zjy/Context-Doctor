# 🩺 Context Doctor

<p align="center">
  <img src="docs/assets/contextdoctor-logo.svg" width="128" height="128" alt="Context Doctor Logo">
</p>

<p align="center">
  <b>Context Pollution Detection & Repair Tool</b>
</p>

<p align="center">
  <a href="README.md">中文</a> |
  <a href="README.en.md">English</a> |
  <a href="README.ja.md">日本語</a> |
  <a href="README.ko.md">한국어</a>
</p>

---

## 🎯 Problem Statement

When using AI Agents (Claude Code, Codex, Cursor, etc.), have you ever encountered:

1. **Conflicting Prompts** - Previous instructions conflict with current goals, confusing the AI
2. **Skill/Plugin Conflicts** - Too many loaded tools interfering with each other or overlapping
3. **Error Accumulation** - A small early error causing all subsequent reasoning to deviate

**Context Doctor** helps you detect and fix these "context pollution" issues.

---

## ✨ Features

- 🔍 **Smart Detection** - Automatically identifies 3 types of pollution: Skill conflicts, instruction contradictions, error accumulation
- 📊 **Visual Reports** - Beautiful HTML reports using the Starbucks Design System
- 🌍 **Multi-language Support** - Chinese, English, Japanese, Korean
- 🔧 **One-click Repair** - Not only detects problems but also provides specific fixes
- 🚀 **Minimal Installation** - One command to install across all supported Agent frameworks
- 🎨 **Framework Flexibility** - Supports Claude Code, Codex CLI, Cursor, OpenCode/Crush

---

## 📦 Installation

### Quick Install (Recommended)

```bash
curl -fsSL https://contextdoctor.dev/install.sh | bash
```

### Manual Installation

#### Claude Code

```bash
mkdir -p ~/.claude/skills/contextdoctor
curl -o ~/.claude/skills/contextdoctor/SKILL.md \
  https://raw.githubusercontent.com/contextdoctor/contextdoctor/main/plugins/contextdoctor/skills/contextdoctor/SKILL.md
```

#### Codex CLI

```bash
mkdir -p ~/.codex
curl -o ~/.codex/codex.md \
  https://raw.githubusercontent.com/contextdoctor/contextdoctor/main/plugins/contextdoctor/.opencode/INSTALL.md
```

#### Cursor

```bash
mkdir -p ~/.cursor/commands
curl -o ~/.cursor/commands/contextdoctor.json \
  https://raw.githubusercontent.com/contextdoctor/contextdoctor/main/plugins/contextdoctor/.cursor-plugin/contextdoctor.json
```

#### OpenCode / Crush

```bash
mkdir -p ~/.config/opencode/commands
curl -o ~/.config/opencode/commands/contextdoctor.md \
  https://raw.githubusercontent.com/contextdoctor/contextdoctor/main/plugins/contextdoctor/commands/contextdoctor.md
```

---

## 🚀 Usage

### Check Context Pollution

```bash
/contextdoctor
```

Generates an HTML report showing:
- Comprehensive health score (0-100)
- Pollution type distribution
- Specific issue list
- Repair priority recommendations

### Get Repair Solutions

```bash
/repair
```

In addition to the detection report, provides:
- Specific repair steps for each issue
- Copy-paste ready fix text
- Recommended context cleanup strategies

---

## 📊 Report Preview

<p align="center">
  <img src="docs/assets/report-preview.svg" width="600" alt="Report Preview">
</p>

Report Features:
- 🎨 **Starbucks Design System** - Warm color tones, comfortable reading experience
- 📱 **Responsive Layout** - Supports desktop and mobile devices
- 🌈 **Severity Color Coding** - Red (Critical), Gold (Warning), Green (Suggestion)
- 📈 **Dynamic Charts** - Intuitive problem distribution visualization

---

## 🏗️ Supported Frameworks

| Framework | Installation | Commands |
|-----------|--------------|----------|
| Claude Code | Skill system | `/contextdoctor`, `/repair` |
| OpenAI Codex | `codex.md` + `agents/` | `/contextdoctor`, `/repair` |
| Cursor | Custom Commands | `/contextdoctor`, `/repair` |
| OpenCode | `commands/` directory | `/contextdoctor`, `/repair` |
| Crush | JSON config | `contextdoctor`, `repair` |

---

## 📖 Documentation

- [COMMANDS_REFERENCE.md](docs/COMMANDS_REFERENCE.md) - Framework command implementation reference
- [DESIGN.md](docs/DESIGN.md) - Report design specifications (Starbucks Design System)
- [Begin.md](docs/Begin.md) - Project requirements document

---

## 🛠️ Development

```bash
# Clone repo
git clone https://github.com/contextdoctor/contextdoctor.git
cd contextdoctor

# Install dependencies
npm install

# Run tests
npm test

# Build plugins
npm run build
```

---

## 🤝 Contributing

Welcome contributions, issue submissions, and documentation improvements!

1. Fork this repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add some amazing feature'`)
4. Push branch (`git push origin feature/amazing-feature`)
5. Create Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file

---

<p align="center">
  🩺 <b>Context Doctor</b> - Guarding Your Conversation Context Health
</p>
