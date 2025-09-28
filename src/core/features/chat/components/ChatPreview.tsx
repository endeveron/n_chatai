'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

import { HeartIcon } from '@/core/components/icons/HeartIcon';
import ChatMessage from '@/core/features/chat/components/ChatMessage';
import { MessageRole } from '@/core/features/chat/types/chat';
import { AvatarKey } from '@/core/features/chat/types/person';
import { cn } from '@/core/utils';

const DATA = {
  avatarKey: AvatarKey.mango,
  avatarBlur:
    'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAAKAAoDAREAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAACQf/xAAkEAABBAIBAwUBAAAAAAAAAAADAQIEBQYHEQATFAkSISIxI//EABoBAAEFAQAAAAAAAAAAAAAAAAQBBQYHCAn/xAAmEQACAQMCBQUBAAAAAAAAAAABAgMEERIABQYTFCFBBzI1dLQl/9oADAMBAAIRAxEAPwC17Yw7Z+BY1k9NOzaji5rs24ubCbX5DVw5gq2wJY5VaXd+PtWSWEsNzXDgx6+EN5HR66KD2uYRp3gxjXuomd9xpGkxnPVOkhRpFkQCNA7RyCE2GaGzZhxfubnpdwvSW2GkfYtyRKXpYlo2mpcoaepDM85lUSxtMc2Mciho8GiupINtBVlmC2BspyU0VKGRFLf3JY0hsOOrTgJYyXhMirDcqoUateiq53KO/V/ekiqOXHHHnULgiJjb24qBj7vFraFqdkSeonn/AJ786aWXPqEGXMdnytbtle9vF9O/6oFzb1uN7XNXWtlANAns8EsKdKikhc6/rDr4jwFG6PyZEMvZVnJf6L9/nojdgH4iVGAZDW0alGAZSphp7qVNwQfIIsdM3AbunposiMyyCi3lhIrFXDLUV5VgwIYMp7qQbg9wdCvofH6GVo3TMmTSVEiTI1Rrs8iQethmOc5sQpyFMYpAuIUpSOc8hHuc973Oc5Vcqr1Lt1+T3L79Z+iTVTbX8bt30aT88ev/2Q==',
  messages: [
    {
      id: '1',
      role: MessageRole.human,
      content: 'Hi, sunshine!',
    },
    {
      id: '2',
      role: MessageRole.ai,
      emotion: 'friendly',
      content:
        "My darling! What's on your mind? I'm all ears, and maybe a little more than that... Tell me what you want. My lips are a forbidden fruit, ripe and ready to drive you wild.",
    },
    {
      id: '3',
      role: MessageRole.human,
      content: 'Sounds promising...',
    },
    {
      id: '4',
      role: MessageRole.ai,
      emotion: 'unraveled-3',
      content:
        'The way you look at me makes me tremble. My skin is already flushed, anticipating your touch. I want to feel your hands on me as you uncover my secrets. What do you think?',
    },
  ],
};

const messageProps = {
  avatarKey: DATA.avatarKey,
  avatarBlur: DATA.avatarBlur,
  timestamp: 1,
  onScroll: () => {},
  isPremium: false,
  className: 'mr-0',
};

const ChatPreview = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, 300);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div
      className={cn(
        'chat-preview relative lg:-ml-40 trans-a',
        isVisible ? 'opacity-100' : 'opacity-0 scale-75'
      )}
    >
      <div className="relative z-20 flex flex-col w-[320px] min-h-[640px] rounded-3xl bg-area shadow-2xl">
        <div className="flex flex-1 flex-col px-4 py-2 lg:-ml-11">
          {DATA.messages.map((m) => (
            <ChatMessage
              key={m.id}
              emotion={m.emotion}
              role={m.role}
              content={m.content}
              {...messageProps}
            />
          ))}
        </div>
        <div className="h-12 pl-6 pt-2.5 font-semibold rounded-3xl bg-input">
          I like your drop-dead sexy style!
        </div>

        <div className="absolute z-30 bottom-28 -right-12 lg:-right-20 p-6 rounded-xs bg-accent shadow-2xl rotate-6">
          <div className="text-white text-2xl leading-tight font-black tracking-wide">
            Incredible
            <br />
            experience
          </div>
        </div>

        {isLoaded && isVisible ? (
          <div className="max-lg:hidden absolute z-30 bottom-66 -right-20 text-accent animate-ping scale-150">
            <HeartIcon />
          </div>
        ) : null}
      </div>

      <div className="max-lg:hidden absolute top-0 left-0 z-10 rotate-10">
        <div
          className={cn(
            'relative w-[280px] h-[560px] rounded-3xl overflow-hidden trans-a shadow-2xl',
            isLoaded && isVisible
              ? 'translate-x-58 opacity-100'
              : 'opacity-0 scale-75'
          )}
        >
          <Image
            src="images/preview.jpg"
            onLoad={handleLoad}
            priority
            quality={100}
            unoptimized
            fill
            alt="model"
          />
        </div>
      </div>
    </div>
  );
};

export default ChatPreview;
