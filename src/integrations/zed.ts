/**
 * Zed integration - maps ThemeDefinition to Zed theme format
 *
 * This is the only place that knows about Zed's format.
 * It reads from ThemeDefinition and produces Zed JSON.
 */

import type { ThemeDefinition, ThemeDefinitionExtended } from "../themes/types";
import {
  strictColorFactory,
  get,
} from "../themes/types";
import type { ThemeFilters } from "../filters";
import {
  Color,
  type ColorInput,
  type ElementColors,
  mkColor,
  mkElementColors,
} from '../core/color';
import { darken, mix } from '../themes/utils';

// ============================================================================
// Zed Theme Output Types
// ============================================================================

export interface ZedSyntaxStyle {
  color?: string;
  font_style?: "italic" | "normal";
  font_weight?: number;
}

export interface ZedPlayer {
  cursor: string;
  background: string;
  selection: string;
}

export interface ZedThemeStyle {
  "background.appearance": "opaque" | "blurred";
  accents: string[];
  background: string;

  // Borders
  border: string;
  "border.variant": string;
  "border.focused": string;
  "border.selected": string;
  "border.transparent": string;
  "border.disabled": string;

  // Surfaces
  "elevated_surface.background": string;
  "surface.background": string;

  // Elements
  "element.background": string;
  "element.hover": string;
  "element.active": string;
  "element.selected": string;
  "element.disabled": string;
  "drop_target.background": string;
  "ghost_element.background": string;
  "ghost_element.hover": string;
  "ghost_element.active": string;
  "ghost_element.selected": string;
  "ghost_element.disabled": string;

  // Text
  text: string;
  "text.muted": string;
  "text.placeholder": string;
  "text.disabled": string;
  "text.accent": string;

  // Icons
  icon: string;
  "icon.muted": string;
  "icon.disabled": string;
  "icon.placeholder": string;
  "icon.accent": string;

  // UI Components
  "status_bar.background": string;
  "title_bar.background": string;
  "title_bar.inactive_background": string;
  "toolbar.background": string;
  "tab_bar.background": string;
  "tab.inactive_background": string;
  "tab.active_background": string;
  "search.match_background": string;
  "search.active_match_background": string;
  "panel.background": string;
  "panel.focused_border": string | null;
  "panel.indent_guide": string;
  "panel.indent_guide_active": string;
  "panel.indent_guide_hover": string;
  "pane.focused_border": string | null;
  "pane_group.border": string;

  // Scrollbar
  "scrollbar.thumb.background": string;
  "scrollbar.thumb.hover_background": string;
  "scrollbar.thumb.border": string;
  "scrollbar.track.background": string;
  "scrollbar.track.border": string;

  // Editor
  "editor.foreground": string;
  "editor.background": string;
  "editor.gutter.background": string;
  "editor.subheader.background": string;
  "editor.active_line.background": string;
  "editor.highlighted_line.background": string;
  "editor.line_number": string;
  "editor.active_line_number": string;
  "editor.hover_line_number": string;
  "editor.invisible": string;
  "editor.wrap_guide": string;
  "editor.active_wrap_guide": string;
  "editor.indent_guide": string;
  "editor.indent_guide_active": string;
  "editor.document_highlight.read_background": string;
  "editor.document_highlight.write_background": string;
  "editor.document_highlight.bracket_background": string;

  // Terminal
  "terminal.background": string;
  "terminal.ansi.background": string;
  "terminal.foreground": string;
  "terminal.bright_foreground": string;
  "terminal.dim_foreground": string;
  "terminal.ansi.black": string;
  "terminal.ansi.bright_black": string;
  "terminal.ansi.dim_black": string;
  "terminal.ansi.red": string;
  "terminal.ansi.bright_red": string;
  "terminal.ansi.dim_red": string;
  "terminal.ansi.green": string;
  "terminal.ansi.bright_green": string;
  "terminal.ansi.dim_green": string;
  "terminal.ansi.yellow": string;
  "terminal.ansi.bright_yellow": string;
  "terminal.ansi.dim_yellow": string;
  "terminal.ansi.blue": string;
  "terminal.ansi.bright_blue": string;
  "terminal.ansi.dim_blue": string;
  "terminal.ansi.magenta": string;
  "terminal.ansi.bright_magenta": string;
  "terminal.ansi.dim_magenta": string;
  "terminal.ansi.cyan": string;
  "terminal.ansi.bright_cyan": string;
  "terminal.ansi.dim_cyan": string;
  "terminal.ansi.white": string;
  "terminal.ansi.bright_white": string;
  "terminal.ansi.dim_white": string;

  // Links & Status
  "link_text.hover": string;

  // Version Control
  "version_control.added": string;
  "version_control.modified": string;
  "version_control.deleted": string;
  "version_control.word_added": string;
  "version_control.word_deleted": string;
  "version_control.conflict_marker.ours": string;
  "version_control.conflict_marker.theirs": string;

  conflict: string;
  "conflict.background": string;
  "conflict.border": string;
  created: string;
  "created.background": string;
  "created.border": string;
  deleted: string;
  "deleted.background": string;
  "deleted.border": string;
  error: string;
  "error.background": string;
  "error.border": string;
  hidden: string;
  "hidden.background": string;
  "hidden.border": string;
  hint: string;
  "hint.background": string;
  "hint.border": string;
  ignored: string;
  "ignored.background": string;
  "ignored.border": string;
  info: string;
  "info.background": string;
  "info.border": string;
  modified: string;
  "modified.background": string;
  "modified.border": string;
  predictive: string;
  "predictive.background": string;
  "predictive.border": string;
  renamed: string;
  "renamed.background": string;
  "renamed.border": string;
  success: string;
  "success.background": string;
  "success.border": string;
  unreachable: string;
  "unreachable.background": string;
  "unreachable.border": string;
  warning: string;
  "warning.background": string;
  "warning.border": string;

  players: ZedPlayer[];
  syntax: Record<string, ZedSyntaxStyle>;
}

export interface ZedTheme {
  name: string;
  appearance: "dark" | "light";
  style: ZedThemeStyle;
}

export interface ZedThemeFile {
  $schema: string;
  name: string;
  author: string;
  themes: ZedTheme[];
}

export interface BuildOptions {
  /** Override filters (will merge with/override theme.filters) */
  filters?: ThemeFilters;
  /** Author name for the theme file */
  author?: string;
  /** Clamp all generated Zed colors to this max saturation (0..1) */
  maxSaturation?: number;
  /** Base color used to compute tuned saturated colors */
  saturatedBaseColor?: string;
  /** Number of computed saturated colors */
  saturatedColorCount?: number;
  /** Hue step between computed saturated colors (degrees) */
  saturatedHueStep?: number;
  /** Target saturation for computed saturated colors (0..1) */
  saturatedSaturation?: number;
  /** Target lightness for computed saturated colors (0..1) */
  saturatedLightness?: number;
  /** Max saturation for red-ish hues (0..1), applied after global cap */
  redMaxSaturation?: number;
  /** Hue center for "red-ish" detection in degrees */
  redHueCenter?: number;
  /** Hue window around the red center in degrees */
  redHueWindow?: number;
  /** Ensure red-ish colors don't get too dark (0..1) */
  redMinLightness?: number;
}

// ============================================================================
// Helper functions
// ============================================================================

/**
 * Add alpha transparency to a color
 */
function withAlpha(color: string, alpha: number): string {
  try {
    return new Color(color).alpha(alpha).hexa();
  } catch {
    return color;
  }
}

/**
 * Lighten a color
 */
function lighten(color: string, amount: number): string {
  try {
    return new Color(color).lighter(amount).hexa();
  } catch {
    return color;
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function capSaturation(color: string, maxSaturation: number): string {
  try {
    const maxSatPercent = clamp(maxSaturation, 0, 1) * 100;
    const hsl = new Color(color).cv.hsl();
    const currentSat = hsl.saturationl();
    if (Number.isNaN(currentSat) || currentSat <= maxSatPercent) {
      return hsl.hexa();
    }
    return hsl.saturationl(maxSatPercent).hexa();
  } catch {
    return color;
  }
}

function applySaturationCap<T>(value: T, maxSaturation: number): T {
  if (typeof value === "string") {
    return capSaturation(value, maxSaturation) as T;
  }
  if (Array.isArray(value)) {
    return value.map((entry) => applySaturationCap(entry, maxSaturation)) as T;
  }
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(obj)) {
      out[key] = applySaturationCap(entry, maxSaturation);
    }
    return out as T;
  }
  return value;
}

function buildTunedSaturatedColors(
  baseColor: string,
  count = 6,
  hueStep = 26,
  targetSaturation = 0.72,
  targetLightness = 0.67,
): string[] {
  const safeCount = Math.max(3, Math.floor(count));
  const center = (safeCount - 1) / 2;
  const sat = clamp(targetSaturation, 0, 1) * 100;
  const base = new Color(baseColor).cv.hsl();
  const baseHue = base.hue();

  return Array.from({ length: safeCount }, (_, i) => {
    const offset = i - center;
    const hue = (baseHue + offset * hueStep + 360) % 360;
    const lightness = clamp(targetLightness + offset * 0.025, 0.42, 0.82) * 100;
    return base.hue(hue).saturationl(sat).lightness(lightness).hexa();
  });
}

function angularDistance(a: number, b: number): number {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}

function capHueBand(
  color: string,
  centerHue: number,
  hueWindow: number,
  maxSaturation?: number,
  minLightness?: number,
): string {
  try {
    const hsl = new Color(color).cv.hsl();
    const hue = hsl.hue();
    if (Number.isNaN(hue)) return hsl.hexa();
    if (angularDistance(hue, centerHue) > hueWindow) return hsl.hexa();

    let next = hsl;
    if (maxSaturation !== undefined) {
      const satCap = clamp(maxSaturation, 0, 1) * 100;
      if (next.saturationl() > satCap) {
        next = next.saturationl(satCap);
      }
    }
    if (minLightness !== undefined) {
      const lightFloor = clamp(minLightness, 0, 1) * 100;
      if (next.lightness() < lightFloor) {
        next = next.lightness(lightFloor);
      }
    }
    return next.hexa();
  } catch {
    return color;
  }
}

function applyHueBandCap<T>(
  value: T,
  centerHue: number,
  hueWindow: number,
  maxSaturation?: number,
  minLightness?: number,
): T {
  if (typeof value === "string") {
    return capHueBand(value, centerHue, hueWindow, maxSaturation, minLightness) as T;
  }
  if (Array.isArray(value)) {
    return value.map((entry) =>
      applyHueBandCap(entry, centerHue, hueWindow, maxSaturation, minLightness),
    ) as T;
  }
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(obj)) {
      out[key] = applyHueBandCap(entry, centerHue, hueWindow, maxSaturation, minLightness);
    }
    return out as T;
  }
  return value;
}

/** Convenience alias — delegates to mkElementColors from core/color. */
function mkElement(
  color: ColorInput,
  background: ColorInput,
  foreground: ColorInput,
): ElementColors {
  return mkElementColors(color, { background, foreground });
}

// ============================================================================
// Mapping function
// ============================================================================

/**
 * Build Zed theme style from ThemeDefinition
 */
function buildStyle(
  t: ThemeDefinitionExtended,
  c: ReturnType<typeof strictColorFactory<ThemeDefinition<string>>>,
  options: BuildOptions,
): ZedThemeStyle {
  // Get colors from theme
  const background = c("ui.backgrounds.base", "background");
  const surface = c("ui.backgrounds.surface", "background");
  const raised = c("ui.backgrounds.raised", "ui.backgrounds.surface", "background");
  const darker = c("ui.backgrounds.darker", "ui.backgrounds.surface", "ui.backgrounds.base", "background");
  const hoverSurface = c("ui.hoverWidget.background", "ui.backgrounds.overlay", "ui.backgrounds.raised");
  const menuBackground = c("ui.menu.background", "ui.backgrounds.raised", "ui.backgrounds.surface");
  const elementBackground = c("ui.elements.background", "ui.menu.background", "ui.backgrounds.darker", "ui.backgrounds.surface");
  const elementHover = c("ui.elements.hover", "ui.hoverWidget.background", "ui.menu.selectionBackground", "ui.backgrounds.raised");
  const elementActive = c("ui.elements.active", "ui.menu.selectionBackground", "ui.backgrounds.raised");
  const elementSelected = c("ui.elements.selected", "ui.menu.selectionBackground", "ui.backgrounds.raised");

  const fgLuminance = (new Color(c("ui.foregrounds.default"))).l();
  const foreground = fgLuminance > 0.5
      ? c("ui.foregrounds.default")
      : lighten(c("ui.foregrounds.default"), 0.5);
  const muted = c("ui.foregrounds.muted");
  const subtle = c("ui.foregrounds.subtle", "ui.foregrounds.muted");
  const accent = c("ui.foregrounds.accent", "ui.accent.primary");

  const borderDefault = c("ui.borders.default");
  const borderActive = c("ui.borders.active", "ui.borders.default");
  const borderSubtle = c("ui.borders.subtle", "ui.borders.default");

  const error = c("ui.status.error");
  const warning = c("ui.status.warning");
  const info = c("ui.status.info");
  const success = c("ui.status.success");
  const infoel = mkElementColors(info, {
    background,
    foreground,
    fg: { saturationBlend: 0.2, contrast: { minContrast: 4, maxContrast: 10 } },
    bg: { alpha: 0.12, saturationScale: 0.9, contrast: { minContrast: 0, maxContrast: 4 } },
    border: { contrast: { minContrast: 3, maxContrast: 10 } },
  });
  const warningel = mkElementColors(warning, {
    background,
    foreground,
    // fg: { contrast: { minContrast: 3, maxContrast: 6 } },
    // bg: { alpha: 0.2 },
    // border: { contrast: { minContrast: 3, maxContrast: 6 } },
  });
  const successel = mkElementColors(success, {
    background,
    foreground,
    // fg: { contrast: { minContrast: 3, maxContrast: 6 } },
    // bg: { alpha: 0.2 },
    // border: { contrast: { minContrast: 3, maxContrast: 6 } },
  });
  const errorel = mkElementColors(error, {
    background,
    foreground,
    fg: { contrast: { minContrast: 3, maxContrast: 6 } },
    bg: { alpha: 0.2, saturationScale: 0.4, contrast: { minContrast: 0, maxContrast: 6 } },
    border: { contrast: { minContrast: 3, maxContrast: 6 } },
  });

  // Predictive/ghost text color - use parameter color for better visibility
  const predictiveColor = get(t.tokens.variables, "parameter") || muted;

  const gitAdded = c("ui.git.added", "ui.status.success");
  const gitModified = c("ui.git.modified", "ui.status.warning");
  const gitDeleted = c("ui.git.deleted", "ui.status.error");
  const gitIgnored = c("ui.git.ignored", "ui.foregrounds.muted");
  const gitConflict = c("ui.git.conflict", "ui.status.error");

  // Terminal colors
  const terminalBg = c("ui.overrides.terminal.background", "ui.backgrounds.surface", "background");
  const terminalFg = c("ui.overrides.terminal.foreground", "ui.foregrounds.default");
  const ansiBlack = c("ui.overrides.terminal.ansiBlack", "ui.backgrounds.base");
  const ansiRed = c("ui.overrides.terminal.ansiRed", "ui.status.error");
  const ansiGreen = c("ui.overrides.terminal.ansiGreen", "ui.status.success");
  const ansiYellow = c("ui.overrides.terminal.ansiYellow", "ui.status.warning");
  const ansiBlue = c("ui.overrides.terminal.ansiBlue", "ui.status.info");
  const ansiMagenta = c("ui.overrides.terminal.ansiMagenta", "ui.accent.primary");
  const ansiCyan = c("ui.overrides.terminal.ansiCyan", "ui.foregrounds.accent");
  const ansiWhite = c("ui.overrides.terminal.ansiWhite", "ui.foregrounds.default");
  const ansiBrightBlack = c("ui.overrides.terminal.ansiBrightBlack", "ui.foregrounds.muted");
  const ansiBrightRed = c("ui.overrides.terminal.ansiBrightRed", "ui.status.error");
  const ansiBrightGreen = c("ui.overrides.terminal.ansiBrightGreen", "ui.status.success");
  const ansiBrightYellow = c("ui.overrides.terminal.ansiBrightYellow", "ui.status.warning");
  const ansiBrightBlue = c("ui.overrides.terminal.ansiBrightBlue", "ui.status.info");
  const ansiBrightMagenta = c("ui.overrides.terminal.ansiBrightMagenta", "ui.accent.primary");
  const ansiBrightCyan = c("ui.overrides.terminal.ansiBrightCyan", "ui.foregrounds.accent");
  const ansiBrightWhite = c("ui.overrides.terminal.ansiBrightWhite", "ui.foregrounds.default");

  // Editor colors
  const editorBg = c("ui.overrides.editor.background", "ui.backgrounds.surface", "background");
  const editorFg = c("ui.overrides.editor.foreground", "ui.foregrounds.default");
  const gutterBg = c("ui.overrides.editorGutter.background", "ui.backgrounds.surface", "background");
  const lineHighlight = c("ui.highlights.activeLine.background", "ui.overrides.editor.lineHighlight", "ui.selection.background");
  const lineNumber = c("ui.overrides.editorLineNumber.foreground", "ui.foregrounds.muted");
  const activeLineNumber = c("ui.overrides.editorLineNumber.activeForeground", "ui.foregrounds.default");
  const findMatch = c("ui.overrides.editor.findMatchBackground", "ui.highlights.activeLine.background", "ui.backgrounds.raised");
  const wordHighlight = c("ui.highlights.word.background", "ui.backgrounds.raised");
  const wordHighlightStrong = c("ui.highlights.word.backgroundStrong", "ui.selection.background");

  // Status bar, tabs, etc.
  const statusBarBg = c("ui.overrides.statusBar.background",  "ui.backgrounds.base", "background");
  const tabBg = c("ui.overrides.tabs.inactiveBackground", "ui.backgrounds.surface", "background");
  const tabActiveBg = c("ui.overrides.tabs.activeBackground", "ui.backgrounds.surface", "background");
  const panelBg = c( "ui.overrides.panel.background", "ui.panels.background", "ui.backgrounds.base", "background");
  const panelBorder = c("ui.overrides.panel.border", "ui.borders.default");

  // Access palette for specific colors that may not be in the token system
  const palette = t.palette as Record<string, string>;

  // Helper to get palette color with fallback
  const pal = (key: string, fallback: string): string => {
    return palette[key] || fallback;
  };

  const computedSaturatedColors = buildTunedSaturatedColors(
    options.saturatedBaseColor || c("ui.accent.primary", "ui.foregrounds.accent"),
    options.saturatedColorCount ?? 6,
    options.saturatedHueStep ?? 26,
    options.saturatedSaturation ?? 0.72,
    options.saturatedLightness ?? 0.67,
  );
  const accents = t.ui.accent.palette || computedSaturatedColors;

  // Build syntax highlighting
  const tokens = t.tokens;
  const syntax: Record<string, ZedSyntaxStyle> = {
    attribute: {
      color: pal("coral", get(tokens.meta, "decorator") || get(tokens.meta, "default")),
    },
    boolean: {
      color: get(tokens.literals, "boolean") || get(tokens.literals, "default"),
    },
    comment: {
      color: c("tokens.comments"),
      font_style: "italic",
    },
    "comment.doc": {
      color: c("tokens.comments"),
      font_style: "italic",
    },
    constant: {
      color: get(tokens.constants, "default"),
    },
    constructor: {
      color: get(tokens.types, "class") || get(tokens.types, "default") || pal("lightOrchid", foreground),
    },
    embedded: {
      color: c("tokens.source"),
    },
    emphasis: {
      font_style: "italic",
    },
    "emphasis.strong": {
      font_weight: 700,
    },
    enum: {
      color: get(tokens.types, "enum") || get(tokens.types, "default") || pal("lightOrchid", foreground),
    },
    function: {
      color: get(tokens.functions, "call") || get(tokens.functions, "default"),
    },
    "function.method": {
      color: get(tokens.functions, "method") || get(tokens.functions, "default"),
    },
    "function.definition": {
      color: get(tokens.functions, "declaration") || get(tokens.functions, "default"),
    },
    hint: {
      color: info,
      font_weight: 700,
    },
    keyword: {
      color: get(tokens.keywords, "default"),
    },
    label: {
      color: get(tokens.meta, "label") || get(tokens.keywords, "default"),
    },
    link_text: {
      color: info,
      font_style: "italic",
    },
    link_uri: {
      color: info,
    },
    namespace: {
      color: c("tokens.source"),
    },
    number: {
      color: get(tokens.literals, "number") || get(tokens.literals, "default"),
    },
    operator: {
      color: get(tokens.operators, "default") || pal("razzmatazz", foreground),
    },
    predictive: {
      color: get(tokens.variables, "parameter") || muted,
      font_style: "italic",
    },
    preproc: {
      color: get(tokens.keywords, "default"),
    },
    primary: {
      color: c("tokens.source"),
    },
    property: {
      color: get(tokens.variables, "property") || get(tokens.variables, "default"),
    },
    punctuation: {
      color: get(tokens.punctuation, "default"),
    },
    "punctuation.bracket": {
      color: get(tokens.punctuation, "bracket") || get(tokens.punctuation, "default"),
    },
    "punctuation.delimiter": {
      color: get(tokens.punctuation, "delimiter") || get(tokens.punctuation, "default"),
    },
    "punctuation.list_marker": {
      color: get(tokens.punctuation, "default"),
    },
    "punctuation.markup": {
      color: get(tokens.meta, "tag") || get(tokens.punctuation, "default"),
    },
    "punctuation.special": {
      color: get(tokens.punctuation, "accessor") || get(tokens.punctuation, "default"),
    },
    selector: {
      color: get(tokens.types, "class") || get(tokens.types, "default") || pal("lightOrchid", foreground),
    },
    "selector.pseudo": {
      color: get(tokens.keywords, "default") || info,
    },
    string: {
      color: get(tokens.strings, "default") || get(tokens.literals, "string"),
    },
    "string.escape": {
      color: pal("peach", get(tokens.strings, "default")),
    },
    "string.regex": {
      color: get(tokens.strings, "regex") || get(tokens.literals, "regex"),
      font_style: "italic",
    },
    "string.special": {
      color: get(tokens.strings, "default"),
    },
    "string.special.symbol": {
      color: get(tokens.strings, "default"),
    },
    tag: {
      color: pal("tagName", get(tokens.meta, "tag") || get(tokens.types, "default")),
    },
    "text.literal": {
      color: get(tokens.strings, "default"),
    },
    title: {
      color: pal("markdownHeading", pal("lime", success)),
      font_weight: 700,
    },
    type: {
      color: get(tokens.types, "default") || pal("lightOrchid", foreground),
    },
    variable: {
      color: get(tokens.variables, "default"),
    },
    "variable.special": {
      color: get(tokens.variables, "global") || get(tokens.variables, "default"),
      font_style: "italic",
    },
    variant: {
      color: get(tokens.types, "enum") || get(tokens.types, "default") || pal("lightOrchid", foreground),
    },
  };

  // Build players array (for multi-cursor/collaboration)
  const playerColors = [
    ...accents.slice(0, 5),
    c("ui.status.error"),
  ];
  const players: ZedPlayer[] = playerColors.map((color) => ({
    cursor: color,
    background: color,
    selection: withAlpha(color, 0.25),
  }));

  return {
    "background.appearance": "blurred",
    accents,
    background,

    // Borders
    border: c("ui.borders.separator"),
    "border.variant": withAlpha(borderSubtle, 0.6),
    "border.focused": borderActive,
    "border.selected": pal("focusBorder", withAlpha(borderDefault, 0.08)),
    "border.transparent": "#00000000",
    "border.disabled": withAlpha(borderSubtle, 0.6),

    // Surfaces
    // Extensions -> Container of each item
    "elevated_surface.background": mkColor(t.ui.backgrounds.raised, {
      background,
      foreground,
      saturation: {
        amount: 0.5,
        reference: c("ui.backgrounds.darker"),
      },
      contrast: {
        minContrast: 0.5,
        maxContrast: 1,
      },
      alpha: 0.9,
    }),
    "surface.background": mkColor(t.ui.backgrounds.surface, {
      background,
      foreground,
      saturation: {
        amount: 0.1,
        reference: foreground,
      },
      alpha: 0.3,
    }),

    // Elements
    "element.background": mkColor(elementBackground, {
      background: c("ui.backgrounds.darker"),
      foreground,
      saturation: {
        amount: 0.3,
        reference: accent
      },
      contrast: {
        minContrast: 0.6,
        maxContrast: 2,
      },
      alpha: 0.6,
    }),
    "element.hover" : mkColor(elementHover, {
      background: c("ui.backgrounds.darker"),
      foreground,
      saturation: {
        amount: 0.8,
        reference: c("ui.backgrounds.darker"),
      },
      contrast: {
        minContrast: 1,
        maxContrast: 3,
      },
      alpha: 0.2,
    }),
    "element.active ": mkColor(elementActive, {
      background: c("ui.backgrounds.darker"),
      foreground,
      saturation: {
        amount: 0.8,
        reference: c("ui.backgrounds.darker"),
      },
      contrast: {
        minContrast: 1,
        maxContrast: 3,
      },
      alpha: 0.2,
    }),
    "element.selected": mkColor(elementSelected, {
      background: c("ui.backgrounds.darker"),
      foreground,
      saturation: {
        amount: 0.8,
        reference: c("ui.backgrounds.darker"),
      },
    }),
    "element.disabled": c("ui.elements.disabled", "ui.foregrounds.subtle"),
    "drop_target.background": menuBackground,
    "ghost_element.background": withAlpha(elementBackground, 0.2),
    "ghost_element.hover": elementHover,
    "ghost_element.active": elementActive,
    "ghost_element.selected": elementSelected,
    "ghost_element.disabled": withAlpha(subtle, 0.33),

    // Text
    text: mkColor(foreground, {
      background,
      foreground: foreground,
      saturation: {
        amount: 0.5,
        reference: foreground,
      },
      contrast: {
        minContrast: 3.6,
        maxContrast: 10.5,
      },
      alpha: 1
    }),
    "text.muted": muted,
    "text.placeholder": c("ui.foregrounds.subtle", "ui.foregrounds.muted"),
    "text.disabled": withAlpha(subtle, 0.62),
    "text.accent": c("ui.foregrounds.accent"),


    // Icons
    icon: pal("steel", foreground),
    "icon.muted": pal("iconMuted", muted),
    "icon.disabled": withAlpha(subtle, 0.62),
    "icon.placeholder": withAlpha(subtle, 0.27),
    "icon.accent": withAlpha(accent, 0.83),

    // UI Components
    "status_bar.background": statusBarBg,
    "title_bar.background": statusBarBg,
    "title_bar.inactive_background": statusBarBg,
    "toolbar.background": statusBarBg,
    "tab_bar.background": statusBarBg,
    "tab.inactive_background": tabBg,
    "tab.active_background": tabActiveBg,
    "search.match_background": findMatch,
    "panel.background": panelBg,
    "panel.focused_border": panelBorder,
    "pane.focused_border": pal("focusBorder", withAlpha(borderDefault, 0.08)),
    "panel.indent_guide": pal("indentGuide", withAlpha(borderDefault, 0.1)),
    "panel.indent_guide_active": pal("indentGuideActive", withAlpha(borderActive, 0.3)),
    "panel.indent_guide_hover": pal("indentGuideActive", withAlpha(borderActive, 0.5)),
    "pane_group.border": withAlpha(borderDefault, 0.15),

    // Scrollbar
    "scrollbar.thumb.background": c("ui.overrides.scrollbar.sliderBackground", "ui.borders.subtle"),
    "scrollbar.thumb.hover_background": c("ui.overrides.scrollbar.sliderHoverBackground", "ui.backgrounds.raised"),
    "scrollbar.thumb.border": "#00000000",
    "scrollbar.track.background": "#00000000",
    "scrollbar.track.border": "#00000000",

    // Editor
    "editor.foreground": editorFg,
    "editor.background": editorBg,
    "editor.gutter.background": gutterBg,
    "editor.subheader.background": raised,
    "editor.active_line.background": lineHighlight,
    "editor.highlighted_line.background": lineHighlight,
    "editor.line_number": lineNumber,
    "editor.active_line_number": activeLineNumber,
    "editor.hover_line_number": pal("lineNumberHover", muted),
    "editor.invisible": pal("whitespace", borderSubtle),
    "editor.wrap_guide": pal("ruler", borderSubtle),
    "editor.active_wrap_guide": pal("indentGuideActive", withAlpha(borderActive, 0.86)),
    "editor.indent_guide": pal("indentGuide", withAlpha(borderDefault, 0.1)),
    "editor.indent_guide_active": pal("indentGuideActive", withAlpha(borderActive, 0.3)),
    "editor.document_highlight.read_background": wordHighlight,
    "editor.document_highlight.write_background": wordHighlightStrong,
    "editor.document_highlight.bracket_background": withAlpha(accent, 0.2),

    // Terminal
    "terminal.background": terminalBg,
    "terminal.ansi.background": terminalBg,
    "terminal.foreground": terminalFg,
    "terminal.bright_foreground": "#FFFFFF",
    "terminal.dim_foreground": muted,
    "terminal.ansi.black": ansiBlack,
    "terminal.ansi.bright_black": ansiBrightBlack,
    "terminal.ansi.dim_black": ansiBlack,
    "terminal.ansi.red": ansiRed,
    "terminal.ansi.bright_red": ansiBrightRed,
    "terminal.ansi.dim_red": ansiRed,
    "terminal.ansi.green": ansiGreen,
    "terminal.ansi.bright_green": ansiBrightGreen,
    "terminal.ansi.dim_green": ansiGreen,
    "terminal.ansi.yellow": ansiYellow,
    "terminal.ansi.bright_yellow": ansiBrightYellow,
    "terminal.ansi.dim_yellow": ansiYellow,
    "terminal.ansi.blue": ansiBlue,
    "terminal.ansi.bright_blue": ansiBrightBlue,
    "terminal.ansi.dim_blue": ansiBlue,
    "terminal.ansi.magenta": ansiMagenta,
    "terminal.ansi.bright_magenta": ansiBrightMagenta,
    "terminal.ansi.dim_magenta": ansiMagenta,
    "terminal.ansi.cyan": ansiCyan,
    "terminal.ansi.bright_cyan": ansiBrightCyan,
    "terminal.ansi.dim_cyan": ansiCyan,
    "terminal.ansi.white": ansiWhite,
    "terminal.ansi.bright_white": ansiBrightWhite,
    "terminal.ansi.dim_white": ansiWhite,

    // Links & Status
    "link_text.hover": pal("linkGreen", info),

    // Version Control
    "version_control.added": mix(withAlpha(gitAdded, 0.6), darker, 0.4).hexa(),
    "version_control.modified": gitModified,
    "version_control.deleted": withAlpha(gitDeleted, 0.8),
    "version_control.word_added": withAlpha(gitAdded, 0.15),
    "version_control.word_deleted": withAlpha(gitDeleted, 0.4),
    "version_control.conflict_marker.ours": withAlpha(success, 0.1),
    "version_control.conflict_marker.theirs": withAlpha(info, 0.1),

    conflict: gitConflict,
    "conflict.background": withAlpha(gitConflict, 0.25),
    "conflict.border": gitConflict,
    created: gitAdded,
    "created.background": withAlpha(gitAdded, 0.08),
    "created.border": gitAdded,
    deleted: gitDeleted,
    "deleted.background": withAlpha(gitDeleted, 0.08),
    "deleted.border": gitDeleted,
    error: errorel.fg,
    "error.background": errorel.bg,
    "error.border": errorel.border,
    hidden: gitIgnored,
    "hidden.background": withAlpha(gitIgnored, 0.25),
    "hidden.border": gitIgnored,
    hint: infoel.fg,
    "hint.background": infoel.bg,
    "hint.border": infoel.border,
    ignored: gitIgnored,
    "ignored.background": withAlpha(gitIgnored, 0.25),
    "ignored.border": gitIgnored,
    info:  infoel.fg,
    "info.background": mkColor(infoel.bg, {
      background: "#000000",
      foreground: infoel.fg,
      alpha: 0.05,
      saturation: {
        amount: .1,
        reference: c("ui.foregrounds.default"),
      },
      contrast: {
        minContrast: 0,
        maxContrast: 10.5,
      },
    }),
    "info.border": infoel.border,
    modified: gitModified,
    "modified.background": withAlpha(gitModified, 0.25),
    "modified.border": gitModified,
    predictive: predictiveColor,
    "predictive.background": withAlpha(predictiveColor, 0.25),
    "predictive.border": predictiveColor,
    renamed: gitAdded,
    "renamed.background": withAlpha(gitAdded, 0.25),
    "renamed.border": gitAdded,
    success: successel.fg,
    "success.background": successel.bg,
    "success.border": successel.border,
    unreachable: subtle,
    "unreachable.background": withAlpha(subtle, 0.25),
    "unreachable.border": subtle,
    warning: warningel.fg,
    "warning.background": warningel.bg,
    "warning.border": warningel.border,

    players,
    syntax,
    "search.active_match_background": findMatch,
  };
}

/**
 * Map a ThemeDefinition to Zed theme format
 */
export function mapZed(theme: ThemeDefinitionExtended, options: BuildOptions = {}): ZedThemeFile {
  // Merge filters into theme (filters are applied by the color factory)
  const filters: ThemeFilters = {
    ...theme.filters,
    ...options.filters,
  };

  // Create a theme with merged filters for the color factory
  const processedTheme: ThemeDefinitionExtended = {
    ...theme,
    filters: Object.keys(filters).length > 0 ? filters : undefined,
  };

  // Create color factory for the processed theme
  const c = strictColorFactory(processedTheme);

  // Build the theme style
  const rawStyle = buildStyle(processedTheme, c, options);
  const saturatedStyle =
    options.maxSaturation === undefined
      ? rawStyle
      : applySaturationCap(rawStyle, options.maxSaturation);
  const style =
    options.redMaxSaturation === undefined && options.redMinLightness === undefined
      ? saturatedStyle
      : applyHueBandCap(
          saturatedStyle,
          options.redHueCenter ?? 0,
          options.redHueWindow ?? 28,
          options.redMaxSaturation,
          options.redMinLightness,
        );

  // Construct the theme file
  const themeFile: ZedThemeFile = {
    $schema: "https://zed.dev/schema/themes/v0.2.0.json",
    name: `${theme.name} Theme Family`,
    author: options.author || "Cooper Maruyama",
    themes: [
      {
        name: theme.name,
        appearance: theme.type,
        style,
      },
    ],
  };

  return themeFile;
}

export default mapZed;
