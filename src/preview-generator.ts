import { execSync } from "node:child_process";
// Dynamically import all theme JSON files from dist
import { readdirSync, writeFileSync } from "node:fs";
import { basename, extname, join, resolve } from "node:path";
import { generatePreviewHTML } from "./integrations/preview";
import type { ThemeDefinition } from "./themes/types";

// Dynamically discover theme module filenames (without extension)
const themeDir = resolve(__dirname, "..", "src", "themes");
const allFiles = readdirSync(themeDir);
const themeFiles = allFiles
	.filter((f) => {
		const ext = extname(f);
		const name = basename(f, ext);
		// Exclude non‑theme files
		const exclude = [
			"index",
			"utils",
			"types",
			"theme.test",
			"themePaths.generated",
			"mintedBase",
		];
		return ext === ".ts" && !exclude.includes(name);
	})
	.map((f) => basename(f, ".ts"));

async function loadTheme(file: string): Promise<ThemeDefinition> {
	// Import the source theme module which exports a fully normalized ThemeDefinition
	const path = resolve(__dirname, "..", "src", "themes", `${file}.ts`);
	const mod = await import(path);
	// The default export is the ThemeDefinition
	return (mod as any).default as ThemeDefinition;
}

async function main() {
	const outDir = resolve(__dirname, "..", "dist", "previews");
	// Ensure output directory exists
	try {
		require("fs").mkdirSync(outDir, { recursive: true });
	} catch (_) {}
	// Map to store safe filenames for each theme
	const safeNameMap = new Map<string, string>();
	for (const file of themeFiles) {
		const theme = await loadTheme(file);
		const html = generatePreviewHTML(theme);
		// Sanitize the theme name for filesystem usage
		const safeName = theme.name.replace(/[^\w-]/g, "_");
		const htmlPath = resolve(outDir, `${safeName}.html`);
		writeFileSync(htmlPath, html);
		console.log(`Generated HTML preview: ${htmlPath}`);
		// Record safe name for screenshot step
		safeNameMap.set(file, safeName);
	}

	// Use Playwright to capture screenshots
	console.log("Launching Playwright to capture screenshots...");
	// Install playwright if not present
	try {
		execSync("bunx playwright install chromium", { stdio: "ignore" });
	} catch (e) {
		console.error("Failed to install Playwright", e);
	}
	// @ts-expect-error: dynamic import of playwright without types
	const { chromium } = (await import("playwright")) as any;
	const browser = await chromium.launch();
	const context = await browser.newContext({
		viewport: { width: 1400, height: 900 },
	});
	const page = await context.newPage();
	for (const file of themeFiles) {
		const safeName = safeNameMap.get(file) || file;
		const htmlPath = `file://${outDir}/${safeName}.html`;
		await page.goto(htmlPath);
		await page.waitForLoadState("networkidle");
		const screenshotPath = resolve(outDir, `${safeName}.png`);
		await page.screenshot({ path: screenshotPath, fullPage: true });
		console.log(`Captured screenshot: ${screenshotPath}`);
	}
	await browser.close();
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
