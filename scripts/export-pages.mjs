import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const appDir = path.join(root, ".next/server/app");
const staticDir = path.join(root, ".next/static");
const publicDir = path.join(root, "public");
const outDir = path.join(root, "out");

async function exists(target) {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return walk(fullPath);
      }
      return [fullPath];
    })
  );
  return files.flat();
}

function routeDirFromHtml(relativeHtmlPath) {
  const withoutExt = relativeHtmlPath.replace(/\.html$/, "");
  if (withoutExt === "index") return "";
  return withoutExt;
}

function segmentOutputName(relativeSegmentPath) {
  const parts = relativeSegmentPath
    .replace(/\.segment\.rsc$/, "")
    .split(path.sep)
    .map((part) => (part.startsWith("$d$") ? "__PAGE__" : part));
  return `__next.${parts.join(".")}.txt`;
}

async function writeRouteArtifacts(relativeHtmlPath) {
  const routeDir = routeDirFromHtml(relativeHtmlPath);
  const sourceBase = path.join(appDir, relativeHtmlPath.replace(/\.html$/, ""));
  const targetDir = path.join(outDir, routeDir);

  await fs.mkdir(targetDir, { recursive: true });
  await fs.copyFile(path.join(appDir, relativeHtmlPath), path.join(targetDir, "index.html"));

  const rscFile = `${sourceBase}.rsc`;
  if (await exists(rscFile)) {
    await fs.copyFile(rscFile, path.join(targetDir, "index.txt"));
  }

  const segmentsDir = `${sourceBase}.segments`;
  if (await exists(segmentsDir)) {
    for (const file of await walk(segmentsDir)) {
      if (!file.endsWith(".segment.rsc")) continue;
      const relativeSegmentPath = path.relative(segmentsDir, file);
      await fs.copyFile(file, path.join(targetDir, segmentOutputName(relativeSegmentPath)));
    }
  }
}

async function main() {
  await fs.rm(outDir, { recursive: true, force: true });
  await fs.mkdir(outDir, { recursive: true });

  await fs.cp(staticDir, path.join(outDir, "_next/static"), { recursive: true });
  if (await exists(publicDir)) {
    await fs.cp(publicDir, outDir, { recursive: true });
  }

  const htmlFiles = (await walk(appDir))
    .filter((file) => file.endsWith(".html"))
    .map((file) => path.relative(appDir, file))
    .filter((file) => file !== "_global-error.html");

  for (const relativeHtmlPath of htmlFiles) {
    if (relativeHtmlPath === "_not-found.html") {
      await writeRouteArtifacts(relativeHtmlPath);
      await fs.mkdir(path.join(outDir, "404"), { recursive: true });
      await fs.copyFile(path.join(appDir, relativeHtmlPath), path.join(outDir, "404.html"));
      await fs.copyFile(path.join(appDir, relativeHtmlPath), path.join(outDir, "404/index.html"));
      continue;
    }

    await writeRouteArtifacts(relativeHtmlPath);
  }

  const specials = [
    ["robots.txt.body", "robots.txt"],
    ["sitemap.xml.body", "sitemap.xml"],
    ["manifest.webmanifest.body", "manifest.webmanifest"]
  ];

  for (const [input, output] of specials) {
    const source = path.join(appDir, input);
    if (await exists(source)) {
      await fs.copyFile(source, path.join(outDir, output));
    }
  }

  console.log(
    JSON.stringify(
      {
        task: "export-pages",
        outDir,
        routes: htmlFiles.length
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
