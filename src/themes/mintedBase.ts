import {
	make,
	type UIComponents,
	type ThemeDefinition,
	type UserInterface,
	type ColorLike,
} from "./types";
import { SemanticTokenModifier } from "../types";
import { Color, makeColors } from "../core/color";
import {
	darken,
	l10,
	lighten,
	mix,
	transparentize,
} from "./utils";

export enum mintedBasePalette {
	midnight = "#0c0c13",
	midnight2 = "#0e0e15",
	midnightLight = "#161620",
	midnightDark = "#07070a",

	black = "#0f0f12",
	semiblack = "#0a0a0c",
	alphaBlack = "#0f0f1280",
	alphaWhite = "#e1e2e520",
	"#08080c" = "#08080c",

	charcoal = "#383d51",
	darkBlue = "#4B6672",
	bluegray = "#6372a1",
	"#527bb254" = "#527bb254",
	obsidian = "#201f31",
	taupe = "#7f8797",
	mist = "#767b95c2",
	steel = "#96a5b6",
	slate = "#9aa1c7",
	flatwhite = "#b1b1bffa",
	devwhite = "#afd1e9cf",
	white = "#e1e3e5",

	wasabi = "#c3dc8f",
	wasabi2 = "#b7d194",
	seafoam = "#9cd6bc",

	cyan = "#33b3cc",
	ice = "#b3e6de",

	lavender = "#998fe1cf",
	magenta = "#fc00ff",

	peach = "#ffb389",
	blush = "#e0a2d3",
	crimson = "#ca175d",
	gold = "#ffd014d4",

	softMist = "#585B70",
	dimGray = "#3A4158",
	deepGray = "#2B2F3F",

	nightPurple = "#201F31",
	deletedRose = "#A63B65",

	gray1 = "#5C5675",
	gray2 = "#3e3645d2",
	orange1 = "#FF7859",

	"#1abdda" = "#1abdda",
	"#88e6d6" = "#88e6d6",
	"#C3E88D" = "#C3E88D",
	"#ffb389" = "#ffb389",
	"#F07178" = "#F07178",
	"#6bffbfdb" = "#6bffbfdb",
	"#ff9d9ddf" = "#ff9d9ddf",
	"#efadeab0" = "#efadeab0",

	cursorRed = "#da4c51",

	lineHighlight = "#1b162994",
	wordHighlight = "#383248a5",
	wordHighlightStrong = "#564f66ab",

	indentGuide = "#291e2969",
	indentGuideActive = "#654d6569",
	editorWhitespace = "#272636",

	widgetBorder = "#45414C",
	widgetSelection = "#2A2441",
	hoverBg = "#13141bbc",
	hoverBorder = "#131a24",
	hoverFg = "#d4edffa7",

	menuBg = "#1B1629",

	windowBorder = "#183856ff",

	focusBorderAlpha = "#a099ae14",

	tabBorder = "#212131",

	gitRenamed = "#449dab",
	gitStageDeleted = "#914c54",
	gitSubmodule = "#8db9e2",

	composerBg = "#12151c",

	debugInfo = "#78DCE8",
	debugError = "#ff6161",
	debugWarning = "#FFCB6B",

	debuggingBg = "#3fffbdf2",
	debuggingFg = "#5b0092",
	debuggingBorder = "#4be4b5f2",

	peekMatchHighlight = "#CC850040",

	settingsHeaderFg = "#d1deeacc",
	settingsInputBg = "#121217",
	settingsInputBorder = "#1c1c25",

	errorBg = "#52000045",
	listError = "#a84e4e",

	textPreformatBg = "#050e0cf0",
	textPreformatFg = "#90e3bccf",

	iconFg = "#5f6384b8",

	prDraft = "#331f57",

	chatRequestBg = "#04041b",

	buttonBorder = "#3d374978",
	buttonSeparator = "#584b7036",

	lineNumberFg = "#454148",
	lineNumberActiveFg = "#9B8FB5",
}

const colors = makeColors(mintedBasePalette);

export const mintedBaseTokens: ThemeDefinition["tokens"] = {
	source: mintedBasePalette.mist,
	comments: mintedBasePalette.charcoal,
	strings: make({
		default: mintedBasePalette.wasabi2,
		regex: mintedBasePalette.peach,
	}),
	operators: {
		default: mintedBasePalette.crimson,
	},
	literals: {
		default: mintedBasePalette.cyan,
		string: mintedBasePalette.wasabi2,
		number: mintedBasePalette.cyan,
		boolean: mintedBasePalette.cyan,
		null: mintedBasePalette.lavender,
		undefined: mintedBasePalette.lavender,
		regex: mintedBasePalette.peach,
	},
	keywords: {
		default: mintedBasePalette.devwhite,
		operator: mintedBasePalette.crimson,
	},
	variables: {
		default: mintedBasePalette.slate,
		local: mintedBasePalette.slate,
		parameter: mintedBasePalette.slate,
		property: mintedBasePalette.taupe,
		global: mintedBasePalette.slate,
		other: mintedBasePalette.flatwhite,
	},
	constants: {
		default: mintedBasePalette.mist,
		numeric: mintedBasePalette.cyan,
		language: mintedBasePalette.cyan,
		userDefined: mintedBasePalette.mist,
	},
	functions: {
		default: mintedBasePalette.seafoam,
		declaration: mintedBasePalette.seafoam,
		call: mintedBasePalette.seafoam,
		method: mintedBasePalette.seafoam,
		builtin: mintedBasePalette.seafoam,
	},
	types: {
		default: mintedBasePalette.ice,
		primitive: mintedBasePalette.peach,
		class: mintedBasePalette.ice,
		interface: mintedBasePalette.ice,
		enum: mintedBasePalette.slate,
		typeParameter: mintedBasePalette.ice,
		namespace: mintedBasePalette.ice,
	},
	punctuation: {
		default: mintedBasePalette.mist,
		definition: mintedBasePalette.gray2,
		delimiter: mintedBasePalette.charcoal,
		bracket: mintedBasePalette.charcoal,
		accessor: mintedBasePalette.charcoal,
	},
	meta: {
		default: mintedBasePalette.peach,
		decorator: mintedBasePalette.peach,
		macro: mintedBasePalette.peach,
		annotation: mintedBasePalette.peach,
		label: mintedBasePalette.blush,
		tag: mintedBasePalette.gray1,
	},
	storage: {
		default: mintedBasePalette.bluegray,
		type: mintedBasePalette.bluegray,
	},
	special: {
		jsxClass: mintedBasePalette.blush,
	},
};

const core = {
	background: colors.midnight,
	foreground: colors.mist.mix(colors.midnight, 0.2),
	accent: colors.lavender,
	highlight: colors.peach,
	active: colors.ice,
} as const;

const overlay = colors.charcoal
	.saturate()
	.lighter()
	.transparent(0.1)
	.rotate(15)
	.hexa();

const backgrounds: UserInterface<ColorLike>["backgrounds"] = {
	base: colors.midnight,
	darker: colors.midnight.darker(0.2),
	surface: colors.midnight.lighter(0.15),
	raised: colors.obsidian.mix(colors.midnight, 0.8).saturate(0.3),
	overlay,
	codeBlock: colors.midnightDark.darker(0.2),
};

const foregrounds: UserInterface<ColorLike>["foregrounds"] = {
	default: colors.mist.mix(colors.midnight, 0.2),
	muted: colors.mist.mix(colors.midnight, 0.5).mix(colors.charcoal, 2),
	subtle: colors.charcoal.mix(colors.midnight, 0.3),
	accent: core.accent,
	focused: colors.peach,
};

const baseBorder = colors.charcoal.mix(colors.midnight, 0.8);

const borders: UserInterface<ColorLike>["borders"] = {
	default: baseBorder,
	active: core.accent.desaturate(0.1).darker(0.4).transparent(0.4),
	subtle: baseBorder.transparent(0.9),
	separator: colors.mist.alpha(0.1).hexa(),
};

const accent: UserInterface<ColorLike>["accent"] = {
	primary: colors.ice,
	primaryForeground: colors.ice,
	secondary: colors.peach,
	palette: [
		"#88e6d6",
		"#C3E88D",
		"#ffb389",
		"#F07178",
		"#6bffbfdb",
		"#8b00ff",
	],
};

const mintedBaseOverrides: UIComponents<ColorLike> = {
	editor: {
		background: darken(backgrounds.base, 0.1),
		foreground: foregrounds.default,
		lineHighlight: mintedBasePalette.lineHighlight,
		lineHighlightBorder: lighten(backgrounds.base, 0.15),
		findMatchHighlightBackground: transparentize(
			mix(mintedBasePalette.lavender, backgrounds.base, 0.8),
			0.5,
		),
		findRangeHighlightBackground: transparentize(
			mix(mintedBasePalette.lavender, backgrounds.base, 0.8),
			0.5,
		),
		selectionHighlightBackground: transparentize(
			mix(mintedBasePalette.lavender, backgrounds.base, 0.8),
			0.5,
		),
		lineNumberActiveForeground: mintedBasePalette.mist,
		lineNumberForeground: darken(mintedBasePalette.mist, 0.7),
		selectionBackground: mix(mintedBaseTokens.source, mintedBasePalette.midnight, 0.8),
		inactiveSelectionBackground: darken(mintedBasePalette.lavender, 0.8),
		findMatchBackground: mix(
			mintedBasePalette.midnight,
			mintedBasePalette["#527bb254"],
			0.5,
		),
	},
	editorGutter: {
		background: backgrounds.darker,
		modifiedBackground: colors.gold.transparent(),
		addedBackground: colors.seafoam.transparent(),
		deletedBackground: colors.crimson.transparent(),
		foldingControl: colors.steel.transparent(),
	},
	editorLineNumber: {
		foreground: mintedBasePalette.charcoal,
		activeForeground: mintedBasePalette.mist,
	},
	editorWidget: {
		background: backgrounds.surface,
		foreground: foregrounds.default,
		border: borders.default,
	},
	titleBar: {
		inactiveBackground: backgrounds.base,
		inactiveForeground: mintedBasePalette.mist,
		activeBackground: mintedBasePalette.midnight,
		activeForeground: mintedBasePalette.mist,
	},
	activityBar: {
		background: backgrounds.darker,
		foreground: darken(mintedBasePalette.mist, 0.1),
		inactiveForeground: darken(mintedBasePalette.mist, 0.5),
		border: mintedBasePalette.semiblack,
		badgeBackground: mintedBasePalette.alphaBlack,
		badgeForeground: mintedBasePalette.wasabi,
	},
	sideBar: {
		background: backgrounds.base,
		foreground: mix(mintedBasePalette.mist, mintedBasePalette.midnight, 0.2),
		border: borders.default,
		sectionHeaderBackground: mintedBasePalette.midnight,
		sectionHeaderForeground: mintedBasePalette.mist,
	},
	panel: {
		background: darken(backgrounds.base, 0.05),
		foreground: mintedBasePalette.mist,
		border: borders.default,
		titleActiveForeground: mintedBasePalette.mist,
		titleInactiveForeground: mintedBasePalette.mist,
		titleActiveBorder: mintedBasePalette.steel,
	},
	statusBar: {
		background: mintedBasePalette.midnight,
		foreground: mintedBasePalette.mist,
		border: borders.default,
		debuggingBackground: mintedBasePalette.seafoam,
		debuggingForeground: colors.ice.darker(0.8),
		noFolderBackground: mintedBasePalette.midnight,
		noFolderForeground: mintedBasePalette.mist,
	},
	tabs: {
		activeBackground: mintedBasePalette.midnight,
		activeForeground: mintedBasePalette.mist,
		activeBorder: borders.default,
		activeBorderTop: mintedBasePalette.steel,
		inactiveBackground: mintedBasePalette.midnight,
		inactiveForeground: mintedBasePalette.mist,
		hoverBackground: mintedBasePalette.midnight,
		hoverForeground: mintedBasePalette.mist,
		unfocusedActiveBackground: mintedBasePalette.midnight,
		unfocusedActiveForeground: mintedBasePalette.mist,
		modifiedBorder: mintedBasePalette.peach,
	},
	list: {
		activeSelectionBackground: mintedBasePalette.midnight,
		activeSelectionForeground: mintedBasePalette.mist,
		inactiveSelectionBackground: mintedBasePalette.midnight,
		inactiveSelectionForeground: mintedBasePalette.mist,
		hoverBackground: mintedBasePalette.midnight,
		hoverForeground: mintedBasePalette.mist,
		focusBackground: mintedBasePalette.midnight,
		focusForeground: mintedBasePalette.mist,
		highlightForeground: mintedBasePalette.steel,
	},
	input: {
		background: backgrounds.surface,
		foreground: lighten(mintedBasePalette.mist, 0.4),
		placeholderForeground: darken(mintedBasePalette.mist, 0.2),
		border: borders.subtle,
	},
	button: (() => {
		const bg = colors.midnight.mix(colors.devwhite, 0.15).rotate(15);
		const secondaryBg = colors.midnight.transparent(0.1);
		return {
			background: bg,
			foreground: colors.white.cool(1).darker(),
			hoverBackground: bg.lighter(),
			secondaryBackground: secondaryBg,
			secondaryForeground: colors.blush.lighter(0.1).transparent(0.9),
			secondaryHoverBackground: colors.midnight,
			border: bg.lighter(),
			secondaryBorder: bg.lighter(),
		};
	})(),
	dropdown: {
		background: mintedBasePalette.midnight,
		foreground: mintedBasePalette.mist,
		border: darken(mintedBasePalette.steel, 0.2),
		listBackground: mintedBasePalette.midnight,
	},
	badge: {
		background: mintedBasePalette.midnight,
		foreground: mintedBasePalette.mist,
		border: lighten(mintedBasePalette.midnight, 0.2),
	},
	scrollbar: {
		shadow: mintedBasePalette.midnight,
		sliderBackground: colors.midnight.lighter(),
		sliderHoverBackground: mintedBasePalette.midnight,
		sliderActiveBackground: mintedBasePalette.midnight,
	},
	minimap: {
		background: mintedBasePalette.midnight,
		selectionHighlight: mintedBasePalette.mist,
		errorHighlight: mintedBasePalette.crimson,
		warningHighlight: mintedBasePalette.peach,
		findMatchHighlight: mix(
			backgrounds.surface,
			mintedBasePalette.lavender,
			0.5,
		),
	},
	breadcrumb: {
		background: mintedBasePalette.midnight,
		foreground: mintedBasePalette.mist,
		focusForeground: mintedBasePalette.mist,
		activeSelectionForeground: mintedBasePalette.mist,
	},
	terminal: {
		background: backgrounds.darker,
		foreground: mintedBasePalette.mist,
		border: mix(backgrounds.darker, mintedBasePalette.steel, 0.1),
		cursorForeground: mintedBasePalette.mist,
		selectionBackground: l10(mintedBasePalette.midnight),
		cursor: mintedBasePalette.mist,
		ansiBlack: mintedBasePalette.charcoal,
		ansiRed: mintedBasePalette.crimson,
		ansiGreen: mintedBasePalette.seafoam,
		ansiYellow: mintedBasePalette.peach,
		ansiBlue: mintedBasePalette.cyan,
		ansiMagenta: mintedBasePalette.lavender,
		ansiCyan: mintedBasePalette.ice,
		ansiWhite: mintedBasePalette.white,
		ansiBrightBlack: mintedBasePalette.steel,
		ansiBrightRed: mintedBasePalette.crimson,
		ansiBrightGreen: mintedBasePalette.seafoam,
		ansiBrightYellow: mintedBasePalette.peach,
		ansiBrightBlue: mintedBasePalette.cyan,
		ansiBrightMagenta: mintedBasePalette.lavender,
		ansiBrightCyan: mintedBasePalette.ice,
		ansiBrightWhite: mintedBasePalette.flatwhite,
	},
	notification: {
		background: mintedBasePalette.midnight,
		foreground: mintedBasePalette.mist,
		border: mintedBasePalette.steel,
	},
	peekView: {
		editorBackground: mintedBasePalette.midnight,
		editorBorder: mintedBasePalette.steel,
		resultBackground: mintedBasePalette.midnight,
		resultSelectionBackground: mintedBasePalette.midnight,
		titleBackground: mintedBasePalette.midnight,
		titleForeground: mintedBasePalette.mist,
	},
	diffEditor: {
		insertedTextBackground: "#09131588",
		removedTextBackground: "#2e060982",
		insertedLineBackground: "#09131588",
		removedLineBackground: "#1202049e",
		diagonalFill: mintedBasePalette.steel,
	},
	merge: (() => {
		const incoming = colors.midnight
			.mix(colors.seafoam, 0.1)
			.saturate(1)
			.darker(0.2);
		const current = colors.midnight.mix(colors.cyan, 0.1).saturate(1).darker(0.2);
		const common = colors.midnight
			.mix(colors.peach, 0.1)
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
		requestBackground: mintedBasePalette.chatRequestBg,
		codeBlockBackground: backgrounds.codeBlock,
	},
};

export const mintedBaseUi: ThemeDefinition["ui"] = {
	backgrounds,
	foregrounds,
	borders,
	accent,
	status: {
		error: mintedBasePalette.crimson,
		warning: mintedBasePalette.peach,
		info: mintedBasePalette.cyan,
		success: mintedBasePalette.seafoam,
	},
	selection: {
		background: mix(mintedBaseTokens.source, mintedBasePalette.midnight, 0.5),
		backgroundInactive: transparentize(mintedBasePalette.white, 0.1),
		text: mintedBasePalette.charcoal,
		backgroundActive: mintedBasePalette.darkBlue,
	},
	highlights: {
		word: {
			background: mintedBasePalette.wordHighlight,
			backgroundStrong: mintedBasePalette.wordHighlightStrong,
		},
		selection: {
			backgroundActive: mix(mintedBaseTokens.source, mintedBasePalette.midnight, 0.5),
			backgroundInactive: mintedBasePalette.charcoal,
		},
		activeLine: {
			background: mintedBasePalette.lineHighlight,
		},
	},
	indentGuide: {
		background: mintedBasePalette.indentGuide,
		activeBackground: mintedBasePalette.indentGuideActive,
	},
	whitespace: {
		foreground: mintedBasePalette.editorWhitespace,
	},
	ruler: {
		foreground: core.accent.mix(colors.midnight),
	},
	lineNumbers: {
		foreground: mintedBasePalette.lineNumberFg,
		activeForeground: mintedBasePalette.lineNumberActiveFg,
	},
	hoverWidget: {
		background: mintedBasePalette.hoverBg,
		border: mintedBasePalette.hoverBorder,
		foreground: mintedBasePalette.hoverFg,
	},
	git: {
		added: mintedBasePalette.seafoam,
		modified: mintedBasePalette.bluegray,
		deleted: mintedBasePalette.deletedRose,
		untracked: mintedBasePalette.mist,
		ignored: mintedBasePalette.mist,
		conflict: mintedBasePalette.crimson,
		renamed: mintedBasePalette.gitRenamed,
		stageModified: mintedBasePalette.bluegray,
		stageDeleted: mintedBasePalette.gitStageDeleted,
		submodule: mintedBasePalette.gitSubmodule,
	},
	cursor: {
		foreground: mintedBasePalette.cursorRed,
	},
	window: {
		activeBorder: mintedBasePalette.windowBorder,
	},
	icon: {
		foreground: mintedBasePalette.iconFg,
	},
	focus: {
		border: mintedBasePalette.focusBorderAlpha,
		contrastBorder: mintedBasePalette.focusBorderAlpha,
	},
	menu: {
		background: mintedBasePalette.menuBg,
		foreground: mintedBasePalette.steel,
		selectionBackground: mintedBasePalette.widgetSelection,
		selectionForeground: mintedBasePalette.white,
		separatorBackground: mintedBasePalette.widgetBorder,
	},
	suggestWidget: {
		border: mintedBasePalette.widgetBorder,
		foreground: mintedBasePalette.white,
		selectedBackground: mintedBasePalette.widgetSelection,
	},
	progressBar: {
		background: mintedBasePalette["#C3E88D"],
	},
	debug: {
		infoForeground: mintedBasePalette.debugInfo,
		warningForeground: mintedBasePalette.debugWarning,
		errorForeground: mintedBasePalette.debugError,
		sourceForeground: mintedBasePalette.white,
	},
	text: {
		linkForeground: mintedBasePalette.seafoam,
		preformatBackground: mintedBasePalette.textPreformatBg,
		preformatForeground: mintedBasePalette.textPreformatFg,
		separatorForeground: transparentize(mintedBasePalette.widgetBorder, 0.5),
	},
	error: {
		background: mintedBasePalette.errorBg,
		listForeground: mintedBasePalette.listError,
	},
	peekView: {
		matchHighlightBackground: mintedBasePalette.peekMatchHighlight,
		titleDescriptionForeground: mintedBasePalette.flatwhite,
	},
	panels: {
		background: darken(backgrounds.base, 0.05),
		foreground: mintedBasePalette.mist,
		titleForeground: transparentize(mintedBasePalette.white, 0.5),
	},
	inlineHints: {
		background: backgrounds.raised,
		foreground: lighten(mintedBasePalette.steel, 0.4),
		border: borders.subtle,
	},
	breadcrumb: mintedBaseOverrides.breadcrumb,
	terminal: mintedBaseOverrides.terminal,
	notification: mintedBaseOverrides.notification,
	diffEditor: mintedBaseOverrides.diffEditor,
	merge: mintedBaseOverrides.merge,
	chat: mintedBaseOverrides.chat,
	overrides: mintedBaseOverrides,
};

export const mintedBaseLanguageOverrides: ThemeDefinition["languageOverrides"] = {
	go: {
		functions: {
			default: mintedBasePalette.ice,
		},
	},
	css: {
		variables: {
			default: mintedBasePalette.slate,
			property: mintedBasePalette.darkBlue,
		},
	},
};

export const mintedBaseSemantic: NonNullable<ThemeDefinition["semantic"]> = {
	comment: mintedBasePalette.charcoal,
	string: mix(mintedBasePalette.wasabi2, backgrounds.base, 0.3),
	keyword: mintedBasePalette.lavender,
	number: mintedBasePalette.cyan,
	regexp: mintedBasePalette.peach,
	operator: mintedBasePalette.crimson,
	namespace: mintedBasePalette.ice,
	type: mintedBasePalette.ice,
	struct: mintedBasePalette.ice,
	class: mintedBasePalette.ice,
	interface: mintedBasePalette.ice,
	enum: mintedBasePalette.slate,
	typeParameter: mintedBasePalette.ice,
	function: mix(mintedBasePalette.seafoam, backgrounds.base, 0.3),
	method: mintedBasePalette.seafoam,
	decorator: mintedBasePalette.peach,
	macro: mintedBasePalette.peach,
	variable: mintedBasePalette.slate,
	parameter: mintedBasePalette.slate,
	property: mix(mintedBasePalette.taupe, backgrounds.base, 0.3),
	label: mintedBasePalette.blush,
};

export const mintedBaseModifiers: NonNullable<ThemeDefinition["modifiers"]> = {
	[SemanticTokenModifier.documentation]: {
		global: { foreground: mintedBasePalette.charcoal, fontStyle: "italic" },
	},
	[SemanticTokenModifier.static]: {
		global: { fontStyle: "" },
	},
	[SemanticTokenModifier.deprecated]: {
		global: { fontStyle: "strikethrough" },
	},
	[SemanticTokenModifier.async]: {
		transform: (color: string) =>
			new Color(color).mix(mintedBasePalette.lavender, 0.1),
	},
	[SemanticTokenModifier.declaration]: {
		transform: (color) => mix(color, foregrounds.default, 0.5),
	},
};

export const mintedBaseExtraColors: NonNullable<ThemeDefinition["extraColors"]> = {
	"editorPane.background": mintedBasePalette.midnight2,
	"editor.lineHighlightBackground": mintedBasePalette.lineHighlight,
	"editor.wordHighlightBackground": mintedBasePalette.wordHighlight,
	"editor.wordHighlightStrongBackground": mintedBasePalette.wordHighlightStrong,
	"editorIndentGuide.background1": mintedBasePalette.indentGuide,
	"editorIndentGuide.activeBackground1": mintedBasePalette.indentGuideActive,
	"editorWhitespace.foreground": mintedBasePalette.editorWhitespace,
	"editorRuler.foreground": mintedBasePalette.indentGuide,
	"editorLineNumber.foreground": mintedBasePalette.lineNumberFg,
	"editorLineNumber.activeForeground": mintedBasePalette.lineNumberActiveFg,
	"editorHoverWidget.background": mintedBasePalette.hoverBg,
	"editorHoverWidget.border": mintedBasePalette.hoverBorder,
	"editorHoverWidget.foreground": mintedBasePalette.hoverFg,
	"sideBarTitle.foreground": transparentize(mintedBasePalette.white, 0.5).hexa(),
	"statusBar.debuggingBackground": mintedBasePalette.debuggingBg,
	"statusBar.debuggingForeground": mintedBasePalette.debuggingFg,
	"statusBar.debuggingBorder": mintedBasePalette.debuggingBorder,
	"tab.border": mintedBasePalette.tabBorder,
	"editorGroupHeader.tabsBackground": mintedBasePalette.black,
	"button.border": mintedBasePalette.buttonBorder,
	"button.separator": mintedBasePalette.buttonSeparator,
	"tree.indentGuidesStroke": mintedBasePalette.widgetBorder,
	"settings.headerForeground": mintedBasePalette.settingsHeaderFg,
	"settings.textInputBackground": mintedBasePalette.settingsInputBg,
	"settings.textInputForeground": mintedBasePalette.steel,
	"settings.textInputBorder": mintedBasePalette.settingsInputBorder,
	"composerPane.background": mintedBasePalette.composerBg,
	"pullRequests.draft": mintedBasePalette.prDraft,
	"chat.requestBackground": mintedBasePalette.chatRequestBg,
	"list.focusBackground": mintedBasePalette.widgetSelection,
};
