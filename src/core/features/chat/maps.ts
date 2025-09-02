import {
  AvatarKey,
  CollectionMap,
  EmotionData,
} from '@/core/features/chat/types/person';

export const artFutureEmotionMap = new Map<
  string,
  {
    list: string[];
    length: number;
  }
>([
  [
    'excited',
    {
      list: ['excited', 'happy', 'laughing', 'smiling', 'surprised'],
      length: 5,
    },
  ],
  [
    'friendly',
    {
      list: ['friendly', 'happy', 'smiling'],
      length: 3,
    },
  ],
  // Heat index 1
  [
    'flirty',
    {
      list: ['laughing', 'playful', 'shy'],
      length: 3,
    },
  ],
  // Heat index 2
  [
    'aroused',
    {
      list: ['shy', 'feeling'],
      length: 2,
    },
  ],
  // Heat index 3
  [
    'obsessed',
    {
      list: ['obsessed', 'shy', 'devoured'],
      length: 3,
    },
  ],
  [
    'upset',
    {
      list: ['confused', 'upset'],
      length: 2,
    },
  ],
  [
    'error',
    {
      list: ['confused', 'doubt', 'upset'],
      length: 3,
    },
  ],
]);

export const modelArtistEmotionMap = new Map<
  string,
  {
    list: string[];
    length: number;
  }
>([
  [
    'excited',
    {
      list: ['excited', 'joyful', 'laughing', 'friendly', 'playful', 'smiling'],
      length: 6,
    },
  ],
  [
    'friendly',
    {
      list: ['friendly', 'smiling', 'playful', 'flirty'],
      length: 4,
    },
  ],
  // Heat index 1
  [
    'flirty',
    {
      list: [
        'friendly',
        'smiling',
        'flirty',
        'playful',
        'playful-2',
        'kiss-1',
        'kiss-3',
      ],
      length: 7,
    },
  ],
  // Heat index 2
  [
    'aroused',
    {
      list: [
        'flirty',
        'playful',
        'playful-2',
        'kiss-2',
        'kiss-4',
        'pleased',
        'craving',
        'feeling',
      ],
      length: 8,
    },
  ],
  // Heat index 3
  [
    'obsessed',
    {
      list: [
        'playful-2',
        'kiss-2',
        'pleased',
        'craving',
        'feeling',
        'feeling-happy',
        'obsessed',
        'devoured',
      ],
      length: 8,
    },
  ],
  [
    'upset',
    {
      list: ['doubt', 'upset'],
      length: 3,
    },
  ],
  [
    'error',
    {
      list: ['doubt', 'upset', 'error-1', 'error-2', 'error-3', 'error-4'],
      length: 6,
    },
  ],
]);

export const mangoEmotionMap = new Map<
  string,
  {
    list: string[];
    length: number;
  }
>([
  [
    'excited',
    {
      list: ['friendly', 'smiling-2', 'smiling-4'],
      length: 3,
    },
  ],
  [
    'friendly',
    {
      list: ['friendly', 'friendly-2', 'playful-2', 'smiling', 'smiling-2'],
      length: 5,
    },
  ],
  // Heat index 1
  [
    'flirty',
    {
      list: [
        'flirty',
        'flirty-2',
        'flirty-smile',
        'playful',
        'smiling',
        'smiling-2',
        'smiling-3',
      ],
      length: 7,
    },
  ],
  // Heat index 2
  [
    'aroused',
    {
      list: [
        'alluring',
        'alluring-2',
        'alluring-3',
        'alluring-4',
        'alluring-5',
        'shy',
        'smiling',
        'teetering',
        'feeling',
      ],
      length: 9,
    },
  ],
  // Heat index 3
  [
    'obsessed',
    {
      list: [
        'lying',
        'teetering',
        'unraveled',
        'unraveled-2',
        'unraveled-3',
        'unraveled-4',
        'unraveled-5',
        'unraveled-6',
      ],
      length: 8,
    },
  ],
  [
    'upset',
    {
      list: ['upset'],
      length: 1,
    },
  ],
  [
    'error',
    {
      list: ['error', 'error-2', 'upset', 'playful-2'],
      length: 4,
    },
  ],
]);

export const sharedEmotionMap = new Map<string, EmotionData>([
  [
    'excited',
    {
      list: [
        'excited',
        'joyful',
        'laughing',
        'flirty',
        'friendly',
        'playful',
        'smiling',
      ],
      length: 7,
    },
  ],
  [
    'friendly',
    {
      list: ['friendly', 'playful', 'smiling'],
      length: 4,
    },
  ],
  [
    'flirty',
    {
      list: ['flirty', 'kiss'],
      length: 2,
    },
  ],
  [
    'aroused',
    {
      list: ['aroused', 'craving'],
      length: 2,
    },
  ],
  [
    'obsessed',
    {
      list: ['obsessed', 'devoured'],
      length: 2,
    },
  ],
  [
    'upset',
    {
      list: ['doubt', 'upset'],
      length: 2,
    },
  ],
]);

export const heatPhotoMap = new Map<AvatarKey, CollectionMap>([
  [
    AvatarKey.blonde,
    {
      base: {
        totalPhotos: 10,
        description: 'Base collection',
      },
    },
  ],
  [
    AvatarKey.honey,
    {
      base: {
        totalPhotos: 15,
        description: 'Base collection',
      },
    },
  ],
  [
    AvatarKey.mango,
    {
      base: {
        totalPhotos: 15,
        description: 'Base collection',
      },
      masterpiece: {
        totalPhotos: 18,
        description: 'Masterpiece',
      },
    },
  ],
]);
