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

1. **`init my workspace`** — first run for a new user, and re-init/regeneration on an existing root (§A). **Read `assets/modes/init.md`
   and follow it — that file is authoritative for this mode. Do not proceed from this
   summary.**
2. **`init {account}`** — scaffold or back-fill one account (§B).
3. **`doctor`** ("check my setup") — diagnose, never modify; the usage log is doctor's one
   new write (§C). **Read `assets/modes/doctor.md` and follow it — that file is
   authoritative for this mode. Do not proceed from this summary.**
4. **`seed my voice file`** — runs §A2's (`assets/modes/init.md`) voice.md seed step alone: no memory root, identity
   config, or account work. Seeds `voice.md` from the template when absent, adds
   `@voice.md` to the root CLAUDE.md import line beside `@user.md` when missing; both
   steps idempotent (skip when already present). The same additive rule covers
   `@workspace.md` — added ONLY when that file exists; this mode never creates it.
   **Usage log:** once the config resolves `{memory_root}` and `user_name`, append the
   `open` record per `assets/shared/usage-log.md` (`mode`: `voice-seed`; `passId` — this
   pass holds no lock), then the matching `close` as the pass's last action, after the
   report of what was seeded vs already present — the POSITION, not the seed: an
   already-present `voice.md` and an already-present import line make this a legitimate
   no-op run that still ran. Use that document's outcome mapping. Do not restate the
   mapping here. A failed append is never fatal: report it in the run output and continue.
   **§A2's own run of this seed step is a DELEGATED invocation and writes nothing** — §A
   already recorded itself.
5. **`build my voice file from my mail`** — voice bootstrap (§D): derive voice.md from the
   user's own sent mail + Teams chats. May REPLACE the file only when it passes the
   two-part pristine test in `assets/shared/voice-contract.md` §5; every other state —
   user-edited, bootstrap-written, cross-version template, or absent — ends in a
   copy-ready block.
6. **`voice drift check`** — compare the user's recent sends against the current voice.md
   (§E): audible summary + ONE copy-ready update block; never a write.
7. **`align filenames {account}`** — bring ONE existing account's engine-nameable
   file/folder names in line with the customer file prefix convention
   (`Account_Project_Instructions.md` §Customer file prefix), every change
   user-approved (§F). **Read `assets/modes/align.md` and follow it — that file is
   authoritative for this mode. Do not proceed from this summary.** Attended-only: an
   invoking prompt carrying the unattended marker → refuse, name the reason, stop.

**"Today" comes from the surface-provided date.** Every question is asked through the
platform's structured-question tool so the options are SUBMITTABLE — a prose-rendered
"1. … / 2. …" list is not C11-compliant (live finding 2026-07-16, both setup and sync).
Every question follows C11 (structured
options, default first, ≤4, escape hatch).

---

## §B. Account init / back-fill — additive only, always

0. **Usage log (open) — a DIRECTLY INVOKED `init {account}` only.** Once the config is
   resolved, append the `open` record per `assets/shared/usage-log.md` (`mode`:
   `account-init`; `passId` — this pass holds no lock). Append the matching `close` as the
   pass's last action, after this section's last step — the POSITION, not step 3's
   approval: a declined create-list creates nothing and the pass still ran end to end. Use
   that document's outcome mapping. Do not restate the mapping here. **§A4's (`assets/modes/init.md`) per-account
   runs of this section are DELEGATED invocations and write NOTHING** — §A's own pass
   already recorded itself, so one `init my workspace` naming four accounts stays one
   recorded pass, and `account-init` keeps counting invocations rather than folders. A
   failed append is never fatal: report it in the run output and continue.
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
1a. **Usage log (open):** append the `open` record per `assets/shared/usage-log.md`
   (`mode`: `voice-bootstrap`; `passId` — this pass holds no lock). Append the matching
   `close` as the pass's last action, after step 8's audible close — the POSITION, not the
   write: step 7 runs only on the pristine-approved path, and a copy-block is an equally
   successful terminal outcome, so anchoring the close on the write would record every
   copy-block run as an abandonment. Use that document's outcome mapping. Do not restate
   the mapping here.
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
   idempotent rule (likewise `@workspace.md`, only when that file exists).
8. **Audible close:** `voice bootstrap: {n} sends sampled · {k} choices resolved ·
   {written|copy-block}` — plus one line naming each provisional (thin-cell) section.

## §E. Voice drift check — `voice drift check`

User-invoked, doctor-nudged (§C.2, `assets/modes/doctor.md`), never scheduled. No state, no lock; voice.md is
byte-untouched by this mode, always.

1. **Probe:** §D1's probe and floor path verbatim.
1a. **Usage log (open):** append the `open` record per `assets/shared/usage-log.md`
   (`mode`: `voice-drift`; `passId` — this pass holds no lock). Append the matching `close`
   as the pass's last action — the POSITION, not the summary: step 3's compare can end the
   pass early when no `voice.md` exists ("no voice.md — seed one first" instead of step 4's
   drift summary), and that pointer is an equally legitimate terminal outcome, so anchoring
   the close on the summary would record every no-voice.md run as an abandonment. Use that
   document's outcome mapping. Do not restate the mapping here. This mode leaves voice.md
   byte-untouched; the log records that the pass ran, never what it found.
2. **Sample:** ~15–25 of the user's own sends from the last ~30 days — §D2's axes,
   lighter, and §D3's received-text boundary applies unchanged.
3. **Compare practice against the CURRENT voice.md rules.** The MODEL reads the user's
   rules to compare — the engine never parses rule content (#74's design stands; this
   is a model reading a user file, not machinery consuming it).
4. **Output — never a write:** `voice drift: {m} rules holding · {d} drifting`, then one
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

- Bulk-moving, renaming, or "organizing" existing user files — under any prompt. The ONE exception: `align filenames`' approved manifest (§F, `assets/modes/align.md`) — every rename a user-approved manifest line; outside that manifest the ban is absolute.
- Overwriting an existing file during init/back-fill (C5 + additive-only).
- Claiming a configured integration works without evidence — first use or doctor verifies (C13); setup itself never runs pre-verification probes. **Evidence means a call made in THIS run (#156); "it answered earlier in the session" is not evidence and yields SKIP, never `ok`.**
- Hand-editing config values instead of regenerating through the question flow (C2).
- Seeding the whole account book at once — top 3–5, rest on-touch.
- Blocking any other skill's work on scaffolding or tidiness.
- A voice.md write outside §A2's (`assets/modes/init.md`) seed and §D7's pristine-approved case — drift NEVER writes;
  quoting received text, or naming a counterparty or customer, inside a derived voice.md.
