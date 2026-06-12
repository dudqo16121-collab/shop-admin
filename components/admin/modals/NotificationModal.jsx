"use client";

import { ModalOverlay, ModalHeader, ModalBody, ModalFooter, SectionLabel, SettingRow, Toggle } from "../ui/Modal";

// 2. 알림 설정
export default function NotificationModal({ onClose }) {
  const items = [
    { section: "주문 알림", rows: [
      { label: "신규 주문 접수", desc: "새 주문이 들어올 때 알림", on: true },
      { label: "입금 확인 대기", desc: "무통장 입금 대기 주문 발생 시", on: true },
      { label: "주문 취소 요청", desc: "고객이 취소 요청 시", on: false },
    ]},
    { section: "배송 알림", rows: [
      { label: "배송 지연 감지", desc: "예상 배송일 초과 시", on: true },
      { label: "반품 요청", desc: "반품 요청 접수 시", on: true },
    ]},
    { section: "재고 알림", rows: [
      { label: "재고 부족 경고", desc: "재고 10개 이하 시", on: true },
      { label: "재고 소진", desc: "재고가 0이 될 때", on: true },
    ]},
    { section: "리뷰·마케팅", rows: [
      { label: "신고된 리뷰", desc: "리뷰 신고 접수 시", on: false },
      { label: "프로모션 종료 임박", desc: "종료 24시간 전", on: true },
    ]},
  ];
  return (
    <ModalOverlay onClose={onClose}>
      <ModalHeader title="알림 설정" subtitle="받을 알림 유형을 선택하세요" onClose={onClose} />
      <ModalBody>
        {items.map(({ section, rows }) => (
          <div key={section}>
            <SectionLabel>{section}</SectionLabel>
            <div style={{ marginTop: 8 }}>
              {rows.map(row => (
                <SettingRow key={row.label} label={row.label} desc={row.desc}>
                  <Toggle on={row.on} />
                </SettingRow>
              ))}
            </div>
          </div>
        ))}
      </ModalBody>
      <ModalFooter onClose={onClose} />
    </ModalOverlay>
  );
}
