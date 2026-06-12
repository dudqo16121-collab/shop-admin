"use client";

import { useState } from "react";
import { C, styles } from "../theme";

// ── 화면 8: 결제 페이지 ──────────────────────────────────────
export default function Checkout() {
  const [payMethod, setPayMethod] = useState("신용카드");
  const payMethods = ["신용카드", "카카오페이", "네이버페이", "무통장입금", "토스페이", "포인트 전액"];
  const items = [
    { name: "프리미엄 후디", opt: "블랙 / M · 수량 1", price: "₩79,000" },
    { name: "클래식 티셔츠", opt: "화이트 · 수량 2", price: "₩39,000" },
  ];
  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: 16 }}>
        {[["1", "장바구니", true], ["2", "배송·결제", true, true], ["3", "주문 완료", false]].map(([num, label, done, active], i) => (
          <div key={label} style={{ display: "flex", alignItems: "center" }}>
            {i > 0 && <div style={{ width: 36, height: 1, background: C.border, margin: "0 6px" }} />}
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, background: active ? C.accent : done ? C.greenBg : C.bg, color: active ? "#fff" : done ? C.green : C.textHint, border: `1px solid ${active ? C.accent : done ? C.green : C.border}` }}>{done && !active ? "✓" : num}</div>
              <span style={{ fontSize: 11, color: active ? C.text : C.textHint, fontWeight: active ? 700 : 400 }}>{label}</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr)", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={styles.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>📍 배송지 선택</div>
              <span style={{ fontSize: 11, color: C.blue, cursor: "pointer" }}>+ 새 주소 추가</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[{ name: "홍길동", tag: "기본", addr: "서울시 강남구 테헤란로 00, 00아파트 000동 000호", tel: "010-1234-2847", sel: true }, { name: "홍길동 (회사)", tag: null, addr: "서울시 서초구 OO빌딩 00층", tel: "010-1234-2847", sel: false }].map(a => (
                <div key={a.name} style={{ padding: "9px 11px", borderRadius: 8, border: `1px solid ${a.sel ? C.borderMid : C.border}`, background: a.sel ? C.bg : C.surface, cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", border: `1.5px solid ${a.sel ? C.accent : C.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {a.sel && <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.accent }} />}
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 11 }}>{a.name}</span>
                    {a.tag && <span style={styles.badge("blue")}>{a.tag}</span>}
                  </div>
                  <div style={{ fontSize: 10, color: C.textHint, paddingLeft: 17, lineHeight: 1.5 }}>{a.addr}<br />{a.tel}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 10, color: C.textSub, marginBottom: 3 }}>배송 메모</div>
              <input style={styles.input} placeholder="배송 시 요청사항을 입력하세요" />
            </div>
          </div>
          <div style={styles.card}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>💳 결제 수단</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginBottom: 12 }}>
              {payMethods.map(m => (
                <div key={m} onClick={() => setPayMethod(m)} style={{ padding: "8px", borderRadius: 8, border: `1px solid ${payMethod === m ? C.borderMid : C.border}`, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer", background: payMethod === m ? C.bg : C.surface }}>
                  <div style={{ fontSize: 16 }}>{m === "신용카드" ? "💳" : m === "카카오페이" ? "💛" : m === "네이버페이" ? "🟢" : m === "무통장입금" ? "🏦" : m === "토스페이" ? "🔵" : "🪙"}</div>
                  <div style={{ fontSize: 10, color: payMethod === m ? C.text : C.textHint, fontWeight: payMethod === m ? 600 : 400 }}>{m}</div>
                </div>
              ))}
            </div>
            {payMethod === "신용카드" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div><div style={{ fontSize: 10, color: C.textSub, marginBottom: 3 }}>카드 번호 *</div><input style={styles.input} placeholder="0000 — 0000 — 0000 — 0000" /></div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  <div><div style={{ fontSize: 10, color: C.textSub, marginBottom: 3 }}>유효기간 *</div><input style={styles.input} placeholder="MM / YY" /></div>
                  <div><div style={{ fontSize: 10, color: C.textSub, marginBottom: 3 }}>CVC *</div><input style={styles.input} placeholder="000" /></div>
                  <div><div style={{ fontSize: 10, color: C.textSub, marginBottom: 3 }}>할부</div><select style={{ ...styles.input, height: 32 }}><option>일시불</option><option>3개월</option><option>6개월</option><option>12개월</option></select></div>
                </div>
              </div>
            )}
          </div>
          <div style={styles.card}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>🎫 쿠폰·포인트</div>
            <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
              <input style={styles.input} placeholder="쿠폰 코드 입력" />
              <button style={{ ...styles.btn("primary"), whiteSpace: "nowrap" }}>적용</button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", background: C.greenBg, borderRadius: 7, fontSize: 11, color: C.green, marginBottom: 10 }}>
              ✓ VIPGOLD10 — 10% 할인 적용됨
            </div>
            <div>
              <div style={{ fontSize: 10, color: C.textSub, marginBottom: 3 }}>포인트 사용 (보유: 4,280P)</div>
              <div style={{ display: "flex", gap: 6 }}>
                <input style={styles.input} placeholder="사용할 포인트 입력" />
                <button style={{ ...styles.btn(), whiteSpace: "nowrap" }}>전액 사용</button>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={styles.card}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>주문 상품 (2개)</div>
            {items.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 8, padding: "7px 0", borderBottom: i < items.length - 1 ? `1px solid ${C.border}` : "none" }}>
                <div style={{ width: 36, height: 36, borderRadius: 7, background: C.bg, border: `1px solid ${C.border}`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📦</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                  <div style={{ fontSize: 10, color: C.textHint }}>{item.opt}</div>
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{item.price}</div>
              </div>
            ))}
          </div>
          <div style={styles.card}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>결제 금액</div>
            {[["상품 금액", "₩118,000"], ["배송비", "₩3,000"], ["쿠폰 할인", "-₩11,800"], ["포인트 사용", "-₩4,280"]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, padding: "4px 0", borderBottom: `1px solid ${C.border}` }}>
                <span style={{ color: C.textSub }}>{k}</span>
                <span style={{ color: v.startsWith("-") ? C.green : C.text, fontWeight: v.startsWith("-") ? 600 : 400 }}>{v}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 800, padding: "10px 0 0", letterSpacing: "-0.3px" }}>
              <span>최종 결제금액</span><span>₩104,920</span>
            </div>
          </div>
          <button style={{ ...styles.btn("primary"), justifyContent: "center", padding: "14px", fontSize: 14, borderRadius: 10 }}>₩104,920 결제하기</button>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, fontSize: 10, color: C.textHint }}>🔒 SSL 보안 결제 · 개인정보 암호화</div>
        </div>
      </div>
    </div>
  );
}
