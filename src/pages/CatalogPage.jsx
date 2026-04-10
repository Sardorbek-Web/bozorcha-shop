import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import MobileLayout from "../components/layout/MobileLayout";
import { supabase } from "../lib/supabase";
import ProductCard from "../components/ui/ProductCard";
import { useUserStore } from "../store/useUserStore";
import { useFavoritesStore } from "../store/useFavoritesStore";

export default function CatalogPage() {
  const { profile } = useUserStore();
  const { setFavoriteIds } = useFavoritesStore();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [search, selectedCategory, priceFrom, priceTo]);

  useEffect(() => {
    if (profile?.id) {
      fetchFavorites();
    }
  }, [profile]);

  async function fetchFavorites() {
    const { data, error } = await supabase
      .from("favorites")
      .select("product_id")
      .eq("profile_id", profile.id);

    if (!error && data) {
      setFavoriteIds(data.map((item) => item.product_id));
    }
  }

  async function fetchCategories() {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("created_at");

    setCategories(data || []);
  }

  async function fetchProducts() {
    setLoading(true);

    let query = supabase
      .from("products")
      .select(`
        *,
        product_images (
          image_url
        )
      `)
      .order("created_at", { ascending: false });

    if (search) {
      query = query.ilike("name_uz", `%${search}%`);
    }

    if (selectedCategory) {
      query = query.eq("category_id", selectedCategory);
    }

    if (priceFrom) {
      query = query.gte("price", Number(priceFrom));
    }

    if (priceTo) {
      query = query.lte("price", Number(priceTo));
    }

    const { data } = await query;

    const normalized =
      data?.map((item) => ({
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
    <MobileLayout title="Katalog">
      <div className="space-y-4 pb-24">
        <div className="flex items-center gap-2 rounded-2xl bg-gray-100 p-3 dark:bg-neutral-800">
          <Search size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Mahsulot qidirish..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setSelectedCategory("")}
            className={`rounded-xl px-4 py-2 text-sm ${
              selectedCategory === ""
                ? "bg-violet-600 text-white"
                : "bg-gray-100 dark:bg-neutral-800"
            }`}
          >
            Hammasi
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm ${
                selectedCategory === cat.id
                  ? "bg-violet-600 text-white"
                  : "bg-gray-100 dark:bg-neutral-800"
              }`}
            >
              {cat.name_uz}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <input
            placeholder="Min narx"
            value={priceFrom}
            onChange={(e) => setPriceFrom(e.target.value)}
            className="input"
          />
          <input
            placeholder="Max narx"
            value={priceTo}
            onChange={(e) => setPriceTo(e.target.value)}
            className="input"
          />
        </div>

        {loading && <div className="card card-dark p-6">Yuklanmoqda...</div>}

        {!loading && products.length === 0 && (
          <div className="card card-dark p-6 text-center text-sm text-gray-500">
            Hech narsa topilmadi
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onRefresh={fetchFavorites}
            />
          ))}
        </div>
      </div>
    </MobileLayout>
  );
}