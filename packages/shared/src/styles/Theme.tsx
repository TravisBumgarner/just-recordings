import CssBaseline from '@mui/material/CssBaseline'
import { createTheme, type ThemeOptions, ThemeProvider } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import merge from 'lodash/merge'
import { useMemo } from 'react'
import {
  BORDER_RADIUS,
  DARK_BUTTON_STYLES,
  FONT_SIZES,
  LIGHT_BUTTON_STYLES,
  PALETTE,
  SPACING,
} from './styleConsts'

export const TAB_HEIGHT = '36px' // for some reason all are needed.

// Base theme options shared between light and dark
const baseThemeOptions: ThemeOptions = {
  components: {
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: BORDER_RADIUS.ZERO.PX,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: TAB_HEIGHT,
        },
        indicator: {
          display: 'none', // hide globally
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          minWidth: 0,
          textTransform: 'none',
          minHeight: TAB_HEIGHT,
          height: TAB_HEIGHT,
          '&.Mui-selected': {
            fontWeight: 900,
          },
          '&:hover': {
            fontWeight: 900,
          },
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          display: 'list-item',
          margin: 0,
          padding: SPACING.TINY.PX,
        },
      },
    },
    MuiList: {
      styleOverrides: {
        root: {
          listStyleType: 'square',
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        track: {
          borderRadius: 0,
        },
        root: {
          borderRadius: 0,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 0,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: BORDER_RADIUS.ZERO.PX,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: BORDER_RADIUS.ZERO.PX,
          boxShadow: 'none',
          cursor: 'pointer',
          '&:hover': {
            boxShadow: 'none',
          },
          '&:disabled': {
            cursor: 'not-allowed',
          },
        },
        contained: {
          fontWeight: 900,
        },
        outlined: {
          fontWeight: 600,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          borderRadius: BORDER_RADIUS.ZERO.PX,
        },
      },
    },
  },
  typography: {
    fontFamily: '"Satoshi", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: FONT_SIZES.HUGE.PX,
      fontWeight: 900,
    },
    h2: {
      fontSize: FONT_SIZES.LARGE.PX,
      fontWeight: 900,
    },
    h3: {
      fontSize: FONT_SIZES.MEDIUM.PX,
      fontWeight: 900,
    },
    body1: {
      fontSize: FONT_SIZES.MEDIUM.PX,
    },
    body2: {
      fontSize: FONT_SIZES.SMALL.PX,
    },
  },
}

const getThemeOptions = (mode: 'light' | 'dark'): ThemeOptions => ({
  palette: {
    mode,
    background: {
      default: mode === 'light' ? PALETTE.grayscale[50] : PALETTE.grayscale[900],
      paper: mode === 'light' ? PALETTE.grayscale[50] : PALETTE.grayscale[800],
    },
    info: {
      main: mode === 'light' ? PALETTE.grayscale[700] : PALETTE.grayscale[200],
      contrastText: mode === 'light' ? PALETTE.grayscale[200] : PALETTE.grayscale[800],
    },
    error: {
      main: mode === 'light' ? PALETTE.grayscale[700] : PALETTE.grayscale[200],
      contrastText: mode === 'light' ? PALETTE.grayscale[200] : PALETTE.grayscale[800],
    },
    text: {
      primary: mode === 'light' ? PALETTE.grayscale[900] : PALETTE.grayscale[100],
      secondary: mode === 'light' ? PALETTE.grayscale[800] : PALETTE.grayscale[200],
    },
    divider: mode === 'light' ? PALETTE.grayscale[200] : PALETTE.grayscale[800],
  },
  typography: {
    h1: {
      color: mode === 'light' ? PALETTE.grayscale[900] : PALETTE.grayscale[100],
    },
    h2: {
      color: mode === 'light' ? PALETTE.grayscale[900] : PALETTE.grayscale[100],
    },
    h3: {
      color: mode === 'light' ? PALETTE.grayscale[900] : PALETTE.grayscale[100],
    },
    body1: {
      color: mode === 'light' ? PALETTE.grayscale[900] : PALETTE.grayscale[100],
    },
    body2: {
      color: mode === 'light' ? PALETTE.grayscale[900] : PALETTE.grayscale[100],
      fontSize: mode === 'light' ? FONT_SIZES.SMALL.PX : undefined,
    },
  },
  components: {
    MuiSwitch: {
      styleOverrides: {
        ...(mode === 'dark' && { thumb: { borderRadius: 0 } }),
        switchBase: {
          color: PALETTE.grayscale[500],
          '&.Mui-checked': {
            color: mode === 'light' ? PALETTE.grayscale[700] : PALETTE.grayscale[200],
          },
          '&.Mui-checked + .MuiSwitch-track': {
            backgroundColor: mode === 'light' ? PALETTE.grayscale[700] : PALETTE.grayscale[200],
          },
        },
        track: {
          backgroundColor: mode === 'light' ? PALETTE.grayscale[400] : PALETTE.grayscale[600],
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: { backgroundColor: PALETTE.grayscale[200] },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: mode === 'light' ? PALETTE.grayscale[700] : PALETTE.grayscale[100],
          '&.Mui-selected': {
            backgroundColor: PALETTE.grayscale[200],
            color: PALETTE.grayscale[900],
          },
          '&:hover': {
            backgroundColor: mode === 'light' ? PALETTE.grayscale[800] : PALETTE.grayscale[100],
            color: mode === 'light' ? PALETTE.grayscale[50] : PALETTE.grayscale[900],
          },
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: mode === 'light' ? PALETTE.grayscale[800] : PALETTE.grayscale[100],
          '&:hover': {
            color: mode === 'light' ? PALETTE.grayscale[800] : PALETTE.grayscale[100],
          },
          '&:visited': {
            color: mode === 'light' ? PALETTE.grayscale[800] : PALETTE.grayscale[100],
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          color: mode === 'light' ? PALETTE.grayscale[700] : PALETTE.grayscale[300],
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: mode === 'light' ? PALETTE.grayscale[700] : PALETTE.grayscale[300],
          },
        },
        notchedOutline: {
          borderColor: mode === 'light' ? PALETTE.grayscale[400] : PALETTE.grayscale[600],
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          '&.Mui-focused': {
            color: mode === 'light' ? PALETTE.grayscale[700] : PALETTE.grayscale[300],
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          color: mode === 'light' ? LIGHT_BUTTON_STYLES.color : DARK_BUTTON_STYLES.color,
          backgroundColor:
            mode === 'light' ? LIGHT_BUTTON_STYLES.background : DARK_BUTTON_STYLES.background,
          '&:hover': {
            backgroundColor:
              mode === 'light'
                ? LIGHT_BUTTON_STYLES.hoverBackground
                : DARK_BUTTON_STYLES.hoverBackground,
          },
          '&:disabled': {
            backgroundColor: mode === 'light' ? PALETTE.grayscale[400] : PALETTE.grayscale[700],
          },
        },
        outlined: {
          color: mode === 'light' ? PALETTE.grayscale[700] : PALETTE.grayscale[100],
          borderColor: mode === 'light' ? PALETTE.grayscale[700] : PALETTE.grayscale[200],
          '&:hover': {
            backgroundColor: mode === 'light' ? PALETTE.grayscale[100] : PALETTE.grayscale[700],
          },
          '&:disabled': {
            textColor: mode === 'light' ? PALETTE.grayscale[400] : PALETTE.grayscale[600],
          },
        },
        text: {
          color: mode === 'light' ? PALETTE.grayscale[700] : PALETTE.grayscale[100],
          '&:hover': {
            backgroundColor: mode === 'light' ? PALETTE.grayscale[100] : PALETTE.grayscale[700],
          },
          '&:disabled': {
            textColor: mode === 'light' ? PALETTE.grayscale[400] : PALETTE.grayscale[700],
          },
        },
      },
    },
  },
})

const lightTheme = createTheme(merge(baseThemeOptions, getThemeOptions('light')))
const darkTheme = createTheme(merge(baseThemeOptions, getThemeOptions('dark')))

const AppThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')

  const theme = useMemo(() => (prefersDarkMode ? darkTheme : lightTheme), [prefersDarkMode])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}

export default AppThemeProvider
