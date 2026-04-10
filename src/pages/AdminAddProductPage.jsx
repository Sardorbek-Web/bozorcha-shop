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
      let uploadedImageUrl = null;

      if (image) {
        const fileExt = image.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;

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
                  placeholder="199000"
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
                  placeholder="259000"
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
                placeholder="10"
                required
              />
            </div>

            <div className="rounded-3xl bg-violet-50 p-4 dark:bg-violet-500/10">
              <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-violet-700 dark:text-violet-300">
                <Truck size={16} />
                Yetkazib berish ma'lumoti
              </label>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Turi
                  </label>
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
                    <label className="mb-2 block text-sm font-medium">
                      Min kun
                    </label>
                    <input
                      name="deliveryDaysMin"
                      type="number"
                      value={form.deliveryDaysMin}
                      onChange={handleChange}
                      className="input"
                      placeholder="10"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Max kun
                    </label>
                    <input
                      name="deliveryDaysMax"
                      type="number"
                      value={form.deliveryDaysMax}
                      onChange={handleChange}
                      className="input"
                      placeholder="12"
                    />
                  </div>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Cargo narxi saytga chiqmaydi. Keyinchalik mijozga alohida aytiladi.
                </p>
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
                placeholder="Mahsulot haqida to'liq yozing"
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
                placeholder="Описание товара"
              />
            </div>

            <div>
              <label className="mb-2 text-sm font-medium">O'lchamlar</label>
              <input
                name="sizes"
                value={form.sizes}
                onChange={handleChange}
                className="input"
                placeholder="M, L, XL, XXL yoki 40,41,42,43"
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                <ImagePlus size={16} />
                Rasm yuklash
              </label>

              <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-300 p-6 text-center transition hover:border-violet-400 dark:border-neutral-700">
                <ImagePlus size={24} className="mb-2 text-violet-600" />
                <span className="font-medium">
                  {image ? image.name : "Mahsulot rasmini tanlang"}
                </span>
                <span className="mt-1 text-sm text-gray-500">
                  PNG yoki JPG
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                />
              </label>
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
              {loading ? "Saqlanmoqda..." : "Mahsulotni saqlash"}
            </button>
          </div>
        </form>
      </div>
    </MobileLayout>
  );
}