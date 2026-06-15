// ── lib/orderBridge.js ──────────────────────────────────────
// 쇼핑몰(shop:orders)과 관리자를 연결하는 단일 소스
// 서버 없이 localStorage 기반으로 동작
// 실제 API 연동 시 이 파일의 함수만 교체하면 됩니다.

const SHOP_ORDERS_KEY = "shop:orders";
const ADMIN_ORDERS_KEY = "admin:orders"; // 관리자 전용 메모 등 추가 데이터

// ── 쇼핑몰 주문 읽기 ─────────────────────────────────────────
export function getShopOrders() {
  try {
    const raw = localStorage.getItem(SHOP_ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

// ── 관리자 메모/상태 읽기 ────────────────────────────────────
export function getAdminMeta() {
  try {
    const raw = localStorage.getItem(ADMIN_ORDERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

// ── 관리자 메타 저장 (주문 상태·메모 등) ─────────────────────
export function saveAdminMeta(orderNo, data) {
  try {
    const meta = getAdminMeta();
    meta[orderNo] = { ...meta[orderNo], ...data };
    localStorage.setItem(ADMIN_ORDERS_KEY, JSON.stringify(meta));
    return true;
  } catch { return false; }
}

// ── 쇼핑몰 + 관리자 데이터 병합 ─────────────────────────────
export function getMergedOrders() {
  const shopOrders = getShopOrders();
  const adminMeta  = getAdminMeta();

  return shopOrders.map(o => {
    const meta = adminMeta[o.no] || {};
    const items = o.items || [];
    const prodName = items.length > 1
      ? `${items[0].name} 외 ${items.length - 1}건`
      : items[0]?.name || "-";

    return {
      // 원본 쇼핑몰 데이터
      raw: o,

      // 관리자 테이블용 정규화 데이터
      id:     o.no,
      date:   formatDate(o.date),
      cust:   o.name ? maskName(o.name) : "비회원",
      prod:   prodName,
      qty:    items.reduce((a, it) => a + (it.qty || 1), 0),
      amt:    `₩${(o.total || 0).toLocaleString("ko-KR")}`,
      pay:    PAY_LABEL[o.pay] || o.pay || "기타",
      status: meta.status || mapStatus(o.pay),
      memo:   meta.memo || "",
      phone:  o.phone || "-",
      addr:   o.addr || "-",
      coupon: o.coupon || null,
      discount: o.discount || 0,
      items,
    };
  });
}

// ── 통계 계산 ────────────────────────────────────────────────
export function getOrderStats() {
  const orders = getMergedOrders();
  return {
    total:    orders.length,
    pending:  orders.filter(o => o.status === "입금대기").length,
    paid:     orders.filter(o => o.status === "결제완료").length,
    shipping: orders.filter(o => o.status === "배송중").length,
    done:     orders.filter(o => o.status === "배송완료").length,
    cancel:   orders.filter(o => o.status === "취소").length,
    revenue:  orders
      .filter(o => o.status !== "취소")
      .reduce((a, o) => a + (o.raw.total || 0), 0),
  };
}

// ── 새 주문 수 (관리자가 아직 안 본 것) ──────────────────────
export function getNewOrderCount() {
  try {
    const lastSeen = Number(localStorage.getItem("admin:lastSeenOrder") || 0);
    return getShopOrders().filter(o => new Date(o.date).getTime() > lastSeen).length;
  } catch { return 0; }
}

export function markOrdersSeen() {
  try { localStorage.setItem("admin:lastSeenOrder", String(Date.now())); } catch {}
}

// ── 헬퍼 ─────────────────────────────────────────────────────
const PAY_LABEL = {
  card:  "신용카드",
  kakao: "카카오페이",
  naver: "네이버페이",
  bank:  "무통장입금",
};

function mapStatus(pay) {
  return pay === "bank" ? "입금대기" : "결제완료";
}

function maskName(name) {
  if (!name || name.length < 2) return name || "-";
  return name[0] + "*".repeat(name.length - 1);
}

function formatDate(iso) {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mn = String(d.getMinutes()).padStart(2, "0");
    return `${mm}/${dd} ${hh}:${mn}`;
  } catch { return iso?.slice(0, 10) || "-"; }
}