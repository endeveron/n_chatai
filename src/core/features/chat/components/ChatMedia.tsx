'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { CloseIcon } from '@/core/components/icons/CloseIcon';
import { HeartIcon } from '@/core/components/icons/HeartIcon';
import { Button } from '@/core/components/ui/Button';
import {
  CHAT_MEDIA_MIN_KEY,
  MAX_HEAT_LEVEL,
} from '@/core/features/chat/constants';
import { AvatarKey } from '@/core/features/chat/types/person';
import { useLocalStorage } from '@/core/hooks/useLocalStorage';
import { cn } from '@/core/utils';

const SIDE_IMAGE_FADEIN_DELAY = 100;

interface TransitionState {
  phase: 'idle' | 'fadeOut' | 'fadeIn';
  previousSources: string[];
  newSources: string[];
  sideImagePhases: {
    left: 'waiting' | 'fadeIn' | 'visible';
    right: 'waiting' | 'fadeIn' | 'visible';
  };
}

interface ChatMediaProps {
  heatLevel: number;
  avatarKey: AvatarKey;
}

const ChatMedia = ({ heatLevel, avatarKey }: ChatMediaProps) => {
  const [getItemFromLS, setItemInLS, removeItemFromLS] = useLocalStorage();

  const [active, setActive] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [imageSrcArr, setImageSrcArr] = useState<string[]>([]);
  const [transitionState, setTransitionState] = useState<TransitionState>({
    phase: 'idle',
    previousSources: [],
    newSources: [],
    sideImagePhases: {
      left: 'visible',
      right: 'visible',
    },
  });

  const toggleExpanded = () => {
    setExpanded((prev) => !prev);
  };

  const toggleMinimized = () => {
    const newValue = !minimized;
    setMinimized(newValue);
    setItemInLS(`${CHAT_MEDIA_MIN_KEY}_${avatarKey}`, newValue);
  };

  useEffect(() => {
    const minStateFromLS = getItemFromLS<boolean>(
      `${CHAT_MEDIA_MIN_KEY}_${avatarKey}`
    );
    if (minStateFromLS != null) {
      setMinimized(minStateFromLS);
    }
  }, [avatarKey, getItemFromLS]);

  const createImgSrc = useCallback(
    (imgIndex: number) => {
      return `/images/people/${avatarKey}/heat/${imgIndex}.jpg`;
    },
    [avatarKey]
  );

  useEffect(() => {
    if (heatLevel <= MAX_HEAT_LEVEL) {
      setImageSrcArr([]);
      return;
    }

    const heatDiff = Math.max(heatLevel - MAX_HEAT_LEVEL, 1);

    // Map heatDiff to the highest image index needed
    const getImageIndexes = (diff: number): number[] => {
      if (diff <= 3) return [1];
      if (diff <= 6) return [2, 1];
      if (diff <= 9) return [3, 2, 1];
      if (diff <= 12) return [4, 3, 2];
      if (diff <= 15) return [5, 4, 3];
      if (diff <= 18) return [6, 5, 4];
      if (diff <= 21) return [7, 6, 5];
      if (diff <= 24) return [8, 7, 6];
      if (diff <= 27) return [9, 8, 7];
      return [10, 9, 8];
    };

    const indexes = getImageIndexes(heatDiff);
    setImageSrcArr(indexes.map(createImgSrc));
  }, [createImgSrc, heatLevel]);

  const imageSrcArrLength = useMemo(() => {
    return imageSrcArr.length;
  }, [imageSrcArr.length]);

  useEffect(() => {
    if (heatLevel <= MAX_HEAT_LEVEL) return;

    const timeout = setTimeout(() => {
      setActive(true);
    }, 2000);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [heatLevel]);

  // Helper function to get the current image source for display
  const getCurrentImageSrc = (index: number): string | null => {
    switch (transitionState.phase) {
      case 'fadeOut':
        // During fade out, show previous sources
        return transitionState.previousSources[index] || null;
      case 'fadeIn':
        // During fade in, show new sources
        return transitionState.newSources[index] || null;
      case 'idle':
      default:
        // In idle state, show current sources (use newSources as they're up to date)
        return transitionState.newSources[index] || imageSrcArr[index] || null;
    }
  };

  // Helper function to get opacity based on transition phase
  const getImageOpacity = (index: number): number => {
    const currentSrc = getCurrentImageSrc(index);

    if (!currentSrc) return 0;

    // Main image (index 0) - no delay, standard transition
    if (index === 0) {
      switch (transitionState.phase) {
        case 'fadeOut':
          return 0;
        case 'fadeIn':
        case 'idle':
          return 1;
        default:
          return 1;
      }
    }

    // Side images (index 1 and 2) - with delayed fade-in
    const sideKey = index === 1 ? 'left' : 'right';
    const sidePhase = transitionState.sideImagePhases[sideKey];

    switch (transitionState.phase) {
      case 'fadeOut':
        return 0; // All fade out together
      case 'fadeIn':
        // Side images follow their individual phases
        switch (sidePhase) {
          case 'waiting':
            return 0; // Still waiting to fade in
          case 'fadeIn':
          case 'visible':
            return 1; // Fading in or visible
          default:
            return 0;
        }
      case 'idle':
        return sidePhase === 'visible' ? 1 : 0;
      default:
        return 1;
    }
  };

  // Handle imageSrcArr changes and trigger transitions
  useEffect(() => {
    setTransitionState((prev) => {
      // Check if any source has changed or if array length increased
      const hasChanges =
        imageSrcArr.length !== prev.previousSources.length ||
        imageSrcArr.some((src, index) => src !== prev.previousSources[index]);

      if (hasChanges && prev.previousSources.length > 0) {
        return {
          phase: 'fadeOut',
          previousSources: [...prev.previousSources],
          newSources: [...imageSrcArr],
          sideImagePhases: {
            left: 'waiting',
            right: 'waiting',
          },
        };
      } else {
        // Initial load or no changes - no transition needed
        return {
          ...prev,
          phase: 'idle',
          previousSources: [...imageSrcArr],
          newSources: [...imageSrcArr],
          sideImagePhases: {
            left: 'visible',
            right: 'visible',
          },
        };
      }
    });
  }, [imageSrcArr]);

  // Handle image src transition phases timing
  useEffect(() => {
    if (transitionState.phase === 'idle') return;

    const timeoutIds: NodeJS.Timeout[] = [];

    switch (transitionState.phase) {
      case 'fadeOut':
        // After fade-out completes, move to fadeIn phase
        timeoutIds.push(
          setTimeout(() => {
            setTransitionState((prev) => ({
              ...prev,
              phase: 'fadeIn',
              // Keep side images in waiting state initially
            }));
          }, 250)
        );
        break;

      case 'fadeIn':
        // Main image shows immediately when fadeIn phase starts
        // Schedule left side image to fade in after delay
        if (transitionState.newSources[1]) {
          // Left image exists
          timeoutIds.push(
            setTimeout(() => {
              setTransitionState((prev) => ({
                ...prev,
                sideImagePhases: {
                  ...prev.sideImagePhases,
                  left: 'fadeIn',
                },
              }));
            }, SIDE_IMAGE_FADEIN_DELAY)
          );
        }

        // Schedule right side image to fade in after delay (staggered)
        if (transitionState.newSources[2]) {
          // Right image exists
          timeoutIds.push(
            setTimeout(() => {
              setTransitionState((prev) => ({
                ...prev,
                sideImagePhases: {
                  ...prev.sideImagePhases,
                  right: 'fadeIn',
                },
              }));
            }, SIDE_IMAGE_FADEIN_DELAY * 2)
          ); // Double delay for right image
        }

        // After all animations complete, return to idle
        const maxDelay = transitionState.newSources[2]
          ? SIDE_IMAGE_FADEIN_DELAY * 2
          : transitionState.newSources[1]
          ? SIDE_IMAGE_FADEIN_DELAY
          : 0;

        timeoutIds.push(
          setTimeout(() => {
            setTransitionState((prev) => ({
              ...prev,
              phase: 'idle',
              previousSources: [...prev.newSources],
              sideImagePhases: {
                left: 'visible',
                right: 'visible',
              },
            }));
          }, maxDelay + 250)
        ); // Additional 250ms for the fade-in transition
        break;
    }

    return () => {
      timeoutIds.forEach((id) => clearTimeout(id));
    };
  }, [transitionState.phase, transitionState.newSources]);

  return (
    <div
      className={cn(
        'absolute z-10 top-[var(--topbar-h)] left-0 flex flex-col transition-all duration-500 pointer-events-none',
        active && imageSrcArr.length ? 'opacity-100' : 'opacity-0',
        expanded ? 'right-0 h-134 pb-10 w-full' : 'w-full h-16'
      )}
    >
      {imageSrcArr.length ? (
        <div className="relative h-full w-full">
          {/* Background fade */}
          <div
            className={cn(
              'z-0 absolute inset-0 transition-opacity duration-500',
              expanded ? 'opacity-100' : 'opacity-0'
            )}
          >
            <div
              className={cn(
                'h-full bg-gradient-to-b from-[90%] to-background/0 to-[100%]',
                imageSrcArrLength === 1 && 'from-background/60',
                imageSrcArrLength === 2 && 'from-background/80',
                imageSrcArrLength === 3 && 'from-background/95'
              )}
            />
          </div>

          {/* Images */}
          <div className="z-10 relative -translate-y-4 h-full w-full flex-center">
            <div
              onClick={toggleMinimized}
              data-expanded={expanded ? 'true' : 'false'}
              className="chat-media_minimizer"
            >
              <div className="relative h-4 flex-center leading-none">
                <div
                  className={cn(
                    'translate-x-2 transition-opacity ease-out duration-300',
                    !minimized && 'opacity-0'
                  )}
                >
                  <Button variant="accent" size="sm">
                    Photos
                  </Button>
                </div>

                <div
                  className={cn(
                    'absolute translate-x-12 p-1.5 rounded-full bg-btn-secondary-background transition-opacity ease-out',
                    (minimized || expanded) && 'opacity-0'
                  )}
                >
                  <CloseIcon className="scale-75 icon--action" />
                </div>
              </div>
            </div>

            {/* Main image */}
            <div
              onClick={toggleExpanded}
              data-translate={
                expanded && imageSrcArrLength === 2 ? 'true' : 'false'
              }
              className={cn(
                'chat-media_main-item',
                expanded
                  ? 'w-60 h-120 rounded-2xl dark:shadow-2xl dark:shadow-background/50'
                  : 'w-16 h-16 rounded-lg hover:w-30 hover:h-56 hover:translate-y-8',
                minimized &&
                  'scale-50 w-0 h-0 -translate-y-4 ease-out opacity-0'
              )}
            >
              <div className="absolute inset-0.25 text-white/20 flex-center rounded-2xl bg-accent/20">
                <HeartIcon className="scale-500" />
              </div>
              {getCurrentImageSrc(0) && (
                <Image
                  src={getCurrentImageSrc(0)!}
                  className="z-10 fade object-cover text-sm text-muted bg-background transition-opacity duration-200"
                  style={{ opacity: getImageOpacity(0) }}
                  fill
                  priority
                  quality={100}
                  unoptimized
                  alt="Photo"
                />
              )}
            </div>

            {/* Left side image */}
            <div
              data-key="left"
              className={cn(
                'chat-media_item',
                expanded && getCurrentImageSrc(1)
                  ? 'chat-media_item--active'
                  : 'chat-media_item--inactive',
                expanded && imageSrcArrLength === 2 && '-translate-x-60!'
              )}
            >
              <div className="opacity-85 chat-media_image-wrapper">
                {getCurrentImageSrc(1) && (
                  <Image
                    src={getCurrentImageSrc(1)!}
                    className="object-cover text-sm text-muted transition-opacity duration-200 fade-out"
                    style={{ opacity: getImageOpacity(1) }}
                    fill
                    priority
                    quality={100}
                    unoptimized
                    alt="Photo"
                  />
                )}
              </div>
            </div>

            {/* Right side image */}
            <div
              data-key="right"
              className={cn(
                'chat-media_item',
                expanded && getCurrentImageSrc(2)
                  ? 'chat-media_item--active'
                  : 'chat-media_item--inactive'
              )}
            >
              <div className="opacity-70 chat-media_image-wrapper">
                {getCurrentImageSrc(2) && (
                  <Image
                    src={getCurrentImageSrc(2)!}
                    className="object-cover text-sm text-muted transition-opacity duration-200 fade-out"
                    style={{ opacity: getImageOpacity(2) }}
                    fill
                    priority
                    quality={100}
                    unoptimized
                    alt="Photo"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ChatMedia;
