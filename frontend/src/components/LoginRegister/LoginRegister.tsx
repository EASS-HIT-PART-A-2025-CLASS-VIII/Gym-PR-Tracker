import React, { useState } from "react";
import { api } from "../../api";
import { Input } from "../Input/Input";
import styles from "./LoginRegister.module.css";

interface LoginRegisterProps {
  onLogin: (token: string) => void;
}

export const LoginRegister: React.FC<LoginRegisterProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      let token;
      if (isLogin) {
        token = await api.login(username, password);
      } else {
        token = await api.register(username, password);
      }
      localStorage.setItem("token", token);
      onLogin(token);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Authentication failed");
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        {isLogin ? "Welcome Back" : "Join the Elite"}
      </h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <Input
          label="USERNAME"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <Input
          label="PASSWORD"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className={styles.error}>{error}</p>}
        <button
          type="submit"
          className={`primary-button ${styles.submitButton}`}
        >
          {isLogin ? "CONTINUE" : "CREATE ACCOUNT"}
        </button>
      </form>
      <p className={styles.switchText}>
        {isLogin ? "New here?" : "Already a member?"}{" "}
        <button
          onClick={() => setIsLogin(!isLogin)}
          className={styles.switchButton}
        >
          {isLogin ? "Create account" : "Log in"}
        </button>
      </p>
    </div>
  );
};
