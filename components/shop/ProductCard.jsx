"use client";

import Link from "next/link";
import { T, S, CAT_TINT_V2 } from "./theme";
import { NEW_IDS, fmtWon, getOptions } from "../../lib/store-data";
import { useCart } from "../../lib/cart";
import { useWishlist } from "../../lib/wishlist";
import { useCompare } from "../../lib/compare";

function Stars({ rating }) {
  const full = Math.floor(rating);
  return (
    <span className="sh-stars" aria-label={`평점 ${rating}`}>
      {"★".repeat(full)}{"☆".repeat(5 - full)}
    </span>
  );
}

export default function ProductCard({ p, rank, originalPrice }) {
  const cart = useCart();
  const wish = useWishlist();
  const liked = wish.has(p.id);
  const soldout = p.stock === 0;
  const discountPct = originalPrice ? Math.round((1 - p.price / originalPrice) * 100) : null;
const compare = useCompare();
const inCompare = compare.has(p.id);

  const quickAdd = (e) => {
    e.preventDefault(); e.stopPropagation();
    cart.add(p.id, getOptions(p.cat)[0], 1);
  };
  const toggleWish = (e) => {
    e.preventDefault(); e.stopPropagation();
    wish.toggle(p.id);
  };

  return (
    <Link
      href={`/shop/products/${p.id}/`}
      className="sh-card sh-glow-card"
      aria-label={`${p.name} 상세 보기`}
      style={{
        borderRadius: 16, overflow: "hidden",
        border: `1px solid ${T.border}`,
        background: T.bgCard,
        display: "block",
      }}
    >
      {/* 타일 */}
      <div
        className="sh-tile"
        style={{
          ...S.tile(CAT_TINT_V2[p.cat]),
          borderRadius: 0, border: "none",
          borderBottom: `1px solid ${T.border}`,
          aspectRatio: "16/10",
        }}
      >
        {/* 좌상단 배지 */}
        <div style={{ position: "absolute", top: 10, left: 10, display: "flex", flexDirection: "column", gap: 5, zIndex: 2 }}>
          {soldout && <span style={S.badgeSoldout}>ARCHIVED</span>}
          {!soldout && discountPct && <span style={S.badgeAmber}>-{discountPct}%</span>}
          {!soldout && !discountPct && NEW_IDS.has(p.id) && <span style={S.badge}>NEW</span>}
          {rank && <span style={S.badgeGreen}>TOP {rank}</span>}
        </div>

        {/* 찜하기 */}
        <button
          onClick={toggleWish}
          className="sh-heart"
          aria-label={liked ? "찜 해제" : "찜하기"}
          style={{
            position: "absolute", top: 10, right: 10, zIndex: 3,
            width: 30, height: 30, borderRadius: 8,
            border: `1px solid ${liked ? T.red : T.borderMid}`,
            background: "rgba(10,10,15,0.85)",
            color: liked ? T.red : T.textHint,
            fontSize: 13, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <span key={liked ? "on" : "off"} className="sh-heartglyph">{liked ? "♥" : "♡"}</span>
        </button>

<button
  onClick={(e) => { e.preventDefault(); e.stopPropagation(); compare.toggle(p.id); }}
  className="sh-heart"
  aria-label={inCompare ? "비교 제거" : "비교 추가"}
  style={{
    position: "absolute", top: 10, right: 44, zIndex: 3,
    width: 30, height: 30, borderRadius: 8,
    border: `1px solid ${inCompare ? T.violet : T.borderMid}`,
    background: inCompare ? T.violetBg : "rgba(10,10,15,0.85)",
    color: inCompare ? T.violet : T.textHint,
    fontSize: 12, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: S.mono, fontWeight: 700,
  }}
>
  {inCompare ? "✓" : "⇄"}
</button>

        {/* 심볼 */}
        <span
          className="sh-tile-emoji"
          style={{
            fontSize: 64, fontFamily: S.mono, color: T.textSub,
            filter: soldout ? "opacity(0.3)" : "none",
          }}
        >
          {p.thumb}
        </span>

        {/* 퀵 담기 */}
        {!soldout && (
          <button
            className="sh-quick sh-btn"
            onClick={quickAdd}
            style={{
              position: "absolute", left: 10, right: 10, bottom: 10,
              height: 38, borderRadius: 9, border: "none",
              background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
              color: "#fff", fontSize: 12.5, fontWeight: 700, cursor: "pointer",
            }}
          >
            + 장바구니 담기
          </button>
        )}
      </div>

      {/* 카드 정보 */}
      <div style={{ padding: "14px 16px 16px" }}>
        <div style={{ fontSize: 10.5, color: T.violet, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 5, fontFamily: S.mono }}>
          {p.cat}
        </div>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 7 }}>
          {p.name}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 9 }}>
          <Stars rating={p.rating} />
          <span style={{ fontSize: 11, color: T.textHint }}>({p.reviews})</span>
          <span style={{ fontSize: 11, color: T.textHint, marginLeft: "auto", fontFamily: S.mono }}>
            ↓ {p.sales.toLocaleString()}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span className="sh-price-main">{fmtWon(p.price)}</span>
          {originalPrice && <span className="sh-price-old">{fmtWon(originalPrice)}</span>}
        </div>
      </div>
    </Link>
  );
}
