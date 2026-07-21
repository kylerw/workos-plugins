# contact-resolution — email is the join key (#40)

Run this procedure BEFORE any contact name is written or flagged, on every surface.
Consumers: workos-capture (intake) · workos-sync (S3 titles, S4 briefs) ·
workos-next-steps (§D lines). Referenced by number+name; never restate these rules.

## The procedure

1. **Evidence tuple** per participant: email address(es) · display name · transcript
   spelling(s). Any subset may be present. Normalize emails first: strip `mailto:`,
   angle brackets, trailing punctuation; compare case-insensitively.
2. **Email join first** — against the RESOLVED ACCOUNT'S OWN `Contacts.md` (secondary:
   `Sphere_of_Influence.md`). A registry hit WINS over transcript spellings and
   display-name guesses **when the names are compatible** — compatible = NO conflicting
   name parts: first names match (a standard nickname like Mike ~ Michael is compatible)
   AND surnames either match or are absent on one side. A DIFFERING surname (registry
   "Maria Rodriguez-Vega", display "Maria Smith") is gross disagreement, never a silent
   registry win. Gross disagreement (registry "Daniel", display "Sofia"), one email
   matching two rows, or a shared inbox → attended: one C11 confirmation; unattended:
   treat as unresolved. A stale hand-typed row must never silently overwrite live
   evidence, or vice versa. A `Contacts.md` that reads but does not parse as expected
   (malformed tables, unrecognizable shape) is treated as NO registry, never a guessed
   match off a malformed row: an unparseable Contacts.md removes the PRIMARY registry
   only — a parseable Sphere_of_Influence.md may still resolve as secondary; neither
   parseable → unresolved, with one attention line ("registry unparseable:
   {Account}/Contacts.md").
3. **No email match → exact full-name match** (first + last) against the same files:
   the full name compared comes from the display name first, transcript spelling second;
   sources conflicting on the full name = ambiguity (step 2 treatment). Two rows with the
   same full name → same treatment as email ambiguity. Still nothing → unresolved.
4. **Never derive any name part from an email handle.** Unknown surname renders
   `{Firstname} ({Account} — surname unconfirmed)`. Handle-only evidence (no display
   name, no registry hit) renders the verbatim address —
   `mrodrig@vendorco.example — name unconfirmed` — the address is evidence; a name
   parsed from it is derivation. A full display name with NO registry match renders AS
   GIVEN on internal surfaces — it is evidence, not derivation, and gets no decoration —
   but the person is still *unresolved*: step 6's confirmation applies, and outbound
   surfaces (next-steps §D) treat an as-given name that is neither registry-resolved nor
   user-confirmed as unresolved (block/restructure). In STATE items (task
   titles/summaries), an as-given never-confirmed name carries the suffix
   ` ({Account} — unverified)` — the third marker form, so step 8's re-run can find it;
   chat and brief renders may show the plain name. All three marker forms (surname
   unconfirmed · name unconfirmed · unverified) are what step 8 scans for.
5. **Per-account scope.** Evidence from account A never completes a name in account B,
   even in the same session or harvest batch. Registry hits inform RENDERING only,
   after the account is resolved by its own evidence — never account attribution.
6. **Unresolved + attended:** one C11 confirmation PER unresolved person, asked
   consecutively BEFORE the pass's apply/save gate; each answer is offered as a
   `Contacts.md` row append in the same gate (C14-rendered). Options: 1. Confirmed — use
   {resolved rendering} (also appends the `Contacts.md` row) / 2. Different person — let
   me correct / 3. Skip this pass. For ambiguous matches (two rows, shared inbox, gross
   disagreement) the confirmation lists the candidate rows as options (C11 — ≤4 options
   TOTAL, so at most two candidate rows beside "someone else — let me type it" and "skip
   this pass"; more candidates → page the question) plus "someone else — let me type it"
   and "skip this pass"; a shared inbox may resolve to a person OR stay the address (a
   legitimate answer). An attended SKIP writes the unconfirmed/as-given form, joins the
   aggregate attention line (step 7), stays eligible for step 8's re-run, and is
   re-offered at the next attended sync — "never asked twice" applies to ANSWERED
   confirmations, not skips. A PURE TOUCH (journal-only, no account file written) runs
   resolution for rendering but never offers the registry append and skips pre-gate
   confirmations — resolution questions belong to flows with a durable write to attach
   them to. The row append is offered only in passes holding the write right (capture's
   gate; attended sync S7) — other consumers (next-steps) confirm the RENDERING only, and
   the confirmation is durable only when a write-right pass later records the row.
7. **Unresolved at pass end (both modes):** every contact still unresolved when the pass
   closes joins ONE aggregate `attention[]` line ("{N} contacts unconfirmed — resolve at
   next attended sync"). Unattended additionally: never ask — ambiguity and unresolved
   both take this path silently. N counts unique person-per-account identities unresolved
   at pass end; each pass's refresh REPLACES the prior aggregate line — no accumulation,
   no stale counts. The attention[] line is written by state-writing passes (sync) only —
   capture and next-steps surface the same count in their close output instead (C4: they
   never write state).
8. **Resolution moment:** attended sync S3 re-runs this procedure over EXISTING
   markers (all three forms of step 4) in state, not just newly entering names —
   re-reading those markers' accounts within sync S2's contact-resolution read
   allowance. Tidy is NOT a resolution surface (its read-set bars account folders). On
   confirmation, queue one `pendingApprovals` item (kind `task-rewrite`) PER affected
   task id (target = that task id, per the #50 recipe) — never one item spanning many.
   Meeting-brief occurrences are NOT queue items: briefs re-render from `Contacts.md` at
   build/refresh, so the confirmed name lands at the next brief refresh. Account files
   already written are go-forward only.

## Writing the confirmed row

A row requires Name + Email (the join key); side/section = the section matching the
person's org, asked in the same confirmation when not obvious; other cells may stay
blank. **The registry row IS the "never asked twice" record (keyed account + email)** —
a confirmation that cannot produce a row (no email in evidence) records nothing durable
and MAY be re-asked; the ask says so. The word "single" means one append operation PER
confirmed person — several manifest items may share one consolidated gate, each rendered
(C14).

Only through an approval gate, only in passes allowed to touch account files (capture's
gate; attended sync S7 — after the state writes, read-back verified). Row carries `source:
gate-confirmed · last_verified: {date}` — recorded as a trailing annotation inside the
row's last cell (no extra column; template-created files use the same form). Mechanics per
the Contacts.md template: section has no table → create header + separator + row; a table
lacking the `Email` column (one column short of its section's template shape) → adding it
is the explicitly granted, gate-rendered header rewrite that preserves every non-header
line byte-for-byte in place (hand-sorting, commentary rows, blank lines included) and
renders the exact before/after in the gate (C14); an email cell may hold multiple
addresses — matched individually, appended to, never replaced. `Contacts.md` absent →
create it from the shared template (rendered in the gate). `pendingApprovals` NEVER
carries account-file writes — an unattended discovery writes the attention line of step 7
instead.

## Outbound surfaces

The unconfirmed forms are for internal surfaces (state, briefs, notes). Output that
leaves WorkOS (a paste-ready Salesforce line) must not carry them — the consumer skill
blocks or restructures (next-steps §D owns that rule).
