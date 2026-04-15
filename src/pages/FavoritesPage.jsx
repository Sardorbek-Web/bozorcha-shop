import { Trash2, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import MobileLayout from "../components/layout/MobileLayout";
import { useFavoritesStore } from "../store/useFavoritesStore";

export default function FavoritesPage() {
  const favorites = useFavoritesStore((state) => state.favorites || []);
  const removeFavorite = useFavoritesStore((state) => state.removeFavorite);

  return (
    <MobileLayout title="Sevimlilar">
      <div className="space-y-4 pb-24">
        {!Array.isArray(favorites) || favorites.length === 0 ? (
          <div className="card card-dark p-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-500/10">
              <Heart size={24} />
            </div>
            <p className="text-base font-semibold">Sevimli mahsulotlar yo‘q</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Mahsulotlarni yurakcha orqali saqlab qo‘ying
            </p>
          </div>
        ) : (
          favorites.map((item) => (
            <div key={item.id} className="card card-dark flex gap-3 p-3">
              <div className="h-24 w-24 overflow-hidden rounded-2xl bg-gray-100 dark:bg-neutral-800">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>

              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <Link to={`/product/${item.id}`} className="font-semibold">
                    {item.name || "Mahsulot"}
                  </Link>
                  <p className="mt-1 font-bold text-violet-600">
                    {Number(item.price || 0).toLocaleString()} so'm
                  </p>
                </div>

                <button
                  onClick={() => removeFavorite(item.id)}
                  className="flex items-center gap-2 text-sm text-red-500"
                >
                  <Trash2 size={16} />
                  Olib tashlash
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </MobileLayout>
  );
}