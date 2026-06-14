"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { T, S } from "../../../components/shop/theme";
import { useAuth } from "../../../lib/auth";

// ── 섹션 래퍼 ────────────────────────────────────────────────
function Section({ title, comment, children }) {
  return (
    <div style={{
      background: T.bgCard, border: `1px solid ${T.border}`,
      borderRadius: 16, overflow: "hidden", marginBottom: 16,
    }}>
      <div style={{
        padding: "16px 22px", borderBottom: `1px solid ${T.border}`,
        display: "flex", alignItems: "baseline", gap: 12,
      }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: T.text }}>{title}</div>
        {comment && (
          <div style={{ fontSize: 11, color: T.textHint, fontFamily: S.mono }}>{comment}</div>
        )}
      </div>
      <div style={{ padding: "20px 22px" }}>{children}</div>
    </div>
  );
}

// ── 필드 래퍼 ────────────────────────────────────────────────
function Field({ label, hint, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{
        fontSize: 12, fontWeight: 700, color: T.textSub,
        fontFamily: S.mono, marginBottom: 6,
      }}>
        {label}
      </div>
      {children}
      {hint && (
        <div style={{ fontSize: 11, color: T.textHint, marginTop: 5, fontFamily: S.mono }}>
          // {hint}
        </div>
      )}
    </div>
  );
}

// ── 인풋 스타일 ──────────────────────────────────────────────
const inputBase = {
  width: "100%", height: 44, borderRadius: 10,
  border: `1.5px solid ${T.border}`,
  background: T.bgRaised, color: T.text,
  padding: "0 14px", fontSize: 13.5,
  outline: "none", boxSizing: "border-box",
  fontFamily: "inherit",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

// ── 토글 스위치 ──────────────────────────────────────────────
function Toggle({ on, onChange }) {
  return (
    <div
      onClick={() => onChange(!on)}
      style={{
        width: 44, height: 24, borderRadius: 12,
        background: on ? T.violet : T.bgSubtle,
        border: `1px solid ${on ? T.violet : T.borderMid}`,
        position: "relative", cursor: "pointer",
        transition: "background 0.2s, border-color 0.2s",
        flexShrink: 0,
      }}
    >
      <div style={{
        position: "absolute", top: 3,
        left: on ? 22 : 3,
        width: 16, height: 16, borderRadius: "50%",
        background: on ? "#fff" : T.textHint,
        transition: "left 0.2s ease",
        boxShadow: on ? "0 2px 6px rgba(99,102,241,0.4)" : "none",
      }} />
    </div>
  );
}

// ── 설정 행 ─────────────────────────────────────────────────
function SettingRow({ icon, label, desc, children }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: 16, padding: "13px 0",
      borderBottom: `1px solid ${T.border}`,
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <span style={{
          fontSize: 16, color: T.violet, fontFamily: S.mono,
          width: 22, textAlign: "center", flexShrink: 0, marginTop: 1,
        }}>{icon}</span>
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: T.text }}>{label}</div>
          {desc && <div style={{ fontSize: 11.5, color: T.textHint, marginTop: 2 }}>{desc}</div>}
        </div>
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}

// ── 탭 정의 ─────────────────────────────────────────────────
const TABS = [
  { id: "profile",   label: "profile.ts",   icon: "◈" },
  { id: "security",  label: "security.ts",  icon: "⚿" },
  { id: "notify",    label: "notify.ts",    icon: "◎" },
  { id: "billing",   label: "billing.ts",   icon: "▣" },
  { id: "danger",    label: "danger.ts",    icon: "⚠" },
];

// ── 메인 ────────────────────────────────────────────────────
export default function SettingsPage() {
  const { user, login, logout, isLoggedIn } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState("profile");
  const [saved, setSaved] = useState(false);

  // 미로그인 → 로그인 페이지
  useEffect(() => {
    if (!isLoggedIn) router.push("/shop/login/");
  }, [isLoggedIn, router]);

  // 프로필 폼 상태
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    bio: "",
    website: "",
    github: "",
    twitter: "",
  });

  // 보안 상태
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });

  // 알림 상태
  const [notify, setNotify] = useState({
    orderComplete: true,
    newProduct: true,
    newsletter: false,
    security: true,
    updates: true,
  });

  const setF = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const setP = k => e => setPwForm(f => ({ ...f, [k]: e.target.value }));
  const toggleNotify = k => v => setNotify(n => ({ ...n, [k]: v }));

  const handleSave = () => {
    login({ ...user, name: form.name, email: form.email });
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  if (!isLoggedIn) return null;

  return (
    <div style={{ ...S.wrap, paddingTop: 40, paddingBottom: 60 }}>

      {/* 저장 완료 토스트 */}
      {saved && (
        <div className="sh-toast" style={{
          position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)",
          zIndex: 300, display: "flex", alignItems: "center", gap: 10,
          background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
          color: "#fff", padding: "12px 20px", borderRadius: 12,
          fontSize: 13, fontWeight: 600, fontFamily: S.mono,
          boxShadow: "0 12px 40px rgba(99,102,241,0.4)",
          whiteSpace: "nowrap",
        }}>
          ✓ settings saved successfully
        </div>
      )}

      {/* 페이지 헤더 */}
      <div className="sh-fadeup" style={{ marginBottom: 32 }}>
        <div style={S.eyebrow}>// Account</div>
        <h1 style={{
          fontSize: "clamp(26px,4vw,40px)", fontWeight: 800,
          letterSpacing: "-0.035em", margin: "8px 0 6px", color: T.text,
        }}>
          계정 설정
        </h1>
        <div style={{ fontSize: 13, color: T.textHint, fontFamily: S.mono }}>
          {user.email}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "200px minmax(0,1fr)", gap: 24, alignItems: "start" }}>

        {/* ── 사이드 탭 ── */}
        <div style={{
          background: T.bgCard, border: `1px solid ${T.border}`,
          borderRadius: 14, overflow: "hidden",
          position: "sticky", top: 84,
        }}>
          {/* 유저 요약 */}
          <div style={{
            padding: "18px 16px", borderBottom: `1px solid ${T.border}`,
            textAlign: "center",
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
              color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, fontWeight: 800, fontFamily: S.mono,
              margin: "0 auto 10px",
            }}>
              {user.avatar}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 3 }}>
              {user.name}
            </div>
            <span style={{
              fontSize: 10, padding: "2px 9px", borderRadius: 6,
              background: T.violetBg, color: T.violet,
              border: `1px solid ${T.violet}40`, fontFamily: S.mono, fontWeight: 700,
            }}>
              {user.plan} Plan
            </span>
          </div>

          {/* 탭 목록 */}
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "11px 16px", border: "none",
                background: tab === t.id ? T.violetBg : "transparent",
                borderLeft: `3px solid ${tab === t.id ? T.violet : "transparent"}`,
                color: tab === t.id ? T.violet : T.textSub,
                fontSize: 12.5, fontWeight: tab === t.id ? 700 : 500,
                cursor: "pointer", textAlign: "left",
                fontFamily: S.mono,
                transition: "background 0.15s, color 0.15s",
              }}
            >
              <span style={{ fontSize: 13 }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── 우측 콘텐츠 ── */}
        <div>

          {/* ━━ 프로필 ━━ */}
          {tab === "profile" && (
            <>
              <Section title="프로필 정보" comment="// public profile">
                {/* 아바타 */}
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, paddingBottom: 20, borderBottom: `1px solid ${T.border}` }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: 16,
                    background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                    color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 28, fontWeight: 800, fontFamily: S.mono, flexShrink: 0,
                  }}>
                    {user.avatar}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 6 }}>프로필 이미지</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button style={{
                        height: 34, padding: "0 14px", borderRadius: 8,
                        background: T.bgSubtle, border: `1px solid ${T.borderMid}`,
                        color: T.textSub, fontSize: 12, fontWeight: 600, cursor: "pointer",
                      }}>업로드</button>
                      <button style={{
                        height: 34, padding: "0 14px", borderRadius: 8,
                        background: "transparent", border: `1px solid ${T.border}`,
                        color: T.textHint, fontSize: 12, cursor: "pointer",
                      }}>제거</button>
                    </div>
                    <div style={{ fontSize: 11, color: T.textHint, marginTop: 6, fontFamily: S.mono }}>
                      // PNG, JPG · 최대 2MB
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <Field label="// name">
                    <input
                      style={inputBase} value={form.name}
                      onChange={setF("name")}
                      onFocus={e => { e.target.style.borderColor = T.violet; e.target.style.boxShadow = `0 0 0 3px ${T.violetBg}`; }}
                      onBlur={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = "none"; }}
                    />
                  </Field>
                  <Field label="// email">
                    <input
                      style={inputBase} value={form.email} type="email"
                      onChange={setF("email")}
                      onFocus={e => { e.target.style.borderColor = T.violet; e.target.style.boxShadow = `0 0 0 3px ${T.violetBg}`; }}
                      onBlur={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = "none"; }}
                    />
                  </Field>
                </div>

                <Field label="// bio" hint="자기소개 (최대 160자)">
                  <textarea
                    value={form.bio} onChange={setF("bio")}
                    placeholder="Frontend developer who loves clean code..."
                    rows={3}
                    style={{
                      ...inputBase, height: "auto", padding: "10px 14px",
                      resize: "vertical", lineHeight: 1.6,
                    }}
                    onFocus={e => { e.target.style.borderColor = T.violet; e.target.style.boxShadow = `0 0 0 3px ${T.violetBg}`; }}
                    onBlur={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = "none"; }}
                  />
                </Field>

                <Field label="// website">
                  <div style={{ position: "relative" }}>
                    <span style={{
                      position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                      fontSize: 12, color: T.textHint, fontFamily: S.mono,
                    }}>https://</span>
                    <input
                      style={{ ...inputBase, paddingLeft: 72 }}
                      value={form.website} onChange={setF("website")}
                      placeholder="yoursite.dev"
                      onFocus={e => { e.target.style.borderColor = T.violet; e.target.style.boxShadow = `0 0 0 3px ${T.violetBg}`; }}
                      onBlur={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = "none"; }}
                    />
                  </div>
                </Field>
              </Section>

              <Section title="소셜 링크" comment="// social.config">
                <Field label="// github">
                  <div style={{ position: "relative" }}>
                    <span style={{
                      position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                      fontSize: 12, color: T.textHint, fontFamily: S.mono,
                    }}>github.com/</span>
                    <input
                      style={{ ...inputBase, paddingLeft: 96 }}
                      value={form.github} onChange={setF("github")}
                      placeholder="username"
                      onFocus={e => { e.target.style.borderColor = T.violet; e.target.style.boxShadow = `0 0 0 3px ${T.violetBg}`; }}
                      onBlur={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = "none"; }}
                    />
                  </div>
                </Field>
                <Field label="// twitter / X">
                  <div style={{ position: "relative" }}>
                    <span style={{
                      position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                      fontSize: 14, color: T.textHint, fontFamily: S.mono,
                    }}>@</span>
                    <input
                      style={{ ...inputBase, paddingLeft: 34 }}
                      value={form.twitter} onChange={setF("twitter")}
                      placeholder="handle"
                      onFocus={e => { e.target.style.borderColor = T.violet; e.target.style.boxShadow = `0 0 0 3px ${T.violetBg}`; }}
                      onBlur={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = "none"; }}
                    />
                  </div>
                </Field>
              </Section>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button style={{
                  height: 42, padding: "0 20px", borderRadius: 10,
                  border: `1px solid ${T.border}`, background: "transparent",
                  color: T.textSub, fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}>취소</button>
                <button onClick={handleSave} className="sh-btn" style={{
                  ...S.btnPrimary, height: 42, padding: "0 24px", fontSize: 13,
                }}>
                  변경사항 저장
                </button>
              </div>
            </>
          )}

          {/* ━━ 보안 ━━ */}
          {tab === "security" && (
            <>
              <Section title="비밀번호 변경" comment="// auth.password">
                <Field label="// current_password">
                  <input
                    type="password" style={inputBase}
                    value={pwForm.current} onChange={setP("current")}
                    placeholder="현재 비밀번호"
                    onFocus={e => { e.target.style.borderColor = T.violet; e.target.style.boxShadow = `0 0 0 3px ${T.violetBg}`; }}
                    onBlur={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = "none"; }}
                  />
                </Field>
                <Field label="// new_password" hint="8자 이상, 대소문자+숫자+특수문자 포함">
                  <input
                    type="password" style={inputBase}
                    value={pwForm.next} onChange={setP("next")}
                    placeholder="새 비밀번호"
                    onFocus={e => { e.target.style.borderColor = T.violet; e.target.style.boxShadow = `0 0 0 3px ${T.violetBg}`; }}
                    onBlur={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = "none"; }}
                  />
                  {/* 강도 바 */}
                  {pwForm.next && (
                    <div style={{ marginTop: 8, display: "flex", gap: 4 }}>
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} style={{
                          flex: 1, height: 3, borderRadius: 2,
                          background: pwForm.next.length >= i * 3
                            ? i <= 1 ? T.red : i <= 2 ? T.amber : i <= 3 ? T.violet : T.green
                            : T.border,
                          transition: "background 0.3s",
                        }} />
                      ))}
                    </div>
                  )}
                </Field>
                <Field label="// confirm_password">
                  <input
                    type="password" style={{
                      ...inputBase,
                      borderColor: pwForm.confirm && pwForm.confirm !== pwForm.next ? T.red : T.border,
                    }}
                    value={pwForm.confirm} onChange={setP("confirm")}
                    placeholder="새 비밀번호 확인"
                    onFocus={e => { e.target.style.boxShadow = `0 0 0 3px ${T.violetBg}`; }}
                    onBlur={e => { e.target.style.boxShadow = "none"; }}
                  />
                  {pwForm.confirm && pwForm.confirm !== pwForm.next && (
                    <div style={{ fontSize: 11, color: T.red, marginTop: 5, fontFamily: S.mono }}>
                      // 비밀번호가 일치하지 않습니다
                    </div>
                  )}
                </Field>
                <button className="sh-btn" style={{ ...S.btnPrimary, height: 42, padding: "0 24px", fontSize: 13 }}>
                  비밀번호 변경
                </button>
              </Section>

              <Section title="2단계 인증" comment="// auth.2fa">
                <SettingRow icon="⌘" label="TOTP 인증 앱" desc="Google Authenticator, 1Password 등">
                  <button style={{
                    height: 34, padding: "0 14px", borderRadius: 8,
                    background: T.greenBg, border: `1px solid ${T.green}40`,
                    color: T.green, fontSize: 12, fontWeight: 700, cursor: "pointer",
                    fontFamily: S.mono,
                  }}>설정하기</button>
                </SettingRow>
                <SettingRow icon="◻" label="보안 키 (WebAuthn)" desc="하드웨어 키, Face ID, Touch ID">
                  <button style={{
                    height: 34, padding: "0 14px", borderRadius: 8,
                    background: T.bgSubtle, border: `1px solid ${T.borderMid}`,
                    color: T.textSub, fontSize: 12, fontWeight: 600, cursor: "pointer",
                  }}>추가</button>
                </SettingRow>
              </Section>

              <Section title="활성 세션" comment="// sessions.list">
                {[
                  { device: "Chrome / macOS", ip: "211.xxx.xxx.12", location: "Seoul, KR", current: true, time: "현재 세션" },
                  { device: "Safari / iPhone", ip: "175.xxx.xxx.88", location: "Seoul, KR", current: false, time: "2일 전" },
                ].map((s, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "12px 0", borderBottom: `1px solid ${T.border}`, gap: 12,
                  }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: s.current ? T.violetBg : T.bgSubtle,
                        border: `1px solid ${s.current ? T.violet : T.border}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 16, flexShrink: 0,
                      }}>
                        {s.device.includes("iPhone") ? "📱" : "💻"}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: T.text, display: "flex", gap: 8, alignItems: "center" }}>
                          {s.device}
                          {s.current && (
                            <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 5, background: T.greenBg, color: T.green, fontFamily: S.mono, fontWeight: 700 }}>
                              current
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 11, color: T.textHint, fontFamily: S.mono, marginTop: 2 }}>
                          {s.ip} · {s.location} · {s.time}
                        </div>
                      </div>
                    </div>
                    {!s.current && (
                      <button style={{
                        height: 30, padding: "0 12px", borderRadius: 7,
                        background: T.redBg, border: `1px solid ${T.red}40`,
                        color: T.red, fontSize: 11, fontWeight: 700, cursor: "pointer",
                        fontFamily: S.mono,
                      }}>종료</button>
                    )}
                  </div>
                ))}
              </Section>
            </>
          )}

          {/* ━━ 알림 ━━ */}
          {tab === "notify" && (
            <>
              <Section title="이메일 알림" comment="// notify.email">
                {[
                  { key: "orderComplete", icon: "↓", label: "주문 완료", desc: "결제 완료 및 다운로드 링크 발송 시" },
                  { key: "newProduct", icon: "◈", label: "신규 제품 출시", desc: "새로운 제품이 등록될 때" },
                  { key: "updates", icon: "⟳", label: "구매 제품 업데이트", desc: "보유 라이선스의 새 버전 출시 시" },
                  { key: "security", icon: "⚿", label: "보안 알림", desc: "새 로그인, 비밀번호 변경 감지 시" },
                  { key: "newsletter", icon: "◎", label: "뉴스레터", desc: "개발 팁, 튜토리얼, 할인 소식" },
                ].map(item => (
                  <SettingRow key={item.key} icon={item.icon} label={item.label} desc={item.desc}>
                    <Toggle on={notify[item.key]} onChange={toggleNotify(item.key)} />
                  </SettingRow>
                ))}
              </Section>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button onClick={handleSave} className="sh-btn" style={{ ...S.btnPrimary, height: 42, padding: "0 24px", fontSize: 13 }}>
                  알림 설정 저장
                </button>
              </div>
            </>
          )}

          {/* ━━ 빌링 ━━ */}
          {tab === "billing" && (
            <>
              <Section title="현재 플랜" comment="// billing.plan">
                <div style={{
                  background: T.bgRaised, borderRadius: 12, padding: "20px",
                  border: `1px solid ${T.violet}30`, marginBottom: 16,
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
                }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <span style={{ fontSize: 18, fontFamily: S.mono, color: T.violet }}>◈</span>
                      <span style={{ fontSize: 16, fontWeight: 800, color: T.text }}>{user.plan} Plan</span>
                      <span style={{
                        fontSize: 10, padding: "2px 8px", borderRadius: 5,
                        background: T.greenBg, color: T.green, fontFamily: S.mono, fontWeight: 700,
                      }}>active</span>
                    </div>
                    <div style={{ fontSize: 12, color: T.textHint, fontFamily: S.mono }}>
                      // 가입일: {user.joinedAt}
                    </div>
                  </div>
                  <button className="sh-btn" style={{ ...S.btnGhost, height: 38, padding: "0 18px", fontSize: 13 }}>
                    플랜 변경
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  {[
                    { label: "총 구매", value: "3개" },
                    { label: "활성 라이선스", value: "3개" },
                    { label: "가입일", value: user.joinedAt },
                  ].map(stat => (
                    <div key={stat.label} style={{
                      background: T.bgCard, border: `1px solid ${T.border}`,
                      borderRadius: 10, padding: "12px 14px",
                    }}>
                      <div style={{ fontSize: 10, color: T.textHint, fontFamily: S.mono, marginBottom: 5 }}>
                        // {stat.label}
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: T.text, fontFamily: S.mono }}>
                        {stat.value}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>

              <Section title="결제 수단" comment="// billing.payment">
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  padding: "32px", color: T.textHint, flexDirection: "column", gap: 10,
                }}>
                  <span style={{ fontSize: 32, fontFamily: S.mono }}>💳</span>
                  <div style={{ fontSize: 13, color: T.textSub }}>등록된 결제 수단이 없습니다</div>
                  <button className="sh-btn" style={{ ...S.btnPrimary, height: 40, padding: "0 20px", fontSize: 13, marginTop: 6 }}>
                    + 결제 수단 추가
                  </button>
                </div>
              </Section>
            </>
          )}

          {/* ━━ 위험 구역 ━━ */}
          {tab === "danger" && (
            <Section title="위험 구역" comment="// danger.zone">
              <div style={{
                background: T.redBg, border: `1px solid ${T.red}30`,
                borderRadius: 10, padding: "14px 16px", marginBottom: 16,
                fontSize: 12.5, color: T.textSub, fontFamily: S.mono, lineHeight: 1.7,
              }}>
                // ⚠ 아래 작업은 되돌릴 수 없습니다.<br />
                // 신중하게 진행해주세요.
              </div>

              {[
                {
                  icon: "⟳", label: "모든 세션 로그아웃",
                  desc: "현재 기기를 제외한 모든 세션을 종료합니다.",
                  btnLabel: "전체 로그아웃", btnColor: T.amber, btnBg: T.amberBg,
                  onClick: () => {},
                },
                {
                  icon: "◻", label: "데이터 내보내기",
                  desc: "계정 정보, 주문 내역, 라이선스 정보를 JSON으로 내보냅니다.",
                  btnLabel: "내보내기", btnColor: T.violet, btnBg: T.violetBg,
                  onClick: () => {},
                },
                {
                  icon: "✕", label: "계정 삭제",
                  desc: "계정과 모든 데이터를 영구적으로 삭제합니다. 라이선스도 만료됩니다.",
                  btnLabel: "계정 삭제", btnColor: T.red, btnBg: T.redBg,
                  onClick: () => { logout(); router.push("/shop/"); },
                },
              ].map((item, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  gap: 16, padding: "16px 0",
                  borderBottom: `1px solid ${T.border}`,
                }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 16, color: T.red, fontFamily: S.mono, marginTop: 1 }}>{item.icon}</span>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: T.text, marginBottom: 3 }}>{item.label}</div>
                      <div style={{ fontSize: 12, color: T.textHint }}>{item.desc}</div>
                    </div>
                  </div>
                  <button
                    onClick={item.onClick}
                    style={{
                      height: 36, padding: "0 16px", borderRadius: 9, flexShrink: 0,
                      background: item.btnBg,
                      border: `1px solid ${item.btnColor}40`,
                      color: item.btnColor,
                      fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: S.mono,
                      transition: "opacity 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = "0.8"}
                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                  >
                    {item.btnLabel}
                  </button>
                </div>
              ))}
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}