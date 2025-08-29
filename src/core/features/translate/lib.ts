import * as deepl from 'deepl-node';

import logger from '@/core/utils/logger';

// Extend the global object with DeepL client property
const globalWithDeepL = global as typeof global & {
  _deeplClient?: {
    client: deepl.Translator | null;
  };
};

// Initialize cache
const deeplCache =
  globalWithDeepL._deeplClient ??
  (globalWithDeepL._deeplClient = { client: null });

// Result type for operations
export type DeepLOperationResult = string | null;

// Configuration interface
interface DeepLConfig {
  apiKey: string;
  options?: deepl.TranslatorOptions;
}

// Shared configuration function
const getDeepLConfig = (): DeepLConfig => {
  const apiKey = process.env.DEEPL_API_KEY;

  if (!apiKey) {
    throw new Error('DeepL: DEEPL_API_KEY environment variable is not defined');
  }

  const options: deepl.TranslatorOptions = {
    // Add any default DeepL client options here
    // serverUrl: 'https://api.deepl.com', // for pro accounts
  };

  return { apiKey, options };
};

// Initialize DeepL client
const initializeClient = async (): Promise<DeepLOperationResult> => {
  if (deeplCache.client) return null; // Already initialized

  try {
    const { apiKey, options } = getDeepLConfig();
    deeplCache.client = new deepl.Translator(apiKey, options);

    logger.info('[Debug] DeepL: Client initialized successfully');
    return null;
  } catch (error) {
    console.error(error);
    deeplCache.client = null;
    const errMsg = 'DeepL: Client initialization failed';
    logger.error(errMsg);
    return errMsg;
  }
};

// Core translation method
const translateText = async (
  text: string,
  sourceLang: deepl.SourceLanguageCode | null,
  targetLang: deepl.TargetLanguageCode,
  options?: deepl.TranslateTextOptions
): Promise<{ result?: deepl.TextResult; error?: string }> => {
  const initError = await initializeClient();
  if (initError) {
    return { error: initError };
  }

  try {
    if (!deeplCache.client) {
      return { error: 'DeepL: Client not initialized' };
    }

    const result = await deeplCache.client.translateText(
      text,
      sourceLang,
      targetLang,
      options
    );
    logger.info(`[Debug] DeepL: Successfully translated text to ${targetLang}`);
    return { result };
  } catch (error) {
    console.error(error);
    const errMsg = `DeepL: Translation failed - ${
      error instanceof Error ? error.message : 'Unknown error'
    }`;
    logger.error(errMsg);
    return { error: errMsg };
  }
};

// // Get available languages
// const getLanguages = async (): Promise<{
//   sourceLanguages?: deepl.SourceLanguageCode[];
//   targetLanguages?: deepl.TargetLanguageCode[];
//   error?: string;
// }> => {
//   const initError = await initializeClient();
//   if (initError) {
//     return { error: initError };
//   }

//   try {
//     if (!deeplCache.client) {
//       return { error: 'DeepL: Client not initialized' };
//     }

//     const [sourceLanguagesRaw, targetLanguagesRaw] = await Promise.all([
//       deeplCache.client.getSourceLanguages(),
//       deeplCache.client.getTargetLanguages(),
//     ]);

//     const sourceLanguages = sourceLanguagesRaw.map(
//       (lang) => lang.code as deepl.SourceLanguageCode
//     );
//     const targetLanguages = targetLanguagesRaw.map(
//       (lang) => lang.code as deepl.TargetLanguageCode
//     );

//     logger.info('[Debug] DeepL: Successfully retrieved available languages');
//     return { sourceLanguages, targetLanguages };
//   } catch (error) {
//     console.error(error);
//     const errMsg = `DeepL: Failed to retrieve languages - ${
//       error instanceof Error ? error.message : 'Unknown error'
//     }`;
//     logger.error(errMsg);
//     return { error: errMsg };
//   }
// };

// Public API
export const deepL = {
  translateText,
  // getLanguages,
  isInitialized: (): boolean => {
    return deeplCache.client !== null;
  },
  getUsage: async (): Promise<{ usage?: deepl.Usage; error?: string }> => {
    const initError = await initializeClient();
    if (initError) {
      return { error: initError };
    }

    try {
      if (!deeplCache.client) {
        return { error: 'DeepL: Client not initialized' };
      }

      const usage = await deeplCache.client.getUsage();
      return { usage };
    } catch (error) {
      console.error(error);
      const errMsg = `DeepL: Failed to retrieve usage - ${
        error instanceof Error ? error.message : 'Unknown error'
      }`;
      logger.error(errMsg);
      return { error: errMsg };
    }
  },
};
