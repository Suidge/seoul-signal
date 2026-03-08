import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dataDir = path.join(root, "data");
const guidesPath = path.join(dataDir, "guides.json");
const venueGuidesPath = path.join(dataDir, "venue-guides.json");

async function readJson(file) {
  return JSON.parse(await fs.readFile(file, "utf8"));
}

async function writeJson(file, data) {
  await fs.writeFile(file, `${JSON.stringify(data, null, 2)}\n`);
}

async function main() {
  const [guides, venueGuides] = await Promise.all([readJson(guidesPath), readJson(venueGuidesPath)]);
  const merged = new Map(guides.map((guide) => [guide.slug, guide]));

  for (const guide of venueGuides) {
    merged.set(guide.slug, {
      ...guide,
      category: "travel"
    });
  }

  const next = [...merged.values()].sort((a, b) => a.title.localeCompare(b.title, "zh-CN"));
  await writeJson(guidesPath, next);

  console.log(JSON.stringify({
    task: "sync-venue-guides",
    totalGuides: next.length,
    venueGuides: venueGuides.length
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
