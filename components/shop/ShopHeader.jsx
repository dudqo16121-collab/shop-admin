"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { T, S } from "./theme";
import { useCart } from "../../lib/cart";
import { useWishlist } from "../../lib/wishlist";
import { CATEGORIES } from "../../lib/store-data";
import { useAuth } from "../../lib/auth";

const CAT_EMOJI = { "UI Kit": "⬡", "템플릿": "⚡", "플러그인": "◎", "아이콘": "◇", "폰트": "Aa" };

const NAV_ITEMS = [
  { label: "홈", href: "/shop/" },
  { label: "전체 상품", href: "/shop/products/" },
  { label: "번들", href: "/shop/bundles/" },
  {
    label: "카테고리",
    mega: true,
    cols: CATEGORIES.map(c => ({
      label: c,
      href: `/shop/products/?cat=${encodeURIComponent(c)}`,
      emoji: CAT_EMOJI[c],
    })),
  },
  { label: "주문 내역", href: "/shop/orders/" },
  { label: "찜 목록", href: "/shop/wishlist/" },
];

export default function ShopHeader({ onSearchOpen }) {
  const cart = useCart();
  const wish = useWishlist();
  const [scrolled, setScrolled] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const megaRef = useRef(null);
  const closeTimer = useRef(null);
const { user, logout, isLoggedIn } = useAuth();
const [profileOpen, setProfileOpen] = useState(false);
const profileRef = useRef(null);

  // 스크롤 감지
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 6);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // 바깥 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handler = (e) => {
      if (megaRef.current && !megaRef.current.contains(e.target)) {
        setMegaOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
  const handler = (e) => {
    if (profileRef.current && !profileRef.current.contains(e.target)) {
      setProfileOpen(false);
    }
  };
  document.addEventListener("mousedown", handler);
  return () => document.removeEventListener("mousedown", handler);
}, []);

  const openMega = () => {
    clearTimeout(closeTimer.current);
    setMegaOpen(true);
  };

  const closeMega = () => {
    closeTimer.current = setTimeout(() => setMegaOpen(false), 150);
  };

  return (
    <>
      {/* ── 공지 바 ── */}
      <div className="sh-notice-bar">
        ✺ 여름 시즌 세일 진행 중 — 전 상품 최대 30% 할인
        <Link href="/shop/products/">지금 확인하기 →</Link>
      </div>

      {/* ── 메인 헤더 ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        background: scrolled ? "rgba(10,10,15,0.94)" : "rgba(10,10,15,0.7)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: `1px solid ${scrolled ? T.border : "rgba(30,30,46,0.5)"}`,
        transition: "background 0.28s ease, border-color 0.28s ease",
      }}>
        <div style={{
          maxWidth: 1200, margin: "0 auto", padding: "0 24px",
          height: 64, display: "flex", alignItems: "center", gap: 16,
        }}>

          {/* 워드마크 */}
          <Link href="/shop/" aria-label="ShopAdmin 홈" style={{ display: "flex", alignItems: "center", gap: 9, flexShrink: 0 }}>
            <span style={{
              width: 32, height: 32, borderRadius: 10,
              background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
              color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 800, fontSize: 15,
            }}>S</span>
            <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.035em", color: T.text }}>
              ShopAdmin<span style={{ color: T.violet }}>.dev</span>
            </span>
          </Link>

          {/* 내비 */}
          <nav className="sh-nav-tabs" style={{ position: "relative" }}>
            {NAV_ITEMS.map(item => (
              <div
                key={item.label}
                className="sh-nav-item"
                style={{ position: "relative" }}
                onMouseEnter={item.mega ? openMega : undefined}
                onMouseLeave={item.mega ? closeMega : undefined}
              >
                {item.mega ? (
                  <>
                    {/* 카테고리 버튼 */}
                    <button
                      className="sh-nav-tab"
                      onMouseEnter={openMega}
                      style={{
                        background: megaOpen ? "#1C1C28" : "transparent",
                        color: megaOpen ? T.text : "#64748B",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.label}
                      <span style={{
                        fontSize: 9, marginLeft: 4, opacity: 0.6,
                        display: "inline-block",
                        transform: megaOpen ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s ease",
                      }}>▾</span>
                    </button>

                    {/* 메가 드롭다운 */}
                    {megaOpen && (
                      <div
                        ref={megaRef}
                        onMouseEnter={openMega}
                        onMouseLeave={closeMega}
                        style={{
                          position: "absolute",
                          top: "calc(100% + 2px)",
                          left: "50%",
                          transform: "translateX(-50%)",
                          minWidth: 520,
                          background: "#111118",
                          border: "1px solid #2D2D42",
                          borderRadius: 16,
                          boxShadow: "0 24px 64px rgba(0,0,0,0.8), 0 0 40px rgba(99,102,241,0.08)",
                          padding: "20px 22px",
                          zIndex: 500,
                          display: "grid",
                          gridTemplateColumns: "repeat(5,1fr)",
                          gap: 8,
                          animation: "shMegaDown 0.22s cubic-bezier(0.22,0.61,0.36,1) forwards",
                        }}
                      >
                        {item.cols.map((col, colIdx) => (
                          <Link
                            key={col.label}
                            href={col.href}
                            onClick={() => setMegaOpen(false)}
                            className="sh-mega-item"
                            style={{
                              display: "flex", flexDirection: "column",
                              alignItems: "center", gap: 8,
                              padding: "16px 10px", borderRadius: 12,
                              fontSize: 12.5, fontWeight: 700, color: T.textSub,
                              background: T.bgSubtle, border: `1px solid ${T.border}`,
                              textDecoration: "none",
                              animation: `shMegaItem 0.28s cubic-bezier(0.22,0.61,0.36,1) ${0.04 + colIdx * 0.04}s forwards`,
                              opacity: 0,
                              transition: "border-color 0.15s, color 0.15s, background 0.15s, box-shadow 0.15s",
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.borderColor = T.violet;
                              e.currentTarget.style.color = T.text;
                              e.currentTarget.style.background = T.bgCard;
                              e.currentTarget.style.boxShadow = `0 0 16px ${T.violetGlow}`;
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.borderColor = T.border;
                              e.currentTarget.style.color = T.textSub;
                              e.currentTarget.style.background = T.bgSubtle;
                              e.currentTarget.style.boxShadow = "none";
                            }}
                          >
                            <span style={{ fontSize: 26, fontFamily: S.mono }}>{col.emoji}</span>
                            {col.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className="sh-nav-tab"
                    style={{ display: "block", textDecoration: "none", whiteSpace: "nowrap" }}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* 검색바 */}
<div
  onClick={onSearchOpen}
  style={{
    flex: 1, maxWidth: 200,
    display: "flex", alignItems: "center", gap: 8,
    height: 38, padding: "0 14px",
    background: T.bgSubtle,
    borderRadius: 10, border: `1px solid ${T.border}`,
    fontSize: 13, color: T.textHint,
    cursor: "pointer",
    transition: "border-color 0.2s",
  }}
  onMouseEnter={e => e.currentTarget.style.borderColor = T.violet}
  onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
>
  <span style={{ opacity: 0.5, fontSize: 13 }}>🔍</span>
  <span style={{ fontFamily: S.mono, fontSize: 12, flex: 1 }}>검색...</span>
  <span style={{
    fontSize: 10, color: T.textHint, fontFamily: S.mono,
    background: T.bgCard, border: `1px solid ${T.border}`,
    padding: "2px 6px", borderRadius: 5, whiteSpace: "nowrap",
  }}>⌘K</span>
</div>

          {/* 우측 액션 */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>

            {/* 로그인 */}
{isLoggedIn ? (
  /* ── 로그인 상태: 프로필 메뉴 ── */
  <div ref={profileRef} style={{ position: "relative" }}>
    <button
      onClick={() => setProfileOpen(o => !o)}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        height: 38, padding: "0 12px", borderRadius: 10,
        border: `1px solid ${profileOpen ? T.violet : T.borderMid}`,
        background: profileOpen ? T.violetBg : T.bgSubtle,
        cursor: "pointer", transition: "all 0.15s",
      }}
    >
      {/* 아바타 */}
      <div style={{
        width: 24, height: 24, borderRadius: 7,
        background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
        color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontWeight: 800, fontFamily: S.mono, flexShrink: 0,
      }}>
        {user.avatar}
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color: T.text, fontFamily: S.mono }}>
        {user.name}
      </span>
      <span style={{
        fontSize: 9, color: T.textHint, opacity: 0.7,
        transform: profileOpen ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform 0.2s",
      }}>▾</span>
    </button>

    {/* 프로필 드롭다운 */}
    {profileOpen && (
      <div style={{
        position: "absolute", top: "calc(100% + 8px)", right: 0,
        width: 220, background: "#111118",
        border: `1px solid ${T.borderMid}`, borderRadius: 14,
        boxShadow: "0 20px 60px rgba(0,0,0,0.7), 0 0 30px rgba(99,102,241,0.08)",
        overflow: "hidden", zIndex: 500,
        animation: "shMegaDown 0.2s cubic-bezier(0.22,0.61,0.36,1) forwards",
      }}>
        {/* 유저 정보 */}
        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 2 }}>
            {user.name}
          </div>
          <div style={{ fontSize: 11, color: T.textHint, fontFamily: S.mono, marginBottom: 6 }}>
            {user.email}
          </div>
          <span style={{
            fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 5,
            background: T.violetBg, color: T.violet,
            border: `1px solid ${T.violet}40`, fontFamily: S.mono,
          }}>
            {user.plan} Plan
          </span>
        </div>

        {/* 메뉴 항목 */}
        {[
          { icon: "◈", label: "마이페이지", href: "/shop/mypage/" },
          { icon: "◈", label: "내 라이선스", href: "/shop/licenses/" },
          { icon: "🎫", label: "쿠폰 지갑", href: "/shop/coupons/" },
          { icon: "♡", label: "찜 목록", href: "/shop/wishlist/" },
          { icon: "🧾", label: "주문 내역", href: "/shop/orders/" },
          { icon: "⚙", label: "계정 설정", href: "/shop/settings/" },
        ].map(item => (
          <Link
            key={item.label}
            href={item.href}
            onClick={() => setProfileOpen(false)}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "11px 16px", fontSize: 13, color: T.textSub,
              textDecoration: "none", fontWeight: 500,
              transition: "background 0.12s, color 0.12s",
              borderBottom: `1px solid ${T.border}`,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = T.bgSubtle;
              e.currentTarget.style.color = T.text;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = T.textSub;
            }}
          >
            <span style={{ fontSize: 14, fontFamily: S.mono, color: T.violet }}>{item.icon}</span>
            {item.label}
          </Link>
        ))}

        {/* 로그아웃 */}
        <button
          onClick={() => { logout(); setProfileOpen(false); }}
          style={{
            width: "100%", padding: "11px 16px",
            display: "flex", alignItems: "center", gap: 10,
            border: "none", background: "transparent",
            fontSize: 13, color: T.red, cursor: "pointer", fontWeight: 600,
            transition: "background 0.12s",
            fontFamily: "inherit",
          }}
          onMouseEnter={e => e.currentTarget.style.background = T.redBg}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <span style={{ fontSize: 14, fontFamily: S.mono }}>→</span>
          로그아웃
        </button>
      </div>
    )}
  </div>
) : (
  /* ── 비로그인 상태: 로그인 버튼 ── */
  <Link
    href="/shop/login/"
    className="sh-btn"
    style={{
      height: 38, padding: "0 16px", borderRadius: 10,
      border: `1px solid ${T.borderMid}`,
      background: T.bgSubtle, color: T.textSub,
      fontSize: 13, fontWeight: 700,
      display: "inline-flex", alignItems: "center", gap: 6,
      fontFamily: S.mono, textDecoration: "none",
    }}
  >
    <span style={{ fontSize: 12 }}>→</span> 로그인
  </Link>
)}

            {/* 찜하기 */}
            <Link
              href="/shop/wishlist/"
              aria-label={`찜한 상품 ${wish.count}개`}
              style={{
                position: "relative", width: 38, height: 38, borderRadius: 10,
                border: `1px solid ${T.border}`, background: T.bgSubtle,
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, color: wish.count > 0 ? "#EF4444" : T.textHint,
                transition: "color 0.2s, border-color 0.2s",
                textDecoration: "none",
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = T.violet}
              onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
            >
              {wish.count > 0 ? "♥" : "♡"}
              {wish.count > 0 && (
                <span style={{
                  position: "absolute", top: -5, right: -5,
                  minWidth: 16, height: 16, padding: "0 4px", borderRadius: 8,
                  background: T.violet, color: "#fff",
                  fontSize: 10, fontWeight: 800,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>{wish.count}</span>
              )}
            </Link>

            {/* 장바구니 */}
            <button
              onClick={cart.openDrawer}
              className="sh-btn"
              aria-label={`장바구니 ${cart.count}개`}
              style={{
                position: "relative", height: 38, padding: "0 16px", borderRadius: 10,
                background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                color: "#fff", border: "none",
                fontSize: 13, fontWeight: 700, cursor: "pointer",
                display: "inline-flex", alignItems: "center", gap: 7,
              }}
            >
              <span>장바구니</span>
              {cart.count > 0 && (
                <span
                  key={cart.count}
                  className="sh-pop"
                  style={{
                    minWidth: 20, height: 20, padding: "0 5px", borderRadius: 10,
                    background: "rgba(255,255,255,0.25)", color: "#fff",
                    fontSize: 11, fontWeight: 800,
                    alignItems: "center", justifyContent: "center",
                    display: "inline-flex",
                  }}
                >
                  {cart.count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}