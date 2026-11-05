import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const source = join(
  root,
  "node_modules",
  "maplibre-gl",
  "dist",
  "maplibre-gl-worker.mjs",
);
const destination = join(root, "public", "maplibre-gl-worker.mjs");

mkdirSync(dirname(destination), { recursive: true });
copyFileSync(source, destination);
