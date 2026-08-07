# WorkOS v1 state schema (PLAN §4.3 — MC shapes, queue fields excluded)

Machine-written JSON under `{memory_root}/state/`. One writer per run (C4, lock per
docs/spikes/spike-4-single-writer.md). Derived values (scores, importance levels) are
computed at render time and never stored (C6). **Extension rule:** power-user extensions may
add fields; engine skills and the board ignore unknown fields; CI validates the baseline
only. Fixtures: `ci/fixtures/state/` — `ci/validate-state.sh` enforces the state
files (every `ci/…` or `docs/…` path in this file is the ENGINE REPO's, not shipped in
the bundle); `.pass-lock.json` is protocol, validated live (doctor step 7, spike 4).

## tasks.json
```json
{ "generated": "ISO", "generatedBy": "sync|tidy|sweep|intake",
  "lastFullSync": "ISO", "lastTidy": "ISO",
  "lastUnattendedRun": { "sync": { "at": "ISO", "localDate": "YYYY-MM-DD?", "surface": "cowork|claude-code", "version": "" }, "sweep": { "…same shape…": "" } },
  "teamsScan": { "cursors": { "{chatId}": "ISO" }, "missStreak": 0 },
  "pendingApprovals": [ { "id": "", "kind": "", "target": "", "summary": "", "diff": "", "raisedBy": "", "raisedAt": "ISO", "lastSeenAt": "ISO" } ],
  "dayTask": { "id": "", "date": "YYYY-MM-DD", "context": "",
    "queue": [ { "rank": 1, "taskId": "?", "title": "", "account": "", "signal": "", "due": "YYYY-MM-DD?" } ] },
  "attention": [ { "class": "system|action", "text": "one line", "source": "sync|sweep|tidy|intake" } ],
  "lanes": { "NICE": [ { "id": "", "title": "", "signal": "", "context": "", "due": "YYYY-MM-DD?" } ] } }
```
Attention entry classes (CI-validated in `ci/state-rules.js`):

| class | covers |
|---|---|
| `system` | beacon/version outcomes, integration-dark notices, stale-snapshot flags, surface facts, harvest caps |
| `action` | parked-sweep line, approvals-pending count, intake-overdue, anything asking the user to act |

**Note:** legacy plain strings remain valid during transition — the shell renders them as
`action` (visibility-preserving — v1 rendered every line loud). A full sync rebuilds the
array, so a legacy bare string self-heals there; Tidy refreshes only the lines it owns and
carries the rest forward verbatim. `class` rides attention's stored-derived status (C6
note, spec §4).

**Text rule — absolute dates only (#106).** A line survives passes that do not rebuild it,
so attention text must be true whenever it is next READ, not only when written. Dates in
`text` are absolute (`2026-07-21`, or `MM/DD` where the line is already terse); relative
day-words never appear. `ci/state-rules.js` (engine repo) enforces the floor —
`today`/`yesterday`/`tomorrow`/`this morning`/`last night`, typed entries and legacy strings
alike — across the fixtures and the board's embedded block, NOT a live root's `tasks.json`.
`this week` and `3 days ago` rot identically and are equally banned though no check catches
them.

`lastUnattendedRun` (optional; #67/#68/#52): a MAP keyed by unattended pass kind —
`sync` (workos-sync), `sweep` (workos-next-steps), and `intake` (workos-intake's
stage-and-park — classification runs unattended; every filing stays attended). Each writer MERGES its own key and preserves every other key verbatim; it
is both the same-day dedupe evidence and the cross-surface version record. `localDate`
is computed at WRITE time per identity.schema.md's full `timezone` resolution order
and OMITTED when unresolved; readers compare `localDate` only, never recompute from
`at`. `version` = the bundle's `assets/shared/VERSION` verbatim, or `unstamped` when
missing. Attended runs and Tidy never write it — but every rewrite of `tasks.json`
PRESERVES the whole map verbatim, and state baselining (sync Step 0.5) never scaffolds
it. `teamsScan` (optional; #51): per-chat harvest high-water marks + the consecutive
incomplete-pass counter; machine bookkeeping, sync-written, preserved like any
baseline-external field.

Rules: task ids unique across all lanes · **date-driven signals** (`due-date`, `meeting-prep`)
MUST carry `due` · **judgment signals** (`waiting-them`, `deal-advancing`, `admin`) MUST NOT
carry `due` · **`overdue` and `nearDate` are NEVER stored** — they are render-time
derivations from `due`/`start` (C6); the board computes them, no pass refreshes them · v1 ships the single `NICE` lane (personal lanes = extension)
· NO `queueCursor` in the baseline (click-queue is power-user).

### pendingApprovals — a durable queue (#50)

- **State writes only** — never account-file CONTENT writes (Contacts.md rows, notes —
  account truth) or Salesforce writes; applying a queued hygiene item moves/deletes files,
  which C5's state-store clause already governs (those go through the owning skill's own
  gate; see the 2026-07-21 contact-resolution design).
- **Every writer MERGES:** re-read under the lock, keep every existing item, remove only
  items resolved THIS pass, append new items. Every merge also PURGES pending items
  matching a `suppressed.approvals` entry whose kind is `hygiene-move`/`hygiene-drop`
  (self-heals a crashed decline); a non-hygiene suppression entry is IGNORED by purge (and
  is itself a doctor finding: "non-hygiene suppression entry — hand-edited?"). Rebuilding
  the array from the current pass's findings alone is banned.
- **Ids:** `appr-{YYYYMMDD}-{NN}` (C14's stable-identifier form), assigned at raise.
  `NN` = 1 + the highest NN for today found across `pendingApprovals`,
  `suppressed.approvals`, and today's journal raise/exit pointers. If the journal can be
  neither read nor appended this pass → loud SKIP: no new `appr-` ids this pass (existing
  items still merge/apply/exit). Pre-convention ids in live files stay valid.
- **Kinds (normative):** `closure · task-rewrite · task-drop · unsuppression ·
  hygiene-move · hygiene-drop · intake-move · intake-copy · intake-delete` (task-drop = S3
  deletion proposals; extensions allowed; engine skills ignore unknown kinds when applying,
  never when merging). Intake kinds additionally carry (extension fields,
  baseline-ignored): a size/mtime `fingerprint` (+content hash for deletes),
  classification evidence, and — deletes only — a named `recoverableSource`; #50's
  merge/dedupe/exit machinery applies unchanged. **Apply boundary (normative): intake
  kinds APPLY only inside workos-intake's own gate — in any OTHER skill's backlog render
  (sync S7.1, tidy) they appear as ONE aggregate line (`{N} intake items queued — say
  'run intake'`) with NO per-item outcomes offered: no apply, no decline, no retire; the
  items stay queued untouched.**
- **Targets (normative — ONE recipe, applied at raise, dedupe, decline, suppression
  matching, and merge-purge):** compare as
  `lowercase(memory-root-relative path, forward slashes, trailing slashes stripped)`;
  hygiene targets append ` :: ` + `lowercase(deliverable base name, extension dropped)` —
  exact separator ` :: ` (space-colon-colon-space). Task targets = the task id. The
  filesystem component of a hygiene target is the part BEFORE ` :: ` — split on the exact
  separator before listing/reading anything. Intake targets = lowercase(`{source
  label}/{basename}`) — the label from `intake_sources` — the `{label}/{basename}` form is
  the rule for every kind; downloads/screenshots sources live outside the memory root, and
  the `staged` source (`intake/…`) lives inside it, same form either way. The intake `fingerprint` extension field
  is `{size}:{mtime ISO, UTC Z form}` (+ `:{hash}` when hashed) — the UTC capture rule
  lives in the intake skill's sweep step 1 (#94).
- **Dedupe on raise:** same normalized `kind`+`target` as a pending item → update that
  item's `summary`/`diff` and `lastSeenAt`; id kept; **`raisedAt` immutable** (the age
  signal). Never a duplicate. A dedupe update emits NO raise pointer — only a NEW id does
  (repeated raise pointers would corrupt doctor's baseline).
- **Raise pointer (fourth journal form), written at RAISE:**
  `- {date} approval {id} raised: {one-line summary}` into `journal/{YYYY-MM}.md`.
  **Ordering (normative):** the raise pointer is appended and VERIFIED before the item is
  written into `pendingApprovals`; likewise every EXIT pointer (below) is appended and
  verified before the item's removal is written to state. A failed append is a loud SKIP —
  the raise doesn't happen (the finding goes to `attention[]` only) / the item stays queued
  — which closes the doctor false-positive window.
  Journal pointers are the audit trail, never authority: STATE is authoritative. A crash
  between a verified pointer append and its state write leaves a stale pointer (exit
  recorded but item still queued, or raise recorded but item absent); the item's LIVE state
  wins, the pass proceeds normally, the next resolution appends a fresh pointer (multiple
  pointers per id are legal — the latest governs), and doctor's approvals-queue audit
  names the stale one. The
  pointer-before-write ordering is kept BECAUSE this recovery rule makes its failure mode
  benign, while the reverse ordering's failure mode (a silent unjournaled removal) is not.
- **Exits — exactly three, each journaled** (append-only, C5-exempt):
  `- {date} approval {id} {applied|declined|retired}: {one-line summary}` into
  `journal/{YYYY-MM}.md`.
  **applied** — the verified write happened → removed, named in the close summary.
  **declined** — removed; hygiene kinds ONLY additionally append
  `{id, kind, target, declinedAt}` to `suppressed.approvals` (same write batch);
  re-detections matching a suppression are skipped with one aggregate loud line
  ("{N} findings suppressed by earlier declines"). Non-hygiene kinds get NO
  suppression — a declined closure re-raises only on new evidence.
  **retired** — at re-render, a finding that no longer validates (target gone, folder
  clean, task closed) → removed loudly, no suppression.

## state/board-queue/ (#73 — the board-queue contract)

One JSON file per board click, written under `state/board-queue/` as
`bq-{ts-compact}-{4charrand}.json` (`ts-compact` = `ts` with punctuation stripped —
`YYYYMMDDTHHMMSSZ` — so filename-ascending order matches `ts` order for the drain's
tie-break rule; `4charrand` = 4 random alphanumeric characters, avoiding same-instant
collisions):
```json
{ "ts": "ISO", "type": "task", "taskId": "", "lane": "", "action": "complete|reopen|update|remove",
  "title": "", "payload": { "title": "?", "context": "?" } }
```
`action` is exactly one of `complete`, `reopen`, `update`, `remove` — anything else fails
CI (`validateBoardQueueFile`, `ci/state-rules.js`). `payload` is optional; when present its
`title`/`context` are optional strings (an `update` action's proposed new values).

**Create-only contract:** the board artifact may CREATE unique-named files under
`state/board-queue/` and touch NOTHING else under `state/` — no modify, no delete, no
read-then-write, no path outside this directory. Every read, modify, or delete of a
board-queue file — applying it, quarantining it, deleting it after — belongs to a pass
(sync/tidy) running under the C4 lock; this is the board's one named exception to C4 (single-writer-state, contracts.md).

**Drain:** sync and tidy read and apply `state/board-queue/*.json` inside the C4 lock and
stamp `lastBoardDrain` on completion; the full algorithm (read order, malformed-file
quarantine, journal-before-delete, receipt) lives in the `workos-sync` skill's own
SKILL.md — this file defines only the shape and the create-only write contract.

`tasks.json` meta gains optional keys for the board-queue flow:
- **`lastBoardDrain`** — the most recent drain's high-water `ts`: the max `ts` of the queue
  files that drain CONSUMED — applied + raised to `pendingApprovals` + quarantined as
  malformed, **not just applied** — so a `remove` whose visibility passes to the approvals
  queue still lets the shell prune its mirror once. **SYNC** stamps it in the SAME write batch
  as `lastFullSync`; **TIDY** stamps it in that pass's write batch and leaves `lastFullSync`
  untouched. The shell prunes its localStorage optimistic mirror to entries with
  `ts ≤ lastBoardDrain` on every data load (plus the supplementary prunes below).
- **`taskIds`** — `{sync?, sweep?}` scheduled-task ids captured at `setup`; consumed by the
  shell's `runScheduledTask` rung (pass controls only — never a task-mutation rung; an absent
  id means that rung is absent, never a finding).
- **`boardQueueTool`** — the probe-verified tool name rung 1 uses for its `state/board-queue/`
  file-create; absent until the probe (#14) passes, at which point it's embedded into the
  board build.

**Build-embed-only board meta (NOT written to `state/tasks.json` by any pass):** the board
build embeds `identity` (`identity.display_name` — the hero name, C2) and **`boardScope`**
(string — the memory-root folder name) into the tasks data block from config, beside the
embedded `taskIds`/`boardQueueTool`. `boardScope` namespaces the shell's localStorage keys as
`wos.{boardScope}.*`; absent → the legacy `wos.*` keys (back-compat). These are read only by
the shell, never validated as state fields.

**Supplementary mirror prunes (shell-side, S7):** beyond `ts ≤ lastBoardDrain`, the shell also
prunes a mirror entry whose task id no longer exists in `lanes`+`queue`, and any entry with
`ts ≤ lastFullSync` (a full sync re-baselines truth). The `ts` compare carries an accepted
cross-device clock-skew window — an entry inside that skew lingers one extra load, never a
wrong commit (the durable board-queue file is the sole authority).

**Pending-bar net-display (S5):** the pending bar counts NET mirror membership, not queue
records — a `complete` then `reopen` on one task nets to zero displayed changes even though
BOTH board-queue records persist and drain; the drain receipt shows both actions.

Derived-field bans extend with Board v2 (#73): the scannable keys `window`, `score`, and
`impLevel` join `overdue`, `nearDate`, `importance`, `tier`, `MIMP`, and `queueCursor` on the
banned-stored-fields list — window membership and meeting importance/score are COMPUTED at
render, never stored under these keys; `ci/validate-board.sh` scans embedded board data for them.

## meetings.json
```json
{ "generated": "ISO", "meetings": [ { "id": "", "lane": "NICE", "start": "ISO",
    "displayTime": "", "title": "", "who": "", "signals": { "external": true },
    "prep": false, "recap": false, "objective": "", "brief": {}, "briefPending": false,
    "cancelled": "true? (a cancelled meeting is marked, never deleted — the board strikes it through)" } ] }
```
Rules: `signals` is the ONLY importance representation — `importance`, `tier`, and `MIMP`
are banned field names (weights live in the board, applied at render). Known signal keys:
`revenue, external, youLead, decision, risk`. **`prep`/`recap` live ONLY as the top-level
booleans** (the writable flags from the selection flow) — never duplicated as signal keys.
Briefs carry `builtAt` (ISO) so the board can date them.

## drafts.json
```json
{ "recaps": [], "replies": [], "proactive": [], "dismissed": [] }
```
Draft: `{ "id": "", "to": "", "subject": "", "body": "", "source": "", "pendingRevision": "" }`
— every draft carries `pendingRevision` (empty string when none).

## sweep.json (#68 — the parked weekly sweep)
```json
{ "generated": "ISO", "generatedBy": "sweep",
  "parked": null }
```
`parked` is `null` (no park) or the full staged artifact set written by the UNATTENDED
weekly sweep under the C4 lock (pass `sweep`): `{ generatedAt, tier: "mcp|logs",
coverage: "full|partial", coverageNote, rows[], emailPreview{subject,body},
persistenceDiff }`; each row `{ opp, account, bucket: current|next|later, class,
flags[], unknowns[], proposedLine, notesBlock, closeDateProposal, observedSnapshot, scope? }`.
`scope: "in-scope" | "observe-only"` (#266) — the row's disposition at generation
time. Absent (a pre-#266 park) ≡ re-derive at finalize. An observe-only row parks with
`proposedLine: ""` and no `notesBlock`/`closeDateProposal` — it rides as an observation
for the persistence batch and is never presented as a decision.
Finalize and Discard rewrite `parked` to null. Park writes are machine staging under
C5's state-store clause (the same class as unattended pendingApprovals queueing).
Attention derivation: a park's existence ⇔ the parked-sweep attention line (spec §6b).
Finalize and Discard rewrite the file whole — `generated` restamped,
`generatedBy: "sweep"` — under the C4 lock (pass `sweep`).

## suppressed.json
`{ "tasks": [], "meetings": [], "approvals": [], "intake": [] }` — a suppressed id MUST
NOT appear in any lane or the meetings list. `approvals` entries are
`{ "id": "", "kind": "", "target": "", "declinedAt": "ISO" }`; a suppressed
`kind`+`target` (normalized) must not re-enter `pendingApprovals`. Absent `approvals`
field in a live file = valid, reads as empty (no migration); appending to an absent
`approvals` field initializes it to `[]` first (machine bookkeeping, ungated).
Un-suppressing reuses the existing unsuppression flow (an `unsuppression`
pendingApprovals entry). `intake` entries are LEAVE snooze records (#61):
`{target (canonical-recipe normalized), fingerprint, reason, decidedAt, reconsiderAt}` —
matched by target+fingerprint; a changed fingerprint invalidates the record (the file is
new again); reconsiderAt past → the maintain pass re-surfaces it.
`reconsiderAt: null` = AGELESS (staged `intake/` targets only — the mandated label
makes the scope decidable): never re-surfaced by expiry; a changed fingerprint still
re-enters classification. Absent `intake` field
= valid, reads as empty (no migration).

## intake.json (#61 — watermarks · #179 — the parked staged manifest)
```json
{ "generated": "ISO", "generatedBy": "intake", "lastSweep": "ISO|null", "lastMaintain": "ISO|null",
  "parked": null }
```
Every intake-written instant — both watermarks here, and `suppressed.intake`'s
record instants — is stored in the explicit-UTC `Z` form (#94; the parse rule lives in
the intake skill's sweep step 1).
`parked` is `null` (no park; ABSENT in a pre-#179 file reads as null — no migration, the
`suppressed.approvals` precedent) or the staged artifact set written by the UNATTENDED
stage-and-park pass under the C4 lock (pass `intake`): `{ generatedAt, rows[],
unknowns[] (each `{target, fingerprint, reason}`) }`; each row `{ target, fingerprint,
verdict: move|copy|leave, destination (always present as a string — non-empty for
move/copy, empty for leave), evidence, hintResolution }`. The park's existence ⇔ the
parked-intake attention line (sync S7.2 and tidy DERIVE it — exact line there; a written
line with no derivation dies at the next full pass). A park is written ONLY when the
staged source probed successfully AND at least one row or unknown was built — a
probe-failed or clean-empty run never replaces a populated park. Finalize and Discard
rewrite `parked` to null; **EVERY other intake.json write — both watermark closes —
preserves `parked` verbatim alongside the sibling watermark** (read-modify-write; a
close after "Leave parked" must not destroy the park the user kept). Written only under
the C4 lock — read-modify-write, restamp `generated`/`generatedBy: "intake"`. Sync
derives its optional "intake overdue" attention line from watermark age vs the
configured NON-STAGED retention thresholds (staged sources are resurface-governed and
excluded) — sync never runs intake, never writes this file.

## run-report.json (#206 — unattended run reports + drain instrumentation)

`{ generated, generatedBy: "sync|tidy|sweep|intake", reports: {…}, drainStats: {…} }` —
two independent halves with two independent writer rules (C15; mechanics in
`assets/shared/unattended-execution.md`):

- **`reports`** — latest UNATTENDED run per pass, keys ⊆ {`sync`, `sweep`, `intake`};
  written ONLY by the lock-holding unattended run as part of its final state batch
  before tombstone release. Attended runs never write it. Each entry:
  `{ at, localDate?, version, surface, outcome: "completed|blocked",
  counts: {auto, queue}, queueByClass, unknowns?, leaves?, tier?, coverage?, scope?,
  blockReason (non-empty iff blocked; null or omitted otherwise), summary }`
  (`localDate` — omit when unresolved, the stamp's rule; present ⇒ a real calendar date,
  not merely YYYY-MM-DD-shaped). `tier` and `coverage`, when present, carry sweep.json's
  own vocabularies verbatim — `mcp|logs` and `full|partial`. `scope: {inScope, observeOnly}`
  (#266, sweep-only, absent-tolerant — a pre-#266 report stays valid): the disposition
  counts of the reported run. `counts.queue`/`queueByClass`
  count items newly raised OR dedupe-refreshed this run (parks: decision units staged this
  run), and **`counts.queue` equals the sum of `queueByClass`** — the RUN_REPORT line
  renders both, and §Promotion reads the classes as evidence. `unknowns`/`leaves` are
  counted separately and enter neither. BLOCK is an outcome, not a count.
- **`drainStats`** — cumulative per-`queueClass` counters (FLAT — keyed by class alone;
  sync and tidy drain the same queue and their evidence merges), written ONLY by the
  lock-holding attended gate that DECIDES queued items:
  `{ approved, declined, drains }` where `drains` counts drains in which ≥1 item of the
  class was approved or declined — left-pending and retired touch nothing.
- **`queueClass` is a COUNTING vocabulary — no new stored fields** (a stored derivable
  tag would violate C6): a `pendingApprovals` item's class IS its `kind` (extension
  kinds count as `extension`); an intake park row's class is its `verdict` mapped
  `move → intake-move`, `copy → intake-copy` (LEAVE rows count into `leaves`, never a
  class); a sweep park row emits one unit per NON-EMPTY decision field it carries
  (#266: an observe-only row — `proposedLine: ""`, no notes/close-date fields — emits
  zero units) — `proposedLine` →
  `next-step-line`, `closeDateProposal` → `close-date-proposal`, `notesBlock` →
  `notes-block`, park `emailPreview` → `email-preview`; `unknowns[]` totals into
  `unknowns`. Closed list: the validator's `QUEUE_CLASSES` — and **closed PER PASS**
  inside `reports` (the validator's `PASS_CLASSES`): sync reports the `pendingApprovals`
  kinds it raises, sweep reports its four decision units, intake reports its two park
  verdicts. `extension` is legal in every pass — the relief valve. `intake-delete`
  appears in NO reports set: deletes are decided at the intake finalize, so that class
  accrues only in `drainStats`. `drainStats` stays flat over the whole `QUEUE_CLASSES`
  list — one counter per class, whichever gate decided it.
- Writers MERGE (re-read under the lock, preserve every other key verbatim) and write
  temp-then-replace. **Every write stamps provenance for the write it just made** —
  `generated` = that write's instant (required; ISO), `generatedBy` = the writing pass,
  including a `tidy` gate that touched `drainStats` alone. The two halves keep their own
  writer rules; the stamp describes the file's last toucher, never the last unattended
  run (read `reports.{pass}.at` for that). Unparseable file → recreate from empty in the same batch + one
  attention line ("run-report.json was unreadable and was recreated — drain counters
  reset") + a journal pointer; NEVER a BLOCK. Absent file → first eligible lock-holder
  creates it; setup never scaffolds it (presence carries meaning — C4 bootstrap
  exception's boundary).

## log-index.json (#233 — the sweep's derived log index)
```json
{ "generated": "ISO", "generatedBy": "sweep",
  "rows": { "{Account}/{OppFolder}": {
      "observed":     { "nextStep": "", "closeDate": "", "stage": "", "forecast": "", "source": "", "id": "" },
      "lastAccepted": "string | null",
      "lastKnownId":  "18-char | null",
      "entryDate":    "YYYY-MM-DD",
      "logBytes":     0,
      "stamp":        true } } }
```
One row per opportunity `Next_Step_Log.md`: the log tail's deterministic projection (the §A6 entry format is a fixed grammar). `observed` = the last Observed snapshot's segments verbatim (`id` may be `unknown`); `lastAccepted` = the last accepted line (null when none); `lastKnownId` = the most recent non-`unknown` Observed Id — the A6.2 link value, which on a manual-tier log sits EARLIER than the last snapshot; never the string `unknown` (null when no real Id has ever been observed); `entryDate` = the last entry's date; `logBytes` = the file's byte size at write — the staleness check (the log is append-only by contract, so size is a monotone version counter). `stamp` (#266, optional, absent ≡ false): true ⇔ the log tail AFTER the last
`sweep`-headed entry carries a live `Surface: next-sweep` stamp at write time. Maintained
ONLY by the two lock-holding writers: set from the write-time tail read; written absent
once a sweep observation for that log lands (consumed). A3.0's precedence governs reads —
a fresh tail read always beats the flag. A size-preserving hand-edit is #214's root-drift class — doctor's spot check (#235), never the hot path's.

**The history-cache restriction:** the index caches the log tail's already-legal HISTORY read and inherits its restrictions verbatim — consumers use rows ONLY where the log tail is legal today (`no-shadow-store`'s next-step-history clause): A3's comparison baselines, A6.2's changed-block composition (the `Old:` line verbatim and the Change Type derivation's observation-deltas-vs-prior-entry anchor), and A6.2's link Id, **and A2's scope disposition reads the
`Surface: next-sweep` stamp (#266 — a routing marker, never deal-state)**. Never read back as current deal-state — current state comes from the tier's authoritative intake, every run.

Regenerable derived cache (the `accounts.json` pattern): deleting it loses nothing — the read protocol (workos-next-steps A3.0) degrades LOUD to the full inline fan-out and the next lock-holding sweep write rebuilds it. **Writers are lock-holders only**, and both already hold the C4 lock (pass `sweep`): the unattended park's write batch (§A0.3 — refresh + first-build) and Finalize's persistence batch (rows it appended; Discard writes no rows). The attended fresh sweep, §B, and delegate-caller appends NEVER write it (#173 — they hold no lock); their appends are the next read's changed set, caught by the size check. Validator: `log-index` in `ci/state-rules.js`; fixtures good + red under `ci/fixtures/state/`.

## state/handoff.md + state/handoffs/ (#245 — the session→session handoff)

The ONE markdown state file. `state/handoff.md` holds ONLY the current handoff (target
read ≤ ~2k tokens); on each new hand-off the prior current moves to
`state/handoffs/{its own frontmatter written-date}.md` (same-day collisions suffix `-2`,
`-3`, …). The folder is created on first archive — not required root shape in v1 (#247).

Frontmatter (closed shape — exactly these keys): `schema: handoff.v1` · `written:`
(user-local, starts `YYYY-MM-DD`, rendered per the #49 zone rule) · `by:` · `session:`
(one-line label). Body sections, fixed order: `## First action` (≥1 content line — ONE
binary step) · `## Where things stand` · `## Open loops` (top-level bullets capped at 5
— overflow is triaged at the approval gate, never written) · `## Decisions made` ·
`## Clocks` · `## Locations` (pointers to authoritative sources, never copies — C6).

Writer: `workos-handoff` ONLY, attended-only, under the pass lock (C4), gated (C5/C14).
Resume reads `state/handoff.md` and writes nothing. Validator: `validateHandoffMd`
(`ci/state-rules.js`), fixtures under `ci/fixtures/state/handoff/`.

## .pass-lock.json (persistent file, transient meaning — see spike 4)
Live: `{ "pass": "sync|tidy|sweep|intake|handoff", "startedAt": "ISO", "surface": "cowork|claude-code",
"runId": "..." }`. Released: the same object plus `"released": true, "releasedAt": "ISO"`.
Tombstone ⇔ `released` is exactly `true`; anything else is a live lock. A tombstone reads
as FREE at acquire and is the file's healthy resting state; nothing in the engine deletes
it (#30: delete is unreliable on the scheduled surface).
