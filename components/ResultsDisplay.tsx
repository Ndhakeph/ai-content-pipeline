"use client";

import { useState } from "react";

interface ResultsDisplayProps {
  finalPost: string;
  research: string;
  factCheckPassed?: boolean;
}

export default function ResultsDisplay({
  finalPost,
  research,
  factCheckPassed,
}: ResultsDisplayProps) {
  const [researchExpanded, setResearchExpanded] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(finalPost);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleDownloadText = () => {
    const blob = new Blob([finalPost], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `blog-post-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
      {/* Left Column - Final Post */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Final Blog Post</h2>
            <div className="flex gap-2">
              <button
                onClick={handleCopyToClipboard}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                {copySuccess ? "✓ Copied!" : "📋 Copy"}
              </button>
              <button
                onClick={handleDownloadText}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
              >
                ⬇️ Download
              </button>
            </div>
          </div>
          <div className="prose prose-slate max-w-none">
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {finalPost}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Metadata */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 sticky top-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Metadata</h3>

          {/* Fact-Check Status */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-600 mb-2">
              Fact-Check Status
            </h4>
            <div
              className={`flex items-center gap-2 px-4 py-3 rounded-md ${
                factCheckPassed
                  ? "bg-green-50 border border-green-200"
                  : "bg-yellow-50 border border-yellow-200"
              }`}
            >
              <span className="text-2xl">
                {factCheckPassed ? "✅" : "⚠️"}
              </span>
              <span
                className={`font-medium ${
                  factCheckPassed ? "text-green-700" : "text-yellow-700"
                }`}
              >
                {factCheckPassed ? "Passed" : "Failed"}
              </span>
            </div>
          </div>

          {/* Research Sources */}
          <div>
            <h4 className="text-sm font-semibold text-gray-600 mb-2">
              Research Sources
            </h4>
            <div className="bg-gray-50 rounded-md border border-gray-200 p-4">
              <div
                className={`${
                  researchExpanded ? "" : "max-h-32 overflow-hidden"
                } text-sm text-gray-700 whitespace-pre-wrap`}
              >
                {research}
              </div>
              <button
                onClick={() => setResearchExpanded(!researchExpanded)}
                className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                {researchExpanded ? "Show less ▲" : "Show more ▼"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
