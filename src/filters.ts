/**
 * Color filters for post-processing themes
 *
 * Apply these filters after theme generation to adjust
 * contrast, brightness, saturation, and other color properties.
 */

import { Color } from "./core/color";
import type { ThemeDefinition } from "./themes/types";

// ============================================================================
// Filter Configuration
// ============================================================================

export interface ThemeFilters {
	/** Adjust contrast (-1 to 1, 0 is no change). Positive values increase contrast. */
	contrast?: number;

	/** Adjust brightness (-1 to 1, 0 is no change). Positive makes colors lighter. */
	brightness?: number;

	/** Adjust saturation (-1 to 1, 0 is no change). Positive makes colors more vivid. */
	saturation?: number;

	/** Shift hue (0-360 degrees) */
	hueShift?: number;

	/** Adjust lightness of foreground colors only (for readability) */
	foregroundLightness?: number;

	/** Adjust lightness of background colors only */
	backgroundLightness?: number;

	/** Custom filter function applied last */
	custom?: (color: string, key: string, theme: ThemeDefinition) => string;
}

// ============================================================================
// Color Detection
// ============================================================================

/**
 * Check if a string is a valid color (hex, rgb, etc.)
 */
function isColor(value: string): boolean {
	if (!value || typeof value !== "string") return false;

	// Hex colors
	if (/^#[0-9A-Fa-f]{3,8}$/.test(value)) return true;

	// RGB/RGBA
	if (/^rgba?\s*\(/.test(value)) return true;

	// HSL/HSLA
	if (/^hsla?\s*\(/.test(value)) return true;

	// OKLCH
	if (/^oklch\s*\(/i.test(value)) return true;

	return false;
}

/**
 * Determine if a color is "light" (useful for detecting backgrounds vs foregrounds)
 */
function isLightColor(color: string): boolean {
	try {
		return new Color(color).oklch().l > 0.5;
	} catch {
		return false;
	}
}

// ============================================================================
// Filter Implementation
// ============================================================================

/**
 * Apply all filters to a single color
 */
export function applyFilters(
	colorStr: string,
	filters: ThemeFilters,
	key = "",
	theme = {} as ThemeDefinition,
): string {
	if (!isColor(colorStr)) return colorStr;

	try {
		let color = new Color(colorStr);
		const original = new Color(colorStr).oklch();
		const hasAlpha = original.alpha < 1;

		// Contrast adjustment (move colors away from or toward middle gray)
		if (filters.contrast !== undefined && filters.contrast !== 0) {
			const factor = 1 + filters.contrast;
			const l = color.oklch().l * 100;
			// Move lightness toward or away from 50%
			const newL = 50 + (l - 50) * factor;
			color = color.lightness(Math.max(0, Math.min(100, newL)));
		}

		// Brightness adjustment
		if (filters.brightness !== undefined && filters.brightness !== 0) {
			const l = color.oklch().l * 100;
			// Scale: -1 -> 0%, 0 -> no change, 1 -> 100%
			const delta = filters.brightness * 50;
			color = color.lightness(Math.max(0, Math.min(100, l + delta)));
		}

		// Saturation adjustment
		if (filters.saturation !== undefined && filters.saturation !== 0) {
			if (filters.saturation > 0) {
				color = color.saturate(filters.saturation);
			} else {
				color = color.desaturate(Math.abs(filters.saturation));
			}
		}

		// Hue shift
		if (filters.hueShift !== undefined && filters.hueShift !== 0) {
			color = color.rotate(filters.hueShift);
		}

		// Custom filter
		if (filters.custom) {
			const result = filters.custom(color.render(), key, theme);
			color = new Color(result);
		}

		// Preserve original alpha
		if (hasAlpha) {
			return color.alpha(original.alpha).render();
		}

		return color.render();
	} catch {
		// If color parsing fails, return original
		return colorStr;
	}
}

/**
 * Apply filters with context about whether this is a foreground or background color
 */
export function applyFiltersWithContext(
	colorStr: string,
	filters: ThemeFilters,
	context: "foreground" | "background" | "auto",
	key: string,
	theme: ThemeDefinition,
): string {
	if (!isColor(colorStr)) return colorStr;

	try {
		let color = new Color(colorStr);
		const originalAlpha = color.oklch().alpha;
		const hasAlpha = originalAlpha < 1;
		const effectiveContext =
			context === "auto"
				? isLightColor(colorStr)
					? "foreground"
					: "background"
				: context;

		// Apply context-specific lightness adjustment first
		if (effectiveContext === "foreground" && filters.foregroundLightness) {
			const l = color.oklch().l * 100;
			const delta = filters.foregroundLightness * 50;
			color = color.lightness(Math.max(0, Math.min(100, l + delta)));
		} else if (
			effectiveContext === "background" &&
			filters.backgroundLightness
		) {
			const l = color.oklch().l * 100;
			const delta = filters.backgroundLightness * 50;
			color = color.lightness(Math.max(0, Math.min(100, l + delta)));
		}

		// Then apply the rest
		const tempHex = hasAlpha
			? color.alpha(originalAlpha).render()
			: color.render();
		return applyFilters(
			tempHex,
			{
				...filters,
				foregroundLightness: undefined,
				backgroundLightness: undefined,
			},
			key,
			theme,
		);
	} catch {
		return colorStr;
	}
}

// ============================================================================
// Theme-wide Filter Application
// ============================================================================

/**
 * Recursively apply filters to all colors in an object
 */
export function applyFiltersToObject<T>(obj: T, filters: ThemeFilters): T {
	if (!filters || Object.keys(filters).length === 0) return obj;

	if (typeof obj === "string") {
		return applyFilters(obj, filters) as unknown as T;
	}

	if (Array.isArray(obj)) {
		return obj.map((item) =>
			applyFiltersToObject(item, filters),
		) as unknown as T;
	}

	if (typeof obj === "object" && obj !== null) {
		const result: Record<string, unknown> = {};
		for (const [key, value] of Object.entries(obj)) {
			result[key] = applyFiltersToObject(value, filters);
		}
		return result as T;
	}

	return obj;
}

/**
 * Apply filters to a VS Code theme object
 *
 * This intelligently applies filters to colors, tokenColors, and semanticTokenColors.
 */
export function applyFiltersToTheme<
	T extends {
		colors?: Record<string, string>;
		tokenColors?: Array<{
			name?: string;
			scope: string | string[];
			settings: { foreground?: string; fontStyle?: string };
		}>;
		semanticTokenColors?: Record<
			string,
			string | { foreground?: string; fontStyle?: string }
		>;
	},
>(theme: T, filters: ThemeFilters): T {
	if (!filters || Object.keys(filters).length === 0) return theme;

	return {
		...theme,
		colors: theme.colors
			? applyFiltersToObject(theme.colors, filters)
			: theme.colors,
		tokenColors: theme.tokenColors
			? theme.tokenColors.map((token) => ({
					...token,
					settings: {
						...token.settings,
						foreground: token.settings.foreground
							? applyFilters(token.settings.foreground, filters)
							: undefined,
					},
				}))
			: theme.tokenColors,
		semanticTokenColors: theme.semanticTokenColors
			? Object.fromEntries(
					Object.entries(theme.semanticTokenColors).map(([key, value]) => {
						if (typeof value === "string") {
							return [key, applyFilters(value, filters)];
						}
						if (typeof value === "object" && value !== null) {
							return [
								key,
								{
									...value,
									foreground: value.foreground
										? applyFilters(value.foreground, filters)
										: undefined,
								},
							];
						}
						return [key, value];
					}),
				)
			: theme.semanticTokenColors,
	};
}

// ============================================================================
// Preset Filters
// ============================================================================

export const presets = {
	/** Increase contrast for better readability */
	highContrast: {
		contrast: 0.2,
	} as ThemeFilters,

	/** Lower contrast for a softer look */
	lowContrast: {
		contrast: -0.15,
	} as ThemeFilters,

	/** Desaturate colors for a more muted look */
	muted: {
		saturation: -0.3,
	} as ThemeFilters,

	/** Increase saturation for more vivid colors */
	vivid: {
		saturation: 0.25,
	} as ThemeFilters,

	/** Slightly warmer tones */
	warm: {
		hueShift: -10,
		saturation: 0.05,
	} as ThemeFilters,

	/** Slightly cooler tones */
	cool: {
		hueShift: 10,
		saturation: 0.05,
	} as ThemeFilters,

	/** Dim the theme (reduce brightness) */
	dim: {
		brightness: -0.1,
	} as ThemeFilters,

	/** Brighten the theme */
	bright: {
		brightness: 0.1,
	} as ThemeFilters,
};
