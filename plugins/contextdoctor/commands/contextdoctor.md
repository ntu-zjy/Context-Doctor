---
description: "Diagnose context pollution and generate a local HTML report"
argument-hint: "[--scope=recent] [--focus=tool_noise] [--no-open]"
---

Run Context Doctor for the active session.

Use the local CLI and keep the response short:

```bash
contextdoctor run --framework=auto $ARGUMENTS
```

If `contextdoctor` is not on `PATH`, use the repository script:

```bash
node plugins/contextdoctor/scripts/contextdoctor.mjs run --framework=auto $ARGUMENTS
```

Do not paste the transcript into the chat. After the command finishes, tell the user the score, tier, finding count, and HTML report path.
