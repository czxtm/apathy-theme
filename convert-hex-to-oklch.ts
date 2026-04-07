// Script to convert hex color literals in mintedTheory.ts to oklch calls
import { readFileSync, writeFileSync } from "fs";
import { Color } from "./src/core/color";

const filePath = "./src/themes/mintedTheory.ts";
let content = readFileSync(filePath, "utf8");

const hexRegex = /#([0-9A-Fa-f]{3,8})/g;

function formatNumber(num: number, decimals: number) {
	return Number(num.toFixed(decimals));
}

content = content.replace(hexRegex, (match) => {
	// Preserve original case for short hex like #fff? We'll convert any.
	const color = new Color(match);
	const { l, c, h, alpha } = color.oklch();
	const lStr = formatNumber(l, 3);
	const cStr = formatNumber(c, 3);
	const hStr = formatNumber(h, 1);
	const aStr = formatNumber(alpha, 3);
	return `oklch(${lStr}, ${cStr}, ${hStr}, ${aStr})`;
});

writeFileSync(filePath, content);
console.log("Conversion complete");
