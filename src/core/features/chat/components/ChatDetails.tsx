'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

import { ScrollArea } from '@/core/components/ui/ScrollArea';
import { heatPhotoMap } from '@/core/features/chat/data/maps';
import { PersonBaseData } from '@/core/features/chat/types/person';

const ChatDetails = ({ person }: { person: PersonBaseData }) => {
  const [totalPhotos, setTotalPhotos] = useState(0);
  const avatarKey = person.avatarKey;

  useEffect(() => {
    const collections = heatPhotoMap.get(avatarKey);
    if (!collections) return;

    let photosNum = 0;
    for (const key in collections) {
      photosNum += collections[key].totalPhotos;
    }
    setTotalPhotos(photosNum);
  }, [avatarKey]);

  const imageSrc = `/images/people/${person.avatarKey}/card.jpg`;

  return person ? (
    <div className="chat-details">
      <ScrollArea>
        <div className="chat-details_image">
          <Image
            src={imageSrc}
            className="fade h-[352px] max-w-[288px]"
            placeholder="blur"
            blurDataURL={person.imgBlur}
            width={288}
            height={352}
            alt={person.bio}
          />
        </div>
        <div className="p-10">
          <h2>{person.title}</h2>
          <div className="mt-1 chat-details_description">{person.status}</div>
          <div className="mt-6 chat-details_description chat-details_description--active">
            <p>{person.bio}</p>
          </div>

          {totalPhotos ? (
            <div className="mt-6 chat-details_description chat-details_description--active">
              I could have {totalPhotos} hot photos... That depends on you!
            </div>
          ) : null}
        </div>
      </ScrollArea>
    </div>
  ) : null;
};

export default ChatDetails;
