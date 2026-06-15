"use client";

// ── app/shop/verify/page.js ──────────────────────────────────
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { T, S } from "../../../components/shop/theme";
import { useAuth } from "../../../lib/auth";

// ── OTP 입력 컴포넌트 (6자리 코드) ─────────────────────────
function OtpInput({ value, onChange, disabled }) {
  const inputs = useRef([]);
  const digits = value.split("").concat(Array(6).fill("")).slice(0, 6);

  const handleChange = (i, v) => {
    const clean = v.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = clean;
    onChange(next.join(""));
    if (clean && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) inputs.current[i - 1]?.focus();
    if (e.key === "ArrowLeft" && i > 0) inputs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < 5) inputs.current[i + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted.padEnd(6, "").slice(0, 6));
    inputs.current[Math.min(pasted.length, 5)]?.focus();
  };

  return (
    <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => inputs.current[i] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          disabled={disabled}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={e => e.target.select()}
          style={{
            width: 52, height: 62, borderRadius: 14, textAlign: "center",
            border: `2px solid ${d ? T.violet : T.border}`,
            background: d ? T.violetBg : T.bgRaised,
            color: d ? T.violet : T.text,
            fontSize: 24, fontWeight: 800, fontFamily: S.mono,
            outline: "none", cursor: disabled ? "not-allowed" : "text",
            transition: "border-color 0.15s, background 0.15s, color 0.15s",
            opacity: disabled ? 0.5 : 1,
            caretColor: T.violet,
          }}
        />
      ))}
    </div>
  );
}

// ── 타이머 훅 ────────────────────────────────────────────────
function useCountdown(initial) {
  const [count, setCount] = useState(initial);

  useEffect(() => {
    if (count <= 0) return;
    const t = setTimeout(() => setCount(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count]);

  const reset = (val = initial) => setCount(val);
  return { count, expired: count <= 0, reset };
}

// ── 터미널 로그 ──────────────────────────────────────────────
function TerminalLog({ lines }) {
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    if (visible >= lines.length) return;
    const t = setTimeout(() => setVisible(v => v + 1), 420);
    return () => clearTimeout(t);
  }, [visible, lines.length]);

  return (
    <div style={{
      background: "#0D0D14", border: `1px solid ${T.border}`,
      borderRadius: 14, overflow: "hidden",
      boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
    }}>
      <div style={{
        background: "#111118", borderBottom: `1px solid ${T.border}`,
        padding: "10px 16px", display: "flex", alignItems: "center", gap: 8,
      }}>
        {["#EF4444", "#F59E0B", "#10B981"].map((c, i) => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.8 }} />
        ))}
        <span style={{ fontSize: 11, color: T.textHint, fontFamily: S.mono, marginLeft: 6 }}>
          email-verification — bash
        </span>
      </div>
      <div style={{ padding: "16px 20px", minHeight: 120 }}>
        {lines.slice(0, visible).map((line, i) => (
          <div key={i} style={{
            display: "flex", gap: 10, marginBottom: 8,
            fontFamily: S.mono, fontSize: 12, lineHeight: 1.7,
            animation: "shFadeIn 0.2s ease",
          }}>
            <span style={{ color: line.color || T.violet, fontWeight: 700, flexShrink: 0 }}>{line.prompt}</span>
            <span style={{ color: line.textColor || "#94A3B8" }}>{line.text}</span>
          </div>
        ))}
        {visible < lines.length && (
          <div style={{ display: "flex", gap: 10, fontFamily: S.mono, fontSize: 12 }}>
            <span style={{ color: T.violet }}>❯</span>
            <span className="sh-cursor" style={{ color: T.textHint }} />
          </div>
        )}
      </div>
    </div>
  );
}

// ── 메인 (inner) ─────────────────────────────────────────────
function VerifyInner() {
  const { user, login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email");

  const email = user?.email || emailParam || "your@email.com";
  const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) =>
    a + "*".repeat(Math.max(1, b.length)) + c
  );

  const [otp, setOtp] = useState("");
  const [phase, setPhase] = useState("waiting"); // waiting | verifying | success | error
  const [errorMsg, setErrorMsg] = useState("");
  const [resendCount, setResendCount] = useState(0);
  const { count, expired, reset: resetTimer } = useCountdown(180);

  const MOCK_OTP = "123456";

  const terminalLines = [
    { prompt: "❯", text: `sending verification email to ${maskedEmail}` },
    { prompt: "✓", text: "SMTP connection established", color: "#10B981", textColor: "#10B981" },
    { prompt: "✓", text: "email queued successfully", color: "#10B981", textColor: "#10B981" },
    { prompt: "✓", text: `delivery confirmed · expires in ${Math.floor(count / 60)}:${String(count % 60).padStart(2,"0")}`, color: "#6366F1", textColor: "#94A3B8" },
    { prompt: "⌛", text: "waiting for user verification...", color: "#F59E0B", textColor: "#475569" },
  ];

  const successLines = [
    { prompt: "✓", text: "OTP code received", color: "#10B981", textColor: "#10B981" },
    { prompt: "✓", text: "verifying token...", color: "#10B981", textColor: "#10B981" },
    { prompt: "✓", text: "identity confirmed", color: "#10B981", textColor: "#10B981" },
    { prompt: "✓", text: "account activated successfully", color: "#6366F1", textColor: "#10B981" },
    { prompt: "→", text: "redirecting to dashboard...", color: "#6366F1", textColor: "#94A3B8" },
  ];

  // 6자리 완성 시 자동 제출
  useEffect(() => {
    if (otp.length === 6 && phase === "waiting") handleVerify(otp);
  }, [otp]);

  const handleVerify = (code = otp) => {
    if (phase !== "waiting") return;
    setPhase("verifying");
    setTimeout(() => {
      if (code === MOCK_OTP) {
        setPhase("success");
        if (user) login({ ...user, emailVerified: true });
        setTimeout(() => router.push("/shop/"), 2800);
      } else {
        setPhase("error");
        setErrorMsg("인증 코드가 올바르지 않아요");
        setTimeout(() => { setPhase("waiting"); setOtp(""); }, 1800);
      }
    }, 1000);
  };

  const handleResend = () => {
    setResendCount(c => c + 1);
    setOtp(""); setPhase("waiting"); setErrorMsg("");
    resetTimer(180);
  };

  const fmt = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: T.bg }}>

      {/* ── 좌: 비주얼 ── */}
      <div className="sh-hero-bg" style={{
        flex: 1, display: "flex", flexDirection: "column",
        justifyContent: "center", padding: "60px 64px",
        borderRight: `1px solid ${T.border}`,
        position: "relative", overflow: "hidden",
      }}>
        <Link href="/shop/" style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 52, textDecoration: "none" }}>
          <span style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16 }}>S</span>
          <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.03em", color: T.text }}>ShopAdmin<span style={{ color: T.violet }}>.dev</span></span>
        </Link>

        <div style={{ marginBottom: 36 }}>
          <div style={{ ...S.eyebrow, marginBottom: 12 }}>// email.verify</div>
          <h1 style={{ fontSize: "clamp(28px,3.5vw,46px)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.12, color: T.text, margin: "0 0 14px" }}>
            이메일을<br />
            <span style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6,#10B981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              확인해주세요.
            </span>
          </h1>
          <p style={{ fontSize: 14, color: T.textSub, lineHeight: 1.78, maxWidth: 340 }}>
            <strong style={{ color: T.text }}>{maskedEmail}</strong>으로<br />
            6자리 인증 코드를 발송했습니다.
          </p>
        </div>

        <TerminalLog lines={phase === "success" ? successLines : terminalLines} />

        {/* 이메일 클라이언트 바로가기 */}
        <div style={{ marginTop: 28 }}>
          <div style={{ fontSize: 11, color: T.textHint, fontFamily: S.mono, marginBottom: 12 }}>// open_email_client</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { name: "Gmail",      url: "https://mail.google.com",  color: "#EA4335" },
              { name: "Outlook",    url: "https://outlook.live.com", color: "#0078D4" },
              { name: "Naver Mail", url: "https://mail.naver.com",   color: "#03C75A" },
              { name: "Kakao Mail", url: "https://mail.kakao.com",   color: "#F59E0B" },
            ].map(m => (
              <a key={m.name} href={m.url} target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 14px", borderRadius: 9, border: `1px solid ${T.border}`, background: T.bgCard, fontSize: 12, fontWeight: 700, color: T.textSub, textDecoration: "none", transition: "border-color 0.15s, color 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = m.color; e.currentTarget.style.color = T.text; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textSub; }}
              >
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: m.color, flexShrink: 0 }} />{m.name}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── 우: 인증 폼 ── */}
      <div style={{ width: "min(480px,44vw)", minWidth: 340, display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 48px", background: T.bg }}>

        {/* 성공 */}
        {phase === "success" ? (
          <div style={{ textAlign: "center" }}>
            <div className="sh-check" style={{ width: 80, height: 80, borderRadius: "50%", margin: "0 auto 24px", background: "linear-gradient(135deg,#10B981,#059669)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34 }}>✓</div>
            <div style={{ ...S.eyebrow, marginBottom: 10 }}>// verified</div>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: T.text, margin: "0 0 10px", letterSpacing: "-0.03em" }}>인증 완료!</h2>
            <p style={{ fontSize: 14, color: T.textSub, lineHeight: 1.75, marginBottom: 28 }}>
              이메일 인증이 완료됐어요.<br />잠시 후 메인 페이지로 이동합니다.
            </p>
            <div style={{ height: 4, background: T.border, borderRadius: 2, overflow: "hidden", marginBottom: 24 }}>
              <div style={{ height: "100%", background: "linear-gradient(90deg,#10B981,#6366F1)", borderRadius: 2, width: "100%", transition: "width 2.8s linear" }} />
            </div>
            <Link href="/shop/" className="sh-btn" style={{ ...S.btnPrimary, display: "inline-flex" }}>메인으로 →</Link>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 36 }}>
              <div style={{ ...S.eyebrow, marginBottom: 10 }}>// Enter OTP</div>
              <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", color: T.text, margin: "0 0 8px" }}>인증 코드 입력</h2>
              <p style={{ fontSize: 13, color: T.textHint, fontFamily: S.mono, margin: 0, lineHeight: 1.7 }}>
                // {maskedEmail}으로<br />// 발송된 6자리 코드를 입력하세요
              </p>
            </div>

            {/* OTP */}
            <div style={{ marginBottom: 24 }}>
              <OtpInput value={otp} onChange={setOtp} disabled={phase === "verifying"} />
              <div style={{ textAlign: "center", marginTop: 16, minHeight: 32 }}>
                {phase === "verifying" && (
                  <div style={{ fontSize: 13, color: T.violet, fontFamily: S.mono }}>// verifying...</div>
                )}
                {phase === "error" && (
                  <div style={{ fontSize: 13, color: T.red, fontFamily: S.mono, padding: "8px 16px", borderRadius: 9, background: T.redBg, border: `1px solid ${T.red}40`, display: "inline-block" }}>
                    ✕ {errorMsg}
                  </div>
                )}
              </div>
            </div>

            {/* 확인 버튼 */}
            <button
              onClick={() => handleVerify()}
              disabled={otp.length < 6 || phase !== "waiting"}
              className="sh-btn"
              style={{ ...S.btnPrimary, width: "100%", height: 50, borderRadius: 12, fontSize: 15, justifyContent: "center", marginBottom: 18, opacity: otp.length < 6 || phase !== "waiting" ? 0.45 : 1 }}
            >
              {phase === "verifying" ? "// 확인 중..." : "인증하기"}
            </button>

            {/* 타이머 + 재발송 */}
            <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 13, padding: "16px 18px", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ fontSize: 12, color: T.textSub }}>코드 만료까지</div>
                <div style={{ fontSize: 20, fontWeight: 800, fontFamily: S.mono, color: count < 60 ? T.red : count < 120 ? T.amber : T.green }}>
                  {fmt(count)}
                </div>
              </div>
              <div style={{ height: 4, background: T.border, borderRadius: 2, overflow: "hidden", marginBottom: 14 }}>
                <div style={{ height: "100%", borderRadius: 2, width: `${(count/180)*100}%`, background: count < 60 ? T.red : count < 120 ? T.amber : T.green, transition: "width 1s linear, background 0.5s" }} />
              </div>
              {expired ? (
                <button onClick={handleResend} className="sh-btn" style={{ ...S.btnGreen, width: "100%", height: 42, borderRadius: 10, fontSize: 13, justifyContent: "center" }}>
                  ⟳ 코드 재발송
                </button>
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontSize: 12, color: T.textHint, fontFamily: S.mono }}>
                    {resendCount > 0 ? `// ${resendCount}회 재발송됨` : "// 코드를 받지 못하셨나요?"}
                  </div>
                  <button onClick={handleResend} disabled={!expired && resendCount > 0} style={{ fontSize: 12, fontWeight: 700, color: T.textHint, background: "none", border: "none", cursor: "default", fontFamily: S.mono }}>
                    재발송 {resendCount > 0 && !expired ? `(${fmt(count)})` : ""}
                  </button>
                </div>
              )}
            </div>

            {/* 개발 힌트 */}
            <div style={{ background: T.amberBg, border: `1px solid ${T.amber}30`, borderRadius: 12, padding: "12px 16px", marginBottom: 18 }}>
              <div style={{ fontSize: 11, color: T.amber, fontFamily: S.mono, marginBottom: 4 }}>// dev_mode · mock OTP</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: T.text, fontFamily: S.mono, letterSpacing: "0.2em" }}>1  2  3  4  5  6</div>
              <div style={{ fontSize: 11, color: T.textHint, fontFamily: S.mono, marginTop: 3 }}>// 실제 배포 시 이 안내를 제거하세요</div>
            </div>

            {/* 이메일 변경 */}
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 12, color: T.textHint, fontFamily: S.mono, marginBottom: 6 }}>// 이메일이 다른가요?</p>
              <Link href="/shop/settings/" style={{ fontSize: 13, color: T.violet, fontWeight: 700 }}>이메일 변경하기 →</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Suspense 래퍼 ────────────────────────────────────────────
export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.bg }}>
        <div style={{ fontFamily: S.mono, fontSize: 13, color: T.textHint }}>// loading...</div>
      </div>
    }>
      <VerifyInner />
    </Suspense>
  );
}