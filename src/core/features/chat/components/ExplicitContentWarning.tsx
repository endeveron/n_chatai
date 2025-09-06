'use client';

type WarningPurpose = 'signup' | 'chat';

const MESSAGES: Record<WarningPurpose, string> = {
  signup: `By creating an account, you confirm you're at least 18 (or the age of majority in your area) and consent to view sexually explicit content, including images and messages.`,
  chat: `The chat conversation may contain age-restricted photos and messages with explicit sexual content. By creating a chat, you affirm that you are at least 18 years of age or the age of majority in the jurisdiction you are accessing the website from and you consent to view and receive content of a sexually explicit nature, including images and messages.`,
};

interface ExplicitContentWarningProps {
  purpose: WarningPurpose;
}

const ExplicitContentWarning = ({ purpose }: ExplicitContentWarningProps) => {
  return (
    <div className="flex items-center justify-center flex-col p-4 gap-4 rounded-xl border-2 border-accent/30 bg-accent/10 cursor-default">
      <div className="w-24 h-8 shrink-0 flex-center text-5xl text-accent font-black leading-0">
        18+
      </div>
      <div className="text-sm">{MESSAGES[purpose]}</div>
    </div>
  );
};

export default ExplicitContentWarning;
