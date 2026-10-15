import React, { useState } from 'react';
import { Sidebar, NavPath } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { TranslatorStudio } from './components/views/TranslatorStudio';
import { SideBySideReviewer } from './components/views/SideBySideReviewer';
import { OcrInspector } from './components/views/OcrInspector';
import { AcademicGlossary } from './components/views/AcademicGlossary';
import { BatchJobs } from './components/views/BatchJobs';
import { ApiDocs } from './components/views/ApiDocs';
import { ExportModal } from './components/modals/ExportModal';
import { INITIAL_DECKS } from './data/mockData';
import { DeckData, SlideData } from './types';

export default function App() {
  const [currentPath, setCurrentPath] = useState<NavPath>('translator-studio');
  const [decks, setDecks] = useState<DeckData[]>(INITIAL_DECKS);
  const [currentDeck, setCurrentDeck] = useState<DeckData>(INITIAL_DECKS[0]);
  const [activeSlideNumber, setActiveSlideNumber] = useState<number>(4);
  const [isReprocessing, setIsReprocessing] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [globalToast, setGlobalToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setGlobalToast(msg);
    setTimeout(() => setGlobalToast(null), 3000);
  };

  const handleSelectSlide = (slideNum: number) => {
    setActiveSlideNumber(slideNum);
    setCurrentPath('side-by-side-reviewer');
  };

  const handleReprocessSlide = () => {
    setIsReprocessing(true);
    setTimeout(() => {
      setIsReprocessing(false);
      showToast(`Slide ${activeSlideNumber} reprocessed via PaddleOCR & Gemini-Flash.`);
    }, 1200);
  };

  const handleOpenDeck = (deckFilename: string) => {
    const found = decks.find((d) => d.filename.toLowerCase() === deckFilename.toLowerCase());
    if (found) {
      setCurrentDeck(found);
      showToast(`Switched active deck to ${found.filename}`);
    } else {
      // Create new deck entry
      const newDeck: DeckData = {
        id: `deck-${Date.now()}`,
        filename: deckFilename,
        version: 'v1.0-TH',
        totalPages: 24,
        fileSize: '22.8 MB',
        dpi: 300,
        sourceLang: 'EN-US',
        targetLang: 'TH-ACADEMIC',
        status: 'ready',
        activePage: 1,
        slides: currentDeck.slides,
      };
      setDecks([newDeck, ...decks]);
      setCurrentDeck(newDeck);
      showToast(`Loaded deck: ${deckFilename}`);
    }
  };

  const handleIngestFile = (fileName: string) => {
    handleOpenDeck(fileName);
  };

  const currentSlide: SlideData =
    currentDeck.slides.find((s) => s.slideNumber === activeSlideNumber) ||
    currentDeck.slides[3] ||
    currentDeck.slides[0];

  return (
    <div className="min-h-screen bg-surface-dim font-body-md text-on-surface antialiased flex flex-col">
      {/* Fixed Left Sidebar */}
      <Sidebar
        currentPath={currentPath}
        onNavigate={setCurrentPath}
        currentDeck={currentDeck}
        decks={decks}
        onSelectDeck={setCurrentDeck}
      />

      {/* Main Container offset by 64 (w-64) */}
      <div className="pl-64 flex-1 flex flex-col">
        {/* Fixed Top Header */}
        <Header
          currentSlide={currentSlide}
          totalSlides={currentDeck.totalPages}
          onReprocess={handleReprocessSlide}
          onOpenExport={() => setIsExportModalOpen(true)}
          isReprocessing={isReprocessing}
        />

        {/* Global Toast Alert */}
        {globalToast && (
          <div className="fixed top-16 right-6 z-50 bg-pure-black text-pure-white px-4 py-2 rounded shadow-2xl font-body-sm flex items-center gap-2 border border-zinc-border animate-fade-in">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span>{globalToast}</span>
          </div>
        )}

        {/* Dynamic Route View */}
        <main className="relative pt-14 bg-surface-dim min-h-[calc(100vh-3.5rem)] flex-1">
          {currentPath === 'translator-studio' && (
            <TranslatorStudio
              deck={currentDeck}
              onSelectSlide={handleSelectSlide}
              onOpenDeck={handleOpenDeck}
              onIngestFile={handleIngestFile}
            />
          )}

          {currentPath === 'side-by-side-reviewer' && (
            <SideBySideReviewer
              deck={currentDeck}
              activeSlideNumber={activeSlideNumber}
              onSelectSlide={setActiveSlideNumber}
              onOpenExport={() => setIsExportModalOpen(true)}
            />
          )}

          {currentPath === 'ocr-inspector' && (
            <OcrInspector slide={currentSlide} onSelectSlide={setActiveSlideNumber} />
          )}

          {currentPath === 'glossary-management' && <AcademicGlossary />}

          {currentPath === 'batch-jobs' && <BatchJobs />}

          {currentPath === 'api-and-docs' && <ApiDocs />}
        </main>
      </div>

      {/* Export Target Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        deck={currentDeck}
      />
    </div>
  );
}
