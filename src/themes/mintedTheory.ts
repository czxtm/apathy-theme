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
import type { ColorLike, SlimThemeDefinition, ThemeDefinition } from "./types";
import { normalizeTheme } from "./types";
import { mix, transparentize } from "./utils";


const baseAccent = oklch(0.887, 0.054, 184.5, 1);
const baseError = oklch(0.526, 0.164, 1.5, 1);
const baseForeground = oklch(0.475, 0.033, 276.2, 0.808);
const baseMuted = oklch(0.379, 0.042, 271.7, 1);
const baseSubtle = oklch(0.305, 0.029, 276.3, 1);

const base = {
	background: oklch(0.158, 0.015, 284.6, 1),
	surface: oklch(0.177, 0.016, 284.6, 1),
	raised: oklch(0.22, 0.026, 270.9, 1),

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
	// background: oklch(0.177, 0.016, 284.6, 1),
	background: oklch(0.158, 0.015, 284.6, 1),
	surface: oklch(0.177, 0.016, 284.6, 1),
	raised: oklch(0.22, 0.026, 270.9, 1),

	foreground: baseForeground,
	muted: baseMuted,
	subtle: baseSubtle,

	border: tc(base.subtle.hexa(), { contrast: { minContrast: 1.4, maxContrast: 5.5 } }),

	warning: oklch(0.923, 0.044, 50.4, 1),
	errora: oklch(0.772, 0.103, 346.5, 1),
	info: oklch(0.716, 0.075, 254.4, 1),
	hint: oklch(0.657, 0.116, 292.8, 1),
	success: oklch(0.817, 0.049, 181.4, 1),
	rosewater: oklch(0.923, 0.024, 30.5, 1),

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
			background: oklch(0.147, 0.011, 285, 1),
		foreground: mix(palette.foreground, palette.analogousGreen, 0.18),
			ansiBlack: oklch(0.149, 0.011, 294.2, 1),
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
const tempoverrides: Record<string, ColorLike> = {
	"oklch(0.359, 0.044, 211.5, 0.71)": oklch(0.359, 0.044, 211.5, 0.71),
	"oklch(0.359, 0.101, 280, 0.329)": oklch(0.359, 0.101, 280, 0.329),
	"oklch(0.933, 0.017, 50.4, 1)": oklch(0.933, 0.017, 50.4, 1),
	"oklch(0.396, 0.145, 5, 0.871)": oklch(0.396, 0.145, 5, 0.871),
	"oklch(0.906, 0.031, 222.9, 0.49)": oklch(0.906, 0.031, 222.9, 0.49),
	"oklch(0.583, 0.181, 0.9, 0.)": oklch(0.583, 0.181, 0.9, 0.),
	"oklch(0.817, 0.049, 181.4, 0.02)": oklch(0.817, 0.049, 181.4, 0.02),
	"oklch(0.716, 0.075, 254.4, 0.02)": oklch(0.716, 0.075, 254.4, 0.02),
	"oklch(0.907, 0.025, 8.2, 1)": oklch(0.907, 0.025, 8.2, 1),
	"oklch(0.907, 0.025, 8.2, 0.51)": oklch(0.907, 0.025, 8.2, 0.51),
	"oklch(0.274, 0.058, 281.8, 0.8)": oklch(0.274, 0.058, 281.8, 0.8),
	"oklch(0.716, 0.068, 255, 0.878)": oklch(0.716, 0.068, 255, 0.878),
	"oklch(0.72, 0.026, 47, 0.902)": oklch(0.72, 0.026, 47, 0.902),
	"oklch(0.684, 0.026, 44.2, 0.78)": oklch(0.684, 0.026, 44.2, 0.78),
	"oklch(0.713, 0.036, 184.8, 0.22)": oklch(0.713, 0.036, 184.8, 0.22),
	"oklch(0.488, 0.18, 295.4, 0.49)": oklch(0.488, 0.18, 295.4, 0.49),
	"oklch(0.364, 0.093, 295.7, 0.49)": oklch(0.364, 0.093, 295.7, 0.49),
	"oklch(0.678, 0.035, 186.7, 0.78)": oklch(0.678, 0.035, 186.7, 0.78),
	"oklch(0.369, 0.03, 47.9, 0.22)": oklch(0.369, 0.03, 47.9, 0.22),
	"oklch(0.55, 0.126, 47.9, 0.78)": oklch(0.55, 0.126, 47.9, 0.78),
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
		"activityBarBadge.background": oklch(0.836, 0.051, 210.3, 1),
		"composerPane.background": oklch(0.154, 0.018, 307.2, 1),
	},
	ui: {
		...mintedBaseUi,
		backgrounds: {
			...mintedBaseUi.backgrounds,
			base: palette.background,
			darker: mix(palette.background, oklch(0, 0, 0, 1), 0.4),
			surface: palette.surface,
			raised: oklch(0.193, 0.014, 278.6, 0.37),
			overlay: mix(palette.raised, oklch(0, 0, 0, 1), 0.2),
			codeBlock: mix(palette.background, oklch(0, 0, 0, 1), 0.5)
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
			const bg = oklch(0.153, 0.015, 284.5, 0.52);
			const hover = new Color(oklch(0.153, 0.015, 284.5, 1)).lighter(0.1).hexa();
			const active = new Color(oklch(0.153, 0.015, 284.5, 1)).lighter(0.2).hexa();
			const selected = oklch(0.445, 0.051, 285.6, 0.21);
			const disabled = new Color(oklch(0.153, 0.015, 284.5, 1))
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
			const bg = oklch(0.214, 0.037, 290.2, 1);
			const hover = new Color(bg).lighter(0.1).hexa();
			const active = new Color(bg).lighter(0.2).hexa();
			const selected = oklch(0.554, 0.101, 283.3, 0.19);
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
			titleBackground: oklch(0.148, 0.013, 284.7, 1),
			titleForeground: palette.foreground,
		},
		accent: {
			...mintedBaseUi.accent,
			primary: palette.primary,
			primaryForeground: palette.foreground,
			secondary: palette.complement,
			palette: [
				oklch(0.821, 0.208, 139.1, 1),
				oklch(0.822, 0.19, 147.4, 1),
				oklch(0.844, 0.132, 166.1, 1),
				oklch(0.848, 0.101, 201, 1),
				oklch(0.756, 0.096, 248.7, 1),
				oklch(0.689, 0.133, 278.9, 1),
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
			added: oklch(0.851, 0.083, 156.5, 0.875),
			modified: oklch(0.933, 0.017, 50.4, 1),
			deleted: oklch(0.396, 0.145, 5, 0.871),
			conflict: palette.complement,
			renamed: oklch(0.906, 0.031, 222.9, 0.149),
		},
		indentGuide: {
			background: oklch(0.245, 0.065, 298.6, 0.349),
			activeBackground: oklch(0.488, 0.18, 295.4, 0.349),
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
			background: oklch(0.148, 0.013, 284.7, 1),
			selectionBackground: oklch(0.244, 0.02083, 285, 0.513),
		},
		input: {
			background: oklch(0.17, 0.0082, 285, 0.3725),
		},
		"editor.background": oklch(0.148, 0.013, 284.7, 1),
		overrides: {
			background: oklch(0.148, 0.013, 284.7, 1),
		},
		// ...(terminalOverrides ? { terminal: terminalOverrides } : {}),
	},
} satisfies SlimThemeDefinition;

export const mintedTheory: ThemeDefinition = normalizeTheme(mintedTheorySource);

export default mintedTheory;
