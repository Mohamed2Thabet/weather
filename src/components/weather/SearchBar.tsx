import { useState, FormEvent } from 'react';
import { Paper, InputBase, IconButton, Box } from '@mui/material';
import { Search } from '@mui/icons-material';

interface SearchBarProps {
  onSearch: (city: string) => void;
  isLoading?: boolean;
}

export const SearchBar = ({ onSearch, isLoading }: SearchBarProps) => {
  const [city, setCity] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (city.trim()) {
      onSearch(city.trim());
      setCity('');
    }
  };

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      sx={{
        p: '2px 4px',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        maxWidth: 600,
        mx: 'auto',
      }}
    >
      <InputBase
        sx={{ ml: 2, flex: 1 }}
        placeholder="Search for a city..."
        value={city}
        onChange={(e) => setCity(e.target.value)}
        disabled={isLoading}
      />
      <IconButton
        type="submit"
        sx={{ p: '10px' }}
        disabled={isLoading || !city.trim()}
      >
        <Search />
      </IconButton>
    </Paper>
  );
};
