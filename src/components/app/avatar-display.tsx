
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
                src={`https://picsum.photos/seed/${encodeURIComponent('cartoon avatar human')}/400/600`}
                alt="Cartoon Avatar"
                width={400}
                height={600}
                className="object-contain h-full"
                priority // Load avatar image faster
                data-ai-hint="cartoon avatar human features" // Updated hint
            />
            {/* Simple mouth simulation */}
            <div
                className={`absolute bottom-[30%] left-1/2 transform -translate-x-1/2 w-8 h-1 bg-destructive rounded transition-all duration-100 ${mouthOpen ? 'h-3' : 'h-1'}`} // Adjusted mouth size slightly
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
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const startTimeRef = useRef<number>(0);
  const estimatedDurationRef = useRef<number>(0);


  // Use effect to setup or update the utterance when the script changes
   useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis || !script) {
      console.warn("Speech synthesis not supported or script empty.");
      return;
    }

     // Cancel any ongoing speech before creating a new utterance
    window.speechSynthesis.cancel();
    cancelAnimationFrame(animationFrameRef.current!);
    setIsPlaying(false);
    setProgress(0);

    const newUtterance = new SpeechSynthesisUtterance(script);
    newUtterance.volume = isMuted ? 0 : volume;
    newUtterance.rate = 1;
    newUtterance.pitch = 1;

    estimatedDurationRef.current = (script.split(' ').length / 180) * 60 * 1000; // Estimate duration

    const updateProgress = () => {
      if (isPlaying && startTimeRef.current > 0 && estimatedDurationRef.current > 0) {
        const elapsedTime = Date.now() - startTimeRef.current;
        const currentProgress = Math.min((elapsedTime / estimatedDurationRef.current) * 100, 100);
        setProgress(currentProgress);
        if (currentProgress < 100) {
          animationFrameRef.current = requestAnimationFrame(updateProgress);
        } else {
          setIsPlaying(false);
          setProgress(100);
        }
      } else {
         cancelAnimationFrame(animationFrameRef.current!);
      }
    };

    newUtterance.onstart = () => {
        startTimeRef.current = Date.now();
        setIsPlaying(true);
        setProgress(0); // Reset progress on new start
        cancelAnimationFrame(animationFrameRef.current!); // Clear any previous frame
        animationFrameRef.current = requestAnimationFrame(updateProgress);
    };

    newUtterance.onresume = () => {
        // Recalculate start time based on current progress to resume timing correctly
        const elapsedEstimate = (progress / 100) * estimatedDurationRef.current;
        startTimeRef.current = Date.now() - elapsedEstimate;
        setIsPlaying(true);
         cancelAnimationFrame(animationFrameRef.current!);
        animationFrameRef.current = requestAnimationFrame(updateProgress);
    };

    newUtterance.onpause = () => {
      setIsPlaying(false);
      cancelAnimationFrame(animationFrameRef.current!);
    };

    newUtterance.onend = () => {
      setIsPlaying(false);
      setProgress(100);
      startTimeRef.current = 0;
      cancelAnimationFrame(animationFrameRef.current!);
    };

    newUtterance.onerror = (event) => {
      console.error("Speech synthesis error:", event.error);
      setIsPlaying(false);
      setProgress(0);
      startTimeRef.current = 0;
      cancelAnimationFrame(animationFrameRef.current!);
    };

    utteranceRef.current = newUtterance;

    // Cleanup function
    return () => {
      window.speechSynthesis.cancel();
      cancelAnimationFrame(animationFrameRef.current!);
      utteranceRef.current = null; // Clear ref on cleanup or script change
      setIsPlaying(false);
      setProgress(0);
      startTimeRef.current = 0;
    };

  }, [script]); // Only re-run when script changes

   // Update volume/mute effect
    useEffect(() => {
        if (utteranceRef.current) {
            utteranceRef.current.volume = isMuted ? 0 : volume;
        }
        // Note: No need to pause/resume here usually, volume changes should apply if supported
    }, [volume, isMuted]);


  const handlePlayPause = () => {
    if (!window.speechSynthesis || !utteranceRef.current) return;
    const synth = window.speechSynthesis;

    if (synth.speaking) {
      if (isPlaying) { // Was playing, now pause
        synth.pause();
      } else { // Was paused, now resume
        synth.resume();
      }
    } else if (progress < 100) { // Not speaking, start from beginning or resume if paused near end
        // Restart if not speaking or after error/cancel/end
        synth.cancel(); // Ensure clean state if previously ended or errored
        setProgress(0); // Reset progress for a fresh start
        utteranceRef.current.volume = isMuted ? 0 : volume; // Re-apply volume
        synth.speak(utteranceRef.current);
    } else {
        // If progress is 100, effectively rewind and play
        handleRewind(true); // Rewind and auto-play
    }
  };


  const handleRewind = (autoPlay = false) => {
     if (!window.speechSynthesis || !utteranceRef.current) return;
    window.speechSynthesis.cancel(); // Stop current speech
    setProgress(0);
    setIsPlaying(false);
    startTimeRef.current = 0;
    cancelAnimationFrame(animationFrameRef.current!);

    if (autoPlay) {
      // Use a small delay to ensure cancel completes before speak
      setTimeout(() => {
         if (utteranceRef.current) {
            utteranceRef.current.volume = isMuted ? 0 : volume; // Re-apply volume
            window.speechSynthesis.speak(utteranceRef.current);
         }
      }, 50);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    } else if (newVolume === 0 && !isMuted) {
      setIsMuted(true);
    }
  };

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
     // If unmuting and volume was 0, set a default volume
     if (!newMutedState && volume === 0) {
        setVolume(0.7); // Set volume state directly, effect will handle utterance
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

        {/* Progress Bar & Controls Wrapper */}
        <div className="p-4 rounded-b-lg bg-background">
           {/* Progress Bar */}
           <Progress value={progress} className="w-full h-2 mb-4" aria-label="Playback progress"/>

           {/* Controls */}
           <div className="flex items-center justify-between gap-4">
            {/* Playback Controls */}
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleRewind()} aria-label="Rewind">
                    <Rewind className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handlePlayPause} aria-label={isPlaying ? "Pause" : "Play"}>
                    {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                </Button>
             </div>

            {/* Volume Controls */}
            <div className="flex items-center gap-2 w-full max-w-[150px]">
                <Button variant="ghost" size="icon" onClick={toggleMute} aria-label={isMuted ? "Unmute" : "Mute"}>
                    {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>
                <Slider
                    value={[volume]} // Controlled component
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
       {/* Optional: Display script for reference - uncomment if needed */}
       {/* <CardFooter className="max-h-40 overflow-y-auto text-sm text-muted-foreground p-4 border-t">
            <p className="whitespace-pre-line">{script}</p>
       </CardFooter> */}
    </Card>
  );
}
