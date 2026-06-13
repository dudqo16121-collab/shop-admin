"use client";

// ── 헤더: 스크롤 시 반투명 블러 + 장바구니 배지 팝 ────────────
import Link from "next/link";
import { useEffect, useState } from "react";
import { C } from "./theme";
import { useCart } from "../../lib/cart";
import { useWishlist } from "../../lib/wishlist";

const NAV = [
  { href: "/shop/", label: "홈" },
  { href: "/shop/products/", label: "전체 상품" },
  { href: "/shop/orders/", label: "주문 내역" },
];

export default function ShopHeader() {
  const cart = useCart();
  const wish = useWishlist();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      style={{
        position: "sticky", top: 0, zIndex: 100,
        background: scrolled ? "rgba(248,247,245,0.86)" : "transparent",
        backdropFilter: scrolled ? "blur(14px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(14px)" : "none",
        borderBottom: `1px solid ${scrolled ? C.border : "transparent"}`,
        transition: "background 0.25s ease, border-color 0.25s ease",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", gap: 24 }}>
        {/* 워드마크 */}
        <Link href="/shop/" style={{ display: "flex", alignItems: "center", gap: 9 }} aria-label="ShopAdmin 홈">
          <span style={{ width: 30, height: 30, borderRadius: 8, background: C.accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14 }}>S</span>
          <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.03em" }}>ShopAdmin</span>
        </Link>

        {/* 내비 */}
        <nav className="sh-nav-center" style={{ gap: 22, marginLeft: 12, flex: 1 }}>
          {NAV.map(n => (
            <Link key={n.href} href={n.href} className="sh-navlink" style={{ fontSize: 13.5, fontWeight: 600, color: C.textSub }}>
              {n.label}
            </Link>
          ))}
        </nav>

        {/* 우측 액션 */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: "auto" }}>
          <Link
            href="/"
            style={{ fontSize: 12, fontWeight: 600, color: C.textHint, padding: "7px 12px", borderRadius: 9, border: `1px solid ${C.border}` }}
          >
            관리자
          </Link>
          <Link
            href="/shop/wishlist/"
            className="sh-chip"
            aria-label={`찜한 상품 ${wish.count}개`}
            style={{
              position: "relative", width: 40, height: 40, borderRadius: 11,
              border: `1px solid ${C.border}`, background: C.surface,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              fontSize: 17, color: wish.count > 0 ? C.red : C.textSub,
            }}
          >
            {wish.count > 0 ? "♥" : "♡"}
            {wish.count > 0 && (
              <span style={{
                position: "absolute", top: -5, right: -5, minWidth: 17, height: 17,
                padding: "0 4px", borderRadius: 9, background: C.accent, color: "#fff",
                fontSize: 10, fontWeight: 800,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{wish.count}</span>
            )}
          </Link>
          <button
            onClick={cart.openDrawer}
            className="sh-btn"
            aria-label={`장바구니 열기 (${cart.count}개)`}
            style={{
              position: "relative", height: 40, padding: "0 16px", borderRadius: 11,
              background: C.accent, color: "#fff", border: "none",
              fontSize: 13, fontWeight: 700, cursor: "pointer",
              display: "inline-flex", alignItems: "center", gap: 8,
            }}
          >
            🛒 장바구니
            {cart.count > 0 && (
              <span
                key={cart.count}
                className="sh-pop"
                style={{
                  minWidth: 20, height: 20, padding: "0 6px", borderRadius: 10,
                  background: "#fff", color: C.accent,
                  fontSize: 11, fontWeight: 800,
                  alignItems: "center", justifyContent: "center",
                }}
              >
                {cart.count}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
