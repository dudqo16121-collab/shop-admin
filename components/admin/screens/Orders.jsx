"use client";

import { useState } from "react";
import { C, styles } from "../theme";
import { StatusBadge, Th, Td } from "../ui/common";
import { exportOrders } from "../csv";
import OrderDetailModal from "./OrderDetailModal";

// ── 화면 2: 주문 관리 ────────────────────────────────────────
export default function Orders() {
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
