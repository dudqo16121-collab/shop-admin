"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { T, S } from "../../../components/shop/theme";
import { fmtWon } from "../../../lib/store-data";

const PAY_LABEL = { card: "신용카드", kakao: "카카오페이", naver: "네이버페이", bank: "무통장입금" };
const fmtDate = iso => new Date(iso).toLocaleString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });

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
        <div style={{ fontSize: 40, fontFamily: S.mono, color: T.textHint, marginBottom: 16 }}>🧾</div>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, color: T.text }}>아직 주문 내역이 없어요</h1>
        <p style={{ fontSize: 14, color: T.textSub, marginBottom: 24 }}>첫 구매를 시작해 보세요.</p>
        <Link href="/shop/products/" className="sh-btn" style={{ ...S.btnPrimary, display: "inline-flex" }}>
          제품 보러 가기 →
        </Link>
      </div>
    );
  }

  return (
    <div style={{ ...S.wrap, maxWidth: 760, paddingTop: 48, paddingBottom: 40 }}>
      <div className="sh-fadeup" style={{ marginBottom: 30 }}>
        <div style={S.eyebrow}>// Order History</div>
        <h1 style={{ fontSize: "clamp(28px,5vw,44px)", fontWeight: 800, letterSpacing: "-0.035em", margin: "8px 0 6px", color: T.text }}>
          주문 내역
        </h1>
        <div style={{ fontSize: 13, color: T.textHint, fontFamily: S.mono }}>총 {orders.length}건</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {orders.map((o, idx) => {
          const pending = o.pay === "bank";
          return (
            <div
              key={o.no}
              className="sh-fadeup sh-glow-card"
              style={{
                animationDelay: `${Math.min(idx, 6) * 60}ms`,
                background: T.bgCard, border: `1px solid ${T.border}`,
                borderRadius: 16, padding: "20px 24px",
              }}
            >
              {/* 헤더 */}
              <div style={{
                display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
                paddingBottom: 14, borderBottom: `1px solid ${T.border}`,
              }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: T.text, fontFamily: S.mono }}>
                  {o.no}
                </span>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 6,
                  background: pending ? T.amberBg : T.greenBg,
                  color: pending ? T.amber : T.green,
                  border: `1px solid ${pending ? T.amber : T.green}40`,
                  fontFamily: S.mono,
                }}>
                  {pending ? "입금 대기" : "결제 완료"}
                </span>
                <span style={{ marginLeft: "auto", fontSize: 11, color: T.textHint, fontFamily: S.mono }}>{fmtDate(o.date)}</span>
              </div>

              {/* 상품 */}
              <div style={{ padding: "6px 0" }}>
                {o.items?.map((it, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", gap: 10,
                    fontSize: 13, padding: "8px 0",
                    borderBottom: i < o.items.length - 1 ? `1px solid ${T.border}` : "none",
                  }}>
                    <span style={{ color: T.textSub }}>
                      {it.name}
                      <span style={{ color: T.textHint, fontFamily: S.mono }}> · {it.opt} · {it.qty}개</span>
                    </span>
                    <span style={{ fontWeight: 700, flexShrink: 0, color: T.text }}>{fmtWon(it.price * it.qty)}</span>
                  </div>
                ))}
              </div>

              {/* 합계 */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                paddingTop: 14, borderTop: `1px solid ${T.border}`,
              }}>
                <span style={{ fontSize: 12, color: T.textHint, fontFamily: S.mono }}>
                  {PAY_LABEL[o.pay] || o.pay}
                  {o.discount > 0 && <> · 쿠폰 −{fmtWon(o.discount)}</>}
                  {" · 배송비 무료"}
                </span>
                <span style={{ fontSize: 16, fontWeight: 800, color: T.violet }}>{fmtWon(o.total)}</span>
                <Link
  href={`/shop/review/${o.no}/`}
  style={{
    fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 7,
    background: T.violetBg, border: `1px solid ${T.violet}40`,
    color: T.violet, textDecoration: "none", fontFamily: S.mono,
    display: "inline-flex", alignItems: "center", gap: 5,
  }}
>
  ★ 리뷰 작성
</Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
