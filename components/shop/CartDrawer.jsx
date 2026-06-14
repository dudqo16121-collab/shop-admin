"use client";

import Link from "next/link";
import { T, S, CAT_TINT_V2 } from "./theme";
import { fmtWon } from "../../lib/store-data";
import { useCart } from "../../lib/cart";

export default function CartDrawer() {
  const cart = useCart();
  if (!cart.drawerOpen) return null;

  return (
    <>
      {/* 배경 오버레이 */}
      <div
        className="sh-backdrop"
        onClick={cart.closeDrawer}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(4px)",
          zIndex: 200,
        }}
      />

      {/* 드로어 패널 */}
      <aside
        className="sh-drawer"
        role="dialog" aria-label="장바구니"
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0,
          width: "min(400px, 92vw)",
          background: T.bgCard,
          borderLeft: `1px solid ${T.border}`,
          zIndex: 201,
          display: "flex", flexDirection: "column",
          boxShadow: "-20px 0 60px rgba(0,0,0,0.7), 0 0 40px rgba(99,102,241,0.06)",
        }}
      >
        {/* 헤더 */}
        <div style={{
          padding: "20px 22px 16px",
          borderBottom: `1px solid ${T.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: T.text }}>
            장바구니
            <span style={{ color: T.violet, fontWeight: 700, marginLeft: 8, fontFamily: S.mono }}>
              {cart.count}
            </span>
          </div>
          <button
            onClick={cart.closeDrawer}
            aria-label="닫기"
            style={{
              width: 34, height: 34, borderRadius: 9,
              border: `1px solid ${T.borderMid}`,
              background: T.bgSubtle,
              cursor: "pointer", fontSize: 15, color: T.textSub,
            }}
          >✕</button>
        </div>

        {/* 디지털 안내 */}
        {cart.count > 0 && (
          <div style={{
            padding: "11px 22px",
            borderBottom: `1px solid ${T.border}`,
            background: T.bgRaised,
            display: "flex", alignItems: "center", gap: 8,
            fontSize: 12, color: T.green, fontFamily: S.mono, fontWeight: 600,
          }}>
            <span>✓</span>
            결제 즉시 다운로드 링크 발송 · 14일 환불 보장
          </div>
        )}

        {/* 아이템 목록 */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 22px" }}>
          {cart.count === 0 ? (
            <div style={{ textAlign: "center", padding: "72px 0" }}>
              <div style={{ fontSize: 40, fontFamily: S.mono, marginBottom: 16, color: T.textHint }}>⬡</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: T.textSub, marginBottom: 8 }}>
                장바구니가 비어 있어요
              </div>
              <div style={{ fontSize: 12, fontFamily: S.mono, color: T.textHint }}>
                // add products to get started
              </div>
            </div>
          ) : (
            cart.items.map(it => (
              <div
                key={`${it.id}:${it.opt}`}
                style={{
                  display: "flex", gap: 14, padding: "16px 0",
                  borderBottom: `1px solid ${T.border}`,
                }}
              >
                {/* 썸네일 */}
                <div style={{
                  width: 60, height: 60, borderRadius: 12,
                  background: CAT_TINT_V2[it.p.cat],
                  border: `1px solid ${T.borderMid}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 26, flexShrink: 0, fontFamily: S.mono,
                }}>
                  {it.p.thumb}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <span style={{
                      fontSize: 13, fontWeight: 700, color: T.text,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {it.p.name}
                    </span>
                    <button
                      onClick={() => cart.remove(it.id, it.opt)}
                      style={{ border: "none", background: "none", color: T.textHint, cursor: "pointer", fontSize: 13, flexShrink: 0 }}
                    >✕</button>
                  </div>
                  <div style={{ fontSize: 11, color: T.textHint, marginTop: 3, fontFamily: S.mono }}>
                    {it.opt} License
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
                    {/* 수량 */}
                    <div style={{
                      display: "inline-flex", alignItems: "center",
                      border: `1px solid ${T.borderMid}`, borderRadius: 8, overflow: "hidden",
                    }}>
                      <button onClick={() => cart.setQty(it.id, it.opt, it.qty - 1)} style={{ width: 28, height: 28, border: "none", background: T.bgSubtle, cursor: "pointer", color: T.textSub, fontSize: 14 }}>−</button>
                      <span style={{ width: 30, textAlign: "center", fontSize: 12, fontWeight: 700, color: T.text }}>{it.qty}</span>
                      <button onClick={() => cart.setQty(it.id, it.opt, it.qty + 1)} style={{ width: 28, height: 28, border: "none", background: T.bgSubtle, cursor: "pointer", color: T.textSub, fontSize: 14 }}>+</button>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 800, color: T.violet }}>{fmtWon(it.p.price * it.qty)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 결제 푸터 */}
        {cart.count > 0 && (
          <div style={{
            padding: "16px 22px 22px",
            borderTop: `1px solid ${T.border}`,
            background: T.bgRaised,
          }}>
            {[
              ["상품 금액", fmtWon(cart.subtotal)],
              ["배송비", "무료 (디지털)"],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: T.textSub, marginBottom: 7 }}>
                <span>{k}</span>
                <span style={{ color: k === "배송비" ? T.green : T.textSub }}>{v}</span>
              </div>
            ))}

            <div style={{
              display: "flex", justifyContent: "space-between",
              fontSize: 18, fontWeight: 800,
              paddingTop: 12, borderTop: `1px solid ${T.border}`,
              marginTop: 4, marginBottom: 16,
            }}>
              <span style={{ color: T.text }}>총 결제 금액</span>
              <span style={{ color: T.violet }}>{fmtWon(cart.total)}</span>
            </div>

            <Link
              href="/shop/checkout/"
              onClick={cart.closeDrawer}
              className="sh-btn"
              style={{ ...S.btnPrimary, width: "100%", height: 50, borderRadius: 12, fontSize: 15 }}
            >
              주문하기 →
            </Link>

            <div style={{ textAlign: "center", fontSize: 11, color: T.textHint, marginTop: 10, fontFamily: S.mono }}>
              // 결제 즉시 다운로드 · 14일 환불 보장
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
