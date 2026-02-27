export interface PipelineState {
  runId: string;
  prd: string;
  research?: string;
  draft?: string;
  factCheckPassed?: boolean;
  finalPost?: string;
}
