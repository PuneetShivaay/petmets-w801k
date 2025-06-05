
'use server';

import { suggestTags, type SmartTaggingInput, type SmartTaggingFunctionOutput } from '@/ai/flows/smart-tagging';

export interface FormState {
  message: string;
  tags?: string[];
  error?: string;
  aiUsed?: boolean;
}

export async function getSuggestedTagsAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const documentDescription = formData.get('documentDescription') as string;

  if (!documentDescription || documentDescription.trim().length < 10) {
    return {
      message: 'Failed to get tags.',
      error: 'Please provide a more detailed document description (at least 10 characters).',
      tags: prevState.tags || [], // Keep previous tags if any
      aiUsed: prevState.aiUsed,
    };
  }

  try {
    const input: SmartTaggingInput = { documentDescription };
    const output: SmartTaggingFunctionOutput = await suggestTags(input);

    if (output.errorMessage) {
        return {
            message: 'AI tag suggestion failed.',
            tags: output.tags, // These would be fallback error tags like ["error", "tagging-failed"]
            error: output.errorMessage,
            aiUsed: output.aiUsed,
        };
    }

    if (output.aiUsed) {
      if (output.tags && output.tags.length > 0) {
        return {
          message: 'AI tags suggested successfully.',
          tags: output.tags,
          aiUsed: true,
          error: undefined,
        };
      } else {
        // AI was used but returned no tags
        return {
          message: 'AI suggested no specific tags. Using default tags.',
          tags: ["document", "general"], // Provide some default if AI returns empty
          aiUsed: true,
          error: undefined,
        };
      }
    } else {
      // AI was not used (e.g., GOOGLE_API_KEY missing or other non-error reason)
      return {
        message: 'AI features are currently unavailable. Using default tags.',
        tags: output.tags, // These are default tags like ["document", "general"]
        aiUsed: false,
        error: undefined,
      };
    }
  } catch (e) {
    // This catch block handles unexpected errors from the suggestTags call itself,
    // though suggestTags is designed to catch its internal errors and return them in SmartTaggingFunctionOutput.
    console.error("Unexpected error in getSuggestedTagsAction:", e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred during tag suggestion.';
    return {
      message: 'Failed to get tags due to an unexpected system error.',
      error: errorMessage,
      tags: prevState.tags || ["error"],
      aiUsed: false, // Unsure if AI was involved if we reach here
    };
  }
}
