# Architecture Diagram - User-Scoped Storage

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Weather App                              │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      React Application                           │
│                                                                   │
│  ┌──────────────────┐              ┌──────────────────┐        │
│  │   LoginPage      │              │   WeatherPage    │        │
│  │                  │              │                  │        │
│  │  - Email input   │              │  - Search bar    │        │
│  │  - Password      │              │  - Weather card  │        │
│  │  - Validation    │              │  - History list  │        │
│  └──────────────────┘              └──────────────────┘        │
│           │                                  │                   │
│           ▼                                  ▼                   │
│  ┌─────────────────────────────────────────────────────┐       │
│  │              Context Layer                           │       │
│  │                                                       │       │
│  │  ┌──────────────┐         ┌──────────────────┐     │       │
│  │  │ AuthContext  │◄────────┤ WeatherContext   │     │       │
│  │  │              │         │                  │     │       │
│  │  │ - user       │         │ - currentWeather │     │       │
│  │  │ - login()    │         │ - searchHistory  │     │       │
│  │  │ - logout()   │         │ - searchWeather()│     │       │
│  │  └──────────────┘         └──────────────────┘     │       │
│  └─────────────────────────────────────────────────────┘       │
│           │                                  │                   │
│           ▼                                  ▼                   │
│  ┌─────────────────────────────────────────────────────┐       │
│  │              Service Layer                           │       │
│  │                                                       │       │
│  │  ┌──────────────┐         ┌──────────────────┐     │       │
│  │  │ AuthService  │         │ WeatherService   │     │       │
│  │  │              │         │                  │     │       │
│  │  │ - login()    │         │ - getWeatherBy   │     │       │
│  │  │ - logout()   │         │   City()         │     │       │
│  │  └──────────────┘         └──────────────────┘     │       │
│  └─────────────────────────────────────────────────────┘       │
│           │                                  │                   │
│           ▼                                  ▼                   │
│  ┌─────────────────────────────────────────────────────┐       │
│  │              Storage Layer                           │       │
│  │                                                       │       │
│  │  ┌──────────────────────────────────────────────┐  │       │
│  │  │         storage.ts (utils)                   │  │       │
│  │  │                                               │  │       │
│  │  │  - saveUser(user)                            │  │       │
│  │  │  - getUser()                                 │  │       │
│  │  │  - getSearchHistory(userEmail) ◄─────────┐  │  │       │
│  │  │  - saveSearchHistory(userEmail, history)  │  │  │       │
│  │  │  - addToSearchHistory(userEmail, item)    │  │  │       │
│  │  │  - clearSearchHistory(userEmail)          │  │  │       │
│  │  └───────────────────────────────────────────┼──┘  │       │
│  └────────────────────────────────────────────────────┘       │
│                                                │                 │
└────────────────────────────────────────────────┼───────────────┘
                                                 │
                                                 ▼
                        ┌────────────────────────────────────┐
                        │       Browser localStorage         │
                        │                                    │
                        │  weather_app_user                  │
                        │  weather_app_search_history_       │
                        │    alice_example_com               │
                        │  weather_app_search_history_       │
                        │    bob_example_com                 │
                        └────────────────────────────────────┘
```

---

## Data Flow: User Login & Search

```
┌─────────────┐
│ User Action │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. LOGIN FLOW                                                │
└─────────────────────────────────────────────────────────────┘
       │
       ├─► User enters email/password
       │
       ├─► LoginPage validates with Zod schema
       │
       ├─► AuthContext.login(email, password)
       │
       ├─► AuthService.login() → Returns User object
       │
       ├─► saveUser(user) → localStorage["weather_app_user"]
       │
       ├─► AuthContext updates state: user = { email, name }
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. HISTORY LOAD (triggered by user change)                  │
└─────────────────────────────────────────────────────────────┘
       │
       ├─► WeatherContext detects user change (useEffect)
       │
       ├─► getSearchHistory(user.email)
       │       │
       │       ├─► Generate key: getUserHistoryKey(user.email)
       │       │   "alice@example.com" → "weather_app_search_history_alice_example_com"
       │       │
       │       ├─► localStorage.getItem(key)
       │       │
       │       └─► Parse JSON → SearchHistoryItem[]
       │
       ├─► setSearchHistory(history)
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. WEATHER SEARCH                                            │
└─────────────────────────────────────────────────────────────┘
       │
       ├─► User types city name in SearchBar
       │
       ├─► WeatherContext.searchWeather(city)
       │
       ├─► WeatherService.getWeatherByCity(city)
       │       │
       │       ├─► fetch("https://api.openweathermap.org/...")
       │       │
       │       └─► Transform API response → WeatherData
       │
       ├─► setCurrentWeather(data)
       │
       ├─► Create historyItem: { city, country, searchedAt }
       │
       ├─► addToSearchHistory(user.email, historyItem)
       │       │
       │       ├─► getSearchHistory(user.email) → current history
       │       │
       │       ├─► Filter duplicates (case-insensitive)
       │       │
       │       ├─► Add new item at beginning
       │       │
       │       ├─► Limit to 10 items: .slice(0, 10)
       │       │
       │       └─► saveSearchHistory(user.email, updated)
       │               │
       │               └─► localStorage.setItem(key, JSON.stringify(updated))
       │
       ├─► Refresh UI: setSearchHistory(getSearchHistory(user.email))
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. LOGOUT FLOW                                               │
└─────────────────────────────────────────────────────────────┘
       │
       ├─► User clicks logout button
       │
       ├─► AuthContext.logout()
       │
       ├─► removeUser() → localStorage.removeItem("weather_app_user")
       │
       ├─► setUser(null)
       │
       ├─► WeatherContext detects user = null (useEffect)
       │
       ├─► Clear state: setSearchHistory([]), setCurrentWeather(null)
       │
       └─► Note: User's search history remains in localStorage
           (will be loaded again when user logs back in)
```

---

## Storage Key Structure

```
┌────────────────────────────────────────────────────────────┐
│                    localStorage                             │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  Key: "weather_app_user"                                   │
│  Value: {                                                   │
│    "email": "alice@example.com",                           │
│    "name": "alice"                                          │
│  }                                                          │
│                                                             │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  Key: "weather_app_search_history_alice_example_com"       │
│  Value: [                                                   │
│    {                                                        │
│      "city": "London",                                      │
│      "country": "GB",                                       │
│      "searchedAt": 1234567890123                           │
│    },                                                       │
│    {                                                        │
│      "city": "Paris",                                       │
│      "country": "FR",                                       │
│      "searchedAt": 1234567890000                           │
│    }                                                        │
│  ]                                                          │
│                                                             │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  Key: "weather_app_search_history_bob_example_com"         │
│  Value: [                                                   │
│    {                                                        │
│      "city": "Tokyo",                                       │
│      "country": "JP",                                       │
│      "searchedAt": 1234567891000                           │
│    }                                                        │
│  ]                                                          │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

---

## Email Sanitization Process

```
Input Email: "Alice.Smith+tag@Example.COM"
     │
     ├─► .toLowerCase()
     │   "alice.smith+tag@example.com"
     │
     ├─► .replace(/[^a-z0-9]/g, '_')
     │   "alice_smith_tag_example_com"
     │
     └─► Prefix: "weather_app_search_history_"
         
Final Key: "weather_app_search_history_alice_smith_tag_example_com"
```

---

## Component Hierarchy

```
App
├── BrowserRouter
    ├── AuthProvider
        ├── WeatherProvider
            ├── Routes
                ├── /login → PublicRoute
                │   └── LoginPage
                │       ├── React Hook Form
                │       ├── Zod Validation
                │       └── AuthContext.login()
                │
                └── / → ProtectedRoute
                    └── WeatherPage
                        ├── Layout
                        │   └── Header
                        │       └── AuthContext.logout()
                        │
                        ├── SearchBar
                        │   └── WeatherContext.searchWeather()
                        │
                        ├── WeatherCard
                        │   └── Display currentWeather
                        │
                        └── SearchHistory
                            └── Display searchHistory[]
```

---

## State Management Flow

```
┌──────────────────────────────────────────────────────────────┐
│                      AuthContext                              │
│                                                                │
│  State:                                                        │
│    - user: User | null                                        │
│                                                                │
│  Methods:                                                      │
│    - login(email, password) → Updates user state              │
│    - logout() → Clears user state                             │
│                                                                │
│  Storage:                                                      │
│    - Saves to: localStorage["weather_app_user"]              │
│    - Loads on mount from localStorage                         │
│                                                                │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     │ user changes
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│                    WeatherContext                             │
│                                                                │
│  State:                                                        │
│    - currentWeather: WeatherData | null                       │
│    - searchHistory: SearchHistoryItem[]                       │
│    - isLoading: boolean                                       │
│    - error: string | null                                     │
│                                                                │
│  Methods:                                                      │
│    - searchWeather(city) → Fetches weather + updates history │
│    - clearError() → Clears error state                        │
│                                                                │
│  Effects:                                                      │
│    - useEffect([user]) → Load user-specific history           │
│                                                                │
│  Storage:                                                      │
│    - Saves to: localStorage[`history_${user.email}`]         │
│    - Loads when user changes                                  │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

---

## Comparison: Before vs After

### Before (Shared Storage)

```
localStorage
├── weather_app_user: { email: "alice@example.com" }
└── weather_app_search_history: [
    { city: "London" },    ← Alice's search
    { city: "Tokyo" },     ← Bob's search
    { city: "Paris" }      ← Alice's search
]

Problem: All users see all searches!
```

### After (User-Scoped Storage)

```
localStorage
├── weather_app_user: { email: "alice@example.com" }
├── weather_app_search_history_alice_example_com: [
│   { city: "London" },
│   { city: "Paris" }
│]
└── weather_app_search_history_bob_example_com: [
    { city: "Tokyo" }
]

Solution: Each user has isolated storage!
```

---

## Security & Privacy Model

```
┌─────────────────────────────────────────────────────────┐
│                    User Isolation                        │
└─────────────────────────────────────────────────────────┘

User A (alice@example.com)
    │
    ├─► Can READ: weather_app_search_history_alice_example_com
    ├─► Can WRITE: weather_app_search_history_alice_example_com
    │
    └─► Cannot ACCESS: weather_app_search_history_bob_example_com
                       (Different storage key)

User B (bob@example.com)
    │
    ├─► Can READ: weather_app_search_history_bob_example_com
    ├─► Can WRITE: weather_app_search_history_bob_example_com
    │
    └─► Cannot ACCESS: weather_app_search_history_alice_example_com
                       (Different storage key)

Note: Isolation is logical, not enforced by browser.
      Users can still access other keys via DevTools.
      For true security, use backend storage.
```

---

## Performance Characteristics

```
Operation                    | Time Complexity | Notes
─────────────────────────────┼─────────────────┼──────────────────
getSearchHistory(email)      | O(1)            | Direct key lookup
saveSearchHistory(email, []) | O(n)            | n = history length
addToSearchHistory(email, x) | O(n)            | Filter + slice
getUserHistoryKey(email)     | O(m)            | m = email length
Load on login                | O(n)            | Parse JSON array
Search weather               | O(n + API)      | Update history + API call

Storage Space:
- Per user: ~1-2 KB (10 items × ~100-200 bytes)
- 100 users: ~100-200 KB
- localStorage limit: ~5-10 MB
- Estimated capacity: ~2500-5000 users per device
```

---

This architecture provides a clean separation of concerns, type safety, and complete data isolation between users while maintaining good performance and scalability.
