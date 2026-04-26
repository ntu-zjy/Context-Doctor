# Installing Context Doctor for OpenCode

Add this repository as an OpenCode plugin in `opencode.json`:

```json
{
  "plugin": ["contextdoctor@git+file:///absolute/path/to/Context-Doctor/plugins/contextdoctor"]
}
```

For local development, you can also run the CLI directly:

```bash
node plugins/contextdoctor/scripts/contextdoctor.mjs run --framework=opencode
```

If OpenCode cannot locate the active transcript, set:

```bash
export CONTEXTDOCTOR_TRANSCRIPT=/path/to/session.jsonl
```
