import { Heart, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useCartStore } from "../../store/useCartStore";
import { useFavoritesStore } from "../../store/useFavoritesStore";

export default function ProductCard({ product }) {
  const addToCart = useCartStore((state) => state.addToCart);
  const { favorites, toggleFavorite } = useFavoritesStore();

  const isFavorite = favorites.some((item) => item.id === product.id);

  const imageSrc =
    product.image && product.image.trim() !== ""
      ? product.image
      : "https://placehold.co/400x400?text=Bozorcha";

  const discountPercent =
    product.oldPrice && product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : null;

  return (
    <div className="overflow-hidden rounded-[22px] border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 dark:border-neutral-800 dark:bg-neutral-900">
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-neutral-800">
          <img
            src={imageSrc}
            alt={product.name}
            className="h-full w-full object-cover"
          />

          {discountPercent ? (
            <div className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-1 text-[10px] font-bold text-white">
              -{discountPercent}%
            </div>
          ) : null}

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              toggleFavorite(product);
            }}
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
            {product.name}
          </h3>

          <div className="space-y-1">
            {product.oldPrice ? (
              <p className="text-xs text-gray-400 line-through">
                {Number(product.oldPrice).toLocaleString()} so'm
              </p>
            ) : null}

            <p className="text-base font-bold text-violet-600">
              {Number(product.price).toLocaleString()} so'm
            </p>
          </div>
        </div>
      </Link>

      <div className="px-3 pb-3">
        <button
          onClick={() => addToCart(product)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 py-2.5 text-sm font-semibold text-white"
        >
          <ShoppingCart size={16} />
          Savatchaga
        </button>
      </div>
    </div>
  );
}