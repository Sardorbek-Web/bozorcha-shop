import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, ImagePlus } from "lucide-react";
import MobileLayout from "../components/layout/MobileLayout";
import { supabase } from "../lib/supabase";

export default function AdminEditProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");

  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
    description: "",
    sizes: "",
  });

  useEffect(() => {
    fetchProduct();
  }, []);

  async function fetchProduct() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (!error && data) {
      setForm({
        name: data.name_uz,
        price: data.price,
        stock: data.stock,
        description: data.description_uz,
        sizes: "",
      });
    }

    setLoading(false);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleImage(e) {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSave() {
    setSaving(true);

    try {
      let imageUrl = null;

      if (image) {
        const fileName = `product-${Date.now()}.jpg`;

        await supabase.storage
          .from("product-images")
          .upload(fileName, image);

        const { data } = supabase.storage
          .from("product-images")
          .getPublicUrl(fileName);

        imageUrl = data.publicUrl;
      }

      await supabase
        .from("products")
        .update({
          name_uz: form.name,
          price: Number(form.price),
          stock: Number(form.stock),
          description_uz: form.description,
        })
        .eq("id", id);

      if (imageUrl) {
        await supabase.from("product_images").insert([
          {
            product_id: id,
            image_url: imageUrl,
            sort_order: 0,
          },
        ]);
      }

      alert("Saqlangan ✅");
      navigate("/admin/products");
    } catch (err) {
      console.error(err);
      alert("Xatolik");
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <MobileLayout title="Tahrirlash">
        <div className="p-6">Yuklanmoqda...</div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Mahsulotni tahrirlash">
      <div className="space-y-4 pb-24">

        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          className="input"
          placeholder="Nom"
        />

        <div className="grid grid-cols-2 gap-3">
          <input
            name="price"
            value={form.price}
            onChange={handleChange}
            className="input"
            placeholder="Narx"
          />

          <input
            name="stock"
            value={form.stock}
            onChange={handleChange}
            className="input"
            placeholder="Stock"
          />
        </div>

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          className="input min-h-[120px]"
          placeholder="Tavsif"
        />

        <input
          name="sizes"
          value={form.sizes}
          onChange={handleChange}
          className="input"
          placeholder="M, L, XL"
        />

        <label className="border-2 border-dashed p-6 rounded-2xl text-center cursor-pointer">
          {preview ? (
            <img src={preview} className="h-40 w-full object-cover rounded-xl" />
          ) : (
            <div>
              <ImagePlus />
              <p>Rasm tanlash</p>
            </div>
          )}
          <input type="file" className="hidden" onChange={handleImage} />
        </label>

        <button
          onClick={handleSave}
          className="btn-primary w-full py-4"
          disabled={saving}
        >
          {saving ? "Saqlanmoqda..." : "Saqlash"}
        </button>
      </div>
    </MobileLayout>
  );
}