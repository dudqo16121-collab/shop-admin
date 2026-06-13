"use client";

// ── 주문/결제: 배송 정보 → 결제 수단 → 완료 화면 ─────────────
import Link from "next/link";
import { useState } from "react";
import { C, S } from "../../../components/shop/theme";
import { CAT_TINT, fmtWon, applyCoupon } from "../../../lib/store-data";
import { useCart } from "../../../lib/cart";

const PAY_METHODS = [
  { id: "card", label: "신용카드", icon: "💳" },
  { id: "kakao", label: "카카오페이", icon: "💛" },
  { id: "naver", label: "네이버페이", icon: "🟢" },
  { id: "bank", label: "무통장입금", icon: "🏦" },
];

const inputStyle = {
  width: "100%", height: 46, borderRadius: 11,
  border: `1.5px solid ${C.border}`, background: C.surface,
  padding: "0 14px", fontSize: 14, color: C.text,
  outline: "none", boxSizing: "border-box",
};

function Field({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: C.textSub, marginBottom: 7 }}>{label}</div>
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
  const [done, setDone] = useState(null); // 완료된 주문
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState(null);     // { coupon, discount }
  const [couponMsg, setCouponMsg] = useState(null);

  const discount = coupon ? coupon.discount : 0;
  const payTotal = cart.total - discount;

  const tryCoupon = () => {
    const res = applyCoupon(couponInput, cart.subtotal);
    if (res.ok) { setCoupon(res); setCouponMsg(null); setCouponInput(""); }
    else { setCoupon(null); setCouponMsg(res.msg); }
  };

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const valid = form.name.trim() && form.phone.trim() && form.addr.trim() && agreed && cart.count > 0;

  const submit = () => {
    if (!valid || processing) return;
    setProcessing(true);
    // 데모용 결제 처리 — 실제 PG 연동 시 이 부분을 교체
    setTimeout(() => {
      const order = cart.placeOrder({ ...form, pay, coupon: coupon ? coupon.coupon.code : null, discount });
      setDone(order);
      setProcessing(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 900);
  };

  // ━━ 완료 화면 ━━
  if (done) {
    return (
      <div style={{ ...S.wrap, paddingTop: 90, paddingBottom: 60, maxWidth: 560, textAlign: "center" }}>
        <div
          className="sh-check"
          style={{
            width: 84, height: 84, borderRadius: "50%", margin: "0 auto 24px",
            background: C.accent, color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36,
          }}
        >
          ✓
        </div>
        <div style={S.eyebrow}>Order Complete</div>
        <h1 style={{ fontSize: "clamp(26px, 5vw, 38px)", fontWeight: 800, letterSpacing: "-0.03em", margin: "10px 0 12px" }}>
          주문이 완료됐어요
        </h1>
        <p style={{ fontSize: 14, color: C.textSub, marginBottom: 28 }}>
          주문번호 <strong style={{ color: C.text }}>{done.no}</strong> · 결제 금액 <strong style={{ color: C.text }}>{fmtWon(done.total)}</strong>
          <br />
          {done.name}님, 평일 오후 2시 이전 주문은 당일 출고됩니다.
        </p>

        {/* 주문 요약 */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, padding: "18px 22px", textAlign: "left", marginBottom: 28 }}>
          {done.items.map((it, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "9px 0", borderBottom: i < done.items.length - 1 ? `1px solid ${C.border}` : "none" }}>
              <span style={{ color: C.textSub }}>{it.name} <span style={{ color: C.textHint }}>· {it.opt} · {it.qty}개</span></span>
              <span style={{ fontWeight: 700 }}>{fmtWon(it.price * it.qty)}</span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <Link href="/shop/products/" className="sh-btn" style={S.btnPrimary}>쇼핑 계속하기</Link>
          <Link href="/shop/" className="sh-btn" style={S.btnGhost}>홈으로</Link>
        </div>
      </div>
    );
  }

  // ━━ 빈 장바구니 ━━
  if (cart.count === 0) {
    return (
      <div style={{ ...S.wrap, paddingTop: 110, paddingBottom: 80, textAlign: "center" }}>
        <div style={{ fontSize: 44, marginBottom: 16 }}>🛍</div>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>장바구니가 비어 있어요</h1>
        <p style={{ fontSize: 14, color: C.textSub, marginBottom: 24 }}>마음에 드는 상품을 담고 다시 와주세요.</p>
        <Link href="/shop/products/" className="sh-btn" style={{ ...S.btnPrimary, display: "inline-flex" }}>
          상품 보러 가기 →
        </Link>
      </div>
    );
  }

  // ━━ 결제 폼 ━━
  return (
    <div style={{ ...S.wrap, paddingTop: 48, paddingBottom: 40 }}>
      <div className="sh-fadeup" style={{ marginBottom: 30 }}>
        <div style={S.eyebrow}>Checkout</div>
        <h1 style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 800, letterSpacing: "-0.035em", marginTop: 8 }}>
          주문하기
        </h1>
      </div>

      <div className="sh-checkout-grid">
        {/* 좌: 폼 */}
        <div className="sh-fadeup" style={{ animationDelay: "80ms", display: "flex", flexDirection: "column", gap: 16 }}>
          {/* 배송 정보 */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, padding: "22px 24px" }}>
            <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 18 }}>📍 배송 정보</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="받는 분 *">
                  <input style={inputStyle} value={form.name} onChange={set("name")} placeholder="이름" />
                </Field>
                <Field label="연락처 *">
                  <input style={inputStyle} value={form.phone} onChange={set("phone")} placeholder="010-0000-0000" />
                </Field>
              </div>
              <Field label="배송지 주소 *">
                <input style={inputStyle} value={form.addr} onChange={set("addr")} placeholder="주소를 입력하세요" />
              </Field>
              <Field label="배송 메모">
                <input style={inputStyle} value={form.memo} onChange={set("memo")} placeholder="예) 문 앞에 놓아주세요" />
              </Field>
            </div>
          </div>

          {/* 결제 수단 */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, padding: "22px 24px" }}>
            <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 18 }}>💳 결제 수단</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10 }}>
              {PAY_METHODS.map(m => (
                <button
                  key={m.id}
                  onClick={() => setPay(m.id)}
                  className="sh-chip"
                  style={{
                    height: 70, borderRadius: 13,
                    border: `1.5px solid ${pay === m.id ? C.accent : C.border}`,
                    background: pay === m.id ? C.bg : C.surface,
                    cursor: "pointer",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
                  }}
                >
                  <span style={{ fontSize: 20 }}>{m.icon}</span>
                  <span style={{ fontSize: 12.5, fontWeight: pay === m.id ? 800 : 600, color: pay === m.id ? C.text : C.textSub }}>{m.label}</span>
                </button>
              ))}
            </div>
            {pay === "bank" && (
              <div style={{ marginTop: 14, padding: "12px 14px", background: C.bg, borderRadius: 11, fontSize: 12.5, color: C.textSub }}>
                국민은행 000-00-000000 (ShopAdmin 주식회사) · 24시간 내 미입금 시 자동 취소
              </div>
            )}
          </div>

{/* 쿠폰 */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, padding: "22px 24px" }}>
            <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 14 }}>🎫 쿠폰</div>
            {coupon ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "12px 14px", background: C.greenBg, borderRadius: 12 }}>
                <span style={{ fontSize: 13, color: C.greenText }}>
                  ✓ <strong>{coupon.coupon.code}</strong> 적용 — {fmtWon(coupon.discount)} 할인
                </span>
                <button
                  onClick={() => setCoupon(null)}
                  style={{ border: "none", background: "none", fontSize: 12, fontWeight: 700, color: C.textHint, cursor: "pointer" }}
                >해제</button>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    style={{ ...inputStyle, flex: 1, textTransform: "uppercase" }}
                    value={couponInput}
                    onChange={e => { setCouponInput(e.target.value); setCouponMsg(null); }}
                    onKeyDown={e => e.key === "Enter" && tryCoupon()}
                    placeholder="쿠폰 코드 입력 (예: WELCOME5000)"
                  />
                  <button onClick={tryCoupon} className="sh-btn" style={{ ...S.btnPrimary, height: 46, padding: "0 20px" }}>
                    적용
                  </button>
                </div>
                {couponMsg && <div style={{ fontSize: 12, color: C.red, marginTop: 8 }}>⚠ {couponMsg}</div>}
              </>
            )}
          </div>

          {/* 동의 */}
          <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: C.textSub, cursor: "pointer", padding: "0 4px" }}>
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              style={{ width: 17, height: 17, accentColor: C.accent }}
            />
            주문 상품 정보 및 결제 진행에 동의합니다 (필수)
          </label>
        </div>

        {/* 우: 주문 요약 (스티키) */}
        <div className="sh-fadeup" style={{ animationDelay: "160ms", position: "sticky", top: 84 }}>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, padding: "22px 24px" }}>
            <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 16 }}>주문 상품 {cart.count}개</div>

            <div style={{ maxHeight: 260, overflowY: "auto", marginBottom: 16 }}>
              {cart.items.map(it => (
                <div key={`${it.id}:${it.opt}`} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ width: 46, height: 54, borderRadius: 10, background: CAT_TINT[it.p.cat], border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                    {it.p.thumb}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.p.name}</div>
                    <div style={{ fontSize: 11, color: C.textHint }}>{it.opt} · {it.qty}개</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{fmtWon(it.p.price * it.qty)}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.textSub, marginBottom: 6 }}>
              <span>상품 금액</span><span>{fmtWon(cart.subtotal)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.textSub, marginBottom: 14 }}>
              <span>배송비</span>
              <span style={{ color: cart.shipping === 0 ? C.green : C.textSub, fontWeight: cart.shipping === 0 ? 700 : 400 }}>
                {cart.shipping === 0 ? "무료" : fmtWon(cart.shipping)}
              </span>
            </div>
            {coupon && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 14 }}>
                <span style={{ color: C.textSub }}>쿠폰 할인 <span style={{ color: C.textHint }}>({coupon.coupon.code})</span></span>
                <span style={{ color: C.green, fontWeight: 700 }}>−{fmtWon(discount)}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 17, fontWeight: 800, paddingTop: 14, borderTop: `1.5px solid ${C.border}`, marginBottom: 18 }}>
              <span>총 결제 금액</span><span>{fmtWon(payTotal)}</span>
            </div>

            <button
              onClick={submit}
              disabled={!valid || processing}
              className="sh-btn"
              style={{ ...S.btnPrimary, width: "100%", height: 54, borderRadius: 14, fontSize: 15 }}
            >
              {processing ? "결제 진행 중…" : `${fmtWon(payTotal)} 결제하기`}
            </button>
            <div style={{ textAlign: "center", fontSize: 11, color: C.textHint, marginTop: 12 }}>
              🔒 SSL 보안 결제 · 개인정보 암호화
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
