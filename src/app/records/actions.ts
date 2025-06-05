'use server';

import { suggestTags, type SmartTaggingInput, type SmartTaggingOutput } from '@/ai/flows/smart-tagging';

interface FormState {
  message: string;
  tags?: string[];
  error?: string;
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
    };
  }

  try {
    const input: SmartTaggingInput = { documentDescription };
    const output: SmartTaggingOutput = await suggestTags(input);
    
    if (output.tags && output.tags.length > 0) {
      return {
        message: 'Tags suggested successfully.',
        tags: output.tags,
      };
    } else {
      return {
        message: 'No tags suggested for this description.',
        tags: [],
      };
    }
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return {
      message: 'Failed to get tags.',
      error: `AI service error: ${errorMessage}`,
    };
  }
}
