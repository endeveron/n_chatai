'use client';

import Image from 'next/image';

import {
  PersonCardData,
  SelectPerson,
} from '@/core/features/chat/types/person';
import { cn } from '@/core/utils';

type TPersonCardProps = PersonCardData & {
  currentPersonId: string;
  onSelect: (person: SelectPerson) => void;
};

const PersonCard = ({
  _id,
  title,
  gender,
  avatarKey,
  status,
  imgBlur,
  currentPersonId,
  onSelect,
}: TPersonCardProps) => {
  const imageSrc = `/images/people/${avatarKey}/card.jpg`;

  return (
    <div
      className={cn('person-card card', {
        'person-card--selected': currentPersonId === _id,
      })}
      onClick={() =>
        onSelect({
          _id,
          gender,
        })
      }
    >
      <div className="person-card_image relative">
        <Image
          src={imageSrc}
          className="object-cover w-full h-auto"
          placeholder="blur"
          blurDataURL={imgBlur}
          sizes="144px"
          fill
          alt={title}
        />
      </div>
      <div className="person-card_content">
        <div className="person-card_title font-bold truncate">{title}</div>
        <div className="person-card_description truncate">{status}</div>
      </div>
    </div>
  );
};

export default PersonCard;
