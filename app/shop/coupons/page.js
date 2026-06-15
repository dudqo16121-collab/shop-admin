"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { T, S } from "../../../components/shop/theme";
import { useAuth } from "../../../lib/auth";
import { COUPONS, fmtWon, VISIBLE } from "../../../lib/store-data";

// ── 목업 유저 쿠폰 데이터 ────────────────────────────────────
const USER_COUPONS = [
  {
    code: "WELCOME5000",
    name: "신규 가입 축하 쿠폰",
    type: "fixed",
    value: 5000,
    min: 0,
    status: "available",  // available | used | expired
    issuedAt: "2026-01-01",
    expiresAt: "2026-12-31",
    usedAt: null,
    category: null,       // null = 전 상품
    source: "가입 혜택",
  },
  {
    code: "DEV20",
    name: "개발자 할인 20%",
    type: "percent",
    value: 20,
    min: 0,
    status: "available",
    issuedAt: "2026-01-01",
    expiresAt: "2026-12-31",
    usedAt: null,
    category: null,
    source: "프로모션",
  },
  {
    code: "UIKIT15",
    name: "UI Kit 전용 15% 할인",
    type: "percent",
    value: 15,
    min: 50000,
    status: "available",
    issuedAt: "2026-04-01",
    expiresAt: "2026-07-31",
    usedAt: null,
    category: "UI Kit",
    source: "이벤트",
  },
  {
    code: "REVIEW200",
    name: "리뷰 작성 감사 쿠폰",
    type: "fixed",
    value: 2000,
    min: 0,
    status: "available",
    issuedAt: "2026-05-08",
    expiresAt: "2026-08-08",
    usedAt: null,
    category: null,
    source: "리뷰 적립",
  },
  {
    code: "LAUNCH30",
    name: "런치 기념 30% 할인",
    type: "percent",
    value: 30,
    min: 0,
    status: "expired",
    issuedAt: "2026-01-01",
    expiresAt: "2026-03-31",
    usedAt: null,
    category: null,
    source: "프로모션",
  },
  {
    code: "FIRST5000",
    name: "첫 구매 할인 쿠폰",
    type: "fixed",
    value: 5000,
    min: 30000,
    status: "used",
    issuedAt: "2026-01-01",
    expiresAt: "2026-12-31",
    usedAt: "2026-03-15",
    category: null,
    source: "가입 혜택",
  },
];

// ── D-day 계산 ───────────────────────────────────────────────
function getDday(expiresAt) {
  const diff = Math.ceil((new Date(expiresAt) - new Date()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return { label: "만료됨", color: T.textHint };
  if (diff === 0) return { label: "오늘 만료", color: T.red };
  if (diff <= 7) return { label: `D-${diff}`, color: T.amber };
  if (diff <= 30) return { label: `D-${diff}`, color: "#F59E0B" };
  return { label: `D-${diff}`, color: T.textHint };
}

// ── 할인 텍스트 ──────────────────────────────────────────────
function discountText(c) {
  return c.type === "fixed" ? fmtWon(c.value) : `${c.value}%`;
}

// ── 복사 버튼 ────────────────────────────────────────────────
function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = (e) => {
    e.stopPropagation();
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
        transition: "all 0.2s", whiteSpace: "nowrap", flexShrink: 0,
      }}
    >
      {copied ? "✓ copied" : "copy"}
    </button>
  );
}

// ── 쿠폰 카드 ────────────────────────────────────────────────
function CouponCard({ c, onRegister }) {
  const dday = getDday(c.expiresAt);
  const isUsed = c.status === "used";
  const isExpired = c.status === "expired";
  const disabled = isUsed || isExpired;

  const sourceColor = {
    "가입 혜택": T.violet,
    "프로모션":  "#F59E0B",
    "이벤트":    "#EC4899",
    "리뷰 적립": T.green,
  }[c.source] || T.violet;

  // 적용 가능한 상품 수
  const applicableCount = c.category
    ? VISIBLE.filter(p => p.cat === c.category && p.price >= (c.min || 0)).length
    : VISIBLE.filter(p => p.price >= (c.min || 0)).length;

  return (
    <div style={{
      background: disabled ? T.bgCard : T.bgCard,
      border: `1px solid ${disabled ? T.border : T.borderMid}`,
      borderRadius: 18, overflow: "hidden",
      opacity: disabled ? 0.55 : 1,
      transition: "opacity 0.2s",
    }}>
      {/* ── 티켓 상단 ── */}
      <div style={{
        padding: "20px 22px 16px",
        borderBottom: `1px dashed ${T.border}`,
        background: disabled ? T.bgCard : `linear-gradient(135deg, ${T.bgCard}, ${T.bgRaised})`,
        position: "relative",
      }}>
        {/* 좌측 반원 */}
        <div style={{
          position: "absolute", left: -12, top: "50%", transform: "translateY(-50%)",
          width: 24, height: 24, borderRadius: "50%",
          background: T.bg, border: `1px solid ${T.border}`,
        }} />
        {/* 우측 반원 */}
        <div style={{
          position: "absolute", right: -12, top: "50%", transform: "translateY(-50%)",
          width: 24, height: 24, borderRadius: "50%",
          background: T.bg, border: `1px solid ${T.border}`,
        }} />

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div style={{ flex: 1 }}>
            {/* 출처 배지 */}
            <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 5,
                background: `${sourceColor}18`, color: sourceColor,
                border: `1px solid ${sourceColor}40`, fontFamily: S.mono,
              }}>{c.source}</span>
              {c.category && (
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 5,
                  background: T.violetBg, color: T.violet,
                  border: `1px solid ${T.violet}40`, fontFamily: S.mono,
                }}>{c.category} 전용</span>
              )}
              {isUsed && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 5, background: T.bgSubtle, color: T.textHint, fontFamily: S.mono, border: `1px solid ${T.border}` }}>사용완료</span>}
              {isExpired && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 5, background: T.redBg, color: T.red, fontFamily: S.mono, border: `1px solid ${T.red}40` }}>만료됨</span>}
            </div>

            {/* 할인 금액 (메인) */}
            <div style={{
              fontSize: "clamp(28px,4vw,40px)", fontWeight: 800, letterSpacing: "-0.04em",
              color: disabled ? T.textHint : T.violet, fontFamily: S.mono, lineHeight: 1, marginBottom: 6,
            }}>
              {discountText(c)} <span style={{ fontSize: "0.45em", fontWeight: 700, color: T.textHint }}>할인</span>
            </div>

            {/* 쿠폰명 */}
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 4 }}>{c.name}</div>

            {/* 조건 */}
            <div style={{ fontSize: 11, color: T.textHint, fontFamily: S.mono }}>
              {c.min > 0 ? `₩${c.min.toLocaleString()} 이상 구매 시` : "최소 구매금액 없음"}
            </div>
          </div>

          {/* D-day */}
          {!disabled && (
            <div style={{ textAlign: "center", flexShrink: 0 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: dday.color, fontFamily: S.mono }}>{dday.label}</div>
              <div style={{ fontSize: 10, color: T.textHint, fontFamily: S.mono, marginTop: 2 }}>{c.expiresAt}</div>
            </div>
          )}
          {isUsed && (
            <div style={{ fontSize: 12, color: T.textHint, fontFamily: S.mono, textAlign: "right", flexShrink: 0 }}>
              <div>사용일</div>
              <div style={{ color: T.textSub }}>{c.usedAt}</div>
            </div>
          )}
        </div>
      </div>

      {/* ── 티켓 하단 ── */}
      <div style={{ padding: "14px 22px", display: "flex", alignItems: "center", gap: 12 }}>
        {/* 쿠폰 코드 */}
        <div style={{
          flex: 1, display: "flex", alignItems: "center", gap: 10,
          background: "#0D0D14", borderRadius: 10,
          border: `1px solid ${T.border}`, padding: "8px 14px",
          overflow: "hidden",
        }}>
          <span style={{ fontSize: 10, color: T.textHint, fontFamily: S.mono, flexShrink: 0 }}>$</span>
          <code style={{
            fontSize: 14, fontWeight: 800, fontFamily: S.mono,
            color: disabled ? T.textHint : T.green,
            letterSpacing: "0.08em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {c.code}
          </code>
        </div>

        {!disabled && <CopyBtn text={c.code} />}

        {!disabled && (
          <Link
            href={`/shop/products/${c.category ? `?cat=${encodeURIComponent(c.category)}` : ""}`}
            className="sh-btn"
            style={{
              height: 36, padding: "0 14px", borderRadius: 9, flexShrink: 0,
              background: T.violetBg, border: `1px solid ${T.violet}40`,
              color: T.violet, fontSize: 12, fontWeight: 700,
              display: "inline-flex", alignItems: "center", gap: 5,
              textDecoration: "none", fontFamily: S.mono,
            }}
          >
            → 사용하기 <span style={{ fontSize: 10, color: T.textHint }}>({applicableCount}개 상품)</span>
          </Link>
        )}
      </div>
    </div>
  );
}

// ── 메인 ────────────────────────────────────────────────────
export default function CouponsPage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState("available");
  const [inputCode, setInputCode] = useState("");
  const [registerMsg, setRegisterMsg] = useState(null);
  const [coupons, setCoupons] = useState(USER_COUPONS);

  useEffect(() => {
    if (!isLoggedIn) router.push("/shop/login/");
  }, [isLoggedIn, router]);

  if (!isLoggedIn) return null;

  const tabs = [
    { id: "available", label: "사용 가능", count: coupons.filter(c => c.status === "available").length },
    { id: "used",      label: "사용 완료", count: coupons.filter(c => c.status === "used").length },
    { id: "expired",   label: "만료됨",    count: coupons.filter(c => c.status === "expired").length },
  ];

  const filtered = coupons.filter(c => c.status === tab);

  // 쿠폰 등록
  const registerCoupon = () => {
    const code = inputCode.trim().toUpperCase();
    if (!code) return;

    // 이미 보유 중
    if (coupons.find(c => c.code === code)) {
      setRegisterMsg({ type: "error", text: "이미 보유 중인 쿠폰이에요" });
      setTimeout(() => setRegisterMsg(null), 2500);
      return;
    }

    // COUPONS 데이터에서 찾기
    const found = COUPONS.find(c => c.code === code);
    if (!found) {
      setRegisterMsg({ type: "error", text: "존재하지 않는 쿠폰 코드예요" });
      setTimeout(() => setRegisterMsg(null), 2500);
      return;
    }

    if (found.expired) {
      setRegisterMsg({ type: "error", text: "이미 만료된 쿠폰이에요" });
      setTimeout(() => setRegisterMsg(null), 2500);
      return;
    }

    // 등록 성공
    const newCoupon = {
      ...found,
      status: "available",
      issuedAt: new Date().toISOString().slice(0, 10),
      expiresAt: "2026-12-31",
      usedAt: null,
      source: "직접 등록",
    };
    setCoupons(prev => [newCoupon, ...prev]);
    setInputCode("");
    setTab("available");
    setRegisterMsg({ type: "ok", text: `✓ ${found.name} 쿠폰이 등록됐어요!` });
    setTimeout(() => setRegisterMsg(null), 2500);
  };

  const available = coupons.filter(c => c.status === "available");
  const expiringSoon = available.filter(c => {
    const diff = Math.ceil((new Date(c.expiresAt) - new Date()) / (1000 * 60 * 60 * 24));
    return diff <= 30;
  });

  return (
    <div style={{ ...S.wrap, paddingTop: 40, paddingBottom: 60 }}>

      {/* 토스트 */}
      {registerMsg && (
        <div className="sh-toast" style={{
          position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)",
          zIndex: 300, padding: "12px 22px", borderRadius: 13,
          background: registerMsg.type === "ok"
            ? "linear-gradient(135deg, #6366F1, #8B5CF6)"
            : T.redBg,
          border: registerMsg.type === "error" ? `1px solid ${T.red}40` : "none",
          color: registerMsg.type === "ok" ? "#fff" : T.red,
          fontSize: 13, fontWeight: 700, whiteSpace: "nowrap",
          boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
        }}>
          {registerMsg.text}
        </div>
      )}

      {/* ── 헤더 ── */}
      <div className="sh-fadeup" style={{ marginBottom: 28 }}>
        <div style={S.eyebrow}>// Coupon Wallet</div>
        <h1 style={{ fontSize: "clamp(26px,4vw,42px)", fontWeight: 800, letterSpacing: "-0.035em", color: T.text, margin: "8px 0 6px" }}>
          쿠폰 지갑
        </h1>
        <p style={{ fontSize: 13, color: T.textHint, fontFamily: S.mono }}>
          // {available.length}개 사용 가능 · {expiringSoon.length}개 30일 내 만료 예정
        </p>
      </div>

      {/* ── KPI ── */}
      <div className="sh-fadeup" style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 12, marginBottom: 28, animationDelay: "60ms" }}>
        {[
          { icon: "🎫", label: "사용 가능", value: `${available.length}장`, color: T.violet },
          { icon: "⚠", label: "곧 만료",    value: `${expiringSoon.length}장`, color: T.amber },
          { icon: "✓", label: "사용 완료", value: `${coupons.filter(c=>c.status==="used").length}장`, color: T.green },
          { icon: "✕", label: "만료됨",    value: `${coupons.filter(c=>c.status==="expired").length}장`, color: T.textHint },
        ].map(s => (
          <div key={s.label} style={{
            background: T.bgCard, border: `1px solid ${T.border}`,
            borderRadius: 14, padding: "16px 18px",
            borderTop: `3px solid ${s.color}`,
          }}>
            <div style={{ fontSize: 11, color: T.textHint, fontFamily: S.mono, marginBottom: 6 }}>
              <span style={{ marginRight: 5 }}>{s.icon}</span>{s.label}
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: T.text, fontFamily: S.mono }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* ── 쿠폰 코드 등록 ── */}
      <div className="sh-fadeup" style={{
        animationDelay: "100ms",
        background: T.bgCard, border: `1px solid ${T.border}`,
        borderRadius: 16, padding: "20px 24px", marginBottom: 28,
      }}>
        <div style={{ fontSize: 12, color: T.textHint, fontFamily: S.mono, marginBottom: 14 }}>
          // register_coupon
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{
            flex: 1, height: 48, borderRadius: 11,
            border: `1.5px solid ${T.border}`, background: T.bgRaised,
            display: "flex", alignItems: "center", gap: 10, padding: "0 16px",
          }}>
            <span style={{ fontSize: 13, color: T.violet, fontFamily: S.mono, fontWeight: 700 }}>$</span>
            <input
              value={inputCode}
              onChange={e => setInputCode(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === "Enter" && registerCoupon()}
              placeholder="쿠폰 코드 입력 (예: DEV20)"
              style={{
                flex: 1, border: "none", outline: "none",
                background: "transparent", color: T.text,
                fontSize: 14, fontWeight: 700, fontFamily: S.mono,
                letterSpacing: "0.04em",
              }}
            />
          </div>
          <button
            onClick={registerCoupon}
            disabled={!inputCode.trim()}
            className="sh-btn"
            style={{ ...S.btnPrimary, height: 48, padding: "0 24px", borderRadius: 11, fontSize: 14 }}
          >
            등록하기
          </button>
        </div>

        {/* 사용 가능한 코드 힌트 */}
        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, color: T.textHint, fontFamily: S.mono }}>// 힌트:</span>
          {["WELCOME5000", "DEV20"].map(hint => (
            <button
              key={hint}
              onClick={() => setInputCode(hint)}
              style={{
                fontSize: 11, fontFamily: S.mono, fontWeight: 700,
                padding: "3px 10px", borderRadius: 6, cursor: "pointer",
                border: `1px solid ${T.border}`, background: T.bgSubtle,
                color: T.violet, transition: "border-color 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = T.violet}
              onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
            >
              {hint}
            </button>
          ))}
        </div>
      </div>

      {/* ── 만료 임박 알림 ── */}
      {expiringSoon.length > 0 && tab === "available" && (
        <div className="sh-fadeup" style={{
          animationDelay: "140ms",
          background: T.amberBg, border: `1px solid ${T.amber}40`,
          borderRadius: 12, padding: "13px 18px", marginBottom: 20,
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <span style={{ fontSize: 18 }}>⚠</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.amber }}>
              {expiringSoon.length}개 쿠폰이 30일 내에 만료돼요
            </div>
            <div style={{ fontSize: 11, color: T.textHint, fontFamily: S.mono, marginTop: 2 }}>
              // {expiringSoon.map(c => c.code).join(" · ")}
            </div>
          </div>
        </div>
      )}

      {/* ── 탭 ── */}
      <div style={{ display: "flex", borderBottom: `1px solid ${T.border}`, marginBottom: 24 }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              height: 42, padding: "0 20px",
              border: "none", background: "transparent",
              color: tab === t.id ? T.violet : T.textHint,
              fontSize: 13, fontWeight: tab === t.id ? 700 : 500,
              borderBottom: `2px solid ${tab === t.id ? T.violet : "transparent"}`,
              cursor: "pointer", fontFamily: S.mono,
              marginBottom: -1, transition: "color 0.15s",
              display: "flex", alignItems: "center", gap: 8,
            }}
          >
            {t.label}
            <span style={{
              fontSize: 11, padding: "1px 7px", borderRadius: 10,
              background: tab === t.id ? T.violetBg : T.bgSubtle,
              color: tab === t.id ? T.violet : T.textHint,
              fontWeight: 700,
            }}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* ── 쿠폰 목록 ── */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <div style={{ fontSize: 36, marginBottom: 14, fontFamily: S.mono, color: T.textHint }}>🎫</div>
          <div style={{ fontSize: 14, color: T.textSub, marginBottom: 6 }}>
            {tab === "available" ? "사용 가능한 쿠폰이 없어요" : tab === "used" ? "사용한 쿠폰이 없어요" : "만료된 쿠폰이 없어요"}
          </div>
          {tab === "available" && (
            <div style={{ fontSize: 12, color: T.textHint, fontFamily: S.mono }}>
              // 위 입력창에서 쿠폰 코드를 등록하세요
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px,1fr))", gap: 14 }}>
          {filtered.map((c, i) => (
            <div key={c.code} className="sh-fadeup" style={{ animationDelay: `${i * 60}ms` }}>
              <CouponCard c={c} />
            </div>
          ))}
        </div>
      )}

      {/* ── 안내 ── */}
      <div style={{
        marginTop: 40, background: T.bgCard, border: `1px solid ${T.border}`,
        borderRadius: 16, padding: "20px 24px",
      }}>
        <div style={{ fontSize: 11, color: T.textHint, fontFamily: S.mono, marginBottom: 14 }}>
          // coupon.policy
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          {[
            { icon: "⬡", title: "중복 사용 불가", desc: "쿠폰은 1회 주문당 1장만 사용할 수 있습니다." },
            { icon: "◎", title: "포인트 병행 사용", desc: "쿠폰과 포인트는 동시에 사용할 수 있습니다." },
            { icon: "◇", title: "환불 시 복원", desc: "쿠폰 사용 후 환불 시 쿠폰은 복원되지 않습니다." },
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