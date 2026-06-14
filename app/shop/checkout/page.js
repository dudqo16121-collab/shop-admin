"use client";

import Link from "next/link";
import { useState } from "react";
import { T, S, CAT_TINT_V2 } from "../../../components/shop/theme";
import { fmtWon, applyCoupon } from "../../../lib/store-data";
import { useCart } from "../../../lib/cart";

const PAY_METHODS = [
  { id: "card", label: "신용카드", icon: "💳" },
  { id: "kakao", label: "카카오페이", icon: "💛" },
  { id: "naver", label: "네이버페이", icon: "🟢" },
  { id: "bank", label: "무통장입금", icon: "🏦" },
];

const inputStyle = {
  width: "100%", height: 46, borderRadius: 10,
  border: "1.5px solid #1E1E2E",
  background: "#16161F",
  color: "#F8FAFC",
  padding: "0 14px", fontSize: 14,
  outline: "none", boxSizing: "border-box",
};

function Field({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#94A3B8", marginBottom: 7, fontFamily: "'JetBrains Mono',monospace" }}>
        {label}
      </div>
      {children}
    </div>
  );
}

export default function CheckoutPage() {
  const cart = useCart();
  const [form, setForm] = useState({ name: "", phone: "", addr: "", memo: "" });
  const [pay, setPay] = useState("card");
  const [agreed, setAgreed] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(null);
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState(null);
  const [couponMsg, setCouponMsg] = useState(null);

  const discount = coupon ? coupon.discount : 0;
  const payTotal = cart.total - discount;

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const valid = form.name.trim() && form.phone.trim() && form.addr.trim() && agreed && cart.count > 0;

  const tryCoupon = () => {
    const res = applyCoupon(couponInput, cart.subtotal);
    if (res.ok) { setCoupon(res); setCouponMsg(null); setCouponInput(""); }
    else { setCoupon(null); setCouponMsg(res.msg); }
  };

  const submit = () => {
    if (!valid || processing) return;
    setProcessing(true);
    setTimeout(() => {
      const order = cart.placeOrder({ ...form, pay, coupon: coupon?.coupon.code || null, discount });
      setDone({ ...order, total: payTotal });
      setProcessing(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 900);
  };

  // ━━ 완료 화면 ━━
  if (done) {
    return (
      <div style={{ ...S.wrap, maxWidth: 560, paddingTop: 90, paddingBottom: 60, textAlign: "center" }}>
        <div className="sh-check" style={{
          width: 80, height: 80, borderRadius: "50%",
          background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
          color: "#fff", margin: "0 auto 24px",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34,
        }}>✓</div>
        <div style={S.eyebrow}>Order Complete</div>
        <h1 style={{ fontSize: "clamp(26px,5vw,38px)", fontWeight: 800, letterSpacing: "-0.03em", margin: "10px 0 14px", color: T.text }}>
          주문이 완료됐어요
        </h1>
        <p style={{ fontSize: 14, color: T.textSub, marginBottom: 6 }}>
          주문번호 <span style={{ color: T.violet, fontFamily: S.mono, fontWeight: 700 }}>{done.no}</span>
        </p>
        <p style={{ fontSize: 14, color: T.textSub, marginBottom: 28 }}>
          {done.name}님, 다운로드 링크를 이메일로 발송했습니다.
        </p>

        <div style={{
          background: T.bgCard, border: `1px solid ${T.border}`,
          borderRadius: 16, padding: "18px 22px", textAlign: "left", marginBottom: 28,
        }}>
          {done.items?.map((it, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between", fontSize: 13,
              padding: "9px 0", borderBottom: i < done.items.length - 1 ? `1px solid ${T.border}` : "none",
            }}>
              <span style={{ color: T.textSub }}>
                {it.name} <span style={{ color: T.textHint, fontFamily: S.mono }}>· {it.opt} · {it.qty}개</span>
              </span>
              <span style={{ fontWeight: 700, color: T.text }}>{fmtWon(it.price * it.qty)}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: 16, fontWeight: 800 }}>
            <span style={{ color: T.text }}>총 결제</span>
            <span style={{ color: T.violet }}>{fmtWon(done.total)}</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <Link href="/shop/products/" className="sh-btn" style={S.btnPrimary}>쇼핑 계속하기</Link>
          <Link href="/shop/orders/" className="sh-btn" style={S.btnGhost}>주문 내역</Link>
        </div>
      </div>
    );
  }

  // ━━ 빈 장바구니 ━━
  if (cart.count === 0) {
    return (
      <div style={{ ...S.wrap, paddingTop: 110, paddingBottom: 80, textAlign: "center" }}>
        <div style={{ fontSize: 40, fontFamily: S.mono, color: T.textHint, marginBottom: 16 }}>⬡</div>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, color: T.text }}>장바구니가 비어 있어요</h1>
        <p style={{ fontSize: 14, color: T.textSub, marginBottom: 24 }}>마음에 드는 제품을 담고 다시 와주세요.</p>
        <Link href="/shop/products/" className="sh-btn" style={{ ...S.btnPrimary, display: "inline-flex" }}>
          제품 보러 가기 →
        </Link>
      </div>
    );
  }

  // ━━ 결제 폼 ━━
  return (
    <div style={{ ...S.wrap, paddingTop: 48, paddingBottom: 40 }}>
      <div className="sh-fadeup" style={{ marginBottom: 32 }}>
        <div style={S.eyebrow}>// Checkout</div>
        <h1 style={{ fontSize: "clamp(28px,5vw,44px)", fontWeight: 800, letterSpacing: "-0.035em", marginTop: 8, color: T.text }}>
          주문하기
        </h1>
      </div>

      <div className="sh-checkout-grid">
        {/* 좌: 폼 */}
        <div className="sh-fadeup" style={{ animationDelay: "80ms", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* 배송 정보 */}
          <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, padding: "22px 24px" }}>
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 18, color: T.text }}>
              📍 배송 정보
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="// name *">
                  <input style={inputStyle} value={form.name} onChange={set("name")} placeholder="이름" />
                </Field>
                <Field label="// phone *">
                  <input style={inputStyle} value={form.phone} onChange={set("phone")} placeholder="010-0000-0000" />
                </Field>
              </div>
              <Field label="// address *">
                <input style={inputStyle} value={form.addr} onChange={set("addr")} placeholder="주소를 입력하세요" />
              </Field>
              <Field label="// memo">
                <input style={inputStyle} value={form.memo} onChange={set("memo")} placeholder="이메일 수령 주소 등 메모" />
              </Field>
            </div>
          </div>

          {/* 결제 수단 */}
          <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, padding: "22px 24px" }}>
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 18, color: T.text }}>💳 결제 수단</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10 }}>
              {PAY_METHODS.map(m => (
                <button
                  key={m.id}
                  onClick={() => setPay(m.id)}
                  className="sh-chip"
                  style={{
                    height: 68, borderRadius: 12,
                    border: `1.5px solid ${pay === m.id ? T.violet : T.borderMid}`,
                    background: pay === m.id ? T.violetBg : T.bgRaised,
                    cursor: "pointer",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
                  }}
                >
                  <span style={{ fontSize: 20 }}>{m.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: pay === m.id ? 800 : 600, color: pay === m.id ? T.violet : T.textSub }}>
                    {m.label}
                  </span>
                </button>
              ))}
            </div>
            {pay === "bank" && (
              <div style={{ marginTop: 14, padding: "12px 14px", background: T.bgRaised, borderRadius: 10, border: `1px solid ${T.border}`, fontSize: 12.5, color: T.textSub, fontFamily: S.mono }}>
                국민은행 000-00-000000 (ShopAdmin) · 24시간 내 미입금 시 자동 취소
              </div>
            )}
          </div>

          {/* 쿠폰 */}
          <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, padding: "22px 24px" }}>
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 14, color: T.text }}>🎫 쿠폰</div>
            {coupon ? (
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
                padding: "11px 14px", background: T.greenBg,
                borderRadius: 10, border: `1px solid ${T.green}40`,
              }}>
                <span style={{ fontSize: 13, color: T.green, fontFamily: S.mono }}>
                  ✓ {coupon.coupon.code} — {fmtWon(coupon.discount)} 할인
                </span>
                <button onClick={() => setCoupon(null)} style={{ border: "none", background: "none", fontSize: 12, fontWeight: 700, color: T.textHint, cursor: "pointer" }}>
                  해제
                </button>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    style={{ ...inputStyle, flex: 1, textTransform: "uppercase", fontFamily: S.mono }}
                    value={couponInput}
                    onChange={e => { setCouponInput(e.target.value); setCouponMsg(null); }}
                    onKeyDown={e => e.key === "Enter" && tryCoupon()}
                    placeholder="WELCOME5000 · DEV20"
                  />
                  <button onClick={tryCoupon} className="sh-btn" style={{ ...S.btnPrimary, height: 46, padding: "0 20px" }}>
                    적용
                  </button>
                </div>
                {couponMsg && <div style={{ fontSize: 12, color: T.red, marginTop: 8, fontFamily: S.mono }}>// {couponMsg}</div>}
              </>
            )}
          </div>

          {/* 동의 */}
          <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: T.textSub, cursor: "pointer", padding: "0 4px" }}>
            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ width: 16, height: 16, accentColor: T.violet }} />
            주문 상품 정보 및 결제 진행에 동의합니다 (필수)
          </label>
        </div>

        {/* 우: 주문 요약 (스티키) */}
        <div className="sh-fadeup" style={{ animationDelay: "160ms", position: "sticky", top: 84 }}>
          <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, padding: "22px 24px" }}>
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 16, color: T.text }}>주문 제품 {cart.count}개</div>

            <div style={{ maxHeight: 260, overflowY: "auto", marginBottom: 16 }}>
              {cart.items.map(it => (
                <div key={`${it.id}:${it.opt}`} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: 10,
                    background: CAT_TINT_V2[it.p.cat], border: `1px solid ${T.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22, flexShrink: 0, fontFamily: S.mono,
                  }}>
                    {it.p.thumb}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: T.text }}>
                      {it.p.name}
                    </div>
                    <div style={{ fontSize: 11, color: T.textHint, fontFamily: S.mono }}>{it.opt} · {it.qty}개</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, flexShrink: 0, color: T.text }}>{fmtWon(it.p.price * it.qty)}</div>
                </div>
              ))}
            </div>

            {[
              ["상품 금액", fmtWon(cart.subtotal), null],
              ["배송비", "무료 (디지털)", T.green],
              ...(coupon ? [["쿠폰 할인", `−${fmtWon(discount)}`, T.green]] : []),
            ].map(([k, v, c]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 7 }}>
                <span style={{ color: T.textSub }}>{k}</span>
                <span style={{ color: c || T.textSub }}>{v}</span>
              </div>
            ))}

            <div style={{
              display: "flex", justifyContent: "space-between",
              fontSize: 18, fontWeight: 800,
              paddingTop: 14, borderTop: `1px solid ${T.border}`,
              marginTop: 6, marginBottom: 18,
            }}>
              <span style={{ color: T.text }}>총 결제 금액</span>
              <span style={{ color: T.violet }}>{fmtWon(payTotal)}</span>
            </div>

            <button
              onClick={submit}
              disabled={!valid || processing}
              className="sh-btn"
              style={{ ...S.btnPrimary, width: "100%", height: 52, borderRadius: 12, fontSize: 15 }}
            >
              {processing ? "// 결제 진행 중..." : `${fmtWon(payTotal)} 결제하기`}
            </button>

            <div style={{ textAlign: "center", fontSize: 11, color: T.textHint, marginTop: 12, fontFamily: S.mono }}>
              // 결제 즉시 다운로드 · 14일 환불 보장
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
