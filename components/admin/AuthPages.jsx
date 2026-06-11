"use client";

import { useState, useEffect } from "react";

// ── 디자인 토큰 ─────────────────────────────────────────────
const C = {
  bg: "#F8F7F5",
  surface: "#FFFFFF",
  border: "#E5E3DF",
  borderMid: "#D0CEC9",
  borderFocus: "#1A1917",
  text: "#1A1917",
  textSub: "#6B6963",
  textHint: "#A09D97",
  accent: "#1A1917",
  green: "#16A34A",
  greenBg: "#F0FDF4",
  greenText: "#15803D",
  red: "#DC2626",
  redBg: "#FEF2F2",
  redText: "#B91C1C",
  blue: "#2563EB",
  blueBg: "#EFF6FF",
  blueText: "#1D4ED8",
};

// ── 공통 Input 컴포넌트 ──────────────────────────────────────
function Input({ label, type = "text", placeholder, value, onChange, error, hint, rightEl }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {label && (
        <label style={{ fontSize: 12, fontWeight: 500, color: C.text }}>
          {label}
        </label>
      )}
      <div style={{ position: "relative" }}>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%",
            height: 42,
            borderRadius: 10,
            border: `1.5px solid ${error ? C.red : focused ? C.borderFocus : C.border}`,
            background: C.surface,
            padding: rightEl ? "0 40px 0 13px" : "0 13px",
            fontSize: 13,
            color: C.text,
            outline: "none",
            boxSizing: "border-box",
            transition: "border-color 0.15s",
          }}
        />
        {rightEl && (
          <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }}>
            {rightEl}
          </div>
        )}
      </div>
      {error && <div style={{ fontSize: 11, color: C.red }}>{error}</div>}
      {hint && !error && <div style={{ fontSize: 11, color: C.textHint }}>{hint}</div>}
    </div>
  );
}

// ── 공통 Button 컴포넌트 ─────────────────────────────────────
function Button({ children, onClick, variant = "primary", disabled, style }) {
  const base = {
    width: "100%",
    height: 44,
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    border: "none",
    transition: "opacity 0.15s",
    opacity: disabled ? 0.5 : 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    ...style,
  };
  const variants = {
    primary: { background: C.accent, color: "#fff" },
    secondary: { background: C.bg, color: C.text, border: `1.5px solid ${C.border}` },
    ghost: { background: "transparent", color: C.textSub, border: `1.5px solid ${C.border}` },
  };
  return (
    <button style={{ ...base, ...variants[variant] }} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

// ── 레이아웃 래퍼 ────────────────────────────────────────────
function AuthLayout({ children }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <div style={{
        width: "100%",
        maxWidth: 400,
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}>
        {/* 로고 */}
        <div style={{ textAlign: "center", marginBottom: 4 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: C.accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: 800,
            fontSize: 20,
            margin: "0 auto 12px",
          }}>S</div>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px", color: C.text }}>ShopAdmin</div>
          <div style={{ fontSize: 12, color: C.textHint, marginTop: 4 }}>이커머스 관리자 플랫폼</div>
        </div>
        {/* 카드 */}
        <div style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          padding: "28px 28px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Divider ──────────────────────────────────────────────────
function Divider({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "4px 0" }}>
      <div style={{ flex: 1, height: 1, background: C.border }} />
      <span style={{ fontSize: 11, color: C.textHint }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: C.border }} />
    </div>
  );
}

// ── 소셜 로그인 버튼 ─────────────────────────────────────────
function SocialButton({ icon, label }) {
  return (
    <button style={{
      flex: 1,
      height: 40,
      borderRadius: 9,
      border: `1.5px solid ${C.border}`,
      background: C.surface,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
      fontSize: 12,
      fontWeight: 500,
      color: C.textSub,
      cursor: "pointer",
    }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      {label}
    </button>
  );
}

// ── 강도 표시 바 ─────────────────────────────────────────────
function PasswordStrength({ password }) {
  const getStrength = (pw) => {
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };
  const strength = getStrength(password);
  const labels = ["", "약함", "보통", "강함", "매우 강함"];
  const colors = ["", C.red, C.red, C.green, C.green];
  if (!password) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <div style={{ display: "flex", gap: 4 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i <= strength ? colors[strength] : C.border,
            transition: "background 0.2s",
          }} />
        ))}
      </div>
      <div style={{ fontSize: 10, color: colors[strength], fontWeight: 500 }}>
        {labels[strength]}
      </div>
    </div>
  );
}

// ── 화면 1: 로그인 ───────────────────────────────────────────
function LoginPage({ onNavigate, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [rememberEmail, setRememberEmail] = useState(false);
  const [rememberPassword, setRememberPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem("savedEmail");
    const savedPassword = localStorage.getItem("savedPassword");
    if (savedEmail) { setEmail(savedEmail); setRememberEmail(true); }
    if (savedPassword) { setPassword(savedPassword); setRememberPassword(true); }
  }, []);

  const validate = () => {
    const e = {};
    if (!email) e.email = "이메일을 입력해주세요.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "올바른 이메일 형식이 아닙니다.";
    if (!password) e.password = "비밀번호를 입력해주세요.";
    return e;
  };

  const handleLogin = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    // 아이디 저장
    if (rememberEmail) localStorage.setItem("savedEmail", email);
    else localStorage.removeItem("savedEmail");

    // 비밀번호 저장
    if (rememberPassword) localStorage.setItem("savedPassword", password);
    else localStorage.removeItem("savedPassword");

    setLoading(true);
    setErrors({});
    setTimeout(() => {
      setLoading(false);
      if (onLoginSuccess) onLoginSuccess();
    }, 1200);
  };

  return (
    <AuthLayout>
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>로그인</div>
        <div style={{ fontSize: 12, color: C.textSub }}>계정 정보를 입력해 관리자 페이지에 접속하세요.</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Input
          label="이메일"
          type="email"
          placeholder="admin@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          error={errors.email}
        />
        <Input
          label="비밀번호"
          type={showPw ? "text" : "password"}
          placeholder="비밀번호 입력"
          value={password}
          onChange={e => setPassword(e.target.value)}
          error={errors.password}
          rightEl={
            <span
              onClick={() => setShowPw(!showPw)}
              style={{ fontSize: 16, cursor: "pointer", color: C.textHint, userSelect: "none" }}
            >{showPw ? "🙈" : "👁"}</span>
          }
        />

        {/* 아이디 저장 / 비밀번호 저장 / 비밀번호 찾기 */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 12 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={rememberEmail}
                onChange={e => setRememberEmail(e.target.checked)}
                style={{ width: 14, height: 14, accentColor: C.accent }}
              />
              <span style={{ fontSize: 12, color: C.textSub }}>아이디 저장</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={rememberPassword}
                onChange={e => setRememberPassword(e.target.checked)}
                style={{ width: 14, height: 14, accentColor: C.accent }}
              />
              <span style={{ fontSize: 12, color: C.textSub }}>비밀번호 저장</span>
            </label>
          </div>
          <span
            onClick={() => onNavigate("forgot")}
            style={{ fontSize: 12, color: C.blue, cursor: "pointer", fontWeight: 500 }}
          >비밀번호 찾기</span>
        </div>

        <Button onClick={handleLogin} disabled={loading}>
          {loading ? "로그인 중..." : "로그인"}
        </Button>

        <Divider label="또는" />

        <div style={{ display: "flex", gap: 8 }}>
          <SocialButton icon="🔵" label="Google" />
          <SocialButton icon="⬛" label="GitHub" />
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: C.textSub }}>
        계정이 없으신가요?{" "}
        <span
          onClick={() => onNavigate("signup")}
          style={{ color: C.blue, fontWeight: 600, cursor: "pointer" }}
        >회원가입</span>
      </div>
    </AuthLayout>
  );
}

// ── 화면 2: 회원가입 ─────────────────────────────────────────
function SignupPage({ onNavigate }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", code: "" });
  const [showPw, setShowPw] = useState(false);
  const [agreed, setAgreed] = useState({ terms: false, privacy: false, marketing: false });
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1); // 1: 정보입력, 2: 완료
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "이름을 입력해주세요.";
    if (!form.email) e.email = "이메일을 입력해주세요.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "올바른 이메일 형식이 아닙니다.";
    if (!form.password) e.password = "비밀번호를 입력해주세요.";
    else if (form.password.length < 8) e.password = "비밀번호는 8자 이상이어야 합니다.";
    if (form.password !== form.confirm) e.confirm = "비밀번호가 일치하지 않습니다.";
    if (!agreed.terms) e.terms = "이용약관에 동의해주세요.";
    if (!agreed.privacy) e.privacy = "개인정보처리방침에 동의해주세요.";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep(2); }, 1200);
  };

  if (step === 2) {
    return (
      <AuthLayout>
        <div style={{ textAlign: "center", padding: "12px 0" }}>
          <div style={{ fontSize: 44, marginBottom: 14 }}>🎉</div>
          <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>가입 완료!</div>
          <div style={{ fontSize: 13, color: C.textSub, marginBottom: 6 }}>
            <strong>{form.email}</strong>으로<br />인증 메일이 발송되었습니다.
          </div>
          <div style={{ fontSize: 12, color: C.textHint, marginBottom: 20 }}>메일함을 확인해 이메일 인증을 완료해주세요.</div>
          <Button onClick={() => onNavigate("login")}>로그인하러 가기</Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>회원가입</div>
        <div style={{ fontSize: 12, color: C.textSub }}>ShopAdmin 계정을 새로 만드세요.</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
        <Input label="이름" placeholder="홍길동" value={form.name} onChange={e => update("name", e.target.value)} error={errors.name} />

        <div>
          <div style={{ fontSize: 12, fontWeight: 500, color: C.text, marginBottom: 5 }}>이메일</div>
          <div style={{ display: "flex", gap: 7 }}>
            <input
              type="email"
              placeholder="admin@example.com"
              value={form.email}
              onChange={e => update("email", e.target.value)}
              style={{
                flex: 1, height: 42, borderRadius: 10,
                border: `1.5px solid ${errors.email ? C.red : C.border}`,
                padding: "0 13px", fontSize: 13, color: C.text, outline: "none", boxSizing: "border-box",
              }}
            />
            <button
              onClick={() => { setCodeSent(true); }}
              style={{
                height: 42, padding: "0 14px", borderRadius: 10,
                border: `1.5px solid ${C.border}`, background: codeSent ? C.greenBg : C.bg,
                fontSize: 12, fontWeight: 600,
                color: codeSent ? C.greenText : C.text, cursor: "pointer", whiteSpace: "nowrap",
              }}
            >{codeSent ? "✓ 발송됨" : "인증코드 발송"}</button>
          </div>
          {errors.email && <div style={{ fontSize: 11, color: C.red, marginTop: 4 }}>{errors.email}</div>}
        </div>

        {codeSent && (
          <Input
            label="인증코드"
            placeholder="이메일로 받은 6자리 코드 입력"
            value={form.code}
            onChange={e => update("code", e.target.value)}
            hint="코드는 10분간 유효합니다."
          />
        )}

        <div>
          <Input
            label="비밀번호"
            type={showPw ? "text" : "password"}
            placeholder="8자 이상, 영문+숫자+특수문자"
            value={form.password}
            onChange={e => update("password", e.target.value)}
            error={errors.password}
            rightEl={
              <span onClick={() => setShowPw(!showPw)} style={{ fontSize: 16, cursor: "pointer", color: C.textHint }}>
                {showPw ? "🙈" : "👁"}
              </span>
            }
          />
          <div style={{ marginTop: 6 }}>
            <PasswordStrength password={form.password} />
          </div>
        </div>

        <Input
          label="비밀번호 확인"
          type="password"
          placeholder="비밀번호 재입력"
          value={form.confirm}
          onChange={e => update("confirm", e.target.value)}
          error={errors.confirm}
        />

        {/* 약관 동의 */}
        <div style={{ background: C.bg, borderRadius: 10, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 9 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={agreed.terms && agreed.privacy && agreed.marketing}
              onChange={e => setAgreed({ terms: e.target.checked, privacy: e.target.checked, marketing: e.target.checked })}
              style={{ width: 15, height: 15, accentColor: C.accent }}
            />
            <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>전체 동의</span>
          </label>
          <div style={{ height: 1, background: C.border }} />
          {[
            { key: "terms", label: "이용약관 동의", required: true },
            { key: "privacy", label: "개인정보처리방침 동의", required: true },
            { key: "marketing", label: "마케팅 정보 수신 동의", required: false },
          ].map(item => (
            <label key={item.key} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={agreed[item.key]}
                onChange={e => setAgreed(a => ({ ...a, [item.key]: e.target.checked }))}
                style={{ width: 14, height: 14, accentColor: C.accent }}
              />
              <span style={{ fontSize: 12, color: C.textSub, flex: 1 }}>{item.label}</span>
              <span style={{ fontSize: 10, color: item.required ? C.red : C.textHint, fontWeight: 500 }}>
                {item.required ? "필수" : "선택"}
              </span>
            </label>
          ))}
          {(errors.terms || errors.privacy) && (
            <div style={{ fontSize: 11, color: C.red }}>필수 약관에 동의해주세요.</div>
          )}
        </div>

        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "가입 처리 중..." : "회원가입"}
        </Button>
      </div>

      <div style={{ textAlign: "center", marginTop: 18, fontSize: 12, color: C.textSub }}>
        이미 계정이 있으신가요?{" "}
        <span onClick={() => onNavigate("login")} style={{ color: C.blue, fontWeight: 600, cursor: "pointer" }}>
          로그인
        </span>
      </div>
    </AuthLayout>
  );
}

// ── 화면 3: 비밀번호 찾기 ────────────────────────────────────
function ForgotPage({ onNavigate }) {
  const [step, setStep] = useState(1); // 1: 이메일 입력, 2: 코드 확인, 3: 새 비밀번호, 4: 완료
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(180);

  const startTimer = () => {
    setTimer(180);
    const interval = setInterval(() => {
      setTimer(t => { if (t <= 1) { clearInterval(interval); return 0; } return t - 1; });
    }, 1000);
  };

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const handleStep1 = () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ email: "올바른 이메일을 입력해주세요." }); return;
    }
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep(2); startTimer(); setErrors({}); }, 1000);
  };

  const handleStep2 = () => {
    if (code.length < 6) { setErrors({ code: "6자리 인증코드를 입력해주세요." }); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep(3); setErrors({}); }, 800);
  };

  const handleStep3 = () => {
    const e = {};
    if (!newPw || newPw.length < 8) e.newPw = "비밀번호는 8자 이상이어야 합니다.";
    if (newPw !== confirmPw) e.confirmPw = "비밀번호가 일치하지 않습니다.";
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep(4); }, 1000);
  };

  // 진행 단계 표시
  const StepIndicator = () => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: 22 }}>
      {["이메일 확인", "코드 인증", "비밀번호 재설정"].map((label, i) => (
        <div key={label} style={{ display: "flex", alignItems: "center" }}>
          {i > 0 && <div style={{ width: 28, height: 1, background: step > i ? C.accent : C.border }} />}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{
              width: 24, height: 24, borderRadius: "50%",
              background: step > i + 1 ? C.accent : step === i + 1 ? C.accent : C.bg,
              border: `1.5px solid ${step >= i + 1 ? C.accent : C.border}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, fontWeight: 700,
              color: step >= i + 1 ? "#fff" : C.textHint,
            }}>
              {step > i + 1 ? "✓" : i + 1}
            </div>
            <div style={{ fontSize: 10, color: step === i + 1 ? C.text : C.textHint, fontWeight: step === i + 1 ? 600 : 400 }}>
              {label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (step === 4) {
    return (
      <AuthLayout>
        <div style={{ textAlign: "center", padding: "12px 0" }}>
          <div style={{ fontSize: 44, marginBottom: 14 }}>🔐</div>
          <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>비밀번호 변경 완료!</div>
          <div style={{ fontSize: 13, color: C.textSub, marginBottom: 20 }}>새 비밀번호로 로그인해주세요.</div>
          <Button onClick={() => onNavigate("login")}>로그인하러 가기</Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div style={{ marginBottom: 6 }}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>비밀번호 찾기</div>
        <div style={{ fontSize: 12, color: C.textSub }}>가입한 이메일로 인증코드를 발송해드립니다.</div>
      </div>

      <StepIndicator />

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {step === 1 && (
          <>
            <Input
              label="가입한 이메일"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              error={errors.email}
            />
            <Button onClick={handleStep1} disabled={loading}>
              {loading ? "발송 중..." : "인증코드 발송"}
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <div style={{ background: C.blueBg, borderRadius: 9, padding: "10px 13px", fontSize: 12, color: C.blueText }}>
              📧 <strong>{email}</strong>으로 인증코드를 발송했습니다.
            </div>
            <div>
              <Input
                label="인증코드 6자리"
                placeholder="000000"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                error={errors.code}
                rightEl={
                  <span style={{ fontSize: 12, fontWeight: 600, color: timer > 0 ? C.red : C.textHint }}>
                    {timer > 0 ? formatTime(timer) : "만료"}
                  </span>
                }
              />
            </div>
            <Button onClick={handleStep2} disabled={loading || timer === 0}>
              {loading ? "확인 중..." : "인증코드 확인"}
            </Button>
            <button
              onClick={() => { startTimer(); }}
              style={{ background: "none", border: "none", fontSize: 12, color: C.blue, cursor: "pointer", textAlign: "center" }}
            >인증코드 재발송</button>
          </>
        )}

        {step === 3 && (
          <>
            <div>
              <Input
                label="새 비밀번호"
                type={showPw ? "text" : "password"}
                placeholder="8자 이상, 영문+숫자+특수문자"
                value={newPw}
                onChange={e => setNewPw(e.target.value)}
                error={errors.newPw}
                rightEl={
                  <span onClick={() => setShowPw(!showPw)} style={{ fontSize: 16, cursor: "pointer", color: C.textHint }}>
                    {showPw ? "🙈" : "👁"}
                  </span>
                }
              />
              <div style={{ marginTop: 6 }}>
                <PasswordStrength password={newPw} />
              </div>
            </div>
            <Input
              label="새 비밀번호 확인"
              type="password"
              placeholder="비밀번호 재입력"
              value={confirmPw}
              onChange={e => setConfirmPw(e.target.value)}
              error={errors.confirmPw}
            />
            <Button onClick={handleStep3} disabled={loading}>
              {loading ? "변경 중..." : "비밀번호 변경"}
            </Button>
          </>
        )}
      </div>

      <div style={{ textAlign: "center", marginTop: 18, fontSize: 12, color: C.textSub }}>
        <span onClick={() => onNavigate("login")} style={{ color: C.blue, fontWeight: 600, cursor: "pointer" }}>
          ← 로그인으로 돌아가기
        </span>
      </div>
    </AuthLayout>
  );
}

// ── 앱 루트 ─────────────────────────────────────────────────
export default function AuthPages({ onLoginSuccess }) {
  const [page, setPage] = useState("login");
  if (page === "signup") return <SignupPage onNavigate={setPage} />;
  if (page === "forgot") return <ForgotPage onNavigate={setPage} />;
  return <LoginPage onNavigate={setPage} onLoginSuccess={onLoginSuccess} />;
}