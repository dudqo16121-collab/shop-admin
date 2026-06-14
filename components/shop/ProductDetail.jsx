"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { T, S, CAT_TINT_V2 } from "./theme";
import Reveal from "./Reveal";
import ProductCard from "./ProductCard";
import {
  byId, fmtWon, getOptions, NEW_IDS, related,
} from "../../lib/store-data";
import { useCart } from "../../lib/cart";
import { useWishlist } from "../../lib/wishlist";
import RecentlyViewed, { recordView } from "./RecentlyViewed";

// ── 카테고리별 메타 ─────────────────────────────────────────
const CAT_META = {
  "UI Kit":   {
    ext: ".tsx", color: "#6366F1",
    stack: ["React", "Next.js", "TypeScript", "Tailwind", "Figma"],
    includes: ["200+ 컴포넌트", "Figma 소스 파일", "다크/라이트 모드", "Storybook 문서", "TypeScript 타입"],
    preview: [
      { t: "import", c: "#C084FC" }, { t: " { Button } ", c: "#94A3B8" },
      { t: "from", c: "#C084FC" }, { t: " '@shopadmin/ui'", c: "#86EFAC" },
    ],
  },
  "템플릿": {
    ext: ".next", color: "#10B981",
    stack: ["Next.js 14", "Supabase", "Stripe", "TypeScript", "Tailwind"],
    includes: ["인증 시스템", "결제 연동", "대시보드", "SEO 최적화", "배포 가이드"],
    preview: [
      { t: "npx", c: "#10B981" }, { t: " create-next-app", c: "#94A3B8" },
      { t: " --example", c: "#F97316" }, { t: " shopadmin", c: "#86EFAC" },
    ],
  },
  "플러그인": {
    ext: ".pkg", color: "#F59E0B",
    stack: ["npm", "React", "Framer Motion", "TypeScript", "ESM"],
    includes: ["50+ 인터랙션", "TypeScript 지원", "Tree-shaking", "SSR 호환", "MIT 라이선스"],
    preview: [
      { t: "npm", c: "#F59E0B" }, { t: " install", c: "#94A3B8" },
      { t: " @shopadmin/motion", c: "#86EFAC" },
    ],
  },
  "아이콘": {
    ext: ".svg", color: "#EC4899",
    stack: ["SVG", "React", "Vue", "Svelte", "Figma"],
    includes: ["2,400+ 아이콘", "4가지 굵기", "React 컴포넌트", "Figma 플러그인", "WOFF2 포함"],
    preview: [
      { t: "import", c: "#C084FC" }, { t: " { IconName } ", c: "#94A3B8" },
      { t: "from", c: "#C084FC" }, { t: " '@shopadmin/icons'", c: "#86EFAC" },
    ],
  },
  "폰트": {
    ext: ".woff2", color: "#8B5CF6",
    stack: ["OTF", "WOFF2", "CSS Variables", "Figma", "Variable Font"],
    includes: ["4가지 굵기", "리거처 지원", "한글 최적화", "CSS 변수 키트", "라이선스 무제한"],
    preview: [
      { t: "@import", c: "#C084FC" }, { t: " url(", c: "#94A3B8" },
      { t: "'@shopadmin/font'", c: "#86EFAC" }, { t: ")", c: "#94A3B8" },
    ],
  },
};

// ── 리뷰 데이터 ─────────────────────────────────────────────
const REVIEWS_DATA = {
  1: [
    { name: "김**", avatar: "K", role: "Frontend Dev", rating: 5, date: "2026-05-12", text: "컴포넌트 퀄리티가 정말 높아요. Figma 파일도 잘 정리되어 있고, TypeScript 타입이 완벽하게 제공되어 실무 프로젝트에 바로 투입했습니다." },
    { name: "이**", avatar: "L", role: "UI Designer", rating: 5, date: "2026-04-28", text: "디자인 토큰 시스템이 체계적으로 잘 되어있어요. 다크모드 지원도 완벽하고 Tailwind와의 연동도 매끄럽습니다." },
    { name: "박**", avatar: "P", role: "Indie Developer", rating: 4, date: "2026-04-10", text: "200개 이상의 컴포넌트 중 90% 이상을 실제로 사용했습니다. 업데이트도 자주 해주셔서 믿음이 갑니다." },
  ],
  3: [
    { name: "최**", avatar: "C", role: "Startup Founder", rating: 5, date: "2026-05-18", text: "Supabase + Stripe 연동이 완벽하게 되어있어서 1주일 만에 MVP를 런칭했습니다. 그 가격에 이 퀄리티는 말이 안 됩니다." },
    { name: "정**", avatar: "J", role: "Full-stack Dev", rating: 5, date: "2026-05-01", text: "코드 구조가 너무 깔끔해서 온보딩이 빠릅니다. Next.js 14 App Router 기반으로 최신 스택을 쓰고 있어요." },
  ],
};

const DEFAULT_REVIEWS = [
  { name: "개**", avatar: "D", role: "Developer", rating: 5, date: "2026-05-20", text: "퀄리티 대비 가격이 정말 합리적입니다. 실무에 바로 적용했고 팀원들도 만족합니다." },
  { name: "프**", avatar: "F", role: "Freelancer", rating: 4, date: "2026-04-15", text: "문서화가 잘 되어있고 업데이트도 자주 해주셔서 믿고 구매할 수 있습니다." },
];

// ── 탭 정의 ─────────────────────────────────────────────────
const TABS = ["overview", "preview", "changelog", "reviews"];
const TAB_LABELS = { overview: "overview.md", preview: "demo.tsx", changelog: "CHANGELOG.md", reviews: "reviews.json" };

// ── 별점 컴포넌트 ───────────────────────────────────────────
function Stars({ rating, size = 13 }) {
  return (
    <span aria-label={`평점 ${rating}`} style={{ color: "#F59E0B", fontSize: size, letterSpacing: 1 }}>
      {"★".repeat(Math.floor(rating))}{"☆".repeat(5 - Math.floor(rating))}
    </span>
  );
}

// ── 코드 인라인 렌더 ─────────────────────────────────────────
function CodeLine({ tokens }) {
  return (
    <div style={{ fontFamily: S.mono, fontSize: 13, lineHeight: 1.9 }}>
      {tokens.map((tok, i) => (
        <span key={i} style={{ color: tok.c }}>{tok.t}</span>
      ))}
    </div>
  );
}

// ── 설치 코드 블록 ───────────────────────────────────────────
function InstallBlock({ cat }) {
  const [copied, setCopied] = useState(false);
  const meta = CAT_META[cat] || CAT_META["UI Kit"];
  const cmd = meta.preview.map(t => t.t).join("");

  const copy = () => {
    try { navigator.clipboard.writeText(cmd); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div style={{
      background: "#0D0D14", border: `1px solid ${T.border}`,
      borderRadius: 12, overflow: "hidden",
    }}>
      {/* 헤더 */}
      <div style={{
        background: "#111118", borderBottom: `1px solid ${T.border}`,
        padding: "9px 16px", display: "flex", alignItems: "center", gap: 8,
      }}>
        {["#EF4444", "#F59E0B", "#10B981"].map((c, i) => (
          <div key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: c, opacity: 0.8 }} />
        ))}
        <span style={{ fontSize: 11, color: T.textHint, fontFamily: S.mono, marginLeft: 4 }}>terminal</span>
        <button onClick={copy} style={{
          marginLeft: "auto", fontSize: 11, color: copied ? T.green : T.textHint,
          border: `1px solid ${T.border}`, background: T.bgSubtle,
          padding: "3px 10px", borderRadius: 6, cursor: "pointer", fontFamily: S.mono,
          transition: "color 0.2s",
        }}>
          {copied ? "✓ copied" : "copy"}
        </button>
      </div>
      {/* 코드 */}
      <div style={{ padding: "14px 18px", display: "flex", gap: 10 }}>
        <span style={{ color: meta.color, fontFamily: S.mono, fontSize: 13, fontWeight: 700 }}>$</span>
        <CodeLine tokens={meta.preview} />
      </div>
    </div>
  );
}

// ── 메인 컴포넌트 ────────────────────────────────────────────
export default function ProductDetail({ id }) {
  const p = byId(id);
  const router = useRouter();
  const cart = useCart();
  const wish = useWishlist();
  const [opt, setOpt] = useState(null);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState("overview");

  const options = p ? getOptions(p.cat) : [];
  const meta = p ? (CAT_META[p.cat] || CAT_META["UI Kit"]) : null;
  const reviews = p ? (REVIEWS_DATA[p.id] || DEFAULT_REVIEWS) : [];
  const avgRating = reviews.length
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
    : p?.rating;

  useEffect(() => {
    if (options.length) setOpt(options[0]);
  }, [id]);

  useEffect(() => {
    if (p && !p.hidden) recordView(p.id);
  }, [p]);

  if (!p || p.hidden) {
    return (
      <div style={{ ...S.wrap, padding: "120px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 40, fontFamily: S.mono, color: T.textHint, marginBottom: 16 }}>404</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 8 }}>상품을 찾을 수 없어요</div>
        <Link href="/shop/products/" style={{ fontSize: 13, color: T.violet, fontWeight: 600 }}>← 전체 제품 보기</Link>
      </div>
    );
  }

  const soldout = p.stock === 0;
  const liked = wish.has(p.id);

  const addToCart = () => { if (opt) cart.add(p.id, opt, qty); };
  const buyNow = () => { if (opt) { cart.add(p.id, opt, qty); router.push("/shop/checkout/"); } };

  return (
    <div style={{ paddingBottom: 60 }}>

      {/* ── 브레드크럼 + 상단 배지 바 ── */}
      <div style={{ borderBottom: `1px solid ${T.border}`, background: T.bgCard }}>
        <div style={{ ...S.wrap, paddingTop: 14, paddingBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <div style={{ fontSize: 12, color: T.textHint, fontFamily: S.mono }}>
            <Link href="/shop/" style={{ color: T.textHint }}>~/shop</Link>
            <span style={{ margin: "0 8px", color: T.border }}>/</span>
            <Link href="/shop/products/" style={{ color: T.textHint }}>products</Link>
            <span style={{ margin: "0 8px", color: T.border }}>/</span>
            <span style={{ color: T.violet }}>{p.name.toLowerCase().replace(/\s/g, "-")}</span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {!soldout && NEW_IDS.has(p.id) && <span style={S.badge}>NEW</span>}
            <span style={{ ...S.badgeGreen, display: "inline-flex" }}>
              ↓ {p.sales.toLocaleString()} downloads
            </span>
            <span style={{ fontSize: 12, color: T.textHint, fontFamily: S.mono }}>
              <span style={{ color: "#F59E0B" }}>★</span> {p.rating} ({p.reviews})
            </span>
          </div>
        </div>
      </div>

      {/* ── 메인 2열 레이아웃 ── */}
      <div style={{ ...S.wrap, paddingTop: 36 }}>
        <div className="sh-detail-grid" style={{ gap: 52 }}>

          {/* ━━ 좌: 비주얼 + 탭 콘텐츠 ━━ */}
          <div>

            {/* 제품 비주얼 카드 */}
            <div className="sh-fadeup" style={{
              borderRadius: 20, overflow: "hidden",
              border: `1px solid ${T.border}`,
              background: CAT_TINT_V2[p.cat],
              position: "relative",
              boxShadow: `0 0 80px ${meta.color}12`,
            }}>
              {/* 에디터 탭바 */}
              <div style={{
                background: "#111118",
                borderBottom: `1px solid ${T.border}`,
                padding: "0 16px",
                display: "flex", alignItems: "center", gap: 0,
              }}>
                <div style={{ display: "flex", gap: 6, marginRight: 16, paddingRight: 16, borderRight: `1px solid ${T.border}`, height: 38, alignItems: "center" }}>
                  {["#EF4444", "#F59E0B", "#10B981"].map((c, i) => (
                    <div key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: c, opacity: 0.8 }} />
                  ))}
                </div>
                <div style={{
                  height: 38, padding: "0 14px",
                  display: "flex", alignItems: "center", gap: 6,
                  borderBottom: `2px solid ${meta.color}`,
                  fontSize: 12, fontWeight: 700, color: T.text,
                  fontFamily: S.mono,
                }}>
                  <span style={{ color: meta.color, fontSize: 9 }}>●</span>
                  {p.name.toLowerCase().replace(/\s/g, "-")}{meta.ext}
                </div>
              </div>

              {/* 심볼 영역 */}
              <div style={{
                height: 280, display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative", overflow: "hidden",
              }}>
                {/* 배경 그리드 */}
                <div style={{
                  position: "absolute", inset: 0,
                  backgroundImage: `linear-gradient(${meta.color}08 1px, transparent 1px), linear-gradient(90deg, ${meta.color}08 1px, transparent 1px)`,
                  backgroundSize: "32px 32px",
                }} />

                {/* 글로우 */}
                <div style={{
                  position: "absolute", top: "50%", left: "50%",
                  transform: "translate(-50%,-50%)",
                  width: 200, height: 200, borderRadius: "50%",
                  background: `radial-gradient(circle, ${meta.color}22, transparent 70%)`,
                  pointerEvents: "none",
                }} />

                <div style={{ position: "relative", textAlign: "center" }}>
                  <div style={{
                    fontSize: 96, fontFamily: S.mono, color: meta.color,
                    lineHeight: 1, marginBottom: 16,
                    filter: soldout ? "opacity(0.3) grayscale(1)" : `drop-shadow(0 0 30px ${meta.color}60)`,
                    animation: soldout ? "none" : "shFloat 4s ease-in-out infinite",
                  }}>
                    {p.thumb}
                  </div>
                  {/* 파일 확장자 */}
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    background: "rgba(10,10,15,0.8)", backdropFilter: "blur(8px)",
                    border: `1px solid ${meta.color}40`,
                    borderRadius: 8, padding: "5px 12px",
                    fontSize: 11, fontFamily: S.mono, color: meta.color, fontWeight: 700,
                  }}>
                    <span style={{ opacity: 0.6 }}>//</span> {p.cat} · {meta.ext}
                  </div>
                </div>
              </div>

              {/* 하단 상태바 */}
              <div style={{
                background: meta.color,
                padding: "6px 16px",
                display: "flex", alignItems: "center", gap: 16,
                fontSize: 11, color: "rgba(255,255,255,0.85)", fontFamily: S.mono,
              }}>
                <span>⎇ main</span>
                <span>{p.cat}</span>
                <span style={{ marginLeft: "auto" }}>
                  {soldout ? "// archived" : `// ${p.sales.toLocaleString()} downloads`}
                </span>
              </div>
            </div>

            {/* 설치 코드 블록 */}
            <div className="sh-fadeup" style={{ marginTop: 16, animationDelay: "80ms" }}>
              <InstallBlock cat={p.cat} />
            </div>

            {/* 기술 스택 */}
            <div className="sh-fadeup" style={{ marginTop: 16, animationDelay: "120ms" }}>
              <div style={{
                background: T.bgCard, border: `1px solid ${T.border}`,
                borderRadius: 12, padding: "14px 16px",
              }}>
                <div style={{ fontSize: 10, color: T.textHint, fontFamily: S.mono, marginBottom: 10, letterSpacing: "0.08em" }}>
                  // COMPATIBLE WITH
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {meta.stack.map(tag => (
                    <span key={tag} className="sh-stack-badge">{tag}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* 탭 패널 */}
            <div className="sh-fadeup" style={{ marginTop: 24, animationDelay: "160ms" }}>
              {/* 파일 탭 헤더 */}
              <div style={{
                display: "flex",
                borderBottom: `1px solid ${T.border}`,
                background: T.bgCard,
                borderRadius: "12px 12px 0 0",
                overflow: "hidden",
              }}>
                {TABS.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      height: 40, padding: "0 16px",
                      border: "none", borderRight: `1px solid ${T.border}`,
                      background: activeTab === tab ? T.bg : "transparent",
                      borderBottom: activeTab === tab ? `2px solid ${meta.color}` : "2px solid transparent",
                      fontSize: 11.5, fontWeight: activeTab === tab ? 700 : 400,
                      color: activeTab === tab ? T.text : T.textHint,
                      cursor: "pointer", fontFamily: S.mono,
                      transition: "color 0.15s, background 0.15s",
                      marginBottom: -1,
                    }}
                  >
                    {TAB_LABELS[tab]}
                  </button>
                ))}
              </div>

              {/* 탭 본문 */}
              <div style={{
                background: T.bgCard, border: `1px solid ${T.border}`,
                borderTop: "none", borderRadius: "0 0 12px 12px",
                padding: "22px",
                minHeight: 180,
              }}>

                {/* overview.md */}
                {activeTab === "overview" && (
                  <div>
                    <div style={{ fontSize: 12, color: T.textHint, fontFamily: S.mono, marginBottom: 14 }}>
                      # {p.name}
                    </div>
                    <p style={{ fontSize: 13.5, color: T.textSub, lineHeight: 1.85, marginBottom: 20 }}>
                      {p.desc}
                    </p>
                    <div style={{ fontSize: 12, color: T.textHint, fontFamily: S.mono, marginBottom: 12 }}>
                      ## What&apos;s included
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {meta.includes.map((item, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: T.textSub }}>
                          <span style={{ color: T.green, fontFamily: S.mono, fontWeight: 700, flexShrink: 0 }}>✓</span>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* demo.tsx */}
                {activeTab === "preview" && (
                  <div>
                    <div style={{ fontSize: 12, color: T.textHint, fontFamily: S.mono, marginBottom: 14 }}>
                      // {`// Live preview — ${p.name}`}
                    </div>
                    {/* 미니 프리뷰 카드 */}
                    <div style={{
                      background: CAT_TINT_V2[p.cat], borderRadius: 12,
                      border: `1px solid ${T.border}`,
                      padding: "24px", textAlign: "center", marginBottom: 16,
                    }}>
                      <div style={{ fontSize: 56, fontFamily: S.mono, color: meta.color, marginBottom: 12 }}>
                        {p.thumb}
                      </div>
                      <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                        {["Default", "Outline", "Ghost"].map(v => (
                          <button key={v} style={{
                            height: 32, padding: "0 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                            background: v === "Default" ? meta.color : "transparent",
                            color: v === "Default" ? "#fff" : meta.color,
                            border: `1px solid ${meta.color}`,
                            cursor: "pointer", fontFamily: S.mono,
                          }}>{v}</button>
                        ))}
                      </div>
                    </div>
                    <div style={{
                      background: "#0D0D14", borderRadius: 10, padding: "14px 16px",
                      fontFamily: S.mono, fontSize: 12,
                    }}>
                      {[
                        [{ t: "<", c: "#94A3B8" }, { t: p.name.split(" ")[0], c: "#F97316" }, { t: " variant", c: "#38BDF8" }, { t: '="default"', c: "#86EFAC" }, { t: ">", c: "#94A3B8" }],
                        [{ t: "  Get Started", c: "#94A3B8" }],
                        [{ t: "</", c: "#94A3B8" }, { t: p.name.split(" ")[0], c: "#F97316" }, { t: ">", c: "#94A3B8" }],
                      ].map((line, li) => (
                        <div key={li} style={{ marginBottom: 4 }}>
                          {line.map((tok, ti) => (
                            <span key={ti} style={{ color: tok.c }}>{tok.t}</span>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CHANGELOG.md */}
                {activeTab === "changelog" && (
                  <div>
                    <div style={{ fontSize: 12, color: T.textHint, fontFamily: S.mono, marginBottom: 16 }}>
                      # Changelog
                    </div>
                    {[
                      { ver: "v3.2.1", date: "2026-05-15", tag: "patch", changes: ["버그 수정: 다크모드 토글 이슈 해결", "TypeScript 타입 정의 개선", "번들 사이즈 12% 감소"] },
                      { ver: "v3.2.0", date: "2026-04-28", tag: "minor", changes: ["신규 컴포넌트 12개 추가", "Tailwind v4 지원", "Storybook 8.x 업데이트"] },
                      { ver: "v3.1.0", date: "2026-03-10", tag: "minor", changes: ["Vue 3 지원 추가", "접근성 개선 (WCAG 2.1 AA)", "SSR 호환성 강화"] },
                    ].map((log, i) => (
                      <div key={i} style={{ marginBottom: 20, paddingLeft: 14, borderLeft: `2px solid ${i === 0 ? meta.color : T.border}` }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                          <span style={{ fontSize: 13, fontWeight: 800, color: T.text, fontFamily: S.mono }}>{log.ver}</span>
                          <span style={{
                            fontSize: 10, padding: "2px 8px", borderRadius: 5, fontFamily: S.mono, fontWeight: 700,
                            background: log.tag === "patch" ? T.bgSubtle : `${meta.color}18`,
                            color: log.tag === "patch" ? T.textHint : meta.color,
                            border: `1px solid ${log.tag === "patch" ? T.border : `${meta.color}40`}`,
                          }}>{log.tag}</span>
                          <span style={{ fontSize: 11, color: T.textHint, fontFamily: S.mono, marginLeft: "auto" }}>{log.date}</span>
                        </div>
                        {log.changes.map((c, ci) => (
                          <div key={ci} style={{ fontSize: 12.5, color: T.textSub, marginBottom: 4, display: "flex", gap: 8 }}>
                            <span style={{ color: T.textHint, fontFamily: S.mono, flexShrink: 0 }}>-</span>
                            {c}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                {/* reviews.json */}
                {activeTab === "reviews" && (
                  <div>
                    {/* 평점 요약 */}
                    <div style={{
                      display: "flex", alignItems: "center", gap: 20,
                      padding: "14px 16px", background: T.bgRaised, borderRadius: 10,
                      marginBottom: 20, border: `1px solid ${T.border}`,
                    }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 40, fontWeight: 800, color: T.text, fontFamily: S.mono, lineHeight: 1 }}>{avgRating}</div>
                        <Stars rating={parseFloat(avgRating)} size={14} />
                        <div style={{ fontSize: 11, color: T.textHint, marginTop: 4, fontFamily: S.mono }}>{reviews.length} reviews</div>
                      </div>
                      <div style={{ flex: 1 }}>
                        {[5, 4, 3, 2, 1].map(star => {
                          const count = reviews.filter(r => r.rating === star).length;
                          const pct = reviews.length ? (count / reviews.length) * 100 : 0;
                          return (
                            <div key={star} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                              <span style={{ fontSize: 11, color: T.textHint, fontFamily: S.mono, width: 12 }}>{star}</span>
                              <span style={{ color: "#F59E0B", fontSize: 10 }}>★</span>
                              <div style={{ flex: 1, height: 5, background: T.border, borderRadius: 3, overflow: "hidden" }}>
                                <div style={{ width: `${pct}%`, height: "100%", background: "#F59E0B", borderRadius: 3 }} />
                              </div>
                              <span style={{ fontSize: 10, color: T.textHint, fontFamily: S.mono, width: 16 }}>{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 리뷰 목록 */}
                    {reviews.map((r, i) => (
                      <div key={i} style={{
                        padding: "16px 0",
                        borderBottom: i < reviews.length - 1 ? `1px solid ${T.border}` : "none",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: 9,
                            background: `${meta.color}25`, border: `1px solid ${meta.color}40`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 13, fontWeight: 800, color: meta.color, fontFamily: S.mono,
                            flexShrink: 0,
                          }}>
                            {r.avatar}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{r.name}</div>
                            <div style={{ fontSize: 11, color: T.textHint, fontFamily: S.mono }}>{r.role}</div>
                          </div>
                          <div style={{ marginLeft: "auto", textAlign: "right" }}>
                            <Stars rating={r.rating} size={11} />
                            <div style={{ fontSize: 10, color: T.textHint, fontFamily: S.mono, marginTop: 2 }}>{r.date}</div>
                          </div>
                        </div>
                        <p style={{ fontSize: 13, color: T.textSub, lineHeight: 1.75, margin: 0 }}>{r.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ━━ 우: 구매 패널 (스티키) ━━ */}
          <div>
            <div style={{ position: "sticky", top: 84, display: "flex", flexDirection: "column", gap: 14 }}>

              {/* 카테고리 배지 */}
              <div className="sh-fadeup" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, color: meta.color,
                  fontFamily: S.mono, letterSpacing: "0.08em",
                  background: `${meta.color}18`,
                  padding: "4px 10px", borderRadius: 6,
                  border: `1px solid ${meta.color}30`,
                }}>
                  {meta.ext}
                </span>
                <span style={{ fontSize: 12, color: T.textHint, fontFamily: S.mono }}>/ {p.cat}</span>
              </div>

              {/* 제품명 + 평점 */}
              <div className="sh-fadeup" style={{ animationDelay: "60ms" }}>
                <h1 style={{
                  fontSize: "clamp(22px,3.5vw,34px)", fontWeight: 800,
                  letterSpacing: "-0.03em", color: T.text, margin: "0 0 10px",
                }}>
                  {p.name}
                </h1>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Stars rating={p.rating} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{p.rating}</span>
                  <span style={{ fontSize: 12, color: T.textHint }}>({p.reviews} reviews)</span>
                  <span style={{ fontSize: 12, color: T.textHint, fontFamily: S.mono, marginLeft: 4 }}>
                    · ↓ {p.sales.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* 설명 */}
              <p className="sh-fadeup" style={{
                fontSize: 13.5, color: T.textSub, lineHeight: 1.8, margin: 0,
                animationDelay: "100ms",
              }}>
                {p.desc}
              </p>

              {/* 가격 */}
              <div className="sh-fadeup" style={{ animationDelay: "120ms" }}>
                <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-0.03em", color: meta.color, fontFamily: S.mono }}>
                  {fmtWon(p.price)}
                </div>
                <div style={{ fontSize: 12, color: T.textHint, fontFamily: S.mono, marginTop: 4 }}>
                  // 1회 결제 · 무제한 업데이트 · 영구 라이선스
                </div>
              </div>

              {/* 라이선스 선택 */}
              <div className="sh-fadeup" style={{ animationDelay: "140ms" }}>
                <div style={{
                  fontSize: 11, color: T.textHint, fontFamily: S.mono,
                  marginBottom: 10, letterSpacing: "0.06em",
                }}>
                  // SELECT LICENSE
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {options.map(o => {
                    const DESC = {
                      Personal: "개인 프로젝트 1개",
                      Team: "팀·에이전시 무제한",
                      Commercial: "상업적 사용 + 재배포",
                      Single: "단일 프로젝트",
                      Extended: "무제한 + 재배포",
                    };
                    return (
                      <button
                        key={o}
                        onClick={() => setOpt(o)}
                        className="sh-chip"
                        style={{
                          width: "100%", height: 50, borderRadius: 11, cursor: "pointer",
                          border: `1.5px solid ${opt === o ? meta.color : T.borderMid}`,
                          background: opt === o ? `${meta.color}12` : T.bgRaised,
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          padding: "0 16px",
                        }}
                      >
                        <span style={{ fontSize: 13, fontWeight: 700, color: opt === o ? meta.color : T.textSub, fontFamily: S.mono }}>
                          {o}
                        </span>
                        <span style={{ fontSize: 11, color: T.textHint }}>{DESC[o]}</span>
                        {opt === o && (
                          <span style={{ fontSize: 12, color: meta.color, fontFamily: S.mono, fontWeight: 700 }}>✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 수량 */}
              <div className="sh-fadeup" style={{ animationDelay: "160ms", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ display: "inline-flex", alignItems: "center", border: `1.5px solid ${T.borderMid}`, borderRadius: 10, overflow: "hidden" }}>
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 40, height: 42, border: "none", background: T.bgRaised, cursor: "pointer", fontSize: 16, color: T.textSub }}>−</button>
                  <span style={{ width: 44, textAlign: "center", fontSize: 14, fontWeight: 800, color: T.text, fontFamily: S.mono }}>{qty}</span>
                  <button onClick={() => setQty(q => q + 1)} style={{ width: 40, height: 42, border: "none", background: T.bgRaised, cursor: "pointer", fontSize: 16, color: T.textSub }}>+</button>
                </div>
                <span style={{ fontSize: 18, fontWeight: 800, color: T.text, fontFamily: S.mono }}>
                  = {fmtWon(p.price * qty)}
                </span>
              </div>

              {/* CTA 버튼 */}
              <div className="sh-fadeup" style={{ display: "flex", flexDirection: "column", gap: 9, animationDelay: "180ms" }}>
                <button
                  onClick={buyNow}
                  disabled={soldout || !opt}
                  className="sh-btn"
                  style={{ ...S.btnPrimary, width: "100%", height: 52, borderRadius: 13, fontSize: 15, justifyContent: "center" }}
                >
                  {soldout ? "// archived" : `${fmtWon(p.price * qty)} 바로 구매`}
                </button>
                <div style={{ display: "flex", gap: 9 }}>
                  <button
                    onClick={addToCart}
                    disabled={soldout || !opt}
                    className="sh-btn"
                    style={{ ...S.btnGhost, flex: 1, height: 46, justifyContent: "center", fontSize: 13 }}
                  >
                    장바구니 담기
                  </button>
                  <button
                    onClick={() => wish.toggle(p.id)}
                    className="sh-heart"
                    aria-label={liked ? "찜 해제" : "찜하기"}
                    style={{
                      width: 46, height: 46, borderRadius: 12,
                      border: `1px solid ${liked ? T.red : T.borderMid}`,
                      background: liked ? "rgba(239,68,68,0.1)" : T.bgRaised,
                      color: liked ? T.red : T.textHint,
                      fontSize: 18, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <span key={liked ? "on" : "off"} className="sh-heartglyph">
                      {liked ? "♥" : "♡"}
                    </span>
                  </button>
                </div>
              </div>

              {/* 라이선스·배송 안내 */}
              <div className="sh-fadeup" style={{
                background: T.bgCard, border: `1px solid ${T.border}`,
                borderRadius: 13, overflow: "hidden",
                animationDelay: "200ms",
              }}>
                {[
                  { icon: "↓", label: "delivery",  value: "결제 즉시 다운로드 링크 발송" },
                  { icon: "⟳", label: "updates",   value: "무제한 업데이트 포함" },
                  { icon: "◻", label: "license",   value: `${opt || options[0]} 라이선스 — 상업적 사용 가능` },
                  { icon: "↩", label: "refund",    value: "14일 환불 보장" },
                  { icon: "?", label: "support",   value: "이메일 기술 지원 (평일 09–18시)" },
                ].map((row, i, arr) => (
                  <div key={row.label} style={{
                    display: "flex", gap: 14, padding: "12px 16px",
                    borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : "none",
                    alignItems: "flex-start",
                  }}>
                    <span style={{ color: meta.color, fontFamily: S.mono, fontSize: 14, fontWeight: 700, flexShrink: 0, width: 18 }}>
                      {row.icon}
                    </span>
                    <div>
                      <div style={{ fontSize: 10, color: T.textHint, fontFamily: S.mono, marginBottom: 2 }}>
                        // {row.label}
                      </div>
                      <div style={{ fontSize: 12.5, color: T.textSub }}>{row.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 쿠폰 힌트 */}
              <div className="sh-fadeup" style={{
                background: T.bgRaised, border: `1px dashed ${T.borderMid}`,
                borderRadius: 10, padding: "11px 14px",
                display: "flex", alignItems: "center", gap: 10,
                animationDelay: "220ms",
              }}>
                <span style={{ fontSize: 16 }}>🎫</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: T.text }}>첫 구매 20% 할인</div>
                  <div style={{ fontSize: 11, color: T.textHint, fontFamily: S.mono }}>
                    코드: <span style={{ color: T.green, fontWeight: 700 }}>DEV20</span> — 체크아웃에서 적용
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 관련 제품 ── */}
      <div style={{ ...S.wrap, marginTop: 88 }}>
        <Reveal>
          <div className="sh-eyebrow">// Related Products</div>
          <h2 style={{ ...S.h2, margin: "6px 0 24px" }}>함께 보면 좋은 제품</h2>
        </Reveal>
        <div className="sh-grid-4">
          {related(p, 4).map((r, i) => (
            <Reveal key={r.id} delay={i * 70}>
              <ProductCard p={r} />
            </Reveal>
          ))}
        </div>
      </div>

      {/* ── 최근 본 제품 ── */}
      <div style={S.wrap}>
        <RecentlyViewed excludeId={p.id} />
      </div>
    </div>
  );
}