"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Rewind, Volume2, VolumeX } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';

interface AvatarDisplayProps {
  script: string;
}

// Mock Avatar Component - Replace with actual avatar integration
const MockAvatar = React.forwardRef<HTMLDivElement, { isSpeaking: boolean }>(({ isSpeaking }, ref) => {
    const [mouthOpen, setMouthOpen] = useState(false);

    useEffect(() => {
        let intervalId: NodeJS.Timeout | null = null;
        if (isSpeaking) {
            intervalId = setInterval(() => {
                setMouthOpen(prev => !prev);
            }, 200); // Simulate mouth movement speed
        } else {
            setMouthOpen(false);
        }
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [isSpeaking]);

    return (
        <div ref={ref} className="relative w-full h-full flex items-center justify-center bg-secondary/50 rounded-md overflow-hidden">
            {/* Placeholder for Avatar Image/Model */}
             <Image
                src={`https://picsum.photos/seed/${encodeURIComponent('news anchor')}/400/600`}
                alt="News Anchor Avatar"
                width={400}
                height={600}
                className="object-contain h-full"
                priority // Load avatar image faster
                data-ai-hint="professional news anchor"
            />
            {/* Simple mouth simulation */}
            <div
                className={`absolute bottom-[30%] left-1/2 transform -translate-x-1/2 w-10 h-2 bg-destructive rounded transition-all duration-100 ${mouthOpen ? 'h-5' : 'h-2'}`}
                style={{ backgroundColor: 'var(--foreground)'}}
            ></div>
        </div>
    );
});
MockAvatar.displayName = "MockAvatar";


export default function AvatarDisplay({ script }: AvatarDisplayProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7); // Default volume 70%
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();

  // Simulate speech synthesis and playback
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.warn("Speech synthesis not supported in this browser.");
      return;
    }

    // Create a SpeechSynthesisUtterance
    const utterance = new SpeechSynthesisUtterance(script);
    utterance.volume = isMuted ? 0 : volume;
    utterance.rate = 1; // Normal speed
    utterance.pitch = 1; // Normal pitch

    // Use a workaround for progress tracking as direct audio access isn't standard
    let startTime = 0;
    let elapsedTime = 0;
    const scriptDurationEstimate = (script.split(' ').length / 180) * 60 * 1000; // Estimate duration (words / WPM * 60s * 1000ms)

    const updateProgress = () => {
      if (isPlaying && startTime) {
        elapsedTime = Date.now() - startTime;
        const currentProgress = Math.min((elapsedTime / scriptDurationEstimate) * 100, 100);
        setProgress(currentProgress);
        if (currentProgress < 100) {
          animationFrameRef.current = requestAnimationFrame(updateProgress);
        } else {
          setIsPlaying(false); // Stop when estimated duration is reached
          setProgress(100);
        }
      }
    };


    utterance.onstart = () => {
      setIsPlaying(true);
      startTime = Date.now();
      animationFrameRef.current = requestAnimationFrame(updateProgress);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setProgress(100);
      cancelAnimationFrame(animationFrameRef.current!);
    };

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event.error);
      setIsPlaying(false);
      setProgress(0);
       cancelAnimationFrame(animationFrameRef.current!);
    };

    // Store utterance reference indirectly for controls
    (audioRef as any).current = utterance; // Use ref to hold the utterance

     // Cleanup function
    return () => {
      window.speechSynthesis.cancel(); // Stop any ongoing speech
      cancelAnimationFrame(animationFrameRef.current!);
      setIsPlaying(false);
      setProgress(0);
    };

  }, [script, volume, isMuted]); // Re-run if script, volume, or mute status changes

  const handlePlayPause = () => {
    if (!window.speechSynthesis || !(audioRef as any).current) return;
    const synth = window.speechSynthesis;
    const utterance = (audioRef as any).current as SpeechSynthesisUtterance;

    if (synth.speaking) {
      if (isPlaying) {
        synth.pause();
        setIsPlaying(false);
        cancelAnimationFrame(animationFrameRef.current!);
      } else {
        synth.resume();
        setIsPlaying(true);
        // Recalculate start time based on current progress to resume correctly
        const scriptDurationEstimate = (script.split(' ').length / 180) * 60 * 1000;
        const elapsedEstimate = (progress / 100) * scriptDurationEstimate;
        const now = Date.now();
        const newStartTime = now - elapsedEstimate;
        // Update the 'startTime' used in updateProgress closure
        (utterance as any)._startTimeRefForProgress = newStartTime; // Store on utterance or use a ref
        animationFrameRef.current = requestAnimationFrame(() => updateProgressInternal(newStartTime)); // Need internal access or ref

      }
    } else {
       // Restart if not speaking or after error/cancel
       synth.cancel(); // Ensure clean state
       setProgress(0);
       utterance.volume = isMuted ? 0 : volume; // Re-apply volume
       synth.speak(utterance);
    }
  };

   // Helper for resuming progress update
   const updateProgressInternal = (newStartTime: number) => {
      if (!window.speechSynthesis || !(audioRef as any).current) return;
      const utterance = (audioRef as any).current as SpeechSynthesisUtterance;
      const scriptDurationEstimate = (script.split(' ').length / 180) * 60 * 1000;
      let elapsedTime = Date.now() - newStartTime;
      const currentProgress = Math.min((elapsedTime / scriptDurationEstimate) * 100, 100);
      setProgress(currentProgress);
      if (currentProgress < 100 && window.speechSynthesis.speaking && isPlaying) { // Check isPlaying again
        animationFrameRef.current = requestAnimationFrame(() => updateProgressInternal(newStartTime));
      } else if (currentProgress >= 100){
          setIsPlaying(false);
          setProgress(100);
      }
    };

  const handleRewind = () => {
     if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setProgress(0);
    setIsPlaying(false);
    cancelAnimationFrame(animationFrameRef.current!);
    // Optionally auto-play after rewind:
    // setTimeout(handlePlayPause, 100);
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if ((audioRef as any).current) {
      ((audioRef as any).current as SpeechSynthesisUtterance).volume = isMuted ? 0 : newVolume;
       // If speaking, we might need to pause and resume for volume change to take effect immediately in some browsers
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.pause();
             // Short delay before resuming
             setTimeout(() => {
                 if (window.speechSynthesis.paused) { // Check if it's still paused (user might interact)
                     window.speechSynthesis.resume();
                 }
             }, 50);
        }
    }
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    } else if (newVolume === 0 && !isMuted) {
      setIsMuted(true);
    }
  };

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    if ((audioRef as any).current) {
      ((audioRef as any).current as SpeechSynthesisUtterance).volume = newMutedState ? 0 : volume;
        // Similar pause/resume logic as handleVolumeChange might be needed
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.pause();
            setTimeout(() => {
                 if (window.speechSynthesis.paused) {
                     window.speechSynthesis.resume();
                 }
             }, 50);
        }
    }
     // If unmuting and volume was 0, set a default volume
     if (!newMutedState && volume === 0) {
        handleVolumeChange([0.7]); // Set to default 70%
     }
  };


  return (
    <Card className="overflow-hidden border-0 shadow-none">
      <CardContent className="p-0 aspect-video relative flex flex-col">
         {/* Avatar Area */}
         <div className="flex-grow relative bg-muted/30 rounded-t-lg">
            {/* Replace MockAvatar with your actual avatar component */}
            <MockAvatar ref={avatarRef} isSpeaking={isPlaying} />
         </div>

        {/* Progress Bar */}
        <div className="p-4 rounded-b-lg bg-background">
           <Progress value={progress} className="w-full h-2 mb-4" />
           {/* Controls */}
           <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={handleRewind} aria-label="Rewind">
                    <Rewind className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handlePlayPause} aria-label={isPlaying ? "Pause" : "Play"}>
                    {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                </Button>
             </div>

            <div className="flex items-center gap-2 w-full max-w-[150px]">
                <Button variant="ghost" size="icon" onClick={toggleMute} aria-label={isMuted ? "Unmute" : "Mute"}>
                    {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>
                <Slider
                    defaultValue={[volume]}
                    max={1}
                    step={0.05}
                    className="w-full cursor-pointer"
                    onValueChange={handleVolumeChange}
                    aria-label="Volume control"
                />
            </div>
           </div>
        </div>
      </CardContent>
       {/* Optional: Display script for reference */}
       {/* <CardFooter className="max-h-40 overflow-y-auto text-sm text-muted-foreground p-4 border-t">
            <p>{script}</p>
       </CardFooter> */}
    </Card>
  );
}
