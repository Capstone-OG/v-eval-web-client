import { createTheme } from '@mui/material/styles';

export const vevalMuiTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4f46e5', // Indigo 600 (V-Eval primary)
      light: '#818cf8',
      dark: '#3730a3',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#0ea5e9', // Sky 500
      light: '#38bdf8',
      dark: '#0369a1',
    },
    success: {
      main: '#10b981', // Emerald 500
      light: '#d1fae5',
      dark: '#047857',
    },
    warning: {
      main: '#f59e0b', // Amber 500
      light: '#fef3c7',
      dark: '#b45309',
    },
    error: {
      main: '#ef4444', // Red 500
      light: '#fee2e2',
      dark: '#b91c1c',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    divider: '#cbd5e1',
  },
  typography: {
    fontFamily: '"Inter", "Plus Jakarta Sans", system-ui, -apple-system, sans-serif',
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        sizeSmall: {
          padding: '4px 12px',
          fontSize: '0.75rem',
          minHeight: 30,
          lineHeight: 1.4,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        outlined: {
          borderColor: '#cbd5e1',
          boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
        },
      },
    },
  },
});

export default vevalMuiTheme;
