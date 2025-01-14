import { Literal } from "./literal";

export interface Parser {
  readonly supportedLanguages: string[];
  getSyntaxRegex(): RegExp;
  parse(text: string): Literal | undefined;
}
