---
name: contextdoctor
description: Use when the user invokes /contextdoctor or asks to diagnose context pollution, context rot, stale instructions, tool noise, or skill conflicts in the current agent session.
---

# Context Doctor

Context Doctor creates a local HTML health report for the current agent transcript. It is read-only: do not mutate user code, session state, or project files except for writing report artifacts under `./.contextdoctor/`.

## Required Workflow

1. Prefer the local CLI instead of pasting transcript content into the conversation:

   ```bash
   contextdoctor run --framework=auto
   ```

   If the `contextdoctor` binary is not on `PATH`, run the repo-local script:

   ```bash
   node plugins/contextdoctor/scripts/contextdoctor.mjs run --framework=auto
   ```

2. Forward user flags exactly when present:

   - `--scope=recent`
   - `--focus=<category>`
   - `--no-open`

3. If the transcript cannot be located, ask the user to set `CONTEXTDOCTOR_TRANSCRIPT` or pass `--transcript=<path>`.

4. Keep model output compact. Report only the health score, tier, finding count, and generated HTML path.

## Categories

Context Doctor checks these eight pollution dimensions:

- `stale_state`
- `conflicting_instructions`
- `tool_noise`
- `task_drift`
- `hallucinated_facts`
- `scope_bloat`
- `persona_drift`
- `skill_conflict`

## Annotation Mode

When explicitly asked for model annotations, emit only JSON:

```json
{
  "findings": [
    {
      "turn_id": "msg_0042",
      "type": "tool_noise",
      "severity": "medium",
      "reason": "Short diagnostic reasoning.",
      "fix": "Directly executable remediation."
    }
  ]
}
```

Then render it locally:

```bash
contextdoctor render --annotations annotations.json --framework=auto
```
