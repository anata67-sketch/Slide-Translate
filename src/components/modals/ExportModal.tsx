import React, { useState } from 'react';
import { DeckData } from '../../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  deck: DeckData;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, deck }) => {
  const [format, setFormat] = useState<'pdf' | 'latex' | 'png' | 'ast'>('pdf');
  const [includeParentheses, setIncludeParentheses] = useState(true);
  const [includeBleuReport, setIncludeBleuReport] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setExportSuccess(true);
      setTimeout(() => {
        setExportSuccess(false);
        onClose();
      }, 1500);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-pure-black/60 backdrop-blur-xs p-4 select-none">
      <div className="bg-pure-white border border-pure-black rounded-lg w-full max-w-lg p-space-lg shadow-2xl relative">
        <div className="flex items-center justify-between pb-space-sm border-b border-zinc-subtle">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-[20px] text-pure-black">picture_as_pdf</span>
            <h3 className="font-headline-md text-pure-black font-semibold">
              Export Translated Target Deck
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-muted hover:text-pure-black p-1 rounded"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="py-space-md space-y-space-md">
          <div>
            <div className="font-label-sm text-zinc-muted uppercase mb-1">Target Deck</div>
            <div className="font-title-sm font-semibold text-pure-black truncate">
              {deck.filename}
            </div>
            <div className="text-body-sm text-zinc-muted">
              {deck.totalPages} Slides • Inpainted Thai Academic (Sarabun font)
            </div>
          </div>

          {/* Format selection */}
          <div className="space-y-1.5">
            <label className="font-label-sm text-zinc-charcoal uppercase font-medium">
              Export Format
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'pdf', label: 'Inpainted Vector PDF', desc: '300 DPI Print Ready' },
                { id: 'latex', label: 'LaTeX + Beamer Slides', desc: 'Source .tex & tikz' },
                { id: 'png', label: 'Raster PNG Pack (Zip)', desc: '4096 × 2304 px / slide' },
                { id: 'ast', label: 'Bilingual AST / JSON', desc: 'Coordinates & BLEU' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setFormat(item.id as any)}
                  className={`p-2.5 rounded text-left border transition-all ${
                    format === item.id
                      ? 'border-pure-black bg-surface-dim ring-1 ring-pure-black'
                      : 'border-zinc-subtle hover:border-zinc-border'
                  }`}
                >
                  <div className="font-title-sm text-pure-black font-medium text-[13px]">
                    {item.label}
                  </div>
                  <div className="font-label-sm text-zinc-muted">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2 bg-surface-dim p-space-sm rounded">
            <label className="flex items-center gap-2 cursor-pointer text-body-sm text-zinc-charcoal">
              <input
                type="checkbox"
                checked={includeParentheses}
                onChange={(e) => setIncludeParentheses(e.target.checked)}
                className="w-4 h-4 accent-pure-black rounded"
              />
              <span>Retain English technical brackets (e.g. การถดถอยเชิงเส้น (Linear Regression))</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-body-sm text-zinc-charcoal">
              <input
                type="checkbox"
                checked={includeBleuReport}
                onChange={(e) => setIncludeBleuReport(e.target.checked)}
                className="w-4 h-4 accent-pure-black rounded"
              />
              <span>Append Royal Society Terminology & BLEU Verification Appendix</span>
            </label>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-space-sm flex items-center justify-end gap-space-sm border-t border-zinc-subtle">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-zinc-border text-zinc-charcoal hover:text-pure-black hover:bg-surface-dim rounded font-body-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-5 py-2 bg-pure-black hover:bg-zinc-charcoal text-pure-white rounded font-body-sm font-medium flex items-center gap-2 shadow-sm transition-all"
          >
            {isExporting ? (
              <>
                <span className="material-symbols-outlined text-[16px] animate-spin">
                  progress_activity
                </span>
                <span>Generating Document...</span>
              </>
            ) : exportSuccess ? (
              <>
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>Ready & Downloaded!</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>Download {format.toUpperCase()}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
