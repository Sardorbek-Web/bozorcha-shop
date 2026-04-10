import { User, Phone, AtSign, ShieldCheck } from "lucide-react";
import MobileLayout from "../components/layout/MobileLayout";
import { useUserStore } from "../store/useUserStore";

export default function ProfilePage() {
  const { telegramUser, profile } = useUserStore();

  return (
    <MobileLayout title="Profil">
      <div className="space-y-4 pb-24">
        <div className="card card-dark p-4">
          <div className="flex items-center gap-4">
            {telegramUser?.photo_url ? (
              <img
                src={telegramUser.photo_url}
                alt={telegramUser.first_name}
                className="h-16 w-16 rounded-2xl object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-500/10">
                <User size={28} />
              </div>
            )}

            <div>
              <p className="text-lg font-bold">
                {profile?.first_name || telegramUser?.first_name || "Foydalanuvchi"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Telegram orqali kirgan
              </p>
            </div>
          </div>
        </div>

        <div className="card card-dark p-4 space-y-3">
          <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800/70">
            <User size={16} className="text-violet-600" />
            <span className="text-sm">
              Ism: {profile?.first_name || "-"} {profile?.last_name || ""}
            </span>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800/70">
            <AtSign size={16} className="text-violet-600" />
            <span className="text-sm">
              Username: {profile?.username ? `@${profile.username}` : "Mavjud emas"}
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
      </div>
    </MobileLayout>
  );
}