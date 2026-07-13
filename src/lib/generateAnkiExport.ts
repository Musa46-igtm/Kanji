import { saveAs } from 'file-saver';

import kanjiData from '@/data/joyoKanji.json';
import type { KanjiEntry } from '@/data/kanjiTypes';

const kanjiList = kanjiData as unknown as KanjiEntry[];

export const ankiCardCount = kanjiList.length;

// Anki's plain-text importer (2.1.54+) reads leading "#key:value" header
// lines to configure the import automatically: field separator, HTML
// rendering, note type, and target deck. This lets the file be imported by
// double-clicking / drag-and-drop with zero manual field mapping.
// Reference: https://docs.ankiweb.net/importing/text-files.html
const FILE_HEADER = [
  '#separator:tab',
  '#html:true',
  '#notetype:Basic',
  '#deck:Jōyō Kanji',
  '#columns:Front\tBack',
].join('\n');

/**
 * Escapes a field for Anki's tab-separated text format: tabs (the column
 * delimiter) and raw newlines can't appear inside a field, so newlines are
 * converted to HTML <br> tags (the file is imported with "Allow HTML" via
 * the #html:true header) and any literal tabs are collapsed to spaces.
 */
function escapeField(text: string): string {
  return text.replace(/\t/g, ' ').replace(/\r?\n/g, '<br>');
}

function buildFront(entry: KanjiEntry): string {
  return `<span style="font-size:64px; line-height:1.2;">${entry.kanji}</span>`;
}

function buildBack(entry: KanjiEntry): string {
  const meaning = entry.meanings.join(', ');
  const onyomi = entry.onyomi.join('\u3001') || '\u2014';
  const kunyomi = entry.kunyomi.join('\u3001') || '\u2014';
  const romajiOn = entry.romajiOn.join(', ') || '\u2014';
  const romajiKun = entry.romajiKun.join(', ') || '\u2014';
  const jlpt = entry.jlptLabel === 'Not JLPT-classified' ? '\u2014' : entry.jlptLabel;

  return [
    `<b>${meaning}</b>`,
    `On'yomi: ${onyomi} (${romajiOn})`,
    `Kun'yomi: ${kunyomi} (${romajiKun})`,
    `${entry.gradeLabel} &middot; JLPT ${jlpt}`,
  ].join('<br>');
}

/** Builds the full Anki-importable TSV text for all Jōyō kanji, one note per line. */
export function generateAnkiDeckText(): string {
  const rows = kanjiList.map((entry) => {
    const front = escapeField(buildFront(entry));
    const back = escapeField(buildBack(entry));
    return `${front}\t${back}`;
  });

  return [FILE_HEADER, ...rows].join('\n');
}

export async function downloadAnkiDeck(filename = 'joyo-kanji-anki-deck.txt'): Promise<void> {
  const text = generateAnkiDeckText();
  // Anki requires UTF-8 plain text; a BOM keeps some editors/OSes from
  // mis-detecting the encoding of the Japanese text inside.
  const blob = new Blob(['\uFEFF' + text], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, filename);
}
