'use client';

import { signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { useState } from 'react';

import { LightbulbIcon } from '@/core/components/icons/LightbulbIcon';
import { MenuIcon } from '@/core/components/icons/MenuIcon';
import { MoonIcon } from '@/core/components/icons/MoonIcon';
import { SignOutIcon } from '@/core/components/icons/SignOutIcon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/core/components/ui/DropdownMenu';
import LoadingIcon from '@/core/components/ui/LoadingIcon';
import { UserData } from '@/core/features/chat/types/chat';
import { cn } from '@/core/utils';

type MainMenuProps = {
  userData: UserData;
  className?: string;
};

const MainMenu = ({ userData, className }: MainMenuProps) => {
  const { setTheme, theme } = useTheme();
  const [signoutPending, setSignoutPending] = useState(false);

  const handleToggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  const handleSignOut = () => {
    setSignoutPending(true);
    signOut();
  };

  const themeIcon =
    theme === 'light' ? (
      <MoonIcon className="icon--menu" />
    ) : (
      <LightbulbIcon className="icon--menu" />
    );

  return (
    <div className={cn('main-menu h-6', className)}>
      {signoutPending && (
        <div className="fixed z-40 inset-0 bg-background/90 flex flex-col items-center justify-center transition-colors duration-300">
          <LoadingIcon />
        </div>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger>
          <MenuIcon className="icon--action" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {userData && (
            <>
              <div className="cursor-default px-4 py-2">
                <div className="text-lg font-bold">{userData.name}</div>
                <div className="text-sm text-muted">{userData.email}</div>
              </div>
            </>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleToggleTheme}>
            {themeIcon}
            {theme === 'light' ? 'Dark' : 'Light'} Theme
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleSignOut}>
            <SignOutIcon className="icon--menu flip-x" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

MainMenu.displayName = 'MainMenu';

export default MainMenu;
