'use client';

type TLoadingProps = {
  size?: number;
  thickness?: number;
  className?: string;
};

const Loading = ({ size = 24, thickness = 3 }: TLoadingProps) => {
  return (
    <div
      className="border-accent border-t-transparent rounded-full animate-spin"
      style={{ width: size, height: size, borderWidth: thickness }}
    />
  );
};

export default Loading;
