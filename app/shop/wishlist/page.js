"use client";

// ── 찜한 상품 페이지 ─────────────────────────────────────────
import Link from "next/link";
import { C, S } from "../../../components/shop/theme";
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
        <div style={S.eyebrow}>Wishlist</div>
        <h1 style={{ fontSize: "clamp(30px, 5vw, 48px)", fontWeight: 800, letterSpacing: "-0.035em", margin: "8px 0 6px" }}>
          찜한 상품
        </h1>
        <div style={{ fontSize: 13, color: C.textHint }}>{items.length}개의 상품</div>
      </div>

      {items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "90px 0", color: C.textHint }}>
          <div style={{ fontSize: 40, marginBottom: 14 }}>♡</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: C.textSub, marginBottom: 6 }}>아직 찜한 상품이 없어요</div>
          <div style={{ fontSize: 13, marginBottom: 22 }}>상품 카드의 하트를 눌러 마음에 드는 상품을 모아보세요</div>
          <Link href="/shop/products/" className="sh-btn" style={{ ...S.btnPrimary, display: "inline-flex" }}>
            상품 보러 가기 →
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