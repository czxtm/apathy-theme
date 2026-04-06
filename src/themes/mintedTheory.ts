/**
 * Minted Theory theme
 *
 * Built from Minted, but remapped using a color-theory palette:
 * - primary cyan
 * - complementary coral
 * - analogous blue/green
 * - split complements for contrast accents
 */

import type { MkColorOptions } from "../core/color";
import { Color, c, mkColor, mkElementColors, oklch } from "../core/color";
import { SemanticTokenModifier } from "../types";
import {
	mintedBaseComponentOverrides,
	mintedBaseExtraColors,
	mintedBaseLanguageOverrides,
	mintedBaseModifiers,
	mintedBasePalette,
	mintedBaseSyntax,
	mintedBaseUi,
} from "./mintedBase";
import type { SlimThemeDefinition, ThemeDefinition } from "./types";
import { normalizeTheme } from "./types";
import { mix, transparentize } from "./utils";

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

const syntax: SlimThemeDefinition["syntax"] = {
	source: palette.foreground,
	comments: palette.subtle,
	strings: {
		...mintedBaseSyntax.strings,
		default: palette.analogousGreen,
		regex: palette.complement,
	},
	operators: {
		...mintedBaseSyntax.operators,
		default: palette.complement,
	},
	literals: {
		...mintedBaseSyntax.literals,
		default: palette.primary,
		string: palette.analogousGreen,
		number: palette.primary,
		boolean: palette.primary,
		null: palette.splitViolet,
		undefined: palette.splitViolet,
		regex: palette.complement,
	},
	keywords: {
		...mintedBaseSyntax.keywords,
		default: palette.foreground,
		operator: palette.complement,
	},
	variables: {
		...mintedBaseSyntax.variables,
		default: palette.foreground,
		local: palette.foreground,
		parameter: palette.analogousBlue,
		property: mix(palette.foreground, palette.splitGold, 0.2),
		global: palette.analogousBlue,
		other: palette.foreground,
	},
	constants: {
		...mintedBaseSyntax.constants,
		default: palette.primary,
		numeric: palette.primary,
		language: palette.primary,
		userDefined: palette.foreground,
	},
	functions: {
		...mintedBaseSyntax.functions,
		default: palette.analogousGreen,
		declaration: palette.analogousGreen,
		call: palette.analogousGreen,
		method: palette.analogousGreen,
		builtin: palette.analogousGreen,
	},
	types: {
		...mintedBaseSyntax.types,
		default: palette.analogousBlue,
		primitive: palette.splitGold,
		class: palette.analogousBlue,
		interface: palette.analogousBlue,
		enum: palette.splitViolet,
		typeParameter: palette.analogousBlue,
		namespace: palette.analogousBlue,
	},
	punctuation: {
		...mintedBaseSyntax.punctuation,
		default: palette.muted,
		definition: palette.subtle,
		delimiter: palette.subtle,
		bracket: palette.muted,
		accessor: palette.subtle,
	},
	meta: {
		...mintedBaseSyntax.meta,
		default: palette.complement,
		decorator: palette.complement,
		macro: palette.complement,
		annotation: palette.complement,
		label: palette.splitViolet,
		tag: palette.splitGold,
	},
	storage: {
		...mintedBaseSyntax.storage,
		default: palette.analogousBlue,
		type: palette.analogousBlue,
	},
	special: {
		...mintedBaseSyntax.special,
	},
};

const baseOverrides = mintedBaseComponentOverrides as {
	editorGutter?: {
		background?: string;
		modifiedBackground?: string;
		addedBackground?: string;
		foldingControl?: string;
	};
	diffEditor?: {
		insertedTextBackground?: string;
		insertedLineBackground?: string;
		diagonalFill?: string;
	};
};

const _terminalOverrides = mintedBaseComponentOverrides.terminal
	? {
			...mintedBaseComponentOverrides.terminal,
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
const tempoverrides: Record<string, string> = {
	"#1E434ACC": "#1E434AAB",
	"#34347054": "#34347054",
	"#F3E6DFFF": "#F3E6DFFF",
	"#80123CDE": "#80123CDE",
	"#CBE5EF26": "#CBE5EF26",
	"#CB3F7566": "#CB3F7566",
	"#A1CEC51A": "#A1CEC51A",
	"#83A6D21A": "#83A6D21A",
	"#F0DADDFF": "#F0DADDFF",
	"#F0DADD40": "#F0DADD40",
	"#2323432E": "#2323432E",
	"#87A6CEE0": "#87A6CEE0",
	"#B3A097E6": "#B3A097E6",
	"#A8958DE0": "#A8958DE0",
	"#8AAAA552": "#8AAAA552",
	"#6B40B859": "#6B40B859",
	"#43326959": "#43326959",
	"#809F9BE0": "#809F9BE0",
	"#4D3B3252": "#4D3B3252",
	"#AB5726E0": "#AB5726E0",
} as const;
const mintedTheorySource = {
	name: "apathy /// theory",
	type: "dark",
	palette: {
		...mintedBasePalette,
		...palette,
	},
	background: c(palette.background),
	backgroundAlpha: 1,
	syntax,
	languageOverrides: mintedBaseLanguageOverrides,
	modifiers: {
		...mintedBaseModifiers,
		[SemanticTokenModifier.declaration]: {
			transform: (color) => new Color(color).lighter(0.05).hexa(),
		},
	},
	extraColors: {
		...mintedBaseExtraColors,
		"activityBarBadge.background": "#a3d3dc",
		"composerPane.background": "#0e0a12",
	},
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

		subtleElements: (() => {
			const bg = "#0B0B1284";
			const hover = new Color("#0B0B12").lighter(0.1).hexa();
			const active = new Color("#0B0B12").lighter(0.2).hexa();
			const selected = "#51506F2B";
			const disabled = new Color("#0B0B12")
				.desaturate(0.5)
				.transparent(0.5)
				.hexa();
			return {
				background: bg,
				selectionBackground: selected,
				hover: {
					background: hover,
					border: transparentize(palette.subtle, 0.7),
				},
				active: {
					background: active,
					border: transparentize(palette.subtle, 0.7),
				},
				selected: {
					background: selected,
					border: transparentize(palette.subtle, 0.7),
				},
				disabled: {
					background: disabled,
					border: transparentize(palette.subtle, 0.7),
				},
				foreground: palette.foreground,
				border: transparentize(palette.subtle, 0.7),
			};
		})(),
		elements: (() => {
			const bg = "#191629";
			const hover = new Color(bg).lighter(0.1).hexa();
			const active = new Color(bg).lighter(0.2).hexa();
			const selected = "#6B6AAC24";
			const disabled = new Color(bg).desaturate(0.5).transparent(0.5).hexa();
			return {
				background: bg,
				hover: {
					background: hover,
					border: transparentize(palette.subtle, 0.7),
				},
				active: {
					background: active,
					border: transparentize(palette.subtle, 0.7),
				},
				selected: {
					background: selected,
					border: transparentize(palette.subtle, 0.7),
				},
				disabled: {
					background: disabled,
					border: transparentize(palette.subtle, 0.7),
				},
				foreground: palette.foreground,
				border: transparentize(palette.subtle, 0.7),
			};
		})(),
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
			info: {
				...mkElementColors(palette.info, {
					background: palette.background,
					foreground: palette.foreground,
				}),
				background: new Color(palette.info)
					.darker(0.35)
					.desaturate(0.15)
					.alpha(0.05)
					.hexa(),
			},
			success: {
				...mkElementColors(palette.success, {
					background: palette.background,
					foreground: palette.foreground,
				}),
				foreground: oklch(0.851, 0.083, 157).alpha(0.87).hexa(),
			},
			warning: {
				...mkElementColors(palette.warning, {
					background: palette.background,
					foreground: palette.foreground,
				}),
				foreground: oklch(0.933, 0.017, 50).hexa(),
				background: new Color(palette.warning)
					.darker(0.7)
					.desaturate(0.8)
					.alpha(0.32)
					.hexa(),
				border: new Color(palette.warning)
					.darker(0.55)
					.desaturate(0.35)
					.alpha(0.88)
					.hexa(),
			},
			error: {
				...mkElementColors(
					new Color(palette.error).saturate(0.31).lighter(0.16).hex(),
					{
						background: palette.background,
						foreground: palette.foreground,
						fg: { saturationBlend: 0, alpha: 0.9 },
					},
				),
				background: new Color(palette.error)
					.darker(0.8)
					.desaturate(0.1)
					.alpha(0.76)
					.hexa(),
			},
		},
		git: {
			...mintedBaseUi.git,
			added: "#a1dfb8dF",
			modified: "#F3E6DFFF",
			deleted: tempoverrides["#80123CDE"],
			conflict: palette.complement,
			renamed: tempoverrides["#CBE5EF26"],
		},
		indentGuide: {
			background: tempoverrides["#25183B59"],
			activeBackground: tempoverrides["#6B40B859"],
		},
	},
	componentOverrides: {
		...baseOverrides,
		editorGutter: {
			background:
				baseOverrides.editorGutter?.background ??
				mintedBaseUi.backgrounds.surface,
			modifiedBackground:
				baseOverrides.editorGutter?.modifiedBackground ??
				mintedBaseUi.git.modified,
			addedBackground:
				baseOverrides.editorGutter?.addedBackground ?? mintedBaseUi.git.added,
			deletedBackground: transparentize(palette.error, 0.45),
			foldingControl:
				baseOverrides.editorGutter?.foldingControl ??
				mintedBaseUi.foregrounds.muted,
		},
		// diffEditor: {
		// 	insertedTextBackground:
		// 		baseOverrides.diffEditor?.insertedTextBackground ??
		// 		transparentize(palette.analogousGreen, 0.9),
		// 	removedTextBackground: transparentize(palette.error, 0.9),
		// 	insertedLineBackground:
		// 		baseOverrides.diffEditor?.insertedLineBackground ??
		// 		transparentize(palette.analogousGreen, 0.84),
		// 	removedLineBackground: transparentize(palette.error, 0.82),
		// 	diagonalFill:
		// 		baseOverrides.diffEditor?.diagonalFill ??
		// 		transparentize(palette.subtle, 0.5),
		// },
		"quickInputList.focusBackground": oklch(0.2466, 0.02518, 274.34, 0.4549),
		quickInputList: {
			focusBackground: oklch(0.2466, 0.02518, 274.34, 0.4549),
		},
		editor: {
			background: "#0a0a10",
			selectionBackground: oklch(0.244, 0.02083, 285, 0.513),
		},
		input: {
			background: oklch(0.17, 0.0082, 285, 0.3725),
		},
		"editor.background": "#0a0a10",
		overrides: {
			background: "#0a0a10",
		},
		// ...(terminalOverrides ? { terminal: terminalOverrides } : {}),
	},
} satisfies SlimThemeDefinition;

export const mintedTheory: ThemeDefinition = normalizeTheme(mintedTheorySource);

export default mintedTheory;
