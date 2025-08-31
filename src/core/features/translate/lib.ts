import * as deepl from 'deepl-node';

import logger from '@/core/utils/logger';

// Extend the global object with DeepL client property
const globalWithDeepL = global as typeof global & {
  _deeplClient?: {
    client: deepl.Translator | null;
    glossary?: deepl.GlossaryInfo | null;
  };
};

// Initialize cache
const deeplCache =
  globalWithDeepL._deeplClient ??
  (globalWithDeepL._deeplClient = {
    client: null,
    glossary: null,
  });

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

// Create or get glossary
const getGlossary = async ({
  name,
  sourceLang,
  targetLang,
  entries,
}: {
  name: string;
  sourceLang: deepl.SourceLanguageCode;
  targetLang: deepl.TargetLanguageCode;
  entries?: deepl.GlossaryEntries;
}): Promise<{ glossary?: deepl.GlossaryInfo; error?: string }> => {
  const initError = await initializeClient();
  if (initError) {
    return { error: initError };
  }

  try {
    if (!deeplCache.client) {
      return { error: 'DeepL: Client not initialized' };
    }

    // Return cached glossary if available and matches the requested configuration
    if (
      deeplCache.glossary &&
      deeplCache.glossary.name === name &&
      deeplCache.glossary.sourceLang === sourceLang &&
      deeplCache.glossary.targetLang === targetLang
    ) {
      logger.info(`[Debug] DeepL: Using cached glossary "${name}"`);
      return { glossary: deeplCache.glossary };
    }

    // Check if glossary already exists on DeepL servers
    const existingGlossaries = await deeplCache.client.listGlossaries();
    const existingGlossary = existingGlossaries.find(
      (g) =>
        g.name === name &&
        g.sourceLang === sourceLang &&
        g.targetLang === targetLang
    );

    if (existingGlossary) {
      // Cache and return existing glossary
      deeplCache.glossary = existingGlossary;
      logger.info(`[Debug] DeepL: Found existing glossary "${name}"`);
      return { glossary: existingGlossary };
    }

    // Create new glossary if entries are provided
    if (!entries || Object.keys(entries).length === 0) {
      return {
        error:
          'DeepL: No entries provided for glossary creation and no existing glossary found',
      };
    }

    const newGlossary = await deeplCache.client.createGlossary(
      name,
      sourceLang,
      targetLang,
      entries
    );

    // Cache the new glossary
    deeplCache.glossary = newGlossary;
    logger.info(
      `[Debug] DeepL: Created new glossary "${name}" with ${
        Object.keys(entries).length
      } entries`
    );

    return { glossary: newGlossary };
  } catch (error) {
    console.error(error);
    const errMsg = `DeepL: Glossary operation failed - ${
      error instanceof Error ? error.message : 'Unknown error'
    }`;
    logger.error(errMsg);
    return { error: errMsg };
  }
};

// List all glossaries
const listGlossaries = async (): Promise<{
  glossaries?: deepl.GlossaryInfo[];
  error?: string;
}> => {
  const initError = await initializeClient();
  if (initError) {
    return { error: initError };
  }

  try {
    if (!deeplCache.client) {
      return { error: 'DeepL: Client not initialized' };
    }

    const glossaries = await deeplCache.client.listGlossaries();
    logger.info(`[Debug] DeepL: Found ${glossaries.length} glossaries`);

    return { glossaries };
  } catch (error) {
    console.error(error);
    const errMsg = `DeepL: Failed to list glossaries - ${
      error instanceof Error ? error.message : 'Unknown error'
    }`;
    logger.error(errMsg);
    return { error: errMsg };
  }
};

// Delete a specific glossary by ID
const deleteGlossary = async (
  glossaryId: string
): Promise<{ success?: boolean; error?: string }> => {
  const initError = await initializeClient();
  if (initError) {
    return { error: initError };
  }

  try {
    if (!deeplCache.client) {
      return { error: 'DeepL: Client not initialized' };
    }

    await deeplCache.client.deleteGlossary(glossaryId);

    // Clear cached glossary if it matches the deleted one
    if (deeplCache.glossary && deeplCache.glossary.glossaryId === glossaryId) {
      deeplCache.glossary = null;
    }

    logger.info(`[Debug] DeepL: Successfully deleted glossary ${glossaryId}`);
    return { success: true };
  } catch (error) {
    console.error(error);
    const errMsg = `DeepL: Failed to delete glossary ${glossaryId} - ${
      error instanceof Error ? error.message : 'Unknown error'
    }`;
    logger.error(errMsg);
    return { error: errMsg };
  }
};

// Delete multiple glossaries by IDs
const deleteGlossaries = async (
  glossaryIds: string[]
): Promise<{
  results: { id: string; success: boolean; error?: string }[];
  totalDeleted: number;
}> => {
  const results: { id: string; success: boolean; error?: string }[] = [];
  let totalDeleted = 0;

  for (const glossaryId of glossaryIds) {
    const result = await deleteGlossary(glossaryId);

    if (result.success) {
      results.push({ id: glossaryId, success: true });
      totalDeleted++;
    } else {
      results.push({ id: glossaryId, success: false, error: result.error });
    }
  }

  logger.info(
    `[Debug] DeepL: Deleted ${totalDeleted}/${glossaryIds.length} glossaries`
  );

  return { results, totalDeleted };
};

// Delete all glossaries (use with caution!)
const deleteAllGlossaries = async (): Promise<{
  results: { id: string; success: boolean; error?: string }[];
  totalDeleted: number;
}> => {
  const { glossaries, error } = await listGlossaries();

  if (error || !glossaries) {
    return {
      results: [],
      totalDeleted: 0,
    };
  }

  const glossaryIds = glossaries.map((g) => g.glossaryId);
  return deleteGlossaries(glossaryIds);
};

// Helper function to translate with your predefined glossary
const translateWithGlossary = async (
  text: string,
  sourceLang: deepl.SourceLanguageCode,
  targetLang: deepl.TargetLanguageCode,
  glossaryEntries: deepl.GlossaryEntries,
  options?: deepl.TranslateTextOptions
): Promise<{ result?: deepl.TextResult; error?: string }> => {
  return translateText(text, sourceLang, targetLang, {
    ...options,
    useGlossary: true,
    glossaryName: `glossary-${sourceLang}-${targetLang}`,
    glossaryEntries,
  });
};

// Core translation method
const translateText = async (
  text: string,
  sourceLang: deepl.SourceLanguageCode | null,
  targetLang: deepl.TargetLanguageCode,
  options?: deepl.TranslateTextOptions & {
    useGlossary?: boolean;
    glossaryName?: string;
    glossaryEntries?: deepl.GlossaryEntries;
  }
): Promise<{ result?: deepl.TextResult; error?: string }> => {
  const initError = await initializeClient();
  if (initError) {
    return { error: initError };
  }

  try {
    if (!deeplCache.client) {
      return { error: 'DeepL: Client not initialized' };
    }

    let translationOptions = { ...options };

    // Handle glossary if requested
    if (options?.useGlossary && sourceLang) {
      const glossaryName = options.glossaryName || 'default-glossary';

      // Get or create glossary
      const { glossary, error: glossaryError } = await getGlossary({
        name: glossaryName,
        sourceLang,
        targetLang,
        entries: options.glossaryEntries,
      });

      if (glossaryError) {
        logger.warn(
          `[Debug] DeepL: Glossary error, proceeding without glossary - ${glossaryError}`
        );
      } else if (glossary) {
        // Add glossary to translation options
        translationOptions = {
          ...translationOptions,
          glossary: glossary.glossaryId,
        };
        logger.info(
          `[Debug] DeepL: Using glossary "${glossaryName}" for translation`
        );
      }
    }

    // Remove custom options that aren't part of DeepL's TranslateTextOptions
    const { useGlossary, glossaryName, glossaryEntries, ...deeplOptions } =
      translationOptions;

    // Use void operator to explicitly mark variables as intentionally unused
    void useGlossary;
    void glossaryName;
    void glossaryEntries;

    const result = await deeplCache.client.translateText(
      text,
      sourceLang,
      targetLang,
      deeplOptions
    );

    logger.info(
      `[Debug] DeepL: Successfully translated text to ${targetLang}${
        options?.useGlossary ? ' with glossary' : ''
      }`
    );
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
  // Glossary operations
  getGlossary,
  listGlossaries,
  deleteGlossary,
  deleteGlossaries,
  deleteAllGlossaries,

  // Translation operations
  translateText,
  translateWithGlossary,

  // Utility operations
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
