import { useCallback, useEffect, useRef, useState } from 'react';

interface PreloadState {
  [src: string]: 'loading' | 'loaded' | 'error';
}

// export const useImagePreloader = () => {
//   const [preloadState, setPreloadState] = useState<PreloadState>({});
//   const preloadRefs = useRef<{ [src: string]: HTMLImageElement }>({});

//   const preloadImage = useCallback(
//     (src: string): Promise<void> => {
//       if (!src) return Promise.resolve();

//       // Already loaded or loading
//       if (preloadState[src] === 'loaded' || preloadState[src] === 'loading') {
//         return Promise.resolve();
//       }

//       return new Promise((resolve, reject) => {
//         setPreloadState((prev) => ({ ...prev, [src]: 'loading' }));

//         const img = new Image();
//         preloadRefs.current[src] = img;

//         img.onload = () => {
//           setPreloadState((prev) => ({ ...prev, [src]: 'loaded' }));
//           resolve();
//         };

//         img.onerror = () => {
//           setPreloadState((prev) => ({ ...prev, [src]: 'error' }));
//           reject();
//         };

//         img.src = src;
//       });
//     },
//     [preloadState]
//   );

//   const preloadImages = useCallback(
//     async (sources: string[]): Promise<void> => {
//       const validSources = sources.filter((src) => src);
//       await Promise.allSettled(validSources.map((src) => preloadImage(src)));
//     },
//     [preloadImage]
//   );

//   const isImageLoaded = useCallback(
//     (src: string): boolean => {
//       return preloadState[src] === 'loaded';
//     },
//     [preloadState]
//   );

//   const areImagesLoaded = useCallback(
//     (sources: string[]): boolean => {
//       return sources.filter((src) => src).every((src) => isImageLoaded(src));
//     },
//     [isImageLoaded]
//   );

//   const clearCache = useCallback(() => {
//     setPreloadState({});
//     Object.values(preloadRefs.current).forEach((img) => {
//       img.onload = null;
//       img.onerror = null;
//     });
//     preloadRefs.current = {};
//   }, []);

//   // Cleanup
//   useEffect(() => {
//     const currentRefs = preloadRefs.current;

//     return () => {
//       Object.values(currentRefs).forEach((img) => {
//         img.onload = null;
//         img.onerror = null;
//       });
//     };
//   }, []);

//   return {
//     preloadImages,
//     isImageLoaded,
//     areImagesLoaded,
//     clearCache,
//     preloadState,
//   };
// };
export const useImagePreloader = () => {
  const [preloadState, setPreloadState] = useState<PreloadState>({});
  const preloadRefs = useRef<{ [src: string]: HTMLImageElement }>({});
  const preloadStateRef = useRef<PreloadState>({});

  // Update ref whenever state changes
  useEffect(() => {
    preloadStateRef.current = preloadState;
  }, [preloadState]);

  const preloadImage = useCallback((src: string): Promise<void> => {
    if (!src) return Promise.resolve();

    // Use ref instead of state in dependency - prevents recreation
    const currentState = preloadStateRef.current[src];
    if (currentState === 'loaded' || currentState === 'loading') {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      setPreloadState((prev) => ({ ...prev, [src]: 'loading' }));

      const img = new Image();
      preloadRefs.current[src] = img;

      img.onload = () => {
        setPreloadState((prev) => ({ ...prev, [src]: 'loaded' }));
        resolve();
      };

      img.onerror = () => {
        setPreloadState((prev) => ({ ...prev, [src]: 'error' }));
        reject();
      };

      img.src = src;
    });
  }, []);

  const preloadImages = useCallback(
    async (sources: string[]): Promise<void> => {
      const validSources = sources.filter((src) => src);
      await Promise.allSettled(validSources.map((src) => preloadImage(src)));
    },
    [preloadImage]
  );

  const isImageLoaded = useCallback((src: string): boolean => {
    return preloadStateRef.current[src] === 'loaded';
  }, []);

  const areImagesLoaded = useCallback((sources: string[]): boolean => {
    return sources
      .filter((src) => src)
      .every((src) => preloadStateRef.current[src] === 'loaded');
  }, []);

  const clearCache = useCallback(() => {
    setPreloadState({});
    Object.values(preloadRefs.current).forEach((img) => {
      img.onload = null;
      img.onerror = null;
    });
    preloadRefs.current = {};
  }, []);

  // Cleanup
  useEffect(() => {
    const currentRefs = preloadRefs.current;

    return () => {
      Object.values(currentRefs).forEach((img) => {
        img.onload = null;
        img.onerror = null;
      });
    };
  }, []);

  return {
    preloadImages,
    isImageLoaded,
    areImagesLoaded,
    clearCache,
    preloadState,
  };
};
