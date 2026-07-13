// Type describing each entry in joyoKanji.json.
// Do not hand-edit joyoKanji.json -- it is generated data (all 2,136 official
// Jōyō kanji, sourced from the community-maintained kanji-data reference set
// which is itself derived from KANJIDIC2 grade/JLPT metadata).
export interface KanjiEntry {
  /** The kanji character itself, e.g. "水" */
  kanji: string;
  /** Stroke count */
  strokes: number | null;
  /** School grade the kanji is taught in: 1-6 = elementary grade, 8 = secondary school */
  grade: number;
  /** Human-readable grade category, e.g. "Grade 1 (Elementary School)" */
  gradeLabel: string;
  /** JLPT level using the modern N1 (hardest) - N5 (easiest) scale, or null if not JLPT-classified */
  jlpt: number | null;
  /** Human-readable JLPT category, e.g. "N5" or "Not JLPT-classified" */
  jlptLabel: string;
  /** Frequency rank in modern Japanese text (lower = more common), or null */
  freq: number | null;
  /** English meanings */
  meanings: string[];
  /** On'yomi (Chinese-derived) readings, written in katakana, as officially listed */
  onyomi: string[];
  /** Kun'yomi (native Japanese) readings, written in hiragana, as officially listed.
   * A trailing "-" marks a bound/prefix form; a "." separates the kanji's own
   * reading from trailing okurigana (e.g. "ひと.つ" = 一つ "hitotsu"). */
  kunyomi: string[];
  /** All readings rendered in hiragana: kun'yomi (native) plus on'yomi converted from katakana */
  hiraganaReadings: string[];
  /** Hepburn romanization of each on'yomi reading, in the same order as `onyomi` */
  romajiOn: string[];
  /** Hepburn romanization of each kun'yomi reading, in the same order as `kunyomi` */
  romajiKun: string[];
}
