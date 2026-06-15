"use client";

// ── 하단 고정 비교 바 ────────────────────────────────────────
// 상품을 1개 이상 담으면 하단에 슬라이드업. 최대 3개 슬롯.
import Link from "next/link";
import { T, S, CAT_TINT_V2 } from "./theme";
import { useCompare } from "../../lib/compare";
import { byId } from "../../lib/store-data";

export default function CompareBar() {
  const { ids, remove, clear, count } = useCompare();
  if (count === 0) return null;

  const MAX = 3;
  const slots = Array.from({ length: MAX }, (_, i) => ids[i] ? byId(ids[i]) : null);

  return (
    <div
      className="sh-toast"
      style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        zIndex: 250,
        background: "rgba(17,17,24,0.97)",
        backdropFilter: "blur(20px)",
        borderTop: `1px solid ${T.borderMid}`,
        boxShadow: "0 -8px 40px rgba(0,0,0,0.5), 0 0 40px rgba(99,102,241,0.06)",
        padding: "14px 24px",
        animation: "shFadeUp 0.28s ease",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>

        {/* 라벨 */}
        <div style={{ flexShrink: 0 }}>
          <div style={{ fontSize: 11, color: T.violet, fontFamily: S.mono, marginBottom: 2 }}>// compare</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{count} / {MAX}개 선택됨</div>
        </div>

        {/* 슬롯 */}
        <div style={{ display: "flex", gap: 10, flex: 1 }}>
          {slots.map((p, i) => (
            <div
              key={i}
              style={{
                flex: 1, maxWidth: 220, height: 56, borderRadius: 12,
                border: `1.5px solid ${p ? T.borderMid : T.border}`,
                background: p ? T.bgRaised : T.bgCard,
                display: "flex", alignItems: "center", gap: 10,
                padding: "0 12px",
                transition: "border-color 0.2s",
                position: "relative",
                borderStyle: p ? "solid" : "dashed",
              }}
            >
              {p ? (
                <>
                  {/* 썸네일 */}
                  <div style={{
                    width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                    background: CAT_TINT_V2[p.cat],
                    border: `1px solid ${T.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, fontFamily: S.mono,
                  }}>
                    {p.thumb}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: 11, color: T.violet, fontFamily: S.mono }}>
                      {p.cat}
                    </div>
                  </div>
                  {/* 제거 버튼 */}
                  <button
                    onClick={() => remove(p.id)}
                    aria-label={`${p.name} 비교 제거`}
                    style={{
                      width: 20, height: 20, borderRadius: 6, border: `1px solid ${T.borderMid}`,
                      background: T.bgSubtle, color: T.textHint,
                      fontSize: 11, cursor: "pointer", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >✕</button>
                </>
              ) : (
                <div style={{ fontSize: 12, color: T.textHint, fontFamily: S.mono, margin: "0 auto" }}>
                  + 상품 추가
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 액션 버튼 */}
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <button
            onClick={clear}
            style={{
              height: 42, padding: "0 16px", borderRadius: 10,
              border: `1px solid ${T.border}`, background: "transparent",
              color: T.textSub, fontSize: 13, fontWeight: 600, cursor: "pointer",
              fontFamily: S.mono,
            }}
          >
            초기화
          </button>
          <Link
            href="/shop/compare/"
            className="sh-btn"
            style={{
              ...S.btnPrimary,
              height: 42, padding: "0 22px", borderRadius: 10, fontSize: 13,
              opacity: count < 2 ? 0.45 : 1,
              pointerEvents: count < 2 ? "none" : "auto",
            }}
          >
            비교하기 ({count})
          </Link>
        </div>
      </div>
    </div>
  );
}