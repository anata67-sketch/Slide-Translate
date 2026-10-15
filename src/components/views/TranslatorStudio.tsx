import React, { useState } from 'react';
import { DeckData, SlideData } from '../../types';
import { translateAcademicText } from '../../services/geminiService';

interface TranslatorStudioProps {
  deck: DeckData;
  onSelectSlide: (slideNumber: number) => void;
  onOpenDeck: (deckName: string) => void;
  onIngestFile: (fileName: string) => void;
}

export const TranslatorStudio: React.FC<TranslatorStudioProps> = ({
  deck,
  onSelectSlide,
  onOpenDeck,
  onIngestFile,
}) => {
  // Queue state
  const [isQueuePaused, setIsQueuePaused] = useState(false);
  const [isPipelineRunning, setIsPipelineRunning] = useState(false);
  const [pipelineProgress, setPipelineProgress] = useState(29.16);
  const [activePageNum, setActivePageNum] = useState(7);

  // Engine toggles
  const [standardGlossary, setStandardGlossary] = useState(true);
  const [vowelOverlap, setVowelOverlap] = useState(true);
  const [termParens, setTermParens] = useState(true);

  // View switch: Grid vs Detailed
  const [viewMode, setViewMode] = useState<'grid' | 'detailed'>('grid');

  // Token bounding inspector state (Slide 07 focus)
  const defaultSourceText =
    'We update parameter θ using exponential moving average of gradient vectors with momentum coefficient β.';
  const defaultThaiText =
    'เราทำการปรับปรุงพารามิเตอร์ θ โดยใช้ค่าเฉลี่ยเคลื่อนที่แบบเอกซ์โพเนนเชียล (Exponential Moving Average) ของเวกเตอร์ความชัน ร่วมกับสัมประสิทธิ์โมเมนตัม β';

  const [activeSourceSegment, setActiveSourceSegment] = useState(defaultSourceText);
  const [activeThaiSegment, setActiveThaiSegment] = useState(defaultThaiText);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [commitMessage, setCommitMessage] = useState<string | null>(null);

  // Drag and drop feedback
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const togglePauseResume = () => {
    setIsQueuePaused(!isQueuePaused);
  };

  const runFullPipeline = () => {
    setIsPipelineRunning(true);
    let current = pipelineProgress;
    const interval = setInterval(() => {
      current += 6;
      if (current >= 100) {
        setPipelineProgress(100);
        setActivePageNum(deck.totalPages);
        setIsPipelineRunning(false);
        clearInterval(interval);
      } else {
        setPipelineProgress(Math.min(100, Math.round(current)));
        setActivePageNum(Math.min(deck.totalPages, Math.floor((current / 100) * deck.totalPages)));
      }
    }, 400);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const name = e.target.files[0].name;
      onIngestFile(name);
    }
  };

  const handleRegenerateThai = async () => {
    setIsRegenerating(true);
    try {
      const res = await translateAcademicText(activeSourceSegment, {
        includeParentheses: termParens,
        glossaryStandard: standardGlossary,
        vowelOverlapPreservation: vowelOverlap,
      });
      setActiveThaiSegment(res.translatedText);
      setCommitMessage('Synthesized with Gemini-Flash API (BLEU: ' + res.bleuScore + ')');
      setTimeout(() => setCommitMessage(null), 3500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleCommitSegment = () => {
    setCommitMessage('Segment committed to Slide 07 layer memory cache.');
    setTimeout(() => setCommitMessage(null), 2500);
  };

  return (
    <div className="flex flex-col w-full text-on-surface antialiased select-none pb-12">
      {/* Section 1: Header Sub-bar & Deck Meta Bar */}
      <div className="w-full bg-pure-white px-margin-desktop py-space-sm flex flex-wrap items-center justify-between gap-space-md shadow-sm border-b border-zinc-subtle">
        <div className="flex items-center gap-space-md min-w-0">
          <div className="w-9 h-9 bg-surface-dim rounded flex items-center justify-center shrink-0 border border-zinc-subtle">
            <span className="material-symbols-outlined text-pure-black text-[20px]">picture_as_pdf</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-space-xs">
              <span className="font-title-sm text-title-sm text-pure-black font-semibold truncate">
                {deck.filename}
              </span>
              <span className="font-label-sm text-label-sm text-zinc-muted px-1.5 py-0.5 bg-surface-dim rounded shrink-0 border border-zinc-subtle">
                {deck.version}
              </span>
            </div>
            <div className="flex items-center gap-space-sm font-label-sm text-label-sm text-zinc-muted">
              <span>{deck.totalPages} TOTAL PAGES</span>
              <span>•</span>
              <span>{deck.fileSize} ({deck.dpi} DPI)</span>
              <span>•</span>
              <span className="text-zinc-charcoal font-medium">SRC: {deck.sourceLang} ➔ TGT: {deck.targetLang}</span>
            </div>
          </div>
        </div>

        {/* Live Status & Monochrome Action Controls */}
        <div className="flex items-center gap-space-sm">
          <div className="flex items-center gap-space-xs px-2.5 py-1 bg-surface-dim rounded border border-zinc-subtle">
            <span
              className={`w-2 h-2 rounded-full bg-pure-black ${
                !isQueuePaused ? 'animate-pulse' : 'opacity-40'
              }`}
            ></span>
            <span className="font-label-sm text-label-sm text-pure-black font-medium uppercase tracking-wide">
              {isQueuePaused ? 'Queue Paused' : `Processing Page ${activePageNum} / ${deck.totalPages}`}
            </span>
          </div>

          <button
            onClick={togglePauseResume}
            className="flex items-center gap-space-xs px-3 py-1.5 bg-surface-dim hover:bg-zinc-subtle text-pure-black rounded transition-colors font-body-sm text-body-sm cursor-pointer border border-zinc-subtle"
          >
            <span className="material-symbols-outlined text-[16px]">
              {isQueuePaused ? 'play_arrow' : 'pause'}
            </span>
            <span>{isQueuePaused ? 'Resume Queue' : 'Pause Queue'}</span>
          </button>

          <button
            onClick={runFullPipeline}
            disabled={isPipelineRunning}
            className="flex items-center gap-space-xs px-3 py-1.5 bg-pure-black hover:bg-zinc-charcoal text-pure-white rounded transition-colors font-body-sm text-body-sm cursor-pointer disabled:opacity-50"
          >
            <span
              className={`material-symbols-outlined text-[16px] ${
                isPipelineRunning ? 'animate-spin' : ''
              }`}
            >
              {isPipelineRunning ? 'progress_activity' : 'auto_fix_high'}
            </span>
            <span>{isPipelineRunning ? 'Running Pipeline...' : 'Run Full Pipeline'}</span>
          </button>
        </div>
      </div>

      {/* Main Studio Workspace: 2-Column Asymmetric Workbench */}
      <div className="w-full p-margin-desktop grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Left Column (8 cols): Upload, Pipeline Stepper, Slide Deck Grid */}
        <div className="lg:col-span-8 flex flex-col gap-space-lg">
          {/* Section 2: Upload Zone & Recent Decks Drawer */}
          <div className="bg-pure-white p-space-lg rounded shadow-sm flex flex-col gap-space-md border border-zinc-subtle">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-title-sm text-title-sm text-pure-black font-semibold">
                  Deck Ingestion & Rendering Engine
                </div>
                <div className="font-body-sm text-body-sm text-zinc-muted">
                  Drag & drop raw course lecture decks or multi-page scanned slide packets.
                </div>
              </div>
              <span className="font-label-sm text-label-sm text-zinc-muted uppercase bg-surface-dim px-2 py-0.5 rounded border border-zinc-subtle">
                PDF / PNG / TIFF
              </span>
            </div>

            {/* Drag & Drop Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingOver(true);
              }}
              onDragLeave={() => setIsDraggingOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingOver(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  onIngestFile(e.dataTransfer.files[0].name);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`relative group cursor-pointer p-space-lg rounded transition-all flex flex-col items-center justify-center text-center border-2 border-dashed ${
                isDraggingOver
                  ? 'bg-zinc-subtle border-pure-black'
                  : 'bg-surface-dim hover:bg-pure-white border-zinc-border/60 hover:border-pure-black'
              }`}
            >
              <input
                ref={fileInputRef}
                accept=".pdf,.png,.jpg,.jpeg,.tiff"
                className="hidden"
                type="file"
                onChange={handleFileUpload}
              />
              <div className="w-12 h-12 rounded bg-pure-white group-hover:bg-pure-black text-pure-black group-hover:text-pure-white flex items-center justify-center transition-colors shadow-sm mb-space-sm border border-zinc-subtle">
                <span className="material-symbols-outlined text-[24px]">cloud_upload</span>
              </div>
              <div className="font-title-sm text-title-sm text-pure-black font-medium">
                Drop lecture PDF or raster deck archive here, or{' '}
                <span className="underline underline-offset-2">browse local drive</span>
              </div>
              <div className="font-label-sm text-label-sm text-zinc-muted mt-space-xs">
                Supports vector vector fonts, LaTeX Math equations, & embedded diagrams up to 100MB
              </div>
            </div>

            {/* Recent Uploads Mini Drawer */}
            <div className="flex items-center justify-between pt-space-xs font-label-sm text-label-sm">
              <span className="text-zinc-muted uppercase">Recent Ingestions:</span>
              <div className="flex items-center gap-space-md overflow-x-auto">
                <button
                  onClick={() => onOpenDeck('CS189_Optimization_P1.pdf')}
                  className="text-zinc-charcoal hover:text-pure-black underline underline-offset-2 truncate max-w-[200px] cursor-pointer"
                >
                  CS189_Optimization_P1.pdf
                </button>
                <span className="text-zinc-subtle">|</span>
                <button
                  onClick={() => onOpenDeck('STATS214_Bayesian_Deck.pdf')}
                  className="text-zinc-charcoal hover:text-pure-black underline underline-offset-2 truncate max-w-[200px] cursor-pointer"
                >
                  STATS214_Bayesian_Deck.pdf
                </button>
                <span className="text-zinc-subtle">|</span>
                <button
                  onClick={() => onOpenDeck('MATH54_Linear_Algebra_08.pdf')}
                  className="text-zinc-charcoal hover:text-pure-black underline underline-offset-2 truncate max-w-[200px] cursor-pointer"
                >
                  MATH54_Linear_Algebra_08.pdf
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Real-Time Multi-Stage Processing Pipeline Card */}
          <div className="bg-pure-white p-space-lg rounded shadow-sm flex flex-col gap-space-lg border border-zinc-subtle">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-pure-black text-[20px]">account_tree</span>
                <h2 className="font-headline-md text-headline-md text-pure-black font-semibold">
                  Slide Reconstruction Pipeline
                </h2>
              </div>
              <div className="font-label-sm text-label-sm text-pure-black bg-surface-dim px-2.5 py-1 rounded font-medium border border-zinc-subtle">
                GLOBAL ESTIMATED ETA: 01m 42s
              </div>
            </div>

            {/* Step Pipeline List */}
            <div className="space-y-space-md">
              {/* Step 1: Decomposition */}
              <div className="p-space-md rounded bg-surface-dim flex items-start justify-between gap-space-md border border-zinc-subtle">
                <div className="flex items-start gap-space-md">
                  <div className="w-6 h-6 rounded bg-pure-black text-pure-white flex items-center justify-center font-label-sm text-label-sm font-semibold shrink-0">
                    <span className="material-symbols-outlined text-[14px]">check</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-space-sm">
                      <span className="font-title-sm text-title-sm text-pure-black font-semibold">
                        1. Document Decomposition & Hi-Res Rasterization
                      </span>
                      <span className="font-label-sm text-label-sm px-1.5 py-0.2 bg-pure-black text-pure-white rounded">
                        100% DONE
                      </span>
                    </div>
                    <div className="font-body-sm text-body-sm text-zinc-muted mt-space-xs">
                      24 canvas buffers instantiated at 300 DPI (4096 × 2304 px). Vector glyphs rasterized with antialiasing.
                    </div>
                  </div>
                </div>
                <span className="font-label-sm text-label-sm text-zinc-charcoal whitespace-nowrap">2.1s (Cached)</span>
              </div>

              {/* Step 2: OCR Bounding Extraction */}
              <div className="p-space-md rounded bg-surface-dim flex items-start justify-between gap-space-md border border-zinc-subtle">
                <div className="flex items-start gap-space-md">
                  <div className="w-6 h-6 rounded bg-pure-black text-pure-white flex items-center justify-center font-label-sm text-label-sm font-semibold shrink-0">
                    <span className="material-symbols-outlined text-[14px]">check</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-space-sm">
                      <span className="font-title-sm text-title-sm text-pure-black font-semibold">
                        2. Vision OCR & Bounding Polygon Extraction
                      </span>
                      <span className="font-label-sm text-label-sm px-1.5 py-0.2 bg-pure-black text-pure-white rounded">
                        100% DONE
                      </span>
                    </div>
                    <div className="font-body-sm text-body-sm text-zinc-muted mt-space-xs">
                      Isolated 418 text nodes and 34 LaTeX formula blocks with normalized spatial bounding coordinates{' '}
                      <code className="font-label-sm text-label-sm bg-pure-white px-1 py-0.5 rounded text-pure-black border border-zinc-subtle">
                        [x, y, w, h]
                      </code>
                      .
                    </div>
                  </div>
                </div>
                <span className="font-label-sm text-label-sm text-zinc-charcoal whitespace-nowrap">5.8s Total</span>
              </div>

              {/* Step 3: Academic Translation (Active Running) */}
              <div className="p-space-md rounded bg-pure-white shadow-sm flex flex-col gap-space-sm border-2 border-pure-black">
                <div className="flex items-start justify-between gap-space-md">
                  <div className="flex items-start gap-space-md">
                    <div className="w-6 h-6 rounded bg-pure-black text-pure-white flex items-center justify-center font-label-sm text-label-sm font-semibold shrink-0 animate-spin">
                      <span className="material-symbols-outlined text-[14px]">progress_activity</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-space-sm">
                        <span className="font-title-sm text-title-sm text-pure-black font-semibold">
                          3. Context-Aware Academic Thai Translation (Gemini-Flash API)
                        </span>
                        <span className="font-label-sm text-label-sm px-1.5 py-0.2 bg-surface-dim text-pure-black font-semibold rounded border border-zinc-subtle">
                          STAGE ACTIVE
                        </span>
                      </div>
                      <div className="font-body-sm text-body-sm text-zinc-charcoal mt-space-xs">
                        Synthesizing Thai scholarly terminology using Royal Society guidelines with fallback English term retention.
                      </div>
                    </div>
                  </div>
                  <span className="font-label-sm text-label-sm text-pure-black font-semibold whitespace-nowrap">
                    {activePageNum} / {deck.totalPages} Pages ({Math.round(pipelineProgress)}%)
                  </span>
                </div>

                {/* Dynamic Progress Visual */}
                <div className="w-full bg-surface-dim h-2 rounded overflow-hidden mt-space-xs border border-zinc-subtle">
                  <div
                    className="bg-pure-black h-full transition-all duration-300"
                    style={{ width: `${pipelineProgress}%` }}
                  ></div>
                </div>

                {/* Latency & Node Telemetry */}
                <div className="flex flex-wrap items-center justify-between pt-space-xs font-label-sm text-label-sm text-zinc-muted">
                  <div className="flex items-center gap-space-md">
                    <span>Avg Latency: <strong className="text-pure-black font-medium">342ms / token batch</strong></span>
                    <span>•</span>
                    <span>BLEU Consistency: <strong className="text-pure-black font-medium">94.8%</strong></span>
                  </div>
                  <div className="flex items-center gap-space-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-pure-black animate-pulse"></span>
                    <span>Active thread: Worker #03 (Processing Slide 07)</span>
                  </div>
                </div>
              </div>

              {/* Step 4: Background Inpainting Mask & Sarabun Font Layout Rebuilding (Queued) */}
              <div className="p-space-md rounded bg-surface-dim opacity-75 flex items-start justify-between gap-space-md border border-zinc-subtle">
                <div className="flex items-start gap-space-md">
                  <div className="w-6 h-6 rounded bg-zinc-subtle text-zinc-muted flex items-center justify-center font-label-sm text-label-sm shrink-0 border border-zinc-border/40">
                    4
                  </div>
                  <div>
                    <div className="flex items-center gap-space-sm">
                      <span className="font-title-sm text-title-sm text-zinc-muted font-semibold">
                        4. Background Inpainting Mask & Sarabun Font Layout Rebuilding
                      </span>
                      <span className="font-label-sm text-label-sm px-1.5 py-0.2 bg-zinc-subtle text-zinc-muted rounded">
                        QUEUED
                      </span>
                    </div>
                    <div className="font-body-sm text-body-sm text-zinc-muted mt-space-xs">
                      Diffusion-based text erasure preserving underlying charts, gridlines, and mathematical equations followed by Thai typography re-flow.
                    </div>
                  </div>
                </div>
                <span className="font-label-sm text-label-sm text-zinc-muted whitespace-nowrap">Pending #3</span>
              </div>
            </div>
          </div>

          {/* Section 4: Slide Grid Preview Deck */}
          <div className="bg-pure-white p-space-lg rounded shadow-sm flex flex-col gap-space-md border border-zinc-subtle">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-title-sm text-title-sm text-pure-black font-semibold">
                  Slide Extractor & Visual Inspection Grid
                </div>
                <div className="font-body-sm text-body-sm text-zinc-muted">
                  Click any slide card to isolate bounding frames and review bilingual segments.
                </div>
              </div>
              <div className="flex items-center gap-space-xs bg-surface-dim p-0.5 rounded border border-zinc-subtle">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-2 py-1 rounded font-label-sm text-label-sm cursor-pointer transition-all ${
                    viewMode === 'grid'
                      ? 'text-pure-black bg-pure-white shadow-sm font-semibold'
                      : 'text-zinc-muted hover:text-pure-black'
                  }`}
                >
                  Grid (3×2)
                </button>
                <button
                  onClick={() => setViewMode('detailed')}
                  className={`px-2 py-1 rounded font-label-sm text-label-sm cursor-pointer transition-all ${
                    viewMode === 'detailed'
                      ? 'text-pure-black bg-pure-white shadow-sm font-semibold'
                      : 'text-zinc-muted hover:text-pure-black'
                  }`}
                >
                  Detailed
                </button>
              </div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-space-md">
              {/* Slide 01: Completed */}
              <div
                onClick={() => onSelectSlide(1)}
                className="p-space-sm bg-surface-dim hover:bg-zinc-subtle transition-all rounded cursor-pointer group flex flex-col gap-space-xs border border-zinc-subtle"
              >
                <div className="relative bg-pure-white aspect-video rounded overflow-hidden flex flex-col justify-between p-space-sm border border-zinc-subtle">
                  <div className="flex justify-between items-center z-10">
                    <span className="font-label-sm text-label-sm px-1.5 py-0.5 bg-pure-black text-pure-white rounded">
                      SLIDE 01
                    </span>
                    <span className="material-symbols-outlined text-[16px] text-pure-black">check_circle</span>
                  </div>
                  <div className="text-center font-headline-md text-headline-md text-pure-black font-bold uppercase tracking-tight">
                    CS402: DEEP LEARNING
                  </div>
                  <div className="font-label-sm text-label-sm text-zinc-muted text-center truncate">
                    บทที่ 4: การหาค่าที่เหมาะสม (Optimization)
                  </div>
                </div>
                <div className="flex items-center justify-between px-1 font-label-sm text-label-sm text-zinc-muted">
                  <span>Title & Overview</span>
                  <span className="text-pure-black font-semibold">100% Ready</span>
                </div>
              </div>

              {/* Slide 02: Completed */}
              <div
                onClick={() => onSelectSlide(2)}
                className="p-space-sm bg-surface-dim hover:bg-zinc-subtle transition-all rounded cursor-pointer group flex flex-col gap-space-xs border border-zinc-subtle"
              >
                <div className="relative bg-pure-white aspect-video rounded overflow-hidden flex flex-col justify-between p-space-sm border border-zinc-subtle">
                  <div className="flex justify-between items-center z-10">
                    <span className="font-label-sm text-label-sm px-1.5 py-0.5 bg-pure-black text-pure-white rounded">
                      SLIDE 02
                    </span>
                    <span className="material-symbols-outlined text-[16px] text-pure-black">check_circle</span>
                  </div>
                  <div className="space-y-1">
                    <div className="h-2 w-3/4 bg-pure-black rounded"></div>
                    <div className="h-1.5 w-1/2 bg-zinc-muted rounded"></div>
                    <div className="h-1.5 w-2/3 bg-zinc-muted rounded"></div>
                  </div>
                  <div className="font-label-sm text-label-sm text-zinc-muted truncate">
                    Loss Functions / ฟังก์ชันการสูญเสีย
                  </div>
                </div>
                <div className="flex items-center justify-between px-1 font-label-sm text-label-sm text-zinc-muted">
                  <span>Mathematical Proofs</span>
                  <span className="text-pure-black font-semibold">100% Ready</span>
                </div>
              </div>

              {/* Slide 03: Completed */}
              <div
                onClick={() => onSelectSlide(3)}
                className="p-space-sm bg-surface-dim hover:bg-zinc-subtle transition-all rounded cursor-pointer group flex flex-col gap-space-xs border border-zinc-subtle"
              >
                <div className="relative bg-pure-white aspect-video rounded overflow-hidden flex flex-col justify-between p-space-sm border border-zinc-subtle">
                  <div className="flex justify-between items-center z-10">
                    <span className="font-label-sm text-label-sm px-1.5 py-0.5 bg-pure-black text-pure-white rounded">
                      SLIDE 03
                    </span>
                    <span className="material-symbols-outlined text-[16px] text-pure-black">check_circle</span>
                  </div>
                  {/* Mini SVG Graph */}
                  <svg className="w-full h-12 text-pure-black my-auto" fill="none" viewBox="0 0 100 30">
                    <path
                      d="M0,28 C20,25 35,5 50,22 C65,30 80,10 100,5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <circle cx="50" cy="22" fill="currentColor" r="2.5" />
                    <circle cx="100" cy="5" fill="currentColor" r="2.5" />
                  </svg>
                  <div className="font-label-sm text-label-sm text-zinc-muted truncate">
                    Gradient Descent Dynamics
                  </div>
                </div>
                <div className="flex items-center justify-between px-1 font-label-sm text-label-sm text-zinc-muted">
                  <span>Diagram & Inpainting</span>
                  <span className="text-pure-black font-semibold">100% Ready</span>
                </div>
              </div>

              {/* Slide 07: CURRENTLY ACTIVE / IN PROGRESS */}
              <div
                onClick={() => onSelectSlide(7)}
                className="p-space-sm bg-pure-black text-pure-white transition-all rounded cursor-pointer shadow-md flex flex-col gap-space-xs ring-2 ring-pure-black"
              >
                <div className="relative bg-zinc-charcoal aspect-video rounded overflow-hidden flex flex-col justify-between p-space-sm border border-zinc-charcoal">
                  <div className="flex justify-between items-center z-10">
                    <span className="font-label-sm text-label-sm px-1.5 py-0.5 bg-pure-white text-pure-black font-bold rounded">
                      SLIDE 07 (ACTIVE)
                    </span>
                    <span className="material-symbols-outlined text-[16px] text-pure-white animate-spin">
                      sync
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center my-auto">
                    <div className="font-label-md text-label-md font-mono text-pure-white font-semibold">
                      SGD with Momentum
                    </div>
                    <div className="font-body-sm text-body-sm text-zinc-subtle mt-0.5">
                      การเคลื่อนที่เชิงโมเมนตัม
                    </div>
                  </div>
                  <div className="w-full bg-graphite-dark h-1.5 rounded overflow-hidden">
                    <div className="bg-pure-white h-full animate-pulse" style={{ width: '72%' }}></div>
                  </div>
                </div>
                <div className="flex items-center justify-between px-1 font-label-sm text-label-sm text-zinc-subtle">
                  <span>Token Alignment: 72%</span>
                  <span className="text-pure-white font-medium">Translating...</span>
                </div>
              </div>

              {/* Slide 08: Queued */}
              <div
                onClick={() => onSelectSlide(8)}
                className="p-space-sm bg-surface-dim hover:bg-zinc-subtle transition-all rounded cursor-pointer group flex flex-col gap-space-xs opacity-80 border border-zinc-subtle"
              >
                <div className="relative bg-pure-white aspect-video rounded overflow-hidden flex flex-col justify-between p-space-sm border border-zinc-subtle">
                  <div className="flex justify-between items-center z-10">
                    <span className="font-label-sm text-label-sm px-1.5 py-0.5 bg-zinc-subtle text-zinc-charcoal rounded">
                      SLIDE 08
                    </span>
                    <span className="material-symbols-outlined text-[16px] text-zinc-muted">schedule</span>
                  </div>
                  <div className="space-y-1 my-auto">
                    <div className="h-2 w-full bg-surface-dim rounded"></div>
                    <div className="h-2 w-4/5 bg-surface-dim rounded"></div>
                  </div>
                  <div className="font-label-sm text-label-sm text-zinc-muted truncate">
                    Adam Optimizer Algorithm
                  </div>
                </div>
                <div className="flex items-center justify-between px-1 font-label-sm text-label-sm text-zinc-muted">
                  <span>Vector OCR Queued</span>
                  <span className="text-zinc-muted">Pending</span>
                </div>
              </div>

              {/* Slide 09: Queued */}
              <div
                onClick={() => onSelectSlide(9)}
                className="p-space-sm bg-surface-dim hover:bg-zinc-subtle transition-all rounded cursor-pointer group flex flex-col gap-space-xs opacity-80 border border-zinc-subtle"
              >
                <div className="relative bg-pure-white aspect-video rounded overflow-hidden flex flex-col justify-between p-space-sm border border-zinc-subtle">
                  <div className="flex justify-between items-center z-10">
                    <span className="font-label-sm text-label-sm px-1.5 py-0.5 bg-zinc-subtle text-zinc-charcoal rounded">
                      SLIDE 09
                    </span>
                    <span className="material-symbols-outlined text-[16px] text-zinc-muted">schedule</span>
                  </div>
                  <div className="space-y-1 my-auto">
                    <div className="h-2 w-2/3 bg-surface-dim rounded"></div>
                    <div className="h-2 w-1/2 bg-surface-dim rounded"></div>
                  </div>
                  <div className="font-label-sm text-label-sm text-zinc-muted truncate">
                    Hyperparameter Benchmarks
                  </div>
                </div>
                <div className="flex items-center justify-between px-1 font-label-sm text-label-sm text-zinc-muted">
                  <span>Vector OCR Queued</span>
                  <span className="text-zinc-muted">Pending</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Translation Parameters & Scholarly Tone Inspector */}
        <div className="lg:col-span-4 flex flex-col gap-space-lg">
          {/* Section 5: Translation & Academic Tone Settings Panel */}
          <div className="bg-pure-white p-space-lg rounded shadow-sm flex flex-col gap-space-lg border border-zinc-subtle">
            <div>
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-pure-black text-[20px]">tune</span>
                <h3 className="font-headline-md text-headline-md text-pure-black font-semibold">
                  Thai Scholarly Engine
                </h3>
              </div>
              <div className="font-body-sm text-body-sm text-zinc-muted mt-0.5">
                Parameters for Royal Society academic Thai terminology.
              </div>
            </div>

            <div className="space-y-space-md">
              {/* Control 1: Academic Glossary Toggle */}
              <div className="p-space-md bg-surface-dim rounded flex items-start justify-between gap-space-md border border-zinc-subtle">
                <div className="flex-1">
                  <div className="font-title-sm text-title-sm text-pure-black font-medium">
                    Standard Academic Glossary
                  </div>
                  <div className="font-body-sm text-body-sm text-zinc-muted mt-space-xs">
                    Forces exact standardized terminology (e.g., 'Optimization' ➔ 'การหาค่าเหมาะที่สุด', 'Gradient' ➔ 'ความชัน').
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                  <input
                    checked={standardGlossary}
                    onChange={(e) => setStandardGlossary(e.target.checked)}
                    className="sr-only peer"
                    type="checkbox"
                  />
                  <div className="w-11 h-6 bg-zinc-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-pure-white after:border-zinc-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pure-black"></div>
                </label>
              </div>

              {/* Control 2: Thai Tone & Vowel Overlap Protection */}
              <div className="p-space-md bg-surface-dim rounded flex items-start justify-between gap-space-md border border-zinc-subtle">
                <div className="flex-1">
                  <div className="font-title-sm text-title-sm text-pure-black font-medium">
                    Vowel/Tone Overlap Preservation
                  </div>
                  <div className="font-body-sm text-body-sm text-zinc-muted mt-space-xs">
                    Micro-adjusts vertical line-height for floating Thai tone marks (ไม้เอก, ไม้โท) and upper/lower vowels (สระอิ, สระอุ) against math formulas.
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                  <input
                    checked={vowelOverlap}
                    onChange={(e) => setVowelOverlap(e.target.checked)}
                    className="sr-only peer"
                    type="checkbox"
                  />
                  <div className="w-11 h-6 bg-zinc-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-pure-white after:border-zinc-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pure-black"></div>
                </label>
              </div>

              {/* Control 3: English Term Retention in Parentheses */}
              <div className="p-space-md bg-surface-dim rounded flex items-start justify-between gap-space-md border border-zinc-subtle">
                <div className="flex-1">
                  <div className="font-title-sm text-title-sm text-pure-black font-medium">
                    Technical Parentheses Retention
                  </div>
                  <div className="font-body-sm text-body-sm text-zinc-muted mt-space-xs">
                    Append original English terminology in brackets after first occurrence (e.g., การถดถอยเชิงเส้น (Linear Regression)).
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                  <input
                    checked={termParens}
                    onChange={(e) => setTermParens(e.target.checked)}
                    className="sr-only peer"
                    type="checkbox"
                  />
                  <div className="w-11 h-6 bg-zinc-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-pure-white after:border-zinc-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pure-black"></div>
                </label>
              </div>

              {/* Font Typeface Selector */}
              <div className="space-y-space-xs">
                <label className="font-label-sm text-label-sm text-zinc-charcoal uppercase font-medium">
                  Rendered Typography Target
                </label>
                <div className="p-space-sm bg-surface-dim rounded flex items-center justify-between border border-zinc-subtle">
                  <span className="font-body-md text-body-md text-pure-black font-medium">
                    Sarabun (Official Royal Thai / Chulalongkorn)
                  </span>
                  <span className="font-label-sm text-label-sm bg-pure-white px-2 py-0.5 rounded text-pure-black font-semibold border border-zinc-subtle">
                    OTF / TTF
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Live Bounding Box & Token Inspector (Slide 07 Focus) */}
          <div className="bg-pure-white p-space-lg rounded shadow-sm flex flex-col gap-space-md border border-zinc-subtle">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-title-sm text-title-sm text-pure-black font-semibold">
                  Active Token Node Bounding
                </div>
                <div className="font-label-sm text-label-sm text-zinc-muted">
                  Slide 07 • Node #04 (Formula Descriptor)
                </div>
              </div>
              <span className="font-label-sm text-label-sm bg-surface-dim text-pure-black px-2 py-0.5 rounded font-mono border border-zinc-subtle">
                x:142, y:308
              </span>
            </div>

            {/* Bilingual Card Preview */}
            <div className="p-space-md rounded bg-surface-dim flex flex-col gap-space-sm border border-zinc-subtle">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-zinc-muted uppercase">
                  Source English Segment
                </span>
                <span className="font-label-sm text-label-sm text-pure-black bg-pure-white px-1.5 py-0.2 rounded border border-zinc-subtle">
                  OCR: 99.4%
                </span>
              </div>
              <div className="font-body-sm text-body-sm text-pure-black font-mono bg-pure-white p-space-sm rounded border border-zinc-subtle">
                "{activeSourceSegment}"
              </div>

              <div className="flex items-center justify-between mt-space-xs">
                <span className="font-label-sm text-label-sm text-zinc-muted uppercase">
                  Synthesized Thai Segment
                </span>
                <span className="font-label-sm text-label-sm text-pure-black bg-pure-white px-1.5 py-0.2 rounded border border-zinc-subtle">
                  BLEU: 96.2
                </span>
              </div>
              <div className="font-body-sm text-body-sm text-pure-black bg-pure-white p-space-sm rounded border border-zinc-subtle">
                "{activeThaiSegment}"
              </div>
            </div>

            {commitMessage && (
              <div className="text-[11px] text-zinc-charcoal bg-surface-dim p-2 rounded border border-zinc-border flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-pure-black">info</span>
                <span>{commitMessage}</span>
              </div>
            )}

            {/* Micro Actions */}
            <div className="grid grid-cols-2 gap-space-sm pt-space-xs">
              <button
                onClick={handleRegenerateThai}
                disabled={isRegenerating}
                className="px-3 py-2 bg-surface-dim hover:bg-zinc-subtle text-pure-black rounded font-body-sm text-body-sm transition-colors text-center cursor-pointer border border-zinc-subtle disabled:opacity-50 flex items-center justify-center gap-1"
              >
                {isRegenerating && (
                  <span className="material-symbols-outlined text-[14px] animate-spin">
                    progress_activity
                  </span>
                )}
                <span>{isRegenerating ? 'Translating...' : 'Regenerate Thai'}</span>
              </button>
              <button
                onClick={handleCommitSegment}
                className="px-3 py-2 bg-pure-black text-pure-white hover:bg-zinc-charcoal rounded font-body-sm text-body-sm transition-colors text-center cursor-pointer shadow-sm"
              >
                Commit Segment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
