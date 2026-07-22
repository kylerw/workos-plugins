# WorkOS — Setup Guide (Day 1, ~15 minutes)

WorkOS is the team's AE daily driver: every weekday morning it reads your calendar and
inbox, stages your day on a board, and captures your commitments into each account's own
files — everything reviewed by you before it's saved. Two things it will **never** do:
write to Salesforce (you always paste), or send email by itself (you always send).

If anything on this page confuses you, that's a bug in the page — tell whoever sent you this link.

---

## A. Your memory folder (2 min)

1. In your corporate OneDrive, create a folder named **`WorkOS`** (top level is fine —
   and the name is actually yours to choose; setup records whatever you pick).
2. In File Explorer: right-click the folder → **"Always keep on this device."**
   ← Don't skip. OneDrive's placeholder files cause failures that look like data loss.

Already have an old personal folder buried somewhere deep? Start with a FRESH folder now and migrate files later — very deep paths can fail to open files at all.

## B. The Team folder (2 min)

This connects you to the shared leadership folder (weekly updates, engine version).

1. Open your **Team SharePoint site** → **Documents → WorkOS →
   Team**.
2. Click the **⋯** next to the `Team` folder → **"Add shortcut to OneDrive."**
3. A shortcut appears at the top level of your OneDrive ("My Files"), named something
   like **"{Site Name} Team."** **Move it into your WorkOS folder**, then
   **rename it to exactly `Team`**.

Done right, `WorkOS/Team/` opens to the shared folder. (If you skip this, everything
still works — you'll just see a "Team/ not set up" note in health checks until you do it.)

## C. The Cowork project (3 min)

4. In Cowork: create a project named **WorkOS**.
   Cowork may auto-rename the project when it's created. Renaming it back is safe — **⋯ → Edit details → rename** — nothing breaks.
5. In the project's settings, add **folder access** pointed at your WorkOS folder — this
   is what stops constant file-permission prompts.
6. Connectors (account-level, one time): make sure **Microsoft 365** is connected. If
   your list offers **"Graph - Production"**, connect it too — setup will then know your
   name and manager automatically instead of asking.

## D. The skills — one plugin, no downloads (2 min)

7. **Settings → Plugins → Add marketplace** (some builds: **Customize** top-left, then Plugins — the Plugins entry is the one you want) → paste **`kylerw/workos-plugins`**
   → Sync. (You'll see a red "make sure you trust this plugin" notice — that's standard
   for any non-Anthropic plugin. This one is ours.)
8. Install the **workos** plugin — the `workos-…` skills appear automatically.
9. Turn auto-updates on — the exact path: **Browse plugins → Personal → click the
   marketplace entry itself (NOT Edit) → scroll to the Plugins section at the bottom →
   ⋯ menu on the workos plugin → "Sync automatically" ON → then "Check for update".**
   ← Don't skip: it's off by default, and it's how updates reach you without
   re-installing. *Missed it during install? Come back any time — same path.*

## E. First run (5 min)

10. In your WorkOS project, new chat: **`/workos-setup init my workspace`**
11. Answer its questions — they come as numbered options; pick a number. It shows you
    everything it's about to create **before** creating anything.
12. When it asks which accounts to start with: your **top 3–5**, not your whole book.
    The rest get set up automatically as you touch them.
13. Say **yes** when it offers the scheduled task (your 7:00 AM sync). Its prompt ends
    with `(scheduled, unattended)` — leave that in; it's how the skill knows nobody is
    watching.
14. **The last thing init hands you is your project instructions** — a text block it
    generates for you. Open your WorkOS **project's settings → instructions field** and
    paste it in. This is what loads your config and your `user.md` into every chat in
    the project — skip it and each new chat starts blind.
    *Done when: the project's instructions field shows the pasted text.*
    (Already had instructions in that field? Copy the old ones to a note first —
    pasting replaces them.)

New-user tip: a chat that's still working shows a pulsing dot next to it in Recents.

## F. Yours to customize — `user.md` (know this one)

Setup creates three files at the top of your folder. The ownership rule is simple:

| File | Whose | What it's for |
|---|---|---|
| `core.md` | **The engine's.** Don't edit — setup regenerates it. | Your config + the operating rules |
| **`user.md`** | **YOURS. Edit freely, any time.** | How you want Claude to work *for you* |
| `CLAUDE.md` | The engine's. Don't edit. | Glue — loads the other two every session |

`user.md` is your tailoring space: your voice preferences ("terse, no filler," "always
show times in Mountain Time"), how you triage email, personal tools you use, pet peeves,
anything. **Nothing you put in `user.md` can break WorkOS** — the engine never reads it
as configuration — and no update will ever overwrite it. If you want the assistant to
behave differently, this file is almost always the answer.

## G. The daily rhythm

- **7:00 AM weekdays**: your sync runs by itself. Open the chat to see the day staged,
  and say **"build my board"** once to get the visual board (it refreshes automatically
  after that).
- **Any time**: **"tidy"** = quick refresh · **"sync my day"** = full pass ·
  **"log a call"** / **"capture the meeting with …"** = save a touchpoint or meeting
  into the account's files (arriving in the next update).
- **Weekly**, when leadership's reminder lands: **`/workos-next-steps run my weekly next
  steps`** → paste your pipeline report → review one approval screen → paste the output
  lines into Salesforce and send the email yourself.

**If Cowork is paused (usage limits, an outage):** open Claude Code in the same folder
and run `sync my day` when you sit down — attended beats the scheduled run (questions
get asked; approvals apply instead of queuing). Don't create a second scheduled task in
Claude Code: one scheduler (Cowork) is the design, and when Cowork resumes its schedule
just resumes. A same-day duplicate unattended sync skips itself either way.

## H. Things that look scary but aren't

- **"Allow Claude to permanently delete files?"** at the end of a sync — that's the sync
  releasing its own run-lock file, not your data. **Allow it.** (Denying just leaves a
  stale lock that clears itself in 30 minutes.)
- **Red trust notice** when adding the marketplace — standard for all third-party
  plugins.
- **"READ-ONLY VIEW" badge** on the board — normal for now; the board is a display, and
  you act through chat. Tappable buttons are on the roadmap.
- **"STALE — RUN A SYNC" badge** — the board is older than your day; say "tidy."

## I. Already have a working setup? (brownfield)

Run the same `init my workspace`. It detects a mature root and **will not bulldoze it**:
existing files are read-only inputs, everything is additive-only, and anything it wants
to change is shown to you first. If your existing files mix personal content into
`core.md`, it offers a **split** — moving your personal content verbatim into `user.md` —
and does nothing without your approval.

## If something's off

- **`/workos-setup check my setup`** — a health report ending in `ok / findings /
  skipped` counts, with the shortest fix list. "Salesforce: manual tier" is normal for
  most of the team, not an error.
- Send the doctor output to whoever sent you this link — it includes your engine version.
