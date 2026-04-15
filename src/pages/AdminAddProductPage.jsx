import { useEffect, useState } from "react";
import { ImagePlus, Loader2, Package2 } from "lucide-react";
import MobileLayout from "../components/layout/MobileLayout";
import { supabase } from "../lib/supabase";

export default function AdminAddProductPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");

  const [form, setForm] = useState({
    name: "",
    nameRu: "",
    price: "",
    oldPrice: "",
    stock: "",
    category: "",
    description: "",
    descriptionRu: "",
    sizes: "",
    supplyType: "preorder",
    deliveryDaysMin: "10",
    deliveryDaysMax: "12",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("created_at", { ascending: true });

    if (!error && data) {
      setCategories(data);
    }
  }

  function handleChange(e) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      let imageUrl = null;

      if (image) {
        const ext = image.name.split(".").pop();
        const fileName = `product-${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(fileName, image);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("product-images")
          .getPublicUrl(fileName);

        imageUrl = data.publicUrl;
      }

      const { data: product, error: productError } = await supabase
        .from("products")
        .insert([
          {
            category_id: form.category || null,
            name_uz: form.name,
            name_ru: form.nameRu || form.name,
            description_uz: form.description,
            description_ru: form.descriptionRu || form.description,
            price: Number(form.price || 0),
            old_price: form.oldPrice ? Number(form.oldPrice) : null,
            stock: Number(form.stock || 0),
            supply_type: form.supplyType,
            delivery_days_min: Number(form.deliveryDaysMin || 10),
            delivery_days_max: Number(form.deliveryDaysMax || 12),
            is_active: true,
          },
        ])
        .select()
        .single();

      if (productError) throw productError;

      if (imageUrl) {
        const { error } = await supabase.from("product_images").insert([
          {
            product_id: product.id,
            image_url: imageUrl,
            sort_order: 0,
          },
        ]);

        if (error) throw error;
      }

      if (form.sizes.trim()) {
        const sizes = form.sizes
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

        const variants = sizes.map((size) => ({
          product_id: product.id,
          type: "size",
          value: size,
          stock: Number(form.stock || 0),
        }));

        const { error } = await supabase
          .from("product_variants")
          .insert(variants);

        if (error) throw error;
      }

      setMessage("Mahsulot muvaffaqiyatli qo‘shildi ✅");
      setForm({
        name: "",
        nameRu: "",
        price: "",
        oldPrice: "",
        stock: "",
        category: "",
        description: "",
        descriptionRu: "",
        sizes: "",
        supplyType: "preorder",
        deliveryDaysMin: "10",
        deliveryDaysMax: "12",
      });
      setImage(null);
      setPreview("");
    } catch (error) {
      console.error(error);
      setMessage(`Xatolik: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <MobileLayout title="Mahsulot qo‘shish">
      <div className="pb-24">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="card card-dark overflow-hidden p-4">
            <h2 className="text-2xl font-bold">Yangi mahsulot</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Katalogga yangi mahsulot qo‘shing
            </p>

            <div className="mt-5 space-y-4">
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="input"
                placeholder="Nom (UZ)"
                required
              />

              <input
                name="nameRu"
                value={form.nameRu}
                onChange={handleChange}
                className="input"
                placeholder="Nom (RU)"
              />

              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="">Kategoriya</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name_uz}
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-2 gap-3">
                <input
                  name="price"
                  type="number"
                  value={form.price}
                  onChange={handleChange}
                  className="input"
                  placeholder="Narx"
                  required
                />
                <input
                  name="oldPrice"
                  type="number"
                  value={form.oldPrice}
                  onChange={handleChange}
                  className="input"
                  placeholder="Eski narx"
                />
              </div>

              <input
                name="stock"
                type="number"
                value={form.stock}
                onChange={handleChange}
                className="input"
                placeholder="Stock"
                required
              />

              <select
                name="supplyType"
                value={form.supplyType}
                onChange={handleChange}
                className="input"
              >
                <option value="preorder">Xitoydan buyurtma</option>
                <option value="ready">Tayyor mahsulot</option>
              </select>

              <div className="grid grid-cols-2 gap-3">
                <input
                  name="deliveryDaysMin"
                  type="number"
                  value={form.deliveryDaysMin}
                  onChange={handleChange}
                  className="input"
                  placeholder="Min kun"
                />
                <input
                  name="deliveryDaysMax"
                  type="number"
                  value={form.deliveryDaysMax}
                  onChange={handleChange}
                  className="input"
                  placeholder="Max kun"
                />
              </div>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="input min-h-[110px] resize-none"
                placeholder="Tavsif (UZ)"
              />

              <textarea
                name="descriptionRu"
                value={form.descriptionRu}
                onChange={handleChange}
                className="input min-h-[110px] resize-none"
                placeholder="Tavsif (RU)"
              />

              <input
                name="sizes"
                value={form.sizes}
                onChange={handleChange}
                className="input"
                placeholder="M, L, XL yoki 40,41,42"
              />
            </div>
          </div>

          <div className="card card-dark p-4">
            <p className="mb-3 text-base font-semibold">Rasm yuklash</p>

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-[28px] border-2 border-dashed border-gray-300 p-5 text-center transition hover:border-violet-400 dark:border-neutral-700">
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="mb-3 h-40 w-full rounded-2xl object-cover"
                />
              ) : (
                <div className="mb-3 flex h-24 w-24 items-center justify-center rounded-3xl bg-violet-50 text-violet-600 dark:bg-violet-500/10">
                  <Package2 size={34} />
                </div>
              )}

              <div className="flex items-center gap-2 text-violet-600">
                <ImagePlus size={18} />
                <span className="font-semibold">
                  {image ? image.name : "Rasm tanlash"}
                </span>
              </div>

              <p className="mt-1 text-sm text-gray-500">PNG yoki JPG</p>

              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
          </div>

          {message && (
            <div className="card card-dark p-4 text-sm">{message}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-4 text-base font-semibold disabled:opacity-60"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 size={18} className="animate-spin" />
                Saqlanmoqda...
              </span>
            ) : (
              "Mahsulotni saqlash"
            )}
          </button>
        </form>
      </div>
    </MobileLayout>
  );
}