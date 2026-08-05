#!/usr/bin/env node
// sessionstart-resume.js — SessionStart: inject the current handoff so a fresh session
// starts oriented without being asked. Silent when no config or no handoff exists.
// Injection is capped: a handoff should be ~2k tokens; if the file is somehow huge,
// inject the head and say so rather than defeating the point.
const fs = require('fs'), path = require('path');
const { readConfig } = require(path.join(__dirname, 'ctx-lib.js'));

const root = readConfig().memory_root;
if (typeof root === 'string' && root) {
  const file = path.join(root, 'state', 'handoff.md');
  let text = null;
  try { text = fs.readFileSync(file, 'utf8'); } catch { /* no handoff — stay silent */ }
  if (text) {
    const CAP = 16384; // ~4k tokens, double the target size — headroom, not license
    const clipped = text.length > CAP ? text.slice(0, CAP) + '\n\n[clipped — handoff exceeds the size target; read the file for the rest]' : text;
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'SessionStart',
        additionalContext: `<workos-handoff current="${file.replace(/"/g, '&quot;')}">\n${clipped}\n</workos-handoff>\n<system-reminder>A current session handoff exists (above). If the user's first message is about resuming work ("resume", "where were we", or similar), start from its First action instead of re-deriving. Otherwise leave it unmentioned.</system-reminder>`,
      },
    }));
  }
}
process.exit(0);
