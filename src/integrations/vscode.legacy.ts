/**
 * VS Code integration - maps ThemeDefinition to VS Code theme format
 *
 * This is the only place that knows about VS Code's format.
 * It reads from ThemeDefinition and produces VS Code JSON.
 */

import * as fs from "fs";
import type { ThemeDefinition, TokenAssignments } from "../themes/types";
import {
	applyFilters,
	colorFactory,
	get,
	getThemeValue,
	semantic,
	semanticFactory,
} from "../themes/types";
import { applyFiltersToTheme, type ThemeFilters } from "../filters";
import { SemanticTokenModifier, SemanticTokenType } from "../types";

// ============================================================================
// VS Code Theme Output Types
// ============================================================================

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
	semanticHighlighting: boolean;
	semanticTokenColors: Record<
		string,
		string | { foreground?: string; fontStyle?: string }
	>;
}

export interface BuildOptions {
	/** Path to existing JSON theme file to use as base (for migration) */
	basePath?: string;
	/** Override filters (will merge with/override theme.filters) */
	filters?: ThemeFilters;
}

// ============================================================================
// Base theme loading & merging utilities
// ============================================================================

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

function tokenColor(scope: string, color: string, fontStyle?: string) {
	return {
		name: scope,
		scope: [scope],
		settings: { foreground: color, fontStyle },
	};
}

/**
 * Build token colors from TokenAssignments (for future use with dynamic mapping)
 * Currently unused as we use explicit tokenColor calls for better scope control
 */
function _buildTokenColors(
	obj: TokenAssignments,
): VSCodeThemeFile["tokenColors"] {
	const tokenColors: VSCodeThemeFile["tokenColors"] = [];

	for (const [tokenType, assignment] of Object.entries(obj)) {
		const scopes = Array.isArray(assignment.scope)
			? assignment.scope
			: [assignment.scope];
		const settings: { foreground?: string; fontStyle?: string } = {};
		if (assignment.color) {
			settings.foreground = assignment.color;
		}
		if (assignment.fontStyle) {
			settings.fontStyle = assignment.fontStyle;
		}

		tokenColors.push({
			name: tokenType,
			scope: scopes,
			settings,
		});
	}

	return tokenColors;
}

// ============================================================================
// Mapping function
// ============================================================================

/**
 * Generate VS Code theme from ThemeDefinition.
 * Optionally merge with a base theme file for incremental migration.
 */
function generateVSCodeTheme(t: ThemeDefinition): VSCodeThemeFile {
	const c = colorFactory(t);
	const s = semanticFactory(t);

	// Use editor foreground from ui.overrides if available, otherwise fallback to tokens.source.
	const editorForeground =
		getThemeValue(t, "ui.overrides.editor.foreground") ??
		getThemeValue(t, "tokens.source") ??
		c("tokens.source");

	return {
		name: t.name,
		type: t.type,
		semanticHighlighting: t.semanticHighlighting !== false,

		// Editor colors - direct mapping from theme
		colors: {
			"editor.background": c("background"),
			"editor.foreground": editorForeground,
			// ... add more editor colors as needed
		},

		// TextMate scopes (for non-semantic highlighting)
		// Using broader selectors where possible - more specific ones only when color differs
		tokenColors: [
			// Source (base fallback)
			tokenColor("source", c("tokens.source")),
			tokenColor("text", c("tokens.source")),

			// Comments
			tokenColor("comment", c("tokens.comments"), "italic"),
			tokenColor("punctuation.definition.comment", c("tokens.comments"), "italic"),

			// Strings (string.quoted.* inherits from string)
			tokenColor("string", c("tokens.strings")),
			tokenColor("string.regexp", c("tokens.strings.regex"), "italic"),

			// String escape sequences
			tokenColor("constant.character.escape", c("tokens.literals.string")),
			tokenColor("constant.other.placeholder", c("tokens.literals.string")),

			// String Interpolation
			tokenColor(
				"punctuation.definition.template-expression",
				c("tokens.literals.string"),
			),
			tokenColor("meta.template.expression", c("tokens.literals.string")),

			// Constants & Literals
			tokenColor("constant", c("tokens.constants")),
			tokenColor("constant.numeric", c("tokens.literals.number")),
			tokenColor("constant.language", c("tokens.literals.boolean")),

			// Keywords
			tokenColor("keyword", c("tokens.keywords")),
			tokenColor("keyword.control", c("tokens.keywords.control")),
			tokenColor("keyword.control.conditional", c("tokens.keywords.control")),
			tokenColor("keyword.control.loop", c("tokens.keywords.control")),
			tokenColor("keyword.control.flow", c("tokens.keywords.control")),
			tokenColor("keyword.control.import", c("tokens.keywords.import")),
			tokenColor("keyword.control.export", c("tokens.keywords.import")),
			tokenColor("keyword.operator", c("tokens.operators")),
			tokenColor("keyword.operator.logical", c("tokens.operators.logical")),
			tokenColor("keyword.operator.assignment", c("tokens.operators.assignment")),
			tokenColor("keyword.operator.arithmetic", c("tokens.operators.arithmetic")),
			tokenColor("keyword.operator.comparison", c("tokens.operators.comparison")),
			tokenColor("keyword.operator.wordlike", c("tokens.operators.wordlike")),

			// Storage
			tokenColor("storage", c("tokens.storage")),
			tokenColor("storage.type", c("tokens.storage.type")),
			tokenColor("storage.type.function", c("tokens.keywords.declaration")),
			tokenColor("storage.type.class", c("tokens.keywords.declaration")),
			tokenColor("storage.modifier", c("tokens.keywords.modifier")),
			tokenColor("storage.type.primitive", c("tokens.types.primitive")),

			// Variables
			tokenColor("variable", c("tokens.variables")),
			tokenColor("variable.other", c("tokens.variables.other")),
			tokenColor(
				"variable.parameter",
				c("tokens.variables.parameter"),
				"italic",
			),
			tokenColor("variable.language", c("tokens.variables.global"), "italic"),
			tokenColor("variable.language.this", c("tokens.variables.global"), "italic"),
			tokenColor("variable.language.super", c("tokens.variables.global"), "italic"),

			// Functions
			tokenColor("entity.name.function", c("tokens.functions")),
			tokenColor("support.function", c("tokens.functions.builtin")),
			tokenColor("meta.function-call.generic", c("tokens.functions.call")),

			// Classes & Types
			tokenColor(
				"entity.name.class",
				c("tokens.types.class"),
				"bold underline",
			),
			tokenColor(
				"entity.other.inherited-class",
				c("tokens.types.class"),
				"bold underline",
			),
			tokenColor("support.class", c("tokens.types.class")),
			tokenColor("entity.name.type", c("tokens.types")),
			tokenColor("support.type", c("tokens.types")),

			// Tags & Attributes (HTML/JSX)
			tokenColor("entity.name.tag", c("tokens.punctuation")),
			tokenColor("support.class.component", c("tokens.types.class")),
			tokenColor("entity.other.attribute-name", c("tokens.variables.property")),
			tokenColor("meta.tag.attributes", c("tokens.variables.property")),

			// Properties (covers CSS, JSON keys, object properties)
			tokenColor("support.type.property-name", c("tokens.variables.property")),
			tokenColor("meta.object-literal.key", c("tokens.variables.property")),
			tokenColor("variable.other.property", c("tokens.variables.property")),

			// CSS
			tokenColor("support.type.property-name.css", c("tokens.variables.property")),
			tokenColor("meta.property-name", c("tokens.variables.property")),
			tokenColor("support.constant.property-value", c("tokens.literals")),
			tokenColor("constant.other.color", c("tokens.literals")),
			tokenColor("meta.property-value", c("tokens.literals")),
			tokenColor("meta.selector", c("tokens.types")),
			tokenColor("entity.name.tag.css", c("tokens.types")),
			tokenColor("entity.other.attribute-name.class.css", c("tokens.types")),
			tokenColor("entity.other.attribute-name.id.css", c("tokens.types")),

			// Punctuation
			tokenColor("punctuation", c("tokens.punctuation")),
			tokenColor("punctuation.definition", c("tokens.punctuation.definition")),
			tokenColor("punctuation.separator", c("tokens.punctuation.delimiter")),
			tokenColor("punctuation.terminator", c("tokens.punctuation.delimiter")),
			tokenColor("punctuation.accessor", c("tokens.punctuation.accessor")),
			tokenColor("punctuation.definition.tag", c("tokens.punctuation")),
			tokenColor("meta.brace", c("tokens.punctuation.bracket")),
			tokenColor("meta.brace.round", c("tokens.punctuation.bracket")),
			tokenColor("meta.brace.square", c("tokens.punctuation.bracket")),
			tokenColor("meta.brace.curly", c("tokens.punctuation.bracket")),

			// Decorators
			tokenColor("entity.name.function.decorator", c("tokens.meta.decorator")),
			tokenColor(
				"punctuation.definition.decorator",
				c("tokens.meta.decorator"),
			),

			// Markup (Markdown)
			tokenColor("markup.heading", c("tokens.types"), "bold"),
			tokenColor("entity.name.section.markdown", c("tokens.types"), "bold"),
			tokenColor("markup.bold", c("tokens.keywords"), "bold"),
			tokenColor("markup.italic", c("tokens.strings"), "italic"),
			tokenColor("markup.inline.raw", c("tokens.literals.string")),
			tokenColor("markup.fenced_code.block.markdown", c("tokens.literals.string")),
			tokenColor("markup.quote", c("tokens.comments"), "italic"),
			tokenColor("markup.underline.link", c("tokens.functions"), "underline"),

			// Git
			tokenColor("markup.inserted", c("ui.git.added")),
			tokenColor("markup.inserted.git_gutter", c("ui.git.added")),
			tokenColor("markup.changed", c("ui.git.modified")),
			tokenColor("markup.changed.git_gutter", c("ui.git.modified")),
			tokenColor("markup.deleted", c("ui.git.deleted")),
			tokenColor("markup.deleted.git_gutter", c("ui.git.deleted")),

			// Invalid
			tokenColor("invalid", c("ui.status.error.foreground")),
			tokenColor("invalid.illegal", c("ui.status.error.foreground")),
			tokenColor("invalid.deprecated", c("tokens.comments")),

			// Special comments (TODO/FIXME/NOTE)
			tokenColor("comment.line.todo", c("tokens.meta.annotation"), "bold"),
			tokenColor("comment.block.todo", c("tokens.meta.annotation"), "bold"),
			tokenColor("comment.line.fixme", c("ui.status.warning.foreground"), "bold"),
			tokenColor("comment.block.fixme", c("ui.status.warning.foreground"), "bold"),
			tokenColor("comment.line.note", c("ui.status.info.foreground"), "bold"),
			tokenColor("comment.block.note", c("ui.status.info.foreground"), "bold"),

			// Python docstrings
			tokenColor("string.quoted.docstring", c("tokens.comments"), "italic"),
			tokenColor("string.quoted.docstring.multi.python", c("tokens.comments"), "italic"),
			tokenColor("string.quoted.docstring.raw.multi.python", c("tokens.comments"), "italic"),

			// YAML
			tokenColor("source.yaml", c("tokens.source")),
			tokenColor("entity.name.tag.yaml", c("tokens.variables.property")),
			tokenColor("string.unquoted.plain.out.yaml", c("tokens.strings")),
			tokenColor("string.quoted.single.yaml", c("tokens.strings")),

			// JSON
			tokenColor("meta.structure.dictionary.key.json", c("tokens.variables.property")),
			tokenColor("support.type.property-name.json", c("tokens.variables.property")),
			tokenColor("meta.structure.dictionary.value.json", c("tokens.strings")),
		],

		// Semantic token colors (VSCode's semantic highlighting)
		semanticTokenColors: {
			// Base types → pull from tokens
			comment: c("tokens.comments"),
			string: c("tokens.strings"),
			number: c("tokens.literals.number"),
			regexp: c("tokens.literals.regex"),
			keyword: c("tokens.keywords.default"),
			operator: c("tokens.operators.default"),
			variable: c("tokens.variables.default"),
			parameter: c("tokens.variables.parameter"),
			property: c("tokens.variables.property"),
			function: c("tokens.functions.default"),
			method: c("tokens.functions.method"),
			class: c("tokens.types.class"),
			interface: c("tokens.types.interface"),
			enum: c("tokens.types.enum"),
			enumMember: c("tokens.constants.default"),
			type: c("tokens.types.default"),
			typeParameter: c("tokens.types.typeParameter"),
			namespace: c("tokens.types.namespace"),
			decorator: c("tokens.meta.decorator"),
			macro: c("tokens.meta.macro"),

			// Modifiers (if defined)
			...(t.modifiers?.deprecated?.global && {
				"*.deprecated": t.modifiers.deprecated.global,
			}),
			...(t.modifiers?.readonly?.global && {
				"*.readonly": t.modifiers.readonly.global,
			}),
			...(t.modifiers?.documentation?.global && {
				"*.documentation": t.modifiers.documentation.global,
			}),

			// Language-specific overrides
		},
	};
}

// ============================================================================
// Main export
// ============================================================================

/**
 * Map a ThemeDefinition to VS Code theme format.
 *
 * @param theme - The theme definition
 * @param options - Optional build options
 * @param options.basePath - Path to existing JSON/JSONC theme to use as base (for migration)
 * @param options.filters - Override/merge filters to apply after generation
 *
 * @example
 * // Fresh build
 * const vscodeTheme = mapVSCode(myTheme);
 *
 * @example
 * // Migration mode - merge with existing theme
 * const vscodeTheme = mapVSCode(myTheme, { basePath: "./themes/existing.json" });
 *
 * @example
 * // With contrast filter
 * const vscodeTheme = mapVSCode(myTheme, { filters: { contrast: 0.2 } });
 */
export function mapVSCode(
	theme: ThemeDefinition,
	options?: BuildOptions,
): VSCodeThemeFile {
	const generated = generateVSCodeTheme(theme);

	let result: VSCodeThemeFile;

	// If no base path, use generated theme directly
	if (!options?.basePath) {
		result = generated;
	} else {
		// Migration mode: merge with base theme
		const baseTheme = loadBaseTheme(options.basePath);
		if (!baseTheme) {
			result = generated;
		} else {
			result = {
				name: theme.name,
				type: theme.type,
				colors: deepMerge(baseTheme.colors || {}, generated.colors),
				tokenColors: mergeTokenColors(
					baseTheme.tokenColors || [],
					generated.tokenColors,
				),
				semanticHighlighting: true,
				semanticTokenColors: deepMerge(
					baseTheme.semanticTokenColors || {},
					generated.semanticTokenColors,
				),
			};
		}
	}

	// Apply filters (merge theme.filters with options.filters, options takes precedence)
	const filters: ThemeFilters = {
		...theme.filters,
		...options?.filters,
	};

	if (Object.keys(filters).length > 0) {
		result = applyFiltersToTheme(result, filters);
	}

	return result;
}
