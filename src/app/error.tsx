'use client';

import ErrorDialog from '@/core/components/ui/ErrorDialog';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorDialog error={error} onReset={reset} />;
}
