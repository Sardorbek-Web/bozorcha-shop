import { useEffect, useState } from "react";
import MobileLayout from "../components/layout/MobileLayout";
import ProductCard from "../components/ui/ProductCard";
import { supabase } from "../lib/supabase";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [imagesMap, setImagesMap] = useState({});
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
      console.error("HomePage xato:", error);
      setProducts([]);
      setImagesMap({});
    } finally {
      setLoading(false);
    }
  }

  const uiProducts = products.map((product) => ({
    id: product?.id,
    name: product?.name_uz || product?.name_ru || "Mahsulot",
    price: Number(product?.price || 0),
    oldPrice: product?.old_price ? Number(product.old_price) : null,
    image: imagesMap[product.id] || "",
  }));

  return (
    <MobileLayout title="Bozorcha">
      <div className="space-y-4 pb-24">
        <section className="overflow-hidden rounded-[28px] bg-gradient-to-br from-violet-600 via-fuchsia-500 to-indigo-500 p-5 text-white shadow-xl">
          <p className="text-sm text-violet-100">Bozorcha</p>
          <h1 className="mt-1 text-2xl font-bold">Yangi mahsulotlar</h1>
          <p className="mt-2 text-sm text-violet-100">
            Eng sara mahsulotlarni qulay narxlarda tanlang
          </p>
        </section>

        <section className="card card-dark p-4">
          <h2 className="text-xl font-bold">Aksiya</h2>

          {loading ? (
            <div className="mt-4 rounded-2xl bg-gray-50 p-6 text-sm dark:bg-neutral-800">
              Yuklanmoqda...
            </div>
          ) : uiProducts.length === 0 ? (
            <div className="mt-4 rounded-2xl bg-gray-50 p-6 text-sm dark:bg-neutral-800">
              Hozircha mahsulotlar yo‘q
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-3">
              {uiProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </div>
    </MobileLayout>
  );
}