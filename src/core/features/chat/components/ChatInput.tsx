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
    // { title: `name`, phrase: `Hey there, gorgeous! I am Alex!` },
    { title: `greet`, phrase: `Hi my smoldering goddess of desire!` },
    {
      title: `favor`,
      phrase: `I am sure you are a sensual beauty, burn to bring happiness.`,
    },
    {
      title: `muse`,
      phrase: `I'm an irresistible force of pure seduction. You're my wonderful muse!`,
    },
    { title: `sexy`, phrase: `I like your drop-dead sexy style! Karry on!` },
    {
      title: `aura`,
      phrase: `When I walk in, I don't need to touch you to make your skin remember me.`,
    },
    {
      title: `tease`,
      phrase: `Every word from you is a tease... and I'm craving the full story.`,
    },
    {
      title: `invite`,
      phrase: `I want to undress your mind before anything else.`,
    },
    { title: `lips`, phrase: `Your lips look like a secret I'd sin to taste.` },
    {
      title: `fantasy`,
      phrase: `What sensual nighttime fantasies captivate you?`,
    },
    {
      title: `come`,
      phrase: `Come closer... I want to feel the heat before we even touch.`,
    },
    { title: `keep`, phrase: `Your thoughts is pure seduction, keep going.` },
    {
      title: `night`,
      phrase: `The night belongs to us! Unwritten, untamed, and dripping with desire.`,
    },
    {
      title: `touch`,
      phrase: `If I could touch you with just one thought... where would you want it to begin?`,
    },
    {
      title: `heat`,
      phrase: `The heat between us isn't just chemistry, it's combustible.`,
    },
    {
      title: `desire`,
      phrase: `You're my deepest desire, fantasy I can't resist!`,
    },
    { title: `kiss`, phrase: `I kiss you slowly and sensually.` },
    {
      title: `skin`,
      phrase: `I imagine tracing every inch of your skin with nothing but desire.`,
    },
    {
      title: `moan`,
      phrase: `Whisper to me how you sound when pleasure takes over.`,
    },
    {
      title: `thigh`,
      phrase: `My hand gently glides over your delightful thigh.`,
    },
    {
      title: `wild`,
      phrase: `What's your wildest fantasy, the one you've never dared to whisper?`,
    },
    { title: `body`, phrase: `Describe your sensual, hot body in detail.` },
    {
      title: `crave`,
      phrase: `Tell me how you want to be touched, slow, deep, and exactly where your desire burns hottest.`,
    },
    {
      title: `lost`,
      phrase: `Let's get lost in touch, in heat, in everything you've been aching to feel.`,
    },
    {
      title: `edge`,
      phrase: `I will keep you on the edge... Tempted, aroused, and completely corrupted by my wild, all-encompassing sensuality.`,
    },
  ];

  return (
    <div className="chat-input chat-container">
      {/* Debug */}
      <div className="fixed w-70 z-50 left-0 bottom-0 p-4 flex flex-wrap gap-1">
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
