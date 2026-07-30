---
name: workos-intake
description: >
  File intake & retention: triage the folders where files land — the deliberate-drop
  inbox (Intake/, staged captures) plus downloads/screenshots — into account folders,
  the Library, or proposed deletions; nothing moves or deletes without an approved
  manifest line. Sweep ("run intake" / "triage my downloads" / "clean up downloads"):
  full classification into piles; staged files are deliberate keeps — never
  delete-proposed, resurfaced until filed; an account frontmatter hint pre-resolves the
  destination. Maintain ("intake check"): the cheap pass — new files plus snoozed items
  past reconsideration. A scheduled (unattended) run stage-and-parks: classify + park
  STAGED sources only, no filing, no questions — every gate, move, and delete stays
  attended. DO NOT attempt without loading — it enforces the manifest gate shape, the
  lock protocol, the pile rules, the park, and the suppression records.
---

# workos-intake — files are the fourth intake path (L3)

## Role

You triage the folders where files land, so nothing valuable rots in a downloads
folder and nothing personal is ever touched. Two modes — **sweep** (expensive, rare)
and **maintain** (cheap, weekly-to-monthly). The system proposes; the user approves;
deletion is never automatic. Contracts (by reference — never restated): C2 · C4 · C5 ·
C11 · C13 · C14. Spec of record:
`docs/superpowers/specs/2026-07-21-file-intake-design.md` §D3 (#61, epic #58).

**Bundle location:** resolve every `assets/` path in this file relative to THIS skill's
own folder — the folder containing this SKILL.md. Under direct .skill upload that is
`.claude/skills/workos-intake/` under the session mount; under a plugin install it is
the plugin's skill folder. Never resolve `assets/` in the memory root or project folder.

**State schema:** `assets/shared/state-schema/README.md` is normative for every field
this skill reads or writes — `pendingApprovals` (the manifest rides it: kinds
`intake-move · intake-copy · intake-delete`, merge/dedupe/raise-and-exit pointers,
canonical target recipe), `suppressed.intake` (LEAVE snooze records), and
`state/intake.json` (watermarks).

## Step 0 — every run

1. **Run header (#52):** first output line: `workos-intake {installed} on {surface}` —
   {installed} = `assets/shared/VERSION` verbatim (missing → `unstamped dev bundle`),
   {surface} = `cowork` | `claude-code`.
2. **Unattended = stage-and-park only:** the invoking prompt carries
   `(scheduled, unattended)` → run §PARK — staged sources only, classify and park,
   zero filings, zero questions, zero emissions; the gate and every move/delete stay
   attended-absolute. No marker → attended.
3. **Config (C2):** resolve `{memory_root}`, `{intake_sources}`, `{library_path}`,
   `{intake_retention_days}` (missing → downloads 60 · screenshots 30 · staged 7 — the
   staged value governs ONLY the LEAVE resurface window, never delete-eligibility; one
   info line), `{timezone}`, `{account_aliases}` via `core.md`. No `intake_sources`
   configured → loud-skip naming the setup question, exit.
4. **Mode:** sweep vocabulary: run intake / triage my downloads / clean up downloads.
   Maintain vocabulary: intake check. Ambiguous → one question (C11): "1. Full sweep —
   classify everything / 2. Maintain — new and due items only / 3. Stop."
5. **Source resolution — capability-probed, never surface-typed (C13):** for each
   configured source, try the absolute `path` first, then a mounted-folder `mount`
   name match. Resolves → probe with a harmless listing. Visible neither way → one
   loud capability line with SURFACE-APPROPRIATE remediation — Cowork: "add the
   {label} folder to this project (Project → Add folder)" · Claude Code: "check the
   configured path, or run from the machine that has it" — never "no files". A probed
   failure on a CONFIGURED source is a loud SKIP for that source; the run proceeds
   with the sources that resolve.
6. **Scope rule:** a GLOBAL sweep needs global reach over the configured sources plus
   `Accounts/` and `{library_path}`. An account-scoped session (mounted to one
   account) may intake ONLY into that account — say so in one line; global lines
   render as out-of-scope pointers, never guesses.
7. **The lock (C4):** acquire as pass `intake` — full protocol by reference to
   workos-sync Step 0.4 (absent/tombstone acquire · heartbeat after every user answer
   and each phase · ownership check before every state write batch · verified
   tombstone release as the final action, never delete).

8. **Usage log (open):** Immediately after the lock is yours, append the `open` record per
   `assets/shared/usage-log.md` (`mode`: `sweep` or `maintain`; `runId` = this pass's lock runId). A failed append is never fatal — one `system` line in `attention[]`, and the pass continues.

## SWEEP — full classification

0. **Parked-manifest resume (attended entry):** `state/intake.json → parked` non-null
   → one structured offer (C11): "Parked intake manifest from {generatedAt} ({N}
   rows, {M} unknowns). 1. Finalize — revalidate and gate / 2. Tweak named rows first
   / 3. Discard it / 4. Leave parked, run fresh." **Finalize:** revalidate every
   row's fingerprint — changed or vanished → that row re-enters classification (the
   fail-safe; #96's backdated-mtime arrivals land on the same rule); each surviving `move`/`copy` row
   then enters `pendingApprovals` through the normal raise path (pointer journaled
   before the item enters, #50 machinery unchanged) BEFORE the gate; then
   steps 2–4 exactly as attended. **Tweak:** adjust the named rows, then Finalize's
   flow. **Discard:** rewrite `parked` to null + one journal pointer
   `- {date} parked intake manifest discarded (generated {generatedAt})`. **Leave
   parked:** run the fresh sweep — the park survives it (the close's preserve rule).
   Finalize and Discard null `parked`; the attention line clears at the next
   sync/tidy derivation. Parked rows carry no `appr-` ids and are invisible to the
   queued-items aggregate line until finalize, where ONLY `move`/`copy` rows raise
   into `pendingApprovals` (kinds `intake-move`/`intake-copy`, the normal raise path)
   — `leave` rows never enter the queue ("LEAVE is not a queue item" stands): they
   render at the gate and convert to `suppressed.intake` LEAVE records, decline
   semantics as shipped. Leave rows ride the same consolidated approval — accept writes
   the LEAVE record (window or ageless per the row's gate choice); adjust reclassifies. A
   vanished file has nothing to classify: its row DROPS with one visible line, never a
   silent disappearance. Finalize consults the queue's dedupe and `suppressed.intake`
   exactly as a sweep does — an already-queued or already-suppressed target+fingerprint
   skips with one line (a fresh sweep run beside a kept park can never double-file).
   "Steps 2–4 exactly as attended" means: step 2 for re-entered
   rows AND every `unknowns[]` entry (the questions park mode could not ask — parked
   personal-classified files take their LEAVE/ageless offer here); the step-4 gate
   re-renders EVERY row at full fidelity — a park is never a prior render.
1. **Scan:** stat every immediate-child regular file of each resolved source (names,
   size, mtime). **Mtimes are captured as explicit-UTC instants (`Z` form) at stat
   time, and every time comparison in EITHER pass — retention windows, `reconsiderAt`
   expiry, maintain's watermark scope — parses BOTH sides as UTC, never the surface's
   default parse** (stored instants are Z-suffixed per the schema; #94: a default-local
   parse mis-scoped maintain in the #61 staged run and, uncaught, would have reported
   "nothing new"). Fingerprints record the UTC form — timezone-portable by
   construction (residual mtime precision/sync drift across machines can still
   mismatch; that mismatch re-enters classification, the fail-safe direction, and is
   not by itself evidence the file changed). A legacy local-form fingerprint behaves
   the same way. Read no content — EXCEPT hashing, which is computed ONLY for
   delete-candidates (duplicate pairs, superseded version-chain members).
   For `kind: staged` sources ONLY, one more bounded read: the leading YAML frontmatter
   block (capped head-of-file read, first fence block only — binary or fence-less files
   read nothing beyond the probe) to collect the `account:` hint.
   "Exact duplicate" is claimed only after content verification (hash match);
   otherwise render "probable duplicate", which can justify LEAVE — never DELETE.
2. **Classify** every file into exactly one pile:
   - **account-specific** — account matching reuses `workos-capture` Step 0.3's
     resolution rules by reference: consult `account_aliases` FIRST — a configured hit
     resolves as exact, no confirmation; then exact/substring → proceed; initialism or
     nickname → ALWAYS a C11 confirmation (never silent — the two-letter-prefix cluster is
     exactly this case); a confirmed alias is OFFERED as a config `account_aliases`
     entry so it is never asked twice (gate-confirmed, the #40 pattern). Destination
     defers to that account's own `Account_Project_Instructions.md` — intake never
     invents taxonomy. Never a `_`-prefixed folder.
   - **generic collateral** — destination `{library_path}` per its fixed taxonomy;
     the anti-mirror rule governs: opened-and-modified files earn a working copy
     (MOVE/COPY into the matching subfolder + an `INDEX.md` row); merely-read
     material becomes an `INDEX.md` pointer row proposal only, never a copy.
   - **personal** (internal / personal-financial) and **personal-lane** — render
     "personal — untouched". NEVER proposed for move or delete, in any pass, ever.
   - **dev exhaust** (skill bundles, installers) — DELETE-eligible ONLY with a named,
     verified recoverable source (a releases page, a vendor download page); verified
     = the source is named from evidence, not invented. No source → LEAVE.
   - **transient junk** — older than the source's retention window → ordinary DELETE
     with recoverable source "recreated trivially"; younger → LEAVE.

   **Staged sources (`kind: staged`) — the deliberate prior:** every file is already
   a keep decision; classification chooses a DESTINATION only — account-specific ·
   generic collateral · a C11 ask when neither fits · LEAVE. The transient-junk and
   dev-exhaust delete paths are UNREACHABLE for the kind: a staged file is never
   delete-proposed, in any pass, ever — one the user wants gone is theirs to delete.
   The `account:` frontmatter hint is a classification PRIOR, never an override:
   resolution runs the standard rules above (aliases first, confirm classes intact);
   an exact resolution skips the which-account question (the file still rides the
   gate); a hint naming nothing falls back to normal resolution with one line saying
   so. A personal-classified staged file is never move/delete-proposed but DOES take
   a LEAVE record with the staged resurface window by default — rendered "personal —
   left in Intake/, resurfaces {date}" — and the gate offers the ageless variant as a
   structured choice ("stop resurfacing" — `reconsiderAt: null`; never re-surfaced by
   expiry, a changed fingerprint still re-enters). A staged LEAVE's `reconsiderAt` =
   decidedAt + the staged source's resurface window (default 7 days).
3. **Manifest — every actionable line is a `pendingApprovals` item** (#50 machinery:
   merge + dedupe, `appr-` ids, raise pointer journaled before the item enters the
   queue; an interrupted session keeps its manifest). Item fields: standard id/kind/
   target/summary/diff/raisedBy/raisedAt + extension fields: op destination ·
   size/mtime `fingerprint` (+hash for deletes) · classification evidence ·
   `recoverableSource` (deletes). Target = the normalized source path per the schema
   recipe. **LEAVE is not a queue item** — it is a `suppressed.intake` record
   `{target, fingerprint, reason, decidedAt, reconsiderAt = decidedAt + the source's
   retention window}` — staged sources: the resurface window; or `null` (the staged
   ageless variant, gate-offered only, never re-surfaced by expiry). Before raising
   anything, consult `suppressed.intake`: an
   unexpired match with an unchanged fingerprint is SKIPPED into one aggregate line
   ("{N} items suppressed by earlier LEAVE decisions"); a changed fingerprint or a
   past `reconsiderAt` re-enters classification. LEAVE-record instants
   (`decidedAt`/`reconsiderAt`) are written in the UTC `Z` form (step 1's rule governs
   writes as well as reads, #94).
4. **THE GATE (C14; the #62-approved shape):** render the FULL manifest with stable
   ids, grouped by verdict. **MOVE/COPY**: approvable as a rendered batch with
   per-item opt-out (drop named ids). **DELETE: per item, always** — each renders its
   full line + verified recoverable source beside its own question; the first
   confirmation sends the file to trash/recycle; PERMANENT deletion only by a second,
   stronger, explicit per-item confirmation; no trash facility on the surface → the
   operation FAILS CLOSED (the file stays; the line says why). One terminal operation
   per source file; dependent lines (a dupe of a file being moved) execute in
   dependency order. Immediately before EACH execution, revalidate the fingerprint —
   changed underneath → that item goes back to draft, never executed on a stale
   approval. Every exit journals per the schema; an applied `intake-delete`'s journal
   line names the recoverable source. A DECLINE on an intake item additionally writes
   its LEAVE record to `suppressed.intake` in the same batch as the declined exit
   (target + fingerprint from the item, `reconsiderAt` per the source's window) —
   declines never re-litigate either.
5. **Close:** write `state/intake.json → lastSweep` (this run's captured now, UTC `Z`
   form — a naive-local stamp on a UTC-positive surface silently under-scopes the next
   maintain, #94) in the final state batch — **read-modify-write: preserve the
   sibling watermark AND `parked` verbatim (only a park, Finalize, or Discard write
   touches `parked`), restamp `generated`/`generatedBy: "intake"`** (two passes share
   this file; a whole rewrite that nulls the other watermark breaks sync's overdue
   line and maintain's guard); one summary — counts per pile, applied/declined/left,
   bytes reclaimed,
   aggregate suppression line. Immediately before releasing the lock, append the `close` record per
   `assets/shared/usage-log.md`, using that document's outcome mapping. Do not restate the
   mapping here. Release the lock. Offer nothing else (the brownfield
   principle: no other skill's work is blocked on tidiness).

## MAINTAIN — the cheap pass

Read-set: config · the lock · `state/intake.json` · `suppressed.intake` · source
listings (stat only). Scope, exactly three item classes:
1. Files newer than `lastMaintain` (else `lastSweep`; both null → immediately before
   exiting, append the `close` record per `assets/shared/usage-log.md` with outcome
   `completed` (the pass correctly determined there is nothing to maintain), then say
   "no sweep has run — run intake first" and release the lock, exiting without further
   writes) — the newer-than comparison obeys sweep step 1's explicit-UTC rule (#94:
   this exact check is where the local parse misfired).
2. `suppressed.intake` records past `reconsiderAt`, or whose fingerprint changed.
3. Unpromoted screenshots older than their source's retention window — never
   `staged` sources (resurface-only; class 2 is exactly how a staged LEAVE returns) —
   these are ordinary trash-first DELETEs: **promote-to-keep means the retention
   window itself is the recoverable-source equivalent** (the capture had its
   promotion chances at every meeting capture and every maintain pass; the journal
   line names the window, e.g. "unpromoted past 30-day screenshot retention").
Classify and gate EXACTLY as sweep steps 2–4 (same piles, same manifest machinery,
same #62 gate shape), then stamp `lastMaintain` (UTC `Z` form, #94) — same
read-modify-write rule as sweep's close: preserve `lastSweep` AND `parked` verbatim,
restamp `generated`/`generatedBy`. Immediately before releasing the lock, append the `close` record per
`assets/shared/usage-log.md`, using that document's outcome mapping. Do not restate the
mapping here. Release. A maintain pass never re-litigates an
unexpired, unchanged LEAVE.

## PARK — stage-and-park (unattended; the marker-carried path)

Staged sources ONLY — downloads/screenshots are out of scope this pass (say so in the
run output). Step 0 applies as: 0.1 run header · 0.2 routed here · 0.3 config · 0.5
runs RESTRICTED to the staged source (path-then-mount resolution and remediation
wording unchanged) — 0.4 and 0.6 do not run — then: the lock per
Step 0.7 → usage `open` per Step 0.8 (`mode:
sweep` — parking IS the sweep's unattended form; `runId` = this lock's) → probe the
staged source (C13) → classify per the sweep rules (the staged prior; unknowns park
per-row as `{target, fingerprint, reason}` objects (personal-classified files park here,
never as a `rows[]` entry) — no questions) → ONE write batch: `parked = {generatedAt,
rows[], unknowns[]}` (each row `{target, fingerprint, verdict, destination, evidence,
hintResolution}`), REPLACING any prior park (said in the output) **subject to the
success precondition — the staged source probed successfully AND at least one row or
unknown was built; a probe-failed run leaves an existing park UNTOUCHED (close
`degraded`), a clean-empty run writes no park (close `completed`)** — plus the
parked-intake attention line as the typed record `{class: "action", source: "intake"}`
(text: `parked intake manifest ({N} rows, from {date}) — say 'run intake' to finalize`)
and a MERGE of `lastUnattendedRun.intake` = `{at, localDate (omit when unresolved),
surface, version}` preserving every other key — **the stamp writes on EVERY lock-holding run,
park or no park** (it is the #52 evidence doctor reads) → usage `close` per the
outcome mapping → verified tombstone release. No filings, no emissions, no board
rebuild (sync/tidy own board rebuilds). No same-day dedupe — deliberate divergence
from next-steps §A0: the desk auto-enqueues on capture, so a later run parking a
FRESHER set is the desired behavior; replacement is the dedupe.

## Anti-patterns — never

- Filing, gating, questioning, or emitting ANYTHING from an unattended run — §PARK
  (staged sources only) is the whole unattended surface (Step 0.2).
- Proposing a DELETE against a staged source, or ageing a staged file out — staged
  files resurface until filed; they never expire.
- Moving, deleting, or renaming ANYTHING outside an approved manifest line — or
  proposing anything against a personal pile, a `_`-prefixed account folder, or a
  file whose source sits inside `Accounts/` already.
- Claiming "exact duplicate" without a content hash; deleting on "probable".
- A DELETE line without a named, verified recoverable source — an unsourced DELETE is
  a build defect (spec §D3).
- Bypassing trash: permanent deletion without the second per-item confirmation, or
  proceeding when no trash facility exists (fail closed).
- Re-asking a LEAVE before its `reconsiderAt` (unchanged fingerprint), or re-asking a
  confirmed alias instead of offering the `account_aliases` entry.
- Writing `state/` without the lock; touching Salesforce or deal-state anywhere;
  mirroring the Library (the anti-mirror rule is the skill, not a doc).
- Prose questions — C11 governs every question, structured and submittable.
