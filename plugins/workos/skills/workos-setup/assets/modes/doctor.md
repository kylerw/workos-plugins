# §C. doctor — diagnose, never modify; the usage log is doctor's one new write
Reached only via workos-setup SKILL.md mode 3 — never runs standalone; Role, C11, and the anti-patterns apply.


Run every check; print one line each; **a check that cannot run prints SKIP and the summary
is "issues found," never green-with-asterisks** (C13):

1. **Memory root:** config resolves; root reachable; the canonical folders exist
   (`{library_path}` is OPTIONAL taxonomy — judged only by its own sub-bullet below,
   never by the canonical-folders requirement); OneDrive hydration spot-check (read one
   file; if placeholders/failures → name the "Always keep on this device" fix).
   - **Library (optional):** resolve `{library_path}` (default `Library`). No folder, or
     a folder without `INDEX.md` → one info line ('run `init my workspace` to add the
     Library taxonomy'), NOT a finding. `INDEX.md` present → the TEMPLATE-HEADER PRESENCE
     check: exactly one occurrence of
     `| Title | Canonical URL | last_verified | why_kept |` immediately followed by its
     delimiter row, outside comments (line-ending/whitespace-normalized compare). Header
     entirely ABSENT but file present → finding WITH the one decidable C11-gated offer:
     insert header + delimiter at the top (below the comment block if present, above
     existing rows — additive). Any messier malformation (wrong location, duplicates,
     mangled delimiter) → finding that NAMES the expected two lines, NO repair offer
     (never overwrite user content).
   - **Intake (required root shape):** `{memory_root}/Intake/` exists AND
     `intake_sources` carries THE mandated entry — label `intake`, `kind: staged`, path
     resolving to `{memory_root}/Intake` (any other staged entry does not satisfy this
     check). Either missing → FINDING naming
     the exact gap ("`Intake/` missing" / "`Intake/` present but unregistered — no
     `staged` entry in `intake_sources`") with the fix: run `init my workspace` (a full
     re-run — additive and idempotent; this is the migration path for roots configured
     before the folder existed). Both present → one ok line.
2. **Config completeness:** every `identity.schema.md` key present or explicitly defaulted
   **and type-conformant to the schema** (e.g. `fiscal_q1_start_month` is an integer 1–12 —
   a stored "January" is a finding; live catch 2026-07-16); name the missing/malformed ones
   and which skill degrades without them. **`scheduled_task_ids`/`board_queue_tool` are
   type-conformance-only: checked when present, never flagged for being absent** (their
   schema rows name absence as the rung simply not existing yet). **`boilerplate_schema`
   is the same: checked when present, never flagged for being absent here — §C.5 owns its
   currency**, and reporting it in both places would bill one fact twice with a remediation
   this check cannot give (the key is engine-stamped, not asked). **`sfdc_instance_host`
   is per-key TIER-conditional (the `scheduled_task_ids` pattern, tier-gated):** absent →
   a finding ONLY when `sfdc_tier` = `mcp` AND no `sfdc-instance-host` decline is
   recorded — name the degradation (weekly-summary opp links render plain) and the fix
   (the setup question flow); at `manual` tier, or with the decline recorded, never
   flagged. The fix is always the
   setup question flow, never a hand-edit (C2). **Ownership boundary: `core.md` is all-generated — validate it
   strictly (personal prose inside it = a finding: offer the A2 split — EXCEPT sections
   carried on record, `coremd-move:*` keys, which fold into the carried-sections INFO
   below, never a finding). `user.md` is user
   space — NEVER validated, parsed, or reported on beyond "present/absent". Root
   `CLAUDE.md` should import `@core.md` + `@user.md`, plus `@voice.md`/`@workspace.md`
   when those files exist; a missing import for a present file is a one-line finding
   (fix: add the import beside `@user.md`, per Mode 4's idempotent rule).
   `workspace.md` gets `user.md`'s never-parse treatment (present/absent only, NO
   carve-out): absent → INFO, never a finding — `workspace.md not created — run "init
   my workspace" to add it`. Sections carried on record — `claudemd-move:*` /
   `coremd-move:*` decline keys → ONE INFO line naming the count — and a recorded
   `sfdc-instance-host` decline when present — with the
   `let me re-decide` reopen phrase — never a finding. The line renders whenever either exists — zero carried sections with a recorded decline still names the decline. `voice.md` (optional equipment, never required — `user.md`'s
   never-parse treatment with exactly ONE exception, the #85 carve-out: doctor may read
   the file's FIRST TWO LINES only, looking for the `pristine-template marker` line or a
   dated `derived {YYYY-MM-DD} from {n} sends` header — never rule content): present AND
   imported → one ok line, plus at most one INFO nudge — an OFFER, never a run, claiming
   only what those two lines showed, and carrying its own off-switch in its text:
   marker line present → `voice.md still carries the pristine-template marker —
   say "build my voice file from my mail" to derive it from your own sends, or delete
   the marker line to take ownership and silence this nudge` · a `derived` header dated
   more than 60 days before the surface-provided date → `voice.md last derived {date} —
   say "voice drift check" to see what's changed; pasting its refresh block resets this
   60-day clock, and removing the dated header makes the file ageless (never nudged)` ·
   neither line in the first two lines (hand-authored — age unknown) → no nudge, ever ·
   a fresh `derived` header → silent.
   Absent → INFO, never a finding — `voice.md not seeded — say "seed my voice file"
   (optional equipment)`. Present but NOT imported → a finding, one-line fix: add
   `@voice.md` to the root CLAUDE.md import line beside `@user.md`.**
3. **Integrations:** probe each configured one with a harmless read (C13). **Probe
   evidence is scoped to THIS doctor run (#156): a verdict may cite only a call made
   during this run.** Activity earlier in the conversation, in a prior pass, or in
   another skill is NOT evidence and never yields `ok` — re-probe unconditionally even
   when this session already exercised the integration; that cost is the point of the
   check. No probe possible → SKIP with its reason stated, never `ok`. Split the
   result (#57 — session scope is not misconfiguration): **configured, not exposed on
   THIS surface (a session with no MCPs at all — expected on some surfaces)** → INFO,
   never a finding; **exposed and reachable but refused by policy** (an authorization or
   entitlement refusal — the connector answers, and its answer is "not permitted here") →
   FINDING, quoting the refusal **verbatim including any support reference**, which is
   the only actionable content the user has; **configured and failing where the surface
   should expose it** → FINDING, "configured but not responding." Close the check with ONE
   INFO line naming its own scope and the way out — report-only, never an offer, never a write:
   `integrations probed this run: {list} — say 'let me pick integrations' to narrow the
   recorded set` (#201; a config already carrying connectors adopted before the delta gate
   existed stays that way under #124's retention, so the line that reports the probing carries
   the remedy — the same rule §A2's integrations line follows).
4. **Salesforce tier sanity:** `mcp` tier → the probe read works on a surface that
   exposes MCPs. Apply check 3's split here too, all three outcomes: no MCPs exposed on
   this surface → INFO; refused by policy → FINDING quoting the refusal;
   configured-and-failing where it should exist → FINDING. The tier-change
   recommendation is reserved for the configured-and-failing case only — never suggested
   off a session-scope INFO **and never off a policy refusal, which is an access problem
   rather than a configuration error** (C2 forbids downgrade on absence alone).
   `manual` tier → say what that means (pasted reports are the
   intake — expected, not an error).
5. **Engine version:** per `assets/shared/version-check.md` — INSTALLED = this bundle's
   VERSION (the authoritative fact); LATEST = `Team/_engine/latest-version.txt` (unreachable
   → "latest: unknown"); installed ahead of latest → report "beacon behind; your next sync
   heals it" — never write it here (doctor diagnoses; sync owns the bump). A version
   recorded in core.md only marks when setup last ran — if the bundle is newer than
   core.md's record, say "config written by {M}; bundle is {N} — fine unless release notes
   say config fields changed", never "update available".
   **Boilerplate currency — the mechanical half (#112):** compare core.md's
   `boilerplate_schema` against the bundle's current value
   (`assets/shared/identity.schema.md`; ABSENT ≡ `0`). Equal → silent. **Lower** → a
   finding naming the delta from that file's changelog table — never a guess, never the
   whole boilerplate list: "core.md's generated boilerplate is schema {M}, bundle ships
   {N}: missing {the rows for values M+1 … N}. Fix: re-run `init my workspace` — core.md is
   engine-owned and regenerated whole, and your `user.md` / `voice.md` / `workspace.md` are
   untouched." **Higher** (core.md written by a NEWER bundle than the one running) → not a
   core.md problem: "core.md was written by a newer bundle (schema {M} vs this bundle's
   {N}) — this surface's WorkOS bundle is behind; update it, then re-run doctor." This is the thing the engine-version comparison above could never tell you: a
   version gap says setup ran a while ago, which is usually fine; a schema gap says a
   specific generated section is missing, which is not.
6. **Team/ publication:** shortcut present? user's subfolder writable? manager-decision
   file recorded? File present → one line
   `team_publish: {mode} (decided {decided_on} by {decided_by})` +
   `ns_rubric_status: {value}` reported verbatim, never enforced; a report-only INFO
   when the file's `manager_name`/`manager_email` differ from the config (named, never
   a finding); plus a DRIFT flag when the config's `team_publish_folder` differs from
   the file's (fix: re-run `init my workspace` — setup re-records the copy). Each absent one maps to the Day-1 guide step or the pending manager-decision item. **Fresh-install rule (#32): an unset publish gate on a root with no prior Team/ updates is INFO, not a finding — one line: "publish gate unsettled — it settles via the manager-decision file; the weekly sweep's A6.3 gate skips (with the reason said) until then."**
7. **State layer:** `state/` exists; JSON parses; the writer's lock is a released
   tombstone (`released: true` — FREE, healthy), absent (also fine), or one live lock
   (stale live lock → name the recovery step from the recorded spike design, quoting the
   lock's own `{pass}/{surface}` and `{startedAt}` as "last alive" — heartbeats rewrite
   it). `state/` missing
   entirely → the finding says exactly: *"state/ is the engine's operational baseline —
   the first `sync my day` scaffolds it"* — never "only relevant if you use the board"
   (live mis-framing 2026-07-16). **A LIVE lock whose
   `startedAt` predates `lastFullSync`/`lastTidy` is an ORPHAN** (a pass claimed release
   and failed — live defect 2026-07-16), but offer the orphan repair ONLY when
   `now − max(lastFullSync, lastTidy)` exceeds a 5-minute grace window (a Tidy mid-close
   is exactly as trippable as a sync mid-close, and keying to `lastFullSync` alone left
   it exposed when that stamp was hours stale) — inside it, report "possible
   orphan OR a pass mid-close — re-check shortly" with NO repair offer (#57 field
   evidence: a live pass showed heartbeat 21:40Z → state write 21:45Z → release 21:52Z;
   snapshotting at 21:45 read the pre-release gap as the orphan signature). Past the
   window: name it, and offer the one-step fix (add
   `released: true, releasedAt: now` to the existing lock object — an ordinary write,
   works on every surface where delete does not) as a question (C11) — an offered-action
   finding (the gated offered-action pattern — used only where a future pass otherwise
   blocks, or a create-only scaffold leaves no other remedy: the scheduled-task and
   Library-header offers follow it), because a future pass blocks on it. On approval,
   re-read first: still the exact lock reported → write the tombstone; anything else
   changed underneath → abort and re-report, never repair a lock you didn't diagnose
   (the re-read guard stays regardless of the grace window — it is what caught the
   false positive in the field).
8. **Approvals-queue audit (#50) — STATE-BASED:** for every id with a `raised` pointer in
   the current + prior month's journal (**latest pointer per id governs** when an id has
   several), classify against current STATE — the queue is authority, the journal is the
   audit trail (schema §pendingApprovals):
   - **Healthy** (no finding): live in `pendingApprovals` with no exit pointer · OR an
     `applied`/`retired` exit and not pending · OR a `declined` exit AND a matching
     `suppressed.approvals` entry (hygiene kinds).
   - **"approvals queue shrank without a recorded resolution (stale-bundle run? — see the
     scheduled-task check)":** no exit pointer, not pending, no suppression.
   - **"crashed decline (half-recorded)":** a declined-hygiene exit without its suppression
     entry, or a suppression entry without its declined exit. (hygiene kinds only — a
     declined INTAKE-kind item's mate is its `suppressed.intake` LEAVE record, not a
     `suppressed.approvals` entry; match by the item's target)
   - **"exit recorded but item still queued (crashed pass — item remains live)":** any exit
     pointer while the id is still in `pendingApprovals`.
   Additionally: any `suppressed.approvals` entry whose kind is not
   `hygiene-move`/`hygiene-drop` is a finding — "non-hygiene suppression entry —
   hand-edited?" (merge-purge ignores it; schema §pendingApprovals).
9. **Scheduled tasks (live-test gap 2026-07-16 — doctor previously never looked):**
   **FIRST, can this surface see a scheduler at all?** (#112) No task-listing capability
   exposed this session → a **loud SKIP** naming it — "scheduler not exposed on this
   surface; scheduled tasks NOT checked — a task may exist in another surface's
   scheduler" — and the whole check ends there: no finding, and **no create offer**,
   because offering to create a task that may already exist elsewhere manufactures the
   double-run this check exists to prevent. An EMPTY task list from a scheduler that IS
   exposed remains a real "no conforming task" result and proceeds normally; the two are
   not the same observation and are never reported the same way (C13
   `presence-is-not-capability`).
   Otherwise: **match by PROMPT CONTRACT, never by task name** — a conforming sync task is one
   whose prompt contains both `sync my day` and the literal `(scheduled, unattended)`
   marker (same contract, `weekly next steps`, for the next-steps task if opted in).
   A task named anything ("daily-kickoff", "morning run") does not count unless its
   PROMPT conforms (live false-green 2026-07-16: doctor blessed predecessor
   kickoff/wrap holdovers by name). No conforming task → a finding + the C11-gated
   offer to create it ("create a scheduled task — do not run it now — weekdays
   ~7:00 AM, prompt exactly: `sync my day (scheduled, unattended)`, permission mode
   Auto — Manual stalls unattended runs") — creation is a
   modification, so never silent. **Additionally: any enabled task whose prompt carries
   legacy pass vocabulary (kickoff / wrap / start my day / close out) WITHOUT the
   unattended marker is its own finding** — those words route into the sync skill as a
   FULL ATTENDED pass with nobody watching (stalls on questions; a wrap task
   double-syncs the day). Recommend the user pause or delete them in the platform UI;
   doctor never touches them. **Additionally (#138) — permission mode, judged PER
   TASK:** for each conforming task, when the scheduler exposes that task's permission
   mode, **any visible mode other than Auto is a finding, naming the mode** — Manual
   (the platform default) stalls an unattended run indefinitely at its first unapproved
   tool call (no timeout, no auto-deny; a stalled run holds its slot with nobody
   watching), and any other approval-capable mode fails the same way, so the task
   structurally cannot honor the `(scheduled, unattended)` marker it carries: recommend
   setting the routine to Auto in its edit form; doctor never modifies it. A conforming
   task whose mode is not exposed → one line naming THAT task, "permission mode not
   visible for {task} on this surface — NOT checked" (C13), never silently skipped and
   never widened into a claim about tasks whose mode WAS visible.
   **Additionally (#68): (a) NO conforming sweep task → one
   INFO line + the C11-gated offer to create it by A6.2's exact due-day recipe (ask the
   due day; previous business day 5:00 PM); never-re-offer holds ONLY when a prior
   decline is RECORDED (core.md's `declined_offers:` line, §A6.2) — with no such
   record, doctor is diagnose-never-modify and sessions are memoryless, so offering
   again is correct, not a nag (#70). The record is per-offer-key — re-offer happens
   ONLY when the user asks or the key's precondition changes. **The offer must SAY that
   (#112):** declining here suppresses nothing — this offer has no write path, so the next
   run asks again — and the way to stop being asked is to decline the same offer during
   `init my workspace`, which records the key. Never word it so a decline here reads as
   remembered; a user who declines three times and is asked a fourth should have been
   told the first time why. (b) A conforming sweep
   task scheduled at the SAME minute as the sync task is a finding — "lock contention:
   one run will exit; offset the sweep (recipe: previous business day 5:00 PM)." (c) A
   conforming sweep task with NO `lastUnattendedRun.sweep` entry after its first
   scheduled day → "the task may be executing a pre-sweep bundle snapshot — offer
   (C11-gated) to re-create it (#52)."**
10. **Last unattended runs (#52/#67/#68) — report-only, never a finding by itself:**
    for EACH key of `state/tasks.json → lastUnattendedRun` ({sync, sweep, intake}): one line,
    values verbatim: `last unattended {key}: {at} ({localDate}, or "no local date") on
    {surface} — bundle {version}`. Empty/absent map → `no unattended runs recorded
    yet` (informational). When an entry's {version} differs from THIS bundle's
    `assets/shared/VERSION` (compare per version-check.md ordering; unordered values →
    report both verbatim, no comparison), append: ` — differs from this bundle
    ({installed}); the scheduled task may be executing a stale snapshot (#52)`.
    Additionally: `state/sweep.json` holding a park older than 7 days → one INFO line
    naming its age and the resume offer. An `intake.json → parked` older than 7 days
    gets the same INFO treatment — one line naming its age and the resume offer:
    `parked intake manifest from {date} — {N} days old; say 'run intake' to finalize` —
    an offer, never a run.
11. **Run reports (#206) — report-only except freshness:** `state/run-report.json`
    absent → one line, `no run reports yet` (informational — the first eligible
    lock-holder creates it; setup never scaffolds it). Present → validate against
    schema §run-report.json; a validation failure is a finding naming the first error.
    Then one line per pass in {sync, sweep, intake}: the entry's
    `{outcome} {at} ({localDate}) — auto {n} · queued {n}` verbatim, or an honest
    `no {pass} report recorded` line. **Freshness (the wedged-schedule catch) — judged
    on COMPLETIONS, never on presence:** `reports` holds the latest run per pass, so a
    pass that blocks every night refreshes its date without ever completing. For a pass
    with a recorded `scheduled_task_ids` entry, three findings, in this order:
    (a) no entry for the pass → FINDING "scheduled {pass} has no completed run on
    record — if the task was created since the last run this clears itself; otherwise
    check the platform's run history"; (b) the entry's `outcome` is `blocked` →
    FINDING "scheduled {pass} last BLOCKED on {localDate}: {blockReason} — it has not
    completed since" (fires at any age; a fresh date on a blocked entry is the failure
    this check exists to catch); (c) `outcome` is `completed` but `localDate` is older
    than the pass's threshold — sync > 4 days, sweep > 8 days — → FINDING "scheduled
    {pass} hasn't completed since {localDate} — the task may be stalling, yielding, or
    dead; check the platform's run history." When an entry carries no `localDate`,
    judge freshness on the date part of `at` instead. Presence is not health.
    **Promotion candidates (INFO, never an offer):** each `drainStats` class with
    `drains ≥ 10` and `declined = 0` → one INFO line:
    "class '{queueClass}': {drains} decided drains, 0 declines — AUTO-promotion
    candidate (per C15 — routing in
    `assets/shared/unattended-execution.md` §Promotion)".
12. **Scheduled capture guard (#206):** apply check 9's scheduler-visibility rule
    first — not enumerable → the same loud SKIP wording, and this check ends. Otherwise
    any enabled task whose prompt invokes capture ("log a call", "capture the meeting",
    or the skill by name) together with the `(scheduled, unattended)` marker is a
    FINDING: "scheduled capture will refuse every run (C15 — capture is not an
    unattended pass); pause or delete the task in the platform UI." Doctor never
    touches it.

**At the close of the run, append the `doctor` record** per `assets/shared/usage-log.md`:
`counts` from this run's tally, `checks` as check id → verdict, `integrations` as
connector → verdict (including `refused` for a policy refusal, per check 3; keys come
from that document's closed vocabularies — an unlisted connector logs as `other`).
**Verdicts only — never finding text.** Findings routinely name accounts; the log has no
field that would hold one.

Output ends with: `doctor: {N} ok · {M} findings · {K} skipped` + the shortest fix list,
ordered by what blocks the most.

