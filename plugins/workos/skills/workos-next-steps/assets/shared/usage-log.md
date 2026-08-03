# usage-log (shared convention; consumed via assets/shared/, C8)

**Where:** `{memory_root}/Team/_engine/usage/{user_name}.jsonl` — `{user_name}` from the
identity config. Append-only. One file per person, so two people writing at once is
structurally impossible: no lock, no re-read, no conflict copy.

**Resolve the path once per pass and reuse it.** Never write the literal filename in more
than one place — rotation is a tracked future change (#169) and must not become a
five-skill edit.

**Every record carries:** `at` (ISO-8601 UTC) · `localDate` (per identity.schema.md's
timezone resolution order; OMITTED when unresolved, never guessed) · `user` · `skill` ·
`mode` · `version` (this bundle's `assets/shared/VERSION` verbatim, or `unstamped`) ·
`surface` (`claude-code` | `cowork`) · `event`.

**Four events:**
- `open` — adds exactly ONE id: `runId` for a pass that holds a C4 lock (the value that
  pass already generated for it), or `passId` for a pass that holds none. Appended once
  the record's identity values are known — `user`, `version` and `surface` — and the mode
  is determined, but before the pass does its work. Most sites read those off an
  already-resolved config; `workos-setup` §A is the exception — there `user` becomes known
  the moment Identity resolves it, before the config it belongs to has been written.
- `close` — adds the same id its `open` carried, plus `outcome`
  (`completed` | `degraded` | `error`). Appended immediately before the lock is released,
  or as the pass's last action when it holds no lock.
- `install` — written ONCE, ever. The rule is stated against the file: if this user's log
  carries no `install` record, append one on a successful config write.
- `doctor` — adds `counts` (exactly `ok`, `findings`, `skipped` — no fourth key), `checks`
  (check id → verdict), and `integrations` (connector → verdict). Verdicts are `ok` |
  `info` | `finding` | `refused` | `skip`. **Keys are closed vocabularies, not shapes**
  (#172 — a slug rule bounds characters, not vocabulary: an account name slugifies
  clean). `checks` keys are exactly doctor §C's twelve ids — `memory-root` · `config` ·
  `integrations` · `sfdc-tier` · `version` · `team-publication` · `state` ·
  `approvals-queue` · `scheduled-tasks` · `unattended-runs` · `run-reports` ·
  `scheduled-capture`. `integrations` keys are
  exactly `ms365` · `graph` · `hinotes` · `sfdc-mcp` · `other` — a connector not in the
  list logs as `other`, its name dropped on purpose. **Several unlisted connectors share
  the one `other` key: the worst verdict wins**, ordered `finding` > `refused` > `skip` >
  `info` > `ok` (both halves of a refusal already count as findings in doctor's tally;
  `skip` outranks the benign verdicts because not-checked is unknown, not fine). A future per-account check logs ONE
  aggregate id, never a per-account key; either vocabulary grows only in the PR that
  ships the new check or connector (CI enforces membership on both maps).

**`passId` — the id for a pass that holds no lock.** Shape `p-<8 lowercase hex>` (e.g.
`p-9f3c1a7e`), deliberately disjoint from `runId`'s shape so neither can pose as the
other: a `runId` pasted into `passId` fails validation, and vice versa. A `p-` id asserts
only that two rows belong to the same pass. It never claims a lock was taken — that
distinction is the whole reason it is a separate key rather than a reused `runId`.

**Which passes write which.** A pass that takes a C4 lock writes `runId`. Every other
ATTENDED pass that does work writes `passId` — `workos-next-steps` §A fresh sweeps and §B,
`workos-capture` in both intents, `workos-setup` §A, §B, Mode 4 (`seed my voice file`), §D
and §E, and `workos-sync`'s BOARD entry point. Two carve-outs:
`doctor` writes its own record instead of a pair, and a delegated invocation writes nothing
because the invoking pass already recorded itself. An early exit that did no work writes
nothing either — a log of non-events is a log nobody trusts.

**A first-ever setup run writes both** an `install` record and an `open`/`close` pair. They
answer different questions: `install` is a fact about this user, keyed on its own absence;
the pair is a record of one pass running and finishing.

**Outcome mapping — one rule, all passes.** `completed` when the pass finished the work its
mode defines (an unattended run that parks has completed: parking IS its work). `degraded`
when a configured source loud-SKIPped. `error` when the pass ended on a failure it reported.
Skills cite this; they never restate it.

**There is no `stopped` outcome.** A pass abandoned at its gate never reaches close, so
an `open` with no matching `close` IS the signal — paired by whichever id the rows carry.
This requires nothing from the session that abandoned — the session least able to do
anything. Reusing `open`/`close` for lockless passes rather than minting a second event
pair is what keeps this ONE rule for the whole log instead of two.

**Never log prose.** The schema has no free-text field, and that is what makes "no account
data" enforceable rather than aspirational. Doctor logs check ids and verdicts because
findings routinely name accounts. If a value will not fit an enum, it does not belong here.

**Failure is never fatal.** Team/ unreachable, directory not creatable, or append failed →
one `system`-class line in `attention[]` and the pass continues to completion. A usage-log
failure never blocks a pass, never changes its outcome, and is never a separate doctor
finding — doctor's existing Team/ reachability check already covers the cause. The
`attention[]` fallback applies only to passes that take locks. A lockless pass has no
`attention[]` to write — `workos-capture` cannot write `state/` at all (C4) — so it reports
the failure in its own run output and continues, exactly as the `install` rule below does.
An `install` append failure needs no durable record: the once-ever rule is keyed on the
record's absence, so the next successful config write appends it. Report it in the run's
own output and move on. Create `Team/_engine/usage/` when absent and Team/ is writable, as
`_engine/` already does.

**The usage log is doctor's one new write.** The never-writes rule exists so a diagnostic
does not mutate what it diagnoses; nothing aggregates this log and no diagnosis depends on
it, so appending cannot perturb what doctor observes. It is also doctor's only UNPROMPTED
write: every other write doctor makes is a repair it offers and the user approves — among
them the stale-lock tombstone, sanctioned by C4 single-writer-state's stale-lock-recovery
sentence. Nothing else is added, and nothing already sanctioned is widened.

Ungated machine bookkeeping per C5.
