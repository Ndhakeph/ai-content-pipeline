import { PipelineState } from "@/types";
import {
  runResearcher,
  runWriter,
  runFactChecker,
  runPolisher,
} from "./agents";
import { logAgentAction } from "./supabase";

/**
 * Main pipeline orchestrator that coordinates all agents to generate content
 *
 * WORKFLOW:
 * 1. Researcher: Extracts topics from PRD and conducts web research
 * 2. Writer: Generates blog post draft based on PRD and research
 * 3. Fact-Checker: Validates draft against research (with retry logic)
 * 4. Polisher: Refines the final draft for publication
 *
 * Each step is logged to Supabase for observability and debugging.
 *
 * @param prd - Product Requirements Document describing the content to create
 * @returns Complete pipeline state with all intermediate and final outputs
 * @throws Error if any critical agent fails
 */
export default async function runPipeline(prd: string): Promise<PipelineState> {
  // Generate unique run identifier
  const runId = crypto.randomUUID();

  // Initialize pipeline state
  const state: PipelineState = {
    runId,
    prd,
  };

  console.log(`[Pipeline ${runId}] Starting content generation pipeline`);

  // STEP 1: Research Agent
  try {
    console.log(`[Pipeline ${runId}] Running researcher...`);
    const research = await runResearcher(prd);
    state.research = research;

    await logAgentAction(runId, "researcher", prd, research);
    console.log(`[Pipeline ${runId}] Research completed`);
  } catch (error) {
    console.error(`[Pipeline ${runId}] Researcher failed:`, error);
    await logAgentAction(
      runId,
      "researcher",
      prd,
      "",
      { error: true, message: error instanceof Error ? error.message : "Unknown error" }
    );
    throw new Error(`Pipeline failed at research stage: ${error instanceof Error ? error.message : "Unknown error"}`);
  }

  // STEP 2: Writer Agent (Initial Draft)
  try {
    console.log(`[Pipeline ${runId}] Running writer...`);
    const draft = await runWriter(prd, state.research!);
    state.draft = draft;

    await logAgentAction(
      runId,
      "writer",
      JSON.stringify({ prd, research: state.research }),
      draft
    );
    console.log(`[Pipeline ${runId}] Initial draft completed`);
  } catch (error) {
    console.error(`[Pipeline ${runId}] Writer failed:`, error);
    await logAgentAction(
      runId,
      "writer",
      JSON.stringify({ prd, research: state.research }),
      "",
      { error: true, message: error instanceof Error ? error.message : "Unknown error" }
    );
    throw new Error(`Pipeline failed at writing stage: ${error instanceof Error ? error.message : "Unknown error"}`);
  }

  // STEP 3: Fact-Checker Agent (with retry logic)
  const maxFactCheckRetries = 2;
  let factCheckAttempt = 0;
  let factCheckPassed = false;

  while (factCheckAttempt < maxFactCheckRetries && !factCheckPassed) {
    try {
      console.log(`[Pipeline ${runId}] Running fact-checker (attempt ${factCheckAttempt + 1}/${maxFactCheckRetries})...`);

      const factCheckResult = await runFactChecker(state.draft!, state.research!);

      await logAgentAction(
        runId,
        "fact-checker",
        state.draft!,
        JSON.stringify(factCheckResult),
        {
          attempt: factCheckAttempt + 1,
          passed: factCheckResult.passed,
          issues: factCheckResult.issues,
        }
      );

      if (factCheckResult.passed) {
        console.log(`[Pipeline ${runId}] Fact-check passed`);
        state.factCheckPassed = true;
        factCheckPassed = true;
      } else {
        console.warn(`[Pipeline ${runId}] Fact-check failed. Issues found:`, factCheckResult.issues);

        factCheckAttempt++;

        // If we have retries left, revise the draft
        if (factCheckAttempt < maxFactCheckRetries) {
          console.log(`[Pipeline ${runId}] Revising draft to address fact-check issues...`);

          const revisionPrompt = `The fact-checker found these issues: ${factCheckResult.issues.join(", ")}. Please revise the draft to address them.`;
          const revisedDraft = await runWriter(
            prd,
            state.research! + "\n\nREVISION FEEDBACK: " + revisionPrompt
          );

          state.draft = revisedDraft;

          await logAgentAction(
            runId,
            "writer",
            JSON.stringify({ prd, research: state.research, revisionFeedback: revisionPrompt }),
            revisedDraft,
            { isRevision: true, attempt: factCheckAttempt + 1 }
          );

          console.log(`[Pipeline ${runId}] Draft revised (attempt ${factCheckAttempt + 1})`);
        } else {
          // Max retries reached, log warning and proceed
          console.warn(`[Pipeline ${runId}] Max fact-check retries reached. Proceeding with current draft.`);
          state.factCheckPassed = false;

          await logAgentAction(
            runId,
            "fact-checker",
            state.draft!,
            "Max retries reached",
            {
              warning: true,
              message: "Proceeding despite fact-check failures",
              finalIssues: factCheckResult.issues,
            }
          );
        }
      }
    } catch (error) {
      console.error(`[Pipeline ${runId}] Fact-checker failed:`, error);
      await logAgentAction(
        runId,
        "fact-checker",
        state.draft!,
        "",
        {
          error: true,
          attempt: factCheckAttempt + 1,
          message: error instanceof Error ? error.message : "Unknown error",
        }
      );
      throw new Error(`Pipeline failed at fact-checking stage: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  // STEP 4: Polisher Agent
  try {
    console.log(`[Pipeline ${runId}] Running polisher...`);
    const finalPost = await runPolisher(state.draft!);
    state.finalPost = finalPost;

    await logAgentAction(runId, "polisher", state.draft!, finalPost);
    console.log(`[Pipeline ${runId}] Content polished and finalized`);
  } catch (error) {
    console.error(`[Pipeline ${runId}] Polisher failed:`, error);
    await logAgentAction(
      runId,
      "polisher",
      state.draft!,
      "",
      { error: true, message: error instanceof Error ? error.message : "Unknown error" }
    );
    throw new Error(`Pipeline failed at polishing stage: ${error instanceof Error ? error.message : "Unknown error"}`);
  }

  console.log(`[Pipeline ${runId}] Pipeline completed successfully`);
  return state;
}
