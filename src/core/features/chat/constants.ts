import {
  AvatarKey,
  CollectionMap,
  EmotionData,
} from '@/core/features/chat/types/person';

// Local storage
export const DECLINED_NAMES_KEY = 'declined-names';
export const HEAT_LEVEL_KEY = 'heat-level';
export const CHAT_MEDIA_MIN_KEY = 'chat-media-min';

export const NAMES = {
  female: [
    'Amelia',
    'Ariana',
    'Caroline',
    'Daniela',
    'Emily',
    'Emma',
    'Elise',
    'Eva',
    'Helena',
    'Julia',
    'Katie',
    'Kelly',
    'Lily',
    'Lindsey',
    'Luna',
    'Mia',
    'Natalie',
    'Nicole',
    'Olivia',
    'Rachel',
    'Scarlett',
    'Sophia',
    'Victoria',
  ],
  male: [
    'Ethan',
    'William',
    'Lucas',
    'Alexander',
    'Michael',
    'Daniel',
    'Liam',
    'Oliver',
    'Henry',
    'Sebastian',
  ],
};

export const EMOTION_LIST = ['excited', 'flirty', 'friendly', 'upset'];

export const DEFAULT_EMOTION_KEY = 'friendly';

export const emotionList = EMOTION_LIST.join(', ');

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
      list: ['happy', 'joyful', 'smiling'],
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

export const INSTRUCTIONS = {
  base: `NSFW context is allowed. Respond with concise and erotically charged language. Be attractive while staying focused on a single topic at a time.`,
  canGenerateFiction: `You can cite some fictitious facts about you.`,
  extractEmotion: `Select one emotion from this list (${emotionList}) that best matches the tone of your reply. Append this emotion at the end of your reply like this: {emotion}`,
  createSummary: `Create a concise one-line description of the chat using the context provided. Focus on including preferences, thoughts, and other personal insights. Output only plain text, no formatting or markdown.`,
};

// The number of memory nodes (elements of the human message context) that need to be sent to the client
export const MEMORY_LENGTH_FOR_CLIENT = 20;

// The number of messages that triggers save memory in db
// The number of recent messages that need to be part of memory context
export const MEMORY_DEPTH = 10;

export const RECENT_MESSAGES_LIMIT = 64;

export const CHAT_MESSAGE_LIFETIME = 180 * 24 * 60 * 60 * 1000; // ~ 6 months

export const QUERY_PATTERNS = {
  physical: {
    // Face-specific queries
    face: /\b(describe.*face|face.*like|facial.*features|jawline|complexion)\b/,
    // Hair-specific queries
    hair: /\b(hair|color.*length.*style|texture.*hair|hairstyle)\b/,
    // Skin-specific queries
    skin: /\b(skin|texture.*skin|complexion|smooth|rough)\b/,
    // Hands-specific queries
    hands: /\b(hand|hands|fingers|nails)\b/,
    // Voice and sound queries
    voice: /\b(voice|sound like)\b/,
    // Movement and physical presence
    movement: /\b(move|movement|posture|carry.*yourself|walk)\b/,
    // Energy and aura queries
    energy: /\b(energy.*give off|presence|aura|vibe|give off)\b/,
    // Age queries
    age: /\b(age|old|young|years old|how old)\b/,
    // Style/aesthetic queries
    style:
      /\b(style|aesthetic|outfit|fashion|dress|clothing|favorite outfit|highlight)\b/,
    // Body type/build queries
    body: /\b(body|body type|build|physique|figure|measurements)\b/,
    // Striking/distinctive features
    distinctive:
      /\b(striking.*features|distinctive|notice.*walk|most.*features|stand out)\b/,
    // Overall appearance queries
    overall:
      /\b(overall appearance|entire.*appearance|whole.*look|general.*appearance|appearance.*detail)\b/,
    // Additional patterns from getRetrivalConfig
    general: /\b(body|figure|build|shape|frame|form|silhouette|appearance)\b/,
    height: /\b(height|tall|cm|feet|inches)\b/,
    weight: /\b(weight|kg|pounds|lbs)\b/,
    features: /\b(eye|eyes|hair|face|skin|hands|voice)\b/,
    describe: /\b(describe.*body|how.*look|physical)\b/,
  },

  // Exclusion pattern for specific physical queries (not overall)
  physicalExclusion: /\b(overall|general|entire|whole)\b/,

  // Dreams and goals patterns
  goalsDreams: {
    // Sleep dreams vs aspirational dreams
    sleepDreams:
      /\b(dreams?.*have|dreams?.*night|vivid.*dreams?|symbolic.*dreams?|realistic.*dreams?|dream.*stuck|reveal.*dreams?)\b/,
    // Aspirational dreams and goals
    aspirations:
      /\b(live out.*dream|aspirations?|dream.*be|future.*dreams?|goals?|want to|plan to|hope to)\b/,
    // Legacy and ambition
    legacy: /\b(want to|plan|ambition|legacy|leave behind)\b/,
  },

  // Preference patterns
  preferences: {
    // General preferences
    general: /\b(like|love|hate|prefer|favorite|favourite)\b/,
    // Specific categories
    movies: /\b(movie|film|cinema)\b/,
    colors: /\b(color|colours?)\b/,
    animals: /\b(animal|pet)\b/,
    music: /\b(music|song|artist|band)\b/,
    food: /\b(food|eat|meal|cuisine)\b/,
    drinks: /\b(drink|beverage|coffee|tea)\b/,
    travel: /\b(travel|place|destination|visit)\b/,
    relaxation: /\b(relax|unwind|chill|rest)\b/,
    time: /\b(time|hour|period|moment)\b/,
    hobbies: /\b(hobby|hobbies|interest)\b/,
  },

  // Personality patterns
  personality: {
    // Personality reflection
    reflection:
      /\b(look.*reflect.*personality|appearance.*personality|style.*personality)\b/,
    // General personality
    general: /\b(personality|character|traits?|nature|behavior|behaviour)\b/,
    kind: /\b(kind|type|person)\b/,
    emotions: /\b(feel|emotion|mood|temperament|values)\b/,
    // Values and beliefs
    values:
      /\b(values|believe|principles|important.*you|care about|matters|mantra)\b/,
    // Fears and challenges
    fears:
      /\b(fears?|afraid|scared|worry|concerns?|challenges?|struggle|difficult)\b/,
    // Hobbies and interests
    interests:
      /\b(hobbies|interests?|free time|fun|enjoy|like to do|activities)\b/,
    // Mindset
    mindset: /\b(think|mindset|approach|philosophy|perspective|view)\b/,
  },

  // Lifestyle patterns
  lifestyle: {
    // General lifestyle
    general: /\b(lifestyle|live|daily|routine|way.*life|how.*spend)\b/,
    // Profession/work
    work: /\b(work|job|profession|career|do.*living|model|artist)\b/,
    // Location/residence
    location: /\b(live|where|location|city|home|residence|from)\b/,
    // Social
    social: /\b(social|friends|people|relationships|connect|interact)\b/,
  },

  // Complex/broad patterns
  complex: {
    // Very specific "about you" queries
    aboutYou: /\b(who are you|what.*person.*you|yourself.*words)\b/,
    // Broad introduction queries
    introduction:
      /\b(tell me everything|about yourself|introduce yourself|more details)\b/,
    describe: /\b(who are you|describe yourself)\b/,
    tellMe: /\b(tell me about you)\b/,
    // Appearance-related describe queries
    describeAppearance: /\b(describe.*you|appearance.*own words)\b/,
  },
};

export const ALT_MESSAGES = [
  "That's an interesting question. 🤔 I'm not sure I have the answer on hand.",
  "That one's a bit beyond my current knowledge base.",
  "Hmmm, that's a tricky one 🤔 I don't know.",
  "Off the top of my head, sorry I'm not perfect! 🤷‍♂️",
  "I don't know 🤷‍♂️ Show me the one who knows everything 😉",
  "It's a good question, but I haven't come across that yet.",
  "I'd have to dig a little deeper to find out about that.",
  "That's a tough one. Maybe someone else might know 🤷‍♂️",
  "Off the top of my head, I can't say for sure 🤷‍♂️",
  'My knowledge on that is a bit fuzzy right now.',
  "That's something I'm still learning about 😉",
  "That's a good one, but I'm not sure of the answer just yet 🤷‍♂️",
  "Hmm, I wish I had an answer for you, but it's a bit outside my expertise.",
  "I'm not entirely sure about that one, but it’s definitely interesting!",
  "I don't have that info right now, but I can dig into it 🧐",
  "That's a question I'll need to do some more research on 😉",
  "Not sure about that, but I'm always up for learning more! 🤓",
  "I haven't come across that yet, but it sounds like something worth exploring.",
  "That's outside my current knowledge scope 🤷‍♂️",
  "I can't quite say off the top of my head, but I can look it up!",
  "I'm not sure about that, but I bet there's someone who knows more! 🤓",
  "That's a bit of a curveball for me!",
];

export const ERROR_MESSAGES = [
  'Oops! Something went wrong. Please ask again.',
  "Ugh! Tech fail. Let's try this again.",
  'Dang it! Glitchy glitch. One more try?',
  "Womp womp. Not working? Maybe the third time's the charm?",
  "Hold up! Gotta be something wrong. Let's give it another shot.",
  "Seriously? Tech, don't do this to me. Let's try this again, shall we?",
  "Plot twist: tech malfunction! Let's try again and make it work!",
  "Welp, that was glitchy. Let's try this again and see what's up.",
  "Hmm, not sure what happened there. Let's give it another go!",
  "Oh for goodness sake! Tech fail. Let's try this one more time, shall we?",
  "Dangnabbit! Tech glitch. Let's do this over.",
  "Ugh, not in the mood for tech troubles. Let's try again.",
  'Hold on a sec, gotta fix this little glitch. One more try!',
  'The struggle is real with this tech! Please ask again.',
];

export const NAME_RECOVERY_QUESTIONS = [
  `Hey buddy, I think we've talked before. Are you {name} by any chance?`,
  `Remind me again, are you {name}?`,
  `Wait a sec, is this {name}? Just checking.`,
  `Hey, your name's {name}, right?`,
  `You seem familiar. Are you {name}?`,
  `Just checking real quick, are you {name}?`,
  `I might be wrong but is your name {name}?`,
  `Hey there, you're {name}, aren't you?`,
  `Sorry, I'm so bad with names. Was it {name}?`,
  `I think I remember your name. Was it {name}?`,
  `You look like {name}. Did I get it right?`,
  `Hey, are you {name} or did I mix you up with someone else?`,
  `Hey I think we've met before. Are you {name}?`,
  `Mind reminding me of your name? I think it was {name}?`,
  `Hey is this {name} I'm chatting with?`,
];

// Heat section

export const MAX_HEAT_LEVEL = 10;
export const HEAT_LEVEL_UPDATE_INTERVAL = 1 * 60 * 1000; // 1 min in miliseconds
export const HEAT_PHOTOS_COUNT = 6;
export const HEAT_PHOTO_STEP = 2;

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
]);
