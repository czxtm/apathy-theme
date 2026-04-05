import { describe } from "bun:test";
import { mapVSCode } from "../src/integrations/vscode";
import { mapZed } from "../src/integrations/zed";
import { apatheticOcean } from "../src/themes/apatheticOcean";
import { apathy } from "../src/themes/apathy";
import { minted } from "../src/themes/minted";
import { mintedTheory } from "../src/themes/mintedTheory";
import { describeColorSpec } from "./color-spec";
import { expected as expectedVSCode } from "./specs/apathy.vscode.spec";
import { expectedZed } from "./specs/apathy.zed.spec";
import { expected as mintedVSCode } from "./specs/minted.vscode.spec";
import { expectedZed as expectedZedMinted } from "./specs/minted.zed.spec";
import { expectedZed as expectedZedTheory } from "./specs/minted-theory.zed.spec";
import { expected as expectedStorm } from "./specs/storm.vscode.spec";

type Test = {
	label: string;
	generate: () => unknown;
	expected: unknown;
};

const tests: Test[] = [
	{
		label: "Minted Theory Zed theme",
		generate: () => mapZed(mintedTheory).themes[0],
		expected: expectedZedTheory,
	},

	{
		label: "Minted Zed theme",
		generate: () => mapZed(minted).themes[0],
		expected: expectedZedMinted,
	},

	{
		label: "Minted VSCode theme",
		generate: () => mapVSCode(minted),
		expected: mintedVSCode,
	},

	{
		label: "Ocean",
		generate: () => mapVSCode(apatheticOcean),
		expected: expectedStorm,
	},
	{
		label: "Apathy Zed theme",
		generate: () => mapZed(apathy),
		expected: expectedZed,
	},
	{
		label: "Apathy VSCode theme",
		generate: () => mapVSCode(apathy),
		expected: expectedVSCode,
	},
];

for (const test of tests) {
	describe(test.label, () => {
		describeColorSpec(test.label, test.generate, test.expected);
	});
}
