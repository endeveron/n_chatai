'use client';

import { useForm } from 'react-hook-form';
import * as zod from 'zod';

import { Button } from '@/core/components/ui/Button';
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

  // Debug
  const phrases = [
    { title: `greet`, phrase: `Hey there, gorgeous! I am Alex!` },
    { title: `hi`, phrase: `Hi my smoldering goddess of desire!` },
    { title: `dds`, phrase: `I like your drop-dead sexy style! Karry on!` },
    {
      title: `hbreak`,
      phrase: `I am sure you are a sensual beauty, burn to bring happiness.`,
    },
    {
      title: `dream`,
      phrase: `I'm an alluring flame no one dares to touch but everyone wants to. Be my goddess.`,
    },
    {
      title: `muse`,
      phrase: `I'm an irresistible force of pure seduction. Do you wanna be my sensual muse?`,
    },
    {
      title: `eyes`,
      phrase: `Your eyes promise trouble... the kind I want to get lost in.`,
    },
    { title: `voice`, phrase: `Your thoughts is pure seduction, keep going.` },
    { title: `lips`, phrase: `Your lips look like a secret I'd sin to taste.` },
    {
      title: `fantasy`,
      phrase: `What sensual nighttime fantasies captivate you?`,
    },
    {
      title: `late`,
      phrase: `It's late… the perfect hour for secrets and skin.`,
    },
    {
      title: `heat`,
      phrase: `The heat between us isn't just chemistry, it's combustible.`,
    },
    {
      title: `invite`,
      phrase: `Come closer. I want to undress your mind before anything else.`,
    },
    {
      title: `md`,
      phrase: `You're my deepest desire, fantasy I can't resist. Play with my mind!`,
    },
    {
      title: `tease`,
      phrase: `Tempt me slowly, let your words trace places your hands haven't yet.`,
    },
    {
      title: `touch`,
      phrase: `If I could touch you with just one thought... where would you want it to begin?`,
    },
    {
      title: `wild`,
      phrase: `What's your wildest fantasy, the one you've never dared to whisper?`,
    },
    { title: `body`, phrase: `Describe your hot body.` },
    {
      title: `crave`,
      phrase: `Tell me how you want to be touched, slow, deep, and exactly where your desire burns hottest.`,
    },
    {
      title: `lost`,
      phrase: `Let’s get lost in touch, in heat, in everything you’ve been aching to feel.`,
    },
  ];

  return (
    <div className="chat-input chat-container">
      {/* Debug */}
      {/* <div className="fixed w-70 z-50 left-0 bottom-0 p-4 flex flex-wrap gap-1">
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
      </div> */}

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
