import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Clock3,
  Truck,
  CircleX,
  CheckCircle2,
  ChevronRight,
  Receipt,
  MapPin,
} from "lucide-react";
import MobileLayout from "../components/layout/MobileLayout";
import { supabase } from "../lib/supabase";
import { useUserStore } from "../store/useUserStore";

function getStatusLabel(status) {
  switch (status) {
    case "new":
      return "Yangi";
    case "confirmed":
      return "Tasdiqlangan";
    case "in_cargo":
      return "Cargo yo'lda";
    case "delivered":
      return "Yetib keldi";
    case "cancelled":
      return "Bekor qilindi";
    default:
      return "Noma'lum";
  }
}

function getStatusStyle(status) {
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

function getStatusIcon(status) {
  switch (status) {
    case "new":
      return Clock3;
    case "confirmed":
      return CheckCircle2;
    case "in_cargo":
      return Truck;
    case "delivered":
      return Package;
    case "cancelled":
      return CircleX;
    default:
      return Package;
  }
}

export default function OrdersPage() {
  const { profile } = useUserStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.telegram_id) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [profile?.telegram_id]);

  async function fetchOrders() {
    setLoading(true);

    const { data: addressRows, error: addressError } = await supabase
      .from("addresses")
      .select("id")
      .eq("telegram_chat_id", String(profile.telegram_id));

    if (addressError) {
      console.error(addressError);
      setLoading(false);
      return;
    }

    const addressIds = (addressRows || []).map((a) => a.id);

    if (addressIds.length === 0) {
      setOrders([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        addresses (
          full_name,
          phone,
          address_line,
          map_url
        ),
        order_items (
          product_id,
          variant_value,
          quantity,
          price
        )
      `)
      .in("address_id", addressIds)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setOrders([]);
    } else {
      setOrders(data || []);
    }

    setLoading(false);
  }

  return (
    <MobileLayout title="Buyurtmalarim">
      <div className="space-y-4 pb-24">
        {loading ? (
          <div className="card card-dark p-6">Yuklanmoqda...</div>
        ) : orders.length === 0 ? (
          <div className="card card-dark p-6 text-center">
            <p className="text-base font-semibold">Hozircha buyurtmalar yo‘q</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Mahsulot tanlab buyurtma bering, buyurtmalaringiz shu yerda chiqadi.
            </p>
          </div>
        ) : (
          orders.map((order) => {
            const StatusIcon = getStatusIcon(order.status);

            return (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="card card-dark block p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Buyurtma raqami
                    </p>
                    <p className="mt-1 text-base font-bold">
                      #{order.id.slice(0, 8)}
                    </p>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                      order.status
                    )}`}
                  >
                    <StatusIcon size={14} />
                    {getStatusLabel(order.status)}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800/70">
                    <p className="text-gray-500 dark:text-gray-400">Jami summa</p>
                    <p className="mt-1 font-bold text-violet-600">
                      {Number(order.total_amount || 0).toLocaleString()} so'm
                    </p>
                  </div>

                  <div className="rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800/70">
                    <p className="text-gray-500 dark:text-gray-400">Mahsulotlar</p>
                    <p className="mt-1 font-bold">
                      {order.order_items?.length || 0} ta
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    <Receipt size={14} />
                    <span>{order.notes || "Buyurtma"}</span>
                  </div>

                  {order.addresses?.map_url ? (
                    <div className="flex items-center gap-2">
                      <MapPin size={14} />
                      <span>Joylashuv saqlangan</span>
                    </div>
                  ) : null}
                </div>

                <div className="mt-4 flex items-center justify-end gap-1 text-sm font-semibold text-violet-600">
                  Batafsil
                  <ChevronRight size={16} />
                </div>
              </Link>
            );
          })
        )}
      </div>
    </MobileLayout>
  );
}