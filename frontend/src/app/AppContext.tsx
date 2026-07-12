"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  ecoCoins: number;
  setEcoCoins: (coins: number) => void;
  userXp: number;
  setUserXp: (xp: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [ecoCoins, setEcoCoinsState] = useState<number>(1250);
  const [userXp, setUserXpState] = useState<number>(240);

  // Load from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('ecosphere_user');
    if (savedUser) {
      try {
        setUserState(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('ecosphere_user');
      }
    }

    const savedTheme = localStorage.getItem('ecosphere_theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }

    const savedCoins = localStorage.getItem('ecosphere_coins');
    if (savedCoins) {
      setEcoCoinsState(parseInt(savedCoins));
    }

    const savedXp = localStorage.getItem('ecosphere_xp');
    if (savedXp) {
      setUserXpState(parseInt(savedXp));
    }
  }, []);

  const setUser = (user: User | null) => {
    setUserState(user);
    if (user) {
      localStorage.setItem('ecosphere_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('ecosphere_user');
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('ecosphere_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const setEcoCoins = (coins: number) => {
    setEcoCoinsState(coins);
    localStorage.setItem('ecosphere_coins', coins.toString());
  };

  const setUserXp = (xp: number) => {
    setUserXpState(xp);
    localStorage.setItem('ecosphere_xp', xp.toString());
  };

  return (
    <AppContext.Provider value={{ user, setUser, theme, toggleTheme, ecoCoins, setEcoCoins, userXp, setUserXp }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
