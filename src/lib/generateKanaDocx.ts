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
import { saveAs } from 'file-saver';

import { KANA_SECTIONS, kanaCharCount, type KanaCell, type KanaSection } from '@/data/kanaData';

const CREDITS_LINE = 'Made by Musa, for Musa.';

// Same grid-line treatment as the kanji reference table: light gray hairlines
// between cells, heavier dark rule under header rows/labels.
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
// usable width (~10.3in / 14,832 twips) for the kana grid, which combines
// hiragana + katakana + romaji in every cell and needs all the room it can get.
// Note: docx.js swaps the width/height fields internally when orientation is
// LANDSCAPE (it expects portrait-oriented dimensions as input), so pass the
// *portrait* Letter size (8.5in x 11in) here to get an actual 11in x 8.5in
// landscape page in the output.
const PAGE_MARGIN_TWIPS = 504;
const PAGE_PROPERTIES = {
  page: {
    size: { orientation: PageOrientation.LANDSCAPE, width: 12240, height: 15840 },
    margin: { top: PAGE_MARGIN_TWIPS, bottom: PAGE_MARGIN_TWIPS, left: PAGE_MARGIN_TWIPS, right: PAGE_MARGIN_TWIPS },
  },
};
// Actual landscape page width (post docx.js swap) is 15840 twips; subtract both
// margins to get the real usable width for the table grid. Absolute (DXA)
// widths are used instead of WidthType.PERCENTAGE because some renderers —
// notably Google Docs' mobile app — size columns off the table's tblGrid
// column definitions rather than the percentage cell widths, and docx.js only
// populates tblGrid with real values when given explicit columnWidths.
const USABLE_WIDTH_TWIPS = 15840 - PAGE_MARGIN_TWIPS * 2;

function gridHeaderCell(text: string, width: number): TableCell {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    verticalAlign: VerticalAlign.CENTER,
    shading: { fill: '1F2933' },
    borders: { bottom: HEADER_BOTTOM_BORDER },
    margins: { top: 100, bottom: 100, left: 120, right: 120 },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text, bold: true, color: 'FFFFFF', size: 20 })],
      }),
    ],
  });
}

function gridDataCell(entry: KanaCell | null, width: number): TableCell {
  if (!entry) {
    return new TableCell({
      width: { size: width, type: WidthType.DXA },
      margins: { top: 140, bottom: 140, left: 120, right: 120 },
      shading: { fill: 'F2F0EA' },
      children: [new Paragraph({ children: [new TextRun({ text: '' })] })],
    });
  }

  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    margins: { top: 140, bottom: 140, left: 120, right: 120 },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 30 },
        children: [
          new TextRun({ text: entry.hiragana, size: 36, font: 'Noto Sans JP' }),
          new TextRun({ text: '  /  ', size: 22, color: '999999' }),
          new TextRun({ text: entry.katakana, size: 36, font: 'Noto Sans JP' }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: entry.romaji, size: 20, italics: true, color: '555555' })],
      }),
    ],
  });
}

const VOWELS = new Set(['a', 'i', 'u', 'e', 'o']);

/** Derives a short row label (the shared consonant) from the first filled cell, e.g. "ka" -> "k", "kya" -> "ky". */
function deriveRowLabel(row: (KanaCell | null)[]): string {
  const romaji = row.find((c): c is KanaCell => c !== null)?.romaji ?? '';
  if (romaji.length > 1 && VOWELS.has(romaji.slice(-1))) {
    return romaji.slice(0, -1);
  }
  return romaji;
}

function buildSectionTable(section: KanaSection): Table {
  const labelWidth = Math.round(USABLE_WIDTH_TWIPS * 0.12);
  const dataWidth = Math.round((USABLE_WIDTH_TWIPS - labelWidth) / section.columnHeaders.length);
  const columnWidths = [labelWidth, ...section.columnHeaders.map(() => dataWidth)];

  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      gridHeaderCell('', labelWidth),
      ...section.columnHeaders.map((h) => gridHeaderCell(h, dataWidth)),
    ],
  });

  const dataRows = section.rows.map((row) => {
    const rowLabel = deriveRowLabel(row);
    return new TableRow({
      children: [
        gridHeaderCell(rowLabel, labelWidth),
        ...row.map((cell) => gridDataCell(cell, dataWidth)),
      ],
    });
  });

  return new Table({
    width: { size: USABLE_WIDTH_TWIPS, type: WidthType.DXA },
    columnWidths,
    layout: TableLayoutType.FIXED,
    borders: TABLE_BORDERS,
    rows: [headerRow, ...dataRows],
  });
}

function buildKanaTitlePage(generatedOn: string): Paragraph[] {
  return [
    new Paragraph({
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { before: 2400, after: 200 },
      children: [new TextRun({ text: 'ひらがな・カタカナ', size: 60, bold: true })],
    }),
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
      children: [new TextRun({ text: 'Hiragana & Katakana Reference Charts', bold: true })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: `All ${kanaCharCount} kana characters: the base gojūon syllabary, voiced (dakuten/handakuten) sounds, and contracted (yōon) sounds, with romaji for every entry.`,
        }),
      ],
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
  ];
}

export async function generateKanaChartsDocxBlob(): Promise<Blob> {
  const generatedOn = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const children: (Paragraph | Table)[] = [...buildKanaTitlePage(generatedOn)];

  KANA_SECTIONS.forEach((section, index) => {
    if (index > 0) {
      children.push(new Paragraph({ children: [new PageBreak()] }));
    }
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 80 },
        children: [new TextRun({ text: section.title })],
      }),
      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun({ text: section.description, italics: true, color: '555555' })],
      }),
      buildSectionTable(section),
    );
  });

  const doc = new Document({
    creator: 'Kanji Reference Exporter',
    title: 'Hiragana & Katakana Reference Charts',
    description: 'Complete hiragana and katakana syllabary charts with romaji',
    sections: [
      {
        properties: PAGE_PROPERTIES,
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({ text: 'Hiragana & Katakana Reference', size: 16, color: '888888' })],
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

export async function downloadKanaChartsDocx(filename = 'hiragana-katakana-charts.docx'): Promise<void> {
  const blob = await generateKanaChartsDocxBlob();
  saveAs(blob, filename);
}
