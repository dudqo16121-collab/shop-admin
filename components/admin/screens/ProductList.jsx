"use client";

import { useState } from "react";
import { C, styles } from "../theme";
import { exportProducts } from "../csv";

// ── 상품 목록 페이지 ─────────────────────────────────────────
export default function ProductList({ onNavigate }) {
  const [filter, setFilter] = useState("전체");
  const [sort, setSort] = useState("최신순");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [editOpen, setEditOpen] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(null);
  const [bulkPriceOpen, setBulkPriceOpen] = useState(false);
  const [bulkCat, setBulkCat] = useState("전체");
  const [bulkType, setBulkType] = useState("discount");
  const [bulkValue, setBulkValue] = useState("");
  const [bulkPreview, setBulkPreview] = useState(false);
  const [viewMode, setViewMode] = useState("table");

  const [products, setProducts] = useState([
    { id: 1, name: "프리미엄 후디", cat: "의류", price: 89000, stock: 4, status: "판매중", sales: 284, rating: 4.8, reviews: 142, thumb: "🧥", skus: 4, created: "2026-01-15" },
    { id: 2, name: "클래식 티셔츠", cat: "의류", price: 39000, stock: 0, status: "품절", sales: 198, rating: 4.6, reviews: 98, thumb: "👕", skus: 3, created: "2026-02-10" },
    { id: 3, name: "데님 팬츠", cat: "하의", price: 79000, stock: 24, status: "판매중", sales: 156, rating: 4.7, reviews: 76, thumb: "👖", skus: 6, created: "2026-02-20" },
    { id: 4, name: "캐주얼 스니커즈", cat: "신발", price: 89000, stock: 50, status: "판매중", sales: 124, rating: 4.5, reviews: 64, thumb: "👟", skus: 8, created: "2026-03-05" },
    { id: 5, name: "레더 토트백", cat: "가방", price: 128000, stock: 15, status: "판매중", sales: 98, rating: 4.9, reviews: 52, thumb: "👜", skus: 2, created: "2026-03-12" },
    { id: 6, name: "캐시미어 머플러", cat: "악세서리", price: 48000, stock: 62, status: "판매중", sales: 84, rating: 4.4, reviews: 38, thumb: "🧣", skus: 3, created: "2026-03-20" },
    { id: 7, name: "오버핏 티셔츠", cat: "의류", price: 45000, stock: 5, status: "판매중", sales: 72, rating: 4.3, reviews: 28, thumb: "👕", skus: 4, created: "2026-04-01" },
    { id: 8, name: "슬랙스", cat: "하의", price: 68000, stock: 18, status: "판매중", sales: 64, rating: 4.6, reviews: 32, thumb: "👖", skus: 5, created: "2026-04-10" },
    { id: 9, name: "미니 크로스백", cat: "가방", price: 78000, stock: 0, status: "판매중단", sales: 48, rating: 4.2, reviews: 18, thumb: "👜", skus: 2, created: "2026-04-15" },
    { id: 10, name: "울 베레모", cat: "악세서리", price: 38000, stock: 34, status: "판매중", sales: 42, rating: 4.5, reviews: 22, thumb: "🎩", skus: 2, created: "2026-05-01" },
    { id: 11, name: "롱 코트", cat: "의류", price: 228000, stock: 8, status: "판매중", sales: 38, rating: 4.8, reviews: 16, thumb: "🧥", skus: 3, created: "2026-05-10" },
    { id: 12, name: "런닝화", cat: "신발", price: 98000, stock: 0, status: "품절", sales: 32, rating: 4.4, reviews: 14, thumb: "👟", skus: 6, created: "2026-05-20" },
  ]);

  const cats = ["전체", "의류", "하의", "신발", "가방", "악세서리"];
  const statusColor = { "판매중": "green", "품절": "red", "판매중단": "gray" };

  const filtered = products
    .filter(p => {
      const matchCat = filter === "전체" || p.cat === filter;
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (sort === "최신순") return new Date(b.created) - new Date(a.created);
      if (sort === "판매순") return b.sales - a.sales;
      if (sort === "가격높은순") return b.price - a.price;
      if (sort === "가격낮은순") return a.price - b.price;
      if (sort === "평점순") return b.rating - a.rating;
      return 0;
    });

  const toggleSelect = (id) => setSelected(s => s.includes(id) ? s.filter(i => i !== id) : [...s, id]);
  const toggleAll = () => setSelected(selected.length === filtered.length ? [] : filtered.map(p => p.id));
  const deleteProduct = (id) => { setProducts(ps => ps.filter(p => p.id !== id)); setDeleteOpen(null); };
  const bulkDelete = () => { setProducts(ps => ps.filter(p => !selected.includes(p.id))); setSelected([]); };

  return (
    <>
      {/* KPI */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 10 }}>
        {[
          { label: "전체 상품", value: `${products.length}개`, sub: "등록된 상품", accent: C.blue },
          { label: "판매 중", value: `${products.filter(p => p.status === "판매중").length}개`, sub: "현재 판매 중", accent: C.green },
          { label: "품절 상품", value: `${products.filter(p => p.stock === 0).length}개`, sub: "재고 0개", accent: C.red },
          { label: "총 판매량", value: `${products.reduce((a, p) => a + p.sales, 0).toLocaleString()}개`, sub: "누적 판매", accent: C.purple },
        ].map(k => (
          <div key={k.label} style={styles.kpiCard(k.accent)}>
            <div style={styles.kpiLabel}>{k.label}</div>
            <div style={{ ...styles.kpiValue, fontSize: 18 }}>{k.value}</div>
            <div style={styles.kpiSub}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* 필터 바 */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <div style={{ ...styles.searchBox, flex: 1, minWidth: 160 }}>
          🔍
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="상품명 검색..."
            style={{ flex: 1, border: "none", outline: "none", fontSize: 11, color: C.text, background: "transparent" }}
          />
        </div>
        <div style={{ display: "flex", gap: 5 }}>
          {cats.map(c => <div key={c} onClick={() => setFilter(c)} style={styles.filterChip(filter === c)}>{c}</div>)}
        </div>
        <select style={styles.select} value={sort} onChange={e => setSort(e.target.value)}>
          <option>최신순</option><option>판매순</option><option>가격높은순</option><option>가격낮은순</option><option>평점순</option>
        </select>
        <div style={{ display: "flex", gap: 4 }}>
          <div onClick={() => setViewMode("table")} style={{ ...styles.smBtn, background: viewMode === "table" ? C.bg : C.surface, borderColor: viewMode === "table" ? C.borderMid : C.border }}>☰</div>
          <div onClick={() => setViewMode("grid")} style={{ ...styles.smBtn, background: viewMode === "grid" ? C.bg : C.surface, borderColor: viewMode === "grid" ? C.borderMid : C.border }}>⊞</div>
        </div>
        <button style={styles.btn()} onClick={() => exportProducts(products)}>↓ CSV 내보내기</button>
        <button style={styles.btn()} onClick={() => setBulkPriceOpen(true)}>💰 일괄 가격 수정</button>
        <button style={styles.btn("primary")} onClick={() => onNavigate("products")}>+ 상품 등록</button>
      </div>

      {/* 일괄 처리 바 */}
      {selected.length > 0 && (
        <div style={{ ...styles.card, padding: "8px 12px", display: "flex", alignItems: "center", gap: 8, fontSize: 11, background: C.blueBg, border: `1px solid ${C.blue}` }}>
          <span style={{ color: C.blueText, fontWeight: 600 }}>{selected.length}개 선택됨</span>
          <span style={{ flex: 1 }} />
          <button style={styles.smBtn}>판매 중으로 변경</button>
          <button style={styles.smBtn}>판매 중단</button>
          <button style={{ ...styles.smBtn, color: C.red }} onClick={bulkDelete}>선택 삭제</button>
          <button style={{ ...styles.smBtn }} onClick={() => setSelected([])}>선택 해제</button>
        </div>
      )}

      {/* 테이블 뷰 */}
      {viewMode === "table" && (
        <div style={styles.tableWrap}>
          <table style={{ ...styles.table, tableLayout: "fixed" }}>
            <thead><tr>
              <th style={{ ...styles.th, width: 32 }}>
                <input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleAll} style={{ width: 13, height: 13, accentColor: C.accent }} />
              </th>
              <th style={styles.th}>상품명</th>
              <th style={{ ...styles.th, width: 60 }}>카테고리</th>
              <th style={{ ...styles.th, width: 50 }}>SKU</th>
              <th style={{ ...styles.th, width: 80, textAlign: "right" }}>판매가</th>
              <th style={{ ...styles.th, width: 55, textAlign: "right" }}>재고</th>
              <th style={{ ...styles.th, width: 55, textAlign: "right" }}>판매량</th>
              <th style={{ ...styles.th, width: 55, textAlign: "center" }}>평점</th>
              <th style={{ ...styles.th, width: 65, textAlign: "center" }}>상태</th>
              <th style={{ ...styles.th, width: 90, textAlign: "right" }}>관리</th>
            </tr></thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} style={{ background: selected.includes(p.id) ? C.blueBg : C.surface }}>
                  <td style={styles.td}>
                    <input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggleSelect(p.id)} style={{ width: 13, height: 13, accentColor: C.accent }} />
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 7, background: C.bg, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{p.thumb}</div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 500, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                        <div style={{ fontSize: 10, color: C.textHint }}>{p.created}</div>
                      </div>
                    </div>
                  </td>
                  <td style={styles.td}>{p.cat}</td>
                  <td style={{ ...styles.td, textAlign: "center", fontSize: 10, color: C.textHint }}>{p.skus}개</td>
                  <td style={{ ...styles.td, textAlign: "right", fontWeight: 600, color: C.text }}>₩{p.price.toLocaleString()}</td>
                  <td style={{ ...styles.td, textAlign: "right", fontWeight: 600, color: p.stock === 0 ? C.red : p.stock < 10 ? C.amber : C.text }}>{p.stock}개</td>
                  <td style={{ ...styles.td, textAlign: "right" }}>{p.sales}개</td>
                  <td style={{ ...styles.td, textAlign: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
                      <span style={{ color: C.amber, fontSize: 11 }}>★</span>
                      <span style={{ fontSize: 11, fontWeight: 500 }}>{p.rating}</span>
                    </div>
                  </td>
                  <td style={{ ...styles.td, textAlign: "center" }}><span style={styles.badge(statusColor[p.status])}>{p.status}</span></td>
                  <td style={{ ...styles.td, textAlign: "right" }}>
                    <div style={{ display: "flex", gap: 3, justifyContent: "flex-end" }}>
                      <button style={styles.smBtn} onClick={() => setEditOpen(p)}>수정</button>
                      <button style={{ ...styles.smBtn, color: C.red }} onClick={() => setDeleteOpen(p)}>삭제</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={styles.pagination}>
            <span style={{ fontSize: 11, color: C.textHint }}>총 {filtered.length}개 상품</span>
            <div style={{ display: "flex", gap: 4 }}>
              {["‹", "1", "2", "›"].map((p, i) => <div key={i} style={styles.pageBtn(p === "1")}>{p}</div>)}
            </div>
          </div>
        </div>
      )}

      {/* 그리드 뷰 */}
      {viewMode === "grid" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 10 }}>
          {filtered.map(p => (
            <div key={p.id} style={{ ...styles.card, padding: "12px", position: "relative" }}>
              <input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggleSelect(p.id)} style={{ position: "absolute", top: 10, left: 10, width: 13, height: 13, accentColor: C.accent }} />
              <div style={{ width: "100%", height: 80, borderRadius: 8, background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, marginBottom: 8, border: `1px solid ${C.border}` }}>{p.thumb}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
              <div style={{ fontSize: 10, color: C.textHint, marginBottom: 5 }}>{p.cat}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>₩{p.price.toLocaleString()}</span>
                <span style={styles.badge(statusColor[p.status])}>{p.status}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.textHint, marginBottom: 8 }}>
                <span>재고 <strong style={{ color: p.stock === 0 ? C.red : C.text }}>{p.stock}개</strong></span>
                <span>판매 {p.sales}개</span>
                <span>★ {p.rating}</span>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <button style={{ ...styles.smBtn, flex: 1, textAlign: "center" }} onClick={() => setEditOpen(p)}>수정</button>
                <button style={{ ...styles.smBtn, color: C.red }} onClick={() => setDeleteOpen(p)}>삭제</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 수정 모달 */}
      {editOpen && (
        <div onClick={() => setEditOpen(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.surface, borderRadius: 14, width: 460, padding: 24, boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>상품 수정 — {editOpen.name}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div><div style={{ fontSize: 11, color: C.textSub, marginBottom: 4 }}>상품명</div><input style={{ ...styles.input, height: 36 }} defaultValue={editOpen.name} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div><div style={{ fontSize: 11, color: C.textSub, marginBottom: 4 }}>카테고리</div>
                  <select style={{ ...styles.input, height: 36 }} defaultValue={editOpen.cat}>
                    {["의류", "하의", "신발", "가방", "악세서리"].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div><div style={{ fontSize: 11, color: C.textSub, marginBottom: 4 }}>판매가</div><input style={{ ...styles.input, height: 36 }} defaultValue={editOpen.price} /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div><div style={{ fontSize: 11, color: C.textSub, marginBottom: 4 }}>재고</div><input style={{ ...styles.input, height: 36 }} defaultValue={editOpen.stock} /></div>
                <div><div style={{ fontSize: 11, color: C.textSub, marginBottom: 4 }}>상태</div>
                  <select style={{ ...styles.input, height: 36 }} defaultValue={editOpen.status}>
                    <option>판매중</option><option>품절</option><option>판매중단</option>
                  </select>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
              <button onClick={() => setEditOpen(null)} style={styles.btn()}>취소</button>
              <button onClick={() => setEditOpen(null)} style={styles.btn("primary")}>저장</button>
            </div>
          </div>
        </div>
      )}

      {/* 일괄 가격 수정 모달 */}
      {bulkPriceOpen && (
        <div onClick={() => { setBulkPriceOpen(false); setBulkPreview(false); setBulkValue(""); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.surface, borderRadius: 14, width: 520, maxHeight: "85vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>

            {/* 헤더 */}
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>일괄 가격 수정</div>
                <div style={{ fontSize: 11, color: C.textHint, marginTop: 2 }}>카테고리별로 가격을 일괄 변경합니다</div>
              </div>
              <div onClick={() => { setBulkPriceOpen(false); setBulkPreview(false); setBulkValue(""); }} style={{ width: 28, height: 28, borderRadius: 8, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 13, color: C.textHint }}>✕</div>
            </div>

            {/* 설정 영역 */}
            <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14, overflowY: "auto", flex: 1 }}>

              {/* 적용 카테고리 */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.textSub, marginBottom: 8 }}>적용 카테고리</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {["전체", "의류", "하의", "신발", "가방", "악세서리"].map(c => (
                    <div key={c} onClick={() => { setBulkCat(c); setBulkPreview(false); }} style={{ fontSize: 11, padding: "5px 12px", borderRadius: 20, border: `1.5px solid ${bulkCat === c ? C.accent : C.border}`, background: bulkCat === c ? C.bg : C.surface, color: bulkCat === c ? C.text : C.textSub, cursor: "pointer", fontWeight: bulkCat === c ? 700 : 400 }}>{c}</div>
                  ))}
                </div>
                <div style={{ fontSize: 10, color: C.textHint, marginTop: 5 }}>
                  선택된 카테고리: <strong style={{ color: C.text }}>{bulkCat}</strong> ({bulkCat === "전체" ? products.length : products.filter(p => p.cat === bulkCat).length}개 상품)
                </div>
              </div>

              {/* 변경 방식 */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.textSub, marginBottom: 8 }}>변경 방식</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6 }}>
                  {[
                    { id: "discount", label: "% 할인", icon: "📉", desc: "현재가에서 % 할인" },
                    { id: "increase", label: "% 인상", icon: "📈", desc: "현재가에서 % 인상" },
                    { id: "fixed", label: "정액 할인", icon: "💰", desc: "고정 금액 차감" },
                  ].map(type => (
                    <div key={type.id} onClick={() => { setBulkType(type.id); setBulkPreview(false); setBulkValue(""); }} style={{ padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${bulkType === type.id ? C.accent : C.border}`, background: bulkType === type.id ? C.bg : C.surface, cursor: "pointer", textAlign: "center" }}>
                      <div style={{ fontSize: 20, marginBottom: 4 }}>{type.icon}</div>
                      <div style={{ fontSize: 11, fontWeight: bulkType === type.id ? 700 : 500, color: C.text }}>{type.label}</div>
                      <div style={{ fontSize: 10, color: C.textHint, marginTop: 2 }}>{type.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 값 입력 */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.textSub, marginBottom: 8 }}>
                  {bulkType === "discount" ? "할인율 (%)" : bulkType === "increase" ? "인상률 (%)" : "할인 금액 (₩)"}
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ display: "flex", flex: 1, border: `1.5px solid ${C.border}`, borderRadius: 9, overflow: "hidden", background: C.surface }}>
                    <input
                      type="number"
                      value={bulkValue}
                      onChange={e => { setBulkValue(e.target.value); setBulkPreview(false); }}
                      placeholder={bulkType === "fixed" ? "예: 5000" : "예: 10"}
                      min="0"
                      max={bulkType !== "fixed" ? "100" : undefined}
                      style={{ flex: 1, border: "none", outline: "none", padding: "9px 12px", fontSize: 14, fontWeight: 600, color: C.text, background: "transparent" }}
                    />
                    <div style={{ padding: "0 12px", display: "flex", alignItems: "center", fontSize: 13, fontWeight: 600, color: C.textHint, background: C.bg, borderLeft: `1px solid ${C.border}` }}>
                      {bulkType === "fixed" ? "₩" : "%"}
                    </div>
                  </div>
                  {/* 빠른 선택 */}
                  <div style={{ display: "flex", gap: 4 }}>
                    {(bulkType === "fixed" ? ["1000", "3000", "5000"] : ["5", "10", "20", "30"]).map(v => (
                      <div key={v} onClick={() => { setBulkValue(v); setBulkPreview(false); }} style={{ fontSize: 11, padding: "5px 9px", borderRadius: 7, border: `1px solid ${C.border}`, background: bulkValue === v ? C.bg : C.surface, color: bulkValue === v ? C.text : C.textSub, cursor: "pointer", fontWeight: bulkValue === v ? 700 : 400 }}>
                        {bulkType === "fixed" ? `₩${Number(v).toLocaleString()}` : `${v}%`}
                      </div>
                    ))}
                  </div>
                </div>
                {bulkType !== "fixed" && bulkValue && Number(bulkValue) > 0 && (
                  <div style={{ fontSize: 10, color: C.textHint, marginTop: 4 }}>
                    {bulkType === "discount" ? `현재가에서 ${bulkValue}% 낮아집니다` : `현재가에서 ${bulkValue}% 높아집니다`}
                  </div>
                )}
              </div>

              {/* 미리보기 버튼 */}
              {!bulkPreview && bulkValue && Number(bulkValue) > 0 && (
                <button onClick={() => setBulkPreview(true)} style={{ ...styles.btn(), justifyContent: "center", color: C.blue, borderColor: C.blue }}>🔍 변경 미리보기</button>
              )}

              {/* 미리보기 테이블 */}
              {bulkPreview && bulkValue && Number(bulkValue) > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: C.textSub, marginBottom: 8 }}>변경 미리보기</div>
                  <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
                    <table style={{ ...styles.table, tableLayout: "fixed" }}>
                      <thead><tr>
                        <th style={{ ...styles.th }}>상품명</th>
                        <th style={{ ...styles.th, width: 70, textAlign: "right" }}>현재가</th>
                        <th style={{ ...styles.th, width: 50, textAlign: "center" }}>변동</th>
                        <th style={{ ...styles.th, width: 80, textAlign: "right" }}>변경 후</th>
                      </tr></thead>
                      <tbody>
                        {(bulkCat === "전체" ? products : products.filter(p => p.cat === bulkCat)).map(p => {
                          const val = Number(bulkValue);
                          const newPrice = bulkType === "discount"
                            ? Math.round(p.price * (1 - val / 100))
                            : bulkType === "increase"
                            ? Math.round(p.price * (1 + val / 100))
                            : Math.max(0, p.price - val);
                          const diff = newPrice - p.price;
                          return (
                            <tr key={p.id}>
                              <td style={styles.td}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                  <span style={{ fontSize: 14 }}>{p.thumb}</span>
                                  <span style={{ fontSize: 11, fontWeight: 500, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                                </div>
                              </td>
                              <td style={{ ...styles.td, textAlign: "right", color: C.textSub, fontSize: 11 }}>₩{p.price.toLocaleString()}</td>
                              <td style={{ ...styles.td, textAlign: "center" }}>
                                <span style={{ fontSize: 10, fontWeight: 700, color: diff < 0 ? C.green : diff > 0 ? C.red : C.textHint }}>
                                  {diff < 0 ? `▼${Math.abs(diff).toLocaleString()}` : diff > 0 ? `▲${diff.toLocaleString()}` : "—"}
                                </span>
                              </td>
                              <td style={{ ...styles.td, textAlign: "right", fontWeight: 700, color: diff < 0 ? C.green : diff > 0 ? C.red : C.text, fontSize: 12 }}>₩{newPrice.toLocaleString()}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, padding: "8px 10px", background: C.amberBg, borderRadius: 8, fontSize: 11, color: C.amberText }}>
                    ⚠️ 총 <strong>{bulkCat === "전체" ? products.length : products.filter(p => p.cat === bulkCat).length}개</strong> 상품의 가격이 변경됩니다. 신중하게 확인해주세요.
                  </div>
                </div>
              )}
            </div>

            {/* 푸터 */}
            <div style={{ padding: "12px 20px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 8, justifyContent: "flex-end", flexShrink: 0 }}>
              <button onClick={() => { setBulkPriceOpen(false); setBulkPreview(false); setBulkValue(""); }} style={styles.btn()}>취소</button>
              <button
                disabled={!bulkPreview || !bulkValue || Number(bulkValue) <= 0}
                onClick={() => {
                  const val = Number(bulkValue);
                  setProducts(prev => prev.map(p => {
                    if (bulkCat !== "전체" && p.cat !== bulkCat) return p;
                    const newPrice = bulkType === "discount"
                      ? Math.round(p.price * (1 - val / 100))
                      : bulkType === "increase"
                      ? Math.round(p.price * (1 + val / 100))
                      : Math.max(0, p.price - val);
                    return { ...p, price: newPrice };
                  }));
                  setBulkPriceOpen(false);
                  setBulkPreview(false);
                  setBulkValue("");
                }}
                style={{ ...styles.btn("primary"), opacity: !bulkPreview || !bulkValue || Number(bulkValue) <= 0 ? 0.4 : 1, cursor: !bulkPreview ? "not-allowed" : "pointer" }}
              >
                ✓ 일괄 적용
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {deleteOpen && (
        <div onClick={() => setDeleteOpen(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.surface, borderRadius: 14, width: 360, padding: 24, boxShadow: "0 8px 32px rgba(0,0,0,0.18)", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🗑</div>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>상품을 삭제할까요?</div>
            <div style={{ fontSize: 12, color: C.textSub, marginBottom: 20 }}>
              <strong>{deleteOpen.name}</strong>을 삭제하면<br />복구할 수 없습니다.
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setDeleteOpen(null)} style={{ ...styles.btn(), flex: 1, justifyContent: "center" }}>취소</button>
              <button onClick={() => deleteProduct(deleteOpen.id)} style={{ ...styles.btn("danger"), flex: 1, justifyContent: "center", background: C.red, color: "#fff", border: "none" }}>삭제</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
