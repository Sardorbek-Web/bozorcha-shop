import { useEffect, useState } from "react";
import { Package, Phone, MapPin, Image, Send, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import MobileLayout from "../components/layout/MobileLayout";
import { supabase } from "../lib/supabase";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [forms, setForms] = useState({});
  const [sendingId, setSendingId] = useState("");

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
          telegram_chat_id,
          map_url
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

  async function parseApiResponse(response) {
    const raw = await response.text();
    try {
      return JSON.parse(raw);
    } catch {
      throw new Error(raw || "Serverdan noto‘g‘ri javob keldi");
    }
  }

  async function handleSendStatus(order) {
    const form = forms[order.id];
    const chatId = order.addresses?.telegram_chat_id;

    if (!chatId) {
      alert("Bu buyurtmada telegram_chat_id topilmadi");
      return;
    }

    setSendingId(order.id);

    try {
      const payload = {
        status: form.status,
        cargo_weight_kg:
          form.status === "in_cargo" && form.cargoWeightKg !== ""
            ? Number(form.cargoWeightKg)
            : null,
        cargo_amount:
          form.status === "in_cargo" && form.cargoAmount !== ""
            ? Number(form.cargoAmount)
            : null,
        admin_note: form.adminNote || null,
      };

      const { error: updateError } = await supabase
        .from("orders")
        .update(payload)
        .eq("id", order.id);

      if (updateError) throw updateError;

      const response = await fetch("/api/send-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId,
          status: form.status,
          cargoWeightKg:
            form.status === "in_cargo" ? form.cargoWeightKg : null,
          cargoAmount:
            form.status === "in_cargo" ? form.cargoAmount : null,
          adminNote: form.adminNote,
        }),
      });

      const result = await parseApiResponse(response);

      if (!response.ok || !result.success) {
        throw new Error(
          typeof result.error === "string"
            ? result.error
            : result.message || "Telegramga yuborilmadi"
        );
      }

      alert("Mijozga yuborildi ✅");
      fetchOrders();
    } catch (error) {
      console.error(error);
      alert(`Xatolik: ${error.message}`);
    } finally {
      setSendingId("");
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
        {orders.length === 0 ? (
          <div className="card card-dark p-6 text-center text-sm text-gray-500">
            Hozircha buyurtmalar yo‘q
          </div>
        ) : null}

        {orders.map((order) => {
          const address = order.addresses;
          const form = forms[order.id] || {};
          const isCargo = form.status === "in_cargo";

          return (
            <div key={order.id} className="card card-dark space-y-4 p-4">
              <div className="flex items-center justify-between">
                <p className="font-bold">#{order.id.slice(0, 6)}</p>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs dark:bg-neutral-800">
                  {order.status}
                </span>
              </div>

              <div className="space-y-2 text-sm">
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

                {address?.map_url ? (
                  <a
                    href={address.map_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-violet-600"
                  >
                    <MapPin size={14} />
                    Xaritada ko‘rish
                  </a>
                ) : null}
              </div>

              <div className="flex justify-between text-sm">
                <span>Jami:</span>
                <span className="font-bold text-violet-600">
                  {Number(order.total_amount || 0).toLocaleString()} so'm
                </span>
              </div>

              {order.receipt_url ? (
                <a
                  href={order.receipt_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sm text-violet-600"
                >
                  <Image size={16} />
                  Chekni ko‘rish
                </a>
              ) : null}

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

                {isCargo ? (
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
                ) : null}

                <textarea
                  value={form.adminNote || ""}
                  onChange={(e) =>
                    updateForm(order.id, "adminNote", e.target.value)
                  }
                  className="input min-h-[90px] resize-none"
                  placeholder={
                    isCargo
                      ? "Cargo bo‘yicha izoh"
                      : form.status === "cancelled"
                      ? "Bekor qilish sababi"
                      : "Qo‘shimcha izoh"
                  }
                />

                <button
                  onClick={() => handleSendStatus(order)}
                  disabled={sendingId === order.id}
                  className="btn-primary flex w-full items-center justify-center gap-2 py-3 disabled:opacity-60"
                >
                  <Send size={16} />
                  {sendingId === order.id
                    ? "Yuborilmoqda..."
                    : "Mijozga yuborish"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </MobileLayout>
  );
}