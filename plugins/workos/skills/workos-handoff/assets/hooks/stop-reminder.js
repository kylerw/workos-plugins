#!/usr/bin/env node
// stop-reminder.js — Stop: when a session that did real work ends and the handoff was
// not touched, say so once. Advisory only — it never blocks the stop. Trigger is
// exactly the file test (spec §5.3): handoff.md unmodified during this session.
// "Substantive" is approximated by transcript size; small sessions stay silent.
const fs = require('fs'), path = require('path');
const { readStdin, readConfig } = require(path.join(__dirname, 'ctx-lib.js'));

const MIN_TRANSCRIPT = 262144; // 256KB — below this, the session was too small to nag about
const inp = readStdin();
const root = readConfig().memory_root;
if (root && inp?.transcript_path) {
  try {
    const t = fs.statSync(inp.transcript_path);
    if (t.size >= MIN_TRANSCRIPT) {
      const sessionStart = t.birthtimeMs && t.birthtimeMs > 0 ? t.birthtimeMs : t.ctimeMs;
      let handoffMtime = 0;
      try { handoffMtime = fs.statSync(path.join(root, 'state', 'handoff.md')).mtimeMs; } catch { /* absent counts as unmodified */ }
      if (handoffMtime < sessionStart) {
        process.stdout.write(JSON.stringify({
          systemMessage: 'This session did substantive work and the handoff was not updated — say "hand off" to write one before you close.',
        }));
      }
    }
  } catch { /* stat failure — stay silent, this hook is advisory */ }
}
process.exit(0);
