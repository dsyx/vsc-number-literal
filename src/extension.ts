import * as vscode from "vscode";
import { getUserInputs, replaceUserInputs } from "./utils";
import { Type, Base, Literal } from "./literal";
import { Parser } from "./parser";
import { DefaultParser } from "./defaultImpl";
import { Style, Alignment, Text, Table } from "./markdown";

function makeHoverMessage(literal: Literal): vscode.MarkdownString | undefined {
  const table = new Table(["", ""], [Alignment.left, Alignment.right]);

  if (literal.type === Type.int) {
    const format = (label: string, base: Base) => {
      const labelText = `${new Text(label, Style.code)}`;
      const valueText = `${new Text(literal.toString(base), Style.code)}`;

      return literal.base === base
        ? [`${new Text(labelText, Style.bold)}`, `${new Text(valueText, Style.bold)}`]
        : [labelText, valueText];
    };

    table.addBodies([
      format("BIN", Base.bin),
      format("OCT", Base.oct),
      format("DEC", Base.dec),
      format("HEX", Base.hex),
    ]);
  } else if (literal.type === Type.flt) {
    const format = (label: string, isSci: boolean) => {
      const labelText = `${new Text(label, Style.code)}`;
      const valueText = `${new Text(isSci ? literal.toSci() : literal.toString(), Style.code)}`;

      return literal.isSci === isSci
        ? [`${new Text(labelText, Style.bold)}`, `${new Text(valueText, Style.bold)}`]
        : [labelText, valueText];
    };

    table.addBodies([format("DEC", false), format("SCI", true)]);
  }

  return table.isBodiesEmpty() ? undefined : new vscode.MarkdownString(table.toString());
}

export function activate(context: vscode.ExtensionContext) {
  // Initialize Parsers
  const parsers: Parser[] = [new DefaultParser()];
  const languageParserMap = new Map<string, Parser>();
  parsers.forEach((parser) => {
    parser.supportedLanguages.forEach((lang) => {
      if (!languageParserMap.has(lang)) {
        languageParserMap.set(lang, parser);
      }
    });
  });

  // Provides hover information for number literals.
  const provideHover = (
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.Hover> => {
    const parser = languageParserMap.get(document.languageId) ?? languageParserMap.get("*")!;

    const regex = parser.getSyntaxRegex();
    const range = document.getWordRangeAtPosition(position, regex);
    if (!range) {
      return undefined;
    }

    const word = document.getText(range);
    const literal = parser.parse(word);
    if (!literal) {
      return undefined;
    }

    const hoverMessage = makeHoverMessage(literal);
    return hoverMessage ? new vscode.Hover(hoverMessage) : undefined;
  };

  // Register the hover provider
  const hoverProvider = vscode.languages.registerHoverProvider({ scheme: "file" }, { provideHover });

  // Converts the selected number literals to the specified base.
  const convertCmdHandler = (editor: vscode.TextEditor, base: Base): void => {
    const parser = languageParserMap.get(editor.document.languageId) ?? languageParserMap.get("*")!;

    const inputs = getUserInputs(editor, parser.getSyntaxRegex());
    if (inputs.length === 0) {
      return;
    }

    const outputs = inputs.map((input) => {
      const literal = parser.parse(input);
      return literal && literal.type === Type.int ? literal.toString(base, true) : input;
    });

    replaceUserInputs(editor, parser.getSyntaxRegex(), outputs);
  };

  // Define the command handlers
  const commandHandlers = [
    { base: Base.bin, command: "number-literal.convertToBinary" },
    { base: Base.oct, command: "number-literal.convertToOctal" },
    { base: Base.dec, command: "number-literal.convertToDecimal" },
    { base: Base.hex, command: "number-literal.convertToHexadecimal" },
  ];

  // Register the commands
  const commands = commandHandlers.map(({ base, command }) =>
    vscode.commands.registerTextEditorCommand(command, (editor) => {
      convertCmdHandler(editor, base);
    })
  );

  // Add the disposables to the context
  context.subscriptions.push(hoverProvider, ...commands);
}

export function deactivate() {}
