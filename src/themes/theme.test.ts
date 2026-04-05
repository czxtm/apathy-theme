import { expect, test } from "bun:test";
import { p } from "./mintedBase";
import { getThemeValue, toHex } from "./types";

test("path value retrieval with defaults", async () => {
	const { minted } = await import("./minted");
	const c = getThemeValue(minted, "tokens.types");
	expect(c).toBe(toHex(p.ice));
});
