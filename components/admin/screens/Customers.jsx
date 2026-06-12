"use client";

import { useState } from "react";
import { C, styles } from "../theme";
import { StatusBadge, Th, Td } from "../ui/common";

// ── 화면 5: 고객 프로필 ──────────────────────────────────────
export default function Customers() {
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
