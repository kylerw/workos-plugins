# Optional hooks — Claude Code power users only

**Cowork cannot run hooks. Nothing in workos-handoff requires them.** These five files
add ambient support around the skill on a machine running Claude Code: a context
statusline, a heavy-session nudge, auto-resume at session start, and a stop reminder.
Each piece installs alone; install only what you want. ~3 minutes.

## 1. Copy the scripts

Copy the five `.js` files from this folder to `~/.claude/hooks/` (Windows:
`%USERPROFILE%\.claude\hooks\`). They have no dependencies beyond Node itself.

## 2. Create the config file

`~/.claude/workos-handoff.json` (Windows: `%USERPROFILE%\.claude\workos-handoff.json`):

```json
{
  "memory_root": "C:\\Users\\me\\OneDrive\\WorkOS",
  "threshold": 150000
}
```

`memory_root` = the same absolute path your `core.md` records — this is YOUR machine
config, typed by you; no engine file ever contains it. `threshold` (optional) = the
context size, in tokens, past which the nudge fires; default 150000.

## 3. Wire the hooks

Merge into `~/.claude/settings.json` (create it if absent). POSIX paths shown; on
Windows use `%USERPROFILE%\.claude\hooks\...` inside the command strings.

```json
{
  "statusLine": { "type": "command", "command": "node ~/.claude/hooks/ctx-statusline.js" },
  "hooks": {
    "UserPromptSubmit": [ { "hooks": [ { "type": "command", "command": "node ~/.claude/hooks/ctx-nudge.js" } ] } ],
    "SessionStart":     [ { "hooks": [ { "type": "command", "command": "node ~/.claude/hooks/sessionstart-resume.js" } ] } ],
    "Stop":             [ { "hooks": [ { "type": "command", "command": "node ~/.claude/hooks/stop-reminder.js" } ] } ]
  }
}
```

## 4. Verify each piece

- **Statusline:** open any session — the bar shows `ctx Nk` (dim under 150k, yellow at
  150k+, red at 300k+ with "hand off & /clear").
- **Nudge:** in a session past your threshold, send any prompt — a `ctx ~Nk` system
  message appears and the model starts offering the hand-off step at task boundaries.
- **Auto-resume:** write a handoff, `/clear`, start a session, say "resume" — the model
  answers from the handoff without reading the root.
- **Stop reminder:** end a long session without handing off — one advisory line appears.

## Known limits (accepted, named)

- The statusline in the desktop app is verify-on-surface; the three hooks are certain.
- `stop-reminder.js` uses transcript size ≥256KB as its "substantive" test and file
  birthtime (ctime fallback) as session start — filesystems without birthtime may
  misjudge a session that started before midnight. Advisory either way.
- The scripts read only transcript tails and the two files named here — nothing else.
