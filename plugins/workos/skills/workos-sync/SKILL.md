---
name: workos-sync
description: >
  The WorkOS daily driver: one time-agnostic skill, two passes. Full sync ("sync my day" —
  also answers legacy kickoff / start my day / wrap / close out vocabulary): harvest within
  your configured integrations, roll the day-task, reconcile tasks and meetings, build
  briefs for flagged meetings, run the folder-hygiene pass, stage the next business day,
  present ONE consolidated approval, rebuild the board. Tidy ("tidy", "tidy the board"):
  the cheap any-time pass — approvals, one calendar delta, board refresh; never rolls the
  day-task. Board ("build my board" / "rebuild my board"): generate the interactive board
  artifact plus its static snapshot. A "Mark done: ..." message (sent by a board button)
  routes to Tidy's approval step. A scheduled run is unattended ONLY when its prompt carries "(scheduled,
  unattended)" — unattended runs never ask questions, never apply destructive changes.
  DO NOT attempt without loading — it enforces the pass boundaries, the lock protocol,
  and the state schema.
---

# workos-sync — the daily driver (L2)

## Role

You run the user's day: close what's open, stage what's next, keep the board true. Two
passes — **sync** (expensive, ~daily) and **tidy** (cheap, any number of times). The whole
behavioral model: *close whatever day-task is open, flush, open today's, stage the next
business day.* Contracts (by reference — their text in `assets/shared/`, never restated
here): C2 · C3 · C4 · C5 (including its state-store clause) · C6 · C7 · C11 · C13.

**Bundle location:** resolve every `assets/` path in this file relative to THIS skill's
own folder — the folder containing this SKILL.md. Under direct .skill upload that is
`.claude/skills/workos-sync/` under the session mount; under a plugin install it is the
plugin's skill folder. Never resolve `assets/` in the memory root or project folder.

**State schema:** `assets/shared/state-schema/README.md` is normative for every field this
skill reads or writes — signal vocabulary, `dayTask.queue`, `attention[]`, prep/recap as
top-level booleans, and the rule that `overdue`/`nearDate` are render-time derivations the
board computes (no pass stores or refreshes them).

## Step 0 — every run, both passes

1. **Config (C2):** resolve `{memory_root}`, `{user_name}`, `{integrations}`,
   `{sfdc_tier}` via `core.md`. **"Today"/"now" come only from the surface-provided
   date/time** — used for dating and computing "next business day" (weekends skipped;
   v1 does not model holidays — if the user says it's a holiday, believe them), never for
   deciding what the pass does (C3).
2. **Mode:** trigger word wins. Sync vocabulary: sync my day / full sync / kickoff / start
   my day / wrap / close out (legacy words are triggers only — same single pass, C3).
   Tidy vocabulary: tidy / tidy the board. Board vocabulary: build my board / rebuild my
   board → the BOARD section (skips Step 0 items 4–6 — it writes no state/).
   Board-button vocabulary: a message beginning "Mark done:" (fired by the board's ✓
   button) → run TIDY, carrying that closure as a proposed item into its approval step —
   never apply it directly. Ambiguous →
   one question (C11): "1. Full sync (recommended if none ran since yesterday) / 2. Tidy —
   quick board refresh / 3. Rebuild my board / 4. Stop."
3. **Attended vs unattended:** the run is **unattended ⇔ the invoking prompt contains the
   marker "(scheduled, unattended)"** — `workos-setup` puts that marker in the scheduled
   task it creates; the Day-1 guide mandates it. No marker → attended. Unattended runs
   never ask questions, never apply pendingApprovals, never delete or move files; they do
   only what C5's state-store clause allows ungated, queue everything else, and report
   into `attention[]` + the run output.
4. **The lock (C4 — acquired BEFORE any state/ write, including baseline scaffolding):**
   read `state/.pass-lock.json`.
   - Absent → write `{pass, startedAt: now, surface, runId}` where `runId` is a token
     unique to this run (e.g. `{pass}-{now}-{4 random alphanumerics}`), re-read once;
     `runId` isn't yours → yield.
   - Present, `startedAt` < 30 min → do not write state. Attended: one question (C11):
     "1. Wait and retry / 2. Read-only run / 3. Take over — the other session is dead."
     Unattended: exit; report only in the run output (no state or board writes).
   - Present, ≥ 30 min → announce "recovering a stale lock from {startedAt}", overwrite
     with your own `runId`.
   - **Heartbeat — both modes:** rewrite `startedAt` (same `runId`) after every user
     answer AND after each completed S-phase, so neither a parked question nor a long
     unattended harvest looks stale.
   - **Ownership check:** immediately before every state write batch — and after any
     user-interaction gap — re-read the lock; `runId` mismatch → yield and report, write
     nothing further.
   - **Release (delete) the lock as the pass's final action** — after the close summary,
     no questions after release. On any error you survive: release before exiting.
     The platform may surface this delete as a scary "permanently delete files"
     permission prompt — that prompt IS the lock release (Day-1 guide tells users to
     allow it). **Release is verified, never assumed: after the delete, attempt to read
     the lock file — released ⇔ the file is GONE.** Still present (denied prompt,
     silent tool failure, sync lag) → say exactly that: "lock release FAILED — the file
     persists; it will read as stale and self-recover after 30 minutes." (Live defect
     2026-07-16: an unattended run reported "released successfully" while the file
     persisted — doctor caught it four minutes later.)
5. **State baseline (first state write — under the lock):** if `state/` lacks any of
   `tasks.json` / `meetings.json` / `drafts.json` / `suppressed.json`, create the missing
   ones as empty shapes per the schema (machine bookkeeping, ungated). First-ever run (no
   `lastFullSync` anywhere): harvest window = **the last 3 business days**, said in the
   close summary; open today's day-task without a flush (nothing to flush).
6. **Version notice:** if `team_publish_folder` is configured, compare the bundle's
   `assets/shared/VERSION` against `Team/_engine/latest-version.txt`; mismatch → one line
   in `attention[]` and the close summary. Configured but unreachable → attention entry
   ("Team/ unreachable"). Not configured → skip, silently (an unconfigured surface is not
   a degradation).

---

## SYNC — the full pass

### S1. Day-task roll — COMPUTED here, COMMITTED in S7 (idempotent by construction)

`tasks.json → dayTask`:
**The day-task's `date` is ALWAYS the surface-provided today — never tomorrow.** An
evening run does not "open tomorrow's day" (C3: no time-of-day reasoning; live defect
2026-07-16 — an afternoon first-run dated the day-task next-day and the board showed
STALE minutes after generation). S6's queue *targets* the next business day; it still
lives under today's day-task.
- **date ≠ today:** prepare the roll in memory — the closing pointer line, exact template:
  `- {today} day-task {dayTask.date} closed: {N} queue items done · {M} carried forward`
  (an item is "done" iff its `taskId` maps to a lane task closed in this pass or earlier;
  everything else is carried) — plus the carry-forward list for S6. **Nothing is written
  yet:** the journal append and the dayTask replacement happen in S7 step 2, after the
  gate. A pass that stops, crashes, or yields before S7 leaves yesterday's day-task
  intact — the next run recomputes the same roll.
- **date = today:** re-sync — refresh everything below, don't re-roll; update each
  existing brief's delta line (S4) instead of rebuilding it.
- **absent:** open today's at S7 commit (bootstrap, Step 0.5).

### S2. Harvest — configured integrations only, probed, budgeted

**Probe each configured source before its first use this session (C13).** A configured
source that fails its probe is a **loud SKIP**: recorded in `attention[]`, named in the
close summary — never silent. Unconfigured sources are never mentioned at all.

- **Calendar:** today + the next business day, full list.
- **Inbox delta:** since `lastFullSync`, newest first, cap 20, subject/snippet triage.
- **Sent delta:** since `lastFullSync`, newest first, cap 20 — completed-action evidence.
- **Teams DMs** (if configured): outbound since `lastFullSync`, cap 15.
- **Meeting notes** (if bridged): recordings since `lastFullSync`, summaries +
  action-item candidates.
- **Dialogue:** whatever the user tells this session, first-class.
- **Pasted material:** a pipeline report/screenshot the user pastes is first-class intake
  (C7) — use it for account context here; Salesforce-shaped *outputs* stay
  `workos-next-steps`' job.

**Budgets (deterministic):** per-source caps as listed (meeting notes: cap 10); calendar
is bounded by its 2-day window and doesn't count toward the total. Hard total across
inbox+sent+teams+notes: **60 items**, filled in that priority order, newest-first within
each source — when the total hits, later sources truncate first. Hydrate at most **5
accounts** per pass, chosen by harvest-mention count (ties → most recent mention). Any
cap reached → one `attention[]` line ("harvest capped: {what was left}") — never silent.

### S3. Reconcile tasks — build proposals, apply nothing yet

- **Closure proposals:** evidence-cited (dialogue · sent item · the prepped meeting
  happened · meeting-notes summary carried it). These are user-meaningful → they go into
  the S7 consolidated approval, not applied here.
- **New-task proposals** from harvest + dialogue. Schema discipline: unique ids;
  `due-date`/`meeting-prep` carry `due`; `waiting-them`/`deal-advancing`/`admin` don't;
  never store `overdue`.
- **Dedupe seam:** before proposing a task for a commitment, check that account's
  `Account_Notes.md` Open Commitments for entries dated **since `lastFullSync`** (not just
  today — the overnight seam) — reference, never duplicate. Account truth is
  `workos-capture`'s; state holds the operational pointer.
- Deletions, rewrites, unsuppressions → `pendingApprovals` entries.

### S4. Meetings + briefs (`meetings.json`)

- **Merge by stable meeting id — never replace the list.** Calendar-owned fields (start,
  displayTime, title, who) update from the harvest; locally-owned fields (`brief`,
  `builtAt`, `briefPending`, `prep`, `recap`, signals set by prior selection) are
  preserved unless this pass intentionally changes them. A cancelled meeting is marked
  cancelled, not deleted.
- Field discipline (machine bookkeeping, ungated):
  `signals` per the schema vocabulary; **the prep flag is the top-level `prep` boolean**
  (never a signal key). **`displayTime` is the user's local wall-clock short form
  (e.g. `11:00a`) — never a raw UTC timestamp** (live-test defect 2026-07-16: the board
  displayed "15:00 UTC" meetings). Prep defaults: external attendee · no prior history ·
  user organizes/presents · account has an active pursuit.
- **Attended:** present the next-business-day list once (C11): "1. Accept prep flags as
  shown / 2. Adjust — tell me add/drop / 3. Prep everything / 4. Prep nothing."
  **Unattended:** apply the defaults silently, set `briefPending: true` on newly flagged
  meetings, ask nothing.
- **Briefs — budget: at most 5 full briefs per pass** (beyond that: `briefPending`,
  named in `attention[]`). Each brief carries `builtAt` and nine fields:
  attendees (names + roles, enriched from that account's `Contacts.md`) · objective ·
  account state (tier-appropriate: `mcp` = queried at build time, stamped by `builtAt`;
  `manual` = latest from `Account_Notes.md` + next-step logs, phrased "as of {date} per
  account notes" — never presented as live) · last touchpoint · open to them · open to us ·
  recent signal · talking points (2–3) · **delta since built** (blank at build; a re-sync
  refreshes it with what changed since `builtAt`).
- **Per-brief search allowance** (the one exception to S2's delta-only rule, itself
  capped): mail/sent mentioning the account or attendees, 14-day window, cap 10 per
  meeting; account files: `Account_Notes.md` + the **3 most recently touched**
  `01_Opportunities/*/Next_Step_Log.md`. Thin data → "none found", never invented.

### S5. Folder hygiene (absorbed from the predecessor's field-proven pass, C10)

Accounts touched today (harvest + dialogue — never a full-portfolio scan). Scope: the
account's `01_Opportunities/*/` working folders (`Decks/`, `Pricing/`,
`Contracts-SOWs-Amendments/`, `CCS/`, `Notes/`) and `02_Meetings/`. **Directory listings
only — never read or edit file contents.** Flag a folder holding more than one version of
the same deliverable **or ~5+ files sharing a base name** → propose a specific keep/drop
list (keep current + last major → `Archive/`; drop minors). **Both the moves and the
deletions are user-meaningful → `pendingApprovals`,** surfaced in S7's gate. Clean folders
produce no output.

### S6. Stage the next business day — `dayTask.queue` (schema shape)

Build the ranked queue (max 5) as structured entries `{rank, taskId?, title, account,
signal, due?}` — `taskId` links to the lane task where one exists: hard deadlines → prep for flagged meetings → externals waiting 48h+ →
deal-advancing → admin. **Carry-forward items from S1 re-enter this ranking** — each either survives into the
new queue or appears as a named drop in the S7 consolidated approval; never a silent
disappearance. Challenge low-leverage items in one line.

### S7. Close — one gate, then write, then release

**Attended:**
1. Assemble everything into ONE consolidated approval (C11): proposed closures (with
   evidence) · new tasks · the queue · prep-selection changes · hygiene keep/drop lists ·
   **the full `pendingApprovals` backlog** (this is sync's surfacing step — a user who
   never runs tidy still sees it here). **Format the gate like the close summary: a
   header + bulleted list per section, blank lines between sections — never one
   paragraph** (live-test friction 2026-07-16: the gate rendered as a wall of text).
   Options: "1. Accept all as shown / 2. Adjust named
   items / 3. Add an outcome I forgot / 4. Stop — apply nothing from this pass." Loop on
   2/3 until accepted (heartbeat the lock each round). Option 4 leaves state exactly as
   the pass found it apart from Step 0.5's baseline scaffolding (which is inert).
2. **Ownership check (Step 0.4), then write** `state/*.json` — including committing S1's
   prepared roll (append the closing journal pointer, replace `dayTask` with today's) —
   stamp `generated`, `generatedBy: sync`, `lastFullSync`; refresh `attention[]` (loud
   SKIPs, caps, version notice, approvals still queued).
3. **Journal pointers:** one line per durable outcome —
   `- {date} {outcome} → {where truth landed}`. Account truth (commitments, strategy) →
   offer `workos-capture`; deal movement → offer `workos-next-steps` (single-opp). Never
   write those files here.
4. **Board rebuild:** the board is a **native artifact** — replace ONLY the JSON text
   inside each `<script type="application/json" id="workos-data-{tasks|meetings}">`
   element (the `WORKOS:DATA` marker pairs locate them; the markers and the script
   open/close tags stay byte-identical) with the current `tasks.json` / `meetings.json`,
   escaping every `</` as `<\/`, via the platform's artifact-update mechanism. **Then the
   mechanical self-check before reporting** (Python or equivalent): exactly one BEGIN/END
   pair per block · script wrappers intact · each block's inner text parses as JSON · no
   raw `</` and no marker literal inside the JSON. Self-check fails, or no update path
   from this run (no such tool, or the board lives in another chat) → not an error: one
   close-summary line ("native board not refreshed — the snapshot is current; say
   'rebuild my board' from a Cowork chat to refresh the artifact"). A failed update is
   reported as failed, never as success (C9). Additionally rewrite `{memory_root}/Board.html`
   whole **with the same rendered HTML** (the mobile view — a regenerable render,
   C5-exempt). No board yet (no `Board.html`) → one line offering "build my board", skip
   thereafter.
5. Close summary, readable in 90 seconds: done (evidence-backed) · still open (max 3) ·
   next business day (meetings + queue) · attention items. **Then release the lock — the
   final action. No questions after release.**

**Unattended:** no questions anywhere. Apply only what C5's state-store clause allows
ungated (calendar/meeting updates, evidence-formed NEW tasks); closures and everything
destructive → `pendingApprovals`. Write, stamp, rebuild the board, put counts in
`attention[]` ("{N} approvals waiting"), summarize in the run output, release.

---

## TIDY — the cheap pass

**Read-set, exactly:** config · the lock · `tasks.json` · `meetings.json` · the board's
current data blocks · at most ONE calendar query (today + next business day) — only if
calendar is configured and its first-use probe succeeds (configured-but-failing → loud
SKIP into `attention[]`; unconfigured → silently none). No mail, no account folders, no
journal, no brief-building.

1. Lock per Step 0.5.
2. **Approvals:** attended → surface `pendingApprovals` in one structured pass (C11) and
   apply what's approved (this is a state write — ownership check first). A "Mark done:"
   board-button message that triggered this run joins the same pass as a proposed closure
   (evidence: the user's tap; match by `taskId` when present, else by title — ambiguous
   title → one C11 question). Unattended → count into `attention[]`, touch nothing.
3. Calendar delta: new/cancelled meetings update `meetings.json` (additive bookkeeping);
   newly flagged meetings get `briefPending: true` — tidy never builds briefs.
4. Board rebuild only if a data block actually changed — **and "changed" includes
   `attention[]` and every tasks/meetings field the board renders; only bookkeeping
   stamps (`lastTidy`) alone don't trigger** (live-test defect 2026-07-16: tidy cleared
   an attention line, said "no data changed", left the board stale). Mechanics per SYNC
   S7.4: marker pairs only · snapshot rewrite · honest failure. Stamp `generated`,
   `generatedBy: tidy`, `lastTidy` — **never `lastFullSync`, never the day-task.**
5. If the world clearly moved a lot, say "worth a full sync" and stop — the user's call,
   never an automatic escalation (C3).
6. Release the lock.

(No derived-signal recompute step: `overdue`/`nearDate` are the board's render-time
derivations from `due`/`start` — storing or refreshing them is banned by the schema.)

---

## BOARD — "build my board" / "rebuild my board" (attended only)

The ONE sanctioned path that generates the board shell (passes never regenerate it — C9).
Step 0 items 1–3 apply; items 4–6 do not: this entry point writes no `state/`, so no
lock. In an unattended run, board vocabulary is reported in the run output and skipped.

1. **Read** `state/tasks.json` + `state/meetings.json`. A missing file renders as its
   empty schema shape — never scaffold `state/` here (that is a pass's job, under the
   lock).
2. **Emit the shell as a NATIVE artifact** — chat-generated, never a file opened or
   attached as an artifact (file-surfaced artifacts expose no bridge; every button would
   be dead). Source: `assets/board/board-shell.html`, shipped verbatim except the JSON
   text inside each `<script type="application/json" id="workos-data-{tasks|meetings}">`
   element (the `<!-- WORKOS:DATA {tasks|meetings} BEGIN/END -->` marker pairs locate
   them; markers and script open/close tags stay byte-identical): replace it with the
   current file's JSON, escaping every `</` as `<\/`. Run S7.4's mechanical self-check
   before presenting, **plus emission completeness: the emitted HTML ends with
   `</html>`, every `<script` has a matching `</script>`, and the four script ids
   (`workos-data-tasks`, `workos-data-meetings`, `workos-derive`, `workos-render`) are
   all present** — copying a long file is where truncation happens, and a truncated
   shell renders as a half-dead board. Never restyle, trim, or "improve" the shell — it
   ships as-is or not at all.
3. **Write the static snapshot:** the same rendered HTML to `{memory_root}/Board.html` —
   stable name (mobile bookmarks point at it), C5-exempt (a regenerable render;
   `generated` is stamped inside the data). Verify by reading it back.
4. **Report honestly (C9):** say where both copies landed. "Rebuild" replaces the prior
   native artifact only where the platform supports updating it; otherwise say a NEW
   board artifact was created and older ones are dead. A failed write is reported as
   failed, never as success.
5. **Verify interactivity (C11, one question):** the shell self-reports its surface in
   the log line under the buttons. Ask: "Does the board's header show a 'read-only view'
   badge? 1. No — buttons are live (expected) / 2. Yes — tell me what the gray log line
   at the bottom says / 3. Skip." On 2, report that this artifact surface exposed no
   bridge (known platform behavior for some creation paths, live test 2026-07-16), the
   buttons won't act, and the static snapshot remains authoritative — never claim the
   buttons work without this check.

---

## Anti-patterns — never

- Branching on time of day, or "morning/evening/final-sync" concepts (C3) — the legacy
  trigger words carry no behavioral meaning.
- Writing `state/` without holding a verified lock; exiting while holding one; asking any
  question after the lock is released (C4).
- Asking any question, applying any approval, or deleting/moving anything in a run whose
  prompt carries the "(scheduled, unattended)" marker.
- Writing account files (`Account_Notes.md`, contexts, spheres, next-step logs) — capture
  and next-steps own those; sync reads them and appends journal *pointers* only.
- Applying closures, deletions, rewrites, moves, or unsuppressions outside the
  consolidated approval (C5).
- Storing `overdue`/`nearDate`, duplicating `prep`/`recap` as signal keys, or any
  importance/tier field (schema, C6).
- Reading journals or next-step logs back as current deal-state; presenting any cached or
  dated value as live (C6/C7) — `manual`-tier brief lines say "as of {date}"; `mcp` briefs
  carry `builtAt`.
- Regenerating the board shell outside the BOARD entry point, emitting the board as a
  file-opened artifact (dead buttons — no bridge), or claiming an artifact/file write
  succeeded without checking (C9).
- Unbounded harvests: every source is delta-since-`lastFullSync` and capped; the only
  exception is S4's per-brief allowance, which has its own caps.
- Dropping carried-forward queue items silently (S1/S6).
- Prose questions — C11 governs every question in both passes, including mid-flow, and
  every question goes through the platform's structured-question tool (submittable
  options); a prose-rendered "1. … / 2. …" list is not compliant (live finding
  2026-07-16).
