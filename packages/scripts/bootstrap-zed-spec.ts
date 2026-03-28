/**
 * Bootstraps a Zed theme spec file from the current generated output.
 *
 * Run this ONCE to get a starting point, then manually edit the spec to express
 * the colors you actually want. The spec is your design intent — tests verify
 * that the generated theme stays close to it.
 *
 * WARNING: Running this again will overwrite your manual edits.
 *
 * Usage:
 *   bun packages/scripts/bootstrap-zed-spec.ts [theme] [output]
 *
 * Examples:
 *   bun packages/scripts/bootstrap-zed-spec.ts mintedTheory
 *   bun packages/scripts/bootstrap-zed-spec.ts mintedTheory test/specs/minted-theory.zed.spec.ts
 */

import Color from "color";
import { mapZed } from "../../src/integrations/zed";
import { mintedTheory } from "../../src/themes/mintedTheory";
import { minted } from "../../src/themes/minted";
import { slate } from "../../src/themes/slate";
import { apathy } from "../../src/themes/apathy";
import { apatheticOcean } from "../../src/themes/apatheticOcean";
import { apathyExperimental } from "../../src/themes/apathyExperimental";
import type { ThemeDefinition } from "../../src/themes/types";
import { writeFileSync } from "fs";
import { resolve } from "path";

const themes: Record<string, ThemeDefinition> = {
	mintedTheory,
	minted,
	slate,
	apathy,
	apatheticOcean,
	apathyExperimental,
};

const defaultOutputs: Record<string, string> = {
	mintedTheory: "test/specs/minted-theory.zed.spec.ts",
	minted: "test/specs/minted.zed.spec.ts",
	slate: "test/specs/slate.zed.spec.ts",
	apathy: "test/specs/apathy.zed.spec.ts",
	apatheticOcean: "test/specs/apathetic-ocean.zed.spec.ts",
	apathyExperimental: "test/specs/apathy-experimental.zed.spec.ts",
};

// ============================================================================
// Hex → HSL conversion
// ============================================================================

const HEX_RE = /^#[0-9a-fA-F]{3,8}$/;

function hexToHsl(hex: string): string {
	try {
		const c = Color(hex);
		const h = Math.round(c.hue());
		const s = Math.round(c.saturationl());
		const l = Math.round(c.lightness());
		const a = Math.round(c.alpha() * 100) / 100;
		if (a === 1) return `hsl(${h}, ${s}%, ${l}%)`;
		return `hsla(${h}, ${s}%, ${l}%, ${a})`;
	} catch {
		return hex;
	}
}

function convertColors(value: unknown): unknown {
	if (typeof value === "string" && HEX_RE.test(value)) {
		return hexToHsl(value);
	}
	if (Array.isArray(value)) {
		return value.map(convertColors);
	}
	if (value !== null && typeof value === "object") {
		return Object.fromEntries(
			Object.entries(value as Record<string, unknown>).map(([k, v]) => [
				k,
				convertColors(v),
			]),
		);
	}
	return value;
}

// ============================================================================
// Main
// ============================================================================

const themeName = process.argv[2] ?? "mintedTheory";
const theme = themes[themeName];
if (!theme) {
	console.error(`Unknown theme "${themeName}". Available: ${Object.keys(themes).join(", ")}`);
	process.exit(1);
}

const outPath = process.argv[3] ?? defaultOutputs[themeName];
if (!outPath) {
	console.error(`No output path for theme "${themeName}".`);
	process.exit(1);
}

const raw = mapZed(theme).themes[0];
const converted = convertColors(raw);
const content = `export const expectedZed = ${JSON.stringify(converted, null, "\t")};\n`;

const fullPath = resolve(process.cwd(), outPath);
writeFileSync(fullPath, content, "utf-8");
console.log(`Wrote spec to ${fullPath}`);
