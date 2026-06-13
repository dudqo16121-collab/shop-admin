"use client";

// ── 최근 본 상품: 상세 진입 시 기록, 스트립으로 노출 ─────────
import { useEffect, useState } from "react";
import { C, S } from "./theme";
import Reveal from "./Reveal";
import ProductCard from "./ProductCard";
import { byId } from "../../lib/store-data";

const KEY = "shop:recent";

export function recordView(id) {
  try {
    const raw = localStorage.getItem(KEY);
    let list = raw ? JSON.parse(raw) : [];
    list = [id, ...list.filter(x => x !== id)].slice(0, 8);
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {}
}

export default function RecentlyViewed({ excludeId }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      const list = raw ? JSON.parse(raw) : [];
      setItems(
        list
          .filter(id => id !== excludeId)
          .map(byId)
          .filter(p => p && !p.hidden)
          .slice(0, 4)
      );
    } catch {}
  }, [excludeId]);

  if (items.length === 0) return null;

  return (
    <section style={{ marginTop: 88 }}>
      <Reveal>
        <div style={S.eyebrow}>Recently Viewed</div>
        <h2 style={{ ...S.h2, margin: "6px 0 24px" }}>최근 본 상품</h2>
      </Reveal>
      <div className="sh-grid-4">
        {items.map((p, i) => (
          <Reveal key={p.id} delay={i * 70}>
            <ProductCard p={p} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}