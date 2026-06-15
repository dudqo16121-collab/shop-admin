"use client";

// ── 상품 비교 페이지 ─────────────────────────────────────────
import Link from "next/link";
import { T, S, CAT_TINT_V2 } from "../../../components/shop/theme";
import { useCompare } from "../../../lib/compare";
import { byId, fmtWon, getOptions, VISIBLE } from "../../../lib/store-data";
import { useCart } from "../../../lib/cart";
import Reveal from "../../../components/shop/Reveal";
import ProductCard from "../../../components/shop/ProductCard";

// ── 카테고리별 메타 ──────────────────────────────────────────
const CAT_META = {
  "UI Kit":   { color: "#6366F1", stack: ["React", "Next.js", "TypeScript", "Tailwind", "Figma"], includes: ["컴포넌트 200+", "Figma 소스 파일", "다크/라이트 모드", "Storybook 문서", "TypeScript 타입"] },
  "템플릿":   { color: "#10B981", stack: ["Next.js 14", "Supabase", "Stripe", "TypeScript", "Tailwind"], includes: ["인증 시스템", "결제 연동", "대시보드", "SEO 최적화", "배포 가이드"] },
  "플러그인": { color: "#F59E0B", stack: ["npm", "React", "Framer Motion", "TypeScript", "ESM"], includes: ["50+ 인터랙션", "TypeScript 지원", "Tree-shaking", "SSR 호환", "MIT 라이선스"] },
  "아이콘":   { color: "#EC4899", stack: ["SVG", "React", "Vue", "Svelte", "Figma"], includes: ["2,400+ 아이콘", "4가지 굵기", "React 컴포넌트", "Figma 플러그인", "WOFF2 포함"] },
  "폰트":     { color: "#8B5CF6", stack: ["OTF", "WOFF2", "CSS Variables", "Figma", "Variable Font"], includes: ["4가지 굵기", "리거처 지원", "한글 최적화", "CSS 변수 키트", "라이선스 무제한"] },
};

const LICENSE_DESC = {
  Personal:   "개인 프로젝트 1개",
  Team:       "팀·에이전시 무제한",
  Commercial: "상업적 사용 + 재배포",
  Single:     "단일 프로젝트",
  Extended:   "무제한 + 재배포",
};

// ── 비교 행 컴포넌트 ─────────────────────────────────────────
function CompareRow({ label, comment, children, highlight }) {
  return (
    <div style={{
      display: "contents", // 그리드 자식으로 흘려보냄
    }}>
      {/* 행 라벨 */}
      <div style={{
        padding: "14px 20px",
        borderBottom: `1px solid ${T.border}`,
        background: highlight ? T.bgRaised : T.bgCard,
        display: "flex", flexDirection: "column", justifyContent: "center",
        position: "sticky", left: 0, zIndex: 1,
        borderRight: `1px solid ${T.border}`,
      }}>
        <div style={{ fontSize: 11, color: T.textHint, fontFamily: S.mono, marginBottom: 2 }}>
          {comment}
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{label}</div>
      </div>
      {children}
    </div>
  );
}

// ── 셀 컴포넌트 ─────────────────────────────────────────────
function Cell({ children, highlight, best, color }) {
  return (
    <div style={{
      padding: "14px 20px",
      borderBottom: `1px solid ${T.border}`,
      borderRight: `1px solid ${T.border}`,
      background: highlight ? T.bgRaised : T.bgCard,
      display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative",
      boxShadow: best ? `inset 0 0 0 2px ${color || T.violet}` : "none",
    }}>
      {best && (
        <div style={{
          position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)",
          fontSize: 9, fontWeight: 800, color: "#fff",
          background: color || T.violet,
          padding: "2px 8px", borderRadius: "0 0 6px 6px",
          fontFamily: S.mono, whiteSpace: "nowrap",
        }}>BEST</div>
      )}
      {children}
    </div>
  );
}

// ── 메인 ────────────────────────────────────────────────────
export default function ComparePage() {
  const { ids, remove, clear, toggle } = useCompare();
  const cart = useCart();
  const MAX = 3;

  const products = ids.map(byId).filter(Boolean);
  const slots = Array.from({ length: MAX }, (_, i) => products[i] || null);

  // 추천 상품 (비교 목록에 없는 것 중 베스트)
  const recommended = VISIBLE
    .filter(p => !ids.includes(p.id))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 4);

  // 가장 높은 평점 / 가장 낮은 가격 인덱스
  const maxRatingIdx = products.reduce((bi, p, i) => p.rating > (products[bi]?.rating || 0) ? i : bi, 0);
  const minPriceIdx  = products.reduce((bi, p, i) => p.price < (products[bi]?.price || Infinity) ? i : bi, 0);
  const maxSalesIdx  = products.reduce((bi, p, i) => p.sales > (products[bi]?.sales || 0) ? i : bi, 0);

  // 빈 페이지
  if (products.length === 0) {
    return (
      <div style={{ ...S.wrap, paddingTop: 100, paddingBottom: 80, textAlign: "center" }}>
        <div style={{ fontSize: 48, fontFamily: S.mono, color: T.textHint, marginBottom: 20 }}>⬡</div>
        <div style={S.eyebrow}>// compare.empty</div>
        <h1 style={{ ...S.h2, margin: "10px 0 12px" }}>비교할 상품을 선택해주세요</h1>
        <p style={{ fontSize: 14, color: T.textSub, marginBottom: 32, fontFamily: S.mono }}>
          // 상품 카드의 <span style={{ color: T.violet }}>비교 추가</span> 버튼으로 최대 3개까지 선택하세요
        </p>
        <Link href="/shop/products/" className="sh-btn" style={{ ...S.btnPrimary, display: "inline-flex" }}>
          상품 보러 가기 →
        </Link>
      </div>
    );
  }

  const colCount = MAX + 1; // 라벨 열 + 상품 열 3개
  const gridCols = `200px ${Array(MAX).fill("minmax(0,1fr)").join(" ")}`;

  return (
    <div style={{ paddingBottom: 120 /* CompareBar 높이 확보 */ }}>

      {/* ── 헤더 ── */}
      <div style={{ ...S.wrap, paddingTop: 40, paddingBottom: 28 }}>
        <div className="sh-fadeup">
          <div style={S.eyebrow}>// Product Compare</div>
          <h1 style={{ fontSize: "clamp(26px,4vw,42px)", fontWeight: 800, letterSpacing: "-0.035em", color: T.text, margin: "8px 0 6px" }}>
            상품 비교
          </h1>
          <p style={{ fontSize: 13, color: T.textHint, fontFamily: S.mono }}>
            // {products.length}개 선택됨 · 최대 {MAX}개 비교 가능
          </p>
        </div>
      </div>

      {/* ── 비교 테이블 ── */}
      <div style={{ ...S.wrap }}>
        <div style={{
          overflowX: "auto",
          border: `1px solid ${T.border}`,
          borderRadius: 18,
          overflow: "hidden",
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: gridCols,
            minWidth: 700,
          }}>

            {/* ━━ 상품 헤더 행 ━━ */}
            {/* 라벨 열 헤더 */}
            <div style={{
              padding: "24px 20px",
              background: T.bgRaised,
              borderBottom: `1px solid ${T.border}`,
              borderRight: `1px solid ${T.border}`,
              display: "flex", alignItems: "center",
            }}>
              <span style={{ fontSize: 11, color: T.textHint, fontFamily: S.mono }}>// spec</span>
            </div>

            {/* 상품 헤더 3슬롯 */}
            {slots.map((p, i) => (
              <div key={i} style={{
                padding: "20px 16px",
                background: T.bgRaised,
                borderBottom: `1px solid ${T.border}`,
                borderRight: `1px solid ${T.border}`,
                textAlign: "center",
                position: "relative",
              }}>
                {p ? (
                  <>
                    {/* 제거 버튼 */}
                    <button
                      onClick={() => remove(p.id)}
                      style={{
                        position: "absolute", top: 10, right: 10,
                        width: 22, height: 22, borderRadius: 7,
                        border: `1px solid ${T.borderMid}`, background: T.bgSubtle,
                        color: T.textHint, fontSize: 11, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >✕</button>

                    {/* 상품 썸네일 */}
                    <div style={{
                      width: 72, height: 72, borderRadius: 18, margin: "0 auto 12px",
                      background: CAT_TINT_V2[p.cat],
                      border: `1px solid ${T.border}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 36, fontFamily: S.mono,
                    }}>
                      {p.thumb}
                    </div>

                    <Link href={`/shop/products/${p.id}/`} style={{ textDecoration: "none" }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: T.text, marginBottom: 4 }}>
                        {p.name}
                      </div>
                    </Link>
                    <div style={{
                      fontSize: 10, color: CAT_META[p.cat]?.color || T.violet,
                      fontFamily: S.mono, fontWeight: 700,
                      background: `${CAT_META[p.cat]?.color || T.violet}18`,
                      display: "inline-block", padding: "2px 8px", borderRadius: 5, marginBottom: 10,
                    }}>
                      {p.cat}
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: T.text, fontFamily: S.mono }}>
                      {fmtWon(p.price)}
                    </div>
                  </>
                ) : (
                  <Link
                    href="/shop/products/"
                    style={{
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                      height: "100%", minHeight: 120, gap: 8,
                      color: T.textHint, textDecoration: "none",
                    }}
                  >
                    <div style={{ fontSize: 28, fontFamily: S.mono, opacity: 0.4 }}>+</div>
                    <div style={{ fontSize: 12, fontFamily: S.mono }}>상품 추가</div>
                  </Link>
                )}
              </div>
            ))}

            {/* ━━ 가격 ━━ */}
            <CompareRow label="가격" comment="// price" highlight>
              {slots.map((p, i) => (
                <Cell key={i} highlight best={!!p && i === minPriceIdx && products.length > 1} color={T.green}>
                  {p ? (
                    <span style={{ fontSize: 18, fontWeight: 800, color: i === minPriceIdx && products.length > 1 ? T.green : T.text, fontFamily: S.mono }}>
                      {fmtWon(p.price)}
                    </span>
                  ) : <span style={{ color: T.border }}>—</span>}
                </Cell>
              ))}
            </CompareRow>

            {/* ━━ 평점 ━━ */}
            <CompareRow label="평점" comment="// rating">
              {slots.map((p, i) => (
                <Cell key={i} best={!!p && i === maxRatingIdx && products.length > 1} color={T.violet}>
                  {p ? (
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: T.text, fontFamily: S.mono }}>{p.rating}</div>
                      <div style={{ fontSize: 12, color: "#F59E0B" }}>{"★".repeat(Math.floor(p.rating))}</div>
                      <div style={{ fontSize: 10, color: T.textHint, fontFamily: S.mono, marginTop: 2 }}>({p.reviews} 리뷰)</div>
                    </div>
                  ) : <span style={{ color: T.border }}>—</span>}
                </Cell>
              ))}
            </CompareRow>

            {/* ━━ 다운로드 ━━ */}
            <CompareRow label="다운로드" comment="// downloads" highlight>
              {slots.map((p, i) => (
                <Cell key={i} highlight best={!!p && i === maxSalesIdx && products.length > 1} color="#F59E0B">
                  {p ? (
                    <span style={{ fontSize: 14, fontWeight: 700, color: i === maxSalesIdx && products.length > 1 ? "#F59E0B" : T.text, fontFamily: S.mono }}>
                      ↓ {p.sales.toLocaleString()}
                    </span>
                  ) : <span style={{ color: T.border }}>—</span>}
                </Cell>
              ))}
            </CompareRow>

            {/* ━━ 카테고리 ━━ */}
            <CompareRow label="카테고리" comment="// category">
              {slots.map((p, i) => (
                <Cell key={i}>
                  {p ? (
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 6,
                      background: `${CAT_META[p.cat]?.color || T.violet}18`,
                      color: CAT_META[p.cat]?.color || T.violet,
                      border: `1px solid ${CAT_META[p.cat]?.color || T.violet}30`,
                      fontFamily: S.mono,
                    }}>{p.cat}</span>
                  ) : <span style={{ color: T.border }}>—</span>}
                </Cell>
              ))}
            </CompareRow>

            {/* ━━ 기술 스택 ━━ */}
            <CompareRow label="기술 스택" comment="// stack" highlight>
              {slots.map((p, i) => (
                <Cell key={i} highlight>
                  {p ? (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5, justifyContent: "center" }}>
                      {(CAT_META[p.cat]?.stack || []).map(s => (
                        <span key={s} className="sh-stack-badge" style={{ fontSize: 10 }}>{s}</span>
                      ))}
                    </div>
                  ) : <span style={{ color: T.border }}>—</span>}
                </Cell>
              ))}
            </CompareRow>

            {/* ━━ 포함 항목 ━━ */}
            <CompareRow label="포함 항목" comment="// includes">
              {slots.map((p, i) => (
                <Cell key={i}>
                  {p ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
                      {(CAT_META[p.cat]?.includes || []).map((item, ii) => (
                        <div key={ii} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: T.textSub }}>
                          <span style={{ color: T.green, fontFamily: S.mono, fontWeight: 700, flexShrink: 0 }}>✓</span>
                          {item}
                        </div>
                      ))}
                    </div>
                  ) : <span style={{ color: T.border }}>—</span>}
                </Cell>
              ))}
            </CompareRow>

            {/* ━━ 라이선스 ━━ */}
            <CompareRow label="라이선스 옵션" comment="// license" highlight>
              {slots.map((p, i) => (
                <Cell key={i} highlight>
                  {p ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 5, width: "100%" }}>
                      {getOptions(p.cat).map(opt => (
                        <div key={opt} style={{
                          padding: "5px 10px", borderRadius: 7,
                          background: T.bgSubtle, border: `1px solid ${T.border}`,
                          fontSize: 11, fontFamily: S.mono, color: T.textSub,
                          display: "flex", justifyContent: "space-between", gap: 8,
                        }}>
                          <span style={{ color: CAT_META[p.cat]?.color || T.violet, fontWeight: 700 }}>{opt}</span>
                          <span style={{ color: T.textHint }}>{LICENSE_DESC[opt]}</span>
                        </div>
                      ))}
                    </div>
                  ) : <span style={{ color: T.border }}>—</span>}
                </Cell>
              ))}
            </CompareRow>

            {/* ━━ 재고 ━━ */}
            <CompareRow label="재고 상태" comment="// stock">
              {slots.map((p, i) => (
                <Cell key={i}>
                  {p ? (
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 6,
                      fontFamily: S.mono,
                      background: p.stock > 0 ? T.greenBg : T.redBg,
                      color: p.stock > 0 ? T.green : T.red,
                      border: `1px solid ${p.stock > 0 ? T.green : T.red}40`,
                    }}>
                      {p.stock > 0 ? "판매 중" : "품절"}
                    </span>
                  ) : <span style={{ color: T.border }}>—</span>}
                </Cell>
              ))}
            </CompareRow>

            {/* ━━ 담기 버튼 행 ━━ */}
            {/* 라벨 없음 */}
            <div style={{
              padding: "20px",
              background: T.bgCard,
              borderRight: `1px solid ${T.border}`,
            }} />
            {slots.map((p, i) => (
              <div key={i} style={{
                padding: "16px 14px",
                background: T.bgCard,
                borderRight: `1px solid ${T.border}`,
                display: "flex", flexDirection: "column", gap: 8,
              }}>
                {p ? (
                  <>
                    <button
                      onClick={() => cart.add(p.id, getOptions(p.cat)[0], 1)}
                      disabled={p.stock === 0}
                      className="sh-btn"
                      style={{ ...S.btnPrimary, width: "100%", height: 42, borderRadius: 10, fontSize: 13, justifyContent: "center" }}
                    >
                      {p.stock === 0 ? "품절" : "장바구니 담기"}
                    </button>
                    <Link
                      href={`/shop/products/${p.id}/`}
                      style={{
                        ...S.btnGhost, width: "100%", height: 38, borderRadius: 10, fontSize: 12,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        textDecoration: "none",
                      }}
                    >
                      상세 보기
                    </Link>
                  </>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        {/* 초기화 버튼 */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
          <button
            onClick={clear}
            style={{
              height: 38, padding: "0 20px", borderRadius: 10,
              border: `1px solid ${T.border}`, background: "transparent",
              color: T.textHint, fontSize: 13, cursor: "pointer", fontFamily: S.mono,
            }}
          >
            // 비교 목록 초기화
          </button>
        </div>
      </div>

      {/* ── 추천 상품 (비교에 추가할 수 있는) ── */}
      {recommended.length > 0 && (
        <div style={{ ...S.wrap, marginTop: 72 }}>
          <Reveal>
            <div style={S.eyebrow}>// Add to Compare</div>
            <h2 style={{ ...S.h2, margin: "6px 0 24px" }}>비교에 추가할 수 있는 제품</h2>
          </Reveal>
          <div className="sh-grid-4">
            {recommended.map((p, i) => (
              <Reveal key={p.id} delay={i * 70}>
                <div style={{ position: "relative" }}>
                  <ProductCard p={p} />
                  {/* 비교 추가 오버레이 버튼 */}
                  <button
                    onClick={() => toggle(p.id)}
                    className="sh-btn"
                    style={{
                      position: "absolute", bottom: 14, left: 8, right: 8,
                      height: 34, borderRadius: 9, border: "none",
                      background: "rgba(99,102,241,0.85)",
                      backdropFilter: "blur(6px)",
                      color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer",
                    }}
                  >
                    + 비교에 추가
                  </button>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}