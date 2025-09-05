'use client';

import { useState } from 'react';

import { CollectionIcon } from '@/core/components/icons/CollectionIcon';
import { Button, ButtonVariant } from '@/core/components/ui/Button';
import { INSTANT_MESSAGES } from '@/core/features/chat/data/conversation';
import { cn } from '@/core/utils';

interface InstantMessageProps {
  onUpdate: (message: string) => void;
  onSubmit: () => void;
  onReset: () => void;
}

const InstantMessage = ({
  onSubmit,
  onUpdate,
  onReset,
}: InstantMessageProps) => {
  const [open, setOpen] = useState(false);

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  const handleSubmit = () => {
    onSubmit();
    setOpen(false);
  };

  const renderButton = ({
    title,
    message,
    variant,
    index,
    onClick,
  }: {
    title: string;
    message: string;
    index: number;
    variant: ButtonVariant;
    onClick: () => void;
  }) => {
    return (
      <div className="instant-message_btn" key={index}>
        <Button className="px-3" onClick={onClick} size="sm" variant={variant}>
          {title}
        </Button>

        <div className="instant-message_tooltip">{message}</div>
      </div>
    );
  };

  return (
    <div className="relative z-50">
      {open ? (
        <div onClick={handleToggle} className="fixed z-40 inset-0"></div>
      ) : null}
      <div
        className={cn(
          'content absolute z-50 bottom-12 left-0 w-70 p-4 flex flex-wrap gap-1 rounded-2xl bg-area trans-a',
          open
            ? 'pointer-events-auto opacity-100 scale-100'
            : 'pointer-events-none opacity-0 scale-95'
        )}
      >
        {INSTANT_MESSAGES.foreplay.map((m, index) =>
          renderButton({
            variant: 'ghost',
            message: m.phrase,
            title: m.title,
            index,
            onClick: () => onUpdate(m.phrase),
          })
        )}

        {INSTANT_MESSAGES.toying.map((m, index) =>
          renderButton({
            variant: 'outline',
            message: m.phrase,
            title: m.title,
            index,
            onClick: () => onUpdate(m.phrase),
          })
        )}

        {INSTANT_MESSAGES.thrusts.map((m, index) =>
          renderButton({
            variant: 'secondary',
            message: m.phrase,
            title: m.title,
            index,
            onClick: () => onUpdate(m.phrase),
          })
        )}

        {/* Toolbar */}
        <div className="mt-3 pt-3 border-t w-full flex items-center gap-2 trans-c">
          <Button
            onClick={handleSubmit}
            className="uppercase"
            size="sm"
            variant="accent"
            key={21}
          >
            go
          </Button>
          <Button
            onClick={onReset}
            className="uppercase"
            size="sm"
            variant="secondary"
            key={20}
          >
            reset
          </Button>
        </div>
      </div>

      {/* Trigger */}
      <div
        onClick={handleToggle}
        className="p-2 rounded-full bg-popover text-muted opacity-40 hover:opacity-100 trans-a cursor-pointer"
        title="Instant message"
      >
        <CollectionIcon />
      </div>
    </div>
  );
};

export default InstantMessage;
