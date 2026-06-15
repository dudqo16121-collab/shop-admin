"use client";

import { AuthProvider } from "../../lib/auth";
import { CartProvider } from "../../lib/cart";
import { WishlistProvider } from "../../lib/wishlist";
import ShopLayout from "./ShopLayout";
import { CompareProvider } from "../../lib/compare";
import CompareBar from "./CompareBar";

export default function ShopProviders({ children }) {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
            <CompareProvider>
          <ShopLayout>{children}</ShopLayout>
          <CompareBar />
          </CompareProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}