import ChatPreview from '@/core/features/chat/components/ChatPreview';
import { cn } from '@/core/utils';

function Title({
  children,
  className,
}: Readonly<{
  children: React.ReactNode;
  className: string;
}>) {
  return (
    <div
      className={cn(
        'absolute inset-x-0 text-8xl text-white/20 dark:text-white/15 font-black text-center uppercase overflow-hidden whitespace-nowrap',
        className
      )}
    >
      {children}
    </div>
  );
}

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="size-full flex bg-area trans-c">
      <div className="relative w-full md:w-[400px] flex-center">{children}</div>
      <div className="relative max-md:hidden flex-1 flex-center bg-brand overflow-hidden select-none">
        <Title className="-translate-y-[340px]">18+ nsfw chat</Title>
        <div className="absolute bg-area/5 inset-x-0 h-80"></div>
        <Title className="translate-y-[330px]">real emotions</Title>
        <ChatPreview />
      </div>
    </div>
  );
}
