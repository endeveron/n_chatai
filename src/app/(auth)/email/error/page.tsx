import { Metadata } from 'next';

import {
  AnimatedCard,
  CardContent,
  CardTitle,
} from '@/core/components/ui/Card';
import { APP_NAME } from '@/core/constants';
import GenerateTokenButton from '@/core/features/auth/components/GenerateTokenButton';
import { SearchParams } from '@/core/types/common';
import { getErrorMessageFromSearchParams } from '@/core/utils/error';
import { EMAIL_ERRORS } from '@/core/features/auth/constants';

export const metadata: Metadata = {
  title: `Email error — ${APP_NAME}`,
  description: 'Email confirmation',
};

export default async function EmailErrorPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { e, c } = await searchParams;
  const email = e as string;
  const errCodeStr = c as string;

  if (!email || !errCodeStr) {
    throw new Error('Invalid search params');
  }

  const errorMessage = getErrorMessageFromSearchParams(
    errCodeStr as string,
    EMAIL_ERRORS
  );

  return (
    <AnimatedCard>
      <CardTitle className="text-error">Oops!</CardTitle>
      <CardContent>
        <p className="-mt-2 text-center">{errorMessage}</p>

        <div className="flex-center">
          <GenerateTokenButton
            email={email}
            className="mt-6"
            btnTitle="Generate a new token"
          />
        </div>
      </CardContent>
    </AnimatedCard>
  );
}
