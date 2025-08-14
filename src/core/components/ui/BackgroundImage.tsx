'use client';

import Image from 'next/image';

import AnimatedAppear from '@/core/components/ui/AnimatedAppear';

const imgPlaceholder =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAAGAAoDAREAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAABAn/xAAdEAABBQEAAwAAAAAAAAAAAAAEAQIDBQYHCRIT/8QAFwEAAwEAAAAAAAAAAAAAAAAABAUICf/EACERAAMAAgIBBQEAAAAAAAAAAAECAwQRBRITAAYUITFB/9oADAMBAAIRAxEAPwCUPOehcs4tX3eizwe7ya4ys0+xrxMHNYULQbg54uSdIFPWdFpCHuLCqzwbclZRZj6w9gyowcUcOKf89eRzMrHS/JeV3VZWrbDhZ6yTHnleMncyo7XUqysvRgx6N/dI/aZ4dUeHD8YvHgVNIJNvjxjkXy8jB84nHurEzwSlEI7Un418yn7QgflOIQMRCKTsRJCDQJOTD3jpAEJEyRMSWeIFNSWgUcr/AGkYIhZSDNckKEToz6uNHt2JAIymUEAgfDxzoH71ssCdfm9ffpnT3HzEqPJpwo03aZc5uWpcoSpcr4jrsRvWzretn99f/9k=';

const BackgroundImage = () => {
  return (
    <AnimatedAppear className="fixed inset-0">
      <div className="relative h-full">
        <Image
          src="/images/bg.jpg"
          alt="background"
          className="object-cover dark:opacity-25 "
          fill
          priority
          quality={100}
          unoptimized
          placeholder="blur"
          blurDataURL={imgPlaceholder}
        />
      </div>
    </AnimatedAppear>
  );
};

export default BackgroundImage;
