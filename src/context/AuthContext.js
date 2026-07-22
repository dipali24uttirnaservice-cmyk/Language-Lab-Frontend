"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get("token");
    const role = Cookies.get("role");

    if (token) {
      setRole(role);

      // Call your profile API here
      // getCurrentUser().then((res) => setUser(res.data));
    }

    setLoading(false);
  }, []);

  if (loading) return null;

  return (
    <AuthContext.Provider
      value={{ user, role, setUser, setRole }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}