# Best Practices for User-Scoped Storage

## Architecture Principles

### 1. Single Responsibility
Each storage function has one clear purpose:
- `getSearchHistory()` - Read only
- `saveSearchHistory()` - Write only
- `addToSearchHistory()` - Business logic (add + dedupe + limit)

### 2. Type Safety
Always use TypeScript interfaces:
```typescript
interface SearchHistoryItem {
  city: string;
  country: string;
  searchedAt: number;
}
```

### 3. Defensive Programming
Always handle edge cases:
```typescript
export const getSearchHistory = (userEmail: string): SearchHistoryItem[] => {
  try {
    const key = getUserHistoryKey(userEmail);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : []; // Never return null
  } catch (error) {
    console.error('Failed to load search history:', error);
    return []; // Graceful fallback
  }
};
```

---

## Security Considerations

### 1. Input Sanitization
Always sanitize user input before using as storage keys:
```typescript
const sanitizedEmail = userEmail
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9@.]/g, '_');
```

### 2. Data Validation
Validate data before storing:
```typescript
const isValidHistoryItem = (item: any): item is SearchHistoryItem => {
  return (
    typeof item === 'object' &&
    typeof item.city === 'string' &&
    typeof item.country === 'string' &&
    typeof item.searchedAt === 'number'
  );
};

export const saveSearchHistory = (userEmail: string, history: SearchHistoryItem[]): void => {
  const validHistory = history.filter(isValidHistoryItem);
  // ... save validHistory
};
```

### 3. Avoid Storing Sensitive Data
Never store in localStorage:
- Passwords
- API keys
- Authentication tokens (use httpOnly cookies instead)
- Personal identifiable information (PII)

### 4. Consider Encryption
For sensitive data, encrypt before storing:
```typescript
import CryptoJS from 'crypto-js';

const SECRET_KEY = 'your-secret-key'; // In production, use env variable

export const encryptData = (data: string): string => {
  return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
};

export const decryptData = (encrypted: string): string => {
  const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};
```

---

## Performance Optimization

### 1. Minimize Parse/Stringify Operations
Bad:
```typescript
const history = JSON.parse(localStorage.getItem(key));
history.push(newItem);
localStorage.setItem(key, JSON.stringify(history));
```

Good:
```typescript
// Cache in memory when possible
const [historyCache, setHistoryCache] = useState<SearchHistoryItem[]>([]);
```

### 2. Debounce Frequent Updates
```typescript
import { debounce } from 'lodash';

const debouncedSave = debounce((userEmail: string, history: SearchHistoryItem[]) => {
  saveSearchHistory(userEmail, history);
}, 500);
```

### 3. Use Lazy Loading
Don't load all data on mount if not needed:
```typescript
const [history, setHistory] = useState<SearchHistoryItem[] | null>(null);

const loadHistory = () => {
  if (history === null && user) {
    setHistory(getSearchHistory(user.email));
  }
};
```

### 4. Implement Storage Quotas
```typescript
const STORAGE_QUOTA = 5 * 1024 * 1024; // 5MB

export const checkStorageQuota = (): boolean => {
  let total = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length;
    }
  }
  return total < STORAGE_QUOTA;
};
```

---

## Error Handling

### 1. Try-Catch All localStorage Operations
```typescript
export const saveSearchHistory = (userEmail: string, history: SearchHistoryItem[]): void => {
  try {
    const key = getUserHistoryKey(userEmail);
    localStorage.setItem(key, JSON.stringify(history));
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.error('Storage quota exceeded');
      // Handle: Clear old data or notify user
    } else {
      console.error('Failed to save search history:', error);
    }
  }
};
```

### 2. Graceful Degradation
```typescript
const isLocalStorageAvailable = (): boolean => {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

// Fallback to in-memory storage
let memoryStorage: Record<string, string> = {};

export const getItem = (key: string): string | null => {
  if (isLocalStorageAvailable()) {
    return localStorage.getItem(key);
  }
  return memoryStorage[key] || null;
};
```

---

## Data Migration

### Migrating from Shared to User-Scoped Storage

```typescript
export const migrateToUserScopedStorage = (userEmail: string): void => {
  const OLD_KEY = 'weather_app_search_history';
  const oldData = localStorage.getItem(OLD_KEY);
  
  if (oldData) {
    try {
      const sharedHistory: SearchHistoryItem[] = JSON.parse(oldData);
      
      // Only migrate if user doesn't have history yet
      const existingHistory = getSearchHistory(userEmail);
      if (existingHistory.length === 0) {
        saveSearchHistory(userEmail, sharedHistory);
      }
      
      // Remove old key after successful migration
      localStorage.removeItem(OLD_KEY);
      console.log('Migration completed for', userEmail);
    } catch (error) {
      console.error('Migration failed:', error);
    }
  }
};

// Call in AuthContext after login
useEffect(() => {
  if (user) {
    migrateToUserScopedStorage(user.email);
  }
}, [user]);
```

---

## Testing Best Practices

### 1. Mock localStorage in Tests
```typescript
// test-utils/localStorage.mock.ts
export const mockLocalStorage = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// In test setup
global.localStorage = mockLocalStorage as any;
```

### 2. Test Data Isolation
```typescript
it('should not leak data between users', () => {
  const user1 = 'user1@test.com';
  const user2 = 'user2@test.com';
  
  addToSearchHistory(user1, { city: 'London', country: 'GB', searchedAt: Date.now() });
  
  const user2History = getSearchHistory(user2);
  expect(user2History).toHaveLength(0);
});
```

### 3. Test Edge Cases
```typescript
it('should handle corrupted data', () => {
  const key = getUserHistoryKey('test@test.com');
  localStorage.setItem(key, 'invalid json');
  
  const history = getSearchHistory('test@test.com');
  expect(history).toEqual([]);
});
```

---

## Monitoring & Debugging

### 1. Add Logging
```typescript
const DEBUG = import.meta.env.DEV;

export const addToSearchHistory = (userEmail: string, item: SearchHistoryItem): void => {
  if (DEBUG) {
    console.log('[Storage] Adding to history:', { userEmail, item });
  }
  
  // ... implementation
  
  if (DEBUG) {
    console.log('[Storage] Updated history:', getSearchHistory(userEmail));
  }
};
```

### 2. Storage Inspector Utility
```typescript
export const inspectStorage = () => {
  const prefix = 'weather_app_';
  const keys = Object.keys(localStorage).filter(k => k.startsWith(prefix));
  
  console.group('🔍 Storage Inspector');
  keys.forEach(key => {
    const value = localStorage.getItem(key);
    const size = new Blob([value || '']).size;
    console.log(`${key}: ${size} bytes`);
  });
  console.groupEnd();
};

// Usage in DevTools
window.inspectStorage = inspectStorage;
```

### 3. Performance Monitoring
```typescript
export const measureStoragePerformance = (
  operation: () => void,
  label: string
): void => {
  const start = performance.now();
  operation();
  const end = performance.now();
  console.log(`[Performance] ${label}: ${(end - start).toFixed(2)}ms`);
};

// Usage
measureStoragePerformance(
  () => getSearchHistory('user@test.com'),
  'Load search history'
);
```

---

## Production Recommendations

### 1. Backend Sync (Recommended)
For production apps, sync localStorage with backend:

```typescript
// Hybrid approach: localStorage + backend
export const syncSearchHistory = async (userEmail: string): Promise<void> => {
  try {
    // Load from backend
    const response = await fetch(`/api/users/${userEmail}/search-history`);
    const backendHistory = await response.json();
    
    // Merge with local
    const localHistory = getSearchHistory(userEmail);
    const merged = mergeHistories(backendHistory, localHistory);
    
    // Save locally
    saveSearchHistory(userEmail, merged);
    
    // Sync to backend
    await fetch(`/api/users/${userEmail}/search-history`, {
      method: 'PUT',
      body: JSON.stringify(merged),
    });
  } catch (error) {
    console.error('Sync failed:', error);
    // Continue with local data
  }
};
```

### 2. Implement Data Retention Policy
```typescript
const MAX_AGE_DAYS = 30;

export const cleanOldHistory = (userEmail: string): void => {
  const history = getSearchHistory(userEmail);
  const cutoff = Date.now() - (MAX_AGE_DAYS * 24 * 60 * 60 * 1000);
  
  const filtered = history.filter(item => item.searchedAt > cutoff);
  
  if (filtered.length < history.length) {
    saveSearchHistory(userEmail, filtered);
    console.log(`Cleaned ${history.length - filtered.length} old entries`);
  }
};
```

### 3. GDPR Compliance
```typescript
// Right to be forgotten
export const deleteAllUserData = (userEmail: string): void => {
  clearSearchHistory(userEmail);
  // Clear other user-specific data
  localStorage.removeItem(`weather_app_preferences_${sanitizeEmail(userEmail)}`);
  console.log('All user data deleted for', userEmail);
};

// Data export
export const exportUserData = (userEmail: string): string => {
  const data = {
    email: userEmail,
    searchHistory: getSearchHistory(userEmail),
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
};
```

### 4. Feature Flags
```typescript
const FEATURES = {
  USER_SCOPED_STORAGE: true,
  BACKEND_SYNC: false,
  ENCRYPTION: false,
};

export const getSearchHistory = (userEmail: string): SearchHistoryItem[] => {
  if (!FEATURES.USER_SCOPED_STORAGE) {
    // Fallback to old implementation
    return getLegacySearchHistory();
  }
  
  // New implementation
  const key = getUserHistoryKey(userEmail);
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};
```

---

## Summary Checklist

Before deploying user-scoped storage:

- [ ] All storage operations are type-safe
- [ ] Email sanitization is implemented
- [ ] Error handling with try-catch
- [ ] Graceful fallbacks for failures
- [ ] Data validation before storing
- [ ] Storage quota checks
- [ ] Performance monitoring
- [ ] Migration strategy for existing users
- [ ] Unit tests for all storage functions
- [ ] Integration tests for user flows
- [ ] Documentation for team
- [ ] GDPR compliance (if applicable)
- [ ] Backend sync plan (if needed)
- [ ] Monitoring and logging in place

---

## Additional Resources

- [MDN: Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
- [localStorage Limits](https://web.dev/storage-for-the-web/)
- [GDPR Compliance Guide](https://gdpr.eu/)
- [React Context Best Practices](https://react.dev/learn/passing-data-deeply-with-context)
