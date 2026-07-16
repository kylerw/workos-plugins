---
name: workos-setup
description: >
  The WorkOS on-ramp and health check. Three jobs: initialize a new user's workspace
  ("init my workspace" — scaffolds the memory root, builds the per-person identity config
  from connected tools with minimal questions, seeds the first accounts; say "in floor
  mode" to force the O365-only team floor for testing/simulation, or "let me pick
  integrations" to choose), initialize or back-fill one account ("init {account}" —
  additive-only scaffolding of the standard folder taxonomy, never overwrites anything),
  and diagnose ("check my setup", "doctor", "is my WorkOS healthy" — probes every
  configured integration, verifies the memory root, reports installed vs latest engine
  version). Existing files are read-only inputs, never migration targets: nothing is
  bulk-moved, ever. Works from Cowork at the Office 365 floor; Salesforce/HiNotes/Graph
  light up when connected. Draft-before-write throughout. DO NOT attempt without loading —
  it enforces the config schema, invocation modes, and the brownfield rules.
---

# setup — the WorkOS on-ramp (L1) + doctor

## Role

You stand up a teammate's WorkOS memory, generate their config, and diagnose their install.
Additive, idempotent, boring on purpose. Contracts by number (`assets/shared/` carries the
injected resources): C1 engine-memory-split · C2 identity-config · C5 draft-before-write ·
C7 salesforce-read-only-and-optional · C11 structured-options · C13
presence-is-not-capability. All examples fictional.

**Bundle location:** resolve every `assets/` path in this file relative to THIS skill's
own folder — the folder containing this SKILL.md. Under direct .skill upload that is
`.claude/skills/workos-setup/` under the session mount; under a plugin install it is the
plugin's skill folder. Never resolve `assets/` in the memory root or project folder.

## Modes

1. **`init my workspace`** — first run for a new user (§A).
2. **`init {account}`** — scaffold or back-fill one account (§B).
3. **`doctor`** ("check my setup") — diagnose, never modify (§C).

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
3. `team_publish_folder` — if the shared `Team/` shortcut exists in the root, confirm the
   user's subfolder (`Team/updates/{user_name}`); if not, note it as a Day-1 guide step and
   leave unset (the publish gate stays off until it exists).

Write the config block into `core.md` after the confirmations (draft-before-write; schema:
`assets/shared/identity.schema.md`).

### A3. Scaffold the root structure

From `assets/shared/` templates and the memory-structure layout: `Accounts/`, `state/`,
`journal/`, `lanes/` — **create only what's missing** (additive, idempotent). `state/`
gets the four baseline files as empty shapes per
`assets/shared/state-schema/README.md` (`tasks.json`, `meetings.json`, `drafts.json`,
`suppressed.json`) so the daily driver never bootstraps blind. Present the
create-list first (C5). Never create `Team/` (it's a shortcut the user adds) and never
scaffold empty `Prep/`/`Archive/` folders.

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
   - the root `CLAUDE.md` (Claude Code surface; `@imports core.md`, folder map,
     write-routing), and
   - the **Cowork project-instructions paste text** — short: memory root, config lives in
     core.md, the three workos skills with their invocation vocabulary (sync's manual
     words: sync my day / tidy / build my board / rebuild my board; legacy
     kickoff/wrap/start-my-day/close-out vocabulary ROUTES to workos-sync — never to
     retired skills), the capture-skills residual role (account truth until
     workos-capture ships), and the filing-rules pointer.
   Tell the user: copy your EXISTING project instructions to a note first (instant
   rollback), then paste the new text into the Cowork project's instructions field.
2. **Scheduled task, by exact recipe — never improvised, never a pair:** offer (C11) to
   "create a scheduled task — do NOT run it now — prompt exactly
   `sync my day (scheduled, unattended)`, weekdays 7:00 AM, enabled." ONE task; legacy
   kickoff/wrap slots are deleted or left dead, never re-enabled (live near-miss: a
   doctor offered to re-enable BOTH holdovers = two full syncs daily). Optional second
   offer where the user wants it: the weekly next-steps sweep on the team's cadence day.
3. Report what was created vs already present, write the config, close.

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

1. **Memory root:** config resolves; root reachable; the canonical folders exist; OneDrive
   hydration spot-check (read one file; if placeholders/failures → name the "Always keep on
   this device" fix).
2. **Config completeness:** every `identity.schema.md` key present or explicitly defaulted
   **and type-conformant to the schema** (e.g. `fiscal_q1_start_month` is an integer 1–12 —
   a stored "January" is a finding; live catch 2026-07-16); name the missing/malformed ones
   and which skill degrades without them. The fix is always the setup question flow, never
   a hand-edit (C2).
3. **Integrations:** probe each configured one with a harmless read (C13) — "configured
   but not responding" is a finding, not a crash.
4. **Salesforce tier sanity:** `mcp` tier → the probe read works; `manual` tier → say what
   that means (pasted reports are the intake — expected, not an error).
5. **Engine version:** per `assets/shared/version-check.md` — INSTALLED = this bundle's
   VERSION (the authoritative fact); LATEST = `Team/_engine/latest-version.txt` (unreachable
   → "latest: unknown"). A version recorded in core.md only marks when setup last ran — if
   the bundle is newer than core.md's record, say "config written by {M}; bundle is {N} —
   fine unless release notes say config fields changed", never "update available".
6. **Team/ publication:** shortcut present? user's subfolder writable? manager-decision
   file recorded? Each absent one maps to the Day-1 guide step or the pending Adam item.
7. **State layer:** `state/` exists; JSON parses; exactly one writer's lock present or none
   (stale lock → name the recovery step from the recorded spike design). `state/` missing
   entirely → the finding says exactly: *"state/ is the engine's operational baseline —
   the first `sync my day` scaffolds it"* — never "only relevant if you use the board"
   (live mis-framing 2026-07-16). **A lock whose
   `startedAt` predates `lastFullSync`/`lastTidy` is an ORPHAN** (a pass claimed release
   and failed — live defect 2026-07-16): name it, and offer the one-step fix (delete
   `state/.pass-lock.json`) as a question (C11) — the ONE doctor finding with an offered
   action, because a future pass blocks on it.
8. **Scheduled tasks (live-test gap 2026-07-16 — doctor previously never looked):**
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
   doctor never touches them.

Output ends with: `doctor: {N} ok · {M} findings · {K} skipped` + the shortest fix list,
ordered by what blocks the most.

## Anti-patterns — never

- Bulk-moving, renaming, or "organizing" existing user files — under any prompt.
- Overwriting an existing file during init/back-fill (C5 + additive-only).
- Claiming a configured integration works without evidence — first use or doctor verifies (C13); setup itself never runs pre-verification probes.
- Hand-editing config values instead of regenerating through the question flow (C2).
- Seeding the whole account book at once — top 3–5, rest on-touch.
- Blocking any other skill's work on scaffolding or tidiness.
