/**
 * Searches the web using Tavily API
 * @param query - The search query
 * @returns Array of result snippets/content
 */
export async function searchWeb(query: string): Promise<string[]> {
  try {
    const apiKey = process.env.TAVILY_API_KEY;

    if (!apiKey) {
      throw new Error("TAVILY_API_KEY environment variable is not set");
    }

    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
        query: query,
        max_results: 5,
      }),
    });

    if (!response.ok) {
      throw new Error(`Tavily API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Extract snippets/content from results
    if (data.results && Array.isArray(data.results)) {
      return data.results.map((result: any) => result.content || result.snippet || "");
    }

    return [];
  } catch (error) {
    console.error("Error searching with Tavily API:", error);
    throw new Error(
      `Failed to search web with Tavily: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
