import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import AuthProvider from './auth/AuthProvider'
import AuthTokenProvider from './auth/AuthTokenProvider'
import { validateEnvironmentOnStartup } from './utils/validate-env'
import { getEnvironmentName, isProduction } from './utils/env-utils'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { ThemeProvider, createTheme } from '@mui/material/styles'

// Create a dark theme for MUI components
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00ff94',
    },
    background: {
      paper: '#18092a',
      default: '#18092a',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  components: {
    MuiPickersDay: {
      styleOverrides: {
        root: {
          color: '#fff',
          '&.Mui-selected': {
            backgroundColor: '#00ff94',
            color: '#000',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#18092a',
        },
      },
    },
  },
});

// Validate environment variables on startup
validateEnvironmentOnStartup();

// Log the current environment
const env = getEnvironmentName();
console.log(`📱 Memorix starting in ${env} environment (${isProduction() ? 'production' : 'development'})`);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AuthTokenProvider>
          <ThemeProvider theme={darkTheme}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <App />
            </LocalizationProvider>
          </ThemeProvider>
        </AuthTokenProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
