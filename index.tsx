import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// FIX: Add global JSX augmentation for the 'ion-icon' custom element.
// This ensures TypeScript recognizes it as a valid JSX tag throughout the application.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'ion-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { name: string; }, HTMLElement>;
    }
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);