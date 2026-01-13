import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const dataDir = path.resolve(rootDir, "public/data");
const dailyDir = path.join(dataDir, "daily");
const weeklyDir = path.join(dataDir, "weekly");
const outputFile = path.resolve(rootDir, "src/data-index.json");

console.log("Generating data index to:", outputFile);

const getFiles = (dir) => {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(".json", ""))
    .sort()
    .reverse();
};

const dailyFiles = getFiles(dailyDir);
const weeklyFiles = getFiles(weeklyDir);

const index = {
  daily: dailyFiles,
  weekly: weeklyFiles,
  latest: {
    daily: dailyFiles[0] || null,
    weekly: weeklyFiles[0] || null,
  },
};

fs.writeFileSync(outputFile, JSON.stringify(index, null, 2));
console.log("Data index generated successfully.");
