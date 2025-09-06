'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

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
import { DEFAULT_REDIRECT } from '@/core/constants';
import { onboardUser } from '@/core/features/auth/actions';
import VisibilityToggle from '@/core/features/auth/components/VisibilityToggle';
import { INVITE_CODE_KEY } from '@/core/features/auth/constants';
import {
  OnboardingSchema,
  onboardingSchema,
} from '@/core/features/auth/schemas';
import { useError } from '@/core/hooks/useError';
import { useLocalStorage } from '@/core/hooks/useLocalStorage';
import { cn } from '@/core/utils';

type TOnboardingFormProps = {
  userId: string;
};

const OnboardingForm = ({ userId }: TOnboardingFormProps) => {
  const router = useRouter();
  const { toastError } = useError();
  const { getItem, removeItem } = useLocalStorage();

  const [pwdVisible, setPwdVisible] = useState(false);
  const [confirmPwdVisible, setConfirmPwdVisible] = useState(false);
  const [isPending, setPending] = useState(false);

  const form = useForm<OnboardingSchema>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: OnboardingSchema) => {
    try {
      setPending(true);

      // Get invite code from the local storage
      const inviteCode = getItem<string>(INVITE_CODE_KEY);
      if (!inviteCode) {
        toast('Could not retrieve invite code');
        return;
      }

      const res = await onboardUser({
        userId: userId,
        name: values.name,
        password: values.password,
        inviteCode,
      });

      // If success redirect to signin
      if (res?.success) {
        // Remove invite code from the local storage
        removeItem(INVITE_CODE_KEY);
        // Redirect to the signin page
        router.replace(`/signin?redirectTo=${DEFAULT_REDIRECT.slice(1)}`);
        return;
      }

      toastError(res);
      setPending(false);
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
          className={cn('auth-form mx-4', isPending && 'inactive')}
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your name</FormLabel>
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
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm password</FormLabel>
                <FormControlWithIcon>
                  <FormControlIcon>
                    <VisibilityToggle
                      onClick={() => setConfirmPwdVisible((prev) => !prev)}
                    />
                  </FormControlIcon>
                  <FormInput
                    {...field}
                    type={confirmPwdVisible ? 'text' : 'password'}
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
            Create an account
          </Button>
          <FormLoading loadigIconClassName="-mt-14" isPending={isPending} />
        </form>
        <FormLoading loadigIconClassName="-mt-14" isPending={isPending} />
      </div>
    </Form>
  );
};

export default OnboardingForm;
