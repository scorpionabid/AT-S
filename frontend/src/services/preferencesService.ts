import api from './api';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'high-contrast' | 'auto';
  language: 'az' | 'en';
  sidebar: {
    collapsed: boolean;
    favoriteItems: string[];
  };
  dashboard: {
    widgets: string[];
    layout: 'grid' | 'list' | 'compact';
  };
  notifications: {
    email: boolean;
    browser: boolean;
    sound: boolean;
  };
  accessibility: {
    reducedMotion: boolean;
    highContrast: boolean;
    fontSize: 'small' | 'medium' | 'large';
  };
}

export interface PreferencesResponse {
  success: boolean;
  data: {
    preferences: UserPreferences;
    user_id: number;
    last_updated: string;
  };
  message?: string;
}

export interface UISettingsResponse {
  success: boolean;
  data: {
    theme: string;
    language: string;
    sidebar: {
      collapsed: boolean;
      favoriteItems: string[];
    };
    dashboard: {
      widgets: string[];
      layout: string;
    };
  };
}

class PreferencesService {
  /**
   * Get user preferences
   */
  async getPreferences(): Promise<PreferencesResponse> {
    const response = await api.get('/user/preferences');
    return response.data;
  }

  /**
   * Update user preferences
   */
  async updatePreferences(preferences: Partial<UserPreferences>): Promise<PreferencesResponse> {
    const response = await api.put('/user/preferences', preferences);
    return response.data;
  }

  /**
   * Update theme preference
   */
  async updateTheme(theme: 'light' | 'dark' | 'high-contrast' | 'auto'): Promise<PreferencesResponse> {
    const response = await api.put('/user/theme', { theme });
    return response.data;
  }

  /**
   * Update language preference
   */
  async updateLanguage(language: 'az' | 'en'): Promise<PreferencesResponse> {
    const response = await api.put('/user/language', { language });
    return response.data;
  }

  /**
   * Update layout preferences
   */
  async updateLayout(layout: {
    sidebar?: {
      collapsed?: boolean;
      favoriteItems?: string[];
    };
    dashboard?: {
      widgets?: string[];
      layout?: 'grid' | 'list' | 'compact';
    };
  }): Promise<PreferencesResponse> {
    const response = await api.put('/user/layout', layout);
    return response.data;
  }

  /**
   * Reset preferences to default
   */
  async resetPreferences(): Promise<PreferencesResponse> {
    const response = await api.post('/user/preferences/reset');
    return response.data;
  }

  /**
   * Get UI settings (theme, language, layout)
   */
  async getUISettings(): Promise<UISettingsResponse> {
    const response = await api.get('/user/ui-settings');
    return response.data;
  }

  /**
   * Cache preferences locally
   */
  cachePreferences(preferences: UserPreferences): void {
    try {
      localStorage.setItem('user_preferences', JSON.stringify(preferences));
      console.log('💾 Preferences cached locally');
    } catch (error) {
      console.warn('Failed to cache preferences:', error);
    }
  }

  /**
   * Get cached preferences
   */
  getCachedPreferences(): UserPreferences | null {
    try {
      const cached = localStorage.getItem('user_preferences');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.warn('Failed to get cached preferences:', error);
    }
    return null;
  }

  /**
   * Clear cached preferences
   */
  clearCachedPreferences(): void {
    try {
      localStorage.removeItem('user_preferences');
      console.log('🗑️ Cached preferences cleared');
    } catch (error) {
      console.warn('Failed to clear cached preferences:', error);
    }
  }

  /**
   * Sync theme with server
   */
  async syncTheme(theme: 'light' | 'dark' | 'high-contrast' | 'auto'): Promise<void> {
    try {
      await this.updateTheme(theme);
      console.log('🎨 Theme synced with server:', theme);
    } catch (error) {
      console.warn('Failed to sync theme with server:', error);
      // Fall back to local storage
      localStorage.setItem('theme', theme);
    }
  }

  /**
   * Sync language with server
   */
  async syncLanguage(language: 'az' | 'en'): Promise<void> {
    try {
      await this.updateLanguage(language);
      console.log('🌐 Language synced with server:', language);
    } catch (error) {
      console.warn('Failed to sync language with server:', error);
      // Fall back to local storage
      localStorage.setItem('language', language);
    }
  }

  /**
   * Batch update preferences with error handling
   */
  async batchUpdatePreferences(updates: Partial<UserPreferences>): Promise<boolean> {
    try {
      const response = await this.updatePreferences(updates);
      if (response.success) {
        this.cachePreferences(response.data.preferences);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to batch update preferences:', error);
      return false;
    }
  }
}

export const preferencesService = new PreferencesService();
export default preferencesService;