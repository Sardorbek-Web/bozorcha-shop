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

    const { data: productsData, error: productsError } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (productsError) {
      console.error(productsError);
      setLoading(false);
      return;
    }

    setProducts(productsData || []);

    const ids = (productsData || []).map((item) => item.id);

    if (ids.length > 0) {
      const { data: imagesData, error: imagesError } = await supabase
        .from("product_images")
        .select("product_id, image_url, sort_order")
        .in("product_id", ids)
        .order("sort_order", { ascending: true });

      if (!imagesError) {
        const map = {};
        (imagesData || []).forEach((img) => {
          if (!map[img.product_id]) {
            map[img.product_id] = img.image_url;
          }
        });
        setImagesMap(map);
      }
    }

    setLoading(false);
  }

  const uiProducts = products.map((product) => ({
    id: product.id,
    name: product.name_uz,
    price: product.price,
    oldPrice: product.old_price,
    image: imagesMap[product.id] || "",
    isNew: false,
  }));

  return (
    <MobileLayout title="Bozorcha">
      <div className="space-y-4 pb-24">
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