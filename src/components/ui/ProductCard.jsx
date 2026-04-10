import { Heart, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useUserStore } from "../../store/useUserStore";
import { useFavoritesStore } from "../../store/useFavoritesStore";
import { useCartStore } from "../../store/useCartStore";

export default function ProductCard({ product, onRefresh }) {
  const { profile } = useUserStore();
  const { favoriteIds, setFavoriteIds } = useFavoritesStore();
  const { addToCart } = useCartStore();

  const isFavorite = favoriteIds.includes(product.id);

  async function toggleFavorite(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!profile?.id) {
      alert("Avval Telegram orqali kirish kerak");
      return;
    }

    if (isFavorite) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("profile_id", profile.id)
        .eq("product_id", product.id);

      if (!error) {
        setFavoriteIds(favoriteIds.filter((id) => id !== product.id));
        onRefresh?.();
      }
    } else {
      const { error } = await supabase.from("favorites").insert([
        {
          profile_id: profile.id,
          product_id: product.id,
        },
      ]);

      if (!error) {
        setFavoriteIds([...favoriteIds, product.id]);
        onRefresh?.();
      }
    }
  }

  function handleAddToCart(e) {
    e.preventDefault();
    e.stopPropagation();

    addToCart(product);
  }

  const discountPercent = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  return (
    <Link
      to={`/product/${product.id}`}
      className="card card-dark overflow-hidden transition hover:-translate-y-0.5"
    >
      <div className="relative">
        <img
          src={product.image || "https://placehold.co/400x400"}
          alt={product.name}
          className="h-44 w-full object-cover"
        />

        <button
          onClick={toggleFavorite}
          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full shadow-sm backdrop-blur ${
            isFavorite
              ? "bg-red-500 text-white"
              : "bg-white/90 text-gray-700"
          }`}
          type="button"
        >
          <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
        </button>

        {discountPercent > 0 && (
          <div className="absolute left-3 top-3">
            <span className="badge-sale">-{discountPercent}%</span>
          </div>
        )}
      </div>

      <div className="p-3">
        <p className="min-h-[44px] text-sm font-semibold leading-5">
          {product.name}
        </p>

        <div className="mt-2">
          {product.oldPrice && (
            <p className="text-xs text-gray-400 line-through">
              {product.oldPrice.toLocaleString()} so'm
            </p>
          )}
          <p className="mt-1 text-base font-bold text-violet-600">
            {product.price.toLocaleString()} so'm
          </p>
        </div>

        <button
          onClick={handleAddToCart}
          className="btn-primary mt-3 flex w-full items-center justify-center gap-2"
          type="button"
        >
          <ShoppingCart size={16} />
          Savatchaga
        </button>
      </div>
    </Link>
  );
}