"use client";

// ── 장바구니 스토어 (localStorage 지속 + 드로어/토스트 상태) ──
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { byId, FREE_SHIP_OVER, SHIP_FEE } from "./store-data";

const CartCtx = createContext(null);
const CART_KEY = "shop:cart";
const ORDERS_KEY = "shop:orders"; // 관리자 연동 포인트: 주문이 여기에 쌓입니다

export function CartProvider({ children }) {
  const [items, setItems] = useState([]); // [{ id, opt, qty }]
  const [loaded, setLoaded] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toast, setToast] = useState(null); // { name }

  // 복원
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  // 저장
  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(CART_KEY, JSON.stringify(items)); } catch {}
  }, [items, loaded]);

  // 토스트 자동 닫힘
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const add = useCallback((id, opt, qty = 1) => {
    const p = byId(id);
    if (!p || p.stock === 0) return;
    setItems(prev => {
      const i = prev.findIndex(it => it.id === id && it.opt === opt);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], qty: next[i].qty + qty };
        return next;
      }
      return [...prev, { id, opt, qty }];
    });
    setToast({ name: p.name });
  }, []);

  const setQty = useCallback((id, opt, qty) => {
    setItems(prev => prev
      .map(it => (it.id === id && it.opt === opt ? { ...it, qty: Math.max(1, qty) } : it)));
  }, []);

  const remove = useCallback((id, opt) => {
    setItems(prev => prev.filter(it => !(it.id === id && it.opt === opt)));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  // 파생값
  const detailed = useMemo(() => items
    .map(it => ({ ...it, p: byId(it.id) }))
    .filter(it => it.p), [items]);

  const count = useMemo(() => detailed.reduce((a, it) => a + it.qty, 0), [detailed]);
  const subtotal = useMemo(() => detailed.reduce((a, it) => a + it.p.price * it.qty, 0), [detailed]);
  const shipping = subtotal === 0 || subtotal >= FREE_SHIP_OVER ? 0 : SHIP_FEE;
  const total = subtotal + shipping;

  // 주문 저장 (체크아웃 완료 시)
  const placeOrder = useCallback((info) => {
    const no = `S${Date.now().toString().slice(-8)}`;
    const discount = Number(info.discount) || 0;
    const order = {
      no,
      date: new Date().toISOString(),
      items: detailed.map(it => ({ id: it.id, name: it.p.name, opt: it.opt, qty: it.qty, price: it.p.price })),
      subtotal, shipping, discount, total: total - discount,
      ...info,
    };
    try {
      const raw = localStorage.getItem(ORDERS_KEY);
      const orders = raw ? JSON.parse(raw) : [];
      orders.unshift(order);
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    } catch {}
    setItems([]);
    return order;
  }, [detailed, subtotal, shipping, total]);

  const value = {
    items: detailed, count, subtotal, shipping, total,
    add, setQty, remove, clear, placeOrder,
    drawerOpen, openDrawer: () => setDrawerOpen(true), closeDrawer: () => setDrawerOpen(false),
    toast,
  };

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart는 CartProvider 안에서 사용해야 합니다.");
  return ctx;
}
