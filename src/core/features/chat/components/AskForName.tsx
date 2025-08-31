'use client';

import { useState } from 'react';

import { Button } from '@/core/components/ui/Button';
import Avatar from '@/core/features/chat/components/Avatar';
import { AvatarKey } from '@/core/features/chat/types/person';
import { generateNameRecoveryQuestion } from '@/core/features/chat/utils/chat';

interface AskForNameProps {
  allowToShow: boolean;
  probablyName: string | null;
  personData: {
    name: string;
    avatarKey: string;
    avatarBlur: string;
  };
  onAccept: () => void;
  onDecline: () => void;
}

const AskForName = ({
  allowToShow,
  probablyName,
  personData,
  onAccept,
  onDecline,
}: AskForNameProps) => {
  const [stateKey, setStateKey] = useState<'prompt' | 'message'>('prompt');
  const [isFadeOut, setIsFadeOut] = useState(false);

  const handleBtnClick = (isAccepted: boolean) => {
    if (isAccepted) {
      onAccept();
    } else {
      onDecline();
    }
    setStateKey('message');
    setTimeout(() => {
      setIsFadeOut(true);
    }, 3000);
  };

  if (!allowToShow || !probablyName) return null;

  return (
    <div
      data-fade-out={isFadeOut && 'true'}
      className="fade--delayed relative z-10 mb-8 w-full flex-center pl-4 data-[fade-out=true]:opacity-0 trans-o"
    >
      {stateKey === 'prompt' && (
        <div className="fade flex-center flex-col gap-4">
          <div className="chat-message flex pl-11.5 pr-4">
            <Avatar
              avatarKey={personData.avatarKey as AvatarKey}
              avatarBlur={personData.avatarBlur}
            />
            <div className="chat-message_content rounded-l-3xl! bg-card/90">
              {generateNameRecoveryQuestion(probablyName)}
            </div>
          </div>
          <div className="flex gap-4">
            <Button
              className="px-8"
              variant="default"
              // size="lg"
              onClick={() => handleBtnClick(true)}
            >
              {`That's me`}
            </Button>
            <Button
              className="min-w-20"
              variant="default"
              // size="lg"
              onClick={() => handleBtnClick(false)}
            >
              Nope
            </Button>
          </div>
        </div>
      )}
      {stateKey === 'message' && (
        <div className="fade flex-center flex-col gap-4">
          <div className="chat-message flex pl-11.5 pr-4">
            <Avatar
              avatarKey={personData.avatarKey as AvatarKey}
              avatarBlur={personData.avatarBlur}
              emotion={'smiling'}
            />
            <div className="chat-message_content rounded-l-3xl! bg-card/90">
              Much appreciated!
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AskForName;
