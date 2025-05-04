'use server';

/**
 * @fileOverview Summarizes news articles into concise scripts for the avatar.
 *
 * - summarizeArticle - A function that summarizes a news article.
 * - SummarizeArticleInput - The input type for the summarizeArticle function.
 * - SummarizeArticleOutput - The return type for the summarizeArticle function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SummarizeArticleInputSchema = z.object({
  articleContent: z.string().describe('The content of the news article to summarize.'),
});
export type SummarizeArticleInput = z.infer<typeof SummarizeArticleInputSchema>;

const SummarizeArticleOutputSchema = z.object({
  script: z.string().describe('The summarized script for the avatar to deliver.'),
});
export type SummarizeArticleOutput = z.infer<typeof SummarizeArticleOutputSchema>;

export async function summarizeArticle(input: SummarizeArticleInput): Promise<SummarizeArticleOutput> {
  return summarizeArticleFlow(input);
}

const summarizeArticlePrompt = ai.definePrompt({
  name: 'summarizeArticlePrompt',
  input: {
    schema: z.object({
      articleContent: z.string().describe('The content of the news article to summarize.'),
    }),
  },
  output: {
    schema: z.object({
      script: z.string().describe('The summarized script for the avatar to deliver.'),
    }),
  },
  prompt: `Summarize the following news article into a concise script for a news avatar to deliver. The script should be natural-sounding and suitable for a broadcast setting.\n\nArticle Content:\n{{{articleContent}}}`,
});

const summarizeArticleFlow = ai.defineFlow<
  typeof SummarizeArticleInputSchema,
  typeof SummarizeArticleOutputSchema
>(
  {
    name: 'summarizeArticleFlow',
    inputSchema: SummarizeArticleInputSchema,
    outputSchema: SummarizeArticleOutputSchema,
  },
  async input => {
    const {output} = await summarizeArticlePrompt(input);
    return output!;
  }
);
