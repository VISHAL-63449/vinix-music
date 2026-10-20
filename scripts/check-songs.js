import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { SONGS } from '../src/data/musicData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

const rawTracked = execSync('git ls-files "*.mp3"', { encoding: 'utf-8', cwd: root });
const trackedLines = rawTracked.split('\n').map(s => s.trim().replace(/^"|"$/g, '')).filter(Boolean);
const trackedSet = new Set(trackedLines);

const missingFromGit = [];

for (const song of SONGS) {
  const relPath = song.file.replace(/^\.\//, '');
  if (!trackedSet.has(relPath)) {
    missingFromGit.push({
      id: song.id,
      title: song.title,
      artist: song.artist,
      file: relPath
    });
  }
}

console.log(`Total songs in app: ${SONGS.length}`);
console.log(`Songs tracked in Git: ${trackedSet.size}`);
console.log(`Songs remaining to upload: ${missingFromGit.length}`);

// Group by artist folder
const byFolder = {};
for (const item of missingFromGit) {
  const folder = item.file.split('/')[0];
  if (!byFolder[folder]) byFolder[folder] = [];
  byFolder[folder].push(item.file);
}

console.log('\nRemaining by folder:');
for (const [folder, files] of Object.entries(byFolder)) {
  let size = 0;
  for (const f of files) {
    const full = path.resolve(root, f);
    if (fs.existsSync(full)) {
      size += fs.statSync(full).size;
    }
  }
  console.log(`  ${folder}: ${files.length} files (${(size / (1024 * 1024)).toFixed(2)} MB)`);
}
