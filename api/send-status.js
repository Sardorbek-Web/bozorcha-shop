function buildStatusMessage({ status, cargoWeightKg, cargoAmount, adminNote }) {
  if (status === "confirmed") {
    return `✅ *Buyurtmangiz tasdiqlandi*\n\nTez orada keyingi holat haqida xabar beramiz.`;
  }

  if (status === "in_cargo") {
    let text = `🚚 *Mahsulotingiz cargo orqali yo'lga chiqdi*`;

    if (cargoWeightKg || cargoAmount) {
      text += `\n\n📦 *Cargo ma'lumoti*`;
      if (cargoWeightKg) text += `\n• Og'irligi: *${cargoWeightKg} kg*`;
      if (cargoAmount) {
        text += `\n• Cargo narxi: *${Number(cargoAmount).toLocaleString()} so'm*`;
      }
    }

    if (adminNote) text += `\n\n📝 *Izoh:* ${adminNote}`;
    return text;
  }

  if (status === "delivered") {
    let text = `🎉 *Buyurtmangiz yetib keldi!*`;
    if (adminNote) text += `\n\n📝 *Izoh:* ${adminNote}`;
    return text;
  }

  if (status === "cancelled") {
    let text = `❌ *Buyurtmangiz bekor qilindi*`;
    if (adminNote) text += `\n\nSabab: ${adminNote}`;
    return text;
  }

  return `📦 Buyurtmangiz holati yangilandi.`;
}

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
    if (!BOT_TOKEN) {
      return res.status(500).json({ success: false, error: "BOT_TOKEN topilmadi" });
    }

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { chatId, status, cargoWeightKg, cargoAmount, adminNote } = body || {};

    if (!chatId || !status) {
      return res.status(400).json({
        success: false,
        error: "chatId yoki status yo'q",
      });
    }

    const text = buildStatusMessage({
      status,
      cargoWeightKg,
      cargoAmount,
      adminNote,
    });

    const tgRes = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "Markdown",
        }),
      }
    );

    const tgJson = await tgRes.json();

    if (!tgJson.ok) {
      return res.status(500).json({
        success: false,
        error: JSON.stringify(tgJson),
      });
    }

    return res.status(200).json({
      success: true,
      telegram: tgJson,
    });
  } catch (error) {
    console.error("send-status error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Server xatosi",
    });
  }
}