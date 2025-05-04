

"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image'; // Keep for potential future use
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Rewind, Volume2, VolumeX } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';

interface AvatarDisplayProps {
  script: string;
}

interface StaticAvatarSvgProps {
    isSpeaking: boolean;
    mouthOpen: boolean;
}

// Static SVG Placeholder Avatar - Now accepts props for animation
const StaticAvatarSvg = ({ isSpeaking, mouthOpen }: StaticAvatarSvgProps) => {
    // Define mouth paths
    const closedMouthPath = "M 70 180 Q 100 210 130 180"; // Smiley curve
    const slightlyOpenMouthPath = "M 70 180 Q 100 195 130 180"; // Less curved
    const openMouthPath = "M 65 185 C 70 205, 130 205, 135 185 Z"; // Ovalish shape

    let mouthPath = closedMouthPath;
    let mouthFill = "none";
    let mouthStroke = "hsl(var(--foreground))";
    let mouthStrokeWidth = "4";


    if (isSpeaking) {
        if (mouthOpen) {
            mouthPath = openMouthPath;
            mouthFill = "hsl(var(--foreground))"; // Fill when open
            mouthStroke = "none";
        } else {
            mouthPath = slightlyOpenMouthPath; // Use slightly open or closed when speaking but "closed" phase
             mouthFill = "none";
             mouthStroke = "hsl(var(--foreground))";
        }
    }


    return (
        <svg
            viewBox="0 0 200 300"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full object-contain p-4 text-foreground" // Adjusted padding
            data-ai-hint="smiley face cartoon avatar illustration"
            aria-label="Smiley Face Avatar Placeholder"
        >
            {/* Head Outline - Round */}
            <circle cx="100" cy="150" r="90" fill="hsl(var(--muted))" stroke="hsl(var(--foreground))" strokeWidth="2"/>

            {/* Eyes - Simple Dots */}
            <circle cx="75" cy="130" r="10" fill="hsl(var(--foreground))" />
            <circle cx="125" cy="130" r="10" fill="hsl(var(--foreground))" />

             {/* Mouth - Animated */}
            <path d={mouthPath} stroke={mouthStroke} strokeWidth={mouthStrokeWidth} fill={mouthFill} strokeLinecap="round" />

        </svg>
    );
};


// Mock Avatar Component using the animated SVG
const MockAvatar = React.forwardRef<HTMLDivElement, { isSpeaking: boolean }>(({ isSpeaking }, ref) => {
    const [mouthOpen, setMouthOpen] = useState(false);

    useEffect(() => {
        let intervalId: NodeJS.Timeout | null = null;
        if (isSpeaking) {
            // Start mouth animation only if speaking
            intervalId = setInterval(() => {
                setMouthOpen(prev => !prev);
            }, 200); // Simulate mouth movement speed
        } else {
             // Ensure mouth is visually closed when not speaking
            setMouthOpen(false);
        }
        // Cleanup function to clear interval when component unmounts or isSpeaking changes
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [isSpeaking]); // Dependency array includes isSpeaking

    return (
        // Removed redundant background color, parent will handle it
        <div ref={ref} className="relative w-full h-full flex items-center justify-center rounded-md overflow-hidden">
             {/* Animated SVG Avatar */}
             <StaticAvatarSvg isSpeaking={isSpeaking} mouthOpen={mouthOpen} />
             {/* Removed the separate div mouth overlay */}
        </div>
    );
});
MockAvatar.displayName = "MockAvatar";


export default function AvatarDisplay({ script }: AvatarDisplayProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7); // Default volume 70%
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null); // Keep if planning audio element integration
  const avatarRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const startTimeRef = useRef<number>(0);
  const estimatedDurationRef = useRef<number>(0);


  // Use effect to setup or update the utterance when the script changes
   useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis || !script) {
      // console.warn("Speech synthesis not supported or script empty."); // Less console noise
      return;
    }

     // Cancel any ongoing speech before creating a new utterance
    window.speechSynthesis.cancel();
    if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
    }
    setIsPlaying(false);
    setProgress(0);
    startTimeRef.current = 0; // Reset start time

    const newUtterance = new SpeechSynthesisUtterance(script);
    newUtterance.volume = isMuted ? 0 : volume;
    newUtterance.rate = 1; // Adjust rate if needed
    newUtterance.pitch = 1; // Adjust pitch if needed

    // Estimate duration based on average speaking rate (words per minute)
    // Adjust WPM (e.g., 150-180) based on observed synthesis speed
    const wordsPerMinute = 160;
    estimatedDurationRef.current = (script.split(/\s+/).length / wordsPerMinute) * 60 * 1000; // Duration in milliseconds

    const updateProgress = () => {
        // Check if speech is active before updating progress
      if (window.speechSynthesis.speaking && isPlaying && startTimeRef.current > 0 && estimatedDurationRef.current > 0) {
        const elapsedTime = Date.now() - startTimeRef.current;
        const currentProgress = Math.min((elapsedTime / estimatedDurationRef.current) * 100, 100);
        setProgress(currentProgress);
        // Continue animation frame loop only if progress < 100
        if (currentProgress < 100) {
          animationFrameRef.current = requestAnimationFrame(updateProgress);
        } else {
           // Ensure cleanup when progress reaches 100 naturally
          setIsPlaying(false);
          setProgress(100);
          startTimeRef.current = 0;
        }
      } else {
           // If no longer speaking but loop is running, cancel it
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
          }
      }
    };

    newUtterance.onstart = () => {
        startTimeRef.current = Date.now();
        setIsPlaying(true);
        setProgress(0); // Reset progress on new start
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current); // Clear any previous frame
        }
        animationFrameRef.current = requestAnimationFrame(updateProgress); // Start progress updates
    };

    newUtterance.onresume = () => {
        // Recalculate start time based on current progress to resume timing correctly
        const elapsedEstimate = (progress / 100) * estimatedDurationRef.current;
        startTimeRef.current = Date.now() - elapsedEstimate;
        setIsPlaying(true); // Ensure state is playing
         if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current); // Clear any lingering frame
         }
        animationFrameRef.current = requestAnimationFrame(updateProgress); // Restart progress updates
    };

    newUtterance.onpause = () => {
      setIsPlaying(false); // Update state
       if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current); // Stop progress updates
       }
    };

    newUtterance.onend = () => {
      setIsPlaying(false);
      setProgress(100); // Ensure progress shows 100%
      startTimeRef.current = 0; // Reset start time
       if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current); // Stop progress updates
       }
    };

    newUtterance.onerror = (event) => {
      console.error("Speech synthesis error:", event.error);
      setIsPlaying(false);
      setProgress(0); // Reset progress on error
      startTimeRef.current = 0;
       if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current); // Stop progress updates
       }
    };

    utteranceRef.current = newUtterance;

    // Cleanup function for when the component unmounts or script changes
    return () => {
      if(typeof window !== 'undefined' && window.speechSynthesis) {
         window.speechSynthesis.cancel(); // Stop any speech synthesis
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current); // Clean up animation frame
      }
      utteranceRef.current = null; // Clear ref on cleanup or script change
      setIsPlaying(false);
      setProgress(0);
      startTimeRef.current = 0;
    };

  }, [script]); // Re-run effect only when the script changes

   // Effect to update utterance volume when volume or isMuted state changes
    useEffect(() => {
        if (utteranceRef.current) {
            utteranceRef.current.volume = isMuted ? 0 : volume;
        }
        // Note: This doesn't need to pause/resume speech. Volume changes apply dynamically if supported.
    }, [volume, isMuted]);


  const handlePlayPause = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis || !utteranceRef.current) return;
    const synth = window.speechSynthesis;

    if (synth.speaking) {
      if (isPlaying) { // Was playing, now pause
        synth.pause();
        // isPlaying state is set by onpause handler
      } else { // Was paused (but synth.speaking is true), now resume
        synth.resume();
         // isPlaying state is set by onresume handler
      }
    } else if (progress < 100 && utteranceRef.current) { // Not speaking, start from beginning
        synth.cancel(); // Ensure clean state if previously ended, errored, or cancelled
        // Apply current volume/mute setting before speaking
        utteranceRef.current.volume = isMuted ? 0 : volume;
        setProgress(0); // Reset progress visually for a fresh start
        synth.speak(utteranceRef.current);
         // isPlaying state is set by onstart handler
    } else if (progress >= 100) { // If progress is 100 or more, treat as rewind and play
        handleRewind(true); // Rewind and auto-play
    }
  };


  const handleRewind = (autoPlay = false) => {
     if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // Stop current speech immediately

    // Reset state
    setProgress(0);
    setIsPlaying(false);
    startTimeRef.current = 0;
     if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current); // Stop progress updates
     }


    if (autoPlay && utteranceRef.current) {
      // Use a small delay to ensure cancel completes before speak, especially on some browsers
      setTimeout(() => {
         if (utteranceRef.current) {
            // Re-apply current volume/mute setting before speaking
            utteranceRef.current.volume = isMuted ? 0 : volume;
            window.speechSynthesis.speak(utteranceRef.current);
             // isPlaying state will be set by the utterance's onstart handler
         }
      }, 50); // 50ms delay might be adjusted
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    // Automatically unmute if volume is turned up from 0, or mute if set to 0
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    } else if (newVolume === 0 && !isMuted) {
      setIsMuted(true);
    }
    // The useEffect for [volume, isMuted] will handle updating the utterance
  };

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
     // If unmuting and volume was previously 0, set a default volume (e.g., 0.7)
     // This prevents staying silent if unmuted when volume slider is at 0.
     if (!newMutedState && volume === 0) {
        setVolume(0.7); // Adjust volume state, the effect will update the utterance
     }
      // The useEffect for [volume, isMuted] will handle updating the utterance
  };


  return (
    // Use flex column layout to make avatar take up space and controls stay at bottom
    <Card className="overflow-hidden border-0 shadow-none flex flex-col h-full">
      <CardContent className="p-0 flex flex-col flex-grow min-h-0"> {/* flex-grow allows content to fill space */}
         {/* Avatar Area - Takes remaining space */}
         <div className="flex-grow relative bg-muted/30 rounded-t-lg min-h-0"> {/* min-h-0 is important for flex children */}
            {/* MockAvatar showing animated SVG */}
            <MockAvatar ref={avatarRef} isSpeaking={isPlaying} />
         </div>

        {/* Progress Bar & Controls Wrapper - Fixed at the bottom */}
        <div className="p-4 rounded-b-lg bg-background border-t"> {/* Added border-t */}
           {/* Progress Bar */}
           <Progress value={progress} className="w-full h-2 mb-4" aria-label="Playback progress"/>

           {/* Controls */}
           <div className="flex items-center justify-between gap-4">
            {/* Playback Controls */}
            <div className="flex items-center gap-1 sm:gap-2"> {/* Reduced gap on small screens */}
                <Button variant="ghost" size="icon" onClick={() => handleRewind()} aria-label="Rewind" className="text-foreground/80 hover:text-foreground">
                    <Rewind className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handlePlayPause} aria-label={isPlaying ? "Pause" : "Play"} className="text-foreground/90 hover:text-foreground">
                    {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                </Button>
             </div>

            {/* Volume Controls */}
            <div className="flex items-center gap-2 w-full max-w-[120px] sm:max-w-[150px]"> {/* Adjusted max width */}
                <Button variant="ghost" size="icon" onClick={toggleMute} aria-label={isMuted ? "Unmute" : "Mute"} className="text-foreground/80 hover:text-foreground">
                    {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>
                <Slider
                    value={[volume]} // Ensure value is always an array
                    max={1}
                    step={0.05}
                    className="w-full cursor-pointer"
                    onValueChange={handleVolumeChange} // Use the handler
                    aria-label="Volume control"
                />
            </div>
           </div>
        </div>
      </CardContent>
       {/* Optional: Display script for reference - can be useful for debugging */}
       {/* <CardFooter className="max-h-40 overflow-y-auto text-sm text-muted-foreground p-4 border-t bg-muted/20">
            <h3 className="font-semibold mb-2">Generated Script:</h3>
            <p className="whitespace-pre-line text-xs">{script || "No script generated yet."}</p>
       </CardFooter> */}
    </Card>
  );
}
