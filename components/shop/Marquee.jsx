"use client";

// ── 잉크색 마퀴 스트립 (호버 시 일시정지) ────────────────────
import { C } from "./theme";

export default function Marquee({ items }) {
  // 끊김 없는 루프를 위해 두 번 이어 붙임 (track이 -50% 이동)
  const row = [...items, ...items];
  return (
    <div className="sh-marquee" style={{ background: C.accent, padding: "13px 0" }} aria-hidden="true">
      <div className="sh-marquee-track">
        {row.map((text, i) => (
          <span
            key={i}
            style={{
              display: "inline-flex", alignItems: "center", gap: 28, paddingRight: 28,
              fontSize: 12, fontWeight: 600, letterSpacing: "0.1em",
              color: "#F8F7F5", whiteSpace: "nowrap",
            }}
          >
            {text}
            <span style={{ opacity: 0.45, fontSize: 10 }}>✺</span>
          </span>
        ))}
      </div>
    </div>
  );
}
