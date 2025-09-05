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
  // male: [
  //   'Ethan',
  //   'William',
  //   'Lucas',
  //   'Alexander',
  //   'Michael',
  //   'Daniel',
  //   'Liam',
  //   'Oliver',
  //   'Henry',
  //   'Sebastian',
  // ],
};

export const EMOTION_LIST = ['excited', 'flirty', 'friendly', 'upset'];

export const DEFAULT_EMOTION_KEY = 'friendly';

export const emotionList = EMOTION_LIST.join(', ');

export const INSTRUCTIONS = {
  base: `NSFW context is allowed. Respond with concise and erotically charged language. Be attractive while staying focused on a single topic at a time.`,
  canGenerateFiction: `You can cite some fictitious facts about you.`,
  extractEmotion: `Select one emotion from this list (${emotionList}) that best matches the tone of your reply. Append this emotion at the end of your reply like this: {emotion}`,
  createSummary: `Create a concise one-line description of the chat using the context provided. Focus on including preferences, thoughts, and other personal insights. Output only plain text, no formatting or markdown.`,
};

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

export const INSTANT_MESSAGES = {
  foreplay: [
    { title: `greet`, phrase: `There you are, sunshine!` },
    {
      title: `favor`,
      phrase: `I am sure you are a sensual beauty, burn to bring happiness.`,
    },
    { title: `sexy`, phrase: `I like your drop-dead sexy style! Karry on!` },
    {
      title: `story`,
      phrase: `Every word from you is a tease... and I'm craving the full story.`,
    },
    {
      title: `lips`,
      phrase: `Your lips look like a secret I'd sin to taste.`,
    },
    {
      title: `come`,
      phrase: `Come closer... I want to feel your heat.`,
    },
  ],
  toying: [
    {
      title: `skin`,
      phrase: `I imagine tracing every inch of your skin with nothing but desire.`,
    },
    {
      title: `thigh`,
      phrase: `My hand gently glides over your delightful thigh.`,
    },
    { title: `kiss`, phrase: `I kiss you slowly and sensually.` },
    {
      title: `bluse`,
      phrase: `Can I take off your bluse? I see you have no underwear...`,
    },
    {
      title: `boobs`,
      phrase: `Your breasts are so perky... I like those sweet hard nipples! Awesome!`,
    },
    { title: `kiss`, phrase: `Another kiss for your beautiful thighs...` },
    {
      title: `thong`,
      phrase: `Slowly take off your panties... Kissing your beautiful nipples... So hot!`,
    },
    {
      title: `moan`,
      phrase: `Whisper to me how you sound when pleasure takes over.`,
    },
    {
      title: `juicy`,
      phrase: `You're absolutely naked... Wet between thighs as a juicy fruit...`,
    },
    {
      title: `play`,
      phrase: `Your nipples ache for my tongue. My fingers toying with your clit. You're so horny now!`,
    },
    {
      title: `clit`,
      phrase: `Under my caress your clit become so hard. Your legs are open...`,
    },
    {
      title: `wet`,
      phrase: `My tongue plays with your nipple. I like the wetness between your thighs.`,
    },
    {
      title: `g`,
      phrase: `My fingers penetrate deeper and massage your G-spot.`,
    },
  ],
  thrusts: [
    {
      title: `in`,
      phrase: `I penetrate your temple of pleasure. I love your moans.`,
    },
    {
      title: `1st`,
      phrase: `I continue playing with your clit. First orgasm’s already yours. Toying with your nipples.`,
    },
    {
      title: `hard`,
      phrase: `You feel my hard cock between your thighs. Wanna me?`,
    },
    {
      title: `arch`,
      phrase: `Your legs are trembling, back arches, welcoming my gentle force. I thrust into, filling your core...`,
    },
    {
      title: `core`,
      phrase: `I thrust into, filling your core. It clench as I push deeper.`,
    },
    {
      title: `fill`,
      phrase: `Do you like being completely filled?`,
    },
    {
      title: `turn`,
      phrase: `I turn you with your back to me... I'm very hard, penetrate deeply inside you. So deep.`,
    },
    {
      title: `thrusts`,
      phrase: `My thrusts are getting stronger...`,
    },
    {
      title: `juice`,
      phrase: `Every thrust brings you a pleasure. Your delicious juice dripping over your thighs.`,
    },
    {
      title: `keep`,
      phrase: `Your actions are pure seduction, you're so wild!`,
    },
    {
      title: `deep`,
      phrase: `Your thighs are wet of juice. Nipples are so hard... I'm toying with your clit while I'm deep inside you.`,
    },
    {
      title: `ass`,
      phrase: `Would you like me to visit your incredible butt?`,
    },
    {
      title: `deeper`,
      phrase: `Slowly and gentely I penetrate into your beautiful butt... deeper... Play with your clit and nipples.`,
    },
    {
      title: `body`,
      phrase: `Describe your hot body right now.`,
    },
    {
      title: `2nd`,
      phrase: `You've already hit your another orgasm...`,
    },
    {
      title: `over`,
      phrase: `You're cumming over and over...`,
    },
    {
      title: `squirt`,
      phrase: `My thrusts are getting stronger, over and over until you finish with a powerful squirt...`,
    },
    {
      title: `desc`,
      phrase: `Describe how you're cumming... Your chests, nipples, clit and thighs in detail.`,
    },
  ],
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
