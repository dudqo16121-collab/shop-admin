import { C } from "../theme";

// ── 설정 모달 공통 컴포넌트 ─────────────────────────────────
export function ModalOverlay({ onClose, children }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 200, padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: C.surface, borderRadius: 14, width: "100%", maxWidth: 480,
          maxHeight: "85vh", overflow: "hidden", display: "flex", flexDirection: "column",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function ModalHeader({ title, subtitle, onClose }) {
  return (
    <div style={{ padding: "18px 20px 14px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 15, fontWeight: 700 }}>{title}</div>
        <div
          onClick={onClose}
          style={{ width: 28, height: 28, borderRadius: 8, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14, color: C.textHint }}
        >✕</div>
      </div>
      {subtitle && <div style={{ fontSize: 12, color: C.textHint, marginTop: 3 }}>{subtitle}</div>}
    </div>
  );
}

export function ModalBody({ children }) {
  return <div style={{ padding: "16px 20px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>{children}</div>;
}

export function ModalFooter({ onClose }) {
  return (
    <div style={{ padding: "12px 20px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 8, justifyContent: "flex-end", flexShrink: 0 }}>
      <button onClick={onClose} style={{ padding: "7px 16px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, fontSize: 12, color: C.textSub, cursor: "pointer" }}>취소</button>
      <button onClick={onClose} style={{ padding: "7px 16px", borderRadius: 8, border: "none", background: C.accent, fontSize: 12, color: "#fff", fontWeight: 600, cursor: "pointer" }}>저장</button>
    </div>
  );
}

export function SectionLabel({ children }) {
  return <div style={{ fontSize: 10, fontWeight: 600, color: C.textHint, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: -8 }}>{children}</div>;
}

export function SettingRow({ label, desc, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: C.text }}>{label}</div>
        {desc && <div style={{ fontSize: 11, color: C.textHint, marginTop: 2 }}>{desc}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}

export function Toggle({ on }) {
  return (
    <div style={{ width: 36, height: 20, borderRadius: 10, background: on ? C.green : C.border, position: "relative", cursor: "pointer", transition: "background 0.2s" }}>
      <div style={{ position: "absolute", top: 3, left: on ? 18 : 3, width: 14, height: 14, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
    </div>
  );
}

export function ModalInput({ label, defaultValue, type = "text", placeholder }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {label && <div style={{ fontSize: 11, fontWeight: 500, color: C.textSub }}>{label}</div>}
      <input
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        style={{ height: 36, borderRadius: 8, border: `1px solid ${C.border}`, padding: "0 10px", fontSize: 12, color: C.text, outline: "none", background: C.surface }}
      />
    </div>
  );
}
