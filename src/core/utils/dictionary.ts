import { LangCode, NavbarTranslation } from '@/core/types/translation';

const NavbarLoadersMap = new Map<string, () => Promise<NavbarTranslation>>([
  [
    'en',
    () =>
      import('@/core/locales/en/navbar.json').then(
        (module) => module.default as NavbarTranslation
      ),
  ],
  [
    'uk',
    () =>
      import('@/core/locales/uk/navbar.json').then(
        (module) => module.default as NavbarTranslation
      ),
  ],
]);

// Utility function to save the lang code in the Local Storage
export const storeLangCode = (langCode: LangCode = 'en'): LangCode => {
  return langCode;
};

// Utility function to get all supported languages
export const getSupportedLanguages = (): LangCode[] => {
  return Object.keys(NavbarLoadersMap) as LangCode[];
};

/**
 * Gets localized data for Navbar for the specified language code
 * @param langCode Language code (e.g., 'en', 'uk')
 * @returns Promise resolving to data of type NavbarTranslation
 * @throws Error if both requested language and fallback language fail to load
 */
export const getNavbarTranslation = async (
  langCode: LangCode = 'en'
): Promise<NavbarTranslation> => {
  // Try to get the loader for the requested language
  const loader = NavbarLoadersMap.get(langCode);
  const errMsg = `Failed to load translations for Navbar`;
  if (!loader) throw new Error(errMsg);

  try {
    // Load the translation
    const translation = await loader();
    return translation;
  } catch (error) {
    // If requested language fails and it's not English, try English as fallback
    if (langCode !== 'en') {
      const fallbackLoader = NavbarLoadersMap.get('en');
      if (fallbackLoader) {
        try {
          return await fallbackLoader();
        } catch (fallbackError) {
          throw new Error(`${errMsg}: ${fallbackError}`);
        }
      }
    }
    throw new Error(`${errMsg}: ${error}`);
  }
};
