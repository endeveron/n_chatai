'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type TimelineStep = {
  fn: () => void | Promise<void>;
  delay: number;
  condition?: () => boolean;
};

export type TimelineOptions = {
  autoStart?: boolean;
  loop?: boolean;
  onComplete?: () => void;
  onError?: (error: Error) => void;
  startByCondition?: () => boolean;
};

export type TimelineStatus =
  | 'idle'
  | 'running'
  | 'paused'
  | 'completed'
  | 'error';

export const useTimeline = (
  steps: TimelineStep[],
  options: TimelineOptions = {}
) => {
  const {
    autoStart = true,
    loop = false,
    onComplete,
    onError,
    startByCondition,
  } = options;

  const [status, setStatus] = useState<TimelineStatus>('idle');
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const timeoutRef = useRef<NodeJS.Timeout[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isPausedRef = useRef(false);

  // Cleanup function
  const cleanup = useCallback(() => {
    timeoutRef.current.forEach(clearTimeout);
    timeoutRef.current = [];
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Cancellable delay
  const delay = useCallback((ms: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (abortControllerRef.current?.signal.aborted) {
        reject(new Error('Timeline cancelled'));
        return;
      }

      const timeoutId = setTimeout(() => {
        if (
          !isPausedRef.current &&
          !abortControllerRef.current?.signal.aborted
        ) {
          resolve();
        }
      }, ms);

      timeoutRef.current.push(timeoutId);

      abortControllerRef.current?.signal.addEventListener('abort', () => {
        clearTimeout(timeoutId);
        reject(new Error('Timeline cancelled'));
      });
    });
  }, []);

  // Execute timeline
  const executeTimeline = useCallback(async () => {
    if (steps.length === 0) return;

    try {
      setStatus('running');
      abortControllerRef.current = new AbortController();

      do {
        for (let i = 0; i < steps.length; i++) {
          if (abortControllerRef.current?.signal.aborted) return;
          if (isPausedRef.current) {
            // Wait for resume
            while (
              isPausedRef.current &&
              !abortControllerRef.current?.signal.aborted
            ) {
              await delay(100);
            }
          }

          setCurrentStep(i);
          const step = steps[i];

          // Check condition before executing
          if (step.condition && !step.condition()) {
            // // Skip this step, but still apply delay if specified
            // if (step.delay > 0) {
            //   await delay(step.delay);
            // }
            continue;
          }

          // Wait for the delay before executing the function
          if (step.delay > 0) {
            await delay(step.delay);
          }

          // Execute the function
          await Promise.resolve(step.fn());
        }
      } while (loop && !abortControllerRef.current?.signal.aborted);

      setStatus('completed');
      setCurrentStep(-1);
      onComplete?.();
    } catch (error) {
      if (error instanceof Error && error.message !== 'Timeline cancelled') {
        setStatus('error');
        onError?.(error);
      }
    }
  }, [steps, loop, delay, onComplete, onError]);

  // Control functions
  const start = useCallback(() => {
    if (status === 'running') return;

    // Check startByCondition if provided
    if (startByCondition && !startByCondition()) {
      return; // Don't start if condition is not met
    }

    isPausedRef.current = false;
    executeTimeline();
  }, [status, executeTimeline, startByCondition]);

  const pause = useCallback(() => {
    if (status !== 'running') return;
    isPausedRef.current = true;
    setStatus('paused');
  }, [status]);

  const resume = useCallback(() => {
    if (status !== 'paused') return;
    isPausedRef.current = false;
    setStatus('running');
  }, [status]);

  const stop = useCallback(() => {
    cleanup();
    setStatus('idle');
    setCurrentStep(-1);
    isPausedRef.current = false;
  }, [cleanup]);

  const reset = useCallback(() => {
    stop();
    if (autoStart) {
      // Small delay to ensure state is reset
      setTimeout(() => start(), 0);
    }
  }, [stop, start, autoStart]);

  // Auto-start effect
  useEffect(() => {
    if (autoStart && status === 'idle') {
      // If startByCondition is provided, check it before starting
      if (startByCondition) {
        if (startByCondition()) {
          start();
        }
      } else {
        start();
      }
    }
  }, [autoStart, status, start, startByCondition]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    status,
    currentStep,
    start,
    pause,
    resume,
    stop,
    reset,
    isRunning: status === 'running',
    isPaused: status === 'paused',
    isCompleted: status === 'completed',
    hasError: status === 'error',
  };
};
