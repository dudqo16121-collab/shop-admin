"use client";

import Link from "next/link";
import { useState } from "react";
import { T, S } from "../../../components/shop/theme";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../lib/auth";


// 터미널 타이핑 효과용 라인
const TERMINAL_LINES = [
  { prompt: "❯", text: "npm install @shopadmin/ui", color: "#10B981" },
  { prompt: "❯", text: "npx create-next-app my-saas", color: "#6366F1" },
  { prompt: "❯", text: "git push origin main", color: "#F59E0B" },
  { prompt: "✓", text: "Build complete in 1.2s", color: "#10B981" },
];

const inputStyle = {
  width: "100%", height: 48, borderRadius: 10,
  border: "1.5px solid #1E1E2E",
  background: "#16161F",
  color: "#F8FAFC",
  padding: "0 16px 0 44px",
  fontSize: 14, outline: "none",
  boxSizing: "border-box",
  fontFamily: "'Inter',system-ui,sans-serif",
  transition: "border-color 0.2s ease",
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailFocus, setEmailFocus] = useState(false);
  const [pwFocus, setPwFocus] = useState(false);

  const router = useRouter();
  const { login } = useAuth();

const submit = (e) => {
  e.preventDefault();
  if (!email || !pw) {
    setError("이메일과 비밀번호를 입력해주세요.");
    return;
  }
  setError("");
  setLoading(true);

  // 백엔드 연동 전 Mock 로그인
  // 실제 연동 시 이 부분을 API 호출로 교체
  setTimeout(() => {
    login({
      id: "usr_dev_001",
      name: email.split("@")[0],
      email,
      avatar: email[0].toUpperCase(),
      plan: "Pro",
      joinedAt: new Date().toISOString().slice(0, 10),
    });
    setLoading(false);
    router.push("/shop/");
  }, 800);
};

  return (
    <div style={{
      minHeight: "100vh", display: "flex",
      background: T.bg,
    }}>

      {/* ── 좌: 터미널 비주얼 패널 ── */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        justifyContent: "center", padding: "60px 64px",
        position: "relative", overflow: "hidden",
        background: "linear-gradient(160deg, #0A0A0F 0%, #0F0F1A 60%, #0A0F1A 100%)",
        borderRight: `1px solid ${T.border}`,
      }}
        className="sh-hero-bg"
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

        {/* 헤드라인 */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ ...S.eyebrow, marginBottom: 12 }}>// Developer Marketplace</div>
          <h1 style={{
            fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 800,
            letterSpacing: "-0.04em", lineHeight: 1.1,
            color: T.text, margin: "0 0 16px",
          }}>
            Build products<br />
            <span style={{
              background: "linear-gradient(135deg, #6366F1, #8B5CF6, #10B981)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              ship faster.
            </span>
          </h1>
          <p style={{ fontSize: 15, color: T.textSub, lineHeight: 1.75, maxWidth: 360 }}>
            프리미엄 UI Kit·템플릿·플러그인으로 개발 속도를 높이세요.
            로그인하고 구매 내역과 라이선스를 관리하세요.
          </p>
        </div>

        {/* 터미널 카드 */}
        <div style={{
          background: "#0D0D14",
          border: `1px solid ${T.border}`,
          borderRadius: 14,
          padding: "18px 20px",
          maxWidth: 400,
          boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(99,102,241,0.06)",
        }}>
          {/* 터미널 도트 */}
          <div style={{ display: "flex", gap: 7, marginBottom: 14 }}>
            {["#EF4444", "#F59E0B", "#10B981"].map((c, i) => (
              <div key={i} style={{ width: 11, height: 11, borderRadius: "50%", background: c, opacity: 0.85 }} />
            ))}
            <span style={{ marginLeft: 8, fontSize: 11, color: T.textHint, fontFamily: S.mono }}>
              shopadmin — zsh
            </span>
          </div>
          {/* 터미널 라인들 */}
          {TERMINAL_LINES.map((line, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, fontFamily: S.mono, fontSize: 12 }}>
              <span style={{ color: line.color, fontWeight: 700, flexShrink: 0 }}>{line.prompt}</span>
              <span style={{ color: i === TERMINAL_LINES.length - 1 ? line.color : "#94A3B8" }}>{line.text}</span>
            </div>
          ))}
          {/* 커서 라인 */}
          <div style={{ display: "flex", gap: 10, fontFamily: S.mono, fontSize: 12 }}>
            <span style={{ color: T.violet, fontWeight: 700 }}>❯</span>
            <span className="sh-cursor" style={{ color: T.textHint }} />
          </div>
        </div>

        {/* 통계 */}
        <div style={{ display: "flex", gap: 32, marginTop: 40 }}>
          {[
            { value: "12+", label: "Products" },
            { value: "5,000+", label: "Downloads" },
            { value: "4.8★", label: "Rating" },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize: 20, fontWeight: 800, color: T.violet, fontFamily: S.mono }}>{s.value}</div>
              <div style={{ fontSize: 11, color: T.textHint, fontFamily: S.mono, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 우: 로그인 폼 ── */}
      <div style={{
        width: "min(480px, 45vw)",
        display: "flex", flexDirection: "column",
        justifyContent: "center", padding: "60px 52px",
        background: T.bg,
        minWidth: 360,
      }}>
        {/* 폼 헤더 */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ ...S.eyebrow, marginBottom: 10 }}>// Welcome back</div>
          <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", color: T.text, margin: 0 }}>
            로그인
          </h2>
<p style={{ fontSize: 13, color: T.textHint, marginTop: 8, fontFamily: S.mono }}>
  계정이 없으신가요?{" "}
  <Link href="/shop/signup/" style={{ color: T.violet, fontWeight: 700 }}>
    회원가입 →
  </Link>
</p>
        </div>

        {/* OAuth 버튼들 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
{[
  { label: "GitHub으로 계속하기", bg: "#161B22", border: "#30363D",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
      </svg>
    )
  },
  { label: "Google로 계속하기", bg: "#1A1A2E", border: T.borderMid,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    )
  },
].map(btn => (
  <button
    key={btn.label}
    className="sh-btn"
    onClick={() => {
      login({
        id: "usr_oauth_001",
        name: btn.label.includes("GitHub") ? "GitHub User" : "Google User",
        email: btn.label.includes("GitHub") ? "github@shopadmin.dev" : "google@shopadmin.dev",
        avatar: btn.label.includes("GitHub") ? "G" : "G",
        plan: "Free",
        joinedAt: new Date().toISOString().slice(0, 10),
      });
      router.push("/shop/");
    }}
    style={{
      width: "100%", height: 48, borderRadius: 10,
      border: `1px solid ${btn.border}`,
      background: btn.bg, color: T.text,
      fontSize: 13.5, fontWeight: 600, cursor: "pointer",
      display: "grid",
      gridTemplateColumns: "24px 1fr 24px",
      alignItems: "center",
      padding: "0 16px", gap: 10,
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
            // or continue with email
          </span>
          <div style={{ flex: 1, height: 1, background: T.border }} />
        </div>

        {/* 이메일/비밀번호 폼 */}
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* 이메일 */}
          <div style={{ position: "relative" }}>
            <span style={{
              position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
              fontSize: 15, opacity: 0.4, pointerEvents: "none",
            }}>@</span>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onFocus={() => setEmailFocus(true)}
              onBlur={() => setEmailFocus(false)}
              placeholder="your@email.com"
              style={{
                ...inputStyle,
                borderColor: emailFocus ? T.violet : T.border,
                boxShadow: emailFocus ? `0 0 0 3px ${T.violetBg}` : "none",
              }}
              autoComplete="email"
            />
          </div>

          {/* 비밀번호 */}
          <div style={{ position: "relative" }}>
            <span style={{
              position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
              fontSize: 14, opacity: 0.4, pointerEvents: "none", fontFamily: S.mono,
            }}>••</span>
            <input
              type="password"
              value={pw}
              onChange={e => setPw(e.target.value)}
              onFocus={() => setPwFocus(true)}
              onBlur={() => setPwFocus(false)}
              placeholder="비밀번호"
              style={{
                ...inputStyle,
                borderColor: pwFocus ? T.violet : T.border,
                boxShadow: pwFocus ? `0 0 0 3px ${T.violetBg}` : "none",
              }}
              autoComplete="current-password"
            />
          </div>

          {/* 비밀번호 찾기 */}
          <div style={{ textAlign: "right", marginTop: -6 }}>
            <span style={{ fontSize: 12, color: T.textHint, cursor: "pointer", fontFamily: S.mono }}>
              // forgot password?
            </span>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div style={{
              padding: "10px 14px", borderRadius: 9,
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              fontSize: 12.5, color: "#EF4444", fontFamily: S.mono,
            }}>
              {error}
            </div>
          )}

          {/* 로그인 버튼 */}
          <button
            type="submit"
            disabled={loading}
            className="sh-btn"
            style={{
              ...S.btnPrimary,
              width: "100%", height: 50, borderRadius: 12,
              fontSize: 15, marginTop: 4,
              opacity: loading ? 0.7 : 1,
              position: "relative",
            }}
          >
            {loading ? (
              <span style={{ fontFamily: S.mono, fontSize: 13 }}>// authenticating...</span>
            ) : (
              "로그인 →"
            )}
          </button>
          <Link
  href="/shop/signup/"
  className="sh-btn"
  style={{
    ...S.btnGhost,
    width: "100%", height: 48, borderRadius: 12,
    fontSize: 14, justifyContent: "center",
    display: "flex", alignItems: "center",
    marginTop: 8,
  }}
>
  회원가입
</Link>
        </form>

        {/* 이용약관 */}
        <p style={{ fontSize: 11.5, color: T.textHint, lineHeight: 1.7, marginTop: 28, textAlign: "center" }}>
          로그인하면{" "}
          <span style={{ color: T.violet, cursor: "pointer" }}>이용약관</span>
          {" "}및{" "}
          <span style={{ color: T.violet, cursor: "pointer" }}>개인정보처리방침</span>
          에 동의하는 것으로 간주됩니다.
        </p>

        {/* 스택 배지 */}
        <div style={{ display: "flex", gap: 6, marginTop: 40, flexWrap: "wrap" }}>
          {["Next.js", "Supabase Auth", "JWT"].map(tag => (
            <span key={tag} className="sh-stack-badge" style={{ fontSize: 10 }}>{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
}