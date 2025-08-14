'use client';

import { Button } from '@/core/components/ui/Button';
import { cn } from '@/core/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type TNewChatButtonProps = {
  className?: string;
};

const NewChatButton = ({ className }: TNewChatButtonProps) => {
  const pathname = usePathname();
  const href = `/chat`;

  if (pathname === href) return null;

  return (
    <Link href={href} scroll={false} className={cn('flex', className)}>
      <Button variant="secondary" className="new-chat-button">
        New chat
      </Button>
    </Link>
  );
};

export default NewChatButton;
