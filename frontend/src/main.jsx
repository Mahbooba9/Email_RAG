import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!clientId) {
  console.error("VITE_GOOGLE_CLIENT_ID is missing! Check your environment variables.");
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {clientId ? (
      <GoogleOAuthProvider clientId={clientId}>
        <App />
      </GoogleOAuthProvider>
    ) : (
      <div style={{ color: 'white', padding: '20px', textAlign: 'center' }}>
        <h2>Configuration Error</h2>
        <p>Google Client ID is missing. Please check Vercel environment variables.</p>
      </div>
    )}
  </StrictMode>,
)
