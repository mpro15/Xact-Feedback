// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // Tailwind or global styles

// Optional: Setup for environment checks or debugging
if (import.meta.env.DEV) {
  console.log('Running in development mode');
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Root element not found. Ensure <div id='root'></div> exists in index.html");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
