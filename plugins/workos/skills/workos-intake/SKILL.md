---
name: workos-intake
description: >
  File intake & retention: triage the folders where files land into account folders,
  the Library, or proposed deletions — nothing moves or deletes without an approved
  manifest line. Sweep ("run intake" / "triage my downloads" / "clean up downloads"):
  full classification into piles — account-specific · generic collateral · personal
  (never touched) · dev exhaust · transient; every proposal is a durable queue item
  with evidence; deletes name a verified recoverable source; MOVE/COPY approve as a
  batch with per-item opt-out, DELETE is per-item and trash-first. Maintain ("intake
  check"): the cheap pass — files newer than the watermark plus snoozed items past
  their reconsideration date; a LEAVE decision persists, never re-litigated. Attended
  only — never scheduled, never unattended. DO NOT attempt without loading — it
  enforces the manifest gate shape, the lock protocol, the pile rules, and the
  suppression records.
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
2. **Attended-only (absolute):** the invoking prompt carries `(scheduled, unattended)`
   → say `intake is attended-only — it proposes moves and deletions and needs you at
   the gate; remove this skill from any scheduled task` and EXIT. Zero reads beyond
   config, zero writes, no lock.
3. **Config (C2):** resolve `{memory_root}`, `{intake_sources}`, `{library_path}`,
   `{intake_retention_days}` (missing → downloads 60 · screenshots 30, one info line),
   `{timezone}`, `{account_aliases}` via `core.md`. No `intake_sources` configured →
   loud-skip naming the setup question, exit.
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

## SWEEP — full classification

1. **Scan:** stat every immediate-child regular file of each resolved source (names,
   size, mtime). Read no content — EXCEPT hashing, which is computed ONLY for
   delete-candidates (duplicate pairs, superseded version-chain members).
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
3. **Manifest — every actionable line is a `pendingApprovals` item** (#50 machinery:
   merge + dedupe, `appr-` ids, raise pointer journaled before the item enters the
   queue; an interrupted session keeps its manifest). Item fields: standard id/kind/
   target/summary/diff/raisedBy/raisedAt + extension fields: op destination ·
   size/mtime `fingerprint` (+hash for deletes) · classification evidence ·
   `recoverableSource` (deletes). Target = the normalized source path per the schema
   recipe. **LEAVE is not a queue item** — it is a `suppressed.intake` record
   `{target, fingerprint, reason, decidedAt, reconsiderAt = decidedAt + the source's
   retention window}`. Before raising anything, consult `suppressed.intake`: an
   unexpired match with an unchanged fingerprint is SKIPPED into one aggregate line
   ("{N} items suppressed by earlier LEAVE decisions"); a changed fingerprint or a
   past `reconsiderAt` re-enters classification.
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
5. **Close:** write `state/intake.json → lastSweep` (this run's captured now) in the
   final state batch — **read-modify-write: preserve the sibling watermark verbatim,
   restamp `generated`/`generatedBy: "intake"`** (two passes share this file; a whole
   rewrite that nulls the other watermark breaks sync's overdue line and maintain's
   guard); one summary — counts per pile, applied/declined/left, bytes reclaimed,
   aggregate suppression line; release the lock. Offer nothing else (the brownfield
   principle: no other skill's work is blocked on tidiness).

## MAINTAIN — the cheap pass

Read-set: config · the lock · `state/intake.json` · `suppressed.intake` · source
listings (stat only). Scope, exactly three item classes:
1. Files newer than `lastMaintain` (else `lastSweep`; both null → say "no sweep has
   run — run intake first" and exit without writes).
2. `suppressed.intake` records past `reconsiderAt`, or whose fingerprint changed.
3. Unpromoted screenshots older than their source's retention window — these are
   ordinary trash-first DELETEs: **promote-to-keep means the retention window itself
   is the recoverable-source equivalent** (the capture had its promotion chances at
   every meeting capture and every maintain pass; the journal line names the window,
   e.g. "unpromoted past 30-day screenshot retention").
Classify and gate EXACTLY as sweep steps 2–4 (same piles, same manifest machinery,
same #62 gate shape), then stamp `lastMaintain` — same read-modify-write rule as
sweep's close: preserve `lastSweep` verbatim, restamp `generated`/`generatedBy` — and
release. A maintain pass never re-litigates an unexpired, unchanged LEAVE.

## Anti-patterns — never

- Running under a `(scheduled, unattended)` prompt — attended-only, absolute (Step 0.2).
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
