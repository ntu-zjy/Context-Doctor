# Context Doctor Architecture

## Components

- `scripts/contextdoctor.mjs`: transcript locator, parser, analyzer, scorer, and renderer CLI.
- `assets/report-template.html`: self-contained report shell with CSS and JavaScript.
- `skills/contextdoctor/SKILL.md`: agent-facing workflow instructions.
- `commands/contextdoctor.md`: slash-command prompt body shared by command-capable frameworks.
- `.opencode/plugins/contextdoctor.js`: OpenCode plugin hook that registers the skill and injects command guidance.

## Local Renderer Contract

The renderer owns the expensive data path. It reads full transcript bodies from disk and merges them with compact annotations:

```json
{
  "findings": [
    {
      "turn_id": "msg_0042",
      "type": "stale_state",
      "severity": "high",
      "reason": "...",
      "fix": "..."
    }
  ]
}
```

The model never needs to emit HTML. A normal diagnostic emits only annotations, and the local renderer writes the full report.

## Transcript Normalization

Adapters produce a common message record:

```json
{
  "id": "msg_0001",
  "role": "user",
  "kind": "user",
  "timestamp": "2026-04-26T00:00:00.000Z",
  "toolName": null,
  "text": "message body"
}
```

If a framework does not expose stable IDs, Context Doctor assigns deterministic `msg_0001`-style IDs from transcript order.

## Severity Penalties

Defaults match the product requirements:

- Critical: 25
- High: 15
- Medium: 8
- Low: 3

The score is recomputed from annotations so model-supplied scores cannot drift from configured penalties.

## Read-Only Behavior

Context Doctor does not mutate user code or framework session state. Its only write is the generated report under `./.contextdoctor/` unless `--output` or `--report-dir` is provided.
