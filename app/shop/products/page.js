"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { T, S } from "../../../components/shop/theme";
import Reveal from "../../../components/shop/Reveal";
import ProductCard from "../../../components/shop/ProductCard";
import { CATEGORIES, VISIBLE } from "../../../lib/store-data";
import ProductCardSkeleton from "../../../components/shop/ProductCardSkeleton";

const SORTS = ["인기순", "최신순", "낮은 가격순", "높은 가격순", "평점순"];

// ── 실제 페이지 내용 (useSearchParams 사용하므로 Suspense 필요) ──
function ProductsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cat, setCat] = useState("전체");
  const [sort, setSort] = useState("인기순");
  const [hideSoldout, setHideSoldout] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // URL 파라미터 → 필터 동기화 (카테고리 링크 클릭 시 즉시 반영)
  useEffect(() => {
    const q = searchParams.get("cat");
    if (q && CATEGORIES.includes(q)) setCat(q);
    else setCat("전체");
  }, [searchParams]);

  useEffect(() => {
  const q = searchParams.get("cat");
  if (q && CATEGORIES.includes(q)) setCat(q);
  else setCat("전체");

  // 필터 바뀔 때마다 짧은 로딩
  setIsLoading(true);
  const t = setTimeout(() => setIsLoading(false), 500);
  return () => clearTimeout(t);
}, [searchParams]);

  const filtered = useMemo(() => {
    let list = VISIBLE.filter(
      p => (cat === "전체" || p.cat === cat) && (!hideSoldout || p.stock > 0)
    );
    if (sort === "인기순")      list = [...list].sort((a, b) => b.sales - a.sales);
    if (sort === "최신순")      list = [...list].sort((a, b) => new Date(b.created) - new Date(a.created));
    if (sort === "낮은 가격순") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "높은 가격순") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "평점순")      list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [cat, sort, hideSoldout]);

  const handleCatClick = (c) => {
    setCat(c);
    if (c === "전체") {
      router.push("/shop/products/", { scroll: false });
    } else {
      router.push(`/shop/products/?cat=${encodeURIComponent(c)}`, { scroll: false });
    }
  };

  return (
    <div style={{ ...S.wrap, paddingTop: 48, paddingBottom: 40 }}>

      {/* 타이틀 */}
      <div className="sh-fadeup" style={{ marginBottom: 32 }}>
        <div style={S.eyebrow}>// All Products</div>
        <h1 style={{
          fontSize: "clamp(30px,5vw,52px)", fontWeight: 800,
          letterSpacing: "-0.035em", margin: "10px 0 6px", color: T.text,
        }}>
          전체 제품
        </h1>
        <div style={{ fontSize: 13, color: T.textHint, fontFamily: S.mono }}>
          // {filtered.length}개의 제품
        </div>
      </div>

      {/* 필터 바 */}
      <div
        className="sh-fadeup"
        style={{
          animationDelay: "100ms",
          display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
          marginBottom: 28, paddingBottom: 20,
          borderBottom: `1px solid ${T.border}`,
        }}
      >
        {/* 카테고리 칩 */}
        {["전체", ...CATEGORIES].map(c => (
          <button
            key={c}
            onClick={() => handleCatClick(c)}
            className="sh-chip"
            style={{
              height: 38, padding: "0 16px", borderRadius: 9,
              border: `1.5px solid ${cat === c ? T.violet : T.borderMid}`,
              background: cat === c ? T.violetBg : T.bgRaised,
              color: cat === c ? T.violet : T.textSub,
              fontSize: 13, fontWeight: 700, cursor: "pointer",
              fontFamily: cat === c ? S.mono : "inherit",
              transition: "border-color 0.15s, background 0.15s, color 0.15s",
            }}
          >
            {c}
          </button>
        ))}

        <span style={{ flex: 1 }} />

        {/* 품절 제외 */}
        <label style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          fontSize: 12.5, color: T.textSub, cursor: "pointer", fontFamily: S.mono,
        }}>
          <input
            type="checkbox"
            checked={hideSoldout}
            onChange={e => setHideSoldout(e.target.checked)}
            style={{ width: 15, height: 15, accentColor: T.violet }}
          />
          품절 제외
        </label>

        {/* 정렬 */}
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          style={{
            height: 38, padding: "0 12px", borderRadius: 9,
            border: `1.5px solid ${T.borderMid}`,
            background: T.bgRaised, color: T.text,
            fontSize: 13, fontWeight: 600, cursor: "pointer",
            outline: "none",
          }}
        >
          {SORTS.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* 상품 그리드 */}
{isLoading ? (
  // 스켈레톤 그리드
  <div className="sh-grid-4">
    {Array.from({ length: 8 }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
) : filtered.length === 0 ? (
  <div style={{ textAlign: "center", padding: "90px 0" }}>
    <div style={{ fontSize: 38, marginBottom: 14, fontFamily: S.mono, color: T.textHint }}>
      // 404
    </div>
    <div style={{ fontSize: 15, fontWeight: 600, color: T.textSub }}>
      조건에 맞는 제품이 없어요
    </div>
    <button
      onClick={() => handleCatClick("전체")}
      style={{
        marginTop: 14, fontSize: 13, fontWeight: 700,
        color: T.violet, border: "none", background: "none",
        cursor: "pointer", fontFamily: S.mono,
      }}
    >
      // 필터 초기화
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

// ── Suspense 경계 (useSearchParams 요구사항) ──────────────────
export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, color: "#475569" }}>
          // loading...
        </div>
      </div>
    }>
      <ProductsInner />
    </Suspense>
  );
}