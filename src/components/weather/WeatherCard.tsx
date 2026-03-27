import { Card, CardContent, Typography, Box, Grid } from '@mui/material';
import { Thermostat, Water, Air } from '@mui/icons-material';
import { WeatherData } from '@/types';

interface WeatherCardProps {
  weather: WeatherData;
}

export const WeatherCard = ({ weather }: WeatherCardProps) => {
  const iconUrl = `https://openweathermap.org/img/wn/${weather.icon}@2x.png`;

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', mt: 3 }}>
      <CardContent>
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography variant="h4" component="h2" gutterBottom>
            {weather.city}, {weather.country}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={iconUrl} alt={weather.description} />
            <Typography variant="h2" component="span">
              {weather.temperature}°C
            </Typography>
          </Box>
          <Typography variant="h6" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
            {weather.description}
          </Typography>
        </Box>

        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Thermostat color="action" />
              <Typography variant="body2" color="text.secondary">
                Feels Like
              </Typography>
              <Typography variant="h6">
                {weather.feelsLike}°C
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Water color="action" />
              <Typography variant="body2" color="text.secondary">
                Humidity
              </Typography>
              <Typography variant="h6">
                {weather.humidity}%
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Air color="action" />
              <Typography variant="body2" color="text.secondary">
                Wind Speed
              </Typography>
              <Typography variant="h6">
                {weather.windSpeed} m/s
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
