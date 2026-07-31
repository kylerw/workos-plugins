---
manager_name: Jordan Doe
manager_email: jordan@example.com
ns_rubric_status: confirmed
update_cadence_day: Thursday
team_publish: gated
team_publish_trigger: ns-confirmed
team_publish_folder: Team/updates/Alex Baker
decided_by: Alex Baker
decided_on: 2026-07-15
---

<!-- The per-root manager-decision file — each user's OPERATIONAL adoption of the
     team-wide decision record (the committed repo file PLAN §4.4 names). The engine
     reads the FRONTMATTER ONLY; everything below this comment is yours, never parsed.
     Directly-authored: the engine never regenerates, rewrites, or appends this file —
     setup offers to create it (once, from this template) and validates the keys.

     team_publish: off | gated | auto-with-notice
       off             — the weekly sweep never publishes to Team/
       gated           — the sweep asks "Publish this week's update to Team/?" each run
       auto-with-notice — once the sweep's next-step lines are approved (that approval
                          renders the complete file), it publishes with one notice line
     team_publish_trigger: ns-confirmed (the only value; absent means the same)
     update_cadence_day: Monday…Friday — the due day the sweep schedule anchors to
     team_publish_folder: your own subfolder under Team/ — write-your-own only; must
       be relative and root-contained (never absolute, never ..), with your name as
       the terminal segment.
     decided_by / decided_on: whose decision this records, and when.
     An unknown or missing publish value never publishes — the sweep skips and says
     why; an unknown cadence day only unsettles the schedule default. auto also
     requires decided_by/decided_on — consent must carry provenance. -->
