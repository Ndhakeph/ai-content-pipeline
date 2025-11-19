"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface AgentLog {
  id: string;
  run_id: string;
  agent: string;
  input: string;
  output: string;
  metadata: any;
  created_at: string;
}

interface TimelineProps {
  runId: string;
}

const AGENT_ICONS: Record<string, string> = {
  researcher: "🔍",
  writer: "✍️",
  "fact-checker": "✅",
  polisher: "✨",
};

export default function Timeline({ runId }: TimelineProps) {
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("agent_logs")
        .select("*")
        .eq("run_id", runId)
        .order("created_at", { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      setLogs(data || []);
    } catch (err) {
      console.error("Error fetching logs:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [runId]);

  const toggleExpanded = (logId: string) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  const truncateText = (text: string, maxLength: number = 200) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading timeline...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 border border-red-200">
        <div className="text-red-600">
          <p className="font-semibold">Error loading timeline:</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Agent Timeline</h2>
        <button
          onClick={fetchLogs}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
        >
          🔄 Refresh
        </button>
      </div>

      {logs.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No logs found for this run.</p>
      ) : (
        <div className="relative">
          {/* Vertical Timeline Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

          {/* Timeline Items */}
          <div className="space-y-6">
            {logs.map((log, index) => {
              const isExpanded = expandedLogs.has(log.id);
              const hasError = log.metadata?.error;
              const isWarning = log.metadata?.warning;

              return (
                <div key={log.id} className="relative pl-16">
                  {/* Timeline Dot */}
                  <div
                    className={`absolute left-4 w-5 h-5 rounded-full border-4 ${
                      hasError
                        ? "bg-red-500 border-red-200"
                        : isWarning
                        ? "bg-yellow-500 border-yellow-200"
                        : "bg-green-500 border-green-200"
                    }`}
                  ></div>

                  {/* Timeline Content */}
                  <div
                    className={`border rounded-lg p-4 ${
                      hasError
                        ? "bg-red-50 border-red-200"
                        : isWarning
                        ? "bg-yellow-50 border-yellow-200"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">
                          {AGENT_ICONS[log.agent] || "🤖"}
                        </span>
                        <h3 className="font-semibold text-gray-800 capitalize">
                          {log.agent}
                        </h3>
                        {log.metadata?.attempt && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            Attempt {log.metadata.attempt}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(log.created_at)}
                      </span>
                    </div>

                    {hasError && (
                      <div className="text-red-700 text-sm mb-2">
                        ❌ Error: {log.metadata.message}
                      </div>
                    )}

                    {isWarning && (
                      <div className="text-yellow-700 text-sm mb-2">
                        ⚠️ {log.metadata.message}
                      </div>
                    )}

                    {/* Input/Output Preview */}
                    <div className="text-sm space-y-2">
                      <div>
                        <span className="font-medium text-gray-600">Input: </span>
                        <span className="text-gray-700">
                          {isExpanded
                            ? log.input
                            : truncateText(log.input, 150)}
                        </span>
                      </div>
                      {log.output && (
                        <div>
                          <span className="font-medium text-gray-600">Output: </span>
                          <span className="text-gray-700">
                            {isExpanded
                              ? log.output
                              : truncateText(log.output, 150)}
                          </span>
                        </div>
                      )}
                    </div>

                    {(log.input.length > 150 || log.output.length > 150) && (
                      <button
                        onClick={() => toggleExpanded(log.id)}
                        className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        {isExpanded ? "Show less ▲" : "Show more ▼"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
