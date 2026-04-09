import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import App from './App.tsx';
import './index.css';

// Use relative URL for manifest to ensure it resolves correctly against the current origin
const manifestUrl = '/tonconnect-manifest.json';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <App />
    </TonConnectUIProvider>
  </StrictMode>,
);
