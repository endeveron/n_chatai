'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/core/components/ui/Button';
import {
  AnimatedCard,
  CardContent,
  CardTitle,
} from '@/core/components/ui/Card';

type TErrorProps = {
  error: Error & { digest?: string };
  onReset: () => void;
};

const ErrorDialog = ({ error, onReset }: TErrorProps) => {
  const router = useRouter();

  return (
    <AnimatedCard>
      <CardTitle className="text-error">Oops!</CardTitle>
      <CardContent>
        <p className="mb-8 text-center">
          {error?.message || 'Something went wrong.'}
        </p>

        <div className="mt-4 flex justify-center flex-wrap max-xs:gap-4 gap-8">
          <Button
            variant="outline"
            onClick={
              // Attempt to recover by trying to re-render the segment
              () => onReset()
            }
          >
            Try again
          </Button>
          <Button variant="outline" onClick={() => router.back()}>
            Previous page
          </Button>
        </div>
      </CardContent>
    </AnimatedCard>
  );
};

ErrorDialog.displayName = 'ErrorDialog';

export default ErrorDialog;
