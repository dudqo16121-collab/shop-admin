"use client";

// ── 대시보드 최근 주문 위젯 (쇼핑몰 연동) ───────────────────
// components/admin/widgets/ShopOrdersBadge.jsx
// EcommerceAdmin.jsx 사이드바 배지와 대시보드 위젯에 사용

import { useEffect, useState } from "react";
import { C, styles } from "../theme";
import { getMergedOrders, getOrderStats, getNewOrderCount } from "../../../lib/orderBridge";

// ── 사이드바 배지 (새 주문 수) ───────────────────────────────
export function NewOrderBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const load = () => setCount(getNewOrderCount());
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);

  if (count === 0) return null;
  return (
    <span style={{
      fontSize: 9, fontWeight: 800, padding: "1px 5px", borderRadius: 8,
      background: C.red, color: "#fff", fontFamily: "monospace",
    }}>
      {count > 99 ? "99+" : count}
    </span>
  );
}

// ── 대시보드 최근 주문 미니 위젯 ────────────────────────────
export function ShopOrdersWidget({ onNavigate }) {
  const [orders, setOrders]   = useState([]);
  const [stats, setStats]     = useState(null);
  const [tick, setTick]       = useState(0);

  useEffect(() => {
    const load = () => {
      setOrders(getMergedOrders().slice(0, 5));
      setStats(getOrderStats());
    };
    load();
    const t = setInterval(() => { load(); setTick(n => n + 1); }, 5000);
    return () => clearInterval(t);
  }, []);

  if (!stats) return null;

  return (
    <div style={styles.card}>
      {/* 헤더 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={styles.cardTitle}>쇼핑몰 실시간 주문</div>
          <span style={{
            fontSize: 9, color: C.green, fontFamily: "monospace",
            background: C.greenBg, border: `1px solid ${C.green}40`,
            padding: "2px 6px", borderRadius: 5,
            display: "flex", alignItems: "center", gap: 4,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: C.green, display: "inline-block" }} />
            LIVE
          </span>
        </div>
        <button
          onClick={() => onNavigate?.("orders")}
          style={{ ...styles.smBtn, fontSize: 10 }}
        >
          전체 보기 →
        </button>
      </div>

      {/* 통계 미니 바 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6, marginBottom: 14 }}>
        {[
          { label: "전체",    val: stats.total,    color: C.textSub },
          { label: "입금대기", val: stats.pending, color: C.amber },
          { label: "결제완료", val: stats.paid,    color: C.green },
          { label: "배송중",   val: stats.shipping,color: C.blue },
        ].map(s => (
          <div key={s.label} style={{ background: C.bg, borderRadius: 8, padding: "7px 10px", textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 9, color: C.textHint, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* 최근 주문 목록 */}
      {orders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "20px 0", color: C.textHint, fontSize: 12 }}>
          쇼핑몰 주문이 없어요. 쇼핑몰에서 주문하면 여기에 표시됩니다.
        </div>
      ) : (
        <div>
          {orders.map((o, i) => (
            <div key={o.id} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "8px 0",
              borderBottom: i < orders.length - 1 ? `1px solid ${C.border}` : "none",
            }}>
              {/* 상태 도트 */}
              <div style={{
                width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                background: {
                  "결제완료": C.green, "입금대기": C.amber,
                  "배송중": C.blue, "배송완료": C.textHint, "취소": C.red,
                }[o.status] || C.textHint,
              }} />
              <span style={{ fontSize: 10, color: C.blue, fontFamily: "monospace", fontWeight: 700, flexShrink: 0, width: 70 }}>
                {o.id}
              </span>
              <span style={{ fontSize: 11, color: C.textSub, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {o.prod}
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.text, flexShrink: 0 }}>
                {o.amt}
              </span>
              <span style={styles.badge(
                o.status === "결제완료" ? "green" :
                o.status === "입금대기" ? "amber" :
                o.status === "배송중"   ? "blue"  :
                o.status === "취소"     ? "red"   : "gray"
              )}>
                {o.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 마지막 갱신 */}
      <div style={{ fontSize: 9, color: C.textHint, fontFamily: "monospace", marginTop: 10, textAlign: "right" }}>
        // 자동 갱신 · {new Date().toLocaleTimeString("ko-KR")}
      </div>
    </div>
  );
}