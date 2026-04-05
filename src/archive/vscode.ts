import * as fs from "node:fs";
import type { Theme, TokenStyle, VSCodeTheme } from "../types";
import { TokenType } from "../types";

export interface VSCodeThemeFile {
	name: string;
	type: "dark" | "light";
	colors: Record<string, string>;
	tokenColors: Array<{
		name?: string;
		scope: string | string[];
		settings: {
			foreground?: string;
			fontStyle?: string;
		};
	}>;
	semanticHighlighting?: boolean;
	semanticTokenColors?: Record<
		string,
		string | { foreground?: string; fontStyle?: string }
	>;
}

export interface BuildOptions {
	/** Path to existing JSON theme file to use as base (for migration) */
	basePath?: string;
	/** Name of the theme */
	name: string;
	/** Theme type */
	type: "dark" | "light";
}

/**
 * Strip JSONC syntax (comments and trailing commas) for JSON.parse
 */
function stripJsonc(content: string): string {
	// Remove block comments
	let result = content.replace(/\/\*[\s\S]*?\*\//g, "");
	// Remove line comments (but not inside strings)
	result = result.replace(/^(\s*)\/\/.*$/gm, "$1");
	// Remove trailing commas before } or ]
	result = result.replace(/,(\s*[}\]])/g, "$1");
	return result;
}

/**
 * Load an existing JSON/JSONC theme file as the base
 */
function loadBaseTheme(basePath: string): VSCodeThemeFile | null {
	try {
		const content = fs.readFileSync(basePath, "utf-8");
		const jsonContent = stripJsonc(content);
		return JSON.parse(jsonContent);
	} catch (err) {
		console.warn(`Could not load base theme from ${basePath}:`, err);
		return null;
	}
}

type SemanticTokenValue = string | { foreground?: string; fontStyle?: string };

/**
 * Generate semantic token colors from theme and mapping, including modifiers
 */
function generateSemanticTokenColors(
	theme: Theme,
	vscodeTheme: VSCodeTheme,
): Record<string, SemanticTokenValue> {
	const semanticTokenColors: Record<string, SemanticTokenValue> = {};

	// Map each semantic token type to its color via the theme's mapping
	for (const [semanticType, tokenType] of Object.entries(vscodeTheme.mapping)) {
		const color = theme[tokenType as TokenType];
		if (color) {
			semanticTokenColors[semanticType] = color;
		}
	}

	// Generate modifier entries
	if (vscodeTheme.modifiers) {
		for (const [modifier, config] of Object.entries(vscodeTheme.modifiers)) {
			if (!config) continue;

			// Global modifiers: *.modifier
			if (config.global) {
				const globalKey = `*.${modifier}`;
				semanticTokenColors[globalKey] = tokenStyleToValue(config.global);
			}

			// Per-token transforms: tokenType.modifier
			if (config.transform) {
				for (const [semanticType, tokenType] of Object.entries(
					vscodeTheme.mapping,
				)) {
					const baseColor = theme[tokenType as TokenType];
					if (baseColor) {
						const transformedColor = config.transform(baseColor);
						const modifierKey = `${semanticType}.${modifier}`;
						semanticTokenColors[modifierKey] = transformedColor;
					}
				}
			}
		}
	}

	return semanticTokenColors;
}

/**
 * Convert a TokenStyle to the VS Code semantic token value format
 */
function tokenStyleToValue(style: TokenStyle): SemanticTokenValue {
	// If only foreground, return just the string
	if (style.foreground && !style.fontStyle) {
		return style.foreground;
	}
	// Otherwise return object
	return {
		...(style.foreground && { foreground: style.foreground }),
		...(style.fontStyle !== undefined && { fontStyle: style.fontStyle }),
	};
}

/**
 * Generate basic tokenColors from theme for common scopes
 */
function generateTokenColors(theme: Theme): VSCodeThemeFile["tokenColors"] {
	const tokenColors: VSCodeThemeFile["tokenColors"] = [];

	// Map core token types to TextMate scopes
	const scopeMappings: Array<{
		tokenType: TokenType;
		name: string;
		scope: string[];
		fontStyle?: string;
	}> = [
		{
			tokenType: TokenType.Comment,
			name: "Comment",
			scope: ["comment", "punctuation.definition.comment"],
			fontStyle: "italic",
		},
		{
			tokenType: TokenType.Strings,
			name: "String",
			scope: [
				"string.quoted.single",
				"string.quoted.double",
				"string.template",
				"string.quoted.other",
			],
		},
		{
			tokenType: TokenType.Number,
			name: "Number",
			scope: [
				"constant.numeric",
				"constant.numeric.integer",
				"constant.numeric.float",
			],
		},
		{
			tokenType: TokenType.Keyword,
			name: "Keyword",
			scope: ["keyword", "keyword.control", "keyword.operator.logical"],
		},
		{
			tokenType: TokenType.Operator,
			name: "Operator",
			scope: ["keyword.operator", "punctuation.accessor"],
		},
		{
			tokenType: TokenType.Variable,
			name: "Variable",
			scope: ["variable", "variable.other"],
		},
		{
			tokenType: TokenType.Method,
			name: "Function",
			scope: [
				"entity.name.function",
				"meta.function-call.generic",
				"support.function",
			],
		},
		{
			tokenType: TokenType.Struct,
			name: "Class/Type",
			scope: [
				"entity.name.class",
				"entity.name.type",
				"support.class",
				"support.type",
			],
		},
		{
			tokenType: TokenType.Macro,
			name: "Decorator/Macro",
			scope: [
				"entity.name.function.decorator",
				"punctuation.definition.decorator",
			],
		},
		{
			tokenType: TokenType.Regexp,
			name: "Regular Expression",
			scope: ["string.regexp"],
			fontStyle: "italic",
		},
	];

	for (const mapping of scopeMappings) {
		const color = theme[mapping.tokenType];
		if (color) {
			tokenColors.push({
				name: mapping.name,
				scope: mapping.scope,
				settings: {
					foreground: color,
					...(mapping.fontStyle && { fontStyle: mapping.fontStyle }),
				},
			});
		}
	}

	return tokenColors;
}

/**
 * Generate basic editor colors from theme
 */
function generateEditorColors(theme: Theme): Record<string, string> {
	const colors: Record<string, string> = {};

	if (theme[TokenType.Background]) {
		colors["editor.background"] = theme[TokenType.Background];
	}
	if (theme[TokenType.Source]) {
		colors["editor.foreground"] = theme[TokenType.Source];
	}

	return colors;
}

/**
 * Deep merge two objects, with source values taking precedence
 */
function deepMerge<T extends Record<string, unknown>>(
	target: T,
	source: Partial<T>,
): T {
	const result = { ...target };

	for (const key of Object.keys(source) as Array<keyof T>) {
		const sourceValue = source[key];
		const targetValue = target[key];

		if (sourceValue === undefined) {
			continue;
		}

		if (
			typeof sourceValue === "object" &&
			sourceValue !== null &&
			!Array.isArray(sourceValue) &&
			typeof targetValue === "object" &&
			targetValue !== null &&
			!Array.isArray(targetValue)
		) {
			result[key] = deepMerge(
				targetValue as Record<string, unknown>,
				sourceValue as Record<string, unknown>,
			) as T[keyof T];
		} else {
			result[key] = sourceValue as T[keyof T];
		}
	}

	return result;
}

/**
 * Merge token colors arrays, with generated taking precedence for matching scopes
 */
function mergeTokenColors(
	base: VSCodeThemeFile["tokenColors"],
	generated: VSCodeThemeFile["tokenColors"],
): VSCodeThemeFile["tokenColors"] {
	// Create a map of generated scopes for quick lookup
	const generatedScopes = new Set<string>();
	for (const token of generated) {
		const scopes = Array.isArray(token.scope) ? token.scope : [token.scope];
		for (const s of scopes) {
			generatedScopes.add(s);
		}
	}

	// Keep base tokens that don't overlap with generated ones
	const filteredBase = base.filter((token) => {
		const scopes = Array.isArray(token.scope) ? token.scope : [token.scope];
		// Keep if none of the scopes are in generated
		return !scopes.some((s) => generatedScopes.has(s));
	});

	// Generated tokens first (higher priority), then base tokens
	return [...generated, ...filteredBase];
}

/**
 * Build a complete VS Code theme file from code-defined theme,
 * optionally using an existing JSON theme as the base for undefined values.
 */
export function buildVSCodeTheme(
	theme: Theme,
	vscodeTheme: VSCodeTheme,
	options: BuildOptions,
): VSCodeThemeFile {
	// Load base theme if provided
	const baseTheme = options.basePath ? loadBaseTheme(options.basePath) : null;

	// Generate from code
	const generatedColors = generateEditorColors(theme);
	const generatedTokenColors = generateTokenColors(theme);
	const generatedSemanticTokenColors = generateSemanticTokenColors(
		theme,
		vscodeTheme,
	);

	if (baseTheme) {
		// Migration mode: merge with base theme
		return {
			name: options.name,
			type: options.type,
			colors: deepMerge(baseTheme.colors || {}, generatedColors),
			tokenColors: mergeTokenColors(
				baseTheme.tokenColors || [],
				generatedTokenColors,
			),
			semanticHighlighting: true,
			semanticTokenColors: deepMerge(
				baseTheme.semanticTokenColors || {},
				generatedSemanticTokenColors,
			),
		};
	}

	// Fresh build: only use generated values
	return {
		name: options.name,
		type: options.type,
		colors: generatedColors,
		tokenColors: generatedTokenColors,
		semanticHighlighting: true,
		semanticTokenColors: generatedSemanticTokenColors,
	};
}
