// Standard hiragana / katakana reference charts: gojūon (base 46 + n),
// dakuten/handakuten (voiced/semi-voiced, 20), and yōon (contracted sounds, 33).
// Sourced from the standard Japanese kana syllabary taught in Jōyō-aligned
// language references; cross-checked against the conventional gojūon-zu layout.

export interface KanaCell {
  hiragana: string;
  katakana: string;
  romaji: string;
}

export type KanaRow = (KanaCell | null)[];

export interface KanaSection {
  id: string;
  title: string;
  description: string;
  columnHeaders: string[];
  rows: KanaRow[];
}

function cell(hiragana: string, katakana: string, romaji: string): KanaCell {
  return { hiragana, katakana, romaji };
}

export const GOJUON_SECTION: KanaSection = {
  id: 'gojuon',
  title: 'Gojūon (Basic 46 + n)',
  description: 'The foundational 46 sounds of Japanese, arranged in the traditional five-vowel grid.',
  columnHeaders: ['a', 'i', 'u', 'e', 'o'],
  rows: [
    [cell('あ', 'ア', 'a'), cell('い', 'イ', 'i'), cell('う', 'ウ', 'u'), cell('え', 'エ', 'e'), cell('お', 'オ', 'o')],
    [cell('か', 'カ', 'ka'), cell('き', 'キ', 'ki'), cell('く', 'ク', 'ku'), cell('け', 'ケ', 'ke'), cell('こ', 'コ', 'ko')],
    [cell('さ', 'サ', 'sa'), cell('し', 'シ', 'shi'), cell('す', 'ス', 'su'), cell('せ', 'セ', 'se'), cell('そ', 'ソ', 'so')],
    [cell('た', 'タ', 'ta'), cell('ち', 'チ', 'chi'), cell('つ', 'ツ', 'tsu'), cell('て', 'テ', 'te'), cell('と', 'ト', 'to')],
    [cell('な', 'ナ', 'na'), cell('に', 'ニ', 'ni'), cell('ぬ', 'ヌ', 'nu'), cell('ね', 'ネ', 'ne'), cell('の', 'ノ', 'no')],
    [cell('は', 'ハ', 'ha'), cell('ひ', 'ヒ', 'hi'), cell('ふ', 'フ', 'fu'), cell('へ', 'ヘ', 'he'), cell('ほ', 'ホ', 'ho')],
    [cell('ま', 'マ', 'ma'), cell('み', 'ミ', 'mi'), cell('む', 'ム', 'mu'), cell('め', 'メ', 'me'), cell('も', 'モ', 'mo')],
    [cell('や', 'ヤ', 'ya'), null, cell('ゆ', 'ユ', 'yu'), null, cell('よ', 'ヨ', 'yo')],
    [cell('ら', 'ラ', 'ra'), cell('り', 'リ', 'ri'), cell('る', 'ル', 'ru'), cell('れ', 'レ', 're'), cell('ろ', 'ロ', 'ro')],
    [cell('わ', 'ワ', 'wa'), null, null, null, cell('を', 'ヲ', 'wo')],
    [cell('ん', 'ン', 'n'), null, null, null, null],
  ],
};

export const DAKUTEN_SECTION: KanaSection = {
  id: 'dakuten',
  title: 'Dakuten & Handakuten (Voiced Sounds)',
  description: 'Added voicing marks (゛) and semi-voicing marks (゜) that alter the base consonant sound.',
  columnHeaders: ['a', 'i', 'u', 'e', 'o'],
  rows: [
    [cell('が', 'ガ', 'ga'), cell('ぎ', 'ギ', 'gi'), cell('ぐ', 'グ', 'gu'), cell('げ', 'ゲ', 'ge'), cell('ご', 'ゴ', 'go')],
    [cell('ざ', 'ザ', 'za'), cell('じ', 'ジ', 'ji'), cell('ず', 'ズ', 'zu'), cell('ぜ', 'ゼ', 'ze'), cell('ぞ', 'ゾ', 'zo')],
    [cell('だ', 'ダ', 'da'), cell('ぢ', 'ヂ', 'ji'), cell('づ', 'ヅ', 'zu'), cell('で', 'デ', 'de'), cell('ど', 'ド', 'do')],
    [cell('ば', 'バ', 'ba'), cell('び', 'ビ', 'bi'), cell('ぶ', 'ブ', 'bu'), cell('べ', 'ベ', 'be'), cell('ぼ', 'ボ', 'bo')],
    [cell('ぱ', 'パ', 'pa'), cell('ぴ', 'ピ', 'pi'), cell('ぷ', 'プ', 'pu'), cell('ぺ', 'ペ', 'pe'), cell('ぽ', 'ポ', 'po')],
  ],
};

export const YOON_SECTION: KanaSection = {
  id: 'youon',
  title: 'Yōon (Contracted Sounds)',
  description: 'Palatalized sounds formed by combining an i-row kana with a small ya/yu/yo.',
  columnHeaders: ['-ya', '-yu', '-yo'],
  rows: [
    [cell('きゃ', 'キャ', 'kya'), cell('きゅ', 'キュ', 'kyu'), cell('きょ', 'キョ', 'kyo')],
    [cell('しゃ', 'シャ', 'sha'), cell('しゅ', 'シュ', 'shu'), cell('しょ', 'ショ', 'sho')],
    [cell('ちゃ', 'チャ', 'cha'), cell('ちゅ', 'チュ', 'chu'), cell('ちょ', 'チョ', 'cho')],
    [cell('にゃ', 'ニャ', 'nya'), cell('にゅ', 'ニュ', 'nyu'), cell('にょ', 'ニョ', 'nyo')],
    [cell('ひゃ', 'ヒャ', 'hya'), cell('ひゅ', 'ヒュ', 'hyu'), cell('ひょ', 'ヒョ', 'hyo')],
    [cell('みゃ', 'ミャ', 'mya'), cell('みゅ', 'ミュ', 'myu'), cell('みょ', 'ミョ', 'myo')],
    [cell('りゃ', 'リャ', 'rya'), cell('りゅ', 'リュ', 'ryu'), cell('りょ', 'リョ', 'ryo')],
    [cell('ぎゃ', 'ギャ', 'gya'), cell('ぎゅ', 'ギュ', 'gyu'), cell('ぎょ', 'ギョ', 'gyo')],
    [cell('じゃ', 'ジャ', 'ja'), cell('じゅ', 'ジュ', 'ju'), cell('じょ', 'ジョ', 'jo')],
    [cell('びゃ', 'ビャ', 'bya'), cell('びゅ', 'ビュ', 'byu'), cell('びょ', 'ビョ', 'byo')],
    [cell('ぴゃ', 'ピャ', 'pya'), cell('ぴゅ', 'ピュ', 'pyu'), cell('ぴょ', 'ピョ', 'pyo')],
  ],
};

export const KANA_SECTIONS: KanaSection[] = [GOJUON_SECTION, DAKUTEN_SECTION, YOON_SECTION];

export const kanaCharCount = KANA_SECTIONS.reduce(
  (total, section) => total + section.rows.reduce((rowTotal, row) => rowTotal + row.filter(Boolean).length, 0),
  0,
);
