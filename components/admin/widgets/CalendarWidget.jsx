"use client";

import { useState } from "react";
import { C, styles } from "../theme";

// ── 캘린더 위젯 ──────────────────────────────────────────────
export default function CalendarWidget() {
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
