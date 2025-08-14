import LoadingIcon from '@/core/components/ui/LoadingIcon';
import { cn } from '@/core/utils';

const LoadingFragment = () => {
  return (
    <div
      className={cn(
        'loading opacity-0 w-full flex-center bg-background/70 transition-opacity'
      )}
    >
      <LoadingIcon />
    </div>
  );
};

export default LoadingFragment;
