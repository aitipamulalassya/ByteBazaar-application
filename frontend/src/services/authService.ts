import axios from "axios";
import type { User } from "@/types";
import.meta.env.VITE_API_URL


const TOKEN_KEY = "token";
const USER_KEY = "user";

export const authService = {
  async login(
    identifier: string,
    password: string
  ): Promise<{ user: User; token: string }> {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
      identifier,
      password,
    });

    const { token, user } = response.data;

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    return { user, token };
  },

  async signup(
    username: string,
    email: string,
    password: string
  ): Promise<{ user: User; token: string }> {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/signup`, {
      username,
      email,
      password,
    });

    const { token, user } = response.data;

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    return { user, token };
  },

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  getUser(): User | null {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  },
};