<p align="center">
  <img src="docs/assets/contextdoctor-logo.svg" width="96" alt="Context Doctor logo">
</p>

<h1 align="center">Context Doctor</h1>

<p align="center">
  The <code>/contextdoctor</code> command for long coding-agent sessions.
  Detect context rot before your agent starts touching the wrong file, following stale instructions, or repeating old mistakes.
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
  <img alt="Local first" src="https://img.shields.io/badge/local--first-no%20cloud%20upload-0f766e">
  <img alt="Frameworks" src="https://img.shields.io/badge/Codex%20%7C%20Claude%20Code%20%7C%20OpenCode%20%7C%20Cursor-supported-7c3aed">
</p>

---

## Why This Exists

Coding agents get weird after long sessions. The transcript quietly fills with failed commands, stale file paths, abandoned subtasks, contradictory asks, unrelated skills, and corrected hallucinations. Humans feel the degradation, but it is hard to point at the exact cause.

Context Doctor turns that invisible context rot into a browser report:

- a health score from 0 to 100
- severity-tagged findings with concrete fixes
- a full timeline of user, assistant, tool call, and tool result messages
- filters for the eight pollution categories
- hover evidence for every flagged turn
- self-contained HTML that works offline

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
