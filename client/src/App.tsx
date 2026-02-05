import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useCallback } from 'react';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import { setRefreshCallback } from './services/apiClient';

function App() {
    const { accessToken, setAccessToken, isAuthenticated } = useAuth();

    // Set up refresh callback for apiClient
    const getToken = useCallback(async () => {
        return accessToken;
    }, [accessToken]);

    useEffect(() => {
        setRefreshCallback(getToken);
    }, [getToken]);

    // Try to refresh token on app load (for page refreshes)
    useEffect(() => {
        async function tryRefresh() {
            if (!isAuthenticated) {
                try {
                    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
                        method: 'POST',
                        credentials: 'include',
                    });

                    if (response.ok) {
                        const data = await response.json();
                        setAccessToken(data.accessToken);
                    }
                } catch (error) {
                    console.error('Initial refresh failed:', error);
                }
            }
        }
        tryRefresh();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/"
                element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;
