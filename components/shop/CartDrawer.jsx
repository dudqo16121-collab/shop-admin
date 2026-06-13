"use client";

// ── 장바구니 드로어: 우측 슬라이드 + 무료배송 프로그레스 ──────
import Link from "next/link";
import { C, S } from "./theme";
import { CAT_TINT, FREE_SHIP_OVER, fmtWon } from "../../lib/store-data";
import { useCart } from "../../lib/cart";

export default function CartDrawer() {
  const cart = useCart();
  if (!cart.drawerOpen) return null;

  const remain = Math.max(0, FREE_SHIP_OVER - cart.subtotal);
  const progress = Math.min(100, (cart.subtotal / FREE_SHIP_OVER) * 100);

  return (
    <>
      {/* 배경 */}
      <div
        className="sh-backdrop"
        onClick={cart.closeDrawer}
        style={{ position: "fixed", inset: 0, background: "rgba(26,25,23,0.35)", zIndex: 200 }}
      />
      {/* 패널 */}
      <aside
        className="sh-drawer"
        role="dialog" aria-label="장바구니"
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0, width: "min(400px, 92vw)",
          background: C.surface, zIndex: 201,
          display: "flex", flexDirection: "column",
          boxShadow: "-12px 0 40px rgba(26,25,23,0.16)",
        }}
      >
        {/* 헤더 */}
        <div style={{ padding: "20px 22px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.02em" }}>
            장바구니 <span style={{ color: C.textHint, fontWeight: 600 }}>{cart.count}</span>
          </div>
          <button
            onClick={cart.closeDrawer}
            aria-label="장바구니 닫기"
            style={{ width: 34, height: 34, borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface, cursor: "pointer", fontSize: 15, color: C.textSub }}
          >✕</button>
        </div>

        {/* 무료배송 프로그레스 */}
        {cart.count > 0 && (
          <div style={{ padding: "14px 22px", borderBottom: `1px solid ${C.border}`, background: C.bg }}>
            <div style={{ fontSize: 12, color: C.textSub, marginBottom: 8 }}>
              {remain === 0
                ? <strong style={{ color: C.green }}>무료배송이 적용됐어요 🎉</strong>
                : <><strong style={{ color: C.text }}>{fmtWon(remain)}</strong> 더 담으면 무료배송</>}
            </div>
            <div style={{ height: 5, background: C.border, borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: `${progress}%`, height: "100%", background: remain === 0 ? C.green : C.accent, borderRadius: 3, transition: "width 0.4s cubic-bezier(0.22,0.61,0.36,1)" }} />
            </div>
          </div>
        )}

        {/* 아이템 목록 */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 22px" }}>
          {cart.count === 0 ? (
            <div style={{ textAlign: "center", padding: "72px 0", color: C.textHint }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🛍</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.textSub, marginBottom: 4 }}>장바구니가 비어 있어요</div>
              <div style={{ fontSize: 12 }}>마음에 드는 상품을 담아보세요</div>
            </div>
          ) : (
            cart.items.map(it => (
              <div key={`${it.id}:${it.opt}`} style={{ display: "flex", gap: 14, padding: "16px 0", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ width: 64, height: 76, borderRadius: 12, background: CAT_TINT[it.p.cat], border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, flexShrink: 0 }}>
                  {it.p.thumb}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.p.name}</span>
                    <button
                      onClick={() => cart.remove(it.id, it.opt)}
                      aria-label={`${it.p.name} 삭제`}
                      style={{ border: "none", background: "none", color: C.textHint, cursor: "pointer", fontSize: 13, flexShrink: 0 }}
                    >✕</button>
                  </div>
                  <div style={{ fontSize: 11, color: C.textHint, marginTop: 2 }}>옵션: {it.opt}</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
                    {/* 수량 스테퍼 */}
                    <div style={{ display: "inline-flex", alignItems: "center", border: `1px solid ${C.border}`, borderRadius: 9, overflow: "hidden" }}>
                      <button onClick={() => cart.setQty(it.id, it.opt, it.qty - 1)} aria-label="수량 줄이기" style={{ width: 28, height: 28, border: "none", background: C.surface, cursor: "pointer", color: C.textSub, fontSize: 14 }}>−</button>
                      <span style={{ width: 30, textAlign: "center", fontSize: 12, fontWeight: 700 }}>{it.qty}</span>
                      <button onClick={() => cart.setQty(it.id, it.opt, it.qty + 1)} aria-label="수량 늘리기" style={{ width: 28, height: 28, border: "none", background: C.surface, cursor: "pointer", color: C.textSub, fontSize: 14 }}>+</button>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 800 }}>{fmtWon(it.p.price * it.qty)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 푸터 */}
        {cart.count > 0 && (
          <div style={{ padding: "16px 22px 22px", borderTop: `1px solid ${C.border}`, background: C.surface }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.textSub, marginBottom: 5 }}>
              <span>상품 금액</span><span>{fmtWon(cart.subtotal)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.textSub, marginBottom: 12 }}>
              <span>배송비</span><span>{cart.shipping === 0 ? "무료" : fmtWon(cart.shipping)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 800, marginBottom: 14 }}>
              <span>총 결제 금액</span><span>{fmtWon(cart.total)}</span>
            </div>
            <Link
              href="/shop/checkout/"
              onClick={cart.closeDrawer}
              className="sh-btn"
              style={{ ...S.btnPrimary, width: "100%", height: 50, borderRadius: 13 }}
            >
              주문하기 →
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
