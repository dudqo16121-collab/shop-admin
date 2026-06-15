"use client";

// ── 전역 검색 모달 ───────────────────────────────────────────
// 트리거: 헤더 검색바 클릭 or Ctrl+K
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { T, S, CAT_TINT_V2 } from "./theme";
import { VISIBLE, fmtWon } from "../../lib/store-data";
import { useCart } from "../../lib/cart";

// ── 카테고리 컬러 ────────────────────────────────────────────
const CAT_COLOR = {
  "UI Kit":   "#6366F1",
  "템플릿":   "#10B981",
  "플러그인": "#F59E0B",
  "아이콘":   "#EC4899",
  "폰트":     "#8B5CF6",
};

// ── 최근 검색어 localStorage 키 ─────────────────────────────
const RECENT_KEY = "shop:search:recent";
const MAX_RECENT = 6;

function getRecent() {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); } catch { return []; }
}
function saveRecent(word) {
  if (!word.trim()) return;
  try {
    const prev = getRecent().filter(w => w !== word);
    localStorage.setItem(RECENT_KEY, JSON.stringify([word, ...prev].slice(0, MAX_RECENT)));
  } catch {}
}
function removeRecent(word) {
  try {
    const prev = getRecent().filter(w => w !== word);
    localStorage.setItem(RECENT_KEY, JSON.stringify(prev));
  } catch {}
}
function clearRecent() {
  try { localStorage.removeItem(RECENT_KEY); } catch {}
}

// ── 인기 검색어 ──────────────────────────────────────────────
const HOT_KEYWORDS = ["UI Kit", "SaaS 템플릿", "아이콘", "Next.js", "Figma", "폼 플러그인"];

// ── 하이라이트: 검색어 매칭 부분 강조 ───────────────────────
function Highlight({ text, query }) {
  if (!query.trim()) return <span>{text}</span>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part)
          ? <mark key={i} style={{ background: `${T.violet}40`, color: T.violet, borderRadius: 3, padding: "0 1px" }}>{part}</mark>
          : <span key={i}>{part}</span>
      )}
    </span>
  );
}

// ── 검색 결과 아이템 ─────────────────────────────────────────
function ResultItem({ p, query, focused, onClick }) {
  const ref = useRef(null);
  useEffect(() => {
    if (focused && ref.current) ref.current.scrollIntoView({ block: "nearest" });
  }, [focused]);

  return (
    <div
      ref={ref}
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "12px 18px", cursor: "pointer", borderRadius: 12,
        background: focused ? T.violetBg : "transparent",
        border: `1px solid ${focused ? T.violet : "transparent"}`,
        transition: "background 0.12s, border-color 0.12s",
        margin: "0 8px",
      }}
      onMouseEnter={e => { if (!focused) e.currentTarget.style.background = T.bgRaised; }}
      onMouseLeave={e => { if (!focused) e.currentTarget.style.background = "transparent"; }}
    >
      {/* 썸네일 */}
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: CAT_TINT_V2[p.cat], border: `1px solid ${T.border}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 22, fontFamily: S.mono,
        color: CAT_COLOR[p.cat] || T.violet,
      }}>
        {p.thumb}
      </div>

      {/* 정보 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: T.text, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          <Highlight text={p.name} query={query} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 5,
            background: `${CAT_COLOR[p.cat]}18`, color: CAT_COLOR[p.cat],
            border: `1px solid ${CAT_COLOR[p.cat]}40`, fontFamily: S.mono,
          }}>{p.cat}</span>
          <span style={{ fontSize: 11, color: T.textHint }}>★ {p.rating} · ↓ {p.sales.toLocaleString()}</span>
        </div>
      </div>

      {/* 가격 */}
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: T.text, fontFamily: S.mono }}>
          {fmtWon(p.price)}
        </div>
        {p.stock === 0 && (
          <div style={{ fontSize: 10, color: T.textHint, fontFamily: S.mono }}>품절</div>
        )}
      </div>

      {/* 엔터 힌트 */}
      {focused && (
        <div style={{
          fontSize: 10, color: T.textHint, fontFamily: S.mono,
          background: T.bgSubtle, border: `1px solid ${T.border}`,
          padding: "2px 7px", borderRadius: 5, flexShrink: 0,
        }}>↵</div>
      )}
    </div>
  );
}

// ── 메인 모달 ────────────────────────────────────────────────
export default function SearchModal({ onClose }) {
  const router = useRouter();
  const cart = useCart();
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState([]);
  const [focusIdx, setFocusIdx] = useState(-1);

  // 검색 결과
  const results = query.trim().length > 0
    ? VISIBLE.filter(p => {
        const q = query.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.cat.toLowerCase().includes(q) ||
          p.desc.toLowerCase().includes(q)
        );
      }).slice(0, 8)
    : [];

  // 초기화
  useEffect(() => {
    setRecent(getRecent());
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  // 포커스 인덱스 리셋
  useEffect(() => { setFocusIdx(-1); }, [query]);

  // Esc 닫기
  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  // 키보드 내비게이션
  const handleKeyDown = useCallback((e) => {
    if (results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusIdx(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusIdx(i => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (focusIdx >= 0 && results[focusIdx]) {
        navigate(results[focusIdx]);
      } else if (results.length > 0) {
        navigate(results[0]);
      }
    }
  }, [results, focusIdx]);

  const navigate = (p) => {
    saveRecent(p.name);
    onClose();
    router.push(`/shop/products/${p.id}/`);
  };

  const searchKeyword = (word) => {
    setQuery(word);
    saveRecent(word);
    inputRef.current?.focus();
  };

  const handleRemoveRecent = (e, word) => {
    e.stopPropagation();
    removeRecent(word);
    setRecent(getRecent());
  };

  const handleClearRecent = () => {
    clearRecent();
    setRecent([]);
  };

  return (
    <>
      {/* 배경 오버레이 */}
      <div
        className="sh-backdrop"
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(6px)",
          zIndex: 400,
        }}
      />

      {/* 검색 패널 */}
      <div
        className="sh-fadeup"
        style={{
          position: "fixed",
          top: "12vh",
          left: "50%",
          transform: "translateX(-50%)",
          width: "min(660px, 92vw)",
          background: T.bgCard,
          border: `1px solid ${T.borderMid}`,
          borderRadius: 20,
          boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 60px rgba(99,102,241,0.1)",
          zIndex: 401,
          overflow: "hidden",
          maxHeight: "76vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* ── 검색 인풋 ── */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "16px 20px",
          borderBottom: `1px solid ${T.border}`,
          background: T.bgRaised,
        }}>
          <span style={{ fontSize: 18, color: query ? T.violet : T.textHint, transition: "color 0.2s", flexShrink: 0 }}>
            🔍
          </span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="제품 검색... (UI Kit, 템플릿, 아이콘...)"
            style={{
              flex: 1, border: "none", outline: "none",
              background: "transparent", color: T.text,
              fontSize: 16, fontFamily: "inherit",
              caretColor: T.violet,
            }}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              style={{
                width: 24, height: 24, borderRadius: 7, flexShrink: 0,
                border: `1px solid ${T.border}`, background: T.bgSubtle,
                color: T.textHint, fontSize: 12, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >✕</button>
          )}
          <div style={{
            fontSize: 11, color: T.textHint, fontFamily: S.mono,
            background: T.bgSubtle, border: `1px solid ${T.border}`,
            padding: "3px 8px", borderRadius: 6, flexShrink: 0, whiteSpace: "nowrap",
          }}>Esc</div>
        </div>

        {/* ── 스크롤 영역 ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "10px 0" }}>

          {/* 검색 결과 */}
          {query.trim() ? (
            results.length > 0 ? (
              <>
                <div style={{ fontSize: 10, color: T.textHint, fontFamily: S.mono, padding: "4px 18px 8px" }}>
                  // {results.length}개 결과
                </div>
                {results.map((p, i) => (
                  <ResultItem
                    key={p.id}
                    p={p}
                    query={query}
                    focused={i === focusIdx}
                    onClick={() => navigate(p)}
                  />
                ))}
                {/* 전체 결과 보기 */}
                <div style={{ padding: "12px 18px 4px" }}>
                  <Link
                    href={`/shop/products/?q=${encodeURIComponent(query)}`}
                    onClick={() => { saveRecent(query); onClose(); }}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "11px 16px", borderRadius: 12,
                      border: `1px solid ${T.border}`, background: T.bgRaised,
                      fontSize: 13, color: T.textSub, textDecoration: "none",
                      transition: "border-color 0.15s, color 0.15s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = T.violet; e.currentTarget.style.color = T.violet; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textSub; }}
                  >
                    <span>
                      <span style={{ color: T.violet, fontWeight: 700, fontFamily: S.mono }}>"{query}"</span>
                      {" "}전체 결과 보기
                    </span>
                    <span style={{ fontFamily: S.mono, fontSize: 11 }}>→</span>
                  </Link>
                </div>
              </>
            ) : (
              <div style={{ padding: "48px 0", textAlign: "center" }}>
                <div style={{ fontSize: 32, fontFamily: S.mono, color: T.textHint, marginBottom: 14 }}>// 404</div>
                <div style={{ fontSize: 14, color: T.textSub, marginBottom: 6 }}>
                  <span style={{ color: T.violet, fontFamily: S.mono }}>"{query}"</span>에 대한 결과가 없어요
                </div>
                <div style={{ fontSize: 12, color: T.textHint, fontFamily: S.mono }}>
                  // 다른 키워드로 검색해보세요
                </div>
                {/* 추천 */}
                <div style={{ marginTop: 20, display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                  {HOT_KEYWORDS.slice(0, 4).map(w => (
                    <button
                      key={w}
                      onClick={() => searchKeyword(w)}
                      style={{
                        fontSize: 12, padding: "5px 12px", borderRadius: 8,
                        border: `1px solid ${T.border}`, background: T.bgSubtle,
                        color: T.textSub, cursor: "pointer", fontFamily: S.mono,
                      }}
                    >{w}</button>
                  ))}
                </div>
              </div>
            )
          ) : (
            <>
              {/* 최근 검색어 */}
              {recent.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "4px 18px 10px", fontSize: 11, fontFamily: S.mono,
                  }}>
                    <span style={{ color: T.textHint }}>// 최근 검색어</span>
                    <button
                      onClick={handleClearRecent}
                      style={{ fontSize: 11, color: T.textHint, background: "none", border: "none", cursor: "pointer", fontFamily: S.mono }}
                    >전체 삭제</button>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7, padding: "0 18px" }}>
                    {recent.map(word => (
                      <div
                        key={word}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 6,
                          padding: "5px 10px 5px 12px", borderRadius: 20,
                          border: `1px solid ${T.border}`, background: T.bgRaised,
                          cursor: "pointer", transition: "border-color 0.15s",
                        }}
                        onClick={() => searchKeyword(word)}
                        onMouseEnter={e => e.currentTarget.style.borderColor = T.violet}
                        onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
                      >
                        <span style={{ fontSize: 12, color: T.textSub }}>
                          <span style={{ color: T.textHint, marginRight: 4, fontFamily: S.mono }}>↺</span>
                          {word}
                        </span>
                        <button
                          onClick={e => handleRemoveRecent(e, word)}
                          style={{
                            width: 16, height: 16, borderRadius: 4, border: "none",
                            background: "transparent", color: T.textHint,
                            fontSize: 11, cursor: "pointer", display: "flex",
                            alignItems: "center", justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 인기 검색어 */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: T.textHint, fontFamily: S.mono, padding: "4px 18px 10px" }}>
                  // 인기 검색어
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7, padding: "0 18px" }}>
                  {HOT_KEYWORDS.map((word, i) => (
                    <button
                      key={word}
                      onClick={() => searchKeyword(word)}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 7,
                        padding: "6px 14px", borderRadius: 20,
                        border: `1px solid ${T.border}`, background: T.bgRaised,
                        fontSize: 12.5, color: T.textSub, cursor: "pointer",
                        fontFamily: i < 3 ? S.mono : "inherit",
                        transition: "border-color 0.15s, color 0.15s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = T.violet; e.currentTarget.style.color = T.violet; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textSub; }}
                    >
                      {i < 3 && (
                        <span style={{ fontSize: 10, fontWeight: 800, color: i === 0 ? T.red : i === 1 ? T.amber : T.green, fontFamily: S.mono }}>
                          {i + 1}
                        </span>
                      )}
                      {word}
                    </button>
                  ))}
                </div>
              </div>

              {/* 카테고리 빠른 이동 */}
              <div>
                <div style={{ fontSize: 11, color: T.textHint, fontFamily: S.mono, padding: "4px 18px 10px" }}>
                  // 카테고리
                </div>
                <div style={{ padding: "0 10px" }}>
                  {Object.entries(CAT_COLOR).map(([cat, color]) => (
                    <Link
                      key={cat}
                      href={`/shop/products/?cat=${encodeURIComponent(cat)}`}
                      onClick={onClose}
                      style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "10px 12px", borderRadius: 10,
                        textDecoration: "none",
                        transition: "background 0.12s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = T.bgRaised}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <div style={{
                        width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                        background: `${color}18`, border: `1px solid ${color}30`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 15, color, fontFamily: S.mono, fontWeight: 700,
                      }}>
                        {cat === "UI Kit" ? "⬡" : cat === "템플릿" ? "⚡" : cat === "플러그인" ? "◎" : cat === "아이콘" ? "◇" : "Aa"}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{cat}</div>
                        <div style={{ fontSize: 11, color: T.textHint, fontFamily: S.mono }}>
                          {VISIBLE.filter(p => p.cat === cat).length}개 제품
                        </div>
                      </div>
                      <span style={{ fontSize: 12, color: T.textHint, fontFamily: S.mono }}>→</span>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── 하단 힌트 바 ── */}
        <div style={{
          display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
          padding: "10px 20px",
          borderTop: `1px solid ${T.border}`,
          background: T.bgRaised,
          fontSize: 11, color: T.textHint, fontFamily: S.mono,
        }}>
          {[
            ["↵", "선택"],
            ["↑↓", "이동"],
            ["Esc", "닫기"],
            ["Ctrl+K", "열기"],
          ].map(([key, label]) => (
            <span key={key} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <kbd style={{
                background: T.bgSubtle, border: `1px solid ${T.border}`,
                borderRadius: 5, padding: "2px 7px", fontSize: 10, fontFamily: S.mono,
                color: T.textSub,
              }}>{key}</kbd>
              {label}
            </span>
          ))}
          <span style={{ marginLeft: "auto" }}>
            {results.length > 0 && `${results.length}개 결과`}
          </span>
        </div>
      </div>
    </>
  );
}