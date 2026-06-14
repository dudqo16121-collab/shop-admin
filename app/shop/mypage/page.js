"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { T, S } from "../../../components/shop/theme";
import { useAuth } from "../../../lib/auth";
import { fmtWon, PRODUCTS } from "../../../lib/store-data";

// ── 탭 ──────────────────────────────────────────────────────
const TABS = [
  { id: "overview",  icon: "◈", label: "overview.ts" },
  { id: "licenses",  icon: "⬡", label: "licenses.ts" },
  { id: "points",    icon: "◎", label: "points.ts" },
  { id: "orders",    icon: "▣", label: "orders.ts" },
  { id: "activity",  icon: "◇", label: "activity.ts" },
];

// ── 카테고리별 컬러 ──────────────────────────────────────────
const CAT_COLOR = {
  "UI Kit":   "#6366F1",
  "템플릿":   "#10B981",
  "플러그인": "#F59E0B",
  "아이콘":   "#EC4899",
  "폰트":     "#8B5CF6",
};

// ── 목업 구매 데이터 ─────────────────────────────────────────
const MOCK_ORDERS = [
  { no: "S24051001", date: "2026-05-10", items: [{ id: 1, name: "Nexus UI Kit", cat: "UI Kit", opt: "Team", price: 89000 }], total: 89000, coupon: null },
  { no: "S24042801", date: "2026-04-28", items: [{ id: 3, name: "DevLaunch SaaS 템플릿", cat: "템플릿", opt: "Commercial", price: 149000 }, { id: 7, name: "Lucide Dev Icons", cat: "아이콘", opt: "Single", price: 39000 }], total: 183200, coupon: "DEV20" },
  { no: "S24031501", date: "2026-03-15", items: [{ id: 10, name: "Geist Mono Extra", cat: "폰트", opt: "Single", price: 29000 }], total: 24000, coupon: "WELCOME5000" },
];

// ── 포인트 내역 ──────────────────────────────────────────────
const MOCK_POINTS = [
  { date: "2026-05-10", desc: "Nexus UI Kit 구매 적립",        delta: +890,   type: "earn" },
  { date: "2026-04-28", desc: "DevLaunch SaaS 템플릿 구매 적립", delta: +1832,  type: "earn" },
  { date: "2026-04-28", desc: "DEV20 쿠폰 추가 적립",           delta: +500,   type: "bonus" },
  { date: "2026-03-15", desc: "Geist Mono Extra 구매 적립",     delta: +240,   type: "earn" },
  { date: "2026-01-01", desc: "신규 가입 축하 포인트",           delta: +5000,  type: "bonus" },
  { date: "2026-03-01", desc: "포인트 사용 (할인 적용)",         delta: -3000,  type: "use" },
];

// ── 활동 내역 ────────────────────────────────────────────────
const MOCK_ACTIVITY = [
  { date: "2026-05-10 14:32", type: "purchase", icon: "↓", text: "Nexus UI Kit 구매 완료",           color: "#6366F1" },
  { date: "2026-05-08 09:14", type: "review",   icon: "★", text: "DevLaunch SaaS 템플릿 리뷰 작성",  color: "#F59E0B" },
  { date: "2026-04-28 18:05", type: "purchase", icon: "↓", text: "DevLaunch SaaS 템플릿 외 1건 구매", color: "#6366F1" },
  { date: "2026-04-20 11:22", type: "point",    icon: "◎", text: "포인트 3,000P 사용",               color: "#10B981" },
  { date: "2026-03-15 16:40", type: "purchase", icon: "↓", text: "Geist Mono Extra 구매 완료",        color: "#6366F1" },
  { date: "2026-03-10 10:00", type: "login",    icon: "→", text: "새로운 기기에서 로그인 (iPhone)",   color: "#94A3B8" },
  { date: "2026-01-01 00:00", type: "join",     icon: "⚡", text: "ShopAdmin.dev 가입 완료",          color: "#8B5CF6" },
];

// ── 유틸 컴포넌트 ────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color = T.violet, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: T.bgCard, border: `1px solid ${T.border}`,
        borderRadius: 14, padding: "18px 20px",
        borderTop: `3px solid ${color}`,
        cursor: onClick ? "pointer" : "default",
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
      onMouseEnter={e => { if (onClick) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.4)`; }}}
      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
    >
      <div style={{ fontSize: 11, color: T.textHint, fontFamily: S.mono, marginBottom: 8 }}>
        <span style={{ color, marginRight: 6 }}>{icon}</span>
        {label}
      </div>
      <div style={{ fontSize: 24, fontWeight: 800, color: T.text, fontFamily: S.mono, letterSpacing: "-0.03em", marginBottom: 4 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: T.textHint, fontFamily: S.mono }}>{sub}</div>}
    </div>
  );
}

function SectionHead({ eyebrow, title }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={S.eyebrow}>{eyebrow}</div>
      <h2 style={{ ...S.h2, fontSize: "clamp(18px,2.5vw,24px)", margin: "6px 0 0" }}>{title}</h2>
    </div>
  );
}

// ── 메인 ────────────────────────────────────────────────────
export default function MyPage() {
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState("overview");
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!isLoggedIn) { router.push("/shop/login/"); return; }
    // localStorage 주문 + 목업 병합
    try {
      const raw = localStorage.getItem("shop:orders");
      const local = raw ? JSON.parse(raw) : [];
      setOrders([...local, ...MOCK_ORDERS]);
    } catch {
      setOrders(MOCK_ORDERS);
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) return null;

  // ── 파생 데이터 ─────────────────────────────────────────
  const totalSpent    = orders.reduce((a, o) => a + (o.total || 0), 0);
  const totalPoint    = MOCK_POINTS.reduce((a, p) => a + p.delta, 0);
  const earnedPoint   = MOCK_POINTS.filter(p => p.delta > 0).reduce((a, p) => a + p.delta, 0);
  const usedPoint     = Math.abs(MOCK_POINTS.filter(p => p.delta < 0).reduce((a, p) => a + p.delta, 0));

  // 구매한 제품 목록 (라이선스)
  const licenses = orders.flatMap(o =>
    (o.items || []).map(it => ({
      ...it,
      orderedAt: o.date,
      orderNo: o.no,
      p: PRODUCTS.find(p => p.id === it.id),
    }))
  ).filter(l => l.p);

  return (
    <div style={{ ...S.wrap, paddingTop: 40, paddingBottom: 60 }}>

      {/* ── 프로필 헤더 ── */}
      <div className="sh-fadeup" style={{
        background: T.bgCard, border: `1px solid ${T.border}`,
        borderRadius: 20, padding: "28px 32px", marginBottom: 24,
        display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap",
        position: "relative", overflow: "hidden",
      }}>
        {/* 배경 글로우 */}
        <div style={{
          position: "absolute", top: -40, right: -40,
          width: 200, height: 200, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.1), transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* 아바타 */}
        <div style={{
          width: 72, height: 72, borderRadius: 18, flexShrink: 0,
          background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
          color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 30, fontWeight: 800, fontFamily: S.mono,
          boxShadow: "0 0 0 4px rgba(99,102,241,0.2)",
        }}>
          {user.avatar}
        </div>

        {/* 유저 정보 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 5 }}>
            <h1 style={{ fontSize: "clamp(20px,3vw,28px)", fontWeight: 800, color: T.text, margin: 0, letterSpacing: "-0.03em" }}>
              {user.name}
            </h1>
            <span style={{
              fontSize: 11, padding: "3px 10px", borderRadius: 6,
              background: T.violetBg, color: T.violet,
              border: `1px solid ${T.violet}40`, fontFamily: S.mono, fontWeight: 700,
            }}>
              {user.plan} Plan
            </span>
          </div>
          <div style={{ fontSize: 13, color: T.textHint, fontFamily: S.mono, marginBottom: 8 }}>
            {user.email}
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {[
              { label: "가입일", value: user.joinedAt || "2026-01-01" },
              { label: "구매", value: `${orders.length}건` },
              { label: "포인트", value: `${totalPoint.toLocaleString()}P` },
            ].map(s => (
              <div key={s.label} style={{ fontSize: 12, color: T.textSub }}>
                <span style={{ color: T.textHint, fontFamily: S.mono }}>// {s.label}: </span>
                <span style={{ fontWeight: 700, color: T.text }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 우측 버튼 */}
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <Link
            href="/shop/settings/"
            style={{
              height: 38, padding: "0 16px", borderRadius: 10,
              border: `1px solid ${T.borderMid}`, background: T.bgSubtle,
              color: T.textSub, fontSize: 13, fontWeight: 600,
              display: "inline-flex", alignItems: "center", gap: 6,
              textDecoration: "none", fontFamily: S.mono,
            }}
          >
            ⚙ 설정
          </Link>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "180px minmax(0,1fr)", gap: 20, alignItems: "start" }}>

        {/* ── 사이드 탭 ── */}
        <div style={{
          background: T.bgCard, border: `1px solid ${T.border}`,
          borderRadius: 14, overflow: "hidden",
          position: "sticky", top: 84,
        }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "12px 16px", border: "none",
                background: tab === t.id ? T.violetBg : "transparent",
                borderLeft: `3px solid ${tab === t.id ? T.violet : "transparent"}`,
                color: tab === t.id ? T.violet : T.textSub,
                fontSize: 12, fontWeight: tab === t.id ? 700 : 500,
                cursor: "pointer", textAlign: "left",
                fontFamily: S.mono,
                transition: "all 0.15s",
                borderBottom: `1px solid ${T.border}`,
              }}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── 콘텐츠 ── */}
        <div>

          {/* ━━ OVERVIEW ━━ */}
          {tab === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* KPI 카드 */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12 }}>
                <StatCard icon="↓" label="총 구매 금액" value={`₩${(totalSpent / 10000).toFixed(0)}만`} sub={`${orders.length}건 구매`} color={T.violet} onClick={() => setTab("orders")} />
                <StatCard icon="◎" label="보유 포인트" value={`${totalPoint.toLocaleString()}P`} sub={`≈ ${fmtWon(totalPoint)}`} color={T.green} onClick={() => setTab("points")} />
                <StatCard icon="⬡" label="보유 라이선스" value={`${licenses.length}개`} sub="활성 라이선스" color="#F59E0B" onClick={() => setTab("licenses")} />
                <StatCard icon="★" label="작성한 리뷰" value="2개" sub="평균 ★4.8" color="#EC4899" />
              </div>

              {/* 최근 구매 */}
              <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, overflow: "hidden" }}>
                <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: T.text }}>최근 구매</div>
                  <button onClick={() => setTab("orders")} style={{ fontSize: 12, color: T.violet, background: "none", border: "none", cursor: "pointer", fontFamily: S.mono }}>
                    전체 보기 →
                  </button>
                </div>
                {orders.slice(0, 3).map((o, i) => (
                  <div key={o.no} style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "14px 20px",
                    borderBottom: i < 2 ? `1px solid ${T.border}` : "none",
                  }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                      background: CAT_COLOR[o.items?.[0]?.cat] + "20",
                      border: `1px solid ${CAT_COLOR[o.items?.[0]?.cat]}30`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 16, fontFamily: S.mono,
                      color: CAT_COLOR[o.items?.[0]?.cat] || T.violet,
                    }}>↓</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {o.items?.map(it => it.name).join(", ")}
                      </div>
                      <div style={{ fontSize: 11, color: T.textHint, fontFamily: S.mono, marginTop: 2 }}>
                        {o.no} · {o.date}
                      </div>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: T.violet, fontFamily: S.mono, flexShrink: 0 }}>
                      {fmtWon(o.total)}
                    </div>
                  </div>
                ))}
              </div>

              {/* 포인트 요약 */}
              <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, overflow: "hidden" }}>
                <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: T.text }}>포인트 현황</div>
                  <button onClick={() => setTab("points")} style={{ fontSize: 12, color: T.violet, background: "none", border: "none", cursor: "pointer", fontFamily: S.mono }}>
                    내역 보기 →
                  </button>
                </div>
                <div style={{ padding: "20px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: T.border }}>
                  {[
                    { label: "보유", value: `${totalPoint.toLocaleString()}P`, color: T.violet },
                    { label: "적립", value: `+${earnedPoint.toLocaleString()}P`, color: T.green },
                    { label: "사용", value: `-${usedPoint.toLocaleString()}P`, color: T.red },
                  ].map(s => (
                    <div key={s.label} style={{ background: T.bgCard, padding: "14px 16px", textAlign: "center" }}>
                      <div style={{ fontSize: 11, color: T.textHint, fontFamily: S.mono, marginBottom: 6 }}>// {s.label}</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: s.color, fontFamily: S.mono }}>{s.value}</div>
                    </div>
                  ))}
                </div>
                {/* 포인트 만료 안내 */}
                <div style={{ padding: "12px 20px", background: T.amberBg, borderTop: `1px solid ${T.amber}20` }}>
                  <span style={{ fontSize: 12, color: T.amber, fontFamily: S.mono }}>
                    ⚠ 1,000P가 2026-12-31에 만료될 예정입니다
                  </span>
                </div>
              </div>

              {/* 활동 타임라인 (최근 3개) */}
              <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, overflow: "hidden" }}>
                <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: T.text }}>최근 활동</div>
                  <button onClick={() => setTab("activity")} style={{ fontSize: 12, color: T.violet, background: "none", border: "none", cursor: "pointer", fontFamily: S.mono }}>
                    전체 보기 →
                  </button>
                </div>
                <div style={{ padding: "8px 0" }}>
                  {MOCK_ACTIVITY.slice(0, 3).map((a, i) => (
                    <div key={i} style={{ display: "flex", gap: 14, padding: "11px 20px", borderBottom: i < 2 ? `1px solid ${T.border}` : "none" }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                        background: a.color + "18", border: `1px solid ${a.color}30`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 13, color: a.color, fontFamily: S.mono,
                      }}>{a.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, color: T.text, fontWeight: 500 }}>{a.text}</div>
                        <div style={{ fontSize: 11, color: T.textHint, fontFamily: S.mono, marginTop: 2 }}>{a.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ━━ LICENSES ━━ */}
          {tab === "licenses" && (
            <div>
              <SectionHead eyebrow="// my licenses" title="보유 라이선스" />
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {licenses.map((l, i) => {
                  const color = CAT_COLOR[l.cat] || T.violet;
                  return (
                    <div key={i} style={{
                      background: T.bgCard, border: `1px solid ${T.border}`,
                      borderRadius: 14, overflow: "hidden",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px" }}>
                        {/* 아이콘 */}
                        <div style={{
                          width: 50, height: 50, borderRadius: 13, flexShrink: 0,
                          background: color + "18", border: `1px solid ${color}30`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 24, fontFamily: S.mono, color,
                        }}>
                          {l.p?.thumb}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 14, fontWeight: 800, color: T.text }}>{l.name}</span>
                            <span style={{
                              fontSize: 10, padding: "2px 8px", borderRadius: 5,
                              background: color + "18", color, border: `1px solid ${color}40`,
                              fontFamily: S.mono, fontWeight: 700,
                            }}>{l.opt} License</span>
                            <span style={{
                              fontSize: 10, padding: "2px 8px", borderRadius: 5,
                              background: T.greenBg, color: T.green,
                              border: `1px solid ${T.green}40`,
                              fontFamily: S.mono, fontWeight: 700,
                            }}>active</span>
                          </div>
                          <div style={{ fontSize: 11, color: T.textHint, fontFamily: S.mono }}>
                            구매일: {l.orderedAt} · 주문번호: {l.orderNo}
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                          <button style={{
                            height: 34, padding: "0 14px", borderRadius: 8,
                            background: color + "18", border: `1px solid ${color}30`,
                            color, fontSize: 12, fontWeight: 700, cursor: "pointer",
                            fontFamily: S.mono,
                          }}>↓ 다운로드</button>
                          <Link href={`/shop/products/${l.id}/`} style={{
                            height: 34, padding: "0 14px", borderRadius: 8,
                            background: T.bgSubtle, border: `1px solid ${T.border}`,
                            color: T.textSub, fontSize: 12, fontWeight: 600,
                            display: "inline-flex", alignItems: "center",
                            textDecoration: "none",
                          }}>상세</Link>
                        </div>
                      </div>

                      {/* 라이선스 키 */}
                      <div style={{
                        borderTop: `1px solid ${T.border}`,
                        padding: "12px 20px",
                        background: "#0D0D14",
                        display: "flex", alignItems: "center", gap: 12,
                      }}>
                        <span style={{ fontSize: 10, color: T.textHint, fontFamily: S.mono, flexShrink: 0 }}>// license_key</span>
                        <code style={{
                          flex: 1, fontSize: 12, fontFamily: S.mono,
                          color: color, letterSpacing: "0.06em",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {`SA-${l.id.toString().padStart(4,"0")}-${l.opt.toUpperCase().slice(0,3)}-${Math.random().toString(36).slice(2,10).toUpperCase()}`}
                        </code>
                        <button style={{
                          fontSize: 11, color: T.textHint, background: T.bgSubtle,
                          border: `1px solid ${T.border}`, padding: "4px 10px", borderRadius: 6,
                          cursor: "pointer", fontFamily: S.mono, flexShrink: 0,
                        }}>copy</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ━━ POINTS ━━ */}
          {tab === "points" && (
            <div>
              <SectionHead eyebrow="// points.balance" title="포인트" />

              {/* 잔액 카드 */}
              <div style={{
                background: "linear-gradient(135deg, #0F0F1E, #13132A)",
                border: `1px solid ${T.violet}30`,
                borderRadius: 18, padding: "28px 32px", marginBottom: 20,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                flexWrap: "wrap", gap: 20, position: "relative", overflow: "hidden",
              }}>
                <div style={{ position: "absolute", top: "50%", left: "40%", transform: "translate(-50%,-50%)", width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.12), transparent 70%)", pointerEvents: "none" }} />
                <div style={{ position: "relative", zIndex: 1 }}>
                  <div style={{ fontSize: 11, color: T.textHint, fontFamily: S.mono, marginBottom: 8 }}>// current_balance</div>
                  <div style={{ fontSize: 48, fontWeight: 800, color: T.violet, fontFamily: S.mono, letterSpacing: "-0.04em", lineHeight: 1 }}>
                    {totalPoint.toLocaleString()}<span style={{ fontSize: 20, marginLeft: 6 }}>P</span>
                  </div>
                  <div style={{ fontSize: 13, color: T.textSub, marginTop: 8 }}>
                    현금 환산 약 <strong style={{ color: T.text }}>{fmtWon(totalPoint)}</strong>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12, position: "relative", zIndex: 1 }}>
                  {[
                    { label: "총 적립", value: `+${earnedPoint.toLocaleString()}P`, color: T.green },
                    { label: "총 사용", value: `-${usedPoint.toLocaleString()}P`, color: T.red },
                  ].map(s => (
                    <div key={s.label} style={{
                      background: "rgba(10,10,15,0.6)", backdropFilter: "blur(8px)",
                      border: `1px solid ${T.border}`, borderRadius: 12, padding: "14px 18px", textAlign: "center",
                    }}>
                      <div style={{ fontSize: 10, color: T.textHint, fontFamily: S.mono, marginBottom: 5 }}>{s.label}</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: s.color, fontFamily: S.mono }}>{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 적립 방법 */}
              <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14, padding: "16px 20px", marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.textHint, fontFamily: S.mono, marginBottom: 14 }}>
                  // how_to_earn
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                  {[
                    { icon: "↓", label: "구매 적립", desc: "결제금액의 1%", color: T.violet },
                    { icon: "★", label: "리뷰 작성", desc: "건당 +200P", color: "#F59E0B" },
                    { icon: "⚡", label: "이벤트", desc: "수시 지급", color: T.green },
                  ].map(item => (
                    <div key={item.label} style={{
                      background: T.bgRaised, border: `1px solid ${T.border}`,
                      borderRadius: 10, padding: "12px 14px", textAlign: "center",
                    }}>
                      <div style={{ fontSize: 20, fontFamily: S.mono, color: item.color, marginBottom: 6 }}>{item.icon}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 3 }}>{item.label}</div>
                      <div style={{ fontSize: 11, color: T.textHint, fontFamily: S.mono }}>{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 포인트 내역 */}
              <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden" }}>
                <div style={{ padding: "14px 20px", borderBottom: `1px solid ${T.border}` }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: T.textHint, fontFamily: S.mono }}>// transaction_history</div>
                </div>
                {MOCK_POINTS.map((p, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 14, padding: "13px 20px",
                    borderBottom: i < MOCK_POINTS.length - 1 ? `1px solid ${T.border}` : "none",
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                      background: p.type === "use" ? T.redBg : p.type === "bonus" ? T.greenBg : T.violetBg,
                      border: `1px solid ${p.type === "use" ? T.red : p.type === "bonus" ? T.green : T.violet}30`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontFamily: S.mono,
                      color: p.type === "use" ? T.red : p.type === "bonus" ? T.green : T.violet,
                    }}>
                      {p.type === "use" ? "−" : p.type === "bonus" ? "⚡" : "+"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: T.text, fontWeight: 500 }}>{p.desc}</div>
                      <div style={{ fontSize: 11, color: T.textHint, fontFamily: S.mono, marginTop: 2 }}>{p.date}</div>
                    </div>
                    <div style={{
                      fontSize: 15, fontWeight: 800, fontFamily: S.mono, flexShrink: 0,
                      color: p.delta > 0 ? T.green : T.red,
                    }}>
                      {p.delta > 0 ? "+" : ""}{p.delta.toLocaleString()}P
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ━━ ORDERS ━━ */}
          {tab === "orders" && (
            <div>
              <SectionHead eyebrow="// order.history" title="주문 내역" />
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {orders.map((o, idx) => (
                  <div key={o.no} style={{
                    background: T.bgCard, border: `1px solid ${T.border}`,
                    borderRadius: 14, overflow: "hidden",
                  }}>
                    {/* 주문 헤더 */}
                    <div style={{
                      display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
                      padding: "13px 18px", borderBottom: `1px solid ${T.border}`,
                      background: T.bgRaised,
                    }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: T.text, fontFamily: S.mono }}>{o.no}</span>
                      <span style={{
                        fontSize: 10, padding: "2px 8px", borderRadius: 5,
                        background: T.greenBg, color: T.green,
                        border: `1px solid ${T.green}40`, fontFamily: S.mono, fontWeight: 700,
                      }}>결제 완료</span>
                      {o.coupon && (
                        <span style={{
                          fontSize: 10, padding: "2px 8px", borderRadius: 5,
                          background: T.violetBg, color: T.violet,
                          border: `1px solid ${T.violet}40`, fontFamily: S.mono,
                        }}>🎫 {o.coupon}</span>
                      )}
                      <span style={{ marginLeft: "auto", fontSize: 11, color: T.textHint, fontFamily: S.mono }}>{o.date}</span>
                    </div>

                    {/* 주문 아이템 */}
                    <div>
                      {(o.items || []).map((it, i) => (
                        <div key={i} style={{
                          display: "flex", alignItems: "center", gap: 14, padding: "13px 18px",
                          borderBottom: i < (o.items?.length || 0) - 1 ? `1px solid ${T.border}` : "none",
                        }}>
                          <div style={{
                            width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                            background: (CAT_COLOR[it.cat] || T.violet) + "18",
                            border: `1px solid ${(CAT_COLOR[it.cat] || T.violet)}30`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 18, fontFamily: S.mono,
                            color: CAT_COLOR[it.cat] || T.violet,
                          }}>
                            {PRODUCTS.find(p => p.id === it.id)?.thumb || "◈"}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.name}</div>
                            <div style={{ fontSize: 11, color: T.textHint, fontFamily: S.mono, marginTop: 2 }}>
                              {it.opt} License · {it.cat}
                            </div>
                          </div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: T.text, flexShrink: 0 }}>{fmtWon(it.price)}</div>
                        </div>
                      ))}
                    </div>

                    {/* 합계 */}
                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "12px 18px", borderTop: `1px solid ${T.border}`,
                    }}>
                      <div style={{ fontSize: 12, color: T.textHint, fontFamily: S.mono }}>
                        // total
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: T.violet, fontFamily: S.mono }}>
                        {fmtWon(o.total)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ━━ ACTIVITY ━━ */}
          {tab === "activity" && (
            <div>
              <SectionHead eyebrow="// activity.log" title="활동 내역" />
              <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden" }}>
                {/* 타임라인 */}
                <div style={{ padding: "8px 0" }}>
                  {MOCK_ACTIVITY.map((a, i) => (
                    <div key={i} style={{
                      display: "flex", gap: 0, padding: "0 20px",
                    }}>
                      {/* 타임라인 라인 */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginRight: 16, flexShrink: 0 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                          background: a.color + "18", border: `1px solid ${a.color}30`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 14, color: a.color, fontFamily: S.mono,
                          marginTop: 12,
                        }}>{a.icon}</div>
                        {i < MOCK_ACTIVITY.length - 1 && (
                          <div style={{ width: 1, flex: 1, background: T.border, minHeight: 16, margin: "4px 0" }} />
                        )}
                      </div>

                      {/* 내용 */}
                      <div style={{
                        flex: 1, padding: "14px 0",
                        borderBottom: i < MOCK_ACTIVITY.length - 1 ? `1px solid ${T.border}` : "none",
                      }}>
                        <div style={{ fontSize: 13.5, color: T.text, fontWeight: 600, marginBottom: 4 }}>
                          {a.text}
                        </div>
                        <div style={{ fontSize: 11, color: T.textHint, fontFamily: S.mono }}>
                          {a.date}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}