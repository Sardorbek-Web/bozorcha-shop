import { Heart, ShoppingCart, Package2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useCartStore } from "../../store/useCartStore";
import { useFavoritesStore } from "../../store/useFavoritesStore";

export default function ProductCard({ product }) {
  const addToCart = useCartStore((state) => state.addToCart);
  const favorites = useFavoritesStore((state) => state.favorites || []);
  const toggleFavorite = useFavoritesStore(
    (state) => state.toggleFavorite || (() => {})
  );

  const safeProduct = {
    id: product?.id ?? "",
    name: product?.name ?? "Mahsulot",
    price: Number(product?.price || 0),
    oldPrice: product?.oldPrice ? Number(product.oldPrice) : null,
    image: product?.image || "",
    selectedSize: product?.selectedSize || null,
    quantity: product?.quantity || 1,
  };

  const isFavorite = Array.isArray(favorites)
    ? favorites.some((item) => item?.id === safeProduct.id)
    : false;

  const discountPercent =
    safeProduct.oldPrice && safeProduct.oldPrice > safeProduct.price
      ? Math.round(
          ((safeProduct.oldPrice - safeProduct.price) / safeProduct.oldPrice) *
            100
        )
      : null;

  function handleAddToCart(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!safeProduct.id) return;

    addToCart({
      id: safeProduct.id,
      name: safeProduct.name,
      price: safeProduct.price,
      image: safeProduct.image,
      quantity: 1,
      selectedSize: null,
    });
  }

  function handleToggleFavorite(e) {
    e.preventDefault();
    e.stopPropagation();

    toggleFavorite({
      id: safeProduct.id,
      name: safeProduct.name,
      price: safeProduct.price,
      image: safeProduct.image,
    });
  }

  return (
    <div className="overflow-hidden rounded-[22px] border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 dark:border-neutral-800 dark:bg-neutral-900">
      <Link to={`/product/${safeProduct.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-neutral-800">
          {safeProduct.image ? (
            <img
              src={safeProduct.image}
              alt={safeProduct.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-400">
              <Package2 size={42} />
            </div>
          )}

          {discountPercent ? (
            <div className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-1 text-[10px] font-bold text-white">
              -{discountPercent}%
            </div>
          ) : null}

          <button
            type="button"
            onClick={handleToggleFavorite}
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow dark:bg-neutral-900/90 dark:text-gray-200"
          >
            <Heart
              size={16}
              className={isFavorite ? "fill-red-500 text-red-500" : ""}
            />
          </button>
        </div>

        <div className="space-y-2 p-3">
          <h3 className="line-clamp-2 min-h-[38px] text-sm font-semibold">
            {safeProduct.name}
          </h3>

          <div className="space-y-1">
            {safeProduct.oldPrice ? (
              <p className="text-xs text-gray-400 line-through">
                {safeProduct.oldPrice.toLocaleString()} so'm
              </p>
            ) : null}

            <p className="text-base font-bold text-violet-600">
              {safeProduct.price.toLocaleString()} so'm
            </p>
          </div>
        </div>
      </Link>

      <div className="px-3 pb-3">
        <button
          onClick={handleAddToCart}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 py-2.5 text-sm font-semibold text-white"
        >
          <ShoppingCart size={16} />
          Savatchaga
        </button>
      </div>
    </div>
  );
}