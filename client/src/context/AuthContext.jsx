import React, { createContext, useState } from "react";
import API from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("dermcare_user");

    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      return null;
    }
  });

  const login = async (email, password, role) => {
    try {
      const { data } = await API.post("/auth/login", {
        email,
        password,
        role,
      });

      const authenticatedUser = data.user;

      setUser(authenticatedUser);

      localStorage.setItem(
        "dermcare_user",
        JSON.stringify(authenticatedUser)
      );

      if (data.token) {
        localStorage.setItem(
          "dermcare_token",
          data.token
        );
      }

      return authenticatedUser;
    } catch (err) {
      console.error(
        "Login failed:",
        err.response?.data || err.message
      );

      throw err;
    }
  };

  const logout = () => {
    setUser(null);

    localStorage.removeItem("dermcare_user");
    localStorage.removeItem("dermcare_token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};