"use client";

import { useState, useEffect } from "react";
import { C, styles } from "../theme";
import { StatusBadge, Th, Td } from "../ui/common";
import { downloadCSV } from "../csv";
import CalendarWidget from "../widgets/CalendarWidget";

// ── 화면 1: 대시보드 ─────────────────────────────────────────
export default function Dashboard() {
  // 실시간 현황 위젯
  const [realtime, setRealtime] = useState({
    sales: 2840000,
    visitors: 284,
    pending: 12,
    orders: 38,
    cartItems: 64,
    newCustomers: 8,
    tick: 0,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setRealtime(prev => ({
        sales: prev.sales + Math.floor(Math.random() * 120000),
        visitors: Math.max(200, prev.visitors + Math.floor(Math.random() * 6) - 2),
        pending: Math.max(0, prev.pending + (Math.random() > 0.7 ? 1 : 0)),
        orders: prev.orders + (Math.random() > 0.8 ? 1 : 0),
        cartItems: Math.max(40, prev.cartItems + Math.floor(Math.random() * 4) - 1),
        newCustomers: prev.newCustomers + (Math.random() > 0.9 ? 1 : 0),
        tick: prev.tick + 1,
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const kpis = [
    { label: "총 매출", value: "₩28,430,000", delta: "+14.2% 전주 대비", up: true, sub: "결제 완료 기준", accent: C.green },
    { label: "신규 주문", value: "284건", delta: "+32건 증가", up: true, sub: "처리 대기 12건", accent: C.blue },
    { label: "구매 전환율", value: "3.8%", delta: "-0.4%p", up: false, sub: "방문자 → 결제", accent: C.amber },
    { label: "장바구니 이탈", value: "62.1%", delta: "개선 +2.1%p", up: true, sub: "이탈 감소 추세", accent: C.purple },
  ];
  const orders = [
    { id: "#000284", cust: "홍*동", prod: "프리미엄 후디 외 1건", amt: "₩89,000", status: "결제완료" },
    { id: "#000283", cust: "김*연", prod: "클래식 티셔츠", amt: "₩39,000", status: "배송중" },
    { id: "#000282", cust: "이*준", prod: "데님 팬츠 외 2건", amt: "₩142,000", status: "입금대기" },
    { id: "#000281", cust: "박*서", prod: "캐주얼 자켓", amt: "₩78,000", status: "취소" },
  ];
  const products = [
    { name: "프리미엄 후디", cat: "의류", qty: "284개", amt: "₩25,280,000" },
    { name: "클래식 티셔츠", cat: "의류", qty: "198개", amt: "₩7,722,000" },
    { name: "데님 팬츠", cat: "하의", qty: "156개", amt: "₩12,480,000" },
    { name: "캐주얼 스니커즈", cat: "신발", qty: "124개", amt: "₩11,160,000" },
  ];
  const funnel = [
    { label: "상품 조회", val: "12,480명", pct: 100 },
    { label: "장바구니", val: "3,240명", pct: 26 },
    { label: "결제 시작", val: "1,120명", pct: 9 },
    { label: "결제 완료", val: "474명", pct: 3.8 },
  ];
  const bars = [45, 62, 38, 78, 54, 88, 70, 65, 82, 90, 74, 68];
  const months = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];
  return (
    <>
      {/* 실시간 현황 위젯 */}
      <div style={{ background: C.accent, borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 0 }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 6px #4ade80", animation: "pulse 1.5s infinite" }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: "#fff", opacity: 0.9 }}>실시간 현황</span>
          <span style={{ fontSize: 10, color: "#fff", opacity: 0.5 }}>3초마다 갱신</span>
        </div>
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
        {[
          { label: "오늘 매출", value: `₩${(realtime.sales / 10000).toFixed(0)}만`, icon: "💰", highlight: true },
          { label: "실시간 접속자", value: `${realtime.visitors}명`, icon: "👥", highlight: false },
          { label: "처리 대기", value: `${realtime.pending}건`, icon: "⏳", highlight: realtime.pending > 10 },
          { label: "오늘 주문", value: `${realtime.orders}건`, icon: "🛒", highlight: false },
          { label: "장바구니", value: `${realtime.cartItems}개`, icon: "🛍", highlight: false },
          { label: "신규 고객", value: `${realtime.newCustomers}명`, icon: "🆕", highlight: false },
        ].map((item) => (
          <div key={item.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0 16px", borderLeft: `1px solid rgba(255,255,255,0.15)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 3 }}>
              <span style={{ fontSize: 12 }}>{item.icon}</span>
              <span style={{ fontSize: 10, color: "#fff", opacity: 0.6 }}>{item.label}</span>
            </div>
            <span style={{ fontSize: 15, fontWeight: 800, color: item.highlight ? "#fde047" : "#fff", letterSpacing: "-0.5px", transition: "color 0.3s" }}>{item.value}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {["오늘", "이번 주", "이번 달", "직접 설정"].map((f, i) => <div key={f} style={styles.filterChip(i === 1)}>{f}</div>)}
        </div>
        <button style={styles.btn()} onClick={() => downloadCSV("대시보드_월별매출", ["월", "매출지수"], months.map((m, i) => [m, bars[i]]))}>↓ CSV 내보내기</button>
      </div>
      <div style={styles.kpiGrid}>
        {kpis.map(k => (
          <div key={k.label} style={styles.kpiCard(k.accent)}>
            <div style={styles.kpiLabel}>{k.label}</div>
            <div style={styles.kpiValue}>{k.value}</div>
            <div style={styles.kpiDelta(k.up)}>{k.up ? "↑" : "↓"} {k.delta}</div>
            <div style={styles.kpiSub}>{k.sub}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>월별 매출 추이 <span style={styles.cardAction}>상세 보기 →</span></div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 100, paddingBottom: 4 }}>
            {bars.map((h, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <div style={{ width: "100%", height: `${h}%`, background: i === 11 ? C.accent : C.border, borderRadius: "3px 3px 0 0" }} />
              </div>
            ))}
          </div>
          <div style={{ display: "flex" }}>
            {months.map(m => <div key={m} style={{ flex: 1, fontSize: 9, color: C.textHint, textAlign: "center" }}>{m}</div>)}
          </div>
        </div>
        <div style={styles.card}>
          <div style={styles.cardTitle}>구매 전환 퍼널</div>
          {funnel.map(f => (
            <div key={f.label} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 3 }}>
                <span style={{ color: C.textSub }}>{f.label}</span><span style={{ fontWeight: 600 }}>{f.val}</span>
              </div>
              <div style={{ height: 5, background: C.bg, borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: `${f.pct}%`, height: "100%", background: C.accent, borderRadius: 3 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 12 }}>
        <div style={styles.tableWrap}>
          <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 600, fontSize: 12 }}>최근 주문</span>
            <span style={styles.cardAction}>전체 보기 →</span>
          </div>
          <table style={styles.table}>
            <thead><tr><Th>주문번호</Th><Th>고객명</Th><Th>상품</Th><Th style={{ textAlign: "right" }}>금액</Th><Th style={{ textAlign: "center" }}>상태</Th></tr></thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <Td style={{ color: C.blue, fontWeight: 600, fontSize: 10 }}>{o.id}</Td>
                  <Td style={{ fontWeight: 500, color: C.text }}>{o.cust}</Td>
                  <Td>{o.prod}</Td>
                  <Td style={{ textAlign: "right", fontWeight: 600, color: C.text }}>{o.amt}</Td>
                  <Td style={{ textAlign: "center" }}><StatusBadge status={o.status} /></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={styles.card}>
          <div style={styles.cardTitle}>인기 상품 TOP 4</div>
          {products.map((p, i) => (
            <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: i < 3 ? `1px solid ${C.border}` : "none" }}>
              <div style={{ width: 22, height: 22, borderRadius: 5, background: C.bg, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: C.textHint, flexShrink: 0 }}>{i + 1}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 500, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                <div style={{ fontSize: 10, color: C.textHint }}>{p.cat}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, fontWeight: 600 }}>{p.qty}</div>
                <div style={{ fontSize: 10, color: C.textHint }}>{p.amt}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* 캘린더 */}
      <CalendarWidget />
    </>
  );
}
