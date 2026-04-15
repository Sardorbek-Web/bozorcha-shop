import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import MobileLayout from "../components/layout/MobileLayout";
import { useCartStore } from "../store/useCartStore";

export default function CartPage() {
  const navigate = useNavigate();

  const items = useCartStore((state) => state.items || []);
  const increaseQuantity = useCartStore((state) => state.increaseQuantity);
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const getTotal = useCartStore((state) => state.getTotal);

  const total = typeof getTotal === "function" ? getTotal() : 0;

  function handleCheckout() {
    navigate("/checkout", {
      state: {
        productId: "cart",
      },
    });
  }

  return (
    <MobileLayout title="Savatcha">
      <div className="space-y-4 pb-24">
        {!Array.isArray(items) || items.length === 0 ? (
          <div className="card card-dark p-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-500/10">
              <ShoppingBag size={24} />
            </div>
            <p className="text-base font-semibold">Savatcha bo‘sh</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Mahsulot qo‘shsangiz shu yerda ko‘rinadi
            </p>
          </div>
        ) : (
          <>
            {items.map((item, index) => (
              <div
                key={`${item.id}-${item.selectedSize || "no-size"}-${index}`}
                className="card card-dark flex gap-3 p-3"
              >
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

                    {item.selectedSize ? (
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        O'lcham: {item.selectedSize}
                      </p>
                    ) : null}

                    <p className="mt-1 font-bold text-violet-600">
                      {Number(item.price || 0).toLocaleString()} so'm
                    </p>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          decreaseQuantity(item.id, item.selectedSize || null)
                        }
                        className="rounded-xl bg-gray-100 p-2 dark:bg-neutral-800"
                      >
                        <Minus size={16} />
                      </button>

                      <span className="min-w-[24px] text-center">
                        {item.quantity || 1}
                      </span>

                      <button
                        onClick={() =>
                          increaseQuantity(item.id, item.selectedSize || null)
                        }
                        className="rounded-xl bg-gray-100 p-2 dark:bg-neutral-800"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <button
                      onClick={() =>
                        removeFromCart(item.id, item.selectedSize || null)
                      }
                      className="text-red-500"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="card card-dark p-4">
              <div className="flex justify-between text-sm">
                <span>Jami</span>
                <span className="font-bold text-violet-600">
                  {Number(total || 0).toLocaleString()} so'm
                </span>
              </div>

              <button onClick={handleCheckout} className="btn-primary mt-4 w-full">
                Buyurtma berish
              </button>
            </div>
          </>
        )}
      </div>
    </MobileLayout>
  );
}