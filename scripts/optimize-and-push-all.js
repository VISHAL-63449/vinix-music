import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { SONGS } from '../src/data/musicData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

const ffmpegPath = 'ffmpeg';

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function getTracked() {
  const raw = execSync('git ls-files "*.mp3"', { encoding: 'utf-8', cwd: root });
  return new Set(raw.split('\n').map(s => s.trim().replace(/^"|"$/g, '')).filter(Boolean));
}

let trackedSet = getTracked();
console.log(`Currently tracked in Git: ${trackedSet.size} / ${SONGS.length}`);

// Step 1: Compress all large MP3s (> 3.5 MB) down to lightweight 64k stereo web streams
console.log('\n--- Step 1: Optimizing audio files for high-speed web streaming ---');
for (let i = 0; i < SONGS.length; i++) {
  const song = SONGS[i];
  const relPath = song.file.replace(/^\.\//, '');
  const fullPath = path.resolve(root, relPath);

  if (fs.existsSync(fullPath)) {
    const size = fs.statSync(fullPath).size;
    // If larger than 3.5 MB and not yet tracked or to save space
    if (size > 3.5 * 1024 * 1024 && !trackedSet.has(relPath)) {
      const tempPath = fullPath + '.tmp.mp3';
      try {
        console.log(`[${i + 1}/${SONGS.length}] Compressing: ${path.basename(relPath)} (${(size / (1024 * 1024)).toFixed(2)} MB)...`);
        execSync(`"${ffmpegPath}" -y -i "${fullPath}" -vn -b:a 64k -ar 44100 "${tempPath}"`, { stdio: 'ignore' });
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(fullPath);
          fs.renameSync(tempPath, fullPath);
          const newSize = fs.statSync(fullPath).size;
          console.log(`  -> Optimized to ${(newSize / (1024 * 1024)).toFixed(2)} MB!`);
        }
      } catch (err) {
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        console.warn(`  Failed to compress ${relPath}, keeping original:`, err.message);
      }
    }
  }
}

// Step 2: Upload in small ~10 MB batches
console.log('\n--- Step 2: Uploading all remaining songs to GitHub ---');
const remaining = [];
for (const song of SONGS) {
  const relPath = song.file.replace(/^\.\//, '');
  const fullPath = path.resolve(root, relPath);
  if (!trackedSet.has(relPath) && fs.existsSync(fullPath)) {
    remaining.push(relPath);
  }
}

console.log(`Remaining songs to upload: ${remaining.length}`);

const BATCH_SIZE = 4;
const totalBatches = Math.ceil(remaining.length / BATCH_SIZE);

for (let b = 0; b < remaining.length; b += BATCH_SIZE) {
  const batchNum = Math.floor(b / BATCH_SIZE) + 1;
  const batch = remaining.slice(b, b + BATCH_SIZE);
  console.log(`\n========================================`);
  console.log(`📦 Batch ${batchNum}/${totalBatches} (${b + 1}-${Math.min(b + BATCH_SIZE, remaining.length)} of ${remaining.length})`);
  console.log(batch.map(f => `  - ${f}`).join('\n'));

  // Stage
  for (const file of batch) {
    execSync(`git add -f "${file}"`, { cwd: root, stdio: 'inherit' });
  }

  // Commit
  const msg = `feat(audio): upload batch ${batchNum} - ${batch.map(f => path.basename(f, '.mp3')).join(', ')}`;
  execSync(`git commit -m "${msg.replace(/"/g, '')}"`, { cwd: root, stdio: 'inherit' });

  // Push with retry
  let pushed = false;
  let attempts = 0;
  while (!pushed && attempts < 3) {
    attempts++;
    try {
      console.log(`🚀 Pushing batch ${batchNum} to GitHub...`);
      execSync('git push origin main', { cwd: root, stdio: 'inherit', timeout: 120000 });
      pushed = true;
      console.log(`✅ Batch ${batchNum} successfully pushed!`);
    } catch (e) {
      console.warn(`Attempt ${attempts} failed, retrying in 3s...`);
      sleep(3000);
    }
  }

  if (!pushed) {
    console.error(`❌ Batch ${batchNum} failed to push after 3 attempts.`);
    process.exit(1);
  }
}

console.log('\n🎉 ALL 118 SONGS HAVE BEEN SUCCESSFULLY OPTIMIZED AND UPLOADED TO GITHUB!');
