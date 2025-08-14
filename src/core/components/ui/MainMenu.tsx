'use client';

import { MenuIcon } from '@/core/components/icons/MenuIcon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/core/components/ui/DropdownMenu';
import SignOutButton from '@/core/features/auth/components/SignoutBtn';

export interface MainMenuProps {
  email?: string | null;
}

const MainMenu = ({ email }: MainMenuProps) => {
  if (!email) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="px-2 text-icon cursor-pointer outline-none">
        <MenuIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent sideOffset={24}>
        <DropdownMenuLabel className="my-2 text-sm text-muted leading-none cursor-default">
          {email}
        </DropdownMenuLabel>
        {/* <DropdownMenuSeparator /> */}
        <DropdownMenuItem>
          <SignOutButton />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MainMenu;
