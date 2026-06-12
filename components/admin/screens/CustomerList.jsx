"use client";

import { useState } from "react";
import { C, styles } from "../theme";
import { exportCustomers } from "../csv";

// ── 고객 목록 페이지 ─────────────────────────────────────────
export default function CustomerList() {
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("전체");
  const [statusFilter, setStatusFilter] = useState("전체");
  const [sort, setSort] = useState("최근 가입순");
  const [selected, setSelected] = useState([]);
  const [detailOpen, setDetailOpen] = useState(null);

  const customers = [
    { id: 1, name: "홍길동", email: "hong***@email.com", phone: "010-****-2847", grade: "VIP", gradeDetail: "골드", orders: 48, total: 2840000, point: 4280, lastOrder: "2일 전", joined: "2023-03-15", status: "활성", avatar: "홍", cats: ["의류", "신발"] },
    { id: 2, name: "김지연", email: "kim***@email.com", phone: "010-****-1234", grade: "VIP", gradeDetail: "실버", orders: 24, total: 1240000, point: 1820, lastOrder: "5일 전", joined: "2023-06-20", status: "활성", avatar: "김", cats: ["악세서리", "가방"] },
    { id: 3, name: "이준혁", email: "lee***@email.com", phone: "010-****-5678", grade: "일반", gradeDetail: "일반", orders: 12, total: 620000, point: 820, lastOrder: "1주 전", joined: "2023-09-10", status: "활성", avatar: "이", cats: ["하의", "의류"] },
    { id: 4, name: "박서윤", email: "park***@email.com", phone: "010-****-9012", grade: "일반", gradeDetail: "일반", orders: 8, total: 380000, point: 420, lastOrder: "2주 전", joined: "2024-01-05", status: "활성", avatar: "박", cats: ["신발"] },
    { id: 5, name: "최민준", email: "choi***@email.com", phone: "010-****-3456", grade: "신규", gradeDetail: "신규", orders: 2, total: 128000, point: 180, lastOrder: "3주 전", joined: "2024-04-12", status: "활성", avatar: "최", cats: ["의류"] },
    { id: 6, name: "정수아", email: "jung***@email.com", phone: "010-****-7890", grade: "VIP", gradeDetail: "골드", orders: 36, total: 1980000, point: 3240, lastOrder: "어제", joined: "2023-05-08", status: "활성", avatar: "정", cats: ["가방", "악세서리"] },
    { id: 7, name: "강태양", email: "kang***@email.com", phone: "010-****-2345", grade: "일반", gradeDetail: "일반", orders: 6, total: 290000, point: 240, lastOrder: "1달 전", joined: "2024-02-28", status: "휴면", avatar: "강", cats: ["하의"] },
    { id: 8, name: "윤하늘", email: "yoon***@email.com", phone: "010-****-6789", grade: "일반", gradeDetail: "일반", orders: 14, total: 740000, point: 680, lastOrder: "4일 전", joined: "2023-11-15", status: "활성", avatar: "윤", cats: ["의류", "악세서리"] },
    { id: 9, name: "임도현", email: "lim***@email.com", phone: "010-****-0123", grade: "신규", gradeDetail: "신규", orders: 1, total: 48000, point: 80, lastOrder: "1주 전", joined: "2024-05-20", status: "활성", avatar: "임", cats: ["악세서리"] },
    { id: 10, name: "한소희", email: "han***@email.com", phone: "010-****-4567", grade: "VIP", gradeDetail: "플래티넘", orders: 64, total: 4280000, point: 8420, lastOrder: "방금", joined: "2022-12-01", status: "활성", avatar: "한", cats: ["의류", "가방", "신발"] },
    { id: 11, name: "오세진", email: "oh***@email.com", phone: "010-****-8901", grade: "일반", gradeDetail: "일반", orders: 3, total: 142000, point: 120, lastOrder: "2달 전", joined: "2024-03-10", status: "정지", avatar: "오", cats: ["신발"] },
    { id: 12, name: "신예은", email: "shin***@email.com", phone: "010-****-2346", grade: "일반", gradeDetail: "일반", orders: 18, total: 860000, point: 920, lastOrder: "3일 전", joined: "2023-08-22", status: "활성", avatar: "신", cats: ["의류", "하의"] },
  ];

  const gradeDetailColor = {
    "플래티넘": { bg: C.purpleBg, text: C.purpleText },
    "골드": { bg: C.amberBg, text: C.amberText },
    "실버": { bg: C.bg, text: C.textSub },
    "일반": { bg: C.bg, text: C.textHint },
    "신규": { bg: C.blueBg, text: C.blueText },
  };
  const statusColor = { "활성": "green", "휴면": "amber", "정지": "red" };
  const avatarColor = { "플래티넘": C.purple, "골드": C.amber, "실버": C.textSub, "일반": C.textHint, "신규": C.blue };

  const filtered = customers.filter(c => {
    const matchSearch = c.name.includes(search) || c.email.includes(search) || c.phone.includes(search);
    const matchGrade = gradeFilter === "전체" || c.grade === gradeFilter;
    const matchStatus = statusFilter === "전체" || c.status === statusFilter;
    return matchSearch && matchGrade && matchStatus;
  }).sort((a, b) => {
    if (sort === "최근 가입순") return new Date(b.joined) - new Date(a.joined);
    if (sort === "구매액순") return b.total - a.total;
    if (sort === "주문횟수순") return b.orders - a.orders;
    if (sort === "포인트순") return b.point - a.point;
    return 0;
  });

  const toggleSelect = (id) => setSelected(s => s.includes(id) ? s.filter(i => i !== id) : [...s, id]);
  const toggleAll = () => setSelected(selected.length === filtered.length ? [] : filtered.map(c => c.id));

  return (
    <>
      {/* KPI */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: 10 }}>
        {[
          { label: "전체 고객", value: `${customers.length}명`, sub: "등록된 고객", accent: C.blue },
          { label: "VIP 고객", value: `${customers.filter(c => c.grade === "VIP").length}명`, sub: "VIP 등급", accent: C.amber },
          { label: "신규 고객", value: `${customers.filter(c => c.grade === "신규").length}명`, sub: "이번 달", accent: C.green },
          { label: "휴면 고객", value: `${customers.filter(c => c.status === "휴면").length}명`, sub: "90일 미접속", accent: C.textHint },
          { label: "총 구매액", value: `₩${(customers.reduce((a, c) => a + c.total, 0) / 10000).toFixed(0)}만`, sub: "누적 합산", accent: C.purple },
        ].map(k => (
          <div key={k.label} style={styles.kpiCard(k.accent)}>
            <div style={styles.kpiLabel}>{k.label}</div>
            <div style={{ ...styles.kpiValue, fontSize: 17 }}>{k.value}</div>
            <div style={styles.kpiSub}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* 필터 바 */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <div style={{ ...styles.searchBox, flex: 1, minWidth: 160 }}>
          🔍
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="이름·이메일·전화번호 검색..."
            style={{ flex: 1, border: "none", outline: "none", fontSize: 11, color: C.text, background: "transparent" }}
          />
        </div>
        <div style={{ display: "flex", gap: 5 }}>
          {["전체", "VIP", "일반", "신규"].map(g => (
            <div key={g} onClick={() => setGradeFilter(g)} style={styles.filterChip(gradeFilter === g)}>{g}</div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 5 }}>
          {["전체", "활성", "휴면", "정지"].map(s => (
            <div key={s} onClick={() => setStatusFilter(s)} style={styles.filterChip(statusFilter === s)}>{s}</div>
          ))}
        </div>
        <select style={styles.select} value={sort} onChange={e => setSort(e.target.value)}>
          <option>최근 가입순</option>
          <option>구매액순</option>
          <option>주문횟수순</option>
          <option>포인트순</option>
        </select>
        <button style={styles.btn()} onClick={() => exportCustomers(customers)}>↓ CSV 내보내기</button>
      </div>

      {/* 일괄 처리 바 */}
      {selected.length > 0 && (
        <div style={{ ...styles.card, padding: "8px 12px", display: "flex", alignItems: "center", gap: 8, fontSize: 11, background: C.blueBg, border: `1px solid ${C.blue}` }}>
          <span style={{ color: C.blueText, fontWeight: 600 }}>{selected.length}명 선택됨</span>
          <span style={{ flex: 1 }} />
          <button style={styles.smBtn}>📧 이메일 발송</button>
          <button style={styles.smBtn}>🎫 쿠폰 지급</button>
          <button style={styles.smBtn}>등급 변경</button>
          <button style={{ ...styles.smBtn, color: C.red }}>계정 정지</button>
          <button style={styles.smBtn} onClick={() => setSelected([])}>선택 해제</button>
        </div>
      )}

      {/* 테이블 */}
      <div style={styles.tableWrap}>
        <table style={{ ...styles.table, tableLayout: "fixed" }}>
          <thead><tr>
            <th style={{ ...styles.th, width: 32 }}>
              <input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleAll} style={{ width: 13, height: 13, accentColor: C.accent }} />
            </th>
            <th style={styles.th}>고객명</th>
            <th style={styles.th}>연락처</th>
            <th style={{ ...styles.th, width: 80, textAlign: "center" }}>등급</th>
            <th style={{ ...styles.th, width: 60, textAlign: "right" }}>주문 수</th>
            <th style={{ ...styles.th, width: 90, textAlign: "right" }}>총 구매액</th>
            <th style={{ ...styles.th, width: 70, textAlign: "right" }}>포인트</th>
            <th style={{ ...styles.th, width: 80 }}>최근 주문</th>
            <th style={{ ...styles.th, width: 90 }}>가입일</th>
            <th style={{ ...styles.th, width: 60, textAlign: "center" }}>상태</th>
            <th style={{ ...styles.th, width: 80, textAlign: "right" }}>관리</th>
          </tr></thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} style={{ background: selected.includes(c.id) ? C.blueBg : C.surface }}
                onMouseEnter={e => { if (!selected.includes(c.id)) e.currentTarget.style.background = C.bg; }}
                onMouseLeave={e => { if (!selected.includes(c.id)) e.currentTarget.style.background = C.surface; }}
              >
                <td style={styles.td}>
                  <input type="checkbox" checked={selected.includes(c.id)} onChange={() => toggleSelect(c.id)} style={{ width: 13, height: 13, accentColor: C.accent }} />
                </td>
                <td style={styles.td}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: avatarColor[c.gradeDetail], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{c.avatar}</div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 500, color: C.text }}>{c.name}</div>
                      <div style={{ fontSize: 10, color: C.textHint }}>{c.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ ...styles.td, fontSize: 11 }}>{c.phone}</td>
                <td style={{ ...styles.td, textAlign: "center" }}>
                  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, fontWeight: 600, background: gradeDetailColor[c.gradeDetail]?.bg, color: gradeDetailColor[c.gradeDetail]?.text }}>
                    {c.gradeDetail === "플래티넘" ? "💎" : c.gradeDetail === "골드" ? "⭐" : c.gradeDetail === "실버" ? "🥈" : c.gradeDetail === "신규" ? "🆕" : ""} {c.gradeDetail}
                  </span>
                </td>
                <td style={{ ...styles.td, textAlign: "right", fontWeight: 600, color: C.text }}>{c.orders}회</td>
                <td style={{ ...styles.td, textAlign: "right", fontWeight: 600, color: C.text }}>₩{c.total.toLocaleString()}</td>
                <td style={{ ...styles.td, textAlign: "right", color: C.textSub }}>{c.point.toLocaleString()}P</td>
                <td style={{ ...styles.td, fontSize: 11, color: C.textHint }}>{c.lastOrder}</td>
                <td style={{ ...styles.td, fontSize: 10, color: C.textHint }}>{c.joined}</td>
                <td style={{ ...styles.td, textAlign: "center" }}><span style={styles.badge(statusColor[c.status])}>{c.status}</span></td>
                <td style={{ ...styles.td, textAlign: "right" }}>
                  <div style={{ display: "flex", gap: 3, justifyContent: "flex-end" }}>
                    <button style={styles.smBtn} onClick={() => setDetailOpen(c)}>상세</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={styles.pagination}>
          <span style={{ fontSize: 11, color: C.textHint }}>총 {filtered.length}명</span>
          <div style={{ display: "flex", gap: 4 }}>
            {["‹", "1", "2", "›"].map((p, i) => <div key={i} style={styles.pageBtn(p === "1")}>{p}</div>)}
          </div>
        </div>
      </div>

      {/* 고객 상세 모달 */}
      {detailOpen && (
        <div onClick={() => setDetailOpen(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.surface, borderRadius: 14, width: 480, maxHeight: "80vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
            {/* 모달 헤더 */}
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
              <div style={{ width: 42, height: 42, borderRadius: "50%", background: avatarColor[detailOpen.gradeDetail], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#fff" }}>{detailOpen.avatar}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{detailOpen.name}</div>
                <div style={{ fontSize: 11, color: C.textHint }}>{detailOpen.email}</div>
              </div>
              <span style={{ fontSize: 10, padding: "3px 10px", borderRadius: 10, fontWeight: 600, background: gradeDetailColor[detailOpen.gradeDetail]?.bg, color: gradeDetailColor[detailOpen.gradeDetail]?.text }}>{detailOpen.gradeDetail}</span>
              <div onClick={() => setDetailOpen(null)} style={{ width: 26, height: 26, borderRadius: 7, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 12, color: C.textHint }}>✕</div>
            </div>

            {/* 모달 본문 */}
            <div style={{ padding: "16px 20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
              {/* 통계 */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                {[["총 주문", `${detailOpen.orders}회`], ["총 구매액", `₩${detailOpen.total.toLocaleString()}`], ["보유 포인트", `${detailOpen.point.toLocaleString()}P`]].map(([k, v]) => (
                  <div key={k} style={{ background: C.bg, borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
                    <div style={{ fontSize: 10, color: C.textHint, marginBottom: 4 }}>{k}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{v}</div>
                  </div>
                ))}
              </div>

              {/* 기본 정보 */}
              <div>
                <div style={{ fontSize: 10, fontWeight: 600, color: C.textHint, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 8 }}>기본 정보</div>
                {[["전화번호", detailOpen.phone], ["가입일", detailOpen.joined], ["최근 주문", detailOpen.lastOrder], ["관심 카테고리", detailOpen.cats.join(", ")], ["계정 상태", detailOpen.status]].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "6px 0", borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ color: C.textSub }}>{k}</span>
                    <span style={{ fontWeight: 500, color: C.text }}>{v}</span>
                  </div>
                ))}
              </div>

              {/* 액션 버튼 */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                <button style={{ ...styles.btn(), justifyContent: "center", fontSize: 11 }}>📧 이메일</button>
                <button style={{ ...styles.btn(), justifyContent: "center", fontSize: 11 }}>🎫 쿠폰 지급</button>
                <button style={{ ...styles.btn("danger"), justifyContent: "center", fontSize: 11 }}>🚫 계정 정지</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
