import { useEffect, useState } from "react";
import {
  Heart,
  ShieldCheck,
  Truck,
  Clock3,
  MessageCircleMore,
} from "lucide-react";
import { useParams, Link } from "react-router-dom";
import MobileLayout from "../components/layout/MobileLayout";
import { supabase } from "../lib/supabase";

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [sizes, setSizes] = useState([]);
  const [selectedSize, setSelectedSize] = useState("");

  useEffect(() => {
    fetchProduct();
  }, [id]);

  async function fetchProduct() {
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        product_images (
          image_url
        ),
        product_variants (
          id,
          type,
          value,
          stock
        )
      `)
      .eq("id", id)
      .single();

    if (!error && data) {
      setProduct(data);

      const sizeVariants =
        data.product_variants?.filter((item) => item.type === "size") || [];

      setSizes(sizeVariants);

      if (sizeVariants.length > 0) {
        setSelectedSize(sizeVariants[0].value);
      }
    }
  }

  if (!product) {
    return (
      <MobileLayout title="Mahsulot">
        <div className="card card-dark p-6">Yuklanmoqda...</div>
      </MobileLayout>
    );
  }

  const imageUrl =
    product.product_images?.[0]?.image_url || "https://placehold.co/600x600";

  const deliveryText =
    product.supply_type === "ready"
      ? `${product.delivery_days_min || 1}-${
          product.delivery_days_max || 3
        } kun`
      : `${product.delivery_days_min || 10}-${
          product.delivery_days_max || 12
        } kun`;

  return (
    <MobileLayout title="Mahsulot">
      <div className="space-y-4 pb-24">
        <div className="overflow-hidden rounded-[32px] border border-white/60 bg-white shadow-soft dark:border-neutral-800 dark:bg-neutral-900">
          <img
            src={imageUrl}
            alt={product.name_uz}
            className="w-full object-cover"
          />
        </div>

        <div className="card card-dark p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-lg font-bold leading-tight">
                {product.name_uz}
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {product.supply_type === "preorder"
                  ? "Xitoydan buyurtma qilinadi"
                  : "Tayyor mahsulot"}
              </p>
            </div>

            <button className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-100 dark:bg-neutral-800">
              <Heart size={18} />
            </button>
          </div>

          <div className="mt-4">
            {product.old_price && (
              <p className="text-sm text-gray-400 line-through">
                {Number(product.old_price).toLocaleString()} so'm
              </p>
            )}
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-violet-600">
                {Number(product.price).toLocaleString()} so'm
              </p>
              {product.old_price && (
                <span className="badge-sale">
                  -
                  {Math.round(
                    ((Number(product.old_price) - Number(product.price)) /
                      Number(product.old_price)) *
                      100
                  )}
                  %
                </span>
              )}
            </div>
          </div>

          <p className="mt-4 text-sm leading-6 text-gray-600 dark:text-gray-300">
            {product.description_uz || "Mahsulot tavsifi kiritilmagan."}
          </p>

          {sizes.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 font-semibold">O'lcham tanlang</p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => {
                  const active = selectedSize === size.value;

                  return (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size.value)}
                      className={`rounded-2xl px-4 py-2.5 text-sm font-medium transition ${
                        active
                          ? "bg-violet-600 text-white"
                          : "border border-gray-200 bg-white text-gray-800 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                      }`}
                    >
                      {size.value}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-5 grid gap-2">
            <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800/70">
              <Clock3 size={18} className="text-violet-600" />
              <span className="text-sm">
                Yetkazib berish: {deliveryText}
              </span>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800/70">
              <Truck size={18} className="text-violet-600" />
              <span className="text-sm">
                Cargo summasi keyinchalik alohida bildiriladi
              </span>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800/70">
              <ShieldCheck size={18} className="text-violet-600" />
              <span className="text-sm">
                To'lov tasdiqlangach buyurtma jarayoni boshlanadi
              </span>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800/70">
              <MessageCircleMore size={18} className="text-violet-600" />
              <span className="text-sm">
                Cargo narxi Telegram yoki telefon orqali aytiladi
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-24 left-0 right-0 z-30">
        <div className="container-mobile px-4">
          <div className="flex items-center justify-between rounded-[26px] border border-white/70 bg-white/95 p-3 shadow-soft backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/95">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Narxi
              </p>
              <p className="text-lg font-bold text-violet-600">
                {Number(product.price).toLocaleString()} so'm
              </p>
            </div>

            <Link
              to="/checkout"
              state={{
                productId: product.id,
                productName: product.name_uz,
                productPrice: Number(product.price),
                selectedSize,
                deliveryText,
              }}
              className="btn-primary px-5"
            >
              Buyurtma berish
            </Link>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}