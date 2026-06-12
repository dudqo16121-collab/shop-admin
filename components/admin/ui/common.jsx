import { styles } from "../theme";

// ── 공통 컴포넌트 ────────────────────────────────────────────
export const StatusBadge = ({ status }) => {
  const map = { "결제완료": "green", "배송중": "blue", "입금대기": "amber", "취소": "red", "배송완료": "gray", "준비중": "amber", "지연": "red", "공개": "green", "숨김": "gray", "검토 필요": "amber", "진행 중": "green", "예정": "blue", "종료": "gray", "활성": "green", "사용가능": "green", "사용완료": "gray" };
  return <span style={styles.badge(map[status] || "gray")}>{status}</span>;
};

export const Th = ({ children, style }) => <th style={{ ...styles.th, ...style }}>{children}</th>;
export const Td = ({ children, style }) => <td style={{ ...styles.td, ...style }}>{children}</td>;
