#!/usr/bin/env node
// ctx-statusline.js — statusline: live context size (+ cost when the harness provides it).
// Ambient visibility is the whole point: the number sits in view and gets redder,
// so "this session is heavy" is seen, not remembered. (#155 — context volume,
// not output length, is what the bill is made of.)
const { lastUsage, readStdin } = require(require('path').join(__dirname, 'ctx-lib.js'));

const inp = readStdin();
const parts = [];

const model = inp?.model?.display_name || inp?.model?.id || '';
if (model) parts.push(model);

const ctx = inp?.transcript_path ? lastUsage(inp.transcript_path) : null;
if (ctx !== null) {
  const k = Math.round(ctx / 1000);
  let tag;
  if (k >= 300)      tag = `\x1b[1;31mctx ${k}k — hand off & /clear\x1b[0m`; // red
  else if (k >= 150) tag = `\x1b[33mctx ${k}k\x1b[0m`;                        // yellow
  else               tag = `\x1b[2mctx ${k}k\x1b[0m`;                         // dim
  parts.push(tag);
}

const cost = inp?.cost?.total_cost_usd;
if (typeof cost === 'number') parts.push(`\x1b[2m$${cost.toFixed(2)}\x1b[0m`);

process.stdout.write(parts.join(' · '));
