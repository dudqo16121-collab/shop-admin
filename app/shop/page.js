"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { T, S, CAT_TINT_V2 } from "../../components/shop/theme";
import Reveal from "../../components/shop/Reveal";
import ProductCard from "../../components/shop/ProductCard";
import RecentlyViewed from "../../components/shop/RecentlyViewed";
import { CATEGORIES, fmtWon, newest, bestSellers, byId, VISIBLE } from "../../lib/store-data";
import ProductCardSkeleton from "../../components/shop/ProductCardSkeleton";

// ── 카테고리 메타 ───────────────────────────────────────────
const CAT_META = {
  "UI Kit":   { icon: "⬡", ext: ".tsx",  color: "#6366F1", desc: "200+ components" },
  "템플릿":   { icon: "⚡", ext: ".next", color: "#10B981", desc: "Full-stack ready" },
  "플러그인": { icon: "◎", ext: ".pkg",  color: "#F59E0B", desc: "npm installable" },
  "아이콘":   { icon: "◇", ext: ".svg",  color: "#EC4899", desc: "2,400+ icons" },
  "폰트":     { icon: "Aa", ext: ".woff2",color: "#8B5CF6", desc: "Dev-optimized" },
};

// ── 탭 ─────────────────────────────────────────────────────
const TABS = ["베스트셀러", "신상품", "할인"];
const SALE_IDS = new Set([2, 9, 11]);
const ORIGINAL_PRICES = { 2: 179000, 9: 259000, 11: 159000 };
const [tabLoading, setTabLoading] = useState(false);
// ── 히어로 코드 블록 애니메이션 ────────────────────────────
const CODE_LINES = [
  { indent: 0, tokens: [{ t: "import", c: "#C084FC" }, { t: " { ", c: "#94A3B8" }, { t: "Button", c: "#38BDF8" }, { t: ", ", c: "#94A3B8" }, { t: "Card", c: "#38BDF8" }, { t: " } ", c: "#94A3B8" }, { t: "from", c: "#C084FC" }, { t: " '@shopadmin/ui'", c: "#86EFAC" }] },
  { indent: 0, tokens: [] },
  { indent: 0, tokens: [{ t: "export default ", c: "#C084FC" }, { t: "function", c: "#C084FC" }, { t: " App", c: "#38BDF8" }, { t: "() {", c: "#94A3B8" }] },
  { indent: 1, tokens: [{ t: "return", c: "#C084FC" }, { t: " (", c: "#94A3B8" }] },
  { indent: 2, tokens: [{ t: "<", c: "#94A3B8" }, { t: "Card", c: "#F97316" }, { t: " variant", c: "#38BDF8" }, { t: "=", c: "#94A3B8" }, { t: '"glass"', c: "#86EFAC" }, { t: ">", c: "#94A3B8" }] },
  { indent: 3, tokens: [{ t: "<", c: "#94A3B8" }, { t: "Button", c: "#F97316" }, { t: " size", c: "#38BDF8" }, { t: "=", c: "#94A3B8" }, { t: '"lg"', c: "#86EFAC" }, { t: ">", c: "#94A3B8" }] },
  { indent: 4, tokens: [{ t: "Get Started", c: "#94A3B8" }] },
  { indent: 3, tokens: [{ t: "</", c: "#94A3B8" }, { t: "Button", c: "#F97316" }, { t: ">", c: "#94A3B8" }] },
  { indent: 2, tokens: [{ t: "</", c: "#94A3B8" }, { t: "Card", c: "#F97316" }, { t: ">", c: "#94A3B8" }] },
  { indent: 1, tokens: [{ t: ")", c: "#94A3B8" }] },
  { indent: 0, tokens: [{ t: "}", c: "#94A3B8" }] },
];

// ── 타이핑 훅 ───────────────────────────────────────────────
function useTypingIndex(total, delay = 80) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (idx >= total) return;
    const t = setTimeout(() => setIdx(i => i + 1), delay);
    return () => clearTimeout(t);
  }, [idx, total, delay]);
  return idx;
}

// ── 코드 에디터 컴포넌트 ────────────────────────────────────
function CodeEditor() {
  const visibleLines = useTypingIndex(CODE_LINES.length, 120);

  return (
    <div style={{
      background: "#0D0D14",
      border: `1px solid ${T.border}`,
      borderRadius: 18,
      overflow: "hidden",
      boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 60px rgba(99,102,241,0.08)",
    }}>
      {/* 에디터 탭바 */}
      <div style={{
        background: "#111118",
        borderBottom: `1px solid ${T.border}`,
        padding: "0 16px",
        display: "flex", alignItems: "center", gap: 0,
      }}>
        {/* 도트 */}
        <div style={{ display: "flex", gap: 6, marginRight: 16, paddingRight: 16, borderRight: `1px solid ${T.border}`, height: 42, alignItems: "center" }}>
          {["#EF4444", "#F59E0B", "#10B981"].map((c, i) => (
            <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.8 }} />
          ))}
        </div>
        {/* 파일 탭 */}
        {[
          { name: "App.tsx", active: true, color: "#38BDF8" },
          { name: "Button.tsx", active: false, color: "#94A3B8" },
          { name: "theme.ts", active: false, color: "#94A3B8" },
        ].map(tab => (
          <div key={tab.name} style={{
            height: 42, padding: "0 16px",
            display: "flex", alignItems: "center", gap: 6,
            borderRight: `1px solid ${T.border}`,
            background: tab.active ? T.bg : "transparent",
            borderBottom: tab.active ? `2px solid ${T.violet}` : "2px solid transparent",
            fontSize: 12, fontWeight: tab.active ? 700 : 400,
            color: tab.active ? T.text : T.textHint,
            fontFamily: S.mono, cursor: "pointer",
          }}>
            <span style={{ color: tab.color, fontSize: 10 }}>●</span>
            {tab.name}
          </div>
        ))}
      </div>

      {/* 코드 본문 */}
      <div style={{ padding: "20px 0", minHeight: 280, position: "relative" }}>
        {CODE_LINES.slice(0, visibleLines).map((line, li) => (
          <div key={li} style={{
            display: "flex", alignItems: "center",
            padding: "2px 20px",
            animation: "shFadeIn 0.15s ease",
          }}>
            {/* 라인 번호 */}
            <span style={{
              width: 28, fontSize: 11, color: T.textHint, fontFamily: S.mono,
              textAlign: "right", marginRight: 20, flexShrink: 0, userSelect: "none",
            }}>
              {li + 1}
            </span>
            {/* 들여쓰기 */}
            <span style={{ width: line.indent * 18, flexShrink: 0 }} />
            {/* 토큰 */}
            <span style={{ fontFamily: S.mono, fontSize: 13, lineHeight: 1.8 }}>
              {line.tokens.map((tok, ti) => (
                <span key={ti} style={{ color: tok.c }}>{tok.t}</span>
              ))}
            </span>
            {/* 커서 (마지막 줄) */}
            {li === visibleLines - 1 && visibleLines < CODE_LINES.length && (
              <span className="sh-cursor" style={{ marginLeft: 2 }} />
            )}
          </div>
        ))}
      </div>

      {/* 상태바 */}
      <div style={{
        borderTop: `1px solid ${T.border}`,
        background: T.violet,
        padding: "5px 16px",
        display: "flex", alignItems: "center", gap: 16,
        fontSize: 11, color: "rgba(255,255,255,0.8)", fontFamily: S.mono,
      }}>
        <span>⎇ main</span>
        <span>TypeScript</span>
        <span style={{ marginLeft: "auto" }}>Ln {Math.min(visibleLines, CODE_LINES.length)}, Col 1</span>
        <span>UTF-8</span>
      </div>
    </div>
  );
}

// ── npm 스타일 패키지 미니 카드 (히어로 우측 하단) ────────────
function PackageCard({ name, version, weekly, color }) {
  return (
    <div style={{
      background: "#111118",
      border: `1px solid ${T.border}`,
      borderRadius: 12, padding: "12px 14px",
      borderLeft: `3px solid ${color}`,
      transition: "border-color 0.2s, box-shadow 0.2s",
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.boxShadow = `0 0 24px ${color}25`; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: T.text, fontFamily: S.mono }}>{name}</span>
        <span style={{ fontSize: 10, color: color, fontFamily: S.mono, background: `${color}18`, padding: "2px 7px", borderRadius: 5 }}>{version}</span>
      </div>
      <div style={{ fontSize: 11, color: T.textHint, fontFamily: S.mono }}>
        ↓ <strong style={{ color: T.textSub }}>{weekly}</strong>/week
      </div>
    </div>
  );
}

export default function ShopHome() {
  const [tab, setTab] = useState("베스트셀러");

  const hero1 = byId(3);
  const hero2 = byId(1);
  const hero3 = byId(7);

  const tabProducts = {
    "베스트셀러": bestSellers(8),
    "신상품": newest(8),
    "할인": VISIBLE.filter(p => SALE_IDS.has(p.id)),
  };
const handleTabChange = (t) => {
  setTabLoading(true);
  setTab(t);
  setTimeout(() => setTabLoading(false), 400);
};
  return (
    <>
      {/* ━━━━━━━━━━━━━━━━ 히어로 ━━━━━━━━━━━━━━━━ */}
      <section className="sh-hero-bg" style={{ padding: "60px 0 80px" }}>
        <div style={{ ...S.wrap }}>
          <div className="sh-hero-grid" style={{ gap: 56 }}>

            {/* 좌: 카피 */}
            <div>
              {/* npm 설치 배지 */}
              <div className="sh-fadeup" style={{ marginBottom: 24 }}>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 10,
                  background: "#111118", border: `1px solid ${T.border}`,
                  borderRadius: 10, padding: "9px 16px",
                }}>
                  <span style={{ fontSize: 11, color: T.textHint, fontFamily: S.mono }}>$</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#10B981", fontFamily: S.mono }}>
                    npm install @shopadmin/ui
                  </span>
                  <span style={{
                    fontSize: 10, color: T.textHint, background: T.bgSubtle,
                    padding: "3px 8px", borderRadius: 6, fontFamily: S.mono, cursor: "pointer",
                  }}>copy</span>
                </div>
              </div>

              <h1 className="sh-fadeup" style={{ ...S.display, margin: "0 0 12px", animationDelay: "80ms" }}>
                The Dev<br />
                <span style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6, #10B981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  Marketplace
                </span>
              </h1>

              <p className="sh-fadeup" style={{ fontSize: 16, color: T.textSub, lineHeight: 1.78, maxWidth: 400, marginBottom: 32, animationDelay: "160ms" }}>
                UI Kit·템플릿·플러그인·아이콘 — 개발 속도를 높여주는
                프리미엄 웹 리소스를 한 곳에서.
              </p>

              {/* CTA */}
              <div className="sh-fadeup" style={{ display: "flex", gap: 12, marginBottom: 36, animationDelay: "240ms" }}>
                <Link href="/shop/products/" className="sh-btn" style={S.btnPrimary}>
                  제품 탐색하기 →
                </Link>
                <Link href="/shop/login/" className="sh-btn" style={S.btnGhost}>
                  무료 가입
                </Link>
              </div>

              {/* 기술 스택 태그 */}
              <div className="sh-fadeup" style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 36, animationDelay: "300ms" }}>
                {["Next.js 14", "React 19", "TypeScript", "Tailwind v4", "Figma", "Framer"].map(tag => (
                  <span key={tag} className="sh-stack-badge">{tag}</span>
                ))}
              </div>

              {/* npm 패키지 미니 카드 3개 */}
              <div className="sh-fadeup" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9, maxWidth: 380, animationDelay: "360ms" }}>
                <PackageCard name="@shopadmin/ui" version="v3.2.1" weekly="1.2k" color="#6366F1" />
                <PackageCard name="@shopadmin/icons" version="v2.0.0" weekly="984" color="#10B981" />
                <PackageCard name="@shopadmin/motion" version="v1.5.0" weekly="512" color="#F59E0B" />
                <PackageCard name="@shopadmin/forms" version="v1.1.0" weekly="438" color="#EC4899" />
              </div>
            </div>

            {/* 우: 코드 에디터 */}
            <div className="sh-hero-visual sh-fadeup" style={{ animationDelay: "100ms" }}>
              <CodeEditor />

              {/* 에디터 아래 통계 바 */}
              <div style={{
                display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
                gap: 1, marginTop: 12, background: T.border, borderRadius: 12, overflow: "hidden",
              }}>
                {[
                  { value: "12+", label: "Products", icon: "◈" },
                  { value: "5,000+", label: "Downloads", icon: "↓" },
                  { value: "4.8 ★", label: "Avg. Rating", icon: "◆" },
                ].map(s => (
                  <div key={s.label} style={{
                    background: T.bgCard, padding: "14px 16px",
                    textAlign: "center",
                  }}>
                    <div style={{ fontSize: 11, color: T.violet, fontFamily: S.mono, marginBottom: 4 }}>{s.icon}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: T.text, fontFamily: S.mono }}>{s.value}</div>
                    <div style={{ fontSize: 10, color: T.textHint, fontFamily: S.mono, marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━ 신뢰 마퀴 ━━━━━━━━━━━━━━━━ */}
      <div className="sh-trust-bar">
        <div className="sh-marquee" style={{ padding: "12px 0" }}>
          <div className="sh-marquee-track">
            {[
              ["✓", "100% 디지털 즉시 다운로드"],
              ["✓", "상업적 사용 라이선스 포함"],
              ["✓", "Next.js · React · TypeScript 지원"],
              ["✓", "Figma 소스 파일 제공"],
              ["✓", "무제한 업데이트"],
              ["✓", "14일 환불 보장"],
            ].flatMap((x, i) => [
              <span key={`a${i}`} className="sh-trust-item"><strong style={{ color: T.green }}>✓</strong>{x[1]}</span>,
              <span key={`d${i}`} className="sh-trust-divider"> · </span>,
            ]).concat([
              ["✓", "100% 디지털 즉시 다운로드"],
              ["✓", "상업적 사용 라이선스 포함"],
              ["✓", "Next.js · React · TypeScript 지원"],
              ["✓", "Figma 소스 파일 제공"],
              ["✓", "무제한 업데이트"],
              ["✓", "14일 환불 보장"],
            ].flatMap((x, i) => [
              <span key={`b${i}`} className="sh-trust-item"><strong style={{ color: T.green }}>✓</strong>{x[1]}</span>,
              <span key={`e${i}`} className="sh-trust-divider"> · </span>,
            ]))}
          </div>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━ 카테고리 (파일 탭 스타일) ━━━━━━━━━━━━━━━━ */}
      <section style={{ ...S.wrap, paddingTop: 72 }}>
        <Reveal>
          <div className="sh-section-head">
            <div>
              <div className="sh-eyebrow">// Browse by Category</div>
              <h2 style={{ marginTop: 6 }}>카테고리</h2>
            </div>
          </div>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0,1fr))", gap: 12 }}>
          {CATEGORIES.map((cat, i) => {
            const meta = CAT_META[cat];
            return (
              <Reveal key={cat} delay={i * 60}>
                <Link
                  href={`/shop/products/?cat=${encodeURIComponent(cat)}`}
                  className="sh-glow-card"
                  style={{
                    display: "block", textDecoration: "none",
                    background: T.bgCard, border: `1px solid ${T.border}`,
                    borderRadius: 14, padding: "20px 18px",
                    borderTop: `3px solid ${meta.color}`,
                    transition: "transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease",
                  }}
                >
                  {/* 파일 확장자 배지 */}
                  <div style={{
                    display: "inline-block", fontSize: 10, fontWeight: 700,
                    color: meta.color, fontFamily: S.mono,
                    background: `${meta.color}18`,
                    padding: "3px 8px", borderRadius: 5, marginBottom: 14,
                  }}>
                    {meta.ext}
                  </div>

                  {/* 아이콘 */}
                  <div style={{
                    fontSize: 32, fontFamily: S.mono, color: meta.color,
                    marginBottom: 12, lineHeight: 1,
                  }}>
                    {meta.icon}
                  </div>

                  {/* 카테고리명 */}
                  <div style={{ fontSize: 14, fontWeight: 800, color: T.text, marginBottom: 4 }}>
                    {cat}
                  </div>

                  {/* 설명 */}
                  <div style={{ fontSize: 11, color: T.textHint, fontFamily: S.mono }}>
                    {meta.desc}
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━ 프로모션 배너 (터미널 스타일) ━━━━━━━━━━━━━━━━ */}
      <section style={{ ...S.wrap, paddingTop: 64 }}>
        <Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>

            {/* 와이드: 터미널 번들 배너 */}
            <div className="sh-promo-card" style={{
              background: "#0D0D14",
              border: `1px solid ${T.border}`,
              borderRadius: 18, overflow: "hidden",
              display: "flex", flexDirection: "column",
              position: "relative",
            }}>
              {/* 글로우 */}
              <div style={{ position: "absolute", top: "30%", left: "20%", width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.14), transparent 70%)", pointerEvents: "none" }} />

              {/* 터미널 헤더 바 */}
              <div style={{
                background: "#111118", borderBottom: `1px solid ${T.border}`,
                padding: "10px 18px", display: "flex", alignItems: "center", gap: 8,
              }}>
                {["#EF4444", "#F59E0B", "#10B981"].map((c, i) => (
                  <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.8 }} />
                ))}
                <span style={{ fontSize: 11, color: T.textHint, fontFamily: S.mono, marginLeft: 6 }}>
                  bundle-deal — bash
                </span>
              </div>

              {/* 터미널 본문 */}
              <div style={{ padding: "24px 28px 28px", flex: 1, display: "flex", gap: 24, alignItems: "center", position: "relative", zIndex: 1 }}>
                <div style={{ flex: 1 }}>
                  {/* CLI 라인들 */}
                  <div style={{ fontFamily: S.mono, fontSize: 12, marginBottom: 18 }}>
                    {[
                      { prompt: "❯", text: "npx shopadmin add ui-kit template", color: "#94A3B8" },
                      { prompt: "✓", text: "Installing packages...", color: "#10B981" },
                      { prompt: "✓", text: "Bundle ready! Saved ₩108,000", color: "#6366F1" },
                    ].map((line, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, marginBottom: 6 }}>
                        <span style={{ color: line.color, fontWeight: 700 }}>{line.prompt}</span>
                        <span style={{ color: i === 0 ? "#94A3B8" : line.color }}>{line.text}</span>
                      </div>
                    ))}
                  </div>

                  <span style={{ ...S.badgeGreen, display: "inline-flex", marginBottom: 12 }}>BUNDLE DEAL</span>
                  <div style={{ fontSize: "clamp(20px,3vw,30px)", fontWeight: 800, color: T.text, letterSpacing: "-0.03em", lineHeight: 1.2, marginBottom: 16 }}>
                    UI Kit + 템플릿 번들<br />
                    <span style={{ color: T.violet }}>최대 40% 절약</span>
                  </div>
                  <Link href="/shop/products/" className="sh-btn" style={{ ...S.btnPrimary, display: "inline-flex", height: 40, padding: "0 20px", borderRadius: 9, fontSize: 13 }}>
                    번들 보기 →
                  </Link>
                </div>

                {/* 우측 코드 심볼 */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 80, fontFamily: S.mono, color: T.textHint, lineHeight: 1, opacity: 0.4 }}>⬡</div>
                  <div style={{ fontFamily: S.mono, fontSize: 11, color: T.textHint, marginTop: 8 }}>
                    {`// 40% off`}<br />
                    {`// limited time`}
                  </div>
                </div>
              </div>
            </div>

            {/* 내로우: 개발자 쿠폰 */}
            <div className="sh-promo-card" style={{
              background: "#0C1A10",
              border: `1px solid ${T.border}`,
              borderRadius: 18, overflow: "hidden",
              padding: "24px 24px 28px",
              display: "flex", flexDirection: "column", justifyContent: "space-between",
              position: "relative",
            }}>
              <div>
                <div style={{ position: "absolute", top: 16, right: 16 }}>
                  <span style={{ ...S.badgeAmber, display: "inline-flex" }}>DEV20</span>
                </div>
                <div style={{ fontFamily: S.mono, fontSize: 12, color: T.textHint, marginBottom: 20 }}>
                  {`// new developer offer`}
                </div>
                <div style={{ fontSize: 36, fontFamily: S.mono, color: "#10B981", lineHeight: 1, marginBottom: 14 }}>◎</div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: T.green, fontFamily: S.mono, marginBottom: 8 }}>
                  FIRST PURCHASE
                </div>
                <div style={{ fontSize: "clamp(18px,2.5vw,24px)", fontWeight: 800, color: T.text, letterSpacing: "-0.02em", lineHeight: 1.25 }}>
                  첫 구매 20% 할인
                </div>
              </div>

              {/* 쿠폰 코드 박스 */}
              <div style={{
                background: "#0A0A0F", borderRadius: 10,
                border: `1px dashed ${T.borderMid}`,
                padding: "10px 14px", marginTop: 20,
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <span style={{ fontFamily: S.mono, fontSize: 14, fontWeight: 800, color: T.green, letterSpacing: "0.1em" }}>
                  DEV20
                </span>
                <span style={{ fontSize: 11, color: T.textHint, fontFamily: S.mono }}>copy</span>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ━━━━━━━━━━━━━━━━ 상품 탭 ━━━━━━━━━━━━━━━━ */}
      <section style={{ ...S.wrap, paddingTop: 72 }}>
        <Reveal>
          <div className="sh-section-head">
            <div>
              <div className="sh-eyebrow">// Our Products</div>
              <h2 style={{ marginTop: 6 }}>제품</h2>
            </div>
            <Link href="/shop/products/" className="sh-navlink" style={{ fontSize: 13, fontWeight: 700, color: T.violet }}>
              전체 보기 →
            </Link>
          </div>

          {/* 파일 탭 스타일 탭 버튼 */}
          <div style={{
            display: "flex", borderBottom: `1px solid ${T.border}`,
            marginBottom: 24,
          }}>
            {TABS.map(t => (
              <button
                key={t}
                onClick={() => handleTabChange(t)}
                style={{
                  height: 40, padding: "0 18px",
                  border: "none", background: "transparent",
                  fontSize: 13, fontWeight: tab === t ? 700 : 500,
                  color: tab === t ? T.violet : T.textHint,
                  borderBottom: `2px solid ${tab === t ? T.violet : "transparent"}`,
                  cursor: "pointer", fontFamily: S.mono,
                  transition: "color 0.15s, border-color 0.15s",
                  marginBottom: -1,
                }}
              >
                {t === "베스트셀러" ? "best.ts" : t === "신상품" ? "new.ts" : "sale.ts"}
              </button>
            ))}
          </div>
        </Reveal>

{tabLoading ? (
  <div className="sh-grid-4">
    {Array.from({ length: 8 }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
) : (
  <div className="sh-grid-4" key={tab}>
    {(tabProducts[tab] || []).slice(0, 8).map((p, i) => (
      <Reveal key={p.id} delay={(i % 4) * 65}>
        <ProductCard p={p} originalPrice={ORIGINAL_PRICES[p.id]} />
      </Reveal>
    ))}
  </div>
)}
      </section>

      {/* ━━━━━━━━━━━━━━━━ 기술 스택 패치 섹션 ━━━━━━━━━━━━━━━━ */}
      <section style={{ ...S.wrap, paddingTop: 72 }}>
        <Reveal>
          <div style={{
            background: T.bgCard, border: `1px solid ${T.border}`,
            borderRadius: 20, padding: "36px 40px",
            display: "flex", alignItems: "center", gap: 40,
            flexWrap: "wrap",
          }}>
            <div style={{ flex: 1, minWidth: 240 }}>
              <div className="sh-eyebrow" style={{ marginBottom: 10 }}>// Compatible with</div>
              <h3 style={{ fontSize: "clamp(18px,3vw,26px)", fontWeight: 800, color: T.text, margin: 0, letterSpacing: "-0.025em" }}>
                모든 주요 프레임워크 지원
              </h3>
              <p style={{ fontSize: 13, color: T.textSub, marginTop: 8, lineHeight: 1.7 }}>
                React, Next.js, Vue, Svelte, Astro 환경에서 바로 사용 가능.
                TypeScript 타입 정의 포함.
              </p>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {[
                { name: "React", ver: "19.x", color: "#38BDF8" },
                { name: "Next.js", ver: "14.x", color: "#F8FAFC" },
                { name: "Vue", ver: "3.x", color: "#4ADE80" },
                { name: "Svelte", ver: "5.x", color: "#F97316" },
                { name: "Astro", ver: "4.x", color: "#C084FC" },
                { name: "TypeScript", ver: "5.x", color: "#38BDF8" },
                { name: "Tailwind", ver: "v4", color: "#38BDF8" },
                { name: "Figma", ver: "plugin", color: "#EC4899" },
              ].map(fw => (
                <div key={fw.name} style={{
                  background: T.bgRaised, border: `1px solid ${T.border}`,
                  borderRadius: 9, padding: "8px 12px",
                  display: "flex", alignItems: "center", gap: 7,
                }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: fw.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: T.text, fontFamily: S.mono }}>{fw.name}</span>
                  <span style={{ fontSize: 10, color: T.textHint, fontFamily: S.mono }}>{fw.ver}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ━━━━━━━━━━━━━━━━ CTA 섹션 ━━━━━━━━━━━━━━━━ */}
      <section style={{ ...S.wrap, paddingTop: 72 }}>
        <Reveal>
          <div style={{
            background: "linear-gradient(135deg, #0F0F1E, #13132A)",
            border: `1px solid ${T.borderMid}`,
            borderRadius: 24, padding: "56px 48px",
            textAlign: "center", position: "relative", overflow: "hidden",
          }}>
            {/* 배경 글로우 */}
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.15), transparent 70%)", pointerEvents: "none" }} />

            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ ...S.eyebrow, marginBottom: 14 }}>// Get Started Today</div>
              <h2 style={{ fontSize: "clamp(24px,4vw,42px)", fontWeight: 800, letterSpacing: "-0.035em", color: T.text, margin: "0 0 14px" }}>
                지금 바로 시작하세요
              </h2>
              <p style={{ fontSize: 15, color: T.textSub, marginBottom: 32, maxWidth: 460, margin: "0 auto 32px" }}>
                프리미엄 웹 개발 리소스로 다음 프로젝트를 빠르게 완성하세요.
                <br />14일 환불 보장, 무제한 업데이트.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <Link href="/shop/products/" className="sh-btn" style={{ ...S.btnPrimary, height: 50, padding: "0 32px", fontSize: 15 }}>
                  제품 탐색하기 →
                </Link>
                <Link href="/shop/login/" className="sh-btn" style={{ ...S.btnGhost, height: 50, padding: "0 32px", fontSize: 15 }}>
                  무료 가입
                </Link>
              </div>
              {/* 코드 힌트 */}
              <div style={{ marginTop: 28, fontFamily: S.mono, fontSize: 12, color: T.textHint }}>
                <span style={{ color: T.violet }}>$</span> npx create-next-app --example shopadmin my-project
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ━━━━━━━━━━━━━━━━ 최근 본 제품 ━━━━━━━━━━━━━━━━ */}
      <div style={S.wrap}>
        <RecentlyViewed />
      </div>
    </>
  );
}