// src/context/AuthContext.jsx
import React, { createContext, useState } from "react";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("adminToken") || null);

  const login = (newToken) => {
    localStorage.setItem("adminToken", newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
