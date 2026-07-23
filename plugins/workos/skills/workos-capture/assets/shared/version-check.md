# version-check (shared convention; consumed via assets/shared/, C8/C13)

**Installed version:** `assets/shared/VERSION` in this bundle — stamped by the Release build
(`2026-07-rc21` / `2026-08` style) or a local hook build (`dev-{sha}`). If the file is
missing, report "unstamped dev bundle."

**Latest version:** `{memory_root}/Team/_engine/latest-version.txt` — one line, the newest
release any teammate has run. Reachable by every teammate through the Team/ shortcut; no
GitHub access needed. Self-healing via the beacon rule below — no release-train hand-bump.

**Ordering (release stamps only):** trim whitespace, then compare year-month numerically;
within the same month a bare `YYYY-MM` (final) outranks any `-rcN`; rc numbers compare
numerically (rc10 > rc9; N a positive integer; case-insensitive). Equal rank counts as
equal even when the strings differ (rc1 = rc01). `dev-{sha}` and unstamped bundles are
UNORDERED — they never trigger the notice and never write the beacon; `doctor` just
reports both values verbatim. A latest value that is not a release stamp (empty, `dev-…`,
unparseable) is treated as MISSING — a release-stamped bundle overwrites it, quoting the
old contents verbatim in its one line.

**Four cases, every check:**
- **Unordered (`dev-{sha}`/unstamped)** → its own audible outcome, not silence: report
  both values verbatim (doctor's existing pattern) — so a configured run on a dev
  bundle never self-reports as the #53 defect (#70).
- **Equal rank** → nothing (exception: workos-sync's audible-outcome rule (#53) renders
  the one-line `engine {installed} — current` in its close summary — sync only; other
  consumers stay silent).
- **Installed behind latest** → the one-line notice: "Engine update available: you're on
  {installed}, current is {latest}" + the fix for the running surface — plugin install:
  sync the marketplace (or auto-sync picks it up) · Cowork upload: download the new
  .skill from the GitHub Release and re-upload · surface unknown: name both. Never more
  than one line, never blocking, never repeated within the same run.
- **Installed ahead of latest — the self-heal beacon** (`sync` and `next-steps` only;
  `doctor` never writes): this bundle is the newest the team has seen — write {installed}
  to `latest-version.txt` so every teammate's next check sees it. Exempt machine
  bookkeeping under C5's state-store clause: ungated, announced in one line —
  "(engine beacon: latest-version.txt {old} → {installed})", where {old} is the prior
  value verbatim or the word "missing". Discipline: re-read the file immediately before
  writing and write only if {installed} still outranks it; re-read after and claim the
  line only if the new value stuck. File or `_engine/` folder absent but Team/ writable →
  create them. A lost race can briefly leave the lower of two new versions — the higher
  bundle's next check re-heals it; nothing else ever lowers the file. Write fails → not
  an error: sync notes it in `attention[]`, next-steps stays silent, the next run retries.

**Who checks, and how loudly:**
- `doctor` (setup's health mode): report-only, always:
  `engine version: {installed} (latest: {latest})` — installed ahead → append
  "— beacon behind; your next sync heals it".
- `sync` (Step 0.6) and the weekly `next-steps` sweep: compare silently; act only on a
  mismatch — behind → the notice line, ahead → the beacon bump and its one line.
- Degraded, never failed (C13's graceful-degradation rule): `doctor` is the loud surface —
  "latest: unknown (Team/ not reachable)"; `sync` flags configured-but-unreachable in
  `attention[]`; `next-steps` skips its weekly notice silently.

No skill ever updates its own ENGINE — the fix for "behind" is always the install surface
(marketplace sync / bundle re-upload). The beacon is the one write in the other direction:
a newer release stamp may raise `latest-version.txt`; the only legitimate hand-edit is
correcting a too-high stamp DOWN (the beacon never lowers itself).
