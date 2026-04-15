import { useEffect, useState } from "react";
import {
  Package,
  Phone,
  MapPin,
  Image,
  Send,
  Eye,
} from "lucide-react";
import { Link } from "react-router-dom";
import MobileLayout from "../components/layout/MobileLayout";
import { supabase } from "../lib/supabase";

const API_URL = import.meta.env.VITE_API_URL;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [forms, setForms] = useState({});

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

      const initialForms = {};
      data.forEach((order) => {
        initialForms[order.id] = {
          status: order.status || "new",
          cargoWeightKg: order.cargo_weight_kg || "",
          cargoAmount: order.cargo_amount || "",
          adminNote: order.admin_note || "",
        };
      });
      setForms(initialForms);
    } else {
      console.error(error);
    }

    setLoading(false);
  }

  function updateForm(orderId, field, value) {
    setForms((prev) => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        [field]: value,
      },
    }));
  }

  async function handleSendStatus(order) {
    const form = forms[order.id];
    const chatId = order.addresses?.telegram_chat_id;

    if (!chatId) {
      alert("Bu buyurtmada telegram_chat_id topilmadi");
      return;
    }

    const payload = {
      status: form.status,
      cargo_weight_kg:
        form.cargoWeightKg === "" ? null : Number(form.cargoWeightKg),
      cargo_amount:
        form.cargoAmount === "" ? null : Number(form.cargoAmount),
      admin_note: form.adminNote || null,
    };

    const { error: updateError } = await supabase
      .from("orders")
      .update(payload)
      .eq("id", order.id);

    if (updateError) {
      alert("Order update bo‘lmadi");
      console.error(updateError);
      return;
    }

    const res = await fetch(`${API_URL}/send-status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chatId,
        status: form.status,
        cargoWeightKg: form.cargoWeightKg,
        cargoAmount: form.cargoAmount,
        adminNote: form.adminNote,
      }),
    });

    const result = await res.json();

    if (!result.success) {
      alert("Telegramga yuborishda xatolik");
      console.error(result);
      return;
    }

    alert("Status mijozga yuborildi ✅");
    fetchOrders();
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
          const form = forms[order.id] || {};

          return (
            <div key={order.id} className="card card-dark space-y-4 p-4">
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

              <div className="space-y-3 rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800/60">
                <select
                  value={form.status || "new"}
                  onChange={(e) =>
                    updateForm(order.id, "status", e.target.value)
                  }
                  className="input"
                >
                  <option value="new">Yangi</option>
                  <option value="confirmed">Tasdiqlangan</option>
                  <option value="in_cargo">Cargo yo'lida</option>
                  <option value="delivered">Yetib keldi</option>
                  <option value="cancelled">Bekor qilindi</option>
                </select>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    value={form.cargoWeightKg || ""}
                    onChange={(e) =>
                      updateForm(order.id, "cargoWeightKg", e.target.value)
                    }
                    className="input"
                    placeholder="Cargo kg"
                  />

                  <input
                    type="number"
                    value={form.cargoAmount || ""}
                    onChange={(e) =>
                      updateForm(order.id, "cargoAmount", e.target.value)
                    }
                    className="input"
                    placeholder="Cargo narxi"
                  />
                </div>

                <textarea
                  value={form.adminNote || ""}
                  onChange={(e) =>
                    updateForm(order.id, "adminNote", e.target.value)
                  }
                  className="input min-h-[90px] resize-none"
                  placeholder="Izoh yoki sabab yozing"
                />

                <button
                  onClick={() => handleSendStatus(order)}
                  className="btn-primary flex w-full items-center justify-center gap-2"
                >
                  <Send size={16} />
                  Mijozga yuborish
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </MobileLayout>
  );
}