'use client';

import { forwardRef, PropsWithChildren, useEffect, useState } from 'react';

import { cn } from '@/core/utils';

type AnimatedAppearProps = PropsWithChildren &
  React.HTMLAttributes<HTMLDivElement> & {
    isShown?: boolean;
    delay?: number;
    duration?: 'fast' | 'normal';
  };

const AnimatedAppear = forwardRef<HTMLDivElement, AnimatedAppearProps>(
  (
    {
      children,
      className,
      delay,
      duration = 'normal',
      isShown,
      title,
      onClick,
    },
    ref
  ) => {
    const [isReady, setIsReady] = useState(false);

    const durationClassName =
      duration === 'fast' ? 'duration-100' : 'duration-500';

    useEffect(() => {
      let delayTimeout: NodeJS.Timeout;

      if (delay) {
        delayTimeout = setTimeout(() => {
          setIsReady(true);
        }, delay);
        return;
      }

      if (isShown === undefined) {
        setIsReady(true);
        return;
      }
      setIsReady(isShown);

      return () => {
        if (delayTimeout) clearTimeout(delayTimeout);
      };
    }, [delay, isShown]);

    return (
      <div
        ref={ref}
        onClick={onClick}
        className={cn(
          `opacity-0 transition-opacity`,
          isReady && 'opacity-100',
          durationClassName,
          className
        )}
        title={title}
      >
        {children}
      </div>
    );
  }
);

AnimatedAppear.displayName = 'AnimatedAppear';

export default AnimatedAppear;
