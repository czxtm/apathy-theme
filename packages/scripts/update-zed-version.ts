export {};

const version = Bun.argv[2];

if (!version) {
	console.error("Usage: bun run packages/scripts/update-zed-version.ts <version>");
	process.exit(1);
}

const extensionToml = Bun.file("./packages/zed/extension.toml");
const original = await extensionToml.text();
const replacement = original.replace(/^version = ".*"$/m, `version = "${version}"`);

if (replacement === original) {
	console.error("Could not update version in packages/zed/extension.toml");
	process.exit(1);
}

await Bun.write("./packages/zed/extension.toml", replacement);
console.log(`Updated packages/zed/extension.toml to ${version}`);
