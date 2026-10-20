import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { SONGS } from '../src/data/musicData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

function getTracked() {
  const rawTracked = execSync('git ls-files "*.mp3"', { encoding: 'utf-8', cwd: root });
  return new Set(rawTracked.split('\n').map(s => s.trim().replace(/^"|"$/g, '')).filter(Boolean));
}

let trackedSet = getTracked();

const remaining = [];
for (const song of SONGS) {
  const relPath = song.file.replace(/^\.\//, '');
  if (!trackedSet.has(relPath) && fs.existsSync(path.resolve(root, relPath))) {
    remaining.push(relPath);
  }
}

console.log(`Starting automated batch upload of ${remaining.length} remaining songs...`);

// Batch size: 2 songs (~12-16 MB per batch)
const BATCH_SIZE = 2;
let batchIndex = 0;

for (let i = 0; i < remaining.length; i += BATCH_SIZE) {
  batchIndex++;
  const batch = remaining.slice(i, i + BATCH_SIZE);
  console.log(`\n========================================`);
  console.log(`📦 Batch ${batchIndex} (${i + 1}-${Math.min(i + BATCH_SIZE, remaining.length)} of ${remaining.length})`);
  console.log(batch.map(f => `  - ${f}`).join('\n'));

  // Stage files
  for (const file of batch) {
    execSync(`git add -f "${file}"`, { cwd: root, stdio: 'inherit' });
  }

  // Commit
  const commitMsg = `feat(audio): upload songs batch ${batchIndex} - ${batch.map(f => path.basename(f, '.mp3')).join(', ')}`;
  execSync(`git commit -m "${commitMsg.replace(/"/g, '')}"`, { cwd: root, stdio: 'inherit' });

  // Push with retry loop
  let pushed = false;
  let attempts = 0;
  while (!pushed && attempts < 3) {
    attempts++;
    try {
      console.log(`🚀 Pushing batch ${batchIndex} to GitHub (Attempt ${attempts})...`);
      execSync('git push origin main', { cwd: root, stdio: 'inherit', timeout: 120000 });
      pushed = true;
      console.log(`✅ Batch ${batchIndex} pushed successfully!`);
    } catch (err) {
      console.warn(`⚠️ Push attempt ${attempts} failed, retrying in 3 seconds...`, err.message);
      execSync('timeout /t 3 /nobreak > nul', { shell: 'cmd.exe' });
    }
  }

  if (!pushed) {
    console.error(`❌ Could not push batch ${batchIndex} after 3 attempts. Aborting.`);
    process.exit(1);
  }
}

console.log('\n🎉 ALL 118 SONGS HAVE BEEN SUCCESSFULLY COMMITTED AND PUSHED TO GITHUB!');
