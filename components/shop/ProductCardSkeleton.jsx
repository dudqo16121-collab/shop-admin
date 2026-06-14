// ── components/shop/ProductCardSkeleton.jsx ──────────────────
"use client";

import { T } from "./theme";

export default function ProductCardSkeleton() {
  return (
    <div style={{
      borderRadius: 16, overflow: "hidden",
      border: `1px solid ${T.border}`,
      background: T.bgCard,
    }}>
      {/* 타일 */}
      <div style={{
        aspectRatio: "16/10",
        background: T.bgRaised,
        position: "relative",
        overflow: "hidden",
      }}>
        <div className="sh-skeleton-wave" />
      </div>

      {/* 카드 정보 */}
      <div style={{ padding: "14px 16px 18px" }}>
        {/* 카테고리 */}
        <div style={{
          width: 56, height: 10, borderRadius: 5,
          background: T.bgRaised, marginBottom: 10,
          position: "relative", overflow: "hidden",
        }}>
          <div className="sh-skeleton-wave" />
        </div>

        {/* 제품명 */}
        <div style={{
          width: "75%", height: 14, borderRadius: 6,
          background: T.bgRaised, marginBottom: 10,
          position: "relative", overflow: "hidden",
        }}>
          <div className="sh-skeleton-wave" />
        </div>

        {/* 별점 + 다운로드 */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{
            width: 80, height: 10, borderRadius: 5,
            background: T.bgRaised,
            position: "relative", overflow: "hidden",
          }}>
            <div className="sh-skeleton-wave" />
          </div>
          <div style={{
            width: 50, height: 10, borderRadius: 5,
            background: T.bgRaised,
            position: "relative", overflow: "hidden",
          }}>
            <div className="sh-skeleton-wave" />
          </div>
        </div>

        {/* 가격 */}
        <div style={{
          width: 90, height: 16, borderRadius: 6,
          background: T.bgRaised,
          position: "relative", overflow: "hidden",
        }}>
          <div className="sh-skeleton-wave" />
        </div>
      </div>
    </div>
  );
}