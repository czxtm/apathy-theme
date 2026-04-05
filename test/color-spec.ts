/**
 * Color specification testing framework.
 *
 * Spec-driven color testing: you manually define the colors you *want* in a
 * spec file, and these tests verify that the generated theme stays perceptually
 * close (within a Delta-E threshold) to those targets.
 *
 * Workflow:
 *   1. Bootstrap a spec once:  bun packages/scripts/bootstrap-zed-spec.ts
 *   2. Edit the spec to express the colors you actually want (hsl values make
 *      this easy — tweak hue, saturation, lightness directly).
 *   3. Run tests to see how far the generated output is from your targets.
 *   4. Adjust theme code until tests pass. Failures = regressions or unmet targets.
 *
 * Opaque spec colors (#RRGGBB, #RRGGBBFF, hsl without alpha, etc.) are matched on
 * chroma (Delta-E) only; alpha may differ (e.g. 6-digit vs 8-digit hex, or UI
 * tints). Alpha is enforced when the spec is semi-transparent, or when the spec
 * is opaque but the actual value is fully transparent (which Delta-E alone can
 * miss vs the same RGB).
 *
 * Usage:
 *   import { describeColorSpec } from "./color-spec";
 *   import { expectedZed } from "./specs/minted-theory.zed.spec";
 *   import { mapZed } from "../src/integrations/zed";
 *   import { mintedTheory } from "../src/themes/mintedTheory";
 *
 *   describeColorSpec(
 *     "Minted Theory Zed theme",
 *     () => mapZed(mintedTheory).themes[0],
 *     expectedZed,
 *     { colorThreshold: 5, alphaThreshold: 0.05 }
 *   );
 */

import { describe, expect, test } from "bun:test";
import Color from "colorjs.io";

// ============================================================================
// Options
// ============================================================================

/**
 * Per-channel LCH distance thresholds.
 * When provided, each channel is checked independently instead of using
 * a single Delta-E number for the whole color.
 *
 * Any channel left undefined falls back to `colorThreshold` (Delta-E mode)
 * for backwards compat, but ideally you set all three.
 */
export interface ChannelThresholds {
	/** Max lightness difference (CIELCh L*, 0–100 scale). */
	l?: number;
	/** Max chroma difference (CIELCh C*). */
	c?: number;
	/** Max hue difference (CIELCh h°, 0–360 scale, shortest arc). */
	h?: number;
}

export interface ColorSpecOptions {
	/**
	 * Maximum allowed CIE76 Delta-E for color hue/lightness/chroma.
	 * 0 = identical, ~2 = just noticeable, ~5 = clearly similar, ~20 = clearly different.
	 * Default: 5
	 *
	 * Ignored for channels that have an explicit threshold in `channelThresholds`.
	 */
	colorThreshold?: number;

	/**
	 * Maximum allowed absolute alpha channel difference (0–1 scale).
	 * Default: 0.05
	 */
	alphaThreshold?: number;

	/**
	 * Per-channel LCH thresholds. When set, assertion messages show per-channel
	 * deltas (ΔL, ΔC, ΔH) and each channel is checked independently.
	 */
	channelThresholds?: ChannelThresholds;
}

// ============================================================================
// Color primitives
// ============================================================================

const HEX_RE = /^#[0-9a-fA-F]{3,8}$/;
const HSL_RE =
	/^hsla?\(\s*[\d.]+\s*,\s*[\d.]+%\s*,\s*[\d.]+%\s*(?:,\s*[\d.]+\s*)?\)$/i;

/** Returns true if the value looks like a hex or hsl(a) color string. */
export function isColorString(value: unknown): value is string {
	return (
		typeof value === "string" && (HEX_RE.test(value) || HSL_RE.test(value))
	);
}

/** Treat ~opaque alpha as unspecified: `#RRGGBB` ≡ `#RRGGBBFF` ≡ `#RRGGBBCE` for α checks. */
const OPAQUE_ALPHA_EPS = 0.001;

/** Below this, actual is treated as fully transparent vs an opaque spec (must fail alpha). */
const TRANSPARENT_ALPHA_EPS = 0.01;

/**
 * Assert α when the spec constrains it, or when opaque RGB is required but the
 * actual value is fully transparent (ΔE alone would miss that). When the spec
 * is effectively opaque, allow any non–fully-transparent actual α so 6-digit
 * hex and 8-digit hex (or tinted UI colors) compare on chroma only.
 */
function shouldAssertAlphaChannel(expected: string, actual: string): boolean {
	try {
		const aE = new Color(expected).alpha ?? 1;
		const aA = new Color(actual).alpha ?? 1;
		if (aE < 1 - OPAQUE_ALPHA_EPS) {
			return true;
		}
		return aA < TRANSPARENT_ALPHA_EPS;
	} catch {
		return true;
	}
}

function parseColor(s: string): Color {
	// Strip alpha from hex before parsing into Lab, so the color channel
	// comparison is independent of alpha. For all other formats (hsl, hsla, rgb,
	// etc.) pass the string directly — Color() handles them natively.
	if (/^#[0-9a-fA-F]{8}$/i.test(s)) {
		return new Color(s.slice(0, 7));
	}
	// #RGBA shorthand: compare chroma using RGB only (drop alpha nibble).
	if (/^#[0-9a-fA-F]{4}$/i.test(s)) {
		return new Color(s.slice(0, 4));
	}
	return new Color(s);
}

// ============================================================================
// LCH helpers
// ============================================================================

interface LchChannels {
	l: number; // 0–100
	c: number; // >= 0
	h: number; // 0–360
	a: number; // 0–1
}

function toLch(s: string): LchChannels {
	const raw = new Color(s);
	const lch = parseColor(s).to("lch");
	const [l, ch, h] = lch.coords as [number, number, number];
	return {
		l: l ?? 0,
		c: ch ?? 0,
		h: Number.isNaN(h) ? 0 : (h ?? 0),
		a: raw.alpha ?? 1,
	};
}

function fmtLch(lch: LchChannels): string {
	const alpha = lch.a < 1 - 0.001 ? ` α=${(lch.a * 100).toFixed(0)}%` : "";
	return `L=${lch.l.toFixed(1)} C=${lch.c.toFixed(1)} H=${lch.h.toFixed(0)}°${alpha}`;
}

/** Shortest-arc hue difference (always positive, max 180). */
function hueDelta(a: number, b: number): number {
	const d = Math.abs(a - b) % 360;
	return d > 180 ? 360 - d : d;
}

/**
 * CIE76 Delta-E between two color strings, ignoring alpha.
 * Returns 0 for identical colors, up to ~100 for maximally different colors.
 * Accepts hex (#RGB, #RRGGBB, #RRGGBBAA) or any format the `color` library
 * understands (hsl, hsla, rgb, etc.).
 */
export function deltaE(a: string, b: string): number {
	try {
		const la = parseColor(a).to("lab").coords as [number, number, number];
		const lb = parseColor(b).to("lab").coords as [number, number, number];
		const dL = la[0] - lb[0];
		const da = la[1] - lb[1];
		const db = la[2] - lb[2];
		return Math.sqrt(dL * dL + da * da + db * db);
	} catch {
		return Infinity;
	}
}

// ============================================================================
// Internal assertion
// ============================================================================

function buildReport(
	path: string,
	aLch: LchChannels,
	eLch: LchChannels,
	actualHex: string,
	expectedHex: string,
	de: number,
	dL: number,
	dC: number,
	dH: number,
	dA: number,
	opts: ColorSpecOptions,
): string {
	const ct = opts.channelThresholds;
	const alphaThresh = opts.alphaThreshold ?? 0.05;
	const checkAlpha = shouldAssertAlphaChannel(expectedHex, actualHex);

	const mark = (val: number, max: number | undefined) =>
		max !== undefined && val > max ? "✗" : "✓";

	const lines = [
		`"${path}"`,
		`  actual:   ${fmtLch(aLch)}  ${actualHex}`,
		`  expected: ${fmtLch(eLch)}  ${expectedHex}`,
		`  ─────────────────────────────`,
	];

	if (ct && (ct.l !== undefined || ct.c !== undefined || ct.h !== undefined)) {
		if (ct.l !== undefined)
			lines.push(
				`  ${mark(dL, ct.l)} ΔL  ${dL.toFixed(1).padStart(6)}  (max ${ct.l})`,
			);
		if (ct.c !== undefined)
			lines.push(
				`  ${mark(dC, ct.c)} ΔC  ${dC.toFixed(1).padStart(6)}  (max ${ct.c})`,
			);
		if (ct.h !== undefined)
			lines.push(
				`  ${mark(dH, ct.h)} ΔH  ${dH.toFixed(1).padStart(6)}° (max ${ct.h}°)`,
			);
	} else {
		const threshold = opts.colorThreshold ?? 5;
		lines.push(
			`  ${mark(de, threshold)} ΔE  ${de.toFixed(1).padStart(6)}  (max ${threshold})`,
		);
		lines.push(`    ΔL  ${dL.toFixed(1).padStart(6)}`);
		lines.push(`    ΔC  ${dC.toFixed(1).padStart(6)}`);
		lines.push(`    ΔH  ${dH.toFixed(1).padStart(6)}°`);
	}

	if (checkAlpha) {
		lines.push(
			`  ${mark(dA, alphaThresh)} Δα  ${(dA * 100).toFixed(1).padStart(5)}%  (max ${(alphaThresh * 100).toFixed(0)}%)`,
		);
	}

	return lines.join("\n");
}

function assertColor(
	actual: unknown,
	expected: string,
	path: string,
	opts: ColorSpecOptions,
): void {
	const alphaThresh = opts.alphaThreshold ?? 0.05;
	const actualStr = typeof actual === "string" ? actual : String(actual);

	const aLch = toLch(actualStr);
	const eLch = toLch(expected);

	const dL = Math.abs(aLch.l - eLch.l);
	const dC = Math.abs(aLch.c - eLch.c);
	const dH = hueDelta(aLch.h, eLch.h);
	const dA = Math.abs(aLch.a - eLch.a);
	const de = deltaE(actualStr, expected);

	const report = () =>
		buildReport(
			path,
			aLch,
			eLch,
			actualStr,
			expected,
			de,
			dL,
			dC,
			dH,
			dA,
			opts,
		);

	const ct = opts.channelThresholds;

	if (ct && (ct.l !== undefined || ct.c !== undefined || ct.h !== undefined)) {
		if (ct.l !== undefined) {
			expect(dL, report()).toBeLessThanOrEqual(ct.l);
		}
		if (ct.c !== undefined) {
			expect(dC, report()).toBeLessThanOrEqual(ct.c);
		}
		if (ct.h !== undefined) {
			expect(dH, report()).toBeLessThanOrEqual(ct.h);
		}
	} else {
		const threshold = opts.colorThreshold ?? 5;
		expect(de, report()).toBeLessThanOrEqual(threshold);
	}

	if (shouldAssertAlphaChannel(expected, actualStr)) {
		expect(dA, report()).toBeLessThanOrEqual(alphaThresh);
	}
}

// ============================================================================
// Recursive spec runner
// ============================================================================

type ActualFn = () => unknown;

/**
 * Recursively walk `expected`, registering one `test()` per leaf color field
 * and one `describe()` per nested object/array scope.
 *
 * Non-color leaf values (strings, numbers, booleans) are checked with exact equality.
 * Color strings (hex) are checked with Delta-E + alpha threshold.
 */
function runSpec(
	getActual: ActualFn,
	expected: unknown,
	opts: ColorSpecOptions,
): void {
	if (Array.isArray(expected)) {
		for (let i = 0; i < expected.length; i++) {
			const idx = i;
			const child = expected[idx];

			if (isColorString(child)) {
				test(`[${idx}]`, () => {
					const actual = getActual() as unknown[];
					assertColor(actual[idx], child, `[${idx}]`, opts);
				});
			} else if (child !== null && typeof child === "object") {
				describe(`[${idx}]`, () => {
					runSpec(
						() => {
							const actual = getActual() as unknown[];
							return actual[idx];
						},
						child,
						opts,
					);
				});
			} else {
				test(`[${idx}]`, () => {
					const actual = getActual() as unknown[];
					expect(actual[idx]).toBe(child);
				});
			}
		}
		return;
	}

	if (expected !== null && typeof expected === "object") {
		for (const key of Object.keys(expected as object)) {
			const val = (expected as Record<string, unknown>)[key];

			if (isColorString(val)) {
				test(key, () => {
					const actual = (getActual() as Record<string, unknown>)[key];
					assertColor(actual, val, key, opts);
				});
			} else if (Array.isArray(val)) {
				describe(key, () => {
					runSpec(
						() => {
							return (getActual() as Record<string, unknown>)[key];
						},
						val,
						opts,
					);
				});
			} else if (val !== null && typeof val === "object") {
				describe(key, () => {
					runSpec(
						() => {
							return (getActual() as Record<string, unknown>)[key];
						},
						val,
						opts,
					);
				});
			} else if (val !== undefined) {
				test(key, () => {
					const actual = (getActual() as Record<string, unknown>)[key];
					expect(actual).toBe(val);
				});
			}
		}
	}
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Register a suite of color-distance tests for a theme spec.
 *
 * @param label    The outermost `describe` label.
 * @param generate A function that produces the actual theme object to test.
 * @param expected The expected shape — plain objects/arrays of hex color strings.
 * @param options  Threshold configuration.
 *
 * @example
 * describeColorSpec(
 *   "Minted Theory Zed",
 *   () => mapZed(mintedTheory).themes[0],
 *   expectedZed,
 *   { colorThreshold: 5 }
 * );
 */
export function describeColorSpec(
	label: string,
	generate: () => unknown,
	expected: unknown,
	options: ColorSpecOptions = {
		alphaThreshold: 0.15,
		channelThresholds: {
			l: 2,
			c: 2,
			h: 10,
		},
	},
): void {
	describe(label, () => {
		runSpec(generate, expected, options);
	});
}
