import { useEffect, useMemo, useState } from "react";
import MobileLayout from "../components/layout/MobileLayout";
import ProductCard from "../components/ui/ProductCard";
import { supabase } from "../lib/supabase";

export default function CatalogPage() {
  const [products, setProducts] = useState([]);
  const [imagesMap, setImagesMap] = useState({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);

    try {
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (productsError) throw productsError;

      const safeProducts = Array.isArray(productsData) ? productsData : [];
      setProducts(safeProducts);

      const ids = safeProducts.map((item) => item.id).filter(Boolean);

      if (ids.length > 0) {
        const { data: imagesData, error: imagesError } = await supabase
          .from("product_images")
          .select("product_id, image_url, sort_order")
          .in("product_id", ids)
          .order("sort_order", { ascending: true });

        if (imagesError) throw imagesError;

        const map = {};
        (imagesData || []).forEach((img) => {
          if (img?.product_id && !map[img.product_id]) {
            map[img.product_id] = img.image_url || "";
          }
        });

        setImagesMap(map);
      } else {
        setImagesMap({});
      }
    } catch (error) {
      console.error("CatalogPage xato:", error);
      setProducts([]);
      setImagesMap({});
    } finally {
      setLoading(false);
    }
  }

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const uz = item?.name_uz || "";
      const ru = item?.name_ru || "";
      const query = search.toLowerCase();

      return uz.toLowerCase().includes(query) || ru.toLowerCase().includes(query);
    });
  }, [products, search]);

  const uiProducts = filteredProducts.map((product) => ({
    id: product?.id,
    name: product?.name_uz || product?.name_ru || "Mahsulot",
    price: Number(product?.price || 0),
    oldPrice: product?.old_price ? Number(product.old_price) : null,
    image: imagesMap[product.id] || "",
  }));

  return (
    <MobileLayout title="Katalog">
      <div className="space-y-4 pb-24">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input"
          placeholder="Mahsulot qidirish"
        />

        {loading ? (
          <div className="card card-dark p-6">Yuklanmoqda...</div>
        ) : uiProducts.length === 0 ? (
          <div className="card card-dark p-6">Mahsulot topilmadi</div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {uiProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </MobileLayout>
  );
}