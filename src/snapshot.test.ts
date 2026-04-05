/**
 * Snapshot tests for theme color analysis.
 *
 * Computes contrast, saturation, and lightness for common editor elements
 * against their actual surfaces, across all themes and integrations.
 * Run with: bun test src/snapshot.test.ts
 */

import { describe, expect, test } from "bun:test";
import Color from "colorjs.io";
import { mapVSCode } from "./integrations/vscode";
import { mapZed } from "./integrations/zed";
import { apatheticOcean } from "./themes/apatheticOcean";
import { apathy } from "./themes/apathy";
import { apathyExperimental } from "./themes/apathyExperimental";
import { minted } from "./themes/minted";
import { mintedTheory } from "./themes/mintedTheory";
import { slate } from "./themes/slate";
import type { ThemeDefinition } from "./themes/types";

// ---------------------------------------------------------------------------
// Color analysis helpers
// ---------------------------------------------------------------------------

function parseColor(hex: string) {
	try {
		return new Color(hex);
	} catch {
		return null;
	}
}

function compositeOver(fg: Color, bg: Color) {
	const fgSrgb = fg.to("srgb");
	const bgSrgb = bg.to("srgb");
	const [fgr = 0, fgg = 0, fgb = 0] = fgSrgb.coords;
	const [bgr = 0, bgg = 0, bgb = 0] = bgSrgb.coords;
	const fgA = fgSrgb.alpha ?? 1;
	const bgA = bgSrgb.alpha ?? 1;
	const outA = fgA + bgA * (1 - fgA);
	if (outA <= 0) return new Color("srgb", [0, 0, 0], 0);
	const ch = (f: number, b: number) => (f * fgA + b * bgA * (1 - fgA)) / outA;
	return new Color(
		"srgb",
		[ch(fgr ?? 0, bgr ?? 0), ch(fgg ?? 0, bgg ?? 0), ch(fgb ?? 0, bgb ?? 0)],
		outA,
	);
}

function effectiveContrast(fg: string, bg: string): number | null {
	const fgC = parseColor(fg);
	const bgC = parseColor(bg);
	if (!fgC || !bgC) return null;
	const opaqueBg = bgC.clone();
	opaqueBg.alpha = 1;
	const visible = compositeOver(fgC, opaqueBg);
	visible.alpha = 1;
	return Math.round(visible.contrast(opaqueBg, "WCAG21") * 100) / 100;
}

function hsl(
	hex: string,
): { h: number; s: number; l: number; a: number } | null {
	const c = parseColor(hex);
	if (!c) return null;
	const hslColor = c.to("hsl");
	const [h = 0, s = 0, l = 0] = hslColor.coords;
	return {
		h: Math.round(h ?? 0),
		s: Math.round(s ?? 0),
		l: Math.round(l ?? 0),
		a: Math.round((hslColor.alpha ?? 1) * 100) / 100,
	};
}

function analyzeElement(fg: string, bg: string) {
	const fgHsl = hsl(fg);
	const bgHsl = hsl(bg);
	const contrast = effectiveContrast(fg, bg);
	return {
		fg: fg.toUpperCase(),
		bg: bg.toUpperCase(),
		fgHSL: fgHsl ? `${fgHsl.h}/${fgHsl.s}/${fgHsl.l} a${fgHsl.a}` : "?",
		contrast,
		deltaL: fgHsl && bgHsl ? fgHsl.l - bgHsl.l : null,
		deltaS: fgHsl && bgHsl ? fgHsl.s - bgHsl.s : null,
	};
}

type AnalysisRow = ReturnType<typeof analyzeElement> & { element: string };

// ---------------------------------------------------------------------------
// Element-on-surface pairings: Zed
// ---------------------------------------------------------------------------

function analyzeZed(style: Record<string, any>): AnalysisRow[] {
	const bg = style.background;
	const editorBg = style["editor.background"];
	const panelBg = style["panel.background"];
	const surfaceBg = style["surface.background"];
	const statusBarBg = style["status_bar.background"];
	const terminalBg = style["terminal.background"];
	const gutterBg = style["editor.gutter.background"] || editorBg;

	const pairs: [string, string, string][] = [
		// Text on editor
		["editor.foreground → editor.bg", style["editor.foreground"], editorBg],
		["text → background", style.text, bg],
		["text.muted → background", style["text.muted"], bg],
		["text.accent → background", style["text.accent"], bg],

		// Line numbers
		["line_number → gutter", style["editor.line_number"], gutterBg],
		[
			"active_line_number → gutter",
			style["editor.active_line_number"],
			gutterBg,
		],

		// Tabs
		[
			"tab.active → tab.active_bg",
			style.text || style["editor.foreground"],
			style["tab.active_background"],
		],
		[
			"tab.inactive → tab.inactive_bg",
			style["text.muted"],
			style["tab.inactive_background"],
		],

		// Status bar
		["status_bar text → status_bar.bg", style.text, statusBarBg],

		// Terminal
		["terminal.fg → terminal.bg", style["terminal.foreground"], terminalBg],
		["terminal.red → terminal.bg", style["terminal.ansi.red"], terminalBg],
		["terminal.green → terminal.bg", style["terminal.ansi.green"], terminalBg],
		[
			"terminal.yellow → terminal.bg",
			style["terminal.ansi.yellow"],
			terminalBg,
		],
		["terminal.blue → terminal.bg", style["terminal.ansi.blue"], terminalBg],
		["terminal.cyan → terminal.bg", style["terminal.ansi.cyan"], terminalBg],

		// Status indicators
		["error → background", style.error, bg],
		["error.bg → background", style["error.background"], bg],
		["warning → background", style.warning, bg],
		["warning.bg → background", style["warning.background"], bg],
		["info → background", style.info, bg],
		["info.bg → background", style["info.background"], bg],
		["success → background", style.success, bg],
		["success.bg → background", style["success.background"], bg],
		["hint → background", style.hint, bg],
		["hint.bg → background", style["hint.background"], bg],

		// Borders
		["border → background", style.border, bg],
		["border.focused → background", style["border.focused"], bg],
		["error.border → background", style["error.border"], bg],
		["info.border → background", style["info.border"], bg],

		// Elements
		["element.bg → background", style["element.background"], bg],
		["element.hover → background", style["element.hover"], bg],
		["ghost_element.hover → background", style["ghost_element.hover"], bg],

		// Panel
		["panel.bg → background", panelBg, bg],
		["surface.bg → background", surfaceBg, bg],
		["elevated_surface → background", style["elevated_surface.background"], bg],

		// Icon
		["icon → background", style.icon, bg],
		["icon.muted → background", style["icon.muted"], bg],
		["icon.accent → background", style["icon.accent"], bg],

		// Version control
		["vc.added → background", style["version_control.added"], bg],
		["vc.modified → background", style["version_control.modified"], bg],
		["vc.deleted → background", style["version_control.deleted"], bg],
	];

	// Syntax tokens (all render on editor background)
	const syntax = style.syntax as Record<string, { color?: string }> | undefined;
	if (syntax) {
		for (const [token, val] of Object.entries(syntax)) {
			if (val?.color) {
				pairs.push([`syntax.${token} → editor.bg`, val.color, editorBg]);
			}
		}
	}

	return pairs
		.filter(([, fg, surface]) => fg && surface)
		.map(([element, fg, surface]) => ({
			element,
			...analyzeElement(fg, surface),
		}));
}

// ---------------------------------------------------------------------------
// Element-on-surface pairings: VSCode
// ---------------------------------------------------------------------------

function analyzeVSCode(colors: Record<string, string>): AnalysisRow[] {
	const editorBg = colors["editor.background"];
	const sidebarBg = colors["sideBar.background"];
	const panelBg = colors["panel.background"];
	const statusBarBg = colors["statusBar.background"];
	const tabActiveBg = colors["tab.activeBackground"];
	const tabInactiveBg = colors["tab.inactiveBackground"];
	const inputBg = colors["input.background"];
	const activityBarBg = colors["activityBar.background"];

	const pairs: [string, string, string][] = [
		// Editor
		["editor.fg → editor.bg", colors["editor.foreground"], editorBg],

		// Sidebar
		["sidebar.fg → sidebar.bg", colors["sideBar.foreground"], sidebarBg],

		// Activity bar
		[
			"activityBar.fg → activityBar.bg",
			colors["activityBar.foreground"],
			activityBarBg,
		],
		[
			"activityBar.inactiveFg → activityBar.bg",
			colors["activityBar.inactiveForeground"],
			activityBarBg,
		],

		// Tabs
		[
			"tab.activeFg → tab.activeBg",
			colors["tab.activeForeground"],
			tabActiveBg,
		],
		[
			"tab.inactiveFg → tab.inactiveBg",
			colors["tab.inactiveForeground"],
			tabInactiveBg,
		],

		// Status bar
		[
			"statusBar.fg → statusBar.bg",
			colors["statusBar.foreground"],
			statusBarBg,
		],

		// Panel
		[
			"panelTitle.activeFg → panel.bg",
			colors["panelTitle.activeForeground"],
			panelBg,
		],

		// Input
		["input.fg → input.bg", colors["input.foreground"], inputBg],
		[
			"input.placeholder → input.bg",
			colors["input.placeholderForeground"],
			inputBg,
		],

		// Button
		[
			"button.fg → button.bg",
			colors["button.foreground"],
			colors["button.background"],
		],

		// List
		[
			"list.activeFg → list.activeBg",
			colors["list.activeSelectionForeground"],
			colors["list.activeSelectionBackground"],
		],
		[
			"list.hoverFg → list.hoverBg",
			colors["list.hoverForeground"],
			colors["list.hoverBackground"],
		],

		// Badge
		[
			"badge.fg → badge.bg",
			colors["badge.foreground"],
			colors["badge.background"],
		],
	];

	return pairs
		.filter(([, fg, surface]) => fg && surface)
		.map(([element, fg, surface]) => ({
			element,
			...analyzeElement(fg, surface),
		}));
}

// ---------------------------------------------------------------------------
// Snapshot formatting
// ---------------------------------------------------------------------------

function formatTable(rows: AnalysisRow[]): string {
	const lines: string[] = [];
	const pad = (s: string, n: number) => s.padEnd(n);
	const rpad = (s: string, n: number) => s.padStart(n);

	lines.push(
		`${pad("Element", 40)} ${pad("Contrast", 10)} ${pad("ΔL", 6)} ${pad("ΔS", 6)} ${pad("FG HSL", 22)} ${pad("FG", 12)} ${pad("BG", 12)}`,
	);
	lines.push("-".repeat(120));

	for (const row of rows) {
		const contrast = row.contrast != null ? row.contrast.toFixed(2) : "?";
		const dL =
			row.deltaL != null ? (row.deltaL >= 0 ? "+" : "") + row.deltaL : "?";
		const dS =
			row.deltaS != null ? (row.deltaS >= 0 ? "+" : "") + row.deltaS : "?";
		lines.push(
			`${pad(row.element, 40)} ${rpad(contrast, 10)} ${rpad(dL, 6)} ${rpad(dS, 6)} ${pad(row.fgHSL, 22)} ${pad(row.fg.slice(0, 9), 12)} ${pad(row.bg.slice(0, 9), 12)}`,
		);
	}

	return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

const allThemes: { name: string; theme: ThemeDefinition }[] = [
	{ name: "Minted", theme: minted },
	{ name: "Minted Theory", theme: mintedTheory },
	{ name: "Slate", theme: slate },
	{ name: "Apathy", theme: apathy },
	{ name: "Apathetic Ocean", theme: apatheticOcean },
	{ name: "Apathy Experimental", theme: apathyExperimental },
];

describe("Zed theme snapshots", () => {
	for (const { name, theme } of allThemes) {
		test(`${name}`, () => {
			const zed = mapZed(theme);
			const style = zed.themes[0].style;
			const rows = analyzeZed(style as any);
			const table = formatTable(rows);
			expect(table).toMatchSnapshot();
		});
	}
});

describe("VSCode theme snapshots", () => {
	for (const { name, theme } of allThemes) {
		test(`${name}`, () => {
			const vscode = mapVSCode(theme);
			const rows = analyzeVSCode(vscode.colors as any);
			const table = formatTable(rows);
			expect(table).toMatchSnapshot();
		});
	}
});

describe("Cross-theme consistency", () => {
	test("status color contrast ranges", () => {
		const results: Record<
			string,
			{ min: number; max: number; values: Record<string, number> }
		> = {};

		for (const { name, theme } of allThemes) {
			const zed = mapZed(theme);
			const style = zed.themes[0].style as Record<string, any>;
			const bg = style.background;

			for (const status of [
				"error",
				"warning",
				"info",
				"success",
				"hint",
			] as const) {
				const key = `${status} fg`;
				const contrast = effectiveContrast(style[status], bg);
				if (contrast == null) continue;
				if (!results[key])
					results[key] = { min: Infinity, max: -Infinity, values: {} };
				results[key].min = Math.min(results[key].min, contrast);
				results[key].max = Math.max(results[key].max, contrast);
				results[key].values[name] = contrast;
			}
		}

		const summary = Object.entries(results)
			.map(([key, { min, max, values }]) => {
				const spread = max - min;
				const vals = Object.entries(values)
					.map(([theme, v]) => `${theme}: ${v.toFixed(2)}`)
					.join(", ");
				return `${key}: range ${min.toFixed(2)}–${max.toFixed(2)} (spread ${spread.toFixed(2)}) [${vals}]`;
			})
			.join("\n");

		expect(summary).toMatchSnapshot();
	});

	test("syntax token contrast ranges", () => {
		const results: Record<
			string,
			{ min: number; max: number; values: Record<string, number> }
		> = {};

		for (const { name, theme } of allThemes) {
			const zed = mapZed(theme);
			const style = zed.themes[0].style as Record<string, any>;
			const editorBg = style["editor.background"];
			const syntax = style.syntax as Record<string, { color?: string }>;

			for (const [token, val] of Object.entries(syntax)) {
				if (!val?.color) continue;
				const contrast = effectiveContrast(val.color, editorBg);
				if (contrast == null) continue;
				if (!results[token])
					results[token] = { min: Infinity, max: -Infinity, values: {} };
				results[token].min = Math.min(results[token].min, contrast);
				results[token].max = Math.max(results[token].max, contrast);
				results[token].values[name] = contrast;
			}
		}

		const summary = Object.entries(results)
			.sort(([a], [b]) => a.localeCompare(b))
			.map(([token, { min, max, values }]) => {
				const spread = max - min;
				const vals = Object.entries(values)
					.map(([theme, v]) => `${theme}: ${v.toFixed(2)}`)
					.join(", ");
				return `${token}: range ${min.toFixed(2)}–${max.toFixed(2)} (spread ${spread.toFixed(2)}) [${vals}]`;
			})
			.join("\n");

		expect(summary).toMatchSnapshot();
	});
});
