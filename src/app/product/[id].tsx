import { useLocalSearchParams } from "expo-router";

import { ProductDetailScreen } from "@/screens/product-detail-screen";

export default function ProdutoRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ProductDetailScreen productId={id} />;
}
