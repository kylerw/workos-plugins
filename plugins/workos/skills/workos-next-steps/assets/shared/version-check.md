# version-check (shared convention; consumed via assets/shared/, C8/C13)

**Installed version:** `assets/shared/VERSION` in this bundle — stamped by the Release build
(`2026-08` style) or a local hook build (`dev-{sha}`). If the file is missing, report
"unstamped dev bundle."

**Latest version:** `{memory_root}/Team/_engine/latest-version.txt` — one line, updated by
the release train (CONTRIBUTING checklist). Reachable by every teammate through the Team/
shortcut; no GitHub access needed.

**Who checks, and how loudly:**
- `doctor` (setup's health mode): always reads both and reports
  `engine version: {installed} (latest: {latest})`.
- `sync` and the weekly `next-steps` sweep: compare silently; **on mismatch only**, append
  one line to their normal output: "Engine update available: you're on {installed}, current
  is {latest} — new bundles are on the Release page / next team call." Never more than one
  line, never blocking, never repeated within the same run.
- Every skill: if `Team/` or the file is unreachable, skip silently (C13) — `doctor` is the
  place that says "latest: unknown (Team/ not reachable)".

Notification only — no skill ever claims to update itself; the fix is always the human
re-upload ritual (CONTRIBUTING → Releases).
