"use client";

import { useState } from "react";
import { C, styles } from "../theme";

// ── CS 고객문의 관리 페이지 ──────────────────────────────────
export default function CS() {
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
