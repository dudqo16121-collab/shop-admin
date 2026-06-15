"use client";

// ── app/shop/bundles/page.js ─────────────────────────────────
import Link from "next/link";
import { useState } from "react";
import { T, S, CAT_TINT_V2 } from "../../../components/shop/theme";
import { byId, fmtWon, getOptions, VISIBLE } from "../../../lib/store-data";
import { useCart } from "../../../lib/cart";
import Reveal from "../../../components/shop/Reveal";

// ── 카테고리 컬러 ────────────────────────────────────────────
const CAT_COLOR = {
  "UI Kit":   "#6366F1",
  "템플릿":   "#10B981",
  "플러그인": "#F59E0B",
  "아이콘":   "#EC4899",
  "폰트":     "#8B5CF6",
};

// ── 번들 데이터 ──────────────────────────────────────────────
const BUNDLES = [
  {
    id: "starter",
    name: "Starter Bundle",
    tag: "BEST",
    tagColor: T.violet,
    headline: "처음 시작하는 개발자를 위한 번들",
    desc: "UI Kit + 아이콘 세트로 프로젝트 기초를 단단히 다지세요. 컴포넌트와 아이콘이 같은 디자인 언어를 공유해 일관된 UI를 빠르게 구축할 수 있습니다.",
    productIds: [1, 7],  // Nexus UI Kit, Lucide Dev Icons
    discount: 25,        // %
    badge: "입문자 추천",
    includes: [
      "200+ React 컴포넌트",
      "2,400+ SVG 아이콘",
      "Figma 소스 파일",
      "TypeScript 타입 정의",
      "다크/라이트 모드",
    ],
    stack: ["React", "Next.js", "Figma", "TypeScript"],
    gradient: "linear-gradient(135deg, #0F0F1E, #0D0D1A)",
    glowColor: "rgba(99,102,241,0.15)",
  },
  {
    id: "saas",
    name: "SaaS Builder Bundle",
    tag: "HOT",
    tagColor: "#10B981",
    headline: "SaaS 제품을 빠르게 출시하는 번들",
    desc: "검증된 SaaS 템플릿 위에 모션과 폼 기능을 더해 완성도 높은 제품을 만드세요. 인증·결제·대시보드가 이미 구현되어 있어 핵심 기능 개발에 집중할 수 있습니다.",
    productIds: [3, 5, 6],  // DevLaunch, Motion Pack, FormKit
    discount: 35,
    badge: "가장 인기",
    includes: [
      "SaaS 완성 템플릿",
      "50+ 인터랙션 프리셋",
      "30+ 폼 컴포넌트",
      "Supabase + Stripe 연동",
      "무제한 업데이트",
    ],
    stack: ["Next.js 14", "Supabase", "Stripe", "Framer Motion"],
    gradient: "linear-gradient(135deg, #0A1A0E, #0C1F12)",
    glowColor: "rgba(16,185,129,0.15)",
  },
  {
    id: "design",
    name: "Design System Bundle",
    tag: "NEW",
    tagColor: "#F59E0B",
    headline: "완성형 디자인 시스템 번들",
    desc: "두 개의 UI Kit과 아이콘, 타이포그래피를 하나의 일관된 디자인 시스템으로 운영하세요. 토큰 기반 설계로 브랜드 색상·폰트 교체가 몇 줄이면 가능합니다.",
    productIds: [1, 2, 7, 12],  // Nexus, Prism, Lucide, TypeScale
    discount: 40,
    badge: "최대 할인",
    includes: [
      "200+ 컴포넌트 (Nexus)",
      "디자인 시스템 (Prism)",
      "2,400+ 아이콘",
      "타이포그래피 시스템",
      "Figma 토큰 연동",
    ],
    stack: ["React", "Vue", "Figma", "CSS Variables"],
    gradient: "linear-gradient(135deg, #15100A, #1A140E)",
    glowColor: "rgba(245,158,11,0.12)",
  },
  {
    id: "fullstack",
    name: "Full-stack Pro Bundle",
    tag: "PRO",
    tagColor: "#8B5CF6",
    headline: "풀스택 개발자를 위한 올인원 번들",
    desc: "포트폴리오부터 어드민 대시보드까지. 프론트엔드 개발에 필요한 모든 것을 한 번에 갖추세요. 4개 템플릿으로 어떤 프로젝트도 빠르게 시작할 수 있습니다.",
    productIds: [3, 4, 9, 11],  // DevLaunch, PortfolioX, DashForge, Landing
    discount: 45,
    badge: "최고 가치",
    includes: [
      "SaaS 스타터 (DevLaunch)",
      "포트폴리오 템플릿",
      "어드민 대시보드",
      "랜딩 페이지 Kit 8종",
      "소스 코드 전체 포함",
    ],
    stack: ["Next.js 14", "TypeScript", "Supabase", "Stripe"],
    gradient: "linear-gradient(135deg, #12101A, #16121E)",
    glowColor: "rgba(139,92,246,0.12)",
  },
];

// ── 원가 계산 ────────────────────────────────────────────────
function calcBundle(bundle) {
  const products = bundle.productIds.map(byId).filter(Boolean);
  const original = products.reduce((a, p) => a + p.price, 0);
  const discounted = Math.round(original * (1 - bundle.discount / 100));
  const saved = original - discounted;
  return { products, original, discounted, saved };
}

// ── 번들 카드 ────────────────────────────────────────────────
function BundleCard({ bundle, onAddAll }) {
  const { products, original, discounted, saved } = calcBundle(bundle);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="sh-glow-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: bundle.gradient,
        border: `1px solid ${T.border}`,
        borderRadius: 22, overflow: "hidden",
        transition: "border-color 0.3s",
        borderColor: hovered ? T.borderMid : T.border,
      }}
    >
      {/* ── 헤더 ── */}
      <div style={{ padding: "28px 30px 0", position: "relative" }}>
        {/* 글로우 */}
        <div style={{
          position: "absolute", top: -40, right: -40,
          width: 220, height: 220, borderRadius: "50%",
          background: `radial-gradient(circle, ${bundle.glowColor}, transparent 70%)`,
          pointerEvents: "none",
        }} />

        {/* 배지 행 */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center" }}>
          <span style={{
            fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 6,
            background: `${bundle.tagColor}25`, color: bundle.tagColor,
            border: `1px solid ${bundle.tagColor}50`, fontFamily: S.mono,
          }}>{bundle.tag}</span>
          <span style={{
            fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 6,
            background: T.bgSubtle, color: T.textSub,
            border: `1px solid ${T.border}`,
          }}>{bundle.badge}</span>
        </div>

        {/* 번들명 */}
        <h3 style={{
          fontSize: "clamp(22px,3vw,30px)", fontWeight: 800,
          letterSpacing: "-0.03em", color: T.text, margin: "0 0 8px",
        }}>{bundle.name}</h3>
        <p style={{ fontSize: 13, color: T.textSub, lineHeight: 1.7, marginBottom: 22, maxWidth: 480 }}>
          {bundle.headline}
        </p>

        {/* 가격 */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 24 }}>
          <span style={{ fontSize: "clamp(30px,4vw,44px)", fontWeight: 800, color: T.text, fontFamily: S.mono, letterSpacing: "-0.04em" }}>
            {fmtWon(discounted)}
          </span>
          <span style={{ fontSize: 16, color: T.textHint, textDecoration: "line-through", fontFamily: S.mono }}>
            {fmtWon(original)}
          </span>
          <span style={{
            fontSize: 13, fontWeight: 800, padding: "4px 12px", borderRadius: 8,
            background: bundle.tagColor + "20", color: bundle.tagColor,
            border: `1px solid ${bundle.tagColor}40`, fontFamily: S.mono,
          }}>
            {bundle.discount}% OFF
          </span>
        </div>

        {/* 절약 금액 강조 */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)",
          borderRadius: 10, padding: "8px 14px", marginBottom: 24,
        }}>
          <span style={{ color: T.green, fontWeight: 800, fontFamily: S.mono }}>
            ↓ {fmtWon(saved)} 절약
          </span>
          <span style={{ fontSize: 11, color: T.textHint, fontFamily: S.mono }}>
            // 개별 구매 대비
          </span>
        </div>
      </div>

      {/* ── 포함 제품 타일 ── */}
      <div style={{ padding: "0 30px 24px" }}>
        <div style={{ fontSize: 11, color: T.textHint, fontFamily: S.mono, marginBottom: 12 }}>
          // included_products ({products.length}개)
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(${Math.min(products.length, 4)}, minmax(0,1fr))`,
          gap: 10,
        }}>
          {products.map(p => (
            <Link
              key={p.id}
              href={`/shop/products/${p.id}/`}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                padding: "14px 10px", borderRadius: 14, textDecoration: "none",
                background: CAT_TINT_V2[p.cat], border: `1px solid ${T.border}`,
                transition: "border-color 0.2s, transform 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = CAT_COLOR[p.cat]; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "none"; }}
            >
              <span style={{ fontSize: 30, fontFamily: S.mono, color: CAT_COLOR[p.cat] }}>{p.thumb}</span>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 90 }}>
                  {p.name}
                </div>
                <div style={{ fontSize: 10, color: CAT_COLOR[p.cat], fontFamily: S.mono, marginTop: 2 }}>
                  {p.cat}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── 구분선 (점선 티켓 느낌) ── */}
      <div style={{
        borderTop: `1px dashed ${T.border}`,
        margin: "0 30px",
        position: "relative",
      }}>
        <div style={{ position: "absolute", left: -42, top: -12, width: 24, height: 24, borderRadius: "50%", background: T.bg, border: `1px solid ${T.border}` }} />
        <div style={{ position: "absolute", right: -42, top: -12, width: 24, height: 24, borderRadius: "50%", background: T.bg, border: `1px solid ${T.border}` }} />
      </div>

      {/* ── 포함 항목 + 스택 ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
        {/* 포함 항목 */}
        <div style={{ padding: "20px 30px" }}>
          <div style={{ fontSize: 11, color: T.textHint, fontFamily: S.mono, marginBottom: 10 }}>
            // what_you_get
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {bundle.includes.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: T.textSub }}>
                <span style={{ color: T.green, fontFamily: S.mono, fontWeight: 700, flexShrink: 0 }}>✓</span>
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* 스택 */}
        <div style={{ padding: "20px 30px 20px 0" }}>
          <div style={{ fontSize: 11, color: T.textHint, fontFamily: S.mono, marginBottom: 10 }}>
            // tech_stack
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {bundle.stack.map(s => (
              <span key={s} className="sh-stack-badge" style={{ fontSize: 11 }}>{s}</span>
            ))}
          </div>

          {/* 개별 가격 breakdown */}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, color: T.textHint, fontFamily: S.mono, marginBottom: 8 }}>
              // price_breakdown
            </div>
            {products.map(p => (
              <div key={p.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, padding: "4px 0", borderBottom: `1px solid ${T.border}`, color: T.textSub }}>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "65%" }}>{p.name}</span>
                <span style={{ fontFamily: S.mono, flexShrink: 0 }}>{fmtWon(p.price)}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "6px 0", color: T.textHint }}>
              <span>할인 ({bundle.discount}%)</span>
              <span style={{ color: T.green, fontFamily: S.mono }}>-{fmtWon(saved)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800, padding: "6px 0", borderTop: `1px solid ${T.border}` }}>
              <span style={{ color: T.text }}>최종</span>
              <span style={{ color: bundle.tagColor, fontFamily: S.mono }}>{fmtWon(discounted)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div style={{ padding: "0 30px 28px", display: "flex", gap: 10 }}>
        <button
          onClick={() => onAddAll(bundle)}
          className="sh-btn"
          style={{ ...S.btnPrimary, flex: 1, height: 52, borderRadius: 13, fontSize: 15, justifyContent: "center" }}
        >
          번들 전체 담기 — {fmtWon(discounted)}
        </button>
        <button
          style={{
            height: 52, padding: "0 18px", borderRadius: 13,
            border: `1px solid ${T.border}`, background: "transparent",
            color: T.textSub, fontSize: 13, fontWeight: 600, cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          상세 보기
        </button>
      </div>
    </div>
  );
}

// ── 비교 테이블 ──────────────────────────────────────────────
function CompareTable() {
  const rows = [
    { label: "포함 제품 수", values: ["2개", "3개", "4개", "4개"] },
    { label: "할인율", values: ["25%", "35%", "40%", "45%"] },
    { label: "Figma 파일", values: ["✓", "✗", "✓", "✗"] },
    { label: "템플릿 포함", values: ["✗", "✓", "✗", "✓"] },
    { label: "아이콘 포함", values: ["✓", "✗", "✓", "✗"] },
    { label: "상업적 사용", values: ["Team", "Commercial", "Team", "Commercial"] },
    { label: "업데이트", values: ["무제한", "무제한", "무제한", "무제한"] },
  ];

  return (
    <div style={{ overflowX: "auto", border: `1px solid ${T.border}`, borderRadius: 16, overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
        <thead>
          <tr>
            <th style={{ padding: "14px 20px", textAlign: "left", background: T.bgRaised, borderBottom: `1px solid ${T.border}`, fontSize: 11, color: T.textHint, fontFamily: S.mono, width: 160 }}>
              // spec
            </th>
            {BUNDLES.map(b => (
              <th key={b.id} style={{ padding: "14px 16px", textAlign: "center", background: T.bgRaised, borderBottom: `1px solid ${T.border}`, borderLeft: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: T.text }}>{b.name}</div>
                <div style={{
                  fontSize: 10, color: b.tagColor, fontFamily: S.mono, fontWeight: 700,
                  marginTop: 3, background: `${b.tagColor}18`,
                  display: "inline-block", padding: "1px 7px", borderRadius: 4,
                }}>{b.tag}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={row.label} style={{ background: ri % 2 === 0 ? T.bgCard : T.bgRaised }}>
              <td style={{ padding: "12px 20px", fontSize: 12.5, color: T.textSub, borderBottom: `1px solid ${T.border}`, fontFamily: S.mono }}>
                {row.label}
              </td>
              {row.values.map((val, vi) => (
                <td key={vi} style={{
                  padding: "12px 16px", textAlign: "center",
                  fontSize: 12.5, fontWeight: 700,
                  color: val === "✓" ? T.green : val === "✗" ? T.textHint : T.text,
                  borderBottom: `1px solid ${T.border}`, borderLeft: `1px solid ${T.border}`,
                  fontFamily: S.mono,
                }}>
                  {val}
                </td>
              ))}
            </tr>
          ))}
          {/* 가격 행 */}
          <tr style={{ background: T.bgCard }}>
            <td style={{ padding: "14px 20px", fontSize: 12.5, fontWeight: 700, color: T.text, fontFamily: S.mono }}>최종 가격</td>
            {BUNDLES.map(b => {
              const { discounted } = calcBundle(b);
              return (
                <td key={b.id} style={{ padding: "14px 16px", textAlign: "center", borderLeft: `1px solid ${T.border}` }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: b.tagColor, fontFamily: S.mono }}>{fmtWon(discounted)}</div>
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ── 메인 ────────────────────────────────────────────────────
export default function BundlesPage() {
  const cart = useCart();
  const [toastMsg, setToastMsg] = useState(null);

  const handleAddAll = (bundle) => {
    const products = bundle.productIds.map(byId).filter(Boolean);
    products.forEach(p => {
      cart.add(p.id, getOptions(p.cat)[0], 1);
    });
    setToastMsg(`${bundle.name} ${products.length}개 제품을 담았어요!`);
    setTimeout(() => setToastMsg(null), 2400);
  };

  return (
    <div style={{ paddingBottom: 80 }}>

      {/* 토스트 */}
      {toastMsg && (
        <div className="sh-toast" style={{
          position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)",
          zIndex: 300, padding: "13px 22px", borderRadius: 14,
          background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
          color: "#fff", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap",
          boxShadow: "0 12px 40px rgba(99,102,241,0.4)",
          border: "1px solid rgba(255,255,255,0.12)",
        }}>
          ✓ {toastMsg}
        </div>
      )}

      {/* ── 히어로 ── */}
      <section className="sh-hero-bg" style={{ padding: "60px 0 72px" }}>
        <div style={{ ...S.wrap, textAlign: "center" }}>
          <div className="sh-fadeup" style={{ marginBottom: 16 }}>
            <div style={S.eyebrow}>// Bundle Deals</div>
          </div>
          <h1 className="sh-fadeup" style={{ ...S.display, margin: "0 0 16px", animationDelay: "80ms" }}>
            더 많이, 더 싸게
          </h1>
          <p className="sh-fadeup" style={{
            fontSize: 17, color: T.textSub, lineHeight: 1.75, maxWidth: 500, margin: "0 auto 36px",
            animationDelay: "160ms",
          }}>
            함께 쓰면 더 강력한 제품들을 묶었습니다.<br />
            개별 구매 대비 최대 <strong style={{ color: T.violet }}>45% 절약</strong>하세요.
          </p>

          {/* 번들 요약 칩 */}
          <div className="sh-fadeup" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", animationDelay: "240ms" }}>
            {BUNDLES.map(b => {
              const { discounted, saved } = calcBundle(b);
              return (
                <div key={b.id} style={{
                  background: T.bgCard, border: `1px solid ${T.border}`,
                  borderRadius: 14, padding: "14px 18px", textAlign: "center", minWidth: 130,
                  borderTop: `3px solid ${b.tagColor}`,
                }}>
                  <div style={{ fontSize: 11, color: b.tagColor, fontFamily: S.mono, fontWeight: 700, marginBottom: 4 }}>{b.tag}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: T.text, marginBottom: 3 }}>{b.name.replace(" Bundle","")}</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: b.tagColor, fontFamily: S.mono }}>{fmtWon(discounted)}</div>
                  <div style={{ fontSize: 11, color: T.green, fontFamily: S.mono, marginTop: 2 }}>↓ {fmtWon(saved)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 신뢰 마퀴 ── */}
      <div className="sh-trust-bar">
        <div className="sh-marquee" style={{ padding: "11px 0" }}>
          <div className="sh-marquee-track">
            {[
              "✓ 번들 구매 시 즉시 할인 적용",
              "✓ 모든 제품 무제한 업데이트",
              "✓ 14일 환불 보장",
              "✓ 상업적 사용 라이선스 포함",
              "✓ Figma 소스 파일 제공",
            ].flatMap((t, i) => [
              <span key={`a${i}`} className="sh-trust-item"><strong style={{ color: T.green }}>✓</strong>{t.slice(2)}</span>,
              <span key={`d${i}`} className="sh-trust-divider"> · </span>,
            ]).concat(
              ["✓ 번들 구매 시 즉시 할인 적용","✓ 모든 제품 무제한 업데이트","✓ 14일 환불 보장","✓ 상업적 사용 라이선스 포함","✓ Figma 소스 파일 제공"]
              .flatMap((t, i) => [
                <span key={`b${i}`} className="sh-trust-item"><strong style={{ color: T.green }}>✓</strong>{t.slice(2)}</span>,
                <span key={`e${i}`} className="sh-trust-divider"> · </span>,
              ])
            )}
          </div>
        </div>
      </div>

      {/* ── 번들 카드 그리드 ── */}
      <section style={{ ...S.wrap, paddingTop: 64 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {BUNDLES.map((bundle, i) => (
            <Reveal key={bundle.id} delay={i * 80}>
              <BundleCard bundle={bundle} onAddAll={handleAddAll} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── 번들 비교 테이블 ── */}
      <section style={{ ...S.wrap, paddingTop: 72 }}>
        <Reveal>
          <div className="sh-section-head" style={{ marginBottom: 24 }}>
            <div>
              <div className="sh-eyebrow">// Compare Bundles</div>
              <h2 style={{ ...S.h2, marginTop: 6 }}>번들 한눈에 비교</h2>
            </div>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <CompareTable />
        </Reveal>
      </section>

      {/* ── FAQ ── */}
      <section style={{ ...S.wrap, paddingTop: 72 }}>
        <Reveal>
          <div className="sh-eyebrow">// FAQ</div>
          <h2 style={{ ...S.h2, margin: "6px 0 24px" }}>자주 묻는 질문</h2>
        </Reveal>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            {
              q: "번들 제품을 개별적으로 사용할 수 있나요?",
              a: "네, 번들 내 모든 제품은 개별 라이선스로 발급됩니다. 각각의 프로젝트에 독립적으로 사용할 수 있습니다.",
            },
            {
              q: "이미 일부 제품을 구매했는데 번들을 살 수 있나요?",
              a: "가능합니다. 이미 보유한 제품의 라이선스는 업그레이드로 처리됩니다. 중복 구매에 대한 환불은 고객센터로 문의해주세요.",
            },
            {
              q: "번들 구매 후 업데이트는 어떻게 받나요?",
              a: "번들 내 모든 제품은 무제한 업데이트를 제공합니다. 새 버전 출시 시 이메일로 알림이 발송되며, 라이선스 페이지에서 언제든지 최신 버전을 다운로드할 수 있습니다.",
            },
            {
              q: "환불 정책이 있나요?",
              a: "구매 후 14일 이내에 환불이 가능합니다. 단, 소스 코드를 다운로드한 경우에는 환불이 제한될 수 있습니다.",
            },
          ].map((faq, i) => (
            <Reveal key={i} delay={i * 50}>
              <FaqItem faq={faq} color={T.violet} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── 하단 CTA ── */}
      <section style={{ ...S.wrap, paddingTop: 72 }}>
        <Reveal>
          <div style={{
            background: "linear-gradient(135deg, #0F0F1E, #13132A)",
            border: `1px solid ${T.borderMid}`,
            borderRadius: 24, padding: "52px 48px",
            textAlign: "center", position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.12), transparent 70%)", pointerEvents: "none" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={S.eyebrow}>// Custom Bundle</div>
              <h2 style={{ fontSize: "clamp(22px,3.5vw,36px)", fontWeight: 800, color: T.text, letterSpacing: "-0.03em", margin: "10px 0 12px" }}>
                원하는 제품만 골라서 담으세요
              </h2>
              <p style={{ fontSize: 14, color: T.textSub, marginBottom: 28, maxWidth: 420, margin: "0 auto 28px" }}>
                번들에 원하는 조합이 없다면 전체 상품에서 직접 골라 장바구니에 담으세요.
                쿠폰 코드 <span style={{ color: T.violet, fontFamily: S.mono, fontWeight: 700 }}>DEV20</span> 으로 20% 추가 할인을 받을 수 있습니다.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <Link href="/shop/products/" className="sh-btn" style={{ ...S.btnPrimary, height: 50, padding: "0 32px", fontSize: 15 }}>
                  전체 상품 보기 →
                </Link>
                <Link href="/shop/compare/" className="sh-btn" style={{ ...S.btnGhost, height: 50, padding: "0 32px", fontSize: 15 }}>
                  상품 비교하기
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

// ── FAQ 아이템 (아코디언) ────────────────────────────────────
function FaqItem({ faq, color }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      background: T.bgCard, border: `1px solid ${open ? T.borderMid : T.border}`,
      borderRadius: 14, overflow: "hidden",
      transition: "border-color 0.2s",
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 16, padding: "18px 22px",
          border: "none", background: "transparent", cursor: "pointer", textAlign: "left",
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{faq.q}</span>
        <span style={{
          fontSize: 16, color: open ? color : T.textHint,
          transform: open ? "rotate(45deg)" : "rotate(0deg)",
          transition: "transform 0.22s ease, color 0.15s",
          flexShrink: 0,
        }}>+</span>
      </button>
      {open && (
        <div style={{ padding: "0 22px 18px", fontSize: 13.5, color: T.textSub, lineHeight: 1.78 }}>
          {faq.a}
        </div>
      )}
    </div>
  );
}