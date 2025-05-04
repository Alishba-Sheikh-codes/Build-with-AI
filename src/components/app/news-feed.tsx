
"use client";

import type { NewsArticle } from '@/services/news';
import React, { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { generateVoiceScript } from '@/ai/flows/generate-voice-script';
import { useToast } from '@/hooks/use-toast';
import AvatarDisplay from './avatar-display';
import { Skeleton } from '@/components/ui/skeleton';

interface NewsFeedProps {
  initialNews: NewsArticle[];
}

export default function NewsFeed({ initialNews }: NewsFeedProps) {
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [generatedScript, setGeneratedScript] = useState<string | null>(null);
  const [isGenerating, startTransition] = useTransition();
  const { toast } = useToast();

  const handleSelectArticle = (article: NewsArticle) => {
    setSelectedArticle(article);
    setGeneratedScript(null); // Reset script when a new article is selected
  };

  const handleGenerateScript = () => {
    if (!selectedArticle) return;

    startTransition(async () => {
      try {
        const result = await generateVoiceScript({ articleContent: selectedArticle.content });
        setGeneratedScript(result.voiceScript);
        toast({
          title: "Script Generated",
          description: "The voice script is ready for the avatar.",
        });
      } catch (error) {
        console.error("Error generating voice script:", error);
        toast({
          title: "Error",
          description: "Failed to generate voice script. Please try again.",
          variant: "destructive",
        });
        setGeneratedScript(null);
      }
    });
  };

  // Define a consistent height for the content area cards
  // Subtract header height (h-16) and padding/margins (adjust as needed, e.g., p-4/p-6)
  const contentAreaHeight = 'calc(100vh - 4rem - 4rem)'; // Example: 100vh - header height - vertical padding

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Article List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Latest News</CardTitle>
          <CardDescription>Select an article to generate a script.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Adjust height using the calculated variable */}
          {/* Subtract CardHeader height estimate (e.g., 6rem) */}
          <ScrollArea className="pr-4" style={{ height: `calc(${contentAreaHeight} - 6rem)` }}>
            <div className="space-y-4">
              {initialNews.map((article, index) => (
                <Button
                  key={index}
                  variant={selectedArticle?.url === article.url ? "secondary" : "outline"}
                  className={`w-full justify-start text-left h-auto py-2 ${selectedArticle?.url === article.url ? 'border-accent' : ''}`}
                  onClick={() => handleSelectArticle(article)}
                >
                  {article.headline}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Article Content & Avatar Display */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>{selectedArticle ? selectedArticle.headline : "Select an Article"}</CardTitle>
          {selectedArticle && (
            <Button
              onClick={handleGenerateScript}
              disabled={isGenerating || !selectedArticle}
              className="mt-2 w-full sm:w-auto"
            >
              {isGenerating ? 'Generating Script...' : 'Generate Script & Present'}
            </Button>
          )}
        </CardHeader>
        {/* Adjust height using the calculated variable */}
         {/* Subtract CardHeader height estimate (e.g., 6rem for title + button) */}
        <CardContent className="flex flex-col p-4 md:p-6" style={{ height: `calc(${contentAreaHeight} - 6rem)` }}>
          {isGenerating && (
             <div className="space-y-4 p-0 flex flex-col flex-grow items-center justify-center"> {/* Center skeleton */}
               {/* Skeleton matching the fixed avatar size */}
               <Skeleton className="w-[300px] h-[300px] rounded-lg" />
               {/* Skeleton for the controls area - adjust width */}
               <div className="p-4 space-y-3 w-full max-w-[300px] mt-4 bg-background rounded-b-lg border-t">
                 <Skeleton className="h-2 w-full" /> {/* Progress bar */}
                 <div className="flex justify-between">
                   <div className="flex gap-2">
                     <Skeleton className="h-10 w-10 rounded-md" /> {/* Rewind */}
                     <Skeleton className="h-10 w-10 rounded-md" /> {/* Play/Pause */}
                   </div>
                   <div className="flex gap-2 items-center w-full max-w-[150px]">
                      <Skeleton className="h-10 w-10 rounded-md" /> {/* Mute */}
                      <Skeleton className="h-2 w-full rounded-full" /> {/* Volume slider */}
                   </div>
                 </div>
               </div>
            </div>
          )}
          {!isGenerating && generatedScript && selectedArticle && (
            // Avatar takes available space within the flex container
             <div className="flex-grow flex flex-col min-h-0">
                 <AvatarDisplay script={generatedScript} />
             </div>
          )}
          {!isGenerating && !generatedScript && selectedArticle && (
             // ScrollArea takes available space
            <ScrollArea className="flex-grow pr-4 border rounded-md p-4">
              <p className="text-muted-foreground whitespace-pre-line">{selectedArticle.content}</p>
            </ScrollArea>
          )}
          {!selectedArticle && !isGenerating && (
            // Placeholder takes available space
            <div className="flex flex-grow items-center justify-center text-muted-foreground border rounded-md">
              <p className="text-center p-4">Select an article from the list to view its content and generate a presentation.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

