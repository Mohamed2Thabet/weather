/**
 * ALTERNATIVE IMPLEMENTATION: Single Object Approach
 * 
 * This file demonstrates the alternative approach of storing all users'
 * search history in a single localStorage object.
 * 
 * NOT USED IN PRODUCTION - For reference only
 */

import { User, SearchHistoryItem } from '@/types';

const STORAGE_KEYS = {
  USER: 'weather_app_user',
  ALL_SEARCH_HISTORY: 'weather_app_all_search_history',
} as const;

interface AllUserHistory {
  [userEmail: string]: SearchHistoryItem[];
}

// User storage (same as main implementation)
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

// Search history storage - Single object approach
const getAllHistory = (): AllUserHistory => {
  const data = localStorage.getItem(STORAGE_KEYS.ALL_SEARCH_HISTORY);
  return data ? JSON.parse(data) : {};
};

const saveAllHistory = (allHistory: AllUserHistory): void => {
  localStorage.setItem(STORAGE_KEYS.ALL_SEARCH_HISTORY, JSON.stringify(allHistory));
};

export const getSearchHistory = (userEmail: string): SearchHistoryItem[] => {
  const allHistory = getAllHistory();
  return allHistory[userEmail] || [];
};

export const saveSearchHistory = (userEmail: string, history: SearchHistoryItem[]): void => {
  const allHistory = getAllHistory();
  allHistory[userEmail] = history;
  saveAllHistory(allHistory);
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

export const clearSearchHistory = (userEmail: string): void => {
  const allHistory = getAllHistory();
  delete allHistory[userEmail];
  saveAllHistory(allHistory);
};

// Additional utility: Get all users who have search history
export const getAllUsersWithHistory = (): string[] => {
  const allHistory = getAllHistory();
  return Object.keys(allHistory);
};

// Additional utility: Get total number of searches across all users
export const getTotalSearchCount = (): number => {
  const allHistory = getAllHistory();
  return Object.values(allHistory).reduce((total, history) => total + history.length, 0);
};

/**
 * COMPARISON:
 * 
 * Pros of Single Object Approach:
 * - All data in one place
 * - Easy to get statistics across all users
 * - Easy to export/import all data at once
 * - Can implement global features (e.g., "most searched cities")
 * 
 * Cons of Single Object Approach:
 * - Must parse/stringify entire object on every operation (performance)
 * - Risk of corrupting all data if one operation fails
 * - Harder to implement per-user size limits
 * - Performance degrades as number of users grows
 * - More complex error handling
 * 
 * When to use this approach:
 * - Small number of users (< 50)
 * - Need cross-user analytics
 * - Need to export all data frequently
 * - Storage size is not a concern
 */
