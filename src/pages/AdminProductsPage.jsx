import { useEffect, useState } from "react";
import { Trash2, Pencil, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import MobileLayout from "../components/layout/MobileLayout";
import { supabase } from "../lib/supabase";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
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
    } else {
      console.error(error);
    }

    setLoading(false);
  }

  async function deleteProduct(id) {
    const confirmDelete = window.confirm("Rostdan o‘chirmoqchimisiz?");
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (!error) {
      fetchProducts();
    } else {
      alert("Xatolik yuz berdi");
    }
  }

  return (
    <MobileLayout title="Mahsulotlar">
      <div className="space-y-4 pb-24">
        <Link
          to="/admin/products/new"
          className="flex items-center justify-center gap-2 rounded-2xl bg-violet-600 py-3 font-semibold text-white"
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
            <div key={product.id} className="card card-dark p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold">{product.name_uz}</p>
                  <p className="text-sm text-gray-500">
                    {Number(product.price).toLocaleString()} so'm
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    {product.supply_type === "preorder"
                      ? "Xitoydan buyurtma"
                      : "Tayyor mahsulot"}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Link
                    to={`/admin/products/edit/${product.id}`}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-neutral-800"
                    title="Tahrirlash"
                  >
                    <Pencil size={16} />
                  </Link>

                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500 text-white"
                    title="O‘chirish"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>
    </MobileLayout>
  );
}