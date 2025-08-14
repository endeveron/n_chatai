'use client';

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
import { cn } from '@/core/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/core/components/ui/Button';

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
};

const ChatInput = ({ onSubmit, isPending }: TChatInputProps) => {
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

  // DEV TEMP
  const phrases = [
    { title: `hi`, phrase: `Hi there!` },
    { title: `greet`, phrase: `Hi! I am Alex!` },
    { title: `about`, phrase: `Tell me about you.` },
    { title: `descr`, phrase: `Could you describe yourself?` },
    { title: `pets`, phrase: `Cats or dogs?` },
    { title: `drinks`, phrase: `Coffee or tea?` },
    { title: `sleep`, phrase: `Early bird or night owl?` },
    { title: `dream`, phrase: `What are your dreams?` },
    { title: `cook`, phrase: `What is your favorite thing to cook?` },
    { title: `wish`, phrase: `What hidden talent do you wish you had?` },
    { title: `wkend`, phrase: `What is your favorite way to spend a weekend?` },
    { title: `color`, phrase: `What does your favorite color feel like?` },
    { title: `show`, phrase: `What's the best concert you've ever been to?` },
    { title: `wkend`, phrase: `What's your favorite way to spend a weekend?` },
    { title: `peeve`, phrase: `What's your biggest pet peeve?` },
    {
      title: `advice`,
      phrase: `What's the best piece of advice you've ever gotten?`,
    },
    { title: `binge`, phrase: `What are you currently binge-watching?` },
    { title: `ost`, phrase: `What's your favorite movie soundtrack?` },
    { title: `grate`, phrase: `What are you most grateful for?` },
    { title: `game`, phrase: `What's your favorite board game?` },
    { title: `cause`, phrase: `What's a cause you're passionate about?` },
    {
      title: `secret`,
      phrase: `What is something you've never told anyone else?`,
    },
    {
      title: `alive`,
      phrase: `What makes you feel truly alive and engaged with the world?`,
    },
    { title: `fear`, phrase: `What is your greatest fear?` },
  ];

  return (
    <div className="chat-input chat-container">
      {/* DEV TEMP */}
      <div className="fixed w-64 z-50 left-4 bottom-4 flex flex-wrap gap-1">
        <div className="mb-3 w-full flex gap-1">
          <Button
            onClick={form.handleSubmit(handleSubmit)}
            size="sm"
            variant="default"
            key={21}
          >
            GO
          </Button>
          <Button
            onClick={() => form.setValue('message', '')}
            size="sm"
            variant="outline"
            key={20}
          >
            RESET
          </Button>
        </div>

        {phrases.map((p, index) => (
          <div key={index} title={p.phrase}>
            <Button
              className="px-3"
              onClick={() => form.setValue('message', p.phrase)}
              size="sm"
              variant="secondary"
            >
              {p.title}
            </Button>
          </div>
        ))}
      </div>

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
                    className="rounded-3xl p-6 bg-card transition-colors duration-300"
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
