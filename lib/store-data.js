// ── 웹 개발 제품 데이터 ──────────────────────────────────────

export const CATEGORIES = ["UI Kit", "템플릿", "플러그인", "아이콘", "폰트"];

export const CAT_TINT = {
  "UI Kit":   "#0D0D1A",
  "템플릿":   "#0A1020",
  "플러그인": "#0A1A0E",
  "아이콘":   "#15100A",
  "폰트":     "#12101A",
};

export const PRODUCTS = [
  {
    id: 1, name: "Nexus UI Kit", cat: "UI Kit",
    price: 89000, stock: 999, sales: 1284, rating: 4.9, reviews: 342,
    thumb: "⬡", created: "2026-01-15",
    desc: "Next.js + Tailwind 기반 200+ 컴포넌트. 다크/라이트 모드, Figma 소스 파일 포함. 상업적 사용 가능.",
  },
  {
    id: 2, name: "Prism Design System", cat: "UI Kit",
    price: 129000, stock: 999, sales: 986, rating: 4.8, reviews: 218,
    thumb: "◈", created: "2026-02-10",
    desc: "토큰 기반 디자인 시스템. React + Vue 동시 지원. Storybook 문서 포함.",
  },
  {
    id: 3, name: "DevLaunch SaaS 템플릿", cat: "템플릿",
    price: 149000, stock: 999, sales: 842, rating: 4.9, reviews: 196,
    thumb: "⚡", created: "2026-02-20",
    desc: "인증·결제·대시보드까지 완성된 SaaS 스타터. Next.js 14 + Supabase + Stripe 연동.",
  },
  {
    id: 4, name: "PortfolioX 포트폴리오", cat: "템플릿",
    price: 59000, stock: 999, sales: 624, rating: 4.7, reviews: 164,
    thumb: "▲", created: "2026-03-05",
    desc: "개발자 포트폴리오 전용 Next.js 템플릿. 애니메이션 특화, SEO 최적화 완료.",
  },
  {
    id: 5, name: "Motion Pack Pro", cat: "플러그인",
    price: 79000, stock: 999, sales: 512, rating: 4.8, reviews: 128,
    thumb: "◎", created: "2026-03-12",
    desc: "Framer Motion 기반 50+ 인터랙션 프리셋. 설치 후 import 하나로 바로 사용.",
  },
  {
    id: 6, name: "FormKit Pro", cat: "플러그인",
    price: 69000, stock: 999, sales: 438, rating: 4.6, reviews: 98,
    thumb: "⊞", created: "2026-03-20",
    desc: "React Hook Form + Zod 통합 폼 빌더. 30+ 필드 타입, 실시간 유효성 검사.",
  },
  {
    id: 7, name: "Lucide Dev Icons", cat: "아이콘",
    price: 39000, stock: 999, sales: 984, rating: 4.9, reviews: 286,
    thumb: "◇", created: "2026-04-01",
    desc: "2,400+ SVG 아이콘. React / Vue / Svelte 컴포넌트 + Figma 플러그인.",
  },
  {
    id: 8, name: "System Icon Set", cat: "아이콘",
    price: 49000, stock: 999, sales: 726, rating: 4.7, reviews: 194,
    thumb: "⌘", created: "2026-04-10",
    desc: "macOS·Windows 시스템 UI 스타일 아이콘 1,800종. 4가지 굵기.",
  },
  {
    id: 9, name: "DashForge Admin", cat: "템플릿",
    price: 199000, stock: 999, sales: 398, rating: 4.9, reviews: 112,
    thumb: "▣", created: "2026-04-15",
    desc: "완전 기능 어드민 대시보드. 차트·테이블·폼·인증 모두 포함. React + TypeScript.",
  },
  {
    id: 10, name: "Geist Mono Extra", cat: "폰트",
    price: 29000, stock: 999, sales: 628, rating: 4.8, reviews: 156,
    thumb: "Aa", created: "2026-05-01",
    desc: "개발자용 코딩 폰트 확장 팩. 리거처 지원, 4가지 굵기, OTF/WOFF2 포함.",
  },
  {
    id: 11, name: "Landing Page Kit", cat: "템플릿",
    price: 119000, stock: 999, sales: 544, rating: 4.8, reviews: 138,
    thumb: "⬟", created: "2026-05-10",
    desc: "SaaS 랜딩 페이지 8종 번들. Hero·Pricing·FAQ·CTA 섹션별 컴포넌트.",
  },
  {
    id: 12, name: "TypeScale Pro", cat: "폰트",
    price: 45000, stock: 999, sales: 312, rating: 4.6, reviews: 84,
    thumb: "T¹", created: "2026-05-20",
    desc: "타이포그래피 시스템 디자인 + 폰트 페어링 가이드 + CSS 변수 키트.",
  },
];

export const VISIBLE = PRODUCTS.filter(p => !p.hidden);

export const byId = (id) => PRODUCTS.find(p => p.id === Number(id));

export const fmtWon = (n) => `₩${Number(n).toLocaleString("ko-KR")}`;

export function getOptions(cat) {
  if (cat === "UI Kit" || cat === "템플릿") return ["Personal", "Team", "Commercial"];
  return ["Single", "Extended"];
}

// 디지털 제품 — 배송비 없음
export const FREE_SHIP_OVER = 0;
export const SHIP_FEE = 0;

const sortedByNew = [...VISIBLE].sort((a, b) => new Date(b.created) - new Date(a.created));
export const NEW_IDS = new Set(sortedByNew.slice(0, 4).map(p => p.id));
export const newest = (n = 4) => sortedByNew.slice(0, n);
export const bestSellers = (n = 4) => [...VISIBLE].sort((a, b) => b.sales - a.sales).slice(0, n);
export const related = (p, n = 4) =>
  VISIBLE.filter(x => x.id !== p.id && x.cat === p.cat)
    .concat(VISIBLE.filter(x => x.id !== p.id && x.cat !== p.cat))
    .slice(0, n);

export const COUPONS = [
  { code: "WELCOME5000", name: "신규 가입 쿠폰", type: "fixed", value: 5000, min: 0 },
  { code: "DEV20", name: "개발자 할인 20%", type: "percent", value: 20, min: 0 },
  { code: "LAUNCH30", name: "런치 기념 30%", type: "percent", value: 30, min: 0, expired: true },
];

export function applyCoupon(code, subtotal) {
  const c = COUPONS.find(x => x.code === String(code).trim().toUpperCase());
  if (!c) return { ok: false, msg: "존재하지 않는 쿠폰 코드예요" };
  if (c.expired) return { ok: false, msg: "기간이 만료된 쿠폰이에요" };
  if (subtotal < c.min) return { ok: false, msg: `₩${c.min.toLocaleString()} 이상 구매 시 사용 가능해요` };
  const discount = c.type === "fixed"
    ? Math.min(c.value, subtotal)
    : Math.round(subtotal * c.value / 100);
  return { ok: true, coupon: c, discount };
}