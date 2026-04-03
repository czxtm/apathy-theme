import type { Theme, VSCodeTheme } from "../types";
import { TokenType, SemanticTokenModifier, SemanticTokenType } from "../types";
import { Color } from "../core/color";

export const colors = {
  "#8e93b0c2": "#8e93b0c2",
  "#4d4e6e": "#4d4e6e",
  "#887a77d9": "#887a77d9",
  "#c3dc8f": "#c3dc8f",
  "#998fe1cf": "#998fe1cf",
  "#cdf6ff": "#cdf6ff",
  "#9aa1c7": "#9aa1c7",
  "#baf8e5": "#baf8e5",
  "#ffb389": "#ffb389",
  "#6cfaa0": "#6cfaa0",
  "#e60063": "#e60063",
  "#0e0e15": "#0e0e15",
  "#8a8276": "#8a8276",
  "#e0a2b1": "#e0a2b1",
  "#383d51": "#383d51",
  "#33b3cc": "#33b3cc",
  "#d1d3d9": "#d1d3d9",
  "#96a5b6": "#96a5b6",
  "#ffd014d4": "#ffd014d4",
  "#7ce6bc": "#7ce6bc",
};

export const theme: Theme = {
  [TokenType.Background]: colors["#0e0e15"],
  [TokenType.Source]: colors["#8e93b0c2"],
  [TokenType.Strings]: colors["#c3dc8f"],
  [TokenType.Keyword]: colors["#998fe1cf"],
  [TokenType.Struct]: colors["#cdf6ff"],
  [TokenType.Variable]: colors["#9aa1c7"],
  [TokenType.Method]: colors["#7ce6bc"],
  [TokenType.Constant]: colors["#8e93b0c2"],
  [TokenType.Property]: colors["#8a8276"],
  [TokenType.Macro]: colors["#ffb389"],
  [TokenType.Operator]: colors["#e60063"],
  [TokenType.Comment]: colors["#383d51"],
  [TokenType.Type]: colors["#ffb389"],
  [TokenType.Number]: colors["#33b3cc"],
  [TokenType.Regexp]: colors["#e60063"],
  [TokenType.Label]: colors["#e0a2b1"],
  [TokenType.Function]: colors["#7ce6bc"],
  [TokenType.Namespace]: colors["#cdf6ff"],
  [TokenType.Class]: colors["#cdf6ff"],
  [TokenType.Interface]: colors["#cdf6ff"],
  [TokenType.Enum]: colors["#9aa1c7"],
  [TokenType.EnumMember]: colors["#33b3cc"],
  [TokenType.TypeParameter]: colors["#cdf6ff"],
  [TokenType.Decorator]: colors["#ffb389"],
  [TokenType.Parameter]: colors["#9aa1c7"],
};

export const vscodeTheme: VSCodeTheme = {
  mapping: {
    [SemanticTokenType.namespace]: TokenType.Struct,
    [SemanticTokenType.class]: TokenType.Struct,
    [SemanticTokenType.enum]: TokenType.Variable,
    [SemanticTokenType.interface]: TokenType.Struct,
    [SemanticTokenType.typeParameter]: TokenType.Type,
    [SemanticTokenType.type]: TokenType.Struct,
    [SemanticTokenType.parameter]: TokenType.Variable,
    [SemanticTokenType.variable]: TokenType.Variable,
    [SemanticTokenType.comment]: TokenType.Comment,
    [SemanticTokenType.string]: TokenType.Strings,
    [SemanticTokenType.keyword]: TokenType.Keyword,
    [SemanticTokenType.number]: TokenType.Number,
    [SemanticTokenType.regexp]: TokenType.Regexp,
    [SemanticTokenType.operator]: TokenType.Operator,
    [SemanticTokenType.label]: TokenType.Label,
    [SemanticTokenType.struct]: TokenType.Struct,
    [SemanticTokenType.function]: TokenType.Method,
    [SemanticTokenType.method]: TokenType.Method,
    [SemanticTokenType.decorator]: TokenType.Macro,
    [SemanticTokenType.macro]: TokenType.Macro,
    [SemanticTokenType.property]: TokenType.Property,
  },
  modifiers: {
    // Global: no special styling for declarations
    [SemanticTokenModifier.declaration]: {},
    
    // Global: documentation uses comment color with italic
    [SemanticTokenModifier.documentation]: {
      global: { foreground: colors["#383d51"], fontStyle: "italic" },
    },
    
    // Global: readonly gets a specific color
    [SemanticTokenModifier.readonly]: {
      global: { foreground: colors["#96a5b6"] },
    },
    
    // Global: static has no fontStyle (reset any inherited italic)
    [SemanticTokenModifier.static]: {
      global: { fontStyle: "" },
    },
    
    // Global: abstract (no special styling)
    [SemanticTokenModifier.abstract]: {},
    
    // Global: deprecated gets strikethrough
    [SemanticTokenModifier.deprecated]: {
      global: { fontStyle: "strikethrough" },
    },
    
    // Global color + per-token transform: modification gets highlighted
    [SemanticTokenModifier.modification]: {
      // global: { foreground: colors["#ffd014d4"] },
      // Also lighten based on base token color
      // transform: (color: string) => Color(color).lighten(0.1).hex(),
    },
    
    // Per-token transform: async tokens get mixed with keyword color
    [SemanticTokenModifier.async]: {
      transform: (color: string) =>
        new Color(color).mix(new Color(colors["#998fe1cf"]), 0.1).hex(),
    },
  },
}