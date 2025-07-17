import { authAPI } from './api';

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'election-manager';
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

class AuthService {
  private static instance: AuthService;
  private listeners: ((state: AuthState) => void)[] = [];
  private API_BASE_URL = 'http://localhost:3001/api';

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  getAuthState(): AuthState {
    const token = localStorage.getItem('auth-token');
    const userStr = localStorage.getItem('auth-user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        return { isAuthenticated: true, user, token };
      } catch {
        return { isAuthenticated: false, user: null, token: null };
      }
    }
    
    return { isAuthenticated: false, user: null, token: null };
  }

  async login(username: string, password: string): Promise<boolean> {
    try {
      const response = await authAPI.login(username, password);

      if (response.success) {
        const { token, user } = response.data;
        
        localStorage.setItem('auth-token', token);
        localStorage.setItem('auth-user', JSON.stringify(user));
        
        this.notifyListeners({ isAuthenticated: true, user, token });
        return true;
      } else {
        console.error('Login failed:', response.message);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }

  async logout(): Promise<void> {
    try {
      const token = localStorage.getItem('auth-token');
      if (token) {
        await fetch(`${this.API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth-token');
      localStorage.removeItem('auth-user');
      this.notifyListeners({ isAuthenticated: false, user: null, token: null });
    }
  }

  async getProfile(): Promise<User | null> {
    try {
      const token = localStorage.getItem('auth-token');
      if (!token) return null;

      const response = await fetch(`${this.API_BASE_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        return data.data;
      }
      return null;
    } catch (error) {
      console.error('Get profile error:', error);
      return null;
    }
  }

  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(state: AuthState): void {
    this.listeners.forEach(listener => listener(state));
  }
}

export default AuthService.getInstance(); 