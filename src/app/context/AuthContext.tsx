'use client';

import { createContext, useContext, useState} from 'react';

type AuthContextType = {
    authToken: string | null;
    login: (token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    authToken: null,
    login: () => {},
    logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [authToken, setAuthToken] = useState<string | null>(null);

    const login = (token: string) => setAuthToken(token);
    const logout = () => setAuthToken(null);

    return (
        <AuthContext.Provider
          value={{ authToken, login, logout }}
        >
          {children}
        </AuthContext.Provider>
      );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}