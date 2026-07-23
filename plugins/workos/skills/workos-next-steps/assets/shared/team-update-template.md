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

Coverage: full

## Accounts

1. ACME HEALTH
— Ops Console expansion (12345, $120K)
Old: 07/15 AB follow up on pricing deck
New: (07/22) AB – get pricing decision from Jordan Doe (VP Clinical), target 07/29
Reason: decision owner quiet since the 07/10 review; forcing the date
Flags: Stalled/no-response · Competitive · Close ≤7d

— Screen-rec add-on (12388, $45K)
Old: 07/11 AB confirm seat count with IT
New: (07/22) AB – send revised quote to Sam Lee (IT), target 07/25
Reason: seat count confirmed 07/21; quote is the blocker now
Flags: Close ≤7d

2. GLOBEX CARE
— Intake pilot (23456, $60K)
Old: (none — first next step on this opportunity)
New: (07/22) AB – schedule discovery with Pat Kim (Director Ops), target 08/01
Reason: new next-quarter opp, first touch
Flags: New next-quarter

## Close-date decisions
- Globex Care — Intake pilot (23456): 09/30 → 10/31, discovery slipped so Q4 is the realistic close

## Kept (fresh, unchanged)
- Acme Health — Renewal base (34567): kept 07/18 line (at-risk)

## Open items
- {unresolved batched-question rows, one line each — or omit the section}
```

## Body

Body order is fixed: the `Coverage:` line first (one line, `Coverage: full|partial — {what
was missing when partial}`, before `## Accounts`), then `## Accounts` → `## Close-date
decisions` (one line per decision, `- {Account} — {Opp} ({OppNumber}): {old} → {new},
{reason}`) → `## Kept` → `## Open items`; a section with no content is omitted, never
emitted empty. Blocks sort imminent-close → stalled → by ACV; accounts are ordered by their
top block's rank, stable. A kept opportunity (fresh, step unchanged) appears ONLY as its
one-line entry under `## Kept` — with an optional trailing `(at-risk)` token when its
renewal is flagged — never as an Old/New/Reason/Flags block. The `New:` line is the
presentation transform `({MM/DD}) {initials} – {…}` of the same accepted line the SFDC
paste block carries — `locked-next-step-format.md` is the sole authority for the line
itself; this template re-renders it, never re-derives it. The manager email is this
template's body verbatim — subject + salutation above, byte-identical below.

## Flags

Controlled vocabulary (single source; emitting skills cite this list, never restate it):
`Close past` · `Close ≤7d` · `Stalled/no-response` (evidence of outreach without reply — the
log's Observed history / stall-note path) · `Stale step` (A3.2 unchanged-step) · `Notes
missing: {Why NICE|Why Now|Approval}` · `New next-quarter` (A3.4) · `Material: {field}
{old}→{new}` (A3.5) · `Competitive` (the account's recorded competitive context — never new
research) · `Ownership gap` (A1's ownership rule) · `First step` (prior-log absence). A field
is OMITTED when empty — never "None"; free text never enters Flags.

Rules: derived from the same run's data (never hand-maintained); account detail is allowed
here (Team/ is tenant-controlled, C1) but keep one-liners — the detail lives in the AE's
memory; no customer identifiers beyond what leadership already sees in Salesforce.
