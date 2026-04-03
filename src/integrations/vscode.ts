/**
 * VS Code integration - maps ThemeDefinition to VS Code theme format
 *
 * This is the only place that knows about VS Code's format.
 * It reads from ThemeDefinition and produces VS Code JSON.
 */

import * as fs from "fs";
import type { ThemableDecorationRenderOptions } from 'vscode';
import type { ThemeDefinition, TokenAssignments } from "../themes/types";
import {
	applyFilters,
	strictColorFactory,
	get,
	getThemeValue,
	semantic,
	semanticFactory,
	colorFactory,
} from "../themes/types";
import { applyFiltersToTheme, type ThemeFilters } from "../filters";
import { SemanticTokenModifier, SemanticTokenType, vscode } from "../types";
import Color from "color";

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
 * Build a flat VS Code colors object using the sc() strict color factory.
 * Uses sc() with fallback arguments: sc("override.path", "ui.fallback.path")
 * The first valid exact path wins, then falls back to CSS-like cascading.
 */
function buildColors(t: ThemeDefinition, c: ReturnType<typeof strictColorFactory>): Record<string, string> {
	const tokenMap: Record<keyof vscode.VSCodeColors, string> = {
		// ═══════════════════════════════════════════════════════════════════════
		// Editor
		// ═══════════════════════════════════════════════════════════════════════
		"editor.background": c("ui.overrides.editor.background", "ui.backgrounds.surface", "background"),
		"editor.foreground": c("ui.overrides.editor.foreground", "ui.foregrounds.default"),
		"editor.hoverHighlightBackground": c("ui.overrides.editor.lineHighlight", "ui.selection.background"),
		"editor.selectionHighlightBorder": c("ui.overrides.editor.lineHighlightBorder", "ui.borders.active"),
		// "editor.selectionHighlightBackground": c("ui.overrides.editor.selectionHighlight", "ui.selection.background"),
		// "editor.wordHighlightBackground": c("ui.overrides.editor.wordHighlight", "ui.selection.background"),
		// "editor.wordHighlightStrongBackground": c("ui.overrides.editor.wordHighlightStrong", "ui.selection.background"),
		// "editor.findMatchBackground": c("ui.overrides.editor.findMatch", "ui.foregrounds.accent"),
		// "editor.findMatchHighlightBackground": c("ui.overrides.editor.findMatchHighlight", "ui.selection.background"),
		// "editor.findRangeHighlightBackground": c("ui.overrides.editor.rangeHighlight", "ui.selection.background"),
		// "editor.selectionBackground": c("ui.selection.background", "ui.selection.background"),
		// @ts-ignore
		// "editor.wordHighlightStrongBackground": c("ui.overrides.editor.wordHighlightStrong", "ui.selection.background"),
		"list.highlightForeground": c("ui.overrides.list.highlightForeground", "ui.foregrounds.accent"),
		"editor.selectionBackground": c("ui.overrides.editor.selectionBackground", "ui.selection.background"),
		"editor.selectionHighlightBackground": c("ui.overrides.editor.selectionHighlightBackground", "ui.selection.background"),
		"editor.inactiveSelectionBackground": c("ui.overrides.editor.inactiveSelectionBackground", "ui.selection.backgroundInactive", "ui.selection.background"),
		// "editor.wordHighlightBackground": c("ui.overrides.editor.wordHighlightBackground"),
		// "editor.wordHighlightStrongBackground": c("ui.overrides.editor.wordHighlightStrongBackground"),
		"editor.findMatchBackground": c("ui.overrides.editor.findMatchBackground", "ui.foregrounds.accent"),
		"editor.findMatchHighlightBackground": c("ui.overrides.editor.findMatchHighlightBackground", "ui.selection.background"),
		"editor.findRangeHighlightBackground": c("ui.overrides.editor.findRangeHighlightBackground", "ui.selection.background"),
		// ═══════════════════════════════════════════════════════════════════════
		// Editor Gutter
		// ═══════════════════════════════════════════════════════════════════════
		// "editorGutter.background": c("ui.overrides.editorGutter.background", "ui.backgrounds.surface"),
		// "diffEditorGutter.removedLineBackground": c("ui.overrides.editorGutter.modifiedBackground", "ui.git.modified"),
		// "editorGutter.foldingControlForeground": c("ui.overrides.editorGutter.foldingControl", "ui.foregrounds.muted"),
		// @ts-ignore
		"editorGutter.modifiedBackground": c("ui.overrides.editorGutter.modifiedBackground", "ui.git.modified"),
		// @ts-ignore
		"editorGutter.addedBackground": c("ui.overrides.editorGutter.addedBackground", "ui.git.added"),
		// @ts-ignore
		"editorGutter.deletedBackground": c("ui.overrides.editorGutter.deletedBackground", "ui.git.deleted"),
		"quickInput.background": c("ui.backgrounds.surface"),
		"quickInput.foreground": c("ui.foregrounds.default"),
		"quickInputList.focusBackground": c("ui.backgrounds.overlay"),
		"quickInputList.focusForeground": c("ui.foregrounds.focused"),
		"list.hoverBackground": c("ui.backgrounds.overlay"),
		"list.hoverForeground": c("ui.foregrounds.focused"),
		"quickInput.list.focusBackground": c("ui.backgrounds.overlay"),

		// ═══════════════════════════════════════════════════════════════════════
		// Editor Line Number
		// ═══════════════════════════════════════════════════════════════════════
		// "editorLineNumber.foreground": c("ui.overrides.editor.lineNumberForeground", "ui.foregrounds.muted"),
		// "editorLineNumber.activeForeground": c("ui.overrides.editor.lineNumberActiveForeground", "ui.foregrounds.default"),
		// "chat.requestBackground": c("ui.overrides.chat.requestBackground", "ui.backgrounds.surface"),
		// "chat.requestForeground": c("ui.overrides.editor.foreground", "ui.foregrounds.default"),
		// "chat.requestBorder": c("ui.borders.default", "ui.borders.default"),
		// "chat.checkpointSeparator": c("ui.borders.active", "ui.borders.subtle"),
		// "chat.editedFileForeground": c("ui.overrides.chat.codeBlockBackground", "ui.foregrounds.muted"),


		// ═══════════════════════════════════════════════════════════════════════
		// Activity Bar
		// ═══════════════════════════════════════════════════════════════════════
		"activityBar.background": c("ui.overrides.activityBar.background", "ui.backgrounds.base"),
		"activityBar.foreground": c("ui.overrides.activityBar.foreground", "ui.foregrounds.default"),
		"activityBar.inactiveForeground": c("ui.overrides.activityBar.inactiveForeground", "ui.foregrounds.muted"),
		"activityBar.border": c("ui.overrides.activityBar.border", "ui.borders.subtle"),
		"activityBarBadge.background": c("ui.overrides.activityBar.badgeBackground", "ui.accent.primary"),
		"activityBarBadge.foreground": c("ui.overrides.activityBar.badgeForeground", "ui.accent.primaryForeground"),

		// ═══════════════════════════════════════════════════════════════════════
		// Side Bar
		// ═══════════════════════════════════════════════════════════════════════
		"sideBar.background": c("ui.overrides.sideBar.background", "ui.backgrounds.surface"),
		"sideBar.foreground": c("ui.overrides.sideBar.foreground", "ui.foregrounds.default"),
		"sideBar.border": c("ui.overrides.sideBar.border", "ui.borders.default"),
		"sideBarSectionHeader.background": c("ui.overrides.sideBar.sectionHeaderBackground", "ui.backgrounds.raised"),
		"sideBarSectionHeader.foreground": c("ui.overrides.sideBar.sectionHeaderForeground", "ui.foregrounds.default"),
		"panel.border": c("ui.borders.default"),
		// "gauge.border": c("ui.borders.subtle"),
		"sash.hoverBorder": c("ui.borders.active"),
		"editorGroup.border": c("ui.borders.subtle"),
		// "composerPane.background": c("ui.backgrounds.surface"),
		"editor.compositionBorder": c("ui.borders.active"),
		"editorWidget.background": c("ui.overrides.editorWidget.background", "ui.backgrounds.overlay"),
		"editorWidget.border": c("ui.overrides.editorWidget.border", "ui.borders.default"),
		"editorWidget.foreground": c("ui.overrides.editorWidget.foreground", "ui.foregrounds.default"),
		"input.border": c("ui.overrides.input.border", "ui.borders.default"),
		// @ts-ignore
		"diffEditorGutter.insertedLineBackground": c("ui.overrides.editorGutter.addedBackground", "ui.git.added"),
		// @ts-ignore
		"diffEditorGutter.removedLineBackground": c("ui.overrides.editorGutter.deletedBackground", "ui.git.deleted"),


		// ═══════════════════════════════════════════════════════════════════════
		// Panel
		// ═══════════════════════════════════════════════════════════════════════
		"panel.background": c("ui.overrides.panel.background", "ui.panels.background", "ui.backgrounds.surface"),
		// "panel.foreground": c("ui.overrides.panel.foreground", "ui.foregrounds.default"),
		// "panel.border": c("ui.overrides.panel.border", "ui.borders.default"),
		"panelTitle.activeForeground": c("ui.overrides.panel.titleActiveForeground", "ui.foregrounds.default"),
		"panelTitle.inactiveForeground": c("ui.overrides.panel.titleInactiveForeground", "ui.foregrounds.muted"),
		"panelTitle.activeBorder": c("ui.overrides.panel.titleActiveBorder", "ui.accent.primary"),
		"titleBar.activeBackground": c("ui.overrides.titleBar.activeBackground", "ui.backgrounds.base"),
		"titleBar.activeForeground": c("ui.overrides.titleBar.activeForeground", "ui.foregrounds.default"),
		"titleBar.inactiveBackground": c("ui.overrides.titleBar.inactiveBackground", "ui.backgrounds.base"),
		"titleBar.inactiveForeground": c("ui.overrides.titleBar.inactiveForeground", "ui.foregrounds.muted"),
		// ═══════════════════════════════════════════════════════════════════════
		// Status Bar
		// ═══════════════════════════════════════════════════════════════════════
		"statusBar.background": c("ui.overrides.statusBar.background", "ui.backgrounds.base"),
		"statusBar.foreground": c("ui.overrides.statusBar.foreground", "ui.foregrounds.default"),
		"statusBar.border": c("ui.overrides.statusBar.border", "ui.borders.subtle"),
		// "statusBar.debuggingBackground": c("ui.overrides.statusBar.debuggingBackground", "ui.status.warning"),
		// "statusBar.debuggingForeground": c("ui.overrides.statusBar.debuggingForeground", "ui.foregrounds.default"),
		"statusBar.noFolderBackground": c("ui.overrides.statusBar.noFolderBackground", "ui.backgrounds.surface"),
		"statusBar.noFolderForeground": c("ui.overrides.statusBar.noFolderForeground", "ui.foregrounds.muted"),

		// ═══════════════════════════════════════════════════════════════════════
		// Tabs
		// ═══════════════════════════════════════════════════════════════════════
		"tab.activeBackground": c("ui.overrides.tabs.activeBackground", "ui.backgrounds.surface"),
		"tab.activeForeground": c("ui.overrides.tabs.activeForeground", "ui.foregrounds.default"),
		"tab.activeBorder": c("ui.overrides.tabs.activeBorder", "ui.accent.primary"),
		"tab.activeBorderTop": c("ui.overrides.tabs.activeBorderTop", "ui.accent.primary"),
		"tab.inactiveBackground": c("ui.overrides.tabs.inactiveBackground", "ui.backgrounds.base"),
		"tab.inactiveForeground": c("ui.overrides.tabs.inactiveForeground", "ui.foregrounds.muted"),
		"tab.hoverBackground": c("ui.overrides.tabs.hoverBackground", "ui.backgrounds.raised"),
		"tab.hoverForeground": c("ui.overrides.tabs.hoverForeground", "ui.foregrounds.default"),
		"tab.unfocusedActiveBackground": c("ui.overrides.tabs.unfocusedActiveBackground", "ui.backgrounds.surface"),
		"tab.unfocusedActiveForeground": c("ui.overrides.tabs.unfocusedActiveForeground", "ui.foregrounds.muted"),
		"tab.lastPinnedBorder": c("ui.overrides.tabs.modifiedBorder", "ui.accent.primary"),

		// ═══════════════════════════════════════════════════════════════════════
		// List
		// ═══════════════════════════════════════════════════════════════════════
		"list.activeSelectionBackground": c("ui.overrides.list.activeSelectionBackground", "ui.backgrounds.raised"),
		"list.activeSelectionForeground": c("ui.overrides.list.activeSelectionForeground", "ui.foregrounds.default"),
		"list.inactiveSelectionBackground": c("ui.overrides.list.inactiveSelectionBackground", "ui.backgrounds.raised"),
		"list.inactiveSelectionForeground": c("ui.overrides.list.inactiveSelectionForeground", "ui.foregrounds.muted"),
		// "list.hoverBackground": c("ui.overrides.list.hoverBackground", "ui.backgrounds.raised"),
		// "list.hoverForeground": c("ui.overrides.list.hoverForeground", "ui.foregrounds.default"),
		"list.focusBackground": c("ui.overrides.list.focusBackground", "ui.selection.background"),
		"list.focusForeground": c("ui.overrides.list.focusForeground", "ui.foregrounds.default"),
		// "list.highlightForeground": c("ui.overrides.list.highlightForeground", "ui.foregrounds.accent"),

		// ═══════════════════════════════════════════════════════════════════════
		// Input
		// ═══════════════════════════════════════════════════════════════════════
		"input.background": c("ui.overrides.input.background", "ui.backgrounds.raised"),
		"input.foreground": c("ui.overrides.input.foreground", "ui.foregrounds.default"),
		// "input.border": c("ui.overrides.input.border", "ui.borders.default"),
		"input.placeholderForeground": c("ui.overrides.input.placeholderForeground", "ui.foregrounds.subtle"),

		// ═══════════════════════════════════════════════════════════════════════
		// Button
		// ═══════════════════════════════════════════════════════════════════════
		"button.background": c("ui.overrides.button.background", "ui.accent.primary"),
		"button.foreground": c("ui.overrides.button.foreground", "ui.accent.primaryForeground"),
		"button.hoverBackground": c("ui.overrides.button.hoverBackground", "ui.accent.primary"),
		"button.secondaryBackground": c("ui.overrides.button.secondaryBackground", "ui.backgrounds.raised"),
		"button.secondaryForeground": c("ui.overrides.button.secondaryForeground", "ui.foregrounds.default"),
		"button.secondaryHoverBackground": c("ui.overrides.button.secondaryHoverBackground", "ui.backgrounds.overlay"),

		// ═══════════════════════════════════════════════════════════════════════
		// Dropdown
		// ═══════════════════════════════════════════════════════════════════════
		"dropdown.background": c("ui.overrides.dropdown.background", "ui.backgrounds.raised"),
		"dropdown.foreground": c("ui.overrides.dropdown.foreground", "ui.foregrounds.default"),
		"dropdown.border": c("ui.overrides.dropdown.border", "ui.borders.default"),
		"dropdown.listBackground": c("ui.overrides.dropdown.listBackground", "ui.backgrounds.raised"),

		// ═══════════════════════════════════════════════════════════════════════
		// Badge
		// ═══════════════════════════════════════════════════════════════════════
		"badge.background": c("ui.overrides.badge.background", "ui.accent.primary"),
		"badge.foreground": c("ui.overrides.badge.foreground", "ui.accent.primaryForeground"),

		// ═══════════════════════════════════════════════════════════════════════
		// Scrollbar
		// ═══════════════════════════════════════════════════════════════════════
		"scrollbar.shadow": c("ui.overrides.scrollbar.shadow", "ui.backgrounds.base"),
		"scrollbarSlider.background": c("ui.overrides.scrollbar.sliderBackground", "ui.borders.subtle"),
		"scrollbarSlider.hoverBackground": c("ui.overrides.scrollbar.sliderHoverBackground", "ui.borders.default"),
		"scrollbarSlider.activeBackground": c("ui.overrides.scrollbar.sliderActiveBackground", "ui.borders.active"),

		// ═══════════════════════════════════════════════════════════════════════
		// Minimap
		// ═══════════════════════════════════════════════════════════════════════
		"minimap.background": c("ui.overrides.minimap.background", "ui.backgrounds.surface"),
		"minimap.selectionHighlight": c("ui.overrides.minimap.selectionHighlight", "ui.selection.background"),
		"minimap.errorHighlight": c("ui.overrides.minimap.errorHighlight", "ui.status.error.foreground"),
		"minimap.warningHighlight": c("ui.overrides.minimap.warningHighlight", "ui.status.warning.foreground"),
		"minimap.findMatchHighlight": c("ui.overrides.minimap.findMatchHighlight", "ui.foregrounds.accent"),

		// ═══════════════════════════════════════════════════════════════════════
		// Breadcrumb
		// ═══════════════════════════════════════════════════════════════════════
		"breadcrumb.background": c("ui.overrides.breadcrumb.background", "ui.backgrounds.surface"),
		"breadcrumb.foreground": c("ui.overrides.breadcrumb.foreground", "ui.foregrounds.muted"),
		"breadcrumb.focusForeground": c("ui.overrides.breadcrumb.focusForeground", "ui.foregrounds.default"),
		"breadcrumb.activeSelectionForeground": c("ui.overrides.breadcrumb.activeSelectionForeground", "ui.foregrounds.default"),

		// ═══════════════════════════════════════════════════════════════════════
		// Terminal
		// ═══════════════════════════════════════════════════════════════════════
		"terminal.background": c("ui.overrides.terminal.background", "ui.backgrounds.surface"),
		"terminal.foreground": c("ui.overrides.terminal.foreground", "ui.foregrounds.default"),
		// @ts-ignore
		"terminal.border": c("ui.overrides.terminal.border", "ui.borders.default"),
		"terminalCursor.foreground": c("ui.overrides.terminal.cursor", "ui.accent.primary"),
		"terminal.selectionBackground": c("ui.overrides.terminal.selectionBackground", "ui.selection.background"),
		"terminal.ansiBlack": c("ui.overrides.terminal.ansiBlack", "ui.backgrounds.base"),
		"terminal.ansiRed": c("ui.overrides.terminal.ansiRed", "ui.status.error.foreground"),
		"terminal.ansiGreen": c("ui.overrides.terminal.ansiGreen", "ui.status.success.foreground"),
		"terminal.ansiYellow": c("ui.overrides.terminal.ansiYellow", "ui.status.warning.foreground"),
		"terminal.ansiBlue": c("ui.overrides.terminal.ansiBlue", "ui.status.info.foreground"),
		"terminal.ansiMagenta": c("ui.overrides.terminal.ansiMagenta", "ui.accent.primary"),
		"terminal.ansiCyan": c("ui.overrides.terminal.ansiCyan", "ui.foregrounds.accent"),
		"terminal.ansiWhite": c("ui.overrides.terminal.ansiWhite", "ui.foregrounds.default"),
		"terminal.ansiBrightBlack": c("ui.overrides.terminal.ansiBrightBlack", "ui.foregrounds.muted"),
		"terminal.ansiBrightRed": c("ui.overrides.terminal.ansiBrightRed", "ui.status.error.foreground"),
		"terminal.ansiBrightGreen": c("ui.overrides.terminal.ansiBrightGreen", "ui.status.success.foreground"),
		"terminal.ansiBrightYellow": c("ui.overrides.terminal.ansiBrightYellow", "ui.status.warning.foreground"),
		"terminal.ansiBrightBlue": c("ui.overrides.terminal.ansiBrightBlue", "ui.status.info.foreground"),
		"terminal.ansiBrightMagenta": c("ui.overrides.terminal.ansiBrightMagenta", "ui.accent.primary"),
		"terminal.ansiBrightCyan": c("ui.overrides.terminal.ansiBrightCyan", "ui.foregrounds.accent"),
		"terminal.ansiBrightWhite": c("ui.overrides.terminal.ansiBrightWhite", "ui.foregrounds.default"),

		// ═══════════════════════════════════════════════════════════════════════
		// Notifications
		// ═══════════════════════════════════════════════════════════════════════
		"notifications.background": c("ui.overrides.notification.background", "ui.backgrounds.overlay"),
		"notifications.foreground": c("ui.overrides.notification.foreground", "ui.foregrounds.default"),
		"notifications.border": c("ui.overrides.notification.border", "ui.borders.default"),

		// ═══════════════════════════════════════════════════════════════════════
		// Peek View
		// ═══════════════════════════════════════════════════════════════════════
		"peekViewEditor.background": c("ui.overrides.peekView.editorBackground", "ui.backgrounds.surface"),
		"peekView.border": c("ui.overrides.peekView.editorBorder", "ui.borders.default"),
		"peekViewResult.background": c("ui.overrides.peekView.resultBackground", "ui.backgrounds.raised"),
		"peekViewResult.selectionBackground": c("ui.overrides.peekView.resultSelectionBackground", "ui.selection.background"),
		"peekViewTitle.background": c("ui.overrides.peekView.titleBackground", "ui.backgrounds.raised"),
		"peekViewTitleLabel.foreground": c("ui.overrides.peekView.titleForeground", "ui.foregrounds.default"),

		// ═══════════════════════════════════════════════════════════════════════
		// Diff Editor
		// ═══════════════════════════════════════════════════════════════════════
		"diffEditor.insertedTextBackground": c("ui.overrides.diffEditor.insertedTextBackground", "ui.git.added"),
		"diffEditor.removedTextBackground": c("ui.overrides.diffEditor.removedTextBackground", "ui.git.deleted"),
		"diffEditor.insertedLineBackground": c("ui.overrides.diffEditor.insertedLineBackground", "ui.git.added"),
		"diffEditor.removedLineBackground": c("ui.overrides.diffEditor.removedLineBackground", "ui.git.deleted"),
		"diffEditor.diagonalFill": c("ui.overrides.diffEditor.diagonalFill", "ui.borders.subtle"),
		"editorInlayHint.insertedTextBackground": c("ui.overrides.diffEditor.insertedTextBackground", "ui.git.added"),
		"editorInlayHint.removedTextBackground": c("ui.overrides.diffEditor.removedTextBackground", "ui.git.deleted"),
		"editorInlayHint.insertedLineBackground": c("ui.overrides.diffEditor.insertedLineBackground", "ui.git.added"),
		"editorInlayHint.removedLineBackground": c("ui.overrides.diffEditor.removedLineBackground", "ui.git.deleted"),
		"editorInlayHint.diagonalFill": c("ui.overrides.diffEditor.diagonalFill", "ui.borders.subtle"),

		// ═══════════════════════════════════════════════════════════════════════
		// Merge
		// ═══════════════════════════════════════════════════════════════════════
		"merge.currentHeaderBackground": c("ui.overrides.merge.currentHeaderBackground", "ui.status.info.foreground"),
		"merge.currentContentBackground": c("ui.overrides.merge.currentContentBackground", "ui.backgrounds.raised"),
		"merge.incomingHeaderBackground": c("ui.overrides.merge.incomingHeaderBackground", "ui.status.success.foreground"),
		"merge.incomingContentBackground": c("ui.overrides.merge.incomingContentBackground", "ui.backgrounds.raised"),
		"merge.commonHeaderBackground": c("ui.overrides.merge.commonHeaderBackground", "ui.backgrounds.raised"),
		"merge.commonContentBackground": c("ui.overrides.merge.commonContentBackground", "ui.backgrounds.raised"),

		// ═══════════════════════════════════════════════════════════════════════
		// Widget & Suggest
		// ═══════════════════════════════════════════════════════════════════════
		// "editorWidget.background": c("ui.backgrounds.overlay"),
		// "editorWidget.border": c("ui.borders.default"),
		"editorSuggestWidget.background": c("ui.suggestWidget.background", "ui.backgrounds.raised"),
		"editorIndentGuide.background1": c("ui.indentGuide.background", "ui.borders.subtle"),
		"editorIndentGuide.activeBackground1": c("ui.indentGuide.activeBackground", "ui.borders.default"),
		"editorWhitespace.foreground": c("ui.whitespace.foreground", "ui.borders.subtle"),
		"editorRuler.foreground": c("ui.ruler.foreground", "ui.borders.subtle"),
		"editorLineNumber.foreground": c("ui.lineNumbers.foreground", "ui.foregrounds.muted"),
		"editorLineNumber.activeForeground": c("ui.lineNumbers.activeForeground", "ui.foregrounds.default"),
		"editorHoverWidget.background": c("ui.elements.background", "ui.backgrounds.overlay"),
		"editorHoverWidget.border": c("ui.elements.border", "ui.borders.default"),
		"editorHoverWidget.foreground": c("ui.elements.foreground", "ui.foregrounds.default"),
		"sideBarTitle.background": c("ui.panels.titleBackground", "ui.backgrounds.surface"),
		"sideBarTitle.foreground": c("ui.panels.titleForeground", "ui.foregrounds.default"),

		"tab.border": c("ui.borders.subtle"),
		"editorGroupHeader.tabsBackground": c("ui.backgrounds.surface"),
		"button.separator": c("ui.borders.separator"),
		"tree.indentGuidesStroke": c("ui.indentGuide.background", "ui.borders.subtle"),
		"composerPane.background": c("ui.overrides.chat.background", "ui.backgrounds.surface"),

		// ═══════════════════════════════════════════════════════════════════════
		// Git Decorations
		// ═══════════════════════════════════════════════════════════════════════
		"gitDecoration.addedResourceForeground": c("ui.git.added"),
		"gitDecoration.modifiedResourceForeground": c("ui.git.modified"),
		"gitDecoration.deletedResourceForeground": c("ui.git.deleted"),
		"gitDecoration.untrackedResourceForeground": c("ui.git.untracked", "ui.foregrounds.muted"),
		"gitDecoration.ignoredResourceForeground": c("ui.git.ignored", "ui.foregrounds.subtle"),
		"gitDecoration.conflictingResourceForeground": c("ui.git.conflict", "ui.status.warning.foreground"),
		"gitDecoration.renamedResourceForeground": c("ui.git.renamed", "ui.git.added"),
		"gitDecoration.stageModifiedResourceForeground": c("ui.git.stageModified", "ui.git.modified"),
		"gitDecoration.stageDeletedResourceForeground": c("ui.git.stageDeleted", "ui.git.deleted"),
		"gitDecoration.submoduleResourceForeground": c("ui.git.submodule", "ui.foregrounds.muted"),

		// ═══════════════════════════════════════════════════════════════════════
		// Cursor
		// ═══════════════════════════════════════════════════════════════════════
		"editorCursor.foreground": c("ui.cursor.foreground", "ui.accent.primary"),

		// ═══════════════════════════════════════════════════════════════════════
		// Window
		// ═══════════════════════════════════════════════════════════════════════
		"window.activeBorder": c("ui.window.activeBorder", "ui.borders.active"),
		"window.inactiveBorder": c("ui.window.inactiveBorder", "ui.borders.subtle"),

		// ═══════════════════════════════════════════════════════════════════════
		// Icon
		// ═══════════════════════════════════════════════════════════════════════
		"icon.foreground": c("ui.icon.foreground", "ui.foregrounds.muted"),

		// ═══════════════════════════════════════════════════════════════════════
		// Focus & Contrast Borders
		// ═══════════════════════════════════════════════════════════════════════
		"focusBorder": c("ui.focus.border", "ui.accent.primary"),
		"contrastBorder": c("ui.focus.contrastBorder", "ui.borders.subtle"),

		// ═══════════════════════════════════════════════════════════════════════
		// Menu
		// ═══════════════════════════════════════════════════════════════════════
		"menu.background": c("ui.menu.background", "ui.backgrounds.raised"),
		"menu.foreground": c("ui.menu.foreground", "ui.foregrounds.default"),
		"menu.selectionBackground": c("ui.menu.selectionBackground", "ui.selection.background"),
		"menu.selectionForeground": c("ui.menu.selectionForeground", "ui.foregrounds.default"),
		"menu.separatorBackground": c("ui.menu.separatorBackground", "ui.borders.separator"),

		// ═══════════════════════════════════════════════════════════════════════
		// Suggest Widget (autocomplete)
		// ═══════════════════════════════════════════════════════════════════════
		"editorSuggestWidget.border": c("ui.suggestWidget.border", "ui.borders.default"),
		"editorSuggestWidget.foreground": c("ui.suggestWidget.foreground", "ui.foregrounds.default"),
		"editorSuggestWidget.selectedBackground": c("ui.suggestWidget.selectedBackground", "ui.selection.background"),

		// ═══════════════════════════════════════════════════════════════════════
		// Progress Bar
		// ═══════════════════════════════════════════════════════════════════════
		"progressBar.background": c("ui.progressBar.background", "ui.accent.primary"),

		// ═══════════════════════════════════════════════════════════════════════
		// Debug Console
		// ═══════════════════════════════════════════════════════════════════════
		"debugConsole.infoForeground": c("ui.debug.infoForeground", "ui.status.info.foreground"),
		"debugConsole.warningForeground": c("ui.debug.warningForeground", "ui.status.warning.foreground"),
		"debugConsole.errorForeground": c("ui.debug.errorForeground", "ui.status.error.foreground"),
		"debugConsole.sourceForeground": c("ui.debug.sourceForeground", "ui.foregrounds.default"),

		// ═══════════════════════════════════════════════════════════════════════
		// Text (links, preformat, separators)
		// ═══════════════════════════════════════════════════════════════════════
		"textLink.foreground": c("ui.text.linkForeground", "ui.accent.primary"),
		"textLink.activeForeground": c("ui.text.linkForeground", "ui.accent.primary"),
		"textPreformat.background": c("ui.text.preformatBackground", "ui.backgrounds.raised"),
		"textPreformat.foreground": c("ui.text.preformatForeground", "ui.foregrounds.default"),
		"textSeparator.foreground": c("ui.text.separatorForeground", "ui.borders.separator"),

		// ═══════════════════════════════════════════════════════════════════════
		// Error Display
		// ═══════════════════════════════════════════════════════════════════════
		"editorError.background": c("ui.error.background", "ui.status.error.background"),
		"list.errorForeground": c("ui.error.listForeground", "ui.status.error.foreground"),

		// ═══════════════════════════════════════════════════════════════════════
		// Peek View Extended
		// ═══════════════════════════════════════════════════════════════════════
		"peekViewEditor.matchHighlightBackground": c("ui.peekView.matchHighlightBackground", "ui.selection.background"),
		"peekViewResult.matchHighlightBackground": c("ui.peekView.matchHighlightBackground", "ui.selection.background"),
		"peekViewTitleDescription.foreground": c("ui.peekView.titleDescriptionForeground", "ui.foregrounds.muted"),

		// ═══════════════════════════════════════════════════════════════════════
		// Status (errors, warnings, info)
		// ═══════════════════════════════════════════════════════════════════════
		"editorError.foreground": c("ui.status.error.foreground"),
		"editorWarning.foreground": c("ui.status.warning.foreground"),
		"editorInfo.foreground": c("ui.status.info.foreground"),
		"terminal.dropBackground": c("ui.backgrounds.raised"),

		// ═══════════════════════════════════════════════════════════════════════
		// Global foreground
		// ═══════════════════════════════════════════════════════════════════════
		"foreground": c("ui.foregrounds.default"),
	};
	// for (const key in tokenMap) {
	// 	const override = c(`ui.overrides.${key}` as any);
	// 	if (tokenMap[key as keyof vscode.VSCodeColors] === undefined) {
	// 		delete tokenMap[key as keyof vscode.VSCodeColors];
	// 	}
	// }
	return tokenMap;
}

/**
 * Generate VS Code theme from ThemeDefinition.
 * Optionally merge with a base theme file for incremental migration.
 */
function generateVSCodeTheme(t: ThemeDefinition): VSCodeThemeFile {
	const c = colorFactory(t);
	const s = semanticFactory(t);
	const sc = strictColorFactory(t);

	// Build all colors using the flat c() approach with fallbacks
	const colors = buildColors(t, sc);

	return {
		name: t.name,
		type: t.type,
		semanticHighlighting: t.semanticHighlighting !== false,

		// Editor colors - merged with extra colors (extraColors takes precedence)
		colors: {
			...colors,
			...(t.extraColors ?? {}),
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
			tokenColor("separator.border", c("ui.borders.separator")),
			tokenColor("focusBorder", c("ui.borders.active")),
			tokenColor("gauge.border", c("ui.borders.default")),
			tokenColor("sash.hoverBorder", c("ui.borders.active")),
			tokenColor("editorGroup.border", c("ui.borders.subtle")),
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
			tokenColor("quickInput.background", c("ui.backgrounds.surface")),
			tokenColor("quickInput.foreground", c("ui.foregrounds.default")),
			tokenColor("quickInput.focusBackground", c("ui.backgrounds.surface")),
			tokenColor("quickInput.focusForeground", c("ui.foregrounds.default")),
			tokenColor("quickInputList.background", c("ui.backgrounds.surface")),
			tokenColor("quickInputList.foreground", c("ui.foregrounds.default")),
			tokenColor("quickInputList.focusBackground", c("ui.backgrounds.surface")),
			tokenColor("quickInputList.focusForeground", c("ui.foregrounds.default")),
			tokenColor("list.hoverBackground", c("ui.backgrounds.overlay")),
			tokenColor("list.hoverForeground", c("ui.foregrounds.default")),

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
			tokenColor("entity.name.tag", c("tokens.meta.tag")),
			tokenColor("support.class.component", sc("tokens.special.jsxClass", "tokens.types.class")),
			tokenColor("support.class.component.jsx", sc("tokens.special.jsxClass", "tokens.types.class")),
			tokenColor("entity.other.attribute-name", c("tokens.variables.property")),
			tokenColor("meta.tag keyword.operator.assignment", c("tokens.variables.property")),
			tokenColor("meta.tag.attributes", c("tokens.variables.property")),

			// Properties (covers CSS, JSON keys, object properties)
			tokenColor("support.type.property-name", c("tokens.variables.property")),
			tokenColor("support.type.property-name.css", c("tokens.variables.property")),
			tokenColor("meta.object-literal.key", c("tokens.variables.property")),
			tokenColor("variable.other.property", c("tokens.variables.property")),
			tokenColor("list.hoverBackground", c("ui.backgrounds.overlay")),
			tokenColor("list.hoverForeground", c("ui.foregrounds.default")),

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
			tokenColor("punctuation.definition.tag", c("tokens.punctuation.definition")),
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

			// CSS
			tokenColor("meta.property-list.css", c("tokens.variables.property")),
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
				// @ts-ignore
				"$schema": "vscode://schemas/color-theme",
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
