import { expect, test } from "bun:test";
import { getThemeValue, toHex } from "./types";

test("path value retrieval with defaults", async () => {
	const { minted } = await import("./minted");
	const c = getThemeValue(minted, "tokens.types");
	expect(c).toBe(toHex(minted.tokens.types.default));
});
