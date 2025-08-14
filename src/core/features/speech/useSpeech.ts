'use client';

import { useCallback, useRef, useState } from 'react';

export type SpeechType = 'error' | 'greeting';

interface UseSpeechReturn {
  isLoading: boolean;
  error: string | null;
  isPlaying: boolean;

  speak: (type?: SpeechType) => Promise<void>;
  stop: () => void;

  play: () => void;
  pause: () => void;

  audioUrl: string | null;
}

// Define how many files exist for each speech type
const AUDIO_COUNTS: Record<SpeechType, number> = {
  error: 10,
  greeting: 12,
};

export function useSpeech(): UseSpeechReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Ref for audio management
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup function to stop audio
  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.onloadeddata = null;
      audioRef.current.onplay = null;
      audioRef.current.onpause = null;
      audioRef.current.onended = null;
      audioRef.current.onerror = null;

      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }

    setIsPlaying(false);
    setAudioUrl(null);
  }, []);

  // Main speak function
  const speak = useCallback(
    async (type: SpeechType = 'greeting') => {
      if (isPlaying) return;

      try {
        // Reset state
        setIsLoading(true);
        setError(null);
        cleanup(); // Stop any current audio

        // Get total audio files count
        const total = AUDIO_COUNTS[type];
        if (!total) {
          setError(`No audio files available for type "${type}"`);
          return;
        }

        // Get random audio file
        const randomIndex = Math.floor(Math.random() * total) + 1;
        const fileUrl = `/audio/${type}_${randomIndex}.mp3`;

        // Create audio element
        const audio = new Audio(fileUrl);

        // Store references
        audioRef.current = audio;
        setAudioUrl(fileUrl);

        // Set up event listeners
        audio.onloadeddata = () => setIsLoading(false);
        audio.onplay = () => setIsPlaying(true);
        audio.onpause = () => setIsPlaying(false);
        audio.onended = () => setIsPlaying(false);

        audio.onerror = () => {
          setError('Failed to load audio file');
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
    isLoading,
    error,
    isPlaying,
    speak,
    stop,
    play,
    pause,
    audioUrl,
  };
}
