/**
 * Obsidian integration - maps ThemeDefinition to an Obsidian CSS snippet.
 *
 * The output focuses on standard Obsidian CSS variables plus callout colors so
 * it works well with layout snippet collections like obsidian-modular-css-layout.
 */

import type { ThemeDefinition, ThemeDefinitionExtended } from "../themes/types";
import { strictColorFactory, uiFactory } from "../themes/types";
import type { ThemeFilters } from "../filters";
import { Color, toHex } from "../core/color";

export interface BuildOptions {
  /** Override filters (will merge with/override theme.filters) */
  filters?: ThemeFilters;
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function rgbTriplet(value: string): string {
  const color = new Color(value);
  return `${color.red()}, ${color.green()}, ${color.blue()}`;
}

function obsidianVars(
  t: ThemeDefinitionExtended,
  c: ReturnType<typeof strictColorFactory>,
  ui: ReturnType<typeof uiFactory>,
): Record<string, string> {
  const base = c("ui.backgrounds.base", "background");
  const surface = c("ui.backgrounds.surface", "ui.backgrounds.base", "background");
  const raised = c("ui.backgrounds.raised", "ui.backgrounds.surface", "background");
  const overlay = c("ui.backgrounds.overlay", "ui.backgrounds.raised", "ui.backgrounds.surface");
  const darker = c("ui.backgrounds.darker", "ui.backgrounds.surface", "ui.backgrounds.base", "background");
  const text = c("ui.foregrounds.default");
  const muted = c("ui.foregrounds.muted");
  const subtle = c("ui.foregrounds.subtle", "ui.foregrounds.muted");
  const accent = c("ui.foregrounds.accent", "ui.accent.primary");
  const accentHover = new Color(accent).lighter(0.12).hexa();
  const border = c("ui.borders.default");
  const borderHover = c("ui.borders.active", "ui.borders.default");
  const borderSubtle = c("ui.borders.subtle", "ui.borders.default");
  const selection = c("ui.selection.background", "ui.highlights.activeLine.background", "ui.backgrounds.raised");
  const editorBg = ui("editor.background");
  const editorFg = ui("editor.foreground");
  const codeBg = c("ui.backgrounds.codeBlock", "ui.backgrounds.surface", "background");
  const activeLine = ui("editor.lineHighlight");
  const activeLineBorder = ui("editor.lineHighlightBorder");
  const inputBg = ui("input.background");
  const inputFg = ui("input.foreground");
  const inputPlaceholder = ui("input.placeholderForeground");
  const error = c("ui.status.error");
  const warning = c("ui.status.warning");
  const info = c("ui.status.info");
  const success = c("ui.status.success");

  return {
    "--background-primary": base,
    "--background-primary-alt": darker,
    "--background-secondary": surface,
    "--background-secondary-alt": raised,
    "--background-modifier-cover": overlay,
    "--background-modifier-hover": raised,
    "--background-modifier-active-hover": selection,
    "--background-modifier-border": border,
    "--background-modifier-border-hover": borderHover,
    "--background-modifier-border-focus": activeLineBorder,
    "--background-modifier-form-field": inputBg,
    "--text-normal": text,
    "--text-muted": muted,
    "--text-faint": subtle,
    "--text-accent": accent,
    "--text-accent-hover": accentHover,
    "--interactive-normal": surface,
    "--interactive-hover": raised,
    "--interactive-accent": accent,
    "--interactive-accent-hover": accentHover,
    "--interactive-success": success,
    "--interactive-warning": warning,
    "--interactive-accent-rgb": rgbTriplet(accent),
    "--text-highlight-bg": selection,
    "--text-selection": selection,
    "--titlebar-background": darker,
    "--titlebar-background-focused": base,
    "--titlebar-text-color": muted,
    "--titlebar-text-color-focused": text,
    "--nav-item-background-hover": raised,
    "--nav-item-background-active": selection,
    "--nav-item-color": muted,
    "--nav-item-color-hover": text,
    "--nav-item-color-active": text,
    "--tab-background-active": base,
    "--tab-background-inactive": darker,
    "--tab-text-color": muted,
    "--tab-text-color-active": text,
    "--tab-outline-color": border,
    "--tab-divider-color": borderSubtle,
    "--icon-color": muted,
    "--icon-color-hover": text,
    "--icon-color-focused": accent,
    "--code-background": codeBg,
    "--code-normal": editorFg,
    "--code-comment": toHex(t.tokens.comments),
    "--code-function": toHex(t.tokens.functions.default),
    "--code-keyword": toHex(t.tokens.keywords.default),
    "--code-string": toHex(t.tokens.strings.default),
    "--code-value": toHex(t.tokens.literals.default),
    "--code-operator": toHex(t.tokens.operators.default),
    "--blockquote-background-color": raised,
    "--blockquote-border-color": border,
    "--hr-color": borderSubtle,
    "--prompt-border-color": border,
    "--prompt-results-background": surface,
    "--prompt-results-border-color": border,
    "--caret-color": accent,
    "--cursor-line-background": activeLine,
    "--editor-background": editorBg,
    "--editor-foreground": editorFg,
    "--input-shadow": "none",
    "--text-error": error,
    "--text-warning": warning,
    "--text-success": success,
    "--text-on-accent": c("ui.accent.primaryForeground", "ui.foregrounds.default"),
    "--color-red-rgb": rgbTriplet(error),
    "--color-orange-rgb": rgbTriplet(warning),
    "--color-cyan-rgb": rgbTriplet(info),
    "--color-green-rgb": rgbTriplet(success),
    "--callout-border-width": "1px",
    "--callout-radius": "8px",
    "--metadata-label-text-color": subtle,
    "--metadata-input-background": inputBg,
    "--metadata-input-text-color": inputFg,
    "--metadata-input-text-color-active": inputFg,
    "--metadata-input-text-color-placeholder": inputPlaceholder,
    "--metadata-input-background-hover": raised,
    "--metadata-input-border-color": border,
  };
}

function formatVariables(vars: Record<string, string>): string {
  return Object.entries(vars)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join("\n");
}

function calloutRule(type: string, color: string): string {
  return `.theme-dark .callout[data-callout="${type}"] {\n  --callout-color: ${rgbTriplet(color)};\n}`;
}

export function mapObsidian(
  theme: ThemeDefinition,
  options?: BuildOptions,
): string {
  const processedTheme: ThemeDefinitionExtended = {
    ...theme,
    filters: {
      ...theme.filters,
      ...options?.filters,
    },
  } as ThemeDefinitionExtended;

  const c = strictColorFactory(processedTheme as unknown as ThemeDefinition<string>);
  const ui = uiFactory(processedTheme);
  const vars = obsidianVars(processedTheme, c, ui);
  const slug = slugify(theme.name);

  const info = c("ui.status.info");
  const success = c("ui.status.success");
  const warning = c("ui.status.warning");
  const error = c("ui.status.error");
  const accent = c("ui.accent.primary", "ui.foregrounds.accent");
  const quote = c("ui.foregrounds.muted");

  return `/**
 * ${theme.name} Theme for Obsidian
 *
 * Generated from Apathy theme tokens.
 * Designed to work well with Obsidian and layout snippets like
 * https://github.com/efemkay/obsidian-modular-css-layout
 */

.theme-${theme.type}.apathy-theme-${slug},
body.theme-${theme.type}.apathy-theme-${slug},
.theme-${theme.type} {
${formatVariables(vars)}
}

${calloutRule("note", accent)}
${calloutRule("abstract", accent)}
${calloutRule("summary", accent)}
${calloutRule("tldr", accent)}
${calloutRule("info", info)}
${calloutRule("todo", info)}
${calloutRule("tip", success)}
${calloutRule("success", success)}
${calloutRule("check", success)}
${calloutRule("done", success)}
${calloutRule("question", warning)}
${calloutRule("help", warning)}
${calloutRule("faq", warning)}
${calloutRule("warning", warning)}
${calloutRule("caution", warning)}
${calloutRule("attention", warning)}
${calloutRule("failure", error)}
${calloutRule("fail", error)}
${calloutRule("missing", error)}
${calloutRule("danger", error)}
${calloutRule("error", error)}
${calloutRule("bug", error)}
${calloutRule("example", accent)}
${calloutRule("quote", quote)}
`;
}

export default mapObsidian;
