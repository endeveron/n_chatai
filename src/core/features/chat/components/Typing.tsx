'use client';

import { TYPING_ANIMATION_DELAY_MSEC } from '@/core/features/chat/constants';
import { cn } from '@/core/utils';
import { useEffect, useState } from 'react';

const Typing = () => {
  const [isVisible, setVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setVisible(true);
    }, TYPING_ANIMATION_DELAY_MSEC);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div
      className={cn(
        'flex items-center m-8 trans-o',
        isVisible ? 'opacity-100' : 'opacity-0'
      )}
    >
      <div className="typing_circle" style={{ animationDelay: '0.4s' }}></div>
      <div
        className="typing_circle ml-2"
        style={{ animationDelay: '0.6s' }}
      ></div>
      <div
        className="typing_circle ml-2"
        style={{ animationDelay: '0.8s' }}
      ></div>
    </div>
  );
};

export default Typing;
