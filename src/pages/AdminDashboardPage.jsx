import { useEffect, useMemo, useState } from "react";
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
  ArrowUpRight,
  Wallet,
} from "lucide-react";
import { Link } from "react-router-dom";
import MobileLayout from "../components/layout/MobileLayout";
import { supabase } from "../lib/supabase";

function StatCard({ title, value, icon: Icon, colorClass, subtext }) {
  return (
    <div className="card card-dark p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="mt-2 text-xl font-bold">{value}</p>
          {subtext ? (
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              {subtext}
            </p>
          ) : null}
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl ${colorClass}`}
        >
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
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
      return status || "Noma'lum";
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

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState([]);
  const [productsCount, setProductsCount] = useState(0);
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
        supabase.from("products").select("id", { count: "exact", head: false }),
      ]);

      if (!ordersRes.error) {
        setOrders(ordersRes.data || []);
      } else {
        console.error("Orders xato:", ordersRes.error);
      }

      if (!productsRes.error) {
        setProductsCount(productsRes.data?.length || 0);
      } else {
        console.error("Products xato:", productsRes.error);
      }
    } catch (error) {
      console.error("Dashboard umumiy xato:", error);
    } finally {
      setLoading(false);
    }
  }

  const stats = useMemo(() => {
    const totalOrders = orders.length;

    const totalRevenue = orders.reduce(
      (sum, order) => sum + Number(order.total_amount || 0),
      0
    );

    const pendingOrders = orders.filter(
      (order) => order.status === "new" || order.status === "confirmed"
    ).length;

    const deliveredOrders = orders.filter(
      (order) => order.status === "delivered"
    ).length;

    const cancelledOrders = orders.filter(
      (order) => order.status === "cancelled"
    ).length;

    const inCargoOrders = orders.filter(
      (order) => order.status === "in_cargo"
    ).length;

    const averageCheck =
      totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    return {
      totalOrders,
      totalRevenue,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      inCargoOrders,
      averageCheck,
    };
  }, [orders]);

  const recentOrders = orders.slice(0, 6);

  return (
    <MobileLayout title="Admin panel">
      <div className="space-y-5 pb-24">
        <section className="overflow-hidden rounded-[30px] bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-700 p-5 text-white shadow-xl">
          <p className="text-sm text-white/70">Xush kelibsiz</p>
          <h2 className="mt-1 text-2xl font-bold">Bozorcha Admin</h2>
          <p className="mt-2 max-w-[320px] text-sm text-white/80">
            Mahsulotlar, buyurtmalar va tushumni bitta joydan boshqaring.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
              <p className="text-xs text-white/70">Jami tushum</p>
              <p className="mt-1 text-lg font-bold">
                {stats.totalRevenue.toLocaleString()} so'm
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
              <p className="text-xs text-white/70">O'rtacha chek</p>
              <p className="mt-1 text-lg font-bold">
                {stats.averageCheck.toLocaleString()} so'm
              </p>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="card card-dark p-6">Yuklanmoqda...</div>
        ) : (
          <>
            <section>
              <h3 className="mb-3 text-lg font-bold">Asosiy ko'rsatkichlar</h3>

              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  title="Jami buyurtmalar"
                  value={stats.totalOrders}
                  icon={ShoppingCart}
                  colorClass="bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400"
                />

                <StatCard
                  title="Jami tushum"
                  value={`${stats.totalRevenue.toLocaleString()} so'm`}
                  icon={DollarSign}
                  colorClass="bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400"
                />

                <StatCard
                  title="Kutilmoqda"
                  value={stats.pendingOrders}
                  icon={Clock3}
                  colorClass="bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400"
                />

                <StatCard
                  title="Yetkazilgan"
                  value={stats.deliveredOrders}
                  icon={Truck}
                  colorClass="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                />

                <StatCard
                  title="Cargo"
                  value={stats.inCargoOrders}
                  icon={Wallet}
                  colorClass="bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400"
                />

                <StatCard
                  title="Bekor qilingan"
                  value={stats.cancelledOrders}
                  icon={CircleX}
                  colorClass="bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                />

                <StatCard
                  title="Mahsulotlar"
                  value={productsCount}
                  icon={Package}
                  colorClass="bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                  subtext="Faol katalog"
                />
              </div>
            </section>

            <section>
              <h3 className="mb-3 text-lg font-bold">Tezkor amallar</h3>

              <div className="grid gap-3">
                {quickActions.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.title}
                      to={item.to}
                      className="card card-dark flex items-center justify-between p-4 transition hover:-translate-y-0.5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="icon-wrap">
                          <Icon size={20} />
                        </div>
                        <span className="font-semibold">{item.title}</span>
                      </div>

                      <ArrowUpRight
                        size={18}
                        className="text-violet-600 dark:text-violet-400"
                      />
                    </Link>
                  );
                })}
              </div>
            </section>

            <section className="card card-dark p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold">So'nggi buyurtmalar</h3>
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
                          {Number(order.total_amount || 0).toLocaleString()} so'm
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