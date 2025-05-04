
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

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Article List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Latest News</CardTitle>
          <CardDescription>Select an article to generate a script.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[60vh] pr-4">
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
        <CardContent>
          {isGenerating && (
            <div className="space-y-4 p-0">
               {/* Skeleton for the avatar display area */}
               <Skeleton className="aspect-video w-full rounded-t-lg" />
               {/* Skeleton for the controls area */}
               <div className="p-4 space-y-3">
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
            <AvatarDisplay script={generatedScript} />
          )}
          {!isGenerating && !generatedScript && selectedArticle && (
            <ScrollArea className="h-[60vh] pr-4">
              <p className="text-muted-foreground whitespace-pre-line">{selectedArticle.content}</p>
            </ScrollArea>
          )}
          {!selectedArticle && !isGenerating && (
            <div className="flex h-[60vh] items-center justify-center text-muted-foreground">
              <p>Select an article from the list to view its content and generate a presentation.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    