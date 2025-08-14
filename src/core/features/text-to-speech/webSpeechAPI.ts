// This module uses the SpeechSynthesis interface of the Web Speech API

let cachedVoices: SpeechSynthesisVoice[] | null = null;
let cachedFemaleVoice: SpeechSynthesisVoice | null = null;

export const webSpeechAPI = {
  getVoicesAsync: async (): Promise<SpeechSynthesisVoice[]> => {
    return getVoicesAsync();
  },

  selectFemaleVoice: (): SpeechSynthesisVoice | undefined => {
    if (cachedVoices) {
      return selectFemaleVoice(cachedVoices);
    } else {
      console.warn('Voices not loaded yet.');
      return undefined;
    }
  },

  speakWithFemaleVoiceAsync: async (text: string): Promise<void> => {
    return speakWithFemaleVoiceAsync(text);
  },
};

async function speakWithFemaleVoiceAsync(text: string) {
  const voices = await getVoicesAsync();
  const voice = selectFemaleVoice(voices);

  const utterance = new SpeechSynthesisUtterance(text);
  if (voice) utterance.voice = voice;

  window.speechSynthesis.speak(utterance);
}

function getVoicesAsync(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const voices = speechSynthesis.getVoices();
    if (voices.length) {
      // voices.forEach((voice, i) => {
      //   console.log(
      //     `${i + 1}. ${voice.name} — ${voice.lang} ${
      //       voice.default ? '(default)' : ''
      //     }`
      //   );
      // });

      cachedVoices = voices;
      resolve(voices);
      return;
    }
    speechSynthesis.onvoiceschanged = () => {
      cachedVoices = speechSynthesis.getVoices();
      resolve(cachedVoices);
    };
  });
}

function selectFemaleVoice(
  voices: SpeechSynthesisVoice[]
): SpeechSynthesisVoice | undefined {
  // Google UK English Female — en-GB
  // Microsoft Zira - English (United States) — en-US
  const preferredNames = [
    'Google UK English Female',
    'Microsoft Zira', // Windows
    'Samantha', // macOS
  ];

  // Try to find and cache a voice matching the preferred list
  // Prioritize based on preferredNames order
  for (const preferredName of preferredNames) {
    const match = voices.find((v) => v.name === preferredName);
    if (match) {
      cachedFemaleVoice = match;
      return cachedFemaleVoice;
    }
  }

  // Fallbacks
  cachedFemaleVoice =
    voices.find((v) => v.name.toLowerCase().includes('female')) || voices[0];

  return cachedFemaleVoice;
}
