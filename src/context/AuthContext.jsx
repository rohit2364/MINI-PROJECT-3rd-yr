import React, { createContext, useContext, useState } from 'react';
import { DEMO_USERS } from '../data/mockData';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(DEMO_USERS[0]); // Default to Public Health Officer
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const switchRole = (userIdOrRole) => {
    const found = DEMO_USERS.find(u => u.id === userIdOrRole || u.role === userIdOrRole);
    if (found) {
      setCurrentUser(found);
      setIsAuthenticated(true);
    }
  };

  const loginAs = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAuthenticated,
      availableUsers: DEMO_USERS,
      switchRole,
      loginAs,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
