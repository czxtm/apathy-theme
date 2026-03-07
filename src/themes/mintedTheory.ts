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
import minted from "./minted";
import { mix, transparentize } from "./utils";
import { Color, toHex } from "../core/color";
import { SemanticTokenModifier } from "../types";

type ColorPalette =
  | "#B3E6DE"
  | "#CA175D"
  | "#575B6F"
  | "#3A4159"
  | "#2B2E3E"
  | "#0C0C13"
  | "#0A0A10"
  | "#101018"
  | "#161a27"
  | "#575B6FCE"
  // Accents
  | "#ffb389"
  | "#e0a2d3"
  | "#998fe1cf"
  | "#33b3cc"
  | "#9cd6bc"
  | "#c3dc8f"
  | "#b7d194"

const baseAccent = new Color(toHex(minted.ui.accent.primary));
const baseError = new Color(toHex(minted.ui.status.error));
const baseForeground = "#575B6FCE"
const baseMuted = toHex(minted.ui.foregrounds.muted);
const baseSubtle = toHex(minted.ui.foregrounds.subtle);

const swatches = {
  baseError: baseError.hexa(),
  baseAccent: baseAccent.hexa(),
  baseForeground: baseForeground,
  baseMuted: baseMuted,
  baseSubtle: baseSubtle,
};

console.log({ baseError: baseError.hexa() , baseAccent: baseAccent.hexa() , baseForeground: baseForeground , baseMuted: baseMuted , baseSubtle: baseSubtle })
export const palette = {
  // background: "#101018",
  background: "#0C0C13",
  surface: "#101018",
  raised: "#161a27",

  foreground: "#575B6FCE",
  muted: baseMuted,
  subtle: baseSubtle,

  warning: "#fab387",
  errora: "#f38ba8",
  info: "#89b4fa",
  hint: "#d1f1ec",
  success: "#a6e3a1",
  rosewater: "#f5e0dc",


  // Color-theory anchors (derived from Minted's base accent)
  primary: baseAccent.saturate(0.08).lighter(0.1).hexa(),
  complement: baseAccent.rotate(180).desaturate(0.14).lighter(0.12).hexa(),
  analogousBlue: baseAccent.rotate(-26).saturate(0.06).lighter(0.1).hexa(),
  analogousGreen: baseAccent.rotate(26).saturate(0.06).lighter(0.08).hexa(),
  splitGold: baseAccent.rotate(210).desaturate(0.08).lighter(0.14).hexa(),
  splitViolet: baseAccent.rotate(150).desaturate(0.06).lighter(0.08).hexa(),

  error: baseError.desaturate(0.28).lighter(0.18).hexa(),
} as const;

const tokens: ThemeDefinition["tokens"] = {
  ...minted.tokens,
  source: palette.foreground,
  comments: palette.subtle,
  strings: {
    ...minted.tokens.strings,
    default: palette.analogousGreen,
    regex: palette.complement,
  },
  operators: {
    ...minted.tokens.operators,
    default: palette.complement,
  },
  literals: {
    ...minted.tokens.literals,
    default: palette.primary,
    string: palette.analogousGreen,
    number: palette.primary,
    boolean: palette.primary,
    null: palette.splitViolet,
    undefined: palette.splitViolet,
    regex: palette.complement,
  },
  keywords: {
    ...minted.tokens.keywords,
    default: palette.foreground,
    operator: palette.complement,
  },
  variables: {
    ...minted.tokens.variables,
    default: palette.foreground,
    local: palette.foreground,
    parameter: palette.analogousBlue,
    property: mix(palette.foreground, palette.splitGold, 0.2),
    global: palette.analogousBlue,
    other: palette.foreground,
  },
  constants: {
    ...minted.tokens.constants,
    default: palette.primary,
    numeric: palette.primary,
    language: palette.primary,
    userDefined: palette.foreground,
  },
  functions: {
    ...minted.tokens.functions,
    default: palette.analogousGreen,
    declaration: palette.analogousGreen,
    call: palette.analogousGreen,
    method: palette.analogousGreen,
    builtin: palette.analogousGreen,
  },
  types: {
    ...minted.tokens.types,
    default: palette.analogousBlue,
    primitive: palette.splitGold,
    class: palette.analogousBlue,
    interface: palette.analogousBlue,
    enum: palette.splitViolet,
    typeParameter: palette.analogousBlue,
    namespace: palette.analogousBlue,
  },
  punctuation: {
    ...minted.tokens.punctuation,
    default: palette.muted,
    definition: palette.subtle,
    delimiter: palette.subtle,
    bracket: palette.muted,
    accessor: palette.subtle,
  },
  meta: {
    ...minted.tokens.meta,
    default: palette.complement,
    decorator: palette.complement,
    macro: palette.complement,
    annotation: palette.complement,
    label: palette.splitViolet,
    tag: palette.splitGold,
  },
  storage: {
    ...minted.tokens.storage,
    default: palette.analogousBlue,
    type: palette.analogousBlue,
  },
};

const baseOverrides = minted.ui.overrides;
if (!baseOverrides) {
  throw new Error("Minted Theory expects Minted to define ui.overrides");
}

export const mintedTheory: ThemeDefinition = {
  ...minted,
  name: "Minted Theory",
  palette: {
    ...minted.palette,
    ...palette,
  },
  background: palette.background,
  tokens,
  semantic: {
    ...minted.semantic,
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
    ...minted.modifiers,
    [SemanticTokenModifier.declaration]: {
      transform: (color) => new Color(color).lighter(0.05).hexa(),
    },
  },
  ui: {
    ...minted.ui,
    backgrounds: {
      ...minted.ui.backgrounds,
      base: palette.background,
      darker: mix(palette.background, "#000000", 0.4),
      surface: palette.surface,
      raised: palette.raised,
      overlay: mix(palette.raised, "#000000", 0.2),
      codeBlock: mix(palette.background, "#000000", 0.5),
    },
    foregrounds: {
      ...minted.ui.foregrounds,
      default: palette.foreground,
      muted: palette.muted,
      subtle: palette.subtle,
      accent: palette.primary,
      focused: palette.complement,
    },
    borders: {
      ...minted.ui.borders,
      default: mix(palette.subtle, palette.background, 0.5),
      active: transparentize(palette.primary, 0.5),
      subtle: transparentize(palette.subtle, 0.85),
      separator: transparentize(palette.foreground, 0.9),
    },
    panels: {
      background: palette.background,
      foreground: palette.foreground,
      border: mix(palette.subtle, palette.background, 0.5),
      titleBackground: "#0A0A10",
      titleForeground: palette.foreground,
    },
    accent: {
      ...minted.ui.accent,
      primary: palette.primary,
      primaryForeground: palette.foreground,
      secondary: palette.complement,
      palette: undefined,
    },
    status: {
      ...minted.ui.status,
      error: palette.error,
      warning: palette.warning,
      info: palette.info,
      success: palette.success,
    },
    git: {
      ...minted.ui.git,
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
          minted.ui.backgrounds.surface,
        modifiedBackground:
          baseOverrides.editorGutter.modifiedBackground ??
          minted.ui.git.modified,
        addedBackground:
          baseOverrides.editorGutter.addedBackground ??
          minted.ui.git.added,
        deletedBackground: transparentize(palette.error, 0.45),
        foldingControl:
          baseOverrides.editorGutter.foldingControl ??
          minted.ui.foregrounds.muted,
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
    },
  },
};

export default mintedTheory;
