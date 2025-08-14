import Image from 'next/image';

import { PersonBaseData } from '@/core/features/chat/types/person';

const ChatDetails = async ({ person }: { person: PersonBaseData }) => {
  if (!person) return null;

  const imageSrc = `/images/people/${person.avatarKey}/card.jpg`;

  return (
    <div className="chat-details">
      <div className="chat-details_content">
        <div className="chat-details_image">
          <Image
            src={imageSrc}
            className="fade max-w-[288px]"
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
        </div>
      </div>
    </div>
  );
};

export default ChatDetails;
