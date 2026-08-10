import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const allowed = new Set([".html", ".css", ".js", ".json", ".webmanifest", ".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif"]);

async function runtimeFiles(directory) {
  const output = [];
  async function visit(relative) {
    const entries = await fs.readdir(path.join(root, relative), { withFileTypes: true });
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      const child = path.posix.join(relative, entry.name);
      if (entry.isDirectory()) await visit(child);
      else if (allowed.has(path.extname(entry.name).toLowerCase()) && entry.name !== "sw.js") output.push(child);
    }
  }
  await visit(directory);
  return output;
}

const definitions = [
  { id: "pescara", title: "Pescara", subtitle: "7–9.08.2026 · Abruzzo Weekend", flag: "🇮🇹", theme: "pescara", startUrl: "pescara/" },
  { id: "namibia", title: "Namibia", subtitle: "2026 · road trip · safari · plan · packing", flag: "🇳🇦", theme: "namibia", startUrl: "namibia/" },
  { id: "nyc", title: "Nowy Jork", subtitle: "2026 · rodzinny plan dzień po dniu", flag: "🇺🇸", theme: "nyc", startUrl: "nyc/" }
];

const packages = [];
for (const definition of definitions) {
  const files = await runtimeFiles(definition.id);
  const hash = createHash("sha256");
  let size = 0;
  for (const file of files) {
    const stats = await fs.stat(path.join(root, file));
    hash.update(file).update(String(stats.size)).update(String(Math.trunc(stats.mtimeMs)));
    size += stats.size;
  }
  packages.push({ ...definition, version: hash.digest("hex").slice(0, 12), size, assets: files });
}

const shell = [
  "./", "index.html", "styles.css", "app.js", "sw.js", "manifest.webmanifest", "offline-catalog.json",
  "shared/common.css",
  ...(await runtimeFiles("tools"))
];

await fs.writeFile(path.join(root, "offline-catalog.json"), `${JSON.stringify({ generatedAt: new Date().toISOString(), shell, packages }, null, 2)}\n`);
console.log(packages.map(pkg => `${pkg.id}: ${pkg.assets.length} files, ${pkg.size} bytes, ${pkg.version}`).join("\n"));
