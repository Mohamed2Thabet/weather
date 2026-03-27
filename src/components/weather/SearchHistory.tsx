import { Card, CardContent, Typography, List, ListItem, ListItemButton, ListItemText, Box, Chip } from '@mui/material';
import { History } from '@mui/icons-material';
import { SearchHistoryItem } from '@/types';

interface SearchHistoryProps {
  history: SearchHistoryItem[];
  onCityClick: (city: string) => void;
}

export const SearchHistory = ({ history, onCityClick }: SearchHistoryProps) => {
  if (history.length === 0) {
    return null;
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', mt: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <History sx={{ mr: 1 }} />
          <Typography variant="h6">
            Search History
          </Typography>
        </Box>
        <List>
          {history.map((item, index) => (
            <ListItem key={index} disablePadding>
              <ListItemButton onClick={() => onCityClick(item.city)}>
                <ListItemText
                  primary={`${item.city}, ${item.country}`}
                  secondary={formatDate(item.searchedAt)}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};
