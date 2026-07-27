# WorkOS — Setup Guide (Day 1, ~15 minutes)

WorkOS is the team's AE daily driver: it stages your day on a board from your calendar
and inbox (connected where your surface allows it — otherwise from what you paste), and
captures your commitments into each account's own files — everything reviewed by you
before it's saved. Two things it will **never** do: write to Salesforce
(you always paste), or send email by itself (you always send).

You'll set this up in the **Claude desktop app** — one app, one plugin, one folder.
(Using Cowork instead? That path is supported — see the **Alternate surface: Cowork**
section near the end, and note the desktop path is the one we verify first.)

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

1. Open your **Team SharePoint site** → **Documents → WorkOS → Team**.
2. Click the **⋯** next to the `Team` folder → **"Add shortcut to OneDrive."**
3. A shortcut appears at the top level of your OneDrive ("My Files"), named something
   like **"{Site Name} Team."** **Move it into your WorkOS folder**, then
   **rename it to exactly `Team`**.

Done right, `WorkOS/Team/` opens to the shared folder. (If you skip this, everything
still works — you'll just see a "Team/ not set up" note in health checks until you do it.)

## C. The Claude desktop app (2 min)

1. Install the **Claude desktop app** (claude.ai/download) and sign in with your work
   Claude account.
2. Open **Claude Code** in the app and start a session **in your WorkOS folder**
   (choose the folder when the session asks, or open it via the folder picker — the
   folder lives at `C:\Users\{you}\OneDrive - {Company}\WorkOS`).
   *Done when: the session shows your WorkOS folder as its working folder.*

That folder choice is the whole integration: every chat opened in this folder
automatically loads your config and your personal files — **there is no
"paste the project instructions" step on this surface.**

## D. The plugin — one marketplace, no downloads (2 min)

3. In the session, type: **`/plugin marketplace add kylerw/workos-plugins`**
   (You'll see a red "make sure you trust this plugin" notice — that's standard for any
   non-Anthropic marketplace. This one is ours.)
4. Install the **workos** plugin from that marketplace — if the add step doesn't offer
   installation on the spot, open **`/plugin`** and install it from the marketplace
   listing there. *Done when: typing `/workos-` in the chat box shows the workos
   skills.*
5. **Know how updates work — two steps, not one.** Third-party marketplaces do NOT
   auto-update by default; turn auto-update on for this marketplace if offered. Either
   way, when a new engine version ships: open **`/plugin`**, find this marketplace, and
   run its update/sync action (the exact menu wording varies by app version), then
   **reload the app window** — an update that has downloaded is *staged*, not
   *running*; the reload is what loads it. *Done-check: the next sync's first line
   shows the new version (`workos-sync {version} on claude-code`).*

## E. First run (5 min)

6. In your WorkOS-folder session: **`/workos-setup init my workspace`**
7. Answer its questions — they come as numbered options; pick a number. It shows you
   everything it's about to create **before** creating anything.
8. When it asks which accounts to start with: your **top 3–5**, not your whole book.
   The rest get set up automatically as you touch them.
9. **Scheduling, honestly:** on this surface the rhythm is *attended-first* — say
   **"sync my day"** when you sit down, and questions get answered live. If setup
   offers a scheduled task and you want a 7:00 AM attempt anyway, say yes — its prompt
   ends with `(scheduled, unattended)`; **leave that in** if you ever edit the task —
   and know it only runs while your laptop is on and awake, so treat it as a bonus,
   not the plan.
10. **Prove it works:** say **"sync my day"**. *Done when: the reply's first line reads
    `workos-sync {version} on claude-code` and your day appears staged.* First runs ask
    permission before writing files — that's Claude Code being careful, and it's
    normal; approve what setup shows you.

New-user tip: a chat that's still working shows a pulsing dot next to it in the
session list.

## F. Yours to customize — `user.md`, `voice.md`, and `workspace.md`

Setup created five files at the top of your folder. The ownership rule is simple:

| File | Whose | What it's for |
|---|---|---|
| `core.md` | **The engine's.** Don't edit — setup regenerates it. | Your config + the operating rules |
| **`user.md`** | **YOURS. Edit freely, any time.** | How you want Claude to work *for you* |
| **`voice.md`** | **YOURS. Edit freely, any time.** | Tone/formatting rules — what to strip before a paste lands in SFDC, Teams, or email |
| **`workspace.md`** | **YOURS. Edit freely, any time.** | Durable workspace notes — filing rules, operating conventions |
| `CLAUDE.md` | The engine's. Don't edit. | Glue — loads the other four every session |

`user.md` is your tailoring space: how you triage email, personal tools you use, pet
peeves. `voice.md` is narrower — tone/formatting rules ("terse, no filler") — seeded
from a template on your first run; skills that draft prose check it and print a
`voice check: …` line so you can see it was applied. `workspace.md` holds durable
workspace notes; if setup ever finds notes of yours living in `CLAUDE.md`, it OFFERS to
move them here — shown verbatim, only with your approval, never silently. **Nothing you
put in these three files can break WorkOS** — the engine never reads them as
configuration — and no update will ever overwrite them. If you want the assistant to
behave differently, one of these three files is almost always the answer.

## G. The daily rhythm

- **When you sit down**: **"sync my day"** — the day gets staged; say **"build my
  board"** once and `Board.html` appears in your folder (open it in your browser; it
  refreshes on every sync after that).
- **Any time**: **"tidy"** = quick refresh · **"log a call"** / **"capture the meeting
  with …"** = save a touchpoint or meeting into the account's files.
- **Weekly**: on your update's due day (or the evening before), say **`weekly next
  steps`**, choose **Finalize**, review the one approval screen, then paste the lines
  into Salesforce and send the email yourself. (No Salesforce connection? The draft
  builds from your own logs and says so.)
- **Deep work on one account?** Open a session in that account's folder under
  `Accounts/` — it carries its own instructions. (On Cowork: stay in your one WorkOS
  project — its instructions route Claude to the account's own file.)

## H. Things that look scary but aren't

- **No permission prompt appears when a sync finishes** — lock release is a normal
  file write. If you ever DO see a **"permanently delete files?"** ask after a sync,
  that's an older engine build releasing its run-lock — not your data. Allowing or
  denying are both safe (a denied one clears itself in 30 minutes) — then update the
  plugin (§D step 5).
- **Red trust notice** when adding the marketplace — standard for all third-party
  plugins.
- **Board buttons copy instead of clicking through** — on this surface the board is a
  read-only view: tapping a button copies the exact chat ask to your clipboard with a
  "copied — paste into your WorkOS chat" toast. Paste it into your session and the
  skill applies it with its normal confirmation.
- **"STALE — RUN A SYNC" badge** on the board — the board is older than your day; say
  "tidy."

## I. Already have a working setup? (brownfield)

Run the same `init my workspace`. It detects a mature root and **will not bulldoze
it**: existing files are read-only inputs, everything is additive-only, and anything it
wants to change is shown to you first. If personal content lives in `core.md`, it
offers a **split** (moved verbatim into `user.md`); if durable notes of yours live in
`CLAUDE.md`, it offers the same **move** into `workspace.md` — and it does nothing
without your approval.

**Connectors you had, that aren't connected in this session, are KEPT.** If your config
records Salesforce or Graph but this particular session doesn't expose them, re-running
init **retains** them and says so — one line per connector, "recorded but not exposed in
this session — retained." It will not quietly drop a connector just because it can't see
it right now, and it never downgrades your Salesforce tier on absence alone. To actually
remove one, say **"let me pick integrations"**. The confirmation always shows the
integration outcome on its own line — adopted / retained / unchanged — so a change never
lands unannounced.

## Alternate surface: Cowork (supported; the desktop app gets verification first)

The same engine is designed to run in Cowork against the same folder — kept supported for
anyone who prefers it or whenever the desktop app isn't an option. The desktop path is the
one we verify first, so if something here looks off, say so rather than working around it:

1. Create a Cowork project named **WorkOS** (Cowork may auto-rename it on creation —
   renaming it back is safe: **⋯ → Edit details → rename**); in its settings add
   **folder access** pointed at your WorkOS folder, and connect **Microsoft 365** at
   the account level. If your connector list offers **"Graph - Production"**, connect
   it too — setup will then know your name and manager automatically instead of asking.
2. Skills: **Settings → Plugins → Add marketplace** → `kylerw/workos-plugins` → Sync →
   install **workos** → turn "Sync automatically" ON (Browse plugins → Personal → click
   the marketplace entry itself (NOT Edit) → Plugins section → ⋯). If plugins aren't
   available to your account, **ask whoever set up WorkOS for your team for the `.skill`
   bundles**
   and upload them to the project instead — they're built on each release but aren't
   self-serve yet.
3. Run `init my workspace` there. **One Cowork-only step:** the LAST thing init hands
   you is a project-instructions text block — paste it into the project's settings →
   instructions field (copy your old instructions to a note first; pasting replaces
   them). Skip it and each new chat starts blind.
4. Cowork can hold the **7:00 AM weekday scheduled sync** — if you set one up, keep it
   as the ONLY scheduler (don't add a desktop one too; a same-day duplicate sync skips
   itself either way).

**One Cowork project for your whole memory root** — not one per account. The project
instructions you pasted in step 3 are what tell Claude to read an account's own
`Account_Project_Instructions.md` when it works in that account's folder, so a single
project covers every account. Pin it and your key chats so they stay in the left panel.

**Tapping the board artifact from OUTSIDE its chat may open a new "discuss the board"
chat.** That's the platform, not a bug. Your build/sync conversation is still in Recents —
go back there to continue.

## If something's off

- **`/workos-setup check my setup`** — a health report ending in `ok / findings /
  skipped` counts, with the shortest fix list. "Salesforce: manual tier" is normal for
  most of the team, not an error.
- **"generated boilerplate is schema {M}, bundle ships {N}"** — not a problem with your
  data. Your `core.md` was written by an older engine version and is missing a generated
  section since added. Re-run **`init my workspace`**; it regenerates `core.md` (engine-owned)
  and never touches `user.md`, `voice.md`, or `workspace.md`.
- **"scheduler not exposed on this surface"** — a SKIP, not a failure. This session can't
  see a task scheduler, so the check didn't run and deliberately made no offer to create
  one, since a task may already exist in another surface's scheduler.
- **A check that says SKIP is not a pass.** The summary says "issues found" rather than
  green whenever something couldn't be checked — that's on purpose.
- Send the doctor output to whoever sent you this link — it includes your engine version.
