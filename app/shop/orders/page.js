"use client";

// ── 주문 내역: localStorage('shop:orders') 조회 — 관리자 연동 포인트 ──
import Link from "next/link";
import { useEffect, useState } from "react";
import { C, S } from "../../../components/shop/theme";
import { fmtWon } from "../../../lib/store-data";

const PAY_LABEL = { card: "신용카드", kakao: "카카오페이", naver: "네이버페이", bank: "무통장입금" };

const fmtDate = (iso) =>
  new Date(iso).toLocaleString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });

export default function OrdersPage() {
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("shop:orders");
      setOrders(raw ? JSON.parse(raw) : []);
    } catch { setOrders([]); }
  }, []);

  if (orders === null) return <div style={{ minHeight: "40vh" }} />;

  if (orders.length === 0) {
    return (
      <div style={{ ...S.wrap, paddingTop: 110, paddingBottom: 80, textAlign: "center" }}>
        <div style={{ fontSize: 44, marginBottom: 16 }}>🧾</div>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>아직 주문 내역이 없어요</h1>
        <p style={{ fontSize: 14, color: C.textSub, marginBottom: 24 }}>첫 주문을 시작해 보세요.</p>
        <Link href="/shop/products/" className="sh-btn" style={{ ...S.btnPrimary, display: "inline-flex" }}>
          상품 보러 가기 →
        </Link>
      </div>
    );
  }

  return (
    <div style={{ ...S.wrap, maxWidth: 760, paddingTop: 48, paddingBottom: 40 }}>
      <div className="sh-fadeup" style={{ marginBottom: 30 }}>
        <div style={S.eyebrow}>Order History</div>
        <h1 style={{ fontSize: "clamp(30px, 5vw, 48px)", fontWeight: 800, letterSpacing: "-0.035em", margin: "8px 0 6px" }}>
          주문 내역
        </h1>
        <div style={{ fontSize: 13, color: C.textHint }}>총 {orders.length}건</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {orders.map((o, idx) => {
          const pending = o.pay === "bank";
          return (
            <div key={o.no} className="sh-fadeup" style={{ animationDelay: `${Math.min(idx, 6) * 60}ms`, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, padding: "20px 24px" }}>
              {/* 헤더 */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", paddingBottom: 14, borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 14, fontWeight: 800 }}>주문 {o.no}</span>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                  background: pending ? C.amberBg : C.greenBg,
                  color: pending ? C.amberText : C.greenText,
                }}>
                  {pending ? "입금 대기" : "결제 완료"}
                </span>
                <span style={{ marginLeft: "auto", fontSize: 12, color: C.textHint }}>{fmtDate(o.date)}</span>
              </div>

              {/* 상품 */}
              <div style={{ padding: "6px 0" }}>
                {o.items.map((it, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 13, padding: "8px 0", borderBottom: i < o.items.length - 1 ? `1px solid ${C.border}` : "none" }}>
                    <span style={{ color: C.textSub }}>
                      {it.name} <span style={{ color: C.textHint }}>· {it.opt} · {it.qty}개</span>
                    </span>
                    <span style={{ fontWeight: 700, flexShrink: 0 }}>{fmtWon(it.price * it.qty)}</span>
                  </div>
                ))}
              </div>

              {/* 합계 */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 12, color: C.textHint }}>
                  {PAY_LABEL[o.pay] || o.pay}
                  {o.discount > 0 && <> · 쿠폰 −{fmtWon(o.discount)}</>}
                  {o.shipping === 0 ? " · 무료배송" : ` · 배송비 ${fmtWon(o.shipping)}`}
                </span>
                <span style={{ fontSize: 16, fontWeight: 800 }}>{fmtWon(o.total)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}