import Link from "next/link";
import { T, S } from "./theme";
import { CATEGORIES } from "../../lib/store-data";

export default function ShopFooter() {
  return (
    <footer style={{ background: "#0D0D14", marginTop: 96, borderTop: `1px solid ${T.border}` }}>
      <div className="sh-footer-grid" style={{ maxWidth: 1200, margin: "0 auto", padding: "56px 24px 40px" }}>

        {/* 브랜드 */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 16 }}>
            <span style={{
              width: 32, height: 32, borderRadius: 9,
              background: "linear-gradient(135deg,#6366F1,#8B5CF6)",
              color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 800, fontSize: 15,
            }}>S</span>
            <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.03em", color: T.text }}>
              ShopAdmin<span style={{ color: T.violet }}>.dev</span>
            </span>
          </div>
          <p style={{ fontSize: 12.5, color: T.textHint, lineHeight: 1.8, maxWidth: 230, fontFamily: S.mono }}>
            // Premium web dev resources<br />
            // for developers & designers
          </p>
          <div style={{ marginTop: 16, display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["Next.js", "React", "TypeScript"].map(tag => (
              <span key={tag} className="sh-stack-badge" style={{ fontSize: 10 }}>{tag}</span>
            ))}
          </div>
        </div>

        {/* 제품 */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: T.violet, marginBottom: 16, fontFamily: S.mono }}>// PRODUCTS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {CATEGORIES.map(c => (
              <Link
                key={c}
                href={`/shop/products/?cat=${encodeURIComponent(c)}`}
                style={{ fontSize: 13, color: T.textHint, fontFamily: S.mono, transition: "color 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.color = T.violet}
                onMouseLeave={e => e.currentTarget.style.color = T.textHint}
              >{c}</Link>
            ))}
          </div>
        </div>

        {/* 고객센터 */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: T.violet, marginBottom: 16, fontFamily: S.mono }}>// SUPPORT</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13, color: T.textHint, fontFamily: S.mono }}>
            <span>cs@shopadmin.dev</span>
            <span style={{ fontSize: 11, color: T.textHint, lineHeight: 1.7 }}>
              평일 09:00 – 18:00<br />
              점심 12:00 – 13:00
            </span>
            <span style={{ color: T.green }}>// 디지털 제품 즉시 배송</span>
            <span>14일 환불 보장</span>
          </div>
        </div>

        {/* 라이선스 */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: T.violet, marginBottom: 16, fontFamily: S.mono }}>// LICENSE</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13, color: T.textHint, fontFamily: S.mono }}>
            <span>Personal — 개인 프로젝트</span>
            <span>Team — 팀·에이전시</span>
            <span>Commercial — 상업적 사용</span>
            <span style={{ color: T.green }}>// 무제한 업데이트 포함</span>
          </div>
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${T.border}` }}>
        <div style={{
          maxWidth: 1200, margin: "0 auto", padding: "18px 24px",
          display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "space-between",
          fontSize: 11, color: T.textHint, fontFamily: S.mono,
        }}>
          <span>© 2026 ShopAdmin · 사업자등록번호 000-00-00000 · 대표 홍길동</span>
          <span style={{ color: T.violet }}>// Made with Next.js & ♡</span>
        </div>
      </div>
    </footer>
  );
}
