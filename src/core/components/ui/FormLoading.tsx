'use client';

import LoadingIcon from '@/core/components/ui/LoadingIcon';
import { cn } from '@/core/utils';

type TFormLoadingProps = {
  isPending: boolean;
  loadigIconClassName?: string;
};

const FormLoading = ({ isPending, loadigIconClassName }: TFormLoadingProps) => {
  return (
    <div
      className={cn(
        'opacity-0 absolute !m-0 inset-0 flex-center -z-10',
        isPending && 'opacity-100 z-10'
      )}
    >
      <div className={cn(loadigIconClassName)}>
        <LoadingIcon />
      </div>
    </div>
  );
};

export default FormLoading;
