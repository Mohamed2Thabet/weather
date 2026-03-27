// User and Auth types
export interface User {
  email: string;
  name: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

// Weather types
export interface WeatherData {
  city: string;
  country: string;
  temperature: number;
  feelsLike: number;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  timestamp: number;
}

export interface SearchHistoryItem {
  city: string;
  country: string;
  searchedAt: number;
}

export interface WeatherContextType {
  currentWeather: WeatherData | null;
  searchHistory: SearchHistoryItem[];
  isLoading: boolean;
  error: string | null;
  searchWeather: (city: string) => Promise<void>;
  clearError: () => void;
}

// API Response types
export interface WeatherApiResponse {
  name: string;
  sys: {
    country: string;
  };
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: Array<{
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
}
