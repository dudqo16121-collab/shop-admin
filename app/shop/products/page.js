"use client";

// ── 전체 상품: 카테고리 칩 필터 + 정렬 ───────────────────────
import { useEffect, useMemo, useState } from "react";
import { C, S } from "../../../components/shop/theme";
import Reveal from "../../../components/shop/Reveal";
import ProductCard from "../../../components/shop/ProductCard";
import { CATEGORIES, VISIBLE } from "../../../lib/store-data";

const SORTS = ["인기순", "최신순", "낮은 가격순", "높은 가격순", "평점순"];

export default function ProductsPage() {
  const [cat, setCat] = useState("전체");
  const [sort, setSort] = useState("인기순");
  const [hideSoldout, setHideSoldout] = useState(false);

  // 딥링크 지원: /shop/products/?cat=의류
  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search).get("cat");
      if (q && CATEGORIES.includes(q)) setCat(q);
    } catch {}
  }, []);

  const filtered = useMemo(() => {
    let list = VISIBLE.filter(p => (cat === "전체" || p.cat === cat) && (!hideSoldout || p.stock > 0));
    if (sort === "인기순") list = [...list].sort((a, b) => b.sales - a.sales);
    if (sort === "최신순") list = [...list].sort((a, b) => new Date(b.created) - new Date(a.created));
    if (sort === "낮은 가격순") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "높은 가격순") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "평점순") list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [cat, sort, hideSoldout]);

  return (
    <div style={{ ...S.wrap, paddingTop: 48, paddingBottom: 40 }}>
      {/* 타이틀 */}
      <div className="sh-fadeup" style={{ marginBottom: 30 }}>
        <div style={S.eyebrow}>All Products</div>
        <h1 style={{ fontSize: "clamp(30px, 5vw, 48px)", fontWeight: 800, letterSpacing: "-0.035em", margin: "8px 0 6px" }}>
          전체 상품
        </h1>
        <div style={{ fontSize: 13, color: C.textHint }}>{filtered.length}개의 상품</div>
      </div>

      {/* 필터 바 */}
      <div className="sh-fadeup" style={{ animationDelay: "100ms", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 28, paddingBottom: 20, borderBottom: `1px solid ${C.border}` }}>
        {["전체", ...CATEGORIES].map(c => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className="sh-chip"
            style={{
              height: 38, padding: "0 16px", borderRadius: 20,
              border: `1.5px solid ${cat === c ? C.accent : C.border}`,
              background: cat === c ? C.accent : C.surface,
              color: cat === c ? "#fff" : C.textSub,
              fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}
          >
            {c}
          </button>
        ))}

        <span style={{ flex: 1 }} />

        <label style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12.5, color: C.textSub, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={hideSoldout}
            onChange={e => setHideSoldout(e.target.checked)}
            style={{ width: 15, height: 15, accentColor: C.accent }}
          />
          품절 제외
        </label>

        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          style={{ height: 38, padding: "0 12px", borderRadius: 11, border: `1.5px solid ${C.border}`, background: C.surface, fontSize: 13, fontWeight: 600, color: C.textSub, cursor: "pointer" }}
        >
          {SORTS.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* 그리드 */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "90px 0", color: C.textHint }}>
          <div style={{ fontSize: 38, marginBottom: 12 }}>👀</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: C.textSub }}>조건에 맞는 상품이 없어요</div>
          <button
            onClick={() => { setCat("전체"); setHideSoldout(false); }}
            style={{ marginTop: 14, fontSize: 13, fontWeight: 700, color: C.blue, border: "none", background: "none", cursor: "pointer" }}
          >
            필터 초기화
          </button>
        </div>
      ) : (
        <div className="sh-grid-4" key={`${cat}-${sort}-${hideSoldout}`}>
          {filtered.map((p, i) => (
            <Reveal key={p.id} delay={(i % 4) * 70}>
              <ProductCard p={p} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
