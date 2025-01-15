import * as vscode from "vscode";

export function getUserInputs(editor: vscode.TextEditor, regex?: RegExp): string[] {
  return editor.selections.map((selection) => {
    const range = selection.isEmpty ? editor.document.getWordRangeAtPosition(selection.active, regex) : selection;
    return range ? editor.document.getText(range) : "";
  });
}

export async function replaceUserInputs(editor: vscode.TextEditor, replacements: string[], regex?: RegExp) {
  if (editor.selections.length !== replacements.length) {
    throw new Error(
      `replaceUserInputs: selection count mismatch (${editor.selections.length} != ${replacements.length})`
    );
  }

  const newSelections: vscode.Selection[] = [];

  await editor.edit((editBuilder) => {
    for (let i = 0; i < editor.selections.length; i++) {
      const selection = editor.selections[i];
      const replacement = replacements[i];
      const range = selection.isEmpty ? editor.document.getWordRangeAtPosition(selection.active, regex) : selection;
      if (range) {
        editBuilder.replace(range, replacement);
        newSelections.push(new vscode.Selection(range.start, range.start.translate(0, replacement.length)));
      } else {
        newSelections.push(selection);
      }
    }
  });

  editor.selections = newSelections;
}
