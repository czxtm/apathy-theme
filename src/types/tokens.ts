export enum TokenType {
	/**
	 * Background color of the editor.
	 * Example: editor background behind all code and UI chrome.
	 */
	Background = "background",
	/**
	 * Default foreground color for plain source text.
	 * Example: identifiers, punctuation, and text not matched by a specific token.
	 */
	Source = "source",
	/**
	 * Literals such as strings, numbers, booleans, null, and undefined.
	 * Example: "hello", 42, true, null
	 */
	Literals = "literals",
	/**
	 * Punctuation characters.
	 * Example: ; , . ( ) { } [ ]
	 */
	Punctuation = "punctuation",
	/**
	 * Properties of object-like things.
	 * Example: user.name, config.path, obj.length
	 */
	Property = "property",
	/**
	 * Default string color.
	 * Example: "hello", 'world', `template ${value}`
	 */
	Strings = "strings",
	/**
	 * Language keywords and reserved words.
	 * Example: if, else, return, class, struct, fn, def
	 */
	Keyword = "keyword",
	/**
	 * Struct, class, interface, and type names.
	 * Example: struct Point, class Person, interface User, type Result
	 */
	Struct = "struct",
	/**
	 * Local or global variables.
	 * Example: let count = 0; const total = sum; x = y + 1;
	 */
	Variable = "variable",
	/**
	 * Constants, enum members, and immutable values.
	 * Example: PI, MAX_VALUE, Status.Ok, const PORT = 3000
	 */
	Constant = "constant",
	/**
	 * Function and method names.
	 * Example: array.map(), user.getName(), function computeTotal() {}
	 */
	/**
	 * Function and method names.
	 * Example: user.getName(), function computeTotal() {}
	 */
	Method = "method",

	/**
	 * Standalone function token.
	 * Example: function myFunc() { ... }
	 */
	Function = "function",

	/**
	 * Namespace or module-like name.
	 * Example: namespace Utils, module.exports
	 */
	Namespace = "namespace",

	/**
	 * Class name token.
	 * Example: class User, class Point
	 */
	Class = "class",

	/**
	 * Interface name or annotation.
	 * Example: interface IUser, type Shape = ...
	 */
	Interface = "interface",

	/**
	 * Enum type token.
	 * Example: enum Status { ... }
	 */
	Enum = "enum",

	/**
	 * Enum member or variant.
	 * Example: Status.Active, Color.Red
	 */
	EnumMember = "enumMember",

	/**
	 * Function or method parameter.
	 * Example: function greet(name), fn foo(bar: i32)
	 */
	Parameter = "parameter",

	/**
	 * Type parameter or generic argument.
	 * Example: <T> in function foo<T>(), Array<T>
	 */
	TypeParameter = "typeParameter",

	/**
	 * Decorator, annotation, or attribute.
	 * Example: @Component, deprecated, #[derive(Debug)]
	 */
	Decorator = "decorator",
	/**
	 * Macros and annotations.
	 * Example: println! in Rust, #define in C, deprecated in Java
	 */
	Macro = "macro",
	/**
	 * Operators and symbolic tokens.
	 * Example: +, -, *, /, ===, &&, ||, =>, ::
	 */
	Operator = "operator",
	/**
	 * Type names and type definitions.
	 * Example: type Point = { x: number; y: number }, type Result<T> = Ok(T) | Err(Error)
	/**
	 * Type names and type definitions.
	 * Example: type Point = { x: number; y: number }, type Result<T> = Ok(T) | Err(Error)
	 */
	Type = "type",
	/**
	 * Comments in the code.
	 * Example: // A single-line comment, /* a block comment *
	 */
	Comment = "comment",
	/**
	 * Numeric literals.
	 * Example: 42, 3.14, 0xFF, 1_000_000
	 */
	Number = "number",
	/**
	 * Regular expression literals.
	 * Example: /abc/, /[A-Z]+\d?/
	 */
	Regexp = "regexp",
	/**
	 * Labels for flow control.
	 * Example: loop: while (true) { ... }
	 */
	Label = "label",
}

import type { ColorLike } from "../core/color";

export type Theme = {
	[key in TokenType]: ColorLike;
};

export enum SemanticTokenType {
	comment = "comment",
	string = "string",
	keyword = "keyword",
	number = "number",
	regexp = "regexp",
	operator = "operator",
	namespace = "namespace",
	type = "type",
	struct = "struct",
	class = "class",
	interface = "interface",
	enum = "enum",
	typeParameter = "typeParameter",
	function = "function",
	method = "method",
	decorator = "decorator",
	macro = "macro",
	variable = "variable",
	parameter = "parameter",
	property = "property",
	label = "label",
}

export enum SemanticTokenModifier {
	declaration = "declaration",
	documentation = "documentation",
	readonly = "readonly",
	static = "static",
	abstract = "abstract",
	deprecated = "deprecated",
	modification = "modification",
	async = "async",
}

export type SemanticTokenColors = {
	[key in SemanticTokenType]: ColorLike;
};

/**
 * Style that can be applied to a semantic token
 */
export type TokenStyle = {
	foreground?: string;
	fontStyle?:
		| ""
		| "italic"
		| "bold"
		| "underline"
		| "strikethrough"
		| "italic underline"
		| "bold underline";
};

/**
 * Configuration for a semantic token modifier.
 *
 * - `global`: Generates `*.modifier` entries - same style for all token types
 * - `transform`: Generates `tokenType.modifier` entries - transforms base color per token
 *
 * You can use both together - global for fontStyle, transform for color adjustments.
 */
export type ModifierConfig = {
	/**
	 * Global style applied via `*.modifier` syntax.
	 * Use for fontStyle changes or fixed colors that apply to all tokens.
	 */
	global?: TokenStyle;

	/**
	 * Transform function applied per token type via `tokenType.modifier` syntax.
	 * Receives the base token color and returns a modified color.
	 */
	transform?: (baseColor: string) => ColorLike;
};

export type SemanticModifierHandlers = {
	[key in SemanticTokenModifier]?: ModifierConfig;
};

export type Integration = {
	colors: Theme;
	semanticTokenColors: SemanticTokenColors;
};

export type Semantic = SemanticTokenColors;

export type VSCodeTheme = {
	mapping: {
		[key in SemanticTokenType]: TokenType;
	};
	modifiers?: SemanticModifierHandlers;
};
