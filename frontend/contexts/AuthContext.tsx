import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Since the android simulator often runs on 10.0.2.2 or we use ngrok,
// local web/ios usually works with localhost.
// Note: If testing on Android emulator, change to http://10.0.2.2:5000/api
export const API_URL = 'http://192.168.29.57:5000/api';

export interface User {
  _id?: string;
  name: string;
  email: string;
  institution: string;
  subjects: string[];
  joinDate: string;
  avatar: string;
  isAuthenticated: boolean;
  studyHours?: number;
  completedTasks?: number;
  activeDays?: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  updateProfile: (data: { name?: string, institution?: string, subjects?: string[] }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const res = await axios.get(`${API_URL}/auth/me`);
        setUser({ ...res.data, isAuthenticated: true });
      } else {
        setUser(null);
      }
    } catch (e) {
      console.log('Failed to load user', e);
      await AsyncStorage.removeItem('userToken');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setError(null);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });

      const { token, ...userData } = res.data;
      await AsyncStorage.setItem('userToken', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setUser({ ...userData, isAuthenticated: true });
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    setError(null);
    try {
      const res = await axios.post(`${API_URL}/auth/register`, { name, email, password });

      const { token, ...userData } = res.data;
      await AsyncStorage.setItem('userToken', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setUser({ ...userData, isAuthenticated: true });
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Signup failed');
      return false;
    }
  };

  const updateProfile = async (data: { name?: string, institution?: string, subjects?: string[] }) => {
    try {
       const res = await axios.put(`${API_URL}/auth/me`, data);
       setUser({ ...res.data, isAuthenticated: true });
    } catch (err) {
       console.log('Update profile error', err);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('userToken');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, signup, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
