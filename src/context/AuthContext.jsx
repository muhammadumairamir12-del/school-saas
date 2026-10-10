import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);
const AUTH_KEY = 'sky-auth-v1';

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState('Admin');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        setCurrentUser(saved.user);
        setRole(saved.role || 'Admin');
      }
    } catch {
      /* ignore */
    }
    setLoading(false);
  }, []);

  const persist = (user, nextRole) => {
    localStorage.setItem(AUTH_KEY, JSON.stringify({ user, role: nextRole }));
  };

  const loginWithDemo = (selectedRole = 'Admin') => {
    const user = {
      uid: 'demo-user',
      email: selectedRole === 'Admin' ? 'admin@skyeagle.edu' : 'teacher@skyeagle.edu',
      displayName: selectedRole === 'Admin' ? 'School Admin' : 'Class Teacher',
    };
    setRole(selectedRole);
    setCurrentUser(user);
    persist(user, selectedRole);
  };

  const loginWithEmail = (email, password, selectedRole = 'Admin') => {
    if (!email || !password) throw new Error('Enter email and password');
    const user = {
      uid: 'email-user',
      email,
      displayName: selectedRole === 'Admin' ? 'School Admin' : 'Class Teacher',
    };
    setRole(selectedRole);
    setCurrentUser(user);
    persist(user, selectedRole);
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    setCurrentUser(null);
  };

  const value = { currentUser, role, setRole, loginWithDemo, loginWithEmail, logout };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f4f5] text-slate-500 text-sm">
        Loading…
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
