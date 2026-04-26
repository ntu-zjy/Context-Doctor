# Framework Compatibility

## Codex

The repo includes a Codex plugin manifest:

```text
plugins/contextdoctor/.codex-plugin/plugin.json
```

It also exposes a skill at:

```text
plugins/contextdoctor/skills/contextdoctor/SKILL.md
```

Use:

```bash
contextdoctor run --framework=codex
```

## Claude Code

The Claude plugin metadata lives at:

```text
plugins/contextdoctor/.claude-plugin/plugin.json
```

For slash commands, copy or symlink `plugins/contextdoctor/commands/contextdoctor.md` into a Claude commands directory, depending on your plugin packaging workflow.

Use:

```bash
contextdoctor run --framework=claude
```

Claude transcript discovery scans `~/.claude/projects` by default. If the active transcript cannot be inferred, set:

```bash
export CONTEXTDOCTOR_TRANSCRIPT=/path/to/session.jsonl
```

## OpenCode

The OpenCode plugin hook is:

```text
plugins/contextdoctor/.opencode/plugins/contextdoctor.js
```

It registers the Context Doctor skill and injects `/contextdoctor` guidance into the system prompt transform.

Use:

```bash
contextdoctor run --framework=opencode
```

## Cursor

The Cursor plugin metadata is:

```text
plugins/contextdoctor/.cursor-plugin/plugin.json
```

Cursor transcript storage varies by version and workspace. Context Doctor scans common Cursor storage directories, but explicit transcript paths are recommended:

```bash
contextdoctor run --framework=cursor --transcript /path/to/session.jsonl
```
