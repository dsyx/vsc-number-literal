export class AlignmentCountMismatchError extends Error {
    constructor(expected: number, actual: number) {
        super(`Alignment count mismatch. Expected ${expected} alignments, but got ${actual}.`);
        this.name = "AlignmentCountMismatchError";
    }
}

export class ColumnCountMismatchError extends Error {
    constructor(expected: number, actual: number) {
        super(`Column count mismatch. Expected ${expected} columns, but got ${actual}.`);
        this.name = "ColumnCountMismatchError";
    }
}

export class TableMustHaveRowsError extends Error {
    constructor() {
        super("Table must have at least one row of data.");
        this.name = "TableMustHaveRowsError";
    }
}

export const enum Alignment {
    left,
    center,
    right,
}

export class MarkdownTableBuilder {
    private headers: string[];
    private alignments: Alignment[];
    private rows: string[][];

    public constructor(headers: string[]) {
        this.headers = headers;
        this.alignments = Array(headers.length).fill(Alignment.left);
        this.rows = [];
    }

    public changeAlignments(alignments: Alignment[]): void {
        if (alignments.length !== this.headers.length) {
            throw new AlignmentCountMismatchError(this.headers.length, alignments.length);
        }
        this.alignments = alignments;
    }

    public addRow(row: string[]): void {
        if (row.length !== this.headers.length) {
            throw new ColumnCountMismatchError(this.headers.length, row.length);
        }

        this.rows.push(row);
    }

    public build(): string {
        if (this.rows.length === 0) {
            throw new TableMustHaveRowsError();
        }

        const headerRow = `| ${this.headers.join(" | ")} |`;

        const alignmentData = this.alignments.map((alignment) => {
            if (alignment === Alignment.left) {
                return ":---";
            } else if (alignment === Alignment.center) {
                return ":---:";
            } else {
                return "---:";
            }
        });
        const alignmentRow = `| ${alignmentData.join(" | ")} |`;

        const bodyRows = this.rows.map(row => `| ${row.join(" | ")} |`);

        return [headerRow, alignmentRow, ...bodyRows].join("\n");
    }
}