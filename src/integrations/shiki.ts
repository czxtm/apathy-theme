/**
 * Shiki integration - maps ThemeDefinition to Shiki-compatible theme format.
 *
 * Shiki consumes VS Code-style TextMate themes, so we reuse the VS Code
 * token mapping and expose the subset Shiki needs.
 */

import type { ThemeDefinition } from "../themes/types";
import type { ThemeFilters } from "../filters";
import { mapVSCode } from "./vscode";

export interface ShikiThemeTokenColor {
  name?: string;
  scope: string | string[];
  settings: {
    foreground?: string;
    fontStyle?: string;
  };
}

export interface ShikiThemeFile {
  name: string;
  type: "dark" | "light";
  colors: Record<string, string>;
  tokenColors: ShikiThemeTokenColor[];
}

export interface BuildOptions {
  /** Override filters (will merge with/override theme.filters) */
  filters?: ThemeFilters;
}

/**
 * Map a ThemeDefinition to a Shiki-compatible theme file.
 * Shiki supports the same TextMate structure used by VS Code themes.
 */
export function mapShiki(
  theme: ThemeDefinition,
  options?: BuildOptions,
): ShikiThemeFile {
  const vscodeTheme = mapVSCode(theme, {
    filters: options?.filters,
  });

  return {
    name: theme.name,
    type: theme.type,
    colors: vscodeTheme.colors,
    tokenColors: vscodeTheme.tokenColors,
  };
}

export default mapShiki;
