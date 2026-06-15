"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { T, S } from "../../../components/shop/theme";
import { useAuth } from "../../../lib/auth";

// ── 비밀번호 강도 계산 ───────────────────────────────────────
function getPwStrength(pw) {
  if (!pw) return { score: 0, label: "", color: "transparent" };
  let score = 0;
  if (pw.length >= 8)              score++;
  if (/[A-Z]/.test(pw))           score++;
  if (/[0-9]/.test(pw))           score++;
  if (/[^A-Za-z0-9]/.test(pw))    score++;
  const map = [
    { label: "",         color: "transparent" },
    { label: "weak",     color: "#EF4444" },
    { label: "fair",     color: "#F59E0B" },
    { label: "good",     color: "#6366F1" },
    { label: "strong",   color: "#10B981" },
  ];
  return { score, ...map[score] };
}

// ── 인풋 컴포넌트 ────────────────────────────────────────────
function Input({ label, icon, type = "text", value, onChange, placeholder, hint, error }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        fontSize: 12, fontWeight: 700, color: T.textSub,
        fontFamily: S.mono, marginBottom: 7,
      }}>
        {label}
      </div>
      <div style={{ position: "relative" }}>
        {icon && (
          <span style={{
            position: "absolute", left: 14, top: "50%",
            transform: "translateY(-50%)",
            fontSize: 14, color: focused ? T.violet : T.textHint,
            fontFamily: S.mono, pointerEvents: "none",
            transition: "color 0.2s",
          }}>
            {icon}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          style={{
            width: "100%", height: 48, borderRadius: 10,
            border: `1.5px solid ${error ? T.red : focused ? T.violet : T.border}`,
            background: T.bgRaised, color: T.text,
            padding: `0 14px 0 ${icon ? "40px" : "14px"}`,
            fontSize: 14, outline: "none",
            boxSizing: "border-box", fontFamily: "inherit",
            boxShadow: focused
              ? `0 0 0 3px ${error ? T.redBg : T.violetBg}`
              : "none",
            transition: "border-color 0.2s, box-shadow 0.2s",
          }}
        />
      </div>
      {error && (
        <div style={{ fontSize: 11.5, color: T.red, marginTop: 5, fontFamily: S.mono }}>
          // {error}
        </div>
      )}
      {hint && !error && (
        <div style={{ fontSize: 11, color: T.textHint, marginTop: 5, fontFamily: S.mono }}>
          // {hint}
        </div>
      )}
    </div>
  );
}

// ── 체크박스 ─────────────────────────────────────────────────
function Checkbox({ checked, onChange, children }) {
  return (
    <label style={{
      display: "flex", alignItems: "flex-start", gap: 10,
      cursor: "pointer", fontSize: 13, color: T.textSub, lineHeight: 1.6,
    }}>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 1,
          border: `1.5px solid ${checked ? T.violet : T.borderMid}`,
          background: checked ? T.violet : "transparent",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.15s", cursor: "pointer",
        }}
      >
        {checked && <span style={{ color: "#fff", fontSize: 11, fontWeight: 800 }}>✓</span>}
      </div>
      <span>{children}</span>
    </label>
  );
}

// ── 단계별 진행 바 ───────────────────────────────────────────
function StepBar({ current, total }) {
  return (
    <div style={{ display: "flex", gap: 5, marginBottom: 32 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          flex: 1, height: 3, borderRadius: 2,
          background: i < current ? T.violet : i === current ? T.violet : T.border,
          opacity: i < current ? 1 : i === current ? 0.5 : 0.3,
          transition: "background 0.3s, opacity 0.3s",
        }} />
      ))}
    </div>
  );
}

// ── 메인 ────────────────────────────────────────────────────
export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [step, setStep] = useState(0); // 0: 계정 정보, 1: 추가 정보, 2: 완료
  const [loading, setLoading] = useState(false);

  // 폼 상태
  const [form, setForm] = useState({
    name: "", email: "", password: "", confirm: "",
    role: "", website: "", github: "",
    agreeTerms: false, agreeMarketing: false,
  });
  const [errors, setErrors] = useState({});

  const setF = (k) => (e) =>
    setForm(f => ({ ...f, [k]: typeof e === "boolean" ? e : e.target.value }));

  const pwStrength = getPwStrength(form.password);

  // ── Step 0 유효성 검사 ────────────────────────────────────
  const validateStep0 = () => {
    const e = {};
    if (!form.name.trim())            e.name = "이름을 입력해주세요";
    if (!form.email.includes("@"))    e.email = "올바른 이메일을 입력해주세요";
    if (form.password.length < 8)     e.password = "8자 이상 입력해주세요";
    if (form.password !== form.confirm) e.confirm = "비밀번호가 일치하지 않습니다";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Step 1 유효성 검사 ────────────────────────────────────
  const validateStep1 = () => {
    const e = {};
    if (!form.role) e.role = "직군을 선택해주세요";
    if (!form.agreeTerms) e.agreeTerms = "이용약관에 동의해주세요";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 0 && validateStep0()) setStep(1);
  };

const handleSubmit = () => {
  if (!validateStep1()) return;
  setLoading(true);
  setTimeout(() => {
    login({
      id: `usr_${Date.now()}`,
      name: form.name,
      email: form.email,
      avatar: form.name[0]?.toUpperCase() || "U",
      plan: "Free",
      joinedAt: new Date().toISOString().slice(0, 10),
      role: form.role,
      emailVerified: false,  // ← 미인증 상태로 가입
    });
    setLoading(false);
    setStep(2);  // 완료 화면으로
  }, 900);
};

  const ROLES = [
    { id: "frontend", label: "Frontend Dev", icon: "◈" },
    { id: "fullstack", label: "Full-stack Dev", icon: "⬡" },
    { id: "backend", label: "Backend Dev", icon: "▣" },
    { id: "designer", label: "UI/UX Designer", icon: "◎" },
    { id: "indie", label: "Indie Maker", icon: "⚡" },
    { id: "other", label: "Other", icon: "◇" },
  ];

  return (
    <div style={{
      minHeight: "100vh", display: "flex",
      background: T.bg,
    }}>

      {/* ── 좌: 비주얼 패널 ── */}
      <div
        className="sh-hero-bg"
        style={{
          flex: 1, display: "flex", flexDirection: "column",
          justifyContent: "center", padding: "60px 64px",
          borderRight: `1px solid ${T.border}`,
          position: "relative", overflow: "hidden",
        }}
      >
        {/* 워드마크 */}
        <Link href="/shop/" style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 56, textDecoration: "none" }}>
          <span style={{
            width: 34, height: 34, borderRadius: 10,
            background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
            color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, fontSize: 16,
          }}>S</span>
          <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.03em", color: T.text }}>
            ShopAdmin<span style={{ color: T.violet }}>.dev</span>
          </span>
        </Link>

        {/* 카피 */}
        <div style={{ marginBottom: 44 }}>
          <div style={{ ...S.eyebrow, marginBottom: 12 }}>// Join the community</div>
          <h1 style={{
            fontSize: "clamp(28px,3.5vw,46px)", fontWeight: 800,
            letterSpacing: "-0.04em", lineHeight: 1.12, color: T.text, margin: "0 0 14px",
          }}>
            더 빠르게 만들고<br />
            <span style={{
              background: "linear-gradient(135deg, #6366F1, #8B5CF6, #10B981)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              더 많이 출시하세요.
            </span>
          </h1>
          <p style={{ fontSize: 14, color: T.textSub, lineHeight: 1.78, maxWidth: 340 }}>
            5,000명 이상의 개발자·디자이너가 ShopAdmin.dev의
            프리미엄 리소스로 프로젝트를 완성하고 있습니다.
          </p>
        </div>

        {/* 혜택 리스트 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 44 }}>
          {[
            { icon: "↓", text: "구매 즉시 다운로드 · 영구 소유" },
            { icon: "⟳", text: "무제한 업데이트 · 14일 환불 보장" },
            { icon: "◈", text: "Figma 소스 파일 + TypeScript 타입 포함" },
            { icon: "⚡", text: "신규 가입 즉시 5,000 포인트 지급" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{
                width: 30, height: 30, borderRadius: 9,
                background: T.violetBg, border: `1px solid ${T.violet}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, color: T.violet, fontFamily: S.mono, flexShrink: 0,
              }}>{item.icon}</span>
              <span style={{ fontSize: 13.5, color: T.textSub }}>{item.text}</span>
            </div>
          ))}
        </div>

        {/* 가입자 아바타 */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex" }}>
            {["K", "L", "P", "C", "J"].map((av, i) => (
              <div key={i} style={{
                width: 32, height: 32, borderRadius: "50%",
                background: `hsl(${220 + i * 30}, 70%, 55%)`,
                border: `2px solid ${T.bg}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 800, color: "#fff",
                marginLeft: i > 0 ? -10 : 0,
                fontFamily: S.mono,
              }}>{av}</div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>5,000+ 개발자</div>
            <div style={{ fontSize: 11, color: T.textHint, fontFamily: S.mono }}>// 이미 사용 중</div>
          </div>
        </div>
      </div>

      {/* ── 우: 가입 폼 ── */}
      <div style={{
        width: "min(500px, 46vw)", minWidth: 360,
        display: "flex", flexDirection: "column",
        justifyContent: "center", padding: "60px 52px",
        background: T.bg,
      }}>

        {/* 완료 화면 */}
        {step === 2 ? (
          <div style={{ textAlign: "center" }}>
            <div
              className="sh-check"
              style={{
                width: 72, height: 72, borderRadius: "50%", margin: "0 auto 24px",
                background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                color: "#fff", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 30,
              }}
            >✓</div>
            <div style={{ ...S.eyebrow, marginBottom: 10 }}>// Welcome aboard</div>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: T.text, margin: "0 0 10px", letterSpacing: "-0.03em" }}>
              가입이 완료됐어요!
            </h2>
<p style={{ fontSize: 14, color: T.textSub, lineHeight: 1.75, marginBottom: 10 }}>
  {form.name}님, 환영합니다!<br />
  가입이 완료됐어요.
</p>
{/* 이메일 인증 안내 배너 */}
<div style={{
  background: T.amberBg, border: `1px solid ${T.amber}40`,
  borderRadius: 12, padding: "12px 16px", marginBottom: 22, textAlign: "left",
}}>
  <div style={{ fontSize: 12, fontWeight: 700, color: T.amber, marginBottom: 4 }}>
    📧 이메일 인증이 필요해요
  </div>
  <div style={{ fontSize: 12, color: T.textSub, lineHeight: 1.6, fontFamily: S.mono }}>
    // <span style={{ color: T.text }}>{form.email}</span>으로<br />
    // 인증 메일을 발송했어요. 인증 후 +5,000P 지급됩니다.
  </div>
</div>

            {/* 완료 코드 블록 */}
            <div style={{
              background: "#0D0D14", border: `1px solid ${T.border}`,
              borderRadius: 12, padding: "16px 18px", marginBottom: 28, textAlign: "left",
            }}>
              {[
                [{ t: "const ", c: "#C084FC" }, { t: "user", c: "#38BDF8" }, { t: " = {", c: "#94A3B8" }],
                [{ t: "  name:", c: "#94A3B8" }, { t: ` "${form.name}"`, c: "#86EFAC" }, { t: ",", c: "#94A3B8" }],
                [{ t: "  plan:", c: "#94A3B8" }, { t: ' "Free"', c: "#86EFAC" }, { t: ",", c: "#94A3B8" }],
                [{ t: "  points:", c: "#94A3B8" }, { t: " 5000", c: "#F97316" }, { t: ",", c: "#94A3B8" }],
                [{ t: "  status:", c: "#94A3B8" }, { t: ' "active"', c: "#10B981" }],
                [{ t: "}", c: "#94A3B8" }],
              ].map((line, li) => (
                <div key={li} style={{ fontFamily: S.mono, fontSize: 12, lineHeight: 1.9 }}>
                  {line.map((tok, ti) => (
                    <span key={ti} style={{ color: tok.c }}>{tok.t}</span>
                  ))}
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
{/* 이메일 인증 버튼 (메인 CTA) */}
<button
  onClick={() => router.push(`/shop/verify/?email=${encodeURIComponent(form.email)}`)}
  className="sh-btn"
  style={{ ...S.btnPrimary, width: "100%", height: 50, borderRadius: 12, fontSize: 15, justifyContent: "center" }}
>
  📧 이메일 인증하기 →
</button>

{/* 나중에 인증 (서브) */}
<button
  onClick={() => router.push("/shop/")}
  style={{
    width: "100%", height: 44, borderRadius: 12,
    border: `1px solid ${T.border}`, background: "transparent",
    color: T.textHint, fontSize: 13, cursor: "pointer",
    fontFamily: S.mono,
  }}
>
  // 나중에 인증하기
</button>
            </div>
          </div>
        ) : (
          <>
            {/* 폼 헤더 */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ ...S.eyebrow, marginBottom: 10 }}>// Create account</div>
              <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", color: T.text, margin: "0 0 6px" }}>
                {step === 0 ? "계정 만들기" : "추가 정보"}
              </h2>
              <p style={{ fontSize: 13, color: T.textHint, fontFamily: S.mono, margin: 0 }}>
                {step === 0
                  ? "이미 계정이 있으신가요? "
                  : "// 거의 다 왔어요! "}
                {step === 0 && (
                  <Link href="/shop/login/" style={{ color: T.violet, fontWeight: 700 }}>로그인</Link>
                )}
              </p>
            </div>

            {/* 진행 바 */}
            <StepBar current={step} total={2} />

            {/* ── Step 0: 계정 정보 ── */}
            {step === 0 && (
              <>
                {/* OAuth */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                  {[
                    {
                      label: "GitHub으로 가입",
                      bg: "#161B22", border: "#30363D",
                      icon: (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                        </svg>
                      ),
                    },
                    {
                      label: "Google로 가입",
                      bg: "#1A1A2E", border: T.borderMid,
                      icon: (
                        <svg width="18" height="18" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      ),
                    },
                  ].map(btn => (
                    <button
                      key={btn.label}
                      className="sh-btn"
                      onClick={() => {
                        login({
                          id: `usr_oauth_${Date.now()}`,
                          name: btn.label.includes("GitHub") ? "GitHub User" : "Google User",
                          email: btn.label.includes("GitHub") ? "github@shopadmin.dev" : "google@shopadmin.dev",
                          avatar: "G", plan: "Free",
                          joinedAt: new Date().toISOString().slice(0, 10),
                        });
                        setStep(2);
                      }}
                      style={{
                        width: "100%", height: 48, borderRadius: 10,
                        border: `1px solid ${btn.border}`,
                        background: btn.bg, color: T.text,
                        fontSize: 13.5, fontWeight: 600, cursor: "pointer",
                        display: "grid",
                        gridTemplateColumns: "24px 1fr 24px",
                        alignItems: "center", padding: "0 16px", gap: 10,
                      }}
                    >
                      <span style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {btn.icon}
                      </span>
                      <span style={{ textAlign: "center" }}>{btn.label}</span>
                      <span />
                    </button>
                  ))}
                </div>

                {/* 구분선 */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                  <div style={{ flex: 1, height: 1, background: T.border }} />
                  <span style={{ fontSize: 11, color: T.textHint, fontFamily: S.mono, whiteSpace: "nowrap" }}>
                    // or sign up with email
                  </span>
                  <div style={{ flex: 1, height: 1, background: T.border }} />
                </div>

                {/* 이메일 폼 */}
                <Input
                  label="// name"
                  icon="◈"
                  value={form.name}
                  onChange={setF("name")}
                  placeholder="홍길동"
                  error={errors.name}
                />
                <Input
                  label="// email"
                  icon="@"
                  type="email"
                  value={form.email}
                  onChange={setF("email")}
                  placeholder="dev@example.com"
                  error={errors.email}
                />
                <Input
                  label="// password"
                  icon="••"
                  type="password"
                  value={form.password}
                  onChange={setF("password")}
                  placeholder="8자 이상"
                  error={errors.password}
                />

                {/* 비밀번호 강도 바 */}
                {form.password && (
                  <div style={{ marginTop: -10, marginBottom: 16 }}>
                    <div style={{ display: "flex", gap: 4, marginBottom: 5 }}>
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} style={{
                          flex: 1, height: 3, borderRadius: 2,
                          background: i <= pwStrength.score ? pwStrength.color : T.border,
                          transition: "background 0.3s",
                        }} />
                      ))}
                    </div>
                    <div style={{ fontSize: 11, color: pwStrength.color, fontFamily: S.mono }}>
                      // strength: {pwStrength.label}
                    </div>
                  </div>
                )}

                <Input
                  label="// confirm_password"
                  icon="✓"
                  type="password"
                  value={form.confirm}
                  onChange={setF("confirm")}
                  placeholder="비밀번호 확인"
                  error={errors.confirm}
                />

                <button
                  onClick={handleNext}
                  className="sh-btn"
                  style={{ ...S.btnPrimary, width: "100%", height: 50, borderRadius: 12, fontSize: 15, justifyContent: "center", marginTop: 4 }}
                >
                  다음 단계 →
                </button>
              </>
            )}

            {/* ── Step 1: 추가 정보 ── */}
            {step === 1 && (
              <>
                {/* 직군 선택 */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: T.textSub, fontFamily: S.mono, marginBottom: 10 }}>
                    // select_role
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {ROLES.map(r => (
                      <button
                        key={r.id}
                        onClick={() => { setForm(f => ({ ...f, role: r.id })); setErrors(e => ({ ...e, role: "" })); }}
                        style={{
                          height: 52, borderRadius: 10, cursor: "pointer",
                          border: `1.5px solid ${form.role === r.id ? T.violet : T.borderMid}`,
                          background: form.role === r.id ? T.violetBg : T.bgRaised,
                          display: "flex", alignItems: "center", gap: 9, padding: "0 14px",
                          transition: "all 0.15s",
                        }}
                      >
                        <span style={{ fontSize: 16, fontFamily: S.mono, color: form.role === r.id ? T.violet : T.textHint }}>
                          {r.icon}
                        </span>
                        <span style={{ fontSize: 12.5, fontWeight: 700, color: form.role === r.id ? T.violet : T.textSub, fontFamily: S.mono }}>
                          {r.label}
                        </span>
                      </button>
                    ))}
                  </div>
                  {errors.role && (
                    <div style={{ fontSize: 11.5, color: T.red, marginTop: 6, fontFamily: S.mono }}>
                      // {errors.role}
                    </div>
                  )}
                </div>

                {/* 선택 입력 */}
                <Input
                  label="// website (optional)"
                  icon="⬡"
                  value={form.website}
                  onChange={setF("website")}
                  placeholder="https://yoursite.dev"
                />
                <Input
                  label="// github (optional)"
                  icon="◈"
                  value={form.github}
                  onChange={setF("github")}
                  placeholder="github.com/username"
                />

                {/* 동의 */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
                  <Checkbox checked={form.agreeTerms} onChange={v => { setF("agreeTerms")({ target: { value: v } }); setErrors(e => ({ ...e, agreeTerms: "" })); }}>
                    <span>
                      <Link href="#" style={{ color: T.violet, fontWeight: 700 }}>이용약관</Link>
                      {" "}및{" "}
                      <Link href="#" style={{ color: T.violet, fontWeight: 700 }}>개인정보처리방침</Link>
                      에 동의합니다 (필수)
                    </span>
                  </Checkbox>
                  {errors.agreeTerms && (
                    <div style={{ fontSize: 11, color: T.red, fontFamily: S.mono, marginTop: -6 }}>
                      // {errors.agreeTerms}
                    </div>
                  )}
                  <Checkbox checked={form.agreeMarketing} onChange={v => setF("agreeMarketing")({ target: { value: v } })}>
                    신규 제품·할인 소식 이메일 수신에 동의합니다 (선택)
                  </Checkbox>
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={() => setStep(0)}
                    style={{
                      height: 50, padding: "0 20px", borderRadius: 12,
                      border: `1px solid ${T.border}`, background: "transparent",
                      color: T.textSub, fontSize: 14, fontWeight: 600, cursor: "pointer",
                    }}
                  >
                    ← 이전
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="sh-btn"
                    style={{ ...S.btnPrimary, flex: 1, height: 50, borderRadius: 12, fontSize: 15, justifyContent: "center", opacity: loading ? 0.7 : 1 }}
                  >
                    {loading ? <span style={{ fontFamily: S.mono, fontSize: 13 }}>// creating account...</span> : "가입 완료 →"}
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {/* 로그인 링크 */}
        {step < 2 && (
          <p style={{ fontSize: 11.5, color: T.textHint, textAlign: "center", marginTop: 28, fontFamily: S.mono }}>
            // 이미 계정이 있으신가요?{" "}
            <Link href="/shop/login/" style={{ color: T.violet, fontWeight: 700 }}>
              로그인 →
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}