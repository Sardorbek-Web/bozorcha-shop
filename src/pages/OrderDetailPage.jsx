import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Package,
  Clock3,
  Truck,
  CircleX,
  CheckCircle2,
  Receipt,
  MapPin,
  Image as ImageIcon,
  Scale,
  Wallet,
} from "lucide-react";
import MobileLayout from "../components/layout/MobileLayout";
import { supabase } from "../lib/supabase";

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

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  async function fetchOrder() {
    setLoading(true);

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
      .eq("id", id)
      .single();

    if (error) {
      console.error(error);
      setOrder(null);
    } else {
      setOrder(data);
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <MobileLayout title="Buyurtma">
        <div className="card card-dark p-6">Yuklanmoqda...</div>
      </MobileLayout>
    );
  }

  if (!order) {
    return (
      <MobileLayout title="Buyurtma">
        <div className="card card-dark p-6">Buyurtma topilmadi</div>
      </MobileLayout>
    );
  }

  const StatusIcon = getStatusIcon(order.status);

  return (
    <MobileLayout title="Buyurtma tafsiloti">
      <div className="space-y-4 pb-24">
        <div className="card card-dark p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Buyurtma raqami
              </p>
              <p className="mt-1 text-lg font-bold">#{order.id.slice(0, 8)}</p>
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

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800/70">
              <p className="text-sm text-gray-500 dark:text-gray-400">Jami</p>
              <p className="mt-1 font-bold text-violet-600">
                {Number(order.total_amount || 0).toLocaleString()} so'm
              </p>
            </div>

            <div className="rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800/70">
              <p className="text-sm text-gray-500 dark:text-gray-400">To'lov</p>
              <p className="mt-1 font-bold">
                {order.payment_status || "pending_review"}
              </p>
            </div>
          </div>
        </div>

        <div className="card card-dark p-4">
          <h2 className="text-lg font-bold">Mijoz ma'lumoti</h2>

          <div className="mt-4 space-y-3 text-sm">
            <div className="rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800/70">
              <p className="text-gray-500 dark:text-gray-400">Ism</p>
              <p className="mt-1 font-semibold">{order.addresses?.full_name || "-"}</p>
            </div>

            <div className="rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800/70">
              <p className="text-gray-500 dark:text-gray-400">Telefon</p>
              <p className="mt-1 font-semibold">{order.addresses?.phone || "-"}</p>
            </div>

            <div className="rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800/70">
              <p className="text-gray-500 dark:text-gray-400">Manzil</p>
              <p className="mt-1 font-semibold">
                {order.addresses?.address_line || "-"}
              </p>
            </div>

            {order.addresses?.map_url ? (
              <a
                href={order.addresses.map_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-4 py-3 font-semibold text-white"
              >
                <MapPin size={16} />
                Xaritada ko'rish
              </a>
            ) : null}
          </div>
        </div>

        <div className="card card-dark p-4">
          <h2 className="text-lg font-bold">Buyurtma tarkibi</h2>

          <div className="mt-4 space-y-3">
            {(order.order_items || []).map((item, index) => (
              <div
                key={index}
                className="rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800/70"
              >
                <div className="flex items-center gap-2">
                  <Receipt size={15} className="text-violet-600" />
                  <p className="font-semibold">Mahsulot #{index + 1}</p>
                </div>

                <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-300">
                  <p>Soni: {item.quantity}</p>
                  <p>Narx: {Number(item.price || 0).toLocaleString()} so'm</p>
                  <p>O'lcham: {item.variant_value || "Tanlanmagan"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {order.status === "in_cargo" &&
        (order.cargo_weight_kg || order.cargo_amount) ? (
          <div className="card card-dark p-4">
            <h2 className="text-lg font-bold">Cargo ma'lumoti</h2>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800/70">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <Scale size={14} />
                  <span className="text-sm">Og'irligi</span>
                </div>
                <p className="mt-1 font-bold">
                  {order.cargo_weight_kg || "-"} kg
                </p>
              </div>

              <div className="rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800/70">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <Wallet size={14} />
                  <span className="text-sm">Narxi</span>
                </div>
                <p className="mt-1 font-bold">
                  {order.cargo_amount
                    ? `${Number(order.cargo_amount).toLocaleString()} so'm`
                    : "-"}
                </p>
              </div>
            </div>

            {order.admin_note ? (
              <div className="mt-3 rounded-2xl bg-gray-50 p-3 text-sm dark:bg-neutral-800/70">
                <p className="text-gray-500 dark:text-gray-400">Izoh</p>
                <p className="mt-1 font-medium">{order.admin_note}</p>
              </div>
            ) : null}
          </div>
        ) : null}

        {order.receipt_url ? (
          <div className="card card-dark p-4">
            <a
              href={order.receipt_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-2xl bg-gray-100 px-4 py-3 font-semibold dark:bg-neutral-800"
            >
              <ImageIcon size={16} />
              To'lov chekini ko'rish
            </a>
          </div>
        ) : null}
      </div>
    </MobileLayout>
  );
}