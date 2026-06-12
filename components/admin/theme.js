// ── 공통 디자인 토큰 ───────────────────────────────────────
// EcommerceAdmin / AuthPages 등 모든 화면이 이 토큰을 공유합니다.
export const C = {
  bg: "#F8F7F5",
  surface: "#FFFFFF",
  border: "#E5E3DF",
  borderMid: "#D0CEC9",
  text: "#1A1917",
  textSub: "#6B6963",
  textHint: "#A09D97",
  accent: "#1A1917",
  blue: "#2563EB",
  blueBg: "#EFF6FF",
  blueText: "#1D4ED8",
  green: "#16A34A",
  greenBg: "#F0FDF4",
  greenText: "#15803D",
  amber: "#D97706",
  amberBg: "#FFFBEB",
  amberText: "#B45309",
  red: "#DC2626",
  redBg: "#FEF2F2",
  redText: "#B91C1C",
  purple: "#7C3AED",
  purpleBg: "#F5F3FF",
  purpleText: "#6D28D9",
};

export const styles = {
  app: { display: "flex", height: "100vh", background: C.bg, fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13, color: C.text, overflow: "hidden" },
  sidebar: { width: 200, background: C.surface, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", flexShrink: 0 },
  sidebarTop: { padding: "16px 12px 8px", borderBottom: `1px solid ${C.border}` },
  logo: { display: "flex", alignItems: "center", gap: 8, marginBottom: 4 },
  logoBox: { width: 28, height: 28, borderRadius: 7, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13 },
  logoText: { fontWeight: 700, fontSize: 14, letterSpacing: "-0.3px" },
  logoSub: { fontSize: 10, color: C.textHint, paddingLeft: 36 },
  nav: { flex: 1, padding: "8px 8px", overflowY: "auto" },
  navSection: { marginBottom: 16 },
  navLabel: { fontSize: 10, color: C.textHint, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", padding: "4px 8px", marginBottom: 2 },
  navItem: (active) => ({ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 7, fontSize: 12, color: active ? C.text : C.textSub, background: active ? C.bg : "transparent", fontWeight: active ? 600 : 400, cursor: "pointer", marginBottom: 1, transition: "background 0.1s" }),
  navBadge: (color) => ({ marginLeft: "auto", fontSize: 10, background: color === "red" ? C.redBg : C.blueBg, color: color === "red" ? C.redText : C.blueText, padding: "1px 6px", borderRadius: 10, fontWeight: 600 }),
  sidebarFooter: { padding: "10px 12px", borderTop: `1px solid ${C.border}` },
  avatarRow: { display: "flex", alignItems: "center", gap: 8 },
  avatar: { width: 28, height: 28, borderRadius: "50%", background: C.bg, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: C.textSub, flexShrink: 0 },
  main: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 },
  topbar: { display: "flex", alignItems: "center", gap: 10, padding: "10px 20px", background: C.surface, borderBottom: `1px solid ${C.border}`, flexShrink: 0 },
  pageTitle: { fontSize: 15, fontWeight: 700, flex: 1, letterSpacing: "-0.3px" },
  searchBox: { display: "flex", alignItems: "center", gap: 6, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "5px 10px", fontSize: 11, color: C.textHint, width: 180 },
  iconBtn: { width: 30, height: 30, borderRadius: 8, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: C.textSub, fontSize: 14, background: C.surface, cursor: "pointer", position: "relative" },
  notifDot: { position: "absolute", top: 5, right: 5, width: 5, height: 5, borderRadius: "50%", background: C.red },
  content: { flex: 1, overflowY: "auto", padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 },
  // cards
  card: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "13px 15px" },
  cardTitle: { fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between" },
  cardAction: { fontSize: 11, color: C.textHint, cursor: "pointer", fontWeight: 400, display: "flex", alignItems: "center", gap: 3 },
  // kpi
  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 10 },
  kpiCard: (accent) => ({ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "11px 13px", borderLeft: `3px solid ${accent}` }),
  kpiLabel: { fontSize: 10, color: C.textSub, marginBottom: 5, fontWeight: 500 },
  kpiValue: { fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 2, letterSpacing: "-0.5px" },
  kpiDelta: (up) => ({ fontSize: 10, color: up ? C.green : C.red, display: "flex", alignItems: "center", gap: 2 }),
  kpiSub: { fontSize: 10, color: C.textHint, marginTop: 2 },
  // badges
  badge: (color) => {
    const map = { green: [C.greenBg, C.greenText], blue: [C.blueBg, C.blueText], amber: [C.amberBg, C.amberText], red: [C.redBg, C.redText], gray: [C.bg, C.textHint], purple: [C.purpleBg, C.purpleText] };
    const [bg, text] = map[color] || map.gray;
    return { fontSize: 9, padding: "2px 7px", borderRadius: 10, background: bg, color: text, fontWeight: 600, whiteSpace: "nowrap", display: "inline-block" };
  },
  // table
  tableWrap: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { fontSize: 10, color: C.textHint, fontWeight: 600, textAlign: "left", padding: "8px 12px", borderBottom: `1px solid ${C.border}`, background: C.bg, letterSpacing: "0.04em", textTransform: "uppercase" },
  td: { fontSize: 11, color: C.textSub, padding: "9px 12px", borderBottom: `1px solid ${C.border}`, verticalAlign: "middle" },
  // filter bar
  filterBar: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  filterChip: (active) => ({ fontSize: 11, padding: "4px 10px", borderRadius: 20, border: `1px solid ${active ? C.borderMid : C.border}`, background: active ? C.bg : C.surface, color: active ? C.text : C.textSub, cursor: "pointer", fontWeight: active ? 600 : 400 }),
  select: { fontSize: 11, padding: "5px 10px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, color: C.textSub },
  input: { height: 32, borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, padding: "0 10px", fontSize: 11, color: C.text, width: "100%", outline: "none" },
  btn: (variant) => {
    if (variant === "primary") return { display: "flex", alignItems: "center", gap: 5, fontSize: 11, padding: "6px 13px", borderRadius: 8, background: C.accent, border: "none", color: "#fff", fontWeight: 600, cursor: "pointer" };
    if (variant === "danger") return { display: "flex", alignItems: "center", gap: 5, fontSize: 11, padding: "5px 12px", borderRadius: 8, background: C.surface, border: `1px solid ${C.border}`, color: C.red, cursor: "pointer" };
    return { display: "flex", alignItems: "center", gap: 5, fontSize: 11, padding: "5px 12px", borderRadius: 8, background: C.surface, border: `1px solid ${C.border}`, color: C.textSub, cursor: "pointer" };
  },
  smBtn: { fontSize: 10, padding: "3px 8px", borderRadius: 7, border: `1px solid ${C.border}`, background: C.surface, color: C.textSub, cursor: "pointer" },
  // pagination
  pagination: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 15px", background: C.surface, borderTop: `1px solid ${C.border}` },
  pageBtn: (active) => ({ width: 28, height: 28, borderRadius: 7, border: `1px solid ${active ? C.borderMid : C.border}`, background: active ? C.bg : C.surface, fontSize: 11, color: active ? C.text : C.textSub, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontWeight: active ? 700 : 400 }),
};
