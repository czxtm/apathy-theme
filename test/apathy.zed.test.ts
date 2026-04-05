import { mapVSCode } from "../src/integrations/vscode";
import { mapZed } from "../src/integrations/zed";
import { apathy } from "../src/themes/apathy";
import { describeColorSpec } from "./color-spec";
import { expected as expectedVSCode } from "./specs/apathy.vscode.spec";
import { expectedZed } from "./specs/apathy.zed.spec";

describeColorSpec("Apathy Zed theme", () => mapZed(apathy), expectedZed);

describeColorSpec(
	"Apathy VSCode theme",
	() => mapVSCode(apathy),
	expectedVSCode,
);
