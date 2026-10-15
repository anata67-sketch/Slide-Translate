import React from 'react';
import { DeckData } from '../../types';

export type NavPath =
  | 'translator-studio'
  | 'side-by-side-reviewer'
  | 'ocr-inspector'
  | 'glossary-management'
  | 'batch-jobs'
  | 'api-and-docs';

interface SidebarProps {
  currentPath: NavPath;
  onNavigate: (path: NavPath) => void;
  currentDeck: DeckData;
  decks: DeckData[];
  onSelectDeck: (deck: DeckData) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  onNavigate,
  currentDeck,
  decks,
  onSelectDeck,
}) => {
  const [showDeckPicker, setShowDeckPicker] = React.useState(false);

  const navItems: { path: NavPath; label: string; icon: string }[] = [
    { path: 'translator-studio', label: 'Translator Studio', icon: 'dashboard' },
    { path: 'side-by-side-reviewer', label: 'Side-by-Side Reviewer', icon: 'compare' },
    { path: 'ocr-inspector', label: 'OCR Inspector', icon: 'document_scanner' },
    { path: 'glossary-management', label: 'Academic Glossary', icon: 'menu_book' },
    { path: 'batch-jobs', label: 'Batch Jobs', icon: 'layers' },
    { path: 'api-and-docs', label: 'API & Docs', icon: 'terminal' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-pure-white border-r border-zinc-subtle z-50 flex flex-col select-none">
      {/* Brand Header */}
      <div className="h-14 px-margin flex items-center border-b border-zinc-subtle gap-space-sm">
        <div className="w-6 h-6 bg-pure-black flex items-center justify-center rounded">
          <span className="material-symbols-outlined text-pure-white text-[16px]">translate</span>
        </div>
        <span className="font-headline-md text-headline-md uppercase text-pure-black tracking-tight">
          SlideMorph
        </span>
      </div>

      {/* Current Deck Sub-card */}
      <div className="p-space-sm border-b border-zinc-subtle relative">
        <div
          onClick={() => setShowDeckPicker(!showDeckPicker)}
          className="bg-surface-dim hover:bg-zinc-subtle/70 transition-colors p-space-sm rounded border border-zinc-subtle cursor-pointer"
          title="Click to switch active deck"
        >
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-zinc-muted uppercase">Current Deck</span>
            <span className="material-symbols-outlined text-[14px] text-zinc-muted">
              {showDeckPicker ? 'expand_less' : 'unfold_more'}
            </span>
          </div>
          <div className="font-title-sm text-title-sm text-pure-black truncate font-medium mt-0.5">
            {currentDeck.filename}
          </div>
          <div className="flex items-center justify-between mt-space-xs font-label-sm text-label-sm text-zinc-charcoal">
            <span>{currentDeck.totalPages} SLIDES</span>
            <span className="font-semibold uppercase">{currentDeck.status}</span>
          </div>
        </div>

        {/* Deck Dropdown Selector */}
        {showDeckPicker && (
          <div className="absolute left-space-sm right-space-sm top-full mt-1 bg-pure-white rounded border border-zinc-border shadow-lg z-50 p-1 space-y-1">
            <div className="px-2 py-1 text-zinc-muted font-label-sm text-label-sm uppercase">Switch Deck</div>
            {decks.map((deck) => (
              <button
                key={deck.id}
                onClick={() => {
                  onSelectDeck(deck);
                  setShowDeckPicker(false);
                }}
                className={`w-full text-left p-1.5 rounded text-body-sm transition-colors flex flex-col ${
                  deck.id === currentDeck.id
                    ? 'bg-pure-black text-pure-white'
                    : 'hover:bg-surface-dim text-pure-black'
                }`}
              >
                <span className="font-medium truncate">{deck.filename}</span>
                <span className="text-[10px] opacity-75">
                  {deck.totalPages} slides • {deck.fileSize}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-space-sm space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              className={`w-full flex items-center gap-space-sm px-space-sm py-2 rounded transition-colors font-body-md text-body-md text-left ${
                isActive
                  ? 'bg-pure-black text-pure-white'
                  : 'text-zinc-charcoal hover:bg-surface-dim hover:text-pure-black'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Engine Indicator */}
      <div className="p-space-sm border-t border-zinc-subtle font-label-sm text-label-sm text-zinc-muted flex items-center justify-between">
        <span>LATIN ⇄ THAI MT</span>
        <span className="w-2 h-2 rounded-full bg-pure-black"></span>
      </div>
    </aside>
  );
};
