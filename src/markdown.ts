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
  /**
   * Constructs a new Text instance.
   * @param text The text content.
   * @param style The style to apply (defaults to `Style.regular`).
   */
  constructor(private readonly text: string, private readonly style: Style = Style.regular) {}

  /**
   * Returns the Markdown representation of the text with its applied style.
   */
  toString(): string {
    return this.styleMap[this.style];
  }

  private readonly styleMap: Record<Style, string> = {
    [Style.regular]: this.text,
    [Style.bold]: `**${this.text}**`,
    [Style.italic]: `*${this.text}*`,
    [Style.code]: `\`${this.text}\``,
    [Style.strikethrough]: `~~${this.text}~~`,
  };
}

/**
 * Represents a Markdown table.
 */
export class Table {
  /**
   * Constructs a new Table instance.
   * @param headers An array of header strings.
   * @param alignments An optional array of column alignments.
   * @throws {Error} If headers is empty or alignments length exceeds headers length.
   */
  constructor(headers: string[], alignments: Alignment[] = []) {
    if (headers.length === 0) {
      throw new Error("markdown.Table: headers cannot be empty");
    }
    if (alignments.length > headers.length) {
      throw new Error(
        `markdown.Table: alignments length exceeds headers length (${alignments.length} > ${headers.length})`
      );
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
  changeHeaders(headers: string[]): void {
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
  changeAlignments(alignments: Alignment[]): void {
    if (alignments.length > this.columnCount) {
      throw new Error(
        `markdown.Table: alignments length exceeds column count (${alignments.length} > ${this.columnCount})`
      );
    }

    this.alignments = Array.from({ length: this.columnCount }, (_, i) => alignments[i] || Alignment.left);
  }

  /**
   * Adds a single row to the table body.
   * @param body An array of strings representing a table row.
   * @throws {Error} If body length exceeds the number of columns.
   */
  addBody(body: string[]): void {
    if (body.length > this.columnCount) {
      throw new Error(`markdown.Table: body length exceeds column count (${body.length} > ${this.columnCount})`);
    }

    this.bodies.push(Array.from({ length: this.columnCount }, (_, i) => body[i] || ""));
  }

  /**
   * Adds multiple rows to the table body.
   * @param bodies An array of arrays of strings, where each inner array represents a table row.
   */
  addBodies(bodies: string[][]): void {
    for (const body of bodies) {
      this.addBody(body);
    }
  }

  /**
   * Clears all rows from the table body.
   */
  clearBodies(): void {
    this.bodies = [];
  }

  /**
   * Checks if the table body is empty.
   * @returns `true` if the body is empty, `false` otherwise.
   */
  isBodiesEmpty(): boolean {
    return this.bodies.length === 0;
  }

  /**
   * Returns the Markdown representation of the table.
   */
  toString(): string {
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

  private columnCount: number;
  private headers: string[];
  private alignments: Alignment[];
  private bodies: string[][];

  private static readonly alignmentMap: Record<Alignment, string> = {
    [Alignment.left]: ":---",
    [Alignment.center]: ":---:",
    [Alignment.right]: "---:",
  };
}
