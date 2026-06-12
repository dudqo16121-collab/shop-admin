"use client";

import { useState } from "react";
import { C, styles } from "../theme";
import { StatusBadge, Th, Td } from "../ui/common";
import { downloadCSV } from "../csv";

// ── 화면 3: 배송 현황 ────────────────────────────────────────
export default function Shipping() {
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
