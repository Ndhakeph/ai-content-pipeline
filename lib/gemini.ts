import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Calls the Gemini API to generate text content
 * @param prompt - The prompt to send to the model
 * @param model - The model to use (default: "gemini-2.0-flash-exp")
 * @returns The generated text content
 */
export async function callGemini(
  prompt: string,
  model: string = "gemini-2.0-flash-exp"
): Promise<string> {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      throw new Error("GOOGLE_API_KEY environment variable is not set");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const generativeModel = genAI.getGenerativeModel({ model });

    const result = await generativeModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error(
      `Failed to generate content with Gemini: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
