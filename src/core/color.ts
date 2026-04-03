import ColorJS from "colorjs.io";

// ============================================================================
// Core Color Type
// ============================================================================

/**
 * A color value - either a hex string or a Color instance.
 * Use this throughout theme definitions. Resolved to hex at build time.
 */
export type ColorLike = string | Color;

interface OklchChannels {
  l: number; // 0..1
  c: number; // >= 0
  h: number; // 0..360
  alpha: number; // 0..1
}

interface HslChannels {
  h: number;
  s: number; // 0..100
  l: number; // 0..100
  alpha: number; // 0..1
}

type OklchInput = Partial<Pick<OklchChannels, "l" | "c" | "h" | "alpha">> & {
  l: number;
  c: number;
};

type ColorInstance = ColorJS;
const colorUtil = ColorJS.util;

function clamp(value: number, min: number, max: number): number {
  return colorUtil.clamp(min, value, max);
}

function normHue(h: number | undefined): number {
  if (h === undefined || Number.isNaN(h)) return 0;
  const normalized = h % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

function normalizeOklch(channels: OklchInput): OklchChannels {
  return {
    l: clamp(channels.l, 0, 1),
    c: Math.max(0, channels.c),
    h: normHue(channels.h),
    alpha: clamp(channels.alpha ?? 1, 0, 1),
  };
}

function oklchInstance(channels: OklchInput): ColorInstance {
  const normalized = normalizeOklch(channels);
  return new ColorJS(
    "oklch",
    [normalized.l, normalized.c, normalized.h],
    normalized.alpha,
  );
}

function toHslChannels(input: string | ColorInstance | Color | OklchInput): HslChannels {
  const base =
    input instanceof Color
      ? input.cv
      : isOklchInput(input)
        ? oklchInstance(input)
        : typeof input === "string"
          ? new ColorJS(input)
          : input;
  const hsl = base.to("hsl");
  const [h, s, l] = hsl.coords;
  return {
    h: normHue(h ?? 0),
    s: clamp(s ?? 0, 0, 100),
    l: clamp(l ?? 0, 0, 100),
    alpha: clamp(hsl.alpha ?? 1, 0, 1),
  };
}

function isOklchInput(value: unknown): value is OklchInput {
  return (
    typeof value === "object" &&
    value !== null &&
    "l" in value &&
    "c" in value &&
    typeof (value as { l: unknown }).l === "number" &&
    typeof (value as { c: unknown }).c === "number"
  );
}

function toOklchChannels(input: string | ColorInstance | Color | OklchInput): OklchChannels {
  if (input instanceof Color) {
    return { ...input.oklch() };
  }
  if (isOklchInput(input)) {
    return normalizeOklch(input);
  }
  const base =
    colorUtil.isString(input) ? new ColorJS(input) : input;
  const converted = base.to("oklch");
  const [l, c, h] = converted.coords;
  return normalizeOklch({
    l: l ?? 0,
    c: c ?? 0,
    h: h ?? 0,
    alpha: converted.alpha,
  });
}

function renderOklch(channels: OklchChannels): string {
  try {
    return oklchInstance(channels).toString({ format: "hex", collapse: false, alpha: true });
  } catch {
    return "#000000ff";
  }
}

/**
 * Normalize any color string to 8-digit hexa (#RRGGBBAA) format.
 * Passes through empty strings and non-color values unchanged.
 */
function normalizeHexa(value: string): string {
  if (!value) return value;
  try {
    return new ColorJS(value).toString({ format: "hex", collapse: false, alpha: true });
  } catch {
    return value;
  }
}

/**
 * Resolve any ColorLike value to an 8-digit hexa string (#RRGGBBAA).
 */
export function toHex(value: unknown): string {
  if (colorUtil.isString(value)) return normalizeHexa(value);
  if (value instanceof Color) return value.render();
  try {
    const v = value as { [key: string]: unknown };
    if (v == null) return "";
    if (typeof v.render === "function") {
      return normalizeHexa(String((v.render as () => string)()));
    }
    if (typeof v.hexa === "function") return v.hexa();
    if (typeof v.hex === "function") return normalizeHexa(v.hex());
    if (v.cv && typeof (v.cv as { hexa?: unknown }).hexa === "function") {
      return (v.cv as { hexa: () => string }).hexa();
    }
    if (v.cv && typeof (v.cv as { hex?: unknown }).hex === "function") {
      return normalizeHexa((v.cv as { hex: () => string }).hex());
    }
    if (typeof v.toString === "function") return normalizeHexa(v.toString());
  } catch {
    // fallthrough
  }
  return normalizeHexa(String(value));
}

// ============================================================================
// Color Class
// ============================================================================

export class Color {
  cv: ColorInstance;
  private channels: OklchChannels;

  constructor(input: string | ColorInstance | Color | OklchInput) {
    this.channels = toOklchChannels(input);
    this.cv = oklchInstance(this.channels);
  }

  // --- Core transforms (all return Color for chaining) ---

  lighter(n = 0.2): Color {
    const weight = clamp(n, 0, 1);
    return new Color({
      ...this.channels,
      l: this.channels.l + (1 - this.channels.l) * weight,
    });
  }
  darker(n = 0.2): Color {
    const weight = clamp(n, 0, 1);
    return new Color({
      ...this.channels,
      l: this.channels.l * (1 - weight),
    });
  }
  transparent(amount = 0.5): Color {
    return new Color({ ...this.channels, alpha: clamp(amount, 0, 1) });
  }
  alpha(amount: number): Color {
    return new Color({ ...this.channels, alpha: clamp(amount, 0, 1) });
  }
  lightness(amount: number): Color {
    const normalized = amount > 1 ? amount / 100 : amount;
    return new Color({ ...this.channels, l: clamp(normalized, 0, 1) });
  }
  rotate(degrees = 30): Color {
    return new Color({
      ...this.channels,
      h: normHue(this.channels.h + degrees),
    });
  }
  saturate(amount = 0.2): Color {
    const factor = 1 + amount;
    return new Color({
      ...this.channels,
      c: Math.max(0, this.channels.c * factor),
    });
  }
  desaturate(amount = 0.2): Color {
    const factor = 1 - clamp(amount, 0, 1);
    return new Color({
      ...this.channels,
      c: Math.max(0, this.channels.c * factor),
    });
  }

  // --- Mixing ---

  /** Mix this color with another by weight (0 = all this, 1 = all other) */
  mix(other: Color | string, weight = 0.5): Color {
    const t = clamp(weight, 0, 1);
    const right = other instanceof Color ? other.cv : new ColorJS(other);
    return new Color(this.cv.mix(right, t, { space: "oklch" }));
  }

  // --- Accent generation ---

  /** Mix toward a target color, then optionally lighten */
  accent(target: Color | string, mixAmt = 0.1, lightenAmt = 0.1): Color {
    return this.mix(target, mixAmt).lighter(lightenAmt);
  }

  /** Generate a warm accent (rotate toward orange/red) */
  warm(intensity = 0.15): Color {
    return this.rotate(-20).saturate(intensity).lighter(intensity * 0.5);
  }

  /** Generate a cool accent (rotate toward blue/cyan) */
  cool(intensity = 0.15): Color {
    return this.rotate(20).saturate(intensity).lighter(intensity * 0.5);
  }

  /** Generate a complementary accent */
  complement(): Color {
    return this.rotate(180);
  }

  /** Generate an analogous set (±30°) */
  analogous(): [Color, Color] {
    return [this.rotate(-30), this.rotate(30)];
  }

  // --- Channel accessors (for filter support) ---

  luminosity(amount: number): Color {
    return new Color({
      ...this.channels,
      l: clamp(amount > 1 ? amount / 100 : amount, 0, 1),
    });
  }
  l(): number { return this.channels.l * 100; }
  red(): number {
    const [r] = this.cv.to("srgb").coords;
    return Math.round(clamp((r ?? 0) * 255, 0, 255));
  }
  green(): number {
    const [, g] = this.cv.to("srgb").coords;
    return Math.round(clamp((g ?? 0) * 255, 0, 255));
  }
  blue(): number {
    const [, , b] = this.cv.to("srgb").coords;
    return Math.round(clamp((b ?? 0) * 255, 0, 255));
  }

  oklch(): OklchChannels {
    return { ...this.channels };
  }

  hsl(): HslChannels {
    return toHslChannels(this);
  }

  set(...args: Parameters<ColorJS["set"]>): Color {
    const c = this.cv.clone().set(...args);
    return oklch(c.coords[0] ?? 0, c.coords[1] ?? 0, c.coords[2] ?? 0, c.alpha ?? 1);
  }

  static fromHsl(channels: HslChannels): Color {
    const color = new ColorJS(
      "hsl",
      [normHue(channels.h), clamp(channels.s, 0, 100), clamp(channels.l, 0, 100)],
      clamp(channels.alpha, 0, 1),
    );
    const inOklch = color.to("oklch");
    const [l = 0, c = 0, h = 0] = inOklch.coords;
    return oklch(l ?? 0, c ?? 0, h ?? 0, inOklch.alpha ?? 1);
  }

  static fromOklch(channels: OklchInput): Color {
    return oklch(channels.l, channels.c, channels.h ?? 0, channels.alpha ?? 1);
  }

  static create(input: string | ColorInstance | Color | OklchInput): Color {
    return new Color(input);
  }

  // --- Output ---

  hex(): string {
    const rendered = this.render();
    return rendered.slice(0, 7);
  }
  hexa(): string {
    return this.render();
  }
  render(): string {
    return renderOklch(this.channels);
  }

  /** Allows Color instances to work in string contexts (template literals, etc.) */
  toString(): string {
    return this.render();
  }

  /** Allows Color to serialize to hexa in JSON.stringify */
  toJSON(): string {
    return this.render();
  }

  /** Allows Color to coerce to string in loose comparisons */
  valueOf(): string {
    return this.render();
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
export function c(input: ColorInput): Color {
  return new Color(input);
}

/** Build a Color directly from numeric OKLCH channels. */
export function oklch(l: number, c: number, h = 0, alpha = 1): Color {
  return new Color({ l, c, h, alpha });
}
export const lch = oklch;

/** Convert an object of hex strings into an object of Color instances */
export function makeColors<T extends object>(palette: T): { [K in keyof T]: Color } {
  const result = {} as { [K in keyof T]: Color };
  for (const key in palette) {
    const val = palette[key];
    if (typeof val === "string" || val instanceof Color || isOklchInput(val)) {
      result[key as keyof T] = new Color(val);
    }
  }
  return result;
}

// ============================================================================
// Color derivation utilities
// ============================================================================

export type ColorInput = string | Color | ColorInstance | OklchInput;
export type ElementColors = {
  background: string;
  foreground: string;
  border: string;
  // backwars compatibility
  bg?: string;
  fg?: string;
};

export function toColorInstance(color: ColorInput): ColorInstance {
  if (color instanceof Color) {
    return color.cv;
  }
  if (isOklchInput(color)) {
    return oklch(color.l, color.c, color.h ?? 0, color.alpha ?? 1).cv;
  }
  if (colorUtil.isString(color)) {
    return new ColorJS(color);
  }
  return (color as ColorInstance).clone();
}

export function safeHex(color: ColorInput): string {
  try {
    return normalizeHexa(toColorInstance(color).toString({ format: "hex" }));
  } catch {
    return String(color);
  }
}

/** Build a full hexa string from HSL components + alpha */
export function hslTone(hue: number, saturation: number, lightness: number, alpha = 1): string {
  return normalizeHexa(
    new ColorJS(
      "hsl",
      [hue, clamp(saturation, 0, 100), clamp(lightness, 0, 100)],
      clamp(alpha, 0, 1),
    ).toString({ format: "hex" }),
  );
}

/** Build a full hexa string from OKLCH components + alpha. */
export function oklchTone(lightness: number, chroma: number, hue: number, alpha = 1): string {
  return oklch(
    clamp(lightness, 0, 1),
    Math.max(0, chroma),
    hue,
    clamp(alpha, 0, 1),
  ).render();
}

/** Alpha-correct composite of semi-transparent foreground over opaque background */
export function compositeOver(foreground: ColorInstance, background: ColorInstance): ColorInstance {
  const fgSrgb = foreground.to("srgb");
  const bgSrgb = background.to("srgb");
  const [fgr = 0, fgg = 0, fgb = 0] = fgSrgb.coords;
  const [bgr = 0, bgg = 0, bgb = 0] = bgSrgb.coords;
  const fgrN = fgr ?? 0;
  const fggN = fgg ?? 0;
  const fgbN = fgb ?? 0;
  const bgrN = bgr ?? 0;
  const bggN = bgg ?? 0;
  const bgbN = bgb ?? 0;
  const fgA = clamp(fgSrgb.alpha ?? 1, 0, 1);
  const bgA = clamp(bgSrgb.alpha ?? 1, 0, 1);
  const outA = fgA + bgA * (1 - fgA);
  if (outA <= 0) return new ColorJS("srgb", [0, 0, 0], 0);
  const ch = (f: number, b: number) =>
    (f * fgA + b * bgA * (1 - fgA)) / outA;
  return new ColorJS("srgb", [
    clamp(ch(fgrN, bgrN), 0, 1),
    clamp(ch(fggN, bggN), 0, 1),
    clamp(ch(fgbN, bgbN), 0, 1),
  ], outA);
}

/**
 * WCAG contrast ratio of `color` as it visually appears on `background`,
 * accounting for any alpha transparency.
 */
export function effectiveContrast(color: ColorInput, background: ColorInput): number {
  try {
    const fg = toColorInstance(color);
    const bg = toColorInstance(background).clone().set({ alpha: () => 1 });
    const visible = compositeOver(fg, bg).set({ alpha: () => 1 });
    return visible.contrast(bg, "WCAG21");
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
  const bi = toColorInstance(background).clone().set({ alpha: () => 1 });
  let lo = 0;
  let hi = 1;
  let best = ci;
  for (let i = 0; i < 12; i++) {
    const mid = (lo + hi) / 2;
    const trial = ci.mix(ai, mid);
    const visible = compositeOver(trial, bi).set({ alpha: () => 1 });
    const contrast = visible.contrast(bi, "WCAG21");
    if (seekMinimum ? contrast >= targetContrast : contrast <= targetContrast) {
      best = trial;
      hi = mid;
    } else {
      lo = mid;
    }
  }
  return normalizeHexa(best.toString({ format: "hex" }));
}

export interface ClampContrastOptions {
  /** Minimum contrast ratio against background (default: 2.6) */
  minContrast?: number;
  /** Maximum contrast ratio against background (default: 7.5) */
  maxContrast?: number;
}

/**
 * Prevent overly bright colors
 *
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
    const bg = toColorInstance(background).clone().set({ alpha: () => 1 });
    const fg = toColorInstance(foreground).clone().set({ alpha: () => ci.alpha });
    const visible = compositeOver(ci, bg).set({ alpha: () => 1 });
    const contrast = visible.contrast(bg, "WCAG21");
    if (contrast < minContrast) {
      return blendTowardContrast(ci, fg, bg, minContrast, true);
    }
    if (contrast > maxContrast) {
      const bgAlpha = bg.clone().set({ alpha: () => ci.alpha });
      return blendTowardContrast(ci, bgAlpha, bg, maxContrast, false);
    }
    return normalizeHexa(ci.toString({ format: "hex" }));
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
  try {
    const current = new Color(safeHex(color)).oklch();
    const target = new Color(safeHex(reference)).oklch();
    const blend = clamp(amount, 0, 1);
    const maxChromaDelta = Math.abs(maxDelta) / 100;
    const delta = clamp((target.c - current.c) * blend, -maxChromaDelta, maxChromaDelta);
    return oklch(
      current.l,
      Math.max(0, current.c + delta),
      current.h,
      current.alpha,
    ).render();
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
type LCHTransform = {
  l?: (l: number) => number;
  c?: (c: number) => number;
  h?: (h: number) => number;
  alpha?: (alpha: number) => number;
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
  const base = new Color(safeHex(color)).oklch();

  const satRef = satOpts?.reference ?? foreground;
  const satAmount = satOpts?.amount ?? 0.12;
  const satMaxDelta = satOpts?.maxDelta !== undefined ? satOpts.maxDelta : 100;
  const fgRef = new Color(safeHex(satRef)).oklch();
  const rawDelta = (fgRef.c - base.c) * satAmount;
  const maxChromaDelta = satMaxDelta / 100;
  const clampedDelta = clamp(rawDelta, -Math.abs(maxChromaDelta), Math.abs(maxChromaDelta));
  const softChroma = Math.max(0, base.c + clampedDelta);

  const tone = oklchTone(base.l, softChroma, base.h, alpha);
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
    transform?: LCHTransform;
  };
  fg?: {
    /**
     * How far to pull saturation toward the foreground (0–1). Default: 0.12
     */
    saturationBlend?: number;
    /** Alpha of the foreground. Default: 1.0 (opaque) */
    alpha?: number;
    contrast?: ClampContrastOptions;
    transform?: LCHTransform;
  };
  border?: {
    /** Alpha of the border. Default: 0.88 */
    alpha?: number;
    /** Saturation blend toward foreground. Default: 0.12 */
    saturationBlend?: number;
    contrast?: ClampContrastOptions;
    transform?: LCHTransform;
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
  const base = new Color(safeHex(color)).oklch();
  const fgRef = new Color(safeHex(foreground)).oklch();

  const {
    alpha: bgAlpha = 0.32,
    saturationScale: bgSatScale = 0.85,
    contrast: bgContrast = { minContrast: 1.06, maxContrast: 1.8 },
  } = bgOpts;

  const {
    saturationBlend: fgSatBlend = 0.12,
    alpha: fgAlpha = 1,
    contrast: fgContrast = { minContrast: 2.6, maxContrast: 7.5 },
  } = fgOpts;

  const {
    alpha: borderAlpha = 0.88,
    saturationBlend: borderSatBlend = 0.12,
    contrast: borderContrast = { minContrast: 1.4, maxContrast: 5.5 },
  } = borderOpts;

  const softChroma = base.c - (base.c - fgRef.c) * fgSatBlend;
  const borderSoftChroma = base.c - (base.c - fgRef.c) * borderSatBlend;

  const fg = fgOpts.transform
    ? Color.create(base).set({
      l: fgOpts.transform.l ? fgOpts.transform.l(fgRef.l) : fgRef.l,
      c: fgOpts.transform.c ? fgOpts.transform.c(fgRef.c) : fgRef.c,
      h: fgOpts.transform.h ? fgOpts.transform.h(fgRef.h) : fgRef.h,
    }).alpha(fgOpts.alpha ?? 1).render()
    : clampContrast(
      oklchTone(base.l, softChroma, base.h, fgAlpha),
      background, foreground, fgContrast,
    );

  const bg = bgOpts.transform
    ? Color.create(base).set({
      l: bgOpts.transform.l ? bgOpts.transform.l(base.l) : base.l,
      c: bgOpts.transform.c ? bgOpts.transform.c(base.c) : base.c,
      h: bgOpts.transform.h ? bgOpts.transform.h(base.h) : base.h,
    }).alpha(bgOpts.alpha ?? 1).render()
    : clampContrast(
      oklchTone(base.l, Math.max(0, base.c * bgSatScale), base.h, bgAlpha),
      background, foreground, bgContrast,
    );

  const border = borderOpts.transform
    ? Color.create(base).set({
      l: borderOpts.transform.l ? borderOpts.transform.l(base.l) : base.l * 1.02,
      c: borderOpts.transform.c ? borderOpts.transform.c(base.c) : base.c * 0.77,
      h: borderOpts.transform.h ? borderOpts.transform.h(base.h) : base.h,
    }).alpha(borderOpts.alpha ?? 1).render()
    : clampContrast(
      oklchTone(base.l, Math.max(0, borderSoftChroma), base.h, borderAlpha),
      background, foreground, borderContrast,
    );

  return {
    background: bg,
    foreground: fg,
    border,
    bg,
    fg
  };
}