import {
  Headphones,
  MessageCircle,
  Phone,
  ArrowLeft,
  Info,
} from "lucide-react";
import { Link } from "react-router-dom";
import MobileLayout from "../components/layout/MobileLayout";

export default function SupportPage() {
  const telegramUsername = "berkinov_08";
  const phone = "+998942581838";

  const telegramLink = `https://t.me/${telegramUsername}`;

  return (
    <MobileLayout title="Qo‘llab-quvvatlash">
      <div className="space-y-4 pb-24">
        <div className="overflow-hidden rounded-[28px] bg-gradient-to-br from-violet-600 via-fuchsia-500 to-indigo-500 p-5 text-white shadow-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
              <Headphones size={24} />
            </div>

            <div>
              <p className="text-lg font-bold">Yordam markazi</p>
              <p className="text-sm text-violet-100">
                Savol va muammolar bo‘yicha bog‘laning
              </p>
            </div>
          </div>
        </div>

        <div className="card card-dark p-4">
          <h2 className="text-lg font-bold">Aloqa</h2>

          <div className="mt-4 space-y-3">
            <a
              href={telegramLink}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-2xl bg-gray-100 px-4 py-4 dark:bg-neutral-800"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-violet-600 dark:bg-neutral-900">
                  <MessageCircle size={18} />
                </div>

                <div>
                  <p className="font-semibold">Telegram</p>
                  <p className="text-xs text-gray-500">
                    @{telegramUsername}
                  </p>
                </div>
              </div>

              <span className="text-sm font-semibold text-violet-600">
                Yozish
              </span>
            </a>

            <a
              href={`tel:${phone}`}
              className="flex items-center justify-between rounded-2xl bg-gray-100 px-4 py-4 dark:bg-neutral-800"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-violet-600 dark:bg-neutral-900">
                  <Phone size={18} />
                </div>

                <div>
                  <p className="font-semibold">Telefon</p>
                  <p className="text-xs text-gray-500">
                    {phone}
                  </p>
                </div>
              </div>

              <span className="text-sm font-semibold text-violet-600">
                Qo‘ng‘iroq
              </span>
            </a>
          </div>
        </div>

        <div className="card card-dark p-4">
          <div className="flex items-center gap-2">
            <Info size={18} className="text-violet-600" />
            <h2 className="text-lg font-bold">Ma'lumot</h2>
          </div>

          <div className="mt-4 rounded-2xl bg-gray-50 p-4 text-sm dark:bg-neutral-800/70">
            Savollar bo‘lsa bemalol Telegram orqali yozishingiz yoki telefon orqali bog‘lanishingiz mumkin.
            <br /><br />
            Tez javob berishga harakat qilamiz 🙂
          </div>
        </div>

        <div className="card card-dark p-4">
          <h2 className="text-lg font-bold">Tezkor amallar</h2>

          <div className="mt-4 grid gap-3">
            <a
              href={telegramLink}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-4 py-4 font-semibold text-white"
            >
              <MessageCircle size={18} />
              Telegram orqali yozish
            </a>

            <Link
              to="/catalog"
              className="flex items-center justify-center gap-2 rounded-2xl bg-gray-100 px-4 py-4 font-semibold dark:bg-neutral-800"
            >
              <ArrowLeft size={18} />
              Katalogga qaytish
            </Link>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}