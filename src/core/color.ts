import ColorLib, { type ColorInstance } from "color";

// ============================================================================
// Core Color Type
// ============================================================================

/**
 * A color value - either a hex string or a Color instance.
 * Use this throughout theme definitions. Resolved to hex at build time.
 */
export type ColorLike = string | Color;

/**
 * Normalize any color string to 8-digit hexa (#RRGGBBAA) format.
 * Passes through empty strings and non-color values unchanged.
 */
function normalizeHexa(value: string): string {
  if (!value) return value;
  // Already 8-digit hex
  if (/^#[0-9a-fA-F]{8}$/.test(value)) return value;
  // 6-digit hex → add FF alpha
  if (/^#[0-9a-fA-F]{6}$/.test(value)) return value + "ff";
  // 4-digit hex (#RGBA) → expand
  if (/^#[0-9a-fA-F]{4}$/.test(value)) {
    const [, r, g, b, a] = value.split("");
    return `#${r}${r}${g}${g}${b}${b}${a}${a}`;
  }
  // 3-digit hex → expand + add FF alpha
  if (/^#[0-9a-fA-F]{3}$/.test(value)) {
    const [, r, g, b] = value.split("");
    return `#${r}${r}${g}${g}${b}${b}ff`;
  }
  // Other formats (rgb, hsl, etc.) — try parsing via Color library
  try {
    return ColorLib(value).hexa();
  } catch {
    return value;
  }
}

/**
 * Resolve any ColorLike value to an 8-digit hexa string (#RRGGBBAA).
 */
export function toHex(value: unknown): string {
  if (typeof value === "string") return normalizeHexa(value);
  if (value instanceof Color) return value.hexa();
  try {
    const v = value as any;
    if (v == null) return "";
    if (typeof v.hexa === "function") return v.hexa();
    if (typeof v.hex === "function") return normalizeHexa(v.hex());
    if (v.cv && typeof v.cv.hexa === "function") return v.cv.hexa();
    if (v.cv && typeof v.cv.hex === "function") return normalizeHexa(v.cv.hex());
    if (typeof v.toString === "function") return normalizeHexa(v.toString());
  } catch {
    // fallthrough
  }
  return normalizeHexa(String(value as any));
}

// ============================================================================
// Color Class
// ============================================================================

export class Color {
  cv: ColorInstance;

  constructor(input: string | ColorInstance | Color) {
    if (input instanceof Color) {
      this.cv = input.cv;
    } else {
      this.cv = typeof input === "string" ? ColorLib(input) : input;
    }
  }

  // --- Core transforms (all return Color for chaining) ---

  lighter(n = 0.2): Color {
    return new Color(this.cv.lighten(n));
  }
  darker(n = 0.2): Color {
    return new Color(this.cv.darken(n));
  }
  transparent(amount = 0.5): Color {
    return new Color(this.cv.alpha(amount));
  }
  alpha(amount: number): Color {
    return new Color(this.cv.alpha(amount));
  }
  lightness(amount: number): Color {
    return new Color(this.cv.lightness(amount));
  }
  rotate(degrees = 30): Color {
    return new Color(this.cv.rotate(degrees));
  }
  saturate(amount = 0.2): Color {
    return new Color(this.cv.saturate(amount));
  }
  desaturate(amount = 0.2): Color {
    return new Color(this.cv.desaturate(amount));
  }

  // --- Mixing ---

  /** Mix this color with another by weight (0 = all this, 1 = all other) */
  mix(other: Color | string, weight = 0.5): Color {
    const otherCv = other instanceof Color ? other.cv : ColorLib(other);
    return new Color(this.cv.mix(otherCv, weight));
  }

  // --- Accent generation ---

  /** Mix toward a target color, then optionally lighten */
  accent(target: Color | string, mixAmt = 0.1, lightenAmt = 0.1): Color {
    const targetCv = target instanceof Color ? target.cv : ColorLib(target);
    return new Color(this.cv.mix(targetCv, mixAmt).lighten(lightenAmt));
  }

  /** Generate a warm accent (rotate toward orange/red) */
  warm(intensity = 0.15): Color {
    return new Color(this.cv.rotate(-20).saturate(intensity).lighten(intensity * 0.5));
  }

  /** Generate a cool accent (rotate toward blue/cyan) */
  cool(intensity = 0.15): Color {
    return new Color(this.cv.rotate(20).saturate(intensity).lighten(intensity * 0.5));
  }

  /** Generate a complementary accent */
  complement(): Color {
    return new Color(this.cv.rotate(180));
  }

  /** Generate an analogous set (±30°) */
  analogous(): [Color, Color] {
    return [new Color(this.cv.rotate(-30)), new Color(this.cv.rotate(30))];
  }

  // --- Channel accessors (for filter support) ---

  luminosity(amount: number): Color { return new Color(this.cv.l(amount)); }
  l(): number { return this.cv.l(); }
  red(): number { return this.cv.red(); }
  green(): number { return this.cv.green(); }
  blue(): number { return this.cv.blue(); }

  // --- Output ---

  hex(): string {
    return this.cv.hex();
  }
  hexa(): string {
    return this.cv.hexa();
  }

  /** Allows Color instances to work in string contexts (template literals, etc.) */
  toString(): string {
    return this.hexa();
  }

  /** Allows Color to serialize to hexa in JSON.stringify */
  toJSON(): string {
    return this.hexa();
  }

  /** Allows Color to coerce to string in loose comparisons */
  valueOf(): string {
    return this.hexa();
  }
}


export interface WithState<T> {
  default: T;
  hovered: T;
  active: T;
  selected: T;
  disabled: T;
}

export class StatefulColor {
  value: Color;
  accent: Color;
  base?: Color;
  states?: Partial<WithState<Color>>;

  constructor(
    value: Color,
    accent: Color,
    base = new Color("#000000"),
    stateColors?: Partial<WithState<Color>>
  ) {
    this.value = value;
    this.accent = accent;
    this.base = base;
    this.states = stateColors;
  }

  hovered(): Color {
    return this.states?.hovered || this.value.lighter(0.1);
  }

  active(): Color {
    return this.states?.active || this.value.mix(this.accent, 0.2);
  }

  selected(): Color {
    return this.states?.selected || this.value.mix(this.accent, 0.3).lighter(0.1);
  }

  disabled(): Color {
    return this.states?.disabled || this.value.desaturate(0.5).transparent(0.5);
  }
}


// ============================================================================
// Factory helpers
// ============================================================================

/** Create a Color from a hex string */
export function c(input: string): Color {
  return new Color(input);
}

/** Convert an object of hex strings into an object of Color instances */
export function makeColors<T extends object>(palette: T): { [K in keyof T]: Color } {
  const result: any = {};
  for (const key in palette) {
    const val = palette[key];
    if (typeof val === "string") {
      result[key] = new Color(val);
    }
  }
  return result;
}

// ============================================================================
// Color derivation utilities
// ============================================================================

export type ColorInput = string | Color | ColorInstance;
export type ElementColors = { bg: string; fg: string; border: string };

export function toColorInstance(color: ColorInput): ColorInstance {
  return color instanceof Color ? color.cv : ColorLib(color as any);
}

export function safeHex(color: ColorInput): string {
  try {
    return toColorInstance(color).hexa();
  } catch {
    return String(color);
  }
}

/** Build a full hexa string from HSL components + alpha */
export function hslTone(hue: number, saturation: number, lightness: number, alpha = 1): string {
  const cl = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
  return ColorLib
    .hsl(hue, cl(saturation, 0, 100), cl(lightness, 0, 100))
    .alpha(cl(alpha, 0, 1))
    .hexa();
}

/** Alpha-correct composite of semi-transparent foreground over opaque background */
export function compositeOver(foreground: ColorInstance, background: ColorInstance): ColorInstance {
  const fg = foreground.unitObject();
  const bg = background.unitObject();
  const fgA = fg.alpha ?? foreground.alpha();
  const bgA = bg.alpha ?? background.alpha();
  const outA = fgA + bgA * (1 - fgA);
  if (outA <= 0) return ColorLib.rgb(0, 0, 0).alpha(0);
  const ch = (f: number, b: number) =>
    ((f * fgA + b * bgA * (1 - fgA)) / outA) * 255;
  return ColorLib.rgb(
    Math.round(ch(fg.r, bg.r)),
    Math.round(ch(fg.g, bg.g)),
    Math.round(ch(fg.b, bg.b)),
  ).alpha(outA);
}

/**
 * WCAG contrast ratio of `color` as it visually appears on `background`,
 * accounting for any alpha transparency.
 */
export function effectiveContrast(color: ColorInput, background: ColorInput): number {
  try {
    const fg = toColorInstance(color);
    const bg = toColorInstance(background).alpha(1);
    const visible = compositeOver(fg, bg).alpha(1);
    return visible.contrast(bg);
  } catch {
    return 1;
  }
}

/**
 * Nudge `color` toward `anchor` until its contrast against `background`
 * crosses `targetContrast`. Binary search, 12 iterations (~0.02% precision).
 *
 * @param seekMinimum - true: find the point that just reaches the minimum;
 *                      false: find the point that just falls within the maximum
 */
export function blendTowardContrast(
  color: ColorInput,
  anchor: ColorInput,
  background: ColorInput,
  targetContrast: number,
  seekMinimum: boolean,
): string {
  const ci = toColorInstance(color);
  const ai = toColorInstance(anchor);
  const bi = toColorInstance(background).alpha(1);
  let lo = 0;
  let hi = 1;
  let best = ci;
  for (let i = 0; i < 12; i++) {
    const mid = (lo + hi) / 2;
    const trial = ci.mix(ai, mid);
    const contrast = compositeOver(trial, bi).alpha(1).contrast(bi);
    if (seekMinimum ? contrast >= targetContrast : contrast <= targetContrast) {
      best = trial;
      hi = mid;
    } else {
      lo = mid;
    }
  }
  return best.hexa();
}

export interface ClampContrastOptions {
  /** Minimum contrast ratio against background (default: 2.6) */
  minContrast?: number;
  /** Maximum contrast ratio against background (default: 7.5) */
  maxContrast?: number;
}

/**
 * Return `color` adjusted so its effective contrast against `background`
 * stays within [minContrast, maxContrast]. If it falls short, it blends
 * toward `foreground`; if it exceeds the cap, it blends back toward
 * `background`.
 */
export function clampContrast(
  color: ColorInput,
  background: ColorInput,
  foreground: ColorInput,
  { minContrast = 2.6, maxContrast = 7.5 }: ClampContrastOptions = {},
): string {
  try {
    const ci = toColorInstance(color);
    const bg = toColorInstance(background).alpha(1);
    const fg = toColorInstance(foreground).alpha(ci.alpha());
    const contrast = compositeOver(ci, bg).alpha(1).contrast(bg);
    if (contrast < minContrast) {
      return blendTowardContrast(ci, fg, bg, minContrast, true);
    }
    if (contrast > maxContrast) {
      return blendTowardContrast(ci, bg.alpha(ci.alpha()), bg, maxContrast, false);
    }
    return ci.hexa();
  } catch {
    return safeHex(color);
  }
}

export interface SmoothSaturationOptions {
  /**
   * How far to move toward the reference saturation (0 = no change, 1 = match
   * exactly). Default: 0.5
   */
  amount?: number;
  /**
   * Maximum absolute saturation delta allowed, regardless of `amount`.
   * Default: 18 (percentage points)
   */
  maxDelta?: number;
}

/**
 * Nudge the HSL saturation of `color` toward the saturation of `reference`
 * by `amount`, capped at `maxDelta` percentage points.
 */
export function smoothSaturation(
  color: ColorInput,
  reference: ColorInput,
  { amount = 0.5, maxDelta = 18 }: SmoothSaturationOptions = {},
): string {
  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
  try {
    const current = toColorInstance(color).hsl();
    const target = toColorInstance(reference).hsl();
    const curSat = current.saturationl();
    const tgtSat = target.saturationl();
    if (Number.isNaN(curSat) || Number.isNaN(tgtSat)) return current.hexa();
    const delta = clamp((tgtSat - curSat) * clamp(amount, 0, 1), -Math.abs(maxDelta), Math.abs(maxDelta));
    return current.saturationl(clamp(curSat + delta, 0, 100)).hexa();
  } catch {
    return safeHex(color);
  }
}

/** Set `color`'s saturation to exactly match `reference` */
export function matchSaturation(color: ColorInput, reference: ColorInput): string {
  return smoothSaturation(color, reference, { amount: 1, maxDelta: 100 });
}

export interface MkColorOptions {
  /**
   * Surface color the derived color appears on.
   * Determines contrast direction and saturation smoothing target.
   */
  background: ColorInput;
  /**
   * Readable foreground of the surface; used as the anchor when boosting
   * contrast.
   */
  foreground: ColorInput;
  /**
   * Target alpha for the output color (0–1). Default: 1 (fully opaque)
   */
  alpha?: number;
  /** Saturation smoothing toward a reference. Default: 0.12 toward foreground */
  saturation?: SmoothSaturationOptions & { reference?: ColorInput };
  /** Contrast clamping. Defaults: min 2.6, max 7.5 */
  contrast?: ClampContrastOptions;
}

/**
 * Derive a single themed color from a base color, softened toward its
 * surrounding surface and contrast-clamped so it stays readable without
 * looking harsher than the rest of the theme.
 *
 * @example
 * const errorFg = mkColor(error, {
 *   background,
 *   foreground,
 *   contrast: { minContrast: 2.4, maxContrast: 6.4 },
 * });
 */
export function mkColor(
  color: ColorInput,
  {
    background,
    foreground,
    alpha = 1,
    saturation: satOpts,
    contrast: contrastOpts,
  }: MkColorOptions,
): string {
  const base = toColorInstance(color).hsl();
  const hue = base.hue();
  const sat = base.saturationl();
  const light = base.lightness();

  const satRef = satOpts?.reference ?? foreground;
  const satAmount = satOpts?.amount ?? 0.12;
  const satMaxDelta = satOpts?.maxDelta !== undefined ? satOpts.maxDelta : 100;
  const fgSat = toColorInstance(satRef).hsl().saturationl();
  const rawDelta = (fgSat - sat) * satAmount;
  const clampedDelta = Math.max(-satMaxDelta, Math.min(satMaxDelta, rawDelta));
  const softSat = sat + clampedDelta;

  const tone = hslTone(hue, softSat, light, alpha);
  return clampContrast(tone, background, foreground, contrastOpts);
}

export interface MkElementOptions {
  /**
   * Surface the element chip appears on.
   * Drives lightness blending and saturation smoothing for all three outputs.
   */
  background: ColorInput;
  /**
   * Default readable foreground for the surface; used as the contrast anchor.
   */
  foreground: ColorInput;
  /** Per-slot overrides — sensible defaults are applied for each slot. */
  bg?: {
    /** Alpha of the tinted background chip. Default: 0.32 */
    alpha?: number;
    /** Saturation multiplier relative to the base color. Default: 0.85 */
    saturationScale?: number;
    contrast?: ClampContrastOptions;
  };
  fg?: {
    /**
     * How far to pull saturation toward the foreground (0–1). Default: 0.12
     */
    saturationBlend?: number;
    contrast?: ClampContrastOptions;
  };
  border?: {
    /** Alpha of the border. Default: 0.88 */
    alpha?: number;
    /** Saturation blend toward foreground. Default: 0.12 */
    saturationBlend?: number;
    contrast?: ClampContrastOptions;
  };
}

/**
 * Derive background, foreground, and border colors from a base status color
 * (info, warning, success, error). Each slot is softened to fit the
 * surrounding surface, then contrast-clamped so it stays readable without
 * looking harsher than the rest of the theme.
 *
 * @example
 * const errorEl = mkElementColors(error, {
 *   background,
 *   foreground,
 *   bg: { alpha: 0.2 },
 *   fg: { contrast: { minContrast: 3, maxContrast: 6 } },
 * });
 */
export function mkElementColors(
  color: ColorInput,
  {
    background,
    foreground,
    bg: bgOpts = {},
    fg: fgOpts = {},
    border: borderOpts = {},
  }: MkElementOptions,
): ElementColors {
  const base = toColorInstance(color).hsl();
  const fgRef = toColorInstance(foreground).hsl();
  const hue = base.hue();
  const sat = base.saturationl();
  const light = base.lightness();
  const fgSat = fgRef.saturationl();

  const {
    alpha: bgAlpha = 0.32,
    saturationScale: bgSatScale = 0.85,
    contrast: bgContrast = { minContrast: 1.06, maxContrast: 1.8 },
  } = bgOpts;

  const {
    saturationBlend: fgSatBlend = 0.12,
    contrast: fgContrast = { minContrast: 2.6, maxContrast: 7.5 },
  } = fgOpts;

  const {
    alpha: borderAlpha = 0.88,
    saturationBlend: borderSatBlend = 0.12,
    contrast: borderContrast = { minContrast: 1.4, maxContrast: 5.5 },
  } = borderOpts;

  const softSat = sat - (sat - fgSat) * fgSatBlend;
  const borderSoftSat = sat - (sat - fgSat) * borderSatBlend;

  const fg = clampContrast(
    hslTone(hue, softSat, light),
    background, foreground, fgContrast,
  );

  const bg = clampContrast(
    hslTone(hue, sat * bgSatScale, light, bgAlpha),
    background, foreground, bgContrast,
  );

  const border = clampContrast(
    hslTone(hue, borderSoftSat, light, borderAlpha),
    background, foreground, borderContrast,
  );

  return { bg, fg, border };
}