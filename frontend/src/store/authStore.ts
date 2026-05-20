import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';

interface AuthState {
  token: string | null;
  userName: string | null;
  isAuthenticated: boolean;
  login: (token: string, rememberMe: boolean) => void;
  logout: () => void;
}

const getToken = () => localStorage.getItem('token') || sessionStorage.getItem('token');

const getUserNameFromToken = (token: string | null) => {
  if (!token) return null;
  try {
    const decoded = jwtDecode<{ name: string }>(token);
    return decoded.name;
  } catch {
    return null;
  }
};

const initialToken = getToken();

export const useAuthStore = create<AuthState>((set) => ({
  token: initialToken,
  userName: getUserNameFromToken(initialToken),
  isAuthenticated: !!initialToken,
  login: (token, rememberMe) => {
    if (rememberMe) {
      localStorage.setItem('token', token);
    } else {
      sessionStorage.setItem('token', token);
    }
    set({ token, isAuthenticated: true, userName: getUserNameFromToken(token) });
  },
  logout: () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    set({ token: null, isAuthenticated: false, userName: null });
  },
}));
