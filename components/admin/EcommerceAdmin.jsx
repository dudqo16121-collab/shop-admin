"use client";

// ── CSV 내보내기 유틸 ────────────────────────────────────────
function downloadCSV(filename, headers, rows) {
  const BOM = "\uFEFF";
  const headerRow = headers.join(",");
  const dataRows = rows.map(row =>
    row.map(cell => {
      const str = String(cell ?? "");
      return str.includes(",") || str.includes("\n") || str.includes('"')
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    }).join(",")
  );
  const csv = BOM + [headerRow, ...dataRows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportOrders(orders) {
  downloadCSV("주문목록", 
    ["주문번호", "주문일시", "고객명", "주문상품", "수량", "결제금액", "결제수단", "상태"],
    orders.map(o => [o.id, o.date, o.cust, o.prod, o.qty, o.amt, o.pay, o.status])
  );
}

function exportProducts(products) {
  downloadCSV("상품목록",
    ["상품ID", "상품명", "카테고리", "SKU수", "판매가", "재고", "판매량", "평점", "상태", "등록일"],
    products.map(p => [p.id, p.name, p.cat, p.skus, p.price, p.stock, p.sales, p.rating, p.status, p.created])
  );
}

function exportCustomers(customers) {
  downloadCSV("고객목록",
    ["고객ID", "이름", "이메일", "전화번호", "등급", "주문횟수", "총구매액", "포인트", "가입일", "최근주문", "상태"],
    customers.map(c => [c.id, c.name, c.email, c.phone, c.gradeDetail, c.orders, c.total, c.point, c.joined, c.lastOrder, c.status])
  );
}

function exportInventory(products) {
  downloadCSV("재고현황",
    ["SKU", "상품명", "카테고리", "옵션", "현재고", "최소재고", "입고수량", "출고수량", "재고가치"],
    products.map(p => [p.id, p.name, p.cat, p.opt, p.stock, p.min, p.in, p.out, p.stock * p.price])
  );
}

function exportSettlement(data) {
  downloadCSV("정산내역",
    ["정산월", "매출", "수수료", "부가세", "배송비차감", "정산액", "정산일", "상태"],
    data.map(d => [d.month, d.sales, d.fee, d.vat, d.shipping, d.net, d.date, d.status])
  );
}

import { useState, useEffect } from "react";

// ── 공통 토큰 ───────────────────────────────────────────────
const C = {
  bg: "#F8F7F5",
  surface: "#FFFFFF",
  border: "#E5E3DF",
  borderMid: "#D0CEC9",
  text: "#1A1917",
  textSub: "#6B6963",
  textHint: "#A09D97",
  accent: "#1A1917",
  blue: "#2563EB",
  blueBg: "#EFF6FF",
  blueText: "#1D4ED8",
  green: "#16A34A",
  greenBg: "#F0FDF4",
  greenText: "#15803D",
  amber: "#D97706",
  amberBg: "#FFFBEB",
  amberText: "#B45309",
  red: "#DC2626",
  redBg: "#FEF2F2",
  redText: "#B91C1C",
  purple: "#7C3AED",
  purpleBg: "#F5F3FF",
  purpleText: "#6D28D9",
};

const styles = {
  app: { display: "flex", height: "100vh", background: C.bg, fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13, color: C.text, overflow: "hidden" },
  sidebar: { width: 200, background: C.surface, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", flexShrink: 0 },
  sidebarTop: { padding: "16px 12px 8px", borderBottom: `1px solid ${C.border}` },
  logo: { display: "flex", alignItems: "center", gap: 8, marginBottom: 4 },
  logoBox: { width: 28, height: 28, borderRadius: 7, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13 },
  logoText: { fontWeight: 700, fontSize: 14, letterSpacing: "-0.3px" },
  logoSub: { fontSize: 10, color: C.textHint, paddingLeft: 36 },
  nav: { flex: 1, padding: "8px 8px", overflowY: "auto" },
  navSection: { marginBottom: 16 },
  navLabel: { fontSize: 10, color: C.textHint, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", padding: "4px 8px", marginBottom: 2 },
  navItem: (active) => ({ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 7, fontSize: 12, color: active ? C.text : C.textSub, background: active ? C.bg : "transparent", fontWeight: active ? 600 : 400, cursor: "pointer", marginBottom: 1, transition: "background 0.1s" }),
  navBadge: (color) => ({ marginLeft: "auto", fontSize: 10, background: color === "red" ? C.redBg : C.blueBg, color: color === "red" ? C.redText : C.blueText, padding: "1px 6px", borderRadius: 10, fontWeight: 600 }),
  sidebarFooter: { padding: "10px 12px", borderTop: `1px solid ${C.border}` },
  avatarRow: { display: "flex", alignItems: "center", gap: 8 },
  avatar: { width: 28, height: 28, borderRadius: "50%", background: C.bg, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: C.textSub, flexShrink: 0 },
  main: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 },
  topbar: { display: "flex", alignItems: "center", gap: 10, padding: "10px 20px", background: C.surface, borderBottom: `1px solid ${C.border}`, flexShrink: 0 },
  pageTitle: { fontSize: 15, fontWeight: 700, flex: 1, letterSpacing: "-0.3px" },
  searchBox: { display: "flex", alignItems: "center", gap: 6, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "5px 10px", fontSize: 11, color: C.textHint, width: 180 },
  iconBtn: { width: 30, height: 30, borderRadius: 8, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: C.textSub, fontSize: 14, background: C.surface, cursor: "pointer", position: "relative" },
  notifDot: { position: "absolute", top: 5, right: 5, width: 5, height: 5, borderRadius: "50%", background: C.red },
  content: { flex: 1, overflowY: "auto", padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 },
  // cards
  card: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "13px 15px" },
  cardTitle: { fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between" },
  cardAction: { fontSize: 11, color: C.textHint, cursor: "pointer", fontWeight: 400, display: "flex", alignItems: "center", gap: 3 },
  // kpi
  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 10 },
  kpiCard: (accent) => ({ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "11px 13px", borderLeft: `3px solid ${accent}` }),
  kpiLabel: { fontSize: 10, color: C.textSub, marginBottom: 5, fontWeight: 500 },
  kpiValue: { fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 2, letterSpacing: "-0.5px" },
  kpiDelta: (up) => ({ fontSize: 10, color: up ? C.green : C.red, display: "flex", alignItems: "center", gap: 2 }),
  kpiSub: { fontSize: 10, color: C.textHint, marginTop: 2 },
  // badges
  badge: (color) => {
    const map = { green: [C.greenBg, C.greenText], blue: [C.blueBg, C.blueText], amber: [C.amberBg, C.amberText], red: [C.redBg, C.redText], gray: [C.bg, C.textHint], purple: [C.purpleBg, C.purpleText] };
    const [bg, text] = map[color] || map.gray;
    return { fontSize: 9, padding: "2px 7px", borderRadius: 10, background: bg, color: text, fontWeight: 600, whiteSpace: "nowrap", display: "inline-block" };
  },
  // table
  tableWrap: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { fontSize: 10, color: C.textHint, fontWeight: 600, textAlign: "left", padding: "8px 12px", borderBottom: `1px solid ${C.border}`, background: C.bg, letterSpacing: "0.04em", textTransform: "uppercase" },
  td: { fontSize: 11, color: C.textSub, padding: "9px 12px", borderBottom: `1px solid ${C.border}`, verticalAlign: "middle" },
  // filter bar
  filterBar: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  filterChip: (active) => ({ fontSize: 11, padding: "4px 10px", borderRadius: 20, border: `1px solid ${active ? C.borderMid : C.border}`, background: active ? C.bg : C.surface, color: active ? C.text : C.textSub, cursor: "pointer", fontWeight: active ? 600 : 400 }),
  select: { fontSize: 11, padding: "5px 10px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, color: C.textSub },
  input: { height: 32, borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, padding: "0 10px", fontSize: 11, color: C.text, width: "100%", outline: "none" },
  btn: (variant) => {
    if (variant === "primary") return { display: "flex", alignItems: "center", gap: 5, fontSize: 11, padding: "6px 13px", borderRadius: 8, background: C.accent, border: "none", color: "#fff", fontWeight: 600, cursor: "pointer" };
    if (variant === "danger") return { display: "flex", alignItems: "center", gap: 5, fontSize: 11, padding: "5px 12px", borderRadius: 8, background: C.surface, border: `1px solid ${C.border}`, color: C.red, cursor: "pointer" };
    return { display: "flex", alignItems: "center", gap: 5, fontSize: 11, padding: "5px 12px", borderRadius: 8, background: C.surface, border: `1px solid ${C.border}`, color: C.textSub, cursor: "pointer" };
  },
  smBtn: { fontSize: 10, padding: "3px 8px", borderRadius: 7, border: `1px solid ${C.border}`, background: C.surface, color: C.textSub, cursor: "pointer" },
  // pagination
  pagination: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 15px", background: C.surface, borderTop: `1px solid ${C.border}` },
  pageBtn: (active) => ({ width: 28, height: 28, borderRadius: 7, border: `1px solid ${active ? C.borderMid : C.border}`, background: active ? C.bg : C.surface, fontSize: 11, color: active ? C.text : C.textSub, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontWeight: active ? 700 : 400 }),
};

// ── 네비게이션 메뉴 ─────────────────────────────────────────
const NAV = [
  { section: "메인", items: [
    { id: "dashboard", label: "대시보드", icon: "▦" },
    { id: "analytics", label: "매출 분석", icon: "📊" },
    { id: "orders", label: "주문 관리", icon: "🛒", badge: "12", badgeColor: "red" },
    { id: "shipping", label: "배송 현황", icon: "🚚", badge: "3", badgeColor: "blue" },
  ]},
{ section: "상품", items: [
    { id: "productList", label: "상품 목록", icon: "🗂" },
    { id: "inventory", label: "재고 관리", icon: "🏭" },
  ]},
{ section: "고객·마케팅", items: [
    { id: "customerList", label: "고객 목록", icon: "👥" },
    { id: "customers", label: "고객 프로필", icon: "👤" },
    { id: "promotions", label: "프로모션·쿠폰", icon: "🎫" },
    { id: "reviews", label: "리뷰·평점", icon: "⭐" },
    { id: "cs", label: "CS 고객문의", icon: "💬", badge: "2", badgeColor: "red" },
  ]},
{ section: "결제", items: [
    { id: "checkout", label: "결제 페이지", icon: "💳" },
    { id: "settlement", label: "정산 관리", icon: "🧾" },
  ]},
{ section: "설정", items: [
    { id: "storeSettings", label: "스토어 설정", icon: "🏪" },
    { id: "permissions", label: "권한 관리", icon: "🔐" },
  ]},
];

// ── 공통 컴포넌트 ────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = { "결제완료": "green", "배송중": "blue", "입금대기": "amber", "취소": "red", "배송완료": "gray", "준비중": "amber", "지연": "red", "공개": "green", "숨김": "gray", "검토 필요": "amber", "진행 중": "green", "예정": "blue", "종료": "gray", "활성": "green", "사용가능": "green", "사용완료": "gray" };
  return <span style={styles.badge(map[status] || "gray")}>{status}</span>;
};

const Th = ({ children, style }) => <th style={{ ...styles.th, ...style }}>{children}</th>;
const Td = ({ children, style }) => <td style={{ ...styles.td, ...style }}>{children}</td>;

// ── 캘린더 위젯 ──────────────────────────────────────────────
function CalendarWidget() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const EVENTS = [
    { date: "2026-06-01", label: "여름 세일 시작", type: "promo" },
    { date: "2026-06-05", label: "VIP 쿠폰 발송", type: "promo" },
    { date: "2026-06-10", label: "신상품 출시", type: "promo" },
    { date: "2026-06-11", label: "정기 배송일", type: "shipping" },
    { date: "2026-06-15", label: "프리미엄 배송 마감", type: "shipping" },
    { date: "2026-06-18", label: "가을 신상 예약 오픈", type: "promo" },
    { date: "2026-06-20", label: "정기 배송일", type: "shipping" },
    { date: "2026-06-25", label: "여름 세일 종료", type: "promo" },
    { date: "2026-06-28", label: "월말 정산", type: "shipping" },
    { date: "2026-07-01", label: "7월 프로모션 시작", type: "promo" },
  ];

  const typeColor = { promo: C.purple, shipping: C.blue };
  const typeBg = { promo: C.purpleBg, shipping: C.blueBg };
  const typeText = { promo: C.purpleText, shipping: C.blueText };

  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const getFirstDay = (y, m) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDay(viewYear, viewMonth);
  const monthKey = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`;

  const eventsByDate = {};
  EVENTS.forEach(e => { if (!eventsByDate[e.date]) eventsByDate[e.date] = []; eventsByDate[e.date].push(e); });

  const prevMonth = () => { if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); } else setViewMonth(m => m - 1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); } else setViewMonth(m => m + 1); };

  const monthEvents = EVENTS.filter(e => e.date.startsWith(monthKey)).sort((a, b) => a.date.localeCompare(b.date));
  const days = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.2fr) minmax(0,1fr)", gap: 12 }}>
      {/* 캘린더 */}
      <div style={{ ...styles.card }}>
        {/* 헤더 */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <button onClick={prevMonth} style={{ width: 26, height: 26, borderRadius: 7, border: `1px solid ${C.border}`, background: C.surface, cursor: "pointer", fontSize: 12, color: C.textSub }}>‹</button>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{viewYear}년 {viewMonth + 1}월</span>
          <button onClick={nextMonth} style={{ width: 26, height: 26, borderRadius: 7, border: `1px solid ${C.border}`, background: C.surface, cursor: "pointer", fontSize: 12, color: C.textSub }}>›</button>
        </div>
        {/* 요일 헤더 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 4 }}>
          {days.map((d, i) => (
            <div key={d} style={{ textAlign: "center", fontSize: 10, fontWeight: 600, color: i === 0 ? C.red : i === 6 ? C.blue : C.textHint, padding: "3px 0" }}>{d}</div>
          ))}
        </div>
        {/* 날짜 그리드 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1 }}>
          {Array(firstDay).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
          {Array(daysInMonth).fill(null).map((_, i) => {
            const day = i + 1;
            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayEvents = eventsByDate[dateStr] || [];
            const isToday = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
            const isSun = (firstDay + i) % 7 === 0;
            const isSat = (firstDay + i) % 7 === 6;
            return (
              <div key={day} style={{ padding: "3px 2px", borderRadius: 6, background: isToday ? C.accent : "transparent", minHeight: 32 }}>
                <div style={{ textAlign: "center", fontSize: 11, fontWeight: isToday ? 700 : 400, color: isToday ? "#fff" : isSun ? C.red : isSat ? C.blue : C.text, marginBottom: 2 }}>{day}</div>
                {dayEvents.slice(0, 1).map((e, ei) => (
                  <div key={ei} style={{ width: "100%", height: 4, borderRadius: 2, background: typeColor[e.type], marginBottom: 1 }} />
                ))}
                {dayEvents.length > 1 && <div style={{ width: "100%", height: 4, borderRadius: 2, background: typeColor[dayEvents[1].type] }} />}
              </div>
            );
          })}
        </div>
        {/* 범례 */}
        <div style={{ display: "flex", gap: 12, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
          {[["promo", "프로모션"], ["shipping", "배송 일정"]].map(([type, label]) => (
            <div key={type} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: typeColor[type] }} />
              <span style={{ fontSize: 10, color: C.textSub }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 이번 달 일정 목록 */}
      <div style={{ ...styles.card }}>
        <div style={{ ...styles.cardTitle }}>
          {viewMonth + 1}월 일정
          <span style={{ fontSize: 10, color: C.textHint, fontWeight: 400 }}>{monthEvents.length}개</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, overflowY: "auto", maxHeight: 260 }}>
          {monthEvents.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px 0", fontSize: 12, color: C.textHint }}>이번 달 일정이 없습니다</div>
          ) : (
            monthEvents.map((e, i) => {
              const d = new Date(e.date);
              const dayOfWeek = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
              const isPast = new Date(e.date) < today;
              return (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 10px", borderRadius: 8, background: C.bg, opacity: isPast ? 0.5 : 1 }}>
                  <div style={{ flexShrink: 0, textAlign: "center", background: typeBg[e.type], borderRadius: 7, padding: "4px 7px", minWidth: 36 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: typeText[e.type] }}>{d.getDate()}</div>
                    <div style={{ fontSize: 9, color: typeText[e.type] }}>{dayOfWeek}요일</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 500, color: C.text, marginBottom: 3 }}>{e.label}</div>
                    <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 10, background: typeBg[e.type], color: typeText[e.type], fontWeight: 600 }}>
                      {e.type === "promo" ? "프로모션" : "배송"}
                    </span>
                  </div>
                  {isPast && <span style={{ fontSize: 9, color: C.textHint, flexShrink: 0 }}>완료</span>}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// ── 화면 1: 대시보드 ─────────────────────────────────────────
function Dashboard() {
  const [period, setPeriod] = useState("월별");

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
  const bars = [45,62,38,78,54,88,70,65,82,90,74,68];
  const months = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];
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
        ].map((item, i) => (
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
          {["오늘","이번 주","이번 달","직접 설정"].map((f, i) => <div key={f} style={styles.filterChip(i === 1)}>{f}</div>)}
        </div>
        <button style={styles.btn()} onClick={() => exportSettlement(monthlyData)}>↓ CSV 내보내기</button>
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

// ── 매출 분석 페이지 ─────────────────────────────────────────
function Analytics() {
  const [tab, setTab] = useState("매출");

  const periodData = {
    "일별": {
      labels: ["6/5","6/6","6/7","6/8","6/9","6/10","6/11"],
      sales: [1240000,980000,1560000,2100000,1780000,2340000,1920000],
      orders: [18,14,22,31,26,34,28],
    },
    "주별": {
      labels: ["1주","2주","3주","4주","5주"],
      sales: [8200000,11400000,9800000,14200000,12600000],
      orders: [124,168,142,208,184],
    },
    "월별": {
      labels: ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"],
      sales: [18400000,22100000,19800000,26400000,24200000,28400000,21000000,25600000,30200000,27800000,32400000,38600000],
      orders: [284,342,306,408,374,438,324,396,466,430,500,596],
    },
  };

  const data = periodData[period];
  const totalSales = data.sales.reduce((a, b) => a + b, 0);
  const totalOrders = data.orders.reduce((a, b) => a + b, 0);
  const avgOrder = Math.round(totalSales / totalOrders);
  const maxSales = Math.max(...data.sales);

  const categories = [
    { name: "의류", sales: 42800000, orders: 684, growth: 18.2, color: C.purple },
    { name: "신발", sales: 28400000, orders: 452, growth: 12.4, color: C.blue },
    { name: "악세서리", sales: 16200000, orders: 328, growth: 8.6, color: C.green },
    { name: "가방", sales: 12400000, orders: 198, growth: -3.2, color: C.amber },
    { name: "기타", sales: 8600000, orders: 142, growth: 5.1, color: C.textHint },
  ];
  const totalCatSales = categories.reduce((a, b) => a + b.sales, 0);

  const customers = [
    { label: "신규 고객", value: 284, pct: 38, color: C.blue },
    { label: "재구매 고객", value: 342, pct: 46, color: C.green },
    { label: "VIP 고객", value: 120, pct: 16, color: C.purple },
  ];

  const topCustomers = [
    { name: "홍*동", orders: 12, total: "₩1,284,000", grade: "VIP" },
    { name: "김*연", orders: 9, total: "₩892,000", grade: "VIP" },
    { name: "이*준", orders: 7, total: "₩624,000", grade: "일반" },
    { name: "박*서", orders: 6, total: "₩548,000", grade: "일반" },
    { name: "최*민", orders: 5, total: "₩412,000", grade: "일반" },
  ];

  const fmt = (n) => n >= 10000000 ? `${(n / 10000000).toFixed(1)}천만` : n >= 10000 ? `${(n / 10000).toFixed(0)}만` : n.toLocaleString();

  return (
    <>
      {/* 기간 필터 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {["일별", "주별", "월별"].map(p => (
            <div key={p} onClick={() => setPeriod(p)} style={styles.filterChip(period === p)}>{p}</div>
          ))}
        </div>
        <button style={styles.btn()} onClick={() => downloadCSV("매출분석", ["기간", "매출", "주문수", "평균주문액"], data.sales.map((s, i) => [data.labels[i], s, data.orders[i], Math.round(s / data.orders[i])]))}>↓ CSV 내보내기</button>
      </div>

      {/* KPI */}
      <div style={styles.kpiGrid}>
        {[
          { label: "총 매출", value: `₩${fmt(totalSales)}`, delta: "+14.2%", up: true, sub: `주문 ${totalOrders.toLocaleString()}건`, accent: C.green },
          { label: "평균 주문액", value: `₩${avgOrder.toLocaleString()}`, delta: "+6.8%", up: true, sub: "건당 평균", accent: C.blue },
          { label: "구매 전환율", value: "3.8%", delta: "-0.4%p", up: false, sub: "방문자 → 결제", accent: C.amber },
          { label: "재구매율", value: "46.2%", delta: "+3.1%p", up: true, sub: "전체 고객 중", accent: C.purple },
        ].map(k => (
          <div key={k.label} style={styles.kpiCard(k.accent)}>
            <div style={styles.kpiLabel}>{k.label}</div>
            <div style={styles.kpiValue}>{k.value}</div>
            <div style={styles.kpiDelta(k.up)}>{k.up ? "↑" : "↓"} {k.delta}</div>
            <div style={styles.kpiSub}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* 탭 */}
      <div style={{ display: "flex", borderBottom: `1px solid ${C.border}` }}>
        {["매출", "카테고리", "고객 분석"].map(t => (
          <div key={t} onClick={() => setTab(t)} style={{ fontSize: 12, padding: "8px 16px", cursor: "pointer", color: tab === t ? C.text : C.textHint, fontWeight: tab === t ? 700 : 400, borderBottom: tab === t ? `2px solid ${C.accent}` : "2px solid transparent", marginBottom: -1 }}>{t}</div>
        ))}
      </div>

      {/* 매출 탭 */}
      {tab === "매출" && (
        <>
          <div style={styles.card}>
            <div style={styles.cardTitle}>
              {period} 매출 추이
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: C.textSub }}><div style={{ width: 8, height: 8, borderRadius: 2, background: C.accent }} />매출</div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: C.textSub }}><div style={{ width: 8, height: 8, borderRadius: 2, background: C.border }} />주문수</div>
              </div>
            </div>
            {/* 바 차트 */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: period === "월별" ? 4 : 8, height: 140, paddingBottom: 4 }}>
              {data.sales.map((s, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, height: "100%" }}>
                  <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
                    <div style={{ width: "100%", height: `${(s / maxSales) * 100}%`, background: C.accent, borderRadius: "3px 3px 0 0", minHeight: 4, opacity: 0.85 }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", marginTop: 4 }}>
              {data.labels.map((l, i) => (
                <div key={i} style={{ flex: 1, fontSize: 9, color: C.textHint, textAlign: "center" }}>{l}</div>
              ))}
            </div>
          </div>

          {/* 매출 상세 테이블 */}
          <div style={styles.tableWrap}>
            <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, fontWeight: 600, fontSize: 12 }}>기간별 상세</div>
            <table style={{ ...styles.table, tableLayout: "fixed" }}>
              <thead><tr>
                <th style={styles.th}>기간</th>
                <th style={{ ...styles.th, textAlign: "right" }}>매출</th>
                <th style={{ ...styles.th, textAlign: "right" }}>주문수</th>
                <th style={{ ...styles.th, textAlign: "right" }}>평균 주문액</th>
                <th style={{ ...styles.th, textAlign: "right" }}>전기 대비</th>
              </tr></thead>
              <tbody>
                {data.sales.map((s, i) => {
                  const prev = i > 0 ? data.sales[i - 1] : null;
                  const growth = prev ? ((s - prev) / prev * 100).toFixed(1) : null;
                  return (
                    <tr key={i}>
                      <td style={styles.td}>{data.labels[i]}</td>
                      <td style={{ ...styles.td, textAlign: "right", fontWeight: 600, color: C.text }}>₩{fmt(s)}</td>
                      <td style={{ ...styles.td, textAlign: "right" }}>{data.orders[i].toLocaleString()}건</td>
                      <td style={{ ...styles.td, textAlign: "right" }}>₩{Math.round(s / data.orders[i]).toLocaleString()}</td>
                      <td style={{ ...styles.td, textAlign: "right", color: growth === null ? C.textHint : Number(growth) >= 0 ? C.green : C.red, fontWeight: 500 }}>
                        {growth === null ? "—" : `${Number(growth) >= 0 ? "+" : ""}${growth}%`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* 카테고리 탭 */}
      {tab === "카테고리" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1.4fr)", gap: 12 }}>
            {/* 도넛 차트 대체 */}
            <div style={styles.card}>
              <div style={styles.cardTitle}>카테고리별 매출 비중</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
                {categories.map(cat => (
                  <div key={cat.name}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: cat.color }} />
                        <span style={{ fontWeight: 500, color: C.text }}>{cat.name}</span>
                      </div>
                      <span style={{ color: C.textSub }}>{(cat.sales / totalCatSales * 100).toFixed(1)}%</span>
                    </div>
                    <div style={{ height: 6, background: C.bg, borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${cat.sales / totalCatSales * 100}%`, background: cat.color, borderRadius: 3 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 카테고리 상세 */}
            <div style={styles.card}>
              <div style={styles.cardTitle}>카테고리 상세</div>
              <table style={{ ...styles.table }}>
                <thead><tr>
                  <th style={styles.th}>카테고리</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>매출</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>주문</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>성장률</th>
                </tr></thead>
                <tbody>
                  {categories.map(cat => (
                    <tr key={cat.name}>
                      <td style={styles.td}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 8, height: 8, borderRadius: 2, background: cat.color, flexShrink: 0 }} />
                          {cat.name}
                        </div>
                      </td>
                      <td style={{ ...styles.td, textAlign: "right", fontWeight: 600, color: C.text }}>₩{fmt(cat.sales)}</td>
                      <td style={{ ...styles.td, textAlign: "right" }}>{cat.orders}건</td>
                      <td style={{ ...styles.td, textAlign: "right", color: cat.growth >= 0 ? C.green : C.red, fontWeight: 600 }}>
                        {cat.growth >= 0 ? "+" : ""}{cat.growth}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 베스트 상품 */}
          <div style={styles.card}>
            <div style={styles.cardTitle}>베스트 상품 TOP 5</div>
            <table style={{ ...styles.table, tableLayout: "fixed" }}>
              <thead><tr>
                <th style={{ ...styles.th, width: 32 }}>순위</th>
                <th style={styles.th}>상품명</th>
                <th style={styles.th}>카테고리</th>
                <th style={{ ...styles.th, textAlign: "right" }}>판매량</th>
                <th style={{ ...styles.th, textAlign: "right" }}>매출</th>
                <th style={{ ...styles.th, textAlign: "right" }}>전월 대비</th>
              </tr></thead>
              <tbody>
                {[
                  { rank: 1, name: "프리미엄 후디", cat: "의류", qty: 284, sales: "₩25,280,000", growth: "+18.2%" },
                  { rank: 2, name: "클래식 티셔츠", cat: "의류", qty: 198, sales: "₩7,722,000", growth: "+12.4%" },
                  { rank: 3, name: "데님 팬츠", cat: "하의", qty: 156, sales: "₩12,480,000", growth: "+8.6%" },
                  { rank: 4, name: "캐주얼 스니커즈", cat: "신발", qty: 124, sales: "₩11,160,000", growth: "-3.2%" },
                  { rank: 5, name: "레더 토트백", cat: "가방", qty: 98, sales: "₩9,800,000", growth: "+5.1%" },
                ].map(p => (
                  <tr key={p.rank}>
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      <div style={{ width: 20, height: 20, borderRadius: 5, background: p.rank <= 3 ? C.amberBg : C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: p.rank <= 3 ? C.amberText : C.textHint }}>{p.rank}</div>
                    </td>
                    <td style={{ ...styles.td, fontWeight: 500, color: C.text }}>{p.name}</td>
                    <td style={styles.td}>{p.cat}</td>
                    <td style={{ ...styles.td, textAlign: "right" }}>{p.qty}개</td>
                    <td style={{ ...styles.td, textAlign: "right", fontWeight: 600, color: C.text }}>{p.sales}</td>
                    <td style={{ ...styles.td, textAlign: "right", color: p.growth.startsWith("+") ? C.green : C.red, fontWeight: 600 }}>{p.growth}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* 고객 분석 탭 */}
      {tab === "고객 분석" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 12 }}>
            {customers.map(c => (
              <div key={c.label} style={{ ...styles.card, textAlign: "center", paddingTop: 16 }}>
                <div style={styles.kpiLabel}>{c.label}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: c.color, letterSpacing: "-1px", margin: "6px 0" }}>{c.value}</div>
                <div style={{ height: 5, background: C.bg, borderRadius: 3, overflow: "hidden", margin: "6px 0" }}>
                  <div style={{ height: "100%", width: `${c.pct}%`, background: c.color, borderRadius: 3 }} />
                </div>
                <div style={{ fontSize: 11, color: C.textHint }}>전체의 {c.pct}%</div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 12 }}>
            {/* 유입 경로 */}
            <div style={styles.card}>
              <div style={styles.cardTitle}>유입 경로 분석</div>
              {[
                { label: "직접 접속", pct: 42, color: C.accent },
                { label: "검색 (네이버/구글)", pct: 28, color: C.blue },
                { label: "SNS (인스타/카카오)", pct: 18, color: C.purple },
                { label: "이메일 마케팅", pct: 8, color: C.green },
                { label: "기타", pct: 4, color: C.textHint },
              ].map(r => (
                <div key={r.label} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}>
                    <span style={{ color: C.textSub }}>{r.label}</span>
                    <span style={{ fontWeight: 600, color: C.text }}>{r.pct}%</span>
                  </div>
                  <div style={{ height: 5, background: C.bg, borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${r.pct}%`, background: r.color, borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>

            {/* 연령·성별 */}
            <div style={styles.card}>
              <div style={styles.cardTitle}>연령대별 구매 비중</div>
              {[
                { label: "10대", male: 8, female: 12 },
                { label: "20대", male: 22, female: 28 },
                { label: "30대", male: 18, female: 24 },
                { label: "40대", male: 12, female: 10 },
                { label: "50대+", male: 4, female: 6 },
              ].map(r => (
                <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 10, color: C.textSub, width: 28, flexShrink: 0 }}>{r.label}</span>
                  <div style={{ flex: 1, display: "flex", gap: 2, height: 14 }}>
                    <div style={{ flex: r.male, background: C.blue, borderRadius: "3px 0 0 3px", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 3 }}>
                      <span style={{ fontSize: 9, color: "#fff", fontWeight: 600 }}>{r.male}%</span>
                    </div>
                    <div style={{ flex: r.female, background: C.purple, borderRadius: "0 3px 3px 0", display: "flex", alignItems: "center", paddingLeft: 3 }}>
                      <span style={{ fontSize: 9, color: "#fff", fontWeight: 600 }}>{r.female}%</span>
                    </div>
                  </div>
                </div>
              ))}
              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: C.textSub }}><div style={{ width: 8, height: 8, borderRadius: 2, background: C.blue }} />남성</div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: C.textSub }}><div style={{ width: 8, height: 8, borderRadius: 2, background: C.purple }} />여성</div>
              </div>
            </div>
          </div>

          {/* 상위 고객 */}
          <div style={styles.tableWrap}>
            <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, fontWeight: 600, fontSize: 12 }}>상위 구매 고객</div>
            <table style={styles.table}>
              <thead><tr>
                <th style={styles.th}>고객명</th>
                <th style={{ ...styles.th, textAlign: "right" }}>주문 횟수</th>
                <th style={{ ...styles.th, textAlign: "right" }}>총 구매액</th>
                <th style={{ ...styles.th, textAlign: "center" }}>등급</th>
              </tr></thead>
              <tbody>
                {topCustomers.map((c, i) => (
                  <tr key={i}>
                    <td style={{ ...styles.td, fontWeight: 500, color: C.text }}>{c.name}</td>
                    <td style={{ ...styles.td, textAlign: "right" }}>{c.orders}회</td>
                    <td style={{ ...styles.td, textAlign: "right", fontWeight: 600, color: C.text }}>{c.total}</td>
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      <span style={styles.badge(c.grade === "VIP" ? "amber" : "gray")}>{c.grade}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
// ── 재고 관리 페이지 ─────────────────────────────────────────
function Inventory() {
  const [tab, setTab] = useState("재고 현황");
  const [filter, setFilter] = useState("전체");

  const products = [
    { id: "SKU-001", name: "프리미엄 후디", cat: "의류", opt: "블랙/M", stock: 3, min: 10, in: 50, out: 47, price: 89000 },
    { id: "SKU-002", name: "프리미엄 후디", cat: "의류", opt: "블랙/L", stock: 1, min: 10, in: 30, out: 29, price: 89000 },
    { id: "SKU-003", name: "클래식 티셔츠", cat: "의류", opt: "화이트/M", stock: 0, min: 10, in: 40, out: 40, price: 39000 },
    { id: "SKU-004", name: "데님 팬츠", cat: "하의", opt: "인디고/32", stock: 24, min: 10, in: 60, out: 36, price: 79000 },
    { id: "SKU-005", name: "캐주얼 스니커즈", cat: "신발", opt: "화이트/260", stock: 8, min: 15, in: 40, out: 32, price: 89000 },
    { id: "SKU-006", name: "캐주얼 스니커즈", cat: "신발", opt: "블랙/270", stock: 42, min: 15, in: 60, out: 18, price: 89000 },
    { id: "SKU-007", name: "레더 토트백", cat: "가방", opt: "브라운", stock: 15, min: 5, in: 20, out: 5, price: 128000 },
    { id: "SKU-008", name: "캐시미어 머플러", cat: "악세서리", opt: "베이지", stock: 62, min: 10, in: 80, out: 18, price: 48000 },
    { id: "SKU-009", name: "오버핏 티셔츠", cat: "의류", opt: "그레이/L", stock: 5, min: 10, in: 30, out: 25, price: 45000 },
    { id: "SKU-010", name: "슬랙스", cat: "하의", opt: "네이비/32", stock: 18, min: 10, in: 40, out: 22, price: 68000 },
  ];

  const getStatus = (stock, min) => {
    if (stock === 0) return { label: "소진", color: "red" };
    if (stock < min) return { label: "부족", color: "amber" };
    if (stock < min * 1.5) return { label: "주의", color: "amber" };
    return { label: "정상", color: "green" };
  };

  const logs = [
    { date: "06/11 14:32", type: "in", sku: "SKU-004", name: "데님 팬츠", opt: "인디고/32", qty: 30, by: "관리자", note: "정기 발주" },
    { date: "06/11 10:15", type: "out", sku: "SKU-001", name: "프리미엄 후디", opt: "블랙/M", qty: 5, by: "주문 #000284", note: "판매" },
    { date: "06/10 18:22", type: "in", sku: "SKU-008", name: "캐시미어 머플러", opt: "베이지", qty: 40, by: "관리자", note: "긴급 발주" },
    { date: "06/10 15:40", type: "out", sku: "SKU-003", name: "클래식 티셔츠", opt: "화이트/M", qty: 8, by: "주문 #000281", note: "판매" },
    { date: "06/10 11:05", type: "out", sku: "SKU-005", name: "캐주얼 스니커즈", opt: "화이트/260", qty: 3, by: "주문 #000279", note: "판매" },
    { date: "06/09 16:30", type: "in", sku: "SKU-006", name: "캐주얼 스니커즈", opt: "블랙/270", qty: 20, by: "관리자", note: "정기 발주" },
    { date: "06/09 14:10", type: "out", sku: "SKU-002", name: "프리미엄 후디", opt: "블랙/L", qty: 2, by: "주문 #000276", note: "판매" },
    { date: "06/08 10:00", type: "adjust", sku: "SKU-007", name: "레더 토트백", opt: "브라운", qty: -2, by: "관리자", note: "불량 처리" },
  ];

  const lowStock = products.filter(p => p.stock < p.min);
  const outOfStock = products.filter(p => p.stock === 0);

  const filteredProducts = products.filter(p => {
    if (filter === "전체") return true;
    if (filter === "부족") return p.stock > 0 && p.stock < p.min;
    if (filter === "소진") return p.stock === 0;
    if (filter === "정상") return p.stock >= p.min;
    return true;
  });

  return (
    <>
      {/* KPI */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 10 }}>
        {[
          { label: "전체 SKU", value: `${products.length}개`, sub: "관리 중인 상품", accent: C.blue },
          { label: "재고 소진", value: `${outOfStock.length}개`, sub: "즉시 발주 필요", accent: C.red },
          { label: "재고 부족", value: `${lowStock.length}개`, sub: "최소 재고 미달", accent: C.amber },
          { label: "총 재고 가치", value: `₩${(products.reduce((a, p) => a + p.stock * p.price, 0) / 10000).toFixed(0)}만`, sub: "현재 보유 기준", accent: C.green },
        ].map(k => (
          <div key={k.label} style={styles.kpiCard(k.accent)}>
            <div style={styles.kpiLabel}>{k.label}</div>
            <div style={{ ...styles.kpiValue, fontSize: 18 }}>{k.value}</div>
            <div style={styles.kpiSub}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* 부족 알림 배너 */}
      {lowStock.length > 0 && (
        <div style={{ background: C.amberBg, border: `1px solid ${C.amber}`, borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 16 }}>⚠️</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.amberText }}>재고 부족 알림 — {lowStock.length}개 SKU 확인 필요</div>
            <div style={{ fontSize: 11, color: C.amberText, marginTop: 2 }}>
              {lowStock.slice(0, 3).map(p => `${p.name} (${p.opt}): ${p.stock}개`).join(" · ")}
              {lowStock.length > 3 && ` 외 ${lowStock.length - 3}건`}
            </div>
          </div>
          <button style={{ fontSize: 11, padding: "5px 12px", borderRadius: 8, border: `1px solid ${C.amber}`, background: "transparent", color: C.amberText, cursor: "pointer", fontWeight: 600 }}>발주 처리</button>
        </div>
      )}

      {/* 탭 */}
      <div style={{ display: "flex", borderBottom: `1px solid ${C.border}` }}>
        {["재고 현황", "입출고 내역", "발주 관리"].map(t => (
          <div key={t} onClick={() => setTab(t)} style={{ fontSize: 12, padding: "8px 16px", cursor: "pointer", color: tab === t ? C.text : C.textHint, fontWeight: tab === t ? 700 : 400, borderBottom: tab === t ? `2px solid ${C.accent}` : "2px solid transparent", marginBottom: -1 }}>{t}</div>
        ))}
      </div>

      {/* 재고 현황 탭 */}
      {tab === "재고 현황" && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ ...styles.searchBox, flex: 1 }}>🔍 상품명·SKU 검색...</div>
            <div style={{ display: "flex", gap: 5 }}>
              {["전체", "소진", "부족", "정상"].map(f => (
                <div key={f} onClick={() => setFilter(f)} style={styles.filterChip(filter === f)}>{f}</div>
              ))}
            </div>
            <button style={styles.btn()} onClick={() => exportInventory(products)}>↓ CSV 내보내기</button>
          </div>
          <div style={styles.tableWrap}>
            <table style={{ ...styles.table, tableLayout: "fixed" }}>
              <thead><tr>
                <th style={{ ...styles.th, width: 80 }}>SKU</th>
                <th style={styles.th}>상품명</th>
                <th style={{ ...styles.th, width: 60 }}>카테고리</th>
                <th style={{ ...styles.th, width: 80 }}>옵션</th>
                <th style={{ ...styles.th, width: 60, textAlign: "right" }}>현재고</th>
                <th style={{ ...styles.th, width: 60, textAlign: "right" }}>최소재고</th>
                <th style={{ ...styles.th, width: 60, textAlign: "center" }}>상태</th>
                <th style={{ ...styles.th, width: 80, textAlign: "right" }}>재고 가치</th>
                <th style={{ ...styles.th, width: 70, textAlign: "right" }}>관리</th>
              </tr></thead>
              <tbody>
                {filteredProducts.map(p => {
                  const status = getStatus(p.stock, p.min);
                  return (
                    <tr key={p.id} style={{ background: p.stock === 0 ? C.redBg : p.stock < p.min ? C.amberBg : C.surface }}>
                      <td style={{ ...styles.td, fontFamily: "monospace", fontSize: 10, color: C.textHint }}>{p.id}</td>
                      <td style={{ ...styles.td, fontWeight: 500, color: C.text }}>{p.name}</td>
                      <td style={styles.td}>{p.cat}</td>
                      <td style={{ ...styles.td, fontSize: 10 }}>{p.opt}</td>
                      <td style={{ ...styles.td, textAlign: "right", fontWeight: 700, color: p.stock === 0 ? C.red : p.stock < p.min ? C.amber : C.text }}>{p.stock}개</td>
                      <td style={{ ...styles.td, textAlign: "right", color: C.textHint }}>{p.min}개</td>
                      <td style={{ ...styles.td, textAlign: "center" }}><span style={styles.badge(status.color)}>{status.label}</span></td>
                      <td style={{ ...styles.td, textAlign: "right", fontSize: 10 }}>₩{(p.stock * p.price).toLocaleString()}</td>
                      <td style={{ ...styles.td, textAlign: "right" }}>
                        <div style={{ display: "flex", gap: 3, justifyContent: "flex-end" }}>
                          <button style={styles.smBtn}>수정</button>
                          {p.stock < p.min && <button style={{ ...styles.smBtn, color: C.amber }}>발주</button>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* 입출고 내역 탭 */}
      {tab === "입출고 내역" && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ ...styles.searchBox, flex: 1 }}>🔍 상품명·SKU 검색...</div>
            <select style={styles.select}><option>전체 유형</option><option>입고</option><option>출고</option><option>조정</option></select>
            <div style={{ ...styles.searchBox, width: 160, flex: "none" }}>📅 날짜 범위</div>
            <button style={styles.btn()} onClick={() => exportInventory(products)}>↓ CSV 내보내기</button>
          </div>
          <div style={styles.tableWrap}>
            <table style={{ ...styles.table, tableLayout: "fixed" }}>
              <thead><tr>
                <th style={{ ...styles.th, width: 90 }}>일시</th>
                <th style={{ ...styles.th, width: 60, textAlign: "center" }}>유형</th>
                <th style={{ ...styles.th, width: 80 }}>SKU</th>
                <th style={styles.th}>상품명</th>
                <th style={{ ...styles.th, width: 80 }}>옵션</th>
                <th style={{ ...styles.th, width: 50, textAlign: "right" }}>수량</th>
                <th style={{ ...styles.th, width: 100 }}>처리자</th>
                <th style={styles.th}>비고</th>
              </tr></thead>
              <tbody>
                {logs.map((l, i) => (
                  <tr key={i}>
                    <td style={{ ...styles.td, fontSize: 10, color: C.textHint }}>{l.date}</td>
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      <span style={styles.badge(l.type === "in" ? "green" : l.type === "out" ? "blue" : "amber")}>
                        {l.type === "in" ? "입고" : l.type === "out" ? "출고" : "조정"}
                      </span>
                    </td>
                    <td style={{ ...styles.td, fontFamily: "monospace", fontSize: 10, color: C.textHint }}>{l.sku}</td>
                    <td style={{ ...styles.td, fontWeight: 500, color: C.text }}>{l.name}</td>
                    <td style={{ ...styles.td, fontSize: 10 }}>{l.opt}</td>
                    <td style={{ ...styles.td, textAlign: "right", fontWeight: 700, color: l.type === "in" ? C.green : l.type === "out" ? C.blue : C.amber }}>
                      {l.type === "in" ? "+" : ""}{l.qty}
                    </td>
                    <td style={{ ...styles.td, fontSize: 10 }}>{l.by}</td>
                    <td style={{ ...styles.td, fontSize: 10, color: C.textHint }}>{l.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* 발주 관리 탭 */}
      {tab === "발주 관리" && (
        <>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button style={styles.btn("primary")}>+ 발주 등록</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 12 }}>
            {/* 발주 필요 목록 */}
            <div style={styles.card}>
              <div style={styles.cardTitle}>발주 필요 목록 <span style={{ ...styles.badge("red"), fontSize: 10 }}>{lowStock.length}건</span></div>
              {lowStock.map((p, i) => (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < lowStock.length - 1 ? `1px solid ${C.border}` : "none" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: C.text }}>{p.name}</div>
                    <div style={{ fontSize: 10, color: C.textHint }}>{p.opt} · 현재 {p.stock}개 / 최소 {p.min}개</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: p.stock === 0 ? C.red : C.amber }}>{p.stock === 0 ? "소진" : `${p.min - p.stock}개 부족`}</div>
                    <button style={{ ...styles.smBtn, marginTop: 3, color: C.amber }}>발주 등록</button>
                  </div>
                </div>
              ))}
            </div>

            {/* 진행 중 발주 */}
            <div style={styles.card}>
              <div style={styles.cardTitle}>진행 중 발주</div>
              {[
                { name: "프리미엄 후디 블랙/M", qty: 50, status: "배송 중", eta: "06/13", supplier: "A 공급사" },
                { name: "클래식 티셔츠 화이트/M", qty: 40, status: "발주 확인 중", eta: "06/15", supplier: "B 공급사" },
                { name: "캐주얼 스니커즈 화이트/260", qty: 30, status: "입고 예정", eta: "06/14", supplier: "C 공급사" },
              ].map((o, i) => (
                <div key={i} style={{ padding: "10px 0", borderBottom: i < 2 ? `1px solid ${C.border}` : "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 5 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: C.text }}>{o.name}</div>
                    <span style={styles.badge(o.status === "배송 중" ? "blue" : o.status === "입고 예정" ? "green" : "amber")}>{o.status}</span>
                  </div>
                  <div style={{ display: "flex", gap: 12, fontSize: 10, color: C.textHint }}>
                    <span>수량: {o.qty}개</span>
                    <span>예상 입고: {o.eta}</span>
                    <span>공급사: {o.supplier}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}

// ── 정산 관리 페이지 ─────────────────────────────────────────
function Settlement() {
  const [tab, setTab] = useState("월별 정산");
  const [selectedMonth, setSelectedMonth] = useState("2026-06");

  const monthlyData = [
    { month: "2026-06", sales: 28430000, fee: 2843000, vat: 284300, shipping: 1240000, net: 24062700, status: "정산 예정", date: "07/15" },
    { month: "2026-05", sales: 24200000, fee: 2420000, vat: 242000, shipping: 1080000, net: 20458000, status: "정산 완료", date: "06/15" },
    { month: "2026-04", sales: 26400000, fee: 2640000, vat: 264000, shipping: 1180000, net: 22316000, status: "정산 완료", date: "05/15" },
    { month: "2026-03", sales: 19800000, fee: 1980000, vat: 198000, shipping: 920000, net: 16702000, status: "정산 완료", date: "04/15" },
    { month: "2026-02", sales: 22100000, fee: 2210000, vat: 221000, shipping: 1020000, net: 18649000, status: "정산 완료", date: "03/15" },
    { month: "2026-01", sales: 18400000, fee: 1840000, vat: 184000, shipping: 860000, net: 15516000, status: "정산 완료", date: "02/15" },
  ];

  const feeDetails = [
    { category: "판매 수수료", rate: "10%", amount: 2843000, desc: "매출의 10% 기준" },
    { category: "결제 수수료", rate: "1.5%", amount: 426450, desc: "카드/간편결제 합산" },
    { category: "배송비 수수료", rate: "0.5%", amount: 142150, desc: "배송 처리 수수료" },
    { category: "마케팅 수수료", rate: "0.5%", amount: 142150, desc: "프로모션 참여 수수료" },
    { category: "부가가치세", rate: "10%", amount: 284300, desc: "수수료 합산 기준" },
  ];

  const paymentMethods = [
    { method: "신용카드", sales: 14820000, pct: 52, fee: 1.5 },
    { method: "카카오페이", sales: 6820000, pct: 24, fee: 1.2 },
    { method: "네이버페이", sales: 4260000, pct: 15, fee: 1.2 },
    { method: "무통장입금", sales: 1710000, pct: 6, fee: 0 },
    { method: "기타", sales: 820000, pct: 3, fee: 1.0 },
  ];

  const fmt = (n) => n >= 10000000 ? `${(n / 10000000).toFixed(1)}천만` : `${(n / 10000).toFixed(0)}만`;
  const selected = monthlyData.find(m => m.month === selectedMonth) || monthlyData[0];

  return (
    <>
      {/* KPI */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 10 }}>
        {[
          { label: "이번 달 매출", value: `₩${fmt(selected.sales)}`, sub: "결제 완료 기준", accent: C.green },
          { label: "정산 예정액", value: `₩${fmt(selected.net)}`, sub: `${selected.date} 정산`, accent: C.blue },
          { label: "총 수수료", value: `₩${fmt(selected.fee)}`, sub: `매출의 ${(selected.fee / selected.sales * 100).toFixed(1)}%`, accent: C.amber },
          { label: "누적 정산액", value: `₩${fmt(monthlyData.filter(m => m.status === "정산 완료").reduce((a, m) => a + m.net, 0))}`, sub: "올해 합산", accent: C.purple },
        ].map(k => (
          <div key={k.label} style={styles.kpiCard(k.accent)}>
            <div style={styles.kpiLabel}>{k.label}</div>
            <div style={{ ...styles.kpiValue, fontSize: 18 }}>{k.value}</div>
            <div style={styles.kpiSub}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* 정산 예정 배너 */}
      <div style={{ background: C.blueBg, border: `1px solid ${C.blue}`, borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 16 }}>💳</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.blueText }}>정산 예정 안내 — 2026년 6월 정산</div>
          <div style={{ fontSize: 11, color: C.blueText, marginTop: 2 }}>
            정산 예정일: <strong>2026년 7월 15일</strong> · 예정 금액: <strong>₩{selected.net.toLocaleString()}</strong>
          </div>
        </div>
        <button style={{ fontSize: 11, padding: "5px 12px", borderRadius: 8, border: `1px solid ${C.blue}`, background: "transparent", color: C.blueText, cursor: "pointer", fontWeight: 600 }}>상세 보기</button>
      </div>

      {/* 탭 */}
      <div style={{ display: "flex", borderBottom: `1px solid ${C.border}` }}>
        {["월별 정산", "수수료 내역", "결제수단별", "세금계산서"].map(t => (
          <div key={t} onClick={() => setTab(t)} style={{ fontSize: 12, padding: "8px 16px", cursor: "pointer", color: tab === t ? C.text : C.textHint, fontWeight: tab === t ? 700 : 400, borderBottom: tab === t ? `2px solid ${C.accent}` : "2px solid transparent", marginBottom: -1 }}>{t}</div>
        ))}
      </div>

      {/* 월별 정산 탭 */}
      {tab === "월별 정산" && (
        <>
          {/* 바 차트 */}
          <div style={styles.card}>
            <div style={styles.cardTitle}>월별 매출 / 정산액 추이</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 100, paddingBottom: 4 }}>
              {[...monthlyData].reverse().map((m, i) => {
                const maxVal = Math.max(...monthlyData.map(d => d.sales));
                return (
                  <div key={m.month} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, height: "100%", alignItems: "center" }}>
                    <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end", gap: 2 }}>
                      <div style={{ flex: 1, height: `${(m.sales / maxVal) * 100}%`, background: C.accent, borderRadius: "3px 3px 0 0", opacity: 0.8 }} />
                      <div style={{ flex: 1, height: `${(m.net / maxVal) * 100}%`, background: C.blue, borderRadius: "3px 3px 0 0", opacity: 0.6 }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex" }}>
              {[...monthlyData].reverse().map(m => (
                <div key={m.month} style={{ flex: 1, fontSize: 9, color: C.textHint, textAlign: "center" }}>{m.month.slice(5)}월</div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              {[["매출", C.accent], ["정산액", C.blue]].map(([label, color]) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: C.textSub }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />{label}
                </div>
              ))}
            </div>
          </div>

          {/* 정산 테이블 */}
          <div style={styles.tableWrap}>
            <table style={{ ...styles.table, tableLayout: "fixed" }}>
              <thead><tr>
                <th style={styles.th}>정산 월</th>
                <th style={{ ...styles.th, textAlign: "right" }}>매출</th>
                <th style={{ ...styles.th, textAlign: "right" }}>수수료</th>
                <th style={{ ...styles.th, textAlign: "right" }}>부가세</th>
                <th style={{ ...styles.th, textAlign: "right" }}>배송비</th>
                <th style={{ ...styles.th, textAlign: "right" }}>정산액</th>
                <th style={{ ...styles.th, textAlign: "center" }}>정산일</th>
                <th style={{ ...styles.th, textAlign: "center" }}>상태</th>
                <th style={{ ...styles.th, textAlign: "right" }}>관리</th>
              </tr></thead>
              <tbody>
                {monthlyData.map((m, i) => (
                  <tr key={m.month} onClick={() => setSelectedMonth(m.month)} style={{ cursor: "pointer", background: selectedMonth === m.month ? C.bg : C.surface }}>
                    <td style={{ ...styles.td, fontWeight: 600, color: C.text }}>{m.month.replace("-", "년 ")}월</td>
                    <td style={{ ...styles.td, textAlign: "right", fontWeight: 600, color: C.text }}>₩{m.sales.toLocaleString()}</td>
                    <td style={{ ...styles.td, textAlign: "right", color: C.red }}>-₩{m.fee.toLocaleString()}</td>
                    <td style={{ ...styles.td, textAlign: "right", color: C.red }}>-₩{m.vat.toLocaleString()}</td>
                    <td style={{ ...styles.td, textAlign: "right", color: C.red }}>-₩{m.shipping.toLocaleString()}</td>
                    <td style={{ ...styles.td, textAlign: "right", fontWeight: 700, color: C.green }}>₩{m.net.toLocaleString()}</td>
                    <td style={{ ...styles.td, textAlign: "center", fontSize: 10 }}>{m.date}</td>
                    <td style={{ ...styles.td, textAlign: "center" }}><span style={styles.badge(m.status === "정산 완료" ? "green" : "blue")}>{m.status}</span></td>
                    <td style={{ ...styles.td, textAlign: "right" }}>
                      <button style={styles.smBtn}>상세</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* 수수료 내역 탭 */}
      {tab === "수수료 내역" && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <select style={styles.select} value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
              {monthlyData.map(m => <option key={m.month} value={m.month}>{m.month.replace("-", "년 ")}월</option>)}
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1.4fr)", gap: 12 }}>
            {/* 수수료 요약 */}
            <div style={styles.card}>
              <div style={styles.cardTitle}>수수료 구성</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {feeDetails.map((f, i) => (
                  <div key={f.category} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < feeDetails.length - 1 ? `1px solid ${C.border}` : "none" }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 500, color: C.text }}>{f.category}</div>
                      <div style={{ fontSize: 10, color: C.textHint, marginTop: 2 }}>{f.desc}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.red }}>-₩{f.amount.toLocaleString()}</div>
                      <div style={{ fontSize: 10, color: C.textHint }}>{f.rate}</div>
                    </div>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0 0", borderTop: `2px solid ${C.border}`, marginTop: 4 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>총 차감액</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: C.red }}>-₩{feeDetails.reduce((a, f) => a + f.amount, 0).toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* 정산 계산서 */}
            <div style={styles.card}>
              <div style={styles.cardTitle}>{selectedMonth.replace("-", "년 ")}월 정산 계산서</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {[
                  { label: "총 매출", value: `₩${selected.sales.toLocaleString()}`, color: C.text, bold: false },
                  { label: "판매 수수료 차감", value: `-₩${selected.fee.toLocaleString()}`, color: C.red, bold: false },
                  { label: "부가가치세 차감", value: `-₩${selected.vat.toLocaleString()}`, color: C.red, bold: false },
                  { label: "배송비 차감", value: `-₩${selected.shipping.toLocaleString()}`, color: C.red, bold: false },
                ].map((r, i) => (
                  <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: `1px solid ${C.border}`, fontSize: 12 }}>
                    <span style={{ color: C.textSub }}>{r.label}</span>
                    <span style={{ fontWeight: 600, color: r.color }}>{r.value}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0 4px", fontSize: 15, fontWeight: 800, letterSpacing: "-0.3px" }}>
                  <span>최종 정산액</span>
                  <span style={{ color: C.green }}>₩{selected.net.toLocaleString()}</span>
                </div>
                <div style={{ fontSize: 11, color: C.textHint, marginBottom: 12 }}>정산 예정일: {selected.date} · {selected.status}</div>
                <button style={{ ...styles.btn(), justifyContent: "center", width: "100%" }}>📄 정산 명세서 다운로드</button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 결제수단별 탭 */}
      {tab === "결제수단별" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1.5fr)", gap: 12 }}>
            <div style={styles.card}>
              <div style={styles.cardTitle}>결제수단별 비중</div>
              {paymentMethods.map(p => (
                <div key={p.method} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                    <span style={{ fontWeight: 500, color: C.text }}>{p.method}</span>
                    <span style={{ color: C.textSub }}>{p.pct}%</span>
                  </div>
                  <div style={{ height: 6, background: C.bg, borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${p.pct}%`, background: C.accent, borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={styles.card}>
              <div style={styles.cardTitle}>결제수단별 상세</div>
              <table style={styles.table}>
                <thead><tr>
                  <th style={styles.th}>결제수단</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>매출</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>비중</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>수수료율</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>수수료</th>
                </tr></thead>
                <tbody>
                  {paymentMethods.map(p => (
                    <tr key={p.method}>
                      <td style={{ ...styles.td, fontWeight: 500, color: C.text }}>{p.method}</td>
                      <td style={{ ...styles.td, textAlign: "right" }}>₩{p.sales.toLocaleString()}</td>
                      <td style={{ ...styles.td, textAlign: "right" }}>{p.pct}%</td>
                      <td style={{ ...styles.td, textAlign: "right", color: C.textHint }}>{p.fee}%</td>
                      <td style={{ ...styles.td, textAlign: "right", color: C.red }}>-₩{(p.sales * p.fee / 100).toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr style={{ background: C.bg }}>
                    <td style={{ ...styles.td, fontWeight: 700, color: C.text }}>합계</td>
                    <td style={{ ...styles.td, textAlign: "right", fontWeight: 700, color: C.text }}>₩{paymentMethods.reduce((a, p) => a + p.sales, 0).toLocaleString()}</td>
                    <td style={{ ...styles.td, textAlign: "right", fontWeight: 700 }}>100%</td>
                    <td style={styles.td} />
                    <td style={{ ...styles.td, textAlign: "right", fontWeight: 700, color: C.red }}>-₩{paymentMethods.reduce((a, p) => a + p.sales * p.fee / 100, 0).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* 세금계산서 탭 */}
      {tab === "세금계산서" && (
        <>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button style={styles.btn("primary")}>+ 세금계산서 발행</button>
          </div>
          <div style={styles.tableWrap}>
            <table style={{ ...styles.table, tableLayout: "fixed" }}>
              <thead><tr>
                <th style={styles.th}>발행일</th>
                <th style={styles.th}>문서번호</th>
                <th style={styles.th}>공급받는자</th>
                <th style={{ ...styles.th, textAlign: "right" }}>공급가액</th>
                <th style={{ ...styles.th, textAlign: "right" }}>세액</th>
                <th style={{ ...styles.th, textAlign: "right" }}>합계</th>
                <th style={{ ...styles.th, textAlign: "center" }}>상태</th>
                <th style={{ ...styles.th, textAlign: "right" }}>관리</th>
              </tr></thead>
              <tbody>
                {[
                  { date: "2026-06-01", no: "2026-06-0001", to: "ShopAdmin 주식회사", supply: 2420000, tax: 242000, status: "발행 완료" },
                  { date: "2026-05-01", no: "2026-05-0001", to: "ShopAdmin 주식회사", supply: 2200000, tax: 220000, status: "발행 완료" },
                  { date: "2026-04-01", no: "2026-04-0001", to: "ShopAdmin 주식회사", supply: 2400000, tax: 240000, status: "발행 완료" },
                  { date: "2026-03-01", no: "2026-03-0001", to: "ShopAdmin 주식회사", supply: 1800000, tax: 180000, status: "발행 완료" },
                ].map((t, i) => (
                  <tr key={i}>
                    <td style={{ ...styles.td, fontSize: 10 }}>{t.date}</td>
                    <td style={{ ...styles.td, fontFamily: "monospace", fontSize: 10, color: C.blue }}>{t.no}</td>
                    <td style={{ ...styles.td, fontWeight: 500, color: C.text }}>{t.to}</td>
                    <td style={{ ...styles.td, textAlign: "right" }}>₩{t.supply.toLocaleString()}</td>
                    <td style={{ ...styles.td, textAlign: "right", color: C.red }}>₩{t.tax.toLocaleString()}</td>
                    <td style={{ ...styles.td, textAlign: "right", fontWeight: 700 }}>₩{(t.supply + t.tax).toLocaleString()}</td>
                    <td style={{ ...styles.td, textAlign: "center" }}><span style={styles.badge("green")}>{t.status}</span></td>
                    <td style={{ ...styles.td, textAlign: "right" }}>
                      <div style={{ display: "flex", gap: 3, justifyContent: "flex-end" }}>
                        <button style={styles.smBtn}>보기</button>
                        <button style={styles.smBtn}>↓</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}

// ── CS 고객문의 관리 페이지 ──────────────────────────────────
function CS() {
  const [tab, setTab] = useState("1:1 문의");
  const [selected, setSelected] = useState(0);
  const [reply, setReply] = useState("");
  const [faqOpen, setFaqOpen] = useState(null);

  const inquiries = [
    { id: "INQ-0284", name: "홍*동", type: "배송 문의", title: "주문한 상품이 아직 안 왔어요", date: "방금", status: "미답변", priority: "high",
      content: "6월 8일에 주문했는데 아직도 배송이 안 왔습니다. 배송 현황을 확인해주세요. 주문번호는 #000279입니다.",
      order: "#000279", history: [] },
    { id: "INQ-0283", name: "김*연", type: "상품 문의", title: "사이즈 교환 가능한가요?", date: "10분 전", status: "미답변", priority: "normal",
      content: "구매한 프리미엄 후디 M사이즈가 너무 커서 S사이즈로 교환하고 싶습니다. 교환 절차를 알려주세요.",
      order: "#000281", history: [] },
    { id: "INQ-0282", name: "이*준", type: "결제 문의", title: "결제가 두 번 된 것 같아요", date: "1시간 전", status: "답변 완료", priority: "high",
      content: "카드 내역을 보니 같은 금액이 두 번 결제된 것 같습니다. 확인 후 조치 부탁드립니다.",
      order: "#000280",
      history: [
        { role: "admin", text: "안녕하세요, 고객님. 불편을 드려 죄송합니다. 확인 결과 일시적인 오류로 중복 결제가 발생했습니다. 1-2 영업일 내 자동 취소 처리될 예정입니다.", time: "30분 전" }
      ] },
    { id: "INQ-0281", name: "박*서", type: "반품 문의", title: "불량품 받았습니다", date: "2시간 전", status: "처리 중", priority: "high",
      content: "받은 상품에 실밥이 풀려 있고 봉제 상태가 불량입니다. 환불 또는 교환을 원합니다.",
      order: "#000278",
      history: [
        { role: "admin", text: "고객님, 불편을 드려 대단히 죄송합니다. 반품 신청을 접수해드렸으며 수거 택배사에서 연락드릴 예정입니다.", time: "1시간 전" },
        { role: "customer", text: "언제쯤 수거 연락이 오나요?", time: "40분 전" }
      ] },
    { id: "INQ-0280", name: "최*민", type: "기타", title: "회원 탈퇴 방법이 궁금합니다", date: "어제", status: "답변 완료", priority: "normal",
      content: "회원 탈퇴를 하고 싶은데 방법을 모르겠습니다. 알려주세요.",
      order: null,
      history: [
        { role: "admin", text: "설정 > 계정 관리 > 회원 탈퇴 메뉴에서 진행하실 수 있습니다. 탈퇴 시 모든 데이터가 삭제되니 신중히 결정해주세요.", time: "어제" }
      ] },
  ];

  const faqs = [
    { id: 1, category: "배송", question: "배송은 얼마나 걸리나요?", answer: "일반 배송은 결제 완료 후 2-3 영업일 이내 출고되며, 출고 후 1-2일 내 수령 가능합니다. 도서 산간 지역은 추가 1-2일이 소요될 수 있습니다.", views: 1284, helpful: 342 },
    { id: 2, category: "교환/반품", question: "교환 및 반품 기간은 어떻게 되나요?", answer: "상품 수령 후 7일 이내 교환/반품 신청이 가능합니다. 단, 고객 단순 변심의 경우 왕복 배송비가 발생합니다. 상품 하자의 경우 무료 교환/반품이 가능합니다.", views: 986, helpful: 284 },
    { id: 3, category: "결제", question: "어떤 결제 수단을 사용할 수 있나요?", answer: "신용카드, 무통장입금, 카카오페이, 네이버페이, 토스페이를 지원합니다. 신용카드의 경우 최대 12개월 할부가 가능합니다.", views: 742, helpful: 198 },
    { id: 4, category: "회원", question: "적립 포인트는 어떻게 사용하나요?", answer: "결제 시 포인트 사용 란에서 원하는 금액을 입력하시면 됩니다. 최소 사용 금액은 1,000P이며 현금처럼 1:1로 사용 가능합니다.", views: 624, helpful: 156 },
    { id: 5, category: "배송", question: "묶음 배송이 가능한가요?", answer: "같은 날 결제한 주문에 한해 묶음 배송 신청이 가능합니다. 주문 완료 후 1시간 이내에 고객센터로 연락 주시면 처리해드립니다.", views: 412, helpful: 98 },
  ];

  const templates = [
    { label: "배송 지연 안내", text: "고객님, 현재 배송사 사정으로 인해 배송이 지연되고 있습니다. 불편을 드려 죄송하며 최대한 빠르게 배송될 수 있도록 조치하겠습니다." },
    { label: "교환/반품 안내", text: "고객님, 교환/반품 신청이 접수되었습니다. 수거 후 검수 완료 시 3-5 영업일 내 처리됩니다." },
    { label: "환불 처리 안내", text: "고객님, 환불 처리가 완료되었습니다. 카드사에 따라 영업일 기준 3-5일 내 취소 반영됩니다." },
    { label: "상품 문의 답변", text: "문의해주셔서 감사합니다. 해당 상품에 대해 안내드리겠습니다." },
  ];

  const statusColor = { "미답변": "red", "처리 중": "amber", "답변 완료": "green" };
  const priorityColor = { "high": C.red, "normal": C.textHint };
  const sel = inquiries[selected];

  return (
    <>
      {/* KPI */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 10 }}>
        {[
          { label: "전체 문의", value: `${inquiries.length}건`, sub: "이번 달", accent: C.blue },
          { label: "미답변", value: `${inquiries.filter(i => i.status === "미답변").length}건`, sub: "즉시 답변 필요", accent: C.red },
          { label: "처리 중", value: `${inquiries.filter(i => i.status === "처리 중").length}건`, sub: "진행 중", accent: C.amber },
          { label: "평균 답변 시간", value: "2.4시간", sub: "이번 달 기준", accent: C.green },
        ].map(k => (
          <div key={k.label} style={styles.kpiCard(k.accent)}>
            <div style={styles.kpiLabel}>{k.label}</div>
            <div style={{ ...styles.kpiValue, fontSize: 18 }}>{k.value}</div>
            <div style={styles.kpiSub}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* 탭 */}
      <div style={{ display: "flex", borderBottom: `1px solid ${C.border}` }}>
        {["1:1 문의", "FAQ 관리", "답변 템플릿"].map(t => (
          <div key={t} onClick={() => setTab(t)} style={{ fontSize: 12, padding: "8px 16px", cursor: "pointer", color: tab === t ? C.text : C.textHint, fontWeight: tab === t ? 700 : 400, borderBottom: tab === t ? `2px solid ${C.accent}` : "2px solid transparent", marginBottom: -1 }}>{t}</div>
        ))}
      </div>

      {/* 1:1 문의 탭 */}
      {tab === "1:1 문의" && (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1.6fr)", gap: 12 }}>
          {/* 문의 목록 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={styles.filterBar}>
              <div style={{ ...styles.searchBox, flex: 1 }}>🔍 문의 검색...</div>
              <select style={styles.select}><option>전체 유형</option><option>배송</option><option>교환/반품</option><option>결제</option><option>상품</option></select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 0, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
              {inquiries.map((inq, i) => (
                <div
                  key={inq.id}
                  onClick={() => setSelected(i)}
                  style={{ padding: "11px 13px", borderBottom: i < inquiries.length - 1 ? `1px solid ${C.border}` : "none", cursor: "pointer", background: selected === i ? C.bg : C.surface }}
                  onMouseEnter={e => { if (selected !== i) e.currentTarget.style.background = C.bg; }}
                  onMouseLeave={e => { if (selected !== i) e.currentTarget.style.background = C.surface; }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: priorityColor[inq.priority], flexShrink: 0 }} />
                    <span style={{ fontSize: 10, color: C.textHint, flex: 1 }}>{inq.id} · {inq.type}</span>
                    <span style={styles.badge(statusColor[inq.status])}>{inq.status}</span>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: C.text, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{inq.title}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.textHint }}>
                    <span>{inq.name}</span><span>{inq.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 문의 상세 + 답변 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={styles.card}>
              {/* 문의 헤더 */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{sel.title}</span>
                    <span style={styles.badge(statusColor[sel.status])}>{sel.status}</span>
                  </div>
                  <div style={{ fontSize: 10, color: C.textHint }}>{sel.id} · {sel.type} · {sel.name} · {sel.date}</div>
                  {sel.order && <div style={{ fontSize: 10, color: C.blue, marginTop: 2 }}>관련 주문: {sel.order}</div>}
                </div>
                <div style={{ display: "flex", gap: 5 }}>
                  <button style={styles.smBtn}>처리 완료</button>
                  <button style={{ ...styles.smBtn, color: C.red }}>삭제</button>
                </div>
              </div>

              {/* 대화 내역 */}
              <div style={{ background: C.bg, borderRadius: 8, padding: "12px", marginBottom: 10, display: "flex", flexDirection: "column", gap: 8, maxHeight: 200, overflowY: "auto" }}>
                {/* 고객 원문 */}
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <div style={{ maxWidth: "80%" }}>
                    <div style={{ fontSize: 10, color: C.textHint, textAlign: "right", marginBottom: 3 }}>{sel.name} · {sel.date}</div>
                    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "10px 10px 2px 10px", padding: "9px 11px", fontSize: 12, color: C.text, lineHeight: 1.6 }}>{sel.content}</div>
                  </div>
                </div>
                {/* 이전 대화 */}
                {sel.history.map((h, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, justifyContent: h.role === "admin" ? "flex-start" : "flex-end" }}>
                    {h.role === "admin" && (
                      <div style={{ width: 24, height: 24, borderRadius: "50%", background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", fontWeight: 700, flexShrink: 0 }}>관</div>
                    )}
                    <div style={{ maxWidth: "80%" }}>
                      <div style={{ fontSize: 10, color: C.textHint, marginBottom: 3, textAlign: h.role === "admin" ? "left" : "right" }}>{h.role === "admin" ? "관리자" : sel.name} · {h.time}</div>
                      <div style={{ background: h.role === "admin" ? C.accent : C.surface, border: h.role === "admin" ? "none" : `1px solid ${C.border}`, borderRadius: h.role === "admin" ? "10px 10px 10px 2px" : "10px 10px 2px 10px", padding: "9px 11px", fontSize: 12, color: h.role === "admin" ? "#fff" : C.text, lineHeight: 1.6 }}>{h.text}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 답변 입력 */}
              {sel.status !== "답변 완료" && (
                <>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 7 }}>
                    {templates.map(t => (
                      <button key={t.label} onClick={() => setReply(t.text)} style={{ fontSize: 10, padding: "3px 9px", borderRadius: 20, border: `1px solid ${C.border}`, background: C.surface, color: C.textSub, cursor: "pointer" }}>{t.label}</button>
                    ))}
                  </div>
                  <textarea
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    placeholder="답변을 입력하세요..."
                    style={{ width: "100%", height: 80, borderRadius: 8, border: `1px solid ${C.border}`, padding: "8px 10px", fontSize: 12, color: C.text, resize: "none", outline: "none", background: C.surface, marginBottom: 8, boxSizing: "border-box" }}
                  />
                  <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                    <button style={styles.btn()}>임시저장</button>
                    <button style={styles.btn("primary")} onClick={() => setReply("")}>답변 등록</button>
                  </div>
                </>
              )}
              {sel.status === "답변 완료" && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 10px", background: C.greenBg, borderRadius: 8, fontSize: 11, color: C.greenText }}>
                  ✓ 답변이 완료된 문의입니다.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FAQ 관리 탭 */}
      {tab === "FAQ 관리" && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ ...styles.searchBox, flex: 1 }}>🔍 FAQ 검색...</div>
            <select style={styles.select}><option>전체 카테고리</option><option>배송</option><option>교환/반품</option><option>결제</option><option>회원</option></select>
            <button style={styles.btn("primary")}>+ FAQ 추가</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {faqs.map(faq => (
              <div key={faq.id} style={{ ...styles.card, padding: "0" }}>
                <div
                  onClick={() => setFaqOpen(faqOpen === faq.id ? null : faq.id)}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", cursor: "pointer" }}
                >
                  <span style={styles.badge("blue")}>{faq.category}</span>
                  <span style={{ flex: 1, fontSize: 12, fontWeight: 500, color: C.text }}>{faq.question}</span>
                  <div style={{ display: "flex", gap: 12, fontSize: 10, color: C.textHint }}>
                    <span>👀 {faq.views.toLocaleString()}</span>
                    <span>👍 {faq.helpful}</span>
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button style={styles.smBtn} onClick={e => e.stopPropagation()}>수정</button>
                    <button style={{ ...styles.smBtn, color: C.red }} onClick={e => e.stopPropagation()}>삭제</button>
                  </div>
                  <span style={{ fontSize: 12, color: C.textHint }}>{faqOpen === faq.id ? "▲" : "▼"}</span>
                </div>
                {faqOpen === faq.id && (
                  <div style={{ padding: "0 14px 12px", fontSize: 12, color: C.textSub, lineHeight: 1.7, borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* 답변 템플릿 탭 */}
      {tab === "답변 템플릿" && (
        <>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button style={styles.btn("primary")}>+ 템플릿 추가</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 10 }}>
            {[
              ...templates,
              { label: "사과 및 보상 안내", text: "고객님, 불편을 드려 대단히 죄송합니다. 재발 방지를 위해 최선을 다하겠습니다. 보상으로 할인 쿠폰을 발급해드리겠습니다." },
              { label: "주문 취소 안내", text: "고객님의 주문 취소 요청을 접수했습니다. 취소 처리 완료 후 결제 수단으로 3-5 영업일 내 환불됩니다." },
            ].map((t, i) => (
              <div key={i} style={styles.card}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{t.label}</span>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button style={styles.smBtn}>수정</button>
                    <button style={{ ...styles.smBtn, color: C.red }}>삭제</button>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: C.textSub, lineHeight: 1.6, background: C.bg, borderRadius: 7, padding: "8px 10px" }}>{t.text}</div>
                <button
                  onClick={() => { setTab("1:1 문의"); setReply(t.text); }}
                  style={{ ...styles.smBtn, marginTop: 8, width: "100%", textAlign: "center" }}
                >이 템플릿 사용</button>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}

// ── 관리자 권한 관리 페이지 ──────────────────────────────────
function Permissions() {
  const [tab, setTab] = useState("관리자 계정");
  const [selectedRole, setSelectedRole] = useState("superadmin");
  const [inviteOpen, setInviteOpen] = useState(false);

  const admins = [
    { id: 1, name: "김슈퍼", email: "super@shopadmin.com", role: "superadmin", roleLabel: "슈퍼 어드민", lastLogin: "방금", status: "활성", avatar: "김" },
    { id: 2, name: "이운영", email: "ops@shopadmin.com", role: "manager", roleLabel: "운영 매니저", lastLogin: "1시간 전", status: "활성", avatar: "이" },
    { id: 3, name: "박마케팅", email: "mkt@shopadmin.com", role: "marketer", roleLabel: "마케터", lastLogin: "3시간 전", status: "활성", avatar: "박" },
    { id: 4, name: "최CS", email: "cs@shopadmin.com", role: "cs", roleLabel: "CS 담당자", lastLogin: "어제", status: "활성", avatar: "최" },
    { id: 5, name: "정물류", email: "logistics@shopadmin.com", role: "logistics", roleLabel: "물류 담당자", lastLogin: "2일 전", status: "활성", avatar: "정" },
    { id: 6, name: "한임시", email: "temp@shopadmin.com", role: "viewer", roleLabel: "뷰어", lastLogin: "1주 전", status: "비활성", avatar: "한" },
  ];

  const roles = [
    { id: "superadmin", label: "슈퍼 어드민", desc: "모든 기능에 대한 전체 접근 권한", color: C.purple, count: 1 },
    { id: "manager", label: "운영 매니저", desc: "대시보드, 주문, 상품, 고객 관리", color: C.blue, count: 1 },
    { id: "marketer", label: "마케터", desc: "프로모션, 쿠폰, 리뷰 관리", color: C.green, count: 1 },
    { id: "cs", label: "CS 담당자", desc: "고객문의, 주문 조회 권한", color: C.amber, count: 1 },
    { id: "logistics", label: "물류 담당자", desc: "배송, 재고 관리 권한", color: C.accent, count: 1 },
    { id: "viewer", label: "뷰어", desc: "대시보드, 통계 조회만 가능", color: C.textHint, count: 1 },
  ];

  const menus = [
    { id: "dashboard", label: "대시보드" },
    { id: "analytics", label: "매출 분석" },
    { id: "orders", label: "주문 관리" },
    { id: "shipping", label: "배송 현황" },
    { id: "products", label: "상품 등록" },
    { id: "inventory", label: "재고 관리" },
    { id: "customers", label: "고객 프로필" },
    { id: "promotions", label: "프로모션·쿠폰" },
    { id: "reviews", label: "리뷰·평점" },
    { id: "cs", label: "CS 고객문의" },
    { id: "settlement", label: "정산 관리" },
    { id: "checkout", label: "결제 페이지" },
    { id: "permissions", label: "권한 관리" },
  ];

  const permissions = {
    superadmin: { view: menus.map(m => m.id), edit: menus.map(m => m.id), delete: menus.map(m => m.id) },
    manager: { view: ["dashboard","analytics","orders","shipping","products","inventory","customers","reviews","cs"], edit: ["orders","shipping","products","inventory","customers"], delete: ["orders"] },
    marketer: { view: ["dashboard","analytics","promotions","reviews","cs"], edit: ["promotions","reviews"], delete: [] },
    cs: { view: ["dashboard","orders","customers","cs"], edit: ["cs","orders"], delete: [] },
    logistics: { view: ["dashboard","orders","shipping","inventory"], edit: ["shipping","inventory"], delete: [] },
    viewer: { view: ["dashboard","analytics"], edit: [], delete: [] },
  };

  const roleColors = { superadmin: C.purple, manager: C.blue, marketer: C.green, cs: C.amber, logistics: C.accent, viewer: C.textHint };
  const roleLabels = { superadmin: "슈퍼 어드민", manager: "운영 매니저", marketer: "마케터", cs: "CS 담당자", logistics: "물류 담당자", viewer: "뷰어" };
  const perm = permissions[selectedRole];

  const hasView = (id) => perm.view.includes(id);
  const hasEdit = (id) => perm.edit.includes(id);
  const hasDel = (id) => perm.delete.includes(id);

  return (
    <>
      {/* KPI */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 10 }}>
        {[
          { label: "전체 관리자", value: `${admins.length}명`, sub: "등록된 계정", accent: C.blue },
          { label: "활성 계정", value: `${admins.filter(a => a.status === "활성").length}명`, sub: "현재 활성", accent: C.green },
          { label: "역할 종류", value: `${roles.length}개`, sub: "설정된 역할", accent: C.purple },
          { label: "비활성 계정", value: `${admins.filter(a => a.status === "비활성").length}명`, sub: "접근 제한됨", accent: C.textHint },
        ].map(k => (
          <div key={k.label} style={styles.kpiCard(k.accent)}>
            <div style={styles.kpiLabel}>{k.label}</div>
            <div style={{ ...styles.kpiValue, fontSize: 18 }}>{k.value}</div>
            <div style={styles.kpiSub}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* 탭 */}
      <div style={{ display: "flex", borderBottom: `1px solid ${C.border}` }}>
        {["관리자 계정", "역할별 권한", "접근 로그"].map(t => (
          <div key={t} onClick={() => setTab(t)} style={{ fontSize: 12, padding: "8px 16px", cursor: "pointer", color: tab === t ? C.text : C.textHint, fontWeight: tab === t ? 700 : 400, borderBottom: tab === t ? `2px solid ${C.accent}` : "2px solid transparent", marginBottom: -1 }}>{t}</div>
        ))}
      </div>

      {/* 관리자 계정 탭 */}
      {tab === "관리자 계정" && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ ...styles.searchBox, flex: 1 }}>🔍 이름·이메일 검색...</div>
            <select style={styles.select}><option>역할 전체</option>{roles.map(r => <option key={r.id}>{r.label}</option>)}</select>
            <button style={styles.btn("primary")} onClick={() => setInviteOpen(true)}>+ 관리자 초대</button>
          </div>

          {/* 초대 모달 */}
          {inviteOpen && (
            <div onClick={() => setInviteOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
              <div onClick={e => e.stopPropagation()} style={{ background: C.surface, borderRadius: 14, width: 400, padding: 24, boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>관리자 초대</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 500, color: C.textSub, marginBottom: 4 }}>이메일 *</div>
                    <input style={{ ...styles.input, height: 36 }} placeholder="초대할 이메일 주소" />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 500, color: C.textSub, marginBottom: 4 }}>역할 *</div>
                    <select style={{ ...styles.input, height: 36 }}>
                      {roles.map(r => <option key={r.id}>{r.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 500, color: C.textSub, marginBottom: 4 }}>메모</div>
                    <input style={{ ...styles.input, height: 36 }} placeholder="초대 메모 (선택)" />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
                  <button onClick={() => setInviteOpen(false)} style={styles.btn()}>취소</button>
                  <button onClick={() => setInviteOpen(false)} style={styles.btn("primary")}>초대 메일 발송</button>
                </div>
              </div>
            </div>
          )}

          <div style={styles.tableWrap}>
            <table style={{ ...styles.table, tableLayout: "fixed" }}>
              <thead><tr>
                <th style={styles.th}>관리자</th>
                <th style={styles.th}>이메일</th>
                <th style={{ ...styles.th, width: 100 }}>역할</th>
                <th style={{ ...styles.th, width: 90 }}>마지막 접속</th>
                <th style={{ ...styles.th, width: 70, textAlign: "center" }}>상태</th>
                <th style={{ ...styles.th, width: 100, textAlign: "right" }}>관리</th>
              </tr></thead>
              <tbody>
                {admins.map(admin => (
                  <tr key={admin.id}>
                    <td style={styles.td}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: roleColors[admin.role], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{admin.avatar}</div>
                        <span style={{ fontWeight: 500, color: C.text }}>{admin.name}</span>
                      </div>
                    </td>
                    <td style={{ ...styles.td, fontSize: 11 }}>{admin.email}</td>
                    <td style={styles.td}>
                      <span style={{ ...styles.badge("gray"), background: `${roleColors[admin.role]}20`, color: roleColors[admin.role] }}>{admin.roleLabel}</span>
                    </td>
                    <td style={{ ...styles.td, fontSize: 10, color: C.textHint }}>{admin.lastLogin}</td>
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      <span style={styles.badge(admin.status === "활성" ? "green" : "gray")}>{admin.status}</span>
                    </td>
                    <td style={{ ...styles.td, textAlign: "right" }}>
                      <div style={{ display: "flex", gap: 3, justifyContent: "flex-end" }}>
                        <button style={styles.smBtn}>수정</button>
                        <button style={styles.smBtn}>역할 변경</button>
                        {admin.role !== "superadmin" && <button style={{ ...styles.smBtn, color: C.red }}>비활성</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* 역할별 권한 탭 */}
      {tab === "역할별 권한" && (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,2.5fr)", gap: 12 }}>
          {/* 역할 목록 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {roles.map(role => (
              <div
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                style={{ ...styles.card, cursor: "pointer", borderLeft: `3px solid ${selectedRole === role.id ? role.color : "transparent"}`, background: selectedRole === role.id ? C.bg : C.surface, padding: "11px 13px" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: role.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{role.label}</span>
                  <span style={{ marginLeft: "auto", fontSize: 10, color: C.textHint }}>{role.count}명</span>
                </div>
                <div style={{ fontSize: 11, color: C.textSub, paddingLeft: 16 }}>{role.desc}</div>
              </div>
            ))}
            <button style={{ ...styles.btn("primary"), justifyContent: "center" }}>+ 역할 추가</button>
          </div>

          {/* 권한 테이블 */}
          <div style={styles.card}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{roleLabels[selectedRole]} 권한 설정</div>
                <div style={{ fontSize: 11, color: C.textHint, marginTop: 2 }}>{roles.find(r => r.id === selectedRole)?.desc}</div>
              </div>
              {selectedRole !== "superadmin" && <button style={styles.btn("primary")}>권한 저장</button>}
            </div>
            <table style={{ ...styles.table, tableLayout: "fixed" }}>
              <thead><tr>
                <th style={styles.th}>메뉴</th>
                <th style={{ ...styles.th, width: 70, textAlign: "center" }}>조회</th>
                <th style={{ ...styles.th, width: 70, textAlign: "center" }}>편집</th>
                <th style={{ ...styles.th, width: 70, textAlign: "center" }}>삭제</th>
              </tr></thead>
              <tbody>
                {menus.map(menu => (
                  <tr key={menu.id}>
                    <td style={{ ...styles.td, fontWeight: 500, color: C.text }}>{menu.label}</td>
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      <div style={{ width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${hasView(menu.id) ? C.green : C.border}`, background: hasView(menu.id) ? C.greenBg : "transparent", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", cursor: selectedRole !== "superadmin" ? "pointer" : "default" }}>
                        {hasView(menu.id) && <span style={{ fontSize: 10, color: C.green, fontWeight: 700 }}>✓</span>}
                      </div>
                    </td>
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      <div style={{ width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${hasEdit(menu.id) ? C.blue : C.border}`, background: hasEdit(menu.id) ? C.blueBg : "transparent", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", cursor: selectedRole !== "superadmin" ? "pointer" : "default" }}>
                        {hasEdit(menu.id) && <span style={{ fontSize: 10, color: C.blue, fontWeight: 700 }}>✓</span>}
                      </div>
                    </td>
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      <div style={{ width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${hasDel(menu.id) ? C.red : C.border}`, background: hasDel(menu.id) ? C.redBg : "transparent", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", cursor: selectedRole !== "superadmin" ? "pointer" : "default" }}>
                        {hasDel(menu.id) && <span style={{ fontSize: 10, color: C.red, fontWeight: 700 }}>✓</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 접근 로그 탭 */}
      {tab === "접근 로그" && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ ...styles.searchBox, flex: 1 }}>🔍 관리자·액션 검색...</div>
            <select style={styles.select}><option>전체 관리자</option>{admins.map(a => <option key={a.id}>{a.name}</option>)}</select>
            <div style={{ ...styles.searchBox, width: 160, flex: "none" }}>📅 날짜 범위</div>
            <button style={styles.btn()} onClick={() => downloadCSV("접근로그",
  ["일시", "관리자", "역할", "액션", "대상", "IP", "결과"],
  [
    ["06/11 14:32", "김슈퍼", "슈퍼 어드민", "관리자 계정 비활성화", "한임시", "192.168.1.1", "성공"],
    ["06/11 13:15", "이운영", "운영 매니저", "주문 상태 변경", "#000284", "192.168.1.2", "성공"],
    ["06/11 12:40", "박마케팅", "마케터", "프로모션 생성", "여름 세일", "192.168.1.3", "성공"],
    ["06/11 11:20", "최CS", "CS 담당자", "고객문의 답변", "INQ-0282", "192.168.1.4", "성공"],
    ["06/11 10:05", "정물류", "물류 담당자", "재고 수정 시도", "결제 메뉴", "192.168.1.5", "거부"],
    ["06/11 09:30", "김슈퍼", "슈퍼 어드민", "역할 권한 수정", "마케터", "192.168.1.1", "성공"],
    ["06/10 18:22", "이운영", "운영 매니저", "상품 가격 수정", "SKU-001", "192.168.1.2", "성공"],
    ["06/10 16:45", "한임시", "뷰어", "정산 메뉴 접근 시도", "정산 관리", "192.168.1.6", "거부"],
  ]
)}>↓ CSV 내보내기</button>
          </div>
          <div style={styles.tableWrap}>
            <table style={{ ...styles.table, tableLayout: "fixed" }}>
              <thead><tr>
                <th style={{ ...styles.th, width: 100 }}>일시</th>
                <th style={{ ...styles.th, width: 90 }}>관리자</th>
                <th style={{ ...styles.th, width: 80 }}>역할</th>
                <th style={styles.th}>액션</th>
                <th style={{ ...styles.th, width: 80 }}>대상</th>
                <th style={{ ...styles.th, width: 90 }}>IP 주소</th>
                <th style={{ ...styles.th, width: 60, textAlign: "center" }}>결과</th>
              </tr></thead>
              <tbody>
                {[
                  { time: "06/11 14:32", admin: "김슈퍼", role: "슈퍼 어드민", action: "관리자 계정 비활성화", target: "한임시", ip: "192.168.1.1", result: "성공" },
                  { time: "06/11 13:15", admin: "이운영", role: "운영 매니저", action: "주문 상태 변경", target: "#000284", ip: "192.168.1.2", result: "성공" },
                  { time: "06/11 12:40", admin: "박마케팅", role: "마케터", action: "프로모션 생성", target: "여름 세일", ip: "192.168.1.3", result: "성공" },
                  { time: "06/11 11:20", admin: "최CS", role: "CS 담당자", action: "고객문의 답변", target: "INQ-0282", ip: "192.168.1.4", result: "성공" },
                  { time: "06/11 10:05", admin: "정물류", role: "물류 담당자", action: "재고 수정 시도", target: "결제 메뉴", ip: "192.168.1.5", result: "거부" },
                  { time: "06/11 09:30", admin: "김슈퍼", role: "슈퍼 어드민", action: "역할 권한 수정", target: "마케터", ip: "192.168.1.1", result: "성공" },
                  { time: "06/10 18:22", admin: "이운영", role: "운영 매니저", action: "상품 가격 수정", target: "SKU-001", ip: "192.168.1.2", result: "성공" },
                  { time: "06/10 16:45", admin: "한임시", role: "뷰어", action: "정산 메뉴 접근 시도", target: "정산 관리", ip: "192.168.1.6", result: "거부" },
                ].map((log, i) => (
                  <tr key={i} style={{ background: log.result === "거부" ? C.redBg : C.surface }}>
                    <td style={{ ...styles.td, fontSize: 10, color: C.textHint }}>{log.time}</td>
                    <td style={{ ...styles.td, fontWeight: 500, color: C.text }}>{log.admin}</td>
                    <td style={styles.td}>
                      <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 10, fontWeight: 600, background: `${roleColors[admins.find(a => a.name === log.admin)?.role]}20`, color: roleColors[admins.find(a => a.name === log.admin)?.role] }}>{log.role}</span>
                    </td>
                    <td style={{ ...styles.td, fontSize: 11 }}>{log.action}</td>
                    <td style={{ ...styles.td, fontSize: 10, color: C.textHint }}>{log.target}</td>
                    <td style={{ ...styles.td, fontSize: 10, fontFamily: "monospace", color: C.textHint }}>{log.ip}</td>
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      <span style={styles.badge(log.result === "성공" ? "green" : "red")}>{log.result}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}

// ── 상품 목록 페이지 ─────────────────────────────────────────
function ProductList({ onNavigate }) {
  const [filter, setFilter] = useState("전체");
  const [sort, setSort] = useState("최신순");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
const [editOpen, setEditOpen] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(null);
  const [bulkPriceOpen, setBulkPriceOpen] = useState(false);
  const [bulkCat, setBulkCat] = useState("전체");
  const [bulkType, setBulkType] = useState("discount");
  const [bulkValue, setBulkValue] = useState("");
  const [bulkPreview, setBulkPreview] = useState(false);
  const [viewMode, setViewMode] = useState("table");

  const [products, setProducts] = useState([
    { id: 1, name: "프리미엄 후디", cat: "의류", price: 89000, stock: 4, status: "판매중", sales: 284, rating: 4.8, reviews: 142, thumb: "🧥", skus: 4, created: "2026-01-15" },
    { id: 2, name: "클래식 티셔츠", cat: "의류", price: 39000, stock: 0, status: "품절", sales: 198, rating: 4.6, reviews: 98, thumb: "👕", skus: 3, created: "2026-02-10" },
    { id: 3, name: "데님 팬츠", cat: "하의", price: 79000, stock: 24, status: "판매중", sales: 156, rating: 4.7, reviews: 76, thumb: "👖", skus: 6, created: "2026-02-20" },
    { id: 4, name: "캐주얼 스니커즈", cat: "신발", price: 89000, stock: 50, status: "판매중", sales: 124, rating: 4.5, reviews: 64, thumb: "👟", skus: 8, created: "2026-03-05" },
    { id: 5, name: "레더 토트백", cat: "가방", price: 128000, stock: 15, status: "판매중", sales: 98, rating: 4.9, reviews: 52, thumb: "👜", skus: 2, created: "2026-03-12" },
    { id: 6, name: "캐시미어 머플러", cat: "악세서리", price: 48000, stock: 62, status: "판매중", sales: 84, rating: 4.4, reviews: 38, thumb: "🧣", skus: 3, created: "2026-03-20" },
    { id: 7, name: "오버핏 티셔츠", cat: "의류", price: 45000, stock: 5, status: "판매중", sales: 72, rating: 4.3, reviews: 28, thumb: "👕", skus: 4, created: "2026-04-01" },
    { id: 8, name: "슬랙스", cat: "하의", price: 68000, stock: 18, status: "판매중", sales: 64, rating: 4.6, reviews: 32, thumb: "👖", skus: 5, created: "2026-04-10" },
    { id: 9, name: "미니 크로스백", cat: "가방", price: 78000, stock: 0, status: "판매중단", sales: 48, rating: 4.2, reviews: 18, thumb: "👜", skus: 2, created: "2026-04-15" },
    { id: 10, name: "울 베레모", cat: "악세서리", price: 38000, stock: 34, status: "판매중", sales: 42, rating: 4.5, reviews: 22, thumb: "🎩", skus: 2, created: "2026-05-01" },
    { id: 11, name: "롱 코트", cat: "의류", price: 228000, stock: 8, status: "판매중", sales: 38, rating: 4.8, reviews: 16, thumb: "🧥", skus: 3, created: "2026-05-10" },
    { id: 12, name: "런닝화", cat: "신발", price: 98000, stock: 0, status: "품절", sales: 32, rating: 4.4, reviews: 14, thumb: "👟", skus: 6, created: "2026-05-20" },
  ]);

  const cats = ["전체", "의류", "하의", "신발", "가방", "악세서리"];
  const statusColor = { "판매중": "green", "품절": "red", "판매중단": "gray" };

  const filtered = products
    .filter(p => {
      const matchCat = filter === "전체" || p.cat === filter;
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (sort === "최신순") return new Date(b.created) - new Date(a.created);
      if (sort === "판매순") return b.sales - a.sales;
      if (sort === "가격높은순") return b.price - a.price;
      if (sort === "가격낮은순") return a.price - b.price;
      if (sort === "평점순") return b.rating - a.rating;
      return 0;
    });

  const toggleSelect = (id) => setSelected(s => s.includes(id) ? s.filter(i => i !== id) : [...s, id]);
  const toggleAll = () => setSelected(selected.length === filtered.length ? [] : filtered.map(p => p.id));
  const deleteProduct = (id) => { setProducts(ps => ps.filter(p => p.id !== id)); setDeleteOpen(null); };
  const bulkDelete = () => { setProducts(ps => ps.filter(p => !selected.includes(p.id))); setSelected([]); };

  return (
    <>
      {/* KPI */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 10 }}>
        {[
          { label: "전체 상품", value: `${products.length}개`, sub: "등록된 상품", accent: C.blue },
          { label: "판매 중", value: `${products.filter(p => p.status === "판매중").length}개`, sub: "현재 판매 중", accent: C.green },
          { label: "품절 상품", value: `${products.filter(p => p.stock === 0).length}개`, sub: "재고 0개", accent: C.red },
          { label: "총 판매량", value: `${products.reduce((a, p) => a + p.sales, 0).toLocaleString()}개`, sub: "누적 판매", accent: C.purple },
        ].map(k => (
          <div key={k.label} style={styles.kpiCard(k.accent)}>
            <div style={styles.kpiLabel}>{k.label}</div>
            <div style={{ ...styles.kpiValue, fontSize: 18 }}>{k.value}</div>
            <div style={styles.kpiSub}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* 필터 바 */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <div style={{ ...styles.searchBox, flex: 1, minWidth: 160 }}>
          🔍
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="상품명 검색..."
            style={{ flex: 1, border: "none", outline: "none", fontSize: 11, color: C.text, background: "transparent" }}
          />
        </div>
        <div style={{ display: "flex", gap: 5 }}>
          {cats.map(c => <div key={c} onClick={() => setFilter(c)} style={styles.filterChip(filter === c)}>{c}</div>)}
        </div>
        <select style={styles.select} value={sort} onChange={e => setSort(e.target.value)}>
          <option>최신순</option><option>판매순</option><option>가격높은순</option><option>가격낮은순</option><option>평점순</option>
        </select>
        <div style={{ display: "flex", gap: 4 }}>
          <div onClick={() => setViewMode("table")} style={{ ...styles.smBtn, background: viewMode === "table" ? C.bg : C.surface, borderColor: viewMode === "table" ? C.borderMid : C.border }}>☰</div>
          <div onClick={() => setViewMode("grid")} style={{ ...styles.smBtn, background: viewMode === "grid" ? C.bg : C.surface, borderColor: viewMode === "grid" ? C.borderMid : C.border }}>⊞</div>
        </div>
<button style={styles.btn()} onClick={() => exportProducts(products)}>↓ CSV 내보내기</button>
        <button style={styles.btn()} onClick={() => setBulkPriceOpen(true)}>💰 일괄 가격 수정</button>
        <button style={styles.btn("primary")} onClick={() => onNavigate("products")}>+ 상품 등록</button>
      </div>

      {/* 일괄 처리 바 */}
      {selected.length > 0 && (
        <div style={{ ...styles.card, padding: "8px 12px", display: "flex", alignItems: "center", gap: 8, fontSize: 11, background: C.blueBg, border: `1px solid ${C.blue}` }}>
          <span style={{ color: C.blueText, fontWeight: 600 }}>{selected.length}개 선택됨</span>
          <span style={{ flex: 1 }} />
          <button style={styles.smBtn}>판매 중으로 변경</button>
          <button style={styles.smBtn}>판매 중단</button>
          <button style={{ ...styles.smBtn, color: C.red }} onClick={bulkDelete}>선택 삭제</button>
          <button style={{ ...styles.smBtn }} onClick={() => setSelected([])}>선택 해제</button>
        </div>
      )}

      {/* 테이블 뷰 */}
      {viewMode === "table" && (
        <div style={styles.tableWrap}>
          <table style={{ ...styles.table, tableLayout: "fixed" }}>
            <thead><tr>
              <th style={{ ...styles.th, width: 32 }}>
                <input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleAll} style={{ width: 13, height: 13, accentColor: C.accent }} />
              </th>
              <th style={styles.th}>상품명</th>
              <th style={{ ...styles.th, width: 60 }}>카테고리</th>
              <th style={{ ...styles.th, width: 50 }}>SKU</th>
              <th style={{ ...styles.th, width: 80, textAlign: "right" }}>판매가</th>
              <th style={{ ...styles.th, width: 55, textAlign: "right" }}>재고</th>
              <th style={{ ...styles.th, width: 55, textAlign: "right" }}>판매량</th>
              <th style={{ ...styles.th, width: 55, textAlign: "center" }}>평점</th>
              <th style={{ ...styles.th, width: 65, textAlign: "center" }}>상태</th>
              <th style={{ ...styles.th, width: 90, textAlign: "right" }}>관리</th>
            </tr></thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} style={{ background: selected.includes(p.id) ? C.blueBg : C.surface }}>
                  <td style={styles.td}>
                    <input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggleSelect(p.id)} style={{ width: 13, height: 13, accentColor: C.accent }} />
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 7, background: C.bg, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{p.thumb}</div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 500, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                        <div style={{ fontSize: 10, color: C.textHint }}>{p.created}</div>
                      </div>
                    </div>
                  </td>
                  <td style={styles.td}>{p.cat}</td>
                  <td style={{ ...styles.td, textAlign: "center", fontSize: 10, color: C.textHint }}>{p.skus}개</td>
                  <td style={{ ...styles.td, textAlign: "right", fontWeight: 600, color: C.text }}>₩{p.price.toLocaleString()}</td>
                  <td style={{ ...styles.td, textAlign: "right", fontWeight: 600, color: p.stock === 0 ? C.red : p.stock < 10 ? C.amber : C.text }}>{p.stock}개</td>
                  <td style={{ ...styles.td, textAlign: "right" }}>{p.sales}개</td>
                  <td style={{ ...styles.td, textAlign: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
                      <span style={{ color: C.amber, fontSize: 11 }}>★</span>
                      <span style={{ fontSize: 11, fontWeight: 500 }}>{p.rating}</span>
                    </div>
                  </td>
                  <td style={{ ...styles.td, textAlign: "center" }}><span style={styles.badge(statusColor[p.status])}>{p.status}</span></td>
                  <td style={{ ...styles.td, textAlign: "right" }}>
                    <div style={{ display: "flex", gap: 3, justifyContent: "flex-end" }}>
                      <button style={styles.smBtn} onClick={() => setEditOpen(p)}>수정</button>
                      <button style={{ ...styles.smBtn, color: C.red }} onClick={() => setDeleteOpen(p)}>삭제</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={styles.pagination}>
            <span style={{ fontSize: 11, color: C.textHint }}>총 {filtered.length}개 상품</span>
            <div style={{ display: "flex", gap: 4 }}>
              {["‹", "1", "2", "›"].map((p, i) => <div key={i} style={styles.pageBtn(p === "1")}>{p}</div>)}
            </div>
          </div>
        </div>
      )}

      {/* 그리드 뷰 */}
      {viewMode === "grid" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 10 }}>
          {filtered.map(p => (
            <div key={p.id} style={{ ...styles.card, padding: "12px", position: "relative" }}>
              <input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggleSelect(p.id)} style={{ position: "absolute", top: 10, left: 10, width: 13, height: 13, accentColor: C.accent }} />
              <div style={{ width: "100%", height: 80, borderRadius: 8, background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, marginBottom: 8, border: `1px solid ${C.border}` }}>{p.thumb}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
              <div style={{ fontSize: 10, color: C.textHint, marginBottom: 5 }}>{p.cat}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>₩{p.price.toLocaleString()}</span>
                <span style={styles.badge(statusColor[p.status])}>{p.status}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.textHint, marginBottom: 8 }}>
                <span>재고 <strong style={{ color: p.stock === 0 ? C.red : C.text }}>{p.stock}개</strong></span>
                <span>판매 {p.sales}개</span>
                <span>★ {p.rating}</span>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <button style={{ ...styles.smBtn, flex: 1, textAlign: "center" }} onClick={() => setEditOpen(p)}>수정</button>
                <button style={{ ...styles.smBtn, color: C.red }} onClick={() => setDeleteOpen(p)}>삭제</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 수정 모달 */}
      {editOpen && (
        <div onClick={() => setEditOpen(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.surface, borderRadius: 14, width: 460, padding: 24, boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>상품 수정 — {editOpen.name}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div><div style={{ fontSize: 11, color: C.textSub, marginBottom: 4 }}>상품명</div><input style={{ ...styles.input, height: 36 }} defaultValue={editOpen.name} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div><div style={{ fontSize: 11, color: C.textSub, marginBottom: 4 }}>카테고리</div>
                  <select style={{ ...styles.input, height: 36 }} defaultValue={editOpen.cat}>
                    {["의류","하의","신발","가방","악세서리"].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div><div style={{ fontSize: 11, color: C.textSub, marginBottom: 4 }}>판매가</div><input style={{ ...styles.input, height: 36 }} defaultValue={editOpen.price} /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div><div style={{ fontSize: 11, color: C.textSub, marginBottom: 4 }}>재고</div><input style={{ ...styles.input, height: 36 }} defaultValue={editOpen.stock} /></div>
                <div><div style={{ fontSize: 11, color: C.textSub, marginBottom: 4 }}>상태</div>
                  <select style={{ ...styles.input, height: 36 }} defaultValue={editOpen.status}>
                    <option>판매중</option><option>품절</option><option>판매중단</option>
                  </select>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
              <button onClick={() => setEditOpen(null)} style={styles.btn()}>취소</button>
              <button onClick={() => setEditOpen(null)} style={styles.btn("primary")}>저장</button>
            </div>
          </div>
        </div>
      )}

{/* 일괄 가격 수정 모달 */}
      {bulkPriceOpen && (
        <div onClick={() => { setBulkPriceOpen(false); setBulkPreview(false); setBulkValue(""); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.surface, borderRadius: 14, width: 520, maxHeight: "85vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>

            {/* 헤더 */}
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>일괄 가격 수정</div>
                <div style={{ fontSize: 11, color: C.textHint, marginTop: 2 }}>카테고리별로 가격을 일괄 변경합니다</div>
              </div>
              <div onClick={() => { setBulkPriceOpen(false); setBulkPreview(false); setBulkValue(""); }} style={{ width: 28, height: 28, borderRadius: 8, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 13, color: C.textHint }}>✕</div>
            </div>

            {/* 설정 영역 */}
            <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14, overflowY: "auto", flex: 1 }}>

              {/* 적용 카테고리 */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.textSub, marginBottom: 8 }}>적용 카테고리</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {["전체", "의류", "하의", "신발", "가방", "악세서리"].map(c => (
                    <div key={c} onClick={() => { setBulkCat(c); setBulkPreview(false); }} style={{ fontSize: 11, padding: "5px 12px", borderRadius: 20, border: `1.5px solid ${bulkCat === c ? C.accent : C.border}`, background: bulkCat === c ? C.bg : C.surface, color: bulkCat === c ? C.text : C.textSub, cursor: "pointer", fontWeight: bulkCat === c ? 700 : 400 }}>{c}</div>
                  ))}
                </div>
                <div style={{ fontSize: 10, color: C.textHint, marginTop: 5 }}>
                  선택된 카테고리: <strong style={{ color: C.text }}>{bulkCat}</strong> ({bulkCat === "전체" ? products.length : products.filter(p => p.cat === bulkCat).length}개 상품)
                </div>
              </div>

              {/* 변경 방식 */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.textSub, marginBottom: 8 }}>변경 방식</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6 }}>
                  {[
                    { id: "discount", label: "% 할인", icon: "📉", desc: "현재가에서 % 할인" },
                    { id: "increase", label: "% 인상", icon: "📈", desc: "현재가에서 % 인상" },
                    { id: "fixed", label: "정액 할인", icon: "💰", desc: "고정 금액 차감" },
                  ].map(type => (
                    <div key={type.id} onClick={() => { setBulkType(type.id); setBulkPreview(false); setBulkValue(""); }} style={{ padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${bulkType === type.id ? C.accent : C.border}`, background: bulkType === type.id ? C.bg : C.surface, cursor: "pointer", textAlign: "center" }}>
                      <div style={{ fontSize: 20, marginBottom: 4 }}>{type.icon}</div>
                      <div style={{ fontSize: 11, fontWeight: bulkType === type.id ? 700 : 500, color: C.text }}>{type.label}</div>
                      <div style={{ fontSize: 10, color: C.textHint, marginTop: 2 }}>{type.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 값 입력 */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.textSub, marginBottom: 8 }}>
                  {bulkType === "discount" ? "할인율 (%)" : bulkType === "increase" ? "인상률 (%)" : "할인 금액 (₩)"}
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ display: "flex", flex: 1, border: `1.5px solid ${C.border}`, borderRadius: 9, overflow: "hidden", background: C.surface }}>
                    <input
                      type="number"
                      value={bulkValue}
                      onChange={e => { setBulkValue(e.target.value); setBulkPreview(false); }}
                      placeholder={bulkType === "fixed" ? "예: 5000" : "예: 10"}
                      min="0"
                      max={bulkType !== "fixed" ? "100" : undefined}
                      style={{ flex: 1, border: "none", outline: "none", padding: "9px 12px", fontSize: 14, fontWeight: 600, color: C.text, background: "transparent" }}
                    />
                    <div style={{ padding: "0 12px", display: "flex", alignItems: "center", fontSize: 13, fontWeight: 600, color: C.textHint, background: C.bg, borderLeft: `1px solid ${C.border}` }}>
                      {bulkType === "fixed" ? "₩" : "%"}
                    </div>
                  </div>
                  {/* 빠른 선택 */}
                  <div style={{ display: "flex", gap: 4 }}>
                    {(bulkType === "fixed" ? ["1000", "3000", "5000"] : ["5", "10", "20", "30"]).map(v => (
                      <div key={v} onClick={() => { setBulkValue(v); setBulkPreview(false); }} style={{ fontSize: 11, padding: "5px 9px", borderRadius: 7, border: `1px solid ${C.border}`, background: bulkValue === v ? C.bg : C.surface, color: bulkValue === v ? C.text : C.textSub, cursor: "pointer", fontWeight: bulkValue === v ? 700 : 400 }}>
                        {bulkType === "fixed" ? `₩${Number(v).toLocaleString()}` : `${v}%`}
                      </div>
                    ))}
                  </div>
                </div>
                {bulkType !== "fixed" && bulkValue && Number(bulkValue) > 0 && (
                  <div style={{ fontSize: 10, color: C.textHint, marginTop: 4 }}>
                    {bulkType === "discount" ? `현재가에서 ${bulkValue}% 낮아집니다` : `현재가에서 ${bulkValue}% 높아집니다`}
                  </div>
                )}
              </div>

              {/* 미리보기 버튼 */}
              {!bulkPreview && bulkValue && Number(bulkValue) > 0 && (
                <button onClick={() => setBulkPreview(true)} style={{ ...styles.btn(), justifyContent: "center", color: C.blue, borderColor: C.blue }}>🔍 변경 미리보기</button>
              )}

              {/* 미리보기 테이블 */}
              {bulkPreview && bulkValue && Number(bulkValue) > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: C.textSub, marginBottom: 8 }}>변경 미리보기</div>
                  <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
                    <table style={{ ...styles.table, tableLayout: "fixed" }}>
                      <thead><tr>
                        <th style={{ ...styles.th }}>상품명</th>
                        <th style={{ ...styles.th, width: 70, textAlign: "right" }}>현재가</th>
                        <th style={{ ...styles.th, width: 50, textAlign: "center" }}>변동</th>
                        <th style={{ ...styles.th, width: 80, textAlign: "right" }}>변경 후</th>
                      </tr></thead>
                      <tbody>
                        {(bulkCat === "전체" ? products : products.filter(p => p.cat === bulkCat)).map(p => {
                          const val = Number(bulkValue);
                          const newPrice = bulkType === "discount"
                            ? Math.round(p.price * (1 - val / 100))
                            : bulkType === "increase"
                            ? Math.round(p.price * (1 + val / 100))
                            : Math.max(0, p.price - val);
                          const diff = newPrice - p.price;
                          return (
                            <tr key={p.id}>
                              <td style={styles.td}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                  <span style={{ fontSize: 14 }}>{p.thumb}</span>
                                  <span style={{ fontSize: 11, fontWeight: 500, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                                </div>
                              </td>
                              <td style={{ ...styles.td, textAlign: "right", color: C.textSub, fontSize: 11 }}>₩{p.price.toLocaleString()}</td>
                              <td style={{ ...styles.td, textAlign: "center" }}>
                                <span style={{ fontSize: 10, fontWeight: 700, color: diff < 0 ? C.green : diff > 0 ? C.red : C.textHint }}>
                                  {diff < 0 ? `▼${Math.abs(diff).toLocaleString()}` : diff > 0 ? `▲${diff.toLocaleString()}` : "—"}
                                </span>
                              </td>
                              <td style={{ ...styles.td, textAlign: "right", fontWeight: 700, color: diff < 0 ? C.green : diff > 0 ? C.red : C.text, fontSize: 12 }}>₩{newPrice.toLocaleString()}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, padding: "8px 10px", background: C.amberBg, borderRadius: 8, fontSize: 11, color: C.amberText }}>
                    ⚠️ 총 <strong>{bulkCat === "전체" ? products.length : products.filter(p => p.cat === bulkCat).length}개</strong> 상품의 가격이 변경됩니다. 신중하게 확인해주세요.
                  </div>
                </div>
              )}
            </div>

            {/* 푸터 */}
            <div style={{ padding: "12px 20px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 8, justifyContent: "flex-end", flexShrink: 0 }}>
              <button onClick={() => { setBulkPriceOpen(false); setBulkPreview(false); setBulkValue(""); }} style={styles.btn()}>취소</button>
              <button
                disabled={!bulkPreview || !bulkValue || Number(bulkValue) <= 0}
                onClick={() => {
                  const val = Number(bulkValue);
                  setProducts(prev => prev.map(p => {
                    if (bulkCat !== "전체" && p.cat !== bulkCat) return p;
                    const newPrice = bulkType === "discount"
                      ? Math.round(p.price * (1 - val / 100))
                      : bulkType === "increase"
                      ? Math.round(p.price * (1 + val / 100))
                      : Math.max(0, p.price - val);
                    return { ...p, price: newPrice };
                  }));
                  setBulkPriceOpen(false);
                  setBulkPreview(false);
                  setBulkValue("");
                }}
                style={{ ...styles.btn("primary"), opacity: !bulkPreview || !bulkValue || Number(bulkValue) <= 0 ? 0.4 : 1, cursor: !bulkPreview ? "not-allowed" : "pointer" }}
              >
                ✓ 일괄 적용
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {deleteOpen && (
        <div onClick={() => setDeleteOpen(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.surface, borderRadius: 14, width: 360, padding: 24, boxShadow: "0 8px 32px rgba(0,0,0,0.18)", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🗑</div>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>상품을 삭제할까요?</div>
            <div style={{ fontSize: 12, color: C.textSub, marginBottom: 20 }}>
              <strong>{deleteOpen.name}</strong>을 삭제하면<br />복구할 수 없습니다.
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setDeleteOpen(null)} style={{ ...styles.btn(), flex: 1, justifyContent: "center" }}>취소</button>
              <button onClick={() => deleteProduct(deleteOpen.id)} style={{ ...styles.btn("danger"), flex: 1, justifyContent: "center", background: C.red, color: "#fff", border: "none" }}>삭제</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── 고객 목록 페이지 ─────────────────────────────────────────
function CustomerList() {
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("전체");
  const [statusFilter, setStatusFilter] = useState("전체");
  const [sort, setSort] = useState("최근 가입순");
  const [selected, setSelected] = useState([]);
  const [detailOpen, setDetailOpen] = useState(null);

  const customers = [
    { id: 1, name: "홍길동", email: "hong***@email.com", phone: "010-****-2847", grade: "VIP", gradeDetail: "골드", orders: 48, total: 2840000, point: 4280, lastOrder: "2일 전", joined: "2023-03-15", status: "활성", avatar: "홍", cats: ["의류", "신발"] },
    { id: 2, name: "김지연", email: "kim***@email.com", phone: "010-****-1234", grade: "VIP", gradeDetail: "실버", orders: 24, total: 1240000, point: 1820, lastOrder: "5일 전", joined: "2023-06-20", status: "활성", avatar: "김", cats: ["악세서리", "가방"] },
    { id: 3, name: "이준혁", email: "lee***@email.com", phone: "010-****-5678", grade: "일반", gradeDetail: "일반", orders: 12, total: 620000, point: 820, lastOrder: "1주 전", joined: "2023-09-10", status: "활성", avatar: "이", cats: ["하의", "의류"] },
    { id: 4, name: "박서윤", email: "park***@email.com", phone: "010-****-9012", grade: "일반", gradeDetail: "일반", orders: 8, total: 380000, point: 420, lastOrder: "2주 전", joined: "2024-01-05", status: "활성", avatar: "박", cats: ["신발"] },
    { id: 5, name: "최민준", email: "choi***@email.com", phone: "010-****-3456", grade: "신규", gradeDetail: "신규", orders: 2, total: 128000, point: 180, lastOrder: "3주 전", joined: "2024-04-12", status: "활성", avatar: "최", cats: ["의류"] },
    { id: 6, name: "정수아", email: "jung***@email.com", phone: "010-****-7890", grade: "VIP", gradeDetail: "골드", orders: 36, total: 1980000, point: 3240, lastOrder: "어제", joined: "2023-05-08", status: "활성", avatar: "정", cats: ["가방", "악세서리"] },
    { id: 7, name: "강태양", email: "kang***@email.com", phone: "010-****-2345", grade: "일반", gradeDetail: "일반", orders: 6, total: 290000, point: 240, lastOrder: "1달 전", joined: "2024-02-28", status: "휴면", avatar: "강", cats: ["하의"] },
    { id: 8, name: "윤하늘", email: "yoon***@email.com", phone: "010-****-6789", grade: "일반", gradeDetail: "일반", orders: 14, total: 740000, point: 680, lastOrder: "4일 전", joined: "2023-11-15", status: "활성", avatar: "윤", cats: ["의류", "악세서리"] },
    { id: 9, name: "임도현", email: "lim***@email.com", phone: "010-****-0123", grade: "신규", gradeDetail: "신규", orders: 1, total: 48000, point: 80, lastOrder: "1주 전", joined: "2024-05-20", status: "활성", avatar: "임", cats: ["악세서리"] },
    { id: 10, name: "한소희", email: "han***@email.com", phone: "010-****-4567", grade: "VIP", gradeDetail: "플래티넘", orders: 64, total: 4280000, point: 8420, lastOrder: "방금", joined: "2022-12-01", status: "활성", avatar: "한", cats: ["의류", "가방", "신발"] },
    { id: 11, name: "오세진", email: "oh***@email.com", phone: "010-****-8901", grade: "일반", gradeDetail: "일반", orders: 3, total: 142000, point: 120, lastOrder: "2달 전", joined: "2024-03-10", status: "정지", avatar: "오", cats: ["신발"] },
    { id: 12, name: "신예은", email: "shin***@email.com", phone: "010-****-2346", grade: "일반", gradeDetail: "일반", orders: 18, total: 860000, point: 920, lastOrder: "3일 전", joined: "2023-08-22", status: "활성", avatar: "신", cats: ["의류", "하의"] },
  ];

  const gradeColor = { "VIP": "amber", "일반": "gray", "신규": "blue" };
  const gradeDetailColor = {
    "플래티넘": { bg: C.purpleBg, text: C.purpleText },
    "골드": { bg: C.amberBg, text: C.amberText },
    "실버": { bg: C.bg, text: C.textSub },
    "일반": { bg: C.bg, text: C.textHint },
    "신규": { bg: C.blueBg, text: C.blueText },
  };
  const statusColor = { "활성": "green", "휴면": "amber", "정지": "red" };
  const avatarColor = { "플래티넘": C.purple, "골드": C.amber, "실버": C.textSub, "일반": C.textHint, "신규": C.blue };

  const filtered = customers.filter(c => {
    const matchSearch = c.name.includes(search) || c.email.includes(search) || c.phone.includes(search);
    const matchGrade = gradeFilter === "전체" || c.grade === gradeFilter;
    const matchStatus = statusFilter === "전체" || c.status === statusFilter;
    return matchSearch && matchGrade && matchStatus;
  }).sort((a, b) => {
    if (sort === "최근 가입순") return new Date(b.joined) - new Date(a.joined);
    if (sort === "구매액순") return b.total - a.total;
    if (sort === "주문횟수순") return b.orders - a.orders;
    if (sort === "포인트순") return b.point - a.point;
    return 0;
  });

  const toggleSelect = (id) => setSelected(s => s.includes(id) ? s.filter(i => i !== id) : [...s, id]);
  const toggleAll = () => setSelected(selected.length === filtered.length ? [] : filtered.map(c => c.id));

  return (
    <>
      {/* KPI */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: 10 }}>
        {[
          { label: "전체 고객", value: `${customers.length}명`, sub: "등록된 고객", accent: C.blue },
          { label: "VIP 고객", value: `${customers.filter(c => c.grade === "VIP").length}명`, sub: "VIP 등급", accent: C.amber },
          { label: "신규 고객", value: `${customers.filter(c => c.grade === "신규").length}명`, sub: "이번 달", accent: C.green },
          { label: "휴면 고객", value: `${customers.filter(c => c.status === "휴면").length}명`, sub: "90일 미접속", accent: C.textHint },
          { label: "총 구매액", value: `₩${(customers.reduce((a, c) => a + c.total, 0) / 10000).toFixed(0)}만`, sub: "누적 합산", accent: C.purple },
        ].map(k => (
          <div key={k.label} style={styles.kpiCard(k.accent)}>
            <div style={styles.kpiLabel}>{k.label}</div>
            <div style={{ ...styles.kpiValue, fontSize: 17 }}>{k.value}</div>
            <div style={styles.kpiSub}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* 필터 바 */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <div style={{ ...styles.searchBox, flex: 1, minWidth: 160 }}>
          🔍
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="이름·이메일·전화번호 검색..."
            style={{ flex: 1, border: "none", outline: "none", fontSize: 11, color: C.text, background: "transparent" }}
          />
        </div>
        <div style={{ display: "flex", gap: 5 }}>
          {["전체", "VIP", "일반", "신규"].map(g => (
            <div key={g} onClick={() => setGradeFilter(g)} style={styles.filterChip(gradeFilter === g)}>{g}</div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 5 }}>
          {["전체", "활성", "휴면", "정지"].map(s => (
            <div key={s} onClick={() => setStatusFilter(s)} style={styles.filterChip(statusFilter === s)}>{s}</div>
          ))}
        </div>
        <select style={styles.select} value={sort} onChange={e => setSort(e.target.value)}>
          <option>최근 가입순</option>
          <option>구매액순</option>
          <option>주문횟수순</option>
          <option>포인트순</option>
        </select>
        <button style={styles.btn()} onClick={() => exportCustomers(customers)}>↓ CSV 내보내기</button>
      </div>

      {/* 일괄 처리 바 */}
      {selected.length > 0 && (
        <div style={{ ...styles.card, padding: "8px 12px", display: "flex", alignItems: "center", gap: 8, fontSize: 11, background: C.blueBg, border: `1px solid ${C.blue}` }}>
          <span style={{ color: C.blueText, fontWeight: 600 }}>{selected.length}명 선택됨</span>
          <span style={{ flex: 1 }} />
          <button style={styles.smBtn}>📧 이메일 발송</button>
          <button style={styles.smBtn}>🎫 쿠폰 지급</button>
          <button style={styles.smBtn}>등급 변경</button>
          <button style={{ ...styles.smBtn, color: C.red }}>계정 정지</button>
          <button style={styles.smBtn} onClick={() => setSelected([])}>선택 해제</button>
        </div>
      )}

      {/* 테이블 */}
      <div style={styles.tableWrap}>
        <table style={{ ...styles.table, tableLayout: "fixed" }}>
          <thead><tr>
            <th style={{ ...styles.th, width: 32 }}>
              <input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleAll} style={{ width: 13, height: 13, accentColor: C.accent }} />
            </th>
            <th style={styles.th}>고객명</th>
            <th style={styles.th}>연락처</th>
            <th style={{ ...styles.th, width: 80, textAlign: "center" }}>등급</th>
            <th style={{ ...styles.th, width: 60, textAlign: "right" }}>주문 수</th>
            <th style={{ ...styles.th, width: 90, textAlign: "right" }}>총 구매액</th>
            <th style={{ ...styles.th, width: 70, textAlign: "right" }}>포인트</th>
            <th style={{ ...styles.th, width: 80 }}>최근 주문</th>
            <th style={{ ...styles.th, width: 90 }}>가입일</th>
            <th style={{ ...styles.th, width: 60, textAlign: "center" }}>상태</th>
            <th style={{ ...styles.th, width: 80, textAlign: "right" }}>관리</th>
          </tr></thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} style={{ background: selected.includes(c.id) ? C.blueBg : C.surface }}
                onMouseEnter={e => { if (!selected.includes(c.id)) e.currentTarget.style.background = C.bg; }}
                onMouseLeave={e => { if (!selected.includes(c.id)) e.currentTarget.style.background = C.surface; }}
              >
                <td style={styles.td}>
                  <input type="checkbox" checked={selected.includes(c.id)} onChange={() => toggleSelect(c.id)} style={{ width: 13, height: 13, accentColor: C.accent }} />
                </td>
                <td style={styles.td}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: avatarColor[c.gradeDetail], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{c.avatar}</div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 500, color: C.text }}>{c.name}</div>
                      <div style={{ fontSize: 10, color: C.textHint }}>{c.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ ...styles.td, fontSize: 11 }}>{c.phone}</td>
                <td style={{ ...styles.td, textAlign: "center" }}>
                  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, fontWeight: 600, background: gradeDetailColor[c.gradeDetail]?.bg, color: gradeDetailColor[c.gradeDetail]?.text }}>
                    {c.gradeDetail === "플래티넘" ? "💎" : c.gradeDetail === "골드" ? "⭐" : c.gradeDetail === "실버" ? "🥈" : c.gradeDetail === "신규" ? "🆕" : ""} {c.gradeDetail}
                  </span>
                </td>
                <td style={{ ...styles.td, textAlign: "right", fontWeight: 600, color: C.text }}>{c.orders}회</td>
                <td style={{ ...styles.td, textAlign: "right", fontWeight: 600, color: C.text }}>₩{c.total.toLocaleString()}</td>
                <td style={{ ...styles.td, textAlign: "right", color: C.textSub }}>{c.point.toLocaleString()}P</td>
                <td style={{ ...styles.td, fontSize: 11, color: C.textHint }}>{c.lastOrder}</td>
                <td style={{ ...styles.td, fontSize: 10, color: C.textHint }}>{c.joined}</td>
                <td style={{ ...styles.td, textAlign: "center" }}><span style={styles.badge(statusColor[c.status])}>{c.status}</span></td>
                <td style={{ ...styles.td, textAlign: "right" }}>
                  <div style={{ display: "flex", gap: 3, justifyContent: "flex-end" }}>
                    <button style={styles.smBtn} onClick={() => setDetailOpen(c)}>상세</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={styles.pagination}>
          <span style={{ fontSize: 11, color: C.textHint }}>총 {filtered.length}명</span>
          <div style={{ display: "flex", gap: 4 }}>
            {["‹", "1", "2", "›"].map((p, i) => <div key={i} style={styles.pageBtn(p === "1")}>{p}</div>)}
          </div>
        </div>
      </div>

      {/* 고객 상세 모달 */}
      {detailOpen && (
        <div onClick={() => setDetailOpen(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.surface, borderRadius: 14, width: 480, maxHeight: "80vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
            {/* 모달 헤더 */}
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
              <div style={{ width: 42, height: 42, borderRadius: "50%", background: avatarColor[detailOpen.gradeDetail], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#fff" }}>{detailOpen.avatar}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{detailOpen.name}</div>
                <div style={{ fontSize: 11, color: C.textHint }}>{detailOpen.email}</div>
              </div>
              <span style={{ fontSize: 10, padding: "3px 10px", borderRadius: 10, fontWeight: 600, background: gradeDetailColor[detailOpen.gradeDetail]?.bg, color: gradeDetailColor[detailOpen.gradeDetail]?.text }}>{detailOpen.gradeDetail}</span>
              <div onClick={() => setDetailOpen(null)} style={{ width: 26, height: 26, borderRadius: 7, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 12, color: C.textHint }}>✕</div>
            </div>

            {/* 모달 본문 */}
            <div style={{ padding: "16px 20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
              {/* 통계 */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                {[["총 주문", `${detailOpen.orders}회`], ["총 구매액", `₩${detailOpen.total.toLocaleString()}`], ["보유 포인트", `${detailOpen.point.toLocaleString()}P`]].map(([k, v]) => (
                  <div key={k} style={{ background: C.bg, borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
                    <div style={{ fontSize: 10, color: C.textHint, marginBottom: 4 }}>{k}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{v}</div>
                  </div>
                ))}
              </div>

              {/* 기본 정보 */}
              <div>
                <div style={{ fontSize: 10, fontWeight: 600, color: C.textHint, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 8 }}>기본 정보</div>
                {[["전화번호", detailOpen.phone], ["가입일", detailOpen.joined], ["최근 주문", detailOpen.lastOrder], ["관심 카테고리", detailOpen.cats.join(", ")], ["계정 상태", detailOpen.status]].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "6px 0", borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ color: C.textSub }}>{k}</span>
                    <span style={{ fontWeight: 500, color: C.text }}>{v}</span>
                  </div>
                ))}
              </div>

              {/* 액션 버튼 */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                <button style={{ ...styles.btn(), justifyContent: "center", fontSize: 11 }}>📧 이메일</button>
                <button style={{ ...styles.btn(), justifyContent: "center", fontSize: 11 }}>🎫 쿠폰 지급</button>
                <button style={{ ...styles.btn("danger"), justifyContent: "center", fontSize: 11 }}>🚫 계정 정지</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── 스토어 설정 페이지 ───────────────────────────────────────
function StoreSettings() {
  const [tab, setTab] = useState("기본 정보");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const Toggle = ({ on }) => (
    <div style={{ width: 36, height: 20, borderRadius: 10, background: on ? C.green : C.border, position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0 }}>
      <div style={{ position: "absolute", top: 3, left: on ? 18 : 3, width: 14, height: 14, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
    </div>
  );

  const Field = ({ label, required, children, hint }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ fontSize: 11, fontWeight: 500, color: C.textSub }}>
        {label} {required && <span style={{ color: C.red }}>*</span>}
      </div>
      {children}
      {hint && <div style={{ fontSize: 10, color: C.textHint }}>{hint}</div>}
    </div>
  );

  const Input = ({ defaultValue, placeholder, type = "text" }) => (
    <input type={type} defaultValue={defaultValue} placeholder={placeholder}
      style={{ height: 36, borderRadius: 8, border: `1px solid ${C.border}`, padding: "0 10px", fontSize: 12, color: C.text, outline: "none", background: C.surface, width: "100%", boxSizing: "border-box" }}
    />
  );

  const Textarea = ({ defaultValue, placeholder, rows = 3 }) => (
    <textarea defaultValue={defaultValue} placeholder={placeholder} rows={rows}
      style={{ borderRadius: 8, border: `1px solid ${C.border}`, padding: "8px 10px", fontSize: 12, color: C.text, outline: "none", background: C.surface, width: "100%", boxSizing: "border-box", resize: "vertical" }}
    />
  );

  const Select = ({ defaultValue, children }) => (
    <select defaultValue={defaultValue}
      style={{ height: 36, borderRadius: 8, border: `1px solid ${C.border}`, padding: "0 10px", fontSize: 12, color: C.text, outline: "none", background: C.surface, width: "100%", boxSizing: "border-box" }}
    >{children}</select>
  );

  const SectionTitle = ({ children }) => (
    <div style={{ fontSize: 10, fontWeight: 600, color: C.textHint, letterSpacing: "0.06em", textTransform: "uppercase", padding: "4px 0 2px", borderBottom: `1px solid ${C.border}`, marginBottom: 2 }}>{children}</div>
  );

  const SettingRow = ({ label, desc, children }) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 500, color: C.text }}>{label}</div>
        {desc && <div style={{ fontSize: 10, color: C.textHint, marginTop: 2 }}>{desc}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );

  return (
    <>
      {/* 저장 완료 토스트 */}
      {saved && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: C.accent, color: "#fff", padding: "10px 20px", borderRadius: 10, fontSize: 12, fontWeight: 600, zIndex: 300, boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}>
          ✓ 설정이 저장되었습니다
        </div>
      )}

      {/* 탭 + 저장 버튼 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, flex: 1 }}>
          {["기본 정보", "배송 정책", "결제 설정", "알림 설정", "약관 관리"].map(t => (
            <div key={t} onClick={() => setTab(t)} style={{ fontSize: 12, padding: "8px 16px", cursor: "pointer", color: tab === t ? C.text : C.textHint, fontWeight: tab === t ? 700 : 400, borderBottom: tab === t ? `2px solid ${C.accent}` : "2px solid transparent", marginBottom: -1, whiteSpace: "nowrap" }}>{t}</div>
          ))}
        </div>
        <button onClick={handleSave} style={{ ...styles.btn("primary"), marginLeft: 12, whiteSpace: "nowrap" }}>저장</button>
      </div>

      {/* 기본 정보 탭 */}
      {tab === "기본 정보" && (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.5fr) minmax(0,1fr)", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={styles.card}>
              <SectionTitle>스토어 정보</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
                <Field label="스토어명" required><Input defaultValue="ShopAdmin" /></Field>
                <Field label="스토어 URL" required hint="https://yourstore.com">
                  <div style={{ display: "flex", gap: 6 }}>
                    <div style={{ height: 36, borderRadius: 8, border: `1px solid ${C.border}`, padding: "0 10px", fontSize: 12, color: C.textHint, display: "flex", alignItems: "center", background: C.bg, whiteSpace: "nowrap" }}>https://</div>
                    <Input defaultValue="shopadmin.com" />
                  </div>
                </Field>
                <Field label="스토어 소개">
                  <Textarea defaultValue="프리미엄 패션 쇼핑몰 ShopAdmin입니다." rows={3} />
                </Field>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <Field label="사업자 번호" required><Input defaultValue="000-00-00000" /></Field>
                  <Field label="통신판매업 신고번호"><Input defaultValue="제2024-서울강남-0000호" /></Field>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <Field label="대표자명" required><Input defaultValue="홍길동" /></Field>
                  <Field label="대표 전화" required><Input defaultValue="02-0000-0000" /></Field>
                </div>
                <Field label="사업장 주소"><Input defaultValue="서울시 강남구 테헤란로 00" /></Field>
                <Field label="고객센터 이메일"><Input defaultValue="cs@shopadmin.com" type="email" /></Field>
              </div>
            </div>
            <div style={styles.card}>
              <SectionTitle>운영 시간</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  <Field label="운영 시작"><Input defaultValue="09:00" type="time" /></Field>
                  <Field label="운영 종료"><Input defaultValue="18:00" type="time" /></Field>
                  <Field label="점심 시간"><Input defaultValue="12:00 ~ 13:00" /></Field>
                </div>
                <SettingRow label="주말 운영" desc="토·일요일 고객센터 운영"><Toggle on={false} /></SettingRow>
                <SettingRow label="공휴일 운영" desc="공휴일 고객센터 운영"><Toggle on={false} /></SettingRow>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={styles.card}>
              <SectionTitle>스토어 로고 · 이미지</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
                {[["로고 이미지", "권장 200×60px · PNG/SVG"], ["파비콘", "32×32px · ICO/PNG"], ["대표 이미지", "권장 1200×630px · OG 이미지"]].map(([label, hint]) => (
                  <div key={label}>
                    <div style={{ fontSize: 11, fontWeight: 500, color: C.textSub, marginBottom: 5 }}>{label}</div>
                    <div style={{ border: `1px dashed ${C.borderMid}`, borderRadius: 8, height: 64, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, cursor: "pointer", background: C.bg }}>
                      <div style={{ fontSize: 18 }}>☁</div>
                      <div style={{ fontSize: 10, color: C.textHint }}>{hint}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={styles.card}>
              <SectionTitle>SNS 채널</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
                {[["인스타그램", "@shopadmin"], ["카카오톡 채널", "@shopadmin"], ["유튜브", "ShopAdmin TV"], ["블로그", "blog.naver.com/shopadmin"]].map(([label, placeholder]) => (
                  <Field key={label} label={label}><Input placeholder={placeholder} /></Field>
                ))}
              </div>
            </div>
            <div style={styles.card}>
              <SectionTitle>SEO 설정</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
                <Field label="메타 제목"><Input defaultValue="ShopAdmin — 프리미엄 패션 쇼핑몰" /></Field>
                <Field label="메타 설명"><Textarea defaultValue="ShopAdmin에서 프리미엄 패션 아이템을 만나보세요." rows={2} /></Field>
                <Field label="검색 키워드"><Input defaultValue="패션, 의류, 쇼핑몰" /></Field>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 배송 정책 탭 */}
      {tab === "배송 정책" && (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.5fr) minmax(0,1fr)", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={styles.card}>
              <SectionTitle>기본 배송 설정</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <Field label="기본 배송사"><Select defaultValue="CJ대한통운"><option>CJ대한통운</option><option>한진택배</option><option>로젠택배</option><option>우체국</option></Select></Field>
                  <Field label="기본 배송비"><Input defaultValue="3000" /></Field>
                </div>
                <Field label="무료 배송 기준 금액" hint="해당 금액 이상 주문 시 무료 배송">
                  <Input defaultValue="50000" />
                </Field>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <Field label="출고 소요일" hint="결제 후 출고까지"><Input defaultValue="1~2" /></Field>
                  <Field label="배송 소요일" hint="출고 후 수령까지"><Input defaultValue="1~3" /></Field>
                </div>
                <SettingRow label="당일 배송" desc="오전 11시 이전 주문 당일 출고"><Toggle on={false} /></SettingRow>
                <SettingRow label="새벽 배송" desc="새벽 7시 이전 배송 (수도권)"><Toggle on={false} /></SettingRow>
              </div>
            </div>
            <div style={styles.card}>
              <SectionTitle>도서 산간 배송</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
                <SettingRow label="도서 산간 지역 배송" desc="제주 및 도서 산간 지역 배송 허용"><Toggle on={true} /></SettingRow>
                <Field label="도서 산간 추가 배송비"><Input defaultValue="3000" /></Field>
                <Field label="제주 추가 배송비"><Input defaultValue="5000" /></Field>
              </div>
            </div>
            <div style={styles.card}>
              <SectionTitle>교환 · 반품 정책</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <Field label="교환 가능 기간" hint="수령 후 며칠 이내"><Input defaultValue="7" /></Field>
                  <Field label="반품 가능 기간" hint="수령 후 며칠 이내"><Input defaultValue="7" /></Field>
                </div>
                <Field label="왕복 배송비 (고객 단순 변심)"><Input defaultValue="6000" /></Field>
                <SettingRow label="하자 상품 무료 반품" desc="상품 불량 시 무료 교환/반품"><Toggle on={true} /></SettingRow>
                <Field label="반품 안내 메시지">
                  <Textarea defaultValue="고객 변심에 의한 반품의 경우 왕복 배송비 6,000원이 발생합니다." rows={2} />
                </Field>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={styles.card}>
              <SectionTitle>배송사별 설정</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 0, marginTop: 10 }}>
                {[
                  { name: "CJ대한통운", code: "04", active: true },
                  { name: "한진택배", code: "05", active: true },
                  { name: "로젠택배", code: "06", active: true },
                  { name: "우체국", code: "01", active: false },
                  { name: "롯데택배", code: "08", active: false },
                ].map((c, i) => (
                  <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: C.text }}>{c.name}</div>
                      <div style={{ fontSize: 10, color: C.textHint }}>업체 코드: {c.code}</div>
                    </div>
                    <Toggle on={c.active} />
                  </div>
                ))}
              </div>
            </div>
            <div style={styles.card}>
              <SectionTitle>배송 알림 설정</SectionTitle>
              <div style={{ marginTop: 10 }}>
                <SettingRow label="출고 완료 알림" desc="고객에게 출고 알림 문자 발송"><Toggle on={true} /></SettingRow>
                <SettingRow label="배송 시작 알림" desc="배송 시작 시 카카오 알림톡"><Toggle on={true} /></SettingRow>
                <SettingRow label="배송 완료 알림" desc="배송 완료 후 리뷰 요청"><Toggle on={true} /></SettingRow>
                <SettingRow label="배송 지연 알림" desc="예상일 초과 시 자동 안내"><Toggle on={false} /></SettingRow>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 결제 설정 탭 */}
      {tab === "결제 설정" && (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.5fr) minmax(0,1fr)", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={styles.card}>
              <SectionTitle>결제 수단 활성화</SectionTitle>
              <div style={{ marginTop: 10 }}>
                {[
                  { label: "신용카드", desc: "국내외 신용·체크카드", on: true },
                  { label: "카카오페이", desc: "카카오페이 간편결제", on: true },
                  { label: "네이버페이", desc: "네이버페이 결제", on: true },
                  { label: "토스페이", desc: "토스페이 간편결제", on: true },
                  { label: "무통장입금", desc: "계좌이체 (수동 확인)", on: true },
                  { label: "포인트 결제", desc: "적립 포인트 사용", on: true },
                  { label: "상품권", desc: "자사 상품권 코드 입력", on: false },
                  { label: "애플페이", desc: "Apple Pay (Safari)", on: false },
                ].map(item => (
                  <SettingRow key={item.label} label={item.label} desc={item.desc}><Toggle on={item.on} /></SettingRow>
                ))}
              </div>
            </div>
            <div style={styles.card}>
              <SectionTitle>무통장입금 계좌 설정</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <Field label="은행"><Select defaultValue="국민은행"><option>국민은행</option><option>신한은행</option><option>우리은행</option><option>하나은행</option><option>기업은행</option></Select></Field>
                  <Field label="예금주"><Input defaultValue="ShopAdmin(주)" /></Field>
                </div>
                <Field label="계좌번호"><Input defaultValue="000-00-000000" /></Field>
                <Field label="입금 확인 마감 시간" hint="마감 후 자동 취소">
                  <Select defaultValue="24시간"><option>12시간</option><option>24시간</option><option>48시간</option><option>72시간</option></Select>
                </Field>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={styles.card}>
              <SectionTitle>할부 · 포인트 설정</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
                <Field label="할부 최대 개월수"><Select defaultValue="12개월"><option>3개월</option><option>6개월</option><option>12개월</option><option>24개월</option></Select></Field>
                <Field label="무이자 할부 개월" hint="카드사 무이자 할부 기간"><Input defaultValue="3, 6" /></Field>
                <div style={{ height: 1, background: C.border }} />
                <Field label="포인트 적립률" hint="결제 금액의 %"><Input defaultValue="1" /></Field>
                <Field label="포인트 최소 사용액"><Input defaultValue="1000" /></Field>
                <Field label="포인트 최대 사용 비율" hint="주문 금액의 최대 %"><Input defaultValue="50" /></Field>
                <SettingRow label="회원가입 포인트 지급" desc="신규 가입 시 포인트 지급"><Toggle on={true} /></SettingRow>
                <Field label="회원가입 지급 포인트"><Input defaultValue="1000" /></Field>
              </div>
            </div>
            <div style={styles.card}>
              <SectionTitle>결제 보안 설정</SectionTitle>
              <div style={{ marginTop: 10 }}>
                <SettingRow label="SSL 보안 결제" desc="HTTPS 암호화 결제 강제"><Toggle on={true} /></SettingRow>
                <SettingRow label="결제 이상 감지" desc="비정상 결제 패턴 차단"><Toggle on={true} /></SettingRow>
                <SettingRow label="해외 결제 허용" desc="해외 카드 결제 허용"><Toggle on={false} /></SettingRow>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 알림 설정 탭 */}
      {tab === "알림 설정" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={styles.card}>
            <SectionTitle>고객 알림 설정</SectionTitle>
            <div style={{ marginTop: 10 }}>
              {[
                { label: "주문 접수 확인", desc: "주문 완료 시 고객 알림" },
                { label: "결제 완료 알림", desc: "결제 성공 시 영수증 발송" },
                { label: "배송 시작 알림", desc: "출고 시 송장번호 포함 발송" },
                { label: "배송 완료 알림", desc: "배송 완료 후 리뷰 요청" },
                { label: "교환/반품 처리", desc: "처리 단계별 고객 안내" },
                { label: "이벤트·프로모션", desc: "신규 프로모션 알림" },
                { label: "포인트 적립", desc: "포인트 변동 시 알림" },
              ].map((item, i) => (
                <SettingRow key={item.label} label={item.label} desc={item.desc}><Toggle on={i < 5} /></SettingRow>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={styles.card}>
              <SectionTitle>관리자 알림 설정</SectionTitle>
              <div style={{ marginTop: 10 }}>
                {[
                  { label: "신규 주문 알림", on: true },
                  { label: "재고 부족 알림", on: true },
                  { label: "취소/반품 알림", on: true },
                  { label: "신규 리뷰 알림", on: false },
                  { label: "CS 문의 알림", on: true },
                  { label: "정산 완료 알림", on: true },
                ].map(item => (
                  <SettingRow key={item.label} label={item.label} desc=""><Toggle on={item.on} /></SettingRow>
                ))}
              </div>
            </div>
            <div style={styles.card}>
              <SectionTitle>알림 채널</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
                <Field label="알림 이메일"><Input defaultValue="admin@shopadmin.com" type="email" /></Field>
                <Field label="카카오 알림톡 발신 프로필"><Input defaultValue="@shopadmin" /></Field>
                <Field label="SMS 발신 번호"><Input defaultValue="02-0000-0000" /></Field>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 약관 관리 탭 */}
      {tab === "약관 관리" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { title: "이용약관", updated: "2026-01-01", required: true, content: "제1조 (목적)\n본 약관은 ShopAdmin이 제공하는 전자상거래 서비스의 이용조건 및 절차, 회사와 회원 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.\n\n제2조 (정의)\n서비스란 회사가 제공하는 쇼핑몰 플랫폼 서비스를 의미합니다." },
            { title: "개인정보처리방침", updated: "2026-01-01", required: true, content: "1. 개인정보의 수집 및 이용 목적\nShopAdmin은 다음과 같은 목적으로 개인정보를 수집·이용합니다.\n- 회원 가입 및 관리\n- 서비스 제공 및 계약 이행\n- 고객 상담 및 불만 처리" },
            { title: "환불 정책", updated: "2026-03-01", required: false, content: "1. 교환 및 반품 기간\n상품 수령 후 7일 이내 교환 및 반품 신청이 가능합니다.\n\n2. 교환 및 반품 불가 사유\n- 상품 사용 또는 훼손된 경우\n- 포장 개봉 후 상품 가치가 현저히 감소한 경우" },
            { title: "마케팅 정보 수신 동의", updated: "2026-01-01", required: false, content: "ShopAdmin은 고객님의 동의를 받아 프로모션, 이벤트, 신상품 안내 등 마케팅 정보를 이메일 및 SMS로 발송합니다." },
          ].map((terms, i) => (
            <div key={terms.title} style={styles.card}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text, flex: 1 }}>{terms.title}</div>
                {terms.required && <span style={styles.badge("red")}>필수</span>}
                <span style={{ fontSize: 10, color: C.textHint }}>최종 수정: {terms.updated}</span>
                <button style={styles.smBtn}>수정</button>
                <button style={styles.smBtn}>미리보기</button>
              </div>
              <textarea
                defaultValue={terms.content}
                style={{ width: "100%", height: 100, borderRadius: 8, border: `1px solid ${C.border}`, padding: "8px 10px", fontSize: 11, color: C.textSub, resize: "vertical", outline: "none", background: C.surface, boxSizing: "border-box", lineHeight: 1.6 }}
              />
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ── 주문 상세 모달 ────────────────────────────────────────────
function OrderDetailModal({ order, onClose, C }) {
  const [activeTab, setActiveTab] = useState("주문 정보");

  const timeline = [
    { status: "주문 접수", time: "06/10 14:32", done: true, desc: "고객이 주문을 완료했습니다." },
    { status: "결제 완료", time: "06/10 14:33", done: true, desc: `${order.pay}으로 결제가 완료되었습니다.` },
    { status: "상품 준비 중", time: "06/10 15:10", done: order.status !== "입금대기", desc: "상품 준비 및 포장 중입니다." },
    { status: "배송 중", time: order.status === "배송중" || order.status === "배송완료" ? "06/11 08:22" : "—", done: order.status === "배송중" || order.status === "배송완료", desc: "CJ대한통운 · 송장번호 541-2847-0382" },
    { status: "배송 완료", time: order.status === "배송완료" ? "06/11 14:20" : "—", done: order.status === "배송완료", desc: "상품이 배송 완료되었습니다." },
  ];

  const statusColor = { "결제완료": "green", "배송중": "blue", "입금대기": "amber", "취소": "red", "배송완료": "gray" };

  const items = [
    { name: "프리미엄 후디", opt: "블랙 / M", qty: 1, price: 89000, thumb: "🧥" },
    { name: "클래식 티셔츠", opt: "화이트 / S", qty: 1, price: 39000, thumb: "👕" },
  ];

  const subtotal = items.reduce((a, i) => a + i.price * i.qty, 0);
  const shipping = 0;
  const discount = 5000;
  const total = subtotal + shipping - discount;

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: C.surface, borderRadius: 14, width: "100%", maxWidth: 640, maxHeight: "88vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 8px 40px rgba(0,0,0,0.2)" }}>

        {/* 헤더 */}
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>주문 {order.id}</span>
              <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 10, fontWeight: 600, background: statusColor[order.status] === "green" ? C.greenBg : statusColor[order.status] === "blue" ? C.blueBg : statusColor[order.status] === "amber" ? C.amberBg : statusColor[order.status] === "red" ? C.redBg : C.bg, color: statusColor[order.status] === "green" ? C.greenText : statusColor[order.status] === "blue" ? C.blueText : statusColor[order.status] === "amber" ? C.amberText : statusColor[order.status] === "red" ? C.redText : C.textHint }}>{order.status}</span>
            </div>
            <div style={{ fontSize: 11, color: C.textHint, marginTop: 2 }}>{order.date} · {order.cust} · {order.pay}</div>
          </div>
          <div style={{ display: "flex", gap: 5 }}>
            {order.status === "결제완료" && <button style={styles.smBtn}>배송 처리</button>}
            {order.status === "배송중" && <button style={styles.smBtn}>송장 수정</button>}
            {order.status !== "취소" && order.status !== "배송완료" && <button style={{ ...styles.smBtn, color: C.red }}>주문 취소</button>}
            <button style={styles.smBtn}>영수증 출력</button>
          </div>
          <div onClick={onClose} style={{ width: 28, height: 28, borderRadius: 8, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 13, color: C.textHint, flexShrink: 0 }}>✕</div>
        </div>

        {/* 탭 */}
        <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, paddingLeft: 20, flexShrink: 0 }}>
          {["주문 정보", "배송 현황", "결제 내역", "처리 이력"].map(t => (
            <div key={t} onClick={() => setActiveTab(t)} style={{ fontSize: 11, padding: "8px 14px", cursor: "pointer", color: activeTab === t ? C.text : C.textHint, fontWeight: activeTab === t ? 700 : 400, borderBottom: activeTab === t ? `2px solid ${C.accent}` : "2px solid transparent", marginBottom: -1 }}>{t}</div>
          ))}
        </div>

        {/* 본문 */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>

          {/* 주문 정보 탭 */}
          {activeTab === "주문 정보" && (
            <>
              {/* 주문 상품 */}
              <div style={{ background: C.bg, borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.textSub, marginBottom: 10 }}>주문 상품</div>
                {items.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: i < items.length - 1 ? `1px solid ${C.border}` : "none" }}>
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: C.surface, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{item.thumb}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: C.text }}>{item.name}</div>
                      <div style={{ fontSize: 10, color: C.textHint }}>{item.opt} · 수량 {item.qty}개</div>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>₩{(item.price * item.qty).toLocaleString()}</div>
                  </div>
                ))}
              </div>

              {/* 2열 정보 */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {/* 배송지 */}
                <div style={{ background: C.bg, borderRadius: 10, padding: "12px 14px" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: C.textSub, marginBottom: 8 }}>배송지 정보</div>
                  {[["받는 분", order.cust], ["연락처", "010-****-2847"], ["주소", "서울시 강남구 테헤란로 00, 00동 000호"], ["배송 메모", "문 앞에 놔주세요"]].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", gap: 8, fontSize: 11, marginBottom: 5 }}>
                      <span style={{ color: C.textHint, flexShrink: 0, width: 55 }}>{k}</span>
                      <span style={{ color: C.text, fontWeight: 500 }}>{v}</span>
                    </div>
                  ))}
                </div>
                {/* 결제 요약 */}
                <div style={{ background: C.bg, borderRadius: 10, padding: "12px 14px" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: C.textSub, marginBottom: 8 }}>결제 요약</div>
                  {[["상품 금액", `₩${subtotal.toLocaleString()}`], ["배송비", shipping === 0 ? "무료" : `₩${shipping.toLocaleString()}`], ["할인 금액", `-₩${discount.toLocaleString()}`]].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 5 }}>
                      <span style={{ color: C.textHint }}>{k}</span>
                      <span style={{ color: v.startsWith("-") ? C.green : C.text }}>{v}</span>
                    </div>
                  ))}
                  <div style={{ height: 1, background: C.border, margin: "8px 0" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700 }}>
                    <span>최종 결제</span>
                    <span style={{ color: C.text }}>₩{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 배송 현황 탭 */}
          {activeTab === "배송 현황" && (
            <>
              <div style={{ background: C.bg, borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.textSub, marginBottom: 8 }}>배송 정보</div>
                {[["택배사", "CJ대한통운"], ["송장번호", "541-2847-0382"], ["수령인", order.cust], ["배송지", "서울시 강남구 테헤란로 00"]].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", gap: 8, fontSize: 11, marginBottom: 5 }}>
                    <span style={{ color: C.textHint, width: 55, flexShrink: 0 }}>{k}</span>
                    <span style={{ color: C.text, fontWeight: 500, fontFamily: k === "송장번호" ? "monospace" : "inherit" }}>{v}</span>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.textSub, marginBottom: 10 }}>배송 타임라인</div>
                {timeline.map((t, i) => (
                  <div key={t.status} style={{ display: "flex", gap: 12, paddingBottom: 12 }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 16, flexShrink: 0 }}>
                      <div style={{ width: 12, height: 12, borderRadius: "50%", background: t.done ? C.green : C.border, border: `2px solid ${t.done ? C.green : C.border}`, flexShrink: 0 }} />
                      {i < timeline.length - 1 && <div style={{ flex: 1, width: 1.5, background: C.border, marginTop: 3 }} />}
                    </div>
                    <div style={{ paddingBottom: 4, flex: 1 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 2 }}>
                        <span style={{ fontSize: 12, fontWeight: t.done ? 600 : 400, color: t.done ? C.text : C.textHint }}>{t.status}</span>
                        <span style={{ fontSize: 10, color: C.textHint }}>{t.time}</span>
                      </div>
                      <div style={{ fontSize: 11, color: C.textSub }}>{t.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* 결제 내역 탭 */}
          {activeTab === "결제 내역" && (
            <>
              <div style={{ background: C.bg, borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.textSub, marginBottom: 8 }}>결제 정보</div>
                {[["결제 수단", order.pay], ["결제 일시", order.date], ["승인 번호", "12345678"], ["카드사", "신한카드"], ["할부", "일시불"]].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, padding: "5px 0", borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ color: C.textHint }}>{k}</span>
                    <span style={{ fontWeight: 500, color: C.text }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: C.bg, borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.textSub, marginBottom: 8 }}>금액 상세</div>
                {[["상품 금액", `₩${subtotal.toLocaleString()}`], ["배송비", "무료"], ["쿠폰 할인", `-₩${discount.toLocaleString()}`], ["포인트 사용", "—"]].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, padding: "5px 0", borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ color: C.textHint }}>{k}</span>
                    <span style={{ color: v.startsWith("-") ? C.green : C.text }}>{v}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 4px", fontSize: 14, fontWeight: 800 }}>
                  <span>최종 결제금액</span>
                  <span style={{ color: C.text }}>₩{total.toLocaleString()}</span>
                </div>
              </div>
              {order.status === "취소" && (
                <div style={{ background: C.redBg, border: `1px solid ${C.red}`, borderRadius: 10, padding: "12px 14px" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: C.redText, marginBottom: 8 }}>환불 정보</div>
                  {[["환불 금액", `₩${total.toLocaleString()}`], ["환불 수단", order.pay], ["환불 처리일", "06/10"], ["환불 예정일", "06/12 ~ 06/15"]].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, padding: "4px 0" }}>
                      <span style={{ color: C.redText }}>{k}</span>
                      <span style={{ fontWeight: 500, color: C.redText }}>{v}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* 처리 이력 탭 */}
          {activeTab === "처리 이력" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {[
                { action: "주문 접수", admin: "시스템", time: "06/10 14:32", note: "고객 주문 자동 접수" },
                { action: "결제 확인", admin: "시스템", time: "06/10 14:33", note: `${order.pay} 결제 완료` },
                { action: "상품 준비 시작", admin: "이운영", time: "06/10 15:00", note: "출고 준비 시작" },
                { action: "배송 처리", admin: "정물류", time: "06/11 08:00", note: "CJ대한통운 출고 · 송장 541-2847-0382" },
                { action: "고객 배송 알림", admin: "시스템", time: "06/11 08:05", note: "카카오 알림톡 발송 완료" },
              ].map((log, i) => (
                <div key={i} style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: log.admin === "시스템" ? C.bg : C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: log.admin === "시스템" ? C.textHint : "#fff", flexShrink: 0 }}>
                    {log.admin === "시스템" ? "⚙" : log.admin[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 2 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{log.action}</span>
                      <span style={{ fontSize: 10, color: C.textHint }}>by {log.admin}</span>
                    </div>
                    <div style={{ fontSize: 11, color: C.textSub }}>{log.note}</div>
                  </div>
                  <div style={{ fontSize: 10, color: C.textHint, flexShrink: 0 }}>{log.time}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── 화면 2: 주문 관리 ────────────────────────────────────────
function Orders() {
  const [orderDetail, setOrderDetail] = useState(null);
  const stats = [
    { label: "전체 주문", val: "1,284", badge: "전체", color: "gray" },
    { label: "입금 대기", val: "28", badge: "확인 필요", color: "amber" },
    { label: "결제 완료", val: "156", badge: "처리 대기", color: "green" },
    { label: "배송 중", val: "342", badge: "진행 중", color: "blue" },
    { label: "취소·반품", val: "18", badge: "처리 필요", color: "red" },
  ];
  const orders = [
    { id: "#000284", date: "06/10 14:32", cust: "홍*동", prod: "프리미엄 후디 외 1건", qty: 2, amt: "₩89,000", pay: "카드", status: "결제완료" },
    { id: "#000283", date: "06/10 13:15", cust: "김*연", prod: "클래식 티셔츠", qty: 1, amt: "₩39,000", pay: "카카오페이", status: "배송중" },
    { id: "#000282", date: "06/10 11:48", cust: "이*준", prod: "데님 팬츠 외 2건", qty: 3, amt: "₩142,000", pay: "무통장", status: "입금대기" },
    { id: "#000281", date: "06/09 18:22", cust: "박*서", prod: "캐주얼 자켓", qty: 1, amt: "₩78,000", pay: "네이버페이", status: "취소" },
    { id: "#000280", date: "06/09 16:05", cust: "최*민", prod: "스트리트 팬츠", qty: 1, amt: "₩52,000", pay: "카드", status: "배송완료" },
    { id: "#000279", date: "06/09 14:30", cust: "정*아", prod: "오버핏 티셔츠", qty: 2, amt: "₩62,000", pay: "카드", status: "결제완료" },
  ];
  const actionMap = { "결제완료": ["상세", "배송"], "배송중": ["상세", "송장"], "입금대기": ["상세", "확인"], "취소": ["상세", "환불"], "배송완료": ["상세"] };
  return (
<>
      {orderDetail && <OrderDetailModal order={orderDetail} onClose={() => setOrderDetail(null)} C={C} />}
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button style={styles.btn()} onClick={() => exportOrders(orders)}>↓ 주문 내보내기</button>
        <button style={styles.btn()}>🖨 일괄 출력</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: 8 }}>
        {stats.map(s => (
          <div key={s.label} style={{ ...styles.card, cursor: "pointer", paddingTop: 10, paddingBottom: 10 }}>
            <div style={styles.kpiLabel}>{s.label}</div>
            <div style={{ ...styles.kpiValue, fontSize: 18 }}>{s.val}</div>
            <span style={styles.badge(s.color)}>{s.badge}</span>
          </div>
        ))}
      </div>
      <div style={styles.filterBar}>
        <div style={{ ...styles.searchBox, flex: 1 }}>🔍 주문번호·고객명·상품명 검색...</div>
        <select style={styles.select}><option>주문 상태 전체</option><option>입금 대기</option><option>결제 완료</option><option>배송 중</option><option>취소·반품</option></select>
        <select style={styles.select}><option>결제 수단 전체</option><option>신용카드</option><option>무통장입금</option><option>카카오페이</option><option>네이버페이</option></select>
        <div style={{ ...styles.searchBox, width: 160, flex: "none" }}>📅 날짜 범위 선택</div>
      </div>
      <div style={{ ...styles.card, padding: "8px 12px", display: "flex", alignItems: "center", gap: 8, fontSize: 11 }}>
        <span style={{ color: C.textHint }}>선택된 항목</span>
        <span style={{ flex: 1 }} />
        <button style={styles.smBtn}>🚚 배송 처리</button>
        <button style={styles.smBtn}>🖨 송장 출력</button>
        <button style={{ ...styles.smBtn, color: C.red }}>✕ 취소 처리</button>
      </div>
      <div style={styles.tableWrap}>
        <table style={{ ...styles.table, tableLayout: "fixed" }}>
          <thead><tr>
            <Th style={{ width: 80 }}>주문번호</Th>
            <Th style={{ width: 80 }}>주문일시</Th>
            <Th style={{ width: 60 }}>고객명</Th>
            <Th>주문 상품</Th>
            <Th style={{ width: 40, textAlign: "center" }}>수량</Th>
            <Th style={{ width: 80, textAlign: "right" }}>결제금액</Th>
            <Th style={{ width: 70 }}>결제수단</Th>
            <Th style={{ width: 70, textAlign: "center" }}>상태</Th>
            <Th style={{ width: 90, textAlign: "right" }}>관리</Th>
          </tr></thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} style={{ background: C.surface }}>
                <Td style={{ color: C.blue, fontWeight: 600, fontSize: 10 }}>{o.id}</Td>
                <Td style={{ fontSize: 10, color: C.textHint }}>{o.date}</Td>
                <Td style={{ fontWeight: 500, color: C.text }}>{o.cust}</Td>
                <Td style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.prod}</Td>
                <Td style={{ textAlign: "center" }}>{o.qty}</Td>
                <Td style={{ textAlign: "right", fontWeight: 600, color: C.text }}>{o.amt}</Td>
                <Td>{o.pay}</Td>
                <Td style={{ textAlign: "center" }}><StatusBadge status={o.status} /></Td>
                <Td style={{ textAlign: "right" }}>
<div style={{ display: "flex", gap: 3, justifyContent: "flex-end" }}>
                    {(actionMap[o.status] || ["상세"]).map(a => (
                      <button key={a} style={styles.smBtn} onClick={() => a === "상세" ? setOrderDetail(o) : null}>{a}</button>
                    ))}
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={styles.pagination}>
          <span style={{ fontSize: 11, color: C.textHint }}>총 1,284건 중 1–20 표시</span>
          <div style={{ display: "flex", gap: 4 }}>
            {["‹", "1", "2", "3", "···", "65", "›"].map((p, i) => <div key={i} style={styles.pageBtn(p === "1")}>{p}</div>)}
          </div>
        </div>
      </div>
    </>
  );
}

// ── 화면 3: 배송 현황 ────────────────────────────────────────
function Shipping() {
  const [selected, setSelected] = useState(0);
  const stats = [
    { label: "배송 준비 중", val: "28건", badge: "처리 필요", color: "amber" },
    { label: "배송 중", val: "342건", badge: "진행 중", color: "blue" },
    { label: "배송 완료", val: "184건", badge: "오늘 기준", color: "green" },
    { label: "배송 지연", val: "3건", badge: "즉시 확인", color: "red" },
    { label: "평균 배송일", val: "1.8일", badge: "이번 주", color: "gray" },
  ];
  const list = [
    { id: "#000283", cust: "홍*동", prod: "프리미엄 후디 외 1건", invoice: "541-2847-0382", courier: "CJ대한통운", status: "배송중" },
    { id: "#000282", cust: "김*연", prod: "클래식 티셔츠", invoice: "미등록", courier: "—", status: "준비중" },
    { id: "#000281", cust: "이*준", prod: "데님 팬츠", invoice: "312-9821-4410", courier: "한진택배", status: "지연" },
    { id: "#000280", cust: "박*서", prod: "캐주얼 자켓 외 2건", invoice: "782-1039-5521", courier: "로젠택배", status: "배송완료" },
    { id: "#000279", cust: "최*민", prod: "스트리트 팬츠", invoice: "221-4839-1100", courier: "우체국", status: "배송중" },
  ];
  const timeline = [
    { status: "결제 완료", time: "06/09 14:32", done: true },
    { status: "상품 준비 완료", time: "06/09 18:10", done: true },
    { status: "배송 중", time: "06/10 08:22", done: true, desc: "수원 물류센터 출발 → 강남 지점 이동 중" },
    { status: "배송 완료 (예정)", time: "06/10 이내", done: false },
  ];
  const sel = list[selected];
  return (
    <>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button style={styles.btn()}>📋 송장 일괄 등록</button>
        <button style={styles.btn()} onClick={() => downloadCSV("배송현황",
  ["주문번호", "고객명", "상품", "송장번호", "택배사", "상태"],
  list.map(r => [r.id, r.cust, r.prod, r.invoice, r.courier, r.status])
)}>↓ CSV 내보내기</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: 8 }}>
        {stats.map(s => (
          <div key={s.label} style={{ ...styles.card, paddingTop: 10, paddingBottom: 10 }}>
            <div style={styles.kpiLabel}>{s.label}</div>
            <div style={{ ...styles.kpiValue, fontSize: 17, color: s.color === "red" ? C.red : C.text }}>{s.val}</div>
            <span style={styles.badge(s.color)}>{s.badge}</span>
          </div>
        ))}
      </div>
      <div style={styles.filterBar}>
        <div style={{ ...styles.searchBox, flex: 1 }}>🔍 주문번호·송장번호·고객명 검색...</div>
        <select style={styles.select}><option>배송 상태 전체</option><option>준비 중</option><option>배송 중</option><option>배송 완료</option><option>지연</option></select>
        <select style={styles.select}><option>택배사 전체</option><option>CJ대한통운</option><option>한진택배</option><option>로젠택배</option><option>우체국</option></select>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.6fr) minmax(0,1fr)", gap: 12 }}>
        <div style={styles.tableWrap}>
          <table style={{ ...styles.table, tableLayout: "fixed" }}>
            <thead><tr>
              <Th style={{ width: 70 }}>주문번호</Th>
              <Th style={{ width: 55 }}>고객명</Th>
              <Th>상품</Th>
              <Th style={{ width: 100 }}>송장번호</Th>
              <Th style={{ width: 65 }}>택배사</Th>
              <Th style={{ width: 65, textAlign: "center" }}>상태</Th>
              <Th style={{ width: 45, textAlign: "right" }}>관리</Th>
            </tr></thead>
            <tbody>
              {list.map((r, i) => (
                <tr key={r.id} onClick={() => setSelected(i)} style={{ cursor: "pointer", background: selected === i ? C.bg : C.surface }}>
                  <Td style={{ color: C.blue, fontWeight: 600, fontSize: 10 }}>{r.id}</Td>
                  <Td style={{ fontWeight: 500, color: C.text }}>{r.cust}</Td>
                  <Td style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.prod}</Td>
                  <Td style={{ fontSize: 10, fontFamily: "monospace", color: r.invoice === "미등록" ? C.amber : C.textSub }}>{r.invoice}</Td>
                  <Td style={{ fontSize: 10 }}>{r.courier}</Td>
                  <Td style={{ textAlign: "center" }}><StatusBadge status={r.status} /></Td>
                  <Td style={{ textAlign: "right" }}><button style={styles.smBtn}>{r.invoice === "미등록" ? "등록" : "추적"}</button></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ ...styles.card, display: "flex", flexDirection: "column", gap: 10 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>배송 추적 — {sel.id}</div>
            <div style={{ fontSize: 10, color: C.textHint, marginTop: 2 }}>{sel.courier} · 송장번호 {sel.invoice}</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {[["받는 분", sel.cust], ["연락처", "010-****-2847"], ["배송지", "서울시 강남구 테헤란로 00"]].map(([k, v]) => (
              <div key={k} style={{ gridColumn: k === "배송지" ? "1/-1" : "auto" }}>
                <div style={{ fontSize: 10, color: C.textHint }}>{k}</div>
                <div style={{ fontSize: 11, fontWeight: 500 }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ height: 90, background: C.bg, borderRadius: 8, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 4 }}>
            <div style={{ fontSize: 20 }}>🗺</div>
            <div style={{ fontSize: 10, color: C.textHint }}>배송 위치 지도</div>
          </div>
          <div>
            {timeline.map((t, i) => (
              <div key={t.status} style={{ display: "flex", gap: 10, paddingBottom: 8 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 14, flexShrink: 0 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: t.done ? C.green : C.border, border: `2px solid ${t.done ? C.green : C.border}`, flexShrink: 0 }} />
                  {i < timeline.length - 1 && <div style={{ flex: 1, width: 1, background: C.border, marginTop: 2 }} />}
                </div>
                <div style={{ paddingBottom: 4 }}>
                  <div style={{ fontSize: 11, fontWeight: t.done ? 600 : 400, color: t.done ? C.text : C.textHint }}>{t.status}</div>
                  <div style={{ fontSize: 10, color: C.textHint }}>{t.time}</div>
                  {t.desc && <div style={{ fontSize: 10, color: C.textSub, marginTop: 2 }}>{t.desc}</div>}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button style={{ ...styles.btn(), flex: 1, justifyContent: "center" }}>📨 안내 재발송</button>
            <button style={{ ...styles.btn("danger"), flex: 1, justifyContent: "center" }}>⚠ 지연 처리</button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── 화면 4: 상품 등록 ────────────────────────────────────────
function Products() {
  const stockRows = [["블랙 / S", "SKU-001", "42"], ["블랙 / M", "SKU-002", "38"], ["화이트 / S", "SKU-003", "15"], ["화이트 / M", "SKU-004", "27"]];
  return (
    <>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button style={styles.btn()}>임시저장</button>
        <button style={{ ...styles.btn("danger") }}>삭제</button>
        <button style={styles.btn("primary")}>✓ 저장 및 게시</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,2fr) minmax(0,1fr)", gap: 14 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={styles.card}>
            <div style={styles.cardTitle}>기본 정보</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div><div style={{ fontSize: 10, color: C.textSub, marginBottom: 3 }}>상품명 <span style={{ color: C.red }}>*</span></div><input style={styles.input} placeholder="상품 이름을 입력하세요" /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div><div style={{ fontSize: 10, color: C.textSub, marginBottom: 3 }}>카테고리 *</div><select style={{ ...styles.input, height: 32 }}><option>카테고리 선택</option><option>의류</option><option>신발</option><option>악세서리</option></select></div>
                <div><div style={{ fontSize: 10, color: C.textSub, marginBottom: 3 }}>서브 카테고리</div><select style={{ ...styles.input, height: 32 }}><option>서브 선택</option></select></div>
              </div>
              <div><div style={{ fontSize: 10, color: C.textSub, marginBottom: 3 }}>상품 설명</div><textarea style={{ ...styles.input, height: 72, padding: 8, resize: "none" }} placeholder="상품에 대한 설명을 입력하세요. 고객에게 노출됩니다." /></div>
              <div>
                <div style={{ fontSize: 10, color: C.textSub, marginBottom: 5 }}>태그</div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  {["프리미엄", "베스트셀러", "신상품"].map(t => <span key={t} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 10, background: C.bg, border: `1px solid ${C.border}`, color: C.textSub }}>{t} ✕</span>)}
                  <span style={{ fontSize: 10, color: C.blue, cursor: "pointer" }}>+ 태그 추가</span>
                </div>
              </div>
            </div>
          </div>
          <div style={styles.card}>
            <div style={styles.cardTitle}>상품 이미지</div>
            <div style={{ border: `1px dashed ${C.borderMid}`, borderRadius: 8, height: 90, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, cursor: "pointer", background: C.bg }}>
              <div style={{ fontSize: 22 }}>☁</div>
              <div style={{ fontSize: 11, color: C.textSub }}>클릭하거나 파일을 드래그하세요</div>
              <div style={{ fontSize: 10, color: C.textHint }}>PNG, JPG 최대 10MB · 권장 800×800px</div>
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
              {[1, 2].map(i => <div key={i} style={{ width: 44, height: 44, borderRadius: 7, background: C.bg, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🖼</div>)}
              <div style={{ width: 44, height: 44, borderRadius: 7, border: `1px dashed ${C.borderMid}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, cursor: "pointer", color: C.textHint }}>+</div>
            </div>
            <div style={{ fontSize: 10, color: C.textHint, marginTop: 5 }}>첫 번째 이미지가 대표 이미지로 사용됩니다.</div>
          </div>
          <div style={styles.card}>
            <div style={styles.cardTitle}>옵션 및 재고</div>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 10, color: C.textSub, marginBottom: 5 }}>옵션 유형</div>
              <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                {["색상", "사이즈"].map(o => <span key={o} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 10, background: C.blueBg, color: C.blueText, border: "none" }}>{o} ✕</span>)}
                <span style={{ fontSize: 10, color: C.blue, cursor: "pointer" }}>+ 옵션 추가</span>
              </div>
            </div>
            <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", background: C.bg }}>
                {["옵션 조합", "SKU", "재고 수량"].map(h => <div key={h} style={{ ...styles.th, padding: "7px 10px" }}>{h}</div>)}
              </div>
              {stockRows.map(([opt, sku, qty], i) => (
                <div key={opt} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", borderTop: `1px solid ${C.border}` }}>
                  <div style={{ ...styles.td, borderBottom: "none" }}>{opt}</div>
                  <div style={{ ...styles.td, borderBottom: "none" }}><input style={{ ...styles.input, height: 24, fontSize: 11 }} defaultValue={sku} /></div>
                  <div style={{ ...styles.td, borderBottom: "none" }}><input style={{ ...styles.input, height: 24, fontSize: 11 }} defaultValue={qty} /></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={styles.card}>
            <div style={styles.cardTitle}>가격 설정</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div><div style={{ fontSize: 10, color: C.textSub, marginBottom: 3 }}>정가 *</div><input style={styles.input} placeholder="₩ 0" /></div>
              <div><div style={{ fontSize: 10, color: C.textSub, marginBottom: 3 }}>할인 판매가</div><input style={styles.input} placeholder="₩ 0" /><div style={{ fontSize: 10, color: C.textHint, marginTop: 2 }}>설정 시 정가에 취소선 표시</div></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div><div style={{ fontSize: 10, color: C.textSub, marginBottom: 3 }}>부가세</div><select style={{ ...styles.input, height: 32 }}><option>과세</option><option>면세</option></select></div>
                <div><div style={{ fontSize: 10, color: C.textSub, marginBottom: 3 }}>배송비</div><input style={styles.input} placeholder="₩ 0" /></div>
              </div>
            </div>
          </div>
          <div style={styles.card}>
            <div style={styles.cardTitle}>판매 설정</div>
            {[["판매 활성화", true], ["메인 노출", true], ["리뷰 허용", true], ["재고 소진 시 주문 허용", false]].map(([label, on]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 11, color: C.textSub }}>{label}</span>
                <div style={{ width: 30, height: 16, borderRadius: 8, background: on ? C.green : C.border, position: "relative", cursor: "pointer" }}>
                  <div style={{ position: "absolute", top: 2, left: on ? 14 : 2, width: 12, height: 12, borderRadius: "50%", background: "#fff", transition: "left 0.15s" }} />
                </div>
              </div>
            ))}
          </div>
          <div style={styles.card}>
            <div style={styles.cardTitle}>SEO 설정</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div><div style={{ fontSize: 10, color: C.textSub, marginBottom: 3 }}>검색 제목</div><input style={styles.input} placeholder="검색 엔진 표시 제목" /></div>
              <div><div style={{ fontSize: 10, color: C.textSub, marginBottom: 3 }}>메타 설명</div><textarea style={{ ...styles.input, height: 52, padding: 8, resize: "none" }} placeholder="검색 결과 미리보기 설명 (160자 이내)" /></div>
              <div style={{ background: C.bg, borderRadius: 7, padding: "8px 10px" }}>
                <div style={{ fontSize: 11, color: C.blue }}>상품명 — ShopAdmin</div>
                <div style={{ fontSize: 10, color: C.green }}>https://yourstore.com/products/상품-슬러그</div>
                <div style={{ fontSize: 10, color: C.textSub, marginTop: 2 }}>메타 설명이 여기에 표시됩니다. 검색 결과에서 노출되는 미리보기입니다.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── 화면 5: 고객 프로필 ──────────────────────────────────────
function Customers() {
  const [tab, setTab] = useState("주문 내역");
  const tabs = ["주문 내역", "구매 분석", "리뷰", "쿠폰·포인트"];
  const orders = [
    { id: "#000284", prod: "프리미엄 후디 외 1건", date: "06/10", amt: "₩89,000", status: "결제완료" },
    { id: "#000251", prod: "클래식 티셔츠", date: "05/28", amt: "₩39,000", status: "배송완료" },
    { id: "#000219", prod: "데님 팬츠 외 2건", date: "05/12", amt: "₩142,000", status: "배송완료" },
    { id: "#000188", prod: "캐주얼 자켓", date: "04/30", amt: "₩78,000", status: "배송완료" },
  ];
  const cats = [["의류", 72], ["신발", 48], ["악세서리", 31], ["기타", 12]];
  const reviews = [
    { stars: 5, prod: "프리미엄 후디", date: "06/10", text: "품질이 정말 좋아요. 소재가 고급스럽고 착용감도 훌륭합니다." },
    { stars: 4, prod: "클래식 티셔츠", date: "05/30", text: "배송이 빠르고 포장이 꼼꼼했습니다." },
  ];
  const coupons = [
    { code: "VIPGOLD10", name: "VIP 골드 전용 할인", disc: "10%", exp: "~12.31", status: "사용가능" },
    { code: "WELCOME5000", name: "신규 웰컴 쿠폰", disc: "₩5,000", exp: "상시", status: "사용완료" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,2fr)", gap: 14, alignItems: "start" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ ...styles.card, textAlign: "center", paddingTop: 20, paddingBottom: 16 }}>
          <div style={{ ...styles.avatar, width: 52, height: 52, fontSize: 20, margin: "0 auto 10px", background: C.bg }}>홍</div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>홍길동</div>
          <div style={{ fontSize: 11, color: C.textHint, margin: "3px 0" }}>hong***@email.com</div>
          <span style={styles.badge("amber")}>⭐ VIP 골드 회원</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[["총 주문 수", "48건"], ["총 구매액", "₩284만"], ["적립 포인트", "4,280P"], ["평균 주문액", "₩59,200"]].map(([k, v]) => (
            <div key={k} style={{ ...styles.card, background: C.bg, padding: "10px 12px" }}>
              <div style={styles.kpiLabel}>{k}</div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={styles.card}>
          <div style={{ fontSize: 10, color: C.textHint, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 8 }}>연락처 정보</div>
          {[["휴대폰", "010-****-2847"], ["배송지", "서울시 강남구 테헤란로 00"], ["가입일", "2023.03.15"], ["최근 방문", "2일 전"]].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, padding: "4px 0", borderBottom: `1px solid ${C.border}` }}>
              <span style={{ color: C.textHint }}>{k}</span><span style={{ fontWeight: 500 }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={styles.card}>
          <div style={{ fontSize: 10, color: C.textHint, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 8 }}>관심 카테고리</div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {["의류", "신발", "악세서리"].map(t => <span key={t} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 10, background: C.bg, border: `1px solid ${C.border}` }}>{t}</span>)}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button style={{ ...styles.btn(), flex: 1, justifyContent: "center" }}>📧 이메일</button>
          <button style={{ ...styles.btn(), flex: 1, justifyContent: "center" }}>🎫 쿠폰 지급</button>
          <button style={{ ...styles.btn("danger") }}>🚫</button>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", borderBottom: `1px solid ${C.border}` }}>
          {tabs.map(t => (
            <div key={t} onClick={() => setTab(t)} style={{ fontSize: 11, padding: "8px 14px", cursor: "pointer", color: tab === t ? C.text : C.textHint, fontWeight: tab === t ? 700 : 400, borderBottom: tab === t ? `2px solid ${C.accent}` : "2px solid transparent", marginBottom: -1 }}>{t}</div>
          ))}
        </div>
        {tab === "주문 내역" && (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead><tr><Th>주문번호</Th><Th>상품</Th><Th>날짜</Th><Th style={{ textAlign: "right" }}>금액</Th><Th style={{ textAlign: "center" }}>상태</Th></tr></thead>
              <tbody>{orders.map(o => <tr key={o.id}><Td style={{ color: C.blue, fontWeight: 600, fontSize: 10 }}>{o.id}</Td><Td>{o.prod}</Td><Td style={{ fontSize: 10 }}>{o.date}</Td><Td style={{ textAlign: "right", fontWeight: 600 }}>{o.amt}</Td><Td style={{ textAlign: "center" }}><StatusBadge status={o.status} /></Td></tr>)}</tbody>
            </table>
          </div>
        )}
        {tab === "구매 분석" && (
          <div style={styles.card}>
            <div style={styles.cardTitle}>카테고리별 구매 비중</div>
            {cats.map(([cat, pct]) => (
              <div key={cat} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 10, color: C.textSub, width: 50, textAlign: "right" }}>{cat}</span>
                <div style={{ flex: 1, height: 8, background: C.bg, borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: C.accent, borderRadius: 4 }} />
                </div>
                <span style={{ fontSize: 10, color: C.textHint, width: 28 }}>{pct}%</span>
              </div>
            ))}
          </div>
        )}
        {tab === "리뷰" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {reviews.map((r, i) => (
              <div key={i} style={styles.card}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                  <span style={{ color: C.amber, fontSize: 12 }}>{"★".repeat(r.stars)}{"☆".repeat(5 - r.stars)}</span>
                  <span style={{ fontSize: 10, color: C.textHint }}>{r.prod}</span>
                  <span style={{ fontSize: 10, color: C.textHint, marginLeft: "auto" }}>{r.date}</span>
                </div>
                <div style={{ fontSize: 11, color: C.textSub, lineHeight: 1.5 }}>{r.text}</div>
              </div>
            ))}
          </div>
        )}
        {tab === "쿠폰·포인트" && (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead><tr><Th>쿠폰 코드</Th><Th>쿠폰명</Th><Th>할인</Th><Th>유효기간</Th><Th style={{ textAlign: "center" }}>상태</Th></tr></thead>
              <tbody>{coupons.map(c => <tr key={c.code}><Td style={{ fontFamily: "monospace", fontWeight: 600, color: C.text }}>{c.code}</Td><Td>{c.name}</Td><Td style={{ color: C.green, fontWeight: 600 }}>{c.disc}</Td><Td style={{ fontSize: 10 }}>{c.exp}</Td><Td style={{ textAlign: "center" }}><StatusBadge status={c.status} /></Td></tr>)}</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── 화면 6: 프로모션·쿠폰 ────────────────────────────────────
function Promotions() {
  const [tab, setTab] = useState("프로모션");
  const promos = [
    { title: "여름 시즌 세일", type: "전 상품 20% 할인", period: "06/01 — 06/30", target: "전체 회원", status: "진행 중", progress: 70, progressLabel: "D-20" },
    { title: "신규 회원 웰컴 쿠폰", type: "첫 구매 ₩5,000 즉시 할인", period: "상시 운영", target: "신규 회원", status: "진행 중", progress: 85, progressLabel: "850/1000장" },
    { title: "가을 신상 사전예약", type: "무료 배송 + 15% 할인", period: "09/01 — 09/30", target: "VIP 회원", status: "예정", progress: 0, progressLabel: "D-83" },
  ];
  const coupons = [
    { code: "VIPGOLD10", name: "VIP 골드 전용 할인", disc: "10%", exp: "~12.31", usage: 60, usageLabel: "600/1000", status: "활성" },
    { code: "WELCOME5000", name: "신규 웰컴 쿠폰", disc: "₩5,000", exp: "상시", usage: 85, usageLabel: "850/1000", status: "활성" },
    { code: "SUMMER30", name: "여름 시즌 30%", disc: "30%", exp: "~06.30", usage: 40, usageLabel: "400/1000", status: "종료" },
  ];
  const statusColor = { "진행 중": "green", "예정": "blue", "종료": "gray", "활성": "green" };
  return (
    <>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button style={styles.btn("primary")}>+ 프로모션 생성</button>
        <button style={styles.btn()}>🎫 쿠폰 발급</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 8 }}>
        {[["진행 중 프로모션", "2개", "예정 1개 포함"], ["발급된 쿠폰", "2,850장", "사용률 51%"], ["할인 적용 주문", "342건", "전주 대비 +18%"], ["할인 총액", "₩84만", "이번 달 누계"]].map(([k, v, s]) => (
          <div key={k} style={{ ...styles.card, paddingTop: 10, paddingBottom: 10 }}>
            <div style={styles.kpiLabel}>{k}</div>
            <div style={{ ...styles.kpiValue, fontSize: 18 }}>{v}</div>
            <div style={styles.kpiSub}>{s}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", borderBottom: `1px solid ${C.border}` }}>
        {["프로모션", "쿠폰 목록", "자동 발급 규칙", "성과 분석"].map(t => (
          <div key={t} onClick={() => setTab(t)} style={{ fontSize: 11, padding: "8px 14px", cursor: "pointer", color: tab === t ? C.text : C.textHint, fontWeight: tab === t ? 700 : 400, borderBottom: tab === t ? `2px solid ${C.accent}` : "2px solid transparent", marginBottom: -1 }}>{t}</div>
        ))}
      </div>
      {tab === "프로모션" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 12 }}>
          {promos.map(p => (
            <div key={p.title} style={styles.card}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{p.title}</span>
                    <StatusBadge status={p.status} />
                  </div>
                  <div style={{ fontSize: 10, color: C.textSub }}>{p.type}</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 8, fontSize: 10, color: C.textSub }}>
                <div>📅 {p.period}</div>
                <div>👥 대상: {p.target}</div>
              </div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.textHint, marginBottom: 3 }}>
                  <span>{p.status === "예정" ? "시작까지" : "진행률"}</span><span>{p.progressLabel}</span>
                </div>
                <div style={{ height: 5, background: C.bg, borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: `${p.progress}%`, height: "100%", background: p.progress > 80 ? C.amber : C.accent, borderRadius: 3 }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 5 }}>
                <button style={styles.smBtn}>상세 보기</button>
                <button style={styles.smBtn}>수정</button>
                <button style={{ ...styles.smBtn, color: C.red }}>종료</button>
              </div>
            </div>
          ))}
          <div style={{ ...styles.card, border: `1px dashed ${C.borderMid}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", minHeight: 160 }}>
            <div style={{ textAlign: "center", color: C.textHint }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>+</div>
              <div style={{ fontSize: 11 }}>새 프로모션 생성</div>
            </div>
          </div>
        </div>
      )}
      {tab === "쿠폰 목록" && (
        <div style={styles.tableWrap}>
          <table style={{ ...styles.table, tableLayout: "fixed" }}>
            <thead><tr>
              <Th style={{ width: 100 }}>쿠폰 코드</Th><Th>쿠폰명</Th><Th style={{ width: 70 }}>할인</Th>
              <Th style={{ width: 80 }}>유효기간</Th><Th style={{ width: 130 }}>사용 현황</Th>
              <Th style={{ width: 60, textAlign: "center" }}>상태</Th><Th style={{ width: 80, textAlign: "right" }}>관리</Th>
            </tr></thead>
            <tbody>
              {coupons.map(c => (
                <tr key={c.code}>
                  <Td style={{ fontFamily: "monospace", fontWeight: 700, color: C.text }}>{c.code}</Td>
                  <Td>{c.name}</Td>
                  <Td style={{ color: C.green, fontWeight: 700 }}>{c.disc}</Td>
                  <Td style={{ fontSize: 10 }}>{c.exp}</Td>
                  <Td>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div style={{ flex: 1, height: 4, background: C.bg, borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ width: `${c.usage}%`, height: "100%", background: c.usage > 80 ? C.amber : C.accent }} />
                      </div>
                      <span style={{ fontSize: 10, color: C.textHint, whiteSpace: "nowrap" }}>{c.usageLabel}</span>
                    </div>
                  </Td>
                  <Td style={{ textAlign: "center" }}><StatusBadge status={c.status} /></Td>
                  <Td style={{ textAlign: "right" }}><div style={{ display: "flex", gap: 3, justifyContent: "flex-end" }}><button style={styles.smBtn}>수정</button><button style={styles.smBtn}>복사</button></div></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {(tab === "자동 발급 규칙" || tab === "성과 분석") && (
        <div style={{ ...styles.card, textAlign: "center", padding: 40, color: C.textHint }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>📊</div>
          <div style={{ fontSize: 13 }}>{tab} 화면은 추가 구현 가능합니다</div>
        </div>
      )}
    </>
  );
}

// ── 화면 7: 리뷰·평점 관리 ──────────────────────────────────
function Reviews() {
  const bars = [[5, 65, "green"], [4, 20, "#7ec48a"], [3, 8, "amber"], [2, 4, "#e09060"], [1, 3, "red"]];
  const keywords = [["품질 좋음", 284], ["배송 빠름", 198], ["재구매 의사", 156], ["포장 꼼꼼", 92], ["사이즈 정확", 78], ["가성비", 64]];
  const reviews = [
    { name: "홍*동", stars: 5, prod: "프리미엄 후디 · 블랙/M", date: "06/10", text: "품질이 정말 좋아요. 소재가 생각보다 훨씬 고급스럽고 착용감도 훌륭합니다. 배송도 빠르게 왔고 재구매 의사 있습니다.", replied: true, status: "공개", flagged: false },
    { name: "이*준", stars: 2, prod: "클래식 티셔츠 · 화이트", date: "06/09", text: "기대했던 것과 달라서 실망했습니다. 사이즈가 맞지 않고 색상도 사진과 달랐어요.", replied: false, status: "검토 필요", flagged: true },
  ];
  return (
    <>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button style={styles.btn()}>↓ 리뷰 내보내기</button>
        <button style={styles.btn()}>⚙ 노출 설정</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,2fr) minmax(0,1.5fr)", gap: 12 }}>
        <div style={{ ...styles.card, textAlign: "center", paddingTop: 16 }}>
          <div style={styles.cardTitle}>전체 평점</div>
          <div style={{ fontSize: 38, fontWeight: 800, letterSpacing: "-1px" }}>4.3</div>
          <div style={{ fontSize: 16, color: C.amber, marginBottom: 4 }}>★★★★☆</div>
          <div style={{ fontSize: 11, color: C.textHint }}>리뷰 1,284개</div>
        </div>
        <div style={styles.card}>
          <div style={styles.cardTitle}>별점 분포</div>
          {bars.map(([star, pct, col]) => (
            <div key={star} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
              <span style={{ fontSize: 10, color: C.textSub, width: 20, textAlign: "right" }}>{star}★</span>
              <div style={{ flex: 1, height: 6, background: C.bg, borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: col === "green" ? C.green : col === "amber" ? C.amber : col === "red" ? C.red : col, borderRadius: 3 }} />
              </div>
              <span style={{ fontSize: 10, color: C.textHint, width: 26 }}>{pct}%</span>
            </div>
          ))}
        </div>
        <div style={styles.card}>
          <div style={styles.cardTitle}>자주 언급된 키워드</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {keywords.map(([kw, cnt]) => (
              <span key={kw} style={{ fontSize: 10, padding: "3px 9px", borderRadius: 10, background: C.bg, border: `1px solid ${C.border}`, color: C.textSub }}>
                {kw} <span style={{ color: C.textHint }}>{cnt}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
      <div style={styles.filterBar}>
        <div style={{ ...styles.searchBox, flex: 1 }}>🔍 내용·상품명·고객명 검색...</div>
        <select style={styles.select}><option>별점 전체</option><option>5★</option><option>4★</option><option>3★ 이하</option></select>
        <select style={styles.select}><option>노출 상태</option><option>공개</option><option>숨김</option><option>검토 필요</option></select>
        <select style={styles.select}><option>최신순</option><option>낮은 별점순</option><option>도움됨순</option></select>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {reviews.map((r, i) => (
          <div key={i} style={{ ...styles.card, borderLeft: r.flagged ? `3px solid ${C.red}` : `3px solid ${C.border}` }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 7 }}>
              <div style={{ ...styles.avatar, width: 30, height: 30, fontSize: 13, flexShrink: 0 }}>{r.name[0]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: 12 }}>{r.name}</span>
                  {r.flagged && <span style={styles.badge("red")}>🚩 신고됨</span>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: C.textHint, marginTop: 2 }}>
                  <span style={{ color: C.amber }}>{"★".repeat(r.stars)}{"☆".repeat(5 - r.stars)}</span>
                  <span>{r.date}</span>
                </div>
              </div>
              <StatusBadge status={r.status} />
            </div>
            <div style={{ fontSize: 10, color: C.textHint, marginBottom: 5 }}>📦 {r.prod}</div>
            <div style={{ fontSize: 11, color: C.textSub, lineHeight: 1.6, marginBottom: 8 }}>{r.text}</div>
            {r.replied ? (
              <div style={{ background: C.bg, borderRadius: 7, padding: "8px 10px", marginBottom: 8, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.textSub, marginBottom: 3 }}>🏪 판매자 답변</div>
                <div style={{ fontSize: 11, color: C.textSub }}>소중한 리뷰 감사합니다. 앞으로도 좋은 상품으로 찾아뵙겠습니다.</div>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                <input style={{ ...styles.input, height: 30 }} placeholder="판매자 답변을 입력하세요..." />
                <button style={{ ...styles.btn("primary"), whiteSpace: "nowrap" }}>답변 등록</button>
              </div>
            )}
            <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
              {r.replied && <button style={styles.smBtn}>답변 수정</button>}
              <button style={{ ...styles.smBtn, color: C.red }}>👁‍🗨 숨김</button>
              {r.flagged && <><button style={styles.smBtn}>✓ 검토 완료</button><button style={{ ...styles.smBtn, color: C.red }}>신고 처리</button></>}
              <span style={{ marginLeft: "auto", fontSize: 10, color: C.textHint }}>👍 도움됨 {r.flagged ? 2 : 48}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ── 화면 8: 결제 페이지 ──────────────────────────────────────
function Checkout() {
  const [payMethod, setPayMethod] = useState("신용카드");
  const payMethods = ["신용카드", "카카오페이", "네이버페이", "무통장입금", "토스페이", "포인트 전액"];
  const items = [
    { name: "프리미엄 후디", opt: "블랙 / M · 수량 1", price: "₩79,000" },
    { name: "클래식 티셔츠", opt: "화이트 · 수량 2", price: "₩39,000" },
  ];
  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: 16 }}>
        {[["1", "장바구니", true], ["2", "배송·결제", true, true], ["3", "주문 완료", false]].map(([num, label, done, active], i) => (
          <div key={label} style={{ display: "flex", alignItems: "center" }}>
            {i > 0 && <div style={{ width: 36, height: 1, background: C.border, margin: "0 6px" }} />}
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, background: active ? C.accent : done ? C.greenBg : C.bg, color: active ? "#fff" : done ? C.green : C.textHint, border: `1px solid ${active ? C.accent : done ? C.green : C.border}` }}>{done && !active ? "✓" : num}</div>
              <span style={{ fontSize: 11, color: active ? C.text : C.textHint, fontWeight: active ? 700 : 400 }}>{label}</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr)", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={styles.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>📍 배송지 선택</div>
              <span style={{ fontSize: 11, color: C.blue, cursor: "pointer" }}>+ 새 주소 추가</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[{ name: "홍길동", tag: "기본", addr: "서울시 강남구 테헤란로 00, 00아파트 000동 000호", tel: "010-1234-2847", sel: true }, { name: "홍길동 (회사)", tag: null, addr: "서울시 서초구 OO빌딩 00층", tel: "010-1234-2847", sel: false }].map(a => (
                <div key={a.name} style={{ padding: "9px 11px", borderRadius: 8, border: `1px solid ${a.sel ? C.borderMid : C.border}`, background: a.sel ? C.bg : C.surface, cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", border: `1.5px solid ${a.sel ? C.accent : C.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {a.sel && <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.accent }} />}
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 11 }}>{a.name}</span>
                    {a.tag && <span style={styles.badge("blue")}>{a.tag}</span>}
                  </div>
                  <div style={{ fontSize: 10, color: C.textHint, paddingLeft: 17, lineHeight: 1.5 }}>{a.addr}<br />{a.tel}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 10, color: C.textSub, marginBottom: 3 }}>배송 메모</div>
              <input style={styles.input} placeholder="배송 시 요청사항을 입력하세요" />
            </div>
          </div>
          <div style={styles.card}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>💳 결제 수단</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginBottom: 12 }}>
              {payMethods.map(m => (
                <div key={m} onClick={() => setPayMethod(m)} style={{ padding: "8px", borderRadius: 8, border: `1px solid ${payMethod === m ? C.borderMid : C.border}`, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer", background: payMethod === m ? C.bg : C.surface }}>
                  <div style={{ fontSize: 16 }}>{m === "신용카드" ? "💳" : m === "카카오페이" ? "💛" : m === "네이버페이" ? "🟢" : m === "무통장입금" ? "🏦" : m === "토스페이" ? "🔵" : "🪙"}</div>
                  <div style={{ fontSize: 10, color: payMethod === m ? C.text : C.textHint, fontWeight: payMethod === m ? 600 : 400 }}>{m}</div>
                </div>
              ))}
            </div>
            {payMethod === "신용카드" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div><div style={{ fontSize: 10, color: C.textSub, marginBottom: 3 }}>카드 번호 *</div><input style={styles.input} placeholder="0000 — 0000 — 0000 — 0000" /></div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  <div><div style={{ fontSize: 10, color: C.textSub, marginBottom: 3 }}>유효기간 *</div><input style={styles.input} placeholder="MM / YY" /></div>
                  <div><div style={{ fontSize: 10, color: C.textSub, marginBottom: 3 }}>CVC *</div><input style={styles.input} placeholder="000" /></div>
                  <div><div style={{ fontSize: 10, color: C.textSub, marginBottom: 3 }}>할부</div><select style={{ ...styles.input, height: 32 }}><option>일시불</option><option>3개월</option><option>6개월</option><option>12개월</option></select></div>
                </div>
              </div>
            )}
          </div>
          <div style={styles.card}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>🎫 쿠폰·포인트</div>
            <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
              <input style={styles.input} placeholder="쿠폰 코드 입력" />
              <button style={{ ...styles.btn("primary"), whiteSpace: "nowrap" }}>적용</button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", background: C.greenBg, borderRadius: 7, fontSize: 11, color: C.green, marginBottom: 10 }}>
              ✓ VIPGOLD10 — 10% 할인 적용됨
            </div>
            <div>
              <div style={{ fontSize: 10, color: C.textSub, marginBottom: 3 }}>포인트 사용 (보유: 4,280P)</div>
              <div style={{ display: "flex", gap: 6 }}>
                <input style={styles.input} placeholder="사용할 포인트 입력" />
                <button style={{ ...styles.btn(), whiteSpace: "nowrap" }}>전액 사용</button>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={styles.card}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>주문 상품 (2개)</div>
            {items.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 8, padding: "7px 0", borderBottom: i < items.length - 1 ? `1px solid ${C.border}` : "none" }}>
                <div style={{ width: 36, height: 36, borderRadius: 7, background: C.bg, border: `1px solid ${C.border}`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📦</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                  <div style={{ fontSize: 10, color: C.textHint }}>{item.opt}</div>
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{item.price}</div>
              </div>
            ))}
          </div>
          <div style={styles.card}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>결제 금액</div>
            {[["상품 금액", "₩118,000"], ["배송비", "₩3,000"], ["쿠폰 할인", "-₩11,800"], ["포인트 사용", "-₩4,280"]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, padding: "4px 0", borderBottom: `1px solid ${C.border}` }}>
                <span style={{ color: C.textSub }}>{k}</span>
                <span style={{ color: v.startsWith("-") ? C.green : C.text, fontWeight: v.startsWith("-") ? 600 : 400 }}>{v}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 800, padding: "10px 0 0", letterSpacing: "-0.3px" }}>
              <span>최종 결제금액</span><span>₩104,920</span>
            </div>
          </div>
          <button style={{ ...styles.btn("primary"), justifyContent: "center", padding: "14px", fontSize: 14, borderRadius: 10 }}>₩104,920 결제하기</button>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, fontSize: 10, color: C.textHint }}>🔒 SSL 보안 결제 · 개인정보 암호화</div>
        </div>
      </div>
    </div>
  );
}

// ── 알림 센터 패널 ────────────────────────────────────────────
const NOTIFICATIONS = [
  { id: 1, type: "order", icon: "🛒", title: "신규 주문 접수", desc: "홍*동님이 프리미엄 후디 외 1건을 주문했습니다.", time: "방금", read: false },
  { id: 2, type: "stock", icon: "📦", title: "재고 부족 경고", desc: "프리미엄 후디 (블랙/M) 재고가 3개 남았습니다.", time: "5분 전", read: false },
  { id: 3, type: "order", icon: "🛒", title: "입금 확인 대기", desc: "주문 #000282 무통장 입금 대기 중입니다.", time: "12분 전", read: false },
  { id: 4, type: "review", icon: "⭐", title: "리뷰 신고 접수", desc: "상품 '클래식 티셔츠' 리뷰가 신고되었습니다.", time: "1시간 전", read: true },
  { id: 5, type: "shipping", icon: "🚚", title: "배송 지연 감지", desc: "주문 #000279 예상 배송일이 초과되었습니다.", time: "2시간 전", read: true },
  { id: 6, type: "promo", icon: "🎫", title: "프로모션 종료 임박", desc: "여름 시즌 세일이 24시간 후 종료됩니다.", time: "3시간 전", read: true },
  { id: 7, type: "order", icon: "🛒", title: "주문 취소 요청", desc: "박*서님이 주문 #000281 취소를 요청했습니다.", time: "5시간 전", read: true },
  { id: 8, type: "stock", icon: "📦", title: "재고 소진", desc: "캐주얼 스니커즈 (화이트/250) 재고가 소진되었습니다.", time: "어제", read: true },
];

function NotificationPanel({ onClose, C }) {
  const [notifs, setNotifs] = useState(NOTIFICATIONS);
  const [filter, setFilter] = useState("전체");
  const unreadCount = notifs.filter(n => !n.read).length;
  const filters = ["전체", "주문", "재고", "배송", "리뷰"];
  const typeMap = { order: "주문", stock: "재고", shipping: "배송", review: "리뷰", promo: "마케팅" };

  const filtered = notifs.filter(n => {
    if (filter === "전체") return true;
    return typeMap[n.type] === filter;
  });

  const markAllRead = () => setNotifs(ns => ns.map(n => ({ ...n, read: true })));
  const markRead = (id) => setNotifs(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));
  const deleteNotif = (id) => setNotifs(ns => ns.filter(n => n.id !== id));

  return (
    <>
      {/* 배경 오버레이 */}
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.2)", zIndex: 150 }}
      />
      {/* 슬라이드 패널 */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width: 340, background: C.surface,
        borderLeft: `1px solid ${C.border}`,
        display: "flex", flexDirection: "column",
        zIndex: 151,
        boxShadow: "-4px 0 24px rgba(0,0,0,0.10)",
        animation: "slideIn 0.2s ease-out",
      }}>
        <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>

        {/* 헤더 */}
        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>알림</span>
              {unreadCount > 0 && (
                <span style={{ fontSize: 10, fontWeight: 700, background: C.red, color: "#fff", padding: "1px 7px", borderRadius: 10 }}>
                  {unreadCount}
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  style={{ fontSize: 10, color: C.blue, background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}
                >
                  모두 읽음
                </button>
              )}
              <div
                onClick={onClose}
                style={{ width: 26, height: 26, borderRadius: 7, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 13, color: C.textHint }}
              >✕</div>
            </div>
          </div>
          {/* 필터 탭 */}
          <div style={{ display: "flex", gap: 4 }}>
            {filters.map(f => (
              <div
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  fontSize: 11, padding: "3px 9px", borderRadius: 20,
                  border: `1px solid ${filter === f ? C.borderMid : C.border}`,
                  background: filter === f ? C.bg : C.surface,
                  color: filter === f ? C.text : C.textSub,
                  cursor: "pointer", fontWeight: filter === f ? 600 : 400,
                }}
              >{f}</div>
            ))}
          </div>
        </div>

        {/* 알림 목록 */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {filtered.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 200, gap: 8 }}>
              <div style={{ fontSize: 32 }}>🔔</div>
              <div style={{ fontSize: 12, color: C.textHint }}>알림이 없습니다</div>
            </div>
          ) : (
            filtered.map((n, i) => (
              <div
                key={n.id}
                onClick={() => markRead(n.id)}
                style={{
                  display: "flex", gap: 10, padding: "12px 16px",
                  borderBottom: `1px solid ${C.border}`,
                  background: n.read ? C.surface : C.bg,
                  cursor: "pointer", position: "relative",
                }}
                onMouseEnter={e => e.currentTarget.style.background = C.bg}
                onMouseLeave={e => e.currentTarget.style.background = n.read ? C.surface : C.bg}
              >
                {/* 읽지 않음 표시 */}
                {!n.read && (
                  <div style={{ position: "absolute", left: 6, top: "50%", transform: "translateY(-50%)", width: 5, height: 5, borderRadius: "50%", background: C.blue }} />
                )}
                <div style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>{n.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6, marginBottom: 3 }}>
                    <div style={{ fontSize: 12, fontWeight: n.read ? 400 : 600, color: C.text }}>{n.title}</div>
                    <div style={{ fontSize: 10, color: C.textHint, flexShrink: 0 }}>{n.time}</div>
                  </div>
                  <div style={{ fontSize: 11, color: C.textSub, lineHeight: 1.5 }}>{n.desc}</div>
                </div>
                {/* 삭제 버튼 */}
                <div
                  onClick={e => { e.stopPropagation(); deleteNotif(n.id); }}
                  style={{ position: "absolute", right: 10, top: 10, width: 20, height: 20, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: C.textHint, opacity: 0, transition: "opacity 0.1s", cursor: "pointer" }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.background = C.border; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = 0; e.currentTarget.style.background = "transparent"; }}
                >✕</div>
              </div>
            ))
          )}
        </div>

        {/* 푸터 */}
        <div style={{ padding: "10px 16px", borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
          <button
            onClick={() => setNotifs([])}
            style={{ width: "100%", padding: "8px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, fontSize: 11, color: C.textSub, cursor: "pointer" }}
          >
            전체 알림 삭제
          </button>
        </div>
      </div>
    </>
  );
}

// ── 설정 모달 컴포넌트들 ─────────────────────────────────────

function ModalOverlay({ onClose, children }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 200, padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: C.surface, borderRadius: 14, width: "100%", maxWidth: 480,
          maxHeight: "85vh", overflow: "hidden", display: "flex", flexDirection: "column",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ title, subtitle, onClose }) {
  return (
    <div style={{ padding: "18px 20px 14px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 15, fontWeight: 700 }}>{title}</div>
        <div
          onClick={onClose}
          style={{ width: 28, height: 28, borderRadius: 8, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14, color: C.textHint }}
        >✕</div>
      </div>
      {subtitle && <div style={{ fontSize: 12, color: C.textHint, marginTop: 3 }}>{subtitle}</div>}
    </div>
  );
}

function ModalBody({ children }) {
  return <div style={{ padding: "16px 20px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>{children}</div>;
}

function ModalFooter({ onClose }) {
  return (
    <div style={{ padding: "12px 20px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 8, justifyContent: "flex-end", flexShrink: 0 }}>
      <button onClick={onClose} style={{ padding: "7px 16px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, fontSize: 12, color: C.textSub, cursor: "pointer" }}>취소</button>
      <button onClick={onClose} style={{ padding: "7px 16px", borderRadius: 8, border: "none", background: C.accent, fontSize: 12, color: "#fff", fontWeight: 600, cursor: "pointer" }}>저장</button>
    </div>
  );
}

function SectionLabel({ children }) {
  return <div style={{ fontSize: 10, fontWeight: 600, color: C.textHint, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: -8 }}>{children}</div>;
}

function SettingRow({ label, desc, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: C.text }}>{label}</div>
        {desc && <div style={{ fontSize: 11, color: C.textHint, marginTop: 2 }}>{desc}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}

function Toggle({ on }) {
  return (
    <div style={{ width: 36, height: 20, borderRadius: 10, background: on ? C.green : C.border, position: "relative", cursor: "pointer", transition: "background 0.2s" }}>
      <div style={{ position: "absolute", top: 3, left: on ? 18 : 3, width: 14, height: 14, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
    </div>
  );
}

function ModalInput({ label, defaultValue, type = "text", placeholder }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {label && <div style={{ fontSize: 11, fontWeight: 500, color: C.textSub }}>{label}</div>}
      <input
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        style={{ height: 36, borderRadius: 8, border: `1px solid ${C.border}`, padding: "0 10px", fontSize: 12, color: C.text, outline: "none", background: C.surface }}
      />
    </div>
  );
}

// 1. 내 프로필
function ProfileModal({ onClose }) {
  return (
    <ModalOverlay onClose={onClose}>
      <ModalHeader title="내 프로필" subtitle="관리자 계정 정보를 수정합니다" onClose={onClose} />
      <ModalBody>
        {/* 아바타 */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "8px 0" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: C.bg, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700, color: C.textSub }}>관</div>
          <button style={{ fontSize: 11, padding: "5px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, color: C.textSub, cursor: "pointer" }}>프로필 사진 변경</button>
        </div>
        <SectionLabel>기본 정보</SectionLabel>
        <ModalInput label="이름" defaultValue="관리자" />
        <ModalInput label="이메일" defaultValue="admin@shopadmin.com" type="email" />
        <ModalInput label="연락처" defaultValue="010-0000-0000" placeholder="010-0000-0000" />
        <ModalInput label="직책" defaultValue="Super Admin" />
        <SectionLabel>비밀번호 변경</SectionLabel>
        <ModalInput label="현재 비밀번호" type="password" placeholder="현재 비밀번호 입력" />
        <ModalInput label="새 비밀번호" type="password" placeholder="8자 이상" />
        <ModalInput label="새 비밀번호 확인" type="password" placeholder="비밀번호 재입력" />
      </ModalBody>
      <ModalFooter onClose={onClose} />
    </ModalOverlay>
  );
}

// 2. 알림 설정
function NotificationModal({ onClose }) {
  const items = [
    { section: "주문 알림", rows: [
      { label: "신규 주문 접수", desc: "새 주문이 들어올 때 알림", on: true },
      { label: "입금 확인 대기", desc: "무통장 입금 대기 주문 발생 시", on: true },
      { label: "주문 취소 요청", desc: "고객이 취소 요청 시", on: false },
    ]},
    { section: "배송 알림", rows: [
      { label: "배송 지연 감지", desc: "예상 배송일 초과 시", on: true },
      { label: "반품 요청", desc: "반품 요청 접수 시", on: true },
    ]},
    { section: "재고 알림", rows: [
      { label: "재고 부족 경고", desc: "재고 10개 이하 시", on: true },
      { label: "재고 소진", desc: "재고가 0이 될 때", on: true },
    ]},
    { section: "리뷰·마케팅", rows: [
      { label: "신고된 리뷰", desc: "리뷰 신고 접수 시", on: false },
      { label: "프로모션 종료 임박", desc: "종료 24시간 전", on: true },
    ]},
  ];
  return (
    <ModalOverlay onClose={onClose}>
      <ModalHeader title="알림 설정" subtitle="받을 알림 유형을 선택하세요" onClose={onClose} />
      <ModalBody>
        {items.map(({ section, rows }) => (
          <div key={section}>
            <SectionLabel>{section}</SectionLabel>
            <div style={{ marginTop: 8 }}>
              {rows.map(row => (
                <SettingRow key={row.label} label={row.label} desc={row.desc}>
                  <Toggle on={row.on} />
                </SettingRow>
              ))}
            </div>
          </div>
        ))}
      </ModalBody>
      <ModalFooter onClose={onClose} />
    </ModalOverlay>
  );
}

// 3. 화면 설정
function DisplayModal({ onClose }) {
  return (
    <ModalOverlay onClose={onClose}>
      <ModalHeader title="화면 설정" subtitle="화면 표시 방식을 설정합니다" onClose={onClose} />
      <ModalBody>
        <SectionLabel>테마</SectionLabel>
        <div style={{ display: "flex", gap: 8 }}>
          {[["☀️", "라이트", true], ["🌙", "다크", false], ["💻", "시스템", false]].map(([icon, label, active]) => (
            <div key={label} style={{ flex: 1, padding: "10px 8px", borderRadius: 10, border: `1.5px solid ${active ? C.accent : C.border}`, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, cursor: "pointer", background: active ? C.bg : C.surface }}>
              <span style={{ fontSize: 20 }}>{icon}</span>
              <span style={{ fontSize: 11, fontWeight: active ? 700 : 400, color: active ? C.text : C.textSub }}>{label}</span>
            </div>
          ))}
        </div>
        <SectionLabel>폰트 크기</SectionLabel>
        <div style={{ display: "flex", gap: 6 }}>
          {["작게", "보통", "크게"].map((s, i) => (
            <div key={s} style={{ flex: 1, padding: "8px", borderRadius: 8, border: `1.5px solid ${i === 1 ? C.accent : C.border}`, textAlign: "center", fontSize: i === 0 ? 10 : i === 1 ? 12 : 14, cursor: "pointer", fontWeight: i === 1 ? 700 : 400, color: i === 1 ? C.text : C.textSub }}>{s}</div>
          ))}
        </div>
        <SectionLabel>레이아웃</SectionLabel>
        <SettingRow label="사이드바 축소 모드" desc="사이드바를 아이콘만 표시"><Toggle on={false} /></SettingRow>
        <SettingRow label="테이블 밀도" desc="행 간격을 좁게 표시"><Toggle on={false} /></SettingRow>
        <SettingRow label="애니메이션 효과" desc="화면 전환 시 애니메이션"><Toggle on={true} /></SettingRow>
        <SectionLabel>대시보드</SectionLabel>
        <SettingRow label="자동 새로고침" desc="30초마다 데이터 갱신"><Toggle on={true} /></SettingRow>
        <SettingRow label="차트 범례 표시" desc="차트 하단 범례 항상 표시"><Toggle on={true} /></SettingRow>
      </ModalBody>
      <ModalFooter onClose={onClose} />
    </ModalOverlay>
  );
}

// 4. 보안 설정
function SecurityModal({ onClose }) {
  return (
    <ModalOverlay onClose={onClose}>
      <ModalHeader title="보안 설정" subtitle="계정 보안을 강화하세요" onClose={onClose} />
      <ModalBody>
        <SectionLabel>2단계 인증</SectionLabel>
        <SettingRow label="2단계 인증 (2FA)" desc="로그인 시 추가 인증 코드 요구"><Toggle on={false} /></SettingRow>
        <SettingRow label="이메일 인증" desc="새 기기 로그인 시 이메일 확인"><Toggle on={true} /></SettingRow>
        <SectionLabel>세션 관리</SectionLabel>
        <SettingRow label="자동 로그아웃" desc="30분 미사용 시 자동 로그아웃"><Toggle on={true} /></SettingRow>
        <SettingRow label="다중 기기 로그인" desc="여러 기기 동시 로그인 허용"><Toggle on={false} /></SettingRow>
        <SectionLabel>활동 로그</SectionLabel>
        <div style={{ background: C.bg, borderRadius: 8, overflow: "hidden", border: `1px solid ${C.border}` }}>
          {[
            { action: "로그인", device: "Windows PC", time: "방금", ok: true },
            { action: "비밀번호 변경", device: "Windows PC", time: "3일 전", ok: true },
            { action: "로그인 실패", device: "알 수 없음", time: "5일 전", ok: false },
          ].map((log, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderBottom: i < 2 ? `1px solid ${C.border}` : "none" }}>
              <span style={{ fontSize: 14 }}>{log.ok ? "✅" : "❌"}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 500 }}>{log.action}</div>
                <div style={{ fontSize: 10, color: C.textHint }}>{log.device}</div>
              </div>
              <div style={{ fontSize: 10, color: C.textHint }}>{log.time}</div>
            </div>
          ))}
        </div>
        <SectionLabel>위험 구역</SectionLabel>
        <div style={{ background: C.redBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.red }}>모든 세션 종료</div>
            <div style={{ fontSize: 11, color: C.textHint, marginTop: 2 }}>다른 기기의 로그인을 모두 해제합니다</div>
          </div>
          <button style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${C.red}`, background: C.surface, fontSize: 11, color: C.red, fontWeight: 600, cursor: "pointer" }}>종료</button>
        </div>
      </ModalBody>
      <ModalFooter onClose={onClose} />
    </ModalOverlay>
  );
}

// 5. 언어 / 지역
function LocaleModal({ onClose }) {
  return (
    <ModalOverlay onClose={onClose}>
      <ModalHeader title="언어 / 지역" subtitle="언어 및 지역 설정을 변경합니다" onClose={onClose} />
      <ModalBody>
        <SectionLabel>언어</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {[["🇰🇷", "한국어", true], ["🇺🇸", "English", false], ["🇯🇵", "日本語", false], ["🇨🇳", "中文", false]].map(([flag, label, active]) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, border: `1.5px solid ${active ? C.accent : C.border}`, cursor: "pointer", background: active ? C.bg : C.surface }}>
              <span style={{ fontSize: 18 }}>{flag}</span>
              <span style={{ fontSize: 12, fontWeight: active ? 700 : 400, flex: 1 }}>{label}</span>
              {active && <span style={{ fontSize: 11, color: C.green, fontWeight: 600 }}>✓ 사용 중</span>}
            </div>
          ))}
        </div>
        <SectionLabel>지역 및 형식</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 500, color: C.textSub, marginBottom: 4 }}>시간대</div>
            <select style={{ width: "100%", height: 36, borderRadius: 8, border: `1px solid ${C.border}`, padding: "0 10px", fontSize: 12, color: C.text, background: C.surface }}>
              <option>Asia/Seoul (UTC+9)</option>
              <option>America/New_York (UTC-5)</option>
              <option>Europe/London (UTC+0)</option>
            </select>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 500, color: C.textSub, marginBottom: 4 }}>날짜 형식</div>
            <select style={{ width: "100%", height: 36, borderRadius: 8, border: `1px solid ${C.border}`, padding: "0 10px", fontSize: 12, color: C.text, background: C.surface }}>
              <option>YYYY.MM.DD (2025.06.11)</option>
              <option>MM/DD/YYYY (06/11/2025)</option>
              <option>DD-MM-YYYY (11-06-2025)</option>
            </select>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 500, color: C.textSub, marginBottom: 4 }}>통화</div>
            <select style={{ width: "100%", height: 36, borderRadius: 8, border: `1px solid ${C.border}`, padding: "0 10px", fontSize: 12, color: C.text, background: C.surface }}>
              <option>₩ 원 (KRW)</option>
              <option>$ 달러 (USD)</option>
              <option>¥ 엔 (JPY)</option>
            </select>
          </div>
        </div>
      </ModalBody>
      <ModalFooter onClose={onClose} />
    </ModalOverlay>
  );
}

// 6. 운영 로그
function OperationLogModal({ onClose }) {
  const logs = [
    { icon: "🛒", action: "주문 #000284 배송 처리", user: "관리자", time: "10분 전", type: "order" },
    { icon: "📦", action: "상품 '프리미엄 후디' 재고 수정", user: "관리자", time: "32분 전", type: "product" },
    { icon: "🎫", action: "쿠폰 SUMMER30 종료 처리", user: "관리자", time: "1시간 전", type: "promo" },
    { icon: "👤", action: "고객 홍*동 계정 상태 변경", user: "관리자", time: "2시간 전", type: "customer" },
    { icon: "⭐", action: "리뷰 #482 숨김 처리", user: "관리자", time: "3시간 전", type: "review" },
    { icon: "🛒", action: "주문 #000271 취소 처리", user: "관리자", time: "5시간 전", type: "order" },
    { icon: "📦", action: "상품 '클래식 티셔츠' 신규 등록", user: "관리자", time: "어제", type: "product" },
    { icon: "🔒", action: "관리자 로그인", user: "관리자", time: "어제", type: "auth" },
    { icon: "🎫", action: "프로모션 '여름 시즌 세일' 생성", user: "관리자", time: "2일 전", type: "promo" },
    { icon: "📦", action: "상품 '데님 팬츠' 가격 수정", user: "관리자", time: "3일 전", type: "product" },
  ];
  const typeColor = { order: "blue", product: "green", promo: "purple", customer: "amber", review: "amber", auth: "gray" };
  const typeLabel = { order: "주문", product: "상품", promo: "마케팅", customer: "고객", review: "리뷰", auth: "인증" };
  return (
    <ModalOverlay onClose={onClose}>
      <ModalHeader title="운영 로그" subtitle="관리자 활동 내역을 확인합니다" onClose={onClose} />
      <ModalBody>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["전체", "주문", "상품", "마케팅", "고객", "인증"].map((f, i) => (
            <div key={f} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, border: `1px solid ${i === 0 ? C.borderMid : C.border}`, background: i === 0 ? C.bg : C.surface, color: i === 0 ? C.text : C.textSub, cursor: "pointer", fontWeight: i === 0 ? 600 : 400 }}>{f}</div>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {logs.map((log, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 0", borderBottom: i < logs.length - 1 ? `1px solid ${C.border}` : "none" }}>
              <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{log.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: C.text, fontWeight: 500 }}>{log.action}</div>
                <div style={{ fontSize: 10, color: C.textHint, marginTop: 2 }}>{log.user}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                <span style={{ ...{ fontSize: 9, padding: "2px 7px", borderRadius: 10, fontWeight: 600, whiteSpace: "nowrap", display: "inline-block" }, background: typeColor[log.type] === "blue" ? C.blueBg : typeColor[log.type] === "green" ? C.greenBg : typeColor[log.type] === "purple" ? C.purpleBg : typeColor[log.type] === "amber" ? C.amberBg : C.bg, color: typeColor[log.type] === "blue" ? C.blueText : typeColor[log.type] === "green" ? C.greenText : typeColor[log.type] === "purple" ? C.purpleText : typeColor[log.type] === "amber" ? C.amberText : C.textHint }}>{typeLabel[log.type]}</span>
                <span style={{ fontSize: 10, color: C.textHint }}>{log.time}</span>
              </div>
            </div>
          ))}
        </div>
      </ModalBody>
    </ModalOverlay>
  );
}

// ── 전역 검색 ────────────────────────────────────────────────
const SEARCH_DATA = [
  { type: "주문", id: "orders", icon: "🛒", title: "#000284", desc: "홍*동 · 프리미엄 후디 외 1건 · ₩89,000", badge: "결제완료", badgeColor: "green" },
  { type: "주문", id: "orders", icon: "🛒", title: "#000283", desc: "김*연 · 클래식 티셔츠 · ₩39,000", badge: "배송중", badgeColor: "blue" },
  { type: "주문", id: "orders", icon: "🛒", title: "#000282", desc: "이*준 · 데님 팬츠 외 2건 · ₩142,000", badge: "입금대기", badgeColor: "amber" },
  { type: "주문", id: "orders", icon: "🛒", title: "#000281", desc: "박*서 · 캐주얼 자켓 · ₩78,000", badge: "취소", badgeColor: "red" },
  { type: "주문", id: "orders", icon: "🛒", title: "#000280", desc: "최*민 · 스트리트 팬츠 · ₩52,000", badge: "배송완료", badgeColor: "gray" },
  { type: "상품", id: "products", icon: "📦", title: "프리미엄 후디", desc: "의류 · SKU-001~002 · ₩89,000", badge: "판매중", badgeColor: "green" },
  { type: "상품", id: "products", icon: "📦", title: "클래식 티셔츠", desc: "의류 · SKU-003 · ₩39,000", badge: "재고부족", badgeColor: "amber" },
  { type: "상품", id: "products", icon: "📦", title: "데님 팬츠", desc: "하의 · SKU-004 · ₩79,000", badge: "판매중", badgeColor: "green" },
  { type: "상품", id: "products", icon: "📦", title: "캐주얼 스니커즈", desc: "신발 · SKU-005~006 · ₩89,000", badge: "판매중", badgeColor: "green" },
  { type: "상품", id: "inventory", icon: "📦", title: "레더 토트백", desc: "가방 · SKU-007 · ₩128,000", badge: "판매중", badgeColor: "green" },
  { type: "고객", id: "customers", icon: "👤", title: "홍*동", desc: "hong***@email.com · VIP 골드 · 주문 48건", badge: "VIP", badgeColor: "amber" },
  { type: "고객", id: "customers", icon: "👤", title: "김*연", desc: "kim***@email.com · 일반 · 주문 12건", badge: "일반", badgeColor: "gray" },
  { type: "고객", id: "customers", icon: "👤", title: "이*준", desc: "lee***@email.com · 일반 · 주문 8건", badge: "일반", badgeColor: "gray" },
  { type: "고객", id: "customers", icon: "👤", title: "박*서", desc: "park***@email.com · 일반 · 주문 6건", badge: "일반", badgeColor: "gray" },
  { type: "페이지", id: "analytics", icon: "📊", title: "매출 분석", desc: "기간별 매출 차트, 카테고리 분석", badge: "페이지", badgeColor: "blue" },
  { type: "페이지", id: "promotions", icon: "🎫", title: "프로모션·쿠폰", desc: "진행 중 프로모션 2개, 쿠폰 관리", badge: "페이지", badgeColor: "blue" },
  { type: "페이지", id: "settlement", icon: "🧾", title: "정산 관리", desc: "월별 정산, 수수료 내역", badge: "페이지", badgeColor: "blue" },
  { type: "페이지", id: "cs", icon: "💬", title: "CS 고객문의", desc: "미답변 2건", badge: "페이지", badgeColor: "blue" },
];

const RECENT_SEARCHES = ["#000284", "프리미엄 후디", "홍*동", "매출 분석"];

function GlobalSearch({ onClose, onNavigate, C }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("전체");
  const inputRef = useState(null);

  const filters = ["전체", "주문", "상품", "고객", "페이지"];

  const results = query.trim().length === 0 ? [] : SEARCH_DATA.filter(item => {
    const matchQuery = item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.desc.toLowerCase().includes(query.toLowerCase());
    const matchFilter = filter === "전체" || item.type === filter;
    return matchQuery && matchFilter;
  });

  const grouped = filters.slice(1).reduce((acc, f) => {
    const items = results.filter(r => r.type === f);
    if (items.length > 0) acc[f] = items;
    return acc;
  }, {});

  const handleSelect = (item) => {
    onNavigate(item.id);
    onClose();
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 80 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 560, background: C.surface, borderRadius: 14, overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.2)", border: `1px solid ${C.border}` }}>

        {/* 검색 입력 */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderBottom: `1px solid ${C.border}` }}>
          <span style={{ fontSize: 16, color: C.textHint }}>🔍</span>
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="주문번호, 상품명, 고객명 검색..."
            style={{ flex: 1, border: "none", outline: "none", fontSize: 14, color: C.text, background: "transparent" }}
          />
          {query && (
            <span onClick={() => setQuery("")} style={{ fontSize: 13, color: C.textHint, cursor: "pointer", padding: "2px 6px", borderRadius: 5, background: C.bg }}>✕</span>
          )}
          <div style={{ fontSize: 10, color: C.textHint, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 5, padding: "2px 7px" }}>ESC</div>
        </div>

        {/* 필터 */}
        <div style={{ display: "flex", gap: 5, padding: "8px 14px", borderBottom: `1px solid ${C.border}` }}>
          {filters.map(f => (
            <div key={f} onClick={() => setFilter(f)} style={{ fontSize: 11, padding: "3px 9px", borderRadius: 20, border: `1px solid ${filter === f ? C.borderMid : C.border}`, background: filter === f ? C.bg : C.surface, color: filter === f ? C.text : C.textSub, cursor: "pointer", fontWeight: filter === f ? 600 : 400 }}>{f}</div>
          ))}
        </div>

        {/* 결과 */}
        <div style={{ maxHeight: 400, overflowY: "auto" }}>
          {query.trim() === "" ? (
            <div style={{ padding: "14px 16px" }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: C.textHint, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>최근 검색</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {RECENT_SEARCHES.map(s => (
                  <div key={s} onClick={() => setQuery(s)} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 20, border: `1px solid ${C.border}`, background: C.bg, color: C.textSub, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                    🕐 {s}
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 10, fontWeight: 600, color: C.textHint, letterSpacing: "0.06em", textTransform: "uppercase", margin: "14px 0 8px" }}>빠른 이동</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {[
                  { icon: "▦", label: "대시보드", id: "dashboard" },
                  { icon: "🛒", label: "주문 관리", id: "orders" },
                  { icon: "📦", label: "상품 등록", id: "products" },
                  { icon: "👤", label: "고객 프로필", id: "customers" },
                  { icon: "📊", label: "매출 분석", id: "analytics" },
                  { icon: "💬", label: "CS 고객문의", id: "cs" },
                ].map(item => (
                  <div key={item.id} onClick={() => handleSelect(item)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, border: `1px solid ${C.border}`, cursor: "pointer", fontSize: 12, color: C.textSub, background: C.surface }}
                    onMouseEnter={e => e.currentTarget.style.background = C.bg}
                    onMouseLeave={e => e.currentTarget.style.background = C.surface}
                  >
                    <span style={{ fontSize: 14 }}>{item.icon}</span>{item.label}
                  </div>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div style={{ padding: "40px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🔍</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 4 }}>검색 결과가 없습니다</div>
              <div style={{ fontSize: 11, color: C.textHint }}>'{query}'에 대한 결과를 찾을 수 없어요</div>
            </div>
          ) : (
            Object.entries(grouped).map(([type, items]) => (
              <div key={type}>
                <div style={{ fontSize: 10, fontWeight: 600, color: C.textHint, letterSpacing: "0.06em", textTransform: "uppercase", padding: "10px 16px 4px" }}>{type} ({items.length})</div>
                {items.map((item, i) => (
                  <div
                    key={i}
                    onClick={() => handleSelect(item)}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", cursor: "pointer", borderBottom: `1px solid ${C.border}` }}
                    onMouseEnter={e => e.currentTarget.style.background = C.bg}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 2 }}>
                        {item.title.split(new RegExp(`(${query})`, "gi")).map((part, i) =>
                          part.toLowerCase() === query.toLowerCase()
                            ? <span key={i} style={{ background: C.amberBg, color: C.amberText, borderRadius: 3, padding: "0 2px" }}>{part}</span>
                            : part
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: C.textHint, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.desc}</div>
                    </div>
                    <span style={styles.badge(item.badgeColor)}>{item.badge}</span>
                    <span style={{ fontSize: 11, color: C.textHint }}>→</span>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>

        {/* 푸터 */}
        <div style={{ padding: "8px 16px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 12, alignItems: "center" }}>
          {[["↵", "이동"], ["↑↓", "탐색"], ["ESC", "닫기"]].map(([key, label]) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: C.textHint }}>
              <span style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 4, padding: "1px 5px", fontFamily: "monospace" }}>{key}</span>
              {label}
            </div>
          ))}
          {results.length > 0 && <span style={{ marginLeft: "auto", fontSize: 10, color: C.textHint }}>{results.length}개 결과</span>}
        </div>
      </div>
    </div>
  );
}

// ── 앱 루트 ─────────────────────────────────────────────────
const SCREENS = { dashboard: Dashboard, analytics: Analytics, orders: Orders, shipping: Shipping, productList: ProductList, products: Products, inventory: Inventory, customerList: CustomerList, customers: Customers, promotions: Promotions, reviews: Reviews, checkout: Checkout, settlement: Settlement, cs: CS, permissions: Permissions, storeSettings: StoreSettings };
const TITLES = { dashboard: "대시보드", analytics: "매출 분석", orders: "주문 관리", shipping: "배송 현황", productList: "상품 목록", products: "상품 등록", inventory: "재고 관리", customerList: "고객 목록", customers: "고객 프로필", promotions: "프로모션·쿠폰 관리", reviews: "리뷰·평점 관리", checkout: "결제 페이지", settlement: "정산 관리", cs: "CS 고객문의 관리", permissions: "권한 관리", storeSettings: "스토어 설정" };
const MENU_ITEMS = [
  { icon: "👤", label: "내 프로필", modal: "profile" },
  { icon: "🔔", label: "알림 설정", modal: "notification" },                    
  { icon: "🎨", label: "화면 설정", modal: "display" },
  { icon: "🔒", label: "보안 설정", modal: "security" },
  { icon: "🌐", label: "언어 / 지역", modal: "locale" },
  { icon: "📋", label: "운영 로그", modal: "log" },
];

export default function EcommerceAdmin({ onLogout }) {
  const [current, setCurrent] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const Screen = SCREENS[current];
  return (
    <div style={styles.app} onClick={() => setMenuOpen(false)}>
        {activeModal === "profile" && <ProfileModal onClose={() => setActiveModal(null)} />}
{activeModal === "notification" && <NotificationModal onClose={() => setActiveModal(null)} />}
{activeModal === "display" && <DisplayModal onClose={() => setActiveModal(null)} />}
{activeModal === "security" && <SecurityModal onClose={() => setActiveModal(null)} />}
{activeModal === "locale" && <LocaleModal onClose={() => setActiveModal(null)} />}
{activeModal === "log" && <OperationLogModal onClose={() => setActiveModal(null)} />}
    {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} C={C} />}
        {searchOpen && <GlobalSearch onClose={() => setSearchOpen(false)} onNavigate={setCurrent} C={C} />}
      <div style={styles.sidebar}>
        <div style={styles.sidebarTop}>
          <div style={styles.logo}>
            <div style={styles.logoBox}>S</div>
            <span style={styles.logoText}>ShopAdmin</span>
          </div>
          <div style={styles.logoSub}>이커머스 관리자</div>
        </div>
        <div style={styles.nav}>
          {NAV.map(({ section, items }) => (
            <div key={section} style={styles.navSection}>
              <div style={styles.navLabel}>{section}</div>
              {items.map(item => (
                <div key={item.id} style={styles.navItem(current === item.id)} onClick={() => setCurrent(item.id)}>
                  <span style={{ fontSize: 14 }}>{item.icon}</span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.badge && <span style={styles.navBadge(item.badgeColor)}>{item.badge}</span>}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* ── 사이드바 하단 ── */}
        <div style={{ ...styles.sidebarFooter, position: "relative" }}>

          {/* 설정 팝업 메뉴 */}
          {menuOpen && (
            <div
              onClick={e => e.stopPropagation()}
              style={{
                position: "absolute",
                bottom: 64,
                left: 12,
                width: 176,
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
                overflow: "hidden",
                zIndex: 100,
              }}
            >
              {/* 유저 정보 헤더 */}
              <div style={{ padding: "10px 13px 8px", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.text }}>관리자</div>
                <div style={{ fontSize: 10, color: C.textHint, marginTop: 1 }}>admin@shopadmin.com</div>
              </div>

              {/* 메뉴 항목 */}
              {MENU_ITEMS.map(item => (
                <div
                  key={item.label}
                  style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 13px", fontSize: 12, color: C.textSub, cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.background = C.bg}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  onClick={() => { setMenuOpen(false); setActiveModal(item.modal); }}
                >
                  <span style={{ fontSize: 14 }}>{item.icon}</span>
                  {item.label}
                </div>
              ))}

              {/* 구분선 */}
              <div style={{ height: 1, background: C.border, margin: "4px 0" }} />

              {/* 로그아웃 */}
              <div
                onClick={() => { setMenuOpen(false); onLogout && onLogout(); }}
                style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 13px 10px", fontSize: 12, color: C.red, cursor: "pointer", fontWeight: 600 }}
                onMouseEnter={e => e.currentTarget.style.background = C.redBg}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <span style={{ fontSize: 14 }}>🚪</span>
                로그아웃
              </div>
            </div>
          )}

          {/* 아바타 행 */}
          <div style={styles.avatarRow}>
            <div style={styles.avatar}>관</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>관리자</div>
              <div style={{ fontSize: 10, color: C.textHint }}>Super Admin</div>
            </div>
            <span
              onClick={e => { e.stopPropagation(); setMenuOpen(o => !o); }}
              style={{
                fontSize: 14,
                color: menuOpen ? C.text : C.textHint,
                cursor: "pointer",
                padding: "2px 4px",
                borderRadius: 5,
                background: menuOpen ? C.bg : "transparent",
                userSelect: "none",
              }}
            >⋯</span>
          </div>
        </div>
      </div>

      <div style={styles.main}>
        <div style={styles.topbar}>
          <span style={styles.pageTitle}>{TITLES[current]}</span>
          <div style={{ ...styles.searchBox, cursor: "pointer" }} onClick={() => setSearchOpen(true)}>
  🔍 검색...
  <span style={{ marginLeft: "auto", fontSize: 10, color: C.textHint, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 4, padding: "1px 5px" }}>Ctrl K</span>
</div>
<div style={styles.iconBtn} onClick={() => setNotifOpen(o => !o)}>
  🔔
  <div style={styles.notifDot} />
</div>
          <div style={styles.iconBtn}>👤</div>
        </div>
        <div style={styles.content}>
          <Screen onNavigate={setCurrent} />
        </div>
      </div>
    </div>
  );
}