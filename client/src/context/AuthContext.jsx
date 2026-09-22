import { createContext, useContext, useMemo, useState } from 'react';
import {
  apiRequest,
  clearSession,
  getStoredAdmin,
  setSession
} from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(getStoredAdmin);

  async function authenticate(path, credentials) {
    const session = await apiRequest(path, {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    setSession(session);
    setAdmin(session.admin);
    return session;
  }

  function logout() {
    clearSession();
    setAdmin(null);
  }

  const value = useMemo(() => ({
    admin,
    isAuthenticated: Boolean(admin),
    login: (credentials) => authenticate('/auth/login', credentials),
    register: (credentials) => authenticate('/auth/register', credentials),
    logout
  }), [admin]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
