import * as vscode from "vscode";
import {
	ApathySemanticTokensProvider,
	getSemanticTokensLegend,
} from "./semanticTokenProvider";

/**
 * Extension activation
 * This function is called when the extension is activated.
 */
export function activate(context: vscode.ExtensionContext) {
	console.log("Apathy Theme extension is now active!");

	// Register Semantic Token Provider
	// You can add language selectors for specific languages
	const semanticTokenProvider =
		vscode.languages.registerDocumentSemanticTokensProvider(
			[
				{ language: "typescript" },
				{ language: "javascript" },
				{ language: "python" },
				{ language: "java" },
				{ language: "cpp" },
				{ language: "rust" },
				// Add more languages as needed
			],
			new ApathySemanticTokensProvider(),
			getSemanticTokensLegend(),
		);

	context.subscriptions.push(semanticTokenProvider);

	// File Icon Theme and Product Icon Theme are registered via package.json contributions
	// No additional code needed here for those providers

	console.log("Apathy Theme: All providers registered successfully");
}

/**
 * Extension deactivation
 * This function is called when the extension is deactivated.
 */
export function deactivate() {
	console.log("Apathy Theme extension deactivated");
}
