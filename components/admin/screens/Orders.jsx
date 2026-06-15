"use client";

import { useCallback, useEffect, useState } from "react";
import { C, styles } from "../theme";
import { StatusBadge, Th, Td } from "../ui/common";
import { exportOrders } from "../csv";
import OrderDetailModal from "./OrderDetailModal";
import {
  getMergedOrders, getOrderStats,
  saveAdminMeta, markOrdersSeen,
} from "../../../lib/orderBridge";

// ── 상태 옵션 ────────────────────────────────────────────────
const STATUS_OPTIONS = ["전체", "입금대기", "결제완료", "배송중", "배송완료", "취소"];
const PAY_OPTIONS    = ["전체", "신용카드", "카카오페이", "네이버페이", "무통장입금"];
const ACTION_MAP     = {
  "결제완료": ["상세", "배송"],
  "배송중":   ["상세", "송장"],
  "입금대기": ["상세", "확인"],
  "취소":     ["상세", "환불"],
  "배송완료": ["상세"],
};

export default function Orders() {
  const [orders, setOrders]           = useState([]);
  const [stats, setStats]             = useState(null);
  const [orderDetail, setOrderDetail] = useState(null);
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatus]     = useState("전체");
  const [payFilter, setPay]           = useState("전체");
  const [selected, setSelected]       = useState([]);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  // ── 데이터 로드 ────────────────────────────────────────────
  const load = useCallback(() => {
    const merged = getMergedOrders();
    setOrders(merged);
    setStats(getOrderStats());
    markOrdersSeen();
  }, []);

  useEffect(() => { load(); }, [load, lastRefresh]);

  // 5초 자동 갱신 (실시간 주문 반영)
  useEffect(() => {
    const t = setInterval(() => setLastRefresh(Date.now()), 5000);
    return () => clearInterval(t);
  }, []);

  // ── 필터 ───────────────────────────────────────────────────
  const filtered = orders.filter(o => {
    const q = search.toLowerCase();
    const matchSearch = !q || o.id.toLowerCase().includes(q) || o.cust.includes(q) || o.prod.toLowerCase().includes(q);
    const matchStatus = statusFilter === "전체" || o.status === statusFilter;
    const matchPay    = payFilter === "전체"    || o.pay === payFilter;
    return matchSearch && matchStatus && matchPay;
  });

  // ── 상태 변경 ──────────────────────────────────────────────
  const changeStatus = (orderNo, newStatus) => {
    saveAdminMeta(orderNo, { status: newStatus });
    load();
  };

  // ── 선택 ───────────────────────────────────────────────────
  const toggleSelect  = id => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAll     = () => setSelected(selected.length === filtered.length ? [] : filtered.map(o => o.id));

  // ── KPI 카드 ───────────────────────────────────────────────
  const kpiCards = stats ? [
    { label: "전체 주문",  val: stats.total,    badge: "전체",    color: "gray",  filter: "전체" },
    { label: "입금 대기",  val: stats.pending,  badge: "확인 필요", color: "amber", filter: "입금대기" },
    { label: "결제 완료",  val: stats.paid,     badge: "처리 대기", color: "green", filter: "결제완료" },
    { label: "배송 중",    val: stats.shipping, badge: "진행 중",  color: "blue",  filter: "배송중" },
    { label: "취소·반품",  val: stats.cancel,   badge: "처리 필요", color: "red",   filter: "취소" },
  ] : [];

  return (
    <>
      {orderDetail && (
        <OrderDetailModal
          order={orderDetail}
          onClose={() => setOrderDetail(null)}
          C={C}
        />
      )}

      {/* ── 상단 버튼 ── */}
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", alignItems: "center" }}>
        {/* 쇼핑몰 연동 표시 */}
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          fontSize: 11, color: C.green, fontFamily: "monospace",
          background: C.greenBg, border: `1px solid ${C.green}40`,
          padding: "5px 10px", borderRadius: 7,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, display: "inline-block", animation: "pulse 2s infinite" }} />
          shop:orders 연동 중
        </div>
        <button style={styles.btn()} onClick={() => setLastRefresh(Date.now())}>⟳ 새로고침</button>
        <button style={styles.btn()} onClick={() => exportOrders(filtered)}>↓ 내보내기</button>
        <button style={styles.btn()}>🖨 일괄 출력</button>
      </div>

      {/* ── KPI ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: 8 }}>
        {kpiCards.map(s => (
          <div
            key={s.label}
            onClick={() => setStatus(s.filter)}
            style={{
              ...styles.card,
              cursor: "pointer", paddingTop: 10, paddingBottom: 10,
              borderTop: statusFilter === s.filter ? `2px solid ${C.accent}` : `2px solid transparent`,
              transition: "border-color 0.15s",
            }}
          >
            <div style={styles.kpiLabel}>{s.label}</div>
            <div style={{ ...styles.kpiValue, fontSize: 18 }}>
              {s.val}
              {s.filter === "입금대기" && s.val > 0 && (
                <span style={{ fontSize: 10, marginLeft: 5, color: C.amber }}>●</span>
              )}
            </div>
            <span style={styles.badge(s.color)}>{s.badge}</span>
          </div>
        ))}
      </div>

      {/* ── 필터 바 ── */}
      <div style={styles.filterBar}>
        <div style={{ ...styles.searchBox, flex: 1 }}>
          <span>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="주문번호·고객명·상품명 검색..."
            style={{ flex: 1, border: "none", outline: "none", fontSize: 11, color: C.text, background: "transparent" }}
          />
        </div>
        <select style={styles.select} value={statusFilter} onChange={e => setStatus(e.target.value)}>
          {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
        </select>
        <select style={styles.select} value={payFilter} onChange={e => setPay(e.target.value)}>
          {PAY_OPTIONS.map(p => <option key={p}>{p}</option>)}
        </select>
      </div>

      {/* ── 일괄 처리 바 ── */}
      {selected.length > 0 && (
        <div style={{
          ...styles.card, padding: "8px 12px",
          display: "flex", alignItems: "center", gap: 8,
          fontSize: 11, background: C.blueBg,
          border: `1px solid ${C.blue}`,
        }}>
          <span style={{ color: C.blueText, fontWeight: 600 }}>{selected.length}건 선택됨</span>
          <span style={{ flex: 1 }} />
          <button style={styles.smBtn} onClick={() => { selected.forEach(id => changeStatus(id, "배송중")); setSelected([]); }}>🚚 배송 처리</button>
          <button style={styles.smBtn}>🖨 송장 출력</button>
          <button style={{ ...styles.smBtn, color: C.red }} onClick={() => { selected.forEach(id => changeStatus(id, "취소")); setSelected([]); }}>✕ 취소 처리</button>
          <button style={styles.smBtn} onClick={() => setSelected([])}>선택 해제</button>
        </div>
      )}

      {/* ── 테이블 ── */}
      {filtered.length === 0 ? (
        <div style={{ ...styles.card, textAlign: "center", padding: "48px 0", color: C.textHint }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>🛒</div>
          <div style={{ fontSize: 13 }}>
            {orders.length === 0
              ? "아직 쇼핑몰 주문이 없어요. 쇼핑몰에서 주문하면 여기에 표시됩니다."
              : "조건에 맞는 주문이 없어요."}
          </div>
        </div>
      ) : (
        <div style={styles.tableWrap}>
          <table style={{ ...styles.table, tableLayout: "fixed" }}>
            <thead>
              <tr>
                <Th style={{ width: 32 }}>
                  <input
                    type="checkbox"
                    checked={selected.length === filtered.length && filtered.length > 0}
                    onChange={toggleAll}
                    style={{ width: 13, height: 13, accentColor: C.accent }}
                  />
                </Th>
                <Th style={{ width: 90 }}>주문번호</Th>
                <Th style={{ width: 80 }}>주문일시</Th>
                <Th style={{ width: 60 }}>고객명</Th>
                <Th>주문 상품</Th>
                <Th style={{ width: 40, textAlign: "center" }}>수량</Th>
                <Th style={{ width: 85, textAlign: "right" }}>결제금액</Th>
                <Th style={{ width: 72 }}>결제수단</Th>
                <Th style={{ width: 75, textAlign: "center" }}>상태</Th>
                <Th style={{ width: 100, textAlign: "right" }}>관리</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr
                  key={o.id}
                  style={{ background: selected.includes(o.id) ? C.blueBg : C.surface }}
                  onMouseEnter={e => { if (!selected.includes(o.id)) e.currentTarget.style.background = C.bg; }}
                  onMouseLeave={e => { if (!selected.includes(o.id)) e.currentTarget.style.background = C.surface; }}
                >
                  <Td>
                    <input
                      type="checkbox"
                      checked={selected.includes(o.id)}
                      onChange={() => toggleSelect(o.id)}
                      style={{ width: 13, height: 13, accentColor: C.accent }}
                    />
                  </Td>
                  <Td style={{ color: C.blue, fontWeight: 700, fontSize: 10, fontFamily: "monospace" }}>
                    {o.id}
                    {o.coupon && (
                      <span style={{ marginLeft: 4, fontSize: 9, color: C.purple, fontFamily: "monospace" }}>🎫</span>
                    )}
                  </Td>
                  <Td style={{ fontSize: 10, color: C.textHint }}>{o.date}</Td>
                  <Td style={{ fontWeight: 500 }}>{o.cust}</Td>
                  <Td style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 11 }}>
                    {o.prod}
                  </Td>
                  <Td style={{ textAlign: "center" }}>{o.qty}</Td>
                  <Td style={{ textAlign: "right", fontWeight: 600 }}>
                    {o.amt}
                    {o.discount > 0 && (
                      <div style={{ fontSize: 9, color: C.green, fontFamily: "monospace" }}>
                        -{(o.discount).toLocaleString()}
                      </div>
                    )}
                  </Td>
                  <Td style={{ fontSize: 11 }}>{o.pay}</Td>
                  <Td style={{ textAlign: "center" }}>
                    <select
                      value={o.status}
                      onChange={e => changeStatus(o.id, e.target.value)}
                      onClick={e => e.stopPropagation()}
                      style={{
                        fontSize: 10, padding: "2px 4px", borderRadius: 5,
                        border: `1px solid ${C.border}`,
                        background: C.bg, color: C.text,
                        cursor: "pointer",
                      }}
                    >
                      {STATUS_OPTIONS.filter(s => s !== "전체").map(s => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </Td>
                  <Td style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", gap: 3, justifyContent: "flex-end" }}>
                      <button
                        style={styles.smBtn}
                        onClick={() => setOrderDetail(o.raw)}
                      >
                        상세
                      </button>
                      {o.status === "결제완료" && (
                        <button
                          style={styles.smBtn}
                          onClick={() => changeStatus(o.id, "배송중")}
                        >
                          배송
                        </button>
                      )}
                      {o.status === "배송중" && (
                        <button
                          style={styles.smBtn}
                          onClick={() => changeStatus(o.id, "배송완료")}
                        >
                          완료
                        </button>
                      )}
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 페이지네이션 */}
          <div style={styles.pagination}>
            <span style={{ fontSize: 11, color: C.textHint }}>
              총 {filtered.length}건
              {orders.length !== filtered.length && ` (전체 ${orders.length}건)`}
            </span>
            <div style={{ display: "flex", gap: 4 }}>
              {["‹", "1", "›"].map((p, i) => (
                <div key={i} style={styles.pageBtn(p === "1")}>{p}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 연동 안내 ── */}
      <div style={{
        ...styles.card, fontSize: 11,
        color: C.textHint, fontFamily: "monospace",
        background: C.bg, borderTop: `2px solid ${C.border}`,
      }}>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <span>// 데이터 소스: localStorage(<span style={{ color: C.green }}>'shop:orders'</span>)</span>
          <span>// 5초마다 자동 갱신</span>
          <span>// 상태 변경 → localStorage(<span style={{ color: C.blue }}>'admin:orders'</span>)에 저장</span>
          <span style={{ marginLeft: "auto" }}>
            마지막 갱신: {new Date(lastRefresh).toLocaleTimeString("ko-KR")}
          </span>
        </div>
      </div>
    </>
  );
}