import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dataDir = path.join(root, "data");
const registryPath = path.join(dataDir, "official-update-sources.json");
const outputPath = path.join(dataDir, "official-updates.json");

function decodeHtml(value = "") {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"');
}

async function readJson(file) {
  return JSON.parse(await fs.readFile(file, "utf8"));
}

async function writeJson(file, data) {
  await fs.writeFile(file, `${JSON.stringify(data, null, 2)}\n`);
}

async function fetchHtml(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "KoncertTogetherBot/1.0 (official update sync)"
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  return response.text();
}

function extractJypeLatestNotice(html) {
  const noticeMatch = html.match(/latestNotice\\":\{[\s\S]*?\\"title\\":\\"([^"\\]+)\\"[\s\S]*?\\"content\\":\\"([\s\S]*?)\\",\\"createdAt\\":\\"([^"\\]+)\\"/i);
  if (!noticeMatch) {
    return null;
  }

  const [, title, rawContent, createdAt] = noticeMatch;
  const decodedContent = decodeHtml(rawContent);
  const imageMatch =
    rawContent.match(/src=\\\\\"([^"\\]+)\\\\\"/i) ||
    rawContent.match(/src=\\\\"([^"\\]+)\\\\"/i) ||
    rawContent.match(/src=\\\"([^"\\]+)\\\"/i) ||
    decodedContent.match(/src="([^"]+)"/i);

  const normalizedTitle = decodeHtml(title).replace(/\s+/g, " ").trim();
  const relevant = /(tour|fanmeeting|concert|showcase|live|world tour|teaser)/i.test(normalizedTitle);

  return {
    title: normalizedTitle,
    publishedAt: createdAt,
    imageUrl: imageMatch?.[1] ? decodeHtml(imageMatch[1]) : null,
    relevant
  };
}

async function resolveSource(source) {
  const html = await fetchHtml(source.url);

  if (source.sourceType === "jype_latest_notice") {
    const latest = extractJypeLatestNotice(html);
    if (!latest) {
      return {
        artistSlug: source.artistSlug,
        provider: source.provider,
        sourceUrl: source.url,
        checkedAt: new Date().toISOString(),
        title: null,
        publishedAt: null,
        imageUrl: null,
        relevant: false
      };
    }

    return {
      artistSlug: source.artistSlug,
      provider: source.provider,
      sourceUrl: source.url,
      checkedAt: new Date().toISOString(),
      ...latest
    };
  }

  throw new Error(`Unsupported source type: ${source.sourceType}`);
}

async function main() {
  const registry = await readJson(registryPath);
  const results = [];

  for (const source of registry) {
    try {
      results.push(await resolveSource(source));
    } catch (error) {
      results.push({
        artistSlug: source.artistSlug,
        provider: source.provider,
        sourceUrl: source.url,
        checkedAt: new Date().toISOString(),
        title: null,
        publishedAt: null,
        imageUrl: null,
        relevant: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  await writeJson(outputPath, results);

  console.log(JSON.stringify({
    task: "sync-official-updates",
    trackedArtists: results.length,
    relevantUpdates: results.filter((item) => item.relevant).length
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
