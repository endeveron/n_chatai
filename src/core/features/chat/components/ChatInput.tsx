'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as zod from 'zod';

import {
  Form,
  FormControl,
  FormField,
  FormInput,
  FormItem,
  FormMessage,
} from '@/core/components/ui/Form';
import InstantMessage from '@/core/features/chat/components/InstantMessage';
import { cn } from '@/core/utils';

const inputValidation = zod.object({
  message: zod
    .string()
    .max(120, 'Message is too long — please limit it to 120 characters')
    .refine(
      (msg) => !/[<>]/.test(msg), // prevents basic HTML tags, potential XSS
      {
        message: 'Message contains forbidden characters < >',
      }
    )
    .refine((msg) => !/script/i.test(msg), {
      message: 'Message contains potentially unsafe content',
    }),
});

type TChatInputProps = {
  onSubmit: (input: string) => void;
  isPending: boolean;
  isPremium: boolean;
};

const ChatInput = ({ onSubmit, isPending, isPremium }: TChatInputProps) => {
  const form = useForm<zod.infer<typeof inputValidation>>({
    resolver: zodResolver(inputValidation),
    defaultValues: { message: '' },
  });

  const handleSubmit = async (values: zod.infer<typeof inputValidation>) => {
    if (values.message.trim()) {
      onSubmit(values.message);
    }

    form.reset();
  };

  return (
    <div className="chat-input chat-container">
      {isPremium ? (
        <InstantMessage
          onSubmit={form.handleSubmit(handleSubmit)}
          onUpdate={(message) => form.setValue('message', message)}
          onReset={() => form.setValue('message', '')}
        />
      ) : null}

      <Form {...form}>
        <form
          className={cn('w-full', { pending: isPending })}
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormMessage className="-mb-1" />
                <FormControl>
                  <FormInput
                    placeholder="Type something..."
                    className="rounded-3xl p-6 bg-card trans-c"
                    type="search" // To disable Chrome's extra bar
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
};

export default ChatInput;
