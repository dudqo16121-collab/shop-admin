// app/shop/layout.js
import "../../components/shop/shop.css";
import ShopProviders from "../../components/shop/ShopProviders";

export const metadata = {
  title: "ShopAdmin.dev — 웹 개발 리소스 마켓",
  description: "UI Kit·템플릿·플러그인·아이콘·폰트 — 프리미엄 웹 개발 리소스",
};

export default function Layout({ children }) {
  return <ShopProviders>{children}</ShopProviders>;
}