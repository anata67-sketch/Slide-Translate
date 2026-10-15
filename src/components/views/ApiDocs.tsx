import React, { useState } from 'react';
import { translateAcademicText } from '../../services/geminiService';

export const ApiDocs: React.FC = () => {
  const [testText, setTestText] = useState(
    'Backpropagation computes the gradient of the loss function with respect to each weight using the chain rule.'
  );
  const [includeParentheses, setIncludeParentheses] = useState(true);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTestApi = async () => {
    setIsLoading(true);
    try {
      const res = await translateAcademicText(testText, { includeParentheses });
      setApiResponse(res);
    } catch (e: any) {
      setApiResponse({ error: e.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-margin-desktop space-y-space-lg select-none pb-12">
      {/* Top Banner */}
      <div className="bg-pure-white p-space-lg rounded shadow-sm flex flex-wrap items-center justify-between gap-space-md border border-zinc-subtle">
        <div>
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-pure-black text-[22px]">terminal</span>
            <h2 className="font-headline-md text-pure-black font-semibold">
              SlideMorph Developer API & Python SDK
            </h2>
          </div>
          <p className="font-body-sm text-zinc-muted mt-0.5">
            Headless pipeline integration for institutional academic repositories, arXiv decks, and LMS.
          </p>
        </div>

        <span className="font-mono text-label-sm bg-surface-dim px-2.5 py-1 rounded border border-zinc-subtle">
          API Version: <strong>v2.1-TH-STABLE</strong>
        </span>
      </div>

      {/* Grid: Code Snippet & Interactive Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Left: Interactive API Tester (6 cols) */}
        <div className="lg:col-span-6 bg-pure-white p-space-lg rounded shadow-sm border border-zinc-subtle space-y-space-md">
          <div className="flex items-center justify-between border-b border-zinc-subtle pb-space-sm">
            <h3 className="font-title-sm font-semibold text-pure-black">Live Endpoint Sandbox</h3>
            <span className="font-mono text-[11px] bg-pure-black text-pure-white px-2 py-0.5 rounded">
              POST /api/translate
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block font-label-sm text-zinc-charcoal uppercase mb-1">
                Input Academic Text (EN)
              </label>
              <textarea
                rows={3}
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                className="w-full p-2.5 bg-surface-dim rounded text-body-sm text-pure-black focus:outline-none border border-zinc-subtle focus:ring-1 focus:ring-pure-black resize-none"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-body-sm text-zinc-charcoal">
              <input
                type="checkbox"
                checked={includeParentheses}
                onChange={(e) => setIncludeParentheses(e.target.checked)}
                className="w-4 h-4 accent-pure-black rounded"
              />
              <span>Retain technical terms in brackets</span>
            </label>

            <button
              onClick={handleTestApi}
              disabled={isLoading}
              className="w-full py-2 bg-pure-black hover:bg-zinc-charcoal text-pure-white rounded font-body-sm font-medium shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin">
                    progress_activity
                  </span>
                  <span>Executing Gemini Pipeline...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                  <span>Send API Request</span>
                </>
              )}
            </button>
          </div>

          {apiResponse && (
            <div className="space-y-1 pt-2">
              <div className="font-label-sm text-zinc-muted uppercase">JSON Response Body</div>
              <pre className="p-3 bg-graphite-dark text-pure-white font-mono text-[11px] rounded overflow-x-auto border border-zinc-border">
                {JSON.stringify(apiResponse, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Right: Code Examples (6 cols) */}
        <div className="lg:col-span-6 bg-pure-white p-space-lg rounded shadow-sm border border-zinc-subtle space-y-space-md">
          <div className="border-b border-zinc-subtle pb-space-sm flex justify-between items-center">
            <h3 className="font-title-sm font-semibold text-pure-black">Python & cURL Code Samples</h3>
            <span className="font-mono text-[11px] text-zinc-muted">Python 3.10+</span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="font-label-sm text-zinc-muted uppercase mb-1">cURL Execution</div>
              <pre className="p-3 bg-surface-dim text-pure-black font-mono text-[11px] rounded overflow-x-auto border border-zinc-subtle">
{`curl -X POST https://api.slidemorph.internal/v2/translate \\
  -H "Authorization: Bearer $SLIDEMORPH_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "Stochastic Gradient Descent with Momentum",
    "options": {
      "royalSocietyStandard": true,
      "preserveParentheses": true
    }
  }'`}
              </pre>
            </div>

            <div>
              <div className="font-label-sm text-zinc-muted uppercase mb-1">Python Pipeline Ingestion</div>
              <pre className="p-3 bg-surface-dim text-pure-black font-mono text-[11px] rounded overflow-x-auto border border-zinc-subtle">
{`import slidemorph

client = slidemorph.Client()

deck = client.ingest_pdf(
    file_path="CS229_Lecture04_Optimization.pdf",
    target_lang="th-academic",
    dpi=300
)

# Wait for vision OCR and Gemini-Flash translation
deck.wait_for_completion()

# Export synthesized Thai PDF with Sarabun typography
deck.export("CS229_Lecture04_TH.pdf")`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
