export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  }

  try {
    const BOT_TOKEN = process.env.BOT_TOKEN;
    const CHANNEL_ID = process.env.CHANNEL_ID;

    if (!BOT_TOKEN) {
      return res.status(500).json({
        success: false,
        error: "BOT_TOKEN topilmadi",
      });
    }

    if (!CHANNEL_ID) {
      return res.status(500).json({
        success: false,
        error: "CHANNEL_ID topilmadi",
      });
    }

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const {
      name,
      price,
      oldPrice,
      description,
      sizes,
      image,
      category,
    } = body || {};

    if (!name || !price) {
      return res.status(400).json({
        success: false,
        error: "name yoki price yo'q",
      });
    }

    const priceText = Number(price || 0).toLocaleString();
    const oldPriceText = oldPrice ? Number(oldPrice).toLocaleString() : null;

    const caption =
      `🛍 <b>Bozorcha yangi mahsulot</b>\n\n` +
      `📦 <b>${name}</b>\n` +
      `${category ? `🗂 Kategoriya: <b>${category}</b>\n` : ""}` +
      `💰 Narxi: <b>${priceText} so'm</b>\n` +
      `${oldPriceText ? `🏷 Eski narx: <s>${oldPriceText} so'm</s>\n` : ""}` +
      `📏 Razmerlar: ${sizes || "-"}\n` +
      `🚚 Yetkazib berish: <b>10–15 kun</b>\n` +
      `🌏 Buyurtma: <b>Xitoydan</b>\n\n` +
      `📝 <b>Tavsif:</b>\n${description || "-"}\n\n` +
      `📞 Aloqa uchun: @berkinov_08\n` +
      `🤖 Buyurtma uchun: @Bozorcha_shop_bot`;

    const payload = {
      chat_id: CHANNEL_ID,
      caption,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "🛒 Buyurtma berish",
              url: "https://t.me/Bozorcha_shop_bot",
            },
          ],
          [
            {
              text: "📞 Aloqa",
              url: "https://t.me/berkinov_08",
            },
          ],
        ],
      },
    };

    let tgRes;
    let tgJson;

    if (image) {
      tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...payload,
          photo: image,
        }),
      });

      tgJson = await tgRes.json();
    } else {
      tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...payload,
          text: caption,
        }),
      });

      tgJson = await tgRes.json();
    }

    if (!tgJson.ok) {
      return res.status(500).json({
        success: false,
        error: JSON.stringify(tgJson),
      });
    }

    return res.status(200).json({
      success: true,
      result: tgJson.result,
    });
  } catch (error) {
    console.error("post-product error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Server xatosi",
    });
  }
}