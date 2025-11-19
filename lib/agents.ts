import { callGemini } from "./gemini";
import { searchWeb } from "./tavily";

/**
 * Research agent that extracts key topics from a PRD and conducts web research
 * @param prd - Product Requirements Document text
 * @returns Formatted research findings with sources
 */
export async function runResearcher(prd: string): Promise<string> {
  try {
    // Step 1: Extract 2-3 key topics from the PRD using Gemini
    const topicExtractionPrompt = `You are a research assistant. Analyze this PRD and extract 2-3 key topics or requirements that need research.
Return ONLY the topics as a comma-separated list, nothing else.

PRD: ${prd}`;

    const topicsResponse = await callGemini(topicExtractionPrompt);
    const topics = topicsResponse
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .slice(0, 3);

    if (topics.length === 0) {
      throw new Error("Failed to extract topics from PRD");
    }

    // Step 2: Search the web for each topic
    const allResults: Array<{ topic: string; results: string[] }> = [];

    for (const topic of topics) {
      const searchResults = await searchWeb(topic);
      allResults.push({ topic, results: searchResults });
    }

    // Step 3: Format the results with sources
    let formattedResearch = "Research findings:\n\n";

    allResults.forEach(({ topic, results }) => {
      formattedResearch += `Topic: ${topic}\n`;
      results.forEach((result, index) => {
        formattedResearch += `\n[Fact ${index + 1}]\n${result}\nSource: Web search result for "${topic}"\n`;
      });
      formattedResearch += "\n---\n\n";
    });

    return formattedResearch;
  } catch (error) {
    console.error("Error in runResearcher:", error);
    throw new Error(
      `Research agent failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Writer agent that generates a blog post based on PRD and research
 * @param prd - Product Requirements Document text
 * @param research - Research findings from the researcher agent
 * @returns Generated blog post draft
 */
export async function runWriter(prd: string, research: string): Promise<string> {
  try {
    const writerPrompt = `You are a blog writer. Based on this PRD: ${prd}

And these research findings: ${research}

Write a comprehensive blog post (800-1000 words) that covers the key points. Include facts from the research with inline references. Make it engaging and well-structured with clear sections.`;

    const blogDraft = await callGemini(writerPrompt);
    return blogDraft;
  } catch (error) {
    console.error("Error in runWriter:", error);
    throw new Error(
      `Writer agent failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Fact-checker agent that validates a draft against research sources
 * @param draft - Blog post draft to fact-check
 * @param research - Research findings to validate against
 * @returns Object indicating if fact-check passed and any issues found
 */
export async function runFactChecker(
  draft: string,
  research: string
): Promise<{ passed: boolean; issues: string[] }> {
  try {
    const factCheckPrompt = `You are a fact-checker. Compare this draft: ${draft}

Against these sources: ${research}

List any claims in the draft that are NOT supported by the sources. If everything checks out, respond with 'PASS'. Otherwise, list the unsupported claims as bullet points.`;

    const factCheckResult = await callGemini(
      factCheckPrompt,
      "gemini-2.0-flash"
    );

    // Parse the response
    const resultText = factCheckResult.toUpperCase();

    if (resultText.includes("PASS")) {
      return { passed: true, issues: [] };
    }

    // Extract issues from the response
    const issues = factCheckResult
      .split("\n")
      .filter((line) => line.trim().length > 0 && !line.toUpperCase().includes("PASS"))
      .map((line) => line.replace(/^[-*•]\s*/, "").trim())
      .filter((line) => line.length > 0);

    return { passed: false, issues };
  } catch (error) {
    console.error("Error in runFactChecker:", error);
    throw new Error(
      `Fact-checker agent failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Polisher agent that refines a blog post for clarity and professional tone
 * @param draft - Blog post draft to polish
 * @returns Polished version of the blog post
 */
export async function runPolisher(draft: string): Promise<string> {
  try {
    const polishPrompt = `You are a style editor. Polish this blog post for clarity, engagement, and professional tone. Fix any grammar issues. Do NOT change factual content:

${draft}`;

    const polishedPost = await callGemini(polishPrompt);
    return polishedPost;
  } catch (error) {
    console.error("Error in runPolisher:", error);
    throw new Error(
      `Polisher agent failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
