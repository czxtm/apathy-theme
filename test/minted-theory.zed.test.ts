import { mapZed } from "../src/integrations/zed";
import { mintedTheory } from "../src/themes/mintedTheory";
import { describeColorSpec } from "./color-spec";
import { expectedZed as expectedZedTheory } from "./specs/minted-theory.zed.spec";
import { expectedZed as expectedZedMinted } from "./specs/minted.zed.spec";
import { minted } from "../src/themes/minted";

describeColorSpec(
	"Minted Theory Zed theme",
	() => mapZed(mintedTheory).themes[0],
	expectedZedTheory,
	{ colorThreshold: 5, alphaThreshold: 0.05 },
);

// describeColorSpec(
// 	"Minted theme",
// 	() => mapZed(minted).themes[0],
// 	expectedZedMinted,
// 	{ colorThreshold: 5, alphaThreshold: 0.05 },
// );
