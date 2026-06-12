"use client";

import { C } from "../theme";
import { ModalOverlay, ModalHeader, ModalBody, ModalFooter, SectionLabel, SettingRow, Toggle } from "../ui/Modal";

// 4. 보안 설정
export default function SecurityModal({ onClose }) {
  return (
    <ModalOverlay onClose={onClose}>
      <ModalHeader title="보안 설정" subtitle="계정 보안을 강화하세요" onClose={onClose} />
      <ModalBody>
        <SectionLabel>2단계 인증</SectionLabel>
        <SettingRow label="2단계 인증 (2FA)" desc="로그인 시 추가 인증 코드 요구"><Toggle on={false} /></SettingRow>
        <SettingRow label="이메일 인증" desc="새 기기 로그인 시 이메일 확인"><Toggle on={true} /></SettingRow>
        <SectionLabel>세션 관리</SectionLabel>
        <SettingRow label="자동 로그아웃" desc="30분 미사용 시 자동 로그아웃"><Toggle on={true} /></SettingRow>
        <SettingRow label="다중 기기 로그인" desc="여러 기기 동시 로그인 허용"><Toggle on={false} /></SettingRow>
        <SectionLabel>활동 로그</SectionLabel>
        <div style={{ background: C.bg, borderRadius: 8, overflow: "hidden", border: `1px solid ${C.border}` }}>
          {[
            { action: "로그인", device: "Windows PC", time: "방금", ok: true },
            { action: "비밀번호 변경", device: "Windows PC", time: "3일 전", ok: true },
            { action: "로그인 실패", device: "알 수 없음", time: "5일 전", ok: false },
          ].map((log, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderBottom: i < 2 ? `1px solid ${C.border}` : "none" }}>
              <span style={{ fontSize: 14 }}>{log.ok ? "✅" : "❌"}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 500 }}>{log.action}</div>
                <div style={{ fontSize: 10, color: C.textHint }}>{log.device}</div>
              </div>
              <div style={{ fontSize: 10, color: C.textHint }}>{log.time}</div>
            </div>
          ))}
        </div>
        <SectionLabel>위험 구역</SectionLabel>
        <div style={{ background: C.redBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.red }}>모든 세션 종료</div>
            <div style={{ fontSize: 11, color: C.textHint, marginTop: 2 }}>다른 기기의 로그인을 모두 해제합니다</div>
          </div>
          <button style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${C.red}`, background: C.surface, fontSize: 11, color: C.red, fontWeight: 600, cursor: "pointer" }}>종료</button>
        </div>
      </ModalBody>
      <ModalFooter onClose={onClose} />
    </ModalOverlay>
  );
}
