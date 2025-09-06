'use client';

import Image from 'next/image';

import { DEFAULT_EMOTION_KEY } from '@/core/features/chat/data/conversation';
import { AvatarKey } from '@/core/features/chat/types/person';
import { cn } from '@/core/utils';
import { useEffect, useMemo, useState } from 'react';

interface AvatarProps {
  avatarKey: AvatarKey;
  avatarBlur: string;
  emotion?: string;
  showEmotion?: boolean;
  isFade?: boolean;
  className?: string;
}

const Avatar = ({
  avatarKey,
  avatarBlur,
  emotion = DEFAULT_EMOTION_KEY,
  className,
  isFade,
}: AvatarProps) => {
  const [isShadow, setIsShadow] = useState(false);

  useEffect(() => {
    if (isFade) setIsShadow(true);
  }, [isFade]);

  const src = useMemo(() => {
    return `/images/people/${avatarKey}/emotions/${emotion}.jpg`;
  }, [avatarKey, emotion]);

  const mainAvatar = (
    <div className="relative avatar h-full overflow-hidden rounded-full bg-muted/40">
      <Image
        src={src}
        className={cn(
          'object-cover aspect-square h-full w-full text-sm',
          className
        )}
        placeholder="blur"
        blurDataURL={avatarBlur}
        sizes="56px"
        fill
        alt={emotion}
      />
    </div>
  );

  if (isFade) {
    return (
      <div className="relative">
        {/* Shadow Avatar */}
        <div data-shadow={isShadow} className="shadow-avatar">
          <div className="avatar h-full overflow-hidden relative rounded-full fade-circle">
            <Image
              src={src}
              className={cn(
                'object-cover aspect-square h-full w-full text-sm grayscale-25',
                className
              )}
              placeholder="blur"
              blurDataURL={avatarBlur}
              sizes="56px"
              fill
              alt={emotion}
            />
          </div>
        </div>

        {/* Main Avatar */}
        {mainAvatar}
      </div>
    );
  }

  return mainAvatar;
};

export default Avatar;
