import { useEffect, useState } from "react";
import {
  Package,
  Tag,
  FileText,
  Layers3,
  Boxes,
  Truck,
  Loader2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import MobileLayout from "../components/layout/MobileLayout";
import { supabase } from "../lib/supabase";

export default function AdminEditProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    nameRu: "",
    price: "",
    oldPrice: "",
    stock: "",
    category: "",
    description: "",
    descriptionRu: "",
    supplyType: "preorder",
    deliveryDaysMin: "10",
    deliveryDaysMax: "12",
  });

  useEffect(() => {
    fetchInitialData();
  }, [id]);

  async function fetchInitialData() {
    setPageLoading(true);
    setMessage("");

    const [categoriesRes, productRes] = await Promise.all([
      supabase.from("categories").select("*").order("created_at", { ascending: true }),
      supabase.from("products").select("*").eq("id", id).single(),
    ]);

    if (!categoriesRes.error && categoriesRes.data) {
      setCategories(categoriesRes.data);
    }

    if (!productRes.error && productRes.data) {
      const product = productRes.data;

      setForm({
        name: product.name_uz || "",
        nameRu: product.name_ru || "",
        price: product.price ?? "",
        oldPrice: product.old_price ?? "",
        stock: product.stock ?? "",
        category: product.category_id || "",
        description: product.description_uz || "",
        descriptionRu: product.description_ru || "",
        supplyType: product.supply_type || "preorder",
        deliveryDaysMin: product.delivery_days_min ?? 10,
        deliveryDaysMax: product.delivery_days_max ?? 12,
      });
    } else {
      console.error(productRes.error);
      setMessage("Mahsulot topilmadi.");
    }

    setPageLoading(false);
  }

  function handleChange(e) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const payload = {
      category_id: form.category || null,
      name_uz: form.name,
      name_ru: form.nameRu || form.name,
      description_uz: form.description,
      description_ru: form.descriptionRu || form.description,
      price: Number(form.price || 0),
      old_price: form.oldPrice === "" ? null : Number(form.oldPrice),
      stock: Number(form.stock || 0),
      supply_type: form.supplyType,
      delivery_days_min: Number(form.deliveryDaysMin || 10),
      delivery_days_max: Number(form.deliveryDaysMax || 12),
    };

    const { error } = await supabase
      .from("products")
      .update(payload)
      .eq("id", id);

    if (error) {
      console.error(error);
      setMessage(`Xatolik: ${error.message}`);
    } else {
      setMessage("Mahsulot muvaffaqiyatli yangilandi ✅");
      setTimeout(() => {
        navigate("/admin/products");
      }, 700);
    }

    setLoading(false);
  }

  if (pageLoading) {
    return (
      <MobileLayout title="Mahsulotni tahrirlash">
        <div className="card card-dark p-6">Yuklanmoqda...</div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Mahsulotni tahrirlash">
      <div className="space-y-4 pb-24">
        <form onSubmit={handleSubmit} className="card card-dark p-4">
          <h2 className="text-lg font-bold">Mahsulot ma'lumotlari</h2>

          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Package size={16} />
                Mahsulot nomi (UZ)
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="input"
                placeholder="Masalan: Erkaklar krossovkasi"
                required
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Package size={16} />
                Mahsulot nomi (RU)
              </label>
              <input
                name="nameRu"
                value={form.nameRu}
                onChange={handleChange}
                className="input"
                placeholder="Например: Мужские кроссовки"
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Layers3 size={16} />
                Kategoriya
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="">Kategoriyani tanlang</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name_uz}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <Tag size={16} />
                  Narx
                </label>
                <input
                  name="price"
                  type="number"
                  value={form.price}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <Tag size={16} />
                  Eski narx
                </label>
                <input
                  name="oldPrice"
                  type="number"
                  value={form.oldPrice}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Boxes size={16} />
                Ombordagi soni
              </label>
              <input
                name="stock"
                type="number"
                value={form.stock}
                onChange={handleChange}
                className="input"
                required
              />
            </div>

            <div className="rounded-3xl bg-violet-50 p-4 dark:bg-violet-500/10">
              <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-violet-700 dark:text-violet-300">
                <Truck size={16} />
                Yetkazib berish ma'lumoti
              </label>

              <div className="grid gap-3">
                <div>
                  <label className="mb-2 block text-sm font-medium">Turi</label>
                  <select
                    name="supplyType"
                    value={form.supplyType}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="preorder">Xitoydan buyurtma</option>
                    <option value="ready">Tayyor mahsulot</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Min kun</label>
                    <input
                      name="deliveryDaysMin"
                      type="number"
                      value={form.deliveryDaysMin}
                      onChange={handleChange}
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Max kun</label>
                    <input
                      name="deliveryDaysMax"
                      type="number"
                      value={form.deliveryDaysMax}
                      onChange={handleChange}
                      className="input"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                <FileText size={16} />
                Tavsif (UZ)
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="input min-h-[120px] resize-none"
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                <FileText size={16} />
                Tavsif (RU)
              </label>
              <textarea
                name="descriptionRu"
                value={form.descriptionRu}
                onChange={handleChange}
                className="input min-h-[120px] resize-none"
              />
            </div>

            {message && (
              <div className="rounded-2xl bg-gray-100 p-3 text-sm dark:bg-neutral-800">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-60"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Saqlanmoqda...
                </span>
              ) : (
                "O'zgarishlarni saqlash"
              )}
            </button>
          </div>
        </form>
      </div>
    </MobileLayout>
  );
}