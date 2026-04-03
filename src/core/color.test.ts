import { expect, test } from "bun:test";
import { oklch, toHex } from "./color";

test("supports OKLCH input and explicit render()", () => {
  const color = oklch(0.72, 0.14, 248, 0.82);
  const rendered = color.render();
  expect(rendered).toMatch(/^#[0-9a-fA-F]{8}$/);
  expect(toHex(color)).toBe(rendered);
});

test("chains transformations in OKLCH space", () => {
  const color = oklch(0.64, 0.12, 220, 1)
    .rotate(18)
    .saturate(0.2)
    .lighter(0.08)
    .alpha(0.9);
  expect(color.render()).toMatch(/^#[0-9a-fA-F]{8}$/);
});
