import i18n from 'i18next';

// This function initializes i18n with the specified language
export const initI18n = async (lng: string = 'en'): Promise<typeof i18n> => {
  try {
    // Dynamically import the translation file for the specified language
    const translations = await import(`../locales/${lng}/common.json`);
    
    // Add the translations to i18n
    i18n.addResourceBundle(lng, 'common', translations.default || translations);
    
    // Change the language if needed
    if (i18n.language !== lng) {
      await i18n.changeLanguage(lng);
    }
    
    return i18n;
  } catch (error) {
    console.error(`Failed to load translations for ${lng}:`, error);
    // Fall back to English if the requested language fails to load
    if (lng !== 'en') {
      return initI18n('en');
    }
    throw error;
  }
};

export default initI18n;
