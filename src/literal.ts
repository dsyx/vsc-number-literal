export const enum Type {
  int,
  flt,
}

export const enum Base {
  bin = 2,
  oct = 8,
  dec = 10,
  hex = 16,
}

export interface Literal {
  readonly type: Type;
  readonly base: Base;
  readonly value: bigint | number;
  readonly isSci: boolean;
  toString(base?: Base, prefixed?: boolean): string;
  toSci(): string;
}
