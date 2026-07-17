# locked-next-step-format (shared resource; consumed via assets/shared/, C8)

The Salesforce Next Step line standard. Single source — skills reference this file; a
format change (e.g. after the manager conversation) is ONE edit here.

```
{Today MM/DD} {initials} {future action + future date + Name (Title) + specific outcome + brief context}
```

Rules (normative):
1. Leading date = today, surface-provided (never inferred, never the future action date).
2. `{initials}` (identity config, C2) immediately follow the leading date.
3. One sentence, ≤254 characters — mechanically verified (see the consuming skill's
   procedure); compose to a ~230-character budget.
4. The future action date appears inside the sentence and is after today. Rollover: a
   future MM/DD numerically smaller than today's is next year if within ~90 days.
5. Every referenced contact carries a title, sourced (never guessed).
6. The line differs materially from the prior step — re-dating is not a change.
7. Banned: "check in"/"touch base"/"follow up on status" language, passive verbs, vague
   phrasing, premature commercial escalation, CCS phase labels in the output.

Fictional example (161 chars):
`07/15 AB Delivering AI + WFM demo 07/22 to Jane Doe (VP Patient Access) and John Smith (CTO) at Acme Health following their request for a combined solution view.`

Status: inherited from the previous manager's rubric; the current manager's confirmation is
tracked in the manager-decision file (C2 config records who that is). Until then this is
the team standard candidate.
