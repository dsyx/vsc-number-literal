import * as vscode from "vscode";
import * as literal from "./literal";
import * as md from "./markdown";

function provideHover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Hover> {
	const regex = literal.Literal.syntaxRegex();
	const range = document.getWordRangeAtPosition(position, regex);
	if (!range) {
		return;
	}

	const word = document.getText(range);
	try {
		const n = new literal.Literal(word);
		if (n.type === literal.LiteralType.integer) {
			const m = new md.MarkdownTableBuilder(["Base", "Value"]);
			m.changeAlignments([md.Alignment.left, md.Alignment.right]);
			m.addRow([n.base === literal.LiteralBase.binary ? "**BIN**" : "BIN", `\`${n.toBinary()}\``]);
			m.addRow([n.base === literal.LiteralBase.octal ? "**OCT**" : "OCT", `\`${n.toOctal()}\``]);
			m.addRow([n.base === literal.LiteralBase.decimal ? "**DEC**" : "DEC", `\`${n.toDecimal()}\``]);
			m.addRow([n.base === literal.LiteralBase.hexadecimal ? "**HEX**" : "HEX", `\`${n.toHexadecimal()}\``]);
			const hoverMessage = new vscode.MarkdownString(m.build());
			return new vscode.Hover(hoverMessage);
		} else {
			return new vscode.Hover(word);
		}
	} catch (e) {
		console.log(e);
	}
	return;
}

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.languages.registerHoverProvider(
			{ scheme: "file" },
			{
				provideHover,
			}
		)
	);
}

export function deactivate() { }
