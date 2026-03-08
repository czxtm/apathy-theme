/**
 * Build themes from ThemeDefinitions
 */

import * as bun from "bun";
import { mapVSCode } from "./integrations/vscode";
import { mapZed } from "./integrations/zed";
import { mapShiki } from "./integrations/shiki";
import { mapObsidian } from "./integrations/obsidian";
import { generatePreviewHTML } from "./integrations/preview";
import type { ThemeDefinition } from "./themes/types";
import { toHex } from "./core/color";
import { presets as filterPresets, type ThemeFilters } from "./filters";

// Import theme definitions
import { minted } from "./themes/minted";
import { mintedTheory } from "./themes/mintedTheory";
import { slate } from "./themes/slate";
import { apathy } from "./themes/apathy";
import { apatheticOcean } from "./themes/apatheticOcean";
import { apathyExperimental } from "./themes/apathyExperimental";

interface ThemeConfig {
  theme: ThemeDefinition;
  outputPath: string;
  /** Path to existing JSON for incremental migration */
  basePath?: string;
  /** Build-time filter overrides (merged with theme.filters) */
  filters?: ThemeFilters;
  /** Output path for Zed theme (optional) */
  zedOutputPath?: string;
  /** Output path for Shiki theme (optional) */
  shikiOutputPath?: string;
  /** Output path for Obsidian snippet (optional) */
  obsidianOutputPath?: string;
}

const themes: ThemeConfig[] = [
  {
    theme: minted,
    outputPath: "./dist/minted.json",
    // basePath: "./themes/minted.jsonc",
    zedOutputPath: "./packages/zed/themes/minted.json",
    shikiOutputPath: "./dist/shiki/minted.json",
    obsidianOutputPath: "./packages/obsidian/minted.css",
    // Example: You can add filters here to override/add to theme.filters
    // filters: filterPresets.lowContrast,
  },
  {
    theme: mintedTheory,
    outputPath: "./dist/minted-theory.json",
    zedOutputPath: "./packages/zed/themes/minted-theory.json",
    shikiOutputPath: "./dist/shiki/minted-theory.json",
    obsidianOutputPath: "./packages/obsidian/minted-theory.css",
  },
  {
    theme: slate,
    outputPath: "./dist/slate.json",
    basePath: "./themes/minted.jsonc",
    zedOutputPath: "./packages/zed/themes/slate.json",
    shikiOutputPath: "./dist/shiki/slate.json",
    obsidianOutputPath: "./packages/obsidian/slate.css",
    // No basePath = fresh build
  },
  {
    theme: apathy,
    outputPath: "./dist/apathy.json",
    zedOutputPath: "./packages/zed/themes/apathy.json",
    shikiOutputPath: "./dist/shiki/apathy.json",
    obsidianOutputPath: "./packages/obsidian/apathy.css",
  },
  {
    theme: apatheticOcean,
    outputPath: "./dist/apathetic-ocean.json",
    zedOutputPath: "./packages/zed/themes/apathetic-ocean.json",
    shikiOutputPath: "./dist/shiki/apathetic-ocean.json",
    obsidianOutputPath: "./packages/obsidian/apathetic-ocean.css",
  },
  {
    theme: apathyExperimental,
    outputPath: "./dist/apathy-experimental.json",
    zedOutputPath: "./packages/zed/themes/apathy-experimental.json",
    shikiOutputPath: "./dist/shiki/apathy-experimental.json",
    obsidianOutputPath: "./packages/obsidian/apathy-experimental.css",
  },
];

/**
 * Parse CLI filter arguments
 *
 * Supports:
 *   --contrast=0.2
 *   --brightness=-0.1
 *   --saturation=0.3
 *   --hue-shift=15
 *   --preset=highContrast
 */
function parseFilterArgs(args: string[]): ThemeFilters {
  const filters: ThemeFilters = {};

  for (const arg of args) {
    if (arg.startsWith("--contrast=")) {
      filters.contrast = parseFloat(arg.split("=")[1]);
    } else if (arg.startsWith("--brightness=")) {
      filters.brightness = parseFloat(arg.split("=")[1]);
    } else if (arg.startsWith("--saturation=")) {
      filters.saturation = parseFloat(arg.split("=")[1]);
    } else if (arg.startsWith("--hue-shift=")) {
      filters.hueShift = parseFloat(arg.split("=")[1]);
    } else if (arg.startsWith("--fg-lightness=")) {
      filters.foregroundLightness = parseFloat(arg.split("=")[1]);
    } else if (arg.startsWith("--bg-lightness=")) {
      filters.backgroundLightness = parseFloat(arg.split("=")[1]);
    } else if (arg.startsWith("--preset=")) {
      const presetName = arg.split("=")[1] as keyof typeof filterPresets;
      if (filterPresets[presetName]) {
        Object.assign(filters, filterPresets[presetName]);
      } else {
        console.warn(`Unknown preset: ${presetName}. Available: ${Object.keys(filterPresets).join(", ")}`);
      }
    }
  }

  return filters;
}

function parseZedMaxSaturationArg(args: string[]): number | undefined {
  const arg = args.find((entry) => entry.startsWith("--zed-max-saturation="));
  if (!arg) return undefined;
  const raw = Number.parseFloat(arg.split("=")[1]);
  if (Number.isNaN(raw)) {
    console.warn(`Invalid --zed-max-saturation value: ${arg.split("=")[1]}`);
    return undefined;
  }
  if (raw < 0 || raw > 1) {
    console.warn(`--zed-max-saturation should be between 0 and 1, got ${raw}. Clamping.`);
  }
  return Math.max(0, Math.min(1, raw));
}

function parseOptionalNumberArg(args: string[], key: string): number | undefined {
  const arg = args.find((entry) => entry.startsWith(`${key}=`));
  if (!arg) return undefined;
  const raw = Number.parseFloat(arg.split("=")[1]);
  if (Number.isNaN(raw)) {
    console.warn(`Invalid ${key} value: ${arg.split("=")[1]}`);
    return undefined;
  }
  return raw;
}

function parseOptionalStringArg(args: string[], key: string): string | undefined {
  const arg = args.find((entry) => entry.startsWith(`${key}=`));
  if (!arg) return undefined;
  const raw = arg.split("=")[1]?.trim();
  return raw ? raw : undefined;
}

async function main() {
  const args = bun.argv.slice(2);

  // Version bumping
  if (args.includes("bump")) {
    const part = args[args.indexOf("bump") + 1] as "patch" | "minor" | "major";
    if (!part || !["patch", "minor", "major"].includes(part)) {
      throw new Error("Please specify bump type: patch, minor, or major.");
    }
    await bumpVersion(part);
    return;
  }

  // Help
  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
Usage: bun run build [options]

Filter options (applied to all themes):
  --contrast=<-1 to 1>     Adjust contrast (0 = no change)
  --brightness=<-1 to 1>   Adjust brightness (0 = no change)
  --saturation=<-1 to 1>   Adjust saturation (0 = no change)
  --hue-shift=<0-360>      Shift hue in degrees
  --fg-lightness=<-1 to 1> Adjust foreground lightness
  --bg-lightness=<-1 to 1> Adjust background lightness
  --zed-max-saturation=<0-1> Clamp Zed color saturation (default: 0.65)
  --zed-saturated-base=<hex> Base color used to compute Zed saturated colors
  --zed-saturated-count=<n> Number of computed saturated colors (default: 6)
  --zed-saturated-hue-step=<deg> Hue step between generated colors (default: 26)
  --zed-saturated-saturation=<0-1> Target saturation for generated colors
  --zed-saturated-lightness=<0-1> Target lightness for generated colors
  --zed-red-max-saturation=<0-1> Max saturation for red-ish colors
  --zed-red-hue-center=<0-360> Hue center for red cap (default: 0)
  --zed-red-hue-window=<0-180> Hue window for red cap (default: 28)
  --zed-red-min-lightness=<0-1> Minimum lightness for red-ish colors
  --preset=<name>          Use a filter preset

Available presets: ${Object.keys(filterPresets).join(", ")}

Examples:
  bun run build --contrast=0.2
  bun run build --preset=highContrast
  bun run build --saturation=-0.3 --brightness=0.1
  bun run build --zed-max-saturation=0.55
  bun run build --zed-saturated-base=#d08770 --zed-saturated-hue-step=22
  bun run build --zed-red-max-saturation=0.4 --zed-red-min-lightness=0.58
`);
    return;
  }

  // Parse CLI filters
  const cliFilters = parseFilterArgs(args);
  const zedMaxSaturation = parseZedMaxSaturationArg(args);
  const zedSaturatedBaseColor = parseOptionalStringArg(args, "--zed-saturated-base");
  const zedSaturatedCount = parseOptionalNumberArg(args, "--zed-saturated-count");
  const zedSaturatedHueStep = parseOptionalNumberArg(args, "--zed-saturated-hue-step");
  const zedSaturatedSaturation = parseOptionalNumberArg(args, "--zed-saturated-saturation");
  const zedSaturatedLightness = parseOptionalNumberArg(args, "--zed-saturated-lightness");
  const zedRedMaxSaturation = parseOptionalNumberArg(args, "--zed-red-max-saturation");
  const zedRedHueCenter = parseOptionalNumberArg(args, "--zed-red-hue-center");
  const zedRedHueWindow = parseOptionalNumberArg(args, "--zed-red-hue-window");
  const zedRedMinLightness = parseOptionalNumberArg(args, "--zed-red-min-lightness");
  const hasCliFilters = Object.keys(cliFilters).length > 0;

  if (hasCliFilters) {
    console.log("Applying filters:", cliFilters);
  }
  if (zedMaxSaturation !== undefined) {
    console.log("Applying Zed max saturation:", zedMaxSaturation);
  }
  if (zedSaturatedBaseColor) {
    console.log("Applying Zed saturated base color:", zedSaturatedBaseColor);
  }

  // Build all themes
  for (const config of themes) {
    // Merge filters: theme.filters < config.filters < CLI filters
    const filters: ThemeFilters = {
      ...config.theme.filters,
      ...config.filters,
      ...cliFilters,
    };

    const vscodeTheme = mapVSCode(config.theme, {
      basePath: config.basePath,
      filters: Object.keys(filters).length > 0 ? filters : undefined,
    });

    await bun.write(config.outputPath, JSON.stringify(vscodeTheme, null, "\t"));
    console.log(`Built: ${config.theme.name} -> ${config.outputPath}`);

    if (config.basePath) {
      console.log(`  (merged with ${config.basePath})`);
    }

    // Build Zed theme if output path is specified
    if (config.zedOutputPath) {
      const zedTheme = mapZed(config.theme, {
        filters: Object.keys(filters).length > 0 ? filters : undefined,
        maxSaturation: zedMaxSaturation,
        saturatedBaseColor: zedSaturatedBaseColor,
        saturatedColorCount: zedSaturatedCount,
        saturatedHueStep: zedSaturatedHueStep,
        saturatedSaturation: zedSaturatedSaturation,
        saturatedLightness: zedSaturatedLightness,
        redMaxSaturation: zedRedMaxSaturation,
        redHueCenter: zedRedHueCenter,
        redHueWindow: zedRedHueWindow,
        redMinLightness: zedRedMinLightness,
      });
      await bun.write(config.zedOutputPath, JSON.stringify(zedTheme, null, "\t"));
      console.log(`Built: ${config.theme.name} (Zed) -> ${config.zedOutputPath}`);
    }

    // Build Shiki theme if output path is specified
    if (config.shikiOutputPath) {
      const shikiTheme = mapShiki(config.theme, {
        filters: Object.keys(filters).length > 0 ? filters : undefined,
      });
      await bun.write(config.shikiOutputPath, JSON.stringify(shikiTheme, null, "\t"));
      console.log(`Built: ${config.theme.name} (Shiki) -> ${config.shikiOutputPath}`);
    }

    if (config.obsidianOutputPath) {
      const obsidianTheme = mapObsidian(config.theme, {
        filters: Object.keys(filters).length > 0 ? filters : undefined,
      });
      await bun.write(config.obsidianOutputPath, obsidianTheme);
      console.log(`Built: ${config.theme.name} (Obsidian) -> ${config.obsidianOutputPath}`);
    }

    // Generate HTML preview
    const previewSlug = config.outputPath.replace("./dist/", "").replace(".json", "");
    const previewPath = `./dist/previews/${previewSlug}.html`;
    const previewHtml = generatePreviewHTML(config.theme);
    await bun.write(previewPath, previewHtml);
    console.log(`Built: ${config.theme.name} (preview) -> ${previewPath}`);
  }

  // Generate preview index page
  const previewIndex = generatePreviewIndex(themes);
  await bun.write("./dist/previews/index.html", previewIndex);
  console.log("Built: preview index -> ./dist/previews/index.html");
}

function generatePreviewIndex(configs: ThemeConfig[]): string {
  const links = configs.map(c => {
    const slug = c.outputPath.replace("./dist/", "").replace(".json", "");
    const bg = toHex(c.theme.ui.backgrounds.base) || "#0f0f15";
    const fg = toHex(c.theme.ui.foregrounds.default) || "#e1e2e5";
    const accent = toHex(c.theme.ui.accent.primary) || "#33b3cc";
    return `<a href="${slug}.html" class="theme-card" style="background:${bg};color:${fg};border-color:${accent}22">
      <div class="card-accent" style="background:${accent}"></div>
      <div class="card-name">${c.theme.name}</div>
      <div class="card-type">${c.theme.type}</div>
      <div class="card-palette">${Object.values(c.theme.palette).slice(0, 8).map((color) => `<span class="mini-swatch" style="background:${toHex(color)}"></span>`).join("")}</div>
    </a>`;
  }).join("\n    ");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Apathy Theme Previews</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0e; color: #c0c0c8; padding: 48px; }
  h1 { font-size: 32px; margin-bottom: 8px; color: #e1e2e5; }
  .subtitle { opacity: .5; margin-bottom: 32px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
  .theme-card { display: block; text-decoration: none; color: inherit; border-radius: 12px; border: 1px solid; overflow: hidden; transition: transform .15s, box-shadow .15s; }
  .theme-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px #00000060; }
  .card-accent { height: 4px; }
  .card-name { font-size: 20px; font-weight: 600; padding: 20px 20px 4px; }
  .card-type { font-size: 13px; opacity: .5; padding: 0 20px; text-transform: uppercase; letter-spacing: .5px; }
  .card-palette { display: flex; gap: 4px; padding: 16px 20px 20px; }
  .mini-swatch { width: 20px; height: 20px; border-radius: 4px; border: 1px solid #ffffff10; }
  .timestamp { text-align: center; opacity: .3; font-size: 11px; padding: 32px 0; }
</style>
</head>
<body>
  <h1>🎨 Apathy Theme Previews</h1>
  <div class="subtitle">Click a theme to see the full preview</div>
  <div class="grid">
    ${links}
  </div>
  <div class="timestamp">Generated ${new Date().toISOString()}</div>
</body>
</html>`;
}

async function bumpVersion(part: "patch" | "minor" | "major") {
  const pkgPath = "./package.json";
  const pkg = await bun.file(pkgPath).json();
  const [major, minor, patch] = pkg.version.split(".").map(Number);

  let newVersion = "";
  if (part === "patch") {
    newVersion = `${major}.${minor}.${patch + 1}`;
  } else if (part === "minor") {
    newVersion = `${major}.${minor + 1}.0`;
  } else if (part === "major") {
    newVersion = `${major + 1}.0.0`;
  }

  pkg.version = newVersion;
  await bun.write(pkgPath, JSON.stringify(pkg, null, 2));
  console.log(`Bumped version to ${newVersion}`);
}

main()
  .then(() => console.log("Done at ", new Date().toLocaleTimeString()))
  .catch((err) => console.error(err));
