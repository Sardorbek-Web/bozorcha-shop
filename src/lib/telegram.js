export function initTelegramApp() {
  const tg = window?.Telegram?.WebApp;

  if (!tg) {
    return {
      isTelegram: false,
      isDark: false,
      user: null,
      startParam: null,
    };
  }

  tg.ready();
  tg.expand();

  const colorScheme = tg.colorScheme || "light";
  const user = tg.initDataUnsafe?.user || null;
  const startParam = tg.initDataUnsafe?.start_param || null;

  return {
    isTelegram: true,
    isDark: colorScheme === "dark",
    user,
    startParam,
    tg,
  };
}