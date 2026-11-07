---
account: {Account Name}
last_verified: {YYYY-MM-DD}
# About + tech stack + account glossary. Durable, externally-researched facts only.
# Every fact carries source / confidence / last_verified. Populated by the account-context skill.
# source: user | roster | invite | email-signature | web | salesforce | hinotes
# confidence: confirmed | inferred   (inferred facts render flagged until firmed up)
about:
  size: { value: "", source: web, confidence: inferred, last_verified: {YYYY-MM-DD} }
  region: { value: "", source: web, confidence: inferred, last_verified: {YYYY-MM-DD} }
  hq: { value: "", source: web, confidence: inferred, last_verified: {YYYY-MM-DD} }
  business_context: { value: "", source: user, confidence: inferred, last_verified: {YYYY-MM-DD} }
tech_stack: []
  # - { name: "", role: "", source: web, confidence: inferred, last_verified: {YYYY-MM-DD} }
glossary: {}
  # ACRONYM: { definition: "", confidence: inferred }
---

# About {Account Name}

<!-- A few sentences a person can read before a call. Keep machine-parseable facts in the
     frontmatter above; this body is for prose context. -->

## Tech Stack

<!-- Narrative on the current CX / EHR / integration stack and named pain points. -->

## Priorities

<!-- Lead use case, secondary tracks, stated long-term destination, active RFP / competitive field. -->

## Account Glossary

<!-- Account-specific acronyms and named entities, one per line, e.g.:
     - **CX1** — NICE's converged CXone + Cognigy platform. -->
