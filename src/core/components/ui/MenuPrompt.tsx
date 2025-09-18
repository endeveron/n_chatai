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
  return (
    <div className="h-4 flex-center mx-auto">
      {loading ? (
        <div className="scale-75">
          <Loading />
        </div>
      ) : (
        <div className="flex items-center gap-8">
          <div onClick={onAccept} className="icon--action">
            <AcceptIcon />
          </div>
          <div onClick={onDecline} className="icon--action">
            <DeclineIcon />
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuPrompt;
