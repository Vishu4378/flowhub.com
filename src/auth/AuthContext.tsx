import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, setUnauthorizedHandler, tokenStore } from '../lib/api';
import type { Me, Session } from '../lib/types';

interface AuthState {
  me: Me | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (session: Session) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export const meQueryKey = ['me'] as const;

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState(tokenStore.get);

  const signOut = useCallback(() => {
    tokenStore.clear();
    setToken(null);
    queryClient.clear();
  }, [queryClient]);

  const signIn = useCallback(
    (session: Session) => {
      tokenStore.set(session.accessToken);
      queryClient.clear();
      setToken(session.accessToken);
    },
    [queryClient],
  );

  useEffect(() => setUnauthorizedHandler(signOut), [signOut]);

  const meQuery = useQuery({
    queryKey: meQueryKey,
    queryFn: api.auth.me,
    enabled: !!token,
    staleTime: 60_000,
  });

  const value = useMemo<AuthState>(
    () => ({
      me: meQuery.data,
      isLoading: !!token && meQuery.isPending,
      isAuthenticated: !!token && !!meQuery.data,
      signIn,
      signOut,
    }),
    [token, meQuery.data, meQuery.isPending, signIn, signOut],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth() {
  const ctx = use(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
