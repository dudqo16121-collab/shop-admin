"use client";

// ── app/shop/review/[orderId]/page.js ────────────────────────
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { T, S, CAT_TINT_V2 } from "../../../../components/shop/theme";
import { useAuth } from "../../../../lib/auth";
import { PRODUCTS, fmtWon } from "../../../../lib/store-data";

// ── 카테고리 컬러 ────────────────────────────────────────────
const CAT_COLOR = {
  "UI Kit":   "#6366F1",
  "템플릿":   "#10B981",
  "플러그인": "#F59E0B",
  "아이콘":   "#EC4899",
  "폰트":     "#8B5CF6",
};

// ── 평점별 레이블 ────────────────────────────────────────────
const RATING_LABELS = ["", "별로예요", "아쉬워요", "보통이에요", "좋아요", "최고예요!"];
const RATING_COLORS = ["", T.red, T.amber, "#94A3B8", T.violet, T.green];

// ── 태그 목록 (체크박스) ────────────────────────────────────
const TAGS_BY_CAT = {
  "UI Kit":   ["코드 품질이 높아요", "Figma 파일이 잘 돼 있어요", "문서화가 친절해요", "TypeScript 지원이 완벽해요", "컴포넌트 수가 많아요", "디자인이 세련됐어요"],
  "템플릿":  ["바로 사용 가능해요", "구조가 깔끔해요", "성능이 좋아요", "문서가 자세해요", "배포가 쉬워요", "커스텀이 쉬워요"],
  "플러그인": ["설치가 간단해요", "API가 직관적이에요", "번들 사이즈가 작아요", "SSR 지원이 돼요", "업데이트가 빨라요", "예제가 충분해요"],
  "아이콘":  ["종류가 다양해요", "크기 조절이 쉬워요", "일관성이 좋아요", "Figma 연동이 편해요", "React 컴포넌트가 잘 돼 있어요", "SVG 최적화가 잘 됐어요"],
  "폰트":    ["가독성이 좋아요", "한글이 잘 지원돼요", "굵기 선택지가 많아요", "리거처가 예뻐요", "웹폰트 용량이 작아요", "CSS 변수 연동이 쉬워요"],
};
const DEFAULT_TAGS = ["품질이 좋아요", "가성비가 좋아요", "업데이트가 빨라요", "문서가 잘 돼 있어요", "재구매 의사 있어요", "추천해요"];

// ── 별점 입력 컴포넌트 ───────────────────────────────────────
function StarInput({ value, onChange }) {
  const [hover, setHover] = useState(0);
  const display = hover || value;

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            style={{
              border: "none", background: "none", cursor: "pointer",
              padding: 4, borderRadius: 8,
              fontSize: 40, lineHeight: 1,
              color: star <= display ? "#F59E0B" : T.border,
              transform: star <= display ? "scale(1.1)" : "scale(1)",
              transition: "color 0.15s, transform 0.15s",
            }}
            aria-label={`${star}점`}
          >
            ★
          </button>
        ))}
      </div>
      {display > 0 && (
        <div style={{
          fontSize: 15, fontWeight: 800,
          color: RATING_COLORS[display],
          fontFamily: S.mono,
          animation: "shFadeIn 0.2s ease",
        }}>
          // {RATING_LABELS[display]}
        </div>
      )}
    </div>
  );
}

// ── 코드 스니펫 에디터 ───────────────────────────────────────
function CodeEditor({ value, onChange, lang, onLangChange }) {
  const LANGS = ["tsx", "jsx", "ts", "js", "css", "bash"];

  return (
    <div style={{
      background: "#0D0D14",
      border: `1px solid ${T.border}`,
      borderRadius: 14, overflow: "hidden",
    }}>
      {/* 에디터 헤더 */}
      <div style={{
        background: "#111118", borderBottom: `1px solid ${T.border}`,
        padding: "0 16px", display: "flex", alignItems: "center", gap: 10,
      }}>
        {/* 도트 */}
        <div style={{ display: "flex", gap: 6, height: 38, alignItems: "center" }}>
          {["#EF4444", "#F59E0B", "#10B981"].map((c, i) => (
            <div key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: c, opacity: 0.8 }} />
          ))}
        </div>
        {/* 언어 선택 */}
        <select
          value={lang}
          onChange={e => onLangChange(e.target.value)}
          style={{
            marginLeft: "auto", height: 26, padding: "0 8px", borderRadius: 6,
            border: `1px solid ${T.border}`, background: T.bgSubtle,
            color: T.textSub, fontSize: 11, fontFamily: S.mono, cursor: "pointer",
          }}
        >
          {LANGS.map(l => <option key={l}>{l}</option>)}
        </select>
        <span style={{ fontSize: 10, color: T.textHint, fontFamily: S.mono }}>// snippet</span>
      </div>

      {/* 코드 입력 */}
      <div style={{ display: "flex" }}>
        {/* 라인 번호 */}
        <div style={{
          padding: "14px 12px", minWidth: 40, textAlign: "right",
          borderRight: `1px solid ${T.border}`,
          background: "#0A0A0F", userSelect: "none",
        }}>
          {(value || "\n").split("\n").map((_, i) => (
            <div key={i} style={{ fontSize: 12, color: T.textHint, fontFamily: S.mono, lineHeight: "1.9" }}>
              {i + 1}
            </div>
          ))}
        </div>
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={`// 코드를 입력하세요\nimport { Button } from '@shopadmin/ui'\n\nexport default function App() {\n  return <Button>Click me</Button>\n}`}
          rows={8}
          style={{
            flex: 1, padding: "14px 16px",
            border: "none", outline: "none",
            background: "transparent",
            color: T.green, fontSize: 13,
            fontFamily: S.mono, lineHeight: 1.9,
            resize: "vertical", minHeight: 140,
          }}
        />
      </div>
    </div>
  );
}

// ── 이미지 업로드 영역 ───────────────────────────────────────
function ImageUpload({ images, onAdd, onRemove }) {
  const inputRef = useRef(null);

  const handleFile = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => onAdd(ev.target.result);
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {images.map((src, i) => (
          <div key={i} style={{ position: "relative", width: 80, height: 80 }}>
            <img
              src={src} alt={`첨부 ${i + 1}`}
              style={{ width: 80, height: 80, borderRadius: 10, objectFit: "cover", border: `1px solid ${T.border}` }}
            />
            <button
              onClick={() => onRemove(i)}
              style={{
                position: "absolute", top: -6, right: -6,
                width: 20, height: 20, borderRadius: "50%",
                background: T.red, border: "none", color: "#fff",
                fontSize: 11, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >✕</button>
          </div>
        ))}
        {images.length < 5 && (
          <button
            onClick={() => inputRef.current?.click()}
            style={{
              width: 80, height: 80, borderRadius: 10, flexShrink: 0,
              border: `2px dashed ${T.borderMid}`, background: T.bgRaised,
              color: T.textHint, cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              gap: 4, fontSize: 11, fontFamily: S.mono,
              transition: "border-color 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = T.violet}
            onMouseLeave={e => e.currentTarget.style.borderColor = T.borderMid}
          >
            <span style={{ fontSize: 22 }}>+</span>
            사진
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleFile} />
      <div style={{ fontSize: 11, color: T.textHint, fontFamily: S.mono, marginTop: 8 }}>
        // 최대 5장 · JPG, PNG · 각 5MB 이하
      </div>
    </div>
  );
}

// ── 메인 ────────────────────────────────────────────────────
export default function ReviewPage() {
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();
  const params = useParams();
  const orderId = params?.orderId;

  const [order, setOrder] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [step, setStep] = useState(0); // 0: 작성, 1: 완료

  // 폼 상태
  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState([]);
  const [text, setText] = useState("");
  const [codeSnippet, setCodeSnippet] = useState("");
  const [codeLang, setCodeLang] = useState("tsx");
  const [images, setImages] = useState([]);
  const [recommend, setRecommend] = useState(null); // true | false | null
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isLoggedIn) { router.push("/shop/login/"); return; }
    // 주문 찾기
    try {
      const raw = localStorage.getItem("shop:orders");
      const orders = raw ? JSON.parse(raw) : [];
      const found = orders.find(o => o.no === orderId);
      if (found) {
        setOrder(found);
        if (found.items?.length > 0) setSelectedProductId(found.items[0].id);
      }
    } catch {}
  }, [isLoggedIn, orderId, router]);

  if (!isLoggedIn) return null;

  const selectedProduct = PRODUCTS.find(p => p.id === selectedProductId);
  const availableTags = selectedProduct
    ? (TAGS_BY_CAT[selectedProduct.cat] || DEFAULT_TAGS)
    : DEFAULT_TAGS;

  const toggleTag = (tag) => {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const validate = () => {
    const e = {};
    if (rating === 0) e.rating = "별점을 선택해주세요";
    if (text.trim().length < 10) e.text = "10자 이상 작성해주세요";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate() || submitting) return;
    setSubmitting(true);
    // 리뷰 저장 (localStorage)
    setTimeout(() => {
      try {
        const raw = localStorage.getItem("shop:reviews");
        const reviews = raw ? JSON.parse(raw) : [];
        reviews.unshift({
          id: `R${Date.now()}`,
          orderId,
          productId: selectedProductId,
          productName: selectedProduct?.name,
          rating,
          tags,
          text,
          codeSnippet: codeSnippet.trim() || null,
          codeLang,
          images,
          recommend,
          author: user.name,
          date: new Date().toISOString().slice(0, 10),
        });
        localStorage.setItem("shop:reviews", JSON.stringify(reviews));
        // 200P 적립 (포인트 시스템 연동)
      } catch {}
      setSubmitting(false);
      setStep(1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 900);
  };

  // ━━ 완료 화면 ━━
  if (step === 1) {
    return (
      <div style={{ ...S.wrap, maxWidth: 560, paddingTop: 90, paddingBottom: 60, textAlign: "center" }}>
        <div className="sh-check" style={{
          width: 80, height: 80, borderRadius: "50%", margin: "0 auto 24px",
          background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
          color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34,
        }}>✓</div>

        <div style={S.eyebrow}>// review.submitted</div>
        <h1 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 800, color: T.text, margin: "10px 0 12px", letterSpacing: "-0.03em" }}>
          리뷰가 등록됐어요!
        </h1>
        <p style={{ fontSize: 14, color: T.textSub, lineHeight: 1.75, marginBottom: 28 }}>
          {user.name}님의 소중한 리뷰 감사합니다.<br />
          리뷰 작성 보상으로 <strong style={{ color: T.violet, fontFamily: S.mono }}>+200P</strong>가 적립됐어요.
        </p>

        {/* 리뷰 요약 */}
        {selectedProduct && (
          <div style={{
            background: T.bgCard, border: `1px solid ${T.border}`,
            borderRadius: 16, padding: "20px 24px", marginBottom: 28, textAlign: "left",
          }}>
            <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 14 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: CAT_TINT_V2[selectedProduct.cat],
                border: `1px solid ${T.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 24, fontFamily: S.mono, flexShrink: 0,
              }}>{selectedProduct.thumb}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{selectedProduct.name}</div>
                <div style={{ fontSize: 12, color: "#F59E0B" }}>
                  {"★".repeat(rating)}{"☆".repeat(5 - rating)}
                  <span style={{ color: T.textHint, marginLeft: 6 }}>{RATING_LABELS[rating]}</span>
                </div>
              </div>
            </div>
            <div style={{ fontSize: 13, color: T.textSub, lineHeight: 1.7, fontStyle: "italic", padding: "12px 14px", background: T.bgRaised, borderRadius: 10, borderLeft: `3px solid ${T.violet}` }}>
              "{text.slice(0, 120)}{text.length > 120 ? "..." : ""}"
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <Link href="/shop/products/" className="sh-btn" style={S.btnPrimary}>
            쇼핑 계속하기
          </Link>
          <Link href="/shop/mypage/" className="sh-btn" style={S.btnGhost}>
            마이페이지
          </Link>
        </div>
      </div>
    );
  }

  // ━━ 주문 없음 ━━
  if (orderId && !order) {
    return (
      <div style={{ ...S.wrap, paddingTop: 100, textAlign: "center" }}>
        <div style={{ fontSize: 36, fontFamily: S.mono, color: T.textHint, marginBottom: 16 }}>// 404</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 8 }}>주문을 찾을 수 없어요</div>
        <Link href="/shop/orders/" style={{ color: T.violet, fontSize: 13 }}>주문 내역으로 →</Link>
      </div>
    );
  }

  // ━━ 작성 폼 ━━
  return (
    <div style={{ ...S.wrap, maxWidth: 800, paddingTop: 40, paddingBottom: 60 }}>

      {/* 헤더 */}
      <div className="sh-fadeup" style={{ marginBottom: 32 }}>
        <div style={S.eyebrow}>// Write Review</div>
        <h1 style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 800, letterSpacing: "-0.035em", color: T.text, margin: "8px 0 6px" }}>
          리뷰 작성
        </h1>
        <p style={{ fontSize: 13, color: T.textHint, fontFamily: S.mono }}>
          // 솔직한 리뷰가 다른 개발자에게 도움이 됩니다 · 작성 시 +200P 적립
        </p>
      </div>

      {/* 제품 선택 (주문 내 여러 제품) */}
      {order?.items?.length > 1 && (
        <div className="sh-fadeup" style={{
          animationDelay: "60ms",
          background: T.bgCard, border: `1px solid ${T.border}`,
          borderRadius: 16, padding: "18px 20px", marginBottom: 20,
        }}>
          <div style={{ fontSize: 11, color: T.textHint, fontFamily: S.mono, marginBottom: 12 }}>
            // select_product
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {order.items.map(it => {
              const p = PRODUCTS.find(pr => pr.id === it.id);
              if (!p) return null;
              const sel = selectedProductId === it.id;
              return (
                <button
                  key={it.id}
                  onClick={() => { setSelectedProductId(it.id); setTags([]); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 14px", borderRadius: 12, cursor: "pointer",
                    border: `1.5px solid ${sel ? T.violet : T.borderMid}`,
                    background: sel ? T.violetBg : T.bgRaised,
                  }}
                >
                  <span style={{ fontSize: 20, fontFamily: S.mono }}>{p.thumb}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: sel ? T.violet : T.textSub }}>{p.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 선택된 제품 카드 */}
      {selectedProduct && (
        <div className="sh-fadeup" style={{
          animationDelay: "80ms",
          background: T.bgCard, border: `1px solid ${T.border}`,
          borderRadius: 16, padding: "18px 22px", marginBottom: 24,
          display: "flex", alignItems: "center", gap: 16,
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, flexShrink: 0,
            background: CAT_TINT_V2[selectedProduct.cat],
            border: `1px solid ${T.border}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, fontFamily: S.mono,
          }}>{selectedProduct.thumb}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: T.text, marginBottom: 4 }}>{selectedProduct.name}</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 5,
                background: `${CAT_COLOR[selectedProduct.cat]}18`,
                color: CAT_COLOR[selectedProduct.cat],
                border: `1px solid ${CAT_COLOR[selectedProduct.cat]}40`,
                fontFamily: S.mono,
              }}>{selectedProduct.cat}</span>
              <span style={{ fontSize: 12, color: T.textHint, fontFamily: S.mono }}>
                {order ? `주문번호: ${orderId}` : "리뷰 작성 중"}
              </span>
            </div>
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: T.text, fontFamily: S.mono }}>
            {fmtWon(selectedProduct.price)}
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* ── 별점 ── */}
        <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, padding: "22px 24px" }}>
          <div style={{ fontSize: 11, color: T.textHint, fontFamily: S.mono, marginBottom: 14 }}>
            // rating * (required)
          </div>
          <StarInput value={rating} onChange={v => { setRating(v); setErrors(e => ({ ...e, rating: "" })); }} />
          {errors.rating && (
            <div style={{ fontSize: 12, color: T.red, marginTop: 8, fontFamily: S.mono }}>// {errors.rating}</div>
          )}
        </div>

        {/* ── 태그 ── */}
        <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, padding: "22px 24px" }}>
          <div style={{ fontSize: 11, color: T.textHint, fontFamily: S.mono, marginBottom: 14 }}>
            // tags (optional) · {tags.length}개 선택됨
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {availableTags.map(tag => {
              const sel = tags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className="sh-chip"
                  style={{
                    height: 36, padding: "0 14px", borderRadius: 20,
                    border: `1.5px solid ${sel ? T.violet : T.borderMid}`,
                    background: sel ? T.violetBg : T.bgRaised,
                    color: sel ? T.violet : T.textSub,
                    fontSize: 13, fontWeight: sel ? 700 : 500, cursor: "pointer",
                  }}
                >
                  {sel && <span style={{ marginRight: 4 }}>✓</span>}
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 리뷰 텍스트 ── */}
        <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, padding: "22px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: T.textHint, fontFamily: S.mono }}>
              // review_text * (required · 10자 이상)
            </div>
            <div style={{ fontSize: 11, color: text.length >= 10 ? T.green : T.textHint, fontFamily: S.mono }}>
              {text.length}자
            </div>
          </div>
          <textarea
            value={text}
            onChange={e => { setText(e.target.value); setErrors(er => ({ ...er, text: "" })); }}
            placeholder="제품을 사용해보니 어떠셨나요? 코드 품질, 문서화, 실제 사용 경험 등을 자유롭게 남겨주세요."
            rows={6}
            style={{
              width: "100%", borderRadius: 12,
              border: `1.5px solid ${errors.text ? T.red : text.length >= 10 ? T.violet : T.border}`,
              background: T.bgRaised, color: T.text,
              padding: "14px 16px", fontSize: 14, lineHeight: 1.75,
              outline: "none", resize: "vertical", boxSizing: "border-box",
              fontFamily: "inherit", transition: "border-color 0.2s",
            }}
            onFocus={e => { if (!errors.text) e.target.style.borderColor = T.violet; }}
            onBlur={e => { if (!errors.text) e.target.style.borderColor = text.length >= 10 ? T.violet : T.border; }}
          />
          {errors.text && (
            <div style={{ fontSize: 12, color: T.red, marginTop: 6, fontFamily: S.mono }}>// {errors.text}</div>
          )}

          {/* 작성 팁 */}
          <div style={{
            marginTop: 12, padding: "10px 14px",
            background: T.bgRaised, borderRadius: 10, border: `1px solid ${T.border}`,
          }}>
            <div style={{ fontSize: 11, color: T.textHint, fontFamily: S.mono, marginBottom: 6 }}>// 좋은 리뷰 팁</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {["실제 사용 중인 프로젝트 유형을 알려주세요", "코드 품질, 문서화, 유지보수 경험 등을 구체적으로", "장점뿐 아니라 개선이 필요한 점도 남겨주세요"].map((tip, i) => (
                <div key={i} style={{ fontSize: 12, color: T.textSub, display: "flex", gap: 7 }}>
                  <span style={{ color: T.violet, fontFamily: S.mono }}>→</span>{tip}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 코드 스니펫 ── */}
        <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, padding: "22px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: T.textHint, fontFamily: S.mono }}>
              // code_snippet (optional)
            </div>
            {codeSnippet && (
              <button
                onClick={() => setCodeSnippet("")}
                style={{ fontSize: 11, color: T.textHint, background: "none", border: "none", cursor: "pointer", fontFamily: S.mono }}
              >
                초기화
              </button>
            )}
          </div>
          <CodeEditor
            value={codeSnippet}
            onChange={setCodeSnippet}
            lang={codeLang}
            onLangChange={setCodeLang}
          />
          <div style={{ fontSize: 11, color: T.textHint, fontFamily: S.mono, marginTop: 8 }}>
            // 실제로 사용한 코드를 공유하면 다른 개발자에게 큰 도움이 돼요
          </div>
        </div>

        {/* ── 이미지 첨부 ── */}
        <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, padding: "22px 24px" }}>
          <div style={{ fontSize: 11, color: T.textHint, fontFamily: S.mono, marginBottom: 14 }}>
            // attachments (optional · max 5)
          </div>
          <ImageUpload
            images={images}
            onAdd={src => setImages(prev => [...prev, src])}
            onRemove={i => setImages(prev => prev.filter((_, idx) => idx !== i))}
          />
        </div>

        {/* ── 추천 여부 ── */}
        <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, padding: "22px 24px" }}>
          <div style={{ fontSize: 11, color: T.textHint, fontFamily: S.mono, marginBottom: 14 }}>
            // would_recommend
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {[
              { val: true,  icon: "👍", label: "추천해요", color: T.green, bg: T.greenBg },
              { val: false, icon: "👎", label: "비추해요", color: T.red, bg: T.redBg },
            ].map(item => (
              <button
                key={String(item.val)}
                onClick={() => setRecommend(recommend === item.val ? null : item.val)}
                style={{
                  flex: 1, height: 54, borderRadius: 12, cursor: "pointer",
                  border: `1.5px solid ${recommend === item.val ? item.color : T.borderMid}`,
                  background: recommend === item.val ? item.bg : T.bgRaised,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  transition: "all 0.15s",
                }}
              >
                <span style={{ fontSize: 22 }}>{item.icon}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: recommend === item.val ? item.color : T.textSub }}>
                  {item.label}
                </span>
                {recommend === item.val && (
                  <span style={{ fontSize: 12, color: item.color, fontFamily: S.mono }}>✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── 제출 ── */}
        <div style={{ display: "flex", gap: 12, paddingTop: 4 }}>
          <Link
            href={order ? "/shop/orders/" : "/shop/"}
            style={{
              height: 52, padding: "0 24px", borderRadius: 13,
              border: `1px solid ${T.border}`, background: "transparent",
              color: T.textSub, fontSize: 14, fontWeight: 600,
              display: "inline-flex", alignItems: "center", textDecoration: "none",
            }}
          >
            ← 취소
          </Link>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="sh-btn"
            style={{ ...S.btnPrimary, flex: 1, height: 52, borderRadius: 13, fontSize: 15, justifyContent: "center", opacity: submitting ? 0.7 : 1 }}
          >
            {submitting
              ? <span style={{ fontFamily: S.mono, fontSize: 13 }}>// submitting...</span>
              : "리뷰 등록하기 (+200P)"}
          </button>
        </div>

        {/* 정책 안내 */}
        <div style={{ fontSize: 11.5, color: T.textHint, textAlign: "center", fontFamily: S.mono, lineHeight: 1.7 }}>
          // 리뷰는 검토 후 게시됩니다 · 허위·광고성 리뷰는 삭제될 수 있습니다<br />
          // 포인트는 리뷰 승인 후 24시간 이내에 적립됩니다
        </div>
      </div>
    </div>
  );
}