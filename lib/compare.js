"use client";

// ── 상품 비교 전역 상태 ──────────────────────────────────────
import { createContext, useCallback, useContext, useState } from "react";

const CompareCtx = createContext(null);
const MAX = 3; // 최대 비교 가능 상품 수

export function CompareProvider({ children }) {
  const [ids, setIds] = useState([]);
  const [toast, setToast] = useState(null);

  const add = useCallback((id) => {
    setIds(prev => {
      if (prev.includes(id)) return prev;
      if (prev.length >= MAX) {
        setToast({ msg: `최대 ${MAX}개까지 비교할 수 있어요`, type: "warn" });
        setTimeout(() => setToast(null), 2000);
        return prev;
      }
      setToast({ msg: "비교 목록에 추가됐어요", type: "ok" });
      setTimeout(() => setToast(null), 1800);
      return [...prev, id];
    });
  }, []);

  const remove = useCallback((id) => {
    setIds(prev => prev.filter(x => x !== id));
  }, []);

  const toggle = useCallback((id) => {
    setIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= MAX) {
        setToast({ msg: `최대 ${MAX}개까지 비교할 수 있어요`, type: "warn" });
        setTimeout(() => setToast(null), 2000);
        return prev;
      }
      setToast({ msg: "비교 목록에 추가됐어요", type: "ok" });
      setTimeout(() => setToast(null), 1800);
      return [...prev, id];
    });
  }, []);

  const clear = useCallback(() => setIds([]), []);
  const has   = useCallback((id) => ids.includes(id), [ids]);

  return (
    <CompareCtx.Provider value={{ ids, count: ids.length, add, remove, toggle, clear, has, toast }}>
      {children}
    </CompareCtx.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareCtx);
  if (!ctx) throw new Error("useCompare는 CompareProvider 안에서 사용해야 합니다.");
  return ctx;
}