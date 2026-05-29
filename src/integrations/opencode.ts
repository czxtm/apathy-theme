/**
 * OpenCode integration - maps ThemeDefinition to OpenCode TUI theme format.
 *
 * OpenCode themes live in `~/.config/opencode/themes/<name>.json` or
 * `.opencode/themes/<name>.json` per-project. The format uses a `defs`
 * section for named color variables and a `theme` section with dark/light
 * variants per semantic key.
 *
 * @see https://opencode.ai
 */

import { toHex } from "../core/color";
import type { ThemeFilters } from "../filters";
import type { ThemeDefinitionExtended } from "../themes/types";
import { get, strictColorFactory } from "../themes/types";

// ============================================================================
// OpenCode Theme Output Types
// ============================================================================

/**
 * Each theme color has a dark and light variant.
 * OpenCode resolves `defs` keys at runtime.
 */
interface DualColor {
	dark: string;
	light: string;
}

/**
 * Full OpenCode theme file format.
 */
export interface OpenCodeThemeFile {
	$schema: string;
	defs: Record<string, string>;
	theme: Record<string, DualColor>;
}

export interface BuildOptions {
	/** Override filters (will merge with/override theme.filters) */
	filters?: ThemeFilters;
}

// ============================================================================
// Mapping function
// ============================================================================

/**
 * Map a ThemeDefinition to an OpenCode-compatible theme file.
 *
 * Since apathy themes are dark-first, the `dark` variant uses the theme's
 * native colors. The `light` variant uses the same values — OpenCode
 * handles mode switching by selecting the appropriate variant at runtime.
 */
export function mapOpencode(
	source: ThemeDefinitionExtended,
	options?: BuildOptions,
): OpenCodeThemeFile {
	// Merge filters
	const filters: ThemeFilters = {
		...source.filters,
		...options?.filters,
	};

	const td: ThemeDefinitionExtended = {
		...source,
		filters: Object.keys(filters).length > 0 ? filters : undefined,
	};

	const sc = strictColorFactory(td);

	// Resolve colors from the theme definition
	const bgBase = sc("ui.backgrounds.base", "background");
	const bgSurface = sc("ui.backgrounds.surface", "background");
	const bgRaised = sc("ui.backgrounds.raised", "ui.backgrounds.surface", "background");
	const bgOverlay = sc("ui.backgrounds.overlay", "ui.backgrounds.raised", "background");

	const fg = sc("ui.foregrounds.default");
	const fgMuted = sc("ui.foregrounds.muted");
	const fgSubtle = sc("ui.foregrounds.subtle", "ui.foregrounds.muted");
	const fgAccent = sc("ui.foregrounds.accent", "ui.accent.primary");

	const border = sc("ui.borders.default");
	const borderActive = sc("ui.borders.active", "ui.borders.default");
	const borderSubtle = sc("ui.borders.subtle", "ui.borders.default");

	const primary = sc("ui.accent.primary");
	const secondary = sc("ui.accent.secondary", "ui.foregrounds.accent", "ui.accent.primary");

	const errorFg = sc("ui.status.error.foreground");
	const warningFg = sc("ui.status.warning.foreground");
	const successFg = sc("ui.status.success.foreground");
	const infoFg = sc("ui.status.info.foreground");

	const gitAdded = sc("ui.git.added", "ui.status.success.foreground");
	const gitModified = sc("ui.git.modified", "ui.status.warning.foreground");
	const gitDeleted = sc("ui.git.deleted", "ui.status.error.foreground");

	// Syntax colors
	const tokens = td.tokens;
	const synComment = toHex(tokens.comments);
	const synKeyword = get(tokens.keywords, "default");
	const synFunction = get(tokens.functions, "call") || get(tokens.functions, "default");
	const synVariable = get(tokens.variables, "default");
	const synString = get(tokens.strings, "default") || get(tokens.literals, "string");
	const synNumber = get(tokens.literals, "number") || get(tokens.literals, "default");
	const synType = get(tokens.types, "default");
	const synOperator = get(tokens.operators, "default");
	const synPunctuation = get(tokens.punctuation, "default");

	// Diff backgrounds
	const diffAddedBg = sc("ui.git.diff.background.added", "ui.status.success.background");
	const diffRemovedBg = sc("ui.git.diff.background.deleted", "ui.status.error.background");

	// Build defs — named color palette
	const defs: Record<string, string> = {};
	const defEntries: [string, string][] = [
		["bg", bgBase],
		["bgSurface", bgSurface],
		["bgRaised", bgRaised],
		["bgOverlay", bgOverlay],
		["fg", fg],
		["fgMuted", fgMuted],
		["fgSubtle", fgSubtle],
		["fgAccent", fgAccent],
		["primary", primary],
		["secondary", secondary],
		["error", errorFg],
		["warning", warningFg],
		["success", successFg],
		["info", infoFg],
		["border", border],
		["borderActive", borderActive],
		["borderSubtle", borderSubtle],
		["gitAdded", gitAdded],
		["gitModified", gitModified],
		["gitDeleted", gitDeleted],
		["diffAddedBg", diffAddedBg],
		["diffRemovedBg", diffRemovedBg],
		["diffContextBg", bgSurface],
		["synComment", synComment],
		["synKeyword", synKeyword],
		["synFunction", synFunction],
		["synVariable", synVariable],
		["synString", synString],
		["synNumber", synNumber],
		["synType", synType],
		["synOperator", synOperator],
		["synPunctuation", synPunctuation],
		["mdCode", synString],
	];

	for (const [key, value] of defEntries) {
		defs[key] = stripAlpha(value);
	}

	// Build theme — each key has dark and light variants.
	// Apathy is a dark theme, so both variants use the same dark colors.
	const dc = (key: string): DualColor => ({ dark: key, light: key });
	const hc = (hex: string): DualColor => {
		const clean = stripAlpha(hex);
		return { dark: clean, light: clean };
	};

	const themeColors: Record<string, DualColor> = {
		primary: dc("primary"),
		secondary: dc("secondary"),
		accent: dc("fgAccent"),
		error: dc("error"),
		warning: dc("warning"),
		success: dc("success"),
		info: dc("info"),
		text: dc("fg"),
		textMuted: dc("fgMuted"),
		background: dc("bg"),
		backgroundPanel: dc("bgSurface"),
		backgroundElement: dc("bgRaised"),
		border: dc("border"),
		borderActive: dc("borderActive"),
		borderSubtle: dc("borderSubtle"),
		diffAdded: dc("gitAdded"),
		diffRemoved: dc("gitDeleted"),
		diffContext: dc("fgMuted"),
		diffHunkHeader: dc("fgMuted"),
		diffHighlightAdded: dc("gitAdded"),
		diffHighlightRemoved: dc("gitDeleted"),
		diffAddedBg: dc("diffAddedBg"),
		diffRemovedBg: dc("diffRemovedBg"),
		diffContextBg: dc("diffContextBg"),
		diffLineNumber: dc("border"),
		diffAddedLineNumberBg: dc("diffAddedBg"),
		diffRemovedLineNumberBg: dc("diffRemovedBg"),
		markdownText: dc("fg"),
		markdownHeading: dc("primary"),
		markdownLink: dc("secondary"),
		markdownLinkText: dc("fgAccent"),
		markdownCode: dc("mdCode"),
		markdownBlockQuote: dc("fgMuted"),
		markdownEmph: dc("warning"),
		markdownStrong: hc(warningFg),
		markdownHorizontalRule: dc("borderSubtle"),
		markdownListItem: dc("primary"),
		markdownListEnumeration: dc("fgAccent"),
		markdownImage: dc("secondary"),
		markdownImageText: dc("fgAccent"),
		markdownCodeBlock: dc("fg"),
		syntaxComment: dc("synComment"),
		syntaxKeyword: dc("synKeyword"),
		syntaxFunction: dc("synFunction"),
		syntaxVariable: dc("synVariable"),
		syntaxString: dc("synString"),
		syntaxNumber: dc("synNumber"),
		syntaxType: dc("synType"),
		syntaxOperator: dc("synOperator"),
		syntaxPunctuation: dc("synPunctuation"),
	};

	return {
		$schema: "https://opencode.ai/theme.json",
		defs,
		theme: themeColors,
	};
}

/**
 * Strip alpha channel from a hex color (e.g. #A277FFAA → #A277FF).
 * Terminals don't support alpha in colors.
 */
function stripAlpha(hex: string): string {
	if (hex.startsWith("#") && hex.length === 9) {
		return hex.slice(0, 7);
	}
	return hex;
}

export default mapOpencode;
