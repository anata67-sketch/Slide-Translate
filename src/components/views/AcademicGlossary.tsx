import React, { useState } from 'react';
import { GlossaryTerm } from '../../types';
import { INITIAL_GLOSSARY } from '../../data/mockData';

export const AcademicGlossary: React.FC = () => {
  const [glossary, setGlossary] = useState<GlossaryTerm[]>(INITIAL_GLOSSARY);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);

  // New term form state
  const [newEnglish, setNewEnglish] = useState('');
  const [newThai, setNewThai] = useState('');
  const [newDomain, setNewDomain] = useState<GlossaryTerm['domain']>('Machine Learning');
  const [newNotes, setNewNotes] = useState('');

  const domains = ['All', 'Machine Learning', 'Linear Algebra', 'Optimization', 'Computer Vision', 'Statistics'];

  const filtered = glossary.filter((term) => {
    const matchesSearch =
      term.english.toLowerCase().includes(searchQuery.toLowerCase()) ||
      term.thai.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDomain = selectedDomain === 'All' || term.domain === selectedDomain;
    return matchesSearch && matchesDomain;
  });

  const handleAddTerm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEnglish.trim() || !newThai.trim()) return;

    const newEntry: GlossaryTerm = {
      id: `term-${Date.now()}`,
      english: newEnglish.trim(),
      thai: newThai.trim(),
      domain: newDomain,
      royalSocietyStandard: true,
      notes: newNotes.trim() || 'User verified custom term',
    };

    setGlossary([newEntry, ...glossary]);
    setNewEnglish('');
    setNewThai('');
    setNewNotes('');
    setShowAddModal(false);
  };

  return (
    <div className="p-margin-desktop space-y-space-lg select-none pb-12">
      {/* Top Banner */}
      <div className="bg-pure-white p-space-lg rounded shadow-sm flex flex-wrap items-center justify-between gap-space-md border border-zinc-subtle">
        <div>
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-pure-black text-[22px]">menu_book</span>
            <h2 className="font-headline-md text-pure-black font-semibold">
              Academic Glossary & Royal Society Lexicon
            </h2>
          </div>
          <p className="font-body-sm text-zinc-muted mt-0.5">
            ราชบัณฑิตยสภา Standard Thai Terminology Rules for STEM, Computer Science, and Mathematics.
          </p>
        </div>

        <div className="flex items-center gap-space-sm">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-pure-black text-pure-white hover:bg-zinc-charcoal rounded font-body-sm transition-all cursor-pointer shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Add Term Mapping</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-pure-white p-space-md rounded shadow-sm border border-zinc-subtle flex flex-wrap items-center justify-between gap-space-md">
        <div className="flex-1 min-w-[240px] relative">
          <span className="material-symbols-outlined text-[18px] text-zinc-muted absolute left-3 top-2.5">
            search
          </span>
          <input
            type="text"
            placeholder="Search English or Thai scholarly terms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-surface-dim rounded text-body-sm text-pure-black focus:outline-none ring-1 ring-zinc-subtle focus:ring-pure-black border border-zinc-subtle"
          />
        </div>

        {/* Domain Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {domains.map((dom) => (
            <button
              key={dom}
              onClick={() => setSelectedDomain(dom)}
              className={`px-2.5 py-1 rounded text-body-sm transition-all cursor-pointer ${
                selectedDomain === dom
                  ? 'bg-pure-black text-pure-white font-medium shadow-sm'
                  : 'bg-surface-dim hover:bg-zinc-subtle text-zinc-charcoal'
              }`}
            >
              {dom}
            </button>
          ))}
        </div>
      </div>

      {/* Glossary Table */}
      <div className="bg-pure-white rounded shadow-sm border border-zinc-subtle overflow-hidden">
        <table className="w-full text-left border-collapse font-body-md">
          <thead>
            <tr className="bg-surface-dim border-b border-zinc-subtle text-zinc-muted font-label-sm text-label-sm uppercase">
              <th className="py-2.5 px-4 font-semibold">Source English Term</th>
              <th className="py-2.5 px-4 font-semibold">Standard Thai Academic (ราชบัณฑิตฯ)</th>
              <th className="py-2.5 px-4 font-semibold">Domain</th>
              <th className="py-2.5 px-4 font-semibold">Standard Status</th>
              <th className="py-2.5 px-4 font-semibold">Lexicon Reference</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-subtle text-body-sm">
            {filtered.map((term) => (
              <tr key={term.id} className="hover:bg-surface-dim/60 transition-colors">
                <td className="py-3 px-4 font-medium text-pure-black">{term.english}</td>
                <td className="py-3 px-4 font-medium text-pure-black">{term.thai}</td>
                <td className="py-3 px-4">
                  <span className="font-label-sm text-[10px] bg-surface-dim px-2 py-0.5 rounded text-zinc-charcoal border border-zinc-subtle">
                    {term.domain}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center gap-1 font-label-sm text-[10px] bg-pure-black text-pure-white px-2 py-0.5 rounded">
                    <span className="material-symbols-outlined text-[12px]">verified</span>
                    <span>Royal Society Approved</span>
                  </span>
                </td>
                <td className="py-3 px-4 text-zinc-muted text-[12px]">{term.notes || '—'}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-zinc-muted">
                  No terms matched your search query.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Term Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-pure-black/60 backdrop-blur-xs p-4 select-none">
          <form
            onSubmit={handleAddTerm}
            className="bg-pure-white border border-pure-black rounded-lg w-full max-w-md p-space-lg shadow-2xl space-y-space-md"
          >
            <div className="flex items-center justify-between pb-space-sm border-b border-zinc-subtle">
              <h3 className="font-headline-md text-pure-black font-semibold">Add Custom Term</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-zinc-muted hover:text-pure-black"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-label-sm text-zinc-charcoal uppercase mb-1">
                  Source English Term
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cross-Entropy Loss"
                  value={newEnglish}
                  onChange={(e) => setNewEnglish(e.target.value)}
                  className="w-full p-2 bg-surface-dim rounded text-body-sm text-pure-black focus:outline-none border border-zinc-subtle focus:ring-1 focus:ring-pure-black"
                />
              </div>

              <div>
                <label className="block font-label-sm text-zinc-charcoal uppercase mb-1">
                  Standard Thai Translation
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. การสูญเสียเอนโทรปีไขว้"
                  value={newThai}
                  onChange={(e) => setNewThai(e.target.value)}
                  className="w-full p-2 bg-surface-dim rounded text-body-sm text-pure-black focus:outline-none border border-zinc-subtle focus:ring-1 focus:ring-pure-black"
                />
              </div>

              <div>
                <label className="block font-label-sm text-zinc-charcoal uppercase mb-1">Domain</label>
                <select
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value as any)}
                  className="w-full p-2 bg-surface-dim rounded text-body-sm text-pure-black focus:outline-none border border-zinc-subtle"
                >
                  <option value="Machine Learning">Machine Learning</option>
                  <option value="Linear Algebra">Linear Algebra</option>
                  <option value="Optimization">Optimization</option>
                  <option value="Computer Vision">Computer Vision</option>
                  <option value="Statistics">Statistics</option>
                </select>
              </div>

              <div>
                <label className="block font-label-sm text-zinc-charcoal uppercase mb-1">
                  Reference Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chulalongkorn CS Department Lexicon"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full p-2 bg-surface-dim rounded text-body-sm text-pure-black focus:outline-none border border-zinc-subtle"
                />
              </div>
            </div>

            <div className="flex justify-end gap-space-sm pt-space-sm border-t border-zinc-subtle">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-1.5 border border-zinc-border rounded font-body-sm hover:bg-surface-dim"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-pure-black text-pure-white rounded font-body-sm hover:bg-zinc-charcoal"
              >
                Save Term
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
