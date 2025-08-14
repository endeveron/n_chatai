'use client';

import { useEffect, useState } from 'react';

type ScreenSizeAlertProps = {
  portrait?: [number, number]; // [minWidth, minHeight]
  landscape?: [number, number]; // [minWidth, minHeight]
};

const ScreenSizeAlert = ({
  portrait = [410, 650],
  landscape = [640, 500],
}: ScreenSizeAlertProps) => {
  const [isSmall, setIsSmall] = useState(false);

  useEffect(() => {
    const checkSize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const isPortrait = h >= w;

      const [minW, minH] = isPortrait ? portrait : landscape;

      const tooSmall = w < minW || h < minH;

      setIsSmall(tooSmall);
    };

    checkSize();
    window.addEventListener('resize', checkSize);

    return () => {
      window.removeEventListener('resize', checkSize);
    };
  }, [portrait, landscape]);

  if (!isSmall) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-2xl z-40  cursor-default">
      <div className="max-w-96 flex-center flex-col gap-4 p-8 rounded-xl bg-card">
        <h3 className="title text-3xl">Small screen</h3>
        <div className="space-y-2 text-sm leading-relaxed text-center">
          <p>
            Try turning the device or switching to
            <br />a larger device for a better experience
          </p>
          {/* {window.innerWidth} x {window.innerHeight} */}
        </div>
      </div>
    </div>
  );
};

export default ScreenSizeAlert;
