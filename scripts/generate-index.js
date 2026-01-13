import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'public', 'data');
const OUT_FILE = path.join(DATA_DIR, 'index.json');

console.log('Generating index in:', DATA_DIR);

function getFiles(subdir) {
  const dir = path.join(DATA_DIR, subdir);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .sort()
    .reverse();
}

const dailyFiles = getFiles('daily');
const weeklyFiles = getFiles('weekly');

const index = {
  daily: dailyFiles.map(f => f.replace('.json', '')),
  weekly: weeklyFiles.map(f => f.replace('.json', '')),
  latest: {
    daily: dailyFiles.length > 0 ? dailyFiles[0].replace('.json', '') : null,
    weekly: weeklyFiles.length > 0 ? weeklyFiles[0].replace('.json', '') : null
  },
  lastUpdated: new Date().toISOString()
};

fs.writeFileSync(OUT_FILE, JSON.stringify(index, null, 2));
console.log('Generated index.json with', dailyFiles.length, 'daily and', weeklyFiles.length, 'weekly reports.');
console.log('Latest Daily:', index.latest.daily);
