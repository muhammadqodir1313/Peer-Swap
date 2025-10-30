import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';

export function useAuth() {
  const { user, isAuthenticated, isLoading, setUser, setLoading, logout: storeLogout } = useAuthStore();

  useEffect(() => {
    // Fetch user on mount if not loaded
    if (!user && !isLoading) {
      checkAuth();
    }
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const response: any = await api.users.getMe();
      setUser(response.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      storeLogout();
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
  };

  const refreshUser = async () => {
    try {
      const response: any = await api.users.getMe();
      setUser(response.data);
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    logout,
    refreshUser,
  };
}
