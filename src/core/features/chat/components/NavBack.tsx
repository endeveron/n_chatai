import { NavBackIcon } from '@/core/components/icons/NavBackIcon';
import { cn } from '@/core/utils';

interface NavbackProps {
  className?: string;
  onClick: () => void;
}

export const NavBack = ({ className, onClick }: NavbackProps) => {
  return (
    <div onClick={onClick} className={cn('w-6 h-6', className)}>
      <NavBackIcon className="icon--action" />
    </div>
  );
};
