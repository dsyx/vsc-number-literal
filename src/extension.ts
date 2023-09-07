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

async function replaceUserInput(outputs: Array<string>) {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		return;
	}

	const selections = editor.selections;
	if (outputs.length !== selections.length) {
		return;
	}

	const document = editor.document;
	const edit = new vscode.WorkspaceEdit();
	const newSelections: vscode.Selection[] = [];
	for (let i = 0; i < selections.length; i++) {
		const selection = selections[i];
		const output = outputs[i];

		if (selection.isEmpty) {
			const position = selection.active;
			const regex = literal.Literal.getSyntaxRegex();
			const range = document.getWordRangeAtPosition(position, regex);
			if (range) {
				edit.replace(document.uri, range, output);
				newSelections.push(new vscode.Selection(range.start, range.start.translate(0, output.length)));
			} else {
				newSelections.push(selection);
			}
		} else {
			edit.replace(document.uri, selection, output);
			newSelections.push(new vscode.Selection(selection.start, selection.start.translate(0, output.length)));
		}
	}

	await vscode.workspace.applyEdit(edit);
	editor.selections = newSelections;
}

function getUserInput(): Array<string> {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		return [];
	}

	const document = editor.document;
	const selections = editor.selections;
	return selections.map((selection) => {
		if (selection.isEmpty) {
			const position = selection.active;
			const regex = literal.Literal.getSyntaxRegex();
			const range = document.getWordRangeAtPosition(position, regex);
			if (range) {
				return document.getText(range);
			} else {
				return "";
			}
		} else {
			return document.getText(selection);
		}
	});
}

function literalConversionHandler(base: literal.LiteralBase): void {
	const inputs = getUserInput();
	if (inputs.length === 0) {
		return;
	}

	try {
		const outputs = inputs.map((input) => {
			const l = new literal.Literal(input);
			return l.type === literal.LiteralType.integer ? l.toString(base, true) : input;
		});

		replaceUserInput(outputs);
	} catch (e) {
		console.log(e);
	}
}

export function activate(context: vscode.ExtensionContext) {
	const disposables: Array<vscode.Disposable> = [];

	const provider = vscode.languages.registerHoverProvider({ scheme: "file" }, { provideHover });
	disposables.push(provider);

	const commands = [
		{ name: "number-literal.convertToBinary", callback: () => literalConversionHandler(literal.LiteralBase.binary) },
		{ name: "number-literal.convertToOctal", callback: () => literalConversionHandler(literal.LiteralBase.octal) },
		{ name: "number-literal.convertToDecimal", callback: () => literalConversionHandler(literal.LiteralBase.decimal) },
		{ name: "number-literal.convertToHexadecimal", callback: () => literalConversionHandler(literal.LiteralBase.hexadecimal) }
	];
	commands.forEach(command => {
		disposables.push(vscode.commands.registerCommand(command.name, command.callback));
	});

	context.subscriptions.push(...disposables);
}

export function deactivate() { }
