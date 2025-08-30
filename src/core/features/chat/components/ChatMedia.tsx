'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { CloseIcon } from '@/core/components/icons/CloseIcon';
import { Button } from '@/core/components/ui/Button';
import {
  CHAT_MEDIA_MIN_KEY,
  HEAT_PHOTO_STEP,
  heatPhotoMap,
  MAX_HEAT_LEVEL,
} from '@/core/features/chat/constants';
import { AvatarKey, CollectionMap } from '@/core/features/chat/types/person';
import { useLocalStorage } from '@/core/hooks/useLocalStorage';
import { cn } from '@/core/utils';

const SIDE_IMAGE_FADEIN_DELAY = 100;

interface TransitionState {
  phase: 'idle' | 'fadeOut' | 'fadeIn';
  previousSources: string[];
  newSources: string[];
  sideImagePhases: {
    left: 'waiting' | 'fadeIn' | 'visible';
    right: 'waiting' | 'fadeIn' | 'visible';
  };
}

interface ChatMediaProps {
  heatLevel: number;
  avatarKey: AvatarKey;
}

const ChatMedia = ({ heatLevel, avatarKey }: ChatMediaProps) => {
  const [getItemFromLS, setItemInLS, removeItemFromLS] = useLocalStorage();

  // const [avalCollections, setAvalCollections] = useState<string[]>([]);
  // const [curCollections, setCurCollections] = useState<(keyof CollectionMap)[]>(
  //   ['base']
  // );
  const [avalImages, setAvalImages] = useState<
    { index: number; collectionName: keyof CollectionMap }[]
  >([]);
  const [displayStartIndex, setDisplayStartIndex] = useState<number>(0);
  const [prevAvalImagesLength, setPrevAvalImagesLength] = useState<number>(0);

  const [active, setActive] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [imgSrcArr, setImgSrcArr] = useState<string[]>([]);
  const [transitionState, setTransitionState] = useState<TransitionState>({
    phase: 'idle',
    previousSources: [],
    newSources: [],
    sideImagePhases: {
      left: 'visible',
      right: 'visible',
    },
  });

  const personPhotoData = useMemo((): {
    collections: CollectionMap;
    collectionNames: (keyof CollectionMap)[];
  } => {
    const collections = heatPhotoMap.get(avatarKey) as CollectionMap;
    const collectionNames = collections
      ? (Object.keys(collections) as (keyof CollectionMap)[])
      : [];

    return {
      collections,
      collectionNames,
    };
  }, [avatarKey]);

  const heatIndex = useMemo(() => {
    return Math.max(heatLevel - MAX_HEAT_LEVEL, 1);
  }, [heatLevel]);

  // const getCollectionNames = (
  //   avatarKey: AvatarKey
  // ): (keyof CollectionMap)[] => {
  //   const collections = heatPhotoMap.get(avatarKey);
  //   return collections
  //     ? (Object.keys(collections) as (keyof CollectionMap)[])
  //     : [];
  // };

  const toggleExpanded = () => {
    setExpanded((prev) => !prev);
  };

  const toggleMinimized = () => {
    const value = !minimized;
    const key = `${CHAT_MEDIA_MIN_KEY}_${avatarKey}`;
    if (value) {
      setItemInLS(key, value);
    } else {
      removeItemFromLS(key);
    }
    setMinimized(value);
  };

  useEffect(() => {
    const itemInLS = getItemFromLS<boolean>(
      `${CHAT_MEDIA_MIN_KEY}_${avatarKey}`
    );
    if (itemInLS) {
      setMinimized(true);
    }
  }, [avatarKey, getItemFromLS]);

  const imgSrcArrLength = useMemo(() => {
    return imgSrcArr.length;
  }, [imgSrcArr.length]);

  useEffect(() => {
    if (heatLevel <= MAX_HEAT_LEVEL) return;

    const timeout = setTimeout(() => {
      setActive(true);
    }, 2000);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [heatLevel]);

  // Helper to determine which collections should be available based on heatIndex
  const getAvailableCollections = useCallback(
    (heatIndex: number): (keyof CollectionMap)[] => {
      const collections = personPhotoData.collectionNames;
      const availableCollections: (keyof CollectionMap)[] = ['base'];

      let currentCapacity =
        personPhotoData.collections['base']?.totalPhotos || 0;
      let collectionIndex = 1;

      // Unlock additional collections as heatIndex grows
      while (
        heatIndex > currentCapacity * HEAT_PHOTO_STEP &&
        collectionIndex < collections.length
      ) {
        const nextCollection = collections[collectionIndex];
        availableCollections.push(nextCollection);
        currentCapacity +=
          personPhotoData.collections[nextCollection].totalPhotos;
        collectionIndex++;
      }

      return availableCollections;
    },
    [personPhotoData]
  );

  // Helper to get total images from available collections only
  const getTotalAvailableImages = useCallback(
    (availableCollections: (keyof CollectionMap)[]): number => {
      return availableCollections.reduce((total, collectionName) => {
        return total + personPhotoData.collections[collectionName].totalPhotos;
      }, 0);
    },
    [personPhotoData]
  );

  // Helper to configure image indexes array
  const getImageIndexes = useCallback(
    (index: number): number[] => {
      const availableCollections = getAvailableCollections(index);
      const totalAvailableImages =
        getTotalAvailableImages(availableCollections);

      // Calculate which step we're at within available images
      const step = Math.ceil(index / HEAT_PHOTO_STEP);

      if (step === 1) return [1];
      if (step === 2) return [2, 1];

      // For step 3 and beyond, return 3 consecutive numbers
      const maxIndex = Math.min(step, totalAvailableImages);
      return [maxIndex, maxIndex - 1, maxIndex - 2].filter((i) => i > 0);
    },
    [getAvailableCollections, getTotalAvailableImages]
  );

  // Helper to generate all available images from collections
  // const generateAvailableImages = useCallback(
  //   (
  //     availableCollections: (keyof CollectionMap)[]
  //   ): { index: number; collectionName: keyof CollectionMap }[] => {
  //     const images: { index: number; collectionName: keyof CollectionMap }[] =
  //       [];
  //     let globalIndex = 1;

  //     availableCollections.forEach((collectionName) => {
  //       const totalPhotos =
  //         personPhotoData.collections[collectionName].totalPhotos;
  //       for (let i = 1; i <= totalPhotos; i++) {
  //         images.push({
  //           index: globalIndex,
  //           collectionName,
  //         });
  //         globalIndex++;
  //       }
  //     });

  //     return images;
  //   },
  //   [personPhotoData]
  // );
  const generateAvailableImages = useCallback(
    (
      availableCollections: (keyof CollectionMap)[],
      maxAccessIndex: number
    ): { index: number; collectionName: keyof CollectionMap }[] => {
      const images: { index: number; collectionName: keyof CollectionMap }[] =
        [];
      let globalIndex = 1;

      for (const collectionName of availableCollections) {
        const totalPhotos =
          personPhotoData.collections[collectionName].totalPhotos;

        for (let i = 1; i <= totalPhotos; i++) {
          if (globalIndex <= maxAccessIndex) {
            images.push({
              index: globalIndex,
              collectionName,
            });
            globalIndex++;
          } else {
            return images; // Stop when we reach the access level limit
          }
        }
      }

      return images;
    },
    [personPhotoData]
  );

  // Helper to get collection name and local index for a global image index
  const getImageCollectionInfo = useCallback(
    (
      globalIndex: number,
      availableImages: { index: number; collectionName: keyof CollectionMap }[]
    ): { collectionName: keyof CollectionMap; localIndex: number } | null => {
      const imageInfo = availableImages.find(
        (img) => img.index === globalIndex
      );
      if (!imageInfo) return null;

      // Calculate local index within the collection by counting images in the same collection before this one
      const localIndex = availableImages.filter(
        (img) =>
          img.collectionName === imageInfo.collectionName &&
          img.index <= globalIndex
      ).length;

      return { collectionName: imageInfo.collectionName, localIndex };
    },
    []
  );

  // Helper to generate image src
  const generateImgSrc = useCallback(
    (
      imgIndex: number,
      availableImages: { index: number; collectionName: keyof CollectionMap }[]
    ): string => {
      const collectionInfo = getImageCollectionInfo(imgIndex, availableImages);

      if (!collectionInfo) {
        console.warn(
          `[generateImgSrc] No collection info found for index ${imgIndex}`
        );
        return '';
      }

      const { collectionName, localIndex } = collectionInfo;
      return `/images/people/${avatarKey}/heat/${collectionName}/${localIndex}.jpg`;
    },
    [avatarKey, getImageCollectionInfo]
  );

  const curImageSet = useMemo(() => {
    if (avalImages.length === 0) return [];

    const maxAccessIndex = avalImages[avalImages.length - 1]?.index || 1;
    const imgIndexes = getImageIndexes(heatIndex);
    const setSize = imgIndexes.length;

    // Calculate the starting index for current display
    // If displayStartIndex is 0, start from maxAccessIndex
    // Otherwise, offset backwards by displayStartIndex
    const startIndex = maxAccessIndex - displayStartIndex;

    // Generate consecutive indexes backwards from startIndex
    const displayIndexes = [];
    for (let i = 0; i < setSize; i++) {
      const idx = startIndex - i;
      if (idx >= 1) displayIndexes.push(idx);
    }

    return displayIndexes
      .map((idx) => ({
        globalIndex: idx,
        imageSrc: generateImgSrc(idx, avalImages),
        imageInfo: avalImages.find((img) => img.index === idx),
      }))
      .filter((item) => item.imageInfo);
  }, [
    avalImages,
    getImageIndexes,
    heatIndex,
    displayStartIndex,
    generateImgSrc,
  ]);

  // Navigate to previous set of images
  const handlePrev = useCallback(() => {
    if (avalImages.length === 0) return;

    // Remove the lock logic - just navigate
    const maxAccessIndex = avalImages[avalImages.length - 1]?.index || 1;

    setDisplayStartIndex((prevIndex) => {
      const newIndex = prevIndex + 1;
      const maxStartIndex = maxAccessIndex - 1;
      return Math.min(newIndex, maxStartIndex);
    });
  }, [avalImages]);

  // Navigate to next set of images
  const handleNext = useCallback(() => {
    if (avalImages.length === 0) return;

    setDisplayStartIndex((prevIndex) => Math.max(0, prevIndex - 1));
  }, [avalImages]);

  // Check if navigation is possible
  const canGoNext = useMemo(() => {
    return displayStartIndex > 0;
  }, [displayStartIndex]);

  const canGoPrev = useMemo(() => {
    if (avalImages.length < 4 || imgSrcArr.length < 3) return false;
    const maxAccessIndex = avalImages[avalImages.length - 1]?.index || 1;
    return displayStartIndex < maxAccessIndex - 1;
  }, [avalImages, displayStartIndex, imgSrcArr.length]);

  // Reset display when available images change
  useEffect(() => {
    if (avalImages.length === 0) {
      setDisplayStartIndex(0);
      setPrevAvalImagesLength(0);
      return;
    }

    // If this is the first time setting avalImages, start at latest
    if (prevAvalImagesLength === 0) {
      setDisplayStartIndex(0);
      setPrevAvalImagesLength(avalImages.length);
      return;
    }

    // If new images were added (heat level increased)
    if (avalImages.length > prevAvalImagesLength) {
      // Always go to latest images when new ones are available
      setDisplayStartIndex(0);
      setPrevAvalImagesLength(avalImages.length);
      return;
    }

    // If images decreased, reset to latest
    if (avalImages.length < prevAvalImagesLength) {
      setDisplayStartIndex(0);
      setPrevAvalImagesLength(avalImages.length);
    }
  }, [avalImages.length, prevAvalImagesLength]);

  // Update imgSrcArr when display changes
  useEffect(() => {
    const imgSources = curImageSet.map((item) => item.imageSrc);
    setImgSrcArr(imgSources);
  }, [curImageSet]);

  // Main logic to update images
  useEffect(() => {
    if (heatLevel <= MAX_HEAT_LEVEL) {
      setImgSrcArr([]);
      // setAvalCollections([]);
      // setCurCollections(['base']);
      setAvalImages([]);
      return;
    }

    // Get available collections based on heatIndex
    const availableCollections = getAvailableCollections(heatIndex);
    // console.log('[Debug] availableCollections:', availableCollections);

    // Update state
    // setAvalCollections([...availableCollections]);
    // setCurCollections([...availableCollections]);

    // Get image indexes for display
    const imgIndexes = getImageIndexes(heatIndex);
    // console.log('[Debug] imgIndexes:', imgIndexes);

    // The first index represents the maximum access level (edge line)
    const maxAccessIndex = imgIndexes[0] || 1;

    // Generate available images up to the access level
    const allAvailableImages = generateAvailableImages(
      availableCollections,
      maxAccessIndex
    );
    setAvalImages(allAvailableImages);

    // Generate image sources by passing avalImages as parameter
    setImgSrcArr(
      imgIndexes.map((index) => generateImgSrc(index, allAvailableImages))
    );
  }, [
    heatLevel,
    getAvailableCollections,
    generateAvailableImages,
    getImageIndexes,
    generateImgSrc,
    heatIndex,
  ]);

  // Helper function to get the current image source for display
  const getCurrentImageSrc = (index: number): string | null => {
    switch (transitionState.phase) {
      case 'fadeOut':
        // During fade out, show previous sources
        return transitionState.previousSources[index] || null;
      case 'fadeIn':
        // During fade in, show new sources
        return transitionState.newSources[index] || null;
      case 'idle':
      default:
        // In idle state, show current sources (use newSources as they're up to date)
        return transitionState.newSources[index] || imgSrcArr[index] || null;
    }
  };

  // Helper function to get opacity based on transition phase
  const getImageOpacity = (index: number): number => {
    const currentSrc = getCurrentImageSrc(index);

    if (!currentSrc) return 0;

    // Main image (index 0) - no delay, standard transition
    if (index === 0) {
      switch (transitionState.phase) {
        case 'fadeOut':
          return 0;
        case 'fadeIn':
        case 'idle':
          return 1;
        default:
          return 1;
      }
    }

    // Side images (index 1 and 2) - with delayed fade-in
    const sideKey = index === 1 ? 'left' : 'right';
    const sidePhase = transitionState.sideImagePhases[sideKey];

    switch (transitionState.phase) {
      case 'fadeOut':
        return 0; // All fade out together
      case 'fadeIn':
        // Side images follow their individual phases
        switch (sidePhase) {
          case 'waiting':
            return 0; // Still waiting to fade in
          case 'fadeIn':
          case 'visible':
            return 1; // Fading in or visible
          default:
            return 0;
        }
      case 'idle':
        return sidePhase === 'visible' ? 1 : 0;
      default:
        return 1;
    }
  };

  // Handle imgSrcArr changes and trigger transitions
  useEffect(() => {
    setTransitionState((prev) => {
      // Check if any source has changed or if array length increased
      const hasChanges =
        imgSrcArr.length !== prev.previousSources.length ||
        imgSrcArr.some((src, index) => src !== prev.previousSources[index]);

      if (hasChanges && prev.previousSources.length > 0) {
        return {
          phase: 'fadeOut',
          previousSources: [...prev.previousSources],
          newSources: [...imgSrcArr],
          sideImagePhases: {
            left: 'waiting',
            right: 'waiting',
          },
        };
      } else {
        // Initial load or no changes - no transition needed
        return {
          ...prev,
          phase: 'idle',
          previousSources: [...imgSrcArr],
          newSources: [...imgSrcArr],
          sideImagePhases: {
            left: 'visible',
            right: 'visible',
          },
        };
      }
    });
  }, [imgSrcArr]);

  // Handle image src transition phases timing
  useEffect(() => {
    if (transitionState.phase === 'idle') return;

    const timeoutIds: NodeJS.Timeout[] = [];

    switch (transitionState.phase) {
      case 'fadeOut':
        // After fade-out completes, move to fadeIn phase
        timeoutIds.push(
          setTimeout(() => {
            setTransitionState((prev) => ({
              ...prev,
              phase: 'fadeIn',
              // Keep side images in waiting state initially
            }));
          }, 250)
        );
        break;

      case 'fadeIn':
        // Main image shows immediately when fadeIn phase starts
        // Schedule left side image to fade in after delay
        if (transitionState.newSources[1]) {
          // Left image exists
          timeoutIds.push(
            setTimeout(() => {
              setTransitionState((prev) => ({
                ...prev,
                sideImagePhases: {
                  ...prev.sideImagePhases,
                  left: 'fadeIn',
                },
              }));
            }, SIDE_IMAGE_FADEIN_DELAY)
          );
        }

        // Schedule right side image to fade in after delay (staggered)
        if (transitionState.newSources[2]) {
          // Right image exists
          timeoutIds.push(
            setTimeout(() => {
              setTransitionState((prev) => ({
                ...prev,
                sideImagePhases: {
                  ...prev.sideImagePhases,
                  right: 'fadeIn',
                },
              }));
            }, SIDE_IMAGE_FADEIN_DELAY * 2)
          ); // Double delay for right image
        }

        // After all animations complete, return to idle
        const maxDelay = transitionState.newSources[2]
          ? SIDE_IMAGE_FADEIN_DELAY * 2
          : transitionState.newSources[1]
          ? SIDE_IMAGE_FADEIN_DELAY
          : 0;

        timeoutIds.push(
          setTimeout(() => {
            setTransitionState((prev) => ({
              ...prev,
              phase: 'idle',
              previousSources: [...prev.newSources],
              sideImagePhases: {
                left: 'visible',
                right: 'visible',
              },
            }));
          }, maxDelay + 250)
        ); // Additional 250ms for the fade-in transition
        break;
    }

    return () => {
      timeoutIds.forEach((id) => clearTimeout(id));
    };
  }, [transitionState.phase, transitionState.newSources]);

  // Debugging
  // useEffect(() => {
  //   console.log('[Debug] heatIndex', heatIndex);
  // }, [heatIndex]);

  // useEffect(() => {
  //   console.log('[Debug] displayStartIndex:', displayStartIndex);
  // }, [displayStartIndex]);

  // useEffect(() => {
  //   console.log('[Debug] curImageSet deps changed:', {
  //     avalImagesLength: avalImages.length,
  //     heatIndex,
  //     displayStartIndex,
  //   });
  // }, [avalImages, heatIndex, displayStartIndex]);

  useEffect(() => {
    if (!curImageSet.length) return;
    console.log(
      '[Debug]: curImageSet',
      curImageSet.map((i) => i.globalIndex)
    );
  }, [curImageSet]);

  useEffect(() => {
    if (!avalImages.length) return;
    console.log('[Debug] avalImages:', avalImages);
  }, [avalImages, avalImages.length]);

  return (
    <div
      className={cn(
        'absolute z-10 top-[var(--topbar-h)] left-0 flex flex-col transition-all duration-500 pointer-events-none',
        active && imgSrcArr.length ? 'opacity-100' : 'opacity-0',
        expanded ? 'right-0 h-134 pb-10 w-full' : 'w-full h-16'
      )}
    >
      {imgSrcArr.length ? (
        <div className="relative h-full w-full">
          {/* Background fade */}
          <div
            className={cn(
              'z-0 absolute inset-0 transition-opacity duration-500',
              expanded ? 'opacity-100' : 'opacity-0'
            )}
          >
            <div
              className={cn(
                'h-full bg-gradient-to-b from-[90%] to-background/0 to-[100%]',
                imgSrcArrLength === 1 && 'from-background/60',
                imgSrcArrLength === 2 && 'from-background/80',
                imgSrcArrLength === 3 && 'from-background/95'
              )}
            />
          </div>

          {/* Images */}
          <div className="z-10 relative -translate-y-4 h-full w-full flex-center">
            <div
              onClick={toggleMinimized}
              data-expanded={expanded ? 'true' : 'false'}
              className="chat-media_minimizer"
            >
              <div className="relative h-4 flex-center leading-none">
                <div
                  className={cn(
                    'translate-x-2 transition-all ease-out duration-300',
                    !minimized && 'opacity-0 scale-30'
                  )}
                >
                  <Button variant="accent" size="sm">
                    {avalImages.length} Photo{avalImages.length > 1 ? 's' : ''}
                  </Button>
                </div>

                <div
                  className={cn(
                    'absolute translate-x-12 p-1.5 rounded-full bg-btn-secondary-background transition-opacity ease-out',
                    (minimized || expanded) && 'opacity-0'
                  )}
                >
                  <CloseIcon className="scale-75 icon--action" />
                </div>
              </div>
            </div>

            {/* Main image */}
            <div
              data-translate={
                expanded && imgSrcArrLength === 2 ? 'true' : 'false'
              }
              className={cn(
                'chat-media_main-item',
                expanded
                  ? 'w-60 h-120 rounded-2xl dark:shadow-2xl dark:shadow-background/50'
                  : 'w-16 h-16 rounded-lg hover:w-30 hover:h-56 hover:translate-y-8',
                minimized &&
                  'scale-50 w-1 h-1 -translate-y-4 ease-out opacity-0'
              )}
            >
              <div className="absolute inset-0 bg-background/80"></div>
              {getCurrentImageSrc(0) && (
                <Image
                  src={getCurrentImageSrc(0)!}
                  className="z-10 fade object-cover text-sm text-muted bg-background transition-opacity duration-200"
                  style={{ opacity: getImageOpacity(0) }}
                  fill
                  priority
                  quality={100}
                  unoptimized
                  alt="Photo"
                />
              )}

              {/* Clickable area (expand / collapse) */}
              <div
                onClick={toggleExpanded}
                className="z-10 absolute top-0 inset-x-0 bottom-15 cursor-pointer"
                // title={expanded ? 'Collapse' : 'Expand'}
              />

              {/* Navbar */}
              <div
                data-active={expanded ? 'true' : 'false'}
                className="chat-media_navbar"
              >
                <div className="w-1/2">
                  <div
                    onClick={handlePrev}
                    data-side="left"
                    data-active={canGoPrev ? 'true' : 'false'}
                    className="chat-media_nav-item"
                  >
                    PREV
                  </div>
                </div>
                <div className="w-1/2">
                  <div
                    onClick={handleNext}
                    data-side="right"
                    data-active={canGoNext ? 'true' : 'false'}
                    className="chat-media_nav-item"
                  >
                    NEXT
                  </div>
                </div>
              </div>
            </div>

            {/* Left side image */}
            <div
              data-key="left"
              className={cn(
                'chat-media_item',
                expanded && getCurrentImageSrc(1)
                  ? 'chat-media_item--active'
                  : 'chat-media_item--inactive',
                expanded && imgSrcArrLength === 2 && '-translate-x-60!'
              )}
            >
              <div className="opacity-85 chat-media_image-wrapper">
                {getCurrentImageSrc(1) && (
                  <Image
                    src={getCurrentImageSrc(1)!}
                    className="object-cover text-sm text-muted transition-opacity duration-200 fade-out"
                    style={{ opacity: getImageOpacity(1) }}
                    fill
                    priority
                    quality={100}
                    unoptimized
                    alt="Photo"
                  />
                )}
              </div>
            </div>

            {/* Right side image */}
            <div
              data-key="right"
              className={cn(
                'chat-media_item',
                expanded && getCurrentImageSrc(2)
                  ? 'chat-media_item--active'
                  : 'chat-media_item--inactive'
              )}
            >
              <div className="opacity-70 chat-media_image-wrapper">
                {getCurrentImageSrc(2) && (
                  <Image
                    src={getCurrentImageSrc(2)!}
                    className="object-cover text-sm text-muted transition-opacity duration-200 fade-out"
                    style={{ opacity: getImageOpacity(2) }}
                    fill
                    priority
                    quality={100}
                    unoptimized
                    alt="Photo"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ChatMedia;
