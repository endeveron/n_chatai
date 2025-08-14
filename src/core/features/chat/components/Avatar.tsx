'use client';

import Image from 'next/image';

import { DEFAULT_EMOTION } from '@/core/features/chat/constants';
import { AvatarKey } from '@/core/features/chat/types/person';

interface AvatarProps {
  avatarKey: AvatarKey;
  avatarBlur: string;
  emotion?: string;
}

const Avatar = ({
  avatarKey,
  avatarBlur,
  emotion = DEFAULT_EMOTION,
}: AvatarProps) => {
  const src = `/images/people/${avatarKey}/emotions/${emotion}.jpg`;

  return (
    // <div className="avatar relative">
    <div className="avatar">
      {/* <div className="avatar_image-wrapper text-muted h-full overflow-hidden relative rounded-full bg-muted ring-6 ring-card/80 dark:ring-0"> */}
      <div className="avatar_image-wrapper text-muted h-full overflow-hidden relative rounded-full bg-muted transition-colors duration-300">
        <Image
          src={src}
          className="avatar_image object-cover aspect-square h-full w-full"
          placeholder="blur"
          blurDataURL={avatarBlur}
          sizes="56px"
          fill
          alt={emotion}
        />
      </div>
      {/* <div className="opacity-85 absolute z-10 -bottom-5 left-1/2 -translate-x-1/2 text-[10px] bg-white px-2 py-0.5 rounded-full tracking-wide">
        {emotion}
      </div> */}
    </div>
  );
};

export default Avatar;
