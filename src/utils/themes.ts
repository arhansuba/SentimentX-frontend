import { createTheme, Theme, PaletteMode } from '@mui/material/styles';

// Define light theme colors
const lightTheme = {
  primary: {
    main: '#3F51B5',
    light: '#7986CB',
    dark: '#303F9F',
    contrastText: '#fff',
  },
  secondary: {
    main: '#F50057',
    light: '#FF4081',
    dark: '#C51162',
    contrastText: '#fff',
  },
  background: {
    default: '#f5f5f5',
    paper: '#ffffff',
  },
  text: {
    primary: 'rgba(0, 0, 0, 0.87)',
    secondary: 'rgba(0, 0, 0, 0.6)',
  },
};

// Define dark theme colors
const darkTheme = {
  primary: {
    main: '#7986CB',
    light: '#9FA8DA',
    dark: '#5C6BC0',
    contrastText: '#fff',
  },
  secondary: {
    main: '#FF4081',
    light: '#FF80AB',
    dark: '#F50057',
    contrastText: '#fff',
  },
  background: {
    default: '#121212',
    paper: '#1E1E1E',
  },
  text: {
    primary: '#ffffff',
    secondary: 'rgba(255, 255, 255, 0.7)',
  },
};

// Create theme based on mode
export const getTheme = (mode: PaletteMode): Theme => {
  return createTheme({
    palette: {
      mode,
      ...(mode === 'light' ? lightTheme : darkTheme),
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarColor: mode === 'dark' ? '#6b6b6b #2b2b2b' : '#959595 #f5f5f5',
            '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
              backgroundColor: mode === 'dark' ? '#2b2b2b' : '#f5f5f5',
              width: '8px',
              height: '8px',
            },
            '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
              borderRadius: 8,
              backgroundColor: mode === 'dark' ? '#6b6b6b' : '#959595',
              minHeight: 24,
            },
            '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
              backgroundColor: mode === 'dark' ? '#959595' : '#6b6b6b',
            },
          },
        },
      },
    },
    typography: {
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
    },
  });
};