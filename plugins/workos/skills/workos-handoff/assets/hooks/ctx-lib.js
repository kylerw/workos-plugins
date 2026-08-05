// ctx-lib.js — shared: current context size from a Claude Code transcript.
// Context = input + cache_read + cache_creation of the LAST assistant usage block:
// that sum is what the next turn re-reads. Reads only the file tail — transcripts
// can be hundreds of MB.
const fs = require('fs');

function lastUsage(transcriptPath) {
  let fd;
  try { fd = fs.openSync(transcriptPath, 'r'); } catch { return null; }
  try {
    const size = fs.fstatSync(fd).size;
    const want = Math.min(size, 262144); // 256KB tail
    const buf = Buffer.alloc(want);
    fs.readSync(fd, buf, 0, want, size - want);
    const lines = buf.toString('utf8').split('\n');
    for (let i = lines.length - 1; i >= 0; i--) {
      if (!lines[i].includes('"usage"')) continue;
      try {
        const rec = JSON.parse(lines[i]);
        const u = rec?.message?.usage;
        if (u && typeof u.input_tokens === 'number') {
          return (u.input_tokens || 0) + (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0);
        }
      } catch { /* partial tail line */ }
    }
    return null;
  } finally { fs.closeSync(fd); }
}

function readStdin() {
  try { return JSON.parse(fs.readFileSync(0, 'utf8')); } catch { return {}; }
}

function readConfig() {
  const path = require('path'), os = require('os');
  try {
    return JSON.parse(fs.readFileSync(path.join(os.homedir(), '.claude', 'workos-handoff.json'), 'utf8'));
  } catch { return {}; }
}

module.exports = { lastUsage, readStdin, readConfig };
