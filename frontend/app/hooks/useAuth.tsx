// ─────────────────────────────────────────
// FICHIER : frontend/app/hooks/useAuth.ts
// ─────────────────────────────────────────
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthAPI } from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  register: (data: { nom: string; prenom: string; email?: string; telephone?: string; mot_de_passe: string; langue?: string }) => Promise<void>;
  login: (identifiant: string, motDePasse: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { verifierSession(); }, []);

  async function verifierSession() {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        const me = await AuthAPI.me();
        setUser(me);
      }
    } catch {
      await AsyncStorage.removeItem('access_token');
    } finally {
      setIsLoading(false);
    }
  }

  async function register(data: any) {
    await AuthAPI.register(data);
    const me = await AuthAPI.me();
    setUser(me);
  }

  async function login(identifiant: string, motDePasse: string) {
    await AuthAPI.login(identifiant, motDePasse);
    const me = await AuthAPI.me();
    setUser(me);
  }

  async function logout() {
    await AuthAPI.logout();
    setUser(null);
  }

  async function refreshUser() {
    const me = await AuthAPI.me();
    setUser(me);
  }

  return (
    <AuthContext.Provider value={{
      user, isLoading,
      isAuthenticated: !!user,
      register, login, logout, refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit etre utilise dans AuthProvider');
  return ctx;
}
