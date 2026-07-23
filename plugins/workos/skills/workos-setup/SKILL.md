---
name: workos-setup
description: >
  The WorkOS on-ramp and health check. Jobs: initialize a workspace ("init my workspace" —
  scaffolds the memory root, builds the identity config from connected tools, seeds the
  first accounts; say "in floor mode" to force the O365-only floor, or
  "let me pick integrations"), initialize or back-fill one account ("init {account}" —
  additive-only, never overwrites), seed voice.md alone ("seed my voice file"), derive it
  from your own sent mail and chats ("build my voice file from my mail" — replaces only
  the untouched template, else a copy-ready block), check it for drift
  ("voice drift check" — summary + a copy-ready update block, never a write), and diagnose
  ("check my setup", "doctor" — probes every configured integration, verifies the memory
  root, reports installed vs latest version). Existing files are read-only, never
  bulk-moved. Works from Cowork at the Office 365 floor. Draft-before-write throughout. DO
  NOT attempt without loading — it enforces the config schema, invocation modes, and the
  brownfield rules.
---

# setup — the WorkOS on-ramp (L1) + doctor

## Role

You stand up a teammate's WorkOS memory, generate their config, and diagnose their install.
Additive, idempotent, boring on purpose. Contracts by number (`assets/shared/` carries the
injected resources): C1 engine-memory-split · C2 identity-config · C5 draft-before-write ·
C7 salesforce-read-only-and-optional · C11 structured-options · C13
presence-is-not-capability · C14 render-before-gate. All examples fictional.

**Bundle location:** resolve every `assets/` path in this file relative to THIS skill's
own folder — the folder containing this SKILL.md. Under direct .skill upload that is
`.claude/skills/workos-setup/` under the session mount; under a plugin install it is the
plugin's skill folder. Never resolve `assets/` in the memory root or project folder.

## Modes

1. **`init my workspace`** — first run for a new user (§A).
2. **`init {account}`** — scaffold or back-fill one account (§B).
3. **`doctor`** ("check my setup") — diagnose, never modify (§C).
4. **`seed my voice file`** — runs §A2's voice.md seed step alone: no memory root, identity
   config, or account work. Seeds `voice.md` from the template when absent, adds
   `@voice.md` to the root CLAUDE.md import line beside `@user.md` when missing; both
   steps idempotent (skip when already present).
5. **`build my voice file from my mail`** — voice bootstrap (§D): derive voice.md from the
   user's own sent mail + Teams chats. May REPLACE the file only when it passes the
   two-part pristine test in `assets/shared/voice-contract.md` §5; every other state —
   user-edited, bootstrap-written, cross-version template, or absent — ends in a
   copy-ready block.
6. **`voice drift check`** — compare the user's recent sends against the current voice.md
   (§E): audible summary + ONE copy-ready update block; never a write.

**"Today" comes from the surface-provided date.** Every question is asked through the
platform's structured-question tool so the options are SUBMITTABLE — a prose-rendered
"1. … / 2. …" list is not C11-compliant (live finding 2026-07-16, both setup and sync).
Every question follows C11 (structured
options, default first, ≤4, escape hatch).

---

## §A. Workspace init — zero → seeded memory

### A1. Locate or create the memory root

Ask where the memory root lives (structured options: the detected likely candidates — an
existing `WorkOS/`-named folder in the mounted project, the mounted project root itself, or
"somewhere else — I'll point you"). Root **name is whatever the user has** — `WorkOS/` is
only the default for brand-new roots (C2). Record path + name for the config.
**Cowork note:** the session must run in a project pointed at this folder (the Day-1 guide's
step 1) — if file access prompts on every touch, say so and point at the guide step.

### A2. Generate the identity config (the question flow — C2)

**Integration mode comes from the INVOCATION, not from a questionnaire.** Connecting a
connector was the user's consent — platform permissions govern tool access — so the default
path never re-asks and never runs pre-verification probes (first real use reveals failures;
`doctor` owns diagnostics). Three invocation modes:

- **Default** ("init my workspace"): adopt what the surface exposes. Enumerate the visible
  tools (no calls needed to list them) → `integrations` = the exposed set; `sfdc_tier` =
  `mcp` if Salesforce read tools are exposed, else `manual`.
- **Floor / new-user-test mode** ("init my workspace in floor mode", "…as a floor user",
  "…test mode"): force `sfdc_tier` = `manual` and `integrations` = `[ms365]` regardless of
  what exists, and use NO other connector for the rest of the run — this is how a power
  user simulates a teammate's floor, and how the clean-room test runs. Never offered as a
  question; it exists only when explicitly invoked.
- **Custom** ("…let me pick integrations"): present the enumerated list as one structured
  pick (C11). For users who keep personal connectors they don't want a work skill touching.

The chosen set is echoed inside the single config confirmation below ("integrations:
{list} — rerun setup with 'let me pick' to change"), so the default costs zero questions
and the record is still explicit.

1. **Identity — derive if a Graph/directory connector is in the active set, else ask.**
   The org-deployed "Graph - Production" MCP (get-current-user / get-user-manager /
   search-users) is a separate connector — NOT part of O365; not everyone will have it.
   With it: pull display name + mail and manager name + mail, present as **one
   confirmation** (C11: "Confirm your identity config — name: …, initials: …, manager: ….
   Correct?"). Without it: ask `user_name`, `initials`, `manager_name`/`manager_email`
   directly in one structured pass, no mention of what's missing. Always allow correction
   (Salesforce owner-column spelling may differ from directory displayName — say so if the
   user edits).
2. `fiscal_q1_start_month` — one question, once.
3. `timezone` — one question, once (C11): with `ms365` in the active set, read the
   mailbox timezone (probe, C13) and offer its IANA equivalent as the default option —
   preselect ONLY when the mailbox value maps uniquely to one IANA zone (CLDR
   windowsZones mapping, region from the mailbox locale); ambiguous, regionless, or
   unrecognized → candidates WITHOUT a preselected default; alternates derived from that
   mailbox/locale, plus 'somewhere else — I'll type it'. No mailbox zone readable → NO
   pre-selected default: the user picks or types (a fabricated zone is worse than asking
   — a wrong-but-confident zone silently mis-files screenshot correlation). IANA form
   always; never derived from `user.md`.
4. `team_publish_folder` — if the shared `Team/` shortcut exists in the root, confirm the
   user's subfolder (`Team/updates/{user_name}`); if not, note it as a Day-1 guide step and
   leave unset (the publish gate stays off until it exists).
5. `intake_sources` — optional, one question (C11), default is skip: "Configure
   file-intake sources (screenshots / downloads folders)? 1. Skip for now (default —
   asked again next init; correlation and intake stay off) / 2. Add my screenshots
   folder / 3. Add screenshots + downloads." On 2/3 collect each path (or mounted
   folder name on a managed surface) as typed — never guessed — and record entries
   with `kind`; each entry's `label` derives from the folder name (unique-ified,
   confirmed in the same pass); the escape option "my screenshots aren't named like the
   default" collects a `pattern` template (the schema's literal-token grammar).

**Write the four-file config layer after the confirmations** (draft-before-write; schema:
`assets/shared/identity.schema.md`). Ownership is by FILE, never by section:

- **`core.md` — wholly engine-owned.** The generated config block plus generated engine
  boilerplate (write-routing table, operating invariants, and the **ad-hoc voice hook** — the
  voice spec §4 fourth emit point: one line telling the model to run the
  `voice pass per assets/shared/voice-contract.md` on any ad-hoc paste-ready chat output,
  surface = plain-text-paste when the text is pasted onward, in-chat otherwise) and NOTHING
  personal. Setup
  regenerates it **whole-file** — which is exactly why no user prose may live in it.
- **`user.md` — wholly user-owned.** If absent, create a short commented stub ("yours —
  voice, identity notes, personal tooling, anything; the engine never writes or parses
  this file"). **If present, never touch it — not on init, not on regeneration, ever.**
- **`voice.md` — wholly user-owned, engine-seeded once.** If absent, seed it verbatim
  from the fenced block in `assets/shared/voice-contract.md` §5 (copy the fenced
  block only, never the whole asset). **If present, never touch it — not on init, not on
  regeneration, ever** (same rule as `user.md`: the user moves their own Voice content
  in; the engine only leaves the template pointer). The template's second line is the
  `pristine-template marker` — part of the verbatim copy, so seed behavior is unchanged;
  its meaning and the two-part pristine test live in `assets/shared/voice-contract.md` §5,
  and §D's bootstrap is their only consumer. This bullet plus §A6's import-line
  addition are Mode 4's full behavior.
- **Brownfield split (gated, C5/C11):** an existing `core.md` (or root `CLAUDE.md`)
  carrying personal prose — voice rules, identity narrative, personal tooling like a
  memory system — gets a **split offer**: show exactly which sections move to `user.md`
  and what the regenerated engine files will say, apply only on approval. Existing
  personal content is MOVED verbatim, never rewritten, never dropped.

### A3. Scaffold the root structure

From `assets/shared/` templates and the memory-structure layout: `Accounts/`, `state/`,
`journal/`, `lanes/` — **create only what's missing** (additive, idempotent). `state/`
gets the four baseline files as empty shapes per
`assets/shared/state-schema/README.md` (`tasks.json`, `meetings.json`, `drafts.json`,
`suppressed.json`) so the daily driver never bootstraps blind (sanctioned by C4's
bootstrap exception — exclusive create that no-ops if the file appears; never an
existing file, and only these four).
`{library_path}` (default `Library`) gets the collateral taxonomy — `INDEX.md` from
`assets/shared/memory-structure/Library-INDEX.md` (its top comment carries the anti-mirror
rule: local copies ONLY for files you open and modify; everything else is an INDEX row
with a link) plus `Templates/ · Pricing/ · Competitive/ · Partner/ ·
Thought-Leadership/` — same additive rules, created only when missing. If the folder
EXISTS, split on its `INDEX.md`: no `INDEX.md` → one C11 question — "1. Adopt — create
INDEX.md here / 2. Different folder name (records `library_path`; user-nominated only —
setup never auto-discovers candidate folders) / 3. Skip for now (session-only — asked
again next init run)"; a CONFORMING `INDEX.md` → adopt silently, no question; a
NONCONFORMING `INDEX.md` → never overwrite, apply the doctor rules (decidable
header-insert offer, else a named finding) — the same three-case split doctor uses.
Present the create-list first (C5). Never
create `Team/` (it's a shortcut the user adds) and never scaffold empty
`Prep/`/`Archive/` folders — that ban covers ON-DEMAND per-meeting folders (they're
created when a meeting needs them); Library's subfolders are FIXED taxonomy scaffolded
once, the same class as `journal/` and `lanes/`.

### A4. Seed the first accounts — top 3–5, not the book

Ask which accounts matter most right now (structured: names the user types, or parsed from
a pasted pipeline screenshot). For each, run §B. **Do not offer to seed the whole book** —
the long tail scaffolds on-touch, when a skill actually needs an account.

### A5. Context seed per selected account (separately gated)

For each seeded account, offer (one question, per C11): a light context pass now — recent
O365 mail/calendar mentions (last 30 days, capped), a pasted Salesforce screenshot of the
account's opps if the user has one handy, HiNotes recents **only if bridged** — drafted
into `Account_Context.md` / `Contacts.md` with provenance (`source/confidence/
last_verified`), approved before writing. Skipping is fine; capture fills these over time.

### A6. Close: instructions, task, what's next

1. **Generate BOTH instruction artifacts, unprompted** (live gap 2026-07-16 — this step
   was improvised until it was asked for):
   - the root `CLAUDE.md` (Claude Code surface) — engine-generated and
     regeneration-safe: it `@imports core.md`, `@imports user.md`, AND `@imports voice.md`
     (personal content lives there, so regenerating this file clobbers nothing) — the
     `voice.md` import is additive/idempotent, added beside `@user.md` only when missing,
     never duplicated — then the folder map and account-folder handoff, and
   - the **Cowork project-instructions paste text** — short: memory root, config lives in
     core.md, the workos skills (sync's vocabulary: sync my day / tidy / build my board /
     rebuild my board; next-steps: run my weekly next steps; capture: log a call /
     capture the meeting; intake: run intake / intake check); legacy
     kickoff/wrap/start-my-day/close-out vocabulary ROUTES to workos-sync — never to
     retired skills, and the filing-rules pointer.
   Tell the user: copy your EXISTING project instructions to a note first (instant
   rollback), then paste the new text into the Cowork project's instructions field.
2. **Scheduled task, by exact recipe — never improvised, never a pair:** offer (C11) to
   "create a scheduled task — do NOT run it now — prompt exactly
   `sync my day (scheduled, unattended)`, weekdays 7:00 AM, enabled." ONE task; legacy
   kickoff/wrap slots are deleted or left dead, never re-enabled (live near-miss: a
   doctor offered to re-enable BOTH holdovers = two full syncs daily). Optional second
   offer — the weekly sweep, anchored to the update's DUE day (#68): ask (C11) "which
   day is your weekly next-steps update due?" (default = the recorded manager-decision
   cadence day when present, else Thursday), then offer to create the task by exact
   recipe — "do NOT run it now — prompt exactly `weekly next steps (scheduled,
   unattended)`, scheduled the PREVIOUS BUSINESS DAY at 5:00 PM, enabled" (due
   Thursday → runs Wednesday 5:00 PM; due Monday → Friday 5:00 PM). A decline is
   written into core.md's setup record — a `declined_offers:` line listing offer keys,
   preserved across regeneration per the schema row (`assets/shared/identity.schema.md`);
   core.md is engine-owned and regenerated, so this rides the existing generation, and
   C5's normal confirmation covers it. Never at the daily sync's minute — two
   unattended runs contending on the C4 lock means the loser exits, silently costing
   that day's run. Whichever task(s) the platform creates, capture any
   id or reference it returns or displays into `scheduled_task_ids` (`sync`/`sweep`) at
   the config write below — an id the platform never reveals stays absent, never guessed.
3. Report what was created vs already present, write the config, then OFFER the board (C11 — live gap 2026-07-17: the first non-founder install ended with no board offer): "1. Build my board now / 2. Skip — say 'build my board' any time." On 1, hand off to workos-sync's BOARD entry point. Then close.

---

## §B. Account init / back-fill — additive only, always

1. Resolve the name against `Accounts/` (exact → substring → nickname with confirmation;
   `_`-prefixed folders excluded). Existing folder → **back-fill mode**: announce "adding
   only what's missing; touching nothing that exists."
2. Diff against the canonical taxonomy (`assets/shared/` memory-structure): the account
   stubs (`CLAUDE.md` import stub, `Account_Project_Instructions.md` with `{Account Name}`
   substituted, `Account_Notes.md`, `Sphere_of_Influence.md`,
   `00_Account Overview/Account_Context.md` + `Contacts.md`) and the 00–04 folders.
   Create-list = target minus present, **never** a path that already exists.
3. Present the create-list (C5), write on approval, report created vs skipped-as-present.
4. **Brownfield rule (the part that keeps trust):** existing documents are read-only
   inputs. Never move, rename, or reorganize anything. If the folder is messy, offer ONE
   optional inventory pass that outputs a specific keep/file/ignore *proposal list* —
   executed only item-by-item on approval, and never as a precondition for anything else.
   A next step, a capture, or a sweep must never be blocked on tidiness.
5. If HiNotes is bridged, push the account's canonical name + obvious aliases to its entity
   dictionary (additive, idempotent); absent → skip silently (C13).

---

## §C. doctor — diagnose, never modify

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
2. **Config completeness:** every `identity.schema.md` key present or explicitly defaulted
   **and type-conformant to the schema** (e.g. `fiscal_q1_start_month` is an integer 1–12 —
   a stored "January" is a finding; live catch 2026-07-16); name the missing/malformed ones
   and which skill degrades without them. **`scheduled_task_ids`/`board_queue_tool` are
   type-conformance-only: checked when present, never flagged for being absent** (their
   schema rows name absence as the rung simply not existing yet). The fix is always the
   setup question flow, never a hand-edit (C2). **Ownership boundary: `core.md` is all-generated — validate it
   strictly (personal prose inside it = a finding: offer the A2 split). `user.md` is user
   space — NEVER validated, parsed, or reported on beyond "present/absent". Root
   `CLAUDE.md` should import both (`@core.md` + `@user.md`); a missing user.md import is
   a one-line finding. `voice.md` (optional equipment, never required — `user.md`'s
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
3. **Integrations:** probe each configured one with a harmless read (C13). Split the
   result (#57 — session scope is not misconfiguration): **configured, not exposed on
   THIS surface (a session with no MCPs at all — expected on some surfaces)** → INFO,
   never a finding; **configured and failing where the surface should expose it** →
   FINDING, "configured but not responding."
4. **Salesforce tier sanity:** `mcp` tier → the probe read works on a surface that
   exposes MCPs. Apply check 3's split here too: no MCPs exposed on this surface → INFO;
   configured-and-failing where it should exist → FINDING. The tier-change
   recommendation is reserved for the FINDING case only — never suggested off a
   session-scope INFO. `manual` tier → say what that means (pasted reports are the
   intake — expected, not an error).
5. **Engine version:** per `assets/shared/version-check.md` — INSTALLED = this bundle's
   VERSION (the authoritative fact); LATEST = `Team/_engine/latest-version.txt` (unreachable
   → "latest: unknown"); installed ahead of latest → report "beacon behind; your next sync
   heals it" — never write it here (doctor diagnoses; sync owns the bump). A version
   recorded in core.md only marks when setup last ran — if the bundle is newer than
   core.md's record, say "config written by {M}; bundle is {N} — fine unless release notes
   say config fields changed", never "update available".
6. **Team/ publication:** shortcut present? user's subfolder writable? manager-decision
   file recorded? Each absent one maps to the Day-1 guide step or the pending Adam item. **Fresh-install rule (#32): an unset publish gate on a root with no prior Team/ updates is INFO, not a finding — one line: "publish gate unsettled — it settles via the manager-decision file; the weekly sweep's A6.3 gate skips (with the reason said) until then."**
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
   **match by PROMPT CONTRACT, never by task name** — a conforming sync task is one
   whose prompt contains both `sync my day` and the literal `(scheduled, unattended)`
   marker (same contract, `weekly next steps`, for the next-steps task if opted in).
   A task named anything ("daily-kickoff", "morning run") does not count unless its
   PROMPT conforms (live false-green 2026-07-16: doctor blessed predecessor
   kickoff/wrap holdovers by name). No conforming task → a finding + the C11-gated
   offer to create it ("create a scheduled task — do not run it now — weekdays
   ~7:00 AM, prompt exactly: `sync my day (scheduled, unattended)`") — creation is a
   modification, so never silent. **Additionally: any enabled task whose prompt carries
   legacy pass vocabulary (kickoff / wrap / start my day / close out) WITHOUT the
   unattended marker is its own finding** — those words route into the sync skill as a
   FULL ATTENDED pass with nobody watching (stalls on questions; a wrap task
   double-syncs the day). Recommend the user pause or delete them in the platform UI;
   doctor never touches them. **Additionally (#68): (a) NO conforming sweep task → one
   INFO line + the C11-gated offer to create it by A6.2's exact due-day recipe (ask the
   due day; previous business day 5:00 PM); never-re-offer holds ONLY when a prior
   decline is RECORDED (core.md's `declined_offers:` line, §A6.2) — with no such
   record, doctor is diagnose-never-modify and sessions are memoryless, so offering
   again is correct, not a nag (#70). The record is per-offer-key — re-offer happens
   ONLY when the user asks or the key's precondition changes. (b) A conforming sweep
   task scheduled at the SAME minute as the sync task is a finding — "lock contention:
   one run will exit; offset the sweep (recipe: previous business day 5:00 PM)." (c) A
   conforming sweep task with NO `lastUnattendedRun.sweep` entry after its first
   scheduled day → "the task may be executing a pre-sweep bundle snapshot — offer
   (C11-gated) to re-create it (#52)."**
10. **Last unattended runs (#52/#67/#68) — report-only, never a finding by itself:**
    for EACH key of `state/tasks.json → lastUnattendedRun` ({sync, sweep}): one line,
    values verbatim: `last unattended {key}: {at} ({localDate}, or "no local date") on
    {surface} — bundle {version}`. Empty/absent map → `no unattended runs recorded
    yet` (informational). When an entry's {version} differs from THIS bundle's
    `assets/shared/VERSION` (compare per version-check.md ordering; unordered values →
    report both verbatim, no comparison), append: ` — differs from this bundle
    ({installed}); the scheduled task may be executing a stale snapshot (#52)`.
    Additionally: `state/sweep.json` holding a park older than 7 days → one INFO line
    naming its age and the resume offer.

Output ends with: `doctor: {N} ok · {M} findings · {K} skipped` + the shortest fix list,
ordered by what blocks the most.

## §D. Voice bootstrap — `build my voice file from my mail`

Derive a voice.md from the user's OWN sends — explicitly invoked, never a default or
scheduled behavior. Uses the config (C2) for `manager_email` and the root path; no
memory-root scaffolding, no config regeneration, no state, no lock. Everything mined
lives in the session and the user's own root file — never an engine file, never an
issue or PR (C1).

1. **Probe (C13):** mail-search + chat-search on this surface (harmless one-result
   reads). Either absent → offer the floor path (C7) instead of stopping: "paste 3–5
   sent emails per audience (manager / customer / internal) and I'll derive from
   those" — from pasted text the rest of this flow is identical.
2. **Sample:** ~30–50 of the user's own sends from the last 90 days across four axes —
   manager (addressed to `manager_email`) · customer-external (recipient domain differs
   from the user's own send domain) · internal (same domain, not the manager) · Teams
   chat sends. Spread customer picks across distinct situations: scheduling · pricing ·
   escalation · re-engage · technical. A thin cell is sampled thin and MARKED — never
   padded. `manager_email` unset → the manager cell is SKIPPED and named at close,
   never guessed (the schema row's missing-value rule, C2).
3. **Received-text boundary (absolute):** strip quoted/forwarded trails from every
   sampled send before analysis; discard chat messages not authored by the user,
   unanalyzed. Derived rules and any evidence excerpt quote ONLY the user's own words —
   never received text. Counterparty and customer names never enter the derived
   voice.md: every rule is a pattern statement ("short openers to executives"), never an
   example naming a person or account. Sampled bodies are trail-stripped and capped at
   roughly the first 1,500 characters (the context-cost control).
4. **Analyze** per audience × situation: greetings/sign-offs · rhythm and sentence
   length · formatting habits · punctuation tells · ask-style · pushback-style.
   Evidence is COUNTED in-session ("12 of 14 customer sends open without a greeting");
   counts never enter voice.md. **Thin-cell floor:** a cell with fewer than 3 sends
   yields PROVISIONAL rules by rule — marked in the draft, named aloud at close (the
   drift check firms them up over time).
5. **Open choices (the core):** every stated-vs-practice contradiction — against the
   template placeholders the user kept, or against their `user.md`/current voice.md if
   they point at one — becomes ONE structured question (C11): at most 4 options, the
   recommended default being encode-what-practice-shows. **Batch rule:** at most 4
   questions per turn, ordered by evidence strength; beyond ~8 contradictions the
   weakest default to encode-practice, but each is NAMED in step 6's render and any one
   is pullable back into a question. No contradiction is ever silently resolved.
6. **Render + gate (C5/C14):** render the COMPLETE resolved voice.md body, then one
   structured gate in that same turn. The gate names what approval does — pristine file
   (the §5 two-part test in `assets/shared/voice-contract.md`, compared against THIS
   bundle's fenced block; a cross-version template mismatch therefore degrades to
   copy-block by design) → "replacing the pristine template — no user rules detected",
   and approval WRITES the file; any other state (user-edited · marker deleted ·
   bootstrap-written · absent) → the same body emits as a copy-ready block the user
   pastes themselves — for an ABSENT voice.md, with one pointer line: seed first ("seed
   my voice file") or paste this block as the new file. Copy-block is always the offered
   escape option.
7. **The write** (pristine-approved only): whole-file replace. The written file has NO
   marker — line 1 `# Voice — {user_name}`, line 2 the dated header
   `derived {YYYY-MM-DD} from {n} sends` (surface-provided date, this run's sample
   count). Engine-written once, user-owned from birth: marker ABSENCE is permanent
   ownership, so a second bootstrap on a bootstrapped root always ends in a copy-block.
   If `@voice.md` is missing from the root CLAUDE.md import line, add it per Mode 4's
   idempotent rule.
8. **Audible close:** `voice bootstrap: {n} sends sampled · {k} choices resolved ·
   {written|copy-block}` — plus one line naming each provisional (thin-cell) section.

## §E. Voice drift check — `voice drift check`

User-invoked, doctor-nudged (§C.2), never scheduled. No state, no lock; voice.md is
byte-untouched by this mode, always.

1. **Probe + sample:** §D1's probe and floor path verbatim; then ~15–25 of the user's
   own sends from the last ~30 days — §D2's axes, lighter, and §D3's received-text
   boundary applies unchanged.
2. **Compare practice against the CURRENT voice.md rules.** The MODEL reads the user's
   rules to compare — the engine never parses rule content (#74's design stands; this
   is a model reading a user file, not machinery consuming it).
3. **Output — never a write:** `voice drift: {m} rules holding · {d} drifting`, then one
   line per drifting rule — the rule · what recent practice shows (counted, §D3's
   boundary: no received text, no names) · the suggested edit — then ONE copy-ready
   update block: the user's full voice.md with the suggested edits applied, for the
   user to paste or ignore. A thin-evidence cell says so ("chat: 2 sends — too thin to
   judge") and contributes no suggestions. If the file opens with the dated `derived`
   header, the block's header line is refreshed to `derived {YYYY-MM-DD} from {n} sends`
   — this check's surface-provided date and sample count — so pasting the block restarts
   §C.2's 60-day clock; a file with no dated header gets none added (hand-authored files
   stay ageless by design).

## Anti-patterns — never

- Bulk-moving, renaming, or "organizing" existing user files — under any prompt.
- Overwriting an existing file during init/back-fill (C5 + additive-only).
- Claiming a configured integration works without evidence — first use or doctor verifies (C13); setup itself never runs pre-verification probes.
- Hand-editing config values instead of regenerating through the question flow (C2).
- Seeding the whole account book at once — top 3–5, rest on-touch.
- Blocking any other skill's work on scaffolding or tidiness.
- A voice.md write outside §A2's seed and §D7's pristine-approved case — drift NEVER writes;
  quoting received text, or naming a counterparty or customer, inside a derived voice.md.
