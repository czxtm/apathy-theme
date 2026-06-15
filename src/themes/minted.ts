/**
 * Minted theme — parametric OKLCH palette, zero hex
 *
 * All colors derive from seeds (H, C, L for surfaces; SL, SC for syntax).
 * Changing a seed cascades through the entire theme.
 */

import { Color, mkElementColors, oklch } from "@/core/color";
import { SemanticTokenModifier } from "../types";
import { p } from "./mintedBase";
import {
	type ColorLike,
	normalizeTheme,
	type SlimThemeDefinition,
	type ThemeDefinition,
	type UserInterface,
	Variant,
} from "./types";
import { darken, l10, lighten, mix, transparentize } from "./utils";

const hue = {
	red: {
		stageDeleted: 2.2,
		removedTextBackground: 3.3,
		terminalBrightRed: 5.8,
		removedBackground: 6,
		diffDeleted: 8.2,
		diffDeletedBorder: 8.3,
		terminalRed: 8.6,
		removedGutter: 9.8,
		terminalMagenta: 11.9,
		terminalWhite: 17.5,
		functionWarm: 18,
		removedLine: 20.9,
		flamingo: 24,
		errorBackground: 358,
		error: 359,
	},
	amber: {
		warningBackground: 74,
		warning: 76,
		terminalYellow: 81.1,
		terminalBrightYellow: 90.9,
		gitModified: 92,
		operator: 102,
	},
	green: {
		string: 127.1,
		created: 131,
		paletteLime: 139.1,
		terminalGreen: 142.7,
		paletteGreen: 147.4,
		iconAccent: 158,
		terminalBrightGreen: 162.8,
		paletteMint: 166.1,
		gitUntracked: 170.5,
		versionControlAdded: 182,
		gitLensAdded: 183.3,
		iconForeground: 185,
	},
	cyan: {
		diffLine: 189.7,
		diffBorder: 190.2,
		gitDiffAdded: 190.4,
		gitAdded: 192.8,
		activeBorder: 193.8,
		diffInsertedText: 195.1,
		hoverHighlight: 200.2,
		paletteCyan: 201,
		functionDeclaration: 202.8,
		hoverStatusBar: 206,
		modified: 208,
		terminalCyan: 210.3,
		terminalBrightBlue: 213.7,
		literal: 225.9,
		collaborator: 227,
		editorWidgetForeground: 239.2,
	},
	blue: {
		link: 248.6,
		paletteBlue: 248.7,
		findMatch: 256,
		hoverBorder: 257.3,
		wordAdded: 258,
		terminalBlue: 259.9,
	},
	violet: {
		source: 266,
		softSource: 267,
		gitIgnored: 267.8,
		gitFileBase: 268.8,
		ui: 269,
		info: 270,
		gitModified: 271,
		infoBackground: 273,
		keyword: 273.1,
		terminalBrightBlack: 273.3,
		terminalBlack: 273.6,
		widgetBackground: 273.9,
		editorForeground: 274,
		stageModified: 275.4,
		inlineHintBackground: 276.4,
		textSubtle: 278,
		paletteViolet: 278.9,
		border: 279,
		badge: 279.4,
		borderMuted: 279.7,
		neutral: 280,
		variable: 280.1,
		type: 280.9,
		softPurple: 281,
		meta: 281.4,
		buttonForeground: 281.7,
		scrollbar: 282,
		renamed: 282.7,
		indentGuide: 283,
		label: 283.3,
		ruler: 284,
		pane: 284.3,
		uiMuted: 285,
		activeLine: 286,
		inlayHintForeground: 286.7,
		accent: 287,
		primitive: 287.1,
		property: 287.9,
		subtleSelected: 288,
		activeSelection: 290,
		button: 290.2,
		terminalForeground: 290.6,
		buttonHover: 291.9,
		punctuationDefinition: 292,
		element: 295,
		buttonBorder: 298.9,
	},
	magenta: {
		hintBorder: 299,
		buttonSecondaryForeground: 302.2,
		hint: 303,
		hintBackground: 305,
		macro: 316.9,
		terminalBrightMagenta: 337.6,
	},
} as const;

// ============================================================================
// Minted-specific palette extensions
// ============================================================================

const mp = {
	...p,
	fg: oklch(0.475, 0.052, hue.violet.source).alpha(0.9),
	fgbright: oklch(0.836, 0.019, hue.violet.ui).alpha(0.91),
	fgsubtle: oklch(0.66, 0.044, hue.violet.softSource).alpha(0.91),
	misty: oklch(0.66, 0.044, hue.violet.softSource).alpha(0.91),
	uiFg: oklch(0.636, 0.062, hue.violet.ui).alpha(0.71),
	uiMuted: oklch(0.53, 0.078, hue.violet.uiMuted).alpha(0.67),
	flamingo: oklch(0.844, 0.052, hue.red.flamingo),
} as const;

const statusTone = (
	foreground: ColorLike,
	background: ColorLike,
	border: ColorLike = foreground,
) => ({
	foreground,
	background,
	border,
});

const statusTones = {
	error: statusTone(
		oklch(0.667, 0.145, hue.red.error),
		oklch(0.313, 0.064, hue.red.errorBackground).alpha(0.27),
	),
	hint: statusTone(
		oklch(0.742, 0.112, hue.magenta.hint).alpha(0.94),
		oklch(0.319, 0.013, hue.magenta.hintBackground).alpha(0.22),
		oklch(0.703, 0.077, hue.magenta.hintBorder),
	),
	info: statusTone(
		oklch(0.737, 0.094, hue.violet.info).alpha(0.94),
		oklch(0.291, 0.045, hue.violet.infoBackground).alpha(0.32),
	),
	warning: statusTone(
		oklch(0.891, 0.041, hue.amber.warning).alpha(0.91),
		oklch(0.347, 0.026, hue.amber.warningBackground).alpha(0.3),
	),
	created: statusTone(
		oklch(0.915, 0.098, hue.green.created),
		oklch(0.331, 0.032, hue.green.created).alpha(0.28),
	),
	modified: statusTone(
		oklch(0.914, 0.041, hue.cyan.modified),
		oklch(0.347, 0.026, hue.amber.warningBackground).alpha(0.3),
		oklch(0.891, 0.041, hue.amber.warning).alpha(0.91),
	),
} as const;

// ============================================================================
// Syntax Definition
// ============================================================================

const syntax: SlimThemeDefinition["syntax"] = {
	source: mp.fg,
	comments: oklch(0.296, 0.056, hue.violet.softPurple).alpha(0.87),
	strings: {
		default: oklch(0.821, 0.076, hue.green.string),
		regex: mp.peach,
	},
	operators: {
		default: oklch(0.742, 0.014, hue.amber.operator),
	},
	literals: {
		default: oklch(0.778, 0.082, hue.cyan.literal),
		string: oklch(0.821, 0.076, hue.green.string),
		number: oklch(0.778, 0.082, hue.cyan.literal),
		boolean: oklch(0.778, 0.082, hue.cyan.literal),
		null: mp.lavender.alpha(0.81),
		undefined: mp.lavender.alpha(0.81),
		regex: mp.peach,
	},
	keywords: {
		default: oklch(0.462, 0.079, hue.violet.keyword),
		operator: oklch(0.742, 0.014, hue.amber.operator),
	},
	variables: {
		default: oklch(0.694, 0.056, hue.violet.variable).alpha(0.98),
		local: oklch(0.694, 0.056, hue.violet.variable).alpha(0.98),
		parameter: oklch(0.694, 0.056, hue.violet.variable).alpha(0.98),
		property: oklch(0.617, 0.06, hue.violet.property).alpha(0.8),
		global: oklch(0.694, 0.056, hue.violet.variable).alpha(0.98),
		other: mp.flatwhite.alpha(0.98),
	},
	constants: {
		default: oklch(0.778, 0.082, hue.cyan.literal),
		numeric: oklch(0.778, 0.082, hue.cyan.literal),
		language: oklch(0.778, 0.082, hue.cyan.literal),
		userDefined: mp.mist.alpha(0.76),
	},
	functions: {
		default: oklch(0.88, 0.042, hue.red.functionWarm),
		declaration: oklch(0.942, 0.048, hue.cyan.functionDeclaration),
		call: oklch(0.88, 0.042, hue.red.functionWarm),
		method: oklch(0.88, 0.042, hue.red.functionWarm),
		builtin: oklch(0.437, 0.089, hue.violet.primitive),
	},
	types: {
		default: oklch(0.7, 0.079, hue.violet.type),
		primitive: oklch(0.437, 0.089, hue.violet.primitive),
		class: oklch(0.88, 0.042, hue.red.functionWarm),
		interface: oklch(0.88, 0.042, hue.red.functionWarm),
		enum: mp.slate,
		typeParameter: oklch(0.88, 0.042, hue.red.functionWarm),
		namespace: oklch(0.88, 0.042, hue.red.functionWarm),
	},
	punctuation: {
		default: mp.mist.alpha(0.76),
		definition: oklch(0.355, 0.03, hue.violet.punctuationDefinition).alpha(
			0.82,
		),
		delimiter: mp.charcoal,
		bracket: mp.charcoal,
		accessor: mp.charcoal,
	},
	meta: {
		default: oklch(0.539, 0.039, hue.violet.meta),
		decorator: oklch(0.539, 0.039, hue.violet.meta),
		macro: oklch(0.675, 0.23, hue.magenta.macro),
		annotation: oklch(0.539, 0.039, hue.violet.meta),
		label: oklch(0.773, 0.119, hue.violet.label),
		tag: mp.gray1,
	},
	storage: {
		default: mp.bluegray,
		type: mp.bluegray,
	},
	special: {
		jsxClass: mp.blush,
	},
};

// ============================================================================
// Core Anchors
// ============================================================================

const overlay = mp.charcoal
	.set({
		l: (l) => l * 1.02,
		c: (c) => c * 1.05,
		h: (h) => h,
	})
	.alpha(0.1);

const backgrounds: UserInterface<ColorLike>["backgrounds"] = {
	base: mp.midnight,
	darker: mp.midnight.darker(0.15),
	surface: mp.midnight
		.set({
			l: (l) => l * 1.12,
			c: (c) => c * 1.8,
			h: (h) => h,
		})
		.alpha(0.84),
	raised: mp.midnight.set({
		l: (l) => l * 1.13,
		c: (c) => c * 1.5,
		h: (h) => h,
	}),
	overlay,
	codeBlock: mp.midnightDark.darker(0.05),
};

const focusColor = mp.peach;
const foregrounds: UserInterface<ColorLike>["foregrounds"] = {
	default: mp.uiFg,
	muted: mp.uiMuted,
	subtle: oklch(0.311, 0.057, hue.violet.textSubtle),
	accent: oklch(0.701, 0.141, hue.violet.accent).alpha(0.81),
	focused: focusColor,
};

const borders: UserInterface<ColorLike>["borders"] = {
	default: oklch(0.483, 0.116, hue.violet.border).alpha(0.08),
	active: oklch(0.9142, 0.0747, hue.cyan.activeBorder).alpha(0.941),
	subtle: oklch(0.199, 0.018, hue.violet.neutral).alpha(0.9),
	separator: mp.mist.alpha(0.1),
	disabled: oklch(0.199, 0.0181, hue.violet.borderMuted).alpha(0.525),
	transparent: oklch(0.199, 0.018, hue.violet.neutral).alpha(0.33),
};

const accent: UserInterface<ColorLike>["accent"] = {
	primary: mp.ice,
	primaryForeground: mp.ice,
	secondary: mp.peach,
	palette: [
		oklch(0.8212, 0.208, hue.green.paletteLime),
		oklch(0.8223, 0.1905, hue.green.paletteGreen),
		oklch(0.8437, 0.132, hue.green.paletteMint),
		oklch(0.8478, 0.1007, hue.cyan.paletteCyan),
		oklch(0.7558, 0.0955, hue.blue.paletteBlue),
		oklch(0.6895, 0.1332, hue.violet.paletteViolet),
	],
};

// git
const gitDiffBg = (() => {
	const l = 0.58;
	const c = 0.08;
	return {
		added: oklch(0.1654, 0.0265, hue.cyan.gitDiffAdded).alpha(0.341),
		deleted: oklch(l, c, hue.red.removedBackground),
		modified: oklch(l, c, hue.amber.gitModified),
	};
})();

const git = (() => {
	const status = {
		added: oklch(0.8295, 0.0452, hue.cyan.gitAdded).alpha(0.824),
		modified: oklch(0.627, 0.076, hue.violet.gitModified).alpha(0.957),
		deleted: mp.deletedRose.alpha(0.3),
		wordAdded: oklch(0.45, 0.07, hue.blue.wordAdded).alpha(0.21),
		wordDeleted: mp.deletedRose.alpha(0.27),
		untracked: oklch(0.8725, 0.0962, hue.green.gitUntracked).alpha(0.824),
		ignored: mp.mist.alpha(0.76),
		conflict: mp.crimson,
		renamed: mp.gitRenamed,
		stageModified: oklch(0.4967, 0.0822, hue.violet.stageModified).alpha(0.957),
		stageDeleted: mp.gitStageDeleted,
		submodule: mp.gitSubmodule,
	};
	const diffeditorbg = {
		added: oklch(0.1654, 0.0265, hue.cyan.gitDiffAdded).alpha(0.341),
		deleted: oklch(0.786, 0.098, hue.red.diffDeleted).alpha(0.918),
		modified: oklch(0.901, 0.098, hue.red.diffDeleted).alpha(0.918),
		removedText: oklch(0.128, 0.024, hue.red.removedLine),
	};
	const diffeditorborder = {
		insertedTextBorder: oklch(0.1809, 0.0228, hue.cyan.diffBorder).alpha(0.404),
		removedTextBorder: oklch(0.223, 0.056, hue.red.diffDeletedBorder).alpha(
			0.133,
		),
	};
	const gutterbg = {
		added: oklch(0.1654, 0.0265, hue.cyan.gitDiffAdded).alpha(0.341),
		deleted: oklch(0.786, 0.098, hue.red.diffDeleted).alpha(0.918),
		modified: oklch(0.901, 0.098, hue.red.diffDeleted).alpha(0.918),
		insertedLine: oklch(0.1654, 0.0265, hue.cyan.gitDiffAdded).alpha(0.341),
		deletedLine: oklch(0.149, 0.023, hue.cyan.diffLine).alpha(0.667),
		modifiedLine: oklch(0.1235, 0.0175, hue.cyan.diffInsertedText).alpha(0.725),
		removedLine: oklch(0.149, 0.023, hue.cyan.diffLine).alpha(0.667),
	};
	const border = {
		insertedTextBorder: oklch(0.1809, 0.0228, hue.cyan.diffBorder).alpha(0.404),
		removedTextBorder: oklch(0.223, 0.056, hue.red.diffDeletedBorder).alpha(
			0.133,
		),
	};
	const filesForeground = {
		base: oklch(0.473, 0.046, hue.violet.gitFileBase).alpha(0.79),
		modified: oklch(0.627, 0.076, hue.violet.gitModified),
		added: status.added,
		deleted: oklch(0.786, 0.098, hue.red.diffDeleted),
		ignored: oklch(0.421, 0.035, hue.violet.gitIgnored).alpha(0.79),
		renamed: oklch(0.736, 0.115, hue.violet.renamed),
		untracked: status.untracked,
		stageDeleted: oklch(0.448, 0.058, hue.red.stageDeleted).alpha(0.96),
		stageModified: status.stageModified,
	};
	const files = {
		fg: filesForeground,
	};
	return {
		status,
		files,
		diffeditorbg,
		diffeditorborder,
		gutterbg,
		border,
	};
})();

// ============================================================================
// UI
// ============================================================================

const ui: UserInterface<ColorLike> = {
	backgrounds,
	foregrounds,
	borders,
	accent,
	status: {
		error: statusTones.error,
		warning: statusTones.warning,
		info: statusTones.info,
		success: {
			...mkElementColors(mp.seafoam, {
				background: backgrounds.base,
				foreground: foregrounds.default,
			}),
			foreground: oklch(0.915, 0.098, hue.green.created),
		},
		hint: statusTones.hint,
		created: statusTones.created,
		modified: statusTones.modified,
	},
	selection: {
		background: mix(syntax.source, mp.midnight, 0.5),
		backgroundInactive: transparentize(mp.white, 0.1),
		text: mp.charcoal,
		backgroundActive: oklch(0.244, 0.038, hue.violet.activeSelection).alpha(
			0.33,
		),
		collaboratorBackground: oklch(0.493, 0.037, hue.cyan.collaborator),
	},
	highlights: {
		word: {
			background: mp.wordHighlight,
			backgroundStrong: mp.wordHighlightStrong,
		},
		selection: {
			backgroundActive: mix(syntax.source, mp.midnight, 0.5),
			backgroundInactive: mp.charcoal,
		},
		activeLine: {
			background: oklch(0.22, 0.052, hue.violet.activeLine).alpha(0.33),
		},
	},
	indentGuide: {
		background: oklch(0.19, 0.03, hue.violet.indentGuide).alpha(0.8),
		activeBackground: oklch(0.37, 0.098, hue.violet.softPurple).alpha(0.6),
	},
	whitespace: {
		foreground: mp.editorWhitespace,
	},
	ruler: {
		foreground: oklch(0.272, 0.093, hue.violet.ruler).alpha(0.23),
	},
	lineNumbers: {
		foreground: mp.lineNumberFg,
		activeForeground: mp.lineNumberActiveFg,
	},
	elements: {
		background: oklch(0.216, 0.037, hue.violet.element),
		border: mp.hoverBorder,
		foreground: mp.hoverFg,
		hover: {
			foreground: oklch(0.903, 0.0873, hue.cyan.hoverHighlight),
		},
		active: {
			background: oklch(0.8786, 0.0707, hue.cyan.hoverStatusBar).alpha(0.804),
		},
		selected: {
			background: oklch(0.269, 0.057, hue.violet.scrollbar).alpha(0.67),
		},
	},

	git: {
		added: oklch(0.577, 0.063, hue.green.versionControlAdded).alpha(0.27),
		modified: Color.create(accent.primaryForeground)
			.set({
				l: (l) => l * 0.63,
				c: (c) => c * 1.47,
				h: (h) => h + 84,
			})
			.alpha(0.33),
		deleted: mp.deletedRose.alpha(0.3),
		wordAdded: oklch(0.45, 0.07, hue.blue.wordAdded).alpha(0.21),
		wordDeleted: mp.deletedRose.alpha(0.27),
		untracked: mp.mist.alpha(0.76),
		ignored: mp.mist.alpha(0.76),
		conflict: mp.crimson,
		renamed: git.files.fg.renamed,
		stageModified: git.files.fg.stageModified,
		stageDeleted: git.files.fg.stageDeleted,
		submodule: mp.gitSubmodule,
		files: {
			foreground: {
				added: git.files.fg.added,
				modified: git.files.fg.modified,
				deleted: git.files.fg.deleted,
				untracked: git.files.fg.untracked,
				ignored: git.files.fg.ignored,
				conflict: git.files.fg.deleted,
				renamed: git.files.fg.renamed,
			},
		},
		diff: {
			background: {
				added: git.diffeditorbg.added,
				modified: git.diffeditorbg.modified,
				deleted: mp.deletedRose.alpha(0.3),
			},
			border: {
				added: git.diffeditorborder.insertedTextBorder,
				deleted: git.diffeditorborder.removedTextBorder,
			},
			wordHighlight: {
				added: git.gutterbg.modifiedLine,
				deleted: mp.deletedRose.alpha(0.27),
				modified: Color.create(accent.primaryForeground)
					.set({
						l: (l) => l * 0.63,
						c: (c) => c * 1.47,
						h: (h) => h + 84,
					})
					.alpha(0.33),
			},
			gutter: {
				background: {
					added: git.gutterbg.added,
					deleted: git.gutterbg.deleted,
					modified: git.gutterbg.modified,
				},
			},
		},
	},
	cursor: {
		foreground: mp.cursorRed,
	},
	window: {
		activeBorder: mp.windowBorder,
	},
	icon: {
		foreground: oklch(0.952, 0.034, hue.green.iconForeground),
		muted: oklch(0.108, 0.005, hue.violet.neutral),
		accent: oklch(0.935, 0.088, hue.green.iconAccent).alpha(0.83),
	},
	focus: {
		border: mp.focusBorderAlpha,
		contrastBorder: mp.focusBorderAlpha,
	},
	menu: {
		background: mp.menuBg,
		foreground: mp.steel,
		selectionBackground: mp.widgetSelection,
		selectionForeground: mp.white,
		separatorBackground: mp.widgetBorder,
	},
	suggestWidget: {
		border: mp.widgetBorder,
		foreground: mp.white,
		selectedBackground: mp.widgetSelection,
	},
	progressBar: {
		background: mp.wasabi,
	},
	debug: {
		infoForeground: mp.debugInfo,
		warningForeground: mp.debugWarning,
		errorForeground: mp.debugError,
		sourceForeground: mp.white,
	},
	text: {
		linkForeground: oklch(0.8002, 0.0643, hue.blue.link),
		preformatBackground: mp.textPreformatBg,
		preformatForeground: mp.textPreformatFg,
		separatorForeground: transparentize(mp.widgetBorder, 0.5),
	},
	error: {
		background: mp.errorBg,
		listForeground: mp.listError,
	},
	peekView: {
		matchHighlightBackground: mp.peekMatchHighlight,
		titleDescriptionForeground: mp.flatwhite.alpha(0.98),
	},
	panels: {
		background: darken(backgrounds.base, 0.05),
		foreground: mp.mist.alpha(0.76),
		titleForeground: transparentize(mp.white, 0.5),
		titleBackground: Color.create(backgrounds.raised)
			.set({
				l: (l) => l * 0.95,
				c: (c) => c * 0.95,
				h: (h) => h,
			})
			.alpha(0.7),
	},
	inlineHints: {
		background: oklch(0.558, 0.0752, hue.violet.inlineHintBackground).alpha(
			0.031,
		),
		foreground: oklch(0.6835, 0.1348, hue.violet.inlayHintForeground).alpha(
			0.384,
		),
		border: borders.subtle,
	},

	subtleElements: {
		background: oklch(0.118, 0.013, hue.violet.neutral).alpha(0.52),
		selectionBackground: oklch(0.2196, 0.0516, hue.violet.activeLine).alpha(
			0.329,
		),
		selected: {
			background: oklch(0.259, 0.067, hue.violet.subtleSelected).alpha(0.23),
		},
	},
};

// ============================================================================
// Components
// ============================================================================

const components = {
	editor: {
		background: darken(ui.backgrounds.base, 0.1),
		foreground: oklch(0.482, 0.056, hue.violet.editorForeground).alpha(0.9),
		lineHighlight:
			ui.highlights?.activeLine?.background || ui.backgrounds.overlay,
		lineHighlightBorder: lighten(ui.backgrounds.base, 0.15),
		findMatchHighlightBackground: transparentize(
			mix(mp.lavender.alpha(0.81), ui.backgrounds.base, 0.8),
			0.5,
		),
		findRangeHighlightBackground: transparentize(
			mix(mp.lavender.alpha(0.81), ui.backgrounds.base, 0.8),
			0.5,
		),
		selectionHighlightBackground: transparentize(
			mix(mp.lavender.alpha(0.81), ui.backgrounds.base, 0.8),
			0.5,
		),
		lineNumberActiveForeground: mp.mist.alpha(0.76),
		lineNumberForeground: darken(mp.mist.alpha(0.76), 0.7),
		selectionBackground: mix(syntax.source, mp.midnight, 0.8),
		inactiveSelectionBackground: darken(mp.lavender.alpha(0.81), 0.8),
		findMatchBackground: mix(
			mp.midnight,
			oklch(0.577, 0.097, hue.blue.findMatch).alpha(0.33),
			0.5,
		),
	},
	editorGutter: {
		background: ui.backgrounds.darker,
		modifiedBackground: gitDiffBg.modified,
		addedBackground: git.gutterbg.added,
		deletedBackground: gitDiffBg.deleted,
		foldingControl: mp.steel.transparent(),
	},
	editorLineNumber: {
		foreground: mp.charcoal,
		activeForeground: mp.mist.alpha(0.76),
	},
	editorWidget: {
		background: oklch(0.1456, 0.0088, hue.violet.widgetBackground).alpha(0.925),
		foreground: oklch(0.9333, 0.036, hue.cyan.editorWidgetForeground).alpha(
			0.718,
		),
		border: oklch(0.5547, 0.0354, hue.blue.hoverBorder).alpha(0.404),
	},
	titleBar: {
		inactiveBackground: ui.backgrounds.base,
		inactiveForeground: mp.mist.alpha(0.76),
		activeBackground: mp.midnight,
		activeForeground: mp.mist.alpha(0.76),
	},
	activityBar: {
		background: ui.backgrounds.darker,
		foreground: darken(mp.mist.alpha(0.76), 0.1),
		inactiveForeground: darken(mp.mist.alpha(0.76), 0.5),
		border: mp.semiblack,
		badgeBackground: oklch(0.6813, 0.0636, hue.violet.badge).alpha(0.969),
		badgeForeground: mp.wasabi,
	},
	sideBar: {
		background: backgrounds.base,
		foreground: mix(mp.mist.alpha(0.76), mp.midnight, 0.2),
		border: ui.borders.default,
		sectionHeaderBackground: mp.midnight,
		sectionHeaderForeground: mp.mist.alpha(0.76),
	},
	panel: {
		background: darken(ui.backgrounds.base, 0.05),
		foreground: mp.mist.alpha(0.76),
		border: ui.borders.default,
		titleActiveForeground: mp.mist.alpha(0.76),
		titleInactiveForeground: mp.mist.alpha(0.76),
		titleActiveBorder: mp.steel,
	},
	statusBar: {
		background: mp.midnight,
		foreground: mp.mist.alpha(0.76),
		border: ui.borders.default,
		debuggingBackground: mp.seafoam,
		debuggingForeground: mp.ice.darker(0.8),
		noFolderBackground: mp.midnight,
		noFolderForeground: mp.mist.alpha(0.76),
	},
	tabs: {
		activeBackground: mp.midnight.set({
			l: (l) => l * 0.96,
			c: (c) => c * 1.6,
		}),
		activeForeground: mp.mist.alpha(0.76),
		activeBorder: ui.borders.default,
		activeBorderTop: mp.steel,
		inactiveBackground: mp.midnight,
		inactiveForeground: mp.mist.alpha(0.76),
		hoverBackground: mp.midnight,
		hoverForeground: mp.mist.alpha(0.76),
		unfocusedActiveBackground: mp.midnight,
		unfocusedActiveForeground: mp.mist.alpha(0.76),
		modifiedBorder: mp.peach,
	},
	list: {
		activeSelectionBackground: mp.midnight,
		activeSelectionForeground: mp.mist.alpha(0.76),
		inactiveSelectionBackground: mp.midnight,
		inactiveSelectionForeground: mp.mist.alpha(0.76),
		hoverBackground: mp.midnight,
		hoverForeground: mp.mist.alpha(0.76),
		focusBackground: mp.midnight,
		focusForeground: mp.mist.alpha(0.76),
		highlightForeground: mp.steel,
	},
	input: {
		background: ui.backgrounds.surface,
		foreground: lighten(mp.mist.alpha(0.76), 0.4),
		placeholderForeground: darken(mp.mist.alpha(0.76), 0.2),
		border: ui.borders.subtle,
	},
	button: {
		background: oklch(0.7943, 0.0408, hue.violet.button),
		foreground: oklch(0.1549, 0.0337, hue.violet.buttonForeground),
		hoverBackground: oklch(0.8162, 0.0645, hue.violet.buttonHover).alpha(0.973),
		secondaryBackground: oklch(0.2314, 0.0568, hue.violet.softPurple),
		secondaryForeground: oklch(
			0.8781,
			0.0198,
			hue.magenta.buttonSecondaryForeground,
		).alpha(0.878),
		secondaryHoverBackground: mp.midnight,
		border: oklch(0.4099, 0.0118, hue.violet.buttonBorder).alpha(0.471),
		secondaryBorder: oklch(0.4099, 0.0118, hue.violet.buttonBorder).alpha(
			0.471,
		),
	},
	dropdown: {
		background: mp.midnight,
		foreground: mp.mist.alpha(0.76),
		border: darken(mp.steel, 0.2),
		listBackground: mp.midnight,
	},
	badge: {
		background: mp.midnight,
		foreground: mp.mist.alpha(0.76),
		border: lighten(mp.midnight, 0.2),
	},
	scrollbar: {
		shadow: mp.midnight,
		sliderBackground: oklch(0.237, 0.051, hue.violet.scrollbar).alpha(0.3),
		sliderHoverBackground: mp.midnight,
		sliderActiveBackground: mp.midnight,
	},
	minimap: {
		background: mp.midnight,
		selectionHighlight: mp.mist.alpha(0.76),
		errorHighlight: mp.crimson,
		warningHighlight: mp.peach,
		findMatchHighlight: mix(
			ui.backgrounds.surface,
			mp.lavender.alpha(0.81),
			0.5,
		),
	},
	breadcrumb: {
		background: mp.midnight,
		foreground: mp.mist.alpha(0.76),
		focusForeground: mp.mist.alpha(0.76),
		activeSelectionForeground: mp.mist.alpha(0.76),
	},
	terminal: {
		background: Color.create(ui.backgrounds.darker).set({ c: (c) => c * 0.8 }),
		foreground: oklch(0.7526, 0.0486, hue.violet.terminalForeground).alpha(
			0.922,
		),
		border: mix(ui.backgrounds.darker, mp.steel, 0.1),
		cursorForeground: mp.mist.alpha(0.76),
		selectionBackground: l10(mp.midnight),
		cursor: mp.mist.alpha(0.76),
		ansiBlack: oklch(0.3639, 0.0353, hue.violet.terminalBlack).alpha(0.784),
		ansiRed: oklch(0.5365, 0.2072, hue.red.terminalRed),
		ansiGreen: oklch(0.8577, 0.1092, hue.green.terminalGreen),
		ansiYellow: oklch(0.8855, 0.0429, hue.amber.terminalYellow),
		ansiBlue: oklch(0.7664, 0.1113, hue.blue.terminalBlue),
		ansiMagenta: oklch(0.5559, 0.2095, hue.red.terminalMagenta),
		ansiCyan: oklch(0.8467, 0.0833, hue.cyan.terminalCyan),
		ansiWhite: oklch(0.1238, 0.0023, hue.red.terminalWhite),
		ansiBrightBlack: oklch(0.4877, 0.0688, hue.violet.terminalBrightBlack),
		ansiBrightRed: oklch(0.5492, 0.2087, hue.red.terminalBrightRed),
		ansiBrightGreen: oklch(0.8953, 0.1272, hue.green.terminalBrightGreen).alpha(
			0.796,
		),
		ansiBrightYellow: oklch(0.832, 0.1192, hue.amber.terminalBrightYellow),
		ansiBrightBlue: oklch(0.8282, 0.0946, hue.cyan.terminalBrightBlue),
		ansiBrightMagenta: oklch(
			0.591,
			0.2278,
			hue.magenta.terminalBrightMagenta,
		).alpha(0.812),
		ansiBrightCyan: oklch(0.8467, 0.0833, hue.cyan.terminalCyan),
		ansiBrightWhite: mp.flatwhite.alpha(0.98),
	},
	notification: {
		background: mp.midnight,
		foreground: mp.mist.alpha(0.76),
		border: mp.steel,
	},
	peekView: {
		editorBackground: mp.midnight,
		editorBorder: mp.steel,
		resultBackground: mp.midnight,
		resultSelectionBackground: mp.midnight,
		titleBackground: mp.midnight,
		titleForeground: mp.mist.alpha(0.76),
	},
	diffEditor: {
		insertedTextBackground: git.gutterbg.modifiedLine,
		removedTextBackground: oklch(0.12, 0.01, hue.red.removedBackground),
		insertedLineBackground: git.gutterbg.insertedLine,
		removedLineBackground: oklch(0.12, 0.01, hue.red.removedBackground),
		insertedTextBorder: git.diffeditorborder.insertedTextBorder,
		diagonalFill: mp.gold,
	},
	merge: (() => {
		const incoming = mp.midnight.mix(mp.seafoam, 0.1).saturate(1).darker(0.2);
		const current = mp.midnight.mix(mp.cyan, 0.1).saturate(1).darker(0.2);
		const common = mp.midnight.mix(mp.peach, 0.1).saturate(1).darker(0.2);
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
		background: ui.backgrounds.darker,
		foreground: ui.foregrounds.default,
		border: ui.borders.default,
		surface: ui.backgrounds.surface,
		requestBackground: mp.chatRequestBg,
		codeBlockBackground: ui.backgrounds.codeBlock,
	},
};
// ============================================================================
// Theme Assembly
// ============================================================================

const mintedSource = {
	variant: Variant.Minted,
	name: "apathy /// minted",
	type: "dark",
	palette: {},
	background: ui.backgrounds.base,
	syntax,

	languageOverrides: {
		go: {
			functions: {
				default: mp.ice,
			},
		},
		css: {
			variables: {
				default: mp.slate,
				property: mp.darkBlue,
			},
		},
	},

	modifiers: {
		[SemanticTokenModifier.documentation]: {
			global: { foreground: mp.charcoal.render(), fontStyle: "italic" },
		},
		[SemanticTokenModifier.static]: {
			global: { fontStyle: "" },
		},
		[SemanticTokenModifier.deprecated]: {
			global: { fontStyle: "strikethrough" },
		},

		[SemanticTokenModifier.async]: {
			transform: (color: string) =>
				new Color(color).mix(mp.lavender.alpha(0.81), 0.1),
		},
		[SemanticTokenModifier.declaration]: {
			transform: (c) => mix(c, ui.foregrounds.default, 0.5),
		},
	},

	extraColors: {
		// "editorPane.background": mp.midnight.render(),
		"editorPane.background": oklch(0.1436, 0.0152, hue.violet.pane),
		"editor.lineHighlightBackground": mp.lineHighlight.render(),
		"editor.wordHighlightBackground": mp.wordHighlight.render(),
		"editor.wordHighlightStrongBackground": mp.wordHighlightStrong.render(),
		"editorIndentGuide.background1": mp.indentGuide.render(),
		"editorIndentGuide.activeBackground1": mp.indentGuideActive.render(),
		"editorWhitespace.foreground": mp.editorWhitespace.render(),
		"editorRuler.foreground": mp.indentGuide.render(),
		"editorLineNumber.foreground": mp.lineNumberFg.render(),
		"editorLineNumber.activeForeground": mp.lineNumberActiveFg.render(),
		"editorHoverWidget.background": components.editorWidget.background,
		"editorHoverWidget.border": components.editorWidget.border,
		"editorHoverWidget.foreground": components.editorWidget.foreground,
		"sideBarTitle.foreground": transparentize(mp.white, 0.5).hexa(),
		"statusBar.debuggingBackground": mp.debuggingBg.render(),
		"statusBar.debuggingForeground": mp.debuggingFg.render(),
		"statusBar.debuggingBorder": mp.debuggingBorder.render(),
		"tab.border": mp.tabBorder.render(),
		"editorGroupHeader.tabsBackground": mp.black.render(),
		"button.border": components.button.border,
		"button.separator": mp.buttonSeparator.render(),
		"tree.indentGuidesStroke": Color.create(
			ui.indentGuide.activeBackground,
		).render(),
		"tree.inactiveIndentGuidesStroke": oklch(0.19, 0.02, hue.violet.neutral)
			.alpha(0.87)
			.render(),
		"settings.headerForeground": mp.settingsHeaderFg.render(),
		"settings.textInputBackground": mp.settingsInputBg.render(),
		"settings.textInputForeground": mp.steel.render(),
		"settings.textInputBorder": mp.settingsInputBorder.render(),
		"composerPane.background": mp.composerBg.render(),
		"pullRequests.draft": mp.prDraft.render(),
		"chat.requestBackground": mp.chatRequestBg.render(),
		"list.focusBackground": mp.widgetSelection.render(),

		// ─── VSCode-specific git decoration + diff overrides ───────────────
		"sideBar.foreground": git.files.fg.base,
		"gitDecoration.modifiedResourceForeground": git.files.fg.modified,
		"gitDecoration.addedResourceForeground": git.files.fg.added,
		"gitDecoration.conflictingResourceForeground": git.files.fg.deleted,
		"gitDecoration.deletedResourceForeground": git.files.fg.deleted,
		"gitDecoration.ignoredResourceForeground": git.files.fg.ignored,
		"gitDecoration.renamedResourceForeground": git.files.fg.renamed,
		"gitDecoration.untrackedResourceForeground": git.files.fg.untracked,
		"gitDecoration.stageDeletedResourceForeground": git.files.fg.stageDeleted,
		"gitDecoration.stageModifiedResourceForeground": git.files.fg.stageModified,
		"editorGutter.addedBackground": components.editorGutter.addedBackground,
		"minimapGutter.addedBackground": components.editorGutter.addedBackground,
		"gitlens.decorations.addedForegroundColor": oklch(
			0.899,
			0.081,
			hue.green.gitLensAdded,
		)
			.alpha(0.918)
			.render(),
		"diffEditorGutter.insertedLineBackground": git.gutterbg.insertedLine,
		"diffEditor.insertedLineBackground":
			components.diffEditor.insertedLineBackground,
		"diffEditor.insertedTextBackground":
			components.diffEditor.insertedTextBackground,
		"diffEditor.insertedTextBorder": components.diffEditor.insertedTextBorder,
		"diffEditorGutter.removedLineBackground": oklch(
			0.209,
			0.058,
			hue.red.removedGutter,
		)
			.alpha(0.706)
			.render(),
		"diffEditor.removedLineBackground": oklch(
			0.128,
			0.024,
			hue.red.removedLine,
		).render(),
		"diffEditor.removedTextBorder": oklch(
			0.223,
			0.056,
			hue.red.diffDeletedBorder,
		)
			.alpha(0.133)
			.render(),
		"diffEditor.removedTextBackground": oklch(
			0.166,
			0.054,
			hue.red.removedTextBackground,
		)
			.alpha(0.733)
			.render(),
	},

	ui,
	componentOverrides: components,
} satisfies SlimThemeDefinition;

export const minted: ThemeDefinition = normalizeTheme(mintedSource);

export default minted;
