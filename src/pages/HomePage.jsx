import { useEffect, useMemo, useState } from "react";
import MobileLayout from "../components/layout/MobileLayout";
import ProductCard from "../components/ui/ProductCard";
import { supabase } from "../lib/supabase";

function resolveImageUrl(imagePathOrUrl) {
  if (!imagePathOrUrl) return "";
  if (
    imagePathOrUrl.startsWith("http://") ||
    imagePathOrUrl.startsWith("https://")
  ) {
    return imagePathOrUrl;
  }

  const { data } = supabase.storage
    .from("product-images")
    .getPublicUrl(imagePathOrUrl);

  return data?.publicUrl || "";
}

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [imagesMap, setImagesMap] = useState({});
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Barchasi");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  async function fetchCategories() {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name_uz", { ascending: true });

    if (error) {
      console.error("categories xato:", error);
      setCategories([]);
    } else {
      setCategories(data || []);
    }
  }

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
            map[img.product_id] = resolveImageUrl(img.image_url);
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

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "Barchasi") return products;
    return products.filter((item) => item?.category === selectedCategory);
  }, [products, selectedCategory]);

  const uiProducts = filteredProducts.map((product) => ({
    id: product?.id,
    name: product?.name_uz || product?.name_ru || "Mahsulot",
    price: Number(product?.price || 0),
    oldPrice: product?.old_price ? Number(product.old_price) : null,
    image: imagesMap[product.id] || "",
  }));

  const newProducts = uiProducts.slice(0, 6);

  return (
    <MobileLayout title="Bozorcha">
      <div className="space-y-4 pb-24">
        <section className="overflow-hidden rounded-[28px] bg-gradient-to-br from-violet-600 via-fuchsia-500 to-indigo-500 p-5 text-white shadow-xl">
          <p className="text-sm text-violet-100">Bozorcha</p>
          <h1 className="mt-1 text-2xl font-bold">Telegram ichida zamonaviy do‘kon</h1>
          <p className="mt-2 text-sm text-violet-100">
            Eng sara mahsulotlarni qulay narxlarda tanlang
          </p>

          <div className="mt-4 flex gap-2">
            <div className="rounded-2xl bg-white/15 px-3 py-2 text-sm">
              Tez buyurtma
            </div>
            <div className="rounded-2xl bg-white/15 px-3 py-2 text-sm">
              Ishonchli savdo
            </div>
          </div>
        </section>

        <section className="card card-dark p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">Kategoriyalar</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {categories.length} ta
            </span>
          </div>

          <div className="overflow-x-auto">
            <div className="flex gap-2 pb-1">
              <button
                onClick={() => setSelectedCategory("Barchasi")}
                className={`whitespace-nowrap rounded-2xl px-4 py-2 text-sm ${
                  selectedCategory === "Barchasi"
                    ? "bg-violet-600 text-white"
                    : "bg-gray-100 dark:bg-neutral-800"
                }`}
              >
                Barchasi
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name_uz)}
                  className={`whitespace-nowrap rounded-2xl px-4 py-2 text-sm ${
                    selectedCategory === cat.name_uz
                      ? "bg-violet-600 text-white"
                      : "bg-gray-100 dark:bg-neutral-800"
                  }`}
                >
                  {cat.name_uz}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="card card-dark p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">
              {selectedCategory === "Barchasi"
                ? "Yangi mahsulotlar"
                : selectedCategory}
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {uiProducts.length} ta
            </span>
          </div>

          {loading ? (
            <div className="rounded-2xl bg-gray-50 p-6 text-sm dark:bg-neutral-800">
              Yuklanmoqda...
            </div>
          ) : uiProducts.length === 0 ? (
            <div className="rounded-2xl bg-gray-50 p-6 text-sm dark:bg-neutral-800">
              Hozircha mahsulotlar yo‘q
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {(selectedCategory === "Barchasi" ? newProducts : uiProducts).map(
                (product) => (
                  <ProductCard key={product.id} product={product} />
                )
              )}
            </div>
          )}
        </section>
      </div>
    </MobileLayout>
  );
}