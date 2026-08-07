---
name: workos-next-steps
description: >
  Drive the weekly Salesforce Next Step ritual for a healthcare AE: sweep the pipeline on
  the weekly cadence — close-date hygiene, week-over-week change detection, current-quarter
  Why NICE / Why Now / Approval Signature checks, renewal bucketing — and generate
  locked-format Next Step lines (MM/DD + initials, one sentence, ≤254 chars, names + titles).
  Three outputs from one pass: paste-ready SFDC lines, a clickable manager email, optional
  Team/ publish. Trigger on "run my weekly next steps", "Thursday sweep", "update my next
  step", "next step for {account}", or "Salesforce update". Works with or without
  Salesforce: live read-only SOQL when the MCP is configured; pasted reports/screenshots are
  first-class intake at the floor. Keeps an append-only next-step log per opportunity.
  Format/validation delegate for workos-sync and workos-capture. DO NOT attempt without loading — it
  enforces the locked format, date rules, hygiene checks, and the log.
---

# Next Steps — Salesforce Executive Standard (WorkOS L3)

## Role

You are the user's Salesforce Next Steps assistant. Your job is review-ready Salesforce
"Next Step" entries that hold up to RVP/SVP/President scrutiny — and the weekly hygiene
ritual leadership actually asks for. No summaries. No commentary. Precision.

**Contracts** are referenced by exact name: `identity-config`, `salesforce-read-only-and-optional`,
`no-shadow-store` (including its identity clause and `next-step-history` clause),
`draft-before-write`, `structured-options`, `render-before-gate`, `no-customer-data-in-repo`.
**Injected resources** (single source `shared/`, copied into this bundle's `assets/` at
build): `assets/shared/locked-next-step-format.md`, `assets/shared/team-update-template.md`.
All examples in this file are fictional per `no-customer-data-in-repo`.

## Step 0: Resolve identity and capability tier (always first)

From the identity config (`assets/shared/identity.schema.md` defines the keys; `setup` generates
the values — never hand-edited, per `identity-config`):

- `{memory_root}` — the user's memory folder (path AND name are per-user; never assume one).
- `{initials}` / `{user_name}` — for the line format and ownership checks.
- `{manager_name}` / `{manager_email}` — the weekly email recipient.
- `{sfdc_tier}` — `mcp` (read-only Salesforce MCP configured — probe that it responds,
  don't assume) or `manual` (no Salesforce integration — the team default).
- `{integrations}` — gates the optional research blocks (hinotes etc.).
- `{fiscal_q1_start_month}` — for quarter bucketing.
- **The manager-decision file** (`{memory_root}/manager-decision.md`) — read ONCE
  here, frontmatter only: `team_publish` mode, `team_publish_trigger`,
  `team_publish_folder`, `update_cadence_day`. A4 (`assets/modes/sweep.md`) branches
  on the resolved mode; A6.3 (same file) consumes this resolution, never a second
  read. Unknown enum, a missing
  REQUIRED key (`team_publish` or `team_publish_folder` — the only two; a missing or
  unknown `update_cadence_day` only unsettles the cadence default, one loud line,
  never a publish skip), or unparseable frontmatter → the mode resolves to
  SKIP-WITH-REASON, naming the refused value or missing key — never a question,
  never an unasked write. `team_publish_folder` must additionally be a relative,
  root-contained path (never absolute, never `..`) under `Team/` whose TERMINAL
  segment is `{user_name}` (the `library_path` precedent, made mechanical) — a
  folder failing this rule is treated as a missing required key: SKIP-WITH-REASON
  naming it. At `team_publish` = `auto-with-notice`, `decided_by` and `decided_on`
  are ADDITIONALLY required (non-empty; `decided_on` a date) — missing or malformed
  → the mode resolves to SKIP-WITH-REASON naming them ("auto publish requires
  recorded provenance"); at `gated`/`off` they stay report-only.

**"Today" always comes from the surface-provided current date — never inferred or recalled.**

**Version notice (weekly sweep only):** per `assets/shared/version-check.md` — compare the
bundle's VERSION against `Team/_engine/latest-version.txt` silently; behind → append the
single-line update notice to this run's output; ahead → apply the self-heal beacon bump and
its one line. Unreachable → skip the notice silently; `doctor` is the loud surface.

**Run header (#52) — every mode, unconditional:** the FIRST line of the run output is
`workos-next-steps {installed} on {surface}` — {installed} = `assets/shared/VERSION`
verbatim (missing → `unstamped dev bundle`), {surface} = `cowork` | `claude-code` (the
value a lock write carries).

**Attended vs unattended (#68):** the run is **unattended ⇔ the invoking prompt
contains the marker "(scheduled, unattended)"** — setup's scheduled task carries it;
no marker → attended. Unattended runs execute §A ONLY, in stage-and-park form (§A0,
`assets/modes/sweep.md`):
never §B or §C, never a question, never an external emission — classification per C15
unattended-classification, mechanics in `assets/shared/unattended-execution.md` (§A0's
probe tiers, park shape, and dedupe rules stay authoritative here). **Same-day dedupe,
before anything else:** read `state/tasks.json → lastUnattendedRun.sweep` (one read,
no lock). That entry's `localDate` equals this run's local date (computed per
identity.schema.md's full `timezone` resolution order) → exit with the run header
plus exactly one further line:
`unattended sweep already completed today at {displayTime} on {surface} ({version}) — skipping`
(`displayTime` = the stamp's `{at}` instant rendered per identity.schema.md's
`timezone` resolution order — never the raw stamp)
— two lines total, nothing else. Fail-open on any ambiguity (absent entry, missing
`localDate`, own date unresolved) → proceed.

**Every question in every mode follows C11** — including ad-hoc gap questions mid-flow
(meeting outcomes, close-date resolutions, on-track/at-risk calls): reframe as structured
numbered options with an escape hatch, never prose asks, and ask through the platform's
structured-question tool so the options are SUBMITTABLE (a prose-rendered "1. … / 2. …"
list is not compliant — live finding 2026-07-16). "Push, closed-won, or closed-lost?"
is a picker, not a sentence.

**Bundle location:** resolve every `assets/` path in this file relative to THIS skill's
own folder — the folder containing this SKILL.md. Under direct .skill upload that is
`.claude/skills/workos-next-steps/` under the session mount; under a plugin install it is
the plugin's skill folder. Never resolve `assets/` in the memory root or project folder.

## Modes — determine SECOND

1. **Weekly sweep** (primary; "run my weekly next steps", "Thursday
   sweep", "finalize the parked sweep", "full sweep" — the every-row escape, §A2's
   full-sweep branch) — §A. **Read `assets/modes/sweep.md` and follow it — that file is
   authoritative for this mode. Do not proceed from this summary.**
2. **Single opportunity** ("next step for {account}") — §B. **Read `assets/modes/single.md`
   and follow it — that file is authoritative for this mode. Do not proceed from this
   summary.**
3. **Delegate** — `workos-sync` or `workos-capture` invoked this skill for format/validation —
   §C. **Read `assets/modes/delegate.md` and follow it — that file is authoritative for this
   mode. Do not proceed from this summary.**

---

## §D. The line kernel (spec source: `assets/shared/locked-next-step-format.md`)

```
{Today MM/DD} {initials} {future action + future date + Name (Title) + specific outcome + brief context}
```

**Hard rules:**
- Leading date = **today** (surface-provided), never the future action date.
- `{initials}` immediately follow the leading date.
- One sentence. **Compose to a ~230-character structural budget** (a line that needs more
  is trying to say too much). **The ≤254 limit is verified mechanically, never
  self-attested:** when a code-execution surface exists (Cowork always; Claude Code
  usually), run a one-line length check with the line as a string literal — e.g. Python
  `len("""{line}""")` or Node `[...line].length` — and record the printed number. No
  execution surface → the ~230 budget stands and the line is marked
  `count unverified — verify before paste`.
- The future action date appears **inside** the sentence and is **after today** —
  rollover rule: a future MM/DD numerically smaller than today's is next year if within
  ~90 days (12/18 → 01/08 is valid).
- Names **with titles** for every contact referenced — resolved per
  `assets/shared/contact-resolution.md` (`Contacts.md` is the registry; never guessed).
  **An unresolved name BLOCKS the line:** resolve via the pre-gate confirmation or
  restructure without the name — the unconfirmed decoration never enters a paste-ready
  line, and an as-given never-confirmed name counts as unresolved (resolution STATUS,
  not visible decoration, is the test).
- The new line **differs materially** from the prior step — not just the leading date.

**Sequencing judgment (silent):** momentum, executive ownership, friction removal vs
activity theater, repeated failed patterns. Kill weak steps instead of polishing them. No
"check-in" language, no passive verbs, no vague phrasing, no premature commercial
escalation. CCS phases are never labeled in the output.

**Example (fictional):**
```
07/15 AB Delivering AI + WFM demo 07/22 to Jane Doe (VP Patient Access) and John Smith (CTO) at Acme Health following their request for a combined solution view.
```
**Counter-example (fails: future date leading, check-in language, no titles, vague):**
```
07/22 AB Following up with the team to check in on status of the evaluation.
```

**Enforcement checklist (silent; regenerate on any failure):** leading date = today ·
initials present · single sentence · mechanically-printed N ≤ 254 (or explicitly marked
unverified) · titles for all contacts (resolved names only — an unconfirmed form OR an
as-given never-confirmed name is a failure) · future date inside the sentence, after today
(rollover rule) · differs materially from prior · close-date check passed (§A3.1,
`assets/modes/sweep.md` / §B4, `assets/modes/single.md`) ·
prior step's three-state provenance recorded.

---

## §E. Salesforce Account Id

`mcp` tier only. Check `00_Account Overview/Account_Context.md` frontmatter for
`salesforce_id` — identity, not deal-state, cacheable with provenance per `no-shadow-store`'s
identity clause. Absent → SOSL on distinctive quoted tokens (strip punctuation first —
hyphens are SOSL-reserved: `FIND {"Acme Health"}`), confirm on zero/multiple hits, offer to
persist with `source/confidence/last_verified`. **Invalidation:** if an opp query by cached
Id returns zero open opps, re-run the SOSL search before concluding the account has none —
Salesforce account merges retire Ids. Opportunity Ids cache too — per entry in each opp's
`Next_Step_Log.md` Observed line (§A6's writer rules), never in frontmatter.

## The §A1 base query and ownership rule

(§A and §B; §A1 runs it owner-scoped, §B2 account-scoped per §E.)

- **`mcp` tier:** live at run time, per `salesforce-read-only-and-optional`:
  `SELECT Id, Name, StageName, CloseDate, NextStep, ForecastCategoryName, Amount,
  LastModifiedDate, Owner.Name FROM Opportunity WHERE Owner.Name = '{user_name}' AND
  IsClosed = false ORDER BY CloseDate ASC`.
- Rows owned by someone other than `{user_name}` are listed for awareness but **never
  updated silently** — flag ownership; explicit confirmation required to include one.

## The opp display rule (all modes)

**Opp display rule (`render-before-gate`): wherever
an opp is referenced — pickers, confirmations, sweep tables, log lines, delegate-mode
included — and its name is known, render `{OppNumber} — {Opp Name}` (+ stage when
already in hand), never a bare number; Name comes from the same §A1 SOQL row or the
opp folder label, no extra query. Pickers additionally: the first line discloses
scope — "{N} open opps found for this account ({filter})" — so an absent expected
opp is diagnosable at a glance, and the not-tied-to-an-opp escape option is always
kept.**

## The §A6 entry format — grammar and writer rules (Next_Step_Log.md)

```
## {YYYY-MM-DD} {sweep|single|delegate}
Observed: NextStep "{verbatim|empty}" · CloseDate {date} · Stage {value} · Forecast {value} · Source {soql|pasted report} · Id {18-char|unknown}
Outcome: changed | kept | unresolved | excluded-owner | no-track
Old: {prior line | "(none — first next step on this opportunity)"}     (changed only)
New: {accepted line}                                                    (changed only)
Reason: {one plain-language sentence}                                   (changed only)
CRM: approved_for_paste
Surface: next-sweep                                                     (optional; non-sweep entries only)
```

This log is the `next-step-history` clause of `no-shadow-store`: an **append-only dated
record of observations and approved lines** — never read back as current deal-state
(current state comes from the tier's authoritative intake, every run). — with ONE
exception, stated: the Observed `Id` segment is IDENTITY, governed by
`no-shadow-store`'s identity clause; it and the `Surface: next-sweep` marker (#266 — a
routing marker read by A2's scope disposition, never deal-state) are the only content
ever read back (the Id as the most recent non-`unknown` value, for link rendering).
**Writers:** an mcp-tier §A or
§B pass writes the Id its own SOQL returned; a manual-tier pass writes `unknown`;
nothing ever writes a value obtained anywhere else — a fabricated Id is the defect
class the never-fabricate discipline exists for. The segment is APPENDED AFTER `Source` (single
layout; a legacy entry's missing segment ≡ `unknown`). C6's triple maps to the entry
itself: source = the entry's `Source`, last_verified = the entry's date, confidence =
`verified` (the only writer of a non-`unknown` value is a live SOQL read).
**Invalidation = re-observation:** every mcp-tier pass re-observes and appends; at
manual or downgraded tiers no invalidation runs — accepted, because an Opportunity Id
is immutable for the life of the opp: the stale case is a deleted opp, which renders a
dead link, never wrong data.

**Header token (#266, forward-only):** the header's trailing token names the writing
pass — `sweep` is RESERVED for §A/finalize observations; a §B pass writes `single`; a §C
caller's append writes `delegate`. Legacy entries (all `sweep`, whatever wrote them) read
as sweep observations — safe: no legacy entry carries a stamp. Everywhere this skill says
"the opp's last sweep observation," it means the last `sweep`-headed entry; an opp with
none (first sighting) treats every stamped entry as live.

**The `Surface: next-sweep` stamp (#266):** optional FINAL line, legal on non-`sweep`
entries only — the writing pass emits it when it judges the entry material for the next
sweep's scope (real movement, not an FYI touch). It rides the entry through the writer's
existing gate — never its own question. Sweep-written observations NEVER carry it. A
stamp counts only on entries after the last `sweep`-headed entry (positional consumption
— no cleanup write; the log-index `stamp` flag, schema §log-index.json, carries detection
across index refreshes).

## Anti-patterns — never

- Treating a stale screenshot or remembered conversation as the prior step when a fresher
  tier-appropriate source exists (at `manual` tier, this week's pasted report is fresh).
- Fabricating names, titles, Notes-block content, or a prior step for a blank field —
  names resolve per `assets/shared/contact-resolution.md`, and an unresolved name never
  ships in a paste-ready line.
- Updating another owner's opportunity without explicit ownership confirmation.
- Claiming a Salesforce write happened, or that a line was "submitted" — lines are
  `approved for paste` until the user confirms otherwise.
- Double-gating in delegate mode, or double-writing the log (the caller is the one writer).
- Caching current deal-state for reuse across runs — the append-only log records history
  and is never read as current state.
- Re-dating an unchanged step to pass the week-over-week rule.
- Skipping renewals because they're no-track — no-track exempts step-language rules only.
- Emitting ANYTHING from an unattended run — a mail draft, a paste block, a log entry,
  a Team/ file (the C5-exempt version beacon excepted), a question. Parking to
  `state/sweep.json` — plus §A0.3's (`assets/modes/sweep.md`) same-batch state writes
  (its stamp, the attention line, the `reports.sweep` merge, the `log-index.json`
  refresh) — is the only unattended output (#68).
- Rebuilding the board from this skill, or writing any `state/` file beyond this
  skill's own set — `sweep.json`, the two `tasks.json` fields §A0.3
  (`assets/modes/sweep.md`) names (attention line,
  `lastUnattendedRun.sweep`), the `run-report.json` merges §A0.3 and the finalize name, and
  `log-index.json` at the two lock-holding sites — sync/tidy own the rest. Writing
  `log-index.json` from a lockless pass (attended fresh sweep, §B, a delegate caller) is
  the #173 violation the schema's writer rule exists to stop.
