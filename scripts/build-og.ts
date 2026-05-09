#!/usr/bin/env node
/**
 * Build static OG-PNGs from the SVG cards in src/lib/og.ts.
 * Outputs to public/og/<slug>.png. Re-run after editing card definitions.
 *
 * Why static: Twitter/X and a few older crawlers don't render SVG og:image.
 * PNG fallbacks live in /public so they're served directly by the static
 * layer with no SSR cost.
 *
 * Run: `pnpm og:build`
 */

import { mkdir, readdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";
import { CARDS, renderOgSvg } from "../src/lib/og.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = resolve(ROOT, "public/og");
const FONT_DIR = resolve(ROOT, "assets/fonts-og");

async function loadBrandFonts(): Promise<string[]> {
  const entries = await readdir(FONT_DIR);
  return entries.filter((f) => /\.(ttf|otf)$/i.test(f)).map((f) => resolve(FONT_DIR, f));
}

async function main(): Promise<void> {
  await mkdir(OUT_DIR, { recursive: true });
  const fontFiles = await loadBrandFonts();
  console.log(`→ ${fontFiles.length} brand font files loaded`);

  for (const [slug, card] of Object.entries(CARDS)) {
    const svg = renderOgSvg(card);
    const resvg = new Resvg(svg, {
      fitTo: { mode: "width", value: 1200 },
      font: { fontFiles, loadSystemFonts: false, defaultFontFamily: "Inter" },
    });
    const png = resvg.render().asPng();
    const outPath = resolve(OUT_DIR, `${slug}.png`);
    await writeFile(outPath, png);
    console.log(`  ✓ ${slug}.png  (${(png.byteLength / 1024).toFixed(1)} KB)`);
  }

  console.log(`\n→ ${Object.keys(CARDS).length} OG cards written to public/og/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
