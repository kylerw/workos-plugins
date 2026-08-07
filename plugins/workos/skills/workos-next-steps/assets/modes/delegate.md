# §C. Delegate mode (`workos-sync`, `workos-capture`)
Reached only via workos-next-steps SKILL.md mode 3 — the caller is another engine skill; Step 0's resolution is the caller's; §D, the §A6 entry-format block, and the anti-patterns apply.


- Reuse every intake field the caller hands over as already-confirmed — never re-resolve or
  re-confirm. Fill genuine gaps only, from the cheapest tier-appropriate source.
- A handed-over name in an unconfirmed/as-given form is restructured out per §D — never
  emitted, never re-asked (the caller owns the confirmation).
- Skip research sweeps — the caller owns context gathering.
- **Return `{line, change_entry, validation}` and write NOTHING.** The caller must present
  the line and change entry together at its single `draft-before-write` gate, and the
  caller appends the §A6-format log entry exactly once after acceptance. One writer, one
  approval per artifact.
- The change entry renders under the `delegate` header token (#266). This skill judges the stamp when composing it: an accepted next-step line marks real movement — include the optional final `Surface: next-sweep` line by default; omit it for administrative/no-track touches. The caller's single gate approves the entry bytes as ever; the caller appends verbatim.
- The change entry's Observed line writes `Id unknown`, always — sync/capture hold no
  SOQL result, and per §A6's writer rules a value from anywhere else is fabricated.
  The caller appends it as-is; an mcp-tier SWEEP re-observes the real Id on its next
  pass.

**§C writes no usage record.** `workos-sync` or `workos-capture` invoked this skill, and
that pass already recorded itself. A record here would double-count the exact metric the
log exists to make trustworthy.
