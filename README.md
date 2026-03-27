# Weather App

A professional, production-quality weather application built with React, TypeScript, and Material UI.

## Features

- ✅ User authentication with form validation
- ✅ City weather search
- ✅ Current weather display with detailed metrics
- ✅ User-scoped search history with localStorage persistence
- ✅ Responsive Material UI design
- ✅ TypeScript for type safety
- ✅ Clean architecture with separation of concerns
- ✅ Complete data isolation between users

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Material UI (MUI)** - Component library
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **React Router** - Navigation
- **Context API** - State management
- **Vite** - Build tool

## Project Structure

```
weather-app/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── layout/         # Layout components (Header, Layout)
│   │   └── weather/        # Weather-specific components
│   ├── contexts/           # React Context providers
│   │   ├── AuthContext.tsx
│   │   └── WeatherContext.tsx
│   ├── pages/              # Page components
│   │   ├── LoginPage.tsx
│   │   └── WeatherPage.tsx
│   ├── schemas/            # Zod validation schemas
│   ├── services/           # API service layer
│   │   ├── auth.service.ts
│   │   └── weather.service.ts
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── App.tsx             # Main app component
│   └── main.tsx            # Entry point
├── package.json
└── vite.config.ts
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- OpenWeatherMap API key (free tier)

### Installation

1. Clone or extract the project

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Get your free API key from [OpenWeatherMap](https://openweathermap.org/api) and add it to `.env`:
```
VITE_WEATHER_API_KEY=your_actual_api_key_here
```

5. Start the development server:
```bash
npm run dev
```

6. Open your browser to `http://localhost:5173`

### Demo Login

The app uses mock authentication. You can log in with:
- **Email**: Any valid email format (e.g., `user@example.com`)
- **Password**: Any password with at least 6 characters

## Implementation Roadmap

### Phase 1: Setup & Configuration (15 min)
1. ✅ Initialize project structure
2. ✅ Install dependencies
3. ✅ Configure TypeScript and Vite
4. ✅ Set up environment variables

### Phase 2: Core Architecture (30 min)
1. ✅ Define TypeScript types and interfaces
2. ✅ Create Zod validation schemas
3. ✅ Build service layer (auth, weather API)
4. ✅ Implement localStorage utilities
5. ✅ Set up Context providers

### Phase 3: Authentication (30 min)
1. ✅ Create login form with React Hook Form
2. ✅ Implement form validation with Zod
3. ✅ Build AuthContext with localStorage persistence
4. ✅ Add protected route logic

### Phase 4: Weather Features (45 min)
1. ✅ Create search bar component
2. ✅ Build weather card display
3. ✅ Implement weather API integration
4. ✅ Add search history component
5. ✅ Connect WeatherContext

### Phase 5: UI & Layout (30 min)
1. ✅ Create header with logout
2. ✅ Build main layout wrapper
3. ✅ Style with Material UI
4. ✅ Add loading and error states

### Phase 6: Testing & Polish (30 min)
1. Test login flow
2. Test weather search
3. Verify search history persistence
4. Check responsive design
5. Handle edge cases and errors

## Key Features Explained

### Authentication Flow
- Login form with email/password validation using Zod
- User data persisted in localStorage
- Protected routes redirect to login if not authenticated
- Mock authentication service (replace with real API in production)

### Weather Search
- Real-time weather data from OpenWeatherMap API
- Displays temperature, feels like, humidity, wind speed
- Error handling for invalid cities
- Loading states during API calls

### Search History
- Automatically saves last 10 searched cities per user
- User-scoped storage (each user has isolated history)
- Persisted in localStorage with unique keys per user
- Click any history item to re-search
- Shows relative timestamps (e.g., "2h ago")
- Prevents duplicate entries (case-insensitive)

### State Management
- AuthContext manages user authentication state
- WeatherContext manages weather data and search history
- Both contexts use localStorage for persistence

## Production Considerations

### Security
- Move API keys to backend proxy in production
- Implement real authentication with JWT tokens
- Add HTTPS and secure cookie handling
- Validate all inputs on backend

### Performance
- Add React.memo for expensive components
- Implement debouncing for search input
- Add caching for weather data
- Lazy load routes with React.lazy

### Features to Add
- Weather forecast (5-day)
- Geolocation support
- Favorite cities
- Unit conversion (Celsius/Fahrenheit)
- Weather alerts
- Multiple language support

## Build for Production

```bash
npm run build
```

The optimized build will be in the `dist/` directory.

## Documentation

### User-Scoped Storage Implementation
The app implements user-scoped search history to ensure complete data isolation between users. Each user's search history is stored under a unique localStorage key based on their email address, ensuring privacy and data isolation.

📚 **[Complete Documentation Index](docs/README.md)** - Start here for all documentation

**Quick Links:**
- 🚀 [Quick Reference](docs/QUICK_REFERENCE.md) - TL;DR and common patterns
- 📖 [Solution Summary](docs/SOLUTION_SUMMARY.md) - Overview of the implementation
- 🔄 [Before & After Comparison](docs/BEFORE_AFTER_COMPARISON.md) - Visual code comparisons
- 🏗️ [Architecture Diagram](docs/ARCHITECTURE_DIAGRAM.md) - System architecture
- 🧪 [Testing Guide](docs/TESTING_USER_SCOPED_STORAGE.md) - How to test
- 🚀 [Best Practices](docs/BEST_PRACTICES.md) - Production recommendations
- 📘 [Detailed Implementation](docs/USER_SCOPED_STORAGE.md) - Complete technical guide

## License

MIT
