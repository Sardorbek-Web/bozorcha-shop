import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ImagePlus, Loader2, Send } from "lucide-react";
import MobileLayout from "../components/layout/MobileLayout";
import { supabase } from "../lib/supabase";

export default function AdminAddProductPage() {
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [posting, setPosting] = useState(false);
  const [message, setMessage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    name_uz: "",
    name_ru: "",
    category: "",
    price: "",
    old_price: "",
    stock: "",
    description_uz: "",
    description_ru: "",
    sizes: "",
    is_active: true,
  });

  useEffect(() => {
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

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function uploadProductImage(productId) {
    if (!imageFile) return "";

    const ext = imageFile.name.split(".").pop();
    const fileName = `product-${productId}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(fileName, imageFile);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);

    const publicUrl = data?.publicUrl || "";

    const { error: imageInsertError } = await supabase
      .from("product_images")
      .insert([
        {
          product_id: productId,
          image_url: publicUrl,
          sort_order: 0,
        },
      ]);

    if (imageInsertError) throw imageInsertError;

    return publicUrl;
  }

  async function postToChannel({
    name,
    price,
    oldPrice,
    description,
    sizes,
    image,
    category,
  }) {
    const response = await fetch("/api/post-product", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        price,
        oldPrice,
        description,
        sizes,
        image,
        category,
      }),
    });

    const raw = await response.text();
    let result = {};

    try {
      result = JSON.parse(raw);
    } catch {
      throw new Error(raw || "Serverdan noto'g'ri javob keldi");
    }

    if (!response.ok || !result.success) {
      throw new Error(
        typeof result.error === "string"
          ? result.error
          : "Kanalga yuborilmadi"
      );
    }

    return result;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");

    if (!form.name_uz.trim()) return setMessage("Nom kiriting");
    if (!form.category) return setMessage("Kategoriya tanlang");
    if (!form.price) return setMessage("Narx kiriting");
    if (!form.stock) return setMessage("Stock kiriting");

    setSaving(true);

    try {
      const { data: productData, error: productError } = await supabase
        .from("products")
        .insert([
          {
            name_uz: form.name_uz,
            name_ru: form.name_ru || form.name_uz,
            category: form.category,
            price: Number(form.price || 0),
            old_price: form.old_price ? Number(form.old_price) : null,
            stock: Number(form.stock || 0),
            description_uz: form.description_uz || "",
            description_ru: form.description_ru || form.description_uz || "",
            is_active: form.is_active,
          },
        ])
        .select()
        .single();

      if (productError) throw productError;

      const imageUrl = await uploadProductImage(productData.id);

      setMessage("Mahsulot saqlandi ✅");

      if (form.is_active) {
        setPosting(true);

        try {
          await postToChannel({
            name: form.name_uz,
            price: form.price,
            oldPrice: form.old_price,
            description: form.description_uz,
            sizes: form.sizes,
            image: imageUrl,
            category: form.category,
          });

          setMessage("Mahsulot saqlandi va kanalga yuborildi ✅");
        } catch (channelError) {
          console.error(channelError);
          setMessage(
            `Mahsulot saqlandi, lekin kanalga yuborilmadi: ${channelError.message}`
          );
        } finally {
          setPosting(false);
        }
      }

      setTimeout(() => {
        navigate("/admin/products");
      }, 1000);
    } catch (error) {
      console.error(error);
      setMessage(`Xatolik: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <MobileLayout title="Mahsulot qo‘shish">
      <form onSubmit={handleSubmit} className="space-y-4 pb-24">
        <div className="card card-dark p-4 space-y-3">
          <h2 className="text-lg font-bold">Yangi mahsulot</h2>

          <input
            name="name_uz"
            value={form.name_uz}
            onChange={handleChange}
            className="input"
            placeholder="Nom (UZ)"
          />

          <input
            name="name_ru"
            value={form.name_ru}
            onChange={handleChange}
            className="input"
            placeholder="Nom (RU)"
          />

          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="input"
          >
            <option value="">Kategoriya tanlang</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name_uz}>
                {cat.name_uz}
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
              name="old_price"
              type="number"
              value={form.old_price}
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
            name="description_uz"
            value={form.description_uz}
            onChange={handleChange}
            className="input min-h-[110px] resize-none"
            placeholder="Tavsif (UZ)"
          />

          <textarea
            name="description_ru"
            value={form.description_ru}
            onChange={handleChange}
            className="input min-h-[110px] resize-none"
            placeholder="Tavsif (RU)"
          />

          <input
            name="sizes"
            value={form.sizes}
            onChange={handleChange}
            className="input"
            placeholder="Razmerlar: M, L, XL yoki 41,42,43"
          />

          <label className="flex items-center gap-2 rounded-2xl bg-gray-100 px-4 py-3 dark:bg-neutral-800">
            <input
              type="checkbox"
              name="is_active"
              checked={form.is_active}
              onChange={handleChange}
            />
            <span>Aktiv mahsulot</span>
          </label>

          <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-300 p-6 text-center dark:border-neutral-700">
            {preview ? (
              <img
                src={preview}
                alt="preview"
                className="h-40 w-full rounded-2xl object-cover"
              />
            ) : (
              <>
                <ImagePlus size={24} className="mb-2 text-violet-600" />
                <span>Rasm yuklash</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        </div>

        {message ? <div className="card card-dark p-4 text-sm">{message}</div> : null}

        <button
          type="submit"
          disabled={saving || posting}
          className="btn-primary flex w-full items-center justify-center gap-2 py-4 disabled:opacity-60"
        >
          {saving || posting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              {posting ? "Kanalga yuborilmoqda..." : "Saqlanmoqda..."}
            </>
          ) : (
            <>
              <Send size={18} />
              Mahsulotni saqlash
            </>
          )}
        </button>
      </form>
    </MobileLayout>
  );
}