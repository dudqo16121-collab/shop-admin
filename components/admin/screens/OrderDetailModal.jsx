"use client";

import { useState } from "react";
import { styles } from "../theme";

// ── 주문 상세 모달 ────────────────────────────────────────────
export default function OrderDetailModal({ order, onClose, C }) {
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
