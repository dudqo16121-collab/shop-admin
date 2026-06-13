"use client";

// ── 상품 상세: 옵션 선택 / 수량 / 담기·바로구매 / 관련 상품 ───
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { C, S } from "./theme";
import Reveal from "./Reveal";
import ProductCard from "./ProductCard";
import { byId, CAT_TINT, fmtWon, getOptions, NEW_IDS, related, FREE_SHIP_OVER } from "../../lib/store-data";
import { useCart } from "../../lib/cart";
import RecentlyViewed, { recordView } from "./RecentlyViewed";

export default function ProductDetail({ id }) {
  const p = byId(id);
  const router = useRouter();
  const cart = useCart();
  const options = p ? getOptions(p.cat) : [];
  const [opt, setOpt] = useState(options[0]);
  const [qty, setQty] = useState(1);

    useEffect(() => {
    if (p && !p.hidden) recordView(p.id);
  }, [p]);

  if (!p || p.hidden) {
    return (
      <div style={{ ...S.wrap, padding: "120px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🔍</div>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>상품을 찾을 수 없어요</div>
        <Link href="/shop/products/" style={{ fontSize: 13, color: C.blue, fontWeight: 600 }}>전체 상품 보기 →</Link>
      </div>
    );
  }

  const soldout = p.stock === 0;
  const low = !soldout && p.stock <= 5;

  const addToCart = () => cart.add(p.id, opt, qty);
  const buyNow = () => { cart.add(p.id, opt, qty); router.push("/shop/checkout/"); };

  return (
    <div style={{ ...S.wrap, paddingTop: 36, paddingBottom: 40 }}>
      {/* 브레드크럼 */}
      <div className="sh-fadeup" style={{ fontSize: 12, color: C.textHint, marginBottom: 22 }}>
        <Link href="/shop/" style={{ color: C.textHint }}>홈</Link>
        <span style={{ margin: "0 8px" }}>/</span>
        <Link href="/shop/products/" style={{ color: C.textHint }}>전체 상품</Link>
        <span style={{ margin: "0 8px" }}>/</span>
        <span style={{ color: C.textSub }}>{p.name}</span>
      </div>

      <div className="sh-detail-grid">
        {/* 좌: 타일 */}
        <div className="sh-fadeup" style={{ animationDelay: "60ms" }}>
          <div style={{ ...S.tile(CAT_TINT[p.cat]), aspectRatio: "1 / 1.05", borderRadius: 22 }}>
            <div style={{ position: "absolute", top: 16, left: 16, display: "flex", gap: 6 }}>
              {soldout
                ? <span style={S.badgeSoldout}>SOLD OUT</span>
                : NEW_IDS.has(p.id) && <span style={S.badge}>NEW</span>}
            </div>
            <span style={{ fontSize: 160, filter: soldout ? "grayscale(1) opacity(0.55)" : "none" }}>{p.thumb}</span>
          </div>
        </div>

        {/* 우: 정보 */}
        <div className="sh-fadeup" style={{ animationDelay: "140ms" }}>
          <div style={S.eyebrow}>{p.cat}</div>
          <h1 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.15, margin: "8px 0 10px" }}>
            {p.name}
          </h1>
          <div style={{ fontSize: 13, color: C.textSub, marginBottom: 16 }}>
            <span style={{ color: C.amber }}>{"★".repeat(Math.round(p.rating))}</span>
            <span style={{ marginLeft: 6, fontWeight: 600 }}>{p.rating}</span>
            <span style={{ color: C.textHint }}> · 리뷰 {p.reviews}개 · 누적 판매 {p.sales}개</span>
          </div>
          <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 18 }}>
            {fmtWon(p.price)}
          </div>
          <p style={{ fontSize: 14, color: C.textSub, lineHeight: 1.75, marginBottom: 26, maxWidth: 460 }}>
            {p.desc}
          </p>

          {/* 옵션 */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.textSub, marginBottom: 9 }}>
              옵션 <span style={{ color: C.textHint, fontWeight: 500 }}>· {opt}</span>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {options.map(o => (
                <button
                  key={o}
                  onClick={() => setOpt(o)}
                  className="sh-chip"
                  style={{
                    minWidth: 52, height: 42, padding: "0 16px", borderRadius: 11,
                    border: `1.5px solid ${opt === o ? C.accent : C.border}`,
                    background: opt === o ? C.accent : C.surface,
                    color: opt === o ? "#fff" : C.textSub,
                    fontSize: 13, fontWeight: 700, cursor: "pointer",
                  }}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>

          {/* 수량 + 재고 */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
            <div style={{ display: "inline-flex", alignItems: "center", border: `1.5px solid ${C.border}`, borderRadius: 11, overflow: "hidden" }}>
              <button onClick={() => setQty(q => Math.max(1, q - 1))} aria-label="수량 줄이기" style={{ width: 40, height: 42, border: "none", background: C.surface, cursor: "pointer", fontSize: 16, color: C.textSub }}>−</button>
              <span style={{ width: 44, textAlign: "center", fontSize: 14, fontWeight: 800 }}>{qty}</span>
              <button onClick={() => setQty(q => q + 1)} aria-label="수량 늘리기" style={{ width: 40, height: 42, border: "none", background: C.surface, cursor: "pointer", fontSize: 16, color: C.textSub }}>+</button>
            </div>
            {low && <span style={{ fontSize: 12, fontWeight: 700, color: C.amber }}>⚡ {p.stock}개 남았어요</span>}
            {soldout && <span style={{ fontSize: 12, fontWeight: 700, color: C.red }}>일시 품절 — 재입고 준비 중</span>}
          </div>

          {/* CTA */}
          <div style={{ display: "flex", gap: 10, marginBottom: 26 }}>
            <button onClick={addToCart} disabled={soldout} className="sh-btn" style={{ ...S.btnGhost, flex: 1, height: 52 }}>
              장바구니 담기
            </button>
            <button onClick={buyNow} disabled={soldout} className="sh-btn" style={{ ...S.btnPrimary, flex: 1.4, height: 52 }}>
              {soldout ? "품절" : `${fmtWon(p.price * qty)} 바로 구매`}
            </button>
          </div>

          {/* 안내 */}
          <div style={{ borderTop: `1px solid ${C.border}` }}>
            {[
              ["배송", `${fmtWon(FREE_SHIP_OVER)} 이상 무료 · 평일 오후 2시 이전 주문 시 당일 출고`],
              ["교환·반품", "수령 후 7일 이내 · 단순 변심 왕복 배송비 ₩6,000"],
              ["적립", `구매 시 ${Math.round(p.price * 0.01).toLocaleString()}P 적립 (1%)`],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", gap: 18, padding: "13px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
                <span style={{ width: 70, flexShrink: 0, fontWeight: 700, color: C.textSub }}>{k}</span>
                <span style={{ color: C.textSub }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 관련 상품 */}
      <section style={{ marginTop: 88 }}>
        <Reveal>
          <div style={S.eyebrow}>You may also like</div>
          <h2 style={{ ...S.h2, margin: "6px 0 24px" }}>함께 보면 좋은 상품</h2>
        </Reveal>
        <div className="sh-grid-4">
          {related(p, 4).map((r, i) => (
            <Reveal key={r.id} delay={i * 70}>
              <ProductCard p={r} />
            </Reveal>
          ))}
        </div>
      </section>
      <RecentlyViewed excludeId={p.id} />
    </div>
  );
}
