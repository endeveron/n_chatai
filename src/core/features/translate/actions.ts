'use server';

import * as deepl from 'deepl-node';

import { deepL } from '@/core/features/translate/lib';
import { ServerActionResult } from '@/core/types/common';
import { glossaryEntries } from '@/core/features/translate/glossary';

// Server action for text translation
export async function translateText({
  text,
  sourceLang = 'en',
  targetLang = 'uk',
  options,
}: {
  text: string;
  sourceLang: deepl.SourceLanguageCode;
  targetLang: deepl.TargetLanguageCode;
  options?: deepl.TranslateTextOptions;
}): Promise<ServerActionResult<string>> {
  try {
    const { result, error } = await deepL.translateWithGlossary(
      text,
      sourceLang,
      targetLang,
      glossaryEntries,
      options
    );

    if (error) {
      return {
        success: false,
        error: new Error(error),
      };
    }

    if (!result) {
      return {
        success: false,
        error: new Error('No translation result received'),
      };
    }

    return {
      success: true,
      data: result.text,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error : new Error('Unknown error occurred'),
    };
  }
}

// Server action to get API usage information
export async function getUsage(): Promise<ServerActionResult<deepl.Usage>> {
  try {
    const { usage, error } = await deepL.getUsage();

    if (error) {
      return {
        success: false,
        error: new Error(error),
      };
    }

    if (!usage) {
      return {
        success: false,
        error: new Error('Failed to retrieve usage information'),
      };
    }

    return {
      success: true,
      data: usage,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error : new Error('Unknown error occurred'),
    };
  }
}

// Server action to list all glossaries
export async function listAllGlossaries(): Promise<
  ServerActionResult<deepl.GlossaryInfo[]>
> {
  try {
    const { glossaries, error } = await deepL.listGlossaries();

    if (error) {
      return {
        success: false,
        error: new Error(error),
      };
    }

    if (!glossaries) {
      return {
        success: false,
        error: new Error('Failed to retrieve glossaries'),
      };
    }

    return {
      success: true,
      data: glossaries,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error : new Error('Unknown error occurred'),
    };
  }
}

// Server action to delete specific glossaries
export async function deleteGlossariesAction(glossaryIds: string[]): Promise<
  ServerActionResult<{
    results: { id: string; success: boolean; error?: string }[];
    totalDeleted: number;
  }>
> {
  try {
    const result = await deepL.deleteGlossaries(glossaryIds);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error : new Error('Unknown error occurred'),
    };
  }
}

// Server action to delete ALL glossaries (use with caution!)
export async function deleteAllGlossariesAction(): Promise<
  ServerActionResult<{
    results: { id: string; success: boolean; error?: string }[];
    totalDeleted: number;
  }>
> {
  try {
    const result = await deepL.deleteAllGlossaries();

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error : new Error('Unknown error occurred'),
    };
  }
}

// // Server action to get available languages
// export async function getAvailableLanguages(): Promise<{
//   success: boolean;
//   data?: {
//     sourceLanguages: deepl.SourceLanguageCode[];
//     targetLanguages: deepl.TargetLanguageCode[];
//   };
//   error?: string;
// }> {
//   try {
//     const { sourceLanguages, targetLanguages, error } =
//       await deepL.getLanguages();

//     if (error) {
//       return {
//         success: false,
//         error,
//       };
//     }

//     if (!sourceLanguages || !targetLanguages) {
//       return {
//         success: false,
//         error: 'Failed to retrieve language lists',
//       };
//     }

//     return {
//       success: true,
//       data: {
//         sourceLanguages,
//         targetLanguages,
//       },
//     };
//   } catch (error) {
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : 'Unknown error occurred',
//     };
//   }
// }
