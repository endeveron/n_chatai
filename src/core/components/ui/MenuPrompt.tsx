'use client';

import { AcceptIcon } from '@/core/components/icons/AcceptIcon';
import { DeclineIcon } from '@/core/components/icons/DeclineIcon';
import Loading from '@/core/components/ui/Loading';

interface MenuPromptProps {
  loading: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

const MenuPrompt = ({ loading, onAccept, onDecline }: MenuPromptProps) => {
  const handlePrompt = (accept: boolean) => {
    if (accept) {
      onAccept();
    } else {
      onDecline();
    }
  };

  return (
    <div className="h-5 w-full max-w-20 mx-auto flex-center gap-10">
      {loading ? (
        <div className="scale-75">
          <Loading />
        </div>
      ) : (
        <>
          <div
            onClick={() => handlePrompt(true)}
            className="icon--action scale-75"
            title="Accept"
          >
            <AcceptIcon />
          </div>
          <div
            onClick={() => handlePrompt(false)}
            className="icon--action scale-75"
            title="Decline"
          >
            <DeclineIcon />
          </div>
        </>
      )}
    </div>
  );
};

export default MenuPrompt;
