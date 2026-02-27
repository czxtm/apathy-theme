/**
 * Apathetic Ocean theme - converted to hierarchical slate-style format
 *
 * A cooler, ocean-inspired variant with muted blues and greens.
 */

import { make, type ThemeDefinition } from "./types";
import { SemanticTokenModifier } from "../types";
import Color from "color";
import { darken, lighten, mix, transparentize } from "./utils";
import { makeColors } from '@/core/color';

// ============================================================================
// 1. Color Palette
// ============================================================================

export enum palette {
  // Backgrounds
  background = "#0e0e15",
  gutterBg = "#0f0f12",
  panelBg = "#0f0f12",
  tabBg = "#0f0e10",
  tabHeaderBg = "#0f0f12",

  // Grays & Neutrals
  white = "#e1e2e5",
  softWhite = "#a7a4af",
  steel = "#96a5b6",
  mist = "#8e93b0c2",
  charcoal = "#383d51",
  muted = "#4D4A56",
  gray = "#7d7a8b",
  lightGray = "#B5B5B5",
  faintGray = "#394060",
  iconMuted = "#5f6384b8",
  scrollbarBorder = "#45414C",

  // Blues & Cyans
  cyan = "#33b3cc",
  ice = "#93e3db",
  seafoam = "#95d4ca",
  softBlue = "#afd1e9cf",
  paleBlue = "#78DCE8",
  lightBlue = "#82AAFF",
  exportBlue = "#91aac0",
  importPurple = "#d09bd2",

  // Greens
  wasabi = "#95c17b",
  mint = "#A1EFE4",
  lime = "#A6E22E",
  lightGreen = "#79e3bd",
  linkGreen = "#7ce6ab",
  markdownHeading = "#79e3bd",
  brightGreen = "#C3E88D",
  addedGreen = "#449dab",
  gitInserted = "#A7DA1E",

  // Warm accents
  gold = "#ffcb6b",
  amber = "#ffa114",
  yellow = "#FFCB6B",
  peach = "#FFD866",
  orange = "#FF7A00",
  gitModified = "#6183bb",

  // Reds & Pinks
  crimson = "#af0a52",
  razzmatazz = "#E60063",
  rose = "#FF6188",
  blush = "#e0a2b1",
  pink = "#f184bce6",
  coral = "#FF7859",
  errorRed = "#b70b24",
  errorRedForeground = "#943c4c",
  gitDeleted = "#914c54",
  deletedRed = "#e46876",

  // Purples
  lavender = "#998fe1cf",
  purple = "#C792EA",
  lilac = "#C574DD",
  lightOrchid = "#e0a2d3",
  paramPurple = "#8e8db3",
  accessor = "#7a73cc",
  namespace = "#f0c9dd",
  classColor = "#bb7494",
  tagName = "#5c5675",

  // Browns
  taupe = "#8a7b5c",
  olive = "#67514c",
  darkOlive = "#5c4c42",
  propertyDef = "#74728f",
  propertyDecl = "#675f5a",

  // Status
  warning = "#E6986B",
  info = "#78DCE8",

  // UI Elements
  selection = "#2d22476b",
  selectionHighlight = "#39324952",
  inactiveSelection = "#2d22473d",
  wordHighlight = "#383248a5",
  wordHighlightStrong = "#52486cab",
  findMatch = "#2a2540dc",
  findMatchHighlight = "#18142ddc",
  lineHighlight = "#1b162994",
  indentGuide = "#29192969",
  indentGuideActive = "#6b406b69",
  whitespace = "#272636",
  ruler = "#29192969",
  widgetBg = "#1c1e29cc",
  widgetBorder = "#527bb254",
  widgetFg = "#d4edff99",
  suggestBg = "#1B1629",
  listActive = "#2A2441",
  focusBorder = "#a099ae14",
  tabBorder = "#212131",
  tabActiveBorder = "#d0cfd3",
  buttonBg = "#7a5acd2e",
  buttonFg = "#80ffecba",
  buttonBorder = "#3d374978",
  elementBg = "#7a5acd2e",
  elementHover = "#8d61ff2e",
  inputBg = "#14141b",
  inputBorder = "#26242a99",

  // Terminal ANSI
  ansiBlack = "#2A273F",
  ansiBrightBlack = "#3F3B5A",
  ansiRed = "#F07178",
  ansiBrightRed = "#FF6B82",
  ansiWhite = "#D1D3D9",
}

const colors = makeColors(palette);

export type PaletteValue = `${palette}`;

export const v = (k: PaletteValue): PaletteValue => k;

// ============================================================================
// 2. Theme Definition
// ============================================================================
const backgrounds: ThemeDefinition["ui"]["backgrounds"] = {
  base: palette.background,
  surface: palette.panelBg,
  raised: lighten(palette.background, 0.5),
  overlay: palette.widgetBg,
  darker: darken(palette.background, 0.1),
  codeBlock: darken(palette.background, 0.5),
};
const foregrounds: ThemeDefinition["ui"]["foregrounds"] = {
  default: palette.softWhite,
  muted: "#827b90cf",
  subtle: palette.inputBorder,
  accent: palette.cyan,
  focused: palette.white,
};
const borders: ThemeDefinition["ui"]["borders"] = {
  default: palette.focusBorder,
  active: "#182356",
  subtle: palette.tabBorder,
  separator: lighten(palette.background, 0.56)
};
const accent: ThemeDefinition["ui"]["accent"] = {
  primary: palette.cyan,
  primaryForeground: palette.brightGreen,
  secondary: palette.gold,
};
const status: ThemeDefinition["ui"]["status"] = {
  error: palette.rose,
  warning: palette.gold,
  info: palette.info,
  success: palette.addedGreen,
};
const selection: ThemeDefinition["ui"]["selection"] = {
  background: palette.selection,
  backgroundInactive: palette.inactiveSelection,
  text: palette.white,
};
const git: ThemeDefinition["ui"]["git"] = {
  added: palette.addedGreen,
  modified: palette.gitModified,
  deleted: palette.gitDeleted,
  untracked: palette.addedGreen,
  ignored: "#515670",
  conflict: palette.deletedRed,
};
const ui: ThemeDefinition["ui"] = {
  backgrounds,
  foregrounds,
  borders,
  accent,
  status,
  selection,
  git,
  hoverWidget: {
    background: palette.widgetBg,
    border: palette.widgetBorder,
    foreground: palette.widgetFg,
  },
  cursor: {
    foreground: palette.white,
  },
  window: {
    activeBorder: palette.focusBorder,
  },
  suggestWidget: {
    background: palette.suggestBg,
    border: palette.widgetBorder,
    foreground: palette.widgetFg,
  },
  lineNumbers: {
    activeForeground: palette.softWhite,
    foreground: palette.charcoal,
  },
  inlineHints: {
    border: palette.scrollbarBorder,
    background: lighten(palette.background, 0.2),
    foreground: palette.muted,
  },
  subtleElements: {
    background: lighten(palette.background, 0.3),
    foreground: mix(palette.softWhite, palette.background, 0.7),
    active: mix(palette.softWhite, palette.background, 0.3),
    hover: mix(palette.softWhite, palette.background, 0.5),
    selected: mix(palette.softWhite, palette.background, 0.2),
    disabled: mix(palette.softWhite, palette.background, 0.8),
    border: mix(palette.softWhite, palette.background, 0.6),
  },
  elements: {
    background: palette.buttonBg,
    hover: "#8d61ff2e",
    active: palette.buttonBg,
    selected: palette.listActive,
    disabled: "#26242a54",
    foreground: foregrounds.default,
    border: palette.buttonBorder,
  },
  panels: {
    background: palette.panelBg,
    border: palette.tabBorder,
    foreground: foregrounds.default,
  },
  indentGuide: {
    activeBackground: palette.indentGuideActive,
    background: palette.indentGuide,
  },
  ruler: {
    foreground: palette.ruler,
  },
  whitespace: {
    foreground: palette.whitespace,
  },
  error: {
    background: transparentize(palette.errorRed, 0.5),
    listForeground: palette.errorRedForeground,
  }
  // panels: {
  //   background: palette.panelBg,
  //   border: palette.tabBorder,
  // },
  // tabs: {
  //   headerBackground: palette.tabHeaderBg,
  //   border: palette.tabBorder,
  //   activeBorder: palette.tabActiveBorder,
  // },
  // indentGuide: {
  //   default: palette.indentGuide,
  //   active: palette.indentGuideActive,
  // },
  // ruler: {
  //   color: palette.ruler,
  // },
}
const overrides: ThemeDefinition["ui"]["overrides"] = {
      editor: {
        background: palette.background,
        foreground: palette.mist,
        lineHighlight: palette.lineHighlight,
        lineHighlightBorder: palette.lineHighlight,
        lineNumberActiveForeground: palette.softWhite,
        lineNumberForeground: palette.charcoal,
        inactiveSelectionBackground: palette.inactiveSelection,
        selectionBackground: palette.selection,
        selectionHighlightBackground: palette.selectionHighlight,
        findMatchBackground: palette.findMatch,
        findMatchHighlightBackground: palette.findMatchHighlight,
        findRangeHighlightBackground: "#39324952",
        // line: palette.selectionHighlight,
        // wordHighlight: palette.wordHighlight,
        // wordHighlightStrong: palette.wordHighlightStrong,
        // findMatchHighlight: palette.findMatchHighlight,
        // findMatch: palette.findMatch,
        // rangeHighlight: "#2A244120",
      },
      editorGutter: {
        background: palette.gutterBg,
        modifiedBackground: "#e9c162c0",
        addedBackground: "#0a2b20ff",
        deletedBackground: "#2c0c15ff",
        foldingControl: palette.charcoal,
      },
      editorLineNumber: {
        foreground: "#454148",
        activeForeground: "#9B8FB5",
      },
      activityBar: {
        background: palette.gutterBg,
        foreground: palette.steel,
        inactiveForeground: "#45414C",
        border: palette.gutterBg,
        badgeBackground: "#FF7A0000",
        badgeForeground: palette.brightGreen,
      },
      sideBar: {
        background: palette.gutterBg,
        foreground: "#827b90cf",
        border: palette.gutterBg,
        sectionHeaderBackground: "#0f0e1000",
        sectionHeaderForeground: "#e3e1e8b7",
      },
      panel: {
        background: palette.gutterBg,
        foreground: palette.steel,
        border: "#1a102b",
        titleActiveForeground: palette.steel,
        titleInactiveForeground: "#E0E0E0",
        titleActiveBorder: "#ffffff",
      },
      statusBar: {
        background: palette.gutterBg,
        foreground: "#5f6384b8",
        border: "#ffffff00",
        debuggingBackground: "#3fffbdf2",
        debuggingForeground: "#5b0092",
        noFolderBackground: "#0B0915",
        noFolderForeground: palette.muted,
      },
      tabs: {
        activeBackground: palette.tabBg,
        activeForeground: palette.steel,
        activeBorder: palette.tabActiveBorder,
        activeBorderTop: palette.tabActiveBorder,
        inactiveBackground: palette.gutterBg,
        inactiveForeground: palette.lightGray,
        hoverBackground: palette.tabBg,
        hoverForeground: palette.white,
        unfocusedActiveBackground: palette.tabBg,
        unfocusedActiveForeground: palette.muted,
        modifiedBorder: palette.gold,
      },
      list: {
        activeSelectionBackground: palette.listActive,
        activeSelectionForeground: "#E6E2D1",
        inactiveSelectionBackground: palette.suggestBg,
        inactiveSelectionForeground: "#E6E2D1",
        hoverBackground: "#2A244140",
        hoverForeground: "#E6E2D1",
        focusBackground: palette.listActive,
        focusForeground: "#E6E2D1",
        highlightForeground: palette.gold,
      },
      input: {
        background: palette.inputBg,
        foreground: "#ffffff99",
        border: palette.inputBorder,
        placeholderForeground: "#b5b5b545",
      },
      button: {
        background: palette.buttonBg,
        foreground: palette.buttonFg,
        hoverBackground: "#8d61ff2e",
        secondaryBackground: "#17161e54",
        secondaryForeground: "#d0d5dbba",
        secondaryHoverBackground: "#2b293754",
      },
      dropdown: {
        background: palette.suggestBg,
        foreground: "#E6E2D1",
        border: "#45414C",
        listBackground: palette.suggestBg,
      },
      badge: {
        background: "#0b0b19c9",
        foreground: "#82aaffd4",
      },
      scrollbar: {
        shadow: "#00000080",
        sliderBackground: "#45414C40",
        sliderHoverBackground: "#45414C80",
        sliderActiveBackground: "#45414C",
      },
      minimap: {
        background: palette.background,
        selectionHighlight: palette.selection,
        errorHighlight: palette.errorRed,
        warningHighlight: palette.warning,
        findMatchHighlight: palette.findMatch,
      },
      breadcrumb: {
        background: palette.background,
        foreground: "default",
        focusForeground: "#E6E2D1",
        activeSelectionForeground: palette.yellow,
      },
      terminal: {
        background: "#0f0d12",
        foreground: "#626274",
        cursorForeground: palette.white,
        selectionBackground: palette.selection,
        cursor: palette.white,
        ansiBlack: palette.ansiBlack,
        ansiRed: "#ff00af",
        ansiGreen: palette.brightGreen,
        ansiYellow: palette.yellow,
        ansiBlue: "#ac82ff",
        ansiMagenta: palette.purple,
        ansiCyan: "#80d3c4",
        ansiWhite: palette.ansiWhite,
        ansiBrightBlack: palette.ansiBrightBlack,
        ansiBrightRed: palette.ansiBrightRed,
        ansiBrightGreen: "#D7F2A6",
        ansiBrightYellow: "#FFE082",
        ansiBrightBlue: "#9EC3FF",
        ansiBrightMagenta: "#DDA4FF",
        ansiBrightCyan: "#A3EEFF",
        ansiBrightWhite: "#FFFFFF",
      },
      notification: {
        background: palette.widgetBg,
        foreground: palette.white,
        border: "#45414C",
      },
      peekView: {
        editorBackground: "#0F0D1A",
        editorBorder: "#45414C",
        resultBackground: palette.suggestBg,
        resultSelectionBackground: palette.listActive,
        titleBackground: "#0B0915",
        titleForeground: "#E6E2D1",
      },
      diffEditor: {
        insertedTextBackground: "#061611d9",
        removedTextBackground: "#290011cc",
        insertedLineBackground: "#091511",
        removedLineBackground: "#12080b",
        diagonalFill: "#45414C",
      },
      merge: {
        currentHeaderBackground: palette.suggestBg,
        incomingHeaderBackground: palette.suggestBg,
        commonHeaderBackground: palette.suggestBg,
        currentContentBackground: mix(palette.addedGreen, palette.background, 0.3),
        incomingContentBackground: mix(palette.gold, palette.background, 0.3),
        commonContentBackground: mix("#45414C", palette.background, 0.3),
      },
    };

export const apatheticOcean: ThemeDefinition = {
  name: "Apathetic Ocean",
  type: "dark",
  palette,
  background: palette.background,

  tokens: {
    source: palette.softWhite,
    comments: palette.charcoal,
    strings: make({
      default: palette.wasabi,
      regex: palette.rose,
    }),
    operators: {
      default: palette.razzmatazz,
    },
    special: {
      jsxClass: palette.charcoal,
    },
    literals: {
      default: palette.cyan,
      string: palette.wasabi,
      number: palette.cyan,
      boolean: palette.cyan,
      null: palette.cyan,
      undefined: palette.cyan,
      regex: palette.rose,
    },

    keywords: {
      default: palette.softBlue,
      control: "#e3e1e8a8",
      declaration: palette.gray,
      import: palette.importPurple,
      modifier: "#5b6467",
      operator: palette.razzmatazz,
    },

    variables: {
      default: "#e3e1e8c7",
      local: palette.steel,
      parameter: palette.paramPurple,
      property: palette.steel,
      global: palette.amber,
      other: palette.steel,
    },

    constants: {
      default: palette.cyan,
      numeric: palette.cyan,
      language: palette.cyan,
      userDefined: palette.steel,
    },

    functions: {
      default: "#f5e0dc",
      declaration: palette.seafoam,
      call: "#f5e0dc",
      method: "#f5e0dc",
      builtin: palette.seafoam,
    },

    types: {
      default: palette.lightOrchid,
      primitive: palette.lightOrchid,
      class: palette.lightOrchid,
      interface: palette.ice,
      enum: palette.lightOrchid,
      typeParameter: palette.ice,
      namespace: palette.namespace,
    },

    punctuation: {
      default: palette.faintGray,
      definition: "#362942",
      delimiter: palette.faintGray,
      bracket: "#362942",
      accessor: palette.accessor,
    },

    meta: {
      default: palette.lightOrchid,
      decorator: palette.pink,
      macro: palette.pink,
      annotation: palette.pink,
      label: palette.softBlue,
    },
    storage: {
      default: "#5b6467",
      type: "#5b6467",
    },
  },

  languageOverrides: {
    python: {
      functions: {
        default: palette.yellow,
        declaration: palette.yellow,
        call: "#96d5ce",
      },
      storage: {
        default: "#fe90a0",
        type: "#fe90a0",
      },
    },
    go: {
      functions: {
        default: "#73bf9c",
      },
    },
  },

  // Semantic overrides for fine-tuning
  semantic: {
    comment: palette.muted,
    string: palette.wasabi,
    keyword: palette.softBlue,
    number: palette.cyan,
    regexp: palette.rose,
    operator: palette.razzmatazz,
    namespace: palette.namespace,
    type: palette.gold,
    struct: palette.lightOrchid,
    class: palette.classColor,
    interface: palette.ice,
    enum: palette.lightOrchid,
    typeParameter: palette.ice,
    function: palette.seafoam,
    method: palette.seafoam,
    decorator: palette.pink,
    macro: palette.pink,
    variable: "#999eb8",
    parameter: palette.paramPurple,
    property: palette.blush,
    label: palette.softBlue,
  },

  // Modifier handlers
  modifiers: {
    [SemanticTokenModifier.documentation]: {
      global: { foreground: palette.muted, fontStyle: "italic" },
    },
    [SemanticTokenModifier.static]: {
      global: { fontStyle: "" },
    },
    [SemanticTokenModifier.deprecated]: {
      global: { fontStyle: "strikethrough" },
    },
    [SemanticTokenModifier.modification]: {
      global: { foreground: "#ffd014d4" },
    },
    [SemanticTokenModifier.async]: {
      transform: (color: string) => Color(color).mix(Color(palette.softBlue), 0.1).hex(),
    },
  },

  ui: {
    ...ui,
    overrides
  },
};

export default apatheticOcean;
