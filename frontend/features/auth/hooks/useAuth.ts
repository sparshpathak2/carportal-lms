// features/auth/hooks/useAuth.ts
import { useState } from "react";
import { loginApi, signupApi } from "../api/auth";

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await loginApi(email, password);
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (payload: {
    email: string;
    password: string;
    name: string;
    dealerId?: string;
    roles?: string[];
  }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await signupApi(payload);
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Signup failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { login, signup, loading, error };
};
