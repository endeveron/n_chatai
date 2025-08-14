'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

import { Button, ButtonProps } from '@/core/components/ui/Button';
import { resendVerifyEmailLink } from '@/core/features/auth/actions';
import { useError } from '@/core/hooks/useError';

type TGenerateTokenButtonProps = ButtonProps & {
  email: string;
  btnTitle?: string;
  className?: string;
};

const GenerateTokenButton = ({
  email,
  btnTitle = 'Generate a new token',
  className,
  variant,
  size,
}: TGenerateTokenButtonProps) => {
  const router = useRouter();
  const { toastError } = useError();
  const [isPending, startTransition] = useTransition();

  const handleClick = async () => {
    if (!email) toastError('Unable to send the link. Invalid email');

    startTransition(async () => {
      try {
        const res = await resendVerifyEmailLink({ email });
        if (!res?.success) {
          toastError(res);
          return;
        }

        // If success redirect to a verify email page
        router.push(`/email/verify?e=${email}`);
      } catch (err: unknown) {
        toastError(err);
      }
    });
  };

  return (
    <Button
      className={className}
      variant={variant}
      size={size}
      onClick={handleClick}
      loading={isPending}
    >
      {btnTitle}
    </Button>
  );
};

export default GenerateTokenButton;
