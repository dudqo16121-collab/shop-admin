"use client";

import { C } from "../theme";
import { ModalOverlay, ModalHeader, ModalBody } from "../ui/Modal";

// 6. 운영 로그
export default function OperationLogModal({ onClose }) {
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
