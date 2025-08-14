'use client';

import AnimatedAppear from '@/core/components/ui/AnimatedAppear';
import SignInButton from '@/core/features/auth/components/SigninButton';

const WelcomeClient = () => {
  return (
    <div className="relative h-dvh flex flex-1 flex-col flex-center">
      {/* <BackgroundImage /> */}

      <div className="py-8 relative flex-center flex-1 flex-col cursor-default z-20">
        {/* Title */}
        <AnimatedAppear>
          <h1 className="text-6xl text-title font-black">Welcome!</h1>
        </AnimatedAppear>

        {/* Signin Button */}
        <AnimatedAppear className="flex-center mt-12" delay={400}>
          <SignInButton variant="accent" title="Sign In" className="w-40" />
        </AnimatedAppear>
      </div>
    </div>
  );
};

export default WelcomeClient;
