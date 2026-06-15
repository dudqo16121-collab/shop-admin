// ── lib/store-data.js ────────────────────────────────────────
// 쇼핑몰 상품 데이터 — productStore에서 읽고 없으면 기본값 사용
// 관리자에서 수정하면 productStore를 통해 즉시 반영됩니다.

import {
  getVisibleProducts,
  getProductById as _getProductById,
  getLastChangedAt,
} from "./productStore";

export const CATEGORIES = ["UI Kit", "템플릿", "플러그인", "아이콘", "폰트"];

export const CAT_TINT = {
  "UI Kit":   "#0D0D1A",
  "템플릿":   "#0A1020",
  "플러그인": "#0A1A0E",
  "아이콘":   "#15100A",
  "폰트":     "#12101A",
};

export function getProducts()  { return getVisibleProducts(); }
export function byId(id)       { return _getProductById(id);  }

// 하위 호환 (기존 PRODUCTS, VISIBLE 참조 유지)
export const PRODUCTS = getVisibleProducts();
export const VISIBLE  = getVisibleProducts();

export const fmtWon = n => `₩${Number(n).toLocaleString("ko-KR")}`;

export function getOptions(cat) {
  if (cat === "UI Kit" || cat === "템플릿") return ["Personal", "Team", "Commercial"];
  return ["Single", "Extended"];
}

export const FREE_SHIP_OVER = 0;
export const SHIP_FEE       = 0;

const sortedByNew = () =>
  [...getVisibleProducts()].sort((a, b) =>
    new Date(b.created || b.createdAt || 0) - new Date(a.created || a.createdAt || 0)
  );

export const NEW_IDS = new Set(sortedByNew().slice(0, 4).map(p => p.id));

export const newest      = (n = 4) => sortedByNew().slice(0, n);
export const bestSellers = (n = 4) => [...getVisibleProducts()].sort((a, b) => b.sales - a.sales).slice(0, n);
export const related     = (p, n = 4) =>
  getVisibleProducts()
    .filter(x => x.id !== p.id && x.cat === p.cat)
    .concat(getVisibleProducts().filter(x => x.id !== p.id && x.cat !== p.cat))
    .slice(0, n);

export const COUPONS = [
  { code: "WELCOME5000", name: "신규 가입 쿠폰",  type: "fixed",   value: 5000, min: 0 },
  { code: "DEV20",       name: "개발자 할인 20%", type: "percent", value: 20,   min: 0 },
  { code: "LAUNCH30",    name: "런치 기념 30%",   type: "percent", value: 30,   min: 0, expired: true },
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

export { getLastChangedAt };