'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

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
import { checkInviteCode } from '@/core/features/auth/actions';
import { inviteSchema, InviteSchema } from '@/core/features/auth/schemas';

import {
  INVITE_CODE_KEY,
  INVITE_CODE_TIME_KEY,
} from '@/core/features/auth/constants';
import { useLocalStorage } from '@/core/hooks/useLocalStorage';
import { cn } from '@/core/utils';

const InviteForm = () => {
  const router = useRouter();

  const { getItem, setItem, removeItem } = useLocalStorage();
  const [isPending, setPending] = useState(false);
  const [counter, setCounter] = useState(0);

  const form = useForm<InviteSchema>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      code: '',
    },
  });

  const onSubmit = async (values: InviteSchema) => {
    const code = values.code;

    try {
      const storedTime = getItem<number>(INVITE_CODE_TIME_KEY);

      if (storedTime) {
        const now = Date.now();
        const timeDiff = Math.ceil((60000 - (now - storedTime)) / 1000);

        if (timeDiff > 0) {
          toast(`Please wait for ${timeDiff} seconds and try again`);
          return;
        } else {
          // Reset after 1 minute has passed
          removeItem(INVITE_CODE_TIME_KEY);
          setCounter(0);
        }
      }

      if (counter > 2) {
        toast('Please wait for 1 minute and try again');
        setItem<number>(INVITE_CODE_TIME_KEY, Date.now());
        return;
      }

      setPending(true);
      const res = await checkInviteCode(code);

      if (!res?.success) {
        toast('Invalid code');
        setCounter((prev) => prev + 1);
        setPending(false);
        return;
      }

      // If success, store the invite code in local storage
      setItem(INVITE_CODE_KEY, code);

      // Redirect to the signup page
      router.push(`/signup`);
    } catch (err: unknown) {
      toast('Server error');
      console.error('InviteForm:', err);
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
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Enter the code</FormLabel>
                <FormControl>
                  <FormInput {...field} />
                </FormControl>
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
            Continue
          </Button>
          <div className="auth-form_link">
            <Link href="/signin" scroll={false}>
              Already have an account ?
            </Link>
          </div>
        </form>
        <FormLoading loadigIconClassName="-mt-14" isPending={isPending} />
      </div>
    </Form>
  );
};

export default InviteForm;
