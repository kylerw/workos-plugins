---
name: workos-capture
description: >
  Capture account truth — touches, commitments, and meeting notes — into the account's own
  files, reviewed before anything is written. Two intents behind one front door. Log (ad
  hoc, no recording): "log a call", "log a meeting", "we just met with", "I owe them",
  "they committed to", "record that I", "capture follow-up", "log activity". Meeting
  (recorded): "capture the meeting with X", "draft notes for my call with X", "write up
  the meeting" — blends whatever recording sources the config lists (probed, never
  assumed). Emits a paste-ready locked-format next-step line; never writes Salesforce.
  Manual-only in v1. DO NOT attempt without loading — it enforces the account-resolution
  rules, the single approval gate, collision handling, and the locked next-step format.
---

# workos-capture — account truth, captured (L4)

## Role

Turn what just happened with a customer into durable account files — a touch, a
commitment (either direction), or a full consolidated meeting note — shown to the user
before a single byte is written. Facts, then a clean write. Contracts (by reference —
their text ships in `assets/shared/contracts.md`): C2 · C4 · C5 · C7 · C11 · C13.

**Bundle location:** resolve every `assets/` path in this file relative to THIS skill's
own folder — the folder containing this SKILL.md. Under direct .skill upload that is
`.claude/skills/workos-capture/` under the session mount; under a plugin install it is
the plugin's skill folder. Never resolve `assets/` in the memory root or project folder.

**Write-routing (the three-owner rule):** account truth (commitments, strategy,
meeting records) is THIS skill's lane — it writes `Account_Notes.md`, `02_Meetings/`,
and journal pointers. It NEVER writes `state/` (C4 — sync's next pass reads what capture
wrote as evidence), never Salesforce (C7), never another skill's files.

## Step 0 — every capture

1. **Config (C2):** resolve `{memory_root}`, `{user_name}`, `{initials}`,
   `{integrations}` via `core.md`, with the schema's missing-value behavior
   (`assets/shared/identity.schema.md`): `memory_root` unresolvable → STOP and offer
   `workos-setup`; `initials` missing → derive from `{user_name}` and confirm once.
   "Today" comes only from the surface-provided date.
2. **Intent:** log vocabulary (ad hoc, no recording) vs meeting vocabulary (recorded
   consolidation) — see the description. Ambiguous → one question (C11, asked through the
   platform's structured-question tool, like every question in this skill): "1. Quick log
   — I'll tell you what happened / 2. Meeting capture — pull the recordings / 3. Stop."
3. **Resolve the account** against the subdirectories of `{memory_root}/Accounts/`
   (`_`-prefixed folders excluded):
   - Exact or substring match → proceed.
   - Plausible nickname/abbreviation (initial letters, shortened form) matching exactly
     one folder → ALWAYS confirm (C11): "1. Yes — {Folder Name} / 2. No — show me the
     candidates / 3. It's a new account." A fuzzy match is never certain enough to skip
     this, even when it looks obvious.
   - No match, or several plausible matches → ask which (C11), never guess.
   - Genuinely new account → capture does NOT scaffold; offer `workos-setup`
     ("init {account}") and, for now, proceed with the capture targeting the confirmed
     folder name — the folder and `Account_Notes.md` are created by THE GATE's approved
     write (named in the bundle), structure back-fill stays setup's job.
   - Capture only into accounts under this root — never another rep's book.

---

## LOG — ad hoc (no recording to consolidate)

1. **Collect the facts** (from what the user already said first; ask only for gaps, C11):
   - What happened, one clear sentence (call, email, hallway, text, commitment) — required.
   - When it happened (default: today) — the EVENT date; it goes in the text, not the
     bullet stamp (see THE GATE).
   - If a commitment was made, either direction: owner (`me` = I owe / `them` = they owe),
     what's owed, any due hint ("this week", "by 08/15").
2. **A pure touch** (no commitment, no next step) writes NO account file: its durable
   record is the journal line itself, which carries the sentence —
   `- {date} touch [[{Account}]]: {what happened}` — and the gate says so plainly
   ("journal note only"). Never improvise a section or file for a touch.
3. Proceed to THE GATE.

## MEETING — recorded consolidation

1. **Identify the meeting:** if not already named — with `ms365` configured and probing
   (C13): the most recent PAST calendar event with an external attendee, within the last
   7 days; without it (or probe failing — loud skip): ask (C11) for account, date, and a
   short meeting label. Confirm account, time, attendees before pulling anything.
   Resolve the account per Step 0.3.
2. **Pull sources — priority gong → teams-transcript → hinotes** (probe before first use,
   C13; configured-but-failing = a loud named skip in the output; unconfigured = silently
   absent, never mentioned):
   - **gong** (only if `gong` is in `{integrations}`): account/deal query scoped to the
     meeting's calendar day.
   - **teams transcript** (part of `ms365` — gated on `ms365`, not a separate key): the
     calendar event's attached online-meeting transcript resource. No resource attached →
     quietly no record for this meeting; a resource that EXISTS but fails to read → a
     loud named skip. Content already retrieved before a failure is KEPT and used,
     flagged as partial — never discarded.
   - **hinotes** (only if `hinotes` is in `{integrations}`): search by account/date, then
     VERIFY the match is this meeting — start time inside the meeting window, or
     title/attendee correspondence — before blending. Unverifiable match → ask (C11) or
     exclude; never blend on account/date alone.
3. **Blend by default** into one narrative — what was discussed, decisions, objections,
   momentum — attributing a source inline only where it adds credibility or resolves a
   conflict. **Sources-separate flag:** the user may set it any time up to approval,
   including as a gate Adjust; when set, both the draft and the write are per-source
   FILES (`Gong.md`, `Teams.md`, `HiNotes.md`) — never a single sectioned note.
   Fictional example of earned attribution: "per the recording, pricing was the sticking
   point; my own notes add that budget timing was also raised."
4. **No source has a record anywhere:** say exactly that (never invent transcript
   content) and offer to continue **keeping meeting intent** — the user's own account of
   the meeting becomes the meeting note, sourced "from {user_name}'s recollection, no
   recording available." It still lands in `02_Meetings/` like any meeting note.
5. Proceed to THE GATE.

---

## THE GATE — one approval, then write (C5)

Draft the full bundle, write nothing. The bundle is an explicit manifest — for every
file: create vs append, the exact path, the complete proposed content (including a new
account folder when Step 0.3 confirmed one: "this will create `Accounts/{name}/` and its
`Account_Notes.md`").

1. **Meeting note** (meeting intent only) — the consolidated narrative, linking
   `[[{Account}]]` and the note's own folder name verbatim as
   `[[{YYYY-MM-DD}_{short label}]]`.
2. **Commitment bullet(s)** — exactly the shared template's grammar
   (`assets/shared/memory-structure/Account_Notes.md`):
   `- [ ] [YYYY-MM-DD] (me/them) {what} — due: {MM/DD or "unspecified"} — {opp/context}`.
   **The `[YYYY-MM-DD]` stamp is the CAPTURE date (surface-provided today), never the
   event date** — sync's dedupe seam reads it; an earlier event date belongs in `{what}`.
   Meeting-sourced bullets end `{opp/context}` with the note's `[[{YYYY-MM-DD}_{label}]]`
   link.
3. **Next-step line** (when warranted) — the locked format is owned by
   `workos-next-steps`: hand the already-confirmed fields over in-session (its delegate
   procedure) and use the line it returns. `workos-next-steps` unavailable in this
   session → render from `assets/shared/locked-next-step-format.md` yourself and
   **mechanically verify ≤254 characters** (count with a command per fact #8; no way to
   count → mark the line "count unverified — verify before pasting").

Present the whole bundle in one structured approval (C11): "1. Save as shown / 2. Adjust
— tell me what / 3. Drop the next-step line, save the rest / 4. Stop — save nothing."
Any adjustment invalidates prior approval — re-present the revised bundle. On 3, write
items 1–2 and the journal pointer exactly as approved and skip the next-step line
entirely, including the workos-next-steps log offer. Nothing below happens without an
explicit approval of the exact bundle being written.

**On approval, write IN ORDER — stop on the first failure, report precisely what was and
wasn't written; never retry a write whose content might already be on disk without
reading the target first:**

1. **Meeting note** → `{memory_root}/Accounts/{account}/02_Meetings/{YYYY-MM-DD}_{short
   label}/Notes.md` (per-source files instead when sources-separate). **Collision rule:
   pick a label that differs from every existing `{YYYY-MM-DD}_*` folder for this
   account/date; if the target folder or note file already exists anyway, never overwrite
   silently — one question (C11): "1. Replace the existing note / 2. Save under a new
   label / 3. Append as a dated addendum / 4. Stop."**
2. **Commitments** → into the `## Open Commitments` section of
   `{memory_root}/Accounts/{account}/Account_Notes.md`, as the section's last line
   (immediately before the next `##` header, or end-of-section — "append" NEVER means
   end-of-file). File absent → create it from the shared template. Section absent in an
   existing file → append a `## Open Commitments` header + the bullet at the END of the
   file — never rewrite, reorder, or re-template existing content.
3. **Journal pointer, LAST — only after the writes above are verified by read-back**
   (append-only bookkeeping, C5-exempt) → `{memory_root}/journal/{YYYY-MM}.md`:
   `- {date} captured {touch|meeting} [[{Account}]] → {saved path}` — or the touch-only
   form from LOG step 2 when nothing else was written.
4. **Next-step line: presented as text ready to paste (C7)** — say plainly it needs
   manual pasting. Offer the `workos-next-steps` handoff to append its running per-opp
   log entry (fields handed over as already-confirmed — the user does not re-approve).

**Confirm honestly** — each path written (verified by read-back), the commitment lines
as saved, the paste-ready next-step line. A write that failed is reported as failed,
never as success; a partial completion names exactly which items landed.

---

## Anti-patterns — never

- Writing anything before the gate's explicit approval of the exact bundle — capture is
  manual-only in v1, and a draft is never a save.
- Writing `state/` (C4 — sync reads capture's files as evidence), Salesforce (C7), or
  another skill's files; scaffolding account structure (setup's job — offer
  "init {account}").
- Overwriting an existing meeting note without the collision question.
- Inventing transcript content, contact names, titles, or account folders; treating a
  fuzzy account match as certain without confirmation; blending an unverified
  same-day recording.
- Consulting a recording source that isn't in `{integrations}` (C13), silently swallowing
  a configured source's read failure, or discarding partial content a failed source
  already returned.
- Freeform next-step lines, or presenting a line whose length was never mechanically
  verified without saying so.
- Stamping commitment bullets with the event date instead of the capture date, or any
  bullet grammar other than the shared template's.
- Prose-rendered numbered questions — every question goes through the platform's
  structured-question tool (C11).
- Capturing into another rep's accounts.
