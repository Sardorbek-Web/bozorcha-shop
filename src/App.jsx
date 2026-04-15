import { useEffect } from "react";
import { AppRouter } from "./app/router";
import { initTelegramApp } from "./lib/telegram";
import { useUserStore } from "./store/useUserStore";
import { useCartStore } from "./store/useCartStore";
import { useFavoritesStore } from "./store/useFavoritesStore";
import { supabase } from "./lib/supabase";

export default function App() {
  const { setTelegramUser, setProfile } = useUserStore();
  const initCart = useCartStore((state) => state.initCart);
  const initFavorites = useFavoritesStore((state) => state.initFavorites);

  useEffect(() => {
    initCart();
    initFavorites();
  }, [initCart, initFavorites]);

  useEffect(() => {
    async function setupTelegram() {
      try {
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
        console.error("App setup xatolik:", error);
      }
    }

    setupTelegram();
  }, [setTelegramUser, setProfile]);

  return <AppRouter />;
}