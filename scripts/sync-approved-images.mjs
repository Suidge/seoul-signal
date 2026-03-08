import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const root = process.cwd();
const dataDir = path.join(root, "data");
const publicDir = path.join(root, "public");
const registryPath = path.join(dataDir, "image-sources.json");
const artistsPath = path.join(dataDir, "artists.json");
const eventsPath = path.join(dataDir, "events.json");
const execFileAsync = promisify(execFile);

function stripTags(value = "") {
  return value.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

async function readJson(file) {
  return JSON.parse(await fs.readFile(file, "utf8"));
}

async function writeJson(file, data) {
  await fs.writeFile(file, `${JSON.stringify(data, null, 2)}\n`);
}

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

async function fetchCommonsThumb(fileTitle) {
  const params = new URLSearchParams({
    action: "query",
    titles: fileTitle,
    prop: "imageinfo",
    iiprop: "url|extmetadata",
    iiurlwidth: "1600",
    format: "json"
  });

  const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params.toString()}`, {
    headers: {
      "User-Agent": "KoncertTogetherBot/1.0 (local asset sync)"
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Commons metadata for ${fileTitle}: ${response.status}`);
  }

  const payload = await response.json();
  const page = Object.values(payload.query.pages)[0];
  const imageInfo = page?.imageinfo?.[0];

  if (!imageInfo?.thumburl) {
    throw new Error(`No thumburl returned for ${fileTitle}`);
  }

  const metadata = imageInfo.extmetadata ?? {};
  return {
    url: imageInfo.thumburl,
    creator: stripTags(metadata.Artist?.value),
    license: stripTags(metadata.LicenseShortName?.value),
    sourceLabel: stripTags(metadata.ObjectName?.value)
  };
}

async function downloadFile(url, targetPath) {
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await execFileAsync("curl", [
    "-L",
    "--fail",
    "--retry",
    "5",
    "--retry-delay",
    "5",
    "--retry-all-errors",
    "-A",
    "KoncertTogetherBot/1.0 (local asset sync)",
    "-o",
    targetPath,
    url
  ]);
}

function buildAttribution(source, resolved) {
  return {
    provider: source.provider,
    creator: source.creator || resolved.creator || source.provider,
    license: source.license || resolved.license || "See source",
    sourceUrl: source.sourceUrl,
    sourceLabel: source.sourceLabel || resolved.sourceLabel || source.fileTitle.replace(/^File:/, "")
  };
}

function defaultEventVisual(slug) {
  return `/media/events/${slug}.svg`;
}

async function main() {
  const [registry, artists, events] = await Promise.all([
    readJson(registryPath),
    readJson(artistsPath),
    readJson(eventsPath)
  ]);

  const artistBySlug = new Map(artists.map((artist) => [artist.slug, artist]));

  for (const source of registry) {
    const resolved = await fetchCommonsThumb(source.fileTitle);
    const outputPath = path.join(publicDir, source.targetPath.replace(/^\//, ""));
    if (!(await exists(outputPath))) {
      await downloadFile(resolved.url, outputPath);
      await new Promise((resolve) => setTimeout(resolve, 2500));
    }

    const artist = artistBySlug.get(source.artistSlug);
    if (!artist) {
      throw new Error(`Unknown artist slug in image registry: ${source.artistSlug}`);
    }

    artist.coverImage = source.targetPath;
    artist.heroImage = source.targetPath;
    artist.imageAttribution = buildAttribution(source, resolved);

    for (const event of events) {
      if (event.artistSlug === source.artistSlug || event.artist === artist.name) {
        if (source.useForEvents) {
          event.heroImage = source.targetPath;
          event.heroImageAttribution = buildAttribution(source, resolved);
        } else {
          event.heroImage = defaultEventVisual(event.slug);
          delete event.heroImageAttribution;
        }
      }
    }
  }

  await Promise.all([
    writeJson(artistsPath, artists),
    writeJson(eventsPath, events)
  ]);

  console.log(
    JSON.stringify(
      {
        task: "sync-approved-images",
        sourcedArtists: registry.length,
        updatedEvents: events.filter((event) => event.heroImageAttribution).length
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
