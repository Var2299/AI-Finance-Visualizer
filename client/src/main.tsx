import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Extension is usually omitted in imports
import './index.css';

/**
 * MAIN ENTRY POINT
 * Renders the React app into the DOM
 * * Note: The '!' after getElementById is a non-null assertion operator.
 * It tells TypeScript that we are sure the 'root' element exists.
 */
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Failed to find the root element. Ensure index.html has <div id='root'></div>");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);