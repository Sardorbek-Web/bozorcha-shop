import { Navigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import MobileLayout from "../layout/MobileLayout";
import { useUserStore } from "../../store/useUserStore";

export default function AdminRoute({ children }) {
  const { profile } = useUserStore();

  if (!profile) {
    return (
      <MobileLayout title="Tekshirilmoqda">
        <div className="card card-dark p-6 text-center">
          Profil yuklanmoqda...
        </div>
      </MobileLayout>
    );
  }

  if (profile.role !== "admin") {
    return (
      <MobileLayout title="Ruxsat yo‘q">
        <div className="card card-dark p-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
            <ShieldAlert size={28} />
          </div>
          <p className="mt-4 text-lg font-bold">Bu bo‘lim faqat admin uchun</p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Sizda admin panelga kirish huquqi yo‘q.
          </p>
        </div>
      </MobileLayout>
    );
  }

  return children;
}