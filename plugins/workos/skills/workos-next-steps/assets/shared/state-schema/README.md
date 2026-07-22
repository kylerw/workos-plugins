# WorkOS v1 state schema (PLAN §4.3 — MC shapes, queue fields excluded)

Machine-written JSON under `{memory_root}/state/`. One writer per run (C4, lock per
docs/spikes/spike-4-single-writer.md). Derived values (scores, importance levels) are
computed at render time and never stored (C6). **Extension rule:** power-user extensions may
add fields; engine skills and the board ignore unknown fields; CI validates the baseline
only. Fixtures: `ci/fixtures/state/` — `ci/validate-state.sh` enforces the state
files; `.pass-lock.json` is protocol, validated live (doctor step 7, spike 4).

## tasks.json
```json
{ "generated": "ISO", "generatedBy": "sync|tidy|sweep|intake",
  "lastFullSync": "ISO", "lastTidy": "ISO",
  "lastUnattendedRun": { "sync": { "at": "ISO", "localDate": "YYYY-MM-DD?", "surface": "cowork|claude-code", "version": "" }, "sweep": { "…same shape…": "" } },
  "teamsScan": { "cursors": { "{chatId}": "ISO" }, "missStreak": 0 },
  "pendingApprovals": [ { "id": "", "kind": "", "target": "", "summary": "", "diff": "", "raisedBy": "", "raisedAt": "ISO", "lastSeenAt": "ISO" } ],
  "dayTask": { "id": "", "date": "YYYY-MM-DD", "context": "",
    "queue": [ { "rank": 1, "taskId": "?", "title": "", "account": "", "signal": "", "due": "YYYY-MM-DD?" } ] },
  "attention": [ "one line per item: degraded tool, version notice, approvals waiting" ],
  "lanes": { "NICE": [ { "id": "", "title": "", "signal": "", "context": "", "due": "YYYY-MM-DD?" } ] } }
```
`lastUnattendedRun` (optional; #67/#68/#52): a MAP keyed by unattended pass kind —
`sync` (workos-sync) and `sweep` (workos-next-steps); intake is attended-only and never
appears here. Each writer MERGES its own key and preserves every other key verbatim; it
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
  label}/{basename}`) — the label from `intake_sources` (sources live OUTSIDE the memory
  root; the root-relative form doesn't apply). The intake `fingerprint` extension field
  is `{size}:{mtime ISO}` (+ `:{hash}` when hashed).
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
flags[], unknowns[], proposedLine, notesBlock, closeDateProposal, observedSnapshot }`.
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
new again); reconsiderAt past → the maintain pass re-surfaces it. Absent `intake` field
= valid, reads as empty (no migration).

## intake.json (#61 — intake watermarks)
`{ "generated": "ISO", "generatedBy": "intake", "lastSweep": "ISO|null", "lastMaintain": "ISO|null" }`
Written only by the attended `intake` pass under the C4 lock — read-modify-write:
each mode stamps ITS watermark and preserves the sibling verbatim (the
`lastUnattendedRun` pattern), restamping `generated`/`generatedBy: "intake"`. Sync
derives its optional "intake overdue" attention line from watermark age vs the
configured retention thresholds — sync never runs intake, never writes this file.

## .pass-lock.json (persistent file, transient meaning — see spike 4)
Live: `{ "pass": "sync|tidy|sweep|intake", "startedAt": "ISO", "surface": "cowork|claude-code",
"runId": "..." }`. Released: the same object plus `"released": true, "releasedAt": "ISO"`.
Tombstone ⇔ `released` is exactly `true`; anything else is a live lock. A tombstone reads
as FREE at acquire and is the file's healthy resting state; nothing in the engine deletes
it (#30: delete is unreliable on the scheduled surface).
