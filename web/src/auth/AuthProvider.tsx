import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/endpoints';
import { TOKEN_STORAGE_KEY } from '../constants/app.constants';
import { User } from '../types/api.types';
import { AuthContextValue } from '../types/context.types';

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(() => localStorage.getItem(TOKEN_STORAGE_KEY) !== null);

  const refresh = useCallback(async () => {
    try {
      setUser(await authApi.me());
    } catch {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (localStorage.getItem(TOKEN_STORAGE_KEY)) void refresh();
  }, [refresh]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      refresh,
      signIn: async token => {
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
        await refresh();
      },
      signOut: () => {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setUser(null);
      },
    }),
    [user, loading, refresh],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('AuthProvider missing');
  return value;
}
