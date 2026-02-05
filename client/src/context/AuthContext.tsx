import {
    createContext,
    useContext,
    useState,
    useCallback,
    ReactNode,
} from 'react';

interface AuthContextType {
    accessToken: string | null;
    isAuthenticated: boolean;
    setAccessToken: (token: string | null) => void;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [accessToken, setAccessToken] = useState<string | null>(null);

    const logout = useCallback(async () => {
        try {
            await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setAccessToken(null);
        }
    }, []);

    const value: AuthContextType = {
        accessToken,
        isAuthenticated: !!accessToken,
        setAccessToken,
        logout,
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
