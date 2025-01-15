import { Literal } from "./literal";

export interface Parser {
  readonly supportedLanguages: string[];
  readonly wordRegex: RegExp | undefined;
  parse(text: string): Literal | undefined;
}
