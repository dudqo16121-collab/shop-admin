"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { T, S, CAT_TINT_V2 } from "../../../components/shop/theme";
import { useAuth } from "../../../lib/auth";
import { PRODUCTS, fmtWon, getOptions } from "../../../lib/store-data";

// ── 카테고리별 메타 ──────────────────────────────────────────
const CAT_COLOR = {
  "UI Kit":   "#6366F1",
  "템플릿":   "#10B981",
  "플러그인": "#F59E0B",
  "아이콘":   "#EC4899",
  "폰트":     "#8B5CF6",
};

// ── 목업 라이선스 데이터 ─────────────────────────────────────
const MOCK_LICENSES = [
  {
    key: "SA-0001-TEA-A3F9B2C1",
    productId: 1,
    license: "Team",
    version: "v3.2.1",
    purchasedAt: "2026-05-10",
    expiresAt: null, // null = 영구
    status: "active",
    downloads: 3,
    maxDownloads: null,
    changelog: [
      { ver: "v3.2.1", date: "2026-05-15", note: "버그 수정 · 번들 사이즈 12% 감소" },
      { ver: "v3.2.0", date: "2026-04-28", note: "신규 컴포넌트 12개 · Tailwind v4 지원" },
      { ver: "v3.1.0", date: "2026-03-10", note: "Vue 3 지원 · 접근성 개선" },
    ],
  },
  {
    key: "SA-0003-COM-D7E4F0A8",
    productId: 3,
    license: "Commercial",
    version: "v2.1.0",
    purchasedAt: "2026-04-28",
    expiresAt: null,
    status: "active",
    downloads: 1,
    maxDownloads: null,
    changelog: [
      { ver: "v2.1.0", date: "2026-05-01", note: "Stripe v4 API 업데이트 · 결제 플로우 개선" },
      { ver: "v2.0.0", date: "2026-04-01", note: "Next.js 14 App Router 전환 · Supabase v2" },
    ],
  },
  {
    key: "SA-0010-SIN-B2C8D3E1",
    productId: 10,
    license: "Single",
    version: "v1.0.2",
    purchasedAt: "2026-03-15",
    expiresAt: null,
    status: "active",
    downloads: 2,
    maxDownloads: null,
    changelog: [
      { ver: "v1.0.2", date: "2026-04-10", note: "한글 글리프 추가 · 힌팅 개선" },
      { ver: "v1.0.1", date: "2026-03-20", note: "WOFF2 압축률 개선" },
    ],
  },
];

// ── 라이선스 키 마스킹 ───────────────────────────────────────
function maskKey(key) {
  const parts = key.split("-");
  return parts.map((p, i) => i === parts.length - 1 ? "••••••••" : p).join("-");
}

// ── 복사 버튼 ────────────────────────────────────────────────
function CopyBtn({ text, style }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    try { navigator.clipboard.writeText(text); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button
      onClick={copy}
      style={{
        fontSize: 11, fontWeight: 700, fontFamily: S.mono,
        padding: "4px 10px", borderRadius: 6, cursor: "pointer",
        border: `1px solid ${copied ? T.green : T.border}`,
        background: copied ? T.greenBg : T.bgSubtle,
        color: copied ? T.green : T.textHint,
        transition: "all 0.2s", whiteSpace: "nowrap",
        ...style,
      }}
    >
      {copied ? "✓ copied" : "copy"}
    </button>
  );
}

// ── 탭 ──────────────────────────────────────────────────────
const TABS = ["all", ...Object.keys(CAT_COLOR)];

// ── 메인 ────────────────────────────────────────────────────
export default function LicensesPage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [licenses, setLicenses] = useState([]);
  const [tab, setTab] = useState("all");
  const [sort, setSort] = useState("newest");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null); // 펼친 라이선스 key
  const [showKey, setShowKey] = useState({}); // 키 표시 여부
  const searchRef = useRef(null);

  useEffect(() => {
    if (!isLoggedIn) { router.push("/shop/login/"); return; }
    // localStorage 주문 + 목업 병합
    try {
      const raw = localStorage.getItem("shop:orders");
      const orders = raw ? JSON.parse(raw) : [];
      const fromOrders = orders.flatMap(o =>
        (o.items || []).map(it => {
          const p = PRODUCTS.find(p => p.id === it.id);
          if (!p) return null;
          return {
            key: `SA-${String(it.id).padStart(4,"0")}-${(it.opt||"SIN").slice(0,3).toUpperCase()}-${Math.random().toString(36).slice(2,10).toUpperCase()}`,
            productId: it.id,
            license: it.opt || getOptions(p.cat)[0],
            version: "v1.0.0",
            purchasedAt: o.date?.slice(0,10) || "2026-01-01",
            expiresAt: null,
            status: "active",
            downloads: 1,
            maxDownloads: null,
            changelog: [{ ver: "v1.0.0", date: o.date?.slice(0,10) || "2026-01-01", note: "최초 릴리즈" }],
          };
        }).filter(Boolean)
      );
      // 중복 제거 (productId 기준)
      const existIds = new Set(MOCK_LICENSES.map(l => l.productId));
      const merged = [...MOCK_LICENSES, ...fromOrders.filter(l => !existIds.has(l.productId))];
      setLicenses(merged);
    } catch {
      setLicenses(MOCK_LICENSES);
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) return null;

  // 필터 + 정렬
  const filtered = licenses
    .filter(l => {
      const p = PRODUCTS.find(pr => pr.id === l.productId);
      if (!p) return false;
      if (tab !== "all" && p.cat !== tab) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !l.key.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === "newest") return new Date(b.purchasedAt) - new Date(a.purchasedAt);
      if (sort === "oldest") return new Date(a.purchasedAt) - new Date(b.purchasedAt);
      if (sort === "name") {
        const pa = PRODUCTS.find(p => p.id === a.productId)?.name || "";
        const pb = PRODUCTS.find(p => p.id === b.productId)?.name || "";
        return pa.localeCompare(pb);
      }
      return 0;
    });

  return (
    <div style={{ ...S.wrap, paddingTop: 40, paddingBottom: 60 }}>

      {/* ── 페이지 헤더 ── */}
      <div className="sh-fadeup" style={{ marginBottom: 32 }}>
        <div style={S.eyebrow}>// Licenses</div>
        <h1 style={{ fontSize: "clamp(26px,4vw,42px)", fontWeight: 800, letterSpacing: "-0.035em", color: T.text, margin: "8px 0 6px" }}>
          라이선스 관리
        </h1>
        <p style={{ fontSize: 13, color: T.textHint, fontFamily: S.mono }}>
          // {licenses.length}개의 라이선스 · 결제 즉시 영구 소유
        </p>
      </div>

      {/* ── KPI ── */}
      <div className="sh-fadeup" style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 12, marginBottom: 28, animationDelay: "60ms" }}>
        {[
          { icon: "⬡", label: "전체 라이선스", value: `${licenses.length}개`, color: T.violet },
          { icon: "✓", label: "활성 라이선스", value: `${licenses.filter(l => l.status === "active").length}개`, color: T.green },
          { icon: "↓", label: "총 다운로드", value: `${licenses.reduce((a,l) => a+l.downloads,0)}회`, color: "#F59E0B" },
          { icon: "⟳", label: "업데이트 가능", value: `${licenses.filter(l => l.changelog?.length > 1).length}개`, color: "#EC4899" },
        ].map(s => (
          <div key={s.label} style={{
            background: T.bgCard, border: `1px solid ${T.border}`,
            borderRadius: 14, padding: "16px 18px",
            borderTop: `3px solid ${s.color}`,
          }}>
            <div style={{ fontSize: 11, color: T.textHint, fontFamily: S.mono, marginBottom: 7 }}>
              <span style={{ color: s.color, marginRight: 5 }}>{s.icon}</span>{s.label}
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: T.text, fontFamily: S.mono }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* ── 필터 바 ── */}
      <div className="sh-fadeup" style={{ animationDelay: "100ms", marginBottom: 20 }}>
        {/* 카테고리 탭 */}
        <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="sh-chip"
              style={{
                height: 34, padding: "0 14px", borderRadius: 8,
                border: `1.5px solid ${tab === t ? T.violet : T.borderMid}`,
                background: tab === t ? T.violetBg : T.bgRaised,
                color: tab === t ? T.violet : T.textSub,
                fontSize: 12, fontWeight: 700, cursor: "pointer",
                fontFamily: S.mono,
              }}
            >
              {t === "all" ? "// all" : t}
            </button>
          ))}
        </div>

        {/* 검색 + 정렬 */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{
            flex: 1, height: 40, borderRadius: 10,
            border: `1.5px solid ${T.border}`, background: T.bgRaised,
            display: "flex", alignItems: "center", gap: 10, padding: "0 14px",
          }}>
            <span style={{ fontSize: 13, color: T.textHint }}>🔍</span>
            <input
              ref={searchRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="제품명 또는 라이선스 키 검색..."
              style={{
                flex: 1, border: "none", outline: "none",
                background: "transparent", color: T.text,
                fontSize: 13, fontFamily: "inherit",
              }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ border: "none", background: "none", color: T.textHint, cursor: "pointer", fontSize: 14 }}>✕</button>
            )}
          </div>
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            style={{
              height: 40, padding: "0 12px", borderRadius: 10,
              border: `1.5px solid ${T.borderMid}`, background: T.bgRaised,
              color: T.text, fontSize: 13, fontWeight: 600, cursor: "pointer", outline: "none",
              fontFamily: S.mono,
            }}
          >
            <option value="newest">최신순</option>
            <option value="oldest">오래된순</option>
            <option value="name">이름순</option>
          </select>
        </div>
      </div>

      {/* ── 라이선스 목록 ── */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <div style={{ fontSize: 36, fontFamily: S.mono, color: T.textHint, marginBottom: 14 }}>// 404</div>
          <div style={{ fontSize: 14, color: T.textSub }}>조건에 맞는 라이선스가 없어요</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((l, idx) => {
            const p = PRODUCTS.find(pr => pr.id === l.productId);
            if (!p) return null;
            const color = CAT_COLOR[p.cat] || T.violet;
            const isOpen = expanded === l.key;
            const keyVisible = showKey[l.key];

            return (
              <div
                key={l.key}
                className="sh-glow-card sh-fadeup"
                style={{
                  animationDelay: `${Math.min(idx, 5) * 60}ms`,
                  background: T.bgCard, border: `1px solid ${T.border}`,
                  borderRadius: 16, overflow: "hidden",
                  borderLeft: `3px solid ${color}`,
                }}
              >
                {/* ── 라이선스 메인 행 ── */}
                <div style={{ padding: "18px 22px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>

                  {/* 썸네일 */}
                  <div style={{
                    width: 56, height: 56, borderRadius: 14, flexShrink: 0,
                    background: CAT_TINT_V2[p.cat],
                    border: `1px solid ${T.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 28, fontFamily: S.mono, color,
                  }}>
                    {p.thumb}
                  </div>

                  {/* 제품 정보 */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 5 }}>
                      <Link href={`/shop/products/${p.id}/`} style={{ fontSize: 15, fontWeight: 800, color: T.text, textDecoration: "none" }}>
                        {p.name}
                      </Link>
                      <span style={{
                        fontSize: 10, padding: "2px 8px", borderRadius: 5, fontFamily: S.mono, fontWeight: 700,
                        background: `${color}18`, color, border: `1px solid ${color}40`,
                      }}>{l.license}</span>
                      <span style={{
                        fontSize: 10, padding: "2px 8px", borderRadius: 5, fontFamily: S.mono, fontWeight: 700,
                        background: T.greenBg, color: T.green, border: `1px solid ${T.green}40`,
                      }}>active</span>
                      <span style={{
                        fontSize: 10, padding: "2px 8px", borderRadius: 5, fontFamily: S.mono,
                        background: T.bgSubtle, color: T.textHint, border: `1px solid ${T.border}`,
                      }}>{l.version}</span>
                    </div>
                    <div style={{ fontSize: 11, color: T.textHint, fontFamily: S.mono }}>
                      구매일: {l.purchasedAt}
                      {" · "}만료: <span style={{ color: T.green }}>영구</span>
                      {" · "}다운로드: {l.downloads}회
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div style={{ display: "flex", gap: 8, flexShrink: 0, alignItems: "center" }}>
                    <button
                      className="sh-btn"
                      style={{
                        height: 36, padding: "0 14px", borderRadius: 9,
                        background: `${color}18`, border: `1px solid ${color}30`,
                        color, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: S.mono,
                      }}
                    >
                      ↓ 다운로드
                    </button>
                    <button
                      onClick={() => setExpanded(isOpen ? null : l.key)}
                      style={{
                        height: 36, padding: "0 14px", borderRadius: 9,
                        border: `1px solid ${T.border}`, background: T.bgSubtle,
                        color: T.textSub, fontSize: 12, fontWeight: 600, cursor: "pointer",
                        fontFamily: S.mono, transition: "all 0.15s",
                      }}
                    >
                      {isOpen ? "접기 ▲" : "상세 ▼"}
                    </button>
                  </div>
                </div>

                {/* ── 라이선스 키 영역 ── */}
                <div style={{
                  borderTop: `1px solid ${T.border}`,
                  background: "#0D0D14",
                  padding: "12px 22px",
                  display: "flex", alignItems: "center", gap: 12,
                }}>
                  <span style={{ fontSize: 10, color: T.textHint, fontFamily: S.mono, flexShrink: 0 }}>
                    // license_key
                  </span>
                  <code style={{
                    flex: 1, fontSize: 12.5, fontFamily: S.mono,
                    color, letterSpacing: "0.06em",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {keyVisible ? l.key : maskKey(l.key)}
                  </code>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button
                      onClick={() => setShowKey(prev => ({ ...prev, [l.key]: !prev[l.key] }))}
                      style={{
                        fontSize: 11, fontWeight: 700, fontFamily: S.mono,
                        padding: "4px 10px", borderRadius: 6, cursor: "pointer",
                        border: `1px solid ${T.border}`, background: T.bgSubtle,
                        color: T.textHint, whiteSpace: "nowrap",
                      }}
                    >
                      {keyVisible ? "숨기기" : "표시"}
                    </button>
                    <CopyBtn text={l.key} />
                  </div>
                </div>

                {/* ── 펼쳐지는 상세 패널 ── */}
                {isOpen && (
                  <div style={{ borderTop: `1px solid ${T.border}` }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>

                      {/* 좌: 라이선스 정보 */}
                      <div style={{ padding: "20px 22px", borderRight: `1px solid ${T.border}` }}>
                        <div style={{ fontSize: 11, color: T.textHint, fontFamily: S.mono, marginBottom: 14 }}>
                          // license.info
                        </div>
                        {[
                          { label: "제품명", value: p.name },
                          { label: "카테고리", value: p.cat },
                          { label: "라이선스 타입", value: l.license },
                          { label: "현재 버전", value: l.version },
                          { label: "구매일", value: l.purchasedAt },
                          { label: "만료일", value: "영구 (평생)" },
                          { label: "허용 프로젝트", value: l.license === "Team" || l.license === "Commercial" || l.license === "Extended" ? "무제한" : "1개" },
                          { label: "상업적 사용", value: l.license === "Commercial" || l.license === "Extended" ? "✓ 가능" : "✗ 불가" },
                        ].map(row => (
                          <div key={row.label} style={{
                            display: "flex", justifyContent: "space-between", gap: 10,
                            fontSize: 12.5, padding: "8px 0",
                            borderBottom: `1px solid ${T.border}`,
                          }}>
                            <span style={{ color: T.textHint, fontFamily: S.mono }}>// {row.label}</span>
                            <span style={{
                              fontWeight: 600, color: row.value.startsWith("✓") ? T.green : row.value.startsWith("✗") ? T.red : T.text,
                            }}>{row.value}</span>
                          </div>
                        ))}
                      </div>

                      {/* 우: 업데이트 내역 */}
                      <div style={{ padding: "20px 22px" }}>
                        <div style={{ fontSize: 11, color: T.textHint, fontFamily: S.mono, marginBottom: 14 }}>
                          // changelog
                        </div>
                        {(l.changelog || []).map((log, i) => (
                          <div key={i} style={{
                            display: "flex", gap: 0,
                            paddingLeft: 0,
                          }}>
                            {/* 타임라인 */}
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginRight: 14, flexShrink: 0 }}>
                              <div style={{
                                width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                                background: i === 0 ? `${color}20` : T.bgSubtle,
                                border: `1px solid ${i === 0 ? color : T.border}30`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 10, color: i === 0 ? color : T.textHint,
                                fontFamily: S.mono, fontWeight: 700,
                                marginTop: i === 0 ? 0 : 0,
                              }}>
                                {i === 0 ? "●" : "○"}
                              </div>
                              {i < (l.changelog?.length || 0) - 1 && (
                                <div style={{ width: 1, flex: 1, background: T.border, minHeight: 14, margin: "4px 0" }} />
                              )}
                            </div>
                            <div style={{ flex: 1, paddingBottom: i < (l.changelog?.length||0)-1 ? 14 : 0 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                <span style={{ fontSize: 12, fontWeight: 800, color: i === 0 ? color : T.text, fontFamily: S.mono }}>
                                  {log.ver}
                                </span>
                                {i === 0 && (
                                  <span style={{
                                    fontSize: 9, padding: "1px 7px", borderRadius: 4,
                                    background: `${color}20`, color, fontFamily: S.mono, fontWeight: 700,
                                  }}>latest</span>
                                )}
                                <span style={{ fontSize: 10, color: T.textHint, fontFamily: S.mono, marginLeft: "auto" }}>
                                  {log.date}
                                </span>
                              </div>
                              <div style={{ fontSize: 12, color: T.textSub, lineHeight: 1.6 }}>{log.note}</div>
                            </div>
                          </div>
                        ))}

                        {/* 다운로드 버튼 */}
                        <div style={{ marginTop: 18, display: "flex", gap: 8 }}>
                          <button className="sh-btn" style={{
                            ...S.btnPrimary, flex: 1, height: 40, borderRadius: 10,
                            fontSize: 13, justifyContent: "center",
                          }}>
                            ↓ {l.version} 다운로드
                          </button>
                          <Link href={`/shop/products/${p.id}/`} style={{
                            ...S.btnGhost, height: 40, padding: "0 14px", borderRadius: 10,
                            fontSize: 13, display: "inline-flex", alignItems: "center",
                            textDecoration: "none",
                          }}>
                            제품 상세
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── 안내 섹션 ── */}
      <div style={{
        marginTop: 40, background: T.bgCard, border: `1px solid ${T.border}`,
        borderRadius: 16, padding: "22px 24px",
      }}>
        <div style={{ fontSize: 11, color: T.textHint, fontFamily: S.mono, marginBottom: 14 }}>
          // license.faq
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          {[
            { icon: "↓", title: "다운로드 정책", desc: "구매한 라이선스는 무제한 다운로드가 가능합니다. 기기 제한 없이 사용하세요." },
            { icon: "⟳", title: "업데이트 정책", desc: "구매 후 모든 마이너·패치 업데이트는 무료로 제공됩니다." },
            { icon: "→", title: "라이선스 이전", desc: "라이선스 양도는 지원하지 않습니다. 팀 사용 시 Team 플랜을 구매하세요." },
          ].map(item => (
            <div key={item.title}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 14, color: T.violet, fontFamily: S.mono }}>{item.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{item.title}</span>
              </div>
              <p style={{ fontSize: 12.5, color: T.textSub, lineHeight: 1.7, margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}