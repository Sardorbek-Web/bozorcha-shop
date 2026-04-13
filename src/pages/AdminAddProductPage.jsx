import { useEffect, useState } from "react";
import {
  ImagePlus,
  Package,
  Tag,
  FileText,
  Layers3,
  Boxes,
  Truck,
  Loader2,
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

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      let imageUrl = null;

      // 🔥 1. RASM YUKLASH
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

      // 🔥 2. PRODUCT INSERT
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

      // 🔥 3. IMAGE SAVE
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

      // 🔥 4. SIZE VARIANTS
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

      setMessage("Mahsulot qo‘shildi ✅");

      // reset
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
      setMessage("Xatolik: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <MobileLayout title="Mahsulot qo‘shish">
      <div className="space-y-4 pb-24">
        <form onSubmit={handleSubmit} className="card card-dark p-4">
          <h2 className="text-lg font-bold">Yangi mahsulot</h2>

          <div className="mt-4 space-y-4">

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
            />

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="input"
              placeholder="Tavsif"
            />

            <input
              name="sizes"
              value={form.sizes}
              onChange={handleChange}
              className="input"
              placeholder="M, L, XL"
            />

            {/* IMAGE */}
            <label className="border-2 border-dashed p-4 rounded-xl text-center cursor-pointer">
              {image ? image.name : "Rasm tanlash"}
              <input
                type="file"
                className="hidden"
                onChange={(e) => setImage(e.target.files[0])}
              />
            </label>

            {message && <div>{message}</div>}

            <button className="btn-primary w-full">
              {loading ? "Saqlanmoqda..." : "Saqlash"}
            </button>
          </div>
        </form>
      </div>
    </MobileLayout>
  );
}