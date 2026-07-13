import { useEffect, useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';

import kanjiData from '@/data/joyoKanji.json';
import type { KanjiEntry } from '@/data/kanjiTypes';

const kanjiList = kanjiData as unknown as KanjiEntry[];

/**
 * Whole days elapsed since the Unix epoch, based on the viewer's LOCAL calendar
 * date (not UTC). Using local midnight as the boundary means the kanji changes
 * over at the user's actual midnight, not at 9am/some odd hour depending on
 * their timezone offset from UTC.
 */
function daysSinceEpoch(date: Date): number {
  const localMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor(localMidnight.getTime() / 86_400_000);
}

/** Deterministically picks the same kanji all day (local time), rotating through the full set day by day. */
function pickKanjiOfTheDay(date: Date): KanjiEntry {
  const seed = daysSinceEpoch(date);
  const index = ((seed % kanjiList.length) + kanjiList.length) % kanjiList.length;
  return kanjiList[index];
}

/** True if two dates fall on different local calendar days. */
function isDifferentLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() !== b.getFullYear() ||
    a.getMonth() !== b.getMonth() ||
    a.getDate() !== b.getDate()
  );
}

export function KanjiOfTheDay() {
  const [today, setToday] = useState(() => new Date());

  useEffect(() => {
    // Poll every minute and also re-check whenever the tab regains focus
    // (e.g. the laptop was asleep overnight) so the kanji rolls over to the
    // next day's pick automatically, without requiring a manual page reload.
    const checkForNewDay = () => {
      setToday((prev) => {
        const now = new Date();
        return isDifferentLocalDay(now, prev) ? now : prev;
      });
    };

    const intervalId = window.setInterval(checkForNewDay, 60_000);
    document.addEventListener('visibilitychange', checkForNewDay);
    window.addEventListener('focus', checkForNewDay);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', checkForNewDay);
      window.removeEventListener('focus', checkForNewDay);
    };
  }, []);

  const entry = useMemo(() => pickKanjiOfTheDay(today), [today]);

  const meaning = entry.meanings.join('; ');
  const onyomi = entry.onyomi.join('\u3001');
  const kunyomi = entry.kunyomi.join('\u3001');
  const jlpt = entry.jlptLabel === 'Not JLPT-classified' ? null : entry.jlptLabel;

  return (
    <div
      className="max-w-xl mx-auto w-full bg-primary/5 border border-primary/20 rounded-xl px-5 py-5 sm:px-7 sm:py-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left"
      data-testid="card-kanji-of-the-day"
    >
      <div className="flex flex-col items-center gap-1.5 shrink-0">
        <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          Kanji of the Day
        </span>
        <span className="font-serif text-5xl sm:text-6xl font-bold leading-none text-foreground">
          {entry.kanji}
        </span>
      </div>

      <div className="min-w-0 space-y-1.5">
        <p className="text-base sm:text-lg font-medium text-foreground capitalize">{meaning}</p>
        <p className="text-sm text-muted-foreground">
          {onyomi && (
            <>
              On&apos;yomi: <span className="text-foreground">{onyomi}</span>
            </>
          )}
          {onyomi && kunyomi && <span className="mx-2 text-border">&middot;</span>}
          {kunyomi && (
            <>
              Kun&apos;yomi: <span className="text-foreground">{kunyomi}</span>
            </>
          )}
        </p>
        <p className="text-xs text-muted-foreground">
          {entry.gradeLabel}
          {jlpt && <> &middot; {jlpt}</>}
        </p>
      </div>
    </div>
  );
}
