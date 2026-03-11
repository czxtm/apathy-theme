import { mapZed } from "../src/integrations/zed";
import { mintedTheory } from "../src/themes/mintedTheory";
import { describeColorSpec } from "./color-spec";
import { expectedZed } from "./specs/minted-theory.zed.spec";

describeColorSpec(
	"Minted Theory Zed theme",
	() => mapZed(mintedTheory).themes[0],
	expectedZed,
	{ colorThreshold: 5, alphaThreshold: 0.05 },
);
