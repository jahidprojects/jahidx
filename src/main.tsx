import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import App from './App.tsx';
import './index.css';

// Use absolute URL for manifest to avoid fetch errors in some contexts
// Ensure we use https as TON SDK requires it for manifest in most cases
const origin = window.location.origin.replace('http://', 'https://');
const manifestUrl = `${origin}/tonconnect-manifest.json`;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <App />
    </TonConnectUIProvider>
  </StrictMode>,
);
