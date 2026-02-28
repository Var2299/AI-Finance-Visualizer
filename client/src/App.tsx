import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';

/**
 * MAIN APP COMPONENT
 * Root component that manages authentication state
 */
const App: React.FC = () => {
  // State to store authentication token - can be a string or null
  const [token, setToken] = useState<string | null>(null);

  /**
   * Check for existing token on component mount
   */
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  /**
   * Handle successful authentication
   * @param newToken - The JWT received from the backend
   */
  const handleAuthSuccess = (newToken: string): void => {
    setToken(newToken);
  };

  /**
   * Handle logout
   * Clears token from state and localStorage
   */
  const handleLogout = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
  };

  return (
    <div className="min-h-screen">
      {/* Conditionally render Auth or Dashboard. 
          TypeScript now ensures 'token' passed to Dashboard is always a string 
          because of the truthy check in the ternary.
      */}
      {token ? (
        <Dashboard token={token} onLogout={handleLogout} />
      ) : (
        <Auth onAuthSuccess={handleAuthSuccess} />
      )}
    </div>
  );
};

export default App;