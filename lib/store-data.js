// ── 스토어 공유 데이터 (관리자 ↔ 쇼핑몰 단일 소스) ──────────
// 관리자 ProductList의 12개 상품과 동일한 데이터입니다.
// 추후 API 연동 시 이 파일만 fetch 기반으로 교체하면 됩니다.

export const CATEGORIES = ["의류", "하의", "신발", "가방", "악세서리"];

// 카테고리별 타일 틴트 (종이톤 위에서 은은하게)
export const CAT_TINT = {
  "의류": "#EFEAE3",
  "하의": "#E7EAF0",
  "신발": "#EAF0E9",
  "가방": "#F0E9E4",
  "악세서리": "#EFE7EE",
};

export const PRODUCTS = [
  { id: 1, name: "프리미엄 후디", cat: "의류", price: 89000, stock: 4, sales: 284, rating: 4.8, reviews: 142, thumb: "🧥", created: "2026-01-15",
    desc: "두툼한 480gsm 코튼 플리스에 미니멀한 실루엣. 한 번 입으면 계속 찾게 되는 기본 후디입니다." },
  { id: 2, name: "클래식 티셔츠", cat: "의류", price: 39000, stock: 0, sales: 198, rating: 4.6, reviews: 98, thumb: "👕", created: "2026-02-10",
    desc: "수피마 코튼 30수의 단단한 조직감. 세탁 후에도 목이 늘어나지 않는 견고한 봉제." },
  { id: 3, name: "데님 팬츠", cat: "하의", price: 79000, stock: 24, sales: 156, rating: 4.7, reviews: 76, thumb: "👖", created: "2026-02-20",
    desc: "13.5oz 셀비지 데님, 테이퍼드 핏. 입을수록 몸에 맞게 길이 드는 한 벌." },
  { id: 4, name: "캐주얼 스니커즈", cat: "신발", price: 89000, stock: 50, sales: 124, rating: 4.5, reviews: 64, thumb: "👟", created: "2026-03-05",
    desc: "이탈리아산 풀그레인 레더 어퍼와 쿠셔닝 인솔. 어디에나 어울리는 흰 운동화의 정답." },
  { id: 5, name: "레더 토트백", cat: "가방", price: 128000, stock: 15, sales: 98, rating: 4.9, reviews: 52, thumb: "👜", created: "2026-03-12",
    desc: "베지터블 태닝 가죽의 자연스러운 결. 노트북 13인치까지 들어가는 일상 사이즈." },
  { id: 6, name: "캐시미어 머플러", cat: "악세서리", price: 48000, stock: 62, sales: 84, rating: 4.4, reviews: 38, thumb: "🧣", created: "2026-03-20",
    desc: "내몽골 캐시미어 100%. 가볍게 두르기 좋은 30×180cm." },
  { id: 7, name: "오버핏 티셔츠", cat: "의류", price: 45000, stock: 5, sales: 72, rating: 4.3, reviews: 28, thumb: "👕", created: "2026-04-01",
    desc: "어깨를 한 치수 떨어뜨린 릴랙스드 실루엣. 부드러운 워싱 가공으로 처음부터 편안하게." },
  { id: 8, name: "슬랙스", cat: "하의", price: 68000, stock: 18, sales: 64, rating: 4.6, reviews: 32, thumb: "👖", created: "2026-04-10",
    desc: "사방 스트레치 원단의 세미와이드 슬랙스. 출근과 주말 사이 어디든." },
  { id: 9, name: "미니 크로스백", cat: "가방", price: 78000, stock: 0, sales: 48, rating: 4.2, reviews: 18, thumb: "👜", created: "2026-04-15", hidden: true,
    desc: "판매 중단 상품." },
  { id: 10, name: "울 베레모", cat: "악세서리", price: 38000, stock: 34, sales: 42, rating: 4.5, reviews: 22, thumb: "🎩", created: "2026-05-01",
    desc: "바스크 지방 전통 방식으로 짠 울 100% 베레. 가을 코디의 마침표." },
  { id: 11, name: "롱 코트", cat: "의류", price: 228000, stock: 8, sales: 38, rating: 4.8, reviews: 16, thumb: "🧥", created: "2026-05-10",
    desc: "울 캐시미어 혼방의 미니멀 체스터필드. 무릎 아래로 떨어지는 단정한 기장." },
  { id: 12, name: "런닝화", cat: "신발", price: 98000, stock: 0, sales: 32, rating: 4.4, reviews: 14, thumb: "👟", created: "2026-05-20",
    desc: "리바운드 폼 미드솔의 데일리 러너. 산책부터 10K까지." },
];

// 쇼핑몰에 노출되는 상품 (판매 중단 제외)
export const VISIBLE = PRODUCTS.filter(p => !p.hidden);

export const byId = (id) => PRODUCTS.find(p => p.id === Number(id));

export const fmtWon = (n) => `₩${Number(n).toLocaleString("ko-KR")}`;

// 카테고리별 구매 옵션
export function getOptions(cat) {
  if (cat === "의류" || cat === "하의") return ["S", "M", "L", "XL"];
  if (cat === "신발") return ["250", "260", "270", "280"];
  return ["FREE"];
}

// 배송 정책 (관리자 스토어 설정과 동일)
export const FREE_SHIP_OVER = 50000;
export const SHIP_FEE = 3000;

// 신상품 뱃지 기준: 최근 등록 4개
const sortedByNew = [...VISIBLE].sort((a, b) => new Date(b.created) - new Date(a.created));
export const NEW_IDS = new Set(sortedByNew.slice(0, 4).map(p => p.id));
export const newest = (n = 4) => sortedByNew.slice(0, n);
export const bestSellers = (n = 4) => [...VISIBLE].sort((a, b) => b.sales - a.sales).slice(0, n);
export const related = (p, n = 4) => VISIBLE.filter(x => x.id !== p.id && x.cat === p.cat)
  .concat(VISIBLE.filter(x => x.id !== p.id && x.cat !== p.cat)).slice(0, n);

  // ── 쿠폰 (관리자 프로모션·쿠폰 화면과 동일한 코드) ──────────
export const COUPONS = [
  { code: "WELCOME5000", name: "신규 웰컴 쿠폰", type: "fixed", value: 5000, min: 0 },
  { code: "VIPGOLD10", name: "VIP 골드 전용 할인", type: "percent", value: 10, min: 0 },
  { code: "SUMMER30", name: "여름 시즌 30%", type: "percent", value: 30, min: 0, expired: true },
];

export function applyCoupon(code, subtotal) {
  const c = COUPONS.find(x => x.code === String(code).trim().toUpperCase());
  if (!c) return { ok: false, msg: "존재하지 않는 쿠폰 코드예요" };
  if (c.expired) return { ok: false, msg: "기간이 만료된 쿠폰이에요" };
  if (subtotal < c.min) return { ok: false, msg: `${fmtWon(c.min)} 이상 구매 시 사용할 수 있어요` };
  const discount = c.type === "fixed"
    ? Math.min(c.value, subtotal)
    : Math.round(subtotal * c.value / 100);
  return { ok: true, coupon: c, discount };
}