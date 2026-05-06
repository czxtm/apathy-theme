/**
 * Obsidian Publish integration - maps ThemeDefinition to a Publish CSS theme.
 *
 * Color variables are generated from Apathy theme tokens, while the static
 * layout utilities are kept in sync with packages/obsidian/publish/reference.css.
 */

import { Color, toHex } from "../core/color";
import type { ThemeFilters } from "../filters";
import type { ThemeDefinition, ThemeDefinitionExtended } from "../themes/types";
import { strictColorFactory, uiFactory } from "../themes/types";
import {
	obsidianPublishStyleSettingsCss,
	obsidianStyleSettingsBlock,
} from "./obsidianStyleSettings";

export interface BuildOptions {
	/** Override filters (will merge with/override theme.filters) */
	filters?: ThemeFilters;
}

const referenceUrl = new URL(
	"../../packages/obsidian/publish/reference.css",
	import.meta.url,
);
const layoutStartMarker = ".alt-title .page-header,\n.hide-title .page-header";

let cachedReferenceLayout: string | undefined;

function slugify(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
}

function rgbTriplet(value: string): string {
	const color = new Color(value);
	return `${color.red()}, ${color.green()}, ${color.blue()}`;
}

function cssPercent(value: number): string {
	return `${Number(value.toFixed(2))}%`;
}

function formatVariables(vars: Record<string, string>): string {
	return Object.entries(vars)
		.map(([key, value]) => `  ${key}: ${value};`)
		.join("\n");
}

function calloutRule(type: string, color: string, themeType: string): string {
	const alternateThemeType = themeType === "dark" ? "light" : "dark";
	return `.theme-${themeType} .callout[data-callout="${type}"],
.theme-${alternateThemeType} .callout[data-callout="${type}"] {
  --callout-color: ${rgbTriplet(color)};
}`;
}

function publishBaseVars(): Record<string, string> {
	return {
		"--font-text-size": "16px",
		"--font-small": "13px",
		"--font-smaller": "11px",
		"--font-smallest": "10px",
		"--font-inputs": "13px",
		"--normal-weight": "400",
		"--bold-weight": "600",
		"--link-weight": "inherit",
		"--page-title-weight": "500",
		"--page-title-line-height": "1.1",
		"--page-title-size": "1.6em",
		"--page-title-color": "var(--tx1)",
		"--page-title-style": "normal",
		"--page-title-variant": "normal",
		"--page-title-font": "inherit",
		"--h1": "1.25em",
		"--h2": "1.1em",
		"--h3": "1.05em",
		"--h4": "1em",
		"--h5": "0.85em",
		"--h6": "0.85em",
		"--h1-weight": "600",
		"--h2-weight": "600",
		"--h3-weight": "600",
		"--h4-weight": "500",
		"--h5-weight": "500",
		"--h6-weight": "400",
		"--h1-variant": "normal",
		"--h2-variant": "normal",
		"--h3-variant": "normal",
		"--h4-variant": "normal",
		"--h5-variant": "small-caps",
		"--h6-variant": "small-caps",
		"--h1-style": "normal",
		"--h2-style": "normal",
		"--h3-style": "normal",
		"--h4-style": "normal",
		"--h5-style": "normal",
		"--h6-style": "normal",
		"--cards-min-width": "180px",
		"--cards-max-width": "1fr",
		"--cards-mobile-width": "180px",
		"--cards-image-height": "400px",
		"--cards-padding": "1.2em",
		"--cards-image-fit": "contain",
		"--cards-background": "transparent",
		"--cards-border-width": "1px",
		"--cards-aspect-ratio": "auto",
		"--cards-columns":
			"repeat(auto-fit, minmax(var(--cards-min-width), var(--cards-max-width)))",
		"--image-radius": "8px",
		"--img-grid-fit": "cover",
		"--img-grid-background": "transparent",
		"--image-grid-fit": "var(--img-grid-fit)",
		"--image-grid-background": "var(--img-grid-background)",
		"--img-grid-gap": "0.5rem",
		"--img-zoom-background": "rgba(0, 0, 0, 0.6)",
		"--img-zoom-max-width": "96%",
		"--img-zoom-max-height": "90vh",
		"--img-zoom-in-cursor": "zoom-in",
		"--img-zoom-out-cursor": "zoom-out",
		"--icon-muted": "0.5",
		"--border-width": "1px",
		"--folding-offset": "16px",
		"--nested-padding": "30px",
		"--list-padding": "2em",
		"--list-spacing": "0.075em",
		"--radius-s": "6px",
		"--radius-m": "8px",
		"--line-height-tight": "1.3",
		"--table-text-size": "var(--font-small)",
	};
}

function publishThemeVars(
	t: ThemeDefinitionExtended,
	c: ReturnType<typeof strictColorFactory>,
	ui: ReturnType<typeof uiFactory>,
): Record<string, string> {
	const base = c("ui.backgrounds.base", "background");
	const surface = c(
		"ui.backgrounds.surface",
		"ui.backgrounds.base",
		"background",
	);
	const raised = c(
		"ui.backgrounds.raised",
		"ui.backgrounds.surface",
		"background",
	);
	const darker = c(
		"ui.backgrounds.darker",
		"ui.backgrounds.surface",
		"ui.backgrounds.base",
		"background",
	);
	const text = c("ui.foregrounds.default");
	const muted = c("ui.foregrounds.muted");
	const subtle = c("ui.foregrounds.subtle", "ui.foregrounds.muted");
	const accent = c("ui.foregrounds.accent", "ui.accent.primary");
	const accentHover = new Color(accent).lighter(0.12).hexa();
	const accentHsl = new Color(accent).hsl();
	const border = c("ui.borders.default");
	const borderHover = c("ui.borders.active", "ui.borders.default");
	const borderSubtle = c("ui.borders.subtle", "ui.borders.default");
	const selection = c(
		"ui.selection.background",
		"ui.highlights.activeLine.background",
		"ui.backgrounds.raised",
	);
	const editorFg = ui("editor.foreground");
	const codeBg = c(
		"ui.backgrounds.codeBlock",
		"ui.backgrounds.surface",
		"background",
	);
	const inputBg = ui("input.background");
	const inputFg = ui("input.foreground");
	const error = c("ui.status.error.foreground");
	const warning = c("ui.status.warning.foreground");
	const info = c("ui.status.info.foreground");
	const success = c("ui.status.success.foreground");
	const purple = c("tokens.meta.macro", "tokens.types.default");
	const pink = c("tokens.meta.label", "ui.status.error.foreground");

	return {
		"--color-red-rgb": rgbTriplet(error),
		"--color-orange-rgb": rgbTriplet(warning),
		"--color-yellow-rgb": rgbTriplet(warning),
		"--color-green-rgb": rgbTriplet(success),
		"--color-cyan-rgb": rgbTriplet(info),
		"--color-purple-rgb": rgbTriplet(purple),
		"--color-pink-rgb": rgbTriplet(pink),
		"--color-red": error,
		"--color-orange": warning,
		"--color-yellow": warning,
		"--color-green": success,
		"--color-cyan": info,
		"--color-purple": purple,
		"--color-pink": pink,
		"--accent-h": `${Number(accentHsl.h.toFixed(2))}`,
		"--accent-s": cssPercent(accentHsl.s),
		"--accent-l": cssPercent(accentHsl.l),
		"--bg1": base,
		"--bg2": surface,
		"--bg3": raised,
		"--divider-color": borderSubtle,
		"--ui1": borderSubtle,
		"--ui2": border,
		"--ui3": borderHover,
		"--tx1": text,
		"--tx2": muted,
		"--tx3": subtle,
		"--tx4": editorFg,
		"--ax1": accent,
		"--ax2": accentHover,
		"--ax3": accent,
		"--hl1": selection,
		"--mono100": "white",
		"--mono0": "black",
		"--outline-heading-color-active": "var(--tx1)",
		"--sidebar-left-background": "var(--bg2)",
		"--background-primary": base,
		"--background-primary-alt": darker,
		"--background-secondary": surface,
		"--background-secondary-alt": base,
		"--background-tertiary": raised,
		"--background-table-rows": surface,
		"--background-modifier-form-field": inputBg,
		"--background-modifier-form-field-highlighted": inputBg,
		"--background-modifier-accent": "var(--ax3)",
		"--background-modifier-border": "var(--ui1)",
		"--background-modifier-border-hover": "var(--ui2)",
		"--background-modifier-border-focus": "var(--ui3)",
		"--background-modifier-success": "var(--color-green)",
		"--background-divider": "var(--ui1)",
		"--interactive-normal": "var(--bg3)",
		"--interactive-hover": "var(--ui1)",
		"--interactive-accent": "var(--ax3)",
		"--interactive-accent-hover": "var(--ax2)",
		"--interactive-accent-rgb": rgbTriplet(accent),
		"--quote-opening-modifier": "var(--ui2)",
		"--modal-border": "var(--ui2)",
		"--icon-color": "var(--tx2)",
		"--icon-color-hover": "var(--tx2)",
		"--icon-color-active": "var(--tx1)",
		"--icon-hex": "var(--mono0)",
		"--text-normal": text,
		"--text-bold": text,
		"--text-italic": text,
		"--text-muted": muted,
		"--text-faint": subtle,
		"--text-accent": accent,
		"--text-accent-hover": accentHover,
		"--text-on-accent": inputFg,
		"--text-selection": "var(--hl1)",
		"--text-code": "var(--tx4)",
		"--text-error": "var(--color-red)",
		"--text-blockquote": "var(--tx2)",
		"--text-highlight-bg": "var(--hl1)",
		"--title-color": "var(--tx1)",
		"--title-color-inactive": "var(--tx2)",
		"--h1-color": "var(--text-normal)",
		"--h2-color": "var(--text-normal)",
		"--h3-color": "var(--text-normal)",
		"--h4-color": "var(--text-normal)",
		"--h5-color": "var(--text-normal)",
		"--h6-color": "var(--text-muted)",
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
		"--caret-color": accent,
		"--border-color": "var(--ui1)",
		"--input-shadow": "none",
	};
}

async function referenceLayout(): Promise<string> {
	if (cachedReferenceLayout) return cachedReferenceLayout;

	const reference = await Bun.file(referenceUrl).text();
	const layoutStart = reference.indexOf(layoutStartMarker);
	if (layoutStart === -1) {
		throw new Error(
			`Could not find Publish layout start marker in ${referenceUrl.pathname}`,
		);
	}

	cachedReferenceLayout = reference.slice(layoutStart).trim();
	return cachedReferenceLayout;
}

export async function mapObsidianPublish(
	theme: ThemeDefinition,
	options?: BuildOptions,
): Promise<string> {
	const processedTheme: ThemeDefinitionExtended = {
		...theme,
		filters: {
			...theme.filters,
			...options?.filters,
		},
	} as ThemeDefinitionExtended;

	const c = strictColorFactory(
		processedTheme as unknown as ThemeDefinition<string>,
	);
	const ui = uiFactory(processedTheme);
	const vars = publishThemeVars(processedTheme, c, ui);
	const slug = slugify(theme.name);

	const info = c("ui.status.info.foreground");
	const success = c("ui.status.success.foreground");
	const warning = c("ui.status.warning.foreground");
	const error = c("ui.status.error.foreground");
	const accent = c("ui.accent.primary", "ui.foregrounds.accent");
	const quote = c("ui.foregrounds.muted");

	return `/**
 * ${theme.name} Theme for Obsidian Publish
 *
 * Generated from Apathy theme tokens.
 * Uses packages/obsidian/publish/reference.css as the static layout reference.
 */

${obsidianStyleSettingsBlock}

body.apathy-publish-theme-${slug},
body {
${formatVariables(publishBaseVars())}
}

@media (max-width:400pt) {
  body {
    --cards-min-width: var(--cards-mobile-width);
    --img-grid-gap: 0.25rem;
  }
}

body.apathy-publish-theme-${slug},
body,
.theme-dark.apathy-publish-theme-${slug},
body.theme-dark.apathy-publish-theme-${slug},
.theme-light.apathy-publish-theme-${slug},
body.theme-light.apathy-publish-theme-${slug},
.theme-dark,
.theme-light {
${formatVariables(vars)}
}

.published-container {
  --outline-heading-color-active: var(--tx1);
  --sidebar-left-background: var(--bg2);
}

${calloutRule("note", accent, theme.type)}
${calloutRule("abstract", accent, theme.type)}
${calloutRule("summary", accent, theme.type)}
${calloutRule("tldr", accent, theme.type)}
${calloutRule("info", info, theme.type)}
${calloutRule("todo", info, theme.type)}
${calloutRule("tip", success, theme.type)}
${calloutRule("success", success, theme.type)}
${calloutRule("check", success, theme.type)}
${calloutRule("done", success, theme.type)}
${calloutRule("question", warning, theme.type)}
${calloutRule("help", warning, theme.type)}
${calloutRule("faq", warning, theme.type)}
${calloutRule("warning", warning, theme.type)}
${calloutRule("caution", warning, theme.type)}
${calloutRule("attention", warning, theme.type)}
${calloutRule("failure", error, theme.type)}
${calloutRule("fail", error, theme.type)}
${calloutRule("missing", error, theme.type)}
${calloutRule("danger", error, theme.type)}
${calloutRule("error", error, theme.type)}
${calloutRule("bug", error, theme.type)}
${calloutRule("example", accent, theme.type)}
${calloutRule("quote", quote, theme.type)}

${obsidianPublishStyleSettingsCss}

${await referenceLayout()}
`;
}

export default mapObsidianPublish;
