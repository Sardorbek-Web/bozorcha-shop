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

export default function CatalogPage() {
  const [products, setProducts] = useState([]);
  const [imagesMap, setImagesMap] = useState({});
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
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
      console.error("CatalogPage xato:", error);
      setProducts([]);
      setImagesMap({});
    } finally {
      setLoading(false);
    }
  }

  const filteredProducts = useMemo(() => {
    const query = search.toLowerCase().trim();

    return products.filter((item) => {
      const nameUz = item?.name_uz || "";
      const nameRu = item?.name_ru || "";
      const category = item?.category || "";

      const matchesSearch =
        !query ||
        nameUz.toLowerCase().includes(query) ||
        nameRu.toLowerCase().includes(query);

      const matchesCategory =
        selectedCategory === "Barchasi" || category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, selectedCategory]);

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

        <div className="text-sm text-gray-500 dark:text-gray-400">
          Topildi: {uiProducts.length} ta mahsulot
        </div>

        {loading ? (
          <div className="card card-dark p-6">Yuklanmoqda...</div>
        ) : uiProducts.length === 0 ? (
          <div className="card card-dark p-6">
            Mahsulot topilmadi
          </div>
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