"use client";

// ── 상품 카드: 호버 시 이미지 스케일 + 퀵담기 슬라이드 ────────
import Link from "next/link";
import { C, S } from "./theme";
import { CAT_TINT, NEW_IDS, fmtWon, getOptions } from "../../lib/store-data";
import { useCart } from "../../lib/cart";
import { useWishlist } from "../../lib/wishlist";

export default function ProductCard({ p, rank }) {
  const cart = useCart();
  const soldout = p.stock === 0;
  const wish = useWishlist();
  const liked = wish.has(p.id);
  const toggleWish = (e) => {
    e.preventDefault();
    e.stopPropagation();
    wish.toggle(p.id);
  };

  const quickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    cart.add(p.id, getOptions(p.cat)[0], 1);
  };

  return (
    <Link href={`/shop/products/${p.id}/`} className="sh-card" aria-label={`${p.name} 상세 보기`}>
      {/* 타일 */}
      <div className="sh-tile" style={S.tile(CAT_TINT[p.cat])}>
        {/* 뱃지 */}
        <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 6, zIndex: 2 }}>
                  <button
          onClick={toggleWish}
          className="sh-heart"
          aria-label={liked ? "찜 해제" : "찜하기"}
          style={{
            position: "absolute", top: 10, right: 10, zIndex: 3,
            width: 34, height: 34, borderRadius: "50%",
            border: `1px solid ${liked ? C.red : C.border}`,
            background: "rgba(255,255,255,0.9)",
            color: liked ? C.red : C.textSub,
            fontSize: 15, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <span key={liked ? "on" : "off"} className="sh-heartglyph">{liked ? "♥" : "♡"}</span>
        </button>
          {soldout
            ? <span style={S.badgeSoldout}>SOLD OUT</span>
            : NEW_IDS.has(p.id) && <span style={S.badge}>NEW</span>}
        </div>

        {/* 베스트 랭킹 (있을 때만 — 순서가 의미를 가짐) */}
        {rank && (
          <span style={{
            position: "absolute", bottom: 8, left: 14, zIndex: 1,
            fontSize: 64, fontWeight: 800, letterSpacing: "-0.05em",
            color: C.accent, opacity: 0.1, lineHeight: 1, pointerEvents: "none",
          }}>
            {String(rank).padStart(2, "0")}
          </span>
        )}

        <span className="sh-tile-emoji" style={{ fontSize: 88, filter: soldout ? "grayscale(1) opacity(0.55)" : "none" }}>
          {p.thumb}
        </span>

        {/* 퀵담기 (호버 시 슬라이드 업) */}
        {!soldout && (
          <button
            className="sh-quick sh-btn"
            onClick={quickAdd}
            style={{
              position: "absolute", left: 10, right: 10, bottom: 10,
              height: 42, borderRadius: 10, border: "none",
              background: C.accent, color: "#fff",
              fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}
          >
            + 장바구니 담기
          </button>
        )}
      </div>

      {/* 정보 */}
      <div style={{ padding: "12px 4px 0" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {p.name}
          </span>
          <span style={{ fontSize: 11, color: C.textHint, flexShrink: 0 }}>★ {p.rating}</span>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: 3 }}>
          <span style={{ fontSize: 11, color: C.textHint }}>{p.cat}</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: C.text, letterSpacing: "-0.01em" }}>
            {fmtWon(p.price)}
          </span>
        </div>
      </div>
    </Link>
  );
}
