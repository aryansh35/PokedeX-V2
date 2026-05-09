import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
