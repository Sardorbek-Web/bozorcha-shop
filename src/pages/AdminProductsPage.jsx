import { useEffect, useState } from "react";
import { Trash2, Pencil, Plus, Package2 } from "lucide-react";
import { Link } from "react-router-dom";
import MobileLayout from "../components/layout/MobileLayout";
import { supabase } from "../lib/supabase";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [imagesMap, setImagesMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setProducts(data);

      const ids = data.map((item) => item.id);
      if (ids.length > 0) {
        const { data: images } = await supabase
          .from("product_images")
          .select("product_id, image_url, sort_order")
          .in("product_id", ids)
          .order("sort_order", { ascending: true });

        const map = {};
        (images || []).forEach((img) => {
          if (!map[img.product_id]) {
            map[img.product_id] = img.image_url;
          }
        });
        setImagesMap(map);
      }
    } else {
      console.error(error);
    }

    setLoading(false);
  }

  async function deleteProduct(id) {
    const ok = window.confirm("Rostdan o‘chirmoqchimisiz?");
    if (!ok) return;

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      console.error(error);
      alert("O‘chirishda xatolik");
      return;
    }

    fetchProducts();
  }

  return (
    <MobileLayout title="Mahsulotlar">
      <div className="space-y-4 pb-24">
        <Link
          to="/admin/products/new"
          className="flex items-center justify-center gap-2 rounded-2xl bg-violet-600 py-3 font-semibold text-white shadow-lg"
        >
          <Plus size={18} />
          Yangi mahsulot qo‘shish
        </Link>

        {loading && (
          <div className="card card-dark p-6">Yuklanmoqda...</div>
        )}

        {!loading && products.length === 0 && (
          <div className="card card-dark p-6 text-center text-sm text-gray-500">
            Mahsulotlar yo‘q
          </div>
        )}

        {!loading &&
          products.map((product) => (
            <div
              key={product.id}
              className="card card-dark overflow-hidden p-0"
            >
              <div className="flex gap-3 p-3">
                <div className="h-24 w-24 overflow-hidden rounded-2xl bg-gray-100 dark:bg-neutral-800">
                  {imagesMap[product.id] ? (
                    <img
                      src={imagesMap[product.id]}
                      alt={product.name_uz}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                      <Package2 size={24} />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <p className="line-clamp-2 font-bold">{product.name_uz}</p>
                  <p className="mt-1 text-sm text-violet-600 font-semibold">
                    {Number(product.price).toLocaleString()} so'm
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Stock: {product.stock || 0}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {product.supply_type === "preorder"
                      ? "Xitoydan buyurtma"
                      : "Tayyor mahsulot"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 border-t border-gray-100 p-3 dark:border-neutral-800">
                <Link
                  to={`/admin/products/edit/${product.id}`}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gray-100 py-3 font-medium dark:bg-neutral-800"
                >
                  <Pencil size={16} />
                  Tahrirlash
                </Link>

                <button
                  onClick={() => deleteProduct(product.id)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-red-500 py-3 font-medium text-white"
                >
                  <Trash2 size={16} />
                  O‘chirish
                </button>
              </div>
            </div>
          ))}
      </div>
    </MobileLayout>
  );
}