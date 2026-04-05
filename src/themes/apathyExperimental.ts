/**
 * Apathy Experimental theme - converted to hierarchical slate-style format
 *
 * An experimental variant with brighter foreground and slightly different background.
 */

import { Color, mkElementColors } from "@/core/color";
import { SemanticTokenModifier } from "../types";
import {
	make,
	normalizeTheme,
	type SlimThemeDefinition,
	type ThemeDefinition,
} from "./types";
import { mix } from "./utils";

// ============================================================================
// 1. Color Palette
// ============================================================================

export enum palette {
	// Backgrounds
	background = "#12121c",
	panelBg = "#0e0b13",
	gutterBg = "#0c0c13",
	tabBg = "#0f0e10",
	tabHeaderBg = "#0d0b17",

	// Grays & Neutrals
	white = "#e1e2e5",
	softWhite = "#e3e1e8c8",
	muted = "#4D4A56",
	steel = "#829297",
	slate = "#9B8FB5",
	charcoal = "#454148",
	gray = "#7d7a8b",
	lightGray = "#B5B5B5",
	faintGray = "#74727794",

	// Blues & Cyans
	cyan = "#33b3cc",
	ice = "#93e3db",
	seafoam = "#95d4ca",
	softBlue = "#afd1e9cf",
	paleBlue = "#78DCE8",
	lightBlue = "#82AAFF",
	exportBlue = "#91aac0",
	importPurple = "#d09bd2",

	// Greens
	wasabi = "#b1d36d",
	mint = "#A1EFE4",
	lime = "#A6E22E",
	brightGreen = "#C3E88D",
	addedGreen = "#47cf7ec9",
	gitInserted = "#A7DA1E",

	// Warm accents
	gold = "#ffb547",
	amber = "#ffa114",
	yellow = "#FFCB6B",
	yellowNote = "#E6D86B",
	peach = "#FFD866",
	orange = "#FF7A00",
	gitModified = "#ffd014d4",
	gitModifiedAlt = "#F7B83D",

	// Reds & Pinks
	crimson = "#e60063",
	rose = "#FF6188",
	blush = "#e0a2b1",
	pink = "#f184bce6",
	coral = "#FF7859",
	errorRed = "#b70b24",
	gitDeleted = "#E61F44",
	deletedRed = "#F92672",

	// Purples
	lavender = "#998fe1cf",
	purple = "#C792EA",
	lilac = "#C574DD",
	paramPurple = "#8e8db3",
	accessor = "#7a73cc",

	// Browns
	taupe = "#8a7b5c",
	olive = "#6c6048",
	darkOlive = "#5c4c42",

	// Status
	warning = "#E6986B",
	info = "#78DCE8",

	// UI Elements
	selection = "#2d22476b",
	selectionHighlight = "#39324952",
	inactiveSelection = "#2d22473d",
	wordHighlight = "#383248a5",
	wordHighlightStrong = "#52486cab",
	findMatch = "#2a2540dc",
	findMatchHighlight = "#18142ddc",
	lineHighlight = "#1b162994",
	indentGuide = "#292533dc",
	indentGuideActive = "#2b2a2ddb",
	whitespace = "#272636",
	ruler = "#b8b1d222",
	widgetBg = "#0a0610",
	widgetBorder = "#45414C",
	suggestBg = "#1B1629",
	listActive = "#2A2441",
	focusBorder = "#a099ae14",
	tabBorder = "#212131",
	tabActiveBorder = "#d0cfd3",
	buttonBg = "#443e5040",
	buttonFg = "#acecffba",
	buttonBorder = "#60537836",
	inputBg = "#110f12",
	inputBorder = "#26242a",

	// Terminal ANSI
	ansiBlack = "#2A273F",
	ansiBrightBlack = "#3B3853",
	ansiRed = "#F07178",
	ansiBrightRed = "#FF5370",
}

export type PaletteValue = `${palette}`;

export const v = (k: PaletteValue): PaletteValue => k;

// ============================================================================
// 2. Theme Definition
// ============================================================================

const apathyExperimentalSource = {
	name: "Apathy Experimental",
	type: "dark",
	palette,
	background: palette.background,

	syntax: {
		source: palette.softWhite,
		comments: palette.muted,
		strings: make({
			default: palette.wasabi,
			regex: palette.rose,
		}),
		operators: {
			default: palette.crimson,
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
			modifier: palette.steel,
			operator: palette.crimson,
		},

		variables: {
			default: "#e3e1e8e4",
			parameter: palette.paramPurple,
			global: palette.amber,
		},

		constants: {
			default: palette.cyan,
			userDefined: "#e3e1e8e4",
		},

		functions: {
			default: palette.gold,
			declaration: palette.seafoam,
		},

		types: {
			default: palette.gold,
			interface: palette.ice,
			typeParameter: palette.ice,
		},

		punctuation: {
			default: palette.faintGray,
			definition: "#808080",
			bracket: "#747277",
			accessor: palette.accessor,
		},

		meta: {
			default: palette.blush,
			decorator: palette.pink,
			label: palette.softBlue,
		},
		storage: {
			default: palette.steel,
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
				default: palette.seafoam,
			},
		},
	},

	// Modifier handlers
	modifiers: {
		[SemanticTokenModifier.documentation]: {
			global: { foreground: palette.muted, fontStyle: "italic" },
		},
		[SemanticTokenModifier.static]: {
			global: { fontStyle: "bold" },
		},
		[SemanticTokenModifier.deprecated]: {
			global: { fontStyle: "strikethrough" },
		},
		[SemanticTokenModifier.modification]: {
			global: { foreground: palette.gitModified },
		},
		[SemanticTokenModifier.async]: {
			transform: (color: string) => new Color(color).mix(palette.softBlue, 0.1),
		},
	},

	ui: {
		backgrounds: {
			base: palette.background,
			surface: palette.panelBg,
			raised: palette.suggestBg,
			overlay: palette.widgetBg,
		},
		foregrounds: {
			default: "#cbdbe0b3",
			muted: palette.charcoal,
			subtle: palette.inputBorder,
			accent: palette.cyan,
		},
		borders: {
			default: palette.widgetBorder,
			active: palette.tabActiveBorder,
			subtle: palette.tabBorder,
		},
		accent: {
			primary: palette.cyan,
			primaryForeground: palette.brightGreen,
			secondary: palette.gold,
		},
		status: {
			error: mkElementColors(palette.errorRed, {
				background: palette.background,
				foreground: "#cbdbe0b3",
			}),
			warning: mkElementColors(palette.warning, {
				background: palette.background,
				foreground: "#cbdbe0b3",
			}),
			info: mkElementColors(palette.info, {
				background: palette.background,
				foreground: "#cbdbe0b3",
			}),
			success: mkElementColors(palette.addedGreen, {
				background: palette.background,
				foreground: "#cbdbe0b3",
			}),
		},
		selection: {
			background: palette.selection,
			backgroundInactive: palette.inactiveSelection,
			text: palette.white,
		},
		git: {
			added: palette.addedGreen,
			modified: palette.gitModified,
			deleted: palette.deletedRed,
			untracked: "#e1d9e79e",
			ignored: "#444248",
			conflict: palette.orange,
		},
	},
	componentOverrides: {
		editor: {
			background: palette.background,
			foreground: palette.white,
			lineHighlight: palette.lineHighlight,
			lineHighlightBorder: palette.lineHighlight,
			selectionHighlightBackground: palette.selectionHighlight,
			findMatchHighlightBackground: palette.findMatchHighlight,
			findMatchBackground: palette.findMatch,
			findRangeHighlightBackground: "#2A244120",
		},
		editorGutter: {
			background: palette.gutterBg,
			modifiedBackground: "#E9C062",
			addedBackground: "#A8FF60",
			deletedBackground: "#CC6666",
			foldingControl: palette.charcoal,
		},
		editorLineNumber: {
			foreground: palette.charcoal,
			activeForeground: palette.slate,
		},
		activityBar: {
			background: palette.panelBg,
			foreground: "#e3e1e8e4",
			inactiveForeground: palette.widgetBorder,
			border: palette.panelBg,
			badgeBackground: "#FF7A0000",
			badgeForeground: palette.brightGreen,
		},
		sideBar: {
			background: palette.panelBg,
			foreground: "#827b90cf",
			border: palette.panelBg,
			sectionHeaderBackground: "#0f0e1000",
			sectionHeaderForeground: "#e3e1e8b7",
		},
		panel: {
			background: palette.panelBg,
			foreground: "#e3e1e8e4",
			border: "#372d47",
			titleActiveForeground: "#e3e1e8e4",
			titleInactiveForeground: "#E0E0E0",
			titleActiveBorder: "#ffffff",
		},
		statusBar: {
			background: palette.panelBg,
			foreground: "#e3e1e88f",
			border: palette.panelBg,
			debuggingBackground: "#1f1a38",
			debuggingForeground: "#000000",
			noFolderBackground: "#0B0915",
			noFolderForeground: palette.muted,
		},
		tabs: {
			activeBackground: palette.tabBg,
			activeForeground: "#e3e1e8e4",
			activeBorder: palette.tabActiveBorder,
			activeBorderTop: palette.tabActiveBorder,
			inactiveBackground: palette.tabBg,
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
			hoverBackground: "#2A244140",
			hoverForeground: "#E6E2D1",
			focusBackground: palette.listActive,
			focusForeground: "#E6E2D1",
			highlightForeground: palette.gold,
		},
		input: {
			background: palette.inputBg,
			foreground: "#E6E2D1",
			border: palette.inputBorder,
			placeholderForeground: "#b5b5b545",
		},
		button: {
			background: palette.buttonBg,
			foreground: palette.buttonFg,
			hoverBackground: "#443e5053",
			secondaryBackground: "#17161e54",
			secondaryForeground: "#d0d5dbba",
			secondaryHoverBackground: "#2b293754",
		},
		dropdown: {
			background: palette.suggestBg,
			foreground: "#E6E2D1",
			border: palette.widgetBorder,
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
			sliderActiveBackground: palette.widgetBorder,
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
			foreground: "#e0e0e03c",
			focusForeground: "#E6E2D1",
			activeSelectionForeground: palette.yellow,
		},
		terminal: {
			background: palette.panelBg,
			foreground: "#dddde8dc",
			cursorForeground: palette.white,
			selectionBackground: palette.selection,
			cursor: palette.white,
			ansiBlack: palette.ansiBlack,
			ansiRed: palette.ansiRed,
			ansiGreen: palette.brightGreen,
			ansiYellow: palette.yellow,
			ansiBlue: palette.lightBlue,
			ansiMagenta: palette.purple,
			ansiCyan: "#89DDFF",
			ansiWhite: "#ECEFF4",
			ansiBrightBlack: palette.ansiBrightBlack,
			ansiBrightRed: palette.ansiBrightRed,
			ansiBrightGreen: palette.brightGreen,
			ansiBrightYellow: palette.yellow,
			ansiBrightBlue: palette.lightBlue,
			ansiBrightMagenta: palette.purple,
			ansiBrightCyan: "#89DDFF",
			ansiBrightWhite: "#FFFFFF",
		},
		notification: {
			background: palette.widgetBg,
			foreground: palette.white,
			border: palette.widgetBorder,
		},
		peekView: {
			editorBackground: "#0F0D1A",
			editorBorder: palette.widgetBorder,
			resultBackground: palette.suggestBg,
			resultSelectionBackground: palette.listActive,
			titleBackground: "#0B0915",
			titleForeground: "#E6E2D1",
		},
		diffEditor: {
			insertedTextBackground: "#13232080",
			removedTextBackground: "#f9267213",
			insertedLineBackground: "#132320bd",
			removedLineBackground: "#f9267213",
			diagonalFill: palette.widgetBorder,
		},
		merge: {
			currentHeaderBackground: palette.suggestBg,
			incomingHeaderBackground: palette.suggestBg,
			commonHeaderBackground: palette.suggestBg,
			currentContentBackground: mix(
				palette.addedGreen,
				palette.background,
				0.3,
			),
			incomingContentBackground: mix(palette.gold, palette.background, 0.3),
			commonContentBackground: mix(
				palette.widgetBorder,
				palette.background,
				0.3,
			),
		},
	},
} satisfies SlimThemeDefinition;

export const apathyExperimental: ThemeDefinition = normalizeTheme(
	apathyExperimentalSource,
);

export default apathyExperimental;
