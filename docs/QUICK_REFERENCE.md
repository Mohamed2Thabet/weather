# Quick Reference - User-Scoped Storage

## TL;DR

**Problem:** All users shared the same search history.  
**Solution:** Each user gets their own localStorage key based on email.  
**Result:** Complete data isolation between users.

---

## Key Changes

### Storage Functions (src/utils/storage.ts)

```typescript
// OLD - No user parameter
getSearchHistory(): SearchHistoryItem[]

// NEW - Requires user email
getSearchHistory(userEmail: string): SearchHistoryItem[]
```

### Weather Context (src/contexts/WeatherContext.tsx)

```typescript
// NEW - Import auth context
const { user } = useAuth();

// NEW - Load history when user changes
useEffect(() => {
  if (user) {
    setSearchHistory(getSearchHistory(user.email));
  } else {
    setSearchHistory([]);
  }
}, [user]);

// NEW - Pass user email to storage
addToSearchHistory(user.email, historyItem);
```

---

## Storage Keys

```
Format: weather_app_search_history_{sanitized_email}

Examples:
alice@example.com    → weather_app_search_history_alice_example_com
bob@test.com         → weather_app_search_history_bob_test_com
user+tag@gmail.com   → weather_app_search_history_user_tag_gmail_com
```

---

## API Quick Reference

```typescript
// Get user's history
const history = getSearchHistory(user.email);

// Add to user's history (auto-dedupes, limits to 10)
addToSearchHistory(user.email, {
  city: 'London',
  country: 'GB',
  searchedAt: Date.now()
});

// Save entire history
saveSearchHistory(user.email, historyArray);

// Clear user's history
clearSearchHistory(user.email);
```

---

## Testing Checklist

- [ ] User A searches → sees only their searches
- [ ] User B searches → doesn't see User A's searches
- [ ] Logout → history cleared from UI
- [ ] Login again → history reappears
- [ ] Duplicate search → moves to top, no duplicate
- [ ] 11th search → oldest item removed

---

## DevTools Commands

```javascript
// List all history keys
Object.keys(localStorage).filter(k => k.includes('search_history'))

// View specific user's history
JSON.parse(localStorage.getItem('weather_app_search_history_alice_example_com'))

// Clear specific user's history
localStorage.removeItem('weather_app_search_history_alice_example_com')

// Clear all history
Object.keys(localStorage)
  .filter(k => k.includes('search_history'))
  .forEach(k => localStorage.removeItem(k))
```

---

## Common Patterns

### In Components

```typescript
import { useAuth } from '@/contexts/AuthContext';
import { getSearchHistory } from '@/utils/storage';

const MyComponent = () => {
  const { user } = useAuth();
  
  useEffect(() => {
    if (user) {
      const history = getSearchHistory(user.email);
      // Use history...
    }
  }, [user]);
};
```

### In Context

```typescript
const { user } = useAuth();

const saveData = (item: SearchHistoryItem) => {
  if (!user) {
    console.error('No user authenticated');
    return;
  }
  
  addToSearchHistory(user.email, item);
};
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| History not loading | Check if `user` is defined and `useEffect` has `[user]` dependency |
| History shared between users | Verify `user.email` is passed to storage functions |
| History not persisting | Check localStorage is enabled, not in incognito mode |
| Duplicates appearing | Verify case-insensitive comparison in `addToSearchHistory` |

---

## Migration from Shared Storage

```typescript
// Run once per user after login
const OLD_KEY = 'weather_app_search_history';
const oldData = localStorage.getItem(OLD_KEY);

if (oldData && user) {
  const sharedHistory = JSON.parse(oldData);
  saveSearchHistory(user.email, sharedHistory);
  localStorage.removeItem(OLD_KEY);
}
```

---

## Performance Tips

✅ **Do:**
- Cache history in component state
- Use `useEffect` with `[user]` dependency
- Limit history to 10 items

❌ **Don't:**
- Call `getSearchHistory` on every render
- Store large objects in history
- Parse/stringify unnecessarily

---

## Security Notes

⚠️ **localStorage is NOT secure:**
- Data is visible in DevTools
- No encryption by default
- Accessible by any script on the domain

✅ **For production:**
- Don't store sensitive data
- Consider backend storage
- Implement encryption if needed
- Add GDPR compliance features

---

## File Locations

```
src/
├── utils/
│   ├── storage.ts                    ← Main implementation
│   └── storage.alternative.ts        ← Alternative approach (reference)
├── contexts/
│   ├── AuthContext.tsx               ← User management
│   └── WeatherContext.tsx            ← Uses user-scoped storage
└── types/
    └── index.ts                      ← Type definitions

docs/
├── SOLUTION_SUMMARY.md               ← Start here
├── USER_SCOPED_STORAGE.md            ← Detailed guide
├── ARCHITECTURE_DIAGRAM.md           ← Visual overview
├── TESTING_USER_SCOPED_STORAGE.md    ← Testing guide
├── BEST_PRACTICES.md                 ← Production tips
└── QUICK_REFERENCE.md                ← This file
```

---

## One-Minute Summary

1. **What changed:** Storage functions now require `userEmail` parameter
2. **Why:** To isolate data between users
3. **How:** Each user gets unique localStorage key: `history_{email}`
4. **Impact:** Complete data isolation, better privacy
5. **Testing:** Log in as different users, verify separate histories

---

## Need Help?

- 📖 Read [SOLUTION_SUMMARY.md](SOLUTION_SUMMARY.md) for overview
- 🔍 Read [USER_SCOPED_STORAGE.md](USER_SCOPED_STORAGE.md) for details
- 🧪 Read [TESTING_USER_SCOPED_STORAGE.md](TESTING_USER_SCOPED_STORAGE.md) for testing
- 🏗️ Read [ARCHITECTURE_DIAGRAM.md](ARCHITECTURE_DIAGRAM.md) for architecture
- 🚀 Read [BEST_PRACTICES.md](BEST_PRACTICES.md) for production tips
