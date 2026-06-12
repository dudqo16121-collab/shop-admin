"use client";

import { useState } from "react";
import { C, styles } from "../theme";
import { downloadCSV } from "../csv";

// ── 매출 분석 페이지 ─────────────────────────────────────────
export default function Analytics() {
  const [tab, setTab] = useState("매출");
  const [period, setPeriod] = useState("월별"); // 원본에서 선언 누락되어 있던 상태

  const periodData = {
    "일별": {
      labels: ["6/5", "6/6", "6/7", "6/8", "6/9", "6/10", "6/11"],
      sales: [1240000, 980000, 1560000, 2100000, 1780000, 2340000, 1920000],
      orders: [18, 14, 22, 31, 26, 34, 28],
    },
    "주별": {
      labels: ["1주", "2주", "3주", "4주", "5주"],
      sales: [8200000, 11400000, 9800000, 14200000, 12600000],
      orders: [124, 168, 142, 208, 184],
    },
    "월별": {
      labels: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
      sales: [18400000, 22100000, 19800000, 26400000, 24200000, 28400000, 21000000, 25600000, 30200000, 27800000, 32400000, 38600000],
      orders: [284, 342, 306, 408, 374, 438, 324, 396, 466, 430, 500, 596],
    },
  };

  const data = periodData[period];
  const totalSales = data.sales.reduce((a, b) => a + b, 0);
  const totalOrders = data.orders.reduce((a, b) => a + b, 0);
  const avgOrder = Math.round(totalSales / totalOrders);
  const maxSales = Math.max(...data.sales);

  const categories = [
    { name: "의류", sales: 42800000, orders: 684, growth: 18.2, color: C.purple },
    { name: "신발", sales: 28400000, orders: 452, growth: 12.4, color: C.blue },
    { name: "악세서리", sales: 16200000, orders: 328, growth: 8.6, color: C.green },
    { name: "가방", sales: 12400000, orders: 198, growth: -3.2, color: C.amber },
    { name: "기타", sales: 8600000, orders: 142, growth: 5.1, color: C.textHint },
  ];
  const totalCatSales = categories.reduce((a, b) => a + b.sales, 0);

  const customers = [
    { label: "신규 고객", value: 284, pct: 38, color: C.blue },
    { label: "재구매 고객", value: 342, pct: 46, color: C.green },
    { label: "VIP 고객", value: 120, pct: 16, color: C.purple },
  ];

  const topCustomers = [
    { name: "홍*동", orders: 12, total: "₩1,284,000", grade: "VIP" },
    { name: "김*연", orders: 9, total: "₩892,000", grade: "VIP" },
    { name: "이*준", orders: 7, total: "₩624,000", grade: "일반" },
    { name: "박*서", orders: 6, total: "₩548,000", grade: "일반" },
    { name: "최*민", orders: 5, total: "₩412,000", grade: "일반" },
  ];

  const fmt = (n) => n >= 10000000 ? `${(n / 10000000).toFixed(1)}천만` : n >= 10000 ? `${(n / 10000).toFixed(0)}만` : n.toLocaleString();

  return (
    <>
      {/* 기간 필터 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {["일별", "주별", "월별"].map(p => (
            <div key={p} onClick={() => setPeriod(p)} style={styles.filterChip(period === p)}>{p}</div>
          ))}
        </div>
        <button style={styles.btn()} onClick={() => downloadCSV("매출분석", ["기간", "매출", "주문수", "평균주문액"], data.sales.map((s, i) => [data.labels[i], s, data.orders[i], Math.round(s / data.orders[i])]))}>↓ CSV 내보내기</button>
      </div>

      {/* KPI */}
      <div style={styles.kpiGrid}>
        {[
          { label: "총 매출", value: `₩${fmt(totalSales)}`, delta: "+14.2%", up: true, sub: `주문 ${totalOrders.toLocaleString()}건`, accent: C.green },
          { label: "평균 주문액", value: `₩${avgOrder.toLocaleString()}`, delta: "+6.8%", up: true, sub: "건당 평균", accent: C.blue },
          { label: "구매 전환율", value: "3.8%", delta: "-0.4%p", up: false, sub: "방문자 → 결제", accent: C.amber },
          { label: "재구매율", value: "46.2%", delta: "+3.1%p", up: true, sub: "전체 고객 중", accent: C.purple },
        ].map(k => (
          <div key={k.label} style={styles.kpiCard(k.accent)}>
            <div style={styles.kpiLabel}>{k.label}</div>
            <div style={styles.kpiValue}>{k.value}</div>
            <div style={styles.kpiDelta(k.up)}>{k.up ? "↑" : "↓"} {k.delta}</div>
            <div style={styles.kpiSub}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* 탭 */}
      <div style={{ display: "flex", borderBottom: `1px solid ${C.border}` }}>
        {["매출", "카테고리", "고객 분석"].map(t => (
          <div key={t} onClick={() => setTab(t)} style={{ fontSize: 12, padding: "8px 16px", cursor: "pointer", color: tab === t ? C.text : C.textHint, fontWeight: tab === t ? 700 : 400, borderBottom: tab === t ? `2px solid ${C.accent}` : "2px solid transparent", marginBottom: -1 }}>{t}</div>
        ))}
      </div>

      {/* 매출 탭 */}
      {tab === "매출" && (
        <>
          <div style={styles.card}>
            <div style={styles.cardTitle}>
              {period} 매출 추이
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: C.textSub }}><div style={{ width: 8, height: 8, borderRadius: 2, background: C.accent }} />매출</div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: C.textSub }}><div style={{ width: 8, height: 8, borderRadius: 2, background: C.border }} />주문수</div>
              </div>
            </div>
            {/* 바 차트 */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: period === "월별" ? 4 : 8, height: 140, paddingBottom: 4 }}>
              {data.sales.map((s, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, height: "100%" }}>
                  <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
                    <div style={{ width: "100%", height: `${(s / maxSales) * 100}%`, background: C.accent, borderRadius: "3px 3px 0 0", minHeight: 4, opacity: 0.85 }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", marginTop: 4 }}>
              {data.labels.map((l, i) => (
                <div key={i} style={{ flex: 1, fontSize: 9, color: C.textHint, textAlign: "center" }}>{l}</div>
              ))}
            </div>
          </div>

          {/* 매출 상세 테이블 */}
          <div style={styles.tableWrap}>
            <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, fontWeight: 600, fontSize: 12 }}>기간별 상세</div>
            <table style={{ ...styles.table, tableLayout: "fixed" }}>
              <thead><tr>
                <th style={styles.th}>기간</th>
                <th style={{ ...styles.th, textAlign: "right" }}>매출</th>
                <th style={{ ...styles.th, textAlign: "right" }}>주문수</th>
                <th style={{ ...styles.th, textAlign: "right" }}>평균 주문액</th>
                <th style={{ ...styles.th, textAlign: "right" }}>전기 대비</th>
              </tr></thead>
              <tbody>
                {data.sales.map((s, i) => {
                  const prev = i > 0 ? data.sales[i - 1] : null;
                  const growth = prev ? ((s - prev) / prev * 100).toFixed(1) : null;
                  return (
                    <tr key={i}>
                      <td style={styles.td}>{data.labels[i]}</td>
                      <td style={{ ...styles.td, textAlign: "right", fontWeight: 600, color: C.text }}>₩{fmt(s)}</td>
                      <td style={{ ...styles.td, textAlign: "right" }}>{data.orders[i].toLocaleString()}건</td>
                      <td style={{ ...styles.td, textAlign: "right" }}>₩{Math.round(s / data.orders[i]).toLocaleString()}</td>
                      <td style={{ ...styles.td, textAlign: "right", color: growth === null ? C.textHint : Number(growth) >= 0 ? C.green : C.red, fontWeight: 500 }}>
                        {growth === null ? "—" : `${Number(growth) >= 0 ? "+" : ""}${growth}%`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* 카테고리 탭 */}
      {tab === "카테고리" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1.4fr)", gap: 12 }}>
            {/* 도넛 차트 대체 */}
            <div style={styles.card}>
              <div style={styles.cardTitle}>카테고리별 매출 비중</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
                {categories.map(cat => (
                  <div key={cat.name}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: cat.color }} />
                        <span style={{ fontWeight: 500, color: C.text }}>{cat.name}</span>
                      </div>
                      <span style={{ color: C.textSub }}>{(cat.sales / totalCatSales * 100).toFixed(1)}%</span>
                    </div>
                    <div style={{ height: 6, background: C.bg, borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${cat.sales / totalCatSales * 100}%`, background: cat.color, borderRadius: 3 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 카테고리 상세 */}
            <div style={styles.card}>
              <div style={styles.cardTitle}>카테고리 상세</div>
              <table style={{ ...styles.table }}>
                <thead><tr>
                  <th style={styles.th}>카테고리</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>매출</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>주문</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>성장률</th>
                </tr></thead>
                <tbody>
                  {categories.map(cat => (
                    <tr key={cat.name}>
                      <td style={styles.td}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 8, height: 8, borderRadius: 2, background: cat.color, flexShrink: 0 }} />
                          {cat.name}
                        </div>
                      </td>
                      <td style={{ ...styles.td, textAlign: "right", fontWeight: 600, color: C.text }}>₩{fmt(cat.sales)}</td>
                      <td style={{ ...styles.td, textAlign: "right" }}>{cat.orders}건</td>
                      <td style={{ ...styles.td, textAlign: "right", color: cat.growth >= 0 ? C.green : C.red, fontWeight: 600 }}>
                        {cat.growth >= 0 ? "+" : ""}{cat.growth}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 베스트 상품 */}
          <div style={styles.card}>
            <div style={styles.cardTitle}>베스트 상품 TOP 5</div>
            <table style={{ ...styles.table, tableLayout: "fixed" }}>
              <thead><tr>
                <th style={{ ...styles.th, width: 32 }}>순위</th>
                <th style={styles.th}>상품명</th>
                <th style={styles.th}>카테고리</th>
                <th style={{ ...styles.th, textAlign: "right" }}>판매량</th>
                <th style={{ ...styles.th, textAlign: "right" }}>매출</th>
                <th style={{ ...styles.th, textAlign: "right" }}>전월 대비</th>
              </tr></thead>
              <tbody>
                {[
                  { rank: 1, name: "프리미엄 후디", cat: "의류", qty: 284, sales: "₩25,280,000", growth: "+18.2%" },
                  { rank: 2, name: "클래식 티셔츠", cat: "의류", qty: 198, sales: "₩7,722,000", growth: "+12.4%" },
                  { rank: 3, name: "데님 팬츠", cat: "하의", qty: 156, sales: "₩12,480,000", growth: "+8.6%" },
                  { rank: 4, name: "캐주얼 스니커즈", cat: "신발", qty: 124, sales: "₩11,160,000", growth: "-3.2%" },
                  { rank: 5, name: "레더 토트백", cat: "가방", qty: 98, sales: "₩9,800,000", growth: "+5.1%" },
                ].map(p => (
                  <tr key={p.rank}>
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      <div style={{ width: 20, height: 20, borderRadius: 5, background: p.rank <= 3 ? C.amberBg : C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: p.rank <= 3 ? C.amberText : C.textHint }}>{p.rank}</div>
                    </td>
                    <td style={{ ...styles.td, fontWeight: 500, color: C.text }}>{p.name}</td>
                    <td style={styles.td}>{p.cat}</td>
                    <td style={{ ...styles.td, textAlign: "right" }}>{p.qty}개</td>
                    <td style={{ ...styles.td, textAlign: "right", fontWeight: 600, color: C.text }}>{p.sales}</td>
                    <td style={{ ...styles.td, textAlign: "right", color: p.growth.startsWith("+") ? C.green : C.red, fontWeight: 600 }}>{p.growth}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* 고객 분석 탭 */}
      {tab === "고객 분석" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 12 }}>
            {customers.map(c => (
              <div key={c.label} style={{ ...styles.card, textAlign: "center", paddingTop: 16 }}>
                <div style={styles.kpiLabel}>{c.label}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: c.color, letterSpacing: "-1px", margin: "6px 0" }}>{c.value}</div>
                <div style={{ height: 5, background: C.bg, borderRadius: 3, overflow: "hidden", margin: "6px 0" }}>
                  <div style={{ height: "100%", width: `${c.pct}%`, background: c.color, borderRadius: 3 }} />
                </div>
                <div style={{ fontSize: 11, color: C.textHint }}>전체의 {c.pct}%</div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 12 }}>
            {/* 유입 경로 */}
            <div style={styles.card}>
              <div style={styles.cardTitle}>유입 경로 분석</div>
              {[
                { label: "직접 접속", pct: 42, color: C.accent },
                { label: "검색 (네이버/구글)", pct: 28, color: C.blue },
                { label: "SNS (인스타/카카오)", pct: 18, color: C.purple },
                { label: "이메일 마케팅", pct: 8, color: C.green },
                { label: "기타", pct: 4, color: C.textHint },
              ].map(r => (
                <div key={r.label} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}>
                    <span style={{ color: C.textSub }}>{r.label}</span>
                    <span style={{ fontWeight: 600, color: C.text }}>{r.pct}%</span>
                  </div>
                  <div style={{ height: 5, background: C.bg, borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${r.pct}%`, background: r.color, borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>

            {/* 연령·성별 */}
            <div style={styles.card}>
              <div style={styles.cardTitle}>연령대별 구매 비중</div>
              {[
                { label: "10대", male: 8, female: 12 },
                { label: "20대", male: 22, female: 28 },
                { label: "30대", male: 18, female: 24 },
                { label: "40대", male: 12, female: 10 },
                { label: "50대+", male: 4, female: 6 },
              ].map(r => (
                <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 10, color: C.textSub, width: 28, flexShrink: 0 }}>{r.label}</span>
                  <div style={{ flex: 1, display: "flex", gap: 2, height: 14 }}>
                    <div style={{ flex: r.male, background: C.blue, borderRadius: "3px 0 0 3px", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 3 }}>
                      <span style={{ fontSize: 9, color: "#fff", fontWeight: 600 }}>{r.male}%</span>
                    </div>
                    <div style={{ flex: r.female, background: C.purple, borderRadius: "0 3px 3px 0", display: "flex", alignItems: "center", paddingLeft: 3 }}>
                      <span style={{ fontSize: 9, color: "#fff", fontWeight: 600 }}>{r.female}%</span>
                    </div>
                  </div>
                </div>
              ))}
              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: C.textSub }}><div style={{ width: 8, height: 8, borderRadius: 2, background: C.blue }} />남성</div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: C.textSub }}><div style={{ width: 8, height: 8, borderRadius: 2, background: C.purple }} />여성</div>
              </div>
            </div>
          </div>

          {/* 상위 고객 */}
          <div style={styles.tableWrap}>
            <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, fontWeight: 600, fontSize: 12 }}>상위 구매 고객</div>
            <table style={styles.table}>
              <thead><tr>
                <th style={styles.th}>고객명</th>
                <th style={{ ...styles.th, textAlign: "right" }}>주문 횟수</th>
                <th style={{ ...styles.th, textAlign: "right" }}>총 구매액</th>
                <th style={{ ...styles.th, textAlign: "center" }}>등급</th>
              </tr></thead>
              <tbody>
                {topCustomers.map((c, i) => (
                  <tr key={i}>
                    <td style={{ ...styles.td, fontWeight: 500, color: C.text }}>{c.name}</td>
                    <td style={{ ...styles.td, textAlign: "right" }}>{c.orders}회</td>
                    <td style={{ ...styles.td, textAlign: "right", fontWeight: 600, color: C.text }}>{c.total}</td>
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      <span style={styles.badge(c.grade === "VIP" ? "amber" : "gray")}>{c.grade}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
