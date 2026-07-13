import { useState, useMemo, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { kanjiDataset } from '@/lib/generateKanjiDocx';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const PAGE_SIZE = 50;

export function KanjiPreview() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<number | 'all'>('all');
  const [page, setPage] = useState(0);

  const filteredKanji = useMemo(() => {
    return kanjiDataset.filter((entry) => {
      const matchesSearch =
        entry.kanji.includes(searchTerm) ||
        entry.meanings.some((m) => m.toLowerCase().includes(searchTerm.toLowerCase())) ||
        entry.romajiOn.some((r) => r.toLowerCase().includes(searchTerm.toLowerCase())) ||
        entry.romajiKun.some((r) => r.toLowerCase().includes(searchTerm.toLowerCase())) ||
        entry.hiraganaReadings.some((r) => r.includes(searchTerm));

      const matchesGrade = selectedGrade === 'all' || entry.grade === selectedGrade;

      return matchesSearch && matchesGrade;
    });
  }, [searchTerm, selectedGrade]);

  // Reset to the first page whenever the filters change
  useEffect(() => {
    setPage(0);
  }, [searchTerm, selectedGrade]);

  const pageCount = Math.max(1, Math.ceil(filteredKanji.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const visibleKanji = filteredKanji.slice(
    currentPage * PAGE_SIZE,
    currentPage * PAGE_SIZE + PAGE_SIZE,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search meaning, reading, or kanji..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={selectedGrade === 'all' ? 'default' : 'secondary'}
            className="cursor-pointer"
            onClick={() => setSelectedGrade('all')}
          >
            All
          </Badge>
          {[1, 2, 3, 4, 5, 6, 8].map((g) => (
            <Badge
              key={g}
              variant={selectedGrade === g ? 'default' : 'secondary'}
              className="cursor-pointer"
              onClick={() => setSelectedGrade(g)}
            >
              {g === 8 ? 'Sec.' : `Gr. ${g}`}
            </Badge>
          ))}
        </div>
      </div>

      <div className="rounded-md border border-border bg-card overflow-hidden">
        {/* Every column keeps its own comfortable width at all times (no
            hide-on-small-screen collapsing); on narrow viewports the table
            simply scrolls horizontally within this wrapper instead of
            cramming columns together. A subtle fade hints there's more to
            scroll on touch devices. */}
        <div className="overflow-x-auto [-webkit-overflow-scrolling:touch]">
          <Table className="min-w-[880px]">
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[80px] text-center font-serif sticky left-0 bg-muted/50 z-10">Kanji</TableHead>
                <TableHead className="min-w-[220px]">Meaning</TableHead>
                <TableHead className="min-w-[220px]">Readings</TableHead>
                <TableHead className="min-w-[180px]">Romaji</TableHead>
                <TableHead className="w-[110px] text-center">Grade</TableHead>
                <TableHead className="w-[90px] text-center">JLPT</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleKanji.length > 0 ? (
                visibleKanji.map((entry) => (
                  <TableRow key={entry.kanji}>
                    <TableCell className="text-center font-serif text-xl sm:text-2xl sticky left-0 bg-card z-10">
                      {entry.kanji}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-foreground">{entry.meanings[0] || '—'}</span>
                      {entry.meanings.length > 1 && (
                        <span className="text-muted-foreground ml-1">
                          , {entry.meanings.slice(1, 3).join(', ')}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-sm">
                        {entry.onyomi.length > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground text-xs font-medium w-8">ON</span>
                            <span>{entry.onyomi.join('、')}</span>
                          </div>
                        )}
                        {entry.kunyomi.length > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground text-xs font-medium w-8">KUN</span>
                            <span>{entry.kunyomi.join('、')}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-sm">
                        {entry.romajiOn.length > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground text-xs font-medium w-8">ON</span>
                            <span>{entry.romajiOn.join(', ')}</span>
                          </div>
                        )}
                        {entry.romajiKun.length > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground text-xs font-medium w-8">KUN</span>
                            <span>{entry.romajiKun.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {entry.grade === 8 ? 'Sec.' : entry.grade}
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {entry.jlptLabel === 'Not JLPT-classified' ? '—' : entry.jlptLabel}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No kanji found matching your criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 text-sm border-t border-border bg-muted/20">
          <span className="text-muted-foreground text-xs sm:text-sm text-center sm:text-left">
            {filteredKanji.length === 0
              ? 'No results'
              : `Showing ${currentPage * PAGE_SIZE + 1}–${Math.min(
                  (currentPage + 1) * PAGE_SIZE,
                  filteredKanji.length,
                )} of ${filteredKanji.length.toLocaleString()}`}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Previous</span>
            </Button>
            <span className="text-muted-foreground text-xs px-1 whitespace-nowrap">
              {currentPage + 1} / {pageCount}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={currentPage >= pageCount - 1}
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
