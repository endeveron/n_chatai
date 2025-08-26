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
    <div className="avatar">
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
    </div>
  );
};

export default Avatar;
