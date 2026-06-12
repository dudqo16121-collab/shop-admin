"use client";

import { C } from "../theme";
import { ModalOverlay, ModalHeader, ModalBody, ModalFooter, SectionLabel } from "../ui/Modal";

// 5. 언어 / 지역
export default function LocaleModal({ onClose }) {
  return (
    <ModalOverlay onClose={onClose}>
      <ModalHeader title="언어 / 지역" subtitle="언어 및 지역 설정을 변경합니다" onClose={onClose} />
      <ModalBody>
        <SectionLabel>언어</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {[["🇰🇷", "한국어", true], ["🇺🇸", "English", false], ["🇯🇵", "日本語", false], ["🇨🇳", "中文", false]].map(([flag, label, active]) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, border: `1.5px solid ${active ? C.accent : C.border}`, cursor: "pointer", background: active ? C.bg : C.surface }}>
              <span style={{ fontSize: 18 }}>{flag}</span>
              <span style={{ fontSize: 12, fontWeight: active ? 700 : 400, flex: 1 }}>{label}</span>
              {active && <span style={{ fontSize: 11, color: C.green, fontWeight: 600 }}>✓ 사용 중</span>}
            </div>
          ))}
        </div>
        <SectionLabel>지역 및 형식</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 500, color: C.textSub, marginBottom: 4 }}>시간대</div>
            <select style={{ width: "100%", height: 36, borderRadius: 8, border: `1px solid ${C.border}`, padding: "0 10px", fontSize: 12, color: C.text, background: C.surface }}>
              <option>Asia/Seoul (UTC+9)</option>
              <option>America/New_York (UTC-5)</option>
              <option>Europe/London (UTC+0)</option>
            </select>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 500, color: C.textSub, marginBottom: 4 }}>날짜 형식</div>
            <select style={{ width: "100%", height: 36, borderRadius: 8, border: `1px solid ${C.border}`, padding: "0 10px", fontSize: 12, color: C.text, background: C.surface }}>
              <option>YYYY.MM.DD (2025.06.11)</option>
              <option>MM/DD/YYYY (06/11/2025)</option>
              <option>DD-MM-YYYY (11-06-2025)</option>
            </select>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 500, color: C.textSub, marginBottom: 4 }}>통화</div>
            <select style={{ width: "100%", height: 36, borderRadius: 8, border: `1px solid ${C.border}`, padding: "0 10px", fontSize: 12, color: C.text, background: C.surface }}>
              <option>₩ 원 (KRW)</option>
              <option>$ 달러 (USD)</option>
              <option>¥ 엔 (JPY)</option>
            </select>
          </div>
        </div>
      </ModalBody>
      <ModalFooter onClose={onClose} />
    </ModalOverlay>
  );
}
