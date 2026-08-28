import { createTheme } from '@mui/material/styles';

export const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#005db9', contrastText: '#ffffff' },
    secondary: { main: '#5f9ad6', contrastText: '#ffffff' },
    background: { default: '#eef3f7', paper: '#ffffff' },
    text: { primary: '#26364a', secondary: '#68798d' },
    error: { main: '#b42318' }
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    button: { fontWeight: 800, textTransform: 'none' }
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { minHeight: 44, borderRadius: 12, fontWeight: 800 }
      }
    },
    MuiIconButton: {
      styleOverrides: {
        root: { minWidth: 44, minHeight: 44, borderRadius: 10 }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 800 }
      }
    }
  }
});

