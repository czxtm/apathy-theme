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
    label: "zed / minted-theory",
    generate: () => mapZed(mintedTheory).themes[0],
    expected: expectedZedTheory,
  },

  {
    label: "zed / minted",
    generate: () => mapZed(minted).themes[0],
    expected: expectedZedMinted,
  },

  {
    label: "vscode / minted",
    generate: () => mapVSCode(minted),
    expected: mintedVSCode,
  },

  {
    label: "vscode / apatheticOcean",
    generate: () => mapVSCode(apatheticOcean),
    expected: expectedStorm,
  },
  {
    label: "zed / apathy",
    generate: () => mapZed(apathy),
    expected: expectedZed,
  },
  {
    label: "vscode / apathy",
    generate: () => mapVSCode(apathy),
    expected: expectedVSCode,
  },
];

for (const test of tests) {
  describe(test.label, () => {
    describeColorSpec(test.label, test.generate, test.expected);
  });
}
