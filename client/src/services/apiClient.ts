const API_URL = import.meta.env.VITE_API_URL;

type RefreshCallback = () => Promise<string | null>;

let refreshCallback: RefreshCallback | null = null;
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

export function setRefreshCallback(callback: RefreshCallback) {
    refreshCallback = callback;
}

interface RequestOptions extends RequestInit {
    skipAuth?: boolean;
}

async function refreshToken(): Promise<string | null> {
    try {
        const response = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        return data.accessToken;
    } catch {
        return null;
    }
}

export async function apiClient<T>(
    endpoint: string,
    options: RequestOptions = {}
): Promise<{ data?: T; error?: string; status: number }> {
    const { skipAuth = false, ...fetchOptions } = options;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(fetchOptions.headers as Record<string, string>),
    };

    // Get current token from callback
    let currentToken: string | null = null;
    if (!skipAuth && refreshCallback) {
        currentToken = await refreshCallback();
    }

    if (currentToken) {
        headers['Authorization'] = `Bearer ${currentToken}`;
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...fetchOptions,
            headers,
            credentials: 'include',
        });

        // Handle 401 - try to refresh token once
        if (response.status === 401 && !skipAuth) {
            // Prevent multiple simultaneous refresh attempts
            if (!isRefreshing) {
                isRefreshing = true;
                refreshPromise = refreshToken();
            }

            const newToken = await refreshPromise;
            isRefreshing = false;
            refreshPromise = null;

            if (newToken && refreshCallback) {
                // Update token through callback
                await refreshCallback();

                // Retry original request with new token
                headers['Authorization'] = `Bearer ${newToken}`;
                const retryResponse = await fetch(`${API_URL}${endpoint}`, {
                    ...fetchOptions,
                    headers,
                    credentials: 'include',
                });

                if (retryResponse.status === 204) {
                    return { status: 204 };
                }

                const retryData = await retryResponse.json();
                if (!retryResponse.ok) {
                    return { error: retryData.error || 'Request failed', status: retryResponse.status };
                }
                return { data: retryData, status: retryResponse.status };
            }

            return { error: 'Session expired', status: 401 };
        }

        if (response.status === 204) {
            return { status: 204 };
        }

        const data = await response.json();

        if (!response.ok) {
            return { error: data.error || 'Request failed', status: response.status };
        }

        return { data, status: response.status };
    } catch (error) {
        console.error('API Error:', error);
        return { error: 'Network error', status: 0 };
    }
}

// Auth-specific API calls
export async function register(email: string, password: string) {
    return apiClient<{ message: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        skipAuth: true,
    });
}

export async function login(email: string, password: string) {
    return apiClient<{ accessToken: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        skipAuth: true,
    });
}

export async function getMe() {
    return apiClient<{ id: number; email: string; createdAt: string }>('/me');
}
