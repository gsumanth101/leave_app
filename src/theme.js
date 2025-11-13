import { createTheme } from '@mui/material/styles';

// Modern Black & White Theme with Minimal Aesthetics
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#000000',
      light: '#333333',
      dark: '#000000',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#666666',
      light: '#999999',
      dark: '#333333',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#000000',
      secondary: '#666666',
      disabled: '#999999',
    },
    divider: 'rgba(0, 0, 0, 0.08)',
    error: {
      main: '#000000',
    },
    success: {
      main: '#000000',
    },
    warning: {
      main: '#666666',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '1.75rem',
      letterSpacing: '-0.5px',
      color: '#000000',
    },
    h2: {
      fontWeight: 700,
      fontSize: '1.5rem',
      letterSpacing: '-0.5px',
      color: '#000000',
    },
    h3: {
      fontWeight: 700,
      fontSize: '1.25rem',
      letterSpacing: '-0.5px',
      color: '#000000',
    },
    h4: {
      fontWeight: 700,
      fontSize: '1.125rem',
      letterSpacing: '-0.3px',
      color: '#000000',
    },
    h5: {
      fontWeight: 700,
      fontSize: '1rem',
      letterSpacing: '-0.3px',
      color: '#000000',
    },
    h6: {
      fontWeight: 700,
      fontSize: '0.9375rem',
      letterSpacing: '-0.2px',
      color: '#000000',
    },
    body1: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: '#333333',
    },
    body2: {
      fontSize: '0.8125rem',
      lineHeight: 1.5,
      color: '#666666',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      fontSize: '0.875rem',
      letterSpacing: '0.2px',
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0 2px 4px rgba(0,0,0,0.04)',
    '0 4px 8px rgba(0,0,0,0.06)',
    '0 6px 12px rgba(0,0,0,0.08)',
    '0 8px 16px rgba(0,0,0,0.1)',
    '0 10px 20px rgba(0,0,0,0.12)',
    '0 12px 24px rgba(0,0,0,0.14)',
    '0 14px 28px rgba(0,0,0,0.16)',
    '0 16px 32px rgba(0,0,0,0.18)',
    '0 18px 36px rgba(0,0,0,0.2)',
    '0 20px 40px rgba(0,0,0,0.22)',
    '0 22px 44px rgba(0,0,0,0.24)',
    '0 24px 48px rgba(0,0,0,0.26)',
    '0 26px 52px rgba(0,0,0,0.28)',
    '0 28px 56px rgba(0,0,0,0.3)',
    '0 30px 60px rgba(0,0,0,0.32)',
    '0 32px 64px rgba(0,0,0,0.34)',
    '0 34px 68px rgba(0,0,0,0.36)',
    '0 36px 72px rgba(0,0,0,0.38)',
    '0 38px 76px rgba(0,0,0,0.4)',
    '0 40px 80px rgba(0,0,0,0.42)',
    '0 42px 84px rgba(0,0,0,0.44)',
    '0 44px 88px rgba(0,0,0,0.46)',
    '0 46px 92px rgba(0,0,0,0.48)',
    '0 48px 96px rgba(0,0,0,0.5)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 20px',
          fontSize: '0.875rem',
          fontWeight: 600,
          boxShadow: 'none',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transform: 'translateY(-2px)',
          },
        },
        contained: {
          backgroundColor: '#000000',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#1a1a1a',
          },
        },
        outlined: {
          borderColor: '#000000',
          color: '#000000',
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
            backgroundColor: 'rgba(0,0,0,0.04)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          border: '1px solid rgba(0,0,0,0.08)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#fafafa',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: '#f5f5f5',
            },
            '&.Mui-focused': {
              backgroundColor: '#ffffff',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#000000',
                borderWidth: 2,
              },
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 600,
          fontSize: '0.75rem',
          height: 26,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 500,
        },
      },
    },
  },
});

export default theme;
