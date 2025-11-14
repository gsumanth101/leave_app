import { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../Config';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sign up with email and password and assign role
  const signup = async (email, password, role, userData = {}) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Store user role and additional data in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      role: role, // 'employee', 'HR', 'GM', 'AE'
      createdAt: new Date().toISOString(),
      ...userData
    });

    return userCredential;
  };

  // Sign in with email and password
  const login = async (email, password) => {
    return await signInWithEmailAndPassword(auth, email, password);
  };

  // Sign out
  const logout = () => {
    setUserRole(null);
    return signOut(auth);
  };

  // Reset password
  const resetPassword = async (email) => {
    return await sendPasswordResetEmail(auth, email);
  };

  // Get user data from Firestore
  const fetchUserData = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          role: data.role,
          name: data.fullName || data.name || null
        };
      }
      return { role: null, name: null };
    } catch (error) {
      console.error('Error fetching user data:', error);
      return { role: null, name: null };
    }
  };

  // Legacy function for backward compatibility
  const fetchUserRole = async (uid) => {
    const data = await fetchUserData(uid);
    return data.role;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const userData = await fetchUserData(user.uid);
        setUserRole(userData.role);
        setUserName(userData.name);
      } else {
        setUserRole(null);
        setUserName(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    userName,
    login,
    signup,
    logout,
    resetPassword,
    fetchUserRole,
    fetchUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
