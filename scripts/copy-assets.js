import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

const imageFolders = [
  'album song',
  'anirudh song',
  'ar rahmon song',
  'd immon',
  'gv prakash',
  'harris jayaraj',
  'hiphop tamizha',
  'illayaraja',
  'sai abhyankar',
  'santhosh narayanan',
  'thamon s',
  'vijay antony',
  'yuvan song',
  'vinix title mus'
];

const imageFiles = [
  'vinix-logo.png',
  'vinix-title-transparent.png',
  'vinix-title.png',
  'favicon.png',
  'mus logo.webp',
  'kaakum vadivel.jpeg'
];

const targets = [
  path.resolve(root, 'dist'),
  path.resolve(root, 'docs')
];

for (const target of targets) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  // Copy dist build files into docs/ and assets/
  if (target.endsWith('docs') && fs.existsSync(path.resolve(root, 'dist'))) {
    fs.cpSync(path.resolve(root, 'dist'), target, {
      recursive: true,
      filter: (src) => !src.endsWith('.mp3') && !src.endsWith('.wav')
    });
  }

  // Copy image files
  for (const file of imageFiles) {
    const src = path.resolve(root, file);
    const dest = path.resolve(target, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
    }
  }

  // Copy folders excluding audio
  for (const folder of imageFolders) {
    const src = path.resolve(root, folder);
    const dest = path.resolve(target, folder);
    if (fs.existsSync(src)) {
      fs.cpSync(src, dest, {
        recursive: true,
        filter: (file) => {
          const lower = file.toLowerCase();
          return !lower.endsWith('.mp3') && !lower.endsWith('.wav') && !lower.endsWith('.m4a');
        }
      });
    }
  }
}

// Copy dist/assets to root assets/
const distAssets = path.resolve(root, 'dist', 'assets');
const rootAssets = path.resolve(root, 'assets');
if (fs.existsSync(distAssets)) {
  fs.cpSync(distAssets, rootAssets, { recursive: true });
}

console.log('✅ Production assets copied to dist, docs, and assets successfully!');
