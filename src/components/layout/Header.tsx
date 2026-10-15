import React, { useState } from 'react';
import { SlideData } from '../../types';

interface HeaderProps {
  currentSlide?: SlideData;
  totalSlides: number;
  onReprocess: () => void;
  onOpenExport: () => void;
  isReprocessing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentSlide,
  totalSlides,
  onReprocess,
  onOpenExport,
  isReprocessing = false,
}) => {
  const [copiedSession, setCopiedSession] = useState(false);

  const slideIndex = currentSlide?.slideNumber || 4;
  const slideTitle = currentSlide?.title || 'Convolutional Neural Networks Architecture';

  const copySessionId = () => {
    navigator.clipboard?.writeText('0x8F42A');
    setCopiedSession(true);
    setTimeout(() => setCopiedSession(false), 2000);
  };

  return (
    <header className="fixed top-0 left-64 right-0 h-14 bg-pure-white border-b border-zinc-subtle z-40 flex items-center justify-between px-margin-desktop select-none">
      {/* Left Info Badges */}
      <div className="flex items-center gap-space-md min-w-0">
        <button
          onClick={copySessionId}
          className="font-label-sm text-label-sm bg-surface-dim hover:bg-zinc-subtle text-zinc-charcoal border border-zinc-subtle px-2 py-0.5 rounded transition-colors flex items-center gap-1 cursor-pointer"
          title="Click to copy Session ID"
        >
          <span>SESSION: 0x8F42A</span>
          {copiedSession && <span className="text-[10px] text-pure-black font-bold">✓</span>}
        </button>
        <div className="h-4 w-px bg-zinc-subtle"></div>
        <span className="font-body-sm text-body-sm text-zinc-muted truncate">
          Slide {slideIndex} / {totalSlides}: <strong className="text-pure-black font-medium">{slideTitle}</strong>
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-space-md">
        <button
          onClick={onReprocess}
          disabled={isReprocessing}
          className="flex items-center gap-space-xs px-3 py-1.5 border border-zinc-border bg-pure-white text-pure-black hover:bg-surface-dim rounded font-body-sm text-body-sm transition-colors cursor-pointer disabled:opacity-50"
        >
          <span
            className={`material-symbols-outlined text-[16px] ${
              isReprocessing ? 'animate-spin' : ''
            }`}
          >
            sync
          </span>
          <span>{isReprocessing ? 'Processing...' : 'Reprocess Slide'}</span>
        </button>

        <button
          onClick={onOpenExport}
          className="flex items-center gap-space-xs px-3 py-1.5 bg-pure-black text-pure-white hover:bg-zinc-charcoal rounded font-body-sm text-body-sm transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">download</span>
          <span>Export Target</span>
        </button>

        <div
          className="w-8 h-8 rounded-full bg-pure-black text-pure-white flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-zinc-border transition-all"
          title="Dr. Arnu Top - Academic Reviewer"
        >
          <span className="material-symbols-outlined text-pure-white text-[18px]">person</span>
        </div>
      </div>
    </header>
  );
};
