import { describe, expect, test } from "bun:test";
import { mapObsidian } from "../src/integrations/obsidian";
import { mapObsidianPublish } from "../src/integrations/obsidianPublish";
import { minted } from "../src/themes/minted";

function expectStyleSettings(css: string): void {
	expect(css).toContain("/* @settings");
	expect(css).toContain("name: Apathy Theme");
	expect(css).toContain("id: apathy-theme");
	expect(css).toContain("Publish sites do not run community plugins");
	expect(css).toContain("id: font-text-size");
	expect(css).toContain("type: variable-number-slider");
	expect(css).toContain("id: callout-radius");
	expect(css).toContain("id: cards-image-fit");
	expect(css).toContain("type: variable-select");
	expect(css).toContain("id: img-grid-gap");
	expect(css).toContain("id: apathy-hide-title");
	expect(css).toContain("type: class-toggle");
}

describe("obsidian style settings", () => {
	test("app snippet includes Style Settings metadata", () => {
		const css = mapObsidian(minted);

		expectStyleSettings(css);
		expect(css).toContain("--cards-min-width: 180px;");
		expect(css).toContain("--img-grid-gap: 0.5rem;");
	});

	test("publish theme includes Style Settings metadata", async () => {
		expectStyleSettings(await mapObsidianPublish(minted));
	});
});
