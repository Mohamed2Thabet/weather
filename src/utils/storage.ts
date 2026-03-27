import { User, SearchHistoryItem } from '@/types';

const STORAGE_KEYS = {
  USER: 'weather_app_user',
  SEARCH_HISTORY_PREFIX: 'weather_app_search_history',
} as const;

// User storage
export const saveUser = (user: User): void => {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
};

export const getUser = (): User | null => {
  const data = localStorage.getItem(STORAGE_KEYS.USER);
  return data ? JSON.parse(data) : null;
};

export const removeUser = (): void => {
  localStorage.removeItem(STORAGE_KEYS.USER);
};

// Helper to generate user-specific storage key
const getUserHistoryKey = (userEmail: string): string => {
  // Sanitize email to create a valid storage key
  const sanitizedEmail = userEmail.toLowerCase().replace(/[^a-z0-9]/g, '_');
  return `${STORAGE_KEYS.SEARCH_HISTORY_PREFIX}_${sanitizedEmail}`;
};

// Search history storage (user-scoped)
export const saveSearchHistory = (userEmail: string, history: SearchHistoryItem[]): void => {
  const key = getUserHistoryKey(userEmail);
  localStorage.setItem(key, JSON.stringify(history));
};

export const getSearchHistory = (userEmail: string): SearchHistoryItem[] => {
  const key = getUserHistoryKey(userEmail);
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

export const addToSearchHistory = (userEmail: string, item: SearchHistoryItem): void => {
  const history = getSearchHistory(userEmail);
  
  // Remove duplicate if exists (case-insensitive comparison)
  const filtered = history.filter(
    (h) => h.city.toLowerCase() !== item.city.toLowerCase()
  );
  
  // Add new item at the beginning, keep last 10
  const updated = [item, ...filtered].slice(0, 10);
  saveSearchHistory(userEmail, updated);
};

// Clear user-specific search history (useful for logout or data cleanup)
export const clearSearchHistory = (userEmail: string): void => {
  const key = getUserHistoryKey(userEmail);
  localStorage.removeItem(key);
};
