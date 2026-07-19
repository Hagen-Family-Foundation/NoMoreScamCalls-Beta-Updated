import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { portalApi, getStoredToken, setStoredToken } from "@/lib/portalApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshUser = useCallback(async () => {
    if (!getStoredToken()) {
      setUser(null);
      setLoading(false);
      return null;
    }
    try {
      const me = await portalApi.me();
      setUser(me);
      return me;
    } catch (err) {
      setStoredToken(null);
      setUser(null);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async ({ email, password }) => {
    const result = await portalApi.login({ email, password });
    if (!result?.token) throw new Error("Sign in did not return a session token.");
    setStoredToken(result.token);
    const me = result.user || (await portalApi.me());
    setUser(me);
    return me;
  }, []);

  const register = useCallback(async (payload) => {
    const result = await portalApi.register(payload);
    if (!result?.token) throw new Error("Registration did not return a session token.");
    setStoredToken(result.token);
    const me = result.user || (await portalApi.me());
    setUser(me);
    return me;
  }, []);

  const logout = useCallback(async () => {
    try {
      await portalApi.logout();
    } catch {
      /* ignore server error on logout */
    }
    setStoredToken(null);
    setUser(null);
  }, []);

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin" || user?.role === "administrator",
    hasAcceptedAgreement: !!user?.agreement_accepted,
    login,
    register,
    logout,
    refreshUser,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
