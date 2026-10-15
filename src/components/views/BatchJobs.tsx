import React, { useState } from 'react';
import { BatchJob } from '../../types';
import { INITIAL_BATCH_JOBS } from '../../data/mockData';

export const BatchJobs: React.FC = () => {
  const [jobs, setJobs] = useState<BatchJob[]>(INITIAL_BATCH_JOBS);
  const [isPaused, setIsPaused] = useState(false);

  const toggleJobStatus = (id: string) => {
    setJobs(
      jobs.map((j) => {
        if (j.id === id) {
          return {
            ...j,
            status: j.status === 'running' ? 'queued' : j.status === 'queued' ? 'running' : j.status,
          };
        }
        return j;
      })
    );
  };

  return (
    <div className="p-margin-desktop space-y-space-lg select-none pb-12">
      {/* Top Banner */}
      <div className="bg-pure-white p-space-lg rounded shadow-sm flex flex-wrap items-center justify-between gap-space-md border border-zinc-subtle">
        <div>
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-pure-black text-[22px]">layers</span>
            <h2 className="font-headline-md text-pure-black font-semibold">
              Batch Ingestion & Multi-Deck Worker Pipeline
            </h2>
          </div>
          <p className="font-body-sm text-zinc-muted mt-0.5">
            Distributed rasterization, Gemini Flash translation, and LaMa inpainting queue orchestration.
          </p>
        </div>

        <div className="flex items-center gap-space-sm">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-dim hover:bg-zinc-subtle text-pure-black border border-zinc-subtle rounded font-body-sm transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">
              {isPaused ? 'play_arrow' : 'pause'}
            </span>
            <span>{isPaused ? 'Resume All Workers' : 'Pause All Workers'}</span>
          </button>
        </div>
      </div>

      {/* Worker Pool Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
        {[
          { id: 'Worker #01 (Nvidia A100)', task: 'Document Decomposition (Rasterizer)', load: '68%', status: 'Active' },
          { id: 'Worker #02 (PaddleOCR v4)', task: 'Vector Polygon AST Mesh Generator', load: '82%', status: 'Active' },
          { id: 'Worker #03 (Gemini-Flash API)', task: 'Academic Thai Translation (Slide 07)', load: '94%', status: 'Active' },
        ].map((worker) => (
          <div key={worker.id} className="bg-pure-white p-space-md rounded shadow-sm border border-zinc-subtle space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-title-sm text-pure-black font-semibold text-[13px]">{worker.id}</span>
              <span className="w-2 h-2 rounded-full bg-pure-black animate-pulse"></span>
            </div>
            <div className="font-body-sm text-zinc-muted text-[12px]">{worker.task}</div>
            <div className="flex justify-between items-center text-zinc-charcoal font-label-sm text-[11px] pt-1">
              <span>Compute Load: <strong>{worker.load}</strong></span>
              <span className="text-pure-black font-medium">{worker.status}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Batch Queue Table */}
      <div className="bg-pure-white rounded shadow-sm border border-zinc-subtle overflow-hidden">
        <div className="p-space-sm bg-surface-dim border-b border-zinc-subtle flex justify-between items-center">
          <span className="font-title-sm font-semibold text-pure-black text-[13px]">
            Active Deck Pipeline Queue
          </span>
          <span className="font-label-sm text-zinc-muted">4 Decks In System</span>
        </div>

        <table className="w-full text-left border-collapse font-body-md">
          <thead>
            <tr className="border-b border-zinc-subtle text-zinc-muted font-label-sm text-label-sm uppercase">
              <th className="py-2.5 px-4 font-semibold">Job ID</th>
              <th className="py-2.5 px-4 font-semibold">Deck Filename</th>
              <th className="py-2.5 px-4 font-semibold">Pages</th>
              <th className="py-2.5 px-4 font-semibold">Progress</th>
              <th className="py-2.5 px-4 font-semibold">ETA</th>
              <th className="py-2.5 px-4 font-semibold">BLEU Score</th>
              <th className="py-2.5 px-4 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-subtle text-body-sm">
            {jobs.map((job) => (
              <tr key={job.id} className="hover:bg-surface-dim/60 transition-colors">
                <td className="py-3 px-4 font-mono font-medium text-pure-black">{job.id}</td>
                <td className="py-3 px-4 font-medium text-pure-black truncate max-w-[260px]">
                  {job.deckName}
                </td>
                <td className="py-3 px-4">{job.pages}</td>
                <td className="py-3 px-4 w-48">
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-surface-dim h-2 rounded overflow-hidden border border-zinc-subtle">
                      <div
                        className="bg-pure-black h-full"
                        style={{ width: `${job.progress}%` }}
                      ></div>
                    </div>
                    <span className="font-mono text-[11px] font-semibold text-pure-black">
                      {Math.round(job.progress)}%
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 font-mono text-zinc-charcoal">{job.eta}</td>
                <td className="py-3 px-4 font-mono text-pure-black font-semibold">
                  {job.bleuScore ? `${job.bleuScore}%` : '—'}
                </td>
                <td className="py-3 px-4">
                  {job.status === 'completed' ? (
                    <span className="font-label-sm text-[11px] bg-surface-dim text-pure-black px-2 py-0.5 rounded border border-zinc-subtle">
                      Finished
                    </span>
                  ) : (
                    <button
                      onClick={() => toggleJobStatus(job.id)}
                      className="text-[12px] underline text-zinc-charcoal hover:text-pure-black cursor-pointer"
                    >
                      {job.status === 'running' ? 'Pause' : 'Start'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
