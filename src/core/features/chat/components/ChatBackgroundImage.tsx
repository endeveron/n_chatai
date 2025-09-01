'use client';

import Image from 'next/image';
import { useState } from 'react';

interface ChatBackgroundImageProps {
  src: string;
  alt: string;
  isActive: boolean;
}

const ChatBackgroundImage = ({
  src,
  alt,
  isActive,
}: ChatBackgroundImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  return (
    <div data-active={isActive && isLoaded} className="chat_bg-image">
      <Image src={src} width={900} height={900} alt={alt} onLoad={handleLoad} />
    </div>
  );
};

export default ChatBackgroundImage;
