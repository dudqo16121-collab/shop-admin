"use client";

// ── 쇼핑몰 공통 셸: 헤더 + 푸터 + 드로어 + 토스트 ────────────
import { C, S } from "./theme";
import ShopHeader from "./ShopHeader";
import ShopFooter from "./ShopFooter";
import CartDrawer from "./CartDrawer";
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
        background: C.accent, color: "#fff",
        padding: "13px 18px", borderRadius: 14,
        boxShadow: "0 12px 32px rgba(26,25,23,0.25)",
        fontSize: 13, whiteSpace: "nowrap",
      }}
    >
      <span>✓ <strong>{toast.name}</strong> 담았어요</span>
      <button
        onClick={openDrawer}
        style={{ border: "none", background: "rgba(255,255,255,0.16)", color: "#fff", fontSize: 12, fontWeight: 700, padding: "6px 12px", borderRadius: 9, cursor: "pointer" }}
      >
        장바구니 보기
      </button>
    </div>
  );
}

export default function ShopLayout({ children }) {
  return (
    <div
      className="sh-root"
      style={{
        minHeight: "100vh", background: C.bg, color: C.text,
        fontFamily: S.font, fontSize: 15, lineHeight: 1.6,
      }}
    >
      <ShopHeader />
      <main>{children}</main>
      <ShopFooter />
      <CartDrawer />
      <CartToast />
    </div>
  );
}
