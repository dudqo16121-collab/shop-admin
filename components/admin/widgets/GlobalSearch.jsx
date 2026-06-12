"use client";

import { useState } from "react";
import { styles } from "../theme";

// ── 전역 검색 데이터 ─────────────────────────────────────────
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

// ── 전역 검색 ────────────────────────────────────────────────
export default function GlobalSearch({ onClose, onNavigate, C }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("전체");

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
