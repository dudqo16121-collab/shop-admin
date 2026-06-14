"use client";

// ── 인증 상태 전역 관리 (백엔드 없는 Mock 버전) ─────────────
// 실제 연동 시 이 파일의 login/logout 함수만 교체하면 됩니다.
import { createContext, useCallback, useContext, useEffect, useState } from "react";

const AuthCtx = createContext(null);
const AUTH_KEY = "shop:auth";

// 목업 유저 (로그인 버튼 누르면 이 데이터로 로그인)
const MOCK_USER = {
  id: "usr_dev_001",
  name: "개발자",
  email: "dev@shopadmin.dev",
  avatar: "D",
  plan: "Pro",
  joinedAt: "2026-01-01",
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loaded, setLoaded] = useState(false);

  // 새로고침해도 로그인 유지
  useEffect(() => {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  const login = useCallback((userData = MOCK_USER) => {
    setUser(userData);
    try { localStorage.setItem(AUTH_KEY, JSON.stringify(userData)); } catch {}
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    try { localStorage.removeItem(AUTH_KEY); } catch {}
  }, []);

  return (
    <AuthCtx.Provider value={{ user, login, logout, loaded, isLoggedIn: !!user }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth는 AuthProvider 안에서 사용해야 합니다.");
  return ctx;
}