import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";

// Plugin to generate index.json file at build start
const generateIndexFilePlugin = () => {
  return {
    name: "generate-index-file",
    buildStart() {
      const dataDir = path.resolve(__dirname, "public/data");
      const dailyDir = path.join(dataDir, "daily");
      const weeklyDir = path.join(dataDir, "weekly");
      const outputFile = path.resolve(__dirname, "src/data-index.json");

      console.log("Generating data index to:", outputFile);

      const getFiles = (dir: string) => {
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
    },
    // Watch for changes in public/data directory
    handleHotUpdate({ file }: any) {
      if (file.includes("public/data")) {
        // Re-run buildStart logic or separate function
        // For simplicity, just touching the index file to trigger HMR
        this.buildStart();
      }
    },
  };
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), generateIndexFilePlugin()],
});
