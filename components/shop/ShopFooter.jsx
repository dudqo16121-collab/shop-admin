// ── 푸터 ────────────────────────────────────────────────────
import Link from "next/link";
import { C } from "./theme";

export default function ShopFooter() {
  return (
    <footer style={{ borderTop: `1px solid ${C.border}`, marginTop: 96, background: C.surface }}>
      <div className="sh-footer-grid" style={{ maxWidth: 1200, margin: "0 auto", padding: "56px 24px 40px" }}>
        {/* 브랜드 */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
            <span style={{ width: 28, height: 28, borderRadius: 8, background: C.accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13 }}>S</span>
            <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: "-0.03em" }}>ShopAdmin</span>
          </div>
          <p style={{ fontSize: 12.5, color: C.textSub, lineHeight: 1.7, maxWidth: 260 }}>
            매일 입는 옷의 기준을 만드는 프리미엄 패션 스토어. 기본에 충실한 옷을 정직한 가격으로.
          </p>
        </div>

        {/* 쇼핑 */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: C.textHint, marginBottom: 14 }}>쇼핑</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            <Link href="/shop/products/" style={{ fontSize: 13, color: C.textSub }}>전체 상품</Link>
            <Link href="/shop/" style={{ fontSize: 13, color: C.textSub }}>이번 시즌</Link>
            <Link href="/shop/checkout/" style={{ fontSize: 13, color: C.textSub }}>주문하기</Link>
          </div>
        </div>

        {/* 고객센터 */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: C.textHint, marginBottom: 14 }}>고객센터</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9, fontSize: 13, color: C.textSub }}>
            <span>02-0000-0000</span>
            <span>cs@shopadmin.com</span>
            <span style={{ fontSize: 12, color: C.textHint }}>평일 09:00 – 18:00 (점심 12–13시)</span>
          </div>
        </div>

        {/* 안내 */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: C.textHint, marginBottom: 14 }}>이용 안내</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9, fontSize: 13, color: C.textSub }}>
            <span>₩50,000 이상 무료배송</span>
            <span>수령 후 7일 이내 교환·반품</span>
            <span>구매 금액 1% 포인트 적립</span>
          </div>
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "18px 24px", display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between", fontSize: 11, color: C.textHint }}>
          <span>© 2026 ShopAdmin · 대표 홍길동 · 사업자등록번호 000-00-00000</span>
          <span>서울시 강남구 테헤란로 00 · 통신판매업 제2024-서울강남-0000호</span>
        </div>
      </div>
    </footer>
  );
}
