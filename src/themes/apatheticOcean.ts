/**
 * Apathetic Ocean — hierarchical slate-style theme.
 *
 * Palette model:
 * - **Spine (H≈284°)**: all neutral UI chrome (surfaces, borders, body text, muted text).
 * - **Layers**: base → surface/darker → raised → elevated (menus) → overlay (α) share the spine.
 * - **Accents**: syntax/status colors use fixed hue families (`H.cyan`, `H.gold`, `H.indigo`, …)
 *   with OKLCH ramps so related tokens stay visually related.
 */

import { Color, type ColorInput, oklch, toHex } from "@/core/color";
import { SemanticTokenModifier } from "../types";
import type { SlimThemeDefinition, ThemeDefinition } from "./types";
import { make, normalizeTheme } from "./types";
import { lighten, mix, transparentize } from "./utils";

// ============================================================================
// 1. Palette spine — one neutral hue for chrome; accent hues as offsets
// ============================================================================

/** Same L as chrome surfaces so editor + sidebar share one plane */
const BG_L = 0.113;
const BG_C = 0.00905;
/** Ocean violet-blue: all UI neutrals share this hue */
const SPINE_H = 274;
const BG = oklch(BG_L, BG_C, SPINE_H);

/** Syntax / status accent hues (OKLCH h°), kept in narrow bands for cohesion */
const H = {
	spine: SPINE_H,
	cyan: 208,
	teal: 195,
	green: 145,
	gold: 92,
	orange: 48,
	coral: 18,
	rose: 12,
	magenta: 328,
	purple: 292,
	indigo: 268,
} as const;

/** Tertiary / disabled labels */
const MUTED_DIM = oklch(0.416, 0.02, SPINE_H);

const CHARCOAL = oklch(0.2, 0.01, SPINE_H);

const L_DARKER = 0.15;
const C_DARKER = 0.01;
const H_DARKER = SPINE_H;

/** Primary body text — softened vs pure white, same hue as chrome */
const SOFT_WHITE = oklch(0.688, 0.034, SPINE_H).alpha(0.88);

/** Secondary chrome text (sidebar, inactive title) */
const FG_MUTED = oklch(0.396, 0.0455, SPINE_H).alpha(0.812);

/** Focus / bright line text — below paper-white for smoother UI */
const FG_FOCUS = oklch(0.86, 0.006, SPINE_H);

const ACCENT = oklch(0.2, 0.01, SPINE_H);

// --- Layered surfaces: tight ΔL so panels read as one field, not stacked blocks ---
const SURFACE_L = 0.113;
const SURFACE_C = 0.0082;
/** Tabs / inputs — small lift from chrome (~0.01 L), same chroma family as surface */
const RAISED_L = 0.123;
const RAISED_C = 0.009;
/** Menus, lists — one more gentle step */
const ELEVATED_L = 0.131;
const ELEVATED_C = 0.01;
/** Floating focus / widgets — still subtle vs chrome */
const OVERLAY_L = 0.148;
const OVERLAY_C = 0.014;
const INPUT_L = 0.126;
const INPUT_C = 0.01;
/** Terminal well — darker than surrounding chrome so it sits below the UI plane */
const TERMINAL_L = BG_L - 0.02;
const TERMINAL_BG = oklch(TERMINAL_L, BG_C * 0.98, SPINE_H);

const elevated = oklch(ELEVATED_L, ELEVATED_C, SPINE_H);
/** Softer α so hover layers don’t read as opaque slabs */
const overlay = oklch(OVERLAY_L, OVERLAY_C, SPINE_H).alpha(0.58);
const inputBg = oklch(INPUT_L, INPUT_C, SPINE_H);

const bgcolors = {
	base: BG,
	darker: oklch(SURFACE_L, SURFACE_C, SPINE_H),
	muted: oklch(BG_L * 0.9, BG_C * 0.9, SPINE_H),
	surface: oklch(SURFACE_L, SURFACE_C, SPINE_H),
	raised: oklch(RAISED_L, RAISED_C, SPINE_H),
	overlay,
	codeBlock: oklch(L_DARKER * 0.75, C_DARKER * 1.1, H_DARKER),
	accent: CHARCOAL,
};

const fgcolors = (
	_bg: { l: number; c: number; h: number } = { l: BG_L, c: BG_C, h: SPINE_H },
) => {
	return {
		default: SOFT_WHITE,
		bright: SOFT_WHITE.set({
			l: (l) => l * 1.08,
		}),
		muted: FG_MUTED,
		subtle: MUTED_DIM.set({
			l: (l) => l * 0.98,
		}),
		accent: ACCENT,
		focused: FG_FOCUS,
	};
};
const fgbase = fgcolors(bgcolors.base.oklch());

/** Neutral borders — low contrast so panel edges feather instead of cutting */
const N = {
	border: toHex(oklch(0.28, 0.012, SPINE_H).alpha(0.45)),
	borderMuted: toHex(oklch(0.35, 0.012, SPINE_H).alpha(0.28)),
	tabRule: toHex(oklch(0.32, 0.01, SPINE_H).alpha(0.22)),
	focusHairline: toHex(oklch(0.5, 0.03, SPINE_H).alpha(0.06)),
	panelTitle: toHex(oklch(0.72, 0.025, SPINE_H).alpha(0.45)),
} as const;

/** Syntax & accent ramps — each family locks to one hue */
const syn = {
	/** Pastel UI accent (focus, links, Zed accents) — low chroma vs syntax cyan */
	accentUi: toHex(oklch(0.73, 0.036, 208)),
	cyan: toHex(oklch(0.72, 0.072, H.cyan)),
	ice: toHex(oklch(0.85, 0.07, H.teal)),
	seafoam: toHex(oklch(0.82, 0.06, H.teal)),
	softBlue: toHex(oklch(0.78, 0.06, H.cyan).alpha(0.81)),
	paleBlue: toHex(oklch(0.78, 0.12, H.cyan)),
	lightBlue: toHex(oklch(0.72, 0.14, 258)),
	exportBlue: toHex(oklch(0.68, 0.05, H.indigo)),
	importPurple: toHex(oklch(0.78, 0.1, H.purple)),
	wasabi: toHex(oklch(0.72, 0.1, H.green)),
	mint: toHex(oklch(0.88, 0.08, H.teal)),
	lime: toHex(oklch(0.88, 0.2, 118)),
	lightGreen: toHex(oklch(0.82, 0.1, 165)),
	linkGreen: toHex(oklch(0.84, 0.12, 155)),
	brightGreen: toHex(oklch(0.9, 0.14, 118)),
	addedGreen: toHex(oklch(0.58, 0.08, H.teal)),
	gitInserted: toHex(oklch(0.88, 0.18, 108)),
	gold: toHex(oklch(0.88, 0.14, H.gold)),
	amber: toHex(oklch(0.78, 0.16, H.orange)),
	yellow: toHex(oklch(0.9, 0.14, H.gold)),
	peach: toHex(oklch(0.9, 0.12, H.gold)),
	orange: toHex(oklch(0.72, 0.18, H.orange)),
	gitModified: toHex(oklch(0.58, 0.1, H.indigo)),
	crimson: toHex(oklch(0.45, 0.22, H.magenta)),
	razzmatazz: toHex(oklch(0.58, 0.28, H.magenta)),
	rose: toHex(oklch(0.72, 0.19, H.coral)),
	blush: toHex(oklch(0.78, 0.08, H.coral)),
	pink: toHex(oklch(0.82, 0.12, H.magenta).alpha(0.9)),
	coral: toHex(oklch(0.72, 0.18, H.orange)),
	errorRed: toHex(oklch(0.45, 0.18, 25)),
	errorRedForeground: toHex(oklch(0.52, 0.1, 15)),
	gitDeleted: toHex(oklch(0.52, 0.1, H.coral)),
	deletedRed: toHex(oklch(0.68, 0.14, H.coral)),
	lavender: toHex(oklch(0.68, 0.1, H.purple).alpha(0.81)),
	purple: toHex(oklch(0.72, 0.12, H.purple)),
	lilac: toHex(oklch(0.68, 0.16, H.magenta)),
	lightOrchid: toHex(oklch(0.78, 0.1, H.magenta)),
	paramPurple: toHex(oklch(0.62, 0.06, H.indigo)),
	accessor: toHex(oklch(0.58, 0.1, H.indigo)),
	namespace: toHex(oklch(0.88, 0.06, H.magenta)),
	classColor: toHex(oklch(0.68, 0.1, H.magenta)),
	tagName: toHex(oklch(0.42, 0.04, H.indigo)),
	taupe: toHex(oklch(0.55, 0.04, 75)),
	olive: toHex(oklch(0.45, 0.04, 55)),
	darkOlive: toHex(oklch(0.42, 0.04, 55)),
	propertyDef: toHex(oklch(0.52, 0.04, H.indigo)),
	propertyDecl: toHex(oklch(0.48, 0.04, 55)),
	warning: toHex(oklch(0.74, 0.065, H.orange)),
	/** Pastel blue — was harsh cyan via high chroma + hue ~200 */
	info: toHex(oklch(0.76, 0.042, 208)),
	ansiBlack: toHex(oklch(0.32, 0.04, H.indigo)),
	ansiBrightBlack: toHex(oklch(0.38, 0.04, H.indigo)),
	ansiRed: toHex(oklch(0.72, 0.14, H.coral)),
	ansiBrightRed: toHex(oklch(0.75, 0.16, H.coral)),
	ansiWhite: toHex(oklch(0.88, 0.01, SPINE_H)),
} as const;

export const palette = {
	background: bgcolors.base,
	gutterBg: bgcolors.darker,
	panelBg: bgcolors.raised,
	tabBg: bgcolors.raised,
	tabHeaderBg: bgcolors.raised,
	// Neutrals (spine-hued grays)
	white: toHex(FG_FOCUS),
	softWhite: toHex(SOFT_WHITE),
	steel: toHex(oklch(0.62, 0.03, SPINE_H)),
	mist: toHex(oklch(0.62, 0.04, SPINE_H).alpha(0.76)),
	charcoal: toHex(oklch(0.35, 0.03, SPINE_H)),
	muted: toHex(MUTED_DIM),
	gray: toHex(oklch(0.52, 0.03, SPINE_H)),
	lightGray: toHex(oklch(0.78, 0.02, SPINE_H)),
	faintGray: toHex(oklch(0.4, 0.03, SPINE_H)),
	iconMuted: toHex(oklch(0.52, 0.04, SPINE_H).alpha(0.72)),
	scrollbarBorder: N.border,

	accentUi: syn.accentUi,
	cyan: syn.cyan,
	ice: syn.ice,
	seafoam: syn.seafoam,
	softBlue: syn.softBlue,
	paleBlue: syn.paleBlue,
	lightBlue: syn.lightBlue,
	exportBlue: syn.exportBlue,
	importPurple: syn.importPurple,

	wasabi: syn.wasabi,
	mint: syn.mint,
	lime: syn.lime,
	lightGreen: syn.lightGreen,
	linkGreen: syn.linkGreen,
	markdownHeading: syn.lightGreen,
	brightGreen: syn.brightGreen,
	addedGreen: syn.addedGreen,
	gitInserted: syn.gitInserted,

	gold: syn.gold,
	amber: syn.amber,
	yellow: syn.yellow,
	peach: syn.peach,
	orange: syn.orange,
	gitModified: syn.gitModified,

	crimson: syn.crimson,
	razzmatazz: syn.razzmatazz,
	rose: syn.rose,
	blush: syn.blush,
	pink: syn.pink,
	coral: syn.coral,
	errorRed: syn.errorRed,
	errorRedForeground: syn.errorRedForeground,
	gitDeleted: syn.gitDeleted,
	deletedRed: syn.deletedRed,

	lavender: syn.lavender,
	purple: syn.purple,
	lilac: syn.lilac,
	lightOrchid: syn.lightOrchid,
	paramPurple: syn.paramPurple,
	accessor: syn.accessor,
	namespace: syn.namespace,
	classColor: syn.classColor,
	tagName: syn.tagName,

	taupe: syn.taupe,
	olive: syn.olive,
	darkOlive: syn.darkOlive,
	propertyDef: syn.propertyDef,
	propertyDecl: syn.propertyDecl,

	warning: syn.warning,
	info: syn.info,

	// UI (derived from layered surfaces)
	selection: toHex(oklch(0.38, 0.06, H.indigo).alpha(0.42)),
	selectionHighlight: toHex(oklch(0.42, 0.04, SPINE_H).alpha(0.32)),
	inactiveSelection: toHex(oklch(0.38, 0.05, H.indigo).alpha(0.24)),
	wordHighlight: toHex(oklch(0.4, 0.05, H.indigo).alpha(0.35)),
	wordHighlightStrong: toHex(oklch(0.45, 0.06, H.indigo).alpha(0.42)),
	findMatch: toHex(oklch(0.38, 0.08, H.indigo).alpha(0.55)),
	findMatchHighlight: toHex(oklch(0.28, 0.06, H.indigo).alpha(0.55)),
	lineHighlight: toHex(oklch(0.25, 0.04, H.indigo).alpha(0.35)),
	indentGuide: toHex(oklch(0.35, 0.04, H.magenta).alpha(0.28)),
	indentGuideActive: toHex(oklch(0.48, 0.08, H.magenta).alpha(0.28)),
	whitespace: toHex(oklch(0.35, 0.02, SPINE_H)),
	ruler: toHex(oklch(0.35, 0.04, H.magenta).alpha(0.28)),
	widgetBg: toHex(overlay),
	widgetBorder: toHex(oklch(0.55, 0.08, H.cyan).alpha(0.33)),
	widgetFg: toHex(oklch(0.88, 0.04, H.cyan).alpha(0.6)),
	suggestBg: toHex(elevated),
	listActive: toHex(oklch(0.38, 0.08, H.indigo).alpha(0.55)),
	focusBorder: N.focusHairline,
	tabBorder: N.tabRule,
	tabActiveBorder: toHex(oklch(0.88, 0.02, SPINE_H)),
	buttonBg: toHex(oklch(0.48, 0.14, H.purple).alpha(0.18)),
	buttonFg: toHex(oklch(0.82, 0.12, H.teal).alpha(0.73)),
	buttonBorder: toHex(oklch(0.35, 0.04, SPINE_H).alpha(0.35)),
	elementBg: toHex(oklch(0.48, 0.14, H.purple).alpha(0.18)),
	elementHover: toHex(oklch(0.52, 0.16, H.purple).alpha(0.18)),
	inputBg: toHex(inputBg),
	inputBorder: toHex(oklch(0.38, 0.03, SPINE_H).alpha(0.6)),

	ansiBlack: syn.ansiBlack,
	ansiBrightBlack: syn.ansiBrightBlack,
	ansiRed: syn.ansiRed,
	ansiBrightRed: syn.ansiBrightRed,
	ansiWhite: syn.ansiWhite,
};

export type PaletteValue = `${keyof typeof palette}`;

export const v = (k: PaletteValue): PaletteValue => k;

// ============================================================================
// 2. Theme Definition
// ============================================================================

const backgrounds: ThemeDefinition["ui"]["backgrounds"] = {
	base: palette.background,
	surface: Color.create(bgcolors.surface),
	raised: bgcolors.raised,
	overlay: bgcolors.overlay,
	darker: bgcolors.darker,
	codeBlock: bgcolors.codeBlock,
};
const foregrounds: ThemeDefinition["ui"]["foregrounds"] = {
	default: fgbase.default,
	muted: fgbase.muted,
	subtle: fgbase.default,
	accent: Color.create(palette.accentUi),
	focused: fgbase.focused,
};
const borders: ThemeDefinition["ui"]["borders"] = {
	default: palette.focusBorder,
	active: toHex(oklch(0.38, 0.04, H.indigo).alpha(0.45)),
	subtle: palette.tabBorder,
	separator: toHex(oklch(0.3, 0.012, SPINE_H).alpha(0.2)),
};
const accent: ThemeDefinition["ui"]["accent"] = {
	primary: palette.accentUi,
	primaryForeground: palette.brightGreen,
	secondary: palette.gold,
};
/** Lerp each OKLCH channel toward the anchor reference (weights 0–1). */
const pullToward = (weight: number, ref: number) => (n: number) =>
	n + (ref - n) * weight;

const pullHueToward = (weight: number, refDeg: number) => (n: number) => {
	const nh = ((n % 360) + 360) % 360;
	const rh = ((refDeg % 360) + 360) % 360;
	let delta = rh - nh;
	if (delta > 180) delta -= 360;
	if (delta < -180) delta += 360;
	return nh + delta * weight;
};

type AnchorWeights = { h?: number; c?: number; l?: number };
const DEFAULT_ANCHOR_WEIGHTS: AnchorWeights = {
	h: 0.1,
	c: 0.2,
	l: 0.1,
};

/** Pulls input colors partway toward anchor `c` in OKLCH (replaces broken log-scale multipliers). */
const mkAnchor =
	(c: Color, opts: AnchorWeights = DEFAULT_ANCHOR_WEIGHTS) =>
	(color: ColorInput) => {
		const ref = c.oklch();
		const patch: Record<string, (n: number) => number> = {};
		if (opts.l !== undefined) patch.l = pullToward(opts.l, ref.l);
		if (opts.c !== undefined) patch.c = pullToward(opts.c, ref.c);
		if (opts.h !== undefined) patch.h = pullHueToward(opts.h, ref.h);
		return Object.keys(patch).length
			? Color.create(color).set(patch)
			: Color.create(color);
	};

const bgAnchors = {
	base: mkAnchor(bgcolors.base),
	darker: mkAnchor(bgcolors.darker),
	muted: mkAnchor(bgcolors.muted),
	surface: mkAnchor(bgcolors.surface),
	raised: mkAnchor(bgcolors.raised),
	overlay: mkAnchor(bgcolors.overlay),
	codeBlock: mkAnchor(bgcolors.codeBlock),
	accent: mkAnchor(bgcolors.accent),
};
const fgAnchors = {
	default: mkAnchor(fgbase.default),
	muted: mkAnchor(fgbase.muted),
	subtle: mkAnchor(fgbase.subtle),
	accent: mkAnchor(fgbase.accent),
	focused: mkAnchor(fgbase.focused),
};

/** Status badge / toast chroma — keep low so info/error/success read pastel, not neon */
const STATUS_L = 0.88;
const STATUS_C = 0.062;
/** Info sits in the cyan band; extra desaturation vs other status hues */
const STATUS_C_INFO = 0.048;
const STATUS_HUES = {
	error: 340,
	warning: 30,
	/** Slightly sea-blue vs pure cyan (200°) so it doesn’t read “electric” */
	info: 208,
	success: 142,
} as const;
const statusColors = {
	error: oklch(STATUS_L, STATUS_C, STATUS_HUES.error),
	warning: oklch(STATUS_L, STATUS_C, STATUS_HUES.warning),
	info: oklch(STATUS_L, STATUS_C_INFO, STATUS_HUES.info),
	success: oklch(STATUS_L, STATUS_C, STATUS_HUES.success),
};
const hover = (c: Color) =>
	c.set({
		l: (l) => Math.min(1, l * 1.05),
		c: (cch) => cch * 1.05,
		h: (h) => h,
		alpha: (a) => a * 0.97,
	});
const active = (c: Color) =>
	c.set({
		l: (l) => Math.min(1, l * 1.05),
		c: (cch) => cch * 1.05,
		h: (h) => h,
		alpha: (a) => a * 0.97,
	});
const selected = (c: Color) =>
	c.set({
		l: (l) => Math.min(1, l * 1.05),
		c: (cch) => cch * 1.05,
		h: (h) => h,
		alpha: (a) => a * 0.97,
	});
const disabled = (c: Color) =>
	c.set({
		l: (l) => l * 0.92,
		c: (cch) => cch * 0.92,
		h: (h) => h,
		alpha: (a) => a * 0.85,
	});

const mkStates = <T extends Color | ColorInput>(c: T) => {
	return {
		default: c,
		hover: hover(Color.create(c)),
		active: active(Color.create(c)),
		selected: selected(Color.create(c)),
		disabled: disabled(Color.create(c)),
	};
};

const mkElement = (c: Color) => {
	const bg = bgAnchors.base(c);
	const fg = fgAnchors.default(c);

	return {
		background: mkStates(bg),
		foreground: mkStates(fg),
		border: mkStates(bg.mix(fg, 0.1)),
	};
};
const mutedElement = mkElement(bgcolors.surface);
const baseElement = mkElement(bgcolors.base);

const statusElements = {
	error: mkElement(statusColors.error),
	warning: mkElement(statusColors.warning),
	info: mkElement(statusColors.info),
	success: mkElement(statusColors.success),
};

const git: ThemeDefinition["ui"]["git"] = {
	added: palette.addedGreen,
	modified: palette.gitModified,
	deleted: palette.gitDeleted,
	untracked: palette.addedGreen,
	ignored: "#515670",
	conflict: palette.deletedRed,
	submodule: toHex(FG_MUTED),
};
const ui: SlimThemeDefinition["ui"] = {
	backgrounds,
	foregrounds,
	borders,
	accent,
	status: {
		error: {
			background: statusElements.error.background.default,
			foreground: palette.rose,
			border: statusElements.error.border.default,
		},
		warning: {
			background: statusElements.warning.background.default,
			foreground: palette.gold,
			border: statusElements.warning.border.default,
		},
		info: {
			background: statusElements.info.background.default,
			foreground: palette.info,
			border: statusElements.info.border.default,
		},
		success: {
			background: statusElements.success.background.default,
			foreground: statusElements.success.foreground.default,
			border: statusElements.success.border.default,
		},
	},
	selection: {
		background: palette.selection,
		backgroundInactive: palette.inactiveSelection,
		text: palette.white,
	},
	git,
	cursor: {
		foreground: palette.white,
	},
	window: {
		activeBorder: palette.focusBorder,
	},
	suggestWidget: {
		background: palette.suggestBg,
		border: palette.widgetBorder,
		foreground: palette.widgetFg,
	},
	lineNumbers: {
		activeForeground: palette.softWhite,
		foreground: palette.charcoal,
	},
	inlineHints: {
		border: palette.scrollbarBorder,
		background: lighten(palette.background, 0.2),
		foreground: palette.muted,
	},
	subtleElements: {
		background: mutedElement.background.default,
		foreground: mutedElement.foreground.default,
		active: mutedElement.foreground.active,
		hover: mutedElement.foreground.hover,
		selected: mutedElement.foreground.selected,
		disabled: mutedElement.foreground.disabled,
		border: mutedElement.border.default,
	},
	elements: {
		background: backgrounds.surface,
		hover: baseElement.foreground.hover,
		active: baseElement.foreground.active,
		selected: baseElement.foreground.selected,
		disabled: baseElement.foreground.disabled,
		border: baseElement.border.default,
		foreground: baseElement.foreground.default,
	},
	panels: {
		background: backgrounds.surface,
		border: palette.tabBorder,
		foreground: foregrounds.default,
		titleBackground: backgrounds.surface,
		titleForeground: foregrounds.default,
	},
	icon: {
		/** Brighter than body-muted so toolbar / activity icons read on dark chrome */
		foreground: palette.steel,
	},
	menu: {
		background: toHex(elevated),
		foreground: fgbase.default,
		selectionBackground: palette.selection,
		selectionForeground: fgbase.default,
		separatorBackground: "#161621",
	},
	debug: {
		infoForeground: palette.info,
		warningForeground: palette.gold,
		errorForeground: palette.rose,
		sourceForeground: fgbase.default,
	},
	text: {
		linkForeground: palette.accentUi,
		preformatBackground: toHex(elevated),
		preformatForeground: fgbase.default,
	},
	peekView: {
		titleDescriptionForeground: FG_MUTED,
	},
	indentGuide: {
		activeBackground: palette.indentGuideActive,
		background: palette.indentGuide,
	},
	ruler: {
		foreground: palette.ruler,
	},
	whitespace: {
		foreground: palette.whitespace,
	},
	error: {
		background: transparentize(palette.errorRed, 0.5),
		listForeground: palette.errorRedForeground,
	},
	// panels: {
	//   background: palette.panelBg,
	//   border: palette.tabBorder,
	// },
	// tabs: {
	//   headerBackground: palette.tabHeaderBg,
	//   border: palette.tabBorder,
	//   activeBorder: palette.tabActiveBorder,
	// },
	// indentGuide: {
	//   default: palette.indentGuide,
	//   active: palette.indentGuideActive,
	// },
	// ruler: {
	//   color: palette.ruler,
	// },
};
const overrides = {
	editor: {
		background: palette.background,
		foreground: palette.mist,
		lineHighlight: palette.lineHighlight,
		lineHighlightBorder: palette.lineHighlight,
		lineNumberActiveForeground: palette.softWhite,
		lineNumberForeground: palette.charcoal,
		inactiveSelectionBackground: palette.inactiveSelection,
		selectionBackground: palette.selection,
		selectionHighlightBackground: palette.selectionHighlight,
		findMatchBackground: palette.findMatch,
		findMatchHighlightBackground: palette.findMatchHighlight,
		findRangeHighlightBackground: "#39324952",
		// line: palette.selectionHighlight,
		// wordHighlight: palette.wordHighlight,
		// wordHighlightStrong: palette.wordHighlightStrong,
		// findMatchHighlight: palette.findMatchHighlight,
		// findMatch: palette.findMatch,
		// rangeHighlight: "#2A244120",
	},
	editorGutter: {
		background: bgcolors.darker,
		modifiedBackground: "#e9c162c0",
		addedBackground: "#0a2b20ff",
		deletedBackground: "#2c0c15ff",
		foldingControl: palette.charcoal,
	},
	editorLineNumber: {
		foreground: "#454148",
		activeForeground: "#9B8FB5",
	},
	activityBar: {
		background: palette.gutterBg,
		foreground: palette.steel,
		inactiveForeground: "#45414C",
		border: palette.gutterBg,
		badgeBackground: "#FF7A0000",
		badgeForeground: palette.brightGreen,
	},
	sideBar: {
		background: palette.gutterBg,
		foreground: toHex(FG_MUTED),
		border: palette.gutterBg,
		sectionHeaderBackground: "#0f0e1000",
		sectionHeaderForeground: "#e3e1e8b7",
	},
	panel: {
		background: palette.gutterBg,
		foreground: palette.steel,
		border: palette.focusBorder,
		titleActiveForeground: palette.steel,
		titleInactiveForeground: "#E0E0E0",
		titleActiveBorder: N.panelTitle,
	},
	statusBar: {
		background: palette.gutterBg,
		foreground: "#5f6384b8",
		border: "#ffffff00",
		debuggingBackground: "#3fffbdf2",
		debuggingForeground: "#5b0092",
		noFolderBackground: "#0B0915",
		noFolderForeground: palette.muted,
	},
	tabs: {
		activeBackground: palette.tabBg,
		activeForeground: palette.steel,
		activeBorder: palette.tabActiveBorder,
		activeBorderTop: palette.tabActiveBorder,
		inactiveBackground: palette.gutterBg,
		inactiveForeground: palette.lightGray,
		hoverBackground: palette.tabBg,
		hoverForeground: palette.white,
		unfocusedActiveBackground: palette.tabBg,
		unfocusedActiveForeground: palette.muted,
		modifiedBorder: palette.gold,
	},
	list: {
		activeSelectionBackground: palette.listActive,
		activeSelectionForeground: "#E6E2D1",
		inactiveSelectionBackground: palette.suggestBg,
		inactiveSelectionForeground: "#E6E2D1",
		hoverBackground: toHex(oklch(0.38, 0.026, SPINE_H).alpha(0.18)),
		hoverForeground: "#E6E2D1",
		focusBackground: palette.listActive,
		focusForeground: "#E6E2D1",
		highlightForeground: palette.gold,
	},
	input: {
		background: palette.inputBg,
		foreground: "#ffffff99",
		border: palette.inputBorder,
		placeholderForeground: "#b5b5b545",
	},
	button: {
		background: palette.buttonBg,
		foreground: palette.buttonFg,
		hoverBackground: "#8d61ff2e",
		border: palette.tabBorder,
		secondaryBackground: "#17161e54",
		secondaryForeground: "#d0d5dbba",
		secondaryHoverBackground: "#2b293754",
	},
	dropdown: {
		background: palette.suggestBg,
		foreground: "#E6E2D1",
		border: N.border,
		listBackground: palette.suggestBg,
	},
	badge: {
		background: "#0b0b19c9",
		foreground: "#82aaffd4",
	},
	scrollbar: {
		shadow: "#00000080",
		sliderBackground: "#45414C40",
		sliderHoverBackground: "#45414C80",
		sliderActiveBackground: "#45414C",
	},
	minimap: {
		background: palette.background,
		selectionHighlight: palette.selection,
		errorHighlight: palette.errorRed,
		warningHighlight: palette.warning,
		findMatchHighlight: palette.findMatch,
	},
	breadcrumb: {
		background: palette.background,
		foreground: "default",
		focusForeground: "#E6E2D1",
		activeSelectionForeground: palette.yellow,
	},
	terminal: {
		background: toHex(TERMINAL_BG),
		foreground: "#626274",
		cursorForeground: palette.white,
		selectionBackground: palette.selection,
		cursor: palette.white,
		ansiBlack: palette.ansiBlack,
		ansiRed: "#ff00af",
		ansiGreen: palette.brightGreen,
		ansiYellow: palette.yellow,
		ansiBlue: "#ac82ff",
		ansiMagenta: palette.purple,
		ansiCyan: "#80d3c4",
		ansiWhite: palette.ansiWhite,
		ansiBrightBlack: palette.ansiBrightBlack,
		ansiBrightRed: palette.ansiBrightRed,
		ansiBrightGreen: "#D7F2A6",
		ansiBrightYellow: "#FFE082",
		ansiBrightBlue: "#9EC3FF",
		ansiBrightMagenta: "#DDA4FF",
		ansiBrightCyan: "#A3EEFF",
		ansiBrightWhite: "#FFFFFF",
	},
	notification: {
		background: palette.widgetBg,
		foreground: palette.white,
		border: N.border,
	},
	peekView: {
		editorBackground: "#0F0D1A",
		editorBorder: N.border,
		resultBackground: palette.suggestBg,
		resultSelectionBackground: palette.listActive,
		titleBackground: "#0B0915",
		titleForeground: "#E6E2D1",
	},
	diffEditor: {
		insertedTextBackground: "#061611d9",
		removedTextBackground: "#290011cc",
		insertedLineBackground: "#091511",
		removedLineBackground: "#12080b",
		diagonalFill: N.border,
	},
	merge: {
		currentHeaderBackground: palette.suggestBg,
		incomingHeaderBackground: palette.suggestBg,
		commonHeaderBackground: palette.suggestBg,
		currentContentBackground: "#34727E",
		incomingContentBackground: "#B79251",
		commonContentBackground: mix("#45414C", palette.background, 0.3),
	},
};

const apatheticOceanSource = {
	name: "apathy /// storm",
	type: "dark",
	palette,
	background: palette.background,

	syntax: {
		source: palette.softWhite,
		comments: palette.charcoal,
		strings: make({
			default: palette.wasabi,
			regex: palette.rose,
		}),
		operators: {
			default: palette.razzmatazz,
		},
		special: {
			jsxClass: palette.charcoal,
		},
		literals: {
			default: palette.cyan,
			string: palette.wasabi,
			regex: palette.rose,
		},

		keywords: {
			default: palette.softBlue,
			control: "#e3e1e8a8",
			declaration: palette.gray,
			import: palette.importPurple,
			modifier: "#5b6467",
			operator: palette.razzmatazz,
		},

		variables: {
			default: "#e3e1e8c7",
			local: palette.steel,
			parameter: palette.paramPurple,
			global: palette.amber,
		},

		constants: {
			default: palette.cyan,
			userDefined: palette.steel,
		},

		functions: {
			default: "#f5e0dc",
			declaration: palette.seafoam,
			builtin: palette.seafoam,
		},

		types: {
			default: palette.lightOrchid,
			interface: palette.ice,
			typeParameter: palette.ice,
			namespace: palette.namespace,
		},

		punctuation: {
			default: palette.faintGray,
			definition: "#362942",
			bracket: "#362942",
			accessor: palette.accessor,
		},

		meta: {
			default: palette.lightOrchid,
			decorator: palette.pink,
			label: palette.softBlue,
		},
		storage: {
			default: "#5b6467",
		},
	},

	languageOverrides: {
		python: {
			functions: {
				default: palette.yellow,
				declaration: palette.yellow,
				call: "#96d5ce",
			},
			storage: {
				default: "#fe90a0",
				type: "#fe90a0",
			},
		},
		go: {
			functions: {
				default: "#73bf9c",
			},
		},
	},

	// Modifier handlers
	modifiers: {
		[SemanticTokenModifier.documentation]: {
			global: { foreground: palette.muted, fontStyle: "italic" },
		},
		[SemanticTokenModifier.static]: {
			global: { fontStyle: "" },
		},
		[SemanticTokenModifier.deprecated]: {
			global: { fontStyle: "strikethrough" },
		},
		[SemanticTokenModifier.modification]: {
			global: { foreground: "#ffd014d4" },
		},
		[SemanticTokenModifier.async]: {
			transform: (color: string) => new Color(color).mix(palette.softBlue, 0.1),
		},
	},

	ui,
	componentOverrides: overrides,
	extraColors: {
		"editorHoverWidget.background": palette.widgetBg,
		"editorHoverWidget.border": palette.widgetBorder,
		"editorHoverWidget.foreground": palette.widgetFg,
		"notifications.background": palette.widgetBg,
		"terminal.dropBackground": toHex(elevated),
		"tree.indentGuidesStroke": palette.tabBorder,
	},
} satisfies SlimThemeDefinition;

export const apatheticOcean: ThemeDefinition =
	normalizeTheme(apatheticOceanSource);

export default apatheticOcean;
