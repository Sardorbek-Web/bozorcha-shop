import { useEffect, useState } from "react";
import { CreditCard, Phone, Bot, BadgeInfo, UserRound, Loader2 } from "lucide-react";
import MobileLayout from "../components/layout/MobileLayout";
import { supabase } from "../lib/supabase";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    id: null,
    card_holder_name: "",
    card_number: "",
    phone_primary: "+998",
    telegram_bot_username: "",
    support_text: "",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      setForm({
        id: data.id,
        card_holder_name: data.card_holder_name || "",
        card_number: data.card_number || "",
        phone_primary: data.phone_primary || "+998",
        telegram_bot_username: data.telegram_bot_username || "",
        support_text: data.support_text || "",
      });
    }

    setLoading(false);
  }

  function handleChange(e) {
    const { name, value } = e.target;

    if (name === "phone_primary") {
      let next = value.replace(/[^\d+]/g, "");
      if (!next.startsWith("+998")) next = "+998";
      setForm((prev) => ({ ...prev, [name]: next }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      if (form.id) {
        const { error } = await supabase
          .from("settings")
          .update({
            card_holder_name: form.card_holder_name,
            card_number: form.card_number,
            phone_primary: form.phone_primary,
            telegram_bot_username: form.telegram_bot_username,
            support_text: form.support_text,
          })
          .eq("id", form.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("settings")
          .insert([
            {
              card_holder_name: form.card_holder_name,
              card_number: form.card_number,
              phone_primary: form.phone_primary,
              telegram_bot_username: form.telegram_bot_username,
              support_text: form.support_text,
            },
          ])
          .select()
          .single();

        if (error) throw error;

        setForm((prev) => ({
          ...prev,
          id: data.id,
        }));
      }

      setMessage("Sozlamalar saqlandi ✅");
    } catch (error) {
      console.error(error);
      setMessage(`Xatolik: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <MobileLayout title="Sozlamalar">
        <div className="card card-dark p-6">Yuklanmoqda...</div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Sozlamalar">
      <div className="space-y-4 pb-24">
        <form onSubmit={handleSubmit} className="card card-dark p-4">
          <h2 className="text-lg font-bold">Admin sozlamalari</h2>

          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                <UserRound size={16} />
                Karta egasi
              </label>
              <input
                name="card_holder_name"
                value={form.card_holder_name}
                onChange={handleChange}
                className="input"
                placeholder="Masalan: ALI BOZORCHA"
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                <CreditCard size={16} />
                Karta raqami
              </label>
              <input
                name="card_number"
                value={form.card_number}
                onChange={handleChange}
                className="input"
                placeholder="8600 1234 5678 9012"
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Phone size={16} />
                Telefon
              </label>
              <input
                name="phone_primary"
                value={form.phone_primary}
                onChange={handleChange}
                className="input"
                placeholder="+998"
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Bot size={16} />
                Bot username
              </label>
              <input
                name="telegram_bot_username"
                value={form.telegram_bot_username}
                onChange={handleChange}
                className="input"
                placeholder="bozorcha_shop_bot"
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                <BadgeInfo size={16} />
                Support text
              </label>
              <textarea
                name="support_text"
                value={form.support_text}
                onChange={handleChange}
                className="input min-h-[120px] resize-none"
                placeholder="Savollar bo'lsa Telegram orqali yozing"
              />
            </div>

            {message && (
              <div className="rounded-2xl bg-gray-100 p-3 text-sm dark:bg-neutral-800">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="btn-primary w-full disabled:opacity-60"
            >
              {saving ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Saqlanmoqda...
                </span>
              ) : (
                "Saqlash"
              )}
            </button>
          </div>
        </form>
      </div>
    </MobileLayout>
  );
}