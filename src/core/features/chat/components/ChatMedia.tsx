'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { MAX_HEAT_LEVEL } from '@/core/features/chat/constants';
import { AvatarKey } from '@/core/features/chat/types/person';
import { cn } from '@/core/utils';

interface ChatMediaProps {
  heatLevel: number;
  avatarKey: AvatarKey;
}

const ChatMedia = ({ heatLevel, avatarKey }: ChatMediaProps) => {
  const [active, setActive] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [imageSrcArr, setImageSrcArr] = useState<string[]>([]);

  const handleToggle = () => {
    setExpanded((prev) => !prev);
  };

  const handleCollapse = () => {
    console.log('AAA');
    setExpanded(false);
  };

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
      return [6, 5, 4];
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

  return (
    <div
      className={cn(
        'absolute z-10 top-[var(--topbar-h)] -translate-y-4 left-0 flex flex-col transition-all duration-500',
        active && imageSrcArr.length ? 'opacity-100' : 'opacity-0',
        expanded ? 'right-0 h-134 pb-10 w-full' : 'w-full h-30'
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
                'h-full bg-gradient-to-b from-[85%] to-background/0 to-[100%]',
                imageSrcArrLength === 1 && 'from-background/60',
                imageSrcArrLength === 2 && 'from-background/80',
                imageSrcArrLength === 3 && 'from-background'
              )}
            />
          </div>

          {/* Images */}
          <div className="z-10 relative h-full w-full flex-center">
            {/* Main image */}
            <div
              onClick={handleToggle}
              data-translate={
                expanded && imageSrcArrLength === 2 ? 'true' : 'false'
              }
              className={cn(
                'chat-media_main-item',
                expanded
                  ? 'w-60 h-120 rounded-2xl dark:shadow-2xl dark:shadow-background/50'
                  : 'w-18 h-30 rounded-lg hover:w-30 hover:h-56'
              )}
            >
              <Image
                src={imageSrcArr[0]}
                className="fade object-cover text-sm text-muted bg-background"
                fill
                priority
                quality={100}
                unoptimized
                alt="Photo"
              />
            </div>

            {/* Left side image */}
            <div
              data-key="left"
              className={cn(
                'chat-media_item',
                expanded && imageSrcArr[1]
                  ? 'chat-media_item--active'
                  : 'chat-media_item--inactive',
                expanded && imageSrcArrLength === 2 && '-translate-x-60!'
              )}
            >
              {imageSrcArr[1] ? (
                <Image
                  src={imageSrcArr[1]}
                  className="object-cover text-sm text-muted"
                  fill
                  priority
                  quality={100}
                  unoptimized
                  alt="Photo"
                />
              ) : null}
            </div>

            {/* Right side image */}
            <div
              data-key="right"
              className={cn(
                'chat-media_item',
                expanded && imageSrcArr[2]
                  ? 'chat-media_item--active'
                  : 'chat-media_item--inactive'
              )}
            >
              {imageSrcArr[2] ? (
                <Image
                  src={imageSrcArr[2]}
                  className="object-cover text-sm text-muted"
                  fill
                  priority
                  quality={100}
                  unoptimized
                  alt="Photo"
                />
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ChatMedia;
