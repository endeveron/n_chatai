'use client';

import Image from 'next/image';

import { DEFAULT_EMOTION_KEY } from '@/core/features/chat/constants';
import { AvatarKey } from '@/core/features/chat/types/person';

interface AvatarProps {
  avatarKey: AvatarKey;
  avatarBlur: string;
  emotion?: string;
  showEmotion?: boolean;
}

const Avatar = ({
  avatarKey,
  avatarBlur,
  emotion = DEFAULT_EMOTION_KEY,
}: // showEmotion,
AvatarProps) => {
  const src = `/images/people/${avatarKey}/emotions/${emotion}.jpg`;

  return (
    <div className="avatar relative">
      <div className="h-full overflow-hidden relative rounded-full bg-muted">
        <Image
          src={src}
          className="object-cover aspect-square h-full w-full text-sm"
          placeholder="blur"
          blurDataURL={avatarBlur}
          sizes="56px"
          fill
          alt={emotion}
        />
      </div>

      {/* Debug */}
      {/* {showEmotion ? (
        <div className="absolute z-10 w-14 text-xs text-muted/80 text-center truncate left-1/2 -translate-x-1/2 top-15">
          {emotion}
        </div>
      ) : null} */}
    </div>
  );
};

export default Avatar;
