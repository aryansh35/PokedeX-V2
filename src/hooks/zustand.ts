import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useSyncExternalStore } from 'react';

export function useScreen() {
  const isMobile = useSyncExternalStore(
    (callback) => {
      if (typeof window === "undefined") return () => {};
      callback();
      window.addEventListener("resize", callback);
      return () => window.removeEventListener("resize", callback);
    },
    () => {
      if (typeof window === "undefined") return true;
      return window.innerWidth <= 768;
    },
    () => true
  );
  return { isMobile };
}

interface AuthState {
  email: {
    mail: string;
    digest: string;
    identifier: string;
  };
  error: string;
  loading: boolean;
  setEmail: (email: { mail: string; digest: string; identifier: string }) => void;
  setError: (error: string) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      email: {
        mail: '',
        digest: '',
        identifier: '',
      },
      error: '',
      loading: false,
      setEmail: (email) => set({ email }),
      setError: (error) => set({ error }),
      setLoading: (loading) => set({ loading }),
      reset: () => set({
        email: { mail: '', digest: '', identifier: '' },
        error: '',
        loading: false,
      }),
    }),
    {
      name: 'pokedex-auth',
    }
  )
);
