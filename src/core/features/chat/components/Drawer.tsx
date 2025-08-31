'use client';

import { cn } from '@/core/utils';
import React, { useEffect, useContext, createContext, useState } from 'react';

interface DrawerContextType {
  close: () => void;
  isClosing: boolean;
  isOpening: boolean;
}

const DrawerContext = createContext<DrawerContextType | null>(null);

interface DrawerProps {
  open: boolean;
  onChange: (open: boolean) => void;
  children: React.ReactNode;
}

interface DrawerContentProps {
  children: React.ReactNode;
  className?: string;
}

interface DrawerCloseProps {
  children: React.ReactNode;
}

export const DrawerClose: React.FC<DrawerCloseProps> = ({ children }) => {
  const context = useContext(DrawerContext);

  if (!context) {
    throw new Error('DrawerClose must be used within a Drawer');
  }

  return <div onClick={context.close}>{children}</div>;
};

export const DrawerContent: React.FC<DrawerContentProps> = ({
  children,
  className,
}) => {
  const context = useContext(DrawerContext);
  const isClosing = context?.isClosing || false;
  const isOpening = context?.isOpening || false;

  return (
    <div
      className={cn(
        'fixed bottom-0 left-1/2 transform -translate-x-1/2 z-100 bg-area rounded-t-3xl p-6 flex flex-col',
        'max-w-2xl w-full mx-auto',
        'transition-transform duration-300 ease-in-out',
        isClosing
          ? 'translate-y-full -translate-x-1/2'
          : isOpening
          ? 'translate-y-full -translate-x-1/2'
          : 'translate-y-0 -translate-x-1/2',
        className
      )}
    >
      {children}
    </div>
  );
};

export const Drawer: React.FC<DrawerProps> = ({ open, onChange, children }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  const close = React.useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onChange(false);
      setIsClosing(false);
    }, 500);
  }, [onChange]);

  // Handle opening animation
  useEffect(() => {
    if (open && !isClosing) {
      setIsOpening(true);
      const timer = setTimeout(() => setIsOpening(false), 50);
      return () => clearTimeout(timer);
    }
  }, [open, isClosing]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open && !isClosing) {
        close();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [close, open, isClosing]);

  if (!open && !isClosing) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isClosing) {
      close();
    }
  };

  return (
    <DrawerContext.Provider value={{ close, isClosing, isOpening }}>
      <div
        className={cn(
          'fixed inset-0 z-100 trans-a ease-in-out',
          isClosing
            ? 'bg-background/0'
            : isOpening
            ? 'bg-background/0'
            : 'bg-background/95'
        )}
        onClick={handleOverlayClick}
      >
        {children}
      </div>
    </DrawerContext.Provider>
  );
};
