'use client';

import { useState, useCallback, useRef } from 'react';

import { convertTextToSpeech } from '@/core/features/text-to-speech/actions';

interface TTSOptions {
  rate?: number; // 0.25-4.0, default: 1.0
  pitch?: number; // -20.0-20.0, default: 0.0
  volumeGain?: number; // -96.0-16.0, default: 0.0
}

interface UseTTSReturn {
  // State
  isLoading: boolean;
  error: string | null;
  isPlaying: boolean;

  // Actions
  speak: (text: string, options?: TTSOptions) => Promise<void>;
  stop: () => void;

  // Audio controls (optional manual control)
  play: () => void;
  pause: () => void;

  // Current audio URL (for debugging or custom usage)
  audioUrl: string | null;
}

export function useGoogleTTS(): UseTTSReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Refs for audio management
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentObjectUrlRef = useRef<string | null>(null);

  // Cleanup function to revoke object URLs and stop audio
  const cleanup = useCallback(() => {
    if (audioRef.current) {
      // Remove event listeners before cleanup to prevent error events
      audioRef.current.onloadeddata = null;
      audioRef.current.onplay = null;
      audioRef.current.onpause = null;
      audioRef.current.onended = null;
      audioRef.current.onerror = null;

      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }

    if (currentObjectUrlRef.current) {
      URL.revokeObjectURL(currentObjectUrlRef.current);
      currentObjectUrlRef.current = null;
    }

    setAudioUrl(null);
    setIsPlaying(false);
  }, []);

  // Main speak function
  const speak = useCallback(
    async (text: string, options?: TTSOptions) => {
      if (isPlaying) return;

      try {
        // Reset state
        setIsLoading(true);
        setError(null);
        cleanup(); // Stop any current audio

        // Call server action
        const result = await convertTextToSpeech(text, options);

        if (!result.success || !result.data) {
          throw new Error(result.error || 'Failed to generate speech');
        }

        // Convert base64 string to blob
        const binaryString = atob(result.data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const audioBlob = new Blob([bytes], { type: 'audio/mpeg' });
        const objectUrl = URL.createObjectURL(audioBlob);

        // Create audio element
        const audio = new Audio(objectUrl);

        // Store references
        audioRef.current = audio;
        currentObjectUrlRef.current = objectUrl;
        setAudioUrl(objectUrl);

        // Set up event listeners
        audio.onloadeddata = () => setIsLoading(false);
        audio.onplay = () => setIsPlaying(true);
        audio.onpause = () => setIsPlaying(false);
        audio.onended = () => setIsPlaying(false);

        audio.onerror = () => {
          if (audio.error) {
            console.log('Audio error details:', {
              code: audio.error.code,
              message: audio.error.message,
            });
          }

          setError('Failed to play audio');
          setIsLoading(false);
          setIsPlaying(false);
        };

        await audio.play();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setIsLoading(false);
        cleanup();
      }
    },
    [cleanup, isPlaying]
  );

  // Manual audio controls
  const play = useCallback(() => {
    if (audioRef.current && !isPlaying) {
      audioRef.current.play().catch((err) => {
        setError('Failed to play audio: ' + err.message);
      });
    }
  }, [isPlaying]);

  const pause = useCallback(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  const stop = useCallback(() => {
    cleanup();
  }, [cleanup]);

  return {
    // State
    isLoading,
    error,
    isPlaying,

    // Actions
    speak,
    stop,

    // Manual controls
    play,
    pause,

    // Audio URL
    audioUrl,
  };
}
