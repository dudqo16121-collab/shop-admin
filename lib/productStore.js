// ── lib/productStore.js ──────────────────────────────────────
// 관리자 ↔ 쇼핑몰 상품 데이터 단일 소스
// 관리자에서 수정 → localStorage 저장 → 쇼핑몰에서 읽기

const STORE_KEY   = "admin:products";
const CHANGED_KEY = "admin:products:changed"; // 변경 시각 (쇼핑몰 감지용)

// ── 기본 상품 데이터 (코드 초기값) ──────────────────────────
const DEFAULT_PRODUCTS = [
  { id: 1,  name: "Nexus UI Kit",          cat: "UI Kit",   price: 89000,  stock: 999, sales: 1284, rating: 4.9, reviews: 342, thumb: "⬡", created: "2026-01-15", status: "판매중",  desc: "Next.js + Tailwind 기반 200+ 컴포넌트. 다크/라이트 모드, Figma 소스 파일 포함." },
  { id: 2,  name: "Prism Design System",   cat: "UI Kit",   price: 129000, stock: 999, sales: 986,  rating: 4.8, reviews: 218, thumb: "◈", created: "2026-02-10", status: "판매중",  desc: "토큰 기반 디자인 시스템. React + Vue 동시 지원. Storybook 문서 포함." },
  { id: 3,  name: "DevLaunch SaaS 템플릿", cat: "템플릿",   price: 149000, stock: 999, sales: 842,  rating: 4.9, reviews: 196, thumb: "⚡", created: "2026-02-20", status: "판매중",  desc: "인증·결제·대시보드까지 완성된 SaaS 스타터. Next.js 14 + Supabase + Stripe." },
  { id: 4,  name: "PortfolioX 포트폴리오", cat: "템플릿",   price: 59000,  stock: 999, sales: 624,  rating: 4.7, reviews: 164, thumb: "▲", created: "2026-03-05", status: "판매중",  desc: "개발자 포트폴리오 전용 Next.js 템플릿. 애니메이션 특화, SEO 최적화 완료." },
  { id: 5,  name: "Motion Pack Pro",       cat: "플러그인", price: 79000,  stock: 999, sales: 512,  rating: 4.8, reviews: 128, thumb: "◎", created: "2026-03-12", status: "판매중",  desc: "Framer Motion 기반 50+ 인터랙션 프리셋. 설치 후 import 하나로 사용." },
  { id: 6,  name: "FormKit Pro",           cat: "플러그인", price: 69000,  stock: 999, sales: 438,  rating: 4.6, reviews: 98,  thumb: "⊞", created: "2026-03-20", status: "판매중",  desc: "React Hook Form + Zod 통합 폼 빌더. 30+ 필드 타입, 실시간 유효성 검사." },
  { id: 7,  name: "Lucide Dev Icons",      cat: "아이콘",   price: 39000,  stock: 999, sales: 984,  rating: 4.9, reviews: 286, thumb: "◇", created: "2026-04-01", status: "판매중",  desc: "2,400+ SVG 아이콘. React/Vue/Svelte 컴포넌트 + Figma 플러그인." },
  { id: 8,  name: "System Icon Set",       cat: "아이콘",   price: 49000,  stock: 999, sales: 726,  rating: 4.7, reviews: 194, thumb: "⌘", created: "2026-04-10", status: "판매중",  desc: "macOS·Windows 시스템 UI 스타일 아이콘 1,800종. 4가지 굵기." },
  { id: 9,  name: "DashForge Admin",       cat: "템플릿",   price: 199000, stock: 999, sales: 398,  rating: 4.9, reviews: 112, thumb: "▣", created: "2026-04-15", status: "판매중",  desc: "완전 기능 어드민 대시보드. 차트·테이블·폼·인증 포함. React + TypeScript." },
  { id: 10, name: "Geist Mono Extra",      cat: "폰트",     price: 29000,  stock: 999, sales: 628,  rating: 4.8, reviews: 156, thumb: "Aa", created: "2026-05-01", status: "판매중",  desc: "개발자용 코딩 폰트 확장 팩. 리거처 지원, 4가지 굵기, OTF/WOFF2 포함." },
  { id: 11, name: "Landing Page Kit",      cat: "템플릿",   price: 119000, stock: 999, sales: 544,  rating: 4.8, reviews: 138, thumb: "⬟", created: "2026-05-10", status: "판매중",  desc: "SaaS 랜딩 페이지 8종 번들. Hero·Pricing·FAQ·CTA 섹션별 컴포넌트." },
  { id: 12, name: "TypeScale Pro",         cat: "폰트",     price: 45000,  stock: 999, sales: 312,  rating: 4.6, reviews: 84,  thumb: "T¹", created: "2026-05-20", status: "판매중",  desc: "타이포그래피 시스템 디자인 + 폰트 페어링 가이드 + CSS 변수 키트." },
];

// ── 읽기 ─────────────────────────────────────────────────────
export function getAllProducts() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_PRODUCTS;
}

// ── 쇼핑몰용: 판매 중인 상품만 ──────────────────────────────
export function getVisibleProducts() {
  return getAllProducts().filter(p => p.status !== "판매중단");
}

export function getProductById(id) {
  return getAllProducts().find(p => p.id === Number(id));
}

// ── 저장 ─────────────────────────────────────────────────────
export function saveAllProducts(products) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(products));
    localStorage.setItem(CHANGED_KEY, String(Date.now()));
    return true;
  } catch { return false; }
}

// ── 단일 상품 수정 ────────────────────────────────────────────
export function updateProduct(id, patch) {
  const products = getAllProducts();
  const idx = products.findIndex(p => p.id === Number(id));
  if (idx < 0) return false;
  products[idx] = { ...products[idx], ...patch, updatedAt: new Date().toISOString() };
  return saveAllProducts(products);
}

// ── 상품 추가 ────────────────────────────────────────────────
export function addProduct(product) {
  const products = getAllProducts();
  const newId = Math.max(...products.map(p => p.id), 0) + 1;
  const newProduct = { ...product, id: newId, createdAt: new Date().toISOString() };
  products.unshift(newProduct);
  return saveAllProducts(products) ? newProduct : null;
}

// ── 상품 삭제 ────────────────────────────────────────────────
export function deleteProduct(id) {
  const products = getAllProducts().filter(p => p.id !== Number(id));
  return saveAllProducts(products);
}

// ── 일괄 가격 변경 ───────────────────────────────────────────
export function bulkUpdatePrice(ids, type, value) {
  const products = getAllProducts().map(p => {
    if (!ids.includes(p.id)) return p;
    const numVal = Number(value);
    let newPrice = p.price;
    if (type === "discount")  newPrice = Math.round(p.price * (1 - numVal / 100));
    if (type === "increase")  newPrice = Math.round(p.price * (1 + numVal / 100));
    if (type === "fixed")     newPrice = numVal;
    if (type === "setFixed")  newPrice = numVal;
    return { ...p, price: Math.max(0, newPrice), updatedAt: new Date().toISOString() };
  });
  return saveAllProducts(products);
}

// ── 변경 감지 (쇼핑몰에서 폴링) ─────────────────────────────
export function getLastChangedAt() {
  try { return Number(localStorage.getItem(CHANGED_KEY) || 0); } catch { return 0; }
}

// ── 초기화 ───────────────────────────────────────────────────
export function resetToDefault() {
  return saveAllProducts(DEFAULT_PRODUCTS);
}

// ── 통계 ─────────────────────────────────────────────────────
export function getProductStats() {
  const all = getAllProducts();
  return {
    total:   all.length,
    active:  all.filter(p => p.status === "판매중").length,
    soldout: all.filter(p => p.status === "품절").length,
    hidden:  all.filter(p => p.status === "판매중단").length,
    lowStock:all.filter(p => p.stock > 0 && p.stock <= 5).length,
  };
}