'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { HeartIcon } from '@/core/components/icons/HeartIcon';
import { MAX_HEAT_LEVEL } from '@/core/features/chat/constants';
import { cn } from '@/core/utils';

interface HeatHeartProps {
  heatLevel: number;
}

const HEART_BEATING_ANIM_DELAY = 1000;
const HEAT_LEVEL_DETECT_DELAY = 2000; // Enable diff detection after the component stabilizes
const LEVEL_DIFF_HIDE_TIMEOUT = 5000; // How long diff number will be visible

const HeatHeart = ({ heatLevel }: HeatHeartProps) => {
  const [isHeartBeating, setHeartBeating] = useState(false);
  const [diffDisplay, setDiffDisplay] = useState<{
    value: number;
    isVisible: boolean;
  }>({ value: 0, isVisible: false });

  const isDetectLevelChanges = useRef(false);
  const prevHeatLevelRef = useRef<number>(heatLevel);
  const diffTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate fill percentage (0-100%)
  const fillPercentage = useMemo(() => {
    return Math.max(0, Math.min(100, (heatLevel / MAX_HEAT_LEVEL) * 100));
  }, [heatLevel]);

  // Enable level change detection after initialization delay
  useEffect(() => {
    const initTimer = setTimeout(() => {
      isDetectLevelChanges.current = true;
    }, HEAT_LEVEL_DETECT_DELAY);

    return () => clearTimeout(initTimer);
  }, []);

  // Handle heat level changes and diff display
  useEffect(() => {
    // Skip diff display if detection is disabled
    if (!isDetectLevelChanges.current) {
      prevHeatLevelRef.current = heatLevel;
      return;
    }

    const prevHeatLevel = prevHeatLevelRef.current;
    const diff = heatLevel - prevHeatLevel;

    // Only show diff if there's an actual change
    if (diff !== 0) {
      // Clear existing timeouts
      if (diffTimeoutRef.current) {
        clearTimeout(diffTimeoutRef.current);
        diffTimeoutRef.current = null;
      }
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }

      // Show the diff immediately
      setDiffDisplay({ value: diff, isVisible: true });

      // Hide the diff
      hideTimeoutRef.current = setTimeout(() => {
        setDiffDisplay((prev) => ({ ...prev, isVisible: false }));
        hideTimeoutRef.current = null;
      }, LEVEL_DIFF_HIDE_TIMEOUT);
    }

    prevHeatLevelRef.current = heatLevel;

    // Cleanup function with captured timeout values
    return () => {
      const currentDiffTimeout = diffTimeoutRef.current;
      const currentHideTimeout = hideTimeoutRef.current;

      if (currentDiffTimeout) {
        clearTimeout(currentDiffTimeout);
        diffTimeoutRef.current = null;
      }
      if (currentHideTimeout) {
        clearTimeout(currentHideTimeout);
        hideTimeoutRef.current = null;
      }
    };
  }, [heatLevel]);

  // Handle heart beating animation
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (heatLevel > MAX_HEAT_LEVEL) {
      timeout = setTimeout(() => {
        setHeartBeating(true);
      }, HEART_BEATING_ANIM_DELAY);
    }
    if (isHeartBeating && heatLevel <= MAX_HEAT_LEVEL) {
      setHeartBeating(false);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [heatLevel, isHeartBeating]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      const currentDiffTimeout = diffTimeoutRef.current;
      const currentHideTimeout = hideTimeoutRef.current;

      if (currentDiffTimeout) {
        clearTimeout(currentDiffTimeout);
      }
      if (currentHideTimeout) {
        clearTimeout(currentHideTimeout);
      }
    };
  }, []);

  const formatDiff = (diff: number): string => {
    return diff > 0 ? `+${diff}` : diff.toString();
  };

  return (
    <div className="mr-1.5 relative h-5.5 w-6 flex-center select-none">
      {/* Heat level difference indicator */}
      <div
        className={cn(
          'absolute right-1 top-1/2 -translate-y-1/2 text-right text-accent font-extrabold leading-none transition-all duration-500 ease-in-out',
          diffDisplay.isVisible && diffDisplay.value > 0
            ? 'opacity-100 -translate-x-7'
            : 'opacity-0 translate-x-0 scale-25'
        )}
      >
        {formatDiff(diffDisplay.value)}
      </div>

      {/* Current heat level display */}
      {heatLevel > 0 ? (
        <div className="relative z-40 text-[11px] text-white font-bold leading-none tracking-tight -translate-x-0.25 cursor-default">
          {heatLevel}
        </div>
      ) : null}

      {/* Background heart */}
      <div className="absolute z-10 inset-0 text-muted/25 dark:text-muted/40">
        <HeartIcon />
      </div>

      {/* Filled heart */}
      <div
        className="absolute z-20 inset-0 text-accent transition-all ease-in-out duration-1000"
        style={{
          clipPath: `inset(${100 - fillPercentage}% 0 0 0)`,
        }}
      >
        <HeartIcon />
      </div>

      {/* Beating heart animation */}
      {isHeartBeating ? (
        <div
          className="absolute z-30 inset-0 text-accent animate-ping"
          style={{
            clipPath: `inset(${100 - fillPercentage}% 0 0 0)`,
          }}
        >
          <HeartIcon />
        </div>
      ) : null}
    </div>
  );
};

export default HeatHeart;
