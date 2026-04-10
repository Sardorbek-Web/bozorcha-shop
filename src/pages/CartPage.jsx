import { Minus, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import MobileLayout from "../components/layout/MobileLayout";
import { useCartStore } from "../store/useCartStore";

export default function CartPage() {
  const { items, increase, decrease, removeFromCart, getTotal } =
    useCartStore();

  const total = getTotal();

  return (
    <MobileLayout title="Savatcha">
      <div className="space-y-4 pb-24">
        {items.length === 0 && (
          <div className="card card-dark p-6 text-center">
            Savatcha bo‘sh
          </div>
        )}

        {items.map((item) => (
          <div key={item.id} className="card card-dark p-3 flex gap-3">
            <img
              src={item.image || "https://placehold.co/200x200"}
              alt={item.name}
              className="h-20 w-20 rounded-xl object-cover"
            />

            <div className="flex-1">
              <p className="text-sm font-semibold">{item.name}</p>

              <p className="mt-1 font-bold text-violet-600">
                {(item.price * item.quantity).toLocaleString()} so'm
              </p>

              <div className="mt-2 flex items-center gap-3">
                <button
                  onClick={() => decrease(item.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 dark:bg-neutral-800"
                >
                  <Minus size={16} />
                </button>

                <span className="min-w-[20px] text-center">{item.quantity}</span>

                <button
                  onClick={() => increase(item.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 dark:bg-neutral-800"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <button
              onClick={() => removeFromCart(item.id)}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500 text-white"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}

        {items.length > 0 && (
          <div className="card card-dark p-4">
            <div className="flex justify-between font-bold">
              <span>Jami</span>
              <span>{total.toLocaleString()} so'm</span>
            </div>

            <Link
              to="/checkout"
              state={{
                productId: "cart",
              }}
              className="btn-primary mt-4 w-full"
            >
              Buyurtma berish
            </Link>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}