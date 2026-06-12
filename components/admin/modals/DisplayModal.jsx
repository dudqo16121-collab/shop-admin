"use client";

import { C } from "../theme";
import { ModalOverlay, ModalHeader, ModalBody, ModalFooter, SectionLabel, SettingRow, Toggle } from "../ui/Modal";

// 3. 화면 설정
export default function DisplayModal({ onClose }) {
  return (
    <ModalOverlay onClose={onClose}>
      <ModalHeader title="화면 설정" subtitle="화면 표시 방식을 설정합니다" onClose={onClose} />
      <ModalBody>
        <SectionLabel>테마</SectionLabel>
        <div style={{ display: "flex", gap: 8 }}>
          {[["☀️", "라이트", true], ["🌙", "다크", false], ["💻", "시스템", false]].map(([icon, label, active]) => (
            <div key={label} style={{ flex: 1, padding: "10px 8px", borderRadius: 10, border: `1.5px solid ${active ? C.accent : C.border}`, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, cursor: "pointer", background: active ? C.bg : C.surface }}>
              <span style={{ fontSize: 20 }}>{icon}</span>
              <span style={{ fontSize: 11, fontWeight: active ? 700 : 400, color: active ? C.text : C.textSub }}>{label}</span>
            </div>
          ))}
        </div>
        <SectionLabel>폰트 크기</SectionLabel>
        <div style={{ display: "flex", gap: 6 }}>
          {["작게", "보통", "크게"].map((s, i) => (
            <div key={s} style={{ flex: 1, padding: "8px", borderRadius: 8, border: `1.5px solid ${i === 1 ? C.accent : C.border}`, textAlign: "center", fontSize: i === 0 ? 10 : i === 1 ? 12 : 14, cursor: "pointer", fontWeight: i === 1 ? 700 : 400, color: i === 1 ? C.text : C.textSub }}>{s}</div>
          ))}
        </div>
        <SectionLabel>레이아웃</SectionLabel>
        <SettingRow label="사이드바 축소 모드" desc="사이드바를 아이콘만 표시"><Toggle on={false} /></SettingRow>
        <SettingRow label="테이블 밀도" desc="행 간격을 좁게 표시"><Toggle on={false} /></SettingRow>
        <SettingRow label="애니메이션 효과" desc="화면 전환 시 애니메이션"><Toggle on={true} /></SettingRow>
        <SectionLabel>대시보드</SectionLabel>
        <SettingRow label="자동 새로고침" desc="30초마다 데이터 갱신"><Toggle on={true} /></SettingRow>
        <SettingRow label="차트 범례 표시" desc="차트 하단 범례 항상 표시"><Toggle on={true} /></SettingRow>
      </ModalBody>
      <ModalFooter onClose={onClose} />
    </ModalOverlay>
  );
}
