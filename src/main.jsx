import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import AuthProvider from './auth/AuthProvider'
import { validateEnvironmentOnStartup } from './utils/validate-env'
import { getEnvironmentName, isProduction } from './utils/env-utils'

// Validate environment variables on startup
validateEnvironmentOnStartup();

// Log the current environment
const env = getEnvironmentName();
console.log(`📱 Memorix starting in ${env} environment (${isProduction() ? 'production' : 'development'})`);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
