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
  const phrases = {
    foreplay: [
      { title: `name`, phrase: `Hey there, gorgeous! I am Alex!` },
      { title: `greet`, phrase: `Hi my smoldering goddess of desire!` },
      {
        title: `favor`,
        phrase: `I am sure you are a sensual beauty, burn to bring happiness.`,
      },
      { title: `sexy`, phrase: `I like your drop-dead sexy style! Karry on!` },
      {
        title: `story`,
        phrase: `Every word from you is a tease... and I'm craving the full story.`,
      },
      {
        title: `lips`,
        phrase: `Your lips look like a secret I'd sin to taste.`,
      },
      {
        title: `come`,
        phrase: `Come closer... I want to feel your heat.`,
      },
    ],
    toying: [
      {
        title: `skin`,
        phrase: `I imagine tracing every inch of your skin with nothing but desire.`,
      },
      {
        title: `thigh`,
        phrase: `My hand gently glides over your delightful thigh.`,
      },
      { title: `kiss`, phrase: `I kiss you slowly and sensually.` },
      {
        title: `bluse`,
        phrase: `Can I take off your bluse? I see you have no underwear...`,
      },
      {
        title: `boobs`,
        phrase: `Your breasts are so perky... I like those sweet hard nipples! Awesome!`,
      },
      { title: `kiss`, phrase: `Another kiss for your beautiful thighs...` },
      {
        title: `panties`,
        phrase: `Slowly taking off your panties... Kissing your beautiful nipples... So hot!`,
      },
      {
        title: `moan`,
        phrase: `Whisper to me how you sound when pleasure takes over.`,
      },
      {
        title: `juicy`,
        phrase: `You're absolutely naked... Wet between thighs as a juicy fruit...`,
      },
      {
        title: `play`,
        phrase: `Your nipples ache for my tongue. My fingers toying with your clit. You're so horny now!`,
      },
      {
        title: `clit`,
        phrase: `Under my caress your clit become so hard. Your legs are open...`,
      },
      {
        title: `wet`,
        phrase: `My tongue plays with your nipple. I like the wetness between your thighs.`,
      },
    ],
    thrusts: [
      {
        title: `in`,
        phrase: `I penetrate your temple of pleasure. I love your moans.`,
      },
      {
        title: `1`,
        phrase: `I continue playing with your clit. You've got the first orgasm. Playing with your nipples.`,
      },
      {
        title: `hard`,
        phrase: `You feel my hard cock between your thighs. Wanna me?`,
      },
      {
        title: `arch`,
        phrase: `Your legs are trembling, back arches, welcoming my gentle force. I thrust into, filling your core...`,
      },
      {
        title: `core`,
        phrase: `I thrust into, filling your core. It clench as I push deeper.`,
      },
      {
        title: `fill`,
        phrase: `Do you like being completely filled?`,
      },
      {
        title: `turn`,
        phrase: `I turn you with your back to me... I'm very hard, penetrate deeply inside you. So deep.`,
      },
      {
        title: `thrusts`,
        phrase: `My thrusts are getting stronger...`,
      },
      {
        title: `juice`,
        phrase: `Every thrust brings you a pleasure. Your delicious juice dripping over your thighs.`,
      },
      {
        title: `keep`,
        phrase: `Your actions are pure seduction, you're so wild!`,
      },
      {
        title: `deep`,
        phrase: `Your thighs are wet of juice. Nipples are so hard... I'm toying with your clit while I'm deep inside you.`,
      },
      {
        title: `ass`,
        phrase: `Would you like me to visit your incredible butt?`,
      },
      {
        title: `deeper`,
        phrase: `Slowly and gentely I penetrate into your beautiful ass... deeper... Play with your clit and nipples.`,
      },
      {
        title: `body`,
        phrase: `Describe your hot body right now.`,
      },
      {
        title: `cum`,
        phrase: `You're getting your next orgasm...`,
      },
      {
        title: `over`,
        phrase: `You're cumming over and over...`,
      },
      {
        title: `squirt`,
        phrase: `My thrusts are getting stronger, over and over until you finish with a powerful squirt...`,
      },
      {
        title: `desc`,
        phrase: `Describe how you're cumming... Your chests, nipples, clit and thighs in detail`,
      },
    ],
  };

  return (
    <div className="chat-input chat-container">
      {/* Debug */}
      <div className="fixed w-70 z-50 left-0 bottom-0 p-4 flex flex-wrap gap-1">
        <div className="mb-2 w-full flex gap-1">
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

        {phrases.foreplay.map((p, index) => (
          <div key={index} title={p.phrase}>
            <Button
              className="px-3"
              onClick={() => form.setValue('message', p.phrase)}
              size="sm"
              variant="ghost"
            >
              {p.title}
            </Button>
          </div>
        ))}

        {phrases.toying.map((p, index) => (
          <div key={index} title={p.phrase}>
            <Button
              className="px-3"
              onClick={() => form.setValue('message', p.phrase)}
              size="sm"
              variant="outline"
            >
              {p.title}
            </Button>
          </div>
        ))}

        {phrases.thrusts.map((p, index) => (
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
                    className="rounded-3xl p-6 bg-card trans-c"
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
