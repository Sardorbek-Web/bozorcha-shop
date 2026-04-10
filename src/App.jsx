import { useEffect } from "react";
import { AppRouter } from "./app/router";
import { initTelegramApp } from "./lib/telegram";
import { useUserStore } from "./store/useUserStore";
import { supabase } from "./lib/supabase";

export default function App() {
  const { setTelegramUser, setProfile } = useUserStore();

  useEffect(() => {
    async function setupTelegram() {
      const tgData = initTelegramApp();

      if (tgData?.isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }

      if (!tgData?.user) return;

      const telegramUser = tgData.user;
      setTelegramUser(telegramUser);

      const payload = {
        telegram_id: telegramUser.id,
        first_name: telegramUser.first_name || "",
        last_name: telegramUser.last_name || "",
        full_name: `${telegramUser.first_name || ""} ${telegramUser.last_name || ""}`.trim(),
        username: telegramUser.username || "",
        photo_url: telegramUser.photo_url || "",
      };

      try {
        const { data: existingProfile, error: findError } = await supabase
          .from("profiles")
          .select("*")
          .eq("telegram_id", telegramUser.id)
          .maybeSingle();

        if (findError) {
          console.error("Profile qidirishda xatolik:", findError);
          return;
        }

        if (existingProfile) {
          const { data: updatedProfile, error: updateError } = await supabase
            .from("profiles")
            .update(payload)
            .eq("telegram_id", telegramUser.id)
            .select()
            .single();

          if (updateError) {
            console.error("Profile yangilashda xatolik:", updateError);
            return;
          }

          setProfile(updatedProfile);
        } else {
          const { data: newProfile, error: insertError } = await supabase
            .from("profiles")
            .insert([
              {
                ...payload,
                role: "customer",
                language: "uz",
              },
            ])
            .select()
            .single();

          if (insertError) {
            console.error("Profile qo'shishda xatolik:", insertError);
            return;
          }

          setProfile(newProfile);
        }
      } catch (error) {
        console.error("Telegram setup xatolik:", error);
      }
    }

    setupTelegram();
  }, [setTelegramUser, setProfile]);

  return <AppRouter />;
}