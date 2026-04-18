/**
 * Zed integration - maps ThemeDefinition to Zed theme format
 *
 * This is the only place that knows about Zed's format.
 * It reads from ThemeDefinition and produces Zed JSON.
 */

import { Color } from "../core/color";
import type { ThemeFilters } from "../filters";
import type { ThemeDefinition, ThemeDefinitionExtended } from "../themes/types";
import { get, strictColorFactory } from "../themes/types";

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
export type AppearanceContent = "light" | "dark";
export type AccentContent = string | null;
/**
 * The background appearance of the window.
 */
export type WindowBackgroundContent = "opaque" | "transparent" | "blurred";
export type FontStyleContent = "normal" | "italic" | "oblique";

/**
 * The content of a serialized theme family.
 */
export interface ThemeFamilyContent {
  author: string;
  name: string;
  themes: ThemeContent[];
  [k: string]: unknown;
}
/**
 * The content of a serialized theme.
 */
export interface ThemeContent {
  appearance: AppearanceContent;
  name: string;
  style: ThemeStyleContent;
  [k: string]: unknown;
}
/**
 * The content of a serialized theme.
 */
export interface ThemeStyleContent {
  accents?: AccentContent[];
  /**
   * Background Color. Used for the app background and blank panels or windows.
   */
  background?: string | null;
  "background.appearance"?: WindowBackgroundContent | null;
  /**
   * Border color. Used for most borders, is usually a high contrast color.
   */
  border?: string | null;
  /**
   * Border color. Used for disabled elements, like a disabled input or button.
   */
  "border.disabled"?: string | null;
  /**
   * Border color. Used for focused elements, like keyboard focused list item.
   */
  "border.focused"?: string | null;
  /**
   * Border color. Used for selected elements, like an active search filter or selected checkbox.
   */
  "border.selected"?: string | null;
  /**
   * Border color. Used for transparent borders. Used for placeholder borders when an element gains a border on state change.
   */
  "border.transparent"?: string | null;
  /**
   * Border color. Used for deemphasized borders, like a visual divider between two sections
   */
  "border.variant"?: string | null;
  /**
   * Indicates some kind of conflict, like a file changed on disk while it was open, or merge conflicts in a Git repository.
   */
  conflict?: string | null;
  "conflict.background"?: string | null;
  "conflict.border"?: string | null;
  /**
   * Indicates something new, like a new file added to a Git repository.
   */
  created?: string | null;
  "created.background"?: string | null;
  "created.border"?: string | null;
  /**
   * Indicates that something no longer exists, like a deleted file.
   */
  deleted?: string | null;
  "deleted.background"?: string | null;
  "deleted.border"?: string | null;
  /**
   * Background Color. Used for the area that shows where a dragged element will be dropped.
   */
  "drop_target.background"?: string | null;
  "editor.active_line.background"?: string | null;
  /**
   * Text Color. Used for the text of the line number in the editor gutter when the line is highlighted.
   */
  "editor.active_line_number"?: string | null;
  "editor.active_wrap_guide"?: string | null;
  "editor.background"?: string | null;
  /**
   * Highlighted brackets background color.
   *
   * Matching brackets in the cursor scope are highlighted with this background color.
   */
  "editor.document_highlight.bracket_background"?: string | null;
  /**
   * Read-access of a symbol, like reading a variable.
   *
   * A document highlight is a range inside a text document which deserves special attention. Usually a document highlight is visualized by changing the background color of its range.
   */
  "editor.document_highlight.read_background"?: string | null;
  /**
   * Read-access of a symbol, like reading a variable.
   *
   * A document highlight is a range inside a text document which deserves special attention. Usually a document highlight is visualized by changing the background color of its range.
   */
  "editor.document_highlight.write_background"?: string | null;
  "editor.foreground"?: string | null;
  "editor.gutter.background"?: string | null;
  "editor.highlighted_line.background"?: string | null;
  "editor.indent_guide"?: string | null;
  "editor.indent_guide_active"?: string | null;
  /**
   * Text Color. Used to mark invisible characters in the editor.
   *
   * Example: spaces, tabs, carriage returns, etc.
   */
  "editor.invisible"?: string | null;
  /**
   * Text Color. Used for the text of the line number in the editor gutter.
   */
  "editor.line_number"?: string | null;
  "editor.subheader.background"?: string | null;
  "editor.wrap_guide"?: string | null;
  /**
   * Background Color. Used for the active state of an element that should have a different background than the surface it's on.
   *
   * Active states are triggered by the mouse button being pressed down on an element, or the Return button or other activator being pressd.
   */
  "element.active"?: string | null;
  /**
   * Background Color. Used for the background of an element that should have a different background than the surface it's on.
   *
   * Elements might include: Buttons, Inputs, Checkboxes, Radio Buttons...
   *
   * For an element that should have the same background as the surface it's on, use `ghost_element_background`.
   */
  "element.background"?: string | null;
  /**
   * Background Color. Used for the disabled state of an element that should have a different background than the surface it's on.
   *
   * Disabled states are shown when a user cannot interact with an element, like a disabled button or input.
   */
  "element.disabled"?: string | null;
  /**
   * Background Color. Used for the hover state of an element that should have a different background than the surface it's on.
   *
   * Hover states are triggered by the mouse entering an element, or a finger touching an element on a touch screen.
   */
  "element.hover"?: string | null;
  /**
   * Background Color. Used for the selected state of an element that should have a different background than the surface it's on.
   *
   * Selected states are triggered by the element being selected (or "activated") by the user.
   *
   * This could include a selected checkbox, a toggleable button that is toggled on, etc.
   */
  "element.selected"?: string | null;
  /**
   * Background color. Used for elevated surfaces, like a context menu, popup, or dialog.
   */
  "elevated_surface.background"?: string | null;
  /**
   * Indicates a system error, a failed operation or a diagnostic error.
   */
  error?: string | null;
  "error.background"?: string | null;
  "error.border"?: string | null;
  /**
   * Background Color. Used for the active state of a ghost element that should have the same background as the surface it's on.
   *
   * Active states are triggered by the mouse button being pressed down on an element, or the Return button or other activator being pressd.
   */
  "ghost_element.active"?: string | null;
  /**
   * Used for the background of a ghost element that should have the same background as the surface it's on.
   *
   * Elements might include: Buttons, Inputs, Checkboxes, Radio Buttons...
   *
   * For an element that should have a different background than the surface it's on, use `element_background`.
   */
  "ghost_element.background"?: string | null;
  /**
   * Background Color. Used for the disabled state of a ghost element that should have the same background as the surface it's on.
   *
   * Disabled states are shown when a user cannot interact with an element, like a disabled button or input.
   */
  "ghost_element.disabled"?: string | null;
  /**
   * Background Color. Used for the hover state of a ghost element that should have the same background as the surface it's on.
   *
   * Hover states are triggered by the mouse entering an element, or a finger touching an element on a touch screen.
   */
  "ghost_element.hover"?: string | null;
  /**
   * Background Color. Used for the selected state of a ghost element that should have the same background as the surface it's on.
   *
   * Selected states are triggered by the element being selected (or "activated") by the user.
   *
   * This could include a selected checkbox, a toggleable button that is toggled on, etc.
   */
  "ghost_element.selected"?: string | null;
  /**
   * Represents a hidden status, such as a file being hidden in a file tree.
   */
  hidden?: string | null;
  "hidden.background"?: string | null;
  "hidden.border"?: string | null;
  /**
   * Indicates a hint or some kind of additional information.
   */
  hint?: string | null;
  "hint.background"?: string | null;
  "hint.border"?: string | null;
  /**
   * Fill Color. Used for the default fill color of an icon.
   */
  icon?: string | null;
  /**
   * Fill Color. Used for the accent fill color of an icon.
   *
   * This might be used to show when a toggleable icon button is selected.
   */
  "icon.accent"?: string | null;
  /**
   * Fill Color. Used for the disabled fill color of an icon.
   *
   * Disabled states are shown when a user cannot interact with an element, like a icon button.
   */
  "icon.disabled"?: string | null;
  /**
   * Fill Color. Used for the muted or deemphasized fill color of an icon.
   *
   * This might be used to show an icon in an inactive pane, or to demphasize a series of icons to give them less visual weight.
   */
  "icon.muted"?: string | null;
  /**
   * Fill Color. Used for the placeholder fill color of an icon.
   *
   * This might be used to show an icon in an input that disappears when the user enters text.
   */
  "icon.placeholder"?: string | null;
  /**
   * Indicates that something is deliberately ignored, such as a file or operation ignored by Git.
   */
  ignored?: string | null;
  "ignored.background"?: string | null;
  "ignored.border"?: string | null;
  /**
   * Represents informational status updates or messages.
   */
  info?: string | null;
  "info.background"?: string | null;
  "info.border"?: string | null;
  "link_text.hover"?: string | null;
  /**
   * Indicates a changed or altered status, like a file that has been edited.
   */
  modified?: string | null;
  "modified.background"?: string | null;
  "modified.border"?: string | null;
  "pane.focused_border"?: string | null;
  "pane_group.border"?: string | null;
  "panel.background"?: string | null;
  "panel.focused_border"?: string | null;
  "panel.indent_guide"?: string | null;
  "panel.indent_guide_active"?: string | null;
  "panel.indent_guide_hover"?: string | null;
  players?: PlayerColorContent[];
  /**
   * Indicates something that is predicted, like automatic code completion, or generated code.
   */
  predictive?: string | null;
  "predictive.background"?: string | null;
  "predictive.border"?: string | null;
  /**
   * Represents a renamed status, such as a file that has been renamed.
   */
  renamed?: string | null;
  "renamed.background"?: string | null;
  "renamed.border"?: string | null;
  /**
   * The color of the scrollbar thumb.
   */
  "scrollbar.thumb.background"?: string | null;
  /**
   * The border color of the scrollbar thumb.
   */
  "scrollbar.thumb.border"?: string | null;
  /**
   * The color of the scrollbar thumb when hovered over.
   */
  "scrollbar.thumb.hover_background"?: string | null;
  /**
   * The background color of the scrollbar track.
   */
  "scrollbar.track.background"?: string | null;
  /**
   * The border color of the scrollbar track.
   */
  "scrollbar.track.border"?: string | null;
  "search.match_background"?: string | null;
  "status_bar.background"?: string | null;
  /**
   * Indicates a successful operation or task completion.
   */
  success?: string | null;
  "success.background"?: string | null;
  "success.border"?: string | null;
  /**
   * Background Color. Used for grounded surfaces like a panel or tab.
   */
  "surface.background"?: string | null;
  /**
   * The styles for syntax nodes.
   */
  syntax?: {
    [k: string]: HighlightStyleContent;
  };
  "tab.active_background"?: string | null;
  "tab.inactive_background"?: string | null;
  "tab_bar.background"?: string | null;
  /**
   * Terminal ANSI background color.
   */
  "terminal.ansi.background"?: string | null;
  /**
   * Black ANSI terminal color.
   */
  "terminal.ansi.black"?: string | null;
  /**
   * Blue ANSI terminal color.
   */
  "terminal.ansi.blue"?: string | null;
  /**
   * Bright black ANSI terminal color.
   */
  "terminal.ansi.bright_black"?: string | null;
  /**
   * Bright blue ANSI terminal color.
   */
  "terminal.ansi.bright_blue"?: string | null;
  /**
   * Bright cyan ANSI terminal color.
   */
  "terminal.ansi.bright_cyan"?: string | null;
  /**
   * Bright green ANSI terminal color.
   */
  "terminal.ansi.bright_green"?: string | null;
  /**
   * Bright magenta ANSI terminal color.
   */
  "terminal.ansi.bright_magenta"?: string | null;
  /**
   * Bright red ANSI terminal color.
   */
  "terminal.ansi.bright_red"?: string | null;
  /**
   * Bright white ANSI terminal color.
   */
  "terminal.ansi.bright_white"?: string | null;
  /**
   * Bright yellow ANSI terminal color.
   */
  "terminal.ansi.bright_yellow"?: string | null;
  /**
   * Cyan ANSI terminal color.
   */
  "terminal.ansi.cyan"?: string | null;
  /**
   * Dim black ANSI terminal color.
   */
  "terminal.ansi.dim_black"?: string | null;
  /**
   * Dim blue ANSI terminal color.
   */
  "terminal.ansi.dim_blue"?: string | null;
  /**
   * Dim cyan ANSI terminal color.
   */
  "terminal.ansi.dim_cyan"?: string | null;
  /**
   * Dim green ANSI terminal color.
   */
  "terminal.ansi.dim_green"?: string | null;
  /**
   * Dim magenta ANSI terminal color.
   */
  "terminal.ansi.dim_magenta"?: string | null;
  /**
   * Dim red ANSI terminal color.
   */
  "terminal.ansi.dim_red"?: string | null;
  /**
   * Dim white ANSI terminal color.
   */
  "terminal.ansi.dim_white"?: string | null;
  /**
   * Dim yellow ANSI terminal color.
   */
  "terminal.ansi.dim_yellow"?: string | null;
  /**
   * Green ANSI terminal color.
   */
  "terminal.ansi.green"?: string | null;
  /**
   * Magenta ANSI terminal color.
   */
  "terminal.ansi.magenta"?: string | null;
  /**
   * Red ANSI terminal color.
   */
  "terminal.ansi.red"?: string | null;
  /**
   * White ANSI terminal color.
   */
  "terminal.ansi.white"?: string | null;
  /**
   * Yellow ANSI terminal color.
   */
  "terminal.ansi.yellow"?: string | null;
  /**
   * Terminal background color.
   */
  "terminal.background"?: string | null;
  /**
   * Bright terminal foreground color.
   */
  "terminal.bright_foreground"?: string | null;
  /**
   * Dim terminal foreground color.
   */
  "terminal.dim_foreground"?: string | null;
  /**
   * Terminal foreground color.
   */
  "terminal.foreground"?: string | null;
  /**
   * Text Color. Default text color used for most text.
   */
  text?: string | null;
  /**
   * Text Color. Color used for emphasis or highlighting certain text, like an active filter or a matched character in a search.
   */
  "text.accent"?: string | null;
  /**
   * Text Color. Color used for text denoting disabled elements. Typically, the color is faded or grayed out to emphasize the disabled state.
   */
  "text.disabled"?: string | null;
  /**
   * Text Color. Color of muted or deemphasized text. It is a subdued version of the standard text color.
   */
  "text.muted"?: string | null;
  /**
   * Text Color. Color of the placeholder text typically shown in input fields to guide the user to enter valid data.
   */
  "text.placeholder"?: string | null;
  "title_bar.background"?: string | null;
  "title_bar.inactive_background"?: string | null;
  "toolbar.background"?: string | null;
  /**
   * Indicates some kind of unreachable status, like a block of code that can never be reached.
   */
  unreachable?: string | null;
  "unreachable.background"?: string | null;
  "unreachable.border"?: string | null;
  /**
   * Represents a warning status, like an operation that is about to fail.
   */
  warning?: string | null;
  "warning.background"?: string | null;
  "warning.border"?: string | null;
  [k: string]: unknown;
}
export interface PlayerColorContent {
  background?: string | null;
  cursor?: string | null;
  selection?: string | null;
  [k: string]: unknown;
}
export interface HighlightStyleContent {
  background_color?: string | null;
  color?: string | null;
  font_style?: FontStyleContent | null;
  font_weight?: (100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900) | null;
  [k: string]: unknown;
}

export interface ZedThemeStyle extends ThemeStyleContent {}

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

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function capSaturation(color: string, maxSaturation: number): string {
  try {
    const maxSatPercent = clamp(maxSaturation, 0, 1) * 100;
    const hsl = new Color(color).hsl();
    const currentSat = hsl.s;
    if (Number.isNaN(currentSat) || currentSat <= maxSatPercent) {
      return new Color(color).render();
    }
    return Color.fromHsl({ ...hsl, s: maxSatPercent }).render();
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
    const hsl = new Color(color).hsl();
    const hue = hsl.h;
    if (Number.isNaN(hue)) return new Color(color).render();
    if (angularDistance(hue, centerHue) > hueWindow)
      return new Color(color).render();

    let next = hsl;
    if (maxSaturation !== undefined) {
      const satCap = clamp(maxSaturation, 0, 1) * 100;
      if (next.s > satCap) {
        next = { ...next, s: satCap };
      }
    }
    if (minLightness !== undefined) {
      const lightFloor = clamp(minLightness, 0, 1) * 100;
      if (next.l < lightFloor) {
        next = { ...next, l: lightFloor };
      }
    }
    return Color.fromHsl(next).render();
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
    return capHueBand(
      value,
      centerHue,
      hueWindow,
      maxSaturation,
      minLightness,
    ) as T;
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
      out[key] = applyHueBandCap(
        entry,
        centerHue,
        hueWindow,
        maxSaturation,
        minLightness,
      );
    }
    return out as T;
  }
  return value;
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
): ZedThemeStyle {
  // Get colors from theme
  const background = c("ui.backgrounds.base", "background");
  const surface = c("ui.backgrounds.surface", "background");
  const menuBackground = c(
    "ui.menu.background",
    "ui.backgrounds.raised",
    "ui.backgrounds.surface",
  );
  const elementBackground = c(
    "ui.elements.background",
    "ui.menu.background",
    "ui.backgrounds.darker",
    "ui.backgrounds.surface",
  );
  const elementHover = c(
    "ui.elements.hover.background",
    "ui.elements.background",
    "ui.menu.selectionBackground",
    "ui.backgrounds.raised",
  );
  const elementActive = c(
    "ui.elements.active.background",
    "ui.menu.selectionBackground",
    "ui.backgrounds.raised",
  );
  const elementSelected = c(
    "ui.elements.selected.background",
    "ui.menu.selectionBackground",
    "ui.backgrounds.raised",
  );
  const elementSelectionChrome = c(
    "ui.subtleElements.selectionBackground",
    "ui.elements.selected.background",
    "ui.menu.selectionBackground",
    "ui.backgrounds.raised",
  );

  const subtleElementBackground = c(
    "ui.subtleElements.background",
    "ui.elements.background",
    "ui.backgrounds.raised",
  );
  const subtleElementHover = c(
    "ui.subtleElements.hover.background",
    "ui.elements.hover.background",
    "ui.backgrounds.overlay",
  );
  const subtleElementActive = c(
    "ui.subtleElements.active.background",
    "ui.elements.active.background",
    "ui.elements.selected",
    "ui.selection.background",
  );
  const subtleElementSelected = c(
    "ui.subtleElements.selected.background",
    "ui.elements.selected.background",
    "ui.selection.background",
  );
  const subtleElementDisabled = c(
    "ui.subtleElements.disabled.background",
    "ui.elements.disabled.background",
    "ui.foregrounds.subtle",
  );

  const foreground = c("ui.foregrounds.default");
  const muted = c("ui.foregrounds.muted");
  const subtle = c("ui.foregrounds.subtle", "ui.foregrounds.muted");
  const accent = c("ui.foregrounds.accent", "ui.accent.primary");

  const borderSubtle = c("ui.borders.subtle", "ui.borders.default");
  const focusedBorder = c(
    "ui.focus.border",
    "ui.borders.active",
    "ui.borders.default",
  );

  const error = c("ui.status.error.foreground");
  const _warning = c("ui.status.warning.foreground");
  const info = c("ui.status.info.foreground");
  const success = c("ui.status.success.foreground");

  // Predictive/ghost text color - use parameter color for better visibility
  const predictiveColor = get(t.tokens.variables, "parameter") || muted;

  const gitAdded = c("ui.git.added", "ui.status.success.foreground");
  const gitModified = c("ui.git.modified", "ui.status.warning.foreground");
  const gitDeleted = c("ui.git.deleted", "ui.status.error.foreground");
  const gitIgnored = c("ui.git.ignored", "ui.foregrounds.muted");
  const gitConflict = c("ui.git.conflict", "ui.status.error.foreground");

  // Terminal colors
  const terminalBg = c(
    "ui.overrides.terminal.background",
    "ui.backgrounds.surface",
    "background",
  );
  const terminalFg = c(
    "ui.overrides.terminal.foreground",
    "ui.foregrounds.default",
  );
  const ansiBlack = c("ui.overrides.terminal.ansiBlack", "ui.backgrounds.base");
  const ansiRed = c(
    "ui.overrides.terminal.ansiRed",
    "ui.status.error.foreground",
  );
  const ansiGreen = c(
    "ui.overrides.terminal.ansiGreen",
    "ui.status.success.foreground",
  );
  const ansiYellow = c(
    "ui.overrides.terminal.ansiYellow",
    "ui.status.warning.foreground",
  );
  const ansiBlue = c(
    "ui.overrides.terminal.ansiBlue",
    "ui.status.info.foreground",
  );
  const ansiMagenta = c(
    "ui.overrides.terminal.ansiMagenta",
    "ui.accent.primary",
  );
  const ansiCyan = c("ui.overrides.terminal.ansiCyan", "ui.foregrounds.accent");
  const ansiWhite = c(
    "ui.overrides.terminal.ansiWhite",
    "ui.foregrounds.default",
  );
  const ansiBrightBlack = c(
    "ui.overrides.terminal.ansiBrightBlack",
    "ui.foregrounds.muted",
  );
  const ansiBrightRed = c(
    "ui.overrides.terminal.ansiBrightRed",
    "ui.status.error.foreground",
  );
  const ansiBrightGreen = c(
    "ui.overrides.terminal.ansiBrightGreen",
    "ui.status.success.foreground",
  );
  const ansiBrightYellow = c(
    "ui.overrides.terminal.ansiBrightYellow",
    "ui.status.warning.foreground",
  );
  const ansiBrightBlue = c(
    "ui.overrides.terminal.ansiBrightBlue",
    "ui.status.info.foreground",
  );
  const ansiBrightMagenta = c(
    "ui.overrides.terminal.ansiBrightMagenta",
    "ui.accent.primary",
  );
  const ansiBrightCyan = c(
    "ui.overrides.terminal.ansiBrightCyan",
    "ui.foregrounds.accent",
  );
  const ansiBrightWhite = c(
    "ui.overrides.terminal.ansiBrightWhite",
    "ui.foregrounds.default",
  );

  // Editor colors
  const _editorBg = c(
    "ui.overrides.editor.background",
    "ui.backgrounds.surface",
    "background",
  );
  const editorFg = c(
    "tokens.source",
    "ui.overrides.editor.foreground",
    "ui.foregrounds.default",
  );
  const _gutterBg = c(
    "ui.overrides.editorGutter.background",
    "ui.backgrounds.surface",
    "background",
  );
  const lineHighlight = c(
    "ui.highlights.activeLine.background",
    "ui.overrides.editor.lineHighlight",
    "ui.selection.background",
  );
  const lineNumber = c(
    "ui.overrides.editorLineNumber.foreground",
    "ui.foregrounds.muted",
  );
  const activeLineNumber = c(
    "ui.overrides.editorLineNumber.activeForeground",
    "ui.foregrounds.default",
  );
  const _findMatch = c(
    "ui.overrides.editor.findMatchBackground",
    "ui.highlights.activeLine.background",
    "ui.backgrounds.raised",
  );
  const wordHighlight = c(
    "ui.highlights.word.background",
    "ui.backgrounds.raised",
  );
  const wordHighlightStrong = c(
    "ui.highlights.word.backgroundStrong",
    "ui.selection.background",
  );

  // Status bar, tabs, etc.
  const statusBarBg = c(
    "ui.overrides.statusBar.background",
    "ui.backgrounds.base",
    "background",
  );
  const tabBarBg = c(
    "ui.overrides.tabs.tabBarBackground",
    "ui.overrides.statusBar.background",
    "ui.backgrounds.base",
    "background",
  );
  const tabBg = c(
    "ui.overrides.tabs.inactiveBackground",
    "ui.backgrounds.surface",
    "background",
  );
  const tabActiveBg = c(
    "ui.overrides.tabs.activeBackground",
    "ui.backgrounds.surface",
    "background",
  );
  const panelBg = c(
    "ui.overrides.panel.background",
    "ui.panels.background",
    "ui.backgrounds.base",
    "background",
  );
  const accents = t.ui.accent.palette || [
    c("ui.accent.primary"),
    c("ui.accent.secondary", "ui.foregrounds.accent", "ui.accent.primary"),
    c("ui.status.success.foreground"),
    c("ui.status.info.foreground"),
    c("ui.foregrounds.focused", "ui.foregrounds.accent", "ui.accent.primary"),
    c("ui.status.error.foreground"),
  ];

  // Build syntax highlighting
  const tokens = t.tokens;
  const syntax: Record<string, ZedSyntaxStyle> = {
    attribute: {
      color: get(tokens.meta, "decorator") || get(tokens.meta, "default"),
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
      color: get(tokens.types, "class") || get(tokens.types, "default"),
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
      color: get(tokens.types, "enum") || get(tokens.types, "default"),
    },
    function: {
      color: get(tokens.functions, "call") || get(tokens.functions, "default"),
    },
    "function.method": {
      color:
        get(tokens.functions, "method") || get(tokens.functions, "default"),
    },
    "function.definition": {
      color:
        get(tokens.functions, "declaration") ||
        get(tokens.functions, "default"),
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
      color: get(tokens.operators, "default"),
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
      color:
        get(tokens.variables, "property") || get(tokens.variables, "default"),
    },
    punctuation: {
      color: get(tokens.punctuation, "default"),
    },
    "punctuation.bracket": {
      color:
        get(tokens.punctuation, "bracket") ||
        get(tokens.punctuation, "default"),
    },
    "punctuation.delimiter": {
      color:
        get(tokens.punctuation, "delimiter") ||
        get(tokens.punctuation, "default"),
    },
    "punctuation.list_marker": {
      color: get(tokens.punctuation, "default"),
    },
    "punctuation.markup": {
      color: get(tokens.meta, "tag") || get(tokens.punctuation, "default"),
    },
    "punctuation.special": {
      color:
        get(tokens.punctuation, "accessor") ||
        get(tokens.punctuation, "default"),
    },
    selector: {
      color: get(tokens.types, "class") || get(tokens.types, "default"),
    },
    "selector.pseudo": {
      color: get(tokens.keywords, "default") || info,
    },
    string: {
      color: get(tokens.strings, "default") || get(tokens.literals, "string"),
    },
    "string.escape": {
      color: get(tokens.strings, "default"),
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
      color: get(tokens.meta, "tag") || get(tokens.types, "default"),
    },
    "text.literal": {
      color: get(tokens.strings, "default"),
    },
    title: {
      color: success,
      font_weight: 700,
    },
    type: {
      color: get(tokens.types, "default"),
    },
    variable: {
      color: get(tokens.variables, "default"),
    },
    "variable.special": {
      color:
        get(tokens.variables, "global") || get(tokens.variables, "default"),
      font_style: "italic",
    },
    variant: {
      color: get(tokens.types, "enum") || get(tokens.types, "default"),
    },
  };

  // Build players array (for multi-cursor/collaboration)
  const playerSelection = c(
    "ui.selection.backgroundActive",
    "ui.selection.background",
  );
  const playerColors = [
    c("ui.cursor.foreground", "ui.accent.primary"),
    ...accents,
  ].slice(0, 6);
  const collaboratorSelection = c(
    "ui.selection.collaboratorBackground",
    "ui.selection.backgroundActive",
    "ui.selection.background",
  );
  const players: ZedPlayer[] = playerColors.map((color, i) => ({
    cursor: color,
    background: color,
    selection: i === 0 ? playerSelection : collaboratorSelection,
  }));
  const ALPHA = (v: string) => v;
  return {
    "background.appearance": "blurred",
    accents,
    background: ALPHA(background),

    // Borders
    border: c("ui.borders.default"),
    "border.variant": borderSubtle,
    "border.focused": focusedBorder,
    "border.selected": c(
      "ui.borders.selected",
      "ui.focus.border",
      "ui.borders.active",
      "ui.borders.default",
    ),
    "border.transparent": c(
      "ui.borders.transparent",
      "ui.borders.subtle",
      "ui.borders.default",
    ),
    "border.disabled": c(
      "ui.borders.disabled",
      "ui.borders.subtle",
      "ui.borders.default",
    ),

    // Surfaces — prefer menu layer (true “elevated” in theme defs) over raised
    "elevated_surface.background": c(
      "ui.menu.background",
      "ui.backgrounds.raised",
      "ui.backgrounds.surface",
      "background",
    ),
    "surface.background": ALPHA(surface),

    // Elements
    "element.background": elementBackground,
    "element.hover": elementHover,
    "element.active": elementActive,
    "element.selected": elementSelected,
    "element.disabled": c(
      "ui.elements.disabled.background",
      "ui.foregrounds.subtle",
    ),
    "drop_target.background": menuBackground,
    "element.selection.background": elementSelectionChrome,
    "ghost_element.background": subtleElementBackground,
    "ghost_element.hover": subtleElementHover,
    "ghost_element.active": subtleElementActive,
    "ghost_element.selected": subtleElementSelected,
    "ghost_element.disabled": subtleElementDisabled,

    // Text
    text: foreground,
    "text.muted": muted,
    "text.placeholder": c("ui.foregrounds.subtle", "ui.foregrounds.muted"),
    "text.disabled": c("ui.foregrounds.disabled", "ui.foregrounds.subtle"),
    "text.accent": accent,

    // Icons
    icon: c("ui.icon.foreground", "ui.foregrounds.default"),
    "icon.muted": c(
      "ui.icon.muted",
      "ui.foregrounds.muted",
      "ui.icon.foreground",
    ),
    "icon.disabled": c(
      "ui.icon.disabled",
      "ui.foregrounds.subtle",
      "ui.icon.muted",
      "ui.foregrounds.muted",
    ),
    "icon.placeholder": c("ui.foregrounds.subtle", "ui.foregrounds.muted"),
    "icon.accent": c(
      "ui.icon.accent",
      "ui.foregrounds.accent",
      "ui.accent.primary",
    ),

    // UI Components
    "status_bar.background": statusBarBg,
    "title_bar.background": statusBarBg,
    "title_bar.inactive_background": statusBarBg,
    "toolbar.background": statusBarBg,
    "tab_bar.background": tabBarBg,
    "tab.inactive_background": tabBg,
    "tab.active_background": tabActiveBg,
    "search.match_background": wordHighlightStrong,
    "panel.background": ALPHA(panelBg),
    "panel.overlay_background": c(
      "ui.backgrounds.overlay",
      "ui.backgrounds.surface",
      "background",
    ),
    "panel.focused_border": c(
      "ui.panels.focusedBorder",
      "ui.focus.border",
      "ui.borders.active",
      "ui.borders.default",
    ),
    "pane.focused_border": focusedBorder,
    "panel.indent_guide": c("ui.indentGuide.background", "ui.borders.subtle"),
    "panel.indent_guide_active": c(
      "ui.indentGuide.activeBackground",
      "ui.ruler.foreground",
      "ui.borders.active",
    ),
    "panel.indent_guide_hover": c(
      "ui.ruler.foreground",
      "ui.indentGuide.activeBackground",
      "ui.borders.active",
    ),
    "pane_group.border": borderSubtle,

    // Scrollbar
    "scrollbar.thumb.background": c(
      "ui.overrides.scrollbar.sliderBackground",
      "ui.borders.subtle",
    ),
    "scrollbar.thumb.hover_background": c(
      "ui.overrides.scrollbar.sliderHoverBackground",
      "ui.backgrounds.raised",
    ),
    "scrollbar.thumb.border": "#00000000",
    "scrollbar.track.background": "#00000000",
    "scrollbar.track.border": "#00000000",

    // Editor
    "editor.foreground": editorFg,
    "editor.background": c(
      "ui.overrides.editor.background",
      "ui.backgrounds.surface",
      "background",
    ),
    "editor.gutter.background": c(
      "ui.overrides.editorGutter.background",
      "ui.backgrounds.surface",
      "background",
    ),
    "editor.subheader.background": c(
      "ui.panels.titleBackground",
      "ui.elements.background",
      "ui.backgrounds.raised",
      "ui.backgrounds.surface",
    ),
    "editor.active_line.background": lineHighlight,
    "editor.highlighted_line.background": lineHighlight,
    "editor.line_number": lineNumber,
    "editor.active_line_number": activeLineNumber,
    "editor.hover_line_number": activeLineNumber,
    "editor.invisible": c("ui.whitespace.foreground", "ui.borders.subtle"),
    "editor.wrap_guide": c("ui.ruler.foreground", "ui.borders.subtle"),
    "editor.active_wrap_guide": c(
      "ui.ruler.foreground",
      "ui.indentGuide.activeBackground",
      "ui.borders.active",
    ),
    "editor.indent_guide": c("ui.indentGuide.background", "ui.borders.subtle"),
    "editor.indent_guide_active": c(
      "ui.indentGuide.activeBackground",
      "ui.borders.active",
    ),
    "editor.document_highlight.read_background": wordHighlight,
    "editor.document_highlight.write_background": wordHighlightStrong,
    "editor.document_highlight.bracket_background": c(
      "ui.highlights.word.border",
      "ui.highlights.word.backgroundStrong",
      "ui.highlights.word.background",
      "ui.selection.background",
    ),

    // Terminal
    "terminal.background": terminalBg,
    "terminal.ansi.background": terminalBg,
    "terminal.foreground": terminalFg,
    "terminal.bright_foreground": terminalFg,
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
    "link_text.hover": c(
      "ui.text.linkForeground",
      "ui.status.info.foreground",
      "ui.foregrounds.accent",
    ),

    // Version Control
    "version_control.added": gitAdded,
    "version_control.modified": gitModified,
    "version_control.deleted": gitDeleted,
    "version_control.word_added": c(
      "ui.git.wordAdded",
      "ui.git.added",
      "ui.status.success.foreground",
    ),
    "version_control.word_deleted": c(
      "ui.git.wordDeleted",
      "ui.git.deleted",
      "ui.status.error.foreground",
    ),
    "version_control.conflict_marker.ours": c(
      "ui.status.conflict.border",
      "ui.git.conflict",
    ),
    "version_control.conflict_marker.theirs": info,

    conflict: gitConflict,
    "conflict.background": gitConflict,
    "conflict.border": gitConflict,
    created: c(
      "ui.git.files.foreground.added",
      "ui.status.created.foreground",
      "ui.status.success.foreground",
    ),
    "created.background": c(
      "ui.git.diff.background.added",
      "ui.status.created.background",
      "ui.status.success.background",
    ),
    "created.border": c("ui.status.created.border", "ui.status.success.border"),
    deleted: c("ui.git.files.foreground.deleted", "ui.status.error.foreground"),
    "deleted.background": c(
      "ui.git.files.foreground.added",
      "ui.git.diff.background.deleted",
      "ui.status.error.background",
    ),
    "deleted.border": c("ui.status.error.border"),
    error,
    "error.background": c("ui.status.error.background", "ui.error.background"),
    "error.border": c("ui.status.error.border"),
    hidden: gitIgnored,
    "hidden.background": gitIgnored,
    "hidden.border": gitIgnored,
    hint: c("ui.status.hint.foreground", {
      themePath: "ui.status.info.foreground",
      h: (h) => h + 24,
    }),
    "hint.background": c(
      "ui.status.hint.background",
      "ui.status.info.background",
    ),
    "hint.border": c("ui.status.hint.border", "ui.status.info.border"),
    ignored: gitIgnored,
    "ignored.background": gitIgnored,
    "ignored.border": gitIgnored,
    info,
    "info.background": c("ui.status.info.background"),
    "info.border": c("ui.status.info.border"),
    modified: c(
      "ui.git.files.foreground.modified",
      "ui.git.diff.background.modified",
      "ui.status.modified.foreground",
      "ui.status.warning.foreground",
    ),
    "modified.background": c(
      "ui.status.modified.background",
      "ui.status.warning.background",
    ),
    "modified.border": c(
      "ui.status.modified.border",
      "ui.status.warning.border",
    ),
    predictive: c("ui.foregrounds.subtle", "ui.foregrounds.accent"),
    "predictive.background": c("ui.backgrounds.overlay"),
    "predictive.border": c("ui.borders.transparent"),
    renamed: c(
      "ui.git.renamed",
      "ui.git.added",
      "ui.status.success.foreground",
    ),
    "renamed.background": c(
      "ui.git.renamed",
      "ui.git.added",
      "ui.status.success.foreground",
    ),
    "renamed.border": c(
      "ui.git.renamed",
      "ui.git.added",
      "ui.status.success.foreground",
    ),
    success: c("ui.status.success.foreground"),
    "success.background": c("ui.status.success.background"),
    "success.border": c("ui.status.success.border"),
    unreachable: subtle,
    "unreachable.background": subtle,
    "unreachable.border": subtle,
    warning: c("ui.status.warning.foreground"),
    "warning.background": c("ui.status.warning.background"),
    "warning.border": c("ui.status.warning.border"),

    players,
    syntax,
    "search.active_match_background": wordHighlightStrong,
  };
}

/**
 * Map a ThemeDefinition to Zed theme format
 */
export function mapZed(
  theme: ThemeDefinitionExtended,
  options: BuildOptions = {},
): ZedThemeFile {
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
  const rawStyle = buildStyle(processedTheme, c);
  const _alph = applyAlpha(rawStyle, theme.backgroundAlpha);
  const saturatedStyle =
    options.maxSaturation === undefined
      ? rawStyle
      : applySaturationCap(rawStyle, options.maxSaturation);
  const style =
    options.redMaxSaturation === undefined &&
    options.redMinLightness === undefined
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

function applyAlpha(
  style: ZedThemeStyle,
  backgroundAlpha: number | undefined,
): ZedThemeStyle {
  if (backgroundAlpha === undefined) {
    return style;
  }
  const out: Record<string, unknown> = { ...style };
  for (const key in style) {
    const value = style[key as keyof ZedThemeStyle];
    // Arrays are objects in JS; spreading an array turns it into { "0": … } and breaks JSON.
    if (Array.isArray(value)) {
      const arr = value as unknown[];
      if (arr.every((v): v is string => typeof v === "string")) {
        out[key] = [...arr];
      } else {
        out[key] = arr.map((item) =>
          applyAlpha(item as unknown as ZedThemeStyle, backgroundAlpha),
        );
      }
    } else if (
      typeof value === "object" &&
      value !== null &&
      Object.getPrototypeOf(value) === Object.getPrototypeOf
    ) {
      out[key] = applyAlpha(value as unknown as ZedThemeStyle, backgroundAlpha);
    } else if (
      key.includes("background") &&
      typeof value === "string" &&
      value[0] === "#"
    ) {
      out[key] = new Color(value).alpha(backgroundAlpha).hexa();
    } else {
      out[key] = value;
    }
  }
  return out as unknown as ZedThemeStyle;
}

export default mapZed;
