'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { CloseIcon } from '@/core/components/icons/CloseIcon';
import { MinimizeIcon } from '@/core/components/icons/MinimizeIcon';
import { Button } from '@/core/components/ui/Button';
import { ASSET_URL } from '@/core/constants';
import {
  CHAT_MEDIA_MIN_KEY,
  HEAT_PHOTO_STEP,
  MAX_HEAT_LEVEL,
} from '@/core/features/chat/constants';
import { heatPhotoMap } from '@/core/features/chat/maps';
import { AvatarKey, CollectionMap } from '@/core/features/chat/types/person';
import { useImagePreloader } from '@/core/hooks/useImagePreloader';
import { useLocalStorage } from '@/core/hooks/useLocalStorage';
import { cn } from '@/core/utils';
import SelectMediaCollection from '@/core/features/chat/components/SelectMediaCollection';
import { ImageInfo } from '@/core/features/chat/types/chat';

const SIDE_IMAGE_FADEIN_DELAY = 100;

interface TransitionState {
  phase: 'idle' | 'preloading' | 'fadeOut' | 'fadeIn';
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
  const { getItem, setItem, removeItem } = useLocalStorage();
  const { preloadImages, clearCache } = useImagePreloader();

  const [avalCollections, setAvalCollections] = useState<string[]>([]);
  const [selectedCollection, setSelectedCollection] =
    useState<keyof CollectionMap>('all');

  const [images, setImages] = useState<ImageInfo[]>([]);
  const [avalImages, setAvalImages] = useState<ImageInfo[]>([]);
  const [displayStartIndex, setDisplayStartIndex] = useState<number>(0);
  const [prevImagesLength, setPrevImagesLength] = useState<number>(0);
  const [imageUpdatesFrozen, setImageUpdatesFrozen] = useState(false);
  const [newImagesCount, setNewImagesCount] = useState(0);
  const [curImageSet, setCurImageSet] = useState<
    {
      globalIndex: number;
      imageSrc: string;
      imageInfo?: ImageInfo;
    }[]
  >([]);

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

  const prevAvalImagesLengthRef = useRef(0);

  const heatIndex = useMemo(() => {
    return Math.max(heatLevel - MAX_HEAT_LEVEL, 1);
  }, [heatLevel]);

  const prevHeatIndexRef = useRef(heatIndex);

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
      setItem(key, value);
    } else {
      removeItem(key);
    }
    setMinimized(value);
  };

  const resetNewImagesCount = () => {
    if (prevAvalImagesLengthRef.current === avalImages.length) {
      setImageUpdatesFrozen(false);
      setNewImagesCount(0);
      if (selectedCollection !== 'all') {
        setSelectedCollection('all');
      }
    }
  };

  const handleViewNewPhotos = () => {
    resetNewImagesCount();
  };

  useEffect(() => {
    const itemInLS = getItem<boolean>(`${CHAT_MEDIA_MIN_KEY}_${avatarKey}`);
    if (itemInLS) {
      setMinimized(true);
    }
  }, [avatarKey, getItem]);

  const imgSrcArrLength = useMemo(() => {
    return imgSrcArr.length;
  }, [imgSrcArr.length]);

  useEffect(() => {
    if (heatLevel <= MAX_HEAT_LEVEL) return;

    const timeout = setTimeout(() => {
      setActive(true);
    }, 1000);

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
        // console.warn(
        //   `[generateImgSrc] No collection info found for index ${imgIndex}`
        // );
        return '';
      }

      const { collectionName, localIndex } = collectionInfo;
      // Image src for local / vercel hosted images
      // return `/images/people/${avatarKey}/heat/${collectionName}/${localIndex}.jpg`;

      // Image src for externally hosted images
      return `${ASSET_URL}/photos/${avatarKey}/${collectionName}/${localIndex}.jpg`;
    },
    [avatarKey, getImageCollectionInfo]
  );

  const mapToDisplayFormat = useCallback(
    (imageItems: ImageInfo[]) =>
      imageItems.map((item) => ({
        globalIndex: item.index,
        imageSrc: generateImgSrc(item.index, avalImages),
        imageInfo: item,
      })),
    [avalImages, generateImgSrc]
  );

  // Helper to configure image set. Retrieves the latest images from the avalImages
  const configureImageSet = useCallback(
    (imageItems: ImageInfo[]) => {
      if (!imageItems.length) return [];

      const maxAccessIndex = imageItems[imageItems.length - 1]?.index || 1;
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

      // Convert indexes to ImageInfo objects
      const foundItems = displayIndexes
        .map((idx) => imageItems.find((img) => img.index === idx))
        .filter((item): item is ImageInfo => item !== undefined);

      return mapToDisplayFormat(foundItems);
    },
    [displayStartIndex, getImageIndexes, heatIndex, mapToDisplayFormat]
  );

  const handleSelectCollection = (key: string) => {
    setSelectedCollection(key);

    if (key === 'all') {
      setImages(avalImages);
      setDisplayStartIndex(0);
      if (newImagesCount) resetNewImagesCount();
      return;
    }

    // Freeze image updates when selecting a specific collection
    setImageUpdatesFrozen(true);

    const filteredImageItems = avalImages.filter(
      (i) => i.collectionName === key
    );

    setImages(filteredImageItems);
    setDisplayStartIndex(0);
  };

  // Update active image set
  useEffect(() => {
    if (images.length === 0) return;

    const newImageSet = configureImageSet(images);
    setCurImageSet(newImageSet);
  }, [
    images,
    getImageIndexes,
    heatIndex,
    displayStartIndex,
    generateImgSrc,
    configureImageSet,
  ]);

  // Navigate to previous set of images
  const handlePrev = useCallback(() => {
    if (images.length === 0) return;

    // Get the index of the latest image
    const maxAccessIndex = images[images.length - 1]?.index || 1;

    setDisplayStartIndex((prevIndex) => {
      const newIndex = prevIndex + 1;
      const maxStartIndex = maxAccessIndex - 1;
      return Math.min(newIndex, maxStartIndex);
    });
  }, [images]);

  // Navigate to next set of images
  const handleNext = useCallback(() => {
    if (images.length === 0) return;

    setDisplayStartIndex((prevIndex) => Math.max(0, prevIndex - 1));
  }, [images]);

  // Check if navigation is possible
  const canGoNext = useMemo(() => {
    return displayStartIndex > 0;
  }, [displayStartIndex]);

  const canGoPrev = useMemo(() => {
    if (images.length < 2 || imgSrcArr.length === 1) return false;
    const maxAccessIndex = images[images.length - 1]?.index || 1;
    return displayStartIndex < maxAccessIndex - 1;
  }, [images, displayStartIndex, imgSrcArr.length]);

  // Freeze/Unfreeze control based on displayStartIndex
  useEffect(() => {
    if (displayStartIndex > 0) {
      // User navigated back - freeze updates
      if (!imageUpdatesFrozen) {
        setImageUpdatesFrozen(true);
      }
    } else if (
      displayStartIndex === 0 &&
      imageUpdatesFrozen &&
      selectedCollection === 'all'
    ) {
      // Only unfreeze if BOTH conditions are cleared:
      // - Back to latest (displayStartIndex === 0)
      // - AND viewing all collections (selectedCollection === 'all')
      const unfreezeTimeout = setTimeout(() => {
        setImageUpdatesFrozen(false);
      }, 50);

      return () => clearTimeout(unfreezeTimeout);
    }
  }, [displayStartIndex, imageUpdatesFrozen, selectedCollection]);

  // Reset display when `images` changes
  useEffect(() => {
    // console.log('[Debug] RESET EFFECT triggered', {
    //   avalImagesLength: avalImages.length,
    //   prevLength: prevImagesLength,
    //   timestamp: Date.now(),
    // });

    if (images.length === 0) {
      setDisplayStartIndex(0);
      setPrevImagesLength(0);
      return;
    }

    // If this is the first time setting avalImages, start at latest
    if (prevImagesLength === 0) {
      setDisplayStartIndex(0);
      setPrevImagesLength(images.length);
      return;
    }

    // If new images were added (heat level increased)
    if (images.length > prevImagesLength) {
      // Always go to latest images when new ones are available
      setDisplayStartIndex(0);
      setPrevImagesLength(images.length);
      return;
    }

    // If images decreased, reset to latest
    if (images.length < prevImagesLength) {
      setDisplayStartIndex(0);
      setPrevImagesLength(images.length);
    }
  }, [images.length, prevImagesLength]);

  // Update imgSrcArr when display changes
  useEffect(() => {
    // console.log('[Debug] IMG UPDATE EFFECT triggered', {
    //   curImageSetLength: curImageSet.length,
    //   timestamp: Date.now(),
    // });

    const imgSources = curImageSet.map((item) => item.imageSrc);
    setImgSrcArr(imgSources);
  }, [curImageSet]);

  // Main logic to update images. Updates avalImages when heatIndex changes.
  useEffect(() => {
    // console.log('[Debug] MAIN LOGIC EFFECT triggered', {
    //   heatLevel,
    //   heatIndex,
    //   timestamp: Date.now(),
    //   stack: new Error().stack?.split('\n')[2], // Shows what triggered it
    // });

    if (heatLevel <= MAX_HEAT_LEVEL) {
      setImgSrcArr([]);
      setAvalCollections([]);
      // setCurCollections(['base']);
      setAvalImages([]); // Only clear avalImages, let sync effect handle images
      return;
    }

    // Get available collections based on heatIndex
    const availableCollections = getAvailableCollections(heatIndex);
    // console.log('[Debug] availableCollections:', availableCollections);

    // Update state
    setAvalCollections([...availableCollections]);
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
    // setImages(allAvailableImages);
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

  // Detect heatIndex decreases and force unfreeze
  useEffect(() => {
    const prevHeatIdx = prevHeatIndexRef.current;

    if (heatIndex < prevHeatIdx) {
      // Heat decreased - force unfreeze and reset to latest
      // console.log(
      //   `[Debug] Heat decreased from ${prevHeatIdx} to ${heatIndex} - forcing unfreeze`
      // );
      setImageUpdatesFrozen(false);
      setDisplayStartIndex(0);
      setNewImagesCount(0);

      // If we were on a specific collection, switch back to 'all' to see the updated state
      if (selectedCollection !== 'all') {
        setSelectedCollection('all');
      }
    }

    // Update the tracked heatIndex
    prevHeatIndexRef.current = heatIndex;
  }, [heatIndex, selectedCollection]);

  // Helper function to get the current image source for display
  const getCurrentImageSrc = (index: number): string | null => {
    switch (transitionState.phase) {
      case 'preloading':
        // During preloading, keep showing previous sources
        return transitionState.previousSources[index] || null;
      case 'fadeOut':
        // During fade out, show previous sources
        return transitionState.previousSources[index] || null;
      case 'fadeIn':
        // During fade in, show new sources
        return transitionState.newSources[index] || null;
      case 'idle':
      default:
        // In idle state, show current sources
        return transitionState.newSources[index] || imgSrcArr[index] || null;
    }
  };

  // Helper function to get opacity based on transition phase
  const getImageOpacity = (index: number): number => {
    const currentSrc = getCurrentImageSrc(index);

    if (!currentSrc) return 0;

    // Main image (index 0)
    if (index === 0) {
      switch (transitionState.phase) {
        case 'preloading':
          return 1; // Keep showing previous image during preload
        case 'fadeOut':
          return 0;
        case 'fadeIn':
        case 'idle':
          return 1;
        default:
          return 1;
      }
    }

    // Side images (index 1 and 2)
    const sideKey = index === 1 ? 'left' : 'right';
    const sidePhase = transitionState.sideImagePhases[sideKey];

    switch (transitionState.phase) {
      case 'preloading':
        return 1; // Keep showing previous images during preload
      case 'fadeOut':
        return 0;
      case 'fadeIn':
        switch (sidePhase) {
          case 'waiting':
            return 0;
          case 'fadeIn':
          case 'visible':
            return 1;
          default:
            return 0;
        }
      case 'idle':
        return sidePhase === 'visible' ? 1 : 0;
      default:
        return 1;
    }
  };

  // Handle imgSrcArr changes and trigger transitions with preloading
  useEffect(() => {
    // console.log('[Debug] TRANSITION EFFECT triggered', {
    //   imgSrcArrLength: imgSrcArr.length,
    //   timestamp: Date.now(),
    // });

    setTransitionState((prev) => {
      const hasChanges =
        imgSrcArr.length !== prev.previousSources.length ||
        imgSrcArr.some((src, index) => src !== prev.previousSources[index]);

      if (hasChanges && prev.previousSources.length > 0) {
        // Start preloading phase
        preloadImages(imgSrcArr).then(() => {
          // Only start transition after preloading completes
          setTransitionState((current) => ({
            ...current,
            phase: 'fadeOut',
          }));
        });

        return {
          phase: 'preloading',
          previousSources: [...prev.previousSources],
          newSources: [...imgSrcArr],
          sideImagePhases: {
            left: 'waiting',
            right: 'waiting',
          },
        };
      } else {
        // Initial load or no changes
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
  }, [imgSrcArr, preloadImages]);

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

  // Predictive preloading - preload next potential images
  useEffect(() => {
    if (heatLevel <= MAX_HEAT_LEVEL || !avalImages.length) return;

    // Calculate next potential heat index
    const nextHeatIndex = heatIndex + HEAT_PHOTO_STEP;
    const nextAvailableCollections = getAvailableCollections(nextHeatIndex);
    const nextImgIndexes = getImageIndexes(nextHeatIndex);
    const nextMaxAccessIndex = nextImgIndexes[0] || 1;

    // Generate next available images
    const nextAvailableImages = generateAvailableImages(
      nextAvailableCollections,
      nextMaxAccessIndex
    );

    // Generate next image sources
    const nextImageSources = nextImgIndexes
      .map((index) => generateImgSrc(index, nextAvailableImages))
      .filter((src) => src);

    // Preload next images in background (don't wait for completion)
    if (nextImageSources.length > 0) {
      preloadImages(nextImageSources).catch(() => {
        // Silently handle preload errors - not critical
      });
    }
  }, [
    heatLevel,
    heatIndex,
    avalImages.length,
    getAvailableCollections,
    getImageIndexes,
    generateAvailableImages,
    generateImgSrc,
    preloadImages,
  ]);

  // Initial sync of images with avalImages when component loads
  useEffect(() => {
    if (
      selectedCollection === 'all' &&
      avalImages.length > 0 &&
      images.length === 0 &&
      !imageUpdatesFrozen
    ) {
      setImages(avalImages);
      setNewImagesCount(0);
    }
  }, [avalImages, selectedCollection, images.length, imageUpdatesFrozen]);

  // Sync images with avalImages based on selected collection
  useEffect(() => {
    if (avalImages.length === 0) return;

    // First, check for global avalImages growth (regardless of selected collection)
    const prevAvalImgLng = prevAvalImagesLengthRef.current;
    if (avalImages.length > prevAvalImgLng && prevAvalImgLng > 0) {
      const globalIncrement = avalImages.length - prevAvalImgLng;

      if (imageUpdatesFrozen) {
        // Frozen: increment new images count and log
        setNewImagesCount((prev) => prev + globalIncrement);
        // console.log(
        //   '[Debug] New images available. Current selection:',
        //   selectedCollection
        // );
      }
    }

    // Update the tracked length
    prevAvalImagesLengthRef.current = avalImages.length;

    // Then handle the actual image updates (only when not frozen)
    if (imageUpdatesFrozen) return; // CORRECTED: was !imageUpdatesFrozen

    if (selectedCollection === 'all') {
      // If "all" is selected, sync with avalImages
      if (images.length !== avalImages.length) {
        // console.log('[Debug] New images available. Current selection: all');
        setImages(avalImages);
        setNewImagesCount(0);
      }
    } else {
      // Check if selected collection still exists
      const collectionExists = avalImages.some(
        (img) => img.collectionName === selectedCollection
      );
      if (!collectionExists) {
        console.log(
          `[Debug] Selected collection "${selectedCollection}" no longer exists, switching to "all"`
        );
        setSelectedCollection('all');
        setImages(avalImages);
        setNewImagesCount(0);
        return;
      }

      // If specific collection is selected, filter avalImages
      const filteredImageItems = avalImages.filter(
        (i) => i.collectionName === selectedCollection
      );

      if (filteredImageItems.length !== images.length) {
        // console.log(
        //   `[Debug] New images available. Current selection: ${selectedCollection}`
        // );
        setImages(filteredImageItems);
        setNewImagesCount(0);
      }
    }
  }, [avalImages, selectedCollection, images.length, imageUpdatesFrozen]);

  // Clean up preloaded images cache
  useEffect(() => {
    return () => {
      clearCache();
    };
  }, [clearCache]);

  // Debugging
  // useEffect(() => {
  //   console.log('[Debug] heatIndex', heatIndex);
  // }, [heatIndex]);

  // useEffect(() => {
  //   console.log('[Debug] displayStartIndex:', displayStartIndex);
  // }, [displayStartIndex]);

  // useEffect(() => {
  //   console.log('[Debug] avalCollections:', avalCollections);
  // }, [avalCollections]);

  // useEffect(() => {
  //   console.log('[Debug] curCollections:', curCollections);
  // }, [curCollections]);

  // useEffect(() => {
  //   console.log('[Debug] curImageSet deps changed:', {
  //     avalImagesLength: avalImages.length,
  //     heatIndex,
  //     displayStartIndex,
  //   });
  // }, [avalImages, heatIndex, displayStartIndex]);

  // useEffect(() => {
  //   if (!curImageSet.length) return;
  //   console.log(
  //     '[Debug] curImageSet:',
  //     curImageSet.map((i) => i.globalIndex)
  //   );
  //   // console.log('[Debug] curImageSet:', curImageSet);
  // }, [curImageSet]);

  // useEffect(() => {
  //   if (!avalImages.length) return;
  //   // console.log('[Debug] avalImages:', avalImages);
  //   console.log('[Debug] avalImages:', avalImages.length);
  //   console.log('[Debug] prevAvalImages:', prevAvalImagesLengthRef.current);
  // }, [avalImages, avalImages.length]);

  // useEffect(() => {
  //   if (!images.length) return;
  //   // console.log('[Debug] images:', images);
  //   console.log('[Debug] images:', images.length);
  // }, [images]);

  // useEffect(() => {
  //   if (!newImagesCount) return;
  //   console.log('[Debug] newImagesCount:', newImagesCount);
  // }, [newImagesCount]);

  // useEffect(() => {
  //   console.log('[Debug] imageUpdatesFrozen:', imageUpdatesFrozen);
  // }, [imageUpdatesFrozen]);

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
              'z-0 absolute inset-0 trans-o',
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
              data-expanded={expanded}
              className="chat-media_minimizer"
            >
              <div className="relative h-4 flex-center leading-none">
                <div
                  className={cn(
                    'translate-x-2 trans-a ease-out',
                    !minimized && 'opacity-0 scale-30'
                  )}
                >
                  <Button variant="accent" size="sm">
                    {avalImages.length} Photo{avalImages.length > 1 ? 's' : ''}
                  </Button>
                </div>

                <div
                  className={cn(
                    'absolute translate-x-12 p-1.5 rounded-full bg-btn-secondary-background trans-o ease-out',
                    (minimized || expanded) && 'opacity-0'
                  )}
                >
                  <CloseIcon className="scale-75 icon--action" />
                </div>
              </div>
            </div>

            {/* Main image */}
            <div
              data-translate={expanded && imgSrcArrLength === 2}
              className={cn(
                'chat-media_main-item',
                expanded
                  ? 'w-60 h-120 rounded-2xl dark:shadow-2xl dark:shadow-background/50'
                  : 'w-16 h-16 rounded-lg hover:w-30 hover:h-56 hover:translate-y-8',
                minimized &&
                  'scale-50 w-1 h-1 -translate-y-4 ease-out opacity-0'
              )}
            >
              <div className="absolute inset-0 bg-background/80" />
              {getCurrentImageSrc(0) && (
                <Image
                  src={getCurrentImageSrc(0)!}
                  className="z-10 fade object-cover text-sm text-muted bg-background trans-o"
                  style={{ opacity: getImageOpacity(0) }}
                  fill
                  priority
                  quality={100}
                  unoptimized
                  placeholder="blur"
                  blurDataURL="..."
                  alt="Photo"
                />
              )}

              {/* Clickable area (expand / collapse) */}
              <div
                onClick={toggleExpanded}
                className="chat-media_clickable-area"
              >
                <div data-active={expanded} className="chat-media_icon">
                  <MinimizeIcon />
                </div>
              </div>

              {/* Navbar */}
              <div data-active={expanded} className="chat-media_navbar">
                <div className="w-1/2">
                  <div
                    onClick={handlePrev}
                    data-side="left"
                    data-active={canGoPrev}
                    className="chat-media_nav-item"
                  >
                    PREV
                  </div>
                </div>
                <div className="w-1/2">
                  <div
                    onClick={handleNext}
                    data-side="right"
                    data-active={canGoNext}
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
                    className="object-cover text-sm text-muted trans-o fade-out"
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
                    className="object-cover text-sm text-muted trans-o fade-out"
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

          {/* Select collection */}
          <div
            className={cn(
              'chat-media_select-collection trans-a',
              expanded && avalCollections.length > 1
                ? 'opacity-100'
                : 'opacity-0 pointer-events-none scale-0'
            )}
          >
            <SelectMediaCollection
              avalCollections={avalCollections}
              onSelect={handleSelectCollection}
            />
          </div>

          {/* New images */}
          <div
            className={cn(
              'chat-media_new-images trans-a',
              expanded && newImagesCount
                ? 'opacity-70 hover:opacity-100'
                : 'opacity-0 pointer-events-none scale-0'
            )}
          >
            <Button
              className="h-10"
              onClick={handleViewNewPhotos}
              size="sm"
              variant="accent"
            >
              <span className="text-sm text-foreground font-bold">
                {newImagesCount}
              </span>{' '}
              new photo{newImagesCount > 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ChatMedia;
