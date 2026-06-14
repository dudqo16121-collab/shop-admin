// ── 웹 개발 제품몰 테마: 딥 다크 팔레트 ─────────────────────
export { C } from "../admin/theme";

export const T = {
  bg:        "#0A0A0F",
  bgCard:    "#111118",
  bgRaised:  "#16161F",
  bgSubtle:  "#1C1C28",

  text:      "#F8FAFC",
  textSub:   "#94A3B8",
  textHint:  "#475569",

  border:    "#1E1E2E",
  borderMid: "#2D2D42",

  violet:    "#6366F1",
  violetBg:  "rgba(99,102,241,0.1)",
  violetGlow:"rgba(99,102,241,0.35)",

  green:     "#10B981",
  greenBg:   "rgba(16,185,129,0.1)",
  greenGlow: "rgba(16,185,129,0.3)",

  amber:     "#F59E0B",
  amberBg:   "rgba(245,158,11,0.1)",

  red:       "#EF4444",
  redBg:     "rgba(239,68,68,0.1)",

  gradHero:   "linear-gradient(135deg, #0A0A0F 0%, #0F0F1A 50%, #0A0F1A 100%)",
  gradViolet: "linear-gradient(135deg, #6366F1, #8B5CF6)",
  gradGreen:  "linear-gradient(135deg, #10B981, #059669)",
};

export const S = {
  maxW: 1200,
  font: "'Inter','Pretendard',-apple-system,BlinkMacSystemFont,system-ui,sans-serif",
  mono: "'JetBrains Mono','Fira Code','Cascadia Code',Consolas,monospace",
  wrap: { maxWidth: 1200, margin: "0 auto", padding: "0 24px" },

  display: {
    fontSize: "clamp(36px,6vw,72px)", fontWeight: 800,
    letterSpacing: "-0.04em", lineHeight: 1.06, color: "#F8FAFC",
  },
  h2: {
    fontSize: "clamp(20px,3vw,30px)", fontWeight: 800,
    letterSpacing: "-0.025em", color: "#F8FAFC",
  },
  eyebrow: {
    fontSize: 11, fontWeight: 700, letterSpacing: "0.16em",
    textTransform: "uppercase", color: "#6366F1",
    fontFamily: "'JetBrains Mono','Fira Code',Consolas,monospace",
  },

  btnPrimary: {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
    height: 46, padding: "0 24px", borderRadius: 10,
    background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
    color: "#fff", border: "none",
    fontSize: 14, fontWeight: 700, cursor: "pointer", letterSpacing: "-0.01em",
  },
  btnGhost: {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
    height: 46, padding: "0 24px", borderRadius: 10,
    background: "transparent", color: "#F8FAFC", border: "1px solid #2D2D42",
    fontSize: 14, fontWeight: 600, cursor: "pointer",
  },
  btnGreen: {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
    height: 46, padding: "0 24px", borderRadius: 10,
    background: "linear-gradient(135deg, #10B981, #059669)",
    color: "#fff", border: "none",
    fontSize: 14, fontWeight: 700, cursor: "pointer",
  },

  tile: (tint) => ({
    position: "relative", aspectRatio: "4/5", borderRadius: 16,
    background: tint, border: "1px solid #1E1E2E",
    display: "flex", alignItems: "center", justifyContent: "center",
    overflow: "hidden",
  }),

  badge:        { fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", padding: "3px 9px", borderRadius: 6, background: "rgba(99,102,241,0.15)", color: "#6366F1", border: "1px solid rgba(99,102,241,0.3)", fontFamily: "monospace" },
  badgeGreen:   { fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", padding: "3px 9px", borderRadius: 6, background: "rgba(16,185,129,0.12)", color: "#10B981", border: "1px solid rgba(16,185,129,0.3)", fontFamily: "monospace" },
  badgeSoldout: { fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", padding: "3px 9px", borderRadius: 6, background: "rgba(255,255,255,0.06)", color: "#475569", fontFamily: "monospace" },
  badgeAmber:   { fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", padding: "3px 9px", borderRadius: 6, background: "rgba(245,158,11,0.12)", color: "#F59E0B", border: "1px solid rgba(245,158,11,0.3)", fontFamily: "monospace" },
  badgeRed:     { fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", padding: "3px 9px", borderRadius: 6, background: "rgba(239,68,68,0.12)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.3)", fontFamily: "monospace" },

  card: {
    background: "#111118", border: "1px solid #1E1E2E",
    borderRadius: 16, padding: "20px 22px",
  },
};

export const CAT_TINT_V2 = {
  "UI Kit":   "#0D0D1A",
  "템플릿":   "#0A1020",
  "플러그인": "#0A1A0E",
  "아이콘":   "#15100A",
  "폰트":     "#12101A",
};
