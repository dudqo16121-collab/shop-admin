"use client";

import { C } from "../theme";
import { ModalOverlay, ModalHeader, ModalBody, ModalFooter, SectionLabel, ModalInput } from "../ui/Modal";

// 1. 내 프로필
export default function ProfileModal({ onClose }) {
  return (
    <ModalOverlay onClose={onClose}>
      <ModalHeader title="내 프로필" subtitle="관리자 계정 정보를 수정합니다" onClose={onClose} />
      <ModalBody>
        {/* 아바타 */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "8px 0" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: C.bg, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700, color: C.textSub }}>관</div>
          <button style={{ fontSize: 11, padding: "5px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, color: C.textSub, cursor: "pointer" }}>프로필 사진 변경</button>
        </div>
        <SectionLabel>기본 정보</SectionLabel>
        <ModalInput label="이름" defaultValue="관리자" />
        <ModalInput label="이메일" defaultValue="admin@shopadmin.com" type="email" />
        <ModalInput label="연락처" defaultValue="010-0000-0000" placeholder="010-0000-0000" />
        <ModalInput label="직책" defaultValue="Super Admin" />
        <SectionLabel>비밀번호 변경</SectionLabel>
        <ModalInput label="현재 비밀번호" type="password" placeholder="현재 비밀번호 입력" />
        <ModalInput label="새 비밀번호" type="password" placeholder="8자 이상" />
        <ModalInput label="새 비밀번호 확인" type="password" placeholder="비밀번호 재입력" />
      </ModalBody>
      <ModalFooter onClose={onClose} />
    </ModalOverlay>
  );
}
