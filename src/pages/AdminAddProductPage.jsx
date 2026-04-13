import { useEffect, useState } from "react";
import {
  ImagePlus,
  Package,
  Tag,
  FileText,
  Layers3,
  Boxes,
  Truck,
} from "lucide-react";
import MobileLayout from "../components/layout/MobileLayout";
import { supabase } from "../lib/supabase";

export default function AdminAddProductPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [image, setImage] = useState(null);

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

    if (!error) {
      setCategories(data || []);
    }
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

    try {
      let uploadedImageUrl = null;

      if (image) {
        const fileExt = image.name.split(".").pop();
        const fileName = `product-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(fileName, image);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(fileName);

        uploadedImageUrl = publicUrlData.publicUrl;
      }

      const { data: productData, error: productError } = await supabase
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

      if (uploadedImageUrl && productData?.id) {
        const { error: imageInsertError } = await supabase
          .from("product_images")
          .insert([
            {
              product_id: productData.id,
              image_url: uploadedImageUrl,
              sort_order: 0,
            },
          ]);

        if (imageInsertError) throw imageInsertError;
      }

      if (form.sizes.trim() && productData?.id) {
        const sizesArray = form.sizes
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);

        if (sizesArray.length > 0) {
          const variants = sizesArray.map((size) => ({
            product_id: productData.id,
            type: "size",
            value: size,
            stock: Number(form.stock || 0),
          }));

          const { error: variantError } = await supabase
            .from("product_variants")
            .insert(variants);

          if (variantError) throw variantError;
        }
      }

      setMessage("Mahsulot muvaffaqiyatli qo'shildi ✅");
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
    } catch (error) {
      console.error(error);
      setMessage(`Xatolik: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <MobileLayout title="Mahsulot qo'shish">
      <div className="space-y-4 pb-24">
        <form onSubmit={handleSubmit} className="card card-dark p-4">
          <h2 className="text-lg font-bold">Yangi mahsulot</h2>

          <div className="mt-4 space-y-4">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="input"
              placeholder="Mahsulot nomi (UZ)"
              required
            />

            <input
              name="nameRu"
              value={form.nameRu}
              onChange={handleChange}
              className="input"
              placeholder="Mahsulot nomi (RU)"
            />

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="input"
              required
            >
              <option value="">Kategoriya tanlang</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name_uz}
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
              placeholder="Ombordagi soni"
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
              className="input min-h-[120px] resize-none"
              placeholder="Tavsif (UZ)"
            />

            <textarea
              name="descriptionRu"
              value={form.descriptionRu}
              onChange={handleChange}
              className="input min-h-[120px] resize-none"
              placeholder="Tavsif (RU)"
            />

            <input
              name="sizes"
              value={form.sizes}
              onChange={handleChange}
              className="input"
              placeholder="M, L, XL, XXL yoki 40,41,42"
            />

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-300 p-6 text-center transition hover:border-violet-400 dark:border-neutral-700">
              <ImagePlus size={24} className="mb-2 text-violet-600" />
              <span className="font-medium">
                {image ? image.name : "Mahsulot rasmini tanlang"}
              </span>
              <span className="mt-1 text-sm text-gray-500">PNG yoki JPG</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
              />
            </label>

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
              {loading ? "Saqlanmoqda..." : "Mahsulotni saqlash"}
            </button>
          </div>
        </form>
      </div>
    </MobileLayout>
  );
}