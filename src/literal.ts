const LITERAL_REGEX = /[+-]?(0b[01]+|0o[0-7]+|0x[0-9a-fA-F]+|\d+(\.\d+)?(e[+-]?\d+)?)/i;

const BINARY_INTEGER_REGEX = /^[+-]?0b[01]+$/i;
const OCTAL_INTEGER_REGEX = /^[+-]?0o[0-7]+$/i;
const DECIMAL_INTEGER_REGEX = /^[+-]?\d+$/;
const HEXADECIMAL_INTEGER_REGEX = /^[+-]?0x[0-9a-fA-F]+$/i;

const DECIMAL_FLOAT_REGEX = /^[+-]?(\d+\.\d+|\d+(\.\d+)?e[+-]?\d+)$/i;

function isBinaryInteger(s: string): boolean {
    return BINARY_INTEGER_REGEX.test(s);
}

function isOctalInteger(s: string): boolean {
    return OCTAL_INTEGER_REGEX.test(s);
}

function isDecimalInteger(s: string): boolean {
    return DECIMAL_INTEGER_REGEX.test(s);
}

function isHexadecimalInteger(s: string): boolean {
    return HEXADECIMAL_INTEGER_REGEX.test(s);
}

function isDecimalFloat(s: string): boolean {
    return DECIMAL_FLOAT_REGEX.test(s);
}

export const enum LiteralType {
    integer,
    float,
}

export const enum LiteralBase {
    binary,
    octal,
    decimal,
    hexadecimal,
}

export class UnsupportedLiteralSyntaxError extends Error {
    public constructor() {
        super("UnsupportedLiteralSyntaxError");
        this.name = 'UnsupportedLiteralSyntaxError';
    }
}

export class Literal {
    public readonly type: LiteralType;
    public readonly base: LiteralBase;
    public readonly literal: string;
    public readonly value: bigint | number;

    public constructor(literal: string) {
        this.literal = literal;

        if (isBinaryInteger(this.literal)) {
            this.type = LiteralType.integer;
            this.base = LiteralBase.binary;
        } else if (isOctalInteger(this.literal)) {
            this.type = LiteralType.integer;
            this.base = LiteralBase.octal;
        } else if (isDecimalInteger(this.literal)) {
            this.type = LiteralType.integer;
            this.base = LiteralBase.decimal;
        } else if (isHexadecimalInteger(this.literal)) {
            this.type = LiteralType.integer;
            this.base = LiteralBase.hexadecimal;
        } else if (isDecimalFloat(this.literal)) {
            this.type = LiteralType.float;
            this.base = LiteralBase.decimal;
        } else {
            throw new UnsupportedLiteralSyntaxError();
        }

        if (this.type === LiteralType.integer) {
            this.value = BigInt(this.literal);
        } else {
            this.value = Number(this.literal);
        }
    }

    public toBinary(prefixed?: boolean): string {
        return this.type === LiteralType.integer ?
            `${prefixed ? Literal.binaryPrefix() : ""}${this.value.toString(2)}` : "";
    }

    public toOctal(prefixed?: boolean): string {
        return this.type === LiteralType.integer ?
            `${prefixed ? Literal.octalPrefix() : ""}${this.value.toString(8)}` : "";
    }

    public toDecimal(prefixed?: boolean): string {
        return `${prefixed ? Literal.decimalPrefix() : ""}${this.value.toString(10)}`;
    }

    public toHexadecimal(prefixed?: boolean): string {
        return this.type === LiteralType.integer ?
            `${prefixed ? Literal.hexadecimalPrefix() : ""}${this.value.toString(16).toUpperCase()}` : "";
    }

    public static syntaxRegex(): RegExp {
        return LITERAL_REGEX;
    }

    private static binaryPrefix(): string {
        return "0b";
    }

    private static octalPrefix(): string {
        return "0o";
    }

    private static decimalPrefix(): string {
        return "";
    }

    private static hexadecimalPrefix(): string {
        return "0x";
    }
}