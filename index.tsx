import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// FIX: Moved JSX augmentation here from types.ts to ensure it correctly merges with React's global types.
// This resolves errors where standard HTML elements were not recognized in JSX.
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