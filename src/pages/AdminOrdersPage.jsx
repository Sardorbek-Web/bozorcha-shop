import { useEffect, useState } from "react";
import {
  Package,
  Phone,
  MapPin,
  Image,
  CheckCircle2,
  XCircle,
  Clock3,
  Eye,
} from "lucide-react";
import { Link } from "react-router-dom";
import MobileLayout from "../components/layout/MobileLayout";
import { supabase } from "../lib/supabase";

const API_URL = import.meta.env.VITE_API_URL;

export default function AdminOrdersPage() {
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
          address_line,
          telegram_chat_id
        ),
        order_items (
          product_id,
          variant_value,
          price,
          quantity
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

  async function updateStatus(orderId, status) {
    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId)
      .select(`
        *,
        addresses (
          telegram_chat_id
        )
      `)
      .single();

    if (!error && data) {
      const chatId = data.addresses?.telegram_chat_id;

      if (chatId) {
        await fetch(`${API_URL}/send-status`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chatId,
            status,
          }),
        });
      }

      fetchOrders();
    }
  }

  if (loading) {
    return (
      <MobileLayout title="Buyurtmalar">
        <div className="card card-dark p-6">Yuklanmoqda...</div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Buyurtmalar">
      <div className="space-y-4 pb-24">
        {orders.length === 0 && (
          <div className="card card-dark p-6 text-center text-sm text-gray-500">
            Hozircha buyurtmalar yo‘q
          </div>
        )}

        {orders.map((order) => {
          const address = order.addresses;

          return (
            <div key={order.id} className="card card-dark space-y-3 p-4">
              <div className="flex items-center justify-between">
                <p className="font-bold">#{order.id.slice(0, 6)}</p>

                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs dark:bg-neutral-800">
                  {order.status}
                </span>
              </div>

              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <Package size={14} />
                  <span>{order.notes || "Buyurtma"}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Phone size={14} />
                  <span>{address?.phone || "-"}</span>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin size={14} />
                  <span>{address?.address_line || "-"}</span>
                </div>
              </div>

              <div className="flex justify-between text-sm">
                <span>Jami:</span>
                <span className="font-bold text-violet-600">
                  {Number(order.total_amount).toLocaleString()} so'm
                </span>
              </div>

              {order.receipt_url && (
                <a
                  href={order.receipt_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sm text-violet-600"
                >
                  <Image size={16} />
                  Chekni ko‘rish
                </a>
              )}

              <Link
                to={`/admin/orders/${order.id}`}
                className="flex items-center justify-center gap-2 rounded-xl bg-gray-100 py-2 text-sm dark:bg-neutral-800"
              >
                <Eye size={16} />
                Batafsil ko‘rish
              </Link>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => updateStatus(order.id, "confirmed")}
                  className="flex items-center justify-center gap-1 rounded-xl bg-green-500 py-2 text-sm text-white"
                >
                  <CheckCircle2 size={14} />
                  Tasdiqlash
                </button>

                <button
                  onClick={() => updateStatus(order.id, "cancelled")}
                  className="flex items-center justify-center gap-1 rounded-xl bg-red-500 py-2 text-sm text-white"
                >
                  <XCircle size={14} />
                  Bekor qilish
                </button>

                <button
                  onClick={() => updateStatus(order.id, "in_cargo")}
                  className="flex items-center justify-center gap-1 rounded-xl bg-orange-500 py-2 text-sm text-white"
                >
                  <Clock3 size={14} />
                  Cargo
                </button>

                <button
                  onClick={() => updateStatus(order.id, "delivered")}
                  className="flex items-center justify-center gap-1 rounded-xl bg-blue-500 py-2 text-sm text-white"
                >
                  <CheckCircle2 size={14} />
                  Yetkazildi
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </MobileLayout>
  );
}