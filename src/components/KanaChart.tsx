import { useState } from 'react';
import { KANA_SECTIONS, type KanaCell, type KanaRow } from '@/data/kanaData';
import { Badge } from '@/components/ui/badge';

type Script = 'hiragana' | 'katakana';

const VOWELS = new Set(['a', 'i', 'u', 'e', 'o']);

/** Derives a short row label (the shared consonant) from the first filled cell, e.g. "ka" -> "k", "kya" -> "ky". */
function rowLabel(row: KanaRow): string {
  const romaji = row.find((c): c is KanaCell => c !== null)?.romaji ?? '';
  if (romaji.length > 1 && VOWELS.has(romaji.slice(-1))) {
    return romaji.slice(0, -1);
  }
  return romaji;
}

function KanaCellBox({ entry, script }: { entry: KanaCell | null; script: Script }) {
  if (!entry) {
    return <div className="aspect-square bg-muted/20" />;
  }
  return (
    <div className="aspect-square bg-card flex flex-col items-center justify-center gap-0.5 hover-elevate transition-colors p-0.5">
      <span className="font-serif text-lg sm:text-2xl md:text-3xl leading-none">
        {script === 'hiragana' ? entry.hiragana : entry.katakana}
      </span>
      <span className="text-[9px] sm:text-[11px] md:text-xs text-muted-foreground tracking-wide">
        {entry.romaji}
      </span>
    </div>
  );
}

export function KanaChart() {
  const [script, setScript] = useState<Script>('hiragana');

  return (
    <div className="space-y-8">
      <div className="flex justify-center">
        <div className="inline-flex rounded-full border border-border bg-card p-1">
          <button
            onClick={() => setScript('hiragana')}
            className={`px-5 py-1.5 rounded-full text-sm font-medium transition-colors ${
              script === 'hiragana' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover-elevate'
            }`}
          >
            Hiragana
          </button>
          <button
            onClick={() => setScript('katakana')}
            className={`px-5 py-1.5 rounded-full text-sm font-medium transition-colors ${
              script === 'katakana' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover-elevate'
            }`}
          >
            Katakana
          </button>
        </div>
      </div>

      {KANA_SECTIONS.map((section) => (
        <div key={section.id} className="space-y-2 sm:space-y-3 px-1">
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-lg sm:text-xl font-semibold">{section.title}</h3>
            <Badge variant="secondary">{section.rows.flat().filter(Boolean).length}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{section.description}</p>

          <div className="rounded-lg border border-border overflow-hidden shadow-sm">
            <div
              className="grid divide-x divide-border"
              style={{
                gridTemplateColumns: `minmax(1.5rem, 2rem) repeat(${section.columnHeaders.length}, minmax(0, 1fr))`,
              }}
            >
              {/* Header row: blank corner cell + column labels */}
              <div className="bg-foreground/90" />
              {section.columnHeaders.map((h) => (
                <div
                  key={h}
                  className="bg-foreground/90 flex items-center justify-center py-1.5 border-b-2 border-foreground"
                >
                  <span className="text-[10px] sm:text-xs font-semibold text-background tracking-wide">{h}</span>
                </div>
              ))}

              {/* Data rows: row-label cell + kana cells */}
              {section.rows.map((row, rowIndex) => (
                <div key={rowIndex} className="contents">
                  <div className="bg-foreground/90 flex items-center justify-center border-t border-border/40">
                    <span className="text-[10px] sm:text-xs font-semibold text-background">{rowLabel(row)}</span>
                  </div>
                  {row.map((entry, colIndex) => (
                    <div
                      key={colIndex}
                      className="border-t border-border"
                      style={{ gridColumn: 'auto' }}
                    >
                      <KanaCellBox entry={entry} script={script} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
