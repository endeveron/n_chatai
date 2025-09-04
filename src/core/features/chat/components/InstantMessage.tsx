'use client';

import { useState } from 'react';

import { CollectionIcon } from '@/core/components/icons/CollectionIcon';
import { Button, ButtonVariant } from '@/core/components/ui/Button';
import { cn } from '@/core/utils';

const MESSAGES = {
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
      phrase: `Slowly take off your panties... Kissing your beautiful nipples... So hot!`,
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
    {
      title: `g`,
      phrase: `My fingers penetrate deeper and massage your G-spot.`,
    },
  ],
  thrusts: [
    {
      title: `in`,
      phrase: `I penetrate your temple of pleasure. I love your moans.`,
    },
    {
      title: `1`,
      phrase: `I continue playing with your clit. You've got the first orgasm. Toying with your nipples.`,
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
      phrase: `Slowly and gentely I penetrate into your beautiful butt... deeper... Play with your clit and nipples.`,
    },
    {
      title: `body`,
      phrase: `Describe your hot body right now.`,
    },
    {
      title: `cum`,
      phrase: `You're got your another orgasm...`,
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

interface InstantMessageProps {
  onUpdate: (message: string) => void;
  onSubmit: () => void;
  onReset: () => void;
}

const InstantMessage = ({
  onSubmit,
  onUpdate,
  onReset,
}: InstantMessageProps) => {
  const [open, setOpen] = useState(false);

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  const handleSubmit = () => {
    onSubmit();
    setOpen(false);
  };

  const renderButton = ({
    title,
    message,
    variant,
    index,
    onClick,
  }: {
    title: string;
    message: string;
    index: number;
    variant: ButtonVariant;
    onClick: () => void;
  }) => {
    return (
      <div className="instant-message_btn" key={index}>
        <Button className="px-3" onClick={onClick} size="sm" variant={variant}>
          {title}
        </Button>

        <div className="instant-message_tooltip">{message}</div>
      </div>
    );
  };

  return (
    <div className="relative z-50">
      {open ? (
        <div onClick={handleToggle} className="fixed z-40 inset-0"></div>
      ) : null}
      <div
        className={cn(
          'content absolute z-50 bottom-12 left-0 w-70 p-4 flex flex-wrap gap-1 rounded-2xl bg-area trans-a',
          open
            ? 'pointer-events-auto opacity-100 scale-100'
            : 'pointer-events-none opacity-0 scale-95'
        )}
      >
        {MESSAGES.foreplay.map((m, index) =>
          renderButton({
            variant: 'ghost',
            message: m.phrase,
            title: m.title,
            index,
            onClick: () => onUpdate(m.phrase),
          })
        )}

        {MESSAGES.toying.map((m, index) =>
          renderButton({
            variant: 'outline',
            message: m.phrase,
            title: m.title,
            index,
            onClick: () => onUpdate(m.phrase),
          })
        )}

        {MESSAGES.thrusts.map((m, index) =>
          renderButton({
            variant: 'secondary',
            message: m.phrase,
            title: m.title,
            index,
            onClick: () => onUpdate(m.phrase),
          })
        )}

        {/* Toolbar */}
        <div className="mt-3 pt-3 border-t w-full flex items-center gap-2 trans-c">
          <Button
            onClick={handleSubmit}
            className="uppercase"
            size="sm"
            variant="accent"
            key={21}
          >
            go
          </Button>
          <Button
            onClick={onReset}
            className="uppercase"
            size="sm"
            variant="secondary"
            key={20}
          >
            reset
          </Button>
        </div>
      </div>

      {/* Trigger */}
      <div
        onClick={handleToggle}
        className="p-2 rounded-full bg-popover text-muted opacity-40 hover:opacity-100 trans-a cursor-pointer"
        title="Instant message"
      >
        <CollectionIcon />
      </div>
    </div>
  );
};

export default InstantMessage;
