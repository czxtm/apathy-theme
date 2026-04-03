import { mapZed } from "../src/integrations/zed";
import { expected as mintedVSCode } from "./specs/minted.vscode.spec"
import { mintedTheory } from "../src/themes/mintedTheory";
import { expectedZed as expectedZedTheory } from "./specs/minted-theory.zed.spec";
import { expectedZed as expectedZedMinted } from "./specs/minted.zed.spec";
import { expected as expectedStorm } from "./specs/storm.vscode.spec";
import { minted } from "../src/themes/minted";
import { apatheticOcean } from "../src/themes/apatheticOcean";
import { mapVSCode } from "../src/integrations/vscode";
import { describeColorSpec } from "./color-spec";
import { describe } from "bun:test";


type Test = {
	label: string;
	generate: () => unknown;
	expected: unknown;
}

const tests: Test[] = [
	{
		label: "Minted Theory Zed theme",
		generate: () => mapZed(mintedTheory).themes[0],
		expected: expectedZedTheory
	},

	{
		label: "Minted Zed theme",
		generate: () => mapZed(minted).themes[0],
		expected: expectedZedMinted
	},


	{
		label: "Minted VSCode theme",
		generate: () => mapVSCode(minted),
		expected: mintedVSCode
	},


	{
		label: "Storm",
		generate: () => mapVSCode(apatheticOcean),
		expected: expectedStorm
	},
]

for (const test of tests) {
	describe(test.label, () => {
		describeColorSpec(test.label, test.generate, test.expected);
	});
}