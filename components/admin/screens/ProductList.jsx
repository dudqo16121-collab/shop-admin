"use client";

import { useEffect, useState } from "react";
import { C, styles } from "../theme";
import { exportProducts } from "../csv";
import {
  getAllProducts, saveAllProducts, updateProduct,
  deleteProduct as deleteProductById, bulkUpdatePrice,
  getProductStats, resetToDefault,
} from "../../../lib/productStore";

// ── 상태 컬러 ────────────────────────────────────────────────
const STATUS_COLOR = { "판매중": "green", "품절": "red", "판매중단": "gray" };
const CATS = ["전체", "UI Kit", "템플릿", "플러그인", "아이콘", "폰트"];

// ── 상품 수정 모달 ────────────────────────────────────────────
function EditModal({ product, onSave, onClose, C, styles }) {
  const [form, setForm] = useState({ ...product });
  const [saved, setSaved] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSave = () => {
    onSave(form.id, {
      name:   form.name,
      cat:    form.cat,
      price:  Number(form.price),
      stock:  Number(form.stock),
      status: form.status,
      desc:   form.desc,
      thumb:  form.thumb,
    });
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 900);
  };

  const inputStyle = {
    width: "100%", height: 36, borderRadius: 8,
    border: `1px solid ${C.border}`, background: C.bg,
    color: C.text, padding: "0 10px", fontSize: 12,
    outline: "none", boxSizing: "border-box",
  };

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }}
    >
      <div onClick={e => e.stopPropagation()} style={{ background: C.surface, borderRadius: 14, width: 500, maxHeight: "85vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 8px 40px rgba(0,0,0,0.3)" }}>
        {/* 헤더 */}
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>
            상품 수정
            <span style={{ fontSize: 10, color: C.textHint, fontFamily: "monospace", marginLeft: 8 }}>
              // ID: {product.id}
            </span>
          </div>
          {saved && (
            <span style={{ fontSize: 11, color: C.green, fontFamily: "monospace" }}>✓ 쇼핑몰에 반영됨</span>
          )}
          <div onClick={onClose} style={{ width: 26, height: 26, borderRadius: 7, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 12, color: C.textHint }}>✕</div>
        </div>

        {/* 본문 */}
        <div style={{ padding: "18px 20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>

          {/* 썸네일 + 이름 */}
          <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: 10 }}>
            <div>
              <div style={{ fontSize: 10, color: C.textHint, fontFamily: "monospace", marginBottom: 5 }}>// thumb</div>
              <input style={{ ...inputStyle, textAlign: "center", fontSize: 22 }} value={form.thumb} onChange={set("thumb")} />
            </div>
            <div>
              <div style={{ fontSize: 10, color: C.textHint, fontFamily: "monospace", marginBottom: 5 }}>// name *</div>
              <input style={inputStyle} value={form.name} onChange={set("name")} />
            </div>
          </div>

          {/* 카테고리 + 상태 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <div style={{ fontSize: 10, color: C.textHint, fontFamily: "monospace", marginBottom: 5 }}>// category</div>
              <select style={{ ...inputStyle, height: 36 }} value={form.cat} onChange={set("cat")}>
                {["UI Kit", "템플릿", "플러그인", "아이콘", "폰트"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize: 10, color: C.textHint, fontFamily: "monospace", marginBottom: 5 }}>// status</div>
              <select style={{ ...inputStyle, height: 36 }} value={form.status} onChange={set("status")}>
                {["판매중", "품절", "판매중단"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* 가격 + 재고 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <div style={{ fontSize: 10, color: C.textHint, fontFamily: "monospace", marginBottom: 5 }}>// price (₩)</div>
              <input style={inputStyle} type="number" value={form.price} onChange={set("price")} />
            </div>
            <div>
              <div style={{ fontSize: 10, color: C.textHint, fontFamily: "monospace", marginBottom: 5 }}>// stock</div>
              <input style={inputStyle} type="number" value={form.stock} onChange={set("stock")} />
            </div>
          </div>

          {/* 설명 */}
          <div>
            <div style={{ fontSize: 10, color: C.textHint, fontFamily: "monospace", marginBottom: 5 }}>// description</div>
            <textarea
              value={form.desc || ""}
              onChange={set("desc")}
              rows={3}
              style={{ ...inputStyle, height: "auto", padding: "8px 10px", resize: "vertical", lineHeight: 1.6 }}
            />
          </div>

          {/* 쇼핑몰 반영 안내 */}
          <div style={{ padding: "10px 13px", background: C.greenBg, borderRadius: 9, border: `1px solid ${C.green}40`, fontSize: 11, color: C.green, fontFamily: "monospace" }}>
            ✓ 저장 시 쇼핑몰에 즉시 반영됩니다 (localStorage 동기화)
          </div>
        </div>

        {/* 푸터 */}
        <div style={{ padding: "14px 20px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={styles.btn()}>취소</button>
          <button onClick={handleSave} style={styles.btn("primary")}>
            {saved ? "✓ 저장됨" : "저장 · 쇼핑몰 반영"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 삭제 확인 모달 ────────────────────────────────────────────
function DeleteModal({ product, onConfirm, onClose, C, styles }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: C.surface, borderRadius: 14, width: 380, padding: "24px", boxShadow: "0 8px 40px rgba(0,0,0,0.3)" }}>
        <div style={{ fontSize: 28, marginBottom: 12, textAlign: "center" }}>🗑</div>
        <div style={{ fontWeight: 700, fontSize: 14, color: C.text, textAlign: "center", marginBottom: 8 }}>상품 삭제</div>
        <p style={{ fontSize: 12, color: C.textSub, textAlign: "center", lineHeight: 1.6, marginBottom: 20 }}>
          <strong style={{ color: C.text }}>{product.name}</strong>을 삭제하면<br />
          쇼핑몰에서도 즉시 제거됩니다. 계속할까요?
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onClose} style={{ ...styles.btn(), flex: 1, justifyContent: "center" }}>취소</button>
          <button onClick={() => onConfirm(product.id)} style={{ ...styles.btn("danger"), flex: 1, justifyContent: "center" }}>삭제</button>
        </div>
      </div>
    </div>
  );
}

// ── 메인 ────────────────────────────────────────────────────
export default function ProductList({ onNavigate }) {
  const [products, setProducts]   = useState([]);
  const [stats, setStats]         = useState(null);
  const [filter, setFilter]       = useState("전체");
  const [sort, setSort]           = useState("최신순");
  const [search, setSearch]       = useState("");
  const [selected, setSelected]   = useState([]);
  const [editOpen, setEditOpen]   = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(null);
  const [syncMsg, setSyncMsg]     = useState(null);

  // 일괄 가격 변경
  const [bulkOpen, setBulkOpen]   = useState(false);
  const [bulkType, setBulkType]   = useState("discount");
  const [bulkValue, setBulkValue] = useState("");

  // ── 데이터 로드 ──────────────────────────────────────────
  const load = () => {
    setProducts(getAllProducts());
    setStats(getProductStats());
  };

  useEffect(() => { load(); }, []);

  // ── 수정 저장 ────────────────────────────────────────────
  const handleUpdate = (id, patch) => {
    const ok = updateProduct(id, patch);
    if (ok) {
      load();
      showSync(`ID:${id} ${patch.name} 수정됨 · 쇼핑몰 반영 완료`);
    }
  };

  // ── 삭제 ────────────────────────────────────────────────
  const handleDelete = (id) => {
    const p = products.find(p => p.id === id);
    deleteProductById(id);
    load();
    setDeleteOpen(null);
    showSync(`${p?.name} 삭제됨 · 쇼핑몰에서 제거됨`);
  };

  // ── 일괄 삭제 ────────────────────────────────────────────
  const handleBulkDelete = () => {
    const ps = getAllProducts().filter(p => !selected.includes(p.id));
    saveAllProducts(ps);
    load();
    setSelected([]);
    showSync(`${selected.length}개 상품 삭제됨 · 쇼핑몰 반영 완료`);
  };

  // ── 일괄 가격 변경 ───────────────────────────────────────
  const handleBulkPrice = () => {
    if (!bulkValue) return;
    const ids = selected.length > 0 ? selected : products.map(p => p.id);
    bulkUpdatePrice(ids, bulkType, bulkValue);
    load();
    setBulkOpen(false);
    setBulkValue("");
    showSync(`${ids.length}개 상품 가격 변경됨 · 쇼핑몰 반영 완료`);
  };

  // ── 초기화 ──────────────────────────────────────────────
  const handleReset = () => {
    resetToDefault();
    load();
    showSync("기본 상품 데이터로 초기화됨");
  };

  // ── 싱크 토스트 ─────────────────────────────────────────
  const showSync = (msg) => {
    setSyncMsg(msg);
    setTimeout(() => setSyncMsg(null), 2800);
  };

  // ── 필터 ────────────────────────────────────────────────
  const filtered = products
    .filter(p => {
      const matchCat    = filter === "전체" || p.cat === filter;
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (sort === "최신순")    return new Date(b.created || b.createdAt || 0) - new Date(a.created || a.createdAt || 0);
      if (sort === "판매순")    return b.sales - a.sales;
      if (sort === "가격높은순") return b.price - a.price;
      if (sort === "가격낮은순") return a.price - b.price;
      if (sort === "평점순")    return b.rating - a.rating;
      return 0;
    });

  const toggleSelect = id => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAll    = () => setSelected(selected.length === filtered.length ? [] : filtered.map(p => p.id));

  return (
    <>
      {/* ── 수정 모달 ── */}
      {editOpen && (
        <EditModal
          product={editOpen}
          onSave={handleUpdate}
          onClose={() => setEditOpen(null)}
          C={C} styles={styles}
        />
      )}

      {/* ── 삭제 모달 ── */}
      {deleteOpen && (
        <DeleteModal
          product={deleteOpen}
          onConfirm={handleDelete}
          onClose={() => setDeleteOpen(null)}
          C={C} styles={styles}
        />
      )}

      {/* ── 싱크 토스트 ── */}
      {syncMsg && (
        <div style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          zIndex: 400, background: C.accent, color: "#fff",
          padding: "10px 20px", borderRadius: 10, fontSize: 12, fontWeight: 600,
          boxShadow: "0 4px 16px rgba(0,0,0,0.2)", fontFamily: "monospace",
          whiteSpace: "nowrap",
        }}>
          ✓ {syncMsg}
        </div>
      )}

      {/* ── 상단 버튼 ── */}
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", alignItems: "center" }}>
        <div style={{
          fontSize: 11, color: C.green, fontFamily: "monospace",
          background: C.greenBg, border: `1px solid ${C.green}40`,
          padding: "5px 10px", borderRadius: 7,
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, display: "inline-block" }} />
          쇼핑몰 자동 동기화
        </div>
        <button style={styles.btn()} onClick={() => setBulkOpen(true)}>💰 일괄 가격 변경</button>
        <button style={styles.btn()} onClick={() => exportProducts(filtered)}>↓ 내보내기</button>
        <button style={styles.btn()} onClick={handleReset}>↺ 초기화</button>
        <button style={styles.btn("primary")} onClick={() => onNavigate?.("products")}>+ 상품 등록</button>
      </div>

      {/* ── KPI ── */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: 8 }}>
          {[
            { label: "전체 상품",   val: stats.total,    color: "gray",  f: "전체" },
            { label: "판매 중",     val: stats.active,   color: "green", f: "전체" },
            { label: "품절",        val: stats.soldout,  color: "red",   f: "전체" },
            { label: "판매 중단",   val: stats.hidden,   color: "gray",  f: "전체" },
            { label: "재고 부족",   val: stats.lowStock, color: "amber", f: "전체" },
          ].map(s => (
            <div key={s.label} style={{ ...styles.card, paddingTop: 10, paddingBottom: 10, cursor: "pointer" }}>
              <div style={styles.kpiLabel}>{s.label}</div>
              <div style={{ ...styles.kpiValue, fontSize: 18 }}>{s.val}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── 필터 바 ── */}
      <div style={styles.filterBar}>
        <div style={{ ...styles.searchBox, flex: 1 }}>
          <span>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="상품명 검색..."
            style={{ flex: 1, border: "none", outline: "none", fontSize: 11, color: C.text, background: "transparent" }}
          />
        </div>
        <div style={{ display: "flex", gap: 5 }}>
          {CATS.map(c => (
            <div key={c} onClick={() => setFilter(c)} style={styles.filterChip(filter === c)}>{c}</div>
          ))}
        </div>
        <select style={styles.select} value={sort} onChange={e => setSort(e.target.value)}>
          {["최신순", "판매순", "가격높은순", "가격낮은순", "평점순"].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* ── 일괄 처리 바 ── */}
      {selected.length > 0 && (
        <div style={{ ...styles.card, padding: "8px 12px", display: "flex", alignItems: "center", gap: 8, fontSize: 11, background: C.blueBg, border: `1px solid ${C.blue}` }}>
          <span style={{ color: C.blueText, fontWeight: 600 }}>{selected.length}개 선택됨</span>
          <span style={{ flex: 1 }} />
          <button style={styles.smBtn} onClick={() => setBulkOpen(true)}>💰 가격 변경</button>
          <button style={{ ...styles.smBtn, color: C.red }} onClick={handleBulkDelete}>🗑 삭제</button>
          <button style={styles.smBtn} onClick={() => setSelected([])}>선택 해제</button>
        </div>
      )}

      {/* ── 일괄 가격 변경 모달 ── */}
      {bulkOpen && (
        <div onClick={() => setBulkOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.surface, borderRadius: 14, width: 380, padding: "22px", boxShadow: "0 8px 40px rgba(0,0,0,0.3)" }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 16 }}>
              일괄 가격 변경
              <span style={{ fontSize: 10, color: C.textHint, fontFamily: "monospace", marginLeft: 8 }}>
                {selected.length > 0 ? `${selected.length}개 선택` : "전체"}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <select style={{ height: 36, borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, color: C.text, padding: "0 10px", fontSize: 12 }} value={bulkType} onChange={e => setBulkType(e.target.value)}>
                <option value="discount">% 할인</option>
                <option value="increase">% 인상</option>
                <option value="fixed">고정 금액으로 설정</option>
              </select>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="number" value={bulkValue}
                  onChange={e => setBulkValue(e.target.value)}
                  placeholder={bulkType === "fixed" ? "가격 (₩)" : "숫자 입력"}
                  style={{ flex: 1, height: 36, borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, color: C.text, padding: "0 10px", fontSize: 12, outline: "none" }}
                />
                <span style={{ lineHeight: "36px", fontSize: 12, color: C.textHint }}>
                  {bulkType === "fixed" ? "₩" : "%"}
                </span>
              </div>
              <div style={{ padding: "10px", background: C.greenBg, borderRadius: 8, border: `1px solid ${C.green}40`, fontSize: 11, color: C.green, fontFamily: "monospace" }}>
                ✓ 변경 즉시 쇼핑몰 가격에 반영됩니다
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button onClick={() => setBulkOpen(false)} style={{ ...styles.btn(), flex: 1, justifyContent: "center" }}>취소</button>
              <button onClick={handleBulkPrice} style={{ ...styles.btn("primary"), flex: 1, justifyContent: "center" }}>적용</button>
            </div>
          </div>
        </div>
      )}

      {/* ── 테이블 ── */}
      <div style={styles.tableWrap}>
        <table style={{ ...styles.table, tableLayout: "fixed" }}>
          <thead>
            <tr>
              <th style={{ ...styles.th, width: 32 }}>
                <input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleAll} style={{ width: 13, height: 13, accentColor: C.accent }} />
              </th>
              <th style={{ ...styles.th, width: 36 }}>심볼</th>
              <th style={styles.th}>상품명</th>
              <th style={{ ...styles.th, width: 70, textAlign: "center" }}>카테고리</th>
              <th style={{ ...styles.th, width: 80, textAlign: "right" }}>가격</th>
              <th style={{ ...styles.th, width: 50, textAlign: "center" }}>재고</th>
              <th style={{ ...styles.th, width: 55, textAlign: "center" }}>평점</th>
              <th style={{ ...styles.th, width: 60, textAlign: "center" }}>상태</th>
              <th style={{ ...styles.th, width: 80, textAlign: "right" }}>관리</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr
                key={p.id}
                style={{ background: selected.includes(p.id) ? C.blueBg : C.surface }}
                onMouseEnter={e => { if (!selected.includes(p.id)) e.currentTarget.style.background = C.bg; }}
                onMouseLeave={e => { if (!selected.includes(p.id)) e.currentTarget.style.background = C.surface; }}
              >
                <td style={styles.td}>
                  <input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggleSelect(p.id)} style={{ width: 13, height: 13, accentColor: C.accent }} />
                </td>
                <td style={{ ...styles.td, textAlign: "center", fontSize: 18, fontFamily: "monospace" }}>{p.thumb}</td>
                <td style={styles.td}>
                  <div style={{ fontWeight: 600, fontSize: 12, color: C.text }}>{p.name}</div>
                  <div style={{ fontSize: 10, color: C.textHint, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {p.desc?.slice(0, 40)}...
                  </div>
                </td>
                <td style={{ ...styles.td, textAlign: "center" }}>
                  <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 5, background: C.bg, border: `1px solid ${C.border}`, fontFamily: "monospace" }}>{p.cat}</span>
                </td>
                <td style={{ ...styles.td, textAlign: "right", fontWeight: 700, color: C.text }}>
                  ₩{p.price.toLocaleString()}
                </td>
                <td style={{ ...styles.td, textAlign: "center", color: p.stock === 0 ? C.red : p.stock <= 5 ? C.amber : C.text, fontWeight: 600 }}>
                  {p.stock === 0 ? "품절" : p.stock <= 5 ? `⚡${p.stock}` : p.stock}
                </td>
                <td style={{ ...styles.td, textAlign: "center" }}>
                  <span style={{ color: "#F59E0B" }}>★</span> {p.rating}
                </td>
                <td style={{ ...styles.td, textAlign: "center" }}>
                  <span style={styles.badge(STATUS_COLOR[p.status] || "gray")}>{p.status}</span>
                </td>
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
          <span style={{ fontSize: 11, color: C.textHint }}>
            총 {filtered.length}개 {products.length !== filtered.length && `(전체 ${products.length}개)`}
          </span>
        </div>
      </div>

      {/* ── 동기화 상태 바 ── */}
      <div style={{ ...styles.card, fontSize: 10, color: C.textHint, fontFamily: "monospace", background: C.bg }}>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ color: C.green }}>✓ localStorage(<span style={{ color: C.accent }}>'admin:products'</span>) 동기화</span>
          <span>// 수정 즉시 쇼핑몰 반영</span>
          <span>// 쇼핑몰 lib/productStore.js 공유 소스</span>
        </div>
      </div>
    </>
  );
}