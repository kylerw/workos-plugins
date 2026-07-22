# voice-contract (shared resource; consumed via assets/shared/, C8) — #74

One voice, applied and checked at the moment of emit. This file owns only the mechanism —
the taxonomy, the mechanical tells, and the emit hook. It owns NO content: every actual
preference lives in the user's root `voice.md` (user-owned; engine-seeded once; never
engine-edited after). Consumers: workos-capture (drafts, meeting notes) · workos-sync
(briefs) · workos-next-steps (the prose around the locked line, team-publish update prose).
Referenced by name; never restate these rules.

## 1. Purpose + ownership

- **Content is user-owned.** The rules themselves live in root `voice.md`, `@import`ed by
  the root `CLAUDE.md` beside `user.md`. The engine seeds the template (§5) once, then
  never touches the file again — no overwrite, no re-seed, no lifting content out of
  `user.md`. The user does the move; the engine only leaves a pointer behind.
- **This file is engine-owned and holds only mechanism.** Expansion of voice happens by
  editing `voice.md`, NEVER by editing a skill or this contract. Adding a rule, a surface
  preference, or an audience preference is a `voice.md` edit with no engine/skill change.

## 2. Taxonomy (v1 — deliberately small)

**Surfaces** (where the output lands):
- `plain-text-paste` — SFDC fields, Teams messages, Outlook body. No markdown renders.
- `in-chat` — paste-ready blocks rendered in the assistant. Markdown renders.
- `customer-facing-doc` — deliverable prose (a document the customer reads).

**Audiences** (who reads it): `customer` · `partner` · `internal team` · `manager` · `self`.

**Layering — global → surface → audience.** Global rules apply always; the resolved
surface's rules layer on top; the resolved audience's rules layer last (most specific wins
on conflict). A surface or audience with no rules in `voice.md` contributes nothing; global
still applies.

## 3. Mechanical tells (v1 validator list)

Run every tell against the composed output before it emits. The first four are
mechanically checkable; the last two are model-checked and are NAMED in the audible line
(§4) when fixed.

1. **em-dash on `plain-text-paste`** — an em-dash (—) in a plain-text-paste output. Other
   surfaces are exempt; this tell is surface-scoped.
2. **emoji anywhere** — any emoji, on any surface.
3. **destination-unrenderable markdown** — markup the surface won't render: headers/bold in
   SFDC fields, tables in Teams. Surface-scoped (`in-chat` renders markdown, so it is
   exempt).
4. **bold-phrase count > limit** — on surfaces where bold DOES render (`in-chat`,
   `customer-facing-doc`), more bolded phrases than the limit (from `voice.md`, default 2).
   On `plain-text-paste`, bold is already stripped by tell 3.
5. **explanatory tail** (model-checked) — commentary after the payload the reader did not
   ask for.
6. **closing offer / meta line** (model-checked) — a trailing offer about the output itself
   ("want the shorter version").

**The locked next-step line is exempt from every tell.** A voice pass NEVER touches it —
its format is the sole authority of `assets/shared/locked-next-step-format.md`. The pass may
shape the PROSE around the line; the line itself is byte-identical before and after.

## 4. The emit hook (skills cite by name, never restate)

An emitting skill invokes this by one line at its emit point — `voice pass per assets/shared/voice-contract.md` — meaning:

1. **Resolve** the output's surface and audience (§2).
2. **Read** the user's root `voice.md` for the rules that apply to that pair.
3. **Apply** them layered: global → surface → audience (§2).
4. **Run** the tells (§3) over the composed output; fix each hit in place.
5. **Render the audible line WITH the output** — never a silent pass:
   - no tells fired → `voice check: {surface} — clean`
   - tells fixed → `voice check: {surface} — fixed {n} tells: {list}` ({list} names each
     fixed tell, including the two model-checked ones).
   - **`voice.md` missing or unimported** → apply the global defaults only and say so
     LOUDLY: `voice check: {surface} — voice.md not seeded`. A missing file is reported,
     never silently skipped.

## 5. voice.md — the seed TEMPLATE (setup copies this verbatim, once)

Every rule below is a FICTIONAL placeholder (like "no semicolons in customer email") — the
user replaces each with their own. The engine ships no real preference, ever (C1/C2).

```markdown
# Voice — {your name}

Move your existing user.md Voice section here; leave a pointer behind. The engine never moves it for you.

bold_limit: 2   (max bolded phrases per output; tell 4 fires above this)

## Global
Rules that apply to every output.
- prefer short declarative sentences

## Per-surface
Surfaces: plain-text-paste · in-chat · customer-facing-doc.

### plain-text-paste
- use '...' instead of em-dashes

## Per-audience
Audiences: customer · partner · internal team · manager · self.

### manager
- lead with the delta, not the story
```

Add rules by adding bullets under the matching section — never a skill edit. A section left
empty simply contributes nothing at its layer.
