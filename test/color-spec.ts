/**
 * Color specification testing framework.
 *
 * Allows defining expected theme output as plain objects and asserting that
 * actual generated colors are perceptually close (within a Delta-E threshold)
 * to those expected values.
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

import Color from "color";
import { describe, test, expect } from "bun:test";

// ============================================================================
// Options
// ============================================================================

export interface ColorSpecOptions {
  /**
   * Maximum allowed CIE76 Delta-E for color hue/lightness/chroma.
   * 0 = identical, ~2 = just noticeable, ~5 = clearly similar, ~20 = clearly different.
   * Default: 5
   */
  colorThreshold?: number;

  /**
   * Maximum allowed absolute alpha channel difference (0–1 scale).
   * Default: 0.05
   */
  alphaThreshold?: number;
}

// ============================================================================
// Color primitives
// ============================================================================

const HEX_RE = /^#[0-9a-fA-F]{3,8}$/;

/** Returns true if the value looks like a hex color string. */
export function isColorString(value: unknown): value is string {
  return typeof value === "string" && HEX_RE.test(value);
}

/**
 * CIE76 Delta-E between two hex color strings, ignoring alpha.
 * Returns 0 for identical colors, up to ~100 for maximally different colors.
 */
export function deltaE(a: string, b: string): number {
  try {
    const la = Color(a.slice(0, 7)).lab().array() as [number, number, number];
    const lb = Color(b.slice(0, 7)).lab().array() as [number, number, number];
    const dL = la[0] - lb[0];
    const da = la[1] - lb[1];
    const db = la[2] - lb[2];
    return Math.sqrt(dL * dL + da * da + db * db);
  } catch {
    return Infinity;
  }
}

/**
 * Absolute alpha difference between two color strings, expressed 0–1.
 * Works with any format the `color` library understands, including 8-digit hex.
 */
export function alphaDelta(a: string, b: string): number {
  const parseAlpha = (s: string): number => {
    try {
      return Color(s).alpha();
    } catch {
      return 1;
    }
  };
  return Math.abs(parseAlpha(a) - parseAlpha(b));
}

// ============================================================================
// Internal assertion
// ============================================================================

function assertColor(
  actual: unknown,
  expected: string,
  path: string,
  opts: ColorSpecOptions,
): void {
  const threshold = opts.colorThreshold ?? 5;
  const alphaThresh = opts.alphaThreshold ?? 0.05;
  const actualStr = typeof actual === "string" ? actual : String(actual);

  const de = deltaE(actualStr, expected);
  const da = alphaDelta(actualStr, expected);

  expect(
    de,
    `ΔE=${de.toFixed(1)} (max ${threshold}) — "${path}": actual=${actualStr} expected=${expected}`,
  ).toBeLessThanOrEqual(threshold);

  expect(
    da,
    `Δα=${da.toFixed(3)} (max ${alphaThresh}) — "${path}": actual=${actualStr} expected=${expected}`,
  ).toBeLessThanOrEqual(alphaThresh);
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
function runSpec(getActual: ActualFn, expected: unknown, opts: ColorSpecOptions): void {
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
          runSpec(() => {
            const actual = getActual() as unknown[];
            return actual[idx];
          }, child, opts);
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
          runSpec(() => {
            return (getActual() as Record<string, unknown>)[key];
          }, val, opts);
        });
      } else if (val !== null && typeof val === "object") {
        describe(key, () => {
          runSpec(() => {
            return (getActual() as Record<string, unknown>)[key];
          }, val, opts);
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
  options: ColorSpecOptions = {},
): void {
  describe(label, () => {
    runSpec(generate, expected, options);
  });
}
