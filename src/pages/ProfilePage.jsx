import {
  User,
  Phone,
  AtSign,
  ShieldCheck,
  LayoutDashboard,
  Heart,
  Package,
  Settings,
  PlusCircle,
  Headphones,
  Store,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import MobileLayout from "../components/layout/MobileLayout";
import { useUserStore } from "../store/useUserStore";

function ActionLink({ to, icon: Icon, title, subtitle, accent = false }) {
  return (
    <Link
      to={to}
      className={`flex items-center justify-between rounded-2xl px-4 py-4 transition ${
        accent
          ? "bg-violet-600 text-white shadow-lg"
          : "bg-gray-100 dark:bg-neutral-800"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
            accent
              ? "bg-white/15 text-white"
              : "bg-white text-violet-600 dark:bg-neutral-900 dark:text-violet-400"
          }`}
        >
          <Icon size={18} />
        </div>

        <div>
          <p className="font-semibold">{title}</p>
          {subtitle ? (
            <p
              className={`text-xs ${
                accent ? "text-violet-100" : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>

      <ChevronRight
        size={18}
        className={accent ? "text-white" : "text-violet-600 dark:text-violet-400"}
      />
    </Link>
  );
}

export default function ProfilePage() {
  const { telegramUser, profile } = useUserStore();

  const displayName =
    profile?.full_name?.trim() ||
    `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() ||
    `${telegramUser?.first_name || ""} ${telegramUser?.last_name || ""}`.trim() ||
    "Foydalanuvchi";

  const displayUsername = profile?.username || telegramUser?.username || "";
  const displayPhoto = profile?.photo_url || telegramUser?.photo_url || "";
  const isAdmin = profile?.role === "admin";

  return (
    <MobileLayout title="Profil">
      <div className="space-y-4 pb-24">
        <div className="overflow-hidden rounded-[28px] bg-gradient-to-br from-violet-600 via-violet-500 to-fuchsia-500 p-5 text-white shadow-xl">
          <div className="flex items-center gap-4">
            {displayPhoto ? (
              <img
                src={displayPhoto}
                alt={displayName}
                className="h-16 w-16 rounded-2xl border border-white/20 object-cover shadow-lg"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-white">
                <User size={28} />
              </div>
            )}

            <div className="min-w-0">
              <p className="truncate text-lg font-bold">{displayName}</p>
              <p className="text-sm text-violet-100">Telegram orqali kirgan</p>
              <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs">
                <ShieldCheck size={13} />
                {isAdmin ? "Admin akkaunt" : "Mijoz akkaunti"}
              </div>
            </div>
          </div>
        </div>

        <div className="card card-dark space-y-3 p-4">
          <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800/70">
            <User size={16} className="text-violet-600" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500 dark:text-gray-400">Ism</p>
              <p className="truncate text-sm font-medium">{displayName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800/70">
            <AtSign size={16} className="text-violet-600" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500 dark:text-gray-400">Username</p>
              <p className="truncate text-sm font-medium">
                {displayUsername ? `@${displayUsername}` : "Mavjud emas"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800/70">
            <Phone size={16} className="text-violet-600" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500 dark:text-gray-400">Telefon</p>
              <p className="truncate text-sm font-medium">
                {profile?.phone || "Hali kiritilmagan"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800/70">
            <ShieldCheck size={16} className="text-violet-600" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500 dark:text-gray-400">Rol</p>
              <p className="truncate text-sm font-medium">
                {isAdmin ? "Admin" : "Mijoz"}
              </p>
            </div>
          </div>
        </div>

        <div className="card card-dark p-4">
          <h2 className="text-lg font-bold">Mening bo‘limlarim</h2>

          <div className="mt-4 grid gap-3">
            <ActionLink
              to="/orders"
              icon={Package}
              title="Buyurtmalarim"
              subtitle="Buyurtma holatini ko‘rish"
            />

            <ActionLink
              to="/favorites"
              icon={Heart}
              title="Sevimlilar"
              subtitle="Saqlab qo‘yilgan mahsulotlar"
            />

            <ActionLink
              to="/catalog"
              icon={Store}
              title="Katalog"
              subtitle="Mahsulotlarni ko‘rish"
            />

            <ActionLink
              to="/profile/support"
              icon={Headphones}
              title="Qo‘llab-quvvatlash"
              subtitle="Savol va yordam uchun"
            />
          </div>
        </div>

        {isAdmin && (
          <div className="card card-dark p-4">
            <h2 className="text-lg font-bold">Admin bo‘limi</h2>

            <div className="mt-4 grid gap-3">
              <ActionLink
                to="/admin"
                icon={LayoutDashboard}
                title="Admin panel"
                subtitle="Statistika va boshqaruv"
                accent
              />

              <ActionLink
                to="/admin/products/new"
                icon={PlusCircle}
                title="Mahsulot qo‘shish"
                subtitle="Yangi mahsulot joylash"
              />

              <ActionLink
                to="/admin/products"
                icon={Store}
                title="Mahsulotlar"
                subtitle="Barcha mahsulotlarni boshqarish"
              />

              <ActionLink
                to="/admin/orders"
                icon={Package}
                title="Buyurtmalar"
                subtitle="Status va cargo ma'lumotlari"
              />

              <ActionLink
                to="/admin/settings"
                icon={Settings}
                title="Sozlamalar"
                subtitle="Karta, aloqa va do‘kon sozlamalari"
              />
            </div>
          </div>
        )}

        <div className="card card-dark p-4">
          <h2 className="text-lg font-bold">Qo‘shimcha qulayliklar</h2>

          <div className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <div className="rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800/70">
              Buyurtma berganingizdan keyin holatini shu ilova ichida kuzatishingiz mumkin.
            </div>

            <div className="rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800/70">
              Cargo yo‘lga chiqqanda og‘irligi va narxi ham ko‘rsatiladi.
            </div>

            <div className="rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800/70">
              Joylashuv xarita ko‘rinishida saqlanadi va administratorga yuboriladi.
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}