"use client";

import { AuthProvider } from "../../lib/auth";
import { CartProvider } from "../../lib/cart";
import { WishlistProvider } from "../../lib/wishlist";
import ShopLayout from "./ShopLayout";

export default function ShopProviders({ children }) {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <ShopLayout>{children}</ShopLayout>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}