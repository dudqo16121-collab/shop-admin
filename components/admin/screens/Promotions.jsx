"use client";

import { useState } from "react";
import { C, styles } from "../theme";
import { StatusBadge, Th, Td } from "../ui/common";

// ── 화면 6: 프로모션·쿠폰 ────────────────────────────────────
export default function Promotions() {
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
