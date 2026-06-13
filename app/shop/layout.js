// ── /shop 레이아웃: CartProvider + 공통 셸 ───────────────────
import "../../components/shop/shop.css";
import { CartProvider } from "../../lib/cart";
import ShopLayout from "../../components/shop/ShopLayout";
import { WishlistProvider } from "../../lib/wishlist";

export const metadata = {
  title: "ShopAdmin — 프리미엄 패션 스토어",
  description: "매일 입는 옷의 기준. 기본에 충실한 옷을 정직한 가격으로.",
};

export default function Layout({ children }) {
  return (
    <CartProvider>
      <WishlistProvider>
      <ShopLayout>{children}</ShopLayout>
      </WishlistProvider>
    </CartProvider>
  );
}
