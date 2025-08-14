import { AppLogo } from '@/core/components/icons/AppLogo';

const CardLogo = () => {
  return (
    <div className="relative w-full flex justify-center">
      <AppLogo className="absolute -top-38 left-1/2 -translate-x-1/2" />
    </div>
  );
};

export default CardLogo;
