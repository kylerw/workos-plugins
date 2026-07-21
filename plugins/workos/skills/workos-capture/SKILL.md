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
their text ships in `assets/shared/contracts.md`): C2 · C4 · C5 · C7 · C11 · C13 · C14.

**Bundle location:** resolve every `assets/` path in this file relative to THIS skill's
own folder — the folder containing this SKILL.md. Under direct .skill upload that is
`.claude/skills/workos-capture/` under the session mount; under a plugin install it is
the plugin's skill folder. Never resolve `assets/` in the memory root or project folder.

**Write-routing (the three-owner rule):** account truth (commitments, strategy,
meeting records) is THIS skill's lane — it writes `Account_Notes.md`, `02_Meetings/`,
and journal pointers. It NEVER writes `state/` (C4 — sync's next pass reads what capture
wrote as evidence), never Salesforce (C7), never another skill's files — with ONE named exception: the
single gate-approved `Contacts.md` row/header append (or `Contacts.md` creation from
the shared template when absent) per `assets/shared/contact-resolution.md` (#40).

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
   - Participant names resolve per `assets/shared/contact-resolution.md` before
     drafting; pre-gate confirmations (its step 6) run before THE GATE.
   - An event TIME given (not just a date) → run SCREENSHOT CORRELATION (section
     below) before THE GATE.
2. **A pure touch** (no commitment, no next step, no screenshot attached) writes NO
   account file: its durable record is the journal line itself, which carries the
   sentence — `- {date} touch [[{Account}]]: {what happened}` — and the gate says so
   plainly ("journal note only"). Never improvise a section or file for a touch.
   **Carve-out:** attaching ≥1 screenshot in SCREENSHOT CORRELATION upgrades the touch to
   a lightweight meeting record (a durable `02_Meetings/{YYYY-MM-DD}_{short label}/`
   folder) — it is no longer a pure touch, and the gate says so plainly. Per
   `assets/shared/contact-resolution.md`, a PURE TOUCH (journal-only, no account file
   written) runs resolution for rendering but never offers the registry append and skips
   pre-gate confirmations — resolution questions belong to flows with a durable write to
   attach them to.
3. Proceed to THE GATE.

## MEETING — recorded consolidation

1. **Identify the meeting:** if not already named — with `ms365` configured and probing
   (C13): the most recent PAST calendar event with an external attendee, within the last
   7 days; without it (or probe failing — loud skip): ask (C11) for account, date, a short
   meeting label, and the meeting window — start AND end (or start + duration, default
   30 min), since correlation needs a full window. Confirm account, time, attendees before
   pulling anything.
   Resolve every attendee per `assets/shared/contact-resolution.md`; its pre-gate
   confirmations run before THE GATE.
   Resolve the account per Step 0.3.
   The confirmed meeting window (start/end) feeds SCREENSHOT CORRELATION (section
   below), run before THE GATE.
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

## SCREENSHOT CORRELATION — both intents, before THE GATE

**Ordering:** a flow that is ALREADY durable (meeting; log with a commitment/next step)
runs contact-resolution's pre-gate confirmations FIRST, then correlation. A bare TIMED
TOUCH runs the correlation PICK first — the pick decides durability: ≥1 selected → the
touch upgrades (LOG step 2's screenshot carve-out) and contact confirmations run BEFORE
the rename proposals;
zero selected → it stays a pure touch, confirmations stay skipped.

**Preconditions — checked in order:** (1) date-only log → skip silently, before any probe
(a date-only log correlates nothing); (2) `timezone` unset → a loud skip naming the setup
timezone question (an offset-less filename needs the key; never a guessed zone); (3) no
screenshots-kind `intake_sources` entry configured → a loud skip naming setup's
intake-sources question ("no intake sources configured — setup's intake-sources question
adds them", per the schema; a downloads-kind entry may exist) — and when both 2 and 3 hold,
ONE combined loud line naming both setup questions; (4) per-source probes (C13: configured
path first, then mounted-folder name) — correlation proceeds with the sources that resolve,
ONE loud line per failed source (path unreachable → try the mount name; several mounts
share the name → ask; all fallbacks fail → that source is unreachable, with
surface-appropriate remediation: "add the folder to this project" on a managed surface ·
"check the path / run where the folder exists" on a filesystem surface). Capture is
attended-only, so correlation may always ask.

1. **Window:** meeting = [start − 5 min, end + 5 min]; log = [time − 15 min,
   time + 15 min], and ONLY when the user gave a time — a date-only log correlates
   nothing (skip silently). Comparisons are between RESOLVED INSTANTS — a cross-midnight
   window includes next-day timestamps, and the destination folder date is ALWAYS the
   meeting's/log's start date.
2. **Scan** EVERY resolving screenshots-kind source and union the hits (immediate children
   only, regular files, window endpoints inclusive; when >1 source resolves, each hit shows
   its source label). Only filenames matching the source's timestamp pattern participate —
   a LITERAL TOKEN TEMPLATE, not regex, not glob: literal text plus the tokens YYYY MM DD
   HH MM SS, case-sensitive, matched against the basename (extension ignored). Default:
   `Screenshot YYYY-MM-DD HHMMSS`. A template missing any token → treated as the default
   with one loud line. Non-matching files are ignored. Read each matching name as a local
   wall-clock instant per `timezone` and compare inside the window. A
   fall-back-DST-ambiguous timestamp matches BOTH candidate instants — include it flagged
   "(DST-ambiguous)"; a nonexistent-hour timestamp (spring-forward gap) has NO valid
   instant — one structured question: 1. Interpret with the pre-transition offset /
   2. Post-transition offset / 3. I'll type the corrected time / 4. Exclude this file.
3. **Pick:** hits page in groups of ≤3, ONE structured question per page (C11) — the
   platform's multi-select counts as one decision where the question tool supports it;
   where it doesn't, one hit per question. Every page carries "none on this page / done".
   After the last page: one confirmation line — "proceeding with {N} selected". Options
   render `{filename} · {HH:MM:SS} · {size}` (+ the DATE whenever the window spans two
   dates · + source label when >1 source · dimensions only when cheaply available).
   Same-second twins stay distinguishable by filename. No hits → one line stating the
   window used ("no captures 14:55–15:35 — check the log time if that looks wrong"),
   move on.
4. **Rename:** propose a semantic name per selected file
   (`{YYYY-MM-DD}_{short label}_{topic}.{source ext}`); the user approves or edits each in
   the same flow. Proposed names sanitize `\ / : * ? " < > |` and any path separator to
   `-` before entering the gate. Sanitization + bundle-uniqueness validate the FINAL
   APPROVED basename (user edits included): empty, dot-only, reserved device names, control
   characters, leading/trailing dots or spaces, or >120 chars → re-prompt. The semantic
   name replaces the STEM only — the source file's extension is preserved verbatim (a
   capture source may hold jpg/webp; never relabel bytes as .png). Names must be UNIQUE
   within the bundle — a duplicate proposal re-prompts before the gate (distinct from the
   on-disk collision question in step 5).
5. **Bundle items (C14):** each selected file becomes a manifest item — COPY, never
   move (the source is a system capture target):
   `{source path} → Accounts/{Account}/02_Meetings/{YYYY-MM-DD}_{short label}/
   screenshots/{approved name}` — the destination folder is the meeting-note folder
   VERBATIM (the same `{YYYY-MM-DD}_{short label}` tokens the write uses, never
   re-derived; for a meeting it IS the note's folder). Canonicalize source and destination
   — identical or nested paths reject the item (a screenshots source must never be inside
   `Accounts/`). Rendered exactly in THE GATE and written in the write order below, copy
   verified by byte-size match (binary — not a content read-back). Immediately before each
   copy, revalidate the gated item (source size/mtime unchanged; destination state still as
   gated) — changed → back to the gate, never a stale-approval write. Destination collision
   → the collision question (1. Replace / 2. New name / 3. Skip this file), re-gated (C14);
   the collision option 1 renders as `OVERWRITE {existing name · size · modified} with COPY
   from {source}` (C14 — destructive, per-item).
   **For a LOG:** selecting ≥1 screenshot upgrades the log to a lightweight meeting
   record — the pick flow confirms a `{short label}` derived from the log's one-sentence
   what-happened, and the write creates `02_Meetings/{YYYY-MM-DD}_{short label}/
   screenshots/` (folder + images only; no Notes.md required). A pure touch that attaches
   screenshots is thereby no longer a pure touch; the gate says so plainly ("attaching
   screenshots creates a durable meeting-record folder"). Zero selections → the touch
   stays journal-only, unchanged.
6. Unselected files stay put — intake maintenance owns them later.

## THE GATE — one approval, then write (C5)

Draft the full bundle, write nothing. The bundle is an explicit manifest — for every
file: create vs append, the exact path, the complete proposed content (including a new
account folder when Step 0.3 confirmed one: "this will create `Accounts/{name}/` and its
`Account_Notes.md`").
A confirmed contact row (contact-resolution step 6) is its own manifest item — the
exact row, the target section, and any header rewrite or file creation the mechanics
require (`Contacts.md` absent → created from the shared template, rendered here).
A manifest item may also be a FILE COPY — rendered as `source → destination` (C14), with
no "proposed content" body (the bytes are the source file's).

**Chained invocation changes nothing (C14):** when capture is invoked from another
skill's tail (sync/tidy close, a board flow) or any non-interactive lead-in, the full
bundle render is still mandatory — the gate question NEVER appears in a message that
does not contain the bundle it approves.

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
   procedure) and use the line it returns, **with its returned change entry rendered in
   the bundle directly beneath the line — both are part of what approval writes (C14)**. `workos-next-steps` unavailable in this
   session → render from `assets/shared/locked-next-step-format.md` yourself and
   **mechanically verify ≤254 characters** (count with a command per fact #8; no way to
   count → mark the line "count unverified — verify before pasting"), and apply
   next-steps §D (outbound block) — an unresolved name never ships in the line
   (restructure or drop the line).

Present the whole bundle in one structured approval (C11): "1. Save as shown / 2. Adjust
— tell me what / 3. Drop the next-step line, save the rest / 4. Stop — save nothing."
Any adjustment invalidates prior approval — apply the change to the bundle and
RE-PRESENT THE FULL REVISED BUNDLE with the gate question in the same turn (C14);
never describe the change instead of showing the changed bundle, never save a "revised"
bundle against an earlier render. Run C14's self-check every round before asking. On 3, write
ALL approved items except the next-step line (meeting note, commitments, contact rows,
screenshots, journal pointer) exactly as approved and skip the next-step line entirely,
including the workos-next-steps log offer. Nothing below happens without an
explicit approval of the exact bundle being written.

**On approval, write IN ORDER — stop on the first failure, report precisely what was and
wasn't written; never retry a write whose content might already be on disk without
reading the target first:**

1. **Meeting note** → `{memory_root}/Accounts/{account}/02_Meetings/{YYYY-MM-DD}_{short
   label}/Notes.md` (per-source files instead when sources-separate). **Collision rule:
   pick a label that differs from every existing `{YYYY-MM-DD}_*` folder for this
   account/date; if the target folder or note file already exists anyway, never overwrite
   silently — one question (C11): "1. Replace the existing note / 2. Save under a new
   label / 3. Append as a dated addendum / 4. Stop." Options 1–3 change the manifest —
   re-present the affected bundle item with its new path/operation and re-gate (C14)
   before writing.**
2. **Commitments** → into the `## Open Commitments` section of
   `{memory_root}/Accounts/{account}/Account_Notes.md`, as the section's last line
   (immediately before the next `##` header, or end-of-section — "append" NEVER means
   end-of-file). File absent → create it from the shared template. Section absent in an
   existing file → append a `## Open Commitments` header + the bullet at the END of the
   file — never rewrite, reorder, or re-template existing content.
3. **Contacts.md row** (only when the bundle carried one) → per the contact-resolution
   mechanics; read-back verified like every write here.
4. **Screenshots** (only when the bundle carried them) → the approved copies into the
   meeting folder's `screenshots/`, each verified by byte-size match (size-verified
   copies — binary, not a content read-back); the SOURCE files are never touched.
5. **Journal pointer, LAST — only after the writes above are verified by read-back**
   (append-only bookkeeping, C5-exempt) → `{memory_root}/journal/{YYYY-MM}.md`:
   `- {date} captured {touch|meeting} [[{Account}]] → {saved path}` — or the touch-only
   form from LOG step 2 when nothing else was written. **Account-mounted session (no
   `{memory_root}/journal/` in scope): never invent a folder outside the account's
   documented layout. A meeting or commitment capture loud-skips the pointer in the
   close output — "journal pointer skipped (account-mounted); the next root sync
   backfills it" (sync scans Account_Notes + `02_Meetings/`). A PURE TOUCH leaves no
   account file for sync to find — say instead: "this touch has NO durable record from
   an account project — re-log it from the WorkOS root chat to keep it," and never
   promise a backfill for it.**
6. **Next-step line: presented as text ready to paste (C7)** — say plainly it needs
   manual pasting. Then append the bundle's already-approved change entry to the per-opp
   log YOURSELF (next-steps §C: the caller is the one writer) — no new approval needed
   because the entry was in the approved bundle; an entry that was NOT in the bundle is
   never written.

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
- Moving, renaming, or deleting anything in a screenshots SOURCE folder — correlation
  COPIES; the source's contents and count are never changed by capture.
- Overwriting an existing meeting note without the collision question.
- Inventing transcript content, contact names, titles, or account folders (names
  resolve per `assets/shared/contact-resolution.md` — email is the join key, an email
  handle is never a name source); treating a
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
