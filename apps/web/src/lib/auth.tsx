import { createContext, useContext, type ReactNode } from 'react';

interface AuthContextType {
  user: { id: string; name: string; email: string } | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string) => Promise<void>;
  signUp: (email: string, name: string) => Promise<void>;
  verify: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Single-tenant: no authentication required.
 * The app is always "logged in" as admin.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const value: AuthContextType = {
    user: {
      id: 'admin',
      name: 'Admin',
      email: 'admin@localhost',
    },
    isLoading: false,
    isAuthenticated: true,
    signIn: async () => {},
    signUp: async () => {},
    verify: async () => {},
    signOut: async () => {
      window.location.reload();
    },
    refreshUser: async () => {},
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
