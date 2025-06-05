
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import type {Plugin} from 'genkit';

const genkitPlugins: Plugin<any>[] = [];
export let isAiEnabled = false;
export const defaultModelName = 'googleai/gemini-2.0-flash'; // Consistent model name

if (
  process.env.GOOGLE_API_KEY &&
  process.env.GOOGLE_API_KEY !== 'YOUR_GOOGLE_API_KEY_HERE' &&
  process.env.GOOGLE_API_KEY.trim() !== ''
) {
  genkitPlugins.push(googleAI());
  isAiEnabled = true;
  console.log('Google AI plugin enabled with default model:', defaultModelName);
} else {
  console.warn(
    'GOOGLE_API_KEY is not set, is a placeholder, or is empty. Google AI features will be disabled.'
  );
}

export const ai = genkit({
  plugins: genkitPlugins,
  // Removed top-level model property as it's not valid here.
  // Models are specified in definePrompt or generate calls.
});
