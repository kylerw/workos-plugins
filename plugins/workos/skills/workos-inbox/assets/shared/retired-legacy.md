# retired-legacy (shared resource; consumed via assets/shared/, C8)

Consumers: workos-setup §A6.1 generation (the root `CLAUDE.md` frozen-legacy section) ·
doctor retired-skill-shadow check (#97, **pending** — extends values, never shape).
Single source for the retired-skill manifest — ONE edit here updates every consumer's
rendering (the locked-next-step-format precedent).

| name | why retired | frozen paths | replacement | frontmatter-fingerprint |
|---|---|---|---|---|
| `kickoff` | superseded by workos-sync (WorkOS consolidation, live 2026-07-16) | `session-state.md` · `tasks/` (incl. `tasks/nice.md`) · `next-day-brief.md` | `sync my day` (workos-sync) | pending (#97) |
| `wrap` | superseded by workos-sync (same consolidation) | `session-state.md` · `tasks/` (incl. `tasks/nice.md`) · `next-day-brief.md` | `sync my day` / `tidy` (workos-sync) | pending (#97) |
| `log-activity` | superseded by workos-capture (rc20 capture consolidation) | — (wrote account folders, no frozen root paths) | `log a call` (workos-capture) | pending (#97) |
| `meeting-capture` | superseded by workos-capture (rc20); declared an AUTOMATIC trigger | — | `capture the meeting` (workos-capture) | pending (#97) |

**Frozen-legacy set** = the union of `frozen paths` above: root paths retired skills
used to write. They stay PRESENT (a missing path is a creation invitation — #97 TRAP)
and off-limits to every current skill. §A6.1 derives the root `CLAUDE.md`'s
frozen-legacy section from this union on every regeneration, so the declaration can
never be authored once and forgotten.

**Canonical rendering (byte-fixed — §A6.1's exact-match classification is decided
against THIS block verbatim; it changes only when the manifest's rows change):**

```
## Frozen legacy — do not create, write, or revive
session-state.md · tasks/ (incl. tasks/nice.md) · next-day-brief.md
Retired kickoff/wrap outputs; off-limits to every skill (manifest: the WorkOS engine's `retired-legacy` shared asset).
```

The `frontmatter-fingerprint` column is reserved
for #97's doctor check (name + fingerprint match of loose retired skills); values land
with that build.
