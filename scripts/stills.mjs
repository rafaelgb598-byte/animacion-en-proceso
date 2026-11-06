// Renderiza varios fotogramas/stills con un solo bundle.
// Uso: node scripts/stills.mjs <outDir> [--props=JSON] <compId>:<frame>[,<frame>...] [<compId>:<frame>...]
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";
import process from "node:process";
import console from "node:console";

const [outDir, ...rest] = process.argv.slice(2);
const propArg = rest.find((a) => a.startsWith("--props="));
const inputProps = propArg ? JSON.parse(propArg.slice(8)) : {};
const specs = rest.filter((a) => a !== propArg);
fs.mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
for (const spec of specs) {
  const [id, frames = "0"] = spec.split(":");
  const composition = await selectComposition({ serveUrl, id, inputProps, chromiumOptions: { gl: "angle" } });
  for (const fr of frames.split(",").map(Number)) {
    const output = path.join(outDir, `${id}-${String(fr).padStart(4, "0")}.png`);
    await renderStill({ serveUrl, composition, frame: fr, output, inputProps, chromiumOptions: { gl: "angle" } });
    console.log(output);
  }
}
