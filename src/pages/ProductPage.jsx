import { useEffect, useMemo, useState } from "react";
import { Heart, ShoppingCart, Package2, Truck, ShieldCheck } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import MobileLayout from "../components/layout/MobileLayout";
import { supabase } from "../lib/supabase";
import { useCartStore } from "../store/useCartStore";
import { useFavoritesStore } from "../store/useFavoritesStore";

function resolveImageUrl(imagePathOrUrl) {
  if (!imagePathOrUrl) return "";
  if (
    imagePathOrUrl.startsWith("http://") ||
    imagePathOrUrl.startsWith("https://")
  ) {
    return imagePathOrUrl;
  }

  const { data } = supabase.storage
    .from("product-images")
    .getPublicUrl(imagePathOrUrl);

  return data?.publicUrl || "";
}

function parseSizes(raw) {
  if (!raw) return [];
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const addToCart = useCartStore((state) => state.addToCart);
  const favorites = useFavoritesStore((state) => state.favorites || []);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [activeImage, setActiveImage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchProduct();
  }, [id]);

  async function fetchProduct() {
    setLoading(true);
    setMessage("");

    try {
      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (productError) throw productError;

      setProduct(productData);

      const { data: imageRows, error: imageError } = await supabase
        .from("product_images")
        .select("*")
        .eq("product_id", id)
        .order("sort_order", { ascending: true });

      if (imageError) throw imageError;

      const resolvedImages = (imageRows || [])
        .map((row) => resolveImageUrl(row.image_url))
        .filter(Boolean);

      setImages(resolvedImages);
      setActiveImage(resolvedImages[0] || "");
    } catch (error) {
      console.error("ProductPage xato:", error);
      setMessage("Mahsulotni yuklashda xatolik bo‘ldi");
    } finally {
      setLoading(false);
    }
  }

  const sizes = useMemo(() => parseSizes(product?.sizes), [product?.sizes]);

  const isFavorite = Array.isArray(favorites)
    ? favorites.some((item) => item?.id === product?.id)
    : false;

  function handleToggleFavorite() {
    if (!product?.id) return;

    toggleFavorite({
      id: product.id,
      name: product.name_uz || product.name_ru || "Mahsulot",
      price: Number(product.price || 0),
      image: activeImage || images[0] || "",
    });
  }

  function handleAddToCart() {
    if (!product?.id) return;

    if (sizes.length > 0 && !selectedSize) {
      setMessage("Iltimos, razmer tanlang");
      return;
    }

    addToCart({
      id: product.id,
      name: product.name_uz || product.name_ru || "Mahsulot",
      price: Number(product.price || 0),
      image: activeImage || images[0] || "",
      selectedSize: selectedSize || null,
      quantity: 1,
    });

    setMessage("Savatchaga qo‘shildi ✅");
  }

  function handleBuyNow() {
    if (!product?.id) return;

    if (sizes.length > 0 && !selectedSize) {
      setMessage("Iltimos, razmer tanlang");
      return;
    }

    navigate("/checkout", {
      state: {
        productId: product.id,
        productName: product.name_uz || product.name_ru || "Mahsulot",
        productPrice: Number(product.price || 0),
        selectedSize: selectedSize || "",
        deliveryText: "10–15 kun",
      },
    });
  }

  if (loading) {
    return (
      <MobileLayout title="Mahsulot">
        <div className="card card-dark p-6">Yuklanmoqda...</div>
      </MobileLayout>
    );
  }

  if (!product) {
    return (
      <MobileLayout title="Mahsulot">
        <div className="card card-dark p-6">Mahsulot topilmadi</div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Mahsulot">
      <div className="space-y-4 pb-24">
        <div className="card card-dark overflow-hidden p-0">
          <div className="relative aspect-square bg-gray-100 dark:bg-neutral-900">
            {activeImage ? (
              <img
                src={activeImage}
                alt={product.name_uz || "Mahsulot"}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gray-400">
                <Package2 size={56} />
              </div>
            )}

            <button
              type="button"
              onClick={handleToggleFavorite}
              className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow dark:bg-neutral-900/90"
            >
              <Heart
                size={18}
                className={isFavorite ? "fill-red-500 text-red-500" : ""}
              />
            </button>
          </div>

          {images.length > 1 ? (
            <div className="flex gap-2 overflow-x-auto p-3">
              {images.map((img, index) => (
                <button
                  key={`${img}-${index}`}
                  type="button"
                  onClick={() => setActiveImage(img)}
                  className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl border ${
                    activeImage === img
                      ? "border-violet-600"
                      : "border-gray-200 dark:border-neutral-800"
                  }`}
                >
                  <img src={img} alt="preview" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="card card-dark p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold">
                {product.name_uz || product.name_ru || "Mahsulot"}
              </h1>
              {product.category ? (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {product.category}
                </p>
              ) : null}
            </div>

            <div className="text-right">
              {product.old_price ? (
                <p className="text-sm text-gray-400 line-through">
                  {Number(product.old_price).toLocaleString()} so'm
                </p>
              ) : null}
              <p className="text-xl font-bold text-violet-600">
                {Number(product.price || 0).toLocaleString()} so'm
              </p>
            </div>
          </div>

          {sizes.length > 0 ? (
            <div className="mt-5">
              <h2 className="mb-3 text-sm font-semibold">Razmer tanlang</h2>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      setSelectedSize(size);
                      setMessage("");
                    }}
                    className={`rounded-2xl border px-4 py-2 text-sm font-medium transition ${
                      selectedSize === size
                        ? "border-violet-600 bg-violet-600 text-white"
                        : "border-gray-200 bg-gray-50 dark:border-neutral-800 dark:bg-neutral-900"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-5 space-y-3 text-sm">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <Truck size={16} />
              <span>Xitoydan buyurtma • 10–15 kunda yetib keladi</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <ShieldCheck size={16} />
              <span>Ishonchli buyurtma va admin kuzatuvi</span>
            </div>
          </div>
        </div>

        <div className="card card-dark p-4">
          <h2 className="mb-3 text-lg font-bold">Tavsif</h2>
          <p className="whitespace-pre-line text-sm text-gray-600 dark:text-gray-300">
            {product.description_uz ||
              product.description_ru ||
              "Tavsif mavjud emas"}
          </p>
        </div>

        {message ? (
          <div className="card card-dark p-4 text-sm">{message}</div>
        ) : null}

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex items-center justify-center gap-2 rounded-2xl bg-gray-100 py-4 font-semibold dark:bg-neutral-800"
          >
            <ShoppingCart size={18} />
            Savatchaga
          </button>

          <button
            type="button"
            onClick={handleBuyNow}
            className="rounded-2xl bg-violet-600 py-4 font-semibold text-white"
          >
            Buyurtma berish
          </button>
        </div>
      </div>
    </MobileLayout>
  );
}