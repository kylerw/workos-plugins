# unattended-execution.md — the shared unattended mechanics (C15)

The invariant is C15 unattended-classification — cited by number, applied here as
mechanics. Scope: runs whose invoking prompt carries the `(scheduled, unattended)`
marker. No marker → attended; nothing in this file applies.

## §Classification

An unattended pass asks no questions and blocks on no approval gate. Each decision it
reaches lands in exactly one bucket:

- **AUTO** — applied under the C4 lock. Bounded to what C5's state-store clause already
  permits ungated. This file widens nothing.
- **QUEUE** — persisted into the pass's existing staging (`pendingApprovals` · the sweep
  park · the intake park) in the pass's normal pre-release write batch; drained at the
  owning attended gate (C5/C14 unchanged). Ambiguity, a needed human decision, a dark
  integration (C13 degrade), a batched question — QUEUE, never BLOCK.
- **BLOCK** — halt, write nothing beyond the report, release what you hold. Integrity
  risk only (§BLOCK enumeration is exhaustive).

`queueClass` is a COUNTING vocabulary over existing fields — schema §run-report.json
holds the class list and the per-pass mapping; no new fields are stored on queue
records. Extension `pendingApprovals` kinds count as `extension`.

Named sync classifications (the two cases outside the kind vocabulary):
- The unattended day-roll carries ALL carry-forward items forward — AUTO, machine
  bookkeeping. Named drops are an attended-gate decision and never happen unattended.
- The unattended contact path (unconfirmed form + aggregate attention line) is AUTO;
  the confirmation decision happens attended and queues its `task-rewrite` items there.

`attention[]` lines are surfacing, never QUEUE records: every queued decision lives in
a staging store with a stable identity (`appr-` ids; park rows use their pass's row
identity) — an attention line may point at it, never BE it. Every queued record is
drainable by reference — stable id, one per-item action, a one-line render (the #73
board-queue shape; what the desk approval-queue will consume once workos#125's
queue-shape decision lands). This file adds no new drain surface.

## §RUN_REPORT line

Emitted once per unattended run, in the run output, whichever branch the run takes.
Exception, by name: a same-day dedupe skip (#67/#68) is an exit before the run
begins — its two-line output stands alone; no RUN_REPORT line, no report entry.

- completed: `RUN_REPORT {pass} completed — auto {n} · queued {n} [{queueClass: n, …}] ({version} on {surface})`
- blocked: `RUN_REPORT {pass} blocked — {blockReason} ({version} on {surface})`

Pre-lock exits (§BLOCK cases 1–2) emit the blocked line to run output only — no state
is written without the lock. Lock-holding runs ALSO merge their `reports.{pass}` entry
into `state/run-report.json` (shape: schema §run-report.json) as part of the final
state batch.

## §Write order

At close: staging → run-report → usage-log close → verified tombstone release. Each
file write is whole-or-prior; `state/run-report.json` specifically is written
temp-then-replace. A run killed between files leaves each file whole — whole-file
replacement bounds tearing, not cross-file agreement, and no reconciliation pass
exists. Two residuals follow, both named rather than claimed away:

- **Staging can outlive its report by one dedupe window.** A kill after the staging
  write but before the report write leaves the pass's same-day stamp durable (it lives
  in staging) while the report still shows the previous run — so a same-day re-run exits
  at its dedupe check and does NOT catch the report up. The next run that actually
  executes replaces both. Doctor's freshness thresholds (setup §C check 11) are set
  wider than one window, so this lag never reads as a wedged schedule.
- **`outcome: completed` asserts a durable state batch, not a finished close.** A kill
  after the report write leaves the usage run open and the lock live until the owning
  skill's stale-lock rule reclaims it; the report is not evidence that the tombstone
  released.

Unparseable `run-report.json` → the schema section's recreate-loudly rule (attention
line + journal pointer, never BLOCK).

## §Drain instrumentation

The attended gate that DECIDES queued items (sync/tidy approval step · next-steps A5 ·
the intake finalize) merges `drainStats` in the same lock-held batch as the decisions:
per class decided this gate, `approved += a`, `declined += d`, and `drains += 1` when
`a + d ≥ 1`. Left-pending and retired items touch nothing. Counters are flat per class
— a sync-gate drain and a tidy-gate drain of the same class accumulate together.

## §BLOCK enumeration (exhaustive — a new halt condition requires a spec touch)

1. **capture under the marker** — pre-lock: emit
   `RUN_REPORT capture blocked — capture is not an unattended pass ({version} on {surface})`,
   read nothing beyond the bundle `VERSION`, write nothing, exit.
2. **Lock contention** — a live sibling lock < 30 min old: yield per the owning skill's
   lock rules; blocked line to run output only.
3. **Core state unparseable under the lock** — a file the pass must MERGE-rewrite
   (e.g. `state/tasks.json`) is corrupt: halt, merge the `blocked` entry with its
   `blockReason` into `run-report.json` (a separate file — it stays writable), release.
   Non-members: an unparseable lock file follows the owning skill's recover-and-
   overwrite; an unparseable `run-report.json` follows the recreate-loudly rule.
   **Both corrupt at once:** the BLOCK still reports — recreate `run-report.json` from
   empty in the same batch and write that rule's attention line + journal pointer.
   Those two writes, and nothing else, are what "write nothing beyond the report"
   permits here; the corrupt core file is never rewritten.

Accepted residual, named: the two pre-lock BLOCKs leave no durable trace on the root —
their line lands only in the scheduled chat. Doctor's freshness check covers the
wedged-schedule class; the scheduled-capture guard covers case 1 where the scheduler is
enumerable.

## §Promotion (evidence-based AUTO widening — never automatic)

A `queueClass` with `drains ≥ 10` and `declined = 0` is an AUTO-promotion CANDIDATE.
Doctor surfaces candidates as INFO; the promotion act itself is governed by C15.
Routing: a class C5's state-store clause names by enumeration always amends C5 in the
same PR; a class C5 doesn't name amends C15's register only, unless its writes leave
the state store (then both). The promoting PR states the disposition of the class's
already-queued items (default: retired at the next merge, one journal pointer per
item), after which its counters freeze.
