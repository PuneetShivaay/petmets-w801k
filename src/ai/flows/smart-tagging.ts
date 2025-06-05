
'use server';
/**
 * @fileOverview This file defines a Genkit flow for automatically suggesting relevant tags for uploaded pet documents using AI.
 *
 * - `suggestTags`: A function that takes a document description and suggests relevant tags.
 * - `SmartTaggingInput`: The input type for the `suggestTags` function.
 * - `SmartTaggingOutput`: The Zod schema for the AI model's direct output.
 * - `SmartTaggingFunctionOutput`: The return type for the exported `suggestTags` function, including AI status.
 */

import {ai, isAiEnabled, defaultModelName} from '@/ai/genkit';
import {z} from 'genkit';

const SmartTaggingInputSchema = z.object({
  documentDescription: z
    .string()
    .describe('A description of the pet document to be tagged.'),
});
export type SmartTaggingInput = z.infer<typeof SmartTaggingInputSchema>;

// This schema defines the direct output expected from the AI model via the prompt
const SmartTaggingOutputSchema = z.object({
  tags: z
    .array(z.string())
    .describe('An array of relevant tags for the pet document.'),
});
export type SmartTaggingOutput = z.infer<typeof SmartTaggingOutputSchema>;

// This schema defines the output of our exported `suggestTags` function
export const SmartTaggingFunctionOutputSchema = z.object({
  tags: z.array(z.string()).describe('An array of relevant tags for the pet document.'),
  aiUsed: z.boolean().describe('Indicates if AI was used to generate the tags.'),
  errorMessage: z.string().optional().describe('Optional error message if AI tagging failed.'),
});
export type SmartTaggingFunctionOutput = z.infer<typeof SmartTaggingFunctionOutputSchema>;


export async function suggestTags(input: SmartTaggingInput): Promise<SmartTaggingFunctionOutput> {
  if (!isAiEnabled) {
    console.warn("Smart Tagging: AI features disabled (GOOGLE_API_KEY not configured). Returning default tags.");
    return { tags: ["document", "general"], aiUsed: false };
  }
  try {
    // smartTaggingFlow returns SmartTaggingOutput (model's direct output)
    const flowOutput: SmartTaggingOutput = await smartTaggingFlow(input);
    return { tags: flowOutput.tags, aiUsed: true, errorMessage: undefined };
  } catch (error) {
    console.error("Error during smartTaggingFlow execution or AI prompt:", error);
    const message = error instanceof Error ? error.message : "Unknown AI processing error";
    return { tags: ["error", "tagging-failed"], aiUsed: false, errorMessage: `AI Error: ${message}` };
  }
}

const smartTaggingPrompt = ai.definePrompt({
  name: 'smartTaggingPrompt',
  model: defaultModelName, // Specify the model for this prompt
  input: {schema: SmartTaggingInputSchema},
  output: {schema: SmartTaggingOutputSchema}, // AI model output schema
  prompt: `You are an AI assistant that suggests relevant tags for pet documents.
  Based on the description of the document, suggest a list of tags that can be used to categorize the document.
  The tags should be relevant to the content of the document.

  Description: {{{documentDescription}}}

  Tags:`,
});

const smartTaggingFlow = ai.defineFlow(
  {
    name: 'smartTaggingFlow',
    inputSchema: SmartTaggingInputSchema,
    outputSchema: SmartTaggingOutputSchema, // Flow output schema matches model output
  },
  async (input): Promise<SmartTaggingOutput> => {
    // This flow should not be called if AI is disabled, but as a safeguard:
    if (!isAiEnabled) {
        console.warn("smartTaggingFlow called directly but AI is disabled. Returning error tags.");
        // This return type must match SmartTaggingOutputSchema
        return { tags: ["ai-disabled-in-flow"] };
    }
    const {output} = await smartTaggingPrompt(input);
    return output!; // output is guaranteed by schema if no error
  }
);
