import { Box, Typography, Alert, CircularProgress } from '@mui/material';
import { Layout } from '@/components/layout/Layout';
import { SearchBar } from '@/components/weather/SearchBar';
import { WeatherCard } from '@/components/weather/WeatherCard';
import { SearchHistory } from '@/components/weather/SearchHistory';
import { useWeather } from '@/contexts/WeatherContext';

export const WeatherPage = () => {
  const {
    currentWeather,
    searchHistory,
    isLoading,
    error,
    searchWeather,
    clearError,
  } = useWeather();

  const handleSearch = (city: string) => {
    clearError();
    searchWeather(city);
  };

  return (
    <Layout>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Weather Forecast
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Search for any city to get current weather information
        </Typography>
      </Box>

      <SearchBar onSearch={handleSearch} isLoading={isLoading} />

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ maxWidth: 600, mx: 'auto', mt: 3 }}>
          {error}
        </Alert>
      )}

      {currentWeather && !isLoading && (
        <WeatherCard weather={currentWeather} />
      )}

      <SearchHistory
        history={searchHistory}
        onCityClick={handleSearch}
      />
    </Layout>
  );
};
