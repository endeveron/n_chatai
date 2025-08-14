'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/core/components/ui/Button';
import {
  Form,
  FormControl,
  FormField,
  FormInput,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/core/components/ui/Form';
import FormLoading from '@/core/components/ui/FormLoading';
import { signUp } from '@/core/features/auth/actions';
import { SignUpSchema, signUpSchema } from '@/core/features/auth/schemas';
import { useError } from '@/core/hooks/useError';
import { cn } from '@/core/utils';

const SignUpForm = () => {
  const router = useRouter();
  const { toastError } = useError();
  const [isPending, setPending] = useState(false);

  const form = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values: SignUpSchema) => {
    try {
      setPending(true);
      const res = await signUp({ email: values.email.toLowerCase() });
      if (!res?.success) {
        toastError(res);
        setPending(false);
        return;
      }

      // If success, redirect to the email verify page
      router.push(`/email/verify?e=${values.email}`);
    } catch (err: unknown) {
      toastError(err);
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
                <FormLabel>Your email</FormLabel>
                <FormControl>
                  <FormInput {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            // variant="accent"
            loading={isPending}
            className="auth-form_button"
            type="submit"
          >
            Continue
          </Button>
          <FormLoading loadigIconClassName="-mt-14" isPending={isPending} />
        </form>
        <FormLoading loadigIconClassName="-mt-14" isPending={isPending} />
      </div>
    </Form>
  );
};

export default SignUpForm;
