"use client";

import { useState } from "react";
import Timeline from "@/components/Timeline";
import ResultsDisplay from "@/components/ResultsDisplay";

interface PipelineResult {
  runId: string;
  research: string;
  draft: string;
  factCheckPassed: boolean;
  finalPost: string;
}

export default function Home() {
  const [prd, setPrd] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PipelineResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!prd.trim()) {
      setError("Please enter a Product Requirements Document");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prd }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate content");
      }

      if (data.success) {
        setResult(data.data);
      } else {
        throw new Error(data.error || "Unknown error occurred");
      }
    } catch (err) {
      console.error("Error generating content:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPrd("");
    setResult(null);
    setError(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            AI Content Pipeline
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Generate blog posts from Product Requirements Documents using our
            multi-agent AI system
          </p>
        </div>

        {/* Input Form */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8 border border-gray-200">
          <form onSubmit={handleSubmit}>
            <label
              htmlFor="prd"
              className="block text-lg font-semibold text-gray-800 mb-3"
            >
              Product Requirements Document (PRD)
            </label>
            <textarea
              id="prd"
              value={prd}
              onChange={(e) => setPrd(e.target.value)}
              disabled={loading}
              rows={12}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-800"
              placeholder="Enter your Product Requirements Document here...&#10;&#10;Example:&#10;&#10;Product: AI-powered task manager&#10;&#10;Key Features:&#10;- Smart task prioritization using AI&#10;- Natural language task creation&#10;- Automated deadline suggestions&#10;- Integration with calendar and email&#10;&#10;Target Audience: Busy professionals who need to optimize their workflow&#10;&#10;Goals: Write a blog post explaining how AI can revolutionize task management..."
            />

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 font-medium">❌ Error: {error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                disabled={loading || !prd.trim()}
                className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Generating...
                  </span>
                ) : (
                  "🚀 Generate Blog Post"
                )}
              </button>

              {result && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                >
                  🔄 New Request
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-lg p-12 border border-gray-200 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
              <h3 className="text-xl font-semibold text-gray-800">
                Generating Your Content
              </h3>
              <p className="text-gray-600 max-w-md">
                Our AI agents are working together to research, write, fact-check,
                and polish your blog post. This may take a minute...
              </p>
              <div className="flex gap-4 mt-4 text-sm text-gray-500">
                <span>🔍 Researching</span>
                <span>✍️ Writing</span>
                <span>✅ Fact-Checking</span>
                <span>✨ Polishing</span>
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        {result && !loading && (
          <div className="space-y-8 animate-fade-in">
            {/* Success Banner */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium text-center">
                ✅ Content generation completed successfully! Run ID:{" "}
                <code className="bg-green-100 px-2 py-1 rounded text-sm">
                  {result.runId}
                </code>
              </p>
            </div>

            {/* Results Display */}
            <ResultsDisplay
              finalPost={result.finalPost}
              research={result.research}
              factCheckPassed={result.factCheckPassed}
            />

            {/* Timeline */}
            <Timeline runId={result.runId} />
          </div>
        )}

        {/* Footer */}
        {!loading && !result && (
          <div className="text-center mt-12 text-gray-500 text-sm">
            <p>Powered by Gemini AI, Tavily Search, and Supabase</p>
          </div>
        )}
      </div>
    </main>
  );
}
