import { useEffect, useState } from "react";
import {
  Clock3,
  Package,
  Phone,
  MapPin,
  BadgeCheck,
  Truck,
  Eye,
} from "lucide-react";
import { Link } from "react-router-dom";
import MobileLayout from "../components/layout/MobileLayout";
import { supabase } from "../lib/supabase";

function getStatusLabel(status) {
  switch (status) {
    case "new":
      return "Yangi";
    case "confirmed":
      return "Tasdiqlangan";
    case "in_cargo":
      return "Cargo yo'lida";
    case "delivered":
      return "Yetkazilgan";
    case "cancelled":
      return "Bekor qilingan";
    default:
      return status;
  }
}

function getStatusClass(status) {
  switch (status) {
    case "new":
      return "bg-yellow-50 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-300";
    case "confirmed":
      return "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-300";
    case "in_cargo":
      return "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300";
    case "delivered":
      return "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300";
    case "cancelled":
      return "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-gray-300";
  }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);

    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        addresses (
          full_name,
          phone,
          address_line
        ),
        order_items (
          id,
          variant_value,
          quantity,
          price
        )
      `)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setOrders(data);
    } else {
      console.error(error);
    }

    setLoading(false);
  }

  return (
    <MobileLayout title="Buyurtmalarim">
      <div className="space-y-4 pb-24">
        {loading && <div className="card card-dark p-6">Yuklanmoqda...</div>}

        {!loading && orders.length === 0 && (
          <div className="card card-dark p-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Hozircha buyurtmalar yo‘q
          </div>
        )}

        {!loading &&
          orders.map((order) => {
            const address = order.addresses;
            const firstItem = order.order_items?.[0];

            return (
              <div key={order.id} className="card card-dark p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-bold">
                      Buyurtma #{order.id.slice(0, 6)}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                      order.status
                    )}`}
                  >
                    {getStatusLabel(order.status)}
                  </span>
                </div>

                <div className="mt-4 grid gap-2">
                  <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800/70">
                    <Package size={16} className="text-violet-600" />
                    <div className="text-sm">
                      <p>Mahsulot summasi: {Number(order.total_amount).toLocaleString()} so'm</p>
                      {firstItem?.variant_value && (
                        <p className="text-gray-500 dark:text-gray-400">
                          O'lcham: {firstItem.variant_value}
                        </p>
                      )}
                    </div>
                  </div>

                  {address?.phone && (
                    <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800/70">
                      <Phone size={16} className="text-violet-600" />
                      <span className="text-sm">{address.phone}</span>
                    </div>
                  )}

                  {address?.address_line && (
                    <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800/70">
                      <MapPin size={16} className="text-violet-600" />
                      <span className="text-sm">{address.address_line}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800/70">
                    {order.status === "delivered" ? (
                      <BadgeCheck size={16} className="text-violet-600" />
                    ) : order.status === "in_cargo" ? (
                      <Truck size={16} className="text-violet-600" />
                    ) : (
                      <Clock3 size={16} className="text-violet-600" />
                    )}
                    <span className="text-sm">
                      {order.status === "new" && "To'lov tekshirilmoqda"}
                      {order.status === "confirmed" && "Buyurtma tasdiqlandi"}
                      {order.status === "in_cargo" && "Mahsulot cargo jarayonida"}
                      {order.status === "delivered" && "Buyurtma topshirildi"}
                      {order.status === "cancelled" && "Buyurtma bekor qilingan"}
                    </span>
                  </div>
                </div>

                <Link
                  to={`/orders/${order.id}`}
                  className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-violet-600 py-3 text-sm font-semibold text-white"
                >
                  <Eye size={16} />
                  Batafsil ko‘rish
                </Link>
              </div>
            );
          })}
      </div>
    </MobileLayout>
  );
}