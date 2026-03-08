/**
 * Slate theme - using hierarchical slate-style format
 *
 * This theme demonstrates the power of the cascade -
 * setting defaults and then overriding specific values.
 */

import { make, type ThemeDefinition, ColorPalette, UserInterface, UIComponents, type ColorLike } from "./types";
import { SemanticTokenModifier } from "../types";
import { alpha20, darken, l10, lighten, mix, transparentize } from './utils';
import { Color, makeColors } from '@/core/color';

// ============================================================================
// 1. Color Palette
// ============================================================================

const rawColors = {
  // Backgrounds
  "#0e0e15": "#0e0e15",

  // Grays & Neutrals
  "#d1d3d9": "#d1d3d9",   // bright white
  "#a7a4af": "#a7a4af",   // muted white
  "#f5e0dc": "#f5e0dc",   // vanilla cream
  "#91aac0": "#91aac0",   // dusty blue
  "#829297": "#829297",   // sage gray
  "#767a92": "#767a92",   // storm gray
  "#527bb254": "#527bb254", // semi-transparent blue

  // Greens
  "#b1d36d": "#b1d36d",   // celery
  "#73bf9c": "#73bf9c",   // mint

  // Purples
  "#8564d8": "#8564d8",   // grape
  "#cba6f7": "#cba6f7",   // lavender

  // Accents
  "#33b3cc": "#33b3cc",   // cyan
  "#ffcb6b": "#ffcb6b",   // gold
  "#e0a2d3": "#e0a2d3",   // orchid
  "#FF6188": "#FF6188",   // watermelon
  "#E60063": "#E60063",   // crimson



  // Ordered by lightness (darkest to lightest)
  black: "#09090f",
  midnight: "#0e0e15",
  midnightLight: "#1a1a24",
  dark1: "#252531",
  charcoal: "#2c2c3c",
  semiblack: "#333344",
  alphaWhite: "rgba(209, 211, 217, 0.1)",
  alphaBlue: "#527bb254",

  crimson: "#E60063",
  grape: "#8564d8",
  cyan: "#33b3cc",
  mint: "#73bf9c",
  watermelon: "#FF6188",
  stormGray: "#767a92",
  sageGray: "#829297",
  dustyBlue: "#91aac0",
  mutedwhite: "#a7a4af",
  celery: "#b1d36d",
  lavender: "#cba6f7",
  orchid: "#e0a2d3",
  brightWhite: "#d1d3d9",
  gold: "#ffcb6b",
  vanillaCream: "#f5e0dc",

  // Additional colors
  peach: "#ffb86c",
  seafoam: "#73bf9c",
  steel: "#5c6370",
  mist: "#a7a4af",
  ice: "#89ddff",
  white: "#d1d3d9",
  flatwhite: "#ffffff",
} ;

const whites = {
  "100": rawColors["#d1d3d9"],
  "200": rawColors["#a7a4af"],
  "300": rawColors["#f5e0dc"],
  "400": rawColors["#91aac0"],
  "500": rawColors["#829297"],
  "600": rawColors["#767a92"],
  "700": rawColors["#527bb254"],
}

type CV = ColorLike;
export const WHITE: CV = "#d1d3d9";
export const MIDNIGHT: CV = "#0e0e15";
export const MUTEDWHITE: CV = "#a7a4af";
export const VANILLACREAM: CV = "#f5e0dc";
export const DUSTYBLUE: CV = "#91aac0";
export const SAGEGRAY: CV = "#829297";
export const STORMGRAY: CV = "#767a92";
export const CELERY: CV = "#b1d36d";
export const MINT: CV = "#73bf9c";
export const GRAPE: CV = "#8564d8";
export const LAVENDER: CV = "#cba6f7";
export const CYAN: CV = "#33b3cc";
export const GOLD: CV = "#ffcb6b";
export const ORCHID: CV = "#e0a2d3";
export const WATERMELON: CV = "#FF6188";
export const CRIMSON: CV = "#E60063";


// ============================================================================
// 2. Theme Definition
// ============================================================================
// const tokens: ThemeDefinition["tokens"] = {
//     source: palette["#a7a4af"],
//     comments: palette["#829297"],

//     // Operators - all use crimson, but we COULD differentiate
//     operators: {
//       default: palette["#E60063"],
//       arithmetic: palette["#E60063"],  // +, -, *, /
//       assignment: palette["#E60063"],  // =, +=, -=
//       logical: palette["#E60063"],     // &&, ||, !
//       wordlike: palette["#E60063"],    // and, or, not
//     },

//     // Literals - different colors for different types
//     literals: {
//       default: palette["#33b3cc"],
//       string: palette["#b1d36d"],
//       number: palette["#ffcb6b"],
//       boolean: palette["#33b3cc"],
//       null: palette["#8564d8"],
//       undefined: palette["#8564d8"],
//       regex: palette["#FF6188"],
//     },

//     // Keywords - different shades for different purposes
//     keywords: {
//       default: palette["#767a92"],
//       import: palette["#e0a2d3"],
//       // control, declaration inherit from default
//     },

//     variables: {
//       default: palette["#a7a4af"],
//       parameter: palette["#a7a4af"],
//       property: palette["#e0a2d3"],
//     },

//     constants: {
//       default: palette["#91aac0"],
//       numeric: palette["#33b3cc"],
//     },

//     functions: {
//       default: palette["#73bf9c"],
//       method: palette["#73bf9c"],
//     },

//     types: {
//       default: palette["#cba6f7"],
//       class: palette["#e0a2d3"],
//       interface: palette["#cba6f7"],
//       enum: palette["#cba6f7"],
//       typeParameter: palette["#cba6f7"],
//       namespace: palette["#a7a4af"],
//     },

//     punctuation: {
//       default: palette["#767a92"],
//     },

//     meta: {
//       default: palette["#767a92"],
//       decorator: palette["#ffcb6b"],
//       macro: palette["#ffcb6b"],
//       label: palette["#e0a2d3"],
//     },
//     storage: {
//       default: palette["#767a92"],
//     },
//     strings: {
//       default: palette["#b1d36d"],
//     },
//   };

// const ui: ThemeDefinition["ui"] = {
//   foregrounds: {
//     default: palette["#a7a4af"],
//     muted: palette["#829297"],
//     subtle: palette["#767a92"],
//     accent: palette["#33b3cc"],
//     focused: palette["#f5e0dc"],
//   },
//   backgrounds: {
//     base: palette["#0e0e15"],
//     surface: "#1a1a24",
//     overlay: "#252531",
//     raised: "#2c2c3c",
//     darker: "#09090f",
//     codeBlock: "#1a1a24",
//   },
//   borders: {
//     default: "#333344",
//     active: "#45455a",
//     subtle: "#21212e",
//     separator: "#333344",
//   },
//   accent: {
//     primary: palette["#e0a2d3"],
//     secondary: palette["#8564d8"],
//     primaryForeground: palette["#f5e0dc"],
//   },
//   status: {
//     error: "#FF6188",
//     warning: "#ffcb6b",
//     success: "#73bf9c",
//     info: "#33b3cc",
//   },
//   selection: {
//     background: "#333344",
//     backgroundInactive: "#252531",
//     text: palette["#f5e0dc"],
//   },
//   git: {
//     added: "#73bf9c",
//     modified: "#33b3cc",
//     deleted: "#FF6188",
//     untracked: "#45465a",
//     ignored: "#21212e",
//     conflict: "#E60063",
//   }
// };

export const v = (k: string): k is keyof typeof rawColors => k in rawColors;

const colors = makeColors(rawColors);
const bgbase = colors.midnight;
const bgsurface = colors.midnight.lighter(0.2);

const BACKGROUND = colors["#0e0e15"];
const BACKGROUND_DARKER = colors.black;
const FOREGROUND = colors["#a7a4af"];
const SELECTION_BACKGROUND = mix(FOREGROUND, BACKGROUND, 0.5);
const SURFACE = colors.midnight.lighter(0.6);
const OVERLAY = mix(lighten(rawColors.midnight, 0.6), rawColors.peach, 0.05);
const BORDER = colors.sageGray.mix(colors.midnight, 0.5);
const ACCENT = colors.peach;
const CARD = colors.midnight.lighter(0.15);
const CARD_FOREGROUND = colors.mist.mix(colors.midnight, 0.2);
const SURFACE_FOREGROUND = colors.mist.mix(colors.midnight, 0.2);
const SURFACE_BORDER = colors.charcoal.mix(colors.midnight, 0.8);
const SURFACE_BORDER_ACTIVE = colors.peach.desaturate(0.1).darker(0.4).transparent(0.4);
const SURFACE_BORDER_SUBTLE = colors.charcoal.mix(colors.midnight, 0.3);
const SURFACE_BORDER_SEPARATOR = colors.mist.alpha(0.05).hexa();


// ============================================================================
// 2. Theme Definition
// ============================================================================
const backgrounds: UserInterface<ColorLike>["backgrounds"] = {
  base: BACKGROUND,
  surface: bgsurface,
  raised: SURFACE,
  overlay: OVERLAY,
  darker: BACKGROUND_DARKER,
  codeBlock: BACKGROUND_DARKER,
};

const foregrounds: UserInterface<ColorLike>["foregrounds"] = {
  default: FOREGROUND,
  muted: rawColors.stormGray,
  subtle: rawColors.charcoal,
  accent: rawColors.peach,
  focused: rawColors.vanillaCream,
};

const borders: UserInterface<ColorLike>["borders"] = {
  default: colors.sageGray.mix(colors.midnight, 0.5),
  active: rawColors.dustyBlue,
  subtle: rawColors.black,
  separator: rawColors.dark1,
};

const accent: UserInterface<ColorLike>["accent"] = {
  primary: rawColors.dustyBlue,
  primaryForeground: rawColors.cyan,
  secondary: rawColors.lavender,
};

const status: UserInterface<ColorLike>["status"] = {
  error: rawColors.crimson,
  warning: rawColors.gold,
  info: rawColors.cyan,
  success: rawColors.celery,
};

const selection: UserInterface<ColorLike>["selection"] = {
  background: mix(foregrounds.default, rawColors.midnight, 0.5),
  backgroundInactive: transparentize(rawColors.mutedwhite, 0.1),
  text: rawColors.charcoal,
  backgroundActive: lighten(rawColors.cyan, 0.4),
};

const highlights: UserInterface<ColorLike>["highlights"] = {
  activeLine: {
    background: lighten(backgrounds.base, 0.5),
  },
  word: {
    background: lighten(mix(backgrounds.base, rawColors.cyan, 0.9), 0.7),
  },
  selection: {
    backgroundInactive: transparentize(lighten(backgrounds.base, 0.5), 0.5),
    backgroundActive: mix(foregrounds.default, rawColors.midnight, 0.5),
    foreground: lighten(foregrounds.default, 0.2),
  }
};
const tokens: ThemeDefinition["tokens"] = {
    source: foregrounds.default,
    comments: mix(rawColors['#829297'], rawColors.midnight, 0.5),
    strings: make({
      default: rawColors.celery,
      regex: rawColors.crimson,
    }),
    operators: {
      default: CRIMSON,
    },

    literals: {
      default: rawColors.cyan,
      string: rawColors.celery,
      number: rawColors.cyan,
      boolean: rawColors.cyan,
      null: rawColors.lavender,
      undefined: rawColors.lavender,
      regex: rawColors.crimson,
    },

    keywords: {
      default: mix(rawColors.mutedwhite, rawColors.cyan, 0.3),
      operator: CRIMSON,
    },

    variables: {
      default: rawColors["#a7a4af"],
      parameter: rawColors["#a7a4af"],
      property: rawColors["#e0a2d3"],
    },

    constants: {
      default: rawColors["#91aac0"],
      numeric: rawColors["#33b3cc"],
    },

    functions: {
      default: rawColors["#73bf9c"],
      method: rawColors["#73bf9c"],
    },

    types: {
      default: rawColors["#cba6f7"],
      class: rawColors["#e0a2d3"],
      interface: rawColors["#cba6f7"],
      enum: rawColors["#cba6f7"],
      typeParameter: rawColors["#cba6f7"],
      namespace: rawColors["#a7a4af"],
    },

    punctuation: {
      default: rawColors["#767a92"],
    },

    meta: {
      default: rawColors["#767a92"],
      decorator: rawColors["#ffcb6b"],
      macro: rawColors["#ffcb6b"],
      label: rawColors["#e0a2d3"],
    },
    storage: {
      default: rawColors["#8564d8"],
      type: rawColors["#8564d8"],
    },
    special: {
      jsxClass: rawColors.dustyBlue,
    }
  };



const ui: UserInterface<ColorLike> = {
  backgrounds,
  foregrounds,
  borders,
  accent,
  status,
  selection,
  highlights,
  hoverWidget: {
    background: colors.midnight.lighter(0.1),
    foreground: colors.mist,
    border: colors.sageGray.mix(colors.midnight, 0.5),
  },
  cursor: {
    foreground: colors.mist,
  },
  panels: {
    background: backgrounds.surface,
    border: borders.default,
    titleBackground: backgrounds.surface,
    titleForeground: foregrounds.default,
    foreground: foregrounds.default,
  },
  indentGuide: {
    background: rawColors.dark1,
    activeBackground: rawColors.dark1,

  },
  window: {},
  whitespace: {
    foreground: rawColors.dark1,
  },
  ruler: {
    foreground: rawColors.dark1,
  },
  lineNumbers: {
    foreground: rawColors.dark1,
    activeForeground: rawColors.mist,
  },
  inlineHints: {
    background: transparentize(rawColors.steel, 0.5),
    foreground: rawColors.mist,
    border: transparentize(rawColors.steel, 0.5),
  },
  git: {
    // added: mix(palette.seafoam, palette.midnight, 0.5),
    added: mix(foregrounds.muted, rawColors.celery, 0.2),
    // modified: mix(palette.peach, foregrounds.muted, 0.2),
    modified: mix(foregrounds.muted, rawColors.cyan, 0.2),
    deleted: mix(foregrounds.muted, rawColors.crimson, 0.2),
    untracked: mix(foregrounds.muted, rawColors.dark1, 0.5),
    ignored: mix(foregrounds.subtle, rawColors.dark1, 0.5),
    conflict: mix(foregrounds.muted, rawColors.crimson, 0.5),
  }
};

const components: UIComponents = {
  editor: {
    background: ui.backgrounds.base,
    foreground: ui.foregrounds.default,
    lineHighlight: ui.highlights?.activeLine?.background || ui.backgrounds.overlay,
    lineHighlightBorder: rawColors.midnight,
    inactiveSelectionBackground: transparentize(mix(foregrounds.accent, rawColors.midnight, 0.9), 0.7),
    selectionBackground: l10(rawColors.midnight),
    selectionHighlightBackground: transparentize(mix(foregrounds.accent, rawColors.midnight, 0.95), 0.5),
    findRangeHighlightBackground: transparentize(mix(rawColors.grape, rawColors.midnight, 0.2), 0.5),
    findMatchHighlightBackground: transparentize(mix(rawColors.grape, rawColors.midnight, 0.8), 0.5),
    lineNumberActiveForeground: rawColors.mist,
    lineNumberForeground: rawColors.dark1,
    findMatchBackground: transparentize(mix(rawColors.grape, rawColors.midnight, 0.9), 0.7),
    // errorHighlight: palette.crimson,
    // warningHighlight: palette.peach,
    // selectionHighlight: l10(palette.midnight),
    // wordHighlight: palette.charcoal,
    // wordHighlightStrong: DUSTYBLUE,
    // findMatchHighlight: mix(palette.lavender, palette.midnight, 0.5),
    // findMatch: palette.lavender,
    // rangeHighlight: l10(palette.midnight),
  },
  editorGutter: {
    background: ui.backgrounds.base,
    modifiedBackground: rawColors.peach,
    addedBackground: rawColors.seafoam,
    deletedBackground: rawColors.crimson,
    foldingControl: rawColors.steel,
  },
  editorLineNumber: {
    foreground: rawColors.charcoal,
    activeForeground: rawColors.mist,
  },
  window: {
    borders: rawColors.semiblack,
  },
  activityBar: {
    background: rawColors.black,
    foreground: darken(rawColors.mist, 0.5),
    inactiveForeground: rawColors.mist,
    border: rawColors.semiblack,
    badgeBackground: rawColors.peach,
    badgeForeground: rawColors.black,
  },
  editorWidget: {
    background: ui.backgrounds.overlay,
    foreground: ui.foregrounds.default,
    border: ui.borders.subtle,
  },
  sideBar: {
    background: ui.backgrounds.surface,
    foreground: rawColors.mist,
    border: rawColors.semiblack,
    sectionHeaderBackground: rawColors.midnight,
    sectionHeaderForeground: rawColors.mist,
  },
  titleBar: {
    activeBackground: ui.backgrounds.base,
    activeForeground: rawColors.mist,
    inactiveBackground: ui.backgrounds.base,
    inactiveForeground: rawColors.charcoal,
  },
  panel: {
    background: ui.backgrounds.surface,
    foreground: rawColors.mist,
    border: rawColors.semiblack,
    titleActiveForeground: rawColors.mist,
    titleInactiveForeground: rawColors.charcoal,
    titleActiveBorder: rawColors.steel,
  },
  statusBar: {
    background: ui.backgrounds.surface,
    foreground: rawColors.mist,
    border: rawColors.semiblack,
    debuggingBackground: rawColors.seafoam,
    debuggingForeground: rawColors.crimson,
    noFolderBackground: rawColors.midnight,
    noFolderForeground: rawColors.mist,
  },
  tabs: {
    activeBackground: ui.backgrounds.surface,
    activeForeground: rawColors.mist,
    activeBorder: rawColors["#527bb254"],
    activeBorderTop: rawColors.steel,
    inactiveBackground: ui.backgrounds.base,
    inactiveForeground: rawColors.mist,
    hoverBackground: rawColors.midnight,
    hoverForeground: rawColors.mist,
    unfocusedActiveBackground: rawColors.midnight,
    unfocusedActiveForeground: rawColors.mist,
    modifiedBorder: rawColors.peach,
  },
  list: {
    activeSelectionBackground: ui.backgrounds.surface,
    activeSelectionForeground: rawColors.mist,
    inactiveSelectionBackground: ui.backgrounds.surface,
    inactiveSelectionForeground: rawColors.mist,
    hoverBackground: ui.backgrounds.overlay,
    hoverForeground: rawColors.mist,
    focusBackground: ui.backgrounds.surface,
    focusForeground: rawColors.mist,
    highlightForeground: rawColors.steel,
  },
  input: {
    background: rawColors.midnightLight,
    foreground: lighten(rawColors.mist, 0.1),        border: rawColors.steel,
    placeholderForeground: darken(rawColors.mist, 0.2),
  },
  button: {
    background: rawColors.alphaBlue,
    foreground: rawColors.mist,
    hoverBackground: rawColors.midnight,
    secondaryBackground: rawColors.midnight,
    secondaryForeground: rawColors.mist,
    secondaryHoverBackground: rawColors.midnight,
    border: rawColors.steel,
    secondaryBorder: rawColors.steel,
  },
  hoverWidget: {
    background: rawColors.midnight,
    foreground: rawColors.mist,
    border: darken(rawColors.steel, 0.2),
  },
  cursor: {
    foreground: rawColors.mist,
  },
  dropdown: {
    background: rawColors.alphaBlue,
    foreground: rawColors.mist,
    border: darken(rawColors.steel, 0.2),
    listBackground: rawColors.midnight,
  },
  badge: {
    background: rawColors.midnight,
    foreground: rawColors.mist,
    border: lighten(rawColors.midnight, 0.2),
  },
  scrollbar: {
    shadow: rawColors.midnight,
    sliderBackground: rawColors.midnight,
    sliderHoverBackground: rawColors.midnight,
    sliderActiveBackground: rawColors.midnight,
  },
  minimap: {
    background: rawColors.midnight,
    selectionHighlight: rawColors.mist,
    errorHighlight: rawColors.crimson,
    warningHighlight: rawColors.peach,
    findMatchHighlight: mix(ui.backgrounds.surface, rawColors.lavender, 0.5),
  },
  breadcrumb: {
    background: rawColors.midnight,
    foreground: rawColors.mist,
    focusForeground: rawColors.mist,
    activeSelectionForeground: rawColors.mist,
  },
  terminal: {
    background: rawColors.midnight,
    foreground: rawColors.mist,
    cursorForeground: rawColors.mist,
    selectionBackground: l10(rawColors.midnight),
    cursor: rawColors.mist,
    ansiBlack: rawColors.charcoal,
    ansiRed: rawColors.crimson,
    ansiGreen: rawColors.seafoam,
    ansiYellow: rawColors.peach,
    ansiBlue: rawColors.cyan,
    ansiMagenta: rawColors.lavender,
    ansiCyan: rawColors.ice,
    ansiWhite: rawColors.white,
    ansiBrightBlack: rawColors.steel,
    ansiBrightRed: rawColors.crimson,
    ansiBrightGreen: rawColors.seafoam,
    ansiBrightYellow: rawColors.peach,
    ansiBrightBlue: rawColors.cyan,
    ansiBrightMagenta: rawColors.lavender,
    ansiBrightCyan: rawColors.ice,
    ansiBrightWhite: rawColors.flatwhite,
    border: rawColors.semiblack,
  },
  notification: {
    background: rawColors.midnight,
    foreground: rawColors.mist,
    border: rawColors.midnightLight,
  },
  peekView: {
    editorBackground: rawColors.midnight,
    editorBorder: rawColors.steel,
    resultBackground: rawColors.midnight,
    resultSelectionBackground: rawColors.midnight,
    titleBackground: ui.backgrounds.surface,
    titleForeground: rawColors.mist,
  },
  diffEditor: {
    insertedTextBackground: "#09131588",
    removedTextBackground: "#2e060982",
    insertedLineBackground: "#09131588",
    removedLineBackground: "#1202049e",
    diagonalFill: rawColors.steel,
  },
  merge: {
    currentHeaderBackground: rawColors.midnight,
    incomingHeaderBackground: rawColors.midnight,
    commonHeaderBackground: rawColors.midnight,
    currentContentBackground: mix(rawColors.seafoam, rawColors.midnight, 0.3),
    incomingContentBackground: rawColors.peach,
    commonContentBackground: mix(rawColors.steel, rawColors.midnight, 0.3),
  },
}

export const slate: ThemeDefinition = {
  name: "Slate",
  type: "dark",
  palette: rawColors,
  background: ui.backgrounds.base,

  tokens,

  languageOverrides: {
    go: {
      functions: {
        default: rawColors.ice
      }
    },
    css: {
      variables: {
        default: rawColors.dustyBlue,
        property: rawColors.stormGray
      }
    }
  },

  // Semantic overrides for fine-tuning
  semantic: {
    comment: rawColors.charcoal,
    string: rawColors.celery,
    keyword: rawColors.lavender,
    number: rawColors.cyan,
    regexp: rawColors.peach,
    operator: rawColors.crimson,
    namespace: rawColors.ice,
    type: rawColors.ice,
    struct: rawColors.ice,
    class: rawColors.ice,
    interface: rawColors.ice,
    enum: rawColors.dustyBlue,
    typeParameter: rawColors.ice,
    function: rawColors.seafoam,
    method: rawColors.seafoam,
    decorator: rawColors.peach,
    macro: rawColors.peach,
    variable: rawColors.vanillaCream,
    parameter: rawColors.dustyBlue,
    property: rawColors.stormGray,
    label: rawColors.grape,
  },

  // Modifier handlers
  modifiers: {
    [SemanticTokenModifier.documentation]: {
      global: { foreground: rawColors.charcoal, fontStyle: "italic" },
    },
    [SemanticTokenModifier.static]: {
      global: { fontStyle: "" },
    },
    [SemanticTokenModifier.deprecated]: {
      global: { fontStyle: "strikethrough" },
    },

    [SemanticTokenModifier.async]: {
      transform: (color: string) => new Color(color).mix(rawColors.lavender, 0.1),
    },
  },
  ui: {
    ...ui,
    overrides: components
  }
};

export default slate;

// rgb(144 230 201 / 95%)
