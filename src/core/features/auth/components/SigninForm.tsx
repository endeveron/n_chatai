'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { GoogleLogo } from '@/core/components/icons/GoogleLogo';
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
import { AuthData, SocialProvider } from '@/core/features/auth/types';
import { persistAuthData } from '@/core/features/stats/services';
import { useError } from '@/core/hooks/useError';
import { cn } from '@/core/utils';

export interface SignInFormProps {
  isGoogleAllowed: boolean;
  onAuthSocial: (provider: SocialProvider) => void;
}

const SignInForm = ({ isGoogleAllowed, onAuthSocial }: SignInFormProps) => {
  const searchParams = useSearchParams();
  const { toastError } = useError();

  const [isProcessing, setIsProcessing] = useState(false);
  const [pwdVisible, setPwdVisible] = useState(false);

  const form = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const redirectTo = searchParams.get('redirectTo') || undefined;

  const onSubmit = async (data: SignInSchema) => {
    const authData: AuthData = {
      email: data.email.toLowerCase(),
      password: data.password,
    };

    setIsProcessing(true);
    persistAuthData(authData);

    try {
      const res = await signIn({
        ...authData,
        redirectTo,
      });
      if (!res?.success) {
        toastError(res);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err: unknown) {
      // toastError(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Form {...form}>
      <div className="relative">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={cn('auth-form', isProcessing && 'inactive')}
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
            loading={isProcessing}
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
                loading={isProcessing}
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
        <FormLoading loadigIconClassName="-mt-14" isPending={isProcessing} />
      </div>
    </Form>
  );
};

export default SignInForm;
