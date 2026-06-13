// ── 쇼핑몰 테마: 관리자 토큰 공유 + 소비자용 스케일 ──────────
import { C } from "../admin/theme";

export { C };

export const S = {
  maxW: 1200,
  font: "'Inter', 'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', system-ui, sans-serif",

  // 컨테이너
  wrap: { maxWidth: 1200, margin: "0 auto", padding: "0 24px" },

  // 타이포 스케일 (관리자보다 큰 소비자용)
  display: { fontSize: "clamp(44px, 8vw, 96px)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.04 },
  h2: { fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 800, letterSpacing: "-0.02em" },
  eyebrow: { fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.textHint },

  // 버튼
  btnPrimary: {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
    height: 48, padding: "0 26px", borderRadius: 12,
    background: C.accent, color: "#fff", border: "none",
    fontSize: 14, fontWeight: 700, cursor: "pointer",
  },
  btnGhost: {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
    height: 48, padding: "0 26px", borderRadius: 12,
    background: "transparent", color: C.text, border: `1.5px solid ${C.borderMid}`,
    fontSize: 14, fontWeight: 600, cursor: "pointer",
  },

  // 카드/타일
  tile: (tint) => ({
    position: "relative", aspectRatio: "4 / 5", borderRadius: 16,
    background: tint, border: `1px solid ${C.border}`,
    display: "flex", alignItems: "center", justifyContent: "center",
    overflow: "hidden",
  }),

  badge: {
    fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
    padding: "4px 9px", borderRadius: 20,
    background: C.accent, color: "#fff",
  },
  badgeSoldout: {
    fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
    padding: "4px 9px", borderRadius: 20,
    background: "rgba(26,25,23,0.55)", color: "#fff",
  },
};
