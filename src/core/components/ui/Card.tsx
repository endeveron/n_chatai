'use client';

import { useEffect, useState, forwardRef } from 'react';

import { cn } from '@/core/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'px-4 py-6 sm:px-6 rounded-2xl bg-card cursor-default trans-c',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

export interface AnimatedCardProps extends CardProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ children, className, isOpen = true, onClose, ...props }, ref) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
      if (isOpen) {
        setTimeout(() => setIsVisible(true), 50);
      } else {
        setIsVisible(false);
      }
    }, [isOpen]);

    return (
      <div
        className="fixed inset-0 flex items-center justify-center"
        onClick={(e) => {
          if (e.target === e.currentTarget && onClose) {
            onClose();
          }
        }}
      >
        <div
          ref={ref}
          className={cn(
            'm-4 relative max-w-md flex-center flex-col px-4 sm:px-8 py-8 rounded-2xl bg-card cursor-default trans-a',
            isVisible
              ? 'scale-100 opacity-100 translate-y-0'
              : 'scale-95 opacity-0 translate-y-2',
            className
          )}
          {...props}
        >
          {children}
        </div>
      </div>
    );
  }
);
AnimatedCard.displayName = 'AnimatedCard';

const CardTitle = forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ children, className, ...props }, ref) => {
  if (!children) return null;
  return (
    <h3
      ref={ref}
      className={cn('mb-6 title text-3xl font-black leading-none', className)}
      {...props}
    >
      {children}
    </h3>
  );
});
CardTitle.displayName = 'CardTitle';

const CardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ children, className, ...props }, ref) => {
  if (!children) return null;
  return (
    <div ref={ref} className={cn('mb-4 -mt-3 text-sm', className)} {...props}>
      {children}
    </div>
  );
});
CardDescription.displayName = 'CardDescription';

const CardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
  if (!children) return null;
  return (
    <div ref={ref} className={cn('mt-2', className)} {...props}>
      {children}
    </div>
  );
});
CardContent.displayName = 'CardContent';

export { AnimatedCard, Card, CardContent, CardTitle, CardDescription };
