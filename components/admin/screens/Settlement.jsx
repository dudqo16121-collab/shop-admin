"use client";

import { useState } from "react";
import { C, styles } from "../theme";

// ── 정산 관리 페이지 ─────────────────────────────────────────
export default function Settlement() {
  const [tab, setTab] = useState("월별 정산");
  const [selectedMonth, setSelectedMonth] = useState("2026-06");

  const monthlyData = [
    { month: "2026-06", sales: 28430000, fee: 2843000, vat: 284300, shipping: 1240000, net: 24062700, status: "정산 예정", date: "07/15" },
    { month: "2026-05", sales: 24200000, fee: 2420000, vat: 242000, shipping: 1080000, net: 20458000, status: "정산 완료", date: "06/15" },
    { month: "2026-04", sales: 26400000, fee: 2640000, vat: 264000, shipping: 1180000, net: 22316000, status: "정산 완료", date: "05/15" },
    { month: "2026-03", sales: 19800000, fee: 1980000, vat: 198000, shipping: 920000, net: 16702000, status: "정산 완료", date: "04/15" },
    { month: "2026-02", sales: 22100000, fee: 2210000, vat: 221000, shipping: 1020000, net: 18649000, status: "정산 완료", date: "03/15" },
    { month: "2026-01", sales: 18400000, fee: 1840000, vat: 184000, shipping: 860000, net: 15516000, status: "정산 완료", date: "02/15" },
  ];

  const feeDetails = [
    { category: "판매 수수료", rate: "10%", amount: 2843000, desc: "매출의 10% 기준" },
    { category: "결제 수수료", rate: "1.5%", amount: 426450, desc: "카드/간편결제 합산" },
    { category: "배송비 수수료", rate: "0.5%", amount: 142150, desc: "배송 처리 수수료" },
    { category: "마케팅 수수료", rate: "0.5%", amount: 142150, desc: "프로모션 참여 수수료" },
    { category: "부가가치세", rate: "10%", amount: 284300, desc: "수수료 합산 기준" },
  ];

  const paymentMethods = [
    { method: "신용카드", sales: 14820000, pct: 52, fee: 1.5 },
    { method: "카카오페이", sales: 6820000, pct: 24, fee: 1.2 },
    { method: "네이버페이", sales: 4260000, pct: 15, fee: 1.2 },
    { method: "무통장입금", sales: 1710000, pct: 6, fee: 0 },
    { method: "기타", sales: 820000, pct: 3, fee: 1.0 },
  ];

  const fmt = (n) => n >= 10000000 ? `${(n / 10000000).toFixed(1)}천만` : `${(n / 10000).toFixed(0)}만`;
  const selected = monthlyData.find(m => m.month === selectedMonth) || monthlyData[0];

  return (
    <>
      {/* KPI */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 10 }}>
        {[
          { label: "이번 달 매출", value: `₩${fmt(selected.sales)}`, sub: "결제 완료 기준", accent: C.green },
          { label: "정산 예정액", value: `₩${fmt(selected.net)}`, sub: `${selected.date} 정산`, accent: C.blue },
          { label: "총 수수료", value: `₩${fmt(selected.fee)}`, sub: `매출의 ${(selected.fee / selected.sales * 100).toFixed(1)}%`, accent: C.amber },
          { label: "누적 정산액", value: `₩${fmt(monthlyData.filter(m => m.status === "정산 완료").reduce((a, m) => a + m.net, 0))}`, sub: "올해 합산", accent: C.purple },
        ].map(k => (
          <div key={k.label} style={styles.kpiCard(k.accent)}>
            <div style={styles.kpiLabel}>{k.label}</div>
            <div style={{ ...styles.kpiValue, fontSize: 18 }}>{k.value}</div>
            <div style={styles.kpiSub}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* 정산 예정 배너 */}
      <div style={{ background: C.blueBg, border: `1px solid ${C.blue}`, borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 16 }}>💳</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.blueText }}>정산 예정 안내 — 2026년 6월 정산</div>
          <div style={{ fontSize: 11, color: C.blueText, marginTop: 2 }}>
            정산 예정일: <strong>2026년 7월 15일</strong> · 예정 금액: <strong>₩{selected.net.toLocaleString()}</strong>
          </div>
        </div>
        <button style={{ fontSize: 11, padding: "5px 12px", borderRadius: 8, border: `1px solid ${C.blue}`, background: "transparent", color: C.blueText, cursor: "pointer", fontWeight: 600 }}>상세 보기</button>
      </div>

      {/* 탭 */}
      <div style={{ display: "flex", borderBottom: `1px solid ${C.border}` }}>
        {["월별 정산", "수수료 내역", "결제수단별", "세금계산서"].map(t => (
          <div key={t} onClick={() => setTab(t)} style={{ fontSize: 12, padding: "8px 16px", cursor: "pointer", color: tab === t ? C.text : C.textHint, fontWeight: tab === t ? 700 : 400, borderBottom: tab === t ? `2px solid ${C.accent}` : "2px solid transparent", marginBottom: -1 }}>{t}</div>
        ))}
      </div>

      {/* 월별 정산 탭 */}
      {tab === "월별 정산" && (
        <>
          {/* 바 차트 */}
          <div style={styles.card}>
            <div style={styles.cardTitle}>월별 매출 / 정산액 추이</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 100, paddingBottom: 4 }}>
              {[...monthlyData].reverse().map((m) => {
                const maxVal = Math.max(...monthlyData.map(d => d.sales));
                return (
                  <div key={m.month} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, height: "100%", alignItems: "center" }}>
                    <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end", gap: 2 }}>
                      <div style={{ flex: 1, height: `${(m.sales / maxVal) * 100}%`, background: C.accent, borderRadius: "3px 3px 0 0", opacity: 0.8 }} />
                      <div style={{ flex: 1, height: `${(m.net / maxVal) * 100}%`, background: C.blue, borderRadius: "3px 3px 0 0", opacity: 0.6 }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex" }}>
              {[...monthlyData].reverse().map(m => (
                <div key={m.month} style={{ flex: 1, fontSize: 9, color: C.textHint, textAlign: "center" }}>{m.month.slice(5)}월</div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              {[["매출", C.accent], ["정산액", C.blue]].map(([label, color]) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: C.textSub }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />{label}
                </div>
              ))}
            </div>
          </div>

          {/* 정산 테이블 */}
          <div style={styles.tableWrap}>
            <table style={{ ...styles.table, tableLayout: "fixed" }}>
              <thead><tr>
                <th style={styles.th}>정산 월</th>
                <th style={{ ...styles.th, textAlign: "right" }}>매출</th>
                <th style={{ ...styles.th, textAlign: "right" }}>수수료</th>
                <th style={{ ...styles.th, textAlign: "right" }}>부가세</th>
                <th style={{ ...styles.th, textAlign: "right" }}>배송비</th>
                <th style={{ ...styles.th, textAlign: "right" }}>정산액</th>
                <th style={{ ...styles.th, textAlign: "center" }}>정산일</th>
                <th style={{ ...styles.th, textAlign: "center" }}>상태</th>
                <th style={{ ...styles.th, textAlign: "right" }}>관리</th>
              </tr></thead>
              <tbody>
                {monthlyData.map((m) => (
                  <tr key={m.month} onClick={() => setSelectedMonth(m.month)} style={{ cursor: "pointer", background: selectedMonth === m.month ? C.bg : C.surface }}>
                    <td style={{ ...styles.td, fontWeight: 600, color: C.text }}>{m.month.replace("-", "년 ")}월</td>
                    <td style={{ ...styles.td, textAlign: "right", fontWeight: 600, color: C.text }}>₩{m.sales.toLocaleString()}</td>
                    <td style={{ ...styles.td, textAlign: "right", color: C.red }}>-₩{m.fee.toLocaleString()}</td>
                    <td style={{ ...styles.td, textAlign: "right", color: C.red }}>-₩{m.vat.toLocaleString()}</td>
                    <td style={{ ...styles.td, textAlign: "right", color: C.red }}>-₩{m.shipping.toLocaleString()}</td>
                    <td style={{ ...styles.td, textAlign: "right", fontWeight: 700, color: C.green }}>₩{m.net.toLocaleString()}</td>
                    <td style={{ ...styles.td, textAlign: "center", fontSize: 10 }}>{m.date}</td>
                    <td style={{ ...styles.td, textAlign: "center" }}><span style={styles.badge(m.status === "정산 완료" ? "green" : "blue")}>{m.status}</span></td>
                    <td style={{ ...styles.td, textAlign: "right" }}>
                      <button style={styles.smBtn}>상세</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* 수수료 내역 탭 */}
      {tab === "수수료 내역" && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <select style={styles.select} value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
              {monthlyData.map(m => <option key={m.month} value={m.month}>{m.month.replace("-", "년 ")}월</option>)}
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1.4fr)", gap: 12 }}>
            {/* 수수료 요약 */}
            <div style={styles.card}>
              <div style={styles.cardTitle}>수수료 구성</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {feeDetails.map((f, i) => (
                  <div key={f.category} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < feeDetails.length - 1 ? `1px solid ${C.border}` : "none" }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 500, color: C.text }}>{f.category}</div>
                      <div style={{ fontSize: 10, color: C.textHint, marginTop: 2 }}>{f.desc}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.red }}>-₩{f.amount.toLocaleString()}</div>
                      <div style={{ fontSize: 10, color: C.textHint }}>{f.rate}</div>
                    </div>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0 0", borderTop: `2px solid ${C.border}`, marginTop: 4 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>총 차감액</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: C.red }}>-₩{feeDetails.reduce((a, f) => a + f.amount, 0).toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* 정산 계산서 */}
            <div style={styles.card}>
              <div style={styles.cardTitle}>{selectedMonth.replace("-", "년 ")}월 정산 계산서</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {[
                  { label: "총 매출", value: `₩${selected.sales.toLocaleString()}`, color: C.text },
                  { label: "판매 수수료 차감", value: `-₩${selected.fee.toLocaleString()}`, color: C.red },
                  { label: "부가가치세 차감", value: `-₩${selected.vat.toLocaleString()}`, color: C.red },
                  { label: "배송비 차감", value: `-₩${selected.shipping.toLocaleString()}`, color: C.red },
                ].map((r) => (
                  <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: `1px solid ${C.border}`, fontSize: 12 }}>
                    <span style={{ color: C.textSub }}>{r.label}</span>
                    <span style={{ fontWeight: 600, color: r.color }}>{r.value}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0 4px", fontSize: 15, fontWeight: 800, letterSpacing: "-0.3px" }}>
                  <span>최종 정산액</span>
                  <span style={{ color: C.green }}>₩{selected.net.toLocaleString()}</span>
                </div>
                <div style={{ fontSize: 11, color: C.textHint, marginBottom: 12 }}>정산 예정일: {selected.date} · {selected.status}</div>
                <button style={{ ...styles.btn(), justifyContent: "center", width: "100%" }}>📄 정산 명세서 다운로드</button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 결제수단별 탭 */}
      {tab === "결제수단별" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1.5fr)", gap: 12 }}>
            <div style={styles.card}>
              <div style={styles.cardTitle}>결제수단별 비중</div>
              {paymentMethods.map(p => (
                <div key={p.method} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                    <span style={{ fontWeight: 500, color: C.text }}>{p.method}</span>
                    <span style={{ color: C.textSub }}>{p.pct}%</span>
                  </div>
                  <div style={{ height: 6, background: C.bg, borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${p.pct}%`, background: C.accent, borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={styles.card}>
              <div style={styles.cardTitle}>결제수단별 상세</div>
              <table style={styles.table}>
                <thead><tr>
                  <th style={styles.th}>결제수단</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>매출</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>비중</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>수수료율</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>수수료</th>
                </tr></thead>
                <tbody>
                  {paymentMethods.map(p => (
                    <tr key={p.method}>
                      <td style={{ ...styles.td, fontWeight: 500, color: C.text }}>{p.method}</td>
                      <td style={{ ...styles.td, textAlign: "right" }}>₩{p.sales.toLocaleString()}</td>
                      <td style={{ ...styles.td, textAlign: "right" }}>{p.pct}%</td>
                      <td style={{ ...styles.td, textAlign: "right", color: C.textHint }}>{p.fee}%</td>
                      <td style={{ ...styles.td, textAlign: "right", color: C.red }}>-₩{(p.sales * p.fee / 100).toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr style={{ background: C.bg }}>
                    <td style={{ ...styles.td, fontWeight: 700, color: C.text }}>합계</td>
                    <td style={{ ...styles.td, textAlign: "right", fontWeight: 700, color: C.text }}>₩{paymentMethods.reduce((a, p) => a + p.sales, 0).toLocaleString()}</td>
                    <td style={{ ...styles.td, textAlign: "right", fontWeight: 700 }}>100%</td>
                    <td style={styles.td} />
                    <td style={{ ...styles.td, textAlign: "right", fontWeight: 700, color: C.red }}>-₩{paymentMethods.reduce((a, p) => a + p.sales * p.fee / 100, 0).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* 세금계산서 탭 */}
      {tab === "세금계산서" && (
        <>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button style={styles.btn("primary")}>+ 세금계산서 발행</button>
          </div>
          <div style={styles.tableWrap}>
            <table style={{ ...styles.table, tableLayout: "fixed" }}>
              <thead><tr>
                <th style={styles.th}>발행일</th>
                <th style={styles.th}>문서번호</th>
                <th style={styles.th}>공급받는자</th>
                <th style={{ ...styles.th, textAlign: "right" }}>공급가액</th>
                <th style={{ ...styles.th, textAlign: "right" }}>세액</th>
                <th style={{ ...styles.th, textAlign: "right" }}>합계</th>
                <th style={{ ...styles.th, textAlign: "center" }}>상태</th>
                <th style={{ ...styles.th, textAlign: "right" }}>관리</th>
              </tr></thead>
              <tbody>
                {[
                  { date: "2026-06-01", no: "2026-06-0001", to: "ShopAdmin 주식회사", supply: 2420000, tax: 242000, status: "발행 완료" },
                  { date: "2026-05-01", no: "2026-05-0001", to: "ShopAdmin 주식회사", supply: 2200000, tax: 220000, status: "발행 완료" },
                  { date: "2026-04-01", no: "2026-04-0001", to: "ShopAdmin 주식회사", supply: 2400000, tax: 240000, status: "발행 완료" },
                  { date: "2026-03-01", no: "2026-03-0001", to: "ShopAdmin 주식회사", supply: 1800000, tax: 180000, status: "발행 완료" },
                ].map((t, i) => (
                  <tr key={i}>
                    <td style={{ ...styles.td, fontSize: 10 }}>{t.date}</td>
                    <td style={{ ...styles.td, fontFamily: "monospace", fontSize: 10, color: C.blue }}>{t.no}</td>
                    <td style={{ ...styles.td, fontWeight: 500, color: C.text }}>{t.to}</td>
                    <td style={{ ...styles.td, textAlign: "right" }}>₩{t.supply.toLocaleString()}</td>
                    <td style={{ ...styles.td, textAlign: "right", color: C.red }}>₩{t.tax.toLocaleString()}</td>
                    <td style={{ ...styles.td, textAlign: "right", fontWeight: 700 }}>₩{(t.supply + t.tax).toLocaleString()}</td>
                    <td style={{ ...styles.td, textAlign: "center" }}><span style={styles.badge("green")}>{t.status}</span></td>
                    <td style={{ ...styles.td, textAlign: "right" }}>
                      <div style={{ display: "flex", gap: 3, justifyContent: "flex-end" }}>
                        <button style={styles.smBtn}>보기</button>
                        <button style={styles.smBtn}>↓</button>
                      </div>
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
