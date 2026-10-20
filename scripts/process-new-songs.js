import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

const newSongsConfig = [
  {
    id: "hiphoptamizha_red_card",
    artistId: "hiphoptamizha",
    artist: "Hiphop Tamizha",
    title: "Red Cardu",
    album: "Single",
    img: "/hiphop tamizha/red card.webp",
    file: "/hiphop tamizha/Red-Cardu-MassTamilan.org.mp3",
    genre: "HipHop",
    accent: "#D97706",
    isNew: true
  },
  {
    id: "hiphoptamizha_saitji",
    artistId: "hiphoptamizha",
    artist: "Hiphop Tamizha",
    title: "Saitji Saitji",
    album: "Single",
    img: "/hiphop tamizha/satji.jpeg",
    file: "/hiphop tamizha/Saitji-Saitji-MassTamilan.com.mp3",
    genre: "HipHop",
    accent: "#D97706",
    isNew: true
  },
  {
    id: "illayaraja_kalyana_virundhu",
    artistId: "illayaraja",
    artist: "Ilaiyaraaja",
    title: "Kalyana Virundhu",
    album: "Single",
    img: "/illayaraja/kalyana virundhu.webp",
    file: "/illayaraja/Kalyana Virundhu.mp3",
    genre: "Classical",
    accent: "#F59E0B",
    isNew: true
  },
  {
    id: "arrahman_muzumathi",
    artistId: "arrahman",
    artist: "A.R. Rahman",
    title: "Muzumathi",
    album: "Single",
    img: "/ar rahmon song/muzumathi.jpeg",
    file: "/ar rahmon song/Muzumathi-MassTamilan.dev.mp3",
    genre: "Melody",
    accent: "#38BDF8",
    isNew: true
  },
  {
    id: "saiabhyankar_veezha_veera",
    artistId: "saiabhyankar",
    artist: "Sai Abhyankar",
    title: "Veezha Veera",
    album: "Single",
    img: "/sai abhyankar/veera veera song.webp",
    file: "/sai abhyankar/Veezha Veera.mp3",
    genre: "Indie Pop",
    accent: "#F43F5E",
    isNew: true
  }
];

console.log('--- Step 1: Compressing audio files to 64k stereo ---');
for (const s of newSongsConfig) {
  const fullPath = path.resolve(root, s.file.replace(/^\//, ''));
  if (!fs.existsSync(fullPath)) {
    console.error(`File not found: ${fullPath}`);
    process.exit(1);
  }
  const origSize = fs.statSync(fullPath).size;
  console.log(`Compressing ${s.title}: ${(origSize / (1024 * 1024)).toFixed(2)} MB...`);
  const tmpPath = fullPath + '.tmp.mp3';
  execSync(`ffmpeg -y -i "${fullPath}" -vn -b:a 64k -ar 44100 "${tmpPath}"`, { stdio: 'ignore' });
  if (fs.existsSync(tmpPath)) {
    fs.unlinkSync(fullPath);
    fs.renameSync(tmpPath, fullPath);
    const newSize = fs.statSync(fullPath).size;
    console.log(`  -> Optimized to ${(newSize / (1024 * 1024)).toFixed(2)} MB!`);
  }

  // Probe duration
  const durStr = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${fullPath}"`).toString().trim();
  const sec = Math.round(parseFloat(durStr)) || 210;
  const min = Math.floor(sec / 60);
  const rem = String(sec % 60).padStart(2, '0');
  s.duration = `${min}:${rem}`;
  s.durationSec = sec;
  s.plays = Math.floor(Math.random() * 4000000) + 1000000;
  console.log(`  -> Duration: ${s.duration} (${s.durationSec}s)`);
}

console.log('\n--- Step 2: Updating src/data/musicData.js ---');
const musicDataPath = path.resolve(root, 'src', 'data', 'musicData.js');
let content = fs.readFileSync(musicDataPath, 'utf-8');

// Check if already in file
for (const s of newSongsConfig) {
  if (content.includes(`"${s.file}"`)) {
    console.log(`Song ${s.title} is already in musicData.js`);
  } else {
    const songEntry = `  {\n    "id": "${s.id}",\n    "artistId": "${s.artistId}",\n    "artist": "${s.artist}",\n    "title": "${s.title}",\n    "album": "${s.album}",\n    "duration": "${s.duration}",\n    "durationSec": ${s.durationSec},\n    "img": "${s.img}",\n    "file": "${s.file}",\n    "genre": "${s.genre}",\n    "plays": ${s.plays},\n    "accent": "${s.accent}",\n    "isNew": true\n  },\n`;
    content = content.replace('const RAW_SONGS = [', `const RAW_SONGS = [\n${songEntry}`);
    console.log(`Added ${s.title} to RAW_SONGS!`);
  }
}

// Add new IDs to pl_new_releases trackIds if not present
const newIds = newSongsConfig.map(s => `"${s.id}"`);
const plRegex = /id:\s*"pl_new_releases",\s*name:[^,]+,\s*description:[^,]+,\s*cover:[^,]+,\s*trackIds:\s*\[([^\]]+)\]/;
content = content.replace(plRegex, (match, existingIds) => {
  const currentIds = existingIds.split(',').map(s => s.trim());
  for (const id of newIds) {
    if (!currentIds.includes(id)) {
      currentIds.unshift(id);
    }
  }
  return match.replace(existingIds, currentIds.join(', '));
});

fs.writeFileSync(musicDataPath, content, 'utf-8');
console.log('✅ Successfully updated src/data/musicData.js!');
