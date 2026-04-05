/**
 * Script to generate TypeScript types from VS Code's color registry.
 *
 * Run with: bun scripts/generate-vscode-tokens.ts
 *
 * This fetches the latest color definitions from VS Code's GitHub repo
 * and generates a TypeScript union type of all valid workbench color tokens.
 */

const VSCODE_COLOR_FILES = [
	"https://raw.githubusercontent.com/microsoft/vscode/main/src/vs/platform/theme/common/colors/baseColors.ts",
	"https://raw.githubusercontent.com/microsoft/vscode/main/src/vs/platform/theme/common/colors/editorColors.ts",
	"https://raw.githubusercontent.com/microsoft/vscode/main/src/vs/platform/theme/common/colors/inputColors.ts",
	"https://raw.githubusercontent.com/microsoft/vscode/main/src/vs/platform/theme/common/colors/listColors.ts",
	"https://raw.githubusercontent.com/microsoft/vscode/main/src/vs/platform/theme/common/colors/menuColors.ts",
	"https://raw.githubusercontent.com/microsoft/vscode/main/src/vs/platform/theme/common/colors/minimapColors.ts",
	"https://raw.githubusercontent.com/microsoft/vscode/main/src/vs/platform/theme/common/colors/miscColors.ts",
	"https://raw.githubusercontent.com/microsoft/vscode/main/src/vs/platform/theme/common/colors/quickpickColors.ts",
	"https://raw.githubusercontent.com/microsoft/vscode/main/src/vs/platform/theme/common/colors/searchColors.ts",
	"https://raw.githubusercontent.com/microsoft/vscode/main/src/vs/platform/theme/common/colors/chartsColors.ts",
];

// Additional files from workbench that define more colors
const WORKBENCH_COLOR_FILES = [
	"https://raw.githubusercontent.com/microsoft/vscode/main/src/vs/workbench/common/theme.ts",
];

async function fetchColorTokens(): Promise<string[]> {
	const tokens = new Set<string>();

	// Regex to match registerColor('token.name', ...)
	const registerColorRegex = /registerColor\s*\(\s*['"`]([^'"`]+)['"`]/g;

	const allUrls = [...VSCODE_COLOR_FILES, ...WORKBENCH_COLOR_FILES];

	for (const url of allUrls) {
		try {
			const response = await fetch(url);
			if (!response.ok) {
				console.warn(`Failed to fetch ${url}: ${response.status}`);
				continue;
			}
			const content = await response.text();

			let match;
			while ((match = registerColorRegex.exec(content)) !== null) {
				tokens.add(match[1]);
			}
		} catch (error) {
			console.warn(`Error fetching ${url}:`, error);
		}
	}

	return Array.from(tokens).sort();
}

async function generateTypeFile(tokens: string[]): Promise<string> {
	const tokenLines = tokens.map((t) => `  | "${t}"`).join("\n");

	return `/**
 * Auto-generated VS Code workbench color tokens.
 * 
 * Generated from VS Code source at: ${new Date().toISOString()}
 * 
 * To regenerate, run: bun scripts/generate-vscode-tokens.ts
 */

/**
 * All valid VS Code workbench color tokens.
 * These are the keys you can use in a theme's "colors" object.
 */
export type VSCodeColorToken =
${tokenLines};

/**
 * A record type for theme colors
 */
export type VSCodeColors = Partial<Record<VSCodeColorToken, string>>;
`;
}

async function main() {
	console.log("Fetching VS Code color tokens...");
	const tokens = await fetchColorTokens();
	console.log(`Found ${tokens.length} color tokens`);

	const typeFile = await generateTypeFile(tokens);

	const outputPath = new URL("../src/types/vscodeTokens.ts", import.meta.url)
		.pathname;

	await Bun.write(outputPath, typeFile);
	console.log(`Generated types at: ${outputPath}`);
}

main().catch(console.error);
