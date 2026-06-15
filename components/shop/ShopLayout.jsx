"use client";

import { useEffect, useState } from "react";
import { T, S } from "./theme";
import ShopHeader from "./ShopHeader";
import ShopFooter from "./ShopFooter";
import CartDrawer from "./CartDrawer";
import SearchModal from "./SearchModal";
import { useCart } from "../../lib/cart";

function CartToast() {
  const { toast, openDrawer } = useCart();
  if (!toast) return null;
  return (
    <div
      className="sh-toast"
      role="status"
      style={{
        position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)",
        zIndex: 300, display: "flex", alignItems: "center", gap: 14,
        background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
        color: "#fff",
        padding: "13px 18px", borderRadius: 14,
        boxShadow: "0 12px 40px rgba(99,102,241,0.4)",
        fontSize: 13, whiteSpace: "nowrap",
        border: "1px solid rgba(255,255,255,0.12)",
      }}
    >
      <span>✓ <strong>{toast.name}</strong> 담았어요</span>
      <button
        onClick={openDrawer}
        style={{
          border: "1px solid rgba(255,255,255,0.22)",
          background: "rgba(255,255,255,0.14)",
          color: "#fff", fontSize: 12, fontWeight: 700,
          padding: "6px 12px", borderRadius: 9, cursor: "pointer",
        }}
      >
        장바구니 보기
      </button>
    </div>
  );
}

export default function ShopLayout({ children }) {
  const [searchOpen, setSearchOpen] = useState(false);

  // Ctrl+K / Cmd+K 단축키
  useEffect(() => {
    const fn = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  return (
    <div
      className="sh-root"
      style={{
        minHeight: "100vh",
        background: T.bg,
        color: T.text,
        fontFamily: S.font,
        fontSize: 15,
        lineHeight: 1.6,
      }}
    >
      <ShopHeader onSearchOpen={() => setSearchOpen(true)} />
      <main>{children}</main>
      <ShopFooter />
      <CartDrawer />
      <CartToast />
      {searchOpen && (
        <SearchModal onClose={() => setSearchOpen(false)} />
      )}
    </div>
  );
}