# align filenames {account} — retroactive prefix alignment (§F)

Brings ONE existing account folder in line with `Account_Project_Instructions.md`
§Customer file prefix. Attended-only (the SKILL.md mode entry owns the refusal);
additive discipline throughout: nothing moves without its own approved manifest
line. This mode holds NO lock — it writes account files, never `state/`.

1. **Usage log (open):** append the `open` record per `assets/shared/usage-log.md`
   (`mode`: `align`; `passId` — this pass holds no lock). Append the matching
   `close` as the pass's LAST action, after step 7's report — the POSITION, not the
   execution: a declined manifest and a nothing-to-align run are equally legitimate
   terminal outcomes. Use that document's outcome mapping. Do not restate it here.
   A failed append is never fatal: report it and continue.
2. **Resolve the account** per §B step 1's rules (exact → substring → nickname with
   confirmation; `_`-prefixed folders excluded). No folder → stop with the §B
   pointer ("init {account}" scaffolds; align has nothing to align).
3. **Precondition — the prefix itself:**
   - `account_file_prefixes` has this account → proceed with that value.
   - No entry, no `file-prefix:{Account Folder Name}` decline → run the one structured
     ask (capture Step 0.3's question; constraints and derivation per the schema row —
     C11: derived candidate / type my own / no prefix). Confirmed
     → the gate-confirmed config offer (the #40 pattern) writes the entry, then
     proceed. Declined → record the key (the #70 pattern), report "no prefix —
     nothing to align", close.
   - Decline already recorded → report it and the way back ("let me re-decide" via
     setup), close. Never proceed on a declined account.
4. **Enumerate** the account folder for PLAIN-FORM engine-nameable names — files
   matching `{YYYY-MM-DD}_*` under `02_Meetings/`, `03_Competitive Intel/`, and
   opportunity subfolders, plus meeting folders `02_Meetings/{YYYY-MM-DD}_*/`.
   §Customer file prefix's never-prefixed names NEVER enter the manifest (root
   fixed-name files, `Notes.md`, opp folders, `CLAUDE.md`, `Prep/`, `Archive/`).
   Already-prefixed names do not match the plain form — a clean re-run enumerates
   nothing (idempotent). Nothing found → report "already aligned", close.
5. **Build the manifest** — every line exact and specific, three kinds:
   - `RENAME {old relative path} → {new relative path}` — the new name = the old
     with `{PREFIX}_` prepended to the basename (folder or file). A target that
     already exists on disk → the line renders `SKIP {old} — target exists`, never
     an overwrite.
   - `REWRITE {file}: [[{old folder name}]] → [[{new folder name}]]` — one line per
     affected file, for wiki-links in `Account_Notes.md` and in each renamed meeting
     folder's `Notes.md`.
   - `REWRITE {file}: {old name} → {new name}` — same, for plain-text path
     references to a renamed name in those files.
   Rewrite lines exist ONLY for names being renamed in this manifest; rewrites scan
   ONLY `Account_Notes.md` and the meeting `Notes.md` files inside this account
   folder — never other accounts, never outside the account folder.
6. **ONE gate (C5/C14):** render the FULL manifest — every line, grouped RENAMEs
   then REWRITEs, SKIP lines included with their reasons — and one structured
   question: "1. Apply all {n} lines / 2. Apply with named exceptions (tell me which
   lines to drop) / 3. Cancel — change nothing." Option 2 re-renders the reduced
   manifest and re-gates (C14). Cancel → nothing written, close. **Dropping a RENAME
   drops its dependent REWRITE lines with it** — a rewrite whose rename didn't
   happen would break the link it claims to fix; the re-render says so per dropped
   group.
7. **Execute in order, verify, report:** folder renames first, then file renames,
   then rewrites (rewrites reference post-rename names). Immediately before each
   rename, re-stat the source — vanished or changed → that line and its dependents
   SKIP loudly, never a stale-approval write. After execution, verify every applied
   line (renamed name present, old name absent; each rewrite read back). Report:
   `align {account}: {r} renamed · {w} files rewritten · {s} skipped ({reasons})`.
   Then the usage `close` (step 1's position).

## Never
- A write before the step-6 gate, or outside an approved manifest line (C5).
- Touching another account, `state/`, the journal, or anything outside this
  account's folder.
- Renaming a never-prefixed name (§Customer file prefix's exempt list) — even if
  asked mid-flow; that is a spec change, not an alignment.
- Inventing a prefix: no confirmed config entry → no manifest (step 3 owns the ask).
