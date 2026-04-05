import {
	make,
	type ComponentOverrides,
	type SyntaxDefinition,
	type ThemeDefinition,
	type UserInterface,
	type ColorLike,
} from "./types";
import { SemanticTokenModifier } from "../types";
import { Color, mkElementColors, oklch } from "../core/color";
import {
	darken,
	l10,
	lighten,
	mix,
	transparentize,
} from "./utils";

// ============================================================================
// Seeds — the DNA of the minted palette
// ============================================================================

export const H = 285;     // surface hue (purple-blue)
export const C = 0.015;   // surface chroma (very desaturated)
export const L = 0.158;   // base background lightness

export const SL = 0.82;    // syntax lightness center
export const SC = 0.09;    // syntax chroma center

// Syntax hues — each role's hue angle
export const hue = {
	string: 127,
	function: 165,
	type: 185,
	literal: 214,
	keyword: 289,
	decorator: 50,
	label: 334,
	operator: 6,
	storage: 270,
} as const;

// ============================================================================
// Builders
// ============================================================================

/** Surface color at a given lightness. Same hue family, low chroma. */
const bg = (l: number, c = C, h = H) => oklch(l, c, h);

/** Syntax color — distinct hue, offset from syntax band center */
const syn = (h: number, dl = 0, dc = 1) => oklch(SL + dl, SC * dc, h);

// ============================================================================
// Palette — all Color instances, zero hex
// ============================================================================

export const p = {
	// ── Backgrounds (lightness ramp, surface hue) ───────────────────────
	midnight: bg(L),
	midnight2: bg(L + 0.009),
	midnightLight: bg(L + 0.047, C * 1.32),
	midnightDark: bg(L - 0.028, C * 0.49),
	black: bg(L + 0.012, C * 0.41, H + 1),
	semiblack: bg(L - 0.012, C * 0.29, H + 1),
	obsidian: bg(L + 0.091, C * 2.25, H + 1),

	// ── Foreground ramp (surface hue family, lightness varies) ──────────
	charcoal: bg(L + 0.206, C * 2.35, H - 11),
	darkBlue: oklch(0.493, 0.037, 227),
	bluegray: oklch(0.559, SC * 0.84, hue.storage),
	taupe: oklch(0.622, 0.026, H - 21),
	softMist: oklch(0.477, 0.034, H - 6),
	dimGray: oklch(0.379, 0.041, H - 14),
	deepGray: oklch(0.308, 0.029, H - 11),
	gray1: oklch(0.471, 0.050, H + 8),
	mist: oklch(0.588, 0.040, H - 8),
	steel: oklch(0.716, 0.030, H - 33),
	slate: oklch(0.717, 0.056, H - 8),
	flatwhite: oklch(0.765, 0.020, H + 1),
	devwhite: oklch(0.844, 0.049, H - 46),
	white: oklch(0.915, 0.004, H - 37),

	// ── Syntax (parametric on SL, SC, hue) ──────────────────────────────
	wasabi: syn(hue.string, +0.04, 1.16),
	wasabi2: syn(hue.string, 0, 0.96),
	seafoam: syn(hue.function, 0, 0.78),
	cyan: syn(hue.literal, -0.11, 1.25),
	ice: syn(hue.type, +0.07, 0.59),
	lavender: syn(hue.keyword, -0.13, 1.32),
	peach: syn(hue.decorator, 0, 1.17),
	blush: syn(hue.label, -0.03, 1.08),
	crimson: syn(hue.operator, -0.27, 2.32),
	gold: syn(92, +0.05, 1.96),
	magenta: syn(328, -0.12, 3.57),
	orange1: syn(34, -0.09, 1.90),
	deletedRose: syn(359, -0.31, 1.62),

	// ── Status / debug ──────────────────────────────────────────────────
	cursorRed: oklch(0.613, 0.178, 22),
	debugInfo: syn(206, +0.02, 1.06),
	debugError: syn(24, -0.12, 2.14),
	debugWarning: syn(81, +0.05, 1.42),
	listError: syn(22, -0.28, 1.32),

	// ── Git ─────────────────────────────────────────────────────────────
	gitRenamed: oklch(0.648, SC * 0.96, 209),
	gitStageDeleted: oklch(0.502, SC * 1.03, 14),
	gitSubmodule: oklch(0.769, SC * 0.84, 247),

	// ── UI surfaces (derived from surface ramp) ─────────────────────────
	menuBg: bg(L + 0.032, C * 1.47, H + 10),
	tabBorder: bg(L + 0.097, C * 2.0),
	composerBg: bg(L + 0.038, C * 0.99, H - 18),
	settingsInputBg: bg(L + 0.027, C * 0.67),
	settingsInputBorder: bg(L + 0.073, C * 1.15),
	editorWhitespace: bg(L + 0.119, C * 1.95, H + 2),
	widgetBorder: oklch(0.383, 0.019, H + 17),
	widgetSelection: bg(L + 0.124, C * 3.51, H + 7),

	// ── Highlights (surface tones at specific alpha) ────────────────────
	lineHighlight: bg(L + 0.058, C * 2.47, H + 10).alpha(0.58),
	wordHighlight: oklch(0.293, 0.079, H - 12).alpha(0.2),
	wordHighlightStrong: oklch(0.443, 0.038, H + 14).alpha(0.67),
	indentGuide: oklch(0.245, 0.065, H + 14).alpha(0.35),
	indentGuideActive: oklch(0.488, 0.180, H + 10).alpha(0.35),

	// ── Hover / focus ───────────────────────────────────────────────────
	hoverBg: bg(L + 0.035, C * 0.95, H - 6).alpha(0.74),
	hoverBorder: bg(L + 0.058, C * 1.49, H - 28),
	hoverFg: oklch(0.933, 0.036, H - 46).alpha(0.65),
	focusBorderAlpha: oklch(0.696, 0.031, H + 16).alpha(0.08),

	// ── Window / buttons ────────────────────────────────────────────────
	windowBorder: oklch(0.332, 0.065, H - 36),
	buttonBorder: oklch(0.350, 0.032, H + 15).alpha(0.47),
	buttonSeparator: oklch(0.441, 0.062, H + 15).alpha(0.21),

	// ── Line numbers ────────────────────────────────────────────────────
	lineNumberFg: oklch(0.382, 0.013, H + 8).alpha(0.8),
	lineNumberActiveFg: oklch(0.574, 0.057, H + 14),

	// ── Icons ───────────────────────────────────────────────────────────
	iconFg: oklch(0.509, 0.053, H - 6).alpha(0.72),

	// ── Debug bar ───────────────────────────────────────────────────────
	debuggingBg: oklch(0.892, 0.175, 164).alpha(0.95),
	debuggingFg: oklch(0.377, 0.196, H + 20),
	debuggingBorder: oklch(0.827, 0.145, 168).alpha(0.95),

	// ── Misc ────────────────────────────────────────────────────────────
	peekMatchHighlight: oklch(0.674, 0.144, 72).alpha(0.25),
	settingsHeaderFg: oklch(0.894, 0.022, H - 39).alpha(0.80),
	textPreformatBg: oklch(0.153, 0.016, 180).alpha(0.94),
	textPreformatFg: oklch(0.852, 0.099, 163).alpha(0.81),
	errorBg: oklch(0.275, 0.113, 29).alpha(0.27),
	prDraft: oklch(0.298, 0.097, H + 12),
	chatRequestBg: oklch(0.129, 0.052, H - 9),

	// ── Alpha variants ──────────────────────────────────────────────────
	alphaBlack: bg(L + 0.012, C * 0.41, H + 1).alpha(0.50),
	alphaWhite: oklch(0.915, 0.004, H - 37).alpha(0.13),
} as const;

// Backward-compatible export name
export const mintedBasePalette = p;

// ============================================================================
// Syntax Definition
// ============================================================================

export const mintedBaseSyntax: SyntaxDefinition = {
	source: p.mist.alpha(0.76),
	comments: p.charcoal,
	strings: make({
		default: p.wasabi2,
		regex: p.peach,
	}),
	operators: {
		default: p.crimson,
	},
	literals: {
		default: p.cyan,
		string: p.wasabi2,
		number: p.cyan,
		boolean: p.cyan,
		null: p.lavender.alpha(0.81),
		undefined: p.lavender.alpha(0.81),
		regex: p.peach,
	},
	keywords: {
		default: p.devwhite.alpha(0.81),
		operator: p.crimson,
	},
	variables: {
		default: p.slate,
		local: p.slate,
		parameter: p.slate,
		property: p.taupe,
		global: p.slate,
		other: p.flatwhite.alpha(0.98),
	},
	constants: {
		default: p.mist.alpha(0.76),
		numeric: p.cyan,
		language: p.cyan,
		userDefined: p.mist.alpha(0.76),
	},
	functions: {
		default: p.seafoam,
		declaration: p.seafoam,
		call: p.seafoam,
		method: p.seafoam,
		builtin: p.seafoam,
	},
	types: {
		default: p.ice,
		primitive: p.peach,
		class: p.ice,
		interface: p.ice,
		enum: p.slate,
		typeParameter: p.ice,
		namespace: p.ice,
	},
	punctuation: {
		default: p.mist.alpha(0.76),
		definition: oklch(0.355, 0.030, H + 7).alpha(0.82),
		delimiter: p.charcoal,
		bracket: p.charcoal,
		accessor: p.charcoal,
	},
	meta: {
		default: p.peach,
		decorator: p.peach,
		macro: p.peach,
		annotation: p.peach,
		label: p.blush,
		tag: p.gray1,
	},
	storage: {
		default: p.bluegray,
		type: p.bluegray,
	},
	special: {
		jsxClass: p.blush,
	},
};

// ============================================================================
// Core theme anchors
// ============================================================================

const core = {
	background: p.midnight,
	foreground: p.mist.alpha(0.76).mix(p.midnight, 0.2),
	accent: p.lavender.alpha(0.81),
	highlight: p.peach,
	active: p.ice,
} as const;

const overlay = p.charcoal
	.saturate()
	.lighter()
	.transparent(0.1)
	.rotate(15)
	.hexa();

const backgrounds: UserInterface<ColorLike>["backgrounds"] = {
	base: p.midnight,
	darker: p.midnight.darker(0.2),
	surface: p.midnight.lighter(0.15),
	raised: p.obsidian.mix(p.midnight, 0.8).saturate(0.3),
	overlay,
	codeBlock: p.midnightDark.darker(0.2),
};

const foregrounds: UserInterface<ColorLike>["foregrounds"] = {
	default: p.mist.alpha(0.76).mix(p.midnight, 0.2),
	muted: p.mist.mix(p.midnight, 0.5).mix(p.charcoal, 2),
	subtle: p.charcoal.mix(p.midnight, 0.3),
	accent: core.accent,
	focused: p.peach,
};

const baseBorder = p.charcoal.mix(p.midnight, 0.8);

const borders: UserInterface<ColorLike>["borders"] = {
	default: baseBorder,
	active: core.accent.desaturate(0.1).darker(0.4).transparent(0.4),
	subtle: baseBorder.transparent(0.9),
	separator: p.mist.alpha(0.1).hexa(),
};

const accent: UserInterface<ColorLike>["accent"] = {
	primary: p.ice,
	primaryForeground: p.ice,
	secondary: p.peach,
	palette: [
		p.ice.rotate(-10).hexa(),
		p.wasabi.hexa(),
		p.peach.hexa(),
		p.crimson.lighter(0.3).hexa(),
		p.debuggingBg.hexa(),
		p.debuggingFg.lighter(0.2).hexa(),
	],
};

// ============================================================================
// Component Overrides
// ============================================================================

export const mintedBaseComponentOverrides: ComponentOverrides<ColorLike> = {
	editor: {
		background: darken(backgrounds.base, 0.1),
		foreground: foregrounds.default,
		lineHighlight: p.lineHighlight,
		lineHighlightBorder: lighten(backgrounds.base, 0.15),
		findMatchHighlightBackground: transparentize(
			mix(p.lavender.alpha(0.81), backgrounds.base, 0.8),
			0.5,
		),
		findRangeHighlightBackground: transparentize(
			mix(p.lavender.alpha(0.81), backgrounds.base, 0.8),
			0.5,
		),
		selectionHighlightBackground: transparentize(
			mix(p.lavender.alpha(0.81), backgrounds.base, 0.8),
			0.5,
		),
		lineNumberActiveForeground: p.mist.alpha(0.76),
		lineNumberForeground: darken(p.mist.alpha(0.76), 0.7),
		selectionBackground: mix(mintedBaseSyntax.source, p.midnight, 0.8),
		inactiveSelectionBackground: darken(p.lavender.alpha(0.81), 0.8),
		findMatchBackground: mix(
			p.midnight,
			oklch(0.577, 0.097, 256).alpha(0.33),
			0.5,
		),
	},
	editorGutter: {
		background: backgrounds.darker,
		modifiedBackground: p.gold.transparent(),
		addedBackground: p.seafoam.transparent(),
		deletedBackground: p.crimson.transparent(),
		foldingControl: p.steel.transparent(),
	},
	editorLineNumber: {
		foreground: p.charcoal,
		activeForeground: p.mist.alpha(0.76),
	},
	editorWidget: {
		background: backgrounds.surface,
		foreground: foregrounds.default,
		border: borders.default,
	},
	titleBar: {
		inactiveBackground: backgrounds.base,
		inactiveForeground: p.mist.alpha(0.76),
		activeBackground: p.midnight,
		activeForeground: p.mist.alpha(0.76),
	},
	activityBar: {
		background: backgrounds.darker,
		foreground: darken(p.mist.alpha(0.76), 0.1),
		inactiveForeground: darken(p.mist.alpha(0.76), 0.5),
		border: p.semiblack,
		badgeBackground: p.alphaBlack,
		badgeForeground: p.wasabi,
	},
	sideBar: {
		background: backgrounds.base,
		foreground: mix(p.mist.alpha(0.76), p.midnight, 0.2),
		border: borders.default,
		sectionHeaderBackground: p.midnight,
		sectionHeaderForeground: p.mist.alpha(0.76),
	},
	panel: {
		background: darken(backgrounds.base, 0.05),
		foreground: p.mist.alpha(0.76),
		border: borders.default,
		titleActiveForeground: p.mist.alpha(0.76),
		titleInactiveForeground: p.mist.alpha(0.76),
		titleActiveBorder: p.steel,
	},
	statusBar: {
		background: p.midnight,
		foreground: p.mist.alpha(0.76),
		border: borders.default,
		debuggingBackground: p.seafoam,
		debuggingForeground: p.ice.darker(0.8),
		noFolderBackground: p.midnight,
		noFolderForeground: p.mist.alpha(0.76),
	},
	tabs: {
		activeBackground: p.midnight,
		activeForeground: p.mist.alpha(0.76),
		activeBorder: borders.default,
		activeBorderTop: p.steel,
		inactiveBackground: p.midnight,
		inactiveForeground: p.mist.alpha(0.76),
		hoverBackground: p.midnight,
		hoverForeground: p.mist.alpha(0.76),
		unfocusedActiveBackground: p.midnight,
		unfocusedActiveForeground: p.mist.alpha(0.76),
		modifiedBorder: p.peach,
	},
	list: {
		activeSelectionBackground: p.midnight,
		activeSelectionForeground: p.mist.alpha(0.76),
		inactiveSelectionBackground: p.midnight,
		inactiveSelectionForeground: p.mist.alpha(0.76),
		hoverBackground: p.midnight,
		hoverForeground: p.mist.alpha(0.76),
		focusBackground: p.midnight,
		focusForeground: p.mist.alpha(0.76),
		highlightForeground: p.steel,
	},
	input: {
		background: backgrounds.surface,
		foreground: lighten(p.mist.alpha(0.76), 0.4),
		placeholderForeground: darken(p.mist.alpha(0.76), 0.2),
		border: borders.subtle,
	},
	button: (() => {
		const btnBg = p.midnight.mix(p.devwhite.alpha(0.81), 0.15).rotate(15);
		const secondaryBg = p.midnight.transparent(0.1);
		return {
			background: btnBg,
			foreground: p.white.cool(1).darker(),
			hoverBackground: btnBg.lighter(),
			secondaryBackground: secondaryBg,
			secondaryForeground: p.blush.lighter(0.1).transparent(0.9),
			secondaryHoverBackground: p.midnight,
			border: btnBg.lighter(),
			secondaryBorder: btnBg.lighter(),
		};
	})(),
	dropdown: {
		background: p.midnight,
		foreground: p.mist.alpha(0.76),
		border: darken(p.steel, 0.2),
		listBackground: p.midnight,
	},
	badge: {
		background: p.midnight,
		foreground: p.mist.alpha(0.76),
		border: lighten(p.midnight, 0.2),
	},
	scrollbar: {
		shadow: p.midnight,
		sliderBackground: p.midnight.lighter(),
		sliderHoverBackground: p.midnight,
		sliderActiveBackground: p.midnight,
	},
	minimap: {
		background: p.midnight,
		selectionHighlight: p.mist.alpha(0.76),
		errorHighlight: p.crimson,
		warningHighlight: p.peach,
		findMatchHighlight: mix(
			backgrounds.surface,
			p.lavender.alpha(0.81),
			0.5,
		),
	},
	breadcrumb: {
		background: p.midnight,
		foreground: p.mist.alpha(0.76),
		focusForeground: p.mist.alpha(0.76),
		activeSelectionForeground: p.mist.alpha(0.76),
	},
	terminal: {
		background: backgrounds.darker,
		foreground: p.mist.alpha(0.76),
		border: mix(backgrounds.darker, p.steel, 0.1),
		cursorForeground: p.mist.alpha(0.76),
		selectionBackground: l10(p.midnight),
		cursor: p.mist.alpha(0.76),
		ansiBlack: p.charcoal,
		ansiRed: p.crimson,
		ansiGreen: p.seafoam,
		ansiYellow: p.peach,
		ansiBlue: p.cyan,
		ansiMagenta: p.lavender.alpha(0.81),
		ansiCyan: p.ice,
		ansiWhite: p.white,
		ansiBrightBlack: p.steel,
		ansiBrightRed: p.crimson,
		ansiBrightGreen: p.seafoam,
		ansiBrightYellow: p.peach,
		ansiBrightBlue: p.cyan,
		ansiBrightMagenta: p.lavender.alpha(0.81),
		ansiBrightCyan: p.ice,
		ansiBrightWhite: p.flatwhite.alpha(0.98),
	},
	notification: {
		background: p.midnight,
		foreground: p.mist.alpha(0.76),
		border: p.steel,
	},
	peekView: {
		editorBackground: p.midnight,
		editorBorder: p.steel,
		resultBackground: p.midnight,
		resultSelectionBackground: p.midnight,
		titleBackground: p.midnight,
		titleForeground: p.mist.alpha(0.76),
	},
	diffEditor: {
		insertedTextBackground: oklch(0.15, 0.02, hue.function).alpha(0.53),
		removedTextBackground: oklch(0.15, 0.02, hue.operator).alpha(0.51),
		insertedLineBackground: oklch(0.15, 0.02, hue.function).alpha(0.53),
		removedLineBackground: oklch(0.12, 0.03, hue.operator).alpha(0.62),
		diagonalFill: p.steel,
	},
	merge: (() => {
		const incoming = p.midnight
			.mix(p.seafoam, 0.1)
			.saturate(1)
			.darker(0.2);
		const current = p.midnight.mix(p.cyan, 0.1).saturate(1).darker(0.2);
		const common = p.midnight
			.mix(p.peach, 0.1)
			.saturate(1)
			.darker(0.2);
		return {
			currentHeaderBackground: current.darker(0.1),
			currentContentBackground: current.darker(0.2),
			incomingHeaderBackground: incoming.darker(0.1),
			incomingContentBackground: incoming.darker(0.2),
			commonHeaderBackground: common.darker(0.1),
			commonContentBackground: common.darker(0.2),
		};
	})(),
	chat: {
		background: backgrounds.darker,
		foreground: foregrounds.default,
		border: borders.default,
		surface: backgrounds.surface,
		requestBackground: p.chatRequestBg,
		codeBlockBackground: backgrounds.codeBlock,
	},
};

// ============================================================================
// UI Definition
// ============================================================================

export const mintedBaseUi: UserInterface<ColorLike> = {
	backgrounds,
	foregrounds,
	borders,
	accent,
	status: {
		error: mkElementColors(p.crimson, { background: backgrounds.base, foreground: foregrounds.default }),
		warning: mkElementColors(p.peach, { background: backgrounds.base, foreground: foregrounds.default }),
		info: mkElementColors(p.cyan, { background: backgrounds.base, foreground: foregrounds.default }),
		success: mkElementColors(p.seafoam, { background: backgrounds.base, foreground: foregrounds.default }),
	},
	selection: {
		background: mix(mintedBaseSyntax.source, p.midnight, 0.5),
		backgroundInactive: transparentize(p.white, 0.1),
		text: p.charcoal,
		backgroundActive: p.darkBlue,
	},
	highlights: {
		word: {
			background: p.wordHighlight,
			backgroundStrong: p.wordHighlightStrong,
		},
		selection: {
			backgroundActive: mix(mintedBaseSyntax.source, p.midnight, 0.5),
			backgroundInactive: p.charcoal,
		},
		activeLine: {
			background: p.lineHighlight,
		},
	},
	indentGuide: {
		background: p.indentGuide,
		activeBackground: p.indentGuideActive,
	},
	whitespace: {
		foreground: p.editorWhitespace,
	},
	ruler: {
		foreground: core.accent.mix(p.midnight),
	},
	lineNumbers: {
		foreground: p.lineNumberFg,
		activeForeground: p.lineNumberActiveFg,
	},
	elements: {
		background: p.hoverBg,
		selectionBackground: p.widgetSelection,
		border: p.hoverBorder,
		foreground: p.hoverFg,
	},
	subtleElements: {
		background: p.menuBg,
		selectionBackground: p.widgetSelection,
		border: p.widgetBorder,
		foreground: p.steel,
	},
	git: {
		added: p.seafoam,
		modified: p.bluegray,
		deleted: p.deletedRose,
		untracked: p.mist.alpha(0.76),
		ignored: p.mist.alpha(0.76),
		conflict: p.crimson,
		renamed: p.gitRenamed,
		stageModified: p.bluegray,
		stageDeleted: p.gitStageDeleted,
		submodule: p.gitSubmodule,
	},
	cursor: {
		foreground: p.cursorRed,
	},
	window: {
		activeBorder: p.windowBorder,
	},
	icon: {
		foreground: p.iconFg,
	},
	focus: {
		border: p.focusBorderAlpha,
		contrastBorder: p.focusBorderAlpha,
	},
	menu: {
		background: p.menuBg,
		foreground: p.steel,
		selectionBackground: p.widgetSelection,
		selectionForeground: p.white,
		separatorBackground: p.widgetBorder,
	},
	suggestWidget: {
		border: p.widgetBorder,
		foreground: p.white,
		selectedBackground: p.widgetSelection,
	},
	progressBar: {
		background: p.wasabi,
	},
	debug: {
		infoForeground: p.debugInfo,
		warningForeground: p.debugWarning,
		errorForeground: p.debugError,
		sourceForeground: p.white,
	},
	text: {
		linkForeground: p.seafoam,
		preformatBackground: p.textPreformatBg,
		preformatForeground: p.textPreformatFg,
		separatorForeground: transparentize(p.widgetBorder, 0.5),
	},
	error: {
		background: p.errorBg,
		listForeground: p.listError,
	},
	peekView: {
		matchHighlightBackground: p.peekMatchHighlight,
		titleDescriptionForeground: p.flatwhite.alpha(0.98),
	},
	panels: {
		background: darken(backgrounds.base, 0.05),
		foreground: p.mist.alpha(0.76),
		titleForeground: transparentize(p.white, 0.5),
	},
	inlineHints: {
		background: backgrounds.raised,
		foreground: lighten(p.steel, 0.4),
		border: borders.subtle,
	},
};

// ============================================================================
// Language Overrides
// ============================================================================

export const mintedBaseLanguageOverrides: ThemeDefinition["languageOverrides"] = {
	go: {
		functions: {
			default: p.ice,
		},
	},
	css: {
		variables: {
			default: p.slate,
			property: p.darkBlue,
		},
	},
};

// ============================================================================
// Semantic Tokens
// ============================================================================

export const mintedBaseSemantic: NonNullable<ThemeDefinition["semantic"]> = {
	comment: p.charcoal,
	string: mix(p.wasabi2, backgrounds.base, 0.3),
	keyword: p.lavender.alpha(0.81),
	number: p.cyan,
	regexp: p.peach,
	operator: p.crimson,
	namespace: p.ice,
	type: p.ice,
	struct: p.ice,
	class: p.ice,
	interface: p.ice,
	enum: p.slate,
	typeParameter: p.ice,
	function: mix(p.seafoam, backgrounds.base, 0.3),
	method: p.seafoam,
	decorator: p.peach,
	macro: p.peach,
	variable: p.slate,
	parameter: p.slate,
	property: mix(p.taupe, backgrounds.base, 0.3),
	label: p.blush,
};

// ============================================================================
// Modifiers
// ============================================================================

export const mintedBaseModifiers: NonNullable<ThemeDefinition["modifiers"]> = {
	[SemanticTokenModifier.documentation]: {
		global: { foreground: p.charcoal.render(), fontStyle: "italic" },
	},
	[SemanticTokenModifier.static]: {
		global: { fontStyle: "" },
	},
	[SemanticTokenModifier.deprecated]: {
		global: { fontStyle: "strikethrough" },
	},
	[SemanticTokenModifier.async]: {
		transform: (color: string) =>
			new Color(color).mix(p.lavender.alpha(0.81), 0.1),
	},
	[SemanticTokenModifier.declaration]: {
		transform: (color) => mix(color, foregrounds.default, 0.5),
	},
};

// ============================================================================
// Extra Colors (VS Code specific — must be string values)
// ============================================================================

export const mintedBaseExtraColors: NonNullable<ThemeDefinition["extraColors"]> = {
	"editorPane.background": p.midnight2.render(),
	"editor.lineHighlightBackground": p.lineHighlight.render(),
	"editor.wordHighlightBackground": p.wordHighlight.render(),
	"editor.wordHighlightStrongBackground": p.wordHighlightStrong.render(),
	"editorIndentGuide.background1": p.indentGuide.render(),
	"editorIndentGuide.activeBackground1": p.indentGuideActive.render(),
	"editorWhitespace.foreground": p.editorWhitespace.render(),
	"editorRuler.foreground": p.indentGuide.render(),
	"editorLineNumber.foreground": p.lineNumberFg.render(),
	"editorLineNumber.activeForeground": p.lineNumberActiveFg.render(),
	"editorHoverWidget.background": p.hoverBg.render(),
	"editorHoverWidget.border": p.hoverBorder.render(),
	"editorHoverWidget.foreground": p.hoverFg.render(),
	"sideBarTitle.foreground": transparentize(p.white, 0.5).hexa(),
	"statusBar.debuggingBackground": p.debuggingBg.render(),
	"statusBar.debuggingForeground": p.debuggingFg.render(),
	"statusBar.debuggingBorder": p.debuggingBorder.render(),
	"tab.border": p.tabBorder.render(),
	"editorGroupHeader.tabsBackground": p.black.render(),
	"button.border": p.buttonBorder.render(),
	"button.separator": p.buttonSeparator.render(),
	"tree.indentGuidesStroke": p.widgetBorder.render(),
	"settings.headerForeground": p.settingsHeaderFg.render(),
	"settings.textInputBackground": p.settingsInputBg.render(),
	"settings.textInputForeground": p.steel.render(),
	"settings.textInputBorder": p.settingsInputBorder.render(),
	"composerPane.background": p.composerBg.render(),
	"pullRequests.draft": p.prDraft.render(),
	"chat.requestBackground": p.chatRequestBg.render(),
	"list.focusBackground": p.widgetSelection.render(),
};
