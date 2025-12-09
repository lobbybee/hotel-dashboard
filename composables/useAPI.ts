import { ofetch } from 'ofetch';
import { useAuthStore } from '~/stores/auth';

// Custom error classes
export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class APIError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data: any) {
    super(message);
    this.name = "APIError";
    this.status = status;
    this.data = data;
  }
}

export class ForbiddenUserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ForbiddenUserError";
  }
}

export const useAPI = () => {
  const config = useRuntimeConfig();
  const apiURL = config.public.apiUrl || 'http://localhost:8000/api';
  const authStore = useAuthStore();

  const authToken = useCookie<string | null>('auth_token');
  const refreshToken = useCookie<string | null>('auth_refresh_token');

  const refreshState = useState('auth-refresh', () => ({
    isRefreshing: false,
    refreshPromise: null as Promise<{ access: string; refresh: string } | null> | null,
  }));

  const clearAuthData = () => {
    authToken.value = null;
    refreshToken.value = null;
    authStore.setUser(null);
  }

  const refreshTokens = async (): Promise<{ access: string; refresh: string } | null> => {
    if (refreshState.value.isRefreshing && refreshState.value.refreshPromise) {
      return refreshState.value.refreshPromise;
    }

    if (!refreshToken.value) {
      throw new AuthenticationError("No refresh token available");
    }

    refreshState.value.isRefreshing = true;
    refreshState.value.refreshPromise = ofetch('/login/refresh/', {
      baseURL: apiURL,
      method: 'POST',
      body: { refresh: refreshToken.value },
    })
    .then((response) => {
      authToken.value = response.access;
      refreshToken.value = response.refresh;
      return response;
    })
    .catch((error) => {
      clearAuthData();
      throw new AuthenticationError(error.message || "Token refresh failed");
    })
    .finally(() => {
      refreshState.value.isRefreshing = false;
      refreshState.value.refreshPromise = null;
    });

    return refreshState.value.refreshPromise;
  };

  const API = ofetch.create({
    baseURL: apiURL,
    onRequest({ options }) {
      if (authToken.value) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${authToken.value}`,
        };
      }
    },
    onResponseError({ request, response, error }) {
      if (response?.status === 401) {
        return refreshTokens()
          .then(() => {
            const newOptions = { ...request };
            if (authToken.value) {
                newOptions.headers.set('Authorization', `Bearer ${authToken.value}`);
            }
            return ofetch(newOptions);
          })
          .catch(() => {
            clearAuthData();
            navigateTo('/login');
            throw new AuthenticationError("Authentication failed, please log in again");
          });
      }
      const errorMessage = error?.message || response?._data?.message || "API request failed";
      throw new APIError(
        errorMessage,
        response?.status || 0,
        response?._data || null
      );
    }
  });

  const login = async (credentials: { username?: string; password?: string }) => {
    try {
      const response = await API('/login/', {
        method: 'POST',
        body: credentials,
      });

      // Check if user type is forbidden before setting any tokens
      const forbiddenRoles = ['platform_admin', 'platform_staff', 'other_staff'];
      const userRole = response.user?.user_type;
      
      if (forbiddenRoles.includes(userRole)) {
        // Don't set tokens, throw error immediately
        throw new ForbiddenUserError("Access denied: Your user type is not allowed to access this application");
      }

      // Only set tokens and user if role is allowed
      authToken.value = response.access;
      refreshToken.value = response.refresh;
      authStore.setUser(response.user);
      return response;
    } catch (err) {
      clearAuthData();
      if (err instanceof ForbiddenUserError) {
        throw err;
      }
      if (err instanceof APIError) {
        throw err;
      }
      throw new AuthenticationError(err.message || "Login failed");
    }
  };

  const logout = async () => {
    if (refreshToken.value) {
        try {
            await API('/logout/', {
                method: 'POST',
                body: { refresh: refreshToken.value },
            });
        } catch (err) {
            console.error("Failed to logout from backend. Clearing local tokens anyway.", err);
        }
    }
    clearAuthData();
    refreshState.value = {
      isRefreshing: false,
      refreshPromise: null,
    };
  };

  const requestPasswordReset = async (credentials: { email: string }) => {
    try {
      const response = await API('/password-reset/request/', {
        method: 'POST',
        body: credentials,
      });
      return response;
    }
    catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new Error(err.message || 'Request password reset failed');
    }
  };

  const confirmPasswordReset = async (credentials: { email: string; otp: string; new_password: string }) => {
    try {
      const response = await API('/password-reset/confirm/', {
        method: 'POST',
        body: credentials,
      });
      return response;
    }
    catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new Error(err.message || 'Confirm password reset failed');
    }
  };

  return {
    login,
    logout,
    requestPasswordReset,
    confirmPasswordReset,
    API,
    refreshTokens,
  };
};
