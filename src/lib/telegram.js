export function initTelegramApp() {
  const tg = window?.Telegram?.WebApp;

  if (!tg) {
    return {
      isTelegram: false,
      isDark: false,
      user: null,
      startParam: null,
      tg: null,
    };
  }

  try {
    tg.ready();
    tg.expand();
  } catch (error) {
    console.error("Telegram init xato:", error);
  }

  return {
    isTelegram: true,
    isDark: (tg.colorScheme || "light") === "dark",
    user: tg.initDataUnsafe?.user || null,
    startParam: tg.initDataUnsafe?.start_param || null,
    tg,
  };
}