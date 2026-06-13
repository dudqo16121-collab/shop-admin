"use client";

// ── 쇼핑몰 홈: 히어로 → 마퀴 → 신상품 → 베스트 → 카테고리 ─────
import Link from "next/link";
import { C, S } from "../../components/shop/theme";
import Reveal from "../../components/shop/Reveal";
import Marquee from "../../components/shop/Marquee";
import ProductCard from "../../components/shop/ProductCard";
import { byId, CATEGORIES, CAT_TINT, fmtWon, newest, bestSellers } from "../../lib/store-data";
import RecentlyViewed from "../../components/shop/RecentlyViewed";

const CAT_EMOJI = { "의류": "🧥", "하의": "👖", "신발": "👟", "가방": "👜", "악세서리": "🧣" };

export default function ShopHome() {
  const hero = byId(1); // 프리미엄 후디
  const coat = byId(11); // 롱 코트 (프리뷰 배너)

  return (
    <>
      {/* ━━ 히어로 ━━ */}
      <section style={{ ...S.wrap, paddingTop: 56, paddingBottom: 72 }}>
        <div className="sh-hero-grid">
          {/* 좌: 카피 */}
          <div>
            <div className="sh-fadeup" style={{ ...S.eyebrow, animationDelay: "0ms" }}>
              2026 Summer · 06 Collection
            </div>
            <h1 className="sh-fadeup" style={{ ...S.display, margin: "14px 0 22px", animationDelay: "90ms" }}>
              기본을,
              <br />
              <span style={{ WebkitTextStroke: `1.5px ${C.accent}`, color: "transparent" }}>다시</span> 짓다
            </h1>
            <p className="sh-fadeup" style={{ fontSize: 16, color: C.textSub, lineHeight: 1.75, maxWidth: 420, marginBottom: 30, animationDelay: "180ms" }}>
              매일 입는 옷의 기준을 한 뼘 높였습니다.
              소재와 봉제부터 다시 만든 여름 06 컬렉션을 만나보세요.
            </p>
            <div className="sh-fadeup" style={{ display: "flex", gap: 12, flexWrap: "wrap", animationDelay: "270ms" }}>
              <Link href="/shop/products/" className="sh-btn" style={S.btnPrimary}>컬렉션 보기 →</Link>
              <Link href="/shop/products/#best" className="sh-btn" style={S.btnGhost}>베스트 셀러</Link>
            </div>
          </div>

          {/* 우: 플로팅 상품 타일 (시그니처) */}
          <div className="sh-hero-visual sh-fadeup" style={{ animationDelay: "200ms", position: "relative", display: "flex", justifyContent: "center" }}>
            <Link href={`/shop/products/${hero.id}/`} className="sh-float" style={{ display: "block", width: "min(330px, 100%)" }}>
              <div style={{ ...S.tile(CAT_TINT[hero.cat]), borderRadius: 24, boxShadow: "0 28px 60px rgba(26,25,23,0.12)" }}>
                <span style={{ fontSize: 130 }}>{hero.thumb}</span>
                {/* 가격 칩 */}
                <div style={{
                  position: "absolute", left: 16, bottom: 16,
                  background: C.surface, border: `1px solid ${C.border}`, borderRadius: 13,
                  padding: "10px 14px", boxShadow: "0 8px 20px rgba(26,25,23,0.08)",
                }}>
                  <div style={{ fontSize: 11, color: C.textHint, marginBottom: 1 }}>{hero.name}</div>
                  <div style={{ fontSize: 15, fontWeight: 800 }}>{fmtWon(hero.price)}</div>
                </div>
                {/* 평점 칩 */}
                <div style={{
                  position: "absolute", right: -10, top: 26, transform: "rotate(3deg)",
                  background: C.accent, color: "#fff", borderRadius: 12,
                  padding: "8px 13px", fontSize: 12, fontWeight: 700,
                  boxShadow: "0 10px 24px rgba(26,25,23,0.2)",
                }}>
                  ★ {hero.rating} · 리뷰 {hero.reviews}
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ━━ 마퀴 스트립 ━━ */}
      <Marquee items={[
        "₩50,000 이상 무료배송",
        "신규 가입 즉시 5,000P",
        "06 컬렉션 출시",
        "7일 무료 교환·반품",
        "전 상품 1% 포인트 적립",
      ]} />

      {/* ━━ 신상품 ━━ */}
      <section style={{ ...S.wrap, paddingTop: 80 }}>
        <Reveal>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 26 }}>
            <div>
              <div style={S.eyebrow}>New In</div>
              <h2 style={{ ...S.h2, marginTop: 6 }}>이번 주 새로 나온</h2>
            </div>
            <Link href="/shop/products/" className="sh-navlink" style={{ fontSize: 13, fontWeight: 600, color: C.textSub }}>
              전체 보기 →
            </Link>
          </div>
        </Reveal>
        <div className="sh-grid-4">
          {newest(4).map((p, i) => (
            <Reveal key={p.id} delay={i * 80}>
              <ProductCard p={p} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ━━ 가을 프리뷰 배너 (잉크 반전 섹션) ━━ */}
      <section style={{ ...S.wrap, paddingTop: 80 }}>
        <Reveal>
          <Link
            href={`/shop/products/${coat.id}/`}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24,
              background: C.accent, borderRadius: 24, padding: "clamp(28px, 5vw, 52px)",
              overflow: "hidden", position: "relative",
            }}
          >
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ ...S.eyebrow, color: "rgba(248,247,245,0.55)" }}>Fall Preview</div>
              <div style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#F8F7F5", margin: "8px 0 10px", lineHeight: 1.2 }}>
                가을을 먼저 입다 — {coat.name}
              </div>
              <div style={{ fontSize: 14, color: "rgba(248,247,245,0.65)", marginBottom: 20 }}>
                사전예약 시 무료배송 + 15% 할인
              </div>
              <span className="sh-btn" style={{ ...S.btnPrimary, background: "#F8F7F5", color: C.accent, height: 44 }}>
                사전예약 하러 가기 →
              </span>
            </div>
            <span style={{ fontSize: "clamp(90px, 14vw, 170px)", lineHeight: 1, flexShrink: 0, transform: "rotate(-6deg)" }}>
              {coat.thumb}
            </span>
          </Link>
        </Reveal>
      </section>

      {/* ━━ 베스트 셀러 ━━ */}
      <section id="best" style={{ ...S.wrap, paddingTop: 80 }}>
        <Reveal>
          <div style={S.eyebrow}>Best Sellers</div>
          <h2 style={{ ...S.h2, margin: "6px 0 26px" }}>가장 많이 선택한</h2>
        </Reveal>
        <div className="sh-grid-4">
          {bestSellers(4).map((p, i) => (
            <Reveal key={p.id} delay={i * 80}>
              <ProductCard p={p} rank={i + 1} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ━━ 카테고리 ━━ */}
      <section style={{ ...S.wrap, paddingTop: 80 }}>
        <Reveal>
          <div style={S.eyebrow}>Categories</div>
          <h2 style={{ ...S.h2, margin: "6px 0 26px" }}>카테고리로 둘러보기</h2>
        </Reveal>
        <div className="sh-grid-cats">
          {CATEGORIES.map((cat, i) => (
            <Reveal key={cat} delay={i * 60}>
              <Link
                href={`/shop/products/?cat=${encodeURIComponent(cat)}`}
                className="sh-card"
              >
                <div className="sh-tile" style={{ ...S.tile(CAT_TINT[cat]), aspectRatio: "1 / 1", borderRadius: 18 }}>
                  <span className="sh-tile-emoji" style={{ fontSize: 52 }}>{CAT_EMOJI[cat]}</span>
                </div>
                <div style={{ textAlign: "center", marginTop: 10, fontSize: 13.5, fontWeight: 700 }}>{cat}</div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
            <div style={S.wrap}>
        <RecentlyViewed />
      </div>
    </>
  );
}
