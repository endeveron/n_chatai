'use client';

import AnimatedAppear from '@/core/components/ui/AnimatedAppear';
import MainMenu from '@/core/components/ui/MainMenu';
import { APP_NAME } from '@/core/constants';
import { useSessionWithRefresh } from '@/core/features/auth/hooks/use-session-with-refresh';

type TopbarProps = {
  title?: string;
};

const Topbar = ({ title }: TopbarProps) => {
  const { session } = useSessionWithRefresh();

  return (
    <AnimatedAppear className="fixed top-0 left-1/2 -translate-x-1/2 h-14 w-full max-w-[640px] flex items-center justify-between px-4 rounded-b-3xl bg-card cursor-default z-50">
      <h2 className="text-2xl font-bold text-accent leading-none">
        {title ?? APP_NAME}
      </h2>

      <MainMenu email={session?.user.email} />
    </AnimatedAppear>
  );
};

export default Topbar;
