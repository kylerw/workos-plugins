#!/usr/bin/env node
// ctx-nudge.js — UserPromptSubmit: past the threshold, nudge the hand-off-and-clear
// move. The nudge lands at the exact decision point (a new prompt in a heavy session)
// and asks for one binary action — not a rule to remember. Silent below threshold.
const { lastUsage, readStdin, readConfig } = require(require('path').join(__dirname, 'ctx-lib.js'));

const THRESHOLD = Number(readConfig().threshold) || 150000;
const inp = readStdin();
const ctx = inp?.transcript_path ? lastUsage(inp.transcript_path) : null;

if (ctx !== null && ctx > THRESHOLD) {
  const k = Math.round(ctx / 1000);
  process.stdout.write(JSON.stringify({
    systemMessage: `ctx ~${k}k — heavy session. Say "hand off" when this task wraps, then /clear; the next session resumes from the handoff for ~2k.`,
    hookSpecificOutput: {
      hookEventName: 'UserPromptSubmit',
      additionalContext: `<system-reminder>Session context is ~${k}k tokens (threshold ${Math.round(THRESHOLD / 1000)}k). Every turn re-reads all of it. If the current task is near a boundary, offer ONE binary step: run workos-handoff's "hand off" so the user can /clear and resume from state/handoff.md (~2k) instead of carrying ~${k}k forward. Do not interrupt mid-task work for this.</system-reminder>`,
    },
  }));
}
process.exit(0);
