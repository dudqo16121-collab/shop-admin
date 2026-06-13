"use client";

// ── 찜하기 스토어 (localStorage 지속) ────────────────────────
import { createContext, useCallback, useContext, useEffect, useState } from "react";

const WishCtx = createContext(null);
const KEY = "shop:wishlist";

export function WishlistProvider({ children }) {
  const [ids, setIds] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) setIds(JSON.parse(raw)); } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(KEY, JSON.stringify(ids)); } catch {}
  }, [ids, loaded]);

  const toggle = useCallback((id) => {
    setIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }, []);

  const has = useCallback((id) => ids.includes(id), [ids]);

  return (
    <WishCtx.Provider value={{ ids, count: ids.length, toggle, has }}>
      {children}
    </WishCtx.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishCtx);
  if (!ctx) throw new Error("useWishlist는 WishlistProvider 안에서 사용해야 합니다.");
  return ctx;
}