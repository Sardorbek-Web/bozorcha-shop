import { useEffect, useState } from "react";
import {
  Package,
  Phone,
  MapPin,
  Receipt,
  CalendarDays,
  Ruler,
  Hash,
  Clock3,
  BadgeCheck,
  Truck,
} from "lucide-react";
import { useParams } from "react-router-dom";
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

export default function OrderDetailPage() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [productsMap, setProductsMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  async function fetchOrderDetail() {
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
      setLoading(false);
      return;
    }

    setOrder(data);

    const productIds =
      data.order_items?.map((item) => item.product_id).filter(Boolean) || [];

    if (productIds.length > 0) {
      const { data: productRows, error: productsError } = await supabase
        .from("products")
        .select("id, name_uz")
        .in("id", productIds);

      if (!productsError && productRows) {
        const map = {};
        productRows.forEach((product) => {
          map[product.id] = product;
        });
        setProductsMap(map);
      }
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

  const address = order.addresses;

  return (
    <MobileLayout title="Buyurtma batafsil">
      <div className="space-y-4 pb-24">
        <div className="card card-dark p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold">#{order.id.slice(0, 8)}</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
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
        </div>

        <div className="card card-dark p-4">
          <h2 className="text-lg font-bold">Mijoz ma'lumotlari</h2>

          <div className="mt-4 grid gap-3">
            <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800/70">
              <Package size={16} className="text-violet-600" />
              <span className="text-sm">
                Ism: {address?.full_name || "Noma'lum"}
              </span>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800/70">
              <Phone size={16} className="text-violet-600" />
              <span className="text-sm">
                Telefon: {address?.phone || "-"}
              </span>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800/70">
              <MapPin size={16} className="text-violet-600" />
              <span className="text-sm">
                Manzil: {address?.address_line || "-"}
              </span>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800/70">
              <CalendarDays size={16} className="text-violet-600" />
              <span className="text-sm">
                Sana: {new Date(order.created_at).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="card card-dark p-4">
          <h2 className="text-lg font-bold">Holat</h2>

          <div className="mt-4 grid gap-2">
            <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800/70">
              {order.status === "delivered" ? (
                <BadgeCheck size={16} className="text-violet-600" />
              ) : order.status === "in_cargo" ? (
                <Truck size={16} className="text-violet-600" />
              ) : (
                <Clock3 size={16} className="text-violet-600" />
              )}
              <span className="text-sm">{getStatusLabel(order.status)}</span>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800/70">
              <Receipt size={16} className="text-violet-600" />
              <span className="text-sm">
                To'lov: {order.payment_status}
              </span>
            </div>

            {order.receipt_url && (
              <a
                href={order.receipt_url}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl bg-violet-600 px-4 py-3 text-center text-sm font-semibold text-white"
              >
                Chekni ochish
              </a>
            )}
          </div>
        </div>

        <div className="card card-dark p-4">
          <h2 className="text-lg font-bold">Mahsulotlar</h2>

          <div className="mt-4 space-y-3">
            {order.order_items?.length === 0 && (
              <div className="text-sm text-gray-500">
                Mahsulot topilmadi
              </div>
            )}

            {order.order_items?.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800/70"
              >
                <p className="font-semibold">
                  {productsMap[item.product_id]?.name_uz || "Mahsulot"}
                </p>

                <div className="mt-2 grid gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    <Hash size={14} className="text-violet-600" />
                    <span>Soni: {item.quantity}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Ruler size={14} className="text-violet-600" />
                    <span>O'lcham: {item.variant_value || "Tanlanmagan"}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Receipt size={14} className="text-violet-600" />
                    <span>Narx: {Number(item.price).toLocaleString()} so'm</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card card-dark p-4">
          <div className="flex items-center justify-between text-base font-bold">
            <span>Jami summa</span>
            <span className="text-violet-600">
              {Number(order.total_amount).toLocaleString()} so'm
            </span>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}