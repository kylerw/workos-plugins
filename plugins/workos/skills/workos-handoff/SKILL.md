---
name: workos-handoff
description: >
  Standardized session→session handoff — end a work session by writing ONE small resume
  file, start the next session from it instead of re-deriving. Hand off: "hand off",
  "hand off my session", "write the handoff", "wrap up this session" — drafts
  {memory_root}/state/handoff.md (First action → Where things stand → Open loops →
  Decisions made → Clocks → Locations), shows the complete file, writes only on approval,
  and archives the prior handoff to state/handoffs/. Resume: "resume", "resume my
  handoff", "pick up where I left off" — reads the current handoff ONLY (~2k tokens) and
  starts at its First action; never re-derives from the root. Attended-only — refuses the
  unattended marker. Optional power-user hooks (context statusline, hand-off nudge,
  auto-resume, stop reminder) ship in assets/hooks/; the skill is fully functional
  without them. DO NOT attempt without loading — it enforces the artifact schema, the
  archive step, the approval gate, and the no-re-derive rule.
---

# workos-handoff — the session seam

## Role

End a session by writing one small resume file; start the next one from it. This is the
engine's answer to session-per-task: the next session reads ~2k tokens, not the whole
prior conversation. Contracts (by reference — their text ships in
`assets/shared/contracts.md`): C2 · C3 · C4 · C5 · C6 · C11 · C14 · C15.

**Bundle location:** resolve every `assets/` path in this file relative to THIS skill's
own folder — the folder containing this SKILL.md. Under direct .skill upload that is
`.claude/skills/workos-handoff/` under the session mount; under a plugin install it is
the plugin's skill folder. Never resolve `assets/` in the memory root or project folder.

**Write-routing:** hand-off writes exactly three things, all inside one locked sequence:
`state/handoff.md`, its dated archive in `state/handoffs/`, and the usage-log open/close
pair (`assets/shared/usage-log.md`). Never account files, never `Team/`, never
Salesforce, never another skill's files. **Resume writes NOTHING — not even a usage
record.** `assets/hooks/` is documentation for the user's own machine; this skill never
installs, runs, or probes a hook.

## Unattended marker — refuse (C15)

handoff is not an unattended pass. An invoking prompt carrying `(scheduled,
unattended)` → BLOCK per `assets/shared/unattended-execution.md` §BLOCK enumeration
case 3: emit exactly
`RUN_REPORT handoff blocked — handoff is not an unattended pass ({version} on {surface})`
({version} = `assets/shared/VERSION` verbatim, or "unstamped"), read nothing else,
write nothing (no lock, no state, no usage record), stop. Both verbs refuse
identically; there is no park path.

## Step 0 — every invocation

1. **Config (C2):** resolve `{memory_root}`, `{user_name}`, `{timezone}` via `core.md`
   with the schema's missing-value behavior (`assets/shared/identity.schema.md`):
   `memory_root` unresolvable → STOP and offer `workos-setup`. "Today" comes only from
   the surface-provided date (C3).
2. **Version notice** per `assets/shared/version-check.md`.
3. **Intent:** hand-off vocabulary vs resume vocabulary (frontmatter above). Ambiguous →
   one C11 question: `1. Hand off (write the resume file)` / `2. Resume (read it and
   start)`.

No integration probes — this skill touches only the root's own files.

## HAND OFF

1. **Gather from THIS conversation only.** The handoff records what this session knows —
   the skill never trawls the root to reconstruct a session it wasn't part of. If
   nothing substantive happened, say so and ask (C11): `1. Write it anyway (thin
   handoff)` / `2. Skip — leave the current handoff in place`.
2. **Draft the complete file** per §The artifact:
   - **First action** — ONE binary step the next session starts with. If the session
     ended mid-task, it is the task's next physical step; if between tasks, the top
     open loop's next step. Never a theme ("continue the renewal work") — always an
     act ("open X and do Y").
   - **Open loops** — each `- {loop} — owner: {who} — {next step}.` More than 5 →
     triage question (C11) at the gate: which five ride; the rest are dropped from the
     handoff (they live in their authoritative homes, not here).
   - **Locations** — pointers (paths, issue numbers, thread subjects). Never copied
     content: the handoff cites authoritative sources, it never restates account or
     opportunity state into itself (C6).
   - `written:` — user-local, starts `YYYY-MM-DD`, zone label per the #49 render rule
     (`assets/shared/identity.schema.md` `timezone` row).
3. **Render the COMPLETE file in-chat** — frontmatter and all. What is approved is
   what is written, byte for byte (C14).
4. **ONE approval gate (C5, C11):** `1. Write it` / `2. Edit first (say what changes)` /
   `3. Cancel — write nothing`.
5. **On approval, one locked sequence (C4):**
   a. Acquire the pass lock (`assets/shared/state-schema/README.md §.pass-lock.json`) —
      full lock protocol by reference to workos-sync Step 0.4 (acquire over
      absent/tombstone, heartbeat, ownership check before writes, verified tombstone
      release, never delete).
   b. Usage `open` — `runId` `handoff-{YYYYMMDD}T{HHMMSS}Z-{4hex}`, mode `handoff`
      (`assets/shared/usage-log.md`).
   c. If `state/handoff.md` exists: move it to
      `state/handoffs/{its own frontmatter written-date}.md` — the OLD file's date,
      not today's; same-day collision → `-2`, `-3`, … Create `state/handoffs/` if
      absent (first archive creates it — #247 owns making it required shape).
   d. Write the approved bytes to `state/handoff.md`.
   e. Usage `close`, outcome `completed`.
   f. Release the lock.
   A step-c/d failure → finish what is recoverable, outcome `degraded` (or `error` if
   nothing was written), and say exactly what state the two files are in — never a
   green summary over a partial write.
6. **Confirm in one line:** both paths + "next session: say **resume**."

## RESUME

1. Read `{memory_root}/state/handoff.md` — ONLY. The archive is never read unless the
   user asks for a specific date. No other root reads; resume TRUSTS the file rather
   than re-deriving (that is the entire point of the artifact).
2. Restate: the **First action** verbatim, then the Open loops list.
3. If `written:` is more than 7 days old, say so in one line ("this handoff is N days
   old") — then proceed anyway; staleness is information, not a gate.
4. Offer (C11): `1. Start on the First action now` / `2. Something else first`.
5. Missing file → say so, then (C11): `1. Start fresh — run workos-sync for today's
   picture` / `2. Just tell me what you want to do`.

Resume writes nothing.

## The artifact

`state/handoff.md`, schema `handoff.v1`, validated shape in
`assets/shared/state-schema/README.md §handoff.md`. Frontmatter keys — exactly these
four: `schema` · `written` · `by` · `session`. Body sections, fixed order, all six
always present (an empty section keeps its header with `- none` beneath it):

`## First action` · `## Where things stand` · `## Open loops` · `## Decisions made` ·
`## Clocks` · `## Locations`

Fictional example (complete file):

```markdown
---
schema: handoff.v1
written: 2026-08-04 17:30 MT
by: Jane Doe
session: Contoso Medical renewal prep + weekly next-steps drafting
---

# Handoff — resume here

## First action

Open the Contoso Medical draft next-step line (in `state/` staging) and send it
through the next-steps single pass.

## Where things stand

- The renewal summary draft is approved and filed; the next-step line is drafted but
  NOT yet staged.
- The Fabrikam Clinics intro deck request is written up in Account_Notes.

## Open loops

- Contoso next-step line — owner: me — stage it via next-steps single.
- Fabrikam intro deck — owner: Jordan Doe — waiting on their template; nudge Thursday.

## Decisions made

- Renewal framing leads with the support-hours delta, not price (decided this
  session; do not re-litigate).

## Clocks

- Thursday 2026-08-06: nudge Jordan Doe if the template hasn't arrived.

## Locations

- `Accounts/Contoso Medical/Account_Notes.md` — renewal framing section.
- `Accounts/Fabrikam Clinics/Account_Notes.md` — deck request bullet.
```

## Optional hooks — power users only

`assets/hooks/INSTALL.md` documents four optional Claude Code harness pieces: the
context statusline, the 150k hand-off nudge, SessionStart auto-resume, and the Stop
reminder. Cowork cannot run hooks; nothing in this skill depends on them.

## Anti-patterns — never

- **"park"** for this artifact, in any output — that word belongs to the sweep/intake
  staged bundle.
- Re-deriving on resume (reading accounts, mail, or state beyond `handoff.md`).
- Reading the archive by default.
- Copying account/opportunity content into the handoff (C6 — pointers only).
- Voice passes — the handoff is a state artifact, not outbound communication; no
  `voice-contract` emit point exists here.
- A sixth open loop. Five, triaged at the gate.
- Any unattended path, any scheduled invocation, any write during resume.
