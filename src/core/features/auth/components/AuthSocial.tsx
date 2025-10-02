'use client';

import Postmate from 'postmate';
import { useEffect, useRef, useState } from 'react';

import Loading from '@/core/components/ui/Loading';
import { APP_ID, AUTH_URL } from '@/core/constants';
import { Credentials, SocialProvider } from '@/core/features/auth/types';
import { cn } from '@/core/utils';

interface LoginPayload {
  email: string;
  password: string;
}

// Extend PostmateOptions to include `parent`
interface ExtendedPostmateOptions extends Postmate.PostmateOptions {
  parent?: {
    onLogin: (data: LoginPayload) => void;
  };
}

export interface AuthSocialProps {
  socialProvider: SocialProvider;
  onSubmit: (credentials: Credentials) => void;
  onError: (message: string) => void;
}

export default function AuthSocial({
  socialProvider,
  onSubmit,
  onError,
}: AuthSocialProps) {
  const [isReady, setIsReady] = useState(false);

  const iframeRef = useRef<HTMLDivElement>(null);
  const childRef = useRef<Postmate.ParentAPI | null>(null);

  // const handleUpdateProvider = (socialProvider: SocialProvider) => {
  //   if (!childRef.current) return;
  //   childRef.current.call('setConfig', {
  //     appId: APP_ID,
  //     socialProvider,
  //   });
  // };

  useEffect(() => {
    const initiatePostmate = async () => {
      try {
        const child = await new Postmate({
          container: iframeRef.current!,
          url: AUTH_URL,
          model: {},
        } as ExtendedPostmateOptions);
        // console.log('[Postmate parent]: Connected to child');

        childRef.current = child;

        // Listen for child's emit calls:
        child.on('onLogin', (credentials: Credentials) => {
          // console.log('[Postmate parent] Child emitted onLogin:', credentials);

          if (!credentials.email || !credentials.password) {
            onError('Invalid email or password');
            return;
          }

          onSubmit(credentials);
        });

        child.on('ready', () => {
          setIsReady(true);
          child.call('setConfig', {
            appId: APP_ID,
            socialProvider,
          });
        });
      } catch (err: unknown) {
        console.error('[Postmate parent] Handshake failed:', err);
      }
    };

    initiatePostmate();
  }, [onError, onSubmit, socialProvider]);

  return (
    <div className="relative size-full">
      <div
        className={cn(
          'absolute inset-0 z-10 trans-o flex-center',
          isReady ? 'opacity-0 pointer-events-none' : 'opacity-100'
        )}
      >
        <Loading />
      </div>
      <div
        ref={iframeRef}
        id="ms-container"
        className={cn(
          'relative trans-o',
          isReady ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      />
    </div>
  );
}
