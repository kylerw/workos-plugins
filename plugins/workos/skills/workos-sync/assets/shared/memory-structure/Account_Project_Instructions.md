# Project Instructions: {Account Name}

This folder is one customer account in your WorkOS memory. These rules govern how documents
and context for {Account Name} are organized, on both surfaces:

- **Claude Code:** the sibling `CLAUDE.md` in this folder `@import`s this file, so it
  auto-loads when your working directory is this account folder.
- **Cowork:** the workspace project instructions tell Claude to read this file when working
  in an account folder. (One Cowork project per person for the whole memory root, not one
  per account.)

Account-specific facts (competitors, stakeholders, tech stack) do NOT live in this file —
they live in this account's own data files (`00_Account Overview/Account_Context.md`,
`Contacts.md`, `Sphere_of_Influence.md`, `03_Competitive Intel/`). This file is filing rules
+ operating invariants only.

## Folder structure

```
{Account Name}/
├── Account_Notes.md              (Open Commitments + Strategy Notes) — capture
├── Sphere_of_Influence.md        (customer-side CCS sphere: Champion/Coach/Decision Maker/Financial Approver/Beneficiary/Implementation/Influencer; sectioned by opp only if committees diverge) — authored
├── 00_Account Overview/
│   ├── Account_Context.md        (About + tech stack + account glossary) — durable context, provenance-tagged
│   ├── Contacts.md               (identity registry, all sides)
│   ├── Account Plan.docx
│   └── Org Chart & Stakeholders.xlsx
├── 01_Opportunities/{OppNumber}_{Short Label}/
│   ├── Decks/ (Archive/)
│   ├── Pricing/ (Archive/)
│   ├── Contracts-SOWs-Amendments/ (Archive/)
│   ├── CCS/ (Archive/)              (MAP .xlsx, Champion Letter, Sphere snapshot) — ccs-* skills (v2)
│   ├── Next_Step_Log.md           (append-only next-step history) — next-steps
│   └── Notes/
├── 02_Meetings/{YYYY-MM-DD}_{Meeting Name}/
│   ├── Notes.md                  (consolidated meeting note) — capture
│   ├── {YYYY-MM-DD}_{Deliverable}.ext        (final artifacts only: presented deck, sent summary)
│   ├── Prep/                     (drafts, prep briefs, working files — created on demand)
│   └── Archive/                  (superseded finals — created on demand)
├── 03_Competitive Intel/
│   └── {YYYY-MM-DD}_Competitive_Digest.md    (if built — v2)
└── 04_Closed-Lost Archive/
    └── {OppNumber}_{Short Label}/  (entire opp folder moved here on close)
```

Files kept at the account root (`Account_Notes.md`, `Sphere_of_Influence.md`) are managed by
the capture skills and stay at the root — do not move them into `00_Account Overview/`.

## Where a new file goes

Ask in order:

1. **Tied to a specific opportunity/pursuit?** → `01_Opportunities/{OppNumber}_{Label}/` in
   the matching subfolder (Decks / Pricing / Contracts-SOWs-Amendments / CCS / Notes).
2. **Account-wide** (org chart, MSA, account plan, general strategy — not one deal)? →
   `00_Account Overview/`.
3. **A meeting artifact not owned by one opportunity** (QBR, discovery notes)? →
   `02_Meetings/{YYYY-MM-DD}_{Meeting Name}/`. If the meeting produced an opp-specific
   deliverable, the canonical file lives in the opportunity folder — link it from the
   meeting's `Notes.md` rather than keeping a second copy.
4. **Competitor intel specific to this account?** → `03_Competitive Intel/`.

If genuinely ambiguous, ask rather than guessing — don't create new top-level folders
without confirming.

## Inside a meeting folder

- **Root = the record.** Only `Notes.md` and final artifacts (the deck actually presented,
  the summary actually sent) live at the meeting-folder root.
- **`Prep/` = work in progress** — disposable after the meeting.
- **`Archive/` = superseded finals**, per the versioning rule below.
- Create `Prep/` and `Archive/` on demand — don't scaffold them empty.

## Opportunity folder naming

`{OppNumber}_{Short Label}` — OppNumber = Salesforce Opportunity number; Short Label = 2–5
word readable summary. Example: `00123456_Acme-ACD-Displacement`. No number yet →
`PENDING_{Short Label}`, renamed once the opp exists. These folder names double as the local
opportunity registry when Salesforce isn't connected (contract C7).

## Versioning (contract C10)

- **Draft in the session workspace, not here.** Copy a version into this folder only when
  it's worth keeping — the working folder never sees draft churn.
- Only the current/latest version of a file lives in its working folder.
- Filenames: `{YYYY-MM-DD}_{Short Description}.ext`. No `v#` suffixes.
- **Superseded → route by major/minor:** minor (presentation changed) → delete, human-gated;
  major (substance/source changed, an approved checkpoint, or anything sent/presented
  externally) → that subfolder's `Archive/`.
- Cleanup is always a specific keep/drop list — never "review these files," never
  auto-delete. `Archive/` holds only versions with future value.

## Opportunity lifecycle

- **Open:** under `01_Opportunities/`.
- **Closed (won or lost):** move the entire opportunity folder as-is into
  `04_Closed-Lost Archive/`; don't restructure it.

## Operating invariants (contracts, by number)

- **C7:** Salesforce is read-only and optional — deal-state is taken from the tier's
  authoritative intake at the moment it's needed, never stored in these files.
- **C6:** externally-researched facts ARE persisted (About, stack, competitive, contact
  identity) with `source` / `confidence` / `last_verified` provenance; append-only histories
  (Next_Step_Log.md) are records, never current state.
- **The locked Next Step format** (shared/locked-next-step-format.md) — always via the
  `next-steps` skill, never freeform.
- **Sphere_of_Influence.md is customer-side only** (the CCS rule): partner reps and internal
  coverage do NOT go there — contact identity for all sides lives in `Contacts.md`.
- **C5:** nothing is saved to a file before you approve it.
