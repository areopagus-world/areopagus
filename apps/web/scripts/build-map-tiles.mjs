/* global console, process */
// Draws the detailed coast of the map into public/map/tiles once, so the server never has to.
// The land does not change between releases; run this only when the map code changes:
//   pnpm --filter @areopagus/web map:tiles
// The geometry lives in TypeScript under src/places; it is transpiled here on the fly.
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const app = join(dirname(fileURLToPath(import.meta.url)), "..");
const places = join(app, "src", "places");
// Inside the app, so the transpiled files find topojson-client and world-atlas in node_modules.
const work = mkdtempSync(join(app, ".map-build-"));

try {
  // The app is an ES module package; the transpiled files are CommonJS.
  writeFileSync(join(work, "package.json"), '{"type":"commonjs"}');
  for (const name of ["europe", "clip", "view", "outline", "fine"]) {
    const source = readFileSync(join(places, `${name}.ts`), "utf8");
    const { outputText } = ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
        resolveJsonModule: true,
      },
    });
    writeFileSync(join(work, `${name}.js`), outputText);
  }
  const require = createRequire(join(work, "index.js"));
  const { fineTile } = require("./fine.js");
  const { TILE_COLS, TILE_ROWS } = require("./view.js");
  const out = join(app, "public", "map", "tiles");
  rmSync(out, { recursive: true, force: true });
  let bytes = 0;
  for (let col = 0; col < TILE_COLS; col++) {
    mkdirSync(join(out, String(col)), { recursive: true });
    for (let row = 0; row < TILE_ROWS; row++) {
      const svg = fineTile(col, row);
      writeFileSync(join(out, String(col), `${row}.svg`), svg);
      bytes += svg.length;
    }
  }
  console.log(
    `${TILE_COLS * TILE_ROWS} tiles, ${Math.round(bytes / 1024)} KB, in public/map/tiles`,
  );
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  rmSync(work, { recursive: true, force: true });
}
