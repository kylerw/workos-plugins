# memory-structure — the canonical per-person folder layout

The **structure** below is canonical for every user; the root's **location and name** are
per-person config (C2 — `WorkOS/` is the default for new users). `setup` scaffolds it;
nothing here is created by hand.

```
<memory root>/                      (path+name from identity config)
├── core.md                        identity, voice, the config block setup generates
├── Accounts/{Account}/            one folder per tracked account — a folder existing here
│   │                              IS the definition of "tracked"; stubs in this directory
│   ├── CLAUDE.md                  @import stub (account-CLAUDE.md, {Account Name} filled)
│   ├── Account_Project_Instructions.md   filing rules + invariants (template here)
│   ├── Account_Notes.md · Sphere_of_Influence.md · 00–04 folders   (see the template)
├── state/                         machine-written JSON (task store, meetings, drafts,
│                                  suppressed) — one writer per run (C4); board reads it
├── journal/{YYYY-MM}.md           append-only pointers to where truth landed
├── lanes/                         lane-state prose
└── Team/                          shared OneDrive shortcut — publication surface, not
                                   memory (write your own subfolder only)
```

Scaffolding rules (`setup` enforces): additive-only and idempotent — never overwrite or
relocate existing content; existing documents are read-only inputs, never migration targets;
`_`-prefixed folders under `Accounts/` are excluded from account matching.

Onboarding gotcha (Day-1 guide, mandatory): mark the memory root **"Always keep on this
device"** — OneDrive files-on-demand placeholders break reads in ways that look like data
loss.
