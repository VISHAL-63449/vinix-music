import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const lfsBase = path.resolve(root, '.git', 'lfs', 'objects');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    if (file === 'node_modules' || file === '.git' || file === 'dist' || file === 'docs') continue;
    const fullPath = path.resolve(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (file.endsWith('.mp3') || file.endsWith('.wav')) {
      results.push(fullPath);
    }
  }
  return results;
}

const audioFiles = walk(root);
let restoredCount = 0;

for (const filePath of audioFiles) {
  const stat = fs.statSync(filePath);
  if (stat.size < 500) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const match = content.match(/oid sha256:([0-9a-f]{64})/);
    if (match) {
      const sha = match[1];
      const dir1 = sha.substring(0, 2);
      const dir2 = sha.substring(2, 4);
      const lfsFile = path.resolve(lfsBase, dir1, dir2, sha);
      if (fs.existsSync(lfsFile)) {
        fs.copyFileSync(lfsFile, filePath);
        const newStat = fs.statSync(filePath);
        console.log(`Restored: ${path.basename(filePath)} (${(newStat.size / (1024 * 1024)).toFixed(2)} MB)`);
        restoredCount++;
      } else {
        console.warn(`LFS object missing for: ${path.basename(filePath)}`);
      }
    }
  }
}

console.log(`\n🎉 Successfully restored ${restoredCount} out of ${audioFiles.length} real audio files!`);
