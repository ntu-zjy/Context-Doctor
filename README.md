<p align="center">
  <img src="docs/assets/contextdoctor-logo.svg" width="96" alt="Context Doctor logo">
</p>

<h1 align="center">Context Doctor</h1>

<p align="center">
  A local <code>/contextdoctor</code> command for finding <strong>context pollution</strong> in coding-agent chats.
  It shows which old messages, failed tools, stale files, or conflicting instructions are confusing your agent.
</p>

<p align="center">
  <a href="README.md">English</a> |
  <a href="README.zh.md">简体中文</a> |
  <a href="README.ja.md">日本語</a> |
  <a href="README.ko.md">한국어</a>
</p>

<p align="center">
  <img alt="Node 18.18+" src="https://img.shields.io/badge/node-18.18%2B-339933">
  <img alt="License MIT" src="https://img.shields.io/badge/license-MIT-blue">
  <img alt="Context pollution" src="https://img.shields.io/badge/solves-context%20pollution-f97316">
  <img alt="Local first" src="https://img.shields.io/badge/local--first-no%20cloud%20upload-0f766e">
  <img alt="Frameworks" src="https://img.shields.io/badge/Codex%20%7C%20Claude%20Code%20%7C%20OpenCode%20%7C%20Cursor-supported-7c3aed">
</p>

---

## It Solves Context Pollution

Context pollution is what happens when a coding-agent conversation contains too much leftover information that no longer helps the current task.

It can be an old requirement, a failed command output, a stale file path, a corrected mistake, an unrelated skill, or a previous task that should no longer matter.

When those messages stay in the active conversation, the agent may start using them as if they were still true.

## What Does That Look Like?

You have probably seen this happen:

- You debugged one bug, then switched to a new feature.
- A command failed, but its long stack trace is still in the chat.
- You corrected the agent once, but the wrong assumption is still nearby.
- You loaded a skill for an earlier task, and now the agent is following it for the wrong job.
- After an hour, the agent starts editing the wrong file or repeating something you already fixed.

Context Doctor checks the conversation itself. It reads the local session transcript, finds the messages most likely to pollute the current task, and turns them into a clear browser report.

The report answers three simple questions:

- What is polluting this session?
- How serious is it?
- What should I restate, ignore, or move into a fresh session?

## What You Get

- A 0-100 health score for the current agent session
- A timeline of user messages, assistant replies, tool calls, and tool results
- Red, orange, and yellow markers on suspicious messages
- Plain-language reasons and suggested fixes
- Filters for common problems like failed commands, stale file paths, old tasks, and conflicting instructions
- A self-contained HTML file you can open offline

## When To Run It

Run `/contextdoctor` when:

- the agent keeps referencing an old file or task
- responses suddenly feel worse after a long session
- several tool calls failed and the chat is noisy
- you switched tasks without starting a new conversation
- the agent seems to ignore your latest instructions

## Demo

```bash
npm run demo
```

The demo analyzes a hand-crafted polluted session and writes:

```text
./.contextdoctor/report-<timestamp>.html
```

Open the report and you get a timeline like this:

![Context Doctor report preview](docs/assets/report-preview.svg)

## Quick Start

```bash
git clone https://github.com/contextdoctor/context-doctor.git
cd context-doctor
npm test
npm run demo
```

Run against a known transcript:

```bash
node plugins/contextdoctor/scripts/contextdoctor.mjs run \
  --transcript fixtures/polluted-session.jsonl \
  --framework=codex \
  --no-open
```

After linking or installing the package:

```bash
contextdoctor run --framework=auto --scope=recent
```

## Install By Framework

Start by making the CLI available from the repository root:

```bash
npm link
```

Codex local plugin:

```bash
# Keep .agents/plugins/marketplace.json pointing to ./plugins/contextdoctor
contextdoctor run --framework=codex
```

Claude Code slash command:

```bash
mkdir -p .claude/commands
ln -sf "$PWD/plugins/contextdoctor/commands/contextdoctor.md" \
  .claude/commands/contextdoctor.md
contextdoctor run --framework=claude
```

OpenCode plugin:

```json
{
  "plugin": ["contextdoctor@git+file:///absolute/path/to/Context-Doctor/plugins/contextdoctor"]
}
```

```bash
contextdoctor run --framework=opencode
```

Cursor or transcript-first agents:

```bash
contextdoctor run \
  --framework=cursor \
  --transcript /path/to/session.jsonl
```

Custom or multi-agent systems should write one transcript per agent and diagnose each one explicitly:

```bash
contextdoctor run --framework=auto --transcript ./logs/planner.jsonl
contextdoctor run --framework=auto --transcript ./logs/coder.jsonl
contextdoctor run --framework=auto --transcript ./logs/reviewer.jsonl
```

## Slash Command

```text
/contextdoctor
/contextdoctor --scope=recent
/contextdoctor --focus=tool_noise
/contextdoctor --no-open
```

## What It Detects

| Category | What It Catches |
|---|---|
| Stale State | File and code descriptions that no longer match the workspace |
| Conflicting Instructions | Requirements that contradict earlier turns |
| Tool Noise | Failed calls, stack traces, oversized logs, and command residue |
| Task Drift | Completed or abandoned subtasks still influencing the session |
| Hallucinated Facts | Corrected false claims that remain in context |
| Scope Bloat | Huge dumps, dependency trees, generated files, and unrelated logs |
| Persona Drift | Old role or behavior injections that no longer match the task |
| Skill Conflict | Loaded skills that are unrelated or prescribe incompatible conventions |

## Severity Model

| Severity | Meaning | Penalty |
|---|---|---:|
| Critical | Likely to cause outright task failure | -25 |
| High | Already degrading output quality | -15 |
| Medium | Manageable now, but compounds in long sessions | -8 |
| Low | Advisory, no current impact | -3 |

```text
score = max(0, 100 - sum(severity penalties))
```

| Score | Tier |
|---:|---|
| 80-100 | Healthy |
| 50-79 | Caution |
| 0-49 | Critical |

## Framework Support

| Framework | Status | Adapter Notes |
|---|---|---|
| Codex | Included | Plugin manifest, skill, command instructions, transcript locator |
| Claude Code | Included | Plugin metadata and slash-command instructions |
| OpenCode | Included | Plugin hook registers the skill and injects command guidance |
| Cursor | Included | Plugin metadata and command instructions |
| Aider / Continue.dev | Planned | Adapter welcome |

If a framework does not expose the active transcript path reliably, pass one explicitly:

```bash
CONTEXTDOCTOR_TRANSCRIPT=/path/to/session.jsonl contextdoctor run --framework=auto
```

## Token-Efficient By Design

Context Doctor does not ask the model to print a huge HTML file.

1. Local assets ship with the plugin: template, CSS, browser script, parser, renderer.
2. The model only emits compact JSON annotations when model review is needed.
3. The local renderer reads the transcript from disk and merges it with annotations.

Annotation shape:

```json
{
  "findings": [
    {
      "turn_id": "msg_0042",
      "type": "tool_noise",
      "severity": "medium",
      "reason": "Failed command output is still dominating the active context.",
      "fix": "Restate the known-good state and ignore this failed output unless still debugging it."
    }
  ]
}
```

Render annotations locally:

```bash
contextdoctor render --annotations annotations.json --framework=auto
```

## Configuration

Copy `contextdoctor.config.example.json` to `contextdoctor.config.json` or `./.contextdoctor/config.json`:

```json
{
  "recentTurns": 60,
  "reportLanguage": "en",
  "autoOpen": true,
  "severityPenalty": {
    "critical": 25,
    "high": 15,
    "medium": 8,
    "low": 3
  }
}
```

## Repository Map

```text
plugins/contextdoctor/scripts/contextdoctor.mjs    CLI, analyzer, transcript locators
plugins/contextdoctor/assets/report-template.html  Self-contained report template
plugins/contextdoctor/skills/contextdoctor/        Agent workflow instructions
plugins/contextdoctor/commands/contextdoctor.md    Slash-command prompt
docs/architecture.md                               Renderer architecture
docs/frameworks.md                                 Adapter notes
fixtures/                                          Clean and polluted sample sessions
tests/                                             Node test suite
```

## Roadmap

- Native marketplace packaging for more agent frameworks
- Health trends across multiple reports
- Diff view between two diagnoses
- One-click cleanup prompts
- More community-maintained README translations

## Contributing

The best first contributions are adapter improvements and translated READMEs. Keep the core promise intact: local-first, read-only, token-efficient, and useful within one command.

Run checks before opening a PR:

```bash
npm test
```
