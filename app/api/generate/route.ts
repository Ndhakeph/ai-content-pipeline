import { NextRequest, NextResponse } from "next/server";
import runPipeline from "@/lib/orchestrator";
import { PipelineState } from "@/types";

/**
 * API endpoint for generating content using the multi-agent pipeline
 *
 * POST /api/generate
 * Body: { prd: string }
 *
 * @returns Pipeline state with all generated content
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { prd } = body;

    // Validate input
    if (!prd || typeof prd !== "string" || prd.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid input: 'prd' field is required and must be a non-empty string",
        },
        { status: 400 }
      );
    }

    console.log(`[API] Received content generation request`);

    // Run the pipeline
    const result: PipelineState = await runPipeline(prd.trim());

    console.log(`[API] Pipeline completed successfully. Run ID: ${result.runId}`);

    // Return success response
    return NextResponse.json(
      {
        success: true,
        data: {
          runId: result.runId,
          research: result.research,
          draft: result.draft,
          factCheckPassed: result.factCheckPassed,
          finalPost: result.finalPost,
        },
      },
      {
        status: 200,
        headers: {
          // CORS headers for local development
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  } catch (error) {
    console.error("[API] Pipeline execution failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "An unknown error occurred",
      },
      {
        status: 500,
        headers: {
          // CORS headers for local development
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  }
}

/**
 * Handle OPTIONS requests for CORS preflight
 */
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    }
  );
}
