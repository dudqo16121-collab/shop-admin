"use client";

import { useState } from "react";
import { C, styles } from "../theme";
import { downloadCSV } from "../csv";

// ── 관리자 권한 관리 페이지 ──────────────────────────────────
export default function Permissions() {
  const [tab, setTab] = useState("관리자 계정");
  const [selectedRole, setSelectedRole] = useState("superadmin");
  const [inviteOpen, setInviteOpen] = useState(false);

  const admins = [
    { id: 1, name: "김슈퍼", email: "super@shopadmin.com", role: "superadmin", roleLabel: "슈퍼 어드민", lastLogin: "방금", status: "활성", avatar: "김" },
    { id: 2, name: "이운영", email: "ops@shopadmin.com", role: "manager", roleLabel: "운영 매니저", lastLogin: "1시간 전", status: "활성", avatar: "이" },
    { id: 3, name: "박마케팅", email: "mkt@shopadmin.com", role: "marketer", roleLabel: "마케터", lastLogin: "3시간 전", status: "활성", avatar: "박" },
    { id: 4, name: "최CS", email: "cs@shopadmin.com", role: "cs", roleLabel: "CS 담당자", lastLogin: "어제", status: "활성", avatar: "최" },
    { id: 5, name: "정물류", email: "logistics@shopadmin.com", role: "logistics", roleLabel: "물류 담당자", lastLogin: "2일 전", status: "활성", avatar: "정" },
    { id: 6, name: "한임시", email: "temp@shopadmin.com", role: "viewer", roleLabel: "뷰어", lastLogin: "1주 전", status: "비활성", avatar: "한" },
  ];

  const roles = [
    { id: "superadmin", label: "슈퍼 어드민", desc: "모든 기능에 대한 전체 접근 권한", color: C.purple, count: 1 },
    { id: "manager", label: "운영 매니저", desc: "대시보드, 주문, 상품, 고객 관리", color: C.blue, count: 1 },
    { id: "marketer", label: "마케터", desc: "프로모션, 쿠폰, 리뷰 관리", color: C.green, count: 1 },
    { id: "cs", label: "CS 담당자", desc: "고객문의, 주문 조회 권한", color: C.amber, count: 1 },
    { id: "logistics", label: "물류 담당자", desc: "배송, 재고 관리 권한", color: C.accent, count: 1 },
    { id: "viewer", label: "뷰어", desc: "대시보드, 통계 조회만 가능", color: C.textHint, count: 1 },
  ];

  const menus = [
    { id: "dashboard", label: "대시보드" },
    { id: "analytics", label: "매출 분석" },
    { id: "orders", label: "주문 관리" },
    { id: "shipping", label: "배송 현황" },
    { id: "products", label: "상품 등록" },
    { id: "inventory", label: "재고 관리" },
    { id: "customers", label: "고객 프로필" },
    { id: "promotions", label: "프로모션·쿠폰" },
    { id: "reviews", label: "리뷰·평점" },
    { id: "cs", label: "CS 고객문의" },
    { id: "settlement", label: "정산 관리" },
    { id: "checkout", label: "결제 페이지" },
    { id: "permissions", label: "권한 관리" },
  ];

  const permissions = {
    superadmin: { view: menus.map(m => m.id), edit: menus.map(m => m.id), delete: menus.map(m => m.id) },
    manager: { view: ["dashboard", "analytics", "orders", "shipping", "products", "inventory", "customers", "reviews", "cs"], edit: ["orders", "shipping", "products", "inventory", "customers"], delete: ["orders"] },
    marketer: { view: ["dashboard", "analytics", "promotions", "reviews", "cs"], edit: ["promotions", "reviews"], delete: [] },
    cs: { view: ["dashboard", "orders", "customers", "cs"], edit: ["cs", "orders"], delete: [] },
    logistics: { view: ["dashboard", "orders", "shipping", "inventory"], edit: ["shipping", "inventory"], delete: [] },
    viewer: { view: ["dashboard", "analytics"], edit: [], delete: [] },
  };

  const roleColors = { superadmin: C.purple, manager: C.blue, marketer: C.green, cs: C.amber, logistics: C.accent, viewer: C.textHint };
  const roleLabels = { superadmin: "슈퍼 어드민", manager: "운영 매니저", marketer: "마케터", cs: "CS 담당자", logistics: "물류 담당자", viewer: "뷰어" };
  const perm = permissions[selectedRole];

  const hasView = (id) => perm.view.includes(id);
  const hasEdit = (id) => perm.edit.includes(id);
  const hasDel = (id) => perm.delete.includes(id);

  return (
    <>
      {/* KPI */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 10 }}>
        {[
          { label: "전체 관리자", value: `${admins.length}명`, sub: "등록된 계정", accent: C.blue },
          { label: "활성 계정", value: `${admins.filter(a => a.status === "활성").length}명`, sub: "현재 활성", accent: C.green },
          { label: "역할 종류", value: `${roles.length}개`, sub: "설정된 역할", accent: C.purple },
          { label: "비활성 계정", value: `${admins.filter(a => a.status === "비활성").length}명`, sub: "접근 제한됨", accent: C.textHint },
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
        {["관리자 계정", "역할별 권한", "접근 로그"].map(t => (
          <div key={t} onClick={() => setTab(t)} style={{ fontSize: 12, padding: "8px 16px", cursor: "pointer", color: tab === t ? C.text : C.textHint, fontWeight: tab === t ? 700 : 400, borderBottom: tab === t ? `2px solid ${C.accent}` : "2px solid transparent", marginBottom: -1 }}>{t}</div>
        ))}
      </div>

      {/* 관리자 계정 탭 */}
      {tab === "관리자 계정" && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ ...styles.searchBox, flex: 1 }}>🔍 이름·이메일 검색...</div>
            <select style={styles.select}><option>역할 전체</option>{roles.map(r => <option key={r.id}>{r.label}</option>)}</select>
            <button style={styles.btn("primary")} onClick={() => setInviteOpen(true)}>+ 관리자 초대</button>
          </div>

          {/* 초대 모달 */}
          {inviteOpen && (
            <div onClick={() => setInviteOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
              <div onClick={e => e.stopPropagation()} style={{ background: C.surface, borderRadius: 14, width: 400, padding: 24, boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>관리자 초대</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 500, color: C.textSub, marginBottom: 4 }}>이메일 *</div>
                    <input style={{ ...styles.input, height: 36 }} placeholder="초대할 이메일 주소" />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 500, color: C.textSub, marginBottom: 4 }}>역할 *</div>
                    <select style={{ ...styles.input, height: 36 }}>
                      {roles.map(r => <option key={r.id}>{r.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 500, color: C.textSub, marginBottom: 4 }}>메모</div>
                    <input style={{ ...styles.input, height: 36 }} placeholder="초대 메모 (선택)" />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
                  <button onClick={() => setInviteOpen(false)} style={styles.btn()}>취소</button>
                  <button onClick={() => setInviteOpen(false)} style={styles.btn("primary")}>초대 메일 발송</button>
                </div>
              </div>
            </div>
          )}

          <div style={styles.tableWrap}>
            <table style={{ ...styles.table, tableLayout: "fixed" }}>
              <thead><tr>
                <th style={styles.th}>관리자</th>
                <th style={styles.th}>이메일</th>
                <th style={{ ...styles.th, width: 100 }}>역할</th>
                <th style={{ ...styles.th, width: 90 }}>마지막 접속</th>
                <th style={{ ...styles.th, width: 70, textAlign: "center" }}>상태</th>
                <th style={{ ...styles.th, width: 100, textAlign: "right" }}>관리</th>
              </tr></thead>
              <tbody>
                {admins.map(admin => (
                  <tr key={admin.id}>
                    <td style={styles.td}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: roleColors[admin.role], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{admin.avatar}</div>
                        <span style={{ fontWeight: 500, color: C.text }}>{admin.name}</span>
                      </div>
                    </td>
                    <td style={{ ...styles.td, fontSize: 11 }}>{admin.email}</td>
                    <td style={styles.td}>
                      <span style={{ ...styles.badge("gray"), background: `${roleColors[admin.role]}20`, color: roleColors[admin.role] }}>{admin.roleLabel}</span>
                    </td>
                    <td style={{ ...styles.td, fontSize: 10, color: C.textHint }}>{admin.lastLogin}</td>
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      <span style={styles.badge(admin.status === "활성" ? "green" : "gray")}>{admin.status}</span>
                    </td>
                    <td style={{ ...styles.td, textAlign: "right" }}>
                      <div style={{ display: "flex", gap: 3, justifyContent: "flex-end" }}>
                        <button style={styles.smBtn}>수정</button>
                        <button style={styles.smBtn}>역할 변경</button>
                        {admin.role !== "superadmin" && <button style={{ ...styles.smBtn, color: C.red }}>비활성</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* 역할별 권한 탭 */}
      {tab === "역할별 권한" && (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,2.5fr)", gap: 12 }}>
          {/* 역할 목록 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {roles.map(role => (
              <div
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                style={{ ...styles.card, cursor: "pointer", borderLeft: `3px solid ${selectedRole === role.id ? role.color : "transparent"}`, background: selectedRole === role.id ? C.bg : C.surface, padding: "11px 13px" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: role.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{role.label}</span>
                  <span style={{ marginLeft: "auto", fontSize: 10, color: C.textHint }}>{role.count}명</span>
                </div>
                <div style={{ fontSize: 11, color: C.textSub, paddingLeft: 16 }}>{role.desc}</div>
              </div>
            ))}
            <button style={{ ...styles.btn("primary"), justifyContent: "center" }}>+ 역할 추가</button>
          </div>

          {/* 권한 테이블 */}
          <div style={styles.card}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{roleLabels[selectedRole]} 권한 설정</div>
                <div style={{ fontSize: 11, color: C.textHint, marginTop: 2 }}>{roles.find(r => r.id === selectedRole)?.desc}</div>
              </div>
              {selectedRole !== "superadmin" && <button style={styles.btn("primary")}>권한 저장</button>}
            </div>
            <table style={{ ...styles.table, tableLayout: "fixed" }}>
              <thead><tr>
                <th style={styles.th}>메뉴</th>
                <th style={{ ...styles.th, width: 70, textAlign: "center" }}>조회</th>
                <th style={{ ...styles.th, width: 70, textAlign: "center" }}>편집</th>
                <th style={{ ...styles.th, width: 70, textAlign: "center" }}>삭제</th>
              </tr></thead>
              <tbody>
                {menus.map(menu => (
                  <tr key={menu.id}>
                    <td style={{ ...styles.td, fontWeight: 500, color: C.text }}>{menu.label}</td>
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      <div style={{ width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${hasView(menu.id) ? C.green : C.border}`, background: hasView(menu.id) ? C.greenBg : "transparent", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", cursor: selectedRole !== "superadmin" ? "pointer" : "default" }}>
                        {hasView(menu.id) && <span style={{ fontSize: 10, color: C.green, fontWeight: 700 }}>✓</span>}
                      </div>
                    </td>
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      <div style={{ width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${hasEdit(menu.id) ? C.blue : C.border}`, background: hasEdit(menu.id) ? C.blueBg : "transparent", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", cursor: selectedRole !== "superadmin" ? "pointer" : "default" }}>
                        {hasEdit(menu.id) && <span style={{ fontSize: 10, color: C.blue, fontWeight: 700 }}>✓</span>}
                      </div>
                    </td>
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      <div style={{ width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${hasDel(menu.id) ? C.red : C.border}`, background: hasDel(menu.id) ? C.redBg : "transparent", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", cursor: selectedRole !== "superadmin" ? "pointer" : "default" }}>
                        {hasDel(menu.id) && <span style={{ fontSize: 10, color: C.red, fontWeight: 700 }}>✓</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 접근 로그 탭 */}
      {tab === "접근 로그" && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ ...styles.searchBox, flex: 1 }}>🔍 관리자·액션 검색...</div>
            <select style={styles.select}><option>전체 관리자</option>{admins.map(a => <option key={a.id}>{a.name}</option>)}</select>
            <div style={{ ...styles.searchBox, width: 160, flex: "none" }}>📅 날짜 범위</div>
            <button style={styles.btn()} onClick={() => downloadCSV("접근로그",
              ["일시", "관리자", "역할", "액션", "대상", "IP", "결과"],
              [
                ["06/11 14:32", "김슈퍼", "슈퍼 어드민", "관리자 계정 비활성화", "한임시", "192.168.1.1", "성공"],
                ["06/11 13:15", "이운영", "운영 매니저", "주문 상태 변경", "#000284", "192.168.1.2", "성공"],
                ["06/11 12:40", "박마케팅", "마케터", "프로모션 생성", "여름 세일", "192.168.1.3", "성공"],
                ["06/11 11:20", "최CS", "CS 담당자", "고객문의 답변", "INQ-0282", "192.168.1.4", "성공"],
                ["06/11 10:05", "정물류", "물류 담당자", "재고 수정 시도", "결제 메뉴", "192.168.1.5", "거부"],
                ["06/11 09:30", "김슈퍼", "슈퍼 어드민", "역할 권한 수정", "마케터", "192.168.1.1", "성공"],
                ["06/10 18:22", "이운영", "운영 매니저", "상품 가격 수정", "SKU-001", "192.168.1.2", "성공"],
                ["06/10 16:45", "한임시", "뷰어", "정산 메뉴 접근 시도", "정산 관리", "192.168.1.6", "거부"],
              ]
            )}>↓ CSV 내보내기</button>
          </div>
          <div style={styles.tableWrap}>
            <table style={{ ...styles.table, tableLayout: "fixed" }}>
              <thead><tr>
                <th style={{ ...styles.th, width: 100 }}>일시</th>
                <th style={{ ...styles.th, width: 90 }}>관리자</th>
                <th style={{ ...styles.th, width: 80 }}>역할</th>
                <th style={styles.th}>액션</th>
                <th style={{ ...styles.th, width: 80 }}>대상</th>
                <th style={{ ...styles.th, width: 90 }}>IP 주소</th>
                <th style={{ ...styles.th, width: 60, textAlign: "center" }}>결과</th>
              </tr></thead>
              <tbody>
                {[
                  { time: "06/11 14:32", admin: "김슈퍼", role: "슈퍼 어드민", action: "관리자 계정 비활성화", target: "한임시", ip: "192.168.1.1", result: "성공" },
                  { time: "06/11 13:15", admin: "이운영", role: "운영 매니저", action: "주문 상태 변경", target: "#000284", ip: "192.168.1.2", result: "성공" },
                  { time: "06/11 12:40", admin: "박마케팅", role: "마케터", action: "프로모션 생성", target: "여름 세일", ip: "192.168.1.3", result: "성공" },
                  { time: "06/11 11:20", admin: "최CS", role: "CS 담당자", action: "고객문의 답변", target: "INQ-0282", ip: "192.168.1.4", result: "성공" },
                  { time: "06/11 10:05", admin: "정물류", role: "물류 담당자", action: "재고 수정 시도", target: "결제 메뉴", ip: "192.168.1.5", result: "거부" },
                  { time: "06/11 09:30", admin: "김슈퍼", role: "슈퍼 어드민", action: "역할 권한 수정", target: "마케터", ip: "192.168.1.1", result: "성공" },
                  { time: "06/10 18:22", admin: "이운영", role: "운영 매니저", action: "상품 가격 수정", target: "SKU-001", ip: "192.168.1.2", result: "성공" },
                  { time: "06/10 16:45", admin: "한임시", role: "뷰어", action: "정산 메뉴 접근 시도", target: "정산 관리", ip: "192.168.1.6", result: "거부" },
                ].map((log, i) => (
                  <tr key={i} style={{ background: log.result === "거부" ? C.redBg : C.surface }}>
                    <td style={{ ...styles.td, fontSize: 10, color: C.textHint }}>{log.time}</td>
                    <td style={{ ...styles.td, fontWeight: 500, color: C.text }}>{log.admin}</td>
                    <td style={styles.td}>
                      <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 10, fontWeight: 600, background: `${roleColors[admins.find(a => a.name === log.admin)?.role]}20`, color: roleColors[admins.find(a => a.name === log.admin)?.role] }}>{log.role}</span>
                    </td>
                    <td style={{ ...styles.td, fontSize: 11 }}>{log.action}</td>
                    <td style={{ ...styles.td, fontSize: 10, color: C.textHint }}>{log.target}</td>
                    <td style={{ ...styles.td, fontSize: 10, fontFamily: "monospace", color: C.textHint }}>{log.ip}</td>
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      <span style={styles.badge(log.result === "성공" ? "green" : "red")}>{log.result}</span>
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
