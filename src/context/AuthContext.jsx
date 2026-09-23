import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, seedInitialData } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  signInAnonymously
} from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState('Admin'); // Default role: 'Admin' or 'Teacher'
  const [assignedClass, setAssignedClass] = useState('Class 10 - A'); // For teacher view filtering
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Run seed logic once when app initializes
    seedInitialData();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Demo Login (handles real Auth or instant demo mode)
  const loginWithDemo = async (selectedRole = 'Admin', userClass = 'Class 10 - A') => {
    setRole(selectedRole);
    setAssignedClass(userClass);
    try {
      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }
    } catch (err) {
      console.warn("Anonymous sign in warning, falling back to mock user session", err);
      setCurrentUser({
        uid: "demo-user-id",
        email: selectedRole === 'Admin' ? 'admin@skyeducation.com' : 'teacher@skyeducation.com',
        displayName: selectedRole === 'Admin' ? 'Principal / Admin' : 'Priya Nair'
      });
    }
  };

  const loginWithEmail = async (email, password, selectedRole = 'Admin', userClass = 'Class 10 - A') => {
    setRole(selectedRole);
    setAssignedClass(userClass);
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.error(e);
    }
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    role,
    setRole,
    assignedClass,
    setAssignedClass,
    loginWithDemo,
    loginWithEmail,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
