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
  make,
  normalizeTheme,
  type SlimThemeDefinition,
  type ThemeDefinition,
  type UserInterface,
} from "./types";
import { darken, l10, lighten, mix, transparentize } from "./utils";

// ============================================================================
// Minted-specific palette extensions
// ============================================================================

const mp = {
  ...p,
  fg: oklch(0.475, 0.052, 266).alpha(0.9),
  fgbright: oklch(0.836, 0.019, 269).alpha(0.91),
  fgsubtle: oklch(0.66, 0.044, 267).alpha(0.91),
  misty: oklch(0.66, 0.044, 267).alpha(0.91),
  uiFg: oklch(0.636, 0.062, 269).alpha(0.71),
  uiMuted: oklch(0.53, 0.078, 285).alpha(0.67),
} as const;

// ============================================================================
// Syntax Definition
// ============================================================================

const syntax: SlimThemeDefinition["syntax"] = {
  source: mp.fg,
  comments: mp.charcoal,
  strings: make({
    default: mp.wasabi2,
    regex: mp.peach,
  }),
  operators: {
    default: mp.crimson,
  },

  literals: {
    default: mp.cyan,
    string: mp.wasabi2,
    number: mp.cyan,
    boolean: mp.cyan,
    null: mp.lavender.alpha(0.81),
    undefined: mp.lavender.alpha(0.81),
    regex: mp.peach,
  },

  keywords: {
    default: mp.devwhite.alpha(0.81),
    operator: mp.crimson,
  },

  variables: {
    default: mp.slate,
    local: mp.slate,
    parameter: mp.slate,
    property: mp.taupe,
    global: mp.slate,
    other: mp.flatwhite.alpha(0.98),
  },

  constants: {
    default: mp.mist.alpha(0.76),
    numeric: mp.cyan,
    language: mp.cyan,
    userDefined: mp.mist.alpha(0.76),
  },

  functions: {
    default: mp.seafoam,
    declaration: mp.seafoam,
    call: mp.seafoam,
    method: mp.seafoam,
    builtin: mp.seafoam,
  },

  types: {
    default: mp.ice,
    primitive: mp.peach,
    class: mp.ice,
    interface: mp.ice,
    enum: mp.slate,
    typeParameter: mp.ice,
    namespace: mp.ice,
  },

  punctuation: {
    default: mp.mist.alpha(0.76),
    definition: oklch(0.355, 0.03, 292).alpha(0.82),
    delimiter: mp.charcoal,
    bracket: mp.charcoal,
    accessor: mp.charcoal,
  },

  meta: {
    default: mp.peach,
    decorator: mp.peach,
    macro: mp.peach,
    annotation: mp.peach,
    label: mp.blush,
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

const core = {
  background: mp.midnight,
  foreground: mp.fg.mix(mp.midnight, 0.2),
  accent: mp.lavender.alpha(0.81),
  highlight: mp.peach,
  active: mp.ice,
} as const;

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
  subtle: oklch(0.311, 0.057, 278),
  accent: oklch(0.701, 0.141, 287).alpha(0.81),
  focused: focusColor,
};

const borders: UserInterface<ColorLike>["borders"] = {
	default: oklch(0.483, 0.116, 279).alpha(0.08),
	active: core.accent.desaturate(0.1).darker(0.4).transparent(0.4),
	subtle: oklch(0.199, 0.018, 280).alpha(0.9),
	separator: mp.mist.alpha(0.1).hexa(),
	transparent: oklch(0.199, 0.018, 280).alpha(0.33),
};

const accent: UserInterface<ColorLike>["accent"] = {
	primary: mp.ice,
	primaryForeground: mp.ice,
	secondary: mp.peach,
	palette: [
		"#75E353FF",
		"#5EE578FF",
		"#69E7B8FF",
		"#74E1E8FF",
		"#7FB5EAFF",
		"#8A91ECFF",
	],
};

// ============================================================================
// UI
// ============================================================================

const ui: UserInterface<ColorLike> = {
	backgrounds,
	foregrounds,
	borders,
	accent,
	status: {
		error: mkElementColors(mp.crimson, {
			background: backgrounds.base,
			foreground: foregrounds.default,
		}),
		warning: {
			...mkElementColors(mp.peach, {
				background: backgrounds.base,
				foreground: foregrounds.default,
			}),
			foreground: oklch(0.914, 0.041, 208).hexa(),
		},
		info: mkElementColors(mp.bluegray, {
			background: backgrounds.base,
			foreground: foregrounds.default,
		}),
		success: {
			...mkElementColors(mp.seafoam, {
				background: backgrounds.base,
				foreground: foregrounds.default,
			}),
			foreground: oklch(0.915, 0.098, 131).hexa(),
		},
	},
	selection: {
		background: mix(syntax.source, mp.midnight, 0.5),
		backgroundInactive: transparentize(mp.white, 0.1),
		text: mp.charcoal,
		backgroundActive: oklch(0.244, 0.038, 290).alpha(0.33),
		collaboratorBackground: oklch(0.493, 0.037, 227),
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
			background: oklch(0.22, 0.052, 286).alpha(0.33),
		},
	},
	indentGuide: {
		background: oklch(0.19, 0.03, 283).alpha(0.8),
		activeBackground: oklch(0.37, 0.098, 281).alpha(0.6),
	},
	whitespace: {
		foreground: mp.editorWhitespace,
	},
	ruler: {
		foreground: oklch(0.272, 0.093, 284).alpha(0.23),
	},
	lineNumbers: {
		foreground: mp.lineNumberFg,
		activeForeground: mp.lineNumberActiveFg,
	},
	elements: {
		background: oklch(0.216, 0.037, 295),
		border: mp.hoverBorder,
		foreground: mp.hoverFg,
		selected: {
			background: oklch(0.269, 0.057, 282).alpha(0.67),
		},
	},

	git: {
		added: oklch(0.577, 0.063, 182).alpha(0.27),
		modified: Color.create(accent.primaryForeground)
			.set({
				l: (l) => l * 0.63,
				c: (c) => c * 1.47,
				h: (h) => h + 84,
			})
			.alpha(0.33),
		deleted: mp.deletedRose.alpha(0.3),
		wordAdded: oklch(0.45, 0.07, 258).alpha(0.21),
		wordDeleted: mp.deletedRose.alpha(0.27),
		untracked: mp.mist.alpha(0.76),
		ignored: mp.mist.alpha(0.76),
		conflict: mp.crimson,
		renamed: mp.gitRenamed,
		stageModified: mp.bluegray,
		stageDeleted: mp.gitStageDeleted,
		submodule: mp.gitSubmodule,
	},
	cursor: {
		foreground: mp.cursorRed,
	},
	window: {
		activeBorder: mp.windowBorder,
	},
	icon: {
		foreground: oklch(0.952, 0.034, 185),
		muted: oklch(0.108, 0.005, 280),
		accent: oklch(0.935, 0.088, 158).alpha(0.83),
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
		linkForeground: mp.seafoam,
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
		background: backgrounds.raised,
		foreground: lighten(mp.steel, 0.4),
		border: borders.subtle,
	},

	subtleElements: {
		background: oklch(0.118, 0.013, 280).alpha(0.52),
		selectionBackground: "#19163154",
		selected: {
			background: oklch(0.259, 0.067, 288).alpha(0.23),
		},
	},
};

// ============================================================================
// Components
// ============================================================================

const components = {
	editor: {
		background: darken(ui.backgrounds.base, 0.1),
		foreground: oklch(0.482, 0.056, 274).alpha(0.9),
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
			oklch(0.577, 0.097, 256).alpha(0.33),
			0.5,
		),
	},
	editorGutter: {
		background: ui.backgrounds.darker,
		modifiedBackground: mp.gold.transparent(),
		addedBackground: oklch(0.1, 0.01, 165),
		deletedBackground: oklch(0.12, 0.01, 6),
		foldingControl: mp.steel.transparent(),
	},
	editorLineNumber: {
		foreground: mp.charcoal,
		activeForeground: mp.mist.alpha(0.76),
	},
	editorWidget: {
		background: ui.backgrounds.surface,
		foreground: ui.foregrounds.default,
		border: ui.borders.default,
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
		badgeBackground: mp.alphaBlack,
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
	button: (() => {
		const btnBg = mp.midnight.mix(mp.devwhite.alpha(0.81), 0.15).rotate(15);
		const secondaryBg = mp.midnight.transparent(0.1);
		return {
			background: btnBg,
			foreground: mp.white.cool(1).darker(),
			hoverBackground: btnBg.lighter(),
			secondaryBackground: secondaryBg,
			secondaryForeground: mp.blush.lighter(0.1).transparent(0.9),
			secondaryHoverBackground: mp.midnight,
			border: btnBg.lighter(),
			secondaryBorder: btnBg.lighter(),
		};
	})(),
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
		sliderBackground: oklch(0.237, 0.051, 282).alpha(0.3),
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
		foreground: oklch(0.54, 0.066, 279).alpha(0.76),
		border: mix(ui.backgrounds.darker, mp.steel, 0.1),
		cursorForeground: mp.mist.alpha(0.76),
		selectionBackground: l10(mp.midnight),
		cursor: mp.mist.alpha(0.76),
		ansiBlack: mp.charcoal,
		ansiRed: mp.crimson,
		ansiGreen: mp.seafoam,
		ansiYellow: mp.peach,
		ansiBlue: mp.cyan,
		ansiMagenta: mp.lavender.alpha(0.81),
		ansiCyan: mp.ice,
		ansiWhite: mp.white,
		ansiBrightBlack: mp.steel,
		ansiBrightRed: mp.crimson,
		ansiBrightGreen: mp.seafoam,
		ansiBrightYellow: mp.peach,
		ansiBrightBlue: mp.cyan,
		ansiBrightMagenta: mp.lavender.alpha(0.81),
		ansiBrightCyan: mp.ice,
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
		insertedTextBackground: oklch(0.1, 0.01, 165), // function hue
		removedTextBackground: oklch(0.12, 0.01, 6), // operator hue
		insertedLineBackground: oklch(0.1, 0.01, 165),
		removedLineBackground: oklch(0.12, 0.01, 6),
		diagonalFill: mp.alphaWhite,
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
		"editorPane.background": mp.midnight2.render(),
		"editor.lineHighlightBackground": mp.lineHighlight.render(),
		"editor.wordHighlightBackground": mp.wordHighlight.render(),
		"editor.wordHighlightStrongBackground": mp.wordHighlightStrong.render(),
		"editorIndentGuide.background1": mp.indentGuide.render(),
		"editorIndentGuide.activeBackground1": mp.indentGuideActive.render(),
		"editorWhitespace.foreground": mp.editorWhitespace.render(),
		"editorRuler.foreground": mp.indentGuide.render(),
		"editorLineNumber.foreground": mp.lineNumberFg.render(),
		"editorLineNumber.activeForeground": mp.lineNumberActiveFg.render(),
		"editorHoverWidget.background": mp.hoverBg.render(),
		"editorHoverWidget.border": mp.hoverBorder.render(),
		"editorHoverWidget.foreground": mp.hoverFg.render(),
		"sideBarTitle.foreground": transparentize(mp.white, 0.5).hexa(),
		"statusBar.debuggingBackground": mp.debuggingBg.render(),
		"statusBar.debuggingForeground": mp.debuggingFg.render(),
		"statusBar.debuggingBorder": mp.debuggingBorder.render(),
		"tab.border": mp.tabBorder.render(),
		"editorGroupHeader.tabsBackground": mp.black.render(),
		"button.border": mp.buttonBorder.render(),
		"button.separator": mp.buttonSeparator.render(),
		"tree.indentGuidesStroke": Color.create(
			ui.indentGuide.activeBackground,
		).render(),
		"tree.inactiveIndentGuidesStroke": oklch(0.19, 0.02, 280)
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
	},

	ui,
	componentOverrides: components,
} satisfies SlimThemeDefinition;

export const minted: ThemeDefinition = normalizeTheme(mintedSource);

export default minted;
