// ── 상품 상세 라우트 (정적 export용 generateStaticParams 필수) ─
import { VISIBLE, byId } from "../../../../lib/store-data";
import ProductDetail from "../../../../components/shop/ProductDetail";

export const dynamicParams = false;

export function generateStaticParams() {
  return VISIBLE.map(p => ({ id: String(p.id) }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const p = byId(id);
  return { title: p ? `${p.name} — ShopAdmin` : "ShopAdmin" };
}

export default async function Page({ params }) {
  const { id } = await params;
  return <ProductDetail id={Number(id)} />;
}
