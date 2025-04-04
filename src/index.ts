import { defineSecret } from "firebase-functions/params";
import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/googleai";

const GOOGLE_AI_API_KEY = defineSecret("GOOGLE_AI_API_KEY");

// Initialize the Google AI plugin correctly
const googleAIPlugin = googleAI({
  models: ["gemini-1.5-flash-latest"], // Use 'models' instead of 'model'
});

// Register the plugin properly
export const app = genkit({
  plugins: [googleAIPlugin], // Attach the plugin inside the Genkit initialization
})