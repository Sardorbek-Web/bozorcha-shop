export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const BOT_TOKEN = process.env.BOT_TOKEN;
    const CHAT_ID = process.env.CHAT_ID;

    if (!BOT_TOKEN) {
      return res.status(500).json({ success: false, error: "BOT_TOKEN topilmadi" });
    }
    if (!CHAT_ID) {
      return res.status(500).json({ success: false, error: "CHAT_ID topilmadi" });
    }

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const {
      fullName,
      phone,
      address,
      productName,
      productPrice,
      selectedSize,
      deliveryText,
      receiptUrl,
      mapUrl,
    } = body || {};

    const text =
      `🛒 *Yangi buyurtma!*\n\n` +
      `👤 Ism: ${fullName || "-"}\n` +
      `📞 Telefon: ${phone || "-"}\n` +
      `📍 Manzil: ${address || "-"}\n` +
      `🗺 Xarita: ${mapUrl || "Yuborilmagan"}\n\n` +
      `📦 Mahsulot: ${productName || "-"}\n` +
      `📏 O'lcham: ${selectedSize || "Tanlanmagan"}\n` +
      `💰 Narx: ${Number(productPrice || 0).toLocaleString()} so'm\n` +
      `🚚 Yetkazib berish: ${deliveryText || "10-12 kun"}`;

    const msgRes = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text,
          parse_mode: "Markdown",
        }),
      }
    );

    const msgJson = await msgRes.json();

    if (!msgJson.ok) {
      return res.status(500).json({
        success: false,
        error: JSON.stringify(msgJson),
      });
    }

    if (receiptUrl) {
      const isImage =
        receiptUrl.endsWith(".jpg") ||
        receiptUrl.endsWith(".jpeg") ||
        receiptUrl.endsWith(".png") ||
        receiptUrl.includes(".jpg?") ||
        receiptUrl.includes(".jpeg?") ||
        receiptUrl.includes(".png?");

      if (isImage) {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: CHAT_ID,
            photo: receiptUrl,
            caption: `🧾 To'lov cheki\n👤 ${fullName}\n📦 ${productName}`,
          }),
        });
      } else {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: CHAT_ID,
            document: receiptUrl,
            caption: `🧾 To'lov cheki\n👤 ${fullName}\n📦 ${productName}`,
          }),
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Botga yuborildi",
    });
  } catch (error) {
    console.error("send-order error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Server xatosi",
    });
  }
}