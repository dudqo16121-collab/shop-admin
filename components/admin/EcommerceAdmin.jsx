"use client";

import { useState } from "react";
import { C, styles } from "./theme";

// 화면
import Dashboard from "./screens/Dashboard";
import Analytics from "./screens/Analytics";
import Orders from "./screens/Orders";
import Shipping from "./screens/Shipping";
import ProductList from "./screens/ProductList";
import Products from "./screens/Products";
import Inventory from "./screens/Inventory";
import CustomerList from "./screens/CustomerList";
import Customers from "./screens/Customers";
import Promotions from "./screens/Promotions";
import Reviews from "./screens/Reviews";
import Checkout from "./screens/Checkout";
import Settlement from "./screens/Settlement";
import CS from "./screens/CS";
import Permissions from "./screens/Permissions";
import StoreSettings from "./screens/StoreSettings";

// 위젯
import NotificationPanel from "./widgets/NotificationPanel";
import GlobalSearch from "./widgets/GlobalSearch";

// 설정 모달
import ProfileModal from "./modals/ProfileModal";
import NotificationModal from "./modals/NotificationModal";
import DisplayModal from "./modals/DisplayModal";
import SecurityModal from "./modals/SecurityModal";
import LocaleModal from "./modals/LocaleModal";
import OperationLogModal from "./modals/OperationLogModal";

import { NewOrderBadge } from "./widgets/ShopOrdersBadge";

// ── 네비게이션 메뉴 ─────────────────────────────────────────
const NAV = [
  { section: "메인", items: [
    { id: "dashboard", label: "대시보드", icon: "▦" },
    { id: "analytics", label: "매출 분석", icon: "📊" },
    { id: "orders", label: "주문 관리", icon: "🛒",
  badge: <NewOrderBadge />, badgeColor: "red" },
    { id: "shipping", label: "배송 현황", icon: "🚚", badge: "3", badgeColor: "blue" },
  ]},
  { section: "상품", items: [
    { id: "productList", label: "상품 목록", icon: "🗂" },
    { id: "inventory", label: "재고 관리", icon: "🏭" },
  ]},
  { section: "고객·마케팅", items: [
    { id: "customerList", label: "고객 목록", icon: "👥" },
    { id: "customers", label: "고객 프로필", icon: "👤" },
    { id: "promotions", label: "프로모션·쿠폰", icon: "🎫" },
    { id: "reviews", label: "리뷰·평점", icon: "⭐" },
    { id: "cs", label: "CS 고객문의", icon: "💬", badge: "2", badgeColor: "red" },
  ]},
  { section: "결제", items: [
    { id: "checkout", label: "결제 페이지", icon: "💳" },
    { id: "settlement", label: "정산 관리", icon: "🧾" },
  ]},
  { section: "설정", items: [
    { id: "storeSettings", label: "스토어 설정", icon: "🏪" },
    { id: "permissions", label: "권한 관리", icon: "🔐" },
  ]},
];

const SCREENS = { dashboard: Dashboard, analytics: Analytics, orders: Orders, shipping: Shipping, productList: ProductList, products: Products, inventory: Inventory, customerList: CustomerList, customers: Customers, promotions: Promotions, reviews: Reviews, checkout: Checkout, settlement: Settlement, cs: CS, permissions: Permissions, storeSettings: StoreSettings };
const TITLES = { dashboard: "대시보드", analytics: "매출 분석", orders: "주문 관리", shipping: "배송 현황", productList: "상품 목록", products: "상품 등록", inventory: "재고 관리", customerList: "고객 목록", customers: "고객 프로필", promotions: "프로모션·쿠폰 관리", reviews: "리뷰·평점 관리", checkout: "결제 페이지", settlement: "정산 관리", cs: "CS 고객문의 관리", permissions: "권한 관리", storeSettings: "스토어 설정" };
const MENU_ITEMS = [
  { icon: "👤", label: "내 프로필", modal: "profile" },
  { icon: "🔔", label: "알림 설정", modal: "notification" },
  { icon: "🎨", label: "화면 설정", modal: "display" },
  { icon: "🔒", label: "보안 설정", modal: "security" },
  { icon: "🌐", label: "언어 / 지역", modal: "locale" },
  { icon: "📋", label: "운영 로그", modal: "log" },
];

export default function EcommerceAdmin({ onLogout }) {
  const [current, setCurrent] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const Screen = SCREENS[current];
  return (
    <div style={styles.app} onClick={() => setMenuOpen(false)}>
      {activeModal === "profile" && <ProfileModal onClose={() => setActiveModal(null)} />}
      {activeModal === "notification" && <NotificationModal onClose={() => setActiveModal(null)} />}
      {activeModal === "display" && <DisplayModal onClose={() => setActiveModal(null)} />}
      {activeModal === "security" && <SecurityModal onClose={() => setActiveModal(null)} />}
      {activeModal === "locale" && <LocaleModal onClose={() => setActiveModal(null)} />}
      {activeModal === "log" && <OperationLogModal onClose={() => setActiveModal(null)} />}
      {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} C={C} />}
      {searchOpen && <GlobalSearch onClose={() => setSearchOpen(false)} onNavigate={setCurrent} C={C} />}
      <div style={styles.sidebar}>
        <div style={styles.sidebarTop}>
          <div style={styles.logo}>
            <div style={styles.logoBox}>S</div>
            <span style={styles.logoText}>ShopAdmin</span>
          </div>
          <div style={styles.logoSub}>이커머스 관리자</div>
        </div>
        <div style={styles.nav}>
          {NAV.map(({ section, items }) => (
            <div key={section} style={styles.navSection}>
              <div style={styles.navLabel}>{section}</div>
              {items.map(item => (
                <div key={item.id} style={styles.navItem(current === item.id)} onClick={() => setCurrent(item.id)}>
                  <span style={{ fontSize: 14 }}>{item.icon}</span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.badge && <span style={styles.navBadge(item.badgeColor)}>{item.badge}</span>}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* ── 사이드바 하단 ── */}
        <div style={{ ...styles.sidebarFooter, position: "relative" }}>

          {/* 설정 팝업 메뉴 */}
          {menuOpen && (
            <div
              onClick={e => e.stopPropagation()}
              style={{
                position: "absolute",
                bottom: 64,
                left: 12,
                width: 176,
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
                overflow: "hidden",
                zIndex: 100,
              }}
            >
              {/* 유저 정보 헤더 */}
              <div style={{ padding: "10px 13px 8px", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.text }}>관리자</div>
                <div style={{ fontSize: 10, color: C.textHint, marginTop: 1 }}>admin@shopadmin.com</div>
              </div>

              {/* 메뉴 항목 */}
              {MENU_ITEMS.map(item => (
                <div
                  key={item.label}
                  style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 13px", fontSize: 12, color: C.textSub, cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.background = C.bg}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  onClick={() => { setMenuOpen(false); setActiveModal(item.modal); }}
                >
                  <span style={{ fontSize: 14 }}>{item.icon}</span>
                  {item.label}
                </div>
              ))}

              {/* 구분선 */}
              <div style={{ height: 1, background: C.border, margin: "4px 0" }} />

              {/* 로그아웃 */}
              <div
                onClick={() => { setMenuOpen(false); onLogout && onLogout(); }}
                style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 13px 10px", fontSize: 12, color: C.red, cursor: "pointer", fontWeight: 600 }}
                onMouseEnter={e => e.currentTarget.style.background = C.redBg}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <span style={{ fontSize: 14 }}>🚪</span>
                로그아웃
              </div>
            </div>
          )}

          {/* 아바타 행 */}
          <div style={styles.avatarRow}>
            <div style={styles.avatar}>관</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>관리자</div>
              <div style={{ fontSize: 10, color: C.textHint }}>Super Admin</div>
            </div>
            <span
              onClick={e => { e.stopPropagation(); setMenuOpen(o => !o); }}
              style={{
                fontSize: 14,
                color: menuOpen ? C.text : C.textHint,
                cursor: "pointer",
                padding: "2px 4px",
                borderRadius: 5,
                background: menuOpen ? C.bg : "transparent",
                userSelect: "none",
              }}
            >⋯</span>
          </div>
        </div>
      </div>

      <div style={styles.main}>
        <div style={styles.topbar}>
          <span style={styles.pageTitle}>{TITLES[current]}</span>
          <div style={{ ...styles.searchBox, cursor: "pointer" }} onClick={() => setSearchOpen(true)}>
            🔍 검색...
            <span style={{ marginLeft: "auto", fontSize: 10, color: C.textHint, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 4, padding: "1px 5px" }}>Ctrl K</span>
          </div>
          <div style={styles.iconBtn} onClick={() => setNotifOpen(o => !o)}>
            🔔
            <div style={styles.notifDot} />
          </div>
          <div style={styles.iconBtn}>👤</div>
        </div>
        <div style={styles.content}>
          <Screen onNavigate={setCurrent} />
        </div>
      </div>
    </div>
  );
}
