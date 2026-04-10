import { useEffect, useState } from "react";
import MobileLayout from "../components/layout/MobileLayout";
import { supabase } from "../lib/supabase";
import { useUserStore } from "../store/useUserStore";
import ProductCard from "../components/ui/ProductCard";
import { useFavoritesStore } from "../store/useFavoritesStore";

export default function FavoritesPage() {
  const { profile } = useUserStore();
  const { setFavoriteIds } = useFavoritesStore();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      fetchFavoritesProducts();
    } else {
      setLoading(false);
    }
  }, [profile]);

  async function fetchFavoritesProducts() {
    setLoading(true);

    const { data: favoriteRows, error: favoriteError } = await supabase
      .from("favorites")
      .select("product_id")
      .eq("profile_id", profile.id);

    if (favoriteError || !favoriteRows) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const ids = favoriteRows.map((item) => item.product_id);
    setFavoriteIds(ids);

    if (ids.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const { data: productRows } = await supabase
      .from("products")
      .select(`
        *,
        product_images (
          image_url
        )
      `)
      .in("id", ids)
      .order("created_at", { ascending: false });

    const normalized =
      productRows?.map((item) => ({
        id: item.id,
        name: item.name_uz,
        price: Number(item.price),
        oldPrice: item.old_price ? Number(item.old_price) : null,
        image:
          item.product_images?.[0]?.image_url || "https://placehold.co/400x400",
      })) || [];

    setProducts(normalized);
    setLoading(false);
  }

  return (
    <MobileLayout title="Sevimlilar">
      <div className="space-y-4 pb-24">
        {loading && <div className="card card-dark p-6">Yuklanmoqda...</div>}

        {!loading && products.length === 0 && (
          <div className="card card-dark p-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Hozircha sevimli mahsulot yo‘q
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onRefresh={fetchFavoritesProducts}
            />
          ))}
        </div>
      </div>
    </MobileLayout>
  );
}