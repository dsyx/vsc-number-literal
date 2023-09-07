import * as vscode from "vscode";
import * as literal from "./literal";
import * as md from "./markdown";

function makeLiteralHoverMessage(l: literal.Literal): vscode.MarkdownString | undefined {
	const table = new md.MarkdownTableBuilder(["", ""]);
	table.changeAlignments([md.Alignment.left, md.Alignment.right]);
	switch (l.type) {
		case literal.LiteralType.integer:
			table.addRow([l.base === literal.LiteralBase.binary ? md.makeBold("BIN") : "BIN", md.makeCode(l.toString(literal.LiteralBase.binary))]);
			table.addRow([l.base === literal.LiteralBase.octal ? md.makeBold("OCT") : "OCT", md.makeCode(l.toString(literal.LiteralBase.octal))]);
			table.addRow([l.base === literal.LiteralBase.decimal ? md.makeBold("DEC") : "DEC", md.makeCode(l.toString(literal.LiteralBase.decimal))]);
			table.addRow([l.base === literal.LiteralBase.hexadecimal ? md.makeBold("HEX") : "HEX", md.makeCode(l.toString(literal.LiteralBase.hexadecimal))]);
			break;
		case literal.LiteralType.float:
			table.addRow([!l.literal.toLowerCase().includes("e") ? md.makeBold("DEC") : "DEC", md.makeCode(l.toString())]);
			table.addRow([l.literal.toLowerCase().includes("e") ? md.makeBold("SCI") : "SCI", md.makeCode(l.toScientificNotation())]);
			break;
		default:
			break;
	}

	if (table.bodyIsEmpty()) {
		return;
	}
	return new vscode.MarkdownString(table.build());
}

function provideHover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Hover> {
	const regex = literal.Literal.getSyntaxRegex();
	const range = document.getWordRangeAtPosition(position, regex);
	if (!range) {
		return;
	}

	const word = document.getText(range);
	try {
		const l = new literal.Literal(word);
		const hoverMessage = makeLiteralHoverMessage(l);
		return hoverMessage ? new vscode.Hover(hoverMessage) : undefined;
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
