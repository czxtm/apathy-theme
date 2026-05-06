import { describe, expect, test } from "bun:test";
import { mapObsidianPublish } from "../src/integrations/obsidianPublish";
import { minted } from "../src/themes/minted";

describe("obsidian publish", () => {
	test("generates publish css from theme tokens and the publish reference layout", async () => {
		const css = await mapObsidianPublish(minted);

		expect(css).toContain("apathy /// minted Theme for Obsidian Publish");
		expect(css).toContain("--font-text-size: 16px;");
		expect(css).toContain("--background-primary: #0c0c13ff;");
		expect(css).toContain("--text-normal: #7b8ab1b5;");
		expect(css).toContain("--color-red-rgb: 217, 106, 146;");
		expect(css).toContain("body.theme-light.apathy-publish-theme-apathy-minted,");
		expect(css).toContain("--image-grid-fit: var(--img-grid-fit);");
		expect(css).toContain("--image-grid-background: var(--img-grid-background);");
		expect(css).toContain(".published-container {");
		expect(css).toContain("--sidebar-left-background: var(--bg2);");
		expect(css).toContain(".cards table {");
		expect(css).toContain(".img-grid .markdown-preview-section");
		expect(css).toContain(".markdown-preview-view table {");
	});
});
