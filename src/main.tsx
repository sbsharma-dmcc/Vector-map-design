
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { trackAppCrashed } from './utils/analytics'

// Global error handler for tracking crashes
window.addEventListener('error', (event) => {
  trackAppCrashed(event.error?.name || 'Unknown', window.location.pathname);
});

window.addEventListener('unhandledrejection', (event) => {
  trackAppCrashed('Promise_Rejection', window.location.pathname);
});

createRoot(document.getElementById("root")!).render(<App />);
