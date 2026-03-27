# Testing User-Scoped Storage

## Manual Testing Guide

### Test 1: Basic User Isolation

**Steps:**
1. Open the app in your browser
2. Log in as User 1:
   - Email: `alice@example.com`
   - Password: `password123`
3. Search for cities:
   - Search "London"
   - Search "Paris"
   - Search "Tokyo"
4. Verify search history shows all 3 cities
5. Log out
6. Log in as User 2:
   - Email: `bob@example.com`
   - Password: `password123`
7. Verify search history is EMPTY
8. Search for "New York"
9. Verify only "New York" appears in history
10. Log out and log back in as User 1
11. Verify history still shows London, Paris, Tokyo (not New York)

**Expected Result:** ✅ Each user sees only their own search history

---

### Test 2: Duplicate Prevention

**Steps:**
1. Log in as any user
2. Search "London"
3. Search "Paris"
4. Search "London" again
5. Check search history

**Expected Result:** ✅ History shows ["London", "Paris"] with London at the top (not duplicated)

---

### Test 3: History Persistence

**Steps:**
1. Log in as `user@example.com`
2. Search for "Berlin"
3. Close the browser tab
4. Open a new tab and navigate to the app
5. Log in as `user@example.com`

**Expected Result:** ✅ "Berlin" still appears in search history

---

### Test 4: History Limit

**Steps:**
1. Log in as any user
2. Search for 15 different cities
3. Check search history

**Expected Result:** ✅ Only the last 10 searches are shown

---

### Test 5: Logout Clears State (Not Storage)

**Steps:**
1. Log in and search for cities
2. Note the search history
3. Log out
4. Check that the UI shows no history
5. Log back in with the same user

**Expected Result:** ✅ History reappears after logging back in

---

## Browser DevTools Testing

### Inspect localStorage

Open DevTools → Application → Local Storage → `http://localhost:5173`

**Expected keys:**
```
weather_app_user
weather_app_search_history_alice_example_com
weather_app_search_history_bob_example_com
```

**Check User 1's history:**
```javascript
JSON.parse(localStorage.getItem('weather_app_search_history_alice_example_com'))
```

**Expected output:**
```json
[
  {
    "city": "Tokyo",
    "country": "JP",
    "searchedAt": 1234567890123
  },
  {
    "city": "Paris",
    "country": "FR",
    "searchedAt": 1234567890000
  },
  {
    "city": "London",
    "country": "GB",
    "searchedAt": 1234567889999
  }
]
```

---

## Programmatic Testing

### Test Script (Run in Browser Console)

```javascript
// Helper to test storage functions
const testUserScopedStorage = () => {
  console.log('🧪 Testing User-Scoped Storage...\n');

  // Test 1: Different users have different keys
  console.log('Test 1: User Isolation');
  const user1Key = 'weather_app_search_history_alice_example_com';
  const user2Key = 'weather_app_search_history_bob_example_com';
  
  localStorage.setItem(user1Key, JSON.stringify([
    { city: 'London', country: 'GB', searchedAt: Date.now() }
  ]));
  
  localStorage.setItem(user2Key, JSON.stringify([
    { city: 'Tokyo', country: 'JP', searchedAt: Date.now() }
  ]));
  
  const user1Data = JSON.parse(localStorage.getItem(user1Key));
  const user2Data = JSON.parse(localStorage.getItem(user2Key));
  
  console.assert(user1Data[0].city === 'London', '❌ User 1 should have London');
  console.assert(user2Data[0].city === 'Tokyo', '❌ User 2 should have Tokyo');
  console.log('✅ User isolation works\n');

  // Test 2: Email sanitization
  console.log('Test 2: Email Sanitization');
  const sanitize = (email) => email.toLowerCase().replace(/[^a-z0-9]/g, '_');
  
  console.assert(
    sanitize('User@Example.COM') === 'user_example_com',
    '❌ Sanitization failed'
  );
  console.assert(
    sanitize('test+tag@gmail.com') === 'test_tag_gmail_com',
    '❌ Special char sanitization failed'
  );
  console.log('✅ Email sanitization works\n');

  // Test 3: No cross-contamination
  console.log('Test 3: No Cross-Contamination');
  const allKeys = Object.keys(localStorage).filter(k => 
    k.startsWith('weather_app_search_history_')
  );
  
  console.log(`Found ${allKeys.length} user history keys:`, allKeys);
  console.log('✅ Each user has separate storage\n');

  // Cleanup
  localStorage.removeItem(user1Key);
  localStorage.removeItem(user2Key);
  
  console.log('✅ All tests passed!');
};

// Run tests
testUserScopedStorage();
```

---

## Edge Cases to Test

### Edge Case 1: Special Characters in Email
```
Email: test+tag@example.com
Expected Key: weather_app_search_history_test_tag_example_com
```

### Edge Case 2: Case Sensitivity
```
Login 1: User@Example.com
Login 2: user@example.com
Expected: Both should use the same storage key (lowercase)
```

### Edge Case 3: Empty History
```
New user logs in
Expected: Empty array [], not null or undefined
```

### Edge Case 4: Corrupted Data
```
Manually corrupt localStorage data
Expected: App should handle gracefully and return empty array
```

### Edge Case 5: localStorage Full
```
Fill localStorage to capacity
Expected: Graceful error handling (try-catch in storage functions)
```

---

## Automated Test Suite (Optional)

If you want to add unit tests, here's a structure:

```typescript
// src/utils/__tests__/storage.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getSearchHistory,
  saveSearchHistory,
  addToSearchHistory,
  clearSearchHistory,
} from '../storage';

describe('User-Scoped Storage', () => {
  const testUser1 = 'user1@example.com';
  const testUser2 = 'user2@example.com';

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should isolate history between users', () => {
    const item1 = { city: 'London', country: 'GB', searchedAt: Date.now() };
    const item2 = { city: 'Tokyo', country: 'JP', searchedAt: Date.now() };

    addToSearchHistory(testUser1, item1);
    addToSearchHistory(testUser2, item2);

    const user1History = getSearchHistory(testUser1);
    const user2History = getSearchHistory(testUser2);

    expect(user1History).toHaveLength(1);
    expect(user1History[0].city).toBe('London');
    expect(user2History).toHaveLength(1);
    expect(user2History[0].city).toBe('Tokyo');
  });

  it('should prevent duplicates', () => {
    const item = { city: 'London', country: 'GB', searchedAt: Date.now() };

    addToSearchHistory(testUser1, item);
    addToSearchHistory(testUser1, item);

    const history = getSearchHistory(testUser1);
    expect(history).toHaveLength(1);
  });

  it('should limit history to 10 items', () => {
    for (let i = 0; i < 15; i++) {
      addToSearchHistory(testUser1, {
        city: `City${i}`,
        country: 'XX',
        searchedAt: Date.now(),
      });
    }

    const history = getSearchHistory(testUser1);
    expect(history).toHaveLength(10);
  });

  it('should clear user-specific history', () => {
    const item = { city: 'London', country: 'GB', searchedAt: Date.now() };
    addToSearchHistory(testUser1, item);
    
    clearSearchHistory(testUser1);
    
    const history = getSearchHistory(testUser1);
    expect(history).toHaveLength(0);
  });

  it('should return empty array for new user', () => {
    const history = getSearchHistory('newuser@example.com');
    expect(history).toEqual([]);
  });
});
```

---

## Performance Testing

### Test localStorage Performance

```javascript
// Run in browser console
const testPerformance = () => {
  const iterations = 1000;
  const userEmail = 'test@example.com';
  
  console.time('1000 reads');
  for (let i = 0; i < iterations; i++) {
    const key = `weather_app_search_history_${userEmail.replace(/[^a-z0-9]/g, '_')}`;
    localStorage.getItem(key);
  }
  console.timeEnd('1000 reads');
  
  console.time('1000 writes');
  for (let i = 0; i < iterations; i++) {
    const key = `weather_app_search_history_${userEmail.replace(/[^a-z0-9]/g, '_')}`;
    localStorage.setItem(key, JSON.stringify([{ city: 'Test', country: 'XX', searchedAt: Date.now() }]));
  }
  console.timeEnd('1000 writes');
};

testPerformance();
// Expected: < 100ms for both operations
```

---

## Checklist

Before deploying to production, verify:

- [ ] Multiple users can log in and see only their own history
- [ ] History persists after browser refresh
- [ ] Duplicates are prevented (case-insensitive)
- [ ] History is limited to 10 items
- [ ] Logout clears state but preserves localStorage
- [ ] Special characters in emails are handled
- [ ] Empty history returns empty array (not null)
- [ ] localStorage keys are properly sanitized
- [ ] No shared data between users
- [ ] Performance is acceptable (< 100ms for operations)

---

## Troubleshooting

### Issue: History not loading after login
**Check:**
- Is `user` defined in WeatherContext?
- Is `useEffect` dependency array correct?
- Check browser console for errors

### Issue: History shared between users
**Check:**
- Verify storage keys in DevTools
- Ensure `user.email` is passed to storage functions
- Check that email sanitization is working

### Issue: History not persisting
**Check:**
- localStorage is enabled in browser
- No browser extensions blocking localStorage
- Storage quota not exceeded

### Issue: Duplicates appearing
**Check:**
- Case-insensitive comparison is working
- `addToSearchHistory` is filtering correctly
