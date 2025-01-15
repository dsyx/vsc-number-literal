import { Type, Base, Literal } from "./literal";
import { Parser } from "./parser";

class DefaultLiteral implements Literal {
  constructor(
    public readonly type: Type,
    public readonly base: Base,
    public readonly value: bigint | number,
    public readonly isSci: boolean = false
  ) {}

  toString(base: Base = this.base, prefixed: boolean = false): string {
    // Only decimal base is supported for floating-point literals
    if (this.type === Type.flt) {
      return this.value.toString();
    }

    const str = this.value.toString(base).toUpperCase();
    return prefixed ? `${DefaultLiteral.prefixMap[base]}${str}` : str;
  }

  toSci(): string {
    return this.type === Type.int ? this.value.toString().toUpperCase() : (this.value as number).toExponential();
  }

  private static readonly prefixMap: Record<Base, string> = {
    [Base.bin]: "0b",
    [Base.oct]: "0o",
    [Base.dec]: "",
    [Base.hex]: "0x",
  };
}

export class DefaultParser implements Parser {
  readonly supportedLanguages = ["*"];
  readonly wordRegex =
    /\b0[bB][01](_?[01])*\b|\b0[oO][0-7](_?[0-7])*\b|\b0[xX][0-9a-fA-F](_?[0-9a-fA-F])*\b|\b\d+([_,]?\d+)*(\.\d+([_,]?\d+)*)?([eE][-+]?\d+)?\b/;

  parse(text: string): Literal | undefined {
    const normalizedText = text.replace(/,|_/g, "");

    for (const parser of DefaultParser.parseHanders) {
      if (parser.regex.test(normalizedText)) {
        return parser.handler(normalizedText);
      }
    }

    return undefined;
  }

  public static getInstance(): DefaultParser {
    if (!DefaultParser.instance) {
      DefaultParser.instance = new DefaultParser();
    }
    return DefaultParser.instance;
  }

  private constructor() {}

  private static instance: DefaultParser;
  private static readonly intBinRegex = /^0[bB][01](_?[01])*$/;
  private static readonly intOctRegex = /^0[oO][0-7](_?[0-7])*$/;
  private static readonly intDecRegex = /^\d+([_,]?\d+)*$/;
  private static readonly intHexRegex = /^0[xX][0-9a-fA-F](_?[0-9a-fA-F])*$/;
  private static readonly fltDecRegex = /^\d+([_,]?\d+)*(\.\d+([_,]?\d+)*)?([eE][-+]?\d+)?$/;
  private static readonly parseHanders = [
    {
      regex: DefaultParser.intBinRegex,
      handler: (text: string) => new DefaultLiteral(Type.int, Base.bin, BigInt(text)),
    },
    {
      regex: DefaultParser.intOctRegex,
      handler: (text: string) => new DefaultLiteral(Type.int, Base.oct, BigInt(text)),
    },
    {
      regex: DefaultParser.intDecRegex,
      handler: (text: string) => new DefaultLiteral(Type.int, Base.dec, BigInt(text)),
    },
    {
      regex: DefaultParser.intHexRegex,
      handler: (text: string) => new DefaultLiteral(Type.int, Base.hex, BigInt(text)),
    },
    {
      regex: DefaultParser.fltDecRegex,
      handler: (text: string) => new DefaultLiteral(Type.flt, Base.dec, Number(text), /[eE]/.test(text)),
    },
  ];
}
