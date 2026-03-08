import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dataDir = path.join(root, "data");
const registryPath = path.join(dataDir, "source-registry.json");
const outputPath = path.join(dataDir, "source-status.json");

const CONCURRENCY = Number(process.env.SOURCE_SYNC_CONCURRENCY ?? 4);
const REQUEST_TIMEOUT_MS = Number(process.env.SOURCE_SYNC_TIMEOUT_MS ?? 12000);

function nowIso() {
  return new Date().toISOString();
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": "SeoulSignalTrialBot/0.1 (+https://github.com/Suidge/seoul-signal)",
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
      },
      ...options
    });
  } finally {
    clearTimeout(timeout);
  }
}

function classifyResponse(status) {
  if (status >= 200 && status < 400) {
    return { ok: true, access: "open" };
  }

  if (status === 401 || status === 403) {
    return { ok: true, access: "restricted" };
  }

  return { ok: false, access: "broken" };
}

async function inspectSource(source) {
  const checkedAt = nowIso();

  try {
    let response;
    let method = "HEAD";

    try {
      response = await fetchWithTimeout(source.url, { method: "HEAD" });
      if (response.status === 405) {
        throw new Error(`HEAD ${response.status}`);
      }
    } catch {
      method = "GET";
      response = await fetchWithTimeout(source.url, { method: "GET" });
      await response.arrayBuffer();
    }

    const classification = classifyResponse(response.status);

    return {
      ...source,
      checkedAt,
      method,
      ok: classification.ok,
      access: classification.access,
      status: response.status,
      finalUrl: response.url,
      etag: response.headers.get("etag"),
      lastModified: response.headers.get("last-modified"),
      contentType: response.headers.get("content-type")
    };
  } catch (error) {
    return {
      ...source,
      checkedAt,
      method: null,
      ok: false,
      access: "broken",
      status: null,
      finalUrl: null,
      etag: null,
      lastModified: null,
      contentType: null,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function runPool(items, worker, concurrency) {
  const results = new Array(items.length);
  let index = 0;

  async function next() {
    const current = index;
    index += 1;
    if (current >= items.length) {
      return;
    }

    results[current] = await worker(items[current]);
    await next();
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => next()));
  return results;
}

async function main() {
  const registry = await readJson(registryPath);
  const results = await runPool(registry, inspectSource, CONCURRENCY);
  results.sort((a, b) => a.label.localeCompare(b.label, "en"));

  await fs.writeFile(outputPath, `${JSON.stringify(results, null, 2)}\n`);

  const summary = {
    task: "sync-source-health",
    checkedAt: nowIso(),
    total: results.length,
    ok: results.filter((item) => item.ok).length,
    restricted: results.filter((item) => item.access === "restricted").length,
    failed: results.filter((item) => !item.ok).length
  };

  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
