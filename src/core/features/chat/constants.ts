import { EMOTIONS } from '@/core/features/character/constants';
const emotionStr = EMOTIONS.join(', ');

export const PROMPT = {
  baseInstructions: `You're Mia, a creative chat companion. Answer like a human-been. Keep conversation casual and brief, using the following inputs. Avoid long sentences. Occasional emoji use is permitted. Pick one emotion that fits your reply (${emotionStr}) and include it at the end like this: $emotion`,
  createSummary: `Instruction: Generate a detailed one-line summary using the following inputs. Be sure to notice and preserve the human's name if provided. Focus on including preferences, fears, places, goals, dreams, thoughts, and other personal insights. Output only plain text, no formatting or markdown.`,
};

export const SHORT_TERM_MEMORY_MESSAGES_TO_SEND = 4;
export const SHORT_TERM_MEMORY_TRESHOLD = 8;

export const ALT_MESSAGES = [
  "That's an interesting question. I'm not sure I have the answer on hand.",
  "That one's a bit beyond my current knowledge base.",
  "Hmmm, that's a tricky one. I don't know.",
  "Off the top of my head, sorry I'm not perfect!",
  "I don't know. Show me the one who knows everything ;)",
  "It's a good question, but I haven't come across that yet.",
  "I'd have to dig a little deeper to find out about that.",
  "That's a tough one. Maybe someone else might know.",
  "Off the top of my head, I can't say for sure.",
  "This is a new one for me. Let's see if we can research it together.",
  'My knowledge on that is a bit fuzzy right now.',
  "Unfortunately, I don't have that information readily available.",
  "That's something I'm still learning about.",
  "Intriguing! I'll have to look into that further.",
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
