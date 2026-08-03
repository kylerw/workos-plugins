# §A. Workspace init — zero → seeded memory
Reached only via workos-setup SKILL.md mode 1 — never runs standalone; Role, C11, and the anti-patterns apply.


### A1. Locate or create the memory root

Ask where the memory root lives (structured options: the detected likely candidates — an
existing `WorkOS/`-named folder in the mounted project, the mounted project root itself, or
"somewhere else — I'll point you"). Root **name is whatever the user has** — `WorkOS/` is
only the default for brand-new roots (C2). Record path + name for the config.
**Cowork note:** the session must run in a project pointed at this folder (the Day-1 guide's
step 1) — if file access prompts on every touch, say so and point at the guide step.

### A2. Generate the identity config (the question flow — C2)

**Integration mode comes from the INVOCATION, not from a questionnaire.** Connecting a
connector authorized the PLATFORM to reach it — platform permissions govern tool access — and
that is why the default path never re-verifies a connector it already records and never runs
pre-verification probes (first real use reveals failures; `doctor` owns diagnostics).
**Platform authorization is not adoption into this WORK config, and the two are decided by
different people at different moments (#201):** widening the recorded set is the user's
decision, taken once per connector at §A2's delta gate. Already-recorded connectors are never
re-asked; that is the promise this preamble keeps. Three invocation modes:

- **Default** ("init my workspace") — **an ORDERED algorithm (#201; the #202 lesson: a
  load-bearing rule executed as prose loses to whichever adjacent sentence reads louder).
  Every step in order, no step skipped:**
  1. **Read `core.md` FIRST.** Absent → fresh install, `recorded` and `declined` are empty.
     Present and parseable → take `integrations` as `recorded` and the
     `adopt-integration:{name}` keys in `declined_offers` as `declined`. **Present but
     UNPARSEABLE → stop here and say so** (the guard below) — no enumeration, no delta, no
     gate, no write. A model that reaches step 2 with an unparseable config would ask about
     every exposed connector and only then refuse to write, which is the narrowing this guard
     exists to prevent.
  2. **Enumerate** the visible tools (no calls needed to list them).
  3. **Compute `delta = exposed − recorded − declined`.**
  4. **Delta EMPTY → ask nothing.** The integrations line renders `(unchanged)`. This is the
     common case on every re-run and it must stay question-free.
  5. **Delta NON-EMPTY → the adoption gate, and it runs BEFORE the identity questions of
     step 1 below** — never bundled into that confirmation turn. Two reasons, both binding:
     C11 allows one decision per question, and step 1's identity branch depends on whether a
     Graph/directory connector is in the ACTIVE set — a fact that does not exist until this
     gate is answered. **Deriving identity from a connector the user has not yet adopted is
     the exact read this issue exists to prevent.** The gate is one C11 question over the
     whole delta, its options ordered per C11:
     1. **Adopt none — keep the recorded set as it is** (recommended; every delta member is
        declined)
     2. **Adopt all {n}**
     3. **Decide one at a time** → one C11 question per delta member (adopt / decline), which
        is how a delta larger than C11's four-option ceiling is asked without splitting the
        decision or dropping a connector
     4. **Stop — I want to connect something first** (escape hatch: nothing is written, the
        run ends saying so)
     State plainly that this is the WORK config and that `doctor` probes whatever is adopted.
     **Never guess which connectors are personal** — the engine cannot know what counts as
     work at this user's employer, which is why this is a question and not a rule.
     Already-recorded connectors are context in the question's text, never options:
     **this gate only widens; narrowing belongs to the custom mode.**
  6. **Write, as ONE regeneration.** Adopted members append to `integrations`; every declined
     member writes one `adopt-integration:{name}` key into `declined_offers`. Both lists land
     in the same whole-file `core.md` regeneration (`assets/shared/identity.schema.md` — the
     generated block is engine-owned and rewritten whole), so a half-applied gate is not a
     reachable state. `sfdc_tier` = `mcp` only if Salesforce read tools are **adopted** — the
     tier tracks the adopted set, never the exposed set, so an exposed-but-unadopted
     Salesforce tool leaves `manual`.
  7. **An empty resulting set is legal and reported, never blocked:** `integrations: none
     recorded — every skill runs in paste/manual mode (C7)`. Per #154 a teammate whose
     employer will not authorize O365 on their account genuinely has no floor, and the engine
     says so rather than adopting something to protect its own assumptions.

  **Precedence, for a config that carries a connector in BOTH lists** (a hand-edit, or a
  config written before this rule): **`integrations` wins** — the connector is adopted, its
  stale `adopt-integration:` key is ignored for classification and dropped at the next
  regeneration. Adoption is the stronger, more recent signal, and the alternative would let a
  forgotten decline silently strip a working integration.

  **On a root that already has a
  `core.md`, READ its config block first and treat absence as session scope, not removal**
  (doctor check 3's split, applied at write time): a recorded integration not exposed this
  session is RETAINED with one INFO line, rendered in the same config confirmation as the
  integrations line below — "`{name}` recorded but not exposed in this session — retained;
  say 'let me pick integrations' to remove it" — and **`sfdc_tier` never
  downgrades on absence alone** (`mcp` → `manual` only through an explicit pick). An absent
  `core.md` is a fresh install, with nothing to retain; a present but UNPARSEABLE one stops
  the write and says so — never silently read as fresh, which is the exact narrowing this
  guard exists to prevent.
- **Floor / new-user-test mode** ("init my workspace in floor mode", "…as a floor user",
  "…test mode"): force `sfdc_tier` = `manual` and `integrations` = `[ms365]` regardless of
  what exists, and use NO other connector for the rest of the run — this is how a power
  user simulates a teammate's floor, and how the clean-room test runs. Never offered as a
  question; it exists only when explicitly invoked.
- **Custom** ("…let me pick integrations"): present the enumerated list as one structured
  pick (C11). For users who keep personal connectors they don't want a work skill touching.
  **Enumerate everything exposed REGARDLESS of decline state, and adopting a connector here
  CLEARS its `adopt-integration:{name}` key from `declined_offers` in the same write (#201)** —
  a decline made at the default gate is durable, not permanent, and this is the one path back.

The chosen set is echoed on its own line inside the config confirmation below — **both
branches of it, the derived one and the asked one** — as
"integrations: {list} ({adopted|retained|unchanged}) — rerun setup with 'let me pick' to
change", with the parenthetical naming what actually changed. So the default costs zero
questions, a widening is as visible as a narrowing, neither lands unannounced, and the way
to change it travels with the line that reports it.

1. **Identity — derive if a Graph/directory connector is in the active set, else ask.**
   *(Active set = the set as it stands AFTER the mode's adoption step above resolves — in
   default mode, after the delta gate is answered. A connector sitting in an unanswered delta
   is not active and is never read from here, #201.)*
   The org-deployed "Graph - Production" MCP (get-current-user / get-user-manager /
   search-users) is a separate connector — NOT part of O365; not everyone will have it.
   With it: pull display name + mail and manager name + mail, present as **one
   confirmation** (C11: "Confirm your identity config — name: …, initials: …, manager: …,
   integrations: {list} ({adopted|retained|unchanged}) — rerun setup with 'let me pick' to
   change. Correct?" — each retained integration's INFO line rendered beneath the
   integrations line, nothing added when none were retained).
   Without it: ask `user_name`, `initials`, `manager_name`/`manager_email`
   directly in one structured pass, **never naming the absent derivation connector as the
   reason for asking**, and closing that same pass with the identical `integrations:` line —
   the O365 floor is the majority surface, and a retained or changed set must be as visible
   there as on a Graph-derived one (that line reports the recorded config, which is a
   different thing from explaining why the question was asked). Always allow correction
   (Salesforce owner-column spelling may differ from directory displayName — say so if the
   user edits).
1a. **Usage log (open):** once Identity above resolves `user_name` — the first point on
   either branch (derived-and-confirmed, or asked-and-given) where the record's `user`
   field and its per-user log path both exist, by which point the integration mode is
   already known from the invocation — append the `open` record per
   `assets/shared/usage-log.md` (`mode`: `init`, or `floor` when floor mode was explicitly
   invoked; `passId` — this pass holds no lock); a run abandoned before Identity resolves
   writes nothing, since a per-user log cannot be written before the user is known. Append
   the matching `close` as the run's last action — the POSITION, not the config write: a
   run stopped by §A2's unparseable-`core.md` guard and honestly reported still ran to its
   end and still closes. Use that document's outcome mapping. Do not restate the mapping
   here. A failed append is never fatal: report it in the run output and continue.
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
5. `intake_sources` — **the mandated-entry ENSURE, an ordered algorithm that runs on
   EVERY config write — fresh install AND every regeneration, every mode including
   floor. Preservation is step (a) of this algorithm, never a substitute for it**
   (live defect 2026-07-30: a regen over user-populated sources preserved them and
   skipped the add — doctor then prescribed the same init in a loop):
   (a) carry forward every existing user entry verbatim (the schema's preservation
   rule);
   (b) an entry resolving to `{memory_root}/Intake` that is not already the mandated
   shape → CONVERT it to the mandated entry
   (kind → `staged`, label → `intake`; a retention override keyed to the old label
   re-keys with it; the conversion is named in the config confirmation) — one folder
   never carries two entries;
   (c) after (a)+(b), if NO `kind: staged` entry labeled `intake` exists → APPEND
   `{label: intake, kind: staged, path: {memory_root}/Intake}`. No question, no
   condition on mode or freshness. The written config carrying no staged entry means
   this step was not executed — a defect, exactly what doctor's Intake check names.
   The config confirmation always echoes one line:
   "intake_sources: {n} user entries preserved + the mandated staged entry
   {added | already present | converted}".
   The label `intake` is RESERVED: a user entry that would derive it is
   unique-ified, confirmed in the same pass. Then one OPTIONAL question (C11), default
   skip: "Configure ADDITIONAL file-intake sources (screenshots / downloads folders)?
   1. Skip for now (default — asked again next init; screenshot correlation stays off)
   / 2. Add my screenshots folder / 3. Add screenshots + downloads." On 2/3 collect
   each path (or mounted folder name on a managed surface) as typed — never guessed —
   and record entries with `kind`; each entry's `label` derives from the folder name
   (unique-ified, confirmed in the same pass); the escape option "my screenshots
   aren't named like the default" collects a `pattern` template (the schema's
   literal-token grammar).
6. `sfdc_instance_host` — **`mcp` tier only** (the invocation mode already resolved the
   tier; `manual` and floor runs never see this question), and only when the key is
   absent with no `sfdc-instance-host` decline recorded. One question (C11): "Record
   your Salesforce instance host so weekly-summary opp links are clickable — it's the
   hostname in your browser on any opportunity page (e.g.
   `example.lightning.force.com`). 1. Record it — I'll type/paste it / 2. Skip — don't
   ask again." The skip escape RECORDS `declined_offers:` key `sfdc-instance-host`
   (the §A6.2 decline mechanism — never re-asked; "let me re-decide" reopens; no weekly
   re-nag). The value is typed by the user, never guessed or probed.
7. **The manager-decision file** — `{memory_root}/manager-decision.md` present →
   validate the frontmatter (enums: `team_publish ∈ {off, gated, auto-with-notice}`,
   `team_publish_trigger ∈ {ns-confirmed}` absent-≡-`ns-confirmed`,
   `update_cadence_day ∈ {Monday…Friday}`; at `team_publish = auto-with-notice`,
   `decided_by` and `decided_on` are ADDITIONALLY required (non-empty; `decided_on`
   a date) — missing or malformed → named in the same loud line ("auto publish
   requires recorded provenance"); `team_publish_folder` is validated at this same
   record-time pass against the schema row's path rule (relative, root-contained —
   never absolute, never `..` — under `Team/`, terminal segment `{user_name}`) — an
   invalid shape is named in the same loud line and the key is NOT recorded (doctor's
   drift check then covers only validated values); unknown or missing required
   values are named in one loud line — the sweep will SKIP publishing on them, never
   ask, never write), RECORD `team_publish_folder` into the config on a validated
   shape (the schema row's identity-clause triple), and echo one line in the config
   confirmation — the echo line still renders with the mode regardless:
   "publish: {mode} (decided {decided_on} by {decided_by})" — the echo label
   `publish:` is the confirmation's voice; doctor's is the key name, deliberately.
   **File present → this record is the key's ONLY writer: item 4's Team-shortcut
   confirm defers to it** (two writers would silently re-record a value the user just
   confirmed). Absent → nothing here; §A6's offer owns creation. No question on the
   happy path.

**Write the five-file config layer after the confirmations** (draft-before-write; schema:
`assets/shared/identity.schema.md`). Ownership is by FILE, never by section:

- **`core.md` — wholly engine-owned.** The generated config block plus generated engine
  boilerplate (write-routing table, operating invariants, and the **ad-hoc voice hook** — the
  voice spec §4 fourth emit point: one line telling the model to run the
  `voice pass per assets/shared/voice-contract.md` on any ad-hoc paste-ready chat output,
  surface = plain-text-paste when the text is pasted onward, in-chat otherwise) and NOTHING
  personal. **Every generation stamps `boilerplate_schema` with the bundle's current value
  (#112)** — the marker doctor §C.5 compares against, and the only way a later run can tell
  that a core.md written by an older bundle is missing a generated section rather than
  merely old. Setup
  regenerates it **whole-file** — which is exactly why no user prose may live in it
  (sections carried on a recorded split decline excepted — doctor folds those into its
  carried-sections INFO, never a finding).
- **`user.md` — wholly user-owned.** If absent, create a short commented stub ("yours —
  voice, identity notes, personal tooling, anything; the engine never writes or parses
  this file"). **If present, never touch it — not on init, not on regeneration, ever;
  the ONLY engine write is a gated, approved verbatim MOVE of personal prose** (the
  split offer below / §A6.1's guard — appended with your approval, never rewritten).
- **`voice.md` — wholly user-owned, engine-seeded once.** If absent, seed it verbatim
  from the fenced block in `assets/shared/voice-contract.md` §5 (copy the fenced
  block only, never the whole asset). **If present, never touch it — not on init, not on
  regeneration, ever** (same rule as `user.md`: the user moves their own Voice content
  in; the engine only leaves the template pointer). The template's second line is the
  `pristine-template marker` — part of the verbatim copy, so seed behavior is unchanged;
  its meaning and the two-part pristine test live in `assets/shared/voice-contract.md` §5,
  and §D's bootstrap is their only consumer. This bullet plus §A6's import-line
  addition are Mode 4's full behavior.
- **`workspace.md` — wholly user-owned, engine-appended only under §A6.1's gated
  move.** If absent, create a short commented stub ("yours — filing rules, operating
  notes, workspace conventions; the engine never regenerates or parses this file;
  sections it relocates from the root `CLAUDE.md` land here verbatim, only on your
  approval"). **If present, never regenerated, never rewritten — not on init, not on
  regeneration, ever; the ONLY engine write is a guard-approved verbatim append**
  (same rule as `user.md`, plus the one named append path).
- **Brownfield split (gated, C5/C11) — `core.md` only:** an existing `core.md` carrying
  non-engine content gets a **split offer**: each section shown verbatim with its
  destination — personal prose (voice rules, identity narrative, personal tooling like
  a memory system) → `user.md`; workspace operating notes (filing rules, invariants,
  trigger conventions) → `workspace.md` — applied only on approval, MOVED verbatim,
  never rewritten, never dropped. A decline ⇒ core.md's regeneration is skipped
  honestly THAT run (zero writes for this step; the close report names it) and the
  decline is RECORDED (`declined_offers:` key `coremd-move:{heading-slug}` — never
  re-asked; "let me re-decide" reopens); later regenerations proceed, carrying each
  recorded section verbatim, exactly as §A6.1's guard does for the root file. The root
  `CLAUDE.md` is NOT examined here — §A6.1's standing guard owns that file's split.
  One flow per file.

**After a successful config write, append the `install` record per `assets/shared/usage-log.md`** — but ONLY if this user's log carries no `install` record already. The rule is stated against the file, not the mode: a later `account-init` or `floor` run adds nothing. `mode` is whichever mode is running. This is in ADDITION to this pass's `open`/`close` pair, never instead of it — `install` is a fact about this user keyed on its own absence, the pair is the record of one pass running and finishing.

### A3. Scaffold the root structure

From `assets/shared/` templates and the memory-structure layout: `Accounts/`,
`Intake/` (the deliberate-drop inbox — required root shape), `state/`, `journal/`,
`lanes/` — **create only what's missing** (additive, idempotent). `state/`
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
   - the root `CLAUDE.md` (Claude Code surface) — **fully engine-owned, regenerated
     whole**, containing exactly, in order: (i) the import line — `@core.md` `@user.md`
     `@voice.md` `@workspace.md`, each import additive/idempotent (added only when
     missing, never duplicated; `@voice.md`/`@workspace.md` only when those files
     exist); (ii) the **derived root map** — derived, never transcribed, from config
     plus this registry list (THE one place to extend when a skill starts writing a new
     root artifact): `Accounts/` · `Intake/` · `state/` · `journal/` · `lanes/` ·
     `{library_path}/` (resolved value — describes the configured layout whether or not
     §A3 scaffolded it yet) · `Board.html` (sync S7.4 output) ·
     `manager-decision.md` (when present — the directly-authored publish/cadence
     record) · the `Team/` shortcut when configured; (iii) the account-folder handoff; (iv) the **frozen-legacy
     section, derived from `assets/shared/retired-legacy.md`** — rendered as that
     asset's canonical byte-fixed block, never authored inline, re-derived on every
     regeneration so it cannot be lost (byte-fixed is what makes the guard's
     exact-match decidable). The generated file opens
     with an ownership comment: "engine-generated — regenerated whole by setup; do not
     edit. Durable notes belong in workspace.md."
     **Standing guard — runs at EVERY regeneration of this file** (this guard IS the
     split flow for the root file; §A2's split offer never examines it): (1) CLASSIFY
     the existing file against the generation set above — frozen-legacy lines that
     EXACT-MATCH the expected derived rendering are engine content (re-derived);
     frozen-legacy-like content that does NOT exact-match, including a hand-added
     frozen path, is NON-ENGINE and gated like any other section with the options
     "drop as superseded by the derived section (shown side-by-side)" / "move" — never
     a silent re-derive over a delta. (2) COLLECT all decisions before writing
     anything: each non-engine section rendered VERBATIM with its proposed destination
     (`workspace.md`; `user.md` when personal prose — §A2's destination doctrine), one
     section per question, at most four questions per turn (C11, C14); a section
     already present verbatim in its destination is skipped-and-reported, never
     re-appended. (3) Any decline ⇒ ZERO writes this run for this file — approved
     appends and the regenerated file are one transaction; the abort covers this
     generation step only (config write and scaffolding stand; the close report names
     the skip) — and the decline is RECORDED: `declined_offers:` key
     `claudemd-move:{heading-slug}` in core.md's setup record. (4) A RECORDED decline
     is never re-asked: later regenerations PROCEED, carrying each recorded section
     into the regenerated file verbatim (visible at the pre-write gate); "let me
     re-decide" reopens. The first run on a workspace with an accreted root file IS
     the migration — no separate mode. And
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
   `sync my day (scheduled, unattended)`, weekdays 7:00 AM, enabled, permission mode
   Auto." **The mode is part of the recipe (#138), not a preference:** the platform
   default (Manual) stalls an unattended run indefinitely at its first unapproved tool
   call — no timeout, no auto-deny — so a Manual-mode task structurally cannot honor the
   unattended marker it carries. Set the mode with the pickers on the Instructions input
   of the routine create/edit form. ONE task; legacy
   kickoff/wrap slots are deleted or left dead, never re-enabled (live near-miss: a
   doctor offered to re-enable BOTH holdovers = two full syncs daily). Optional second
   offer — the weekly sweep, anchored to the update's DUE day (#68): ask (C11) "which
   day is your weekly next-steps update due?" (default = the recorded manager-decision
   cadence day when present, else Thursday), then offer to create the task by exact
   recipe — "do NOT run it now — prompt exactly `weekly next steps (scheduled,
   unattended)`, scheduled the PREVIOUS BUSINESS DAY at 5:00 PM, enabled, permission
   mode Auto (same mandate as the sync task)" (due
   Thursday → runs Wednesday 5:00 PM; due Monday → Friday 5:00 PM). A decline is
   written into core.md's setup record — a `declined_offers:` line listing offer keys,
   preserved across regeneration per the schema row (`assets/shared/identity.schema.md`);
   core.md is engine-owned and regenerated, so this rides the existing generation, and
   C5's normal confirmation covers it. Never at the daily sync's minute — two
   unattended runs contending on the C4 lock means the loser exits, silently costing
   that day's run. Whichever task(s) the platform creates, capture any
   id or reference it returns or displays into `scheduled_task_ids` (`sync`/`sweep`) at
   the config write below — an id the platform never reveals stays absent, never guessed.
2b. **Manager-decision file, when absent** — one offer (C11): "Create
   `manager-decision.md` from the template? It records the Team/ publish mode and
   cadence. 1. Create it with `team_publish: gated` under my name — I'll edit from
   there / 2. Skip (asked again next init) /
   3. Create it with `team_publish: off` — records the decision and stops this
   offer." Created from `assets/shared/memory-structure/manager-decision.md` with
   CONFIG-RESOLVED values — never the template's fictional ones (a fictional
   `decided_by` presented as real provenance, or another user's subfolder, is the
   defect class): `manager_name`/`manager_email` from config · `team_publish_folder`
   = `Team/updates/{user_name}` · `decided_by` = `{user_name}` · `decided_on` =
   today · `team_publish` = `gated` on option 1 (the safe default; auto is a
   deliberate later hand-edit) or `off` on option 3 · `team_publish_trigger` =
   `ns-confirmed` ·
   `update_cadence_day` = the §A6.2-recorded cadence day when present, else
   `Thursday` · `ns_rubric_status` = `inherited` — NEVER the template's `confirmed`
   (a confirmation nobody made is the same fabricated-provenance class); the
   comment block copies verbatim. The engine never rewrites the file after
   creation. The created file's `team_publish_folder` is recorded into the config
   at step 3's config write (the identity-clause triple), same pass — no drift window
   between creation and the recorded copy.
3. Report what was created vs already present, write the config, disclose the usage log, then OFFER the board (C11 — live gap 2026-07-17: the first non-founder install ended with no board offer). **Disclosure:** "Runs are logged to `Team/_engine/usage/{user_name}.jsonl` — skill, version, outcome. No account data. Everyone on the team can see it." Then: "1. Build my board now / 2. Skip — say 'build my board' any time." On 1, hand off to workos-sync's BOARD entry point. Then close.

---

