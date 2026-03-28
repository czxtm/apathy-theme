/**
 * Minted Theory theme
 *
 * Built from Minted, but remapped using a color-theory palette:
 * - primary cyan
 * - complementary coral
 * - analogous blue/green
 * - split complements for contrast accents
 */

import type { ThemeDefinition } from "./types";
import { mix, transparentize } from "./utils";
import { c, Color, mkColor } from "../core/color";
import type { MkColorOptions } from "../core/color";
import { SemanticTokenModifier } from "../types";
import {
	mintedBaseExtraColors,
	mintedBaseLanguageOverrides,
	mintedBaseModifiers,
	mintedBasePalette,
	mintedBaseSemantic,
	mintedBaseTokens,
	mintedBaseUi,
} from "./mintedBase";

const baseAccent = "#B3E6DEFF";
const baseError = "#b13564";
const baseForeground = "#575B6FCE";
const baseMuted = "#3A4159FF";
const baseSubtle = "#2B2E3EFF";

const base = {
	background: "#0C0C13",
	surface: "#101018",
	raised: "#161a27",

	foreground: baseForeground,
	muted: baseMuted,
	subtle: baseSubtle,
};

export const tc = (input: string, opts: Partial<MkColorOptions>) =>
	mkColor(input, {
		background: base.background,
		foreground: base.foreground,
		...opts,
	});

export const palette = {
	// background: "#101018",
	background: "#0C0C13",
	surface: "#101018",
	raised: "#161a27",

	foreground: baseForeground,
	muted: baseMuted,
	subtle: baseSubtle,

	border: tc(base.subtle, { contrast: { minContrast: 1.4, maxContrast: 5.5 } }),

	warning: "#ffdecc",
	errora: "#e59ac2",
	info: "#83a6d2",
	hint: "#9483d2",
	success: "#a1cec5",
	rosewater: "#f5e0dc",

	// Color-theory anchors (derived from Minted's base accent)
	primary: new Color(baseAccent).saturate(0.08).lighter(0.1).hexa(),
	complement: new Color(baseAccent)
		.rotate(180)
		.desaturate(0.14)
		.lighter(0.12)
		.hexa(),
	analogousBlue: new Color(baseAccent)
		.rotate(-26)
		.saturate(0.06)
		.lighter(0.1)
		.hexa(),
	analogousGreen: new Color(baseAccent)
		.rotate(26)
		.saturate(0.06)
		.lighter(0.08)
		.hexa(),
	splitGold: new Color(baseAccent)
		.rotate(210)
		.desaturate(0.08)
		.lighter(0.14)
		.hexa(),
	splitViolet: new Color(baseAccent)
		.rotate(150)
		.desaturate(0.06)
		.lighter(0.08)
		.hexa(),

	error: new Color(baseError).desaturate(0.05).lighter(0.05).hexa(),
} as const;

export const theme = {
	border: c(palette.subtle).mix(c(palette.background), 0.5).hexa(),
};

const tokens: ThemeDefinition["tokens"] = {
	source: palette.foreground,
	comments: palette.subtle,
	strings: {
		...mintedBaseTokens.strings,
		default: palette.analogousGreen,
		regex: palette.complement,
	},
	operators: {
		...mintedBaseTokens.operators,
		default: palette.complement,
	},
	literals: {
		...mintedBaseTokens.literals,
		default: palette.primary,
		string: palette.analogousGreen,
		number: palette.primary,
		boolean: palette.primary,
		null: palette.splitViolet,
		undefined: palette.splitViolet,
		regex: palette.complement,
	},
	keywords: {
		...mintedBaseTokens.keywords,
		default: palette.foreground,
		operator: palette.complement,
	},
	variables: {
		...mintedBaseTokens.variables,
		default: palette.foreground,
		local: palette.foreground,
		parameter: palette.analogousBlue,
		property: mix(palette.foreground, palette.splitGold, 0.2),
		global: palette.analogousBlue,
		other: palette.foreground,
	},
	constants: {
		...mintedBaseTokens.constants,
		default: palette.primary,
		numeric: palette.primary,
		language: palette.primary,
		userDefined: palette.foreground,
	},
	functions: {
		...mintedBaseTokens.functions,
		default: palette.analogousGreen,
		declaration: palette.analogousGreen,
		call: palette.analogousGreen,
		method: palette.analogousGreen,
		builtin: palette.analogousGreen,
	},
	types: {
		...mintedBaseTokens.types,
		default: palette.analogousBlue,
		primitive: palette.splitGold,
		class: palette.analogousBlue,
		interface: palette.analogousBlue,
		enum: palette.splitViolet,
		typeParameter: palette.analogousBlue,
		namespace: palette.analogousBlue,
	},
	punctuation: {
		...mintedBaseTokens.punctuation,
		default: palette.muted,
		definition: palette.subtle,
		delimiter: palette.subtle,
		bracket: palette.muted,
		accessor: palette.subtle,
	},
	meta: {
		...mintedBaseTokens.meta,
		default: palette.complement,
		decorator: palette.complement,
		macro: palette.complement,
		annotation: palette.complement,
		label: palette.splitViolet,
		tag: palette.splitGold,
	},
	storage: {
		...mintedBaseTokens.storage,
		default: palette.analogousBlue,
		type: palette.analogousBlue,
	},
	special: {
		...mintedBaseTokens.special,
	},
};

const baseOverrides = mintedBaseUi.overrides;
if (!baseOverrides) {
	throw new Error("Minted Theory expects Minted to define ui.overrides");
}

const terminalOverrides = mintedBaseUi.overrides?.terminal
	? {
			...mintedBaseUi.overrides.terminal,
			background: "#0A0A0FFF",
			foreground: mix(palette.foreground, palette.analogousGreen, 0.18),
			ansiBlack: "#0B0A0FFF",
			ansiRed: new Color(palette.error).rotate(18).darker(0.4).hexa(),
			ansiGreen: new Color(palette.analogousBlue)
				.darker(0.22)
				.mix(new Color(palette.splitGold).darker(0.22), 0.55)
				.hexa(),
			ansiYellow: new Color(palette.splitGold)
				.darker(0.18)
				.mix(new Color(palette.analogousBlue).darker(0.55), 0.2)
				.hexa(),
			ansiBlue: new Color(palette.analogousGreen)
				.darker(0.55)
				.mix(new Color(palette.splitViolet).darker(0.45), 0.35)
				.hexa(),
			ansiMagenta: palette.error,
			ansiCyan: new Color(palette.primary).darker(0.18).hexa(),
			ansiBrightRed: new Color(palette.error)
				.rotate(12)
				.lighter(0.1)
				.saturate(0.32)
				.hexa(),
			ansiBrightYellow: new Color(palette.splitGold)
				.darker(0.32)
				.mix(new Color(palette.analogousBlue).darker(0.48), 0.16)
				.hexa(),
			ansiBrightMagenta: new Color(palette.error)
				.lighter(0.28)
				.saturate(0.18)
				.hexa(),
		}
	: undefined;

export const mintedTheory: ThemeDefinition = {
	name: "Minted Theory",
	type: "dark",
	palette: {
		...mintedBasePalette,
		...palette,
	},
	background: c(palette.background),
	tokens,
	languageOverrides: mintedBaseLanguageOverrides,
	semantic: {
		...mintedBaseSemantic,
		comment: palette.subtle,
		string: palette.analogousGreen,
		keyword: palette.foreground,
		number: palette.primary,
		regexp: palette.complement,
		operator: palette.complement,
		namespace: palette.analogousBlue,
		type: palette.analogousBlue,
		struct: palette.analogousBlue,
		class: palette.analogousBlue,
		interface: palette.analogousBlue,
		enum: palette.splitViolet,
		typeParameter: palette.analogousBlue,
		function: palette.analogousGreen,
		method: palette.analogousGreen,
		decorator: palette.complement,
		macro: palette.complement,
		variable: palette.foreground,
		parameter: palette.analogousBlue,
		property: mix(palette.foreground, palette.splitGold, 0.2),
		label: palette.splitViolet,
	},
	modifiers: {
		...mintedBaseModifiers,
		[SemanticTokenModifier.declaration]: {
			transform: (color) => new Color(color).lighter(0.05).hexa(),
		},
	},
	extraColors: mintedBaseExtraColors,
	ui: {
		...mintedBaseUi,
		backgrounds: {
			...mintedBaseUi.backgrounds,
			base: palette.background,
			darker: mix(palette.background, "#000000", 0.4),
			surface: palette.surface,
			raised: "#13141bbc",
			overlay: mix(palette.raised, "#000000", 0.2),
			codeBlock: mix(palette.background, "#000000", 0.5),
		},
		foregrounds: {
			...mintedBaseUi.foregrounds,
			default: palette.foreground,
			muted: palette.muted,
			subtle: palette.subtle,
			accent: palette.primary,
			focused: palette.complement,
		},
		borders: {
			...mintedBaseUi.borders,
			default: theme.border,
			active: transparentize(palette.primary, 0.5),
			subtle: transparentize(palette.subtle, 0.85),
			separator: transparentize(palette.foreground, 0.9),
		},
		elements: {
			background: "#11111CE6",
			hover: "#141426F0",
			active: "#29294DB3",
			selected: "#3535547A",
			disabled: "#1D1F26F0",
			foreground: palette.foreground,
			border: theme.border,
		},
		subtleElements: {
			background: "#2323432E",
			hover: "#3C3C5D26",
			active: "#2A244178",
			selected: "#2A24417A",
			disabled: "#21212C4D",
			foreground: palette.foreground,
			border: transparentize(palette.subtle, 0.7),
		},
		hoverWidget: {
			...mintedBaseUi.hoverWidget,
			background: "#0E0E1AFF",
		},
		panels: {
			background: palette.background,
			foreground: palette.foreground,
			border: mix(palette.subtle, palette.background, 0.5),
			titleBackground: "#0A0A10",
			titleForeground: palette.foreground,
		},
		accent: {
			...mintedBaseUi.accent,
			primary: palette.primary,
			primaryForeground: palette.foreground,
			secondary: palette.complement,
			palette: [
				"#75E353FF",
				"#5EE578FF",
				"#69E7B8FF",
				"#74E1E8FF",
				"#7FB5EAFF",
				"#8A91ECFF",
			],
		},
		status: {
			...mintedBaseUi.status,
			error: palette.error,
			warning: palette.warning,
			info: palette.info,
			success: palette.success,
		},
		git: {
			...mintedBaseUi.git,
			added: palette.analogousGreen,
			modified: palette.splitGold,
			deleted: palette.error,
			conflict: palette.complement,
			renamed: palette.primary,
		},
		overrides: {
			...baseOverrides,
			editorGutter: {
				background:
					baseOverrides.editorGutter.background ??
					mintedBaseUi.backgrounds.surface,
				modifiedBackground:
					baseOverrides.editorGutter.modifiedBackground ??
					mintedBaseUi.git.modified,
				addedBackground:
					baseOverrides.editorGutter.addedBackground ?? mintedBaseUi.git.added,
				deletedBackground: transparentize(palette.error, 0.45),
				foldingControl:
					baseOverrides.editorGutter.foldingControl ??
					mintedBaseUi.foregrounds.muted,
			},
			diffEditor: {
				insertedTextBackground:
					baseOverrides.diffEditor.insertedTextBackground ??
					transparentize(palette.analogousGreen, 0.9),
				removedTextBackground: transparentize(palette.error, 0.9),
				insertedLineBackground:
					baseOverrides.diffEditor.insertedLineBackground ??
					transparentize(palette.analogousGreen, 0.84),
				removedLineBackground: transparentize(palette.error, 0.82),
				diagonalFill:
					baseOverrides.diffEditor.diagonalFill ??
					transparentize(palette.subtle, 0.5),
			},
			...(terminalOverrides ? { terminal: terminalOverrides } : {}),
		},
	},
};

export default mintedTheory;
