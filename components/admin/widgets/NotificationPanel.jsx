"use client";

import { useState } from "react";

// ── 알림 데이터 ──────────────────────────────────────────────
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

// ── 알림 센터 패널 ────────────────────────────────────────────
export default function NotificationPanel({ onClose, C }) {
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
            filtered.map((n) => (
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
