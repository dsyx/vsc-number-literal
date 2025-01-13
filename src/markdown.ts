/**
 * Defines the styles applicable to text elements.
 */
export const enum Style {
  regular,
  bold,
  italic,
  code,
  strikethrough,
}

/**
 * Defines the possible alignments for table columns.
 */
export const enum Alignment {
  left,
  center,
  right,
}

/**
 * Represents a Markdown text.
 */
export class Text {
  private readonly text: string;
  private readonly style: Style;

  private static readonly styleMap: Record<Style, (text: string) => string> = {
    [Style.regular]: (text) => text,
    [Style.bold]: (text) => `**${text}**`,
    [Style.italic]: (text) => `*${text}*`,
    [Style.code]: (text) => `\`${text}\``,
    [Style.strikethrough]: (text) => `~~${text}~~`,
  };

  /**
   * Constructs a new Text instance.
   * @param text The text content.
   * @param style The style to apply (defaults to `Style.regular`).
   */
  public constructor(text: string, style: Style = Style.regular) {
    this.text = text;
    this.style = style;
  }

  /**
   * Returns the Markdown representation of the text with its applied style.
   */
  public toString(): string {
    return Text.styleMap[this.style](this.text);
  }
}

/**
 * Represents a Markdown table.
 */
export class Table {
  private columnCount: number;
  private headers: string[];
  private alignments: Alignment[];
  private bodies: string[][];

  private static readonly alignmentMap: Record<Alignment, string> = {
    [Alignment.left]: ":---",
    [Alignment.center]: ":---:",
    [Alignment.right]: "---:",
  };

  /**
   * Constructs a new Table instance.
   * @param headers An array of header strings.
   * @param alignments An optional array of column alignments.
   * @throws {Error} If headers is empty or alignments length exceeds headers length.
   */
  public constructor(headers: string[], alignments: Alignment[] = []) {
    if (headers.length === 0) {
      throw new Error("Headers should not be empty.");
    }
    if (alignments.length > headers.length) {
      throw new Error(`Alignments length should be at most ${headers.length}, but is ${alignments.length}.`);
    }

    this.columnCount = headers.length;
    this.headers = headers;
    this.alignments = Array.from({ length: this.columnCount }, (_, i) => alignments[i] || Alignment.left);
    this.bodies = [];
  }

  /**
   * Changes the table headers and adjusts alignments and bodies.
   * @param headers The new array of header strings.
   */
  public changeHeaders(headers: string[]): void {
    this.columnCount = headers.length;
    this.headers = headers;
    this.alignments = Array.from({ length: this.columnCount }, (_, i) => this.alignments[i] || Alignment.left);
    this.bodies = this.bodies.map((body) => Array.from({ length: this.columnCount }, (_, i) => body[i] || ""));
  }

  /**
   * Changes the alignments of the table columns.
   * @param alignments The new array of column alignments.
   * @throws {Error} If alignments length exceeds the number of columns.
   */
  public changeAlignments(alignments: Alignment[]): void {
    if (alignments.length > this.columnCount) {
      throw new Error(`Alignments length should be at most ${this.columnCount}, but is ${alignments.length}.`);
    }

    this.alignments = Array.from({ length: this.columnCount }, (_, i) => alignments[i] || Alignment.left);
  }

  /**
   * Adds a single row to the table body.
   * @param body An array of strings representing a table row.
   * @throws {Error} If body length exceeds the number of columns.
   */
  public addBody(body: string[]): void {
    if (body.length > this.columnCount) {
      throw new Error(`Body length should be at most ${this.columnCount}, but is ${body.length}.`);
    }

    this.bodies.push(Array.from({ length: this.columnCount }, (_, i) => body[i] || ""));
  }

  /**
   * Adds multiple rows to the table body.
   * @param bodies An array of arrays of strings, where each inner array represents a table row.
   */
  public addBodies(bodies: string[][]): void {
    for (const body of bodies) {
      this.addBody(body);
    }
  }

  /**
   * Clears all rows from the table body.
   */
  public clearBodies(): void {
    this.bodies = [];
  }

  /**
   * Checks if the table body is empty.
   * @returns `true` if the body is empty, `false` otherwise.
   */
  public isBodiesEmpty(): boolean {
    return this.bodies.length === 0;
  }

  /**
   * Returns the Markdown representation of the table.
   */
  public toString(): string {
    if (this.isBodiesEmpty()) {
      return "";
    }

    const headerRow = this.makeRow(this.headers);
    const alignmentRow = this.makeAlignmentRow();
    const bodyRows = this.bodies.map((row) => this.makeRow(row));
    return [headerRow, alignmentRow, ...bodyRows].join("\n");
  }

  // Helper function to create a Markdown table row.
  private makeRow(columns: string[]): string {
    return `| ${columns.join(" | ")} |`;
  }

  // Helper function to create the Markdown alignment row.
  private makeAlignmentRow(): string {
    return this.makeRow(Array.from({ length: this.columnCount }, (_, i) => Table.alignmentMap[this.alignments[i]]));
  }
}
