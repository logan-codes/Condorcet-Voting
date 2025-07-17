import { useState, useEffect } from 'react';
import authService, { AuthState } from '@/services/auth';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>(authService.getAuthState());

  useEffect(() => {
    const unsubscribe = authService.subscribe(setAuthState);
    return unsubscribe;
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    return await authService.login(username, password);
  };

  const logout = () => {
    authService.logout();
  };

  return {
    ...authState,
    login,
    logout
  };
}; 