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
import { SignInArgs } from '@/core/features/auth/types';
import { useError } from '@/core/hooks/useError';
import { cn } from '@/core/utils';

const SignInForm = () => {
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
      const res = await signIn(signinData);
      if (!res?.success) {
        toastError(res);
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
            variant="accent"
          >
            Sign in
          </Button>
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
