# §B. Single opportunity — ad hoc
Reached only via workos-next-steps SKILL.md mode 2 — never standalone; Step 0, Role, C11, §D, §E, the three spine blocks, and the anti-patterns apply.


0. **Usage log (open):** once the config is resolved, append the `open` record per
   `assets/shared/usage-log.md` (`mode`: `single`; `passId` — this pass holds no lock).
   Append the matching `close` as the pass's last action, after the line is emitted, using
   that document's outcome mapping. Do not restate the mapping here. A failed append is
   never fatal: report it in the run output and continue.
1. **Resolve the account** against `{memory_root}/Accounts/` (excluding `_`-prefixed
   folders, per the memory-structure template). Exact/substring → proceed; one plausible
   nickname match → confirm; ambiguous/none → structured options ending with "it's a new
   account" → offer `workos-setup` ("init {account}") — but **never block the line on
   scaffolding**: generate from available context now, offer the folder after.
2. **Resolve the opportunity:** `mcp` tier → the §A1 SOQL scoped to the account
   (`AccountId = {Id}`, resolved per §E). `manual` tier → enumerate
   `01_Opportunities/{OppNumber}_{Label}/` folder names as the local opp registry,
   cross-checked against anything pasted. Multiple → structured options (user's own opps
   first); ownership rule as in A1. The opp display rule applies — SKILL.md's `The opp
   display rule (all modes)` block.
3. **Gather context (silently, gated by `{integrations}`):** `Account_Notes.md` Open
   Commitments + Strategy Notes; `Contacts.md` for canonical names/titles (never guessed);
   `Sphere_of_Influence.md` for who should be named; hinotes (only if configured)
   date-bounded from the prior step's leading date or last 14 days; ms365 mail/calendar
   same bound. Missing files or absent tools → skip silently.
4. **Confirm the intake fields once** (structured options): account · opportunity + owner ·
   prior step (three states: confirmed-live / confirmed-blank / unconfirmed) · **current
   CloseDate** (+ stage/forecast when known) · new context · future action date · contacts
   with titles. If CloseDate cannot be confirmed at all, the output is marked
   `draft — close-date unverified, not approved for paste`.
5. **Generate (§D) and present the line + change entry together; on acceptance, append a
   §A6-format entry under the `single` header token** (#266; Outcome: changed; Observed from this run's intake) — `Id` per the
   §A6 writer rules: the scoped SOQL's own value at `mcp` tier, `unknown` at `manual`.
   Any adjustment → re-present the revised line + change entry in the same turn as the new
   gate (`render-before-gate`) before appending. When the entry marks real movement for the next sweep — an accepted line
   is the normal case; administrative/no-track touches are not — include the optional
   final `Surface: next-sweep` line in the rendered change entry, per SKILL.md's `The §A6
   entry format — grammar and writer rules (Next_Step_Log.md)` block: it is part of the
   entry the gate approves, never its own question.
