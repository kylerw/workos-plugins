# §A. Weekly sweep — the leadership ritual
Reached only via workos-next-steps SKILL.md mode 1 — including a parked-sweep finalize — never standalone; Step 0, Role, C11, §D, the three spine blocks, and the anti-patterns apply.


One pass. Generate everything first, approve once on the **actual artifacts**, then emit
three outputs and persist. Recommended as a scheduled task on the team's confirmed
cadence — the sweep runs the evening before delivery (Wednesday night for the Thursday
standard, matching setup's scheduled-task recipe) for Thursday-morning delivery + the paste-ready Salesforce update (decided 2026-07-27; the recorded manager-decision file wins if it says
otherwise). "Thursday sweep" stays a live trigger alias for the same ritual.

**Parked-sweep resume (attended entry check, #68):** before A1, when
`state/sweep.json` holds a park, one structured offer (C11): "Parked sweep from
{generatedAt} ({tier}, {coverage}, {N} rows{; STALE — {age} days old, regenerating
recommended} when older than 7 days). 1. Finalize — refresh and gate / 2. Tweak named
rows first / 3. Discard it / 4. Leave parked, run fresh." **Finalize:** staleness
refresh — `mcp` tier re-runs the A1 query and marks each row changed/unchanged, every
changed row re-rendered in full (`render-before-gate`); `logs` tier presents as-parked
with its coverage label; parked `unknowns[]` become A3.3's one batched question; then
A5's consolidated gate on the full in-scope decision set plus the whole-pipeline
persistence diff → A6 outputs + persistence exactly as attended (observations stamp
HERE, from finalize-time data). **Disposition re-derivation (#266, tier-scoped):** `mcp`
re-derives every row's scope from finalize-time data (the fresh A1 query + A3.0 + the
finalize date for the window); `logs` re-derives what finalize-time data exists — the
A3.0 acquisition (stamps, first sighting) and the finalize date — with SFDC-side inputs
(bucket, A3.1, A3.5) from the parked observed snapshot. A park row without `scope`
(pre-#266) re-derives the same way. A5's gate presents decisions for IN-SCOPE rows only;
observe-only rows ride as observations in the whole-pipeline persistence diff. **Flips:**
a row ENTERING scope at finalize gets §D generation now, then the gate
(`render-before-gate`); a row LEAVING scope drops its parked decision with one named line
in the run output — `{OppNumber} — {Opp Name}: parked line dropped (out of scope at
finalize)` — and counts nothing in drainStats (only rows decided at this gate count).
When the gated set came from a
park (the §A-entry resume), update `state/run-report.json → drainStats` per
`assets/shared/unattended-execution.md` §Drain instrumentation — classes per schema
§run-report.json's sweep mapping; only rows DECIDED at this gate count (a row left
parked touches nothing). **Tweak:** adjust the named rows,
then Finalize's flow. **Discard:** rewrite `parked` to null + one journal pointer
`- {date} parked sweep discarded (generated {generatedAt})`. **Leave parked:** run a
fresh attended sweep; the park stays untouched. Finalize and Discard clear the park,
and the derived attention line clears at the next sync/tidy pass. **At finalize, A5
renders ALL decision rows at full fidelity in the gate turn — a park is never a prior
render (C14); changed/unchanged marks are annotations, never fidelity tiers.** Finalize's and
Discard's state writes — the `sweep.json` rewrite (restamping `generated`/`generatedBy:
"sweep"`) and the journal pointer — happen under the C4 lock, pass `sweep`, full
protocol by reference to workos-sync Step 0.4, exactly like the unattended park's.
Immediately after acquiring the lock in the Finalize/Discard flow, append the `open`
record per `assets/shared/usage-log.md` (`mode`: `sweep`; `runId` = this lock's runId).
A failed append is never fatal — one `system` line in `attention[]`, and the pass
continues. Finalize's same lock-held batch ALSO rewrites `state/log-index.json` (schema
§log-index.json) after A6's log appends — Finalize runs A3.0's acquisition as part of its
staleness refresh (its A6.2 links and Old-line composition consume the acquired values),
so the rows are in hand: a row whose log this finalize appended takes the appended
entry's values (`entryDate` = the entry's date; `lastKnownId` advances only on a real
observed Id, never on `unknown`; `logBytes` from ONE post-append size listing) and writes
`stamp` absent — the observation consumed it (#266); every other row's flag re-derives
from this finalize's acquisition; every other row refreshes from that acquisition;
`generated` restamped, `generatedBy: "sweep"`. Finalize touches NOTHING else in
`run-report.json` beyond its existing `drainStats` update — the `reports` half is
written only by the lock-holding UNATTENDED run (schema §run-report.json's writer rule);
the park's own merge (Step 1) already carries the scope counts.
Discard writes no index rows — it appends nothing. Immediately before releasing the lock,
append the `close` record per `assets/shared/usage-log.md`, using that document's outcome
mapping. Do not restate the mapping here.

**Usage log — a fresh attended sweep writes a lockless pair.** This skill takes the C4 lock
at exactly two sites: A0's unattended park and the Finalize/Discard flow above, and those
two write `runId` records. A fresh attended sweep (A1–A6 with no park to resume) writes no
`state/` file — its outputs are `Next_Step_Log.md` under `Accounts/` and the gated `Team/`
publish — so it holds no lock. For the same reason it NEVER writes
`state/log-index.json` (a writer is a lock-holder — schema §log-index.json, #173): its A6
appends are the next pass's changed set, caught by A3.0's size check. The same rule
covers §B's append and a delegate caller's (§C). The fresh sweep appends an
`open`/`close` pair keyed by `passId` per
`assets/shared/usage-log.md` (`mode`: `sweep`): `open` once the config is resolved, the
mode is determined, AND the entry check above has established there is no park to resume —
or the user answered it with "Leave parked, run fresh" — before A1. **Never before that
offer:** Finalize and Discard take the lock and write their own `runId` pair, so an `open`
fired ahead of the offer would leave the `passId` row orphaned on the routine
park→Finalize rhythm, reading as an abandonment of a pass that in fact completed. `close`
as the pass's last action after A6's persistence, using that document's outcome mapping.
Do not restate the mapping here. A failed append is
never fatal — this pass holds no lock and writes no `attention[]`; report it in the run
output and continue.
**Never mint a `runId` to fill the hole**: a runId that names no lock is a fabricated
identifier in a shared file, and two of them would pair `open`/`close` records that never
protected anything. `passId` exists precisely so this pass can be counted without making
that claim — its shape is disjoint from a runId's, so it can never be read as one. The
attended weekly run is PLAN §6's primary adoption metric, and it is now visible (#173).

### A0. Unattended: stage-and-park (#68 — spec 2026-07-21-unattended-sweep-design.md)

An unattended sweep GENERATES everything and PARKS it. The A5 gate — and every output
and persistence write — happens only at a later attended finalize (§A-entry resume).

1. **Probe (C13):** `mcp` tier → the harmless probe read. Green → run A1–A4 from live
   SOQL exactly as attended (dispositions computed per A2's #266 step; decision
   artifacts for in-scope rows only per A4's rule — the same holds on the
   generate-from-history path). Probe fails, or `manual` tier → **generate from history**:
   per-opp log values per A3.0's acquisition (index + delta — this fan-out is pre-lock;
   A3.0's degrade rule applies unchanged), plus the account prose (`Account_Notes.md` /
   `Account_Context.md`) per A4's span-gather rule (unattended: the subagent asks nothing,
   which step 2 below already mandates). Coverage = `partial`; coverageNote = "partial sweep from logs
   as of {dates} — no live pipeline read". Cached data is never presented as live, and
   without an exhaustive base list the output never claims whole-pipeline coverage.
2. **No questions anywhere.** A3.3's batched unknowns are recorded per-row in
   `unknowns[]`; ownership-flagged rows park as flagged, never confirmed.
3. **Park under the C4 lock** — pass `sweep`, full lock protocol by reference to
   workos-sync Step 0.4 (acquire over absent/tombstone, heartbeat, ownership check
   before writes, verified tombstone release, never delete): write the artifact set to
   `state/sweep.json` per the schema — each parked row carries its `scope` (#266). An
   existing unfinalized park is REPLACED
   (regenerable staging), said in the run output. Same write batch: MERGE
   `lastUnattendedRun.sweep` = `{at, localDate (omit when unresolved), surface,
   version (assets/shared/VERSION verbatim, or "unstamped")}` preserving every other
   key, and refresh the parked-sweep `attention[]` line in `tasks.json` as the typed
   `{class: "action", text, source: "sweep"}` record (exact line per workos-sync S7.2's
   derivation; class per the schema README's attention-class table). Same batch: MERGE
   `reports.sweep` into `state/run-report.json` — counts per schema §run-report.json's
   sweep decision-unit mapping (`proposedLine` → `next-step-line`, `closeDateProposal` →
   `close-date-proposal`, `notesBlock` → `notes-block`, park `emailPreview` →
   `email-preview`; `unknowns` = the rows' `unknowns[]` total), `tier` + `coverage` from
   this park, and `scope: {inScope, observeOnly}` counts from this park (#266). Same
   batch: write `state/log-index.json` (schema §log-index.json) — fresh
   values for the changed set, every other row from A3.0's acquisition, the whole tree on
   first-build or after an A3.0 degrade; `generated` restamped, `generatedBy: "sweep"`;
   `logBytes` comes from A3.0's own size listing; each row's `stamp` flag (#266): the
   changed-set re-read's verdict for changed rows (a live `Surface: next-sweep` after the
   last `sweep`-headed entry ⇒ `true`), the prior index row's flag carried forward for
   every other row; this batch appends no observations, so nothing clears here — the park
   appends no logs, so those sizes are current at write. The board is NOT rebuilt here — sync and tidy own board
   rebuilds; the due-day morning sync surfaces the park (spec §6b).

3a. **Usage log (open):** Immediately after the lock is yours, append the `open` record per
   `assets/shared/usage-log.md` (`mode`: `sweep`; `runId` = this pass's lock runId). A failed
   append is never fatal — one `system` line in `attention[]`, and the pass continues.

   The ad-hoc single-opportunity mode (§B) takes no lock and has no runId; it writes a
   `passId`-keyed pair of its own (§B step 0).

4. **Nothing leaves:** no paste block, no mail draft (an external mailbox write waits
   for the gate), no `Next_Step_Log.md` observation, no Team/ publish. Run output:
   the header line, rows parked, tier + coverage, unknowns count, replaced-park note
   when applicable, any A3.0 degrade or dropped-row line, and the §RUN_REPORT line per
   `assets/shared/unattended-execution.md`.
   Immediately before releasing the lock, append the `close` record per
   `assets/shared/usage-log.md`, using that document's outcome mapping. Do not restate the
   mapping here. Release the lock as the final action.

### A1. Enumerate the pipeline (tiered intake)

- **`mcp` tier:** live at run time — the §A1 base query, per SKILL.md's `The §A1 base query and ownership rule` block.
- **`manual` tier (first-class, not a fallback) — the intake manifest:**
  1. The **open-opportunities report** (pasted screenshot or text export) is the
     **exhaustive base list**. Without it, this is a **partial sweep** — label it as such
     in every output; never claim whole-pipeline coverage from an overlay alone.
  2. Commit / Best Case / at-risk-renewals reports are **overlays** — they add forecast
     category and renewal-risk status to base rows.
  3. **Deduplicate** by opportunity number; else by account + opportunity name.
  4. Report coverage once, up front: "{N} opportunities read, {M} rows unreadable/missing
     fields" — then proceed; don't interrogate row by row.
  5. Record provenance (`source: pasted report, as_of: {today}`). No per-line
     "unconfirmed" disclaimers — at this tier the pasted report IS the authoritative intake.
- Ownership: the ownership rule in SKILL.md's `The §A1 base query and ownership rule` block applies to every enumerated row.

### A2. Classify and bucket every row

- **Quarter bucket** from CloseDate + `{fiscal_q1_start_month}`: current / next / later.
- **Class**, by precedence: (1) an explicit report or Salesforce field (the at-risk-renewals
  report, ForecastCategory, record type) → (2) configured name patterns (true-up, rebill,
  VRS, renewal) → (3) ask, once, batched. **Never infer "at risk" from an opp name alone.**
- No-track administrative opps are exempt from step-language rules, **never** from
  close-date checks. Renewals get their own bucket — leadership inspects them separately,
  so they are never silently skipped.
- **Scope disposition (#266) — computed once, after A3.0's acquisition and the per-row
  checks A3.1/A3.5 have run for every row (they are scope INPUTS and force rows
  in-scope; A3.2/A3.3/A4 consume the result; promotion is monotone, nothing demotes):**
  every enumerated row gets `scope: in-scope | observe-only`. **In-scope iff ANY of:**
  bucket `current` · bucket `next` AND the run date falls in the final calendar month of
  the current fiscal quarter (quarters are month-aligned from
  `{fiscal_q1_start_month}`; the final month is the one immediately before the next
  quarter's start month) · an A3.1 close-date violation · an A3.5 material change · no
  prior log observation (first sighting, any quarter) · a live `Surface: next-sweep`
  stamp, read per A3.0's precedence (the fresh tail read governs rows in this run's
  changed set; the index row's `stamp` flag governs every other row). Everything else —
  `later` rows and out-of-window `next` rows with nothing meaningful — is
  `observe-only`. A **full-sweep invocation** (the mode-1 alias) sets every row
  `in-scope`; fresh generation only — the parked-sweep entry offer still precedes A1,
  and a finalize re-derives per its own rule (to run a full pass while a park exists,
  answer that offer with "Leave parked, run fresh"). Both tiers classify identically
  (`manual` derives the same inputs from the pasted report + A3.0's acquired values,
  C7). The class step above runs for every row regardless of disposition — including
  its one batched ask (attended) or parked `unknowns[]` row (unattended) — class feeds
  the renewal bucket and the at-risk footer.

### A3. Hygiene checks per row (the leadership checklist, mechanized)

0. **Log acquisition (A3.0, #233 — ONCE, before the per-row checks; every tier, attended
   and unattended alike):** the per-opp log values the checks below compare against come from
   `state/log-index.json` (schema §log-index.json) plus a delta re-read — never a per-opp
   fan-out while the index is healthy. Ordered:
   1. Read `state/log-index.json` — ONE file read, no lock (a pre-lock read; #137's fix
      class: a direct file read, never model-composed shell).
   2. ONE aggregate size listing over
      `{memory_root}/Accounts/*/01_Opportunities/*/Next_Step_Log.md` — a single tool call
      returning per-file byte sizes, never one call per file.
   3. Diff sizes against each row's `logBytes` → the changed set. Re-read ONLY those logs
      inline; fresh values govern those rows, index values every other row.
   4. A log on disk with no index row (new opp) → read it inline; it joins the changed
      set. An index row whose log is missing on disk → drop the row and say so in the run
      output.
   5. **Degrade, loud (C13):** index absent or unparseable, or the size listing
      unavailable on this surface → full inline fan-out of every enumerated opp's log,
      NAMED in the run output — `log index unavailable — full fan-out ({N} logs read)` —
      never silent, never a hard failure. The first run after ship IS this path; the next
      lock-holding sweep write rebuilds the index (§A0.3, or Finalize's batch).
   6. Acquired values serve ONLY where the log tail is legal to read today
      (`no-shadow-store`'s next-step-history clause; restriction restated at schema
      §log-index.json): the comparison baselines below, A6.2's changed-block composition
      (the `Old:` line verbatim and the Change Type derivation's
      observation-deltas-vs-prior-entry anchor), and A6.2's link Id, and A2's scope
      disposition reads the `Surface: next-sweep` stamp (#266 — a routing marker, never
      deal-state). Current deal-state comes from the tier's authoritative intake, every run.
1. **Past or imminent close date:** CloseDate < today → must be resolved this run (push,
   close, or explicit confirmation); within 7 days → flag for a real decision. Never emit a
   line that ignores a past close date.
2. **Stale / unchanged step — in-scope rows only (#266):** compare the row's current Next Step against this opp's
   acquired values (A3.0: last Observed + last accepted line). Unchanged since the last
   sweep → mandatory-touch.
   Re-dating an unchanged step is activity theater — surface honest options instead
   (escalation step, stall note, close-date move).
3. **Current-quarter Notes fields:** for current-quarter rows — and next-quarter rows in
   Commit or Best Case (the "where appropriate" rule — a future manager-decision schema
   key may refine it; its frontmatter carries no such key today) — track Why NICE / Why
   Now / Approval Signature Process as
   **present / missing / unknown** (they live in the SFDC Notes section; not queryable).
   Unknowns are resolved with **one batched question** covering all unknown rows, never
   one ask per opp. An observe-only row (#266) never generates a Notes ask — its own
   quarter rule already approximates the cut.
4. **New next-quarter opps:** a next-quarter row with no prior log observation → the
   frontmatter `new_next_quarter` key; when a first step is accepted this run it also
   renders as a changed-opp block (the first-step `Old:` variant) per the template's §Body.
5. **Material changes:** stage, close date, or forecast category differs from the
   acquired last Observed snapshot (A3.0) → the frontmatter `material_changes` key, always with
   **old → new** values; stage and close-date deltas also render on the changed-opp
   block's `Change Type` line per the template's derivation (an externally-moved close
   date renders even with no decision this run). A forecast-only delta reaches the
   rollup via frontmatter — the RVP's body format carries no forecast line, and fields
   he did not ask for are never added.

### A4. Generate everything (no approval yet)

For every IN-SCOPE row (#266) needing action, build the actual artifacts using the kernel (§D): proposed
next-step lines (length-verified per §D), close-date change proposals (old → new), paste-ready
Notes blocks for flagged rows (three headings — Why NICE / Why Now / Approval Signature
Process — sourced from `Account_Context.md`, `Account_Notes.md` Strategy Notes, and the
Sphere's Financial Approver / Decision Maker chain, gathered by the span-gather rule: where
this surface offers a context-isolated subagent (probe it, C13), ONE spawn covering ALL
rows the calling site needs (here: the flagged rows; §A0.1: its in-scope rows) — fewest
spawns that fit, never per-account — reads those files and returns the relevant spans
un-summarized, asking nothing (C15 discipline: the spawn never questions, never emits). The
parent selects. No spawn facility → read the files inline: the C13 degrade, named once in
the run output. Drafted from evidence, never invented — thin evidence goes into the batched
question of A3.3), the shared-body preview (per the template's §Body — the email/Team
rendering), and the persistence diff (what will be appended to which logs). **The
persistence diff and the coverage counts stay whole-pipeline (#266): the diff covers
EVERY enumerated row's pending log append, observe-only included — the observation
appends never leave the A5 gate.**

**When the resolved `team_publish` mode is `auto-with-notice`:** run the single voice
pass (per assets/shared/voice-contract.md, A6.2's rules verbatim — locked lines
byte-exempt, scaffolding exempt) HERE, before the preview builds, and compose the
COMPLETE Team/ file — the template's frontmatter filled from the sweep data ABOVE the
voiced shared body — as the preview A5 renders. Render the voice pass's audible line
beside A5's gate (chat output, never part of the written file or the byte-identical
payload). A5's approval is then the approval of
the exact bytes A6.3 will write. At any mode other than `auto-with-notice`, A4 is
unchanged and the voice pass stays in A6.2 (the shipped sequencing).

### A5. ONE consolidated approval — on the real artifacts

Present the sweep table: every IN-SCOPE row as a decision row (#266 — the table header
states the split with the coverage counts: {S} in scope, {N−S} observed-quiet;
observe-only rows appear in the whole-pipeline persistence diff, never as decision rows),
its bucket/class/flags, the **actual proposed line**
(not a description of one), Notes blocks, close-date proposals, the shared-body preview, and the
persistence diff. Structured options per `structured-options`: accept all as-is · adjust
named rows · drop named rows · stop. **One approval pass for the whole sweep** — this is
the `draft-before-write` gate for everything below. **Any adjustment invalidates the
pass: re-render each adjusted row in full (`{OppNumber} — {Opp Name}`, the revised
line/Notes block) with the gate question in the same turn before persisting
(`render-before-gate`) — and when the mode is `auto-with-notice`, an adjustment or drop
ALSO re-renders the updated complete-file preview with the re-gate (the published bytes
are always the approved bytes) — "one approval pass" means one gate per content-version of the
sweep, never an approval against a stale render.** "Adjust named rows" may name an
observe-only opp (#266): run §D generation for that row at adjust time (inline context
read — A4's span-gather spawn is not re-run for one row), set it in-scope for this pass,
then this same adjustment flow applies unchanged — full re-render with the re-gate in the
same turn, the coverage counts re-rendered, and at `auto-with-notice` the complete-file
preview re-rendered. (The Team/ publish step in A6 follows
the recorded `team_publish` mode — its own question only when `gated`.)

### A6. Emit three outputs, then persist

1. **Paste block** — accepted lines, close-date changes, and Notes blocks, grouped by
   account, ready to paste. **No write path to Salesforce exists at any tier — never claim
   otherwise.** Lines are marked `approved for paste`; if the user later confirms they
   pasted, the log's CRM status may be upgraded to `user_confirmed_pasted`.
2. **Manager email** — probe for a mail-draft capability (ms365 `outlook_create_draft` or
   equivalent); if present, create the draft to `{manager_email}`; if not, emit copy-ready
   subject + body and continue. Structure: subject + salutation, then THE SHARED BODY — built once per the template's
   §Body (assets/shared/team-update-template.md): the template's coverage line (with the
   partial clause whenever A1's partial rule applies — the template owns the line's shape)
   · one block per CHANGED opp in the RVP's per-opp format, in the template's account
   sections, per its ordering rule — the header link from the cached Opportunity Id
   (resolved per A3.0's acquisition — a changed log's fresh read, otherwise the index row's
   `lastKnownId`; either way the log's most recent non-`unknown` Observed `Id`, the ONE log
   segment legal to read back per `no-shadow-store`'s identity clause) plus `{sfdc_instance_host}`,
   rendering plain per the template's link rule when either is missing, never a fabricated
   URL; a dark-probe session or an mcp→manual downgrade still renders cached links —
   identity is not capability · Change Type per the template's derivation anchors (this
   pass's accepted lines and close-date decisions, plus observation deltas vs the prior
   entry — never Observed-vs-prior-Observed) · Old = the log's last accepted line verbatim,
   New = this pass's accepted line verbatim (locked lines byte-untouched; an unchanged step
   on a changed opp collapses to the template's `**Step (unchanged):**` line) · the loud
   unlinked-opps line when the template's rule says it renders · the open-items footer,
   including every at-risk kept renewal by name. Unchanged opps are omitted — the coverage
   line counts them; `Reason:` stays persisted in the log and leaves the rendered body. The
   canonical body ≡ the Team/ file; the email is a mechanical RENDERING of it per the
   template's email-rendering contract (draft path converts all markdown, HTML when
   supported; copy-ready fallback renders links `{label} ({url})`, bold labels render as
   plain text, `##` headings as bare lines, and bullets as `-` with two-space indents —
   no markdown pastes as literal characters). At a parked-sweep
   finalize, this same composition runs AT FINALIZE TIME by the running bundle — the
   parked `emailPreview` is machine staging, superseded at finalize, never presented as
   the gated artifact (`render-before-gate`: a park is never a prior render).
   At any mode other than `auto-with-notice`, before composing further, run the voice
   pass per assets/shared/voice-contract.md (in-chat
   as the shared body's destination; block scaffolding is exempt structure — extended by
   name to the per-opp block's bold labels (`**{OppNumber} | …**`, `**Change Type**`,
   `**Old:**`, `**New:**`, `**Step (unchanged):**`), the `## {Account}` section
   headings, and the bullet markers, and link markup: tell 4's bold-count
   never strips the RVP's own mandated markup) ONCE on the
   shared body, and render its audible line with the output; the subject + salutation take
   their own voice pass (plain-text-paste). The locked
   next-step line itself is exempt — byte-identical before/after the voice pass
   (locked-next-step-format.md stays sole authority). Draft only; the user sends.
3. **Team/ publish (the recorded mode, last):** frontmatter is machine data for the
   rollup (the parse contract, PLAN §4.4 — keys unchanged) and is NEVER voice-passed,
   at any mode. Per Step 0's resolved mode:
   - **`auto-with-notice`** (trigger `ns-confirmed`, absent ≡ the same): the complete
     file was A4's preview and A5 approved it. PROBE the destination first (C13) —
     the probe validates the path rule before reachability: the FILE's
     `team_publish_folder` resolved under `{memory_root}` — unreachable or
     absent → skip with the reason said, never create the path, never a success
     notice. Probe green → write the approved render to
     `{memory_root}/{team_publish_folder}/{YYYY-WW}_update.md` (write-your-own-
     subfolder only; overwrite the same week's file, never another week's) with NO
     question, then emit ONE line:
     `Published week {YYYY-WW} to Team/ (auto — per manager-decision.md; say 'switch publish to gated' to change)`.
     The switch phrase's v1 handler renders the
     hand-edit instruction (the file, the key, the legal values) — never an engine
     write.
   - **`gated`**: today's behavior — compose the complete file: the template's
     frontmatter filled from the sweep data above THE SAME shared body A6.2 rendered
     (the canonical body, byte-identical below the frontmatter — the email was its
     mechanical rendering; never re-composed; voiced in A6.2 per the shipped
     sequencing). Re-render the body pass's audible line beside the gate question
     (voice-check lines are chat output, never part of the written file or the
     byte-identical payload). Then render the file and ask in the same turn
     (`render-before-gate`): "Publish this week's update to `Team/`?" On yes, write
     it to the same path with the same rules.
   - **`off`, file absent, or any Step-0 skip state**: skip this step and say why —
     the email is the fallback channel until the decisions are recorded in
     `{memory_root}/manager-decision.md`.
   A park's finalize runs this step from the FINALIZE-TIME A4/A5 render (a park is
   never a prior render) — under `auto-with-notice` that render was the complete
   file, and publish fires from it.

**Persist — one observation per enumerated opp, every sweep** (this is what makes next
week's A3 checks possible), appended to
`{memory_root}/Accounts/{Account}/01_Opportunities/{Opp}/Next_Step_Log.md`:

The entry grammar and writer rules are SKILL.md's `The §A6 entry format — grammar and writer rules (Next_Step_Log.md)` block — they apply here verbatim.

