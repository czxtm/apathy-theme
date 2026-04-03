import { mapZed } from "../src/integrations/zed";
import { apathy } from "../src/themes/apathy";
import { describeColorSpec } from "./color-spec";
import { expectedZed } from "./specs/apathy.spec";

describeColorSpec(
	"Apathy Zed theme",
	() => mapZed(apathy),
	expectedZed,
);
