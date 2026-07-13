import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  PageBreak,
  PageNumber,
  PageOrientation,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from 'docx';

// Explicit grid lines for a crisp, professional table look: light gray hairlines
// between cells, with a heavier dark rule under the header row to anchor it.
const CELL_BORDER = { style: BorderStyle.SINGLE, size: 4, color: 'C7CCD1' } as const;
const TABLE_BORDERS = {
  top: CELL_BORDER,
  bottom: CELL_BORDER,
  left: CELL_BORDER,
  right: CELL_BORDER,
  insideHorizontal: CELL_BORDER,
  insideVertical: CELL_BORDER,
};
const HEADER_BOTTOM_BORDER = { style: BorderStyle.SINGLE, size: 12, color: '1F2933' } as const;

// Explicit US Letter landscape (11in x 8.5in) at slim 0.35in margins maximizes
// usable width (~10.3in / 14,832 twips) so the 7-column table gets the fullest
// page real estate available, rather than relying on a locale-dependent default
// page size or generous margins that eat into column width.
// Note: docx.js swaps the width/height fields internally when orientation is
// LANDSCAPE (it expects portrait-oriented dimensions as input), so pass the
// *portrait* Letter size (8.5in x 11in) here to get an actual 11in x 8.5in
// landscape page in the output — passing already-landscape dimensions here
// would double-swap and produce a portrait-shaped page mislabeled "landscape".
const PAGE_MARGIN_TWIPS = 504;
const PAGE_PROPERTIES = {
  page: {
    size: { orientation: PageOrientation.LANDSCAPE, width: 12240, height: 15840 },
    margin: { top: PAGE_MARGIN_TWIPS, bottom: PAGE_MARGIN_TWIPS, left: PAGE_MARGIN_TWIPS, right: PAGE_MARGIN_TWIPS },
  },
};
// Actual landscape page width (post docx.js swap) is 15840 twips; subtract both
// margins to get the real usable width for the table grid.
const USABLE_WIDTH_TWIPS = 15840 - PAGE_MARGIN_TWIPS * 2;
import { saveAs } from 'file-saver';

import kanjiData from '@/data/joyoKanji.json';
import type { KanjiEntry } from '@/data/kanjiTypes';

const kanjiList = kanjiData as unknown as KanjiEntry[];

const GRADE_ORDER = [1, 2, 3, 4, 5, 6, 8] as const;

const CREDITS_LINE = 'Made by Musa, for Musa.';

/** Approximate number of data rows that fit in a ~5 page preview (title page + ~4 pages of table). */
const PREVIEW_ROW_COUNT = 150;

// Percentages of usable width (sums to 100), converted to fixed DXA (twip) widths below.
// Using absolute widths (rather than WidthType.PERCENTAGE) matters because some
// renderers — notably Google Docs' mobile app — size columns off the table's
// tblGrid column definitions rather than the percentage cell widths, and
// docx.js only populates tblGrid with real values when given explicit
// columnWidths. Without this, those renderers show a cramped, character-wrapped
// table with large unused space on the page, even though Word itself renders
// the percentages correctly.
const COLUMN_WIDTH_PERCENTS = [9, 20, 9, 16, 15, 15, 16] as const;
const COLUMN_WIDTHS: number[] = COLUMN_WIDTH_PERCENTS.map((p) => Math.round((p / 100) * USABLE_WIDTH_TWIPS));
const HEADER_LABELS = [
  'Kanji',
  'Meaning',
  'Grade',
  'JLPT',
  "On'yomi",
  "Kun'yomi",
  'Romaji',
] as const;

function headerCell(text: string, width: number): TableCell {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    verticalAlign: VerticalAlign.CENTER,
    shading: { fill: '1F2933' },
    borders: { bottom: HEADER_BOTTOM_BORDER },
    margins: { top: 100, bottom: 100, left: 140, right: 140 },
    children: [
      new Paragraph({
        alignment: AlignmentType.LEFT,
        children: [
          new TextRun({ text, bold: true, color: 'FFFFFF', size: 20 }),
        ],
      }),
    ],
  });
}

function bodyCell(
  text: string,
  width: number,
  options?: { bold?: boolean; size?: number; alignment?: (typeof AlignmentType)[keyof typeof AlignmentType] },
): TableCell {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 80, bottom: 80, left: 140, right: 140 },
    children: [
      new Paragraph({
        alignment: options?.alignment ?? AlignmentType.LEFT,
        children: [
          new TextRun({
            text: text || '\u2014',
            bold: options?.bold ?? false,
            size: options?.size ?? 20,
          }),
        ],
      }),
    ],
  });
}

function buildHeaderRow(): TableRow {
  return new TableRow({
    tableHeader: true,
    children: HEADER_LABELS.map((label, i) => headerCell(label, COLUMN_WIDTHS[i])),
  });
}

function buildDataRow(entry: KanjiEntry): TableRow {
  const meaning = entry.meanings.join('; ');
  const onyomi = entry.onyomi.join('\u3001'); // 、
  const kunyomi = entry.kunyomi.join('\u3001');
  const romaji =
    (entry.romajiOn.length ? `On: ${entry.romajiOn.join(', ')}` : '') +
    (entry.romajiOn.length && entry.romajiKun.length ? '  ' : '') +
    (entry.romajiKun.length ? `Kun: ${entry.romajiKun.join(', ')}` : '');

  return new TableRow({
    children: [
      bodyCell(entry.kanji, COLUMN_WIDTHS[0], { bold: true, size: 28, alignment: AlignmentType.CENTER }),
      bodyCell(meaning, COLUMN_WIDTHS[1]),
      bodyCell(String(entry.grade === 8 ? 'Sec.' : entry.grade), COLUMN_WIDTHS[2], {
        alignment: AlignmentType.CENTER,
      }),
      bodyCell(entry.jlptLabel === 'Not JLPT-classified' ? '\u2014' : entry.jlptLabel, COLUMN_WIDTHS[3], {
        alignment: AlignmentType.CENTER,
      }),
      bodyCell(onyomi, COLUMN_WIDTHS[4]),
      bodyCell(kunyomi, COLUMN_WIDTHS[5]),
      bodyCell(romaji, COLUMN_WIDTHS[6]),
    ],
  });
}

function gradeSectionTitle(grade: number): string {
  if (grade >= 1 && grade <= 6) return `Grade ${grade} — Elementary School Kanji`;
  return 'Secondary School Kanji (remaining Jōyō set)';
}

function buildTitlePage(
  generatedOn: string,
  options?: { preview?: boolean; sampleCount?: number },
): Paragraph[] {
  const isPreview = options?.preview ?? false;
  const subtitle = isPreview ? 'Preview Sample — Jōyō Kanji Reference' : 'Complete Jōyō Kanji Reference';
  const description = isPreview
    ? `A short preview of the full reference, showing the first ${options?.sampleCount ?? PREVIEW_ROW_COUNT} of ${kanjiList.length.toLocaleString()} official Jōyō kanji. Download the complete document for all characters.`
    : `All ${kanjiList.length.toLocaleString()} official Jōyō kanji, with on'yomi, kun'yomi, hiragana, romaji, and grade/JLPT categories.`;

  return [
    new Paragraph({
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { before: 2400, after: 200 },
      children: [new TextRun({ text: '常用漢字', size: 72, bold: true })],
    }),
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
      children: [
        new TextRun({
          text: subtitle,
          bold: true,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [new TextRun({ text: description })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [new TextRun({ text: `Generated on ${generatedOn}`, italics: true, color: '555555' })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 1200 },
      children: [new TextRun({ text: CREDITS_LINE, italics: true, color: 'B7371E' })],
    }),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { after: 100 },
      children: [new TextRun({ text: 'How to read this document', bold: true, size: 24 })],
    }),
    new Paragraph({
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: "Kanji are grouped by the school grade in which they are taught (Grade 1 through 6), followed by the remaining Jōyō kanji taught in secondary school. Within each group, kanji are ordered from most to least frequently used in modern Japanese text.",
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 80 },
      children: [
        new TextRun({ text: "On'yomi", bold: true }),
        new TextRun({
          text: ' — the Chinese-derived reading, shown in katakana as officially listed.',
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 80 },
      children: [
        new TextRun({ text: "Kun'yomi", bold: true }),
        new TextRun({
          text: " — the native Japanese reading, shown in hiragana. A trailing \u201c-\u201d marks a bound or prefix form; a \u201c.\u201d separates the kanji's own reading from trailing okurigana (e.g. \u3072\u3068.\u3064 for \u4e00\u3064, hitotsu).",
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 80 },
      children: [
        new TextRun({ text: 'Romaji', bold: true }),
        new TextRun({
          text: ' — Hepburn romanization of the on\u2019yomi and kun\u2019yomi readings.',
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 80 },
      children: [
        new TextRun({ text: 'Grade', bold: true }),
        new TextRun({
          text: ' — the school grade the kanji is introduced in (1\u20136), or \u201cSec.\u201d for the remaining Jōyō kanji taught in secondary school.',
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 80 },
      children: [
        new TextRun({ text: 'JLPT', bold: true }),
        new TextRun({
          text: ' — the modern JLPT level the kanji is associated with (N5 = easiest, N1 = hardest), or \u201c\u2014\u201d if the kanji is not part of the JLPT kanji lists.',
        }),
      ],
    }),
  ];
}

export async function generateKanjiDocxBlob(): Promise<Blob> {
  const generatedOn = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const byGrade = new Map<number, KanjiEntry[]>();
  for (const entry of kanjiList) {
    const list = byGrade.get(entry.grade) ?? [];
    list.push(entry);
    byGrade.set(entry.grade, list);
  }

  const children: (Paragraph | Table)[] = [...buildTitlePage(generatedOn)];

  for (const grade of GRADE_ORDER) {
    const entries = byGrade.get(grade);
    if (!entries || entries.length === 0) continue;

    children.push(
      new Paragraph({
        children: [new PageBreak()],
      }),
    );
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: `${gradeSectionTitle(grade)} (${entries.length} kanji)`,
          }),
        ],
      }),
    );

    const table = new Table({
      width: { size: USABLE_WIDTH_TWIPS, type: WidthType.DXA },
      columnWidths: COLUMN_WIDTHS,
      layout: TableLayoutType.FIXED,
      borders: TABLE_BORDERS,
      rows: [buildHeaderRow(), ...entries.map(buildDataRow)],
    });
    children.push(table);
  }

  const doc = new Document({
    creator: 'Kanji Reference Exporter',
    title: 'Complete Jōyō Kanji Reference',
    description: "All Jōyō kanji with on'yomi, kun'yomi, hiragana, romaji, grade, and JLPT level",
    sections: [
      {
        properties: PAGE_PROPERTIES,
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({ text: 'Complete Jōyō Kanji Reference', size: 16, color: '888888' })],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    children: [PageNumber.CURRENT, ' / ', PageNumber.TOTAL_PAGES],
                    size: 16,
                    color: '888888',
                  }),
                  new TextRun({ text: `   \u2022   ${CREDITS_LINE}`, size: 16, color: '888888' }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });

  return Packer.toBlob(doc);
}

export async function downloadKanjiDocx(filename = 'joyo-kanji-reference.docx'): Promise<void> {
  const blob = await generateKanjiDocxBlob();
  saveAs(blob, filename);
}

/**
 * Builds a short ~5 page preview document: the same title/legend page plus a
 * single table containing a sample of entries (not grouped by grade, no
 * per-grade page breaks) so it stays compact. Intended as a quick look at the
 * format before downloading the full reference.
 */
export async function generatePreviewKanjiDocxBlob(): Promise<Blob> {
  const generatedOn = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const sample = kanjiList.slice(0, PREVIEW_ROW_COUNT);

  const children: (Paragraph | Table)[] = [
    ...buildTitlePage(generatedOn, { preview: true, sampleCount: sample.length }),
    new Paragraph({ children: [new PageBreak()] }),
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 120 },
      children: [new TextRun({ text: `Sample Kanji (${sample.length} of ${kanjiList.length})` })],
    }),
    new Table({
      width: { size: USABLE_WIDTH_TWIPS, type: WidthType.DXA },
      columnWidths: COLUMN_WIDTHS,
      layout: TableLayoutType.FIXED,
      borders: TABLE_BORDERS,
      rows: [buildHeaderRow(), ...sample.map(buildDataRow)],
    }),
  ];

  const doc = new Document({
    creator: 'Kanji Reference Exporter',
    title: 'Jōyō Kanji Reference — Preview',
    description: 'Short preview sample of the complete Jōyō kanji reference document',
    sections: [
      {
        properties: PAGE_PROPERTIES,
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({ text: 'Jōyō Kanji Reference — Preview', size: 16, color: '888888' })],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    children: [PageNumber.CURRENT, ' / ', PageNumber.TOTAL_PAGES],
                    size: 16,
                    color: '888888',
                  }),
                  new TextRun({ text: `   \u2022   ${CREDITS_LINE}`, size: 16, color: '888888' }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });

  return Packer.toBlob(doc);
}

export async function downloadPreviewKanjiDocx(filename = 'joyo-kanji-reference-preview.docx'): Promise<void> {
  const blob = await generatePreviewKanjiDocxBlob();
  saveAs(blob, filename);
}

export const kanjiCount = kanjiList.length;
export const kanjiDataset = kanjiList;
