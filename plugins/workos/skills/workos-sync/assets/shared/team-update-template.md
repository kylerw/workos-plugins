# team-update-template (shared resource; consumed via assets/shared/, C8)

The weekly `Team/` snapshot — dated, regenerable, frontmatter-structured so the future
rollup parses every AE identically (PLAN §4.4). Destination:
`{memory_root}/Team/{team_publish_folder}/{YYYY-WW}_update.md` — write your own subfolder
only; overwrite the same week's file, never another week's. Publication is human-gated
every time (C5) and governed by the recorded manager-decision file; if that file is absent
or unresolved, the publishing skill skips the gate and says why.

```markdown
---
ae: {user_name}
week: {YYYY-WW}
generated: {YYYY-MM-DD}
coverage: full | partial          # partial ⇒ state what was missing
pipeline_status: {one line}
asks_blockers:
  - {ask or blocker, one line each — or [] }
material_changes:
  - "{Account} · {what changed}: {old} → {new}"
new_next_quarter:
  - "{Account} · {opp} · {close date}"
at_risk_renewals:
  - "{Account} · {status one-liner}"
---

## Accounts

- **{Account}** — {one-liner: state + this week's next step}
```

Rules: derived from the same run's data (never hand-maintained); account detail is allowed
here (Team/ is tenant-controlled, C1) but keep one-liners — the detail lives in the AE's
memory; no customer identifiers beyond what leadership already sees in Salesforce.
