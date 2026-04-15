export default async function handler(req, res) {
  try {
    const BOT_TOKEN = process.env.BOT_TOKEN;
    const WEB_APP_URL = process.env.WEB_APP_URL;

    if (!BOT_TOKEN) {
      return res.status(500).json({
        success: false,
        error: "BOT_TOKEN topilmadi",
      });
    }

    if (!WEB_APP_URL) {
      return res.status(500).json({
        success: false,
        error: "WEB_APP_URL topilmadi",
      });
    }

    const menuRes = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/setChatMenuButton`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          menu_button: {
            type: "web_app",
            text: "🛍 Do'konni ochish",
            web_app: { url: WEB_APP_URL },
          },
        }),
      }
    );

    const menuJson = await menuRes.json();

    const cmdRes = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/setMyCommands`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commands: [
            { command: "start", description: "Botni ishga tushirish" },
            { command: "shop", description: "Do'konni ochish" },
            { command: "orders", description: "Buyurtmalar" },
            { command: "help", description: "Yordam" },
          ],
        }),
      }
    );

    const cmdJson = await cmdRes.json();

    return res.status(200).json({
      success: true,
      menu: menuJson,
      commands: cmdJson,
    });
  } catch (error) {
    console.error("setup-bot error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
}