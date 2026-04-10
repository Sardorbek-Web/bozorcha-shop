import { User, Phone, AtSign, ShieldCheck, LayoutDashboard } from "lucide-react";
import { Link } from "react-router-dom";
import MobileLayout from "../components/layout/MobileLayout";
import { useUserStore } from "../store/useUserStore";

export default function ProfilePage() {
  const { telegramUser, profile } = useUserStore();

  const displayName =
    profile?.full_name?.trim() ||
    `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() ||
    `${telegramUser?.first_name || ""} ${telegramUser?.last_name || ""}`.trim() ||
    "Foydalanuvchi";

  const displayUsername = profile?.username || telegramUser?.username || "";
  const displayPhoto = profile?.photo_url || telegramUser?.photo_url || "";

  return (
    <MobileLayout title="Profil">
      <div className="space-y-4 pb-24">
        <div className="card card-dark p-4">
          <div className="flex items-center gap-4">
            {displayPhoto ? (
              <img
                src={displayPhoto}
                alt={displayName}
                className="h-16 w-16 rounded-2xl object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-500/10">
                <User size={28} />
              </div>
            )}

            <div>
              <p className="text-lg font-bold">{displayName}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Telegram orqali kirgan
              </p>
            </div>
          </div>
        </div>

        <div className="card card-dark space-y-3 p-4">
          <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800/70">
            <User size={16} className="text-violet-600" />
            <span className="text-sm">Ism: {displayName}</span>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800/70">
            <AtSign size={16} className="text-violet-600" />
            <span className="text-sm">
              Username: {displayUsername ? `@${displayUsername}` : "Mavjud emas"}
            </span>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800/70">
            <Phone size={16} className="text-violet-600" />
            <span className="text-sm">
              Telefon: {profile?.phone || "Hali kiritilmagan"}
            </span>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800/70">
            <ShieldCheck size={16} className="text-violet-600" />
            <span className="text-sm">
              Roli: {profile?.role === "admin" ? "Admin" : "Mijoz"}
            </span>
          </div>
        </div>

        {profile?.role === "admin" && (
          <div className="card card-dark p-4">
            <h2 className="text-lg font-bold">Admin bo‘limi</h2>

            <div className="mt-4 grid gap-3">
              <Link
                to="/admin"
                className="flex items-center justify-between rounded-2xl bg-violet-600 px-4 py-4 text-white"
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard size={20} />
                  <span className="font-semibold">Admin panel</span>
                </div>
                <span>Ochish</span>
              </Link>

              <Link
                to="/admin/products/new"
                className="flex items-center justify-between rounded-2xl bg-gray-100 px-4 py-4 dark:bg-neutral-800"
              >
                <span className="font-semibold">Mahsulot qo‘shish</span>
                <span className="text-violet-600">Ochish</span>
              </Link>

              <Link
                to="/admin/orders"
                className="flex items-center justify-between rounded-2xl bg-gray-100 px-4 py-4 dark:bg-neutral-800"
              >
                <span className="font-semibold">Buyurtmalar</span>
                <span className="text-violet-600">Ochish</span>
              </Link>

              <Link
                to="/admin/settings"
                className="flex items-center justify-between rounded-2xl bg-gray-100 px-4 py-4 dark:bg-neutral-800"
              >
                <span className="font-semibold">Sozlamalar</span>
                <span className="text-violet-600">Ochish</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}