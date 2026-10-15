import React, { useState, useRef, useEffect } from 'react';
import { DeckData, SlideData, BoundingBox } from '../../types';

interface SideBySideReviewerProps {
  deck: DeckData;
  activeSlideNumber: number;
  onSelectSlide: (slideNumber: number) => void;
  onOpenExport: () => void;
}

export const SideBySideReviewer: React.FC<SideBySideReviewerProps> = ({
  deck,
  activeSlideNumber,
  onSelectSlide,
  onOpenExport,
}) => {
  // Current active slide
  const currentSlide: SlideData =
    deck.slides.find((s) => s.slideNumber === activeSlideNumber) || deck.slides[3] || deck.slides[0];

  // View mode: 'side-by-side' | 'diff' | 'wipe'
  const [viewMode, setViewMode] = useState<'side-by-side' | 'diff' | 'wipe'>('side-by-side');

  // Zoom state: 50% to 200%
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Splitter position in % (default 50)
  const [splitPercent, setSplitPercent] = useState<number>(50);
  const isDraggingSplitter = useRef(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // HUD Overlays
  const [showBBoxes, setShowBBoxes] = useState(true);
  const [showMaskOverlay, setShowMaskOverlay] = useState(false);

  // Active BBox calibration in inspector
  const activeBBox: BoundingBox = currentSlide.boundingBoxes?.find((b) => b.id === 'BOX_04') ||
    currentSlide.boundingBoxes?.[0] || {
      id: 'BOX_04',
      x: 142,
      y: 310,
      w: 520,
      h: 84,
      sourceText:
        'Receptive Field Propagation: Deeper convolutional layers synthesize non-linear representations across broader spatial hierarchies.',
      targetText:
        'การแพร่ขยายของขอบเขตการรับรู้ (Receptive Field Propagation): ชั้นคอนโวลูชันที่ลึกกว่าจะทำการสังเคราะห์การแทนค่าแบบไม่เชิงเส้น (non-linear representations) ครอบคลุมลำดับชั้นเชิงพื้นที่ที่กว้างขึ้น',
      defaultTargetText:
        'การแพร่ขยายของขอบเขตการรับรู้ (Receptive Field Propagation): ชั้นคอนโวลูชันที่ลึกกว่าจะทำการสังเคราะห์การแทนค่าแบบไม่เชิงเส้น (non-linear representations) ครอบคลุมลำดับชั้นเชิงพื้นที่ที่กว้างขึ้น',
      fontSizePt: 16.5,
      confidence: 99.4,
      preservedTerms: ['Receptive Field', 'non-linear representations', 'Affine'],
    };

  const [fontSizePt, setFontSizePt] = useState<number>(activeBBox.fontSizePt || 16.5);
  const [thaiEditableText, setThaiEditableText] = useState<string>(activeBBox.targetText);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [activeBBoxIndex, setActiveBBoxIndex] = useState<number>(4);

  // Splitter dragging logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingSplitter.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const percentage = Math.max(20, Math.min(80, (relativeX / rect.width) * 100));
      setSplitPercent(percentage);
    };

    const handleMouseUp = () => {
      isDraggingSplitter.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleApplyCalibration = () => {
    setSavedMessage('Calibration applied. Vector font & inpainting buffer re-rendered.');
    setTimeout(() => setSavedMessage(null), 3000);
  };

  const handleRevertMT = () => {
    setThaiEditableText(activeBBox.defaultTargetText);
    setFontSizePt(16.5);
  };

  return (
    <div className="flex flex-col w-full text-pure-black bg-surface-dim font-body-md select-none">
      {/* Top Auxiliary Action & Control Strip */}
      <div className="w-full bg-pure-white px-margin-desktop py-space-sm shadow-sm flex flex-wrap items-center justify-between gap-space-md border-b border-zinc-subtle">
        <div className="flex items-center gap-space-md">
          <div className="flex items-center gap-space-xs bg-surface-dim px-2.5 py-1 rounded border border-zinc-subtle">
            <span className="font-label-sm text-label-sm text-zinc-muted uppercase tracking-wider">INDEX</span>
            <span className="font-label-md text-label-md text-pure-black font-semibold">
              {String(currentSlide.slideNumber).padStart(2, '0')} / {deck.totalPages}
            </span>
          </div>
          <div>
            <h1 className="font-title-sm text-title-sm text-pure-black tracking-tight flex items-center gap-space-xs">
              <span>{currentSlide.title}</span>
              <span className="font-label-sm text-label-sm bg-surface-container-highest text-graphite-dark px-1.5 py-0.2 rounded font-medium">
                CONF: {currentSlide.confidence ? `${currentSlide.confidence}%` : '99.2%'}
              </span>
            </h1>
            <p className="font-body-sm text-body-sm text-zinc-muted">
              Preserving vector math strokes & receptive field topology
            </p>
          </div>
        </div>

        {/* View Mode Switches & Canvas Controls */}
        <div className="flex items-center gap-space-md flex-wrap">
          <div className="flex items-center bg-surface-dim p-0.5 rounded border border-zinc-subtle">
            <button
              onClick={() => setViewMode('side-by-side')}
              className={`px-3 py-1 font-label-md text-label-md rounded transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'side-by-side'
                  ? 'text-pure-white bg-pure-black shadow-sm font-semibold'
                  : 'text-zinc-charcoal hover:text-pure-black'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">view_column</span>
              <span>Side-by-Side 50:50</span>
            </button>
            <button
              onClick={() => setViewMode('diff')}
              className={`px-3 py-1 font-label-md text-label-md rounded transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'diff'
                  ? 'text-pure-white bg-pure-black shadow-sm font-semibold'
                  : 'text-zinc-charcoal hover:text-pure-black'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">difference</span>
              <span>Diff Overlay</span>
            </button>
            <button
              onClick={() => setViewMode('wipe')}
              className={`px-3 py-1 font-label-md text-label-md rounded transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'wipe'
                  ? 'text-pure-white bg-pure-black shadow-sm font-semibold'
                  : 'text-zinc-charcoal hover:text-pure-black'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">splitscreen</span>
              <span>Wipe Slider</span>
            </button>
          </div>

          <div className="h-5 w-px bg-zinc-subtle"></div>

          {/* Zoom HUD Controls */}
          <div className="flex items-center bg-surface-dim rounded px-1 py-0.5 border border-zinc-subtle">
            <button
              onClick={() => setZoomLevel((prev) => Math.max(50, prev - 10))}
              className="w-7 h-7 flex items-center justify-center text-zinc-charcoal hover:text-pure-black hover:bg-pure-white rounded transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <span className="material-symbols-outlined text-[16px]">remove</span>
            </button>
            <span className="font-label-sm text-label-sm px-2 text-pure-black font-medium min-w-[48px] text-center">
              {zoomLevel}%
            </span>
            <button
              onClick={() => setZoomLevel((prev) => Math.min(200, prev + 10))}
              className="w-7 h-7 flex items-center justify-center text-zinc-charcoal hover:text-pure-black hover:bg-pure-white rounded transition-colors cursor-pointer"
              title="Zoom In"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
            </button>
            <button
              onClick={() => setZoomLevel(100)}
              className="ml-1 px-2 py-0.5 text-zinc-charcoal hover:text-pure-black font-label-sm text-label-sm bg-pure-white rounded shadow-sm border border-zinc-subtle cursor-pointer"
            >
              Fit Width
            </button>
          </div>

          <div className="h-5 w-px bg-zinc-subtle"></div>

          <div className="flex items-center gap-space-xs">
            <button
              onClick={() => setShowMaskOverlay(!showMaskOverlay)}
              className={`px-3 py-1.5 font-body-sm text-body-sm rounded transition-colors flex items-center gap-1.5 cursor-pointer border ${
                showMaskOverlay
                  ? 'bg-pure-black text-pure-white border-pure-black'
                  : 'bg-surface-dim hover:bg-surface-container-highest text-graphite-dark border-zinc-subtle'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">tune</span>
              <span>Inpaint Mask</span>
            </button>
            <button
              onClick={onOpenExport}
              className="px-3.5 py-1.5 bg-pure-black hover:bg-zinc-charcoal text-pure-white font-body-sm text-body-sm rounded shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
              <span className="font-medium tracking-tight">Export Translated PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Working Canvas Workspace: Dual Viewport + Sticky Inspector */}
      <div className="flex flex-1 flex-col lg:flex-row overflow-hidden p-space-md gap-space-md">
        {/* Split Canvas Workspace Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-pure-white rounded-lg p-space-md shadow-sm relative border border-zinc-subtle">
          {/* Sync Status Header Tag */}
          <div className="flex items-center justify-between pb-space-sm mb-space-sm border-b border-zinc-subtle">
            <div className="flex items-center gap-space-sm">
              <span className="inline-block w-2 h-2 rounded-full bg-pure-black animate-pulse"></span>
              <span className="font-label-sm text-label-sm text-zinc-charcoal uppercase tracking-wider font-semibold">
                Dual Canvas Coordinate Sync: Active
              </span>
              <span className="font-label-sm text-label-sm text-zinc-muted bg-surface-dim px-2 py-0.5 rounded border border-zinc-subtle">
                Δx: 0.00px • Δy: 0.00px
              </span>
            </div>
            <div className="flex items-center gap-space-md text-zinc-muted font-label-sm text-label-sm">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">lock</span> Aspect 16:9 Locked
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">layers</span> 6 BBoxes Extracted
              </span>
            </div>
          </div>

          {/* Synchronized Viewport Box */}
          <div
            ref={containerRef}
            className="relative w-full flex-1 bg-surface-dim rounded flex flex-col md:flex-row overflow-hidden items-stretch border border-zinc-subtle min-h-[580px]"
          >
            {/* LEFT PANEL: SOURCE SLIDE (English) */}
            <div
              className={`flex flex-col bg-surface-container-lowest p-space-md relative min-h-[520px] transition-all overflow-hidden ${
                viewMode === 'diff' ? 'opacity-40' : ''
              }`}
              style={{
                flex: viewMode === 'wipe' ? `0 0 ${splitPercent}%` : viewMode === 'side-by-side' ? '1 1 50%' : '1 1 50%',
              }}
            >
              <div className="absolute top-2 left-2 z-10 bg-pure-black/90 backdrop-blur-sm text-pure-white px-2 py-0.5 rounded font-label-sm text-label-sm uppercase tracking-wider shadow-sm flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">menu_book</span>
                <span>Source (EN)</span>
              </div>

              {/* Slide Content Mockup: Vector Academic Slide Structure */}
              <div
                className="w-full h-full bg-pure-white rounded p-6 flex flex-col justify-between shadow-sm relative overflow-hidden select-text border border-zinc-subtle"
                style={{
                  transform: `scale(${zoomLevel / 100})`,
                  transformOrigin: 'top left',
                  width: `${(100 / zoomLevel) * 100}%`,
                }}
              >
                {/* Source Slide Header */}
                <div>
                  <div className="font-label-sm text-label-sm text-zinc-muted uppercase tracking-widest mb-1">
                    Lecture 04 • Optimization & Representations
                  </div>
                  <h2 className="font-headline-md text-headline-md text-pure-black font-semibold tracking-tight">
                    Feature Map Pooling & Convolution
                  </h2>
                  <div className="w-12 h-0.5 bg-pure-black mt-2"></div>
                </div>

                {/* Mathematical Neural Net Diagram (Inline SVG Monochromatic Vector) */}
                <div className="my-auto py-3 flex flex-col items-center justify-center relative">
                  {showBBoxes && (
                    <div className="absolute inset-0 pointer-events-none border border-dashed border-zinc-muted/30">
                      <span className="absolute top-1 left-1 text-[9px] font-mono text-zinc-muted">
                        BBOX_VECTOR_CANVAS [0, 42, 680, 230]
                      </span>
                    </div>
                  )}

                  <svg
                    aria-label="Convolutional feature mapping mathematical diagram"
                    className="w-full max-h-[220px] text-pure-black overflow-visible"
                    viewBox="0 0 680 230"
                  >
                    {/* Grid Canvas Input */}
                    <rect
                      fill="currentColor"
                      fillOpacity="0.04"
                      height="100"
                      stroke="currentColor"
                      strokeDasharray="2 2"
                      strokeWidth="1.5"
                      width="100"
                      x="20"
                      y="30"
                    ></rect>
                    <text className="font-label-sm text-label-sm fill-pure-black" textAnchor="middle" x="70" y="85">
                      Input X ∈ ℝ^(W×H×C)
                    </text>

                    {/* Kernel Grid */}
                    <rect
                      fill="currentColor"
                      fillOpacity="0.12"
                      height="30"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      width="30"
                      x="65"
                      y="45"
                    ></rect>
                    <text
                      className="font-label-sm text-label-sm fill-pure-black font-semibold"
                      fontSize="9"
                      textAnchor="middle"
                      x="80"
                      y="64"
                    >
                      K_ij
                    </text>

                    {/* Convolution Connection Lines */}
                    <path
                      d="M 95 60 L 210 50 L 210 110 L 95 75 Z"
                      fill="currentColor"
                      fillOpacity="0.03"
                      stroke="currentColor"
                      strokeDasharray="3 3"
                      strokeWidth="1"
                    ></path>

                    {/* Convolution Operation Arrow */}
                    <g transform="translate(140, 75)">
                      <line stroke="currentColor" strokeWidth="1.5" x1="0" x2="35" y1="0" y2="0"></line>
                      <polygon fill="currentColor" points="35,-4 43,0 35,4"></polygon>
                      <text
                        className="font-label-sm text-label-sm fill-zinc-charcoal font-medium"
                        fontSize="10"
                        textAnchor="middle"
                        x="20"
                        y="-8"
                      >
                        ⊛ Kernel
                      </text>
                    </g>

                    {/* Feature Map Volume */}
                    <rect
                      fill="currentColor"
                      fillOpacity="0.08"
                      height="90"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      width="85"
                      x="220"
                      y="35"
                    ></rect>
                    <text className="font-label-sm text-label-sm fill-pure-black" textAnchor="middle" x="262" y="82">
                      Feature Map Z^(l)
                    </text>

                    {/* Pooling Region Highlight inside Feature Map */}
                    <rect
                      fill="currentColor"
                      fillOpacity="0.25"
                      height="26"
                      stroke="currentColor"
                      strokeWidth="1"
                      width="26"
                      x="235"
                      y="45"
                    ></rect>

                    {/* Max Pooling Operator Arrow */}
                    <g transform="translate(325, 75)">
                      <line stroke="currentColor" strokeWidth="1.5" x1="0" x2="45" y1="0" y2="0"></line>
                      <polygon fill="currentColor" points="45,-4 53,0 45,4"></polygon>
                      <text
                        className="font-label-sm text-label-sm fill-zinc-charcoal font-medium"
                        fontSize="10"
                        textAnchor="middle"
                        x="26"
                        y="-8"
                      >
                        Max Pooling (2×2)
                      </text>
                      <text
                        className="font-label-sm text-label-sm fill-zinc-muted"
                        fontSize="8"
                        textAnchor="middle"
                        x="26"
                        y="16"
                      >
                        Stride s = 2
                      </text>
                    </g>

                    {/* Subsampled Reduced Volume */}
                    <rect
                      fill="currentColor"
                      fillOpacity="0.14"
                      height="60"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      width="60"
                      x="395"
                      y="50"
                    ></rect>
                    <text
                      className="font-label-sm text-label-sm fill-pure-black font-semibold"
                      textAnchor="middle"
                      x="425"
                      y="84"
                    >
                      P^(l)
                    </text>

                    {/* Vector Formula Notation Box */}
                    <g transform="translate(480, 42)">
                      <rect
                        fill="currentColor"
                        fillOpacity="0.03"
                        height="78"
                        rx="2"
                        stroke="currentColor"
                        strokeWidth="1"
                        width="180"
                        x="0"
                        y="0"
                      ></rect>
                      <text
                        className="font-label-sm text-label-sm fill-pure-black font-mono font-medium"
                        x="12"
                        y="24"
                      >
                        S(i,j) = (I * K)(i,j)
                      </text>
                      <text className="font-label-sm text-label-sm fill-zinc-charcoal font-mono" x="12" y="44">
                        = ∑_m ∑_n I(m,n)K(i-m, j-n)
                      </text>
                      <text className="font-label-sm text-label-sm fill-zinc-muted font-mono" x="12" y="64">
                        dim: ⌊(W - K + 2P)/S⌋ + 1
                      </text>
                    </g>
                  </svg>
                </div>

                {/* Bullet Explanations (Target for Inpainting and OCR) */}
                <div className="space-y-2 bg-surface-dim/50 p-3 rounded border border-zinc-subtle">
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-pure-black mt-1.5"></span>
                    <p className="font-body-sm text-body-sm text-zinc-charcoal">
                      <strong>Spatial downsampling:</strong> Reduces parameterized dimensionality while preserving
                      translational invariance across affine shifts.
                    </p>
                  </div>

                  {/* Selected Target Segment Highlight in Source */}
                  <div className="flex items-start gap-2 bg-surface-dim p-1.5 rounded relative group border border-zinc-subtle">
                    <span className="w-1.5 h-1.5 rounded-full bg-pure-black mt-1.5"></span>
                    <p className="font-body-sm text-body-sm text-pure-black font-medium">
                      <strong>Receptive Field Propagation:</strong> Deeper convolutional layers synthesize non-linear
                      representations across broader spatial hierarchies.
                    </p>
                    <span className="absolute top-1 right-1 font-label-sm text-label-sm bg-pure-black text-pure-white px-1.5 rounded opacity-80">
                      SEG #04
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-zinc-muted font-label-sm text-label-sm pt-2">
                  <span>Department of Computer Science • Stanford Univ</span>
                  <span>Slide 4 / 24</span>
                </div>
              </div>
            </div>

            {/* Hairline Divider with Draggable Calibration Handle */}
            <div
              onMouseDown={() => (isDraggingSplitter.current = true)}
              className="relative z-20 flex items-center justify-center bg-zinc-subtle w-full h-1 md:w-1 md:h-auto cursor-col-resize hover:bg-pure-black transition-colors"
              title="Drag to adjust split comparison ratio"
            >
              <div className="w-5 h-8 bg-pure-black rounded flex flex-col items-center justify-center gap-0.5 shadow-md">
                <span className="w-2.5 h-0.5 bg-pure-white rounded-full"></span>
                <span className="w-2.5 h-0.5 bg-pure-white rounded-full"></span>
                <span className="w-2.5 h-0.5 bg-pure-white rounded-full"></span>
              </div>
            </div>

            {/* RIGHT PANEL: TRANSLATED SLIDE (Thai Inpainted with Preservation) */}
            <div
              className="flex flex-col bg-surface-container-lowest p-space-md relative min-h-[520px] transition-all overflow-hidden"
              style={{
                flex: viewMode === 'wipe' ? `0 0 ${100 - splitPercent}%` : '1 1 50%',
              }}
            >
              <div className="absolute top-2 left-2 z-10 bg-pure-black text-pure-white px-2 py-0.5 rounded font-label-sm text-label-sm uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[13px]">translate</span>
                <span>Inpainted Target (TH)</span>
              </div>

              {/* Inpaint Mask Overlay Visualizer */}
              {showMaskOverlay && (
                <div className="absolute inset-0 z-20 bg-zinc-charcoal/20 backdrop-blur-[0.5px] pointer-events-none flex items-center justify-center">
                  <div className="bg-graphite-dark text-pure-white px-3 py-1.5 rounded shadow-lg font-mono text-[11px] border border-zinc-border flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>LaMa Diffusion Inpainting Mask: Text Boundaries Erased</span>
                  </div>
                </div>
              )}

              {/* Slide Content Mockup: Target Thai Typography with Retained Math Architecture */}
              <div
                className="w-full h-full bg-pure-white rounded p-6 flex flex-col justify-between shadow-sm relative overflow-hidden select-text border border-zinc-subtle"
                style={{
                  transform: `scale(${zoomLevel / 100})`,
                  transformOrigin: 'top left',
                  width: `${(100 / zoomLevel) * 100}%`,
                }}
              >
                {/* Translated Header */}
                <div>
                  <div className="font-label-sm text-label-sm text-zinc-muted uppercase tracking-widest mb-1">
                    การบรรยายครั้งที่ 04 • การหาค่าเหมาะที่สุดและการแทนลักษณะ
                  </div>
                  <h2 className="font-headline-md text-headline-md text-pure-black font-semibold tracking-tight">
                    Feature Map Pooling & Convolution (การรวมและคอนโวลูชันของแผนผังฟีเจอร์)
                  </h2>
                  <div className="w-12 h-0.5 bg-pure-black mt-2"></div>
                </div>

                {/* Mathematical Diagram with Inpainted Thai Subtitles preserving exact vector coords */}
                <div className="my-auto py-3 flex flex-col items-center justify-center relative">
                  <svg
                    aria-label="Convolutional feature mapping in Thai"
                    className="w-full max-h-[220px] text-pure-black overflow-visible"
                    viewBox="0 0 680 230"
                  >
                    {/* Grid Canvas Input */}
                    <rect
                      fill="currentColor"
                      fillOpacity="0.04"
                      height="100"
                      stroke="currentColor"
                      strokeDasharray="2 2"
                      strokeWidth="1.5"
                      width="100"
                      x="20"
                      y="30"
                    ></rect>
                    <text className="font-label-sm text-label-sm fill-pure-black" textAnchor="middle" x="70" y="85">
                      อินพุต X ∈ ℝ^(W×H×C)
                    </text>

                    {/* Kernel Grid */}
                    <rect
                      fill="currentColor"
                      fillOpacity="0.12"
                      height="30"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      width="30"
                      x="65"
                      y="45"
                    ></rect>
                    <text
                      className="font-label-sm text-label-sm fill-pure-black font-semibold"
                      fontSize="9"
                      textAnchor="middle"
                      x="80"
                      y="64"
                    >
                      K_ij
                    </text>

                    {/* Convolution Connection Lines */}
                    <path
                      d="M 95 60 L 210 50 L 210 110 L 95 75 Z"
                      fill="currentColor"
                      fillOpacity="0.03"
                      stroke="currentColor"
                      strokeDasharray="3 3"
                      strokeWidth="1"
                    ></path>

                    {/* Convolution Operation Arrow (Preserved & Inpainted) */}
                    <g transform="translate(140, 75)">
                      <line stroke="currentColor" strokeWidth="1.5" x1="0" x2="35" y1="0" y2="0"></line>
                      <polygon fill="currentColor" points="35,-4 43,0 35,4"></polygon>
                      <text
                        className="font-label-sm text-label-sm fill-zinc-charcoal font-medium"
                        fontSize="10"
                        textAnchor="middle"
                        x="20"
                        y="-8"
                      >
                        ⊛ เคอร์เนล (Kernel)
                      </text>
                    </g>

                    {/* Feature Map Volume */}
                    <rect
                      fill="currentColor"
                      fillOpacity="0.08"
                      height="90"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      width="85"
                      x="220"
                      y="35"
                    ></rect>
                    <text className="font-label-sm text-label-sm fill-pure-black" textAnchor="middle" x="262" y="82">
                      Feature Map Z^(l)
                    </text>

                    {/* Pooling Region Highlight */}
                    <rect
                      fill="currentColor"
                      fillOpacity="0.25"
                      height="26"
                      stroke="currentColor"
                      strokeWidth="1"
                      width="26"
                      x="235"
                      y="45"
                    ></rect>

                    {/* Max Pooling Operator Arrow with Thai notation */}
                    <g transform="translate(325, 75)">
                      <line stroke="currentColor" strokeWidth="1.5" x1="0" x2="45" y1="0" y2="0"></line>
                      <polygon fill="currentColor" points="45,-4 53,0 45,4"></polygon>
                      <text
                        className="font-label-sm text-label-sm fill-zinc-charcoal font-medium"
                        fontSize="10"
                        textAnchor="middle"
                        x="26"
                        y="-8"
                      >
                        Max Pooling (2×2)
                      </text>
                      <text
                        className="font-label-sm text-label-sm fill-zinc-muted"
                        fontSize="8"
                        textAnchor="middle"
                        x="26"
                        y="16"
                      >
                        ระยะก้าว (Stride) s = 2
                      </text>
                    </g>

                    {/* Subsampled Reduced Volume */}
                    <rect
                      fill="currentColor"
                      fillOpacity="0.14"
                      height="60"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      width="60"
                      x="395"
                      y="50"
                    ></rect>
                    <text
                      className="font-label-sm text-label-sm fill-pure-black font-semibold"
                      textAnchor="middle"
                      x="425"
                      y="84"
                    >
                      P^(l)
                    </text>

                    {/* Vector Formula Notation Box Preserving Unchanged Exact Latex */}
                    <g transform="translate(480, 42)">
                      <rect
                        fill="currentColor"
                        fillOpacity="0.03"
                        height="78"
                        rx="2"
                        stroke="currentColor"
                        strokeWidth="1"
                        width="180"
                        x="0"
                        y="0"
                      ></rect>
                      <text
                        className="font-label-sm text-label-sm fill-pure-black font-mono font-medium"
                        x="12"
                        y="24"
                      >
                        S(i,j) = (I * K)(i,j)
                      </text>
                      <text className="font-label-sm text-label-sm fill-zinc-charcoal font-mono" x="12" y="44">
                        = ∑_m ∑_n I(m,n)K(i-m, j-n)
                      </text>
                      <text className="font-label-sm text-label-sm fill-zinc-muted font-mono" x="12" y="64">
                        มิติ: ⌊(W - K + 2P)/S⌋ + 1
                      </text>
                    </g>
                  </svg>
                </div>

                {/* Translated Bullet Explanations */}
                <div className="space-y-2 bg-surface-dim/50 p-3 rounded border border-zinc-subtle">
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-pure-black mt-1.5"></span>
                    <p className="font-body-sm text-body-sm text-zinc-charcoal">
                      <strong>การลดขนาดทางพื้นที่ (Spatial downsampling):</strong>{' '}
                      ลดมิติของพารามิเตอร์ขณะที่ยังคงความแปรปรวนไม่เปลี่ยนจากการแปลง (translational invariance)
                      ตามการเลื่อนแบบแอฟฟีน
                    </p>
                  </div>

                  {/* Active Highlighted Bounding Box Area Matching Inspector */}
                  <div className="flex items-start gap-2 bg-pure-white p-2 rounded shadow-sm relative ring-2 ring-pure-black">
                    <span className="w-1.5 h-1.5 rounded-full bg-pure-black mt-1.5"></span>
                    <div className="flex-1">
                      <p
                        className="text-pure-black font-medium leading-relaxed font-body-sm"
                        style={{
                          fontSize: `${fontSizePt * 0.88}px`,
                          lineHeight: `${fontSizePt * 1.35}px`,
                        }}
                      >
                        {thaiEditableText}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="font-label-sm text-label-sm bg-pure-black text-pure-white px-1.5 py-0.2 rounded font-mono">
                          BBOX [142, 310, 520, 84]
                        </span>
                        <span className="font-label-sm text-label-sm text-zinc-muted">
                          Scale calibrated: {fontSizePt}pt
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-zinc-muted font-label-sm text-label-sm pt-2">
                  <span>ภาควิชาวิทยาการคอมพิวเตอร์ • มหาวิทยาลัยสแตนฟอร์ด</span>
                  <span>สไลด์ที่ 4 / 24</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Canvas Overlay Controls HUD */}
          <div className="absolute bottom-6 left-6 z-30 bg-graphite-dark text-pure-white px-3 py-1.5 rounded shadow-xl flex items-center gap-space-md text-label-sm font-label-sm border border-zinc-border/30">
            <div className="flex items-center gap-1.5">
              <input
                checked={showBBoxes}
                onChange={(e) => setShowBBoxes(e.target.checked)}
                className="accent-pure-black w-3.5 h-3.5 cursor-pointer"
                id="bbox-toggle"
                type="checkbox"
              />
              <label className="cursor-pointer text-zinc-subtle" htmlFor="bbox-toggle">
                Show BBoxes (6)
              </label>
            </div>
            <span className="text-zinc-muted">|</span>
            <div className="flex items-center gap-1.5">
              <input
                checked={showMaskOverlay}
                onChange={(e) => setShowMaskOverlay(e.target.checked)}
                className="accent-pure-black w-3.5 h-3.5 cursor-pointer"
                id="mask-toggle"
                type="checkbox"
              />
              <label className="cursor-pointer text-zinc-subtle" htmlFor="mask-toggle">
                Mask Overlay
              </label>
            </div>
            <span className="text-zinc-muted">|</span>
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-muted">Engine:</span>
              <span className="text-pure-white font-mono font-medium">PaddleOCR v4 + LaMa-Inpaint</span>
            </div>
          </div>
        </div>

        {/* Contextual Inspector Drawer (Bounding Box, Inpainting & Terminology Calibration) */}
        <aside className="w-full lg:w-96 bg-pure-white rounded-lg p-space-md shadow-sm flex flex-col justify-between shrink-0 border border-zinc-subtle">
          <div className="space-y-space-md">
            {/* Inspector Section Header */}
            <div className="flex items-center justify-between pb-space-sm border-b border-zinc-subtle">
              <div>
                <div className="font-label-sm text-label-sm text-zinc-muted uppercase tracking-wider font-semibold">
                  OCR & Inpaint Inspector
                </div>
                <h3 className="font-title-sm text-title-sm text-pure-black font-semibold">
                  Bounding Box Calibration
                </h3>
              </div>
              <span className="font-label-sm text-label-sm bg-pure-black text-pure-white px-2 py-0.5 rounded">
                ID: {activeBBox.id}
              </span>
            </div>

            {/* Coordinates Geometry Matrix */}
            <div className="bg-surface-dim p-space-sm rounded border border-zinc-subtle">
              <div className="flex items-center justify-between text-zinc-muted font-label-sm text-label-sm mb-1.5">
                <span className="uppercase">Pixel Extents (1920x1080 Native)</span>
                <span className="text-pure-black font-mono font-semibold">XYWH</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 text-center font-mono">
                <div className="bg-pure-white py-1 rounded shadow-sm border border-zinc-subtle">
                  <span className="text-zinc-muted font-label-sm text-label-sm block">X</span>
                  <span className="font-label-md text-label-md text-pure-black font-semibold">
                    {activeBBox.x}
                  </span>
                </div>
                <div className="bg-pure-white py-1 rounded shadow-sm border border-zinc-subtle">
                  <span className="text-zinc-muted font-label-sm text-label-sm block">Y</span>
                  <span className="font-label-md text-label-md text-pure-black font-semibold">
                    {activeBBox.y}
                  </span>
                </div>
                <div className="bg-pure-white py-1 rounded shadow-sm border border-zinc-subtle">
                  <span className="text-zinc-muted font-label-sm text-label-sm block">W</span>
                  <span className="font-label-md text-label-md text-pure-black font-semibold">
                    {activeBBox.w}
                  </span>
                </div>
                <div className="bg-pure-white py-1 rounded shadow-sm border border-zinc-subtle">
                  <span className="text-zinc-muted font-label-sm text-label-sm block">H</span>
                  <span className="font-label-md text-label-md text-pure-black font-semibold">
                    {activeBBox.h}
                  </span>
                </div>
              </div>
            </div>

            {/* Original Source Segment */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-label-sm text-label-sm text-zinc-charcoal uppercase tracking-wider font-medium">
                  Source Segment (EN)
                </span>
                <span className="font-label-sm text-label-sm text-zinc-muted font-mono">15 words</span>
              </div>
              <div className="bg-surface-dim p-2.5 rounded font-body-sm text-body-sm text-graphite-dark border border-zinc-subtle">
                "{activeBBox.sourceText}"
              </div>
            </div>

            {/* Font Size Auto-Fit Calibration Slider */}
            <div className="bg-surface-dim p-space-sm rounded space-y-2 border border-zinc-subtle">
              <div className="flex justify-between items-center">
                <span className="font-label-sm text-label-sm text-zinc-charcoal uppercase font-medium">
                  Typography Auto-Fit Calibration
                </span>
                <span className="font-label-md text-label-md text-pure-black font-mono font-semibold">
                  {fontSizePt} pt
                </span>
              </div>
              <input
                className="w-full accent-pure-black cursor-pointer"
                max={22}
                min={12}
                step={0.5}
                type="range"
                value={fontSizePt}
                onChange={(e) => setFontSizePt(parseFloat(e.target.value))}
              />
              <div className="flex justify-between text-zinc-muted font-label-sm text-label-sm font-mono">
                <span>Min 12pt</span>
                <span className="text-pure-black font-medium">Target: 18pt → Auto: {fontSizePt}pt</span>
                <span>Max 22pt</span>
              </div>
              <div className="text-zinc-muted font-body-sm text-body-sm pt-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-pure-black">check_circle</span>
                <span>
                  No text clipping detected inside {activeBBox.w}×{activeBBox.h} box.
                </span>
              </div>
            </div>

            {/* Manual Quick-Edit Thai Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-label-sm text-label-sm text-zinc-charcoal uppercase tracking-wider font-medium">
                  Target Translation (Thai Edit)
                </span>
                <button
                  onClick={handleRevertMT}
                  className="font-label-sm text-label-sm text-zinc-muted hover:text-pure-black underline cursor-pointer"
                >
                  Revert MT
                </button>
              </div>
              <textarea
                className="w-full bg-pure-white p-2.5 rounded font-body-sm text-body-sm text-pure-black focus:outline-none ring-1 ring-zinc-subtle focus:ring-2 focus:ring-pure-black leading-relaxed transition-all resize-none shadow-sm border border-zinc-subtle"
                rows={4}
                value={thaiEditableText}
                onChange={(e) => setThaiEditableText(e.target.value)}
              />
            </div>

            {/* Preserved Academic Terms Chips */}
            <div>
              <span className="font-label-sm text-label-sm text-zinc-muted uppercase tracking-wider block mb-1.5">
                Preserved Technical Enclosures
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeBBox.preservedTerms?.map((term) => (
                  <span
                    key={term}
                    className="font-label-sm text-label-sm bg-surface-dim px-2 py-0.5 rounded text-graphite-dark border border-zinc-subtle"
                  >
                    {term}
                  </span>
                ))}
              </div>
            </div>

            {savedMessage && (
              <div className="text-[11px] text-zinc-charcoal bg-surface-dim p-2 rounded border border-zinc-border flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-pure-black">check_circle</span>
                <span>{savedMessage}</span>
              </div>
            )}
          </div>

          {/* Action Footer Buttons inside Inspector */}
          <div className="pt-space-md mt-space-md space-y-2 border-t border-zinc-subtle">
            <button
              onClick={handleApplyCalibration}
              className="w-full py-2 bg-pure-black hover:bg-zinc-charcoal text-pure-white rounded font-body-sm text-body-sm font-medium shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">done_all</span>
              <span>Apply Calibration & Re-render</span>
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveBBoxIndex((prev) => Math.max(1, prev - 1))}
                className="flex-1 py-1.5 bg-surface-dim hover:bg-surface-container-highest text-graphite-dark rounded font-label-md text-label-md transition-colors border border-zinc-subtle cursor-pointer"
              >
                Prev BBox
              </button>
              <button
                onClick={() => setActiveBBoxIndex((prev) => Math.min(6, prev + 1))}
                className="flex-1 py-1.5 bg-surface-dim hover:bg-surface-container-highest text-graphite-dark rounded font-label-md text-label-md transition-colors border border-zinc-subtle cursor-pointer"
              >
                Next BBox ({activeBBoxIndex} of 6)
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Bottom Slide Filmstrip (Horizontal Scrollable Carousel of 24 Slides) */}
      <div className="w-full bg-pure-white p-space-sm shadow-sm select-none border-t border-zinc-subtle">
        <div className="flex items-center justify-between px-space-sm mb-2">
          <div className="flex items-center gap-space-sm">
            <span className="font-label-sm text-label-sm text-zinc-muted uppercase tracking-wider font-semibold">
              Deck Filmstrip
            </span>
            <span className="font-label-sm text-label-sm bg-surface-dim px-2 py-0.5 rounded text-zinc-charcoal font-medium border border-zinc-subtle">
              24 / 24 Slides Inpainted
            </span>
          </div>
          <div className="flex items-center gap-3 text-zinc-muted font-label-sm text-label-sm">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-pure-black"></span> 100% Inpainted
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-zinc-border"></span> In Review
            </span>
          </div>
        </div>

        {/* Carousel Strip */}
        <div className="flex items-center gap-space-sm overflow-x-auto pb-1 px-space-sm">
          {/* Slide 1 */}
          <div
            onClick={() => onSelectSlide(1)}
            className={`shrink-0 w-36 rounded p-1.5 cursor-pointer transition-all border ${
              activeSlideNumber === 1
                ? 'bg-pure-black text-pure-white ring-2 ring-pure-black shadow-md'
                : 'bg-surface-dim hover:bg-surface-container-highest border-zinc-subtle'
            }`}
          >
            <div className="w-full h-20 bg-pure-white rounded flex flex-col items-center justify-center p-2 relative shadow-sm border border-zinc-subtle">
              <span className="font-label-sm text-label-sm text-zinc-muted">TITLE SLIDE</span>
              <span className="font-title-sm text-title-sm font-semibold truncate text-center w-full text-pure-black">
                CS229 Opt
              </span>
              <span className="absolute top-1 right-1 font-label-sm text-label-sm bg-pure-black text-pure-white px-1 rounded">
                1
              </span>
            </div>
            <div className="flex justify-between items-center mt-1 px-1 font-label-sm text-label-sm">
              <span className={activeSlideNumber === 1 ? 'text-pure-white' : 'text-zinc-muted'}>01</span>
              <span className={activeSlideNumber === 1 ? 'text-pure-white font-medium' : 'text-pure-black'}>✓ MT</span>
            </div>
          </div>

          {/* Slide 2 */}
          <div
            onClick={() => onSelectSlide(2)}
            className={`shrink-0 w-36 rounded p-1.5 cursor-pointer transition-all border ${
              activeSlideNumber === 2
                ? 'bg-pure-black text-pure-white ring-2 ring-pure-black shadow-md'
                : 'bg-surface-dim hover:bg-surface-container-highest border-zinc-subtle'
            }`}
          >
            <div className="w-full h-20 bg-pure-white rounded flex flex-col items-center justify-center p-2 relative shadow-sm border border-zinc-subtle">
              <div className="w-full h-2 bg-surface-dim rounded mb-1"></div>
              <div className="w-4/5 h-2 bg-surface-dim rounded mb-2"></div>
              <div className="w-2/3 h-1.5 bg-surface-dim rounded"></div>
              <span className="absolute top-1 right-1 font-label-sm text-label-sm bg-pure-black text-pure-white px-1 rounded">
                2
              </span>
            </div>
            <div className="flex justify-between items-center mt-1 px-1 font-label-sm text-label-sm">
              <span className={activeSlideNumber === 2 ? 'text-pure-white' : 'text-zinc-muted'}>02</span>
              <span className={activeSlideNumber === 2 ? 'text-pure-white font-medium' : 'text-pure-black'}>✓ MT</span>
            </div>
          </div>

          {/* Slide 3 */}
          <div
            onClick={() => onSelectSlide(3)}
            className={`shrink-0 w-36 rounded p-1.5 cursor-pointer transition-all border ${
              activeSlideNumber === 3
                ? 'bg-pure-black text-pure-white ring-2 ring-pure-black shadow-md'
                : 'bg-surface-dim hover:bg-surface-container-highest border-zinc-subtle'
            }`}
          >
            <div className="w-full h-20 bg-pure-white rounded flex flex-col items-center justify-center p-2 relative shadow-sm border border-zinc-subtle">
              <svg className="w-8 h-8 text-zinc-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect height="18" rx="2" strokeWidth="2" width="18" x="3" y="3"></rect>
                <path d="M7 12h10M12 7v10"></path>
              </svg>
              <span className="absolute top-1 right-1 font-label-sm text-label-sm bg-pure-black text-pure-white px-1 rounded">
                3
              </span>
            </div>
            <div className="flex justify-between items-center mt-1 px-1 font-label-sm text-label-sm">
              <span className={activeSlideNumber === 3 ? 'text-pure-white' : 'text-zinc-muted'}>03</span>
              <span className={activeSlideNumber === 3 ? 'text-pure-white font-medium' : 'text-pure-black'}>✓ MT</span>
            </div>
          </div>

          {/* Slide 4 (CURRENT ACTIVE SLIDE) */}
          <div
            onClick={() => onSelectSlide(4)}
            className={`shrink-0 w-36 rounded p-1.5 cursor-pointer transition-all border ${
              activeSlideNumber === 4
                ? 'bg-pure-black text-pure-white ring-2 ring-pure-black shadow-md'
                : 'bg-surface-dim hover:bg-surface-container-highest border-zinc-subtle'
            }`}
          >
            <div className="w-full h-20 bg-pure-white rounded flex flex-col items-center justify-center p-2 relative text-pure-black shadow-sm border border-zinc-subtle">
              <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-pure-black">
                ACTIVE 04
              </span>
              <div className="w-10 h-0.5 bg-pure-black my-1"></div>
              <span className="font-label-sm text-label-sm text-zinc-muted truncate max-w-[110px]">CNN Pooling</span>
              <span className="absolute top-1 right-1 font-label-sm text-label-sm bg-pure-black text-pure-white px-1 rounded">
                4
              </span>
            </div>
            <div className="flex justify-between items-center mt-1 px-1 font-label-sm text-label-sm">
              <span className={activeSlideNumber === 4 ? 'text-pure-white font-medium' : 'text-zinc-muted'}>
                04 [EDIT]
              </span>
              <span className={activeSlideNumber === 4 ? 'text-pure-white font-semibold' : 'text-pure-black'}>
                99.2%
              </span>
            </div>
          </div>

          {/* Slide 5 */}
          <div
            onClick={() => onSelectSlide(5)}
            className={`shrink-0 w-36 rounded p-1.5 cursor-pointer transition-all border ${
              activeSlideNumber === 5
                ? 'bg-pure-black text-pure-white ring-2 ring-pure-black shadow-md'
                : 'bg-surface-dim hover:bg-surface-container-highest border-zinc-subtle'
            }`}
          >
            <div className="w-full h-20 bg-pure-white rounded flex flex-col items-center justify-center p-2 relative shadow-sm border border-zinc-subtle">
              <div className="w-12 h-6 border border-zinc-border rounded mb-1"></div>
              <span className="font-label-sm text-label-sm text-zinc-muted">Backprop</span>
              <span className="absolute top-1 right-1 font-label-sm text-label-sm bg-pure-black text-pure-white px-1 rounded">
                5
              </span>
            </div>
            <div className="flex justify-between items-center mt-1 px-1 font-label-sm text-label-sm">
              <span className={activeSlideNumber === 5 ? 'text-pure-white' : 'text-zinc-muted'}>05</span>
              <span className={activeSlideNumber === 5 ? 'text-pure-white font-medium' : 'text-pure-black'}>✓ MT</span>
            </div>
          </div>

          {/* Slide 6 */}
          <div
            onClick={() => onSelectSlide(6)}
            className={`shrink-0 w-36 rounded p-1.5 cursor-pointer transition-all border ${
              activeSlideNumber === 6
                ? 'bg-pure-black text-pure-white ring-2 ring-pure-black shadow-md'
                : 'bg-surface-dim hover:bg-surface-container-highest border-zinc-subtle'
            }`}
          >
            <div className="w-full h-20 bg-pure-white rounded flex flex-col items-center justify-center p-2 relative shadow-sm border border-zinc-subtle">
              <span className="font-label-sm text-label-sm font-mono text-zinc-muted">∇f(θ) = 0</span>
              <span className="absolute top-1 right-1 font-label-sm text-label-sm bg-pure-black text-pure-white px-1 rounded">
                6
              </span>
            </div>
            <div className="flex justify-between items-center mt-1 px-1 font-label-sm text-label-sm">
              <span className={activeSlideNumber === 6 ? 'text-pure-white' : 'text-zinc-muted'}>06</span>
              <span className={activeSlideNumber === 6 ? 'text-pure-white font-medium' : 'text-pure-black'}>✓ MT</span>
            </div>
          </div>

          {/* Slide 7 */}
          <div
            onClick={() => onSelectSlide(7)}
            className={`shrink-0 w-36 rounded p-1.5 cursor-pointer transition-all border ${
              activeSlideNumber === 7
                ? 'bg-pure-black text-pure-white ring-2 ring-pure-black shadow-md'
                : 'bg-surface-dim hover:bg-surface-container-highest border-zinc-subtle'
            }`}
          >
            <div className="w-full h-20 bg-pure-white rounded flex flex-col items-center justify-center p-2 relative shadow-sm border border-zinc-subtle">
              <div className="w-4/5 h-2 bg-surface-dim rounded mb-1"></div>
              <div className="w-3/5 h-2 bg-surface-dim rounded mb-1"></div>
              <div className="w-1/2 h-2 bg-surface-dim rounded"></div>
              <span className="absolute top-1 right-1 font-label-sm text-label-sm bg-pure-black text-pure-white px-1 rounded">
                7
              </span>
            </div>
            <div className="flex justify-between items-center mt-1 px-1 font-label-sm text-label-sm">
              <span className={activeSlideNumber === 7 ? 'text-pure-white' : 'text-zinc-muted'}>07</span>
              <span className={activeSlideNumber === 7 ? 'text-pure-white font-medium' : 'text-pure-black'}>✓ MT</span>
            </div>
          </div>

          {/* Slide 8 */}
          <div
            onClick={() => onSelectSlide(8)}
            className={`shrink-0 w-36 rounded p-1.5 cursor-pointer transition-all border ${
              activeSlideNumber === 8
                ? 'bg-pure-black text-pure-white ring-2 ring-pure-black shadow-md'
                : 'bg-surface-dim hover:bg-surface-container-highest border-zinc-subtle'
            }`}
          >
            <div className="w-full h-20 bg-pure-white rounded flex flex-col items-center justify-center p-2 relative shadow-sm border border-zinc-subtle">
              <span className="font-label-sm text-label-sm text-zinc-muted">Batch Norm</span>
              <span className="absolute top-1 right-1 font-label-sm text-label-sm bg-pure-black text-pure-white px-1 rounded">
                8
              </span>
            </div>
            <div className="flex justify-between items-center mt-1 px-1 font-label-sm text-label-sm">
              <span className={activeSlideNumber === 8 ? 'text-pure-white' : 'text-zinc-muted'}>08</span>
              <span className={activeSlideNumber === 8 ? 'text-pure-white font-medium' : 'text-pure-black'}>✓ MT</span>
            </div>
          </div>

          {/* Slide 9 to 24 Overflow Cue */}
          <div className="shrink-0 w-32 bg-surface-dim rounded p-1.5 flex flex-col items-center justify-center text-zinc-muted font-label-sm text-label-sm border border-zinc-subtle">
            <span className="material-symbols-outlined text-[20px]">more_horiz</span>
            <span>Slides 9 - 24</span>
          </div>
        </div>
      </div>
    </div>
  );
};
