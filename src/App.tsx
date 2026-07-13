import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { Download, FileText, BookOpen, Loader2, Languages, GraduationCap } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { KanjiPreview } from '@/components/KanjiPreview';
import { KanaChart } from '@/components/KanaChart';
import { KanjiOfTheDay } from '@/components/KanjiOfTheDay';
import { downloadKanjiDocx, downloadPreviewKanjiDocx, kanjiCount } from '@/lib/generateKanjiDocx';
import { downloadKanaChartsDocx } from '@/lib/generateKanaDocx';
import { downloadAnkiDeck, ankiCardCount } from '@/lib/generateAnkiExport';
import { kanaCharCount } from '@/data/kanaData';
import { useToast } from '@/hooks/use-toast';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();

function Home() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadingPreview, setIsDownloadingPreview] = useState(false);
  const [isDownloadingKana, setIsDownloadingKana] = useState(false);
  const [isDownloadingAnki, setIsDownloadingAnki] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadKanjiDocx('joyo-kanji-reference.docx');
      toast({
        title: "Download Complete",
        description: "Your Jōyō kanji reference document is ready.",
      });
    } catch (error) {
      console.error("Failed to download docx:", error);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "There was an error generating your document. Please try again.",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadPreview = async () => {
    setIsDownloadingPreview(true);
    try {
      await downloadPreviewKanjiDocx('joyo-kanji-reference-preview.docx');
      toast({
        title: "Preview Ready",
        description: "A short 5-page sample document has been downloaded.",
      });
    } catch (error) {
      console.error("Failed to download preview docx:", error);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "There was an error generating the preview. Please try again.",
      });
    } finally {
      setIsDownloadingPreview(false);
    }
  };

  const handleDownloadKana = async () => {
    setIsDownloadingKana(true);
    try {
      await downloadKanaChartsDocx('hiragana-katakana-charts.docx');
      toast({
        title: "Download Complete",
        description: "Your hiragana & katakana reference charts are ready.",
      });
    } catch (error) {
      console.error("Failed to download kana docx:", error);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "There was an error generating your document. Please try again.",
      });
    } finally {
      setIsDownloadingKana(false);
    }
  };

  const handleDownloadAnki = async () => {
    setIsDownloadingAnki(true);
    try {
      await downloadAnkiDeck('joyo-kanji-anki-deck.txt');
      toast({
        title: "Deck Ready",
        description: "Import the file in Anki (File > Import) to start reviewing.",
      });
    } catch (error) {
      console.error("Failed to generate Anki deck:", error);
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "There was an error generating the Anki deck. Please try again.",
      });
    } finally {
      setIsDownloadingAnki(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col items-center py-8 sm:py-12 md:py-24 px-4 sm:px-6">
      <div className="w-full max-w-6xl space-y-12 sm:space-y-16">

        <div className="max-w-3xl mx-auto space-y-12 sm:space-y-16">
          {/* Header Section */}
          <header className="text-center space-y-4 sm:space-y-6">
            <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 sm:mb-8">
              <span className="font-serif text-2xl sm:text-3xl font-bold">漢</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-foreground">
              Jōyō Kanji Reference
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              A complete, beautifully formatted reference document containing all {kanjiCount.toLocaleString()} official Jōyō kanji. Designed for offline study and quick lookup.
            </p>
          </header>

          <KanjiOfTheDay />

          {/* Primary Action Card */}
          <section className="bg-card border border-card-border rounded-xl p-5 sm:p-8 md:p-12 shadow-sm flex flex-col items-center text-center space-y-6 sm:space-y-8 relative overflow-hidden">
            {/* Subtle background decoration */}
            <div className="absolute top-0 right-0 -mt-12 -mr-12 text-[160px] font-serif text-muted/30 select-none pointer-events-none">
              字
            </div>

            <div className="max-w-xl space-y-3 sm:space-y-4 relative z-10">
              <h2 className="text-xl sm:text-2xl font-serif font-semibold">Download the Complete Reference</h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                Grouped by school grade (1–6 and Secondary). Includes meaning, on'yomi, kun'yomi, romaji, grade, and JLPT level for every character.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 relative z-10 w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg rounded-full font-medium hover-elevate transition-all duration-300"
                onClick={handleDownload}
                disabled={isDownloading || isDownloadingPreview}
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    Generating Document...
                  </>
                ) : (
                  <>
                    <Download className="mr-3 h-5 w-5" />
                    Download Word Document (.docx)
                  </>
                )}
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg rounded-full font-medium hover-elevate transition-all duration-300"
                onClick={handleDownloadPreview}
                disabled={isDownloading || isDownloadingPreview}
              >
                {isDownloadingPreview ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    Generating Preview...
                  </>
                ) : (
                  <>
                    <FileText className="mr-3 h-5 w-5" />
                    Download 5-Page Preview
                  </>
                )}
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground pt-2 sm:pt-4 relative z-10">
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" />
                {kanjiCount.toLocaleString()} Characters
              </span>
              <span className="flex items-center gap-1.5">
                <FileText className="h-4 w-4" />
                Print-ready Layout
              </span>
            </div>
          </section>
        </div>

        {/* Live Preview Section */}
        <section className="space-y-6 sm:space-y-8">
          <div className="space-y-2 px-1">
            <h2 className="text-2xl sm:text-3xl font-serif font-semibold">Browse the Dataset</h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Preview the kanji data before downloading. Search by meaning, reading, or the character itself.
            </p>
          </div>
          <KanjiPreview />
        </section>

        {/* Anki Export Section */}
        <section className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
          <div className="bg-card border border-card-border rounded-xl p-5 sm:p-8 md:p-10 shadow-sm flex flex-col items-center text-center gap-4 sm:gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 text-[140px] font-serif text-muted/30 select-none pointer-events-none">
              憶
            </div>
            <div className="max-w-xl space-y-2 sm:space-y-3 relative z-10">
              <h2 className="text-xl sm:text-2xl font-serif font-semibold">Study with Anki</h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                Export all {ankiCardCount.toLocaleString()} kanji as ready-to-import flashcards — kanji on the front, meaning and readings on the back — for spaced-repetition review.
              </p>
            </div>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg rounded-full font-medium hover-elevate transition-all duration-300 relative z-10"
              onClick={handleDownloadAnki}
              disabled={isDownloadingAnki}
            >
              {isDownloadingAnki ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  Generating Deck...
                </>
              ) : (
                <>
                  <GraduationCap className="mr-3 h-5 w-5" />
                  Download Anki Deck
                </>
              )}
            </Button>
          </div>
        </section>

        {/* Hiragana & Katakana Section */}
        <section className="space-y-6 sm:space-y-8">
          <div className="max-w-3xl mx-auto text-center space-y-2 px-1">
            <h2 className="text-2xl sm:text-3xl font-serif font-semibold">Hiragana & Katakana Charts</h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              The complete kana syllabary — gojūon, dakuten/handakuten, and yōon — with romaji for every character.
            </p>
          </div>

          <div className="bg-card border border-card-border rounded-xl p-5 sm:p-8 md:p-12 shadow-sm flex flex-col items-center text-center gap-6">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg rounded-full font-medium hover-elevate transition-all duration-300"
              onClick={handleDownloadKana}
              disabled={isDownloadingKana}
            >
              {isDownloadingKana ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  Generating Charts...
                </>
              ) : (
                <>
                  <Languages className="mr-3 h-5 w-5" />
                  <span className="sm:hidden">Download Hiragana &amp; Katakana</span>
                  <span className="hidden sm:inline">
                    Download Hiragana &amp; Katakana Charts ({kanaCharCount.toLocaleString()} characters)
                  </span>
                </>
              )}
            </Button>
          </div>

          <KanaChart />
        </section>

        <footer className="pt-10 sm:pt-12 pb-6 border-t border-border text-center text-sm text-muted-foreground space-y-2 px-1">
          <p>Data sourced from KANJIDIC2. Organized by official grade levels.</p>
          <p className="italic text-primary/80">Made by Musa, for Musa.</p>
        </footer>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
