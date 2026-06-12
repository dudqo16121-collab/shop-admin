"use client";

import { useState } from "react";
import { C, styles } from "../theme";
import { exportInventory } from "../csv";

// ── 재고 관리 페이지 ─────────────────────────────────────────
export default function Inventory() {
  const [tab, setTab] = useState("재고 현황");
  const [filter, setFilter] = useState("전체");

  const products = [
    { id: "SKU-001", name: "프리미엄 후디", cat: "의류", opt: "블랙/M", stock: 3, min: 10, in: 50, out: 47, price: 89000 },
    { id: "SKU-002", name: "프리미엄 후디", cat: "의류", opt: "블랙/L", stock: 1, min: 10, in: 30, out: 29, price: 89000 },
    { id: "SKU-003", name: "클래식 티셔츠", cat: "의류", opt: "화이트/M", stock: 0, min: 10, in: 40, out: 40, price: 39000 },
    { id: "SKU-004", name: "데님 팬츠", cat: "하의", opt: "인디고/32", stock: 24, min: 10, in: 60, out: 36, price: 79000 },
    { id: "SKU-005", name: "캐주얼 스니커즈", cat: "신발", opt: "화이트/260", stock: 8, min: 15, in: 40, out: 32, price: 89000 },
    { id: "SKU-006", name: "캐주얼 스니커즈", cat: "신발", opt: "블랙/270", stock: 42, min: 15, in: 60, out: 18, price: 89000 },
    { id: "SKU-007", name: "레더 토트백", cat: "가방", opt: "브라운", stock: 15, min: 5, in: 20, out: 5, price: 128000 },
    { id: "SKU-008", name: "캐시미어 머플러", cat: "악세서리", opt: "베이지", stock: 62, min: 10, in: 80, out: 18, price: 48000 },
    { id: "SKU-009", name: "오버핏 티셔츠", cat: "의류", opt: "그레이/L", stock: 5, min: 10, in: 30, out: 25, price: 45000 },
    { id: "SKU-010", name: "슬랙스", cat: "하의", opt: "네이비/32", stock: 18, min: 10, in: 40, out: 22, price: 68000 },
  ];

  const getStatus = (stock, min) => {
    if (stock === 0) return { label: "소진", color: "red" };
    if (stock < min) return { label: "부족", color: "amber" };
    if (stock < min * 1.5) return { label: "주의", color: "amber" };
    return { label: "정상", color: "green" };
  };

  const logs = [
    { date: "06/11 14:32", type: "in", sku: "SKU-004", name: "데님 팬츠", opt: "인디고/32", qty: 30, by: "관리자", note: "정기 발주" },
    { date: "06/11 10:15", type: "out", sku: "SKU-001", name: "프리미엄 후디", opt: "블랙/M", qty: 5, by: "주문 #000284", note: "판매" },
    { date: "06/10 18:22", type: "in", sku: "SKU-008", name: "캐시미어 머플러", opt: "베이지", qty: 40, by: "관리자", note: "긴급 발주" },
    { date: "06/10 15:40", type: "out", sku: "SKU-003", name: "클래식 티셔츠", opt: "화이트/M", qty: 8, by: "주문 #000281", note: "판매" },
    { date: "06/10 11:05", type: "out", sku: "SKU-005", name: "캐주얼 스니커즈", opt: "화이트/260", qty: 3, by: "주문 #000279", note: "판매" },
    { date: "06/09 16:30", type: "in", sku: "SKU-006", name: "캐주얼 스니커즈", opt: "블랙/270", qty: 20, by: "관리자", note: "정기 발주" },
    { date: "06/09 14:10", type: "out", sku: "SKU-002", name: "프리미엄 후디", opt: "블랙/L", qty: 2, by: "주문 #000276", note: "판매" },
    { date: "06/08 10:00", type: "adjust", sku: "SKU-007", name: "레더 토트백", opt: "브라운", qty: -2, by: "관리자", note: "불량 처리" },
  ];

  const lowStock = products.filter(p => p.stock < p.min);
  const outOfStock = products.filter(p => p.stock === 0);

  const filteredProducts = products.filter(p => {
    if (filter === "전체") return true;
    if (filter === "부족") return p.stock > 0 && p.stock < p.min;
    if (filter === "소진") return p.stock === 0;
    if (filter === "정상") return p.stock >= p.min;
    return true;
  });

  return (
    <>
      {/* KPI */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 10 }}>
        {[
          { label: "전체 SKU", value: `${products.length}개`, sub: "관리 중인 상품", accent: C.blue },
          { label: "재고 소진", value: `${outOfStock.length}개`, sub: "즉시 발주 필요", accent: C.red },
          { label: "재고 부족", value: `${lowStock.length}개`, sub: "최소 재고 미달", accent: C.amber },
          { label: "총 재고 가치", value: `₩${(products.reduce((a, p) => a + p.stock * p.price, 0) / 10000).toFixed(0)}만`, sub: "현재 보유 기준", accent: C.green },
        ].map(k => (
          <div key={k.label} style={styles.kpiCard(k.accent)}>
            <div style={styles.kpiLabel}>{k.label}</div>
            <div style={{ ...styles.kpiValue, fontSize: 18 }}>{k.value}</div>
            <div style={styles.kpiSub}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* 부족 알림 배너 */}
      {lowStock.length > 0 && (
        <div style={{ background: C.amberBg, border: `1px solid ${C.amber}`, borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 16 }}>⚠️</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.amberText }}>재고 부족 알림 — {lowStock.length}개 SKU 확인 필요</div>
            <div style={{ fontSize: 11, color: C.amberText, marginTop: 2 }}>
              {lowStock.slice(0, 3).map(p => `${p.name} (${p.opt}): ${p.stock}개`).join(" · ")}
              {lowStock.length > 3 && ` 외 ${lowStock.length - 3}건`}
            </div>
          </div>
          <button style={{ fontSize: 11, padding: "5px 12px", borderRadius: 8, border: `1px solid ${C.amber}`, background: "transparent", color: C.amberText, cursor: "pointer", fontWeight: 600 }}>발주 처리</button>
        </div>
      )}

      {/* 탭 */}
      <div style={{ display: "flex", borderBottom: `1px solid ${C.border}` }}>
        {["재고 현황", "입출고 내역", "발주 관리"].map(t => (
          <div key={t} onClick={() => setTab(t)} style={{ fontSize: 12, padding: "8px 16px", cursor: "pointer", color: tab === t ? C.text : C.textHint, fontWeight: tab === t ? 700 : 400, borderBottom: tab === t ? `2px solid ${C.accent}` : "2px solid transparent", marginBottom: -1 }}>{t}</div>
        ))}
      </div>

      {/* 재고 현황 탭 */}
      {tab === "재고 현황" && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ ...styles.searchBox, flex: 1 }}>🔍 상품명·SKU 검색...</div>
            <div style={{ display: "flex", gap: 5 }}>
              {["전체", "소진", "부족", "정상"].map(f => (
                <div key={f} onClick={() => setFilter(f)} style={styles.filterChip(filter === f)}>{f}</div>
              ))}
            </div>
            <button style={styles.btn()} onClick={() => exportInventory(products)}>↓ CSV 내보내기</button>
          </div>
          <div style={styles.tableWrap}>
            <table style={{ ...styles.table, tableLayout: "fixed" }}>
              <thead><tr>
                <th style={{ ...styles.th, width: 80 }}>SKU</th>
                <th style={styles.th}>상품명</th>
                <th style={{ ...styles.th, width: 60 }}>카테고리</th>
                <th style={{ ...styles.th, width: 80 }}>옵션</th>
                <th style={{ ...styles.th, width: 60, textAlign: "right" }}>현재고</th>
                <th style={{ ...styles.th, width: 60, textAlign: "right" }}>최소재고</th>
                <th style={{ ...styles.th, width: 60, textAlign: "center" }}>상태</th>
                <th style={{ ...styles.th, width: 80, textAlign: "right" }}>재고 가치</th>
                <th style={{ ...styles.th, width: 70, textAlign: "right" }}>관리</th>
              </tr></thead>
              <tbody>
                {filteredProducts.map(p => {
                  const status = getStatus(p.stock, p.min);
                  return (
                    <tr key={p.id} style={{ background: p.stock === 0 ? C.redBg : p.stock < p.min ? C.amberBg : C.surface }}>
                      <td style={{ ...styles.td, fontFamily: "monospace", fontSize: 10, color: C.textHint }}>{p.id}</td>
                      <td style={{ ...styles.td, fontWeight: 500, color: C.text }}>{p.name}</td>
                      <td style={styles.td}>{p.cat}</td>
                      <td style={{ ...styles.td, fontSize: 10 }}>{p.opt}</td>
                      <td style={{ ...styles.td, textAlign: "right", fontWeight: 700, color: p.stock === 0 ? C.red : p.stock < p.min ? C.amber : C.text }}>{p.stock}개</td>
                      <td style={{ ...styles.td, textAlign: "right", color: C.textHint }}>{p.min}개</td>
                      <td style={{ ...styles.td, textAlign: "center" }}><span style={styles.badge(status.color)}>{status.label}</span></td>
                      <td style={{ ...styles.td, textAlign: "right", fontSize: 10 }}>₩{(p.stock * p.price).toLocaleString()}</td>
                      <td style={{ ...styles.td, textAlign: "right" }}>
                        <div style={{ display: "flex", gap: 3, justifyContent: "flex-end" }}>
                          <button style={styles.smBtn}>수정</button>
                          {p.stock < p.min && <button style={{ ...styles.smBtn, color: C.amber }}>발주</button>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* 입출고 내역 탭 */}
      {tab === "입출고 내역" && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ ...styles.searchBox, flex: 1 }}>🔍 상품명·SKU 검색...</div>
            <select style={styles.select}><option>전체 유형</option><option>입고</option><option>출고</option><option>조정</option></select>
            <div style={{ ...styles.searchBox, width: 160, flex: "none" }}>📅 날짜 범위</div>
            <button style={styles.btn()} onClick={() => exportInventory(products)}>↓ CSV 내보내기</button>
          </div>
          <div style={styles.tableWrap}>
            <table style={{ ...styles.table, tableLayout: "fixed" }}>
              <thead><tr>
                <th style={{ ...styles.th, width: 90 }}>일시</th>
                <th style={{ ...styles.th, width: 60, textAlign: "center" }}>유형</th>
                <th style={{ ...styles.th, width: 80 }}>SKU</th>
                <th style={styles.th}>상품명</th>
                <th style={{ ...styles.th, width: 80 }}>옵션</th>
                <th style={{ ...styles.th, width: 50, textAlign: "right" }}>수량</th>
                <th style={{ ...styles.th, width: 100 }}>처리자</th>
                <th style={styles.th}>비고</th>
              </tr></thead>
              <tbody>
                {logs.map((l, i) => (
                  <tr key={i}>
                    <td style={{ ...styles.td, fontSize: 10, color: C.textHint }}>{l.date}</td>
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      <span style={styles.badge(l.type === "in" ? "green" : l.type === "out" ? "blue" : "amber")}>
                        {l.type === "in" ? "입고" : l.type === "out" ? "출고" : "조정"}
                      </span>
                    </td>
                    <td style={{ ...styles.td, fontFamily: "monospace", fontSize: 10, color: C.textHint }}>{l.sku}</td>
                    <td style={{ ...styles.td, fontWeight: 500, color: C.text }}>{l.name}</td>
                    <td style={{ ...styles.td, fontSize: 10 }}>{l.opt}</td>
                    <td style={{ ...styles.td, textAlign: "right", fontWeight: 700, color: l.type === "in" ? C.green : l.type === "out" ? C.blue : C.amber }}>
                      {l.type === "in" ? "+" : ""}{l.qty}
                    </td>
                    <td style={{ ...styles.td, fontSize: 10 }}>{l.by}</td>
                    <td style={{ ...styles.td, fontSize: 10, color: C.textHint }}>{l.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* 발주 관리 탭 */}
      {tab === "발주 관리" && (
        <>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button style={styles.btn("primary")}>+ 발주 등록</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 12 }}>
            {/* 발주 필요 목록 */}
            <div style={styles.card}>
              <div style={styles.cardTitle}>발주 필요 목록 <span style={{ ...styles.badge("red"), fontSize: 10 }}>{lowStock.length}건</span></div>
              {lowStock.map((p, i) => (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < lowStock.length - 1 ? `1px solid ${C.border}` : "none" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: C.text }}>{p.name}</div>
                    <div style={{ fontSize: 10, color: C.textHint }}>{p.opt} · 현재 {p.stock}개 / 최소 {p.min}개</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: p.stock === 0 ? C.red : C.amber }}>{p.stock === 0 ? "소진" : `${p.min - p.stock}개 부족`}</div>
                    <button style={{ ...styles.smBtn, marginTop: 3, color: C.amber }}>발주 등록</button>
                  </div>
                </div>
              ))}
            </div>

            {/* 진행 중 발주 */}
            <div style={styles.card}>
              <div style={styles.cardTitle}>진행 중 발주</div>
              {[
                { name: "프리미엄 후디 블랙/M", qty: 50, status: "배송 중", eta: "06/13", supplier: "A 공급사" },
                { name: "클래식 티셔츠 화이트/M", qty: 40, status: "발주 확인 중", eta: "06/15", supplier: "B 공급사" },
                { name: "캐주얼 스니커즈 화이트/260", qty: 30, status: "입고 예정", eta: "06/14", supplier: "C 공급사" },
              ].map((o, i) => (
                <div key={i} style={{ padding: "10px 0", borderBottom: i < 2 ? `1px solid ${C.border}` : "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 5 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: C.text }}>{o.name}</div>
                    <span style={styles.badge(o.status === "배송 중" ? "blue" : o.status === "입고 예정" ? "green" : "amber")}>{o.status}</span>
                  </div>
                  <div style={{ display: "flex", gap: 12, fontSize: 10, color: C.textHint }}>
                    <span>수량: {o.qty}개</span>
                    <span>예상 입고: {o.eta}</span>
                    <span>공급사: {o.supplier}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
