"use client";

// ── hooks/useProducts.js ─────────────────────────────────────
// 관리자가 상품을 수정하면 쇼핑몰 컴포넌트가 자동으로 최신 데이터를 반영합니다.
// localStorage의 'admin:products:changed' 타임스탬프를 폴링합니다.

import { useCallback, useEffect, useRef, useState } from "react";
import { getVisibleProducts, getLastChangedAt } from "../lib/productStore";

export function useProducts() {
  const [products, setProducts] = useState(() => getVisibleProducts());
  const lastSeen = useRef(getLastChangedAt());

  const sync = useCallback(() => {
    const changed = getLastChangedAt();
    if (changed > lastSeen.current) {
      setProducts(getVisibleProducts());
      lastSeen.current = changed;
    }
  }, []);

  // 3초마다 변경 감지
  useEffect(() => {
    const t = setInterval(sync, 3000);
    return () => clearInterval(t);
  }, [sync]);

  // storage 이벤트 (같은 탭이 아닌 다른 탭에서 변경 시)
  useEffect(() => {
    const fn = (e) => {
      if (e.key === "admin:products:changed") sync();
    };
    window.addEventListener("storage", fn);
    return () => window.removeEventListener("storage", fn);
  }, [sync]);

  const reload = useCallback(() => {
    setProducts(getVisibleProducts());
    lastSeen.current = getLastChangedAt();
  }, []);

  return { products, reload };
}