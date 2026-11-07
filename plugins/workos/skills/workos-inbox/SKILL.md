---
name: workos-inbox
description: >
  Inbox triage over the mail-write Graph server (mcp-graph): classify all mail since the
  last run into Me · Partner · Waiting · FYI · Route · Archive piles, tag them with your
  own Outlook categories and follow-up flags when the autonomy ladder allows, and stage
  everything else for one review. Triage ("triage my inbox"; a scheduled run carries
  "(scheduled, unattended)"): classify, tag, replace the previous staging, write the run
  report — unattended runs never ask, move, close, or write notes. Review ("review
  inbox"): attended only — one consolidated gate, then guarded archive moves, tasks,
  account notes, board refresh. Attended "triage my inbox" runs triage then review.
  Plugin-only (not in the Cowork bundle) and gated on detecting mcp-graph's mail
  surface — any other connector gets one line and an exit. Never sends, replies,
  forwards, deletes, or marks read. DO NOT attempt without loading — it enforces the
  probe, the autonomy ladder, the lock, and the apply boundary.
---

# workos-inbox — mail is triaged overnight, reviewed once

## Role

You keep the user's inbox down to what needs them. Two passes — **triage** (classify,
tag, stage; attended or scheduled) and **review** (attended only: one gate, then apply).
The mailbox working surface is the user's own Outlook categories and follow-up flags;
everything beyond reversible metadata waits for the review's gate. Contracts (by
reference — never restated): C2 · C4 · C5 (Mail-metadata clause) · C6 (Inbox-state
clause) · C11 · C13 · C14 (Mail-archive clause) · C15. Spec of record:
`docs/superpowers/specs/2026-11-04-inbox-triage-design.md` (epic #315).

**Plugin-only (spec §15a):** this skill ships through the Claude Code plugin, never as a
Cowork `.skill` bundle, and runs only where the mcp-graph mail surface probes present
(Step 0.5). No degraded O365-only path exists in v1 (#322).

**Bundle location:** resolve every `assets/` path in this file relative to THIS skill's
own folder — the folder containing this SKILL.md. Under a plugin install that is the
plugin's skill folder; under a direct copy it is `.claude/skills/workos-inbox/`. Never
resolve `assets/` in the memory root or project folder.

**State schema:** `assets/shared/state-schema/README.md` is normative for every field
this skill reads or writes — `state/inbox.json`, the inbox `pendingApprovals` kinds and
their apply boundary, `suppressed.inbox`, and `run-report.json → reports.triage`.

## Step 0 — every run

1. **Run header (#52):** first output line: `workos-inbox {installed} on {surface}` —
   {installed} = `assets/shared/VERSION` verbatim (missing → `unstamped dev bundle`),
   {surface} = `claude-code` | `cowork`.
2. **Config (C2):** resolve `{memory_root}`, `{user_name}`, `{timezone}` and the inbox
   keys via `core.md`; each key's absent-default is its row in
   `assets/shared/identity.schema.md` (sole authority — summarized here so a reader
   can act):
   - `inbox_autonomy_level` — absent ≡ 0. User-edited only (see the ladder below).
   - `inbox_categories` — absent ≡ `{me: Me, partner: Partner, waiting: Waiting,
     fyi: FYI, route: Route, archive: Archive}`.
   - `inbox_thresholds` — absent (or a missing sub-key) ≡ the row's example values:
     `fyi_aging_days 7 · actionable_days 10 · invite_grace_days 2 · waiting_window_days
     [2, 30] · chase_bd {external: 3, internal: 2} · rule_suggest_nights 10 ·
     domain_asks_per_night 3`.
   - `inbox_leadership`, `inbox_route_roles`, `account_domains` — absent ≡ empty.
   - `inbox_patterns` — a configured family REPLACES that family's seed; an unconfigured
     family keeps its seed. **Seed families** (the absent-default; matched
     case-insensitively — calendar, newsletter, and actionable against the subject,
     awareness against the subject AND the sender address (a configured entry may name
     a distribution mailbox), system senders against the sender address, auto/bounce, ask, ack, and
     finance cues against subject + preview; actionable/ack/finance encode spec §6.2
     rules 2/6/9):

     ```
     calendar:       ^(accepted|declined|tentative|tentatively accepted|canceled|cancelled|updated invitation|new time proposed)\s*:
     auto_bounce:    automatic reply|out of office|undeliverable|delivery has failed|read:|recall:|reacted to your
     system_senders: noreply|no-reply|donotreply|do-not-reply|notifications@|postmaster|mailer-daemon
     newsletter:     newsletter|digest|webinar|you're invited|register now|save the date|survey|episode \d
     awareness:      enablement|training|knowledge transfer|all hands|town hall|field readiness|release notes|office hours
     ask_cues:       \?|can you|could you|would you|please|let me know|confirm|need (you|your)|any update|following up|circling back|checking in|action required|do you have
     actionable:     action required|waiting for your feedback|pending your approval
     ack:            ^\W*(thanks|thank you|got it|sounds good|will do|noted|received)\b
     finance:        invoice|statement|remittance|past due|open items|collections|payment status|accounts payable|accounts receivable|w-9
     ```

     Tenant-specific mailbox names (internal broadcast, enablement, corporate comms) and
     leadership senders are NEVER seeded — setup asks for them and the review learns them.

   **Capture {today}/{now} ONCE here** from the surface-provided date/time (the
   workos-sync Step 0.1 precedent): every use this pass — ids, `raisedAt`, watermarks,
   journal month, "next business day" — uses the captured values; only lock heartbeats
   use live now. Clock values render per identity.schema.md's `timezone` row.
3. **Mode — trigger word wins:**
   - **triage:** "triage my inbox" (and the scheduled form). Attended → run TRIAGE, then
     REVIEW in the same session (each section takes its own lock and usage pair; the
     Step 0.5 probe result carries over — no second probe).
   - **review:** "review inbox", or the sync/tidy aggregate line pointing here → REVIEW.
   - Ambiguous → one question (C11): "1. Triage my inbox — classify, tag, then review /
     2. Review inbox — work the staged items / 3. Stop."
4. **Attended vs unattended:** unattended ⇔ the invoking prompt carries the marker
   `(scheduled, unattended)`; no marker → attended. Unattended runs TRIAGE only and
   classify per C15 unattended-classification (mechanics, the RUN_REPORT line, and write
   order: `assets/shared/unattended-execution.md`) — zero questions, zero moves, zero
   closures, zero account notes. REVIEW is attended-only: review words under the marker
   run TRIAGE with one line: `review is attended-only — ran triage; say 'review inbox'`.
5. **Probe (C13) — every session, before the lock and before any state read-for-write:**
   connector tool names may carry a host prefix (e.g. `mcp__…__outlook_mail_folders`) —
   match on the suffix.
   - **(a) Mail surface:** no tool named `outlook_mail_folders` is listed → output
     exactly the run header and then this one line, and stop:
     `inbox triage needs the mail-write server (mcp-graph) — not available on this connector`
     — no lock, no state read or write, no usage record, no questions (an early exit
     that did no work). Unattended: the same two lines, then the pre-lock blocked line
     (`assets/shared/unattended-execution.md` §BLOCK case 5 — run output only, nothing
     is written):
     `RUN_REPORT triage blocked — mail-write server (mcp-graph) not on this connector ({version} on {surface})`
   - **(b) Write gate:** call `outlook_mail_folders` once; read `mailWrites
     {enabled, scopeOk, tools}`. Writes are usable only when `enabled` is `true` AND
     `scopeOk` is `true` (`false` or `null` → not usable). The call itself errors → treat
     as not usable and say so in the capability line.
   - **(c) Categories:** every value of `{inbox_categories}` must appear by name
     (case-insensitive) in the response's `masterCategories[].name`. For EACH missing
     one, one setup line: `Outlook category '{name}' is missing — create it in Outlook
     (suggested color {color}), then re-run; no mail writes this run` — suggested colors
     Me red · Partner orange · Waiting yellow · FYI blue · Route purple · Archive gray
     (a renamed category takes its pile's color).
   - **(d) Write tools listed:** `outlook_mail_set_categories` and
     `outlook_mail_set_flag` (tag) and `outlook_mail_move` (move). A tool can be
     enabled server-side yet absent from a cached connector tool list.

   **The ladder — `{level}` (spec §7.1):**

   | `{level}` | Unattended triage | Review applies |
   |---|---|---|
   | **0 report** | classify, stage, report — the mailbox is untouched | tasks + notes only; lists what to do by hand |
   | **1 tag** | + apply/remove this skill's categories and set/clear flags | + flag changes; the Archive pile tagged gray for a bulk archive by hand |
   | **2 move** | same as 1 — unattended never moves | + Archive moves with stored guards |

   Probe ceiling: 0 when (b) is not usable, or (d) lacks either tag tool, or
   `mailWrites.tools` lacks `categories` or `flag`; 1 when (b) is usable, both tag tools
   are listed, and `mailWrites.tools` includes both `categories` and `flag`; 2 when
   additionally `outlook_mail_move` is listed and `mailWrites.tools` includes `move`.
   Any missing category in (c) → ceiling 0. **`{level}` = min(`inbox_autonomy_level`,
   probe ceiling).** The skill never raises, writes, or suggests raising
   `inbox_autonomy_level`.
   - **`{reason}` vocabulary (both lines below; join several causes with ` · `):**
     `write gate off` (`enabled` not true) · `scope` (`scopeOk` false or null) ·
     `probe failed` (the call errored) · `missing tool {name}` (a connector tool, or a
     `mailWrites.tools` entry `categories` | `flag` | `move`) · `missing category
     '{name}'`.
   - **Capability line (loud, one line):** when (b) is not usable, or (d) or
     `mailWrites.tools` lacks a tool the configured level needs (a tag tool at configured ≥1, the move tool at
     configured 2): `⚠ mail writes unavailable ({reason}) — running L{level}; reconnect
     the connector if writes were just enabled` — never an error, the pass continues. A
     tool the configured level does not need is never reported.
   - **Downgrade line (loud, one line, whenever `{level}` < `inbox_autonomy_level`):**
     `⚠ inbox autonomy downgraded: configured L{configured} → running L{level} —
     {reason}`. Output order after the header: setup lines, capability line, downgrade
     line.
   - At `{level}` 0 this pass makes **zero** calls to any mail write tool — not even a
     dry-run preview.
6. **The lock (C4):** acquire as pass `triage` (TRIAGE) or `review` (REVIEW) — full
   protocol by reference to workos-sync Step 0.4 (absent/tombstone acquire with a fresh
   `runId` · heartbeat after every user answer and each phase · ownership check before
   every state write batch · verified tombstone release as the final action, never
   delete). That `runId` is the pass's id everywhere: the lock, the usage pair, and the
   `runId` argument on every mail write call. Unattended + a live sibling lock → yield
   per `assets/shared/unattended-execution.md` §BLOCK case 2 (run output only).
7. **Usage log (open):** immediately after the lock is yours, append the `open` record
   per `assets/shared/usage-log.md` (`skill: workos-inbox`, `mode`: `triage` or
   `review`, `runId` = this pass's lock runId). A failed append is never fatal — one
   `system` line in `attention[]`, and the pass continues. **Close:** immediately before
   releasing the lock, append the `close` record per that document's outcome mapping
   (not restated here); an error you survive appends `close` with outcome `error` first,
   then releases.

## TRIAGE

TRIAGE asks **no questions** in either mode — every decision a human owns is staged for
REVIEW (an attended run reaches REVIEW next). It never moves mail, closes or creates
tasks, or writes account notes (C15; C14 Mail-archive clause). Rules first: the model
judges only what T4's rules leave unsettled (spec §6.1, §12).

### T1 — Lock, then read state

Step 0.6 lock as pass `triage`; Step 0.7 usage open. Then read: `state/inbox.json`
(absent → `lastTriage`/`lastReview` null, empty `items`/`taskLinks`/`ruleCounters`),
`state/tasks.json` (lanes, `pendingApprovals`, `lastFullSync`), `state/suppressed.json`
(`inbox`, `approvals`). An unparseable `inbox.json` or `tasks.json` → unattended:
`assets/shared/unattended-execution.md` §BLOCK case 4; attended: one loud line naming the
file, usage close `error`, release — no mail call.

### T2 — Scope (reads only)

- `{since}` = `lastTriage`; null → `tasks.json` `lastFullSync`; null → start of the
  previous business day. **Business day** = Mon–Fri, counted from `{today}`.
- Every read is `outlook_email_search` with `compact: true`, `previewChars: 200`,
  `top: 50`, paging on `coverage.nextCursor` (same other arguments) until none returns.
  No item caps.
  - **A — the Inbox, whole** (`folder: inbox`, no date bound). Not
    `latestPerConversation` — rule 8 needs a thread's older messages. A message with
    `receivedDateTime` > `{since}` is **new**; the rest are re-evaluated (FYI aging,
    Waiting flips, the user's Outlook actions). Mail the user's own Outlook rules filed
    elsewhere is not triage's.
  - **B — Sent** (`folder: sentitems`, `after` = `{today}` − `waiting_window_days[1]`
    days, `latestPerConversation: true`).
- Dedupe by `id` across reads. `{self}` = the `from` address on B's results (the mailbox
  owner); `{own_domain}` = its domain. B empty → one `folder: sentitems, top: 1` read
  (no date bound) for `{self}`; still none → internal/external is judged.
- `coverage.truncated` on any read → loud line `⚠ inbox scan truncated ({A|B}) — items
  not reached keep their tracked state` in the output and as one `system` attention
  line (source `inbox`). A truncated read proves nothing absent: no "missing" signal
  (T5) fires from it, and it holds back the watermark (T9 step 3 — covered-through point).

### T3 — Threads and sender class

Group A ∪ B by `conversationId`. An A message is **handled** when a B message in its
conversation is newer; **superseded** when a newer A message from someone ≠ `{self}` is
in its conversation. Sender class (lowercase sender domain/address): **protected** —
domain in an `account_domains` entry (`account` → customer, `partner` → partner);
**leadership** — address matches an `inbox_leadership` entry (`*` is a wildcard);
**internal** — domain = `{own_domain}`; else **external**. **Direct** = `{self}` in To.
**Ask** = an `ask_cues` match on subject + preview.

### T4 — Classify (spec §6.2 — first match wins)

Every A message gets exactly one `pile` + `reasonCode`; B messages are tested by rule 11
only. Families are Step 0.2's `inbox_patterns`; thresholds are `inbox_thresholds`.

1. **Protected sender** — handled → `archive`/`protected-handled` + closure evidence
   (T6); superseded → `archive`/`protected-superseded`; a `finance` cue with an ask →
   `route`/`finance`; otherwise `me`/`customer` or `partner`/`partner`. Protected
   archives are approvable **per thread only**, never per sender family. Rules 2–11
   never reach a protected sender — a customer's "thanks" as the latest message is Me.
2. **Actionable system** — `actionable` subject match, received ≤ `actionable_days`
   ago → `me`/`actionable`, even from a system sender.
3. **Leadership** — direct with an ask → `me`/`leadership`; else `fyi`/`leadership`.
   Never archived unread (T5 is its only archive path). Exception: a `calendar` or
   `auto_bounce` subject from leadership is rule 5 noise — by subject, not sender.
4. **Awareness** — `awareness` match → `fyi`/`awareness`.
5. **Noise** → `archive`: `auto_bounce` (`noise-auto`); `calendar` subject prefix —
   by subject, never by sender (`noise-calendar`); `system_senders` (`noise-system`);
   `newsletter` from an external sender (`noise-marketing`); an internal message with
   `{self}` in neither To nor Cc (`noise-blast`) — **unless its sender is an unknown
   internal list** (matches no `awareness`, `system_senders`, or `inbox_leadership`
   entry and is no `suppressed.inbox` `domain-ignore` or active `override` target): keep-bias
   → `fyi`/`internal-list` until the user answers T6's ask, never Archive; a meeting invitation whose meeting is
   more than `invite_grace_days` past (`noise-invite`).
6. **Ack** — `ack` match on the preview with no ask → `archive`/`ack`.
7. **Handled** → `archive`/`handled` + closure evidence (T6).
8. **Superseded** → `archive`/`superseded`.
9. **Route** — a `finance` cue with an ask → `route`/`finance`; mail about an account
   absent from `account_domains` that is not the user's (judged) → `route`/`not-mine`.
   Suggested recipient: the `inbox_route_roles` role that fits; none fits → none.
10. **Recent direct** — direct, To + Cc ≤ 5 recipients, ask → `me`/`direct`; internal,
    no ask → `fyi`/`direct`; `{self}` only in Cc of an internal message with To + Cc > 5
    and no family match → `archive`/`broad-cc`.
11. **Waiting** (B only) — the user's message is the latest in its conversation, sent
    `waiting_window_days[0]`–`[1]` days ago, has an ask, To holds someone ≠ `{self}` →
    `waiting`/`waiting`; **chase date** = sent date + `chase_bd.external` business days
    when any To recipient is external, else `chase_bd.internal`.

**No rule settles it** → the model judges with keep-bias (Archive vs FYI → FYI; FYI vs
Me → Me), reasonCode `judged`. The model never re-judges a message a rule settled.

### T5 — Re-evaluate tracked items

For each `inbox.json` item, matched by `immutableId`; `firstSeenAt` never changes while
an item stays tracked:

- **FYI lifecycle (spec §6.3):** pile `fyi` and `isRead` true → `archive`/`fyi-read`.
  Unread with `firstSeenAt` older than `fyi_aging_days` → counted into
  `{N} unread FYI aging — keep / archive` (run output; REVIEW re-derives it) — never
  staged, never moved.
- **Waiting flip (spec §9):** a tracked `waiting` item whose conversation now has a newer
  A message → it leaves Waiting (T7: category removed, flag `complete`) and becomes an
  evidence item (`waiting-replied`, below); its `waiting-them` task gets a `closure`
  (evidence: the reply arrived); the reply
  classifies through T4 on its own (a case that needs feedback → `me` by rule 2).
- **Linked task closed:** a `taskLinks` task no longer open in `tasks.json` → its mail
  gets flag `complete` (T7) and `archive`/`task-closed`; the `taskLinks` entry drops.
- **Outlook actions as evidence** — the next subsection.

### Outlook actions as evidence (spec §8 rule 2 — REVIEW reuses this)

The user's own Outlook action on a tracked item is input, read from this run's A/B
results (reply, cleared flag, and removed category matter for `me`, `partner`, `waiting`,
`fyi`, `route`; self-archive for every Inbox pile):

| Signal | Detected when |
|---|---|
| **reply** | a B message in the item's conversation is newer than the item's message |
| **cleared flag** | the item carries `flagged` (this skill set its flag) and the flag is now `notFlagged` or `complete` |
| **self-archive** | an Inbox item (any pile but `waiting`, `archive` included) is absent from an untruncated A — moved, archived, or deleted by the user |
| **removed category** | the item carries `tagged` and its pile category is gone from `categories` |

`tagged` is the item's extension field — the instant this skill last applied its
category (T7); `flagged` likewise for a flag this skill set (cleared again → removed).
No `tagged` → no removed-category signal; no `flagged` → no cleared-flag signal and
T7 never clears that flag (it is the user's).

Each signal yields:
1. **A closure proposal** for the item's task. The `taskLinks` task holding the item's
   id → that task. Else an open task on the same account (sender domain →
   `account_domains`) whose title/context fits the thread's participants and matter →
   a proposal with that evidence, never a silent link. Else nothing to close. Evidence
   = `{signal} {date}` — `replied` · `flag cleared` · `archived` · `category removed` ·
   `reply arrived`, e.g. `replied 2026-11-04 (email)`; `{date}` = the signal's date.
2. **The item leaves the action piles** — its pending `inbox-task-new` is not
   re-derived (T8 retires it), and it is never again tagged or flagged as Me/Partner/
   Waiting. Reply (wins when several signals fire) → the message re-classifies by rule 7
   (`handled` archive; `protected-handled` for a protected sender) while it stays in the
   Inbox, and T7 treats it like any `archive` message (Archive tag; its own flag
   cleared). Cleared flag / removed category → reasonCode `user-cleared` /
   `user-untagged`. Self-archive → reasonCode `user-archived` — never an error, never
   "missing".
3. **Evidence persists until the closure exits review** (spec §8 rule 1 — a skipped
   week loses nothing). An item with a closure proposal is an **evidence item**:
   reasonCode `user-cleared` · `user-untagged` · `user-archived` · `waiting-replied`
   (or `handled` / `protected-handled`), `taskId` = the proposed task, and its last pile
   kept. It stays in `items` while that task is open in `tasks.json`, and each night
   re-derives its `closure` and `inbox-note` unchanged — same targets, so T8 keeps the
   same `appr-` ids. A `user-*` / `waiting-replied` item is, from the night after its
   signal, skipped by T4 and T7 (never re-tagged or re-classified) and stages nothing
   else — no `inbox-archive`, no task. A `handled` item is still re-derived from the
   mailbox (rule 7) and keeps its `inbox-archive` while in the Inbox. Task closed
   → the item drops (an `archive`/`task-closed` proposal first if it is still in the
   Inbox). With no task to close, `user-archived` / `waiting-replied` items drop at once
   and `user-cleared` / `user-untagged` stay only while in the Inbox.

### T6 — Build proposals (nothing applies)

- **Archive:** every `archive` message → `inbox-archive` (target = its immutable id) —
  **except** under an active `suppressed.inbox` `override` (`reconsiderAt` null or
  after `{now}`) whose target is the message's sender family (T9's family key), sender
  domain, or immutable id (a REVIEW item decline): the message keeps its pile, reasonCode, and T7 category, but no
  `inbox-archive` is staged (the user declined archiving that family).
  At `{level}` 2 only, capture guards: `outlook_mail_move` dry run (`folder: archive`,
  no `confirm`, `runId`) in ≤100-item chunks → each item's `guard` onto its
  `inbox.json` item. The dry run moves nothing; a move guard covers the folder only, so
  T7's tag writes never stale it. Below 2, no guard — REVIEW previews.
- **Conversation overrides:** a `suppressed.inbox` `override` whose target is a
  `conversationId` (a REVIEW task or route decline) is active while `reconsiderAt` is null
  or after `{now}` AND no message in that conversation from someone ≠ `{self}` was received
  after its `decidedAt` (new mail is new evidence). Active → that conversation stages no
  `inbox-task-new` and no `inbox-route`; its pile, category, and flag are unchanged.
- **Tasks (spec §9):** every latest-of-thread `me`/`partner` message and every `waiting`
  item with no `taskLinks` task → `inbox-task-new` (target = its `conversationId`). The
  proposed task: a title worded as the action ("not enough context yet" is still a task,
  worded as what's missing — "need pricing from deal desk"), the account, and signal
  `waiting-them` (Waiting) or `admin` — `due-date` with `due` only when the mail names a
  date. **Dedupe first** (workos-sync S3 dedupe seam): an open task on the same account
  and action, or ANY entry in `{memory_root}/Accounts/{account}/Account_Notes.md` Open
  Commitments → no proposal (reference, never duplicate). Read Open Commitments only for
  accounts with a candidate.
- **Closures:** T4 rules 1/7 handled, the T5 Waiting flip, and every Outlook-action
  signal that matched a task → `closure` (target = task id; no task → no closure; summary `{task} — {evidence} — done|progressed`;
  an account with an open opportunity appends `next step may be stale — run
  next-steps`). Each closure on a task with an account also stages its **`inbox-note`**
  (target = the same task id; `{date}` = the evidence date), the exact text: a matching Open Commitments bullet → that bullet completed in
  place (`- [x] …` + completion date + `(email)`); none → the capture-grammar touch line
  `- {date} touch [[{Account}]]: {what happened} (email)` for `journal/{YYYY-MM}.md`.
- **New domains (spec §6.4):** an external sender domain not in `account_domains`, not
  `{own_domain}`, not a `suppressed.inbox` `domain-ignore` target, writing direct on a
  message no rule 1–6 settled → `inbox-domain` (target = lowercase domain).
  Suggestion: the account whose mapped domain is another participant on the same
  thread; else none. Pending `inbox-domain` items never exceed `domain_asks_per_night`:
  already-pending ones keep their slots, new candidates fill the rest (most messages
  first, then earliest received), extras wait for a later night.
  **Internal lists share the cap (spec §13):** every `internal-list` sender (T4 rule 5) →
  an `inbox-domain` candidate with target = its lowercase address (an `@` in the target
  marks the internal-list flavor; summary `internal list`, no suggestion), ranked with
  the domain candidates in the same `domain_asks_per_night` slots.
- **Route:** every `route` message → `inbox-route` (target = its `conversationId`;
  summary = the reasonCode + suggested role) — none under an active conversation override.
- Every proposal: `raisedBy: inbox`, `raisedAt`/`lastSeenAt` = `{now}`. `summary`/`diff`
  are the skill's own words — no subject, preview, quoted text, or sender/recipient
  address (C6 Inbox-state clause); REVIEW renders those live from Graph by target.

### T7 — AUTO writes (`{level}` ≥ 1 only — C5 Mail-metadata clause)

Desired state per message; skip `user-*` items and any message the user moved, and
send only messages whose current categories or flag differ from the desired state. "This
skill's categories" = the six `{inbox_categories}` values; any other category is the
user's and never touched.

Every pile row sets that pile's category and removes the other five.

| Pile | Category | Flag |
|---|---|---|
| `me`, `partner` | Me / Partner | `flagged`, due next business day — only when not already flagged |
| `waiting` | Waiting | `flagged`, due = chase date (a past date still sets — it shows overdue) — only when not already flagged with that due |
| `fyi`, `route` | FYI / Route | none; a flag this skill set (`flagged`) → `notFlagged` |
| `archive` | Archive (gray) | `task-closed` → `complete`; else a flag this skill set → `notFlagged` |
| leaving Waiting (T5 flip) | Waiting removed | `complete` (flip and `task-closed` set it with or without `flagged`) |

Mechanics (spec §7.2): group items by identical arguments (one
`outlook_mail_set_categories` add/remove set; one `outlook_mail_set_flag` status + due);
per group, chunks of ≤100: dry run (no `confirm`) → `confirm: true` with each item's
`guard`; `runId` = this pass's lock runId on every call, dry runs included.
- `applied` / `noop` → done; set `tagged` = `{now}` (category calls) and `flagged` =
  `{now}` on a `flagged` status (cleared/complete → drop `flagged`).
- `changed_since_preview` → re-preview those items once and apply; changed again or moved
  → skip this run ("already moved" — never an error).
- `failed` with `retryable` → resume once: `confirm: true` with only those items and
  their dry-run guards; any other `failed` or
  `refused` → one `system` attention line naming the immutable ids.
- Tool error `unknown_category` or `scope_missing` → stop all mail writes this run, print
  the matching Step 0.5 line, continue as L0 (staging still happens).
- After the last apply: `read_resource type=mail_audit runId={runId}` (page on
  `nextCursor`) — every `applied` item must appear; a mismatch → one `system` line
  naming the immutable ids (nothing applied → no audit read). `auto` = the number of
  distinct messages with ≥1 `applied` write.

At `{level}` 0 none of T7 runs — zero mail write calls (Step 0.5).

### T8 — Supersede and stage (spec §8 rule 1)

Re-read `tasks.json` under the lock. Compare T5–T6's proposals with the `pendingApprovals`
items that have `raisedBy: inbox` and kind `closure` or `inbox-*` — normalized kind +
target, per the schema's durable-queue rules:
- **pending and re-derived** → dedupe update: id kept, `raisedAt` immutable, `lastSeenAt`
  = `{now}`, `summary`/`diff` refreshed, no raise pointer;
- **new** → a new `appr-` id, raise pointer appended and verified first;
- **pending, not re-derived** → **retired** exit (pointer, then removal) — it no longer
  validates.

Items raised by other passes are untouched. **Cross-pass closure:** a re-derived
`closure` whose normalized kind + target matches a pending item raised by another pass
(e.g. sync's closure on the same task) raises nothing new — never a second `appr-` id on
the same kind+target (schema dedupe on raise) — and that item stays the other pass's. Its
paired `inbox-note` is still staged (`raisedBy: inbox`), so the mail evidence reaches
REVIEW beside that item (R3 CLOSURES, note-only form). Staging therefore equals exactly this run's
derivation: unchanged items keep their `appr-` ids, and un-reviewed nights never stack.
Zero new mail takes the same path — A still re-evaluates the Inbox, staging is
re-derived (never emptied, never padded), the watermark still advances; never an error.

### T9 — Close (order: `assets/shared/unattended-execution.md` §Write order)

1. Journal pointers (T8), each verified.
2. `tasks.json`: the `pendingApprovals` merge, any T2/T7 attention lines, and —
   unattended only — `lastUnattendedRun.triage` (merge own key; schema stamp rules).
3. `inbox.json` (restamp `generated`, `generatedBy: inbox`): `items` = every message
   tracked this run (`immutableId`, `pile`, `reasonCode`, `firstSeenAt` kept or
   `{now}`, `guard?`, `taskId?` from `taskLinks` or an evidence item's closure,
   `tagged?`, `flagged?`) — evidence items included; `taskLinks` kept (entries
   drop when their task closes); `ruleCounters` — per noise family that produced ≥1 rule-5
   archive this run (family = `calendar` / `auto_bounce` / `invite` by pattern; else the
   lowercase sender domain, or full address for an internal sender; never leadership): `nights` +1 once per local date, `lastAt` = `{now}`; a
   `suppressed.inbox` `override` that is active (as in T6) on the family resets it to 0 instead; **`lastTriage` =
   captured `{now}`, written last** — after a truncated read (T2), the scan's
   covered-through point instead: reads return newest-first, so a truncated read whose
   oldest returned `receivedDateTime` is ≤ `{since}` reached all new mail (`{now}`);
   otherwise the previous `lastTriage` is kept unchanged (the unreached gap sits just
   after `{since}` — sync's delta must still cover it).
4. Unattended only: `run-report.json` `reports.triage` — `{at, localDate?, version,
   surface, outcome: completed, counts: {auto, queue}, queueByClass, summary}`;
   `queueByClass` over the C15 triage set, counting items raised or dedupe-refreshed this
   run; `counts.queue` = its sum.
5. Usage close (Step 0.7), then the verified tombstone release.

Output (`scanned` = distinct A ∪ B messages; `staged` = inbox-raised pending items after
T8): `triage {today}: scanned {n} (new {m}) · Me {a} · Partner {b} · Waiting {c} ·
FYI {d} · Route {e} · Archive {f} · {k} unread FYI aging · staged {s} · auto {x}`.
Unattended then prints `RUN_REPORT triage completed — auto {n} · queued {n}
[{queueClass}: {n}, …] ({version} on {surface})` — class = the item's kind, zero
classes omitted, nothing queued → `[]`. Attended continues to REVIEW.

## REVIEW

Attended only. Under the `(scheduled, unattended)` marker Step 0.4 runs TRIAGE instead
with its one line — not a §BLOCK case: triage IS this skill's unattended pass (capture and
handoff refuse because they have none). REVIEW renders, gates once (C11, C14), then
applies; every user-meaningful write waits for the gate (C5). Mail calls obey Step 0.5's
`{level}`: at 0, zero mail write calls (reads are fine).

### R1 — Lock, read, collect

Step 0.6 lock as pass `review`; Step 0.7 usage open (`mode: review`). Read `inbox.json`,
`tasks.json`, `suppressed.json` (T1's unparseable rule, attended form). **Staged** = the
`pendingApprovals` items with `raisedBy: inbox` and kind `closure` or `inbox-*` — REVIEW
applies only these (schema apply boundary); items raised by other passes are untouched.
Nothing staged, no rule suggestion (R3 §Rule suggestions), and no aging FYI → one line
`inbox review: nothing staged`, `lastReview` = `{now}` (inbox.json write), usage close,
release.

### R2 — Re-validate first (spec §7.2, §8 rule 2)

The mailbox may have moved since triage — the user read, filed, flagged, re-categorized,
or replied on a phone. None of it is an error or a re-proposal.

1. **Fresh reads:** T2's reads A and B (same arguments, `{since}` = `lastTriage`). An
   attended "triage my inbox" reaching REVIEW in the same session reuses that triage's
   reads — no second read.
2. **Outlook actions:** run the "Outlook actions as evidence" subsection over every
   tracked item on these reads (the same signals, evidence wording, and three outcomes).
   A signal that proposes a closure on a task with no pending closure (any pass; another
   pass's pending closure → only its `inbox-note`, note-only per T8) → a NEW `closure`
   (+ its `inbox-note`, built as T6 Closures) given its `appr-` id now (schema id rule) and
   rendered in CLOSURES marked `new since triage`; its raise pointer is appended and
   verified in R4.3 before its exit pointer (or before it is written pending) — option 4
   raises nothing (the next triage derives it). The item's pending
   `inbox-task-new` / `inbox-route` no longer validates → **retired**, rendered
   `{id} — retired: {signal} since triage` in its section; applies nothing.
3. **Other re-validation (schema "retired" exit):** a `closure`/`inbox-note` whose task is
   no longer open in `tasks.json` → retired (`task already closed`); an `inbox-task-new`
   whose conversation now has an open task on the same account and action, or an Open
   Commitments entry (T6 dedupe) → retired (`already tracked`); an `inbox-domain` now in
   `account_domains` or a `domain-ignore` target, or an internal-list address that now
   matches an `awareness` / `inbox_leadership` entry → retired.
4. **Staged moves:** an `inbox-archive` target absent from an untruncated A → **already
   moved** (the user filed it): rendered `{id} — already moved` in ARCHIVE, exits
   retired at apply, never an error and never re-proposed. Present in A → still valid;
   read, re-flagged, or re-categorized mail still archives (the guard covers the folder
   only — spec §13 cases 11–12). At `{level}` 2 **re-preview**: `outlook_mail_move` dry
   run (`folder: archive`, no `confirm`, `runId`) over the still-valid targets in ≤100
   chunks. A returned guard ≠ the stored `guard` (or no stored guard) → that item
   **re-renders** with its live row, and the new guard replaces the stored one; `noop`
   (already in Archive) → already moved. A truncated A proves nothing absent — no
   "already moved" from it; the re-preview decides at `{level}` 2, else the item stays.
5. **FYI aging:** re-derive T5's count — tracked `fyi` items, unread in A, `firstSeenAt`
   older than `fyi_aging_days`.

### R3 — The gate (C11, C14 Mail-archive clause)

One consolidated gate. Subjects, senders, and dates render **live** from R2's reads by
target (never from state, C6 Inbox-state clause); compact row = `sender · subject
(≤60 chars) · reason`. Header + bullets per section, blank line between sections, every
header always shown (`(none)` when empty), **this order:**

1. **CLOSURES** — `{id} — {taskId} {title} — {evidence} — done|progressed`, its `next step may be
   stale — run next-steps` tail when the summary carries it, then the paired
   `inbox-note` `{id}` and its **exact text** on the next line (`{date}` = the evidence date) (the `- [x] …` bullet or
   the touch line, below). Names in note text: `Name(Title)` resolved per
   `assets/shared/contact-resolution.md` from the account's own `Contacts.md` — read for
   closure accounts only (spec §6.4), rendering only: no confirmation question, no
   `Contacts.md` append (no registry write right here); an unresolved person renders in
   that procedure's step 4 form. A **note-only** `inbox-note` (T8 cross-pass closure)
   renders `{id} — note only: {taskId} {title} — {evidence} — closure {otherId} queued by
   {raisedBy} (decided in that pass)` + its exact text; option 1 applies the note alone
   (R4.2), never the other pass's closure.
2. **NEW ME TASKS** — `{id} — {title} — {account} — {signal}[ due {due}]` + the
   conversation's latest message as a compact row; Waiting's `waiting-them` proposals
   list here too, tagged `waiting`.
3. **ARCHIVE** — grouped by sender family (T9's family key), group header `{family} ·
   {n}`; EVERY item rendered as `{id} — {compact row}` (C14 Mail-archive clause), then
   the already-moved lines. Protected senders form their own group `protected — per
   thread`: approvable per item only, never as a family. Below `{level}` 2 the header
   reads `ARCHIVE — by hand (L{level}: no moves)`.
4. **ROUTE** — `{id} — {compact row} — forward to {role}` (`no role fits` when none).
5. **NEW DOMAINS** — `{id} — {domain} — {n} message(s) — suggested: {account} ({type})`
   or `no suggestion — answer via 2`. Answers: map to an account · partner · ignore. An
   internal-list item renders `{id} — {address} — internal list — {n} message(s) — answer
   via 2: awareness · leadership · noise` (C11 options when drilled into; no suggestion,
   so option 1 leaves it pending).
6. **WAITING (FYI)** — read-only status, nothing here applies: each tracked `waiting`
   item `to {first To recipient} · {subject} — chase {date}` (T4 rule 11's chase date from
   its sent date; a past one marked `overdue`), then the
   line `{N} unread FYI aging — keep / archive` (N > 0 only).
7. **RULE SUGGESTIONS** (only when ≥1; spec §7.4) — see below.

**Options (C11):** `1. Accept all as shown / 2. Adjust named items / 3. Decline a family or
item / 4. Stop — apply nothing`. The options line names, BY ID, what option 1 applies
(C14). **Self-check line (audible, printed above the options):** `gate check: {k} of {k}
staged ids rendered · option 1 applies {a} · by hand {h} · leaves pending {p} · retired {r} ·
declined {x}` — `{k}` = every id the gate renders: the staged count at R1 plus the ids R2
raised (its new closures + notes) = a + h + p + r + x (already-moved and R2-retired ids
stay rendered and count in `{r}`; option-3 declines in `{x}`); a mismatch is a render defect: re-render before asking. Option 1 applying
nothing → the options line names what stays pending instead.

Option 1 applies every rendered proposal except: `inbox-domain` with no suggestion and
`inbox-route` items — both **stay pending** (a route applies nothing to the mailbox; the
pending item is its record, so it is never re-raised as new, and it retires once the user
forwards or files it); and below `{level}` 2 the ARCHIVE items, which also stay pending
for the user's bulk archive (the next triage retires what was filed).

- **2 — Adjust:** the user names ids; echo `{id} — {original line}` verbatim, then take
  the change: closure done ↔ progressed or note wording; task title / signal / due; a
  domain answer (map to {account} · partner {name} · ignore); an internal-list answer
  (awareness → `inbox_patterns.awareness` += its escaped address · leadership →
  `inbox_leadership` += it · noise → a `domain-ignore` on the address: never asked
  again, and T4 rule 5 archives it as `noise-blast`); a route role; archive the
  aging FYI (those messages join ARCHIVE by immutable id, re-preview at `{level}` 2);
  leave an item pending; or teach the config — a sender is an awareness mailbox
  (`inbox_patterns.awareness` += its address) or leadership (`inbox_leadership` += it).
- **3 — Decline:** a sender family → `suppressed.inbox` `{kind: override, target:
  {family}, decidedAt: {now}, reconsiderAt: null}` and every staged `inbox-archive` of
  that family exits declined (T6 then stages none — the mail keeps its Archive category).
  Never for a protected group. An archive item → an `override` with target = its
  immutable id. A domain → `domain-ignore` (same shape, target = the domain). A closure
  → declined; its evidence item drops `taskId`, `tagged`, `flagged`, and its id leaves
  that task's `taskLinks` entry, so triage cannot re-derive it (a no-task evidence item
  per the Outlook-actions subsection); a note-only `inbox-note` declines the same way
  (the other pass's closure is untouched). A task proposal or a route → declined, plus an `override` with target = its
  `conversationId` (T6 then stages neither for that conversation until new mail arrives
  on it); the mail keeps its pile, category, and flag.
- **4 — Stop:** nothing written; usage close, release.

Loop on 2/3: each round re-renders the FULL gate (changed items in full, unchanged at
minimum as `{id} — {one-line action}`) with a fresh self-check line, heartbeat the lock,
ask again.

**Rule suggestions (spec §7.4):** each `ruleCounters` family with `nights` ≥
`rule_suggest_nights`, no active `suppressed.inbox` `override` on it (active as in T6),
and not a protected domain, an `inbox_leadership` match, or an `awareness` match (FYI
families are never suggested) → one line `Outlook rule: {condition} → Move to Archive`
for the user to create in Outlook (the skill never creates rules); `{condition}`: domain or
address family → `From contains "{family}"`; `calendar` → `Subject begins with "Accepted:"
or "Declined:" or "Tentative:" or "Canceled:"`; `auto_bounce` → `Subject includes
"Automatic reply" or "Undeliverable"`; `invite` → never (Outlook cannot test a past meeting). A suggestion shown at a gate that applies resets
that family's `nights` to 0 — re-offered only after another `rule_suggest_nights`.

### R4 — Apply (ownership check before each state batch)

1. **Mail writes** (`{level}` ≥ 1; T7's call mechanics — group, ≤100 chunks, `runId` =
   this pass's lock runId on every call):
   - `{level}` 2, approved `inbox-archive` → `outlook_mail_move` `folder: archive`,
     `confirm: true` with each item's stored (or R2-refreshed) guard — no new dry run.
     `changed_since_preview` → re-preview those items once: now outside the Inbox or
     `noop` → already moved (exit retired); still in the Inbox → apply with the fresh
     guard. `failed` with `retryable` (a 429 partway through a chunk) → resume ONCE with
     only those items and their guards; still failing → the items stay pending, one
     `system` attention line naming the immutable ids. Never re-send an `applied` item.
   - Every closure applied as `done` → its task's `taskLinks` mail still in the Inbox
     gets flag `complete` (drop `flagged`); the archive itself is the next triage's
     (T5 linked-task-closed). Below `{level}` 2 this is the only mail write.
   - Then the diff-back: `read_resource type=mail_audit runId={runId}` (page on
     `nextCursor`) — every `applied` item must appear; a mismatch → one `system` line
     naming the immutable ids. Nothing applied → no audit read.
2. **Account notes and config (C5 — the gate approved the exact text):** per approved
   closure with an `inbox-note`, and per approved note-only `inbox-note` (R3) — matching Open Commitments bullet in
   `{memory_root}/Accounts/{account}/Account_Notes.md` → that bullet edited in place to
   `- [x] {rest of the bullet unchanged} — done {date} (email)` (grammar:
   `assets/shared/memory-structure/Account_Notes.md` Open Commitments; the bullet keeps
   its position); none → the pure-touch line (workos-capture LOG step 2's grammar — copied here, never
   called) `- {date} touch [[{Account}]]: {what happened} (email)` appended to
   `journal/{YYYY-MM}.md` — never a new section or file. Then config writes from domain
   answers and option 2 teaching: read-modify-write of `core.md`'s config block, only
   the named key changed (`account_domains.{slug}.domains` += domain, a new slug with
   its `type` when needed; `inbox_patterns.awareness` — a configured family replaces its
   seed, so the first write copies the seed list then appends; `inbox_leadership`). Each write
   is read-back verified; a failed one → that item (and a closure's paired note) stays
   pending, one loud line — never reported as done.
3. **Journal pointers:** each exit `applied | declined | retired` per the schema
   (appended and verified BEFORE the item's removal; a failed append keeps it pending).
4. **State batch** (`generatedBy: review` on `tasks.json`):
   - `tasks.json` — `done` → the task leaves its lane; `progressed` → it stays, its
     `context` gains `{evidence}`. Approved `inbox-task-new` → a new task in `NICE`:
     unique id, the gate's title (the action, not the person; a name that must appear
     takes contact-resolution's state form `({Account} — unverified)` — no `Contacts.md`
     read for new tasks), `signal` per T6, `due` only for `due-date`, `context` =
     `{Account} — email {date}`. `pendingApprovals` as a MERGE: remove the items that
     exited this pass; everything else verbatim. New `system` lines (source `inbox`).
   - `suppressed.json` — this pass's `override` / `domain-ignore` entries appended.
   - `inbox.json` — new tasks: `taskLinks[{newTaskId}]` = the thread's tracked
     immutable ids, each item's `taskId`; R2's evidence updates (the Outlook-actions
     subsection's reasonCode / `taskId`); items this pass moved or found already moved
     drop from `items` unless they carry a `taskId` (an evidence item stays — T5 owns it),
     so the next triage never reads the skill's own move as a self-archive; declined
     closures' strips (R3 option 3);
     refreshed guards; shown rule suggestions' `nights` → 0; restamp `generated`,
     `generatedBy: inbox`; **`lastReview` = captured `{now}`, written last.**
5. **Board refresh (C9):** any `tasks.json` field the board renders changed → rebuild
   the board's data blocks exactly as workos-sync S7.4 (marker pairs only · mechanical
   self-check · `Board.html` snapshot rewrite · no update path → its one line). A failed
   update is reported as failed, never as success.

### R5 — Close

Receipt, then usage close (Step 0.7), then the verified tombstone release — the final
action, no questions after it:
`inbox review {today}: closed {a} · progressed {b} · new tasks {c} · archived {d}
({e} already moved) · declined {f} · retired {g} · left pending {h}` (`{d}` = moved by this
pass; already-moved items count in `{e}` and `{g}`, never `{d}`) — then one line per
config write (`config: {key} += {value}`), per account whose applied closure carried the
next-step tail (`{Account}: next step may be stale — run next-steps` — inbox never writes
SFDC-shaped output, C7), below `{level}` 2 the by-hand list (`archive by hand: {sender ·
subject}` per item), and every failure line.

## Anti-patterns — never

- Sending, replying, forwarding, or deleting mail — in any pass, at any level. Route
  suggests a recipient; the user forwards.
- Moving mail from an unattended run, at any level — moves happen only in REVIEW, at
  `{level}` 2, with stored guards.
- Marking mail read or unread — unread is the user's signal (#321), even when the server
  registers a mark-read tool.
- Creating Outlook categories, folders, or rules — setup prints the checklist and the
  review offers rule text; the user creates them.
- Raising, writing, or suggesting a raise of `inbox_autonomy_level`, or running above
  the probe ceiling.
- Storing subjects, bodies, previews, or sender/recipient fields in `state/` (C6
  Inbox-state clause) — render them live from Graph.
- Reading every account folder nightly — account context is read only for the items
  that need it.
- Any mail write call at `{level}` 0, or any write after a failed probe line.
- Writing `state/` without the lock; prose questions (C11 governs every question).
