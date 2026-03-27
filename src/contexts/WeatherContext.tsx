import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WeatherContextType, WeatherData, SearchHistoryItem } from '@/types';
import { WeatherService } from '@/services/weather.service';
import { getSearchHistory, addToSearchHistory } from '@/utils/storage';
import { useAuth } from './AuthContext';

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export const WeatherProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user-specific search history when user changes
  useEffect(() => {
    if (user) {
      setSearchHistory(getSearchHistory(user.email));
    } else {
      // Clear history when user logs out
      setSearchHistory([]);
      setCurrentWeather(null);
    }
  }, [user]);

  const searchWeather = async (city: string) => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await WeatherService.getWeatherByCity(city);
      setCurrentWeather(data);

      // Add to user-specific search history
      const historyItem: SearchHistoryItem = {
        city: data.city,
        country: data.country,
        searchedAt: Date.now(),
      };
      addToSearchHistory(user.email, historyItem);
      setSearchHistory(getSearchHistory(user.email));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch weather';
      setError(message);
      setCurrentWeather(null);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <WeatherContext.Provider
      value={{
        currentWeather,
        searchHistory,
        isLoading,
        error,
        searchWeather,
        clearError,
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
};

export const useWeather = () => {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error('useWeather must be used within WeatherProvider');
  }
  return context;
};
