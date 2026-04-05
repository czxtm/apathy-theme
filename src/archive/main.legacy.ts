import * as bun from "bun";
import { buildVSCodeTheme } from "./integrations/vscode";
import {
	theme as apathyTheme,
	vscodeTheme as apathyVSCodeTheme,
} from "./themes/apathy";
import {
	theme as mintedTheme,
	vscodeTheme as mintedVSCodeTheme,
} from "./themes/minted";

async function bumpversion(part: "patch" | "minor" | "major") {
	const bumpType = part;
	if (!["patch", "minor", "major"].includes(bumpType)) {
		throw new Error("Invalid bump type. Use patch, minor, or major.");
	}
	const pkgPath = "./package.json";
	const pkg = await bun.file(pkgPath).json();
	const [major, minor, patch] = pkg.version.split(".").map(Number);
	let newVersion = "";
	if (bumpType === "patch") {
		newVersion = `${major}.${minor}.${patch + 1}`;
	} else if (bumpType === "minor") {
		newVersion = `${major}.${minor + 1}.0`;
	} else if (bumpType === "major") {
		newVersion = `${major + 1}.0.0`;
	}
	pkg.version = newVersion;
	await bun.write(pkgPath, JSON.stringify(pkg, null, 2));
	console.log(`Bumped version to ${newVersion}`);
	return;
}

interface ThemeConfig {
	name: string;
	outputPath: string;
	basePath?: string; // Path to existing JSON for migration
	theme: typeof mintedTheme;
	vscodeTheme: typeof mintedVSCodeTheme;
}

const themes: ThemeConfig[] = [
	{
		name: "Minted",
		outputPath: "./themes/minted.json",
		// Use existing JSONC as base for values not yet defined in code
		basePath: "./themes/minted.jsonc",
		theme: mintedTheme,
		vscodeTheme: mintedVSCodeTheme,
	},
	{
		name: "Apathy",
		outputPath: "./themes/Apathy-color-theme.json",
		basePath: "./themes/Apathy-color-theme.json",
		theme: apathyTheme,
		vscodeTheme: apathyVSCodeTheme,
	},
];

async function main() {
	const args = bun.argv.slice(2);

	if (args.includes("bump")) {
		const part = args[args.indexOf("bump") + 1] as "patch" | "minor" | "major";
		if (!part || !["patch", "minor", "major"].includes(part)) {
			throw new Error("Please specify bump type: patch, minor, or major.");
		}
		await bumpversion(part);
		return;
	}

	// Build all themes
	for (const config of themes) {
		const themeFile = buildVSCodeTheme(config.theme, config.vscodeTheme, {
			name: config.name,
			type: "dark",
			basePath: config.basePath,
		});

		await bun.write(config.outputPath, JSON.stringify(themeFile, null, "\t"));
		console.log(`Built theme: ${config.name} -> ${config.outputPath}`);

		if (config.basePath) {
			console.log(`  (migrated from ${config.basePath})`);
		}
	}
}

main()
	.then(() => console.log("Done!"))
	.catch((err) => console.error(err));
