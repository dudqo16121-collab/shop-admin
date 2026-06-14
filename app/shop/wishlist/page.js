"use client";

import Link from "next/link";
import { T, S } from "../../../components/shop/theme";
import Reveal from "../../../components/shop/Reveal";
import ProductCard from "../../../components/shop/ProductCard";
import { byId } from "../../../lib/store-data";
import { useWishlist } from "../../../lib/wishlist";

export default function WishlistPage() {
  const wish = useWishlist();
  const items = wish.ids.map(byId).filter(p => p && !p.hidden);

  return (
    <div style={{ ...S.wrap, paddingTop: 48, paddingBottom: 40 }}>
      <div className="sh-fadeup" style={{ marginBottom: 30 }}>
        <div style={S.eyebrow}>// Wishlist</div>
        <h1 style={{ fontSize: "clamp(28px,5vw,44px)", fontWeight: 800, letterSpacing: "-0.035em", margin: "8px 0 6px", color: T.text }}>
          찜한 제품
        </h1>
        <div style={{ fontSize: 13, color: T.textHint, fontFamily: S.mono }}>{items.length}개의 제품</div>
      </div>

      {items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "90px 0" }}>
          <div style={{ fontSize: 40, fontFamily: S.mono, color: T.textHint, marginBottom: 14 }}>♡</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: T.textSub, marginBottom: 6 }}>아직 찜한 제품이 없어요</div>
          <div style={{ fontSize: 13, color: T.textHint, marginBottom: 22, fontFamily: S.mono }}>// 제품 카드의 하트를 눌러 모아보세요</div>
          <Link href="/shop/products/" className="sh-btn" style={{ ...S.btnPrimary, display: "inline-flex" }}>
            제품 보러 가기 →
          </Link>
        </div>
      ) : (
        <div className="sh-grid-4">
          {items.map((p, i) => (
            <Reveal key={p.id} delay={(i % 4) * 70}>
              <ProductCard p={p} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
