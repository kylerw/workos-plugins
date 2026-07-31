# team-update-template (shared resource; consumed via assets/shared/, C8)

The weekly `Team/` snapshot — dated, regenerable, frontmatter-structured so the future
rollup parses every AE identically (PLAN §4.4). Destination:
`{memory_root}/{team_publish_folder}/{YYYY-WW}_update.md` (`team_publish_folder` already
carries the `Team/` prefix, per identity.schema.md) — write your own subfolder
only; overwrite the same week's file, never another week's. Publication follows the recorded `team_publish` mode in
`{memory_root}/manager-decision.md` (frontmatter-read; C5's consent = that recorded,
provenance-carrying decision PLUS the sweep's A5 approval of the exact rendered file):
`auto-with-notice` writes the A5-approved render with one notice line · `gated` asks
the one question · `off`, an absent file, or any unknown/missing value skips with the
reason said.

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

3 open opps reviewed · 2 changed · 1 kept

## Acme Health

- **12345 | Ops Console** ([Acme Health — Ops Console Expansion](https://example.lightning.force.com/lightning/r/006XX00000A1B2C3D4/view))
  - **Change Type** - Next Step
  - **Old:** 07/15 AB follow up on pricing deck
  - **New:** 07/22 AB get pricing decision 07/29 from Jordan Doe (VP Clinical) at the exec review, decision owner quiet since the 07/10 review

## Globex Care

- **Intake Pilot** (Globex Care — Intake Pilot)
  - **Change Type** - Next Step + Close Date (2026-09-30 → 2026-10-31)
  - **Old:** (none — first next step on this opportunity)
  - **New:** 07/22 AB schedule discovery 08/01 with Pat Kim (Director Ops) to scope the intake pilot, discovery slipped so Q4 is the realistic close
  - (no opp folder yet — number unrecorded)

1 opp rendered without links — Ids cache on the next sweep

## Open items
- Acme Health — Renewal base (34567): kept, renewal flagged at-risk
```

## Body

Body order is fixed: the coverage line first — one line, NON-BULLETED, before any
section: `{N} open opps reviewed · {M} changed · {K} kept[ — partial: {what was
missing}]` (counts cover every enumerated opp; the partial clause appended whenever the
sweep's partial rule applies — a floor sweep never emits a body that silently claims
full coverage). Then one `## {Account}` SECTION per account with changed opps —
accounts ordered by their top opp's imminent-close → stalled → ACV rank; within a
section, one top-level BULLET per changed opp in that sort, every data point a nested
sub-bullet. Then the loud unlinked-opps line when the rule below says it renders; then
`## Open items` (unresolved batched-question rows, one line each, PLUS every kept opp
whose renewal is flagged at-risk, named). A section with no content is omitted, never
emitted empty. Unchanged (kept) opps are OMITTED — the coverage line counts them
(omission covers unchanged opps, never standing risk). Close-date changes are not a
separate section: `Close Date` is a Change Type. There are no `---` separators — the
bullet nesting is the separation (email clients render horizontal rules inconsistently;
readability is the point).

Per-opp bullet (the RVP's format, bulleted for email readability — decided 2026-07-30):

```
- **{OppNumber} | {Short Opp Label}** ([{SFDC opportunity name}](https://{sfdc_instance_host}/lightning/r/{OpportunityId}/view))
  - **Change Type** - {Next Step | Close Date ({old} → {new}) | Stage ({old} → {new}), multi-delta joined " + "}
  - **Old:** {prior locked-format line, verbatim | "(none — first next step on this opportunity)"}
  - **New:** {current locked-format line, verbatim}
```

- **{OppNumber} ALWAYS renders — local identity, tier-independent:** it is the opp
  folder's leading name component WHEN NUMERIC (a `PENDING_{Short Label}` folder has no
  number — it takes the folderless treatment, with the note's reason reading
  `(no opp number recorded yet)`), read locally at every tier including dark and
  manual; a pasted report's number column is the fallback source for a folderless opp.
  **The URL is Salesforce-dependent, cached-Id-gated — a different thing.** A
  folderless opp with no number anywhere renders `**{Short Opp Label}**` alone plus one
  trailing sub-bullet `(no opp folder yet — number unrecorded)` — never a placeholder,
  never an invented number.

- `{Short Opp Label}` = the opp folder's `{Short Label}` name component; an opp with no
  folder yet derives its short label from the SFDC opportunity name.

- **Link rule:** the hyperlink renders only from a cached OpportunityId (the log's most
  recent non-`unknown` Observed `Id`) plus the configured `{sfdc_instance_host}`; either
  missing → the header renders plain — `**{OppNumber} | {Short Opp Label}** ({SFDC
  opportunity name})` — never a fabricated URL. Cached identity renders at every tier:
  after an explicit mcp→manual downgrade, and in a dark-probe session, cached links keep
  rendering — identity is not capability.
- **Change Type derivation — anchored on what THIS pass changed, never
  Observed-vs-prior-Observed:** `Next Step` = an accepted line differing from the prior
  line · `Close Date ({old} → {new})` = a close-date decision accepted this run OR an
  observed close date differing from the prior entry (an externally-moved date with no
  decision this run still renders) · `Stage ({old} → {new})` = observation delta vs the
  prior entry. Multi-delta renders all, joined ` + `. Never hardcoded. Non-step types
  carry their delta values on the Change Type line — Old/New render locked step lines
  only. **"Changed" for the body and coverage line means exactly these anchors fired** — a forecast-only delta fires none: the opp counts as kept, renders no block, and reaches the rollup via frontmatter (`material_changes`) only.
- A changed opp whose next step did NOT change collapses the Old/New pair to one
  sub-bullet: `- **Step (unchanged):** {current locked-format line}`.
- **Loud unlinked-opps line** — renders at `sfdc_tier` = `mcp` ONLY, and only when the
  named fix works: host missing with NO recorded `sfdc-instance-host` decline →
  `{U} opps rendered without links — sfdc_instance_host not recorded; re-run "init my
  workspace" to record it` · host present, Ids uncached → `{U} opps rendered without links
  — Ids cache on the next sweep`. `{U}` counts the changed-opp blocks whose headers rendered plain — distinct from the coverage line's `{K}` kept, and it renders for partially-cached sets too. The count pluralizes naturally (`1 opp`). Every
  other state is SILENT: `manual` tier (pure floor or downgraded — plain is that tier's
  normal output) and a recorded `sfdc-instance-host` decline (re-running init never
  re-asks a recorded decline, so the line's fix would be a dead end; "let me re-decide"
  is the reopen, and doctor's INFO line names it).
- The locked next-step line is byte-untouched everywhere it appears —
  `locked-next-step-format.md` stays the sole authority; this template renders accepted
  lines verbatim, never re-derives or re-formats them. `Reason:` stays persisted in
  `Next_Step_Log.md` and does not render here.
- Account detail is allowed here (Team/ is tenant-controlled, C1) but keep one-liners —
  the detail lives in the AE's memory; no customer identifiers beyond what leadership
  already sees in Salesforce. Everything renders from the same run's data — never
  hand-maintained.

**Byte-identity, re-scoped — the email-rendering contract:** the canonical body ≡ the `Team/` file below the
frontmatter. The manager email is a mechanical RENDERING of that canonical body covering
ALL markdown, not links alone: via `outlook_create_draft`, markdown converts to the draft
format the tool accepts (HTML when supported); on the copy-ready fallback, links render
`{label} ({url})`, bold labels render as plain text (no literal asterisks), a `##`
heading renders as its bare text line, and bullets render as `-` with two-space indents
(plain text keeps the hierarchy; the draft path gets real HTML lists). No markdown
syntax ever pastes as literal characters into Outlook.
