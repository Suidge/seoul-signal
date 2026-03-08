import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dataDir = path.join(root, "data");

async function readJson(file) {
  const raw = await fs.readFile(path.join(dataDir, file), "utf8");
  return JSON.parse(raw);
}

function ensureUnique(items, field, label) {
  const seen = new Set();
  for (const item of items) {
    const value = item[field];
    if (!value) {
      throw new Error(`${label} is missing ${field}`);
    }
    if (seen.has(value)) {
      throw new Error(`Duplicate ${label} ${field}: ${value}`);
    }
    seen.add(value);
  }
}

function ensureHttpUrls(events) {
  for (const event of events) {
    for (const link of [event.sourceUrl, ...(event.ticketLinks ?? []).map((item) => item.href)]) {
      if (link && !/^https?:\/\//.test(link)) {
        throw new Error(`Invalid URL in event ${event.slug}: ${link}`);
      }
    }
  }
}

function ensureSourceCoverage(events, registry) {
  const urls = new Set(registry.map((item) => item.url));

  for (const event of events) {
    if (event.sourceUrl && !urls.has(event.sourceUrl)) {
      throw new Error(`Event source is not registered: ${event.slug} -> ${event.sourceUrl}`);
    }
  }
}

async function main() {
  const [artists, events, guides, community, meta, registry, status] = await Promise.all([
    readJson("artists.json"),
    readJson("events.json"),
    readJson("guides.json"),
    readJson("community.json"),
    readJson("site-meta.json"),
    readJson("source-registry.json"),
    readJson("source-status.json")
  ]);

  ensureUnique(artists, "slug", "artist");
  ensureUnique(events, "slug", "event");
  ensureUnique(guides, "slug", "guide");
  ensureUnique(community, "slug", "community post");
  ensureUnique(registry, "id", "source");
  ensureHttpUrls(events);
  ensureSourceCoverage(events, registry);

  events.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  guides.sort((a, b) => a.title.localeCompare(b.title, "zh-CN"));
  artists.sort((a, b) => a.name.localeCompare(b.name, "en"));

  const nextMeta = {
    ...meta,
    generatedAt: new Date().toISOString(),
    counts: {
      artists: artists.length,
      events: events.length,
      guides: guides.length,
      communityPosts: community.length,
      monitoredSources: registry.length
    },
    sourceHealth: {
      ok: status.filter((item) => item.ok).length,
      failed: status.filter((item) => !item.ok).length,
      lastCheckedAt: status.reduce((latest, item) => {
        if (!item.checkedAt) return latest;
        return !latest || item.checkedAt > latest ? item.checkedAt : latest;
      }, null)
    }
  };

  await Promise.all([
    fs.writeFile(path.join(dataDir, "artists.json"), `${JSON.stringify(artists, null, 2)}\n`),
    fs.writeFile(path.join(dataDir, "events.json"), `${JSON.stringify(events, null, 2)}\n`),
    fs.writeFile(path.join(dataDir, "guides.json"), `${JSON.stringify(guides, null, 2)}\n`),
    fs.writeFile(path.join(dataDir, "site-meta.json"), `${JSON.stringify(nextMeta, null, 2)}\n`)
  ]);

  console.log(
    JSON.stringify(
      {
        task: "prepare-pages-data",
        generatedAt: nextMeta.generatedAt,
        counts: nextMeta.counts,
        sourceHealth: nextMeta.sourceHealth
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
