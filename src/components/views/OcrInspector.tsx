import React, { useState } from 'react';
import { SlideData } from '../../types';

interface OcrInspectorProps {
  slide: SlideData;
  onSelectSlide: (slideNumber: number) => void;
}

export const OcrInspector: React.FC<OcrInspectorProps> = ({ slide }) => {
  const [selectedTokenId, setSelectedTokenId] = useState<string>('TOK_04_3');
  const [activeTab, setActiveTab] = useState<'tokens' | 'json' | 'latex'>('tokens');

  const tokens = [
    { id: 'TOK_04_1', text: 'Feature Map', tag: 'HEADING', bbox: [50, 80, 240, 55], conf: 99.8, type: 'text' },
    { id: 'TOK_04_2', text: 'Pooling & Convolution', tag: 'HEADING', bbox: [300, 80, 330, 55], conf: 99.6, type: 'text' },
    { id: 'TOK_04_3', text: 'S(i,j) = (I * K)(i,j)', tag: 'FORMULA', bbox: [492, 66, 150, 20], conf: 99.4, type: 'latex' },
    { id: 'TOK_04_4', text: '= \\sum_m \\sum_n I(m,n)K(i-m, j-n)', tag: 'FORMULA', bbox: [492, 86, 160, 20], conf: 98.7, type: 'latex' },
    { id: 'TOK_04_5', text: 'dim: \\lfloor(W - K + 2P)/S\\rfloor + 1', tag: 'MATH_META', bbox: [492, 106, 155, 18], conf: 99.1, type: 'latex' },
    { id: 'TOK_04_6', text: 'Spatial downsampling: Reduces parameterized dimensionality', tag: 'PARAGRAPH', bbox: [60, 340, 550, 24], conf: 98.9, type: 'text' },
    { id: 'TOK_04_7', text: 'Receptive Field Propagation: Deeper convolutional layers', tag: 'PARAGRAPH', bbox: [142, 310, 520, 84], conf: 99.4, type: 'text' },
  ];

  const selectedToken = tokens.find((t) => t.id === selectedTokenId) || tokens[0];

  return (
    <div className="p-margin-desktop space-y-space-lg select-none pb-12">
      {/* Top Banner */}
      <div className="bg-pure-white p-space-lg rounded shadow-sm flex flex-wrap items-center justify-between gap-space-md border border-zinc-subtle">
        <div>
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-pure-black text-[22px]">document_scanner</span>
            <h2 className="font-headline-md text-pure-black font-semibold">
              OCR & Spatial Polygon Inspector
            </h2>
          </div>
          <p className="font-body-sm text-zinc-muted mt-0.5">
            PaddleOCR v4 + Vision Transformer spatial polygon extraction and LaTeX token graph.
          </p>
        </div>

        <div className="flex items-center gap-space-sm">
          <div className="px-2.5 py-1 bg-surface-dim rounded border border-zinc-subtle font-label-sm text-zinc-charcoal">
            Detected: <strong>418 Tokens</strong> • <strong>34 LaTeX Blocks</strong>
          </div>
          <div className="px-2.5 py-1 bg-pure-black text-pure-white rounded font-label-sm">
            Mean IoU: <strong>99.3%</strong>
          </div>
        </div>
      </div>

      {/* Main Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Visual Coordinate Canvas (7 cols) */}
        <div className="lg:col-span-7 bg-pure-white p-space-lg rounded shadow-sm border border-zinc-subtle flex flex-col gap-space-md">
          <div className="flex items-center justify-between">
            <span className="font-title-sm font-semibold text-pure-black">Spatial Bounding Mesh</span>
            <span className="font-label-sm text-zinc-muted">Click bounding box to isolate node</span>
          </div>

          <div className="relative aspect-video bg-surface-dim rounded overflow-hidden border border-zinc-subtle p-6 flex flex-col justify-between">
            {/* Background Simulated Slide Raster */}
            <div className="absolute inset-0 opacity-15 pointer-events-none p-6 flex flex-col justify-between">
              <div className="h-4 w-1/3 bg-pure-black rounded"></div>
              <div className="h-32 w-full bg-zinc-border rounded"></div>
              <div className="space-y-2">
                <div className="h-3 w-4/5 bg-pure-black rounded"></div>
                <div className="h-3 w-3/5 bg-pure-black rounded"></div>
              </div>
            </div>

            {/* Overlaid Interactive Polygons */}
            <div className="relative w-full h-full">
              {tokens.map((tok) => {
                const isSelected = tok.id === selectedTokenId;
                return (
                  <div
                    key={tok.id}
                    onClick={() => setSelectedTokenId(tok.id)}
                    className={`absolute cursor-pointer transition-all rounded-xs flex items-center justify-between px-1.5 py-0.5 border ${
                      isSelected
                        ? 'border-pure-black bg-pure-black/20 ring-2 ring-pure-black shadow-md z-20'
                        : 'border-zinc-border/70 hover:border-pure-black bg-pure-white/40 hover:bg-pure-black/10 z-10'
                    }`}
                    style={{
                      left: `${(tok.bbox[0] / 720) * 100}%`,
                      top: `${(tok.bbox[1] / 480) * 100}%`,
                      width: `${(tok.bbox[2] / 720) * 100}%`,
                      height: `${Math.max(22, (tok.bbox[3] / 480) * 100)}%`,
                    }}
                  >
                    <span className="font-mono text-[9px] font-semibold text-pure-black truncate">
                      {tok.tag}
                    </span>
                    <span className="font-mono text-[8px] bg-pure-black text-pure-white px-1 rounded">
                      {tok.conf}%
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center text-zinc-muted font-label-sm border-t border-zinc-subtle pt-2 z-10">
              <span>Coordinate Space: 1920 × 1080 (Normalized)</span>
              <span>Slide {slide.slideNumber} / 24</span>
            </div>
          </div>
        </div>

        {/* Node Inspector & AST Details (5 cols) */}
        <div className="lg:col-span-5 bg-pure-white p-space-lg rounded shadow-sm border border-zinc-subtle flex flex-col justify-between">
          <div className="space-y-space-md">
            {/* Tabs */}
            <div className="flex items-center gap-space-xs bg-surface-dim p-0.5 rounded border border-zinc-subtle">
              <button
                onClick={() => setActiveTab('tokens')}
                className={`flex-1 py-1 rounded font-label-sm text-label-sm transition-all cursor-pointer ${
                  activeTab === 'tokens'
                    ? 'bg-pure-white text-pure-black font-semibold shadow-sm'
                    : 'text-zinc-muted hover:text-pure-black'
                }`}
              >
                Tokens List
              </button>
              <button
                onClick={() => setActiveTab('json')}
                className={`flex-1 py-1 rounded font-label-sm text-label-sm transition-all cursor-pointer ${
                  activeTab === 'json'
                    ? 'bg-pure-white text-pure-black font-semibold shadow-sm'
                    : 'text-zinc-muted hover:text-pure-black'
                }`}
              >
                AST JSON
              </button>
              <button
                onClick={() => setActiveTab('latex')}
                className={`flex-1 py-1 rounded font-label-sm text-label-sm transition-all cursor-pointer ${
                  activeTab === 'latex'
                    ? 'bg-pure-white text-pure-black font-semibold shadow-sm'
                    : 'text-zinc-muted hover:text-pure-black'
                }`}
              >
                LaTeX Math
              </button>
            </div>

            {/* Tab 1: Tokens List */}
            {activeTab === 'tokens' && (
              <div className="space-y-space-sm max-h-[380px] overflow-y-auto pr-1">
                {tokens.map((tok) => {
                  const isSelected = tok.id === selectedTokenId;
                  return (
                    <div
                      key={tok.id}
                      onClick={() => setSelectedTokenId(tok.id)}
                      className={`p-2.5 rounded border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-pure-black bg-surface-dim ring-1 ring-pure-black'
                          : 'border-zinc-subtle hover:border-zinc-border bg-pure-white'
                      }`}
                    >
                      <div className="flex items-center justify-between font-label-sm text-label-sm">
                        <span className="font-mono font-semibold text-pure-black">{tok.id}</span>
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.2 bg-zinc-subtle rounded text-zinc-charcoal uppercase">
                            {tok.tag}
                          </span>
                          <span className="font-mono text-pure-black font-medium">{tok.conf}%</span>
                        </div>
                      </div>
                      <div className="font-mono text-body-sm text-zinc-charcoal mt-1 truncate">
                        "{tok.text}"
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tab 2: AST JSON */}
            {activeTab === 'json' && (
              <pre className="p-3 bg-graphite-dark text-pure-white font-mono text-[11px] rounded overflow-x-auto max-h-[380px] border border-zinc-border">
                {JSON.stringify(selectedToken, null, 2)}
              </pre>
            )}

            {/* Tab 3: LaTeX Math */}
            {activeTab === 'latex' && (
              <div className="space-y-space-sm max-h-[380px] overflow-y-auto">
                <div className="p-space-sm bg-surface-dim rounded border border-zinc-subtle">
                  <div className="font-label-sm text-zinc-muted uppercase mb-1">Raw LaTeX Code</div>
                  <code className="font-mono text-body-sm text-pure-black block bg-pure-white p-2 rounded border border-zinc-subtle">
                    {`\\begin{equation}\n  S(i,j) = (I * K)(i,j) = \\sum_m \\sum_n I(m,n)K(i-m, j-n)\n\\end{equation}`}
                  </code>
                </div>
                <div className="p-space-sm bg-surface-dim rounded border border-zinc-subtle">
                  <div className="font-label-sm text-zinc-muted uppercase mb-1">Preserved Invariant</div>
                  <div className="font-body-sm text-zinc-charcoal">
                    Math glyphs and Greek indices (i, j, m, n) are locked against Thai font injection to prevent layout collision.
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-space-md border-t border-zinc-subtle flex gap-space-sm">
            <button
              onClick={() => alert(`Re-running OCR on node ${selectedTokenId}...`)}
              className="flex-1 py-2 bg-surface-dim hover:bg-zinc-subtle text-pure-black rounded font-body-sm border border-zinc-subtle cursor-pointer transition-colors"
            >
              Re-scan Node
            </button>
            <button
              onClick={() => alert(`Node ${selectedTokenId} locked into translation memory.`)}
              className="flex-1 py-2 bg-pure-black text-pure-white hover:bg-zinc-charcoal rounded font-body-sm cursor-pointer shadow-sm transition-all"
            >
              Lock Coordinate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
