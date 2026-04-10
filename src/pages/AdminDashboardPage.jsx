import { useEffect, useState } from "react";
import {
  ShoppingCart,
  DollarSign,
  Clock3,
  Truck,
  PackagePlus,
  ReceiptText,
  Settings,
  Package,
  CircleX,
} from "lucide-react";
import { Link } from "react-router-dom";
import MobileLayout from "../components/layout/MobileLayout";
import { supabase } from "../lib/supabase";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    totalProducts: 0,
    cancelledOrders: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const quickActions = [
    {
      title: "Mahsulot qo'shish",
      icon: PackagePlus,
      to: "/admin/products/new",
    },
    {
      title: "Buyurtmalar",
      icon: ReceiptText,
      to: "/admin/orders",
    },
    {
      title: "Sozlamalar",
      icon: Settings,
      to: "/admin/settings",
    },
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);

    try {
      const [ordersRes, productsRes] = await Promise.all([
        supabase
          .from("orders")
          .select(`
            *,
            addresses (
              full_name,
              phone,
              address_line
            )
          `)
          .order("created_at", { ascending: false }),
        supabase.from("products").select("id"),
      ]);

      const orders = ordersRes.data || [];
      const products = productsRes.data || [];

      const totalOrders = orders.length;

      const totalRevenue = orders.reduce((sum, order) => {
        return sum + Number(order.total_amount || 0);
      }, 0);

      const pendingOrders = orders.filter(
        (order) => order.status === "new" || order.status === "confirmed"
      ).length;

      const deliveredOrders = orders.filter(
        (order) => order.status === "delivered"
      ).length;

      const cancelledOrders = orders.filter(
        (order) => order.status === "cancelled"
      ).length;

      const totalProducts = products.length;

      setStats({
        totalOrders,
        totalRevenue,
        pendingOrders,
        deliveredOrders,
        totalProducts,
        cancelledOrders,
      });

      setRecentOrders(orders.slice(0, 5));
    } catch (error) {
      console.error("Dashboard xatolik:", error);
    } finally {
      setLoading(false);
    }
  }

  function getStatusLabel(status) {
    switch (status) {
      case "new":
        return "Yangi";
      case "confirmed":
        return "Tasdiqlangan";
      case "in_cargo":
        return "Cargo";
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

  return (
    <MobileLayout title="Admin panel">
      <div className="space-y-5 pb-24">
        <section className="rounded-[30px] bg-gradient-to-br from-neutral-900 to-neutral-700 p-5 text-white shadow-soft">
          <p className="text-sm text-white/70">Xush kelibsiz</p>
          <h2 className="mt-1 text-2xl font-bold">Bozorcha Admin</h2>
          <p className="mt-2 text-sm text-white/80">
            Mahsulotlar, buyurtmalar va tushumni bir joydan boshqaring.
          </p>
        </section>

        {loading ? (
          <div className="card card-dark p-6">Yuklanmoqda...</div>
        ) : (
          <>
            <section>
              <h3 className="mb-3 text-lg font-bold tracking-tight">
                Asosiy ko'rsatkichlar
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="card card-dark p-4">
                  <div className="icon-wrap">
                    <ShoppingCart size={20} />
                  </div>
                  <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                    Jami buyurtmalar
                  </p>
                  <p className="mt-1 text-lg font-bold">
                    {stats.totalOrders}
                  </p>
                </div>

                <div className="card card-dark p-4">
                  <div className="icon-wrap">
                    <DollarSign size={20} />
                  </div>
                  <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                    Jami tushum
                  </p>
                  <p className="mt-1 text-lg font-bold text-green-600">
                    {stats.totalRevenue.toLocaleString()} so'm
                  </p>
                </div>

                <div className="card card-dark p-4">
                  <div className="icon-wrap">
                    <Clock3 size={20} />
                  </div>
                  <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                    Kutilmoqda
                  </p>
                  <p className="mt-1 text-lg font-bold text-yellow-600">
                    {stats.pendingOrders}
                  </p>
                </div>

                <div className="card card-dark p-4">
                  <div className="icon-wrap">
                    <Truck size={20} />
                  </div>
                  <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                    Yetkazilgan
                  </p>
                  <p className="mt-1 text-lg font-bold text-blue-600">
                    {stats.deliveredOrders}
                  </p>
                </div>

                <div className="card card-dark p-4">
                  <div className="icon-wrap">
                    <Package size={20} />
                  </div>
                  <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                    Mahsulotlar
                  </p>
                  <p className="mt-1 text-lg font-bold text-violet-600">
                    {stats.totalProducts}
                  </p>
                </div>

                <div className="card card-dark p-4">
                  <div className="icon-wrap">
                    <CircleX size={20} />
                  </div>
                  <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                    Bekor qilingan
                  </p>
                  <p className="mt-1 text-lg font-bold text-red-600">
                    {stats.cancelledOrders}
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="mb-3 text-lg font-bold tracking-tight">
                Tezkor amallar
              </h3>

              <div className="grid gap-3">
                {quickActions.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.title}
                      to={item.to}
                      className="card card-dark flex items-center justify-between p-4 text-left transition hover:-translate-y-0.5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="icon-wrap">
                          <Icon size={20} />
                        </div>
                        <span className="font-semibold">{item.title}</span>
                      </div>
                      <span className="text-sm text-violet-600">Ochish</span>
                    </Link>
                  );
                })}
              </div>
            </section>

            <section className="card card-dark p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold tracking-tight">
                  So'nggi buyurtmalar
                </h3>
                <Link
                  to="/admin/orders"
                  className="text-sm font-semibold text-violet-600"
                >
                  Barchasi
                </Link>
              </div>

              <div className="space-y-3">
                {recentOrders.length === 0 && (
                  <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-500 dark:bg-neutral-800/70 dark:text-gray-400">
                    Hozircha buyurtmalar yo‘q
                  </div>
                )}

                {recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    to={`/admin/orders/${order.id}`}
                    className="block rounded-2xl bg-gray-50 p-3 transition hover:bg-gray-100 dark:bg-neutral-800/70 dark:hover:bg-neutral-800"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">
                          Buyurtma #{order.id.slice(0, 6)}
                        </p>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          {order.addresses?.full_name || "Mijoz"}
                        </p>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          {Number(order.total_amount).toLocaleString()} so'm
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
                  </Link>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </MobileLayout>
  );
}