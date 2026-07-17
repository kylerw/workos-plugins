# WorkOS v1 state schema (PLAN §4.3 — MC shapes, queue fields excluded)

Machine-written JSON under `{memory_root}/state/`. One writer per run (C4, lock per
docs/spikes/spike-4-single-writer.md). Derived values (scores, importance levels) are
computed at render time and never stored (C6). **Extension rule:** power-user extensions may
add fields; engine skills and the board ignore unknown fields; CI validates the baseline
only. Fixtures: `ci/fixtures/state/` — `ci/validate-state.sh` enforces everything below.

## tasks.json
```json
{ "generated": "ISO", "generatedBy": "sync|tidy|sweep",
  "lastFullSync": "ISO", "lastTidy": "ISO",
  "pendingApprovals": [ { "id": "", "kind": "", "target": "", "summary": "", "diff": "", "raisedBy": "", "raisedAt": "ISO" } ],
  "dayTask": { "id": "", "date": "YYYY-MM-DD", "context": "",
    "queue": [ { "rank": 1, "taskId": "?", "title": "", "account": "", "signal": "", "due": "YYYY-MM-DD?" } ] },
  "attention": [ "one line per item: degraded tool, version notice, approvals waiting" ],
  "lanes": { "NICE": [ { "id": "", "title": "", "signal": "", "context": "", "due": "YYYY-MM-DD?" } ] } }
```
Rules: task ids unique across all lanes · **date-driven signals** (`due-date`, `meeting-prep`)
MUST carry `due` · **judgment signals** (`waiting-them`, `deal-advancing`, `admin`) MUST NOT
carry `due` · **`overdue` and `nearDate` are NEVER stored** — they are render-time
derivations from `due`/`start` (C6); the board computes them, no pass refreshes them · v1 ships the single `NICE` lane (personal lanes = extension)
· NO `queueCursor` in the baseline (click-queue is power-user).

## meetings.json
```json
{ "generated": "ISO", "meetings": [ { "id": "", "lane": "NICE", "start": "ISO",
    "displayTime": "", "title": "", "who": "", "signals": { "external": true },
    "prep": false, "recap": false, "objective": "", "brief": {}, "briefPending": false,
    "cancelled": "true? (a cancelled meeting is marked, never deleted — the board strikes it through)" } ] }
```
Rules: `signals` is the ONLY importance representation — `importance`, `tier`, and `MIMP`
are banned field names (weights live in the board, applied at render). Known signal keys:
`revenue, external, youLead, decision, risk`. **`prep`/`recap` live ONLY as the top-level
booleans** (the writable flags from the selection flow) — never duplicated as signal keys.
Briefs carry `builtAt` (ISO) so the board can date them.

## drafts.json
```json
{ "recaps": [], "replies": [], "proactive": [], "dismissed": [] }
```
Draft: `{ "id": "", "to": "", "subject": "", "body": "", "source": "", "pendingRevision": "" }`
— every draft carries `pendingRevision` (empty string when none).

## suppressed.json
`{ "tasks": [], "meetings": [] }` — a suppressed id MUST NOT appear in any lane or the
meetings list.

## .pass-lock.json (transient — see spike 4)
`{ "pass": "sync|tidy|sweep", "startedAt": "ISO", "surface": "cowork|claude-code" }`
