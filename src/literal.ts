const LITERAL_REGEX = /(0b[01]+|0o[0-7]+|0x[0-9a-fA-F]+|\d+(\.\d+)?(e[+-]?\d+)?)/i;

const BINARY_INTEGER_REGEX = /^0b[01]+$/i;
const OCTAL_INTEGER_REGEX = /^0o[0-7]+$/i;
const DECIMAL_INTEGER_REGEX = /^\d+$/;
const HEXADECIMAL_INTEGER_REGEX = /^0x[0-9a-fA-F]+$/i;

const DECIMAL_FLOAT_REGEX = /^(\d+\.\d+|\d+(\.\d+)?e[+-]?\d+)$/i;

export const enum LiteralType {
    integer,
    float,
}

export const enum LiteralBase {
    binary = 2,
    octal = 8,
    decimal = 10,
    hexadecimal = 16,
}

export class LiteralSyntaxError extends Error {
    public constructor(s: string) {
        super(`'${s}' does not conform to the literal syntax.`);
        this.name = 'LiteralSyntaxError';
    }
}

export class Literal {
    public readonly literal: string;
    public readonly type: LiteralType;
    public readonly base: LiteralBase;
    public readonly value: bigint | number;

    public constructor(literal: string) {
        this.literal = literal;

        if (BINARY_INTEGER_REGEX.test(this.literal)) {
            this.type = LiteralType.integer;
            this.base = LiteralBase.binary;
        } else if (OCTAL_INTEGER_REGEX.test(this.literal)) {
            this.type = LiteralType.integer;
            this.base = LiteralBase.octal;
        } else if (DECIMAL_INTEGER_REGEX.test(this.literal)) {
            this.type = LiteralType.integer;
            this.base = LiteralBase.decimal;
        } else if (HEXADECIMAL_INTEGER_REGEX.test(this.literal)) {
            this.type = LiteralType.integer;
            this.base = LiteralBase.hexadecimal;
        } else if (DECIMAL_FLOAT_REGEX.test(this.literal)) {
            this.type = LiteralType.float;
            this.base = LiteralBase.decimal;
        } else {
            throw new LiteralSyntaxError(this.literal);
        }

        if (this.type === LiteralType.integer) {
            this.value = BigInt(this.literal);
        } else {
            this.value = Number(this.literal);
        }
    }

    public toString(base: LiteralBase = LiteralBase.decimal, prefixed?: boolean): string {
        // Currently only decimal floats are supported.
        if (this.type !== LiteralType.integer && base !== LiteralBase.decimal) {
            return "";
        }

        return prefixed ?
            `${Literal.getPrefix(base)}${this.value.toString(base).toUpperCase()}` :
            `${this.value.toString(base).toUpperCase()}`;
    }

    public toScientificNotation(base: LiteralBase = LiteralBase.decimal): string {
        // Currently only scientific notation in base 10 is supported.
        if (base !== LiteralBase.decimal) {
            return "";
        }

        return (this.value as number).toExponential();
    }

    public static getSyntaxRegex(): RegExp {
        return LITERAL_REGEX;
    }

    public static getPrefix(base: LiteralBase): string {
        switch (base) {
            case LiteralBase.binary:
                return "0b";
            case LiteralBase.octal:
                return "0o";
            case LiteralBase.decimal:
                return "";
            case LiteralBase.hexadecimal:
                return "0x";
            default:
                return "";
        }
    }
}