'use server';

/**
 * @fileOverview Generates a natural-sounding voice script from the extracted article text.
 *
 * - generateVoiceScript - A function that generates a voice script from article content.
 * - GenerateVoiceScriptInput - The input type for the generateVoiceScript function.
 * - GenerateVoiceScriptOutput - The return type for the generateVoiceScript function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateVoiceScriptInputSchema = z.object({
  articleContent: z
    .string()
    .describe('The text content of the news article to convert to a voice script.'),
});
export type GenerateVoiceScriptInput = z.infer<typeof GenerateVoiceScriptInputSchema>;

const GenerateVoiceScriptOutputSchema = z.object({
  voiceScript: z
    .string()
    .describe('The generated voice script suitable for a digital avatar to read.'),
});
export type GenerateVoiceScriptOutput = z.infer<typeof GenerateVoiceScriptOutputSchema>;

export async function generateVoiceScript(
  input: GenerateVoiceScriptInput
): Promise<GenerateVoiceScriptOutput> {
  return generateVoiceScriptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateVoiceScriptPrompt',
  input: {
    schema: z.object({
      articleContent: z
        .string()
        .describe('The text content of the news article to convert to a voice script.'),
    }),
  },
  output: {
    schema: z.object({
      voiceScript: z
        .string()
        .describe('The generated voice script suitable for a digital avatar to read.'),
    }),
  },
  prompt: `You are a professional script writer specializing in creating natural-sounding voice scripts for news anchors.

  Please convert the following news article content into a voice script that is engaging and easy to understand.  The voice script should sound very natural when read aloud by a digital avatar.

  Article Content: {{{articleContent}}}`,
});

const generateVoiceScriptFlow = ai.defineFlow<
  typeof GenerateVoiceScriptInputSchema,
  typeof GenerateVoiceScriptOutputSchema
>({
  name: 'generateVoiceScriptFlow',
  inputSchema: GenerateVoiceScriptInputSchema,
  outputSchema: GenerateVoiceScriptOutputSchema,
},
async input => {
  const {output} = await prompt(input);
  return output!;
});
