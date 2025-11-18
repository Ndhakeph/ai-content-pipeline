// TypeScript type definitions for the AI Content Pipeline

export interface ContentItem {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIPrompt {
  id: string;
  prompt: string;
  model: string;
  parameters?: Record<string, any>;
}

export interface GenerationResult {
  id: string;
  promptId: string;
  content: string;
  status: "pending" | "completed" | "failed";
  error?: string;
}
