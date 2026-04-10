const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

// MUHIM: middleware lar ROUTE lardan oldin turishi kerak
app.use(
  cors({
    origin: ["http://localhost:5174"],
  })
);

app.use(express.json());

const BOT_TOKEN = "8651080112:AAFMc7kqkCkh2p-6C5mz9OiTgejZ8ZSUOzg";
const CHAT_ID = "8038028871";
const WEB_APP_URL = "https://bozorchashop.netlify.app/";

// test route
app.get("/", (req, res) => {
  res.send("Server ishlayapti ✅");
});

// ===============================
// BOT SETUP
// ===============================
app.get("/setup-bot", async (req, res) => {
  try {
    const menuRes = await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/setChatMenuButton`,
      {
        menu_button: {
          type: "web_app",
          text: "Bozorcha",
          web_app: {
            url: WEB_APP_URL,
          },
        },
      }
    );

    const cmdRes = await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/setMyCommands`,
      {
        commands: [
          { command: "start", description: "Botni ishga tushirish" },
          { command: "shop", description: "Do'konni ochish" },
          { command: "orders", description: "Buyurtmalar haqida" },
          { command: "help", description: "Yordam" },
        ],
      }
    );

    res.json({
      success: true,
      menu: menuRes.data,
      commands: cmdRes.data,
    });
  } catch (error) {
    console.error("setup-bot xato:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data || error.message,
    });
  }
});

// ===============================
// SEND STATUS
// ===============================
app.post("/send-status", async (req, res) => {
  try {
    console.log("send-status body:", req.body);

    const { chatId, status } = req.body;

    if (!chatId || !status) {
      return res.status(400).json({
        success: false,
        message: "chatId yoki status yo'q",
      });
    }

    let text = "";

    if (status === "confirmed") {
      text = "✅ Buyurtmangiz tasdiqlandi. Tez orada Xitoydan buyurtma beriladi.";
    } else if (status === "in_cargo") {
      text = "🚚 Mahsulotingiz cargo orqali yo‘lga chiqdi.";
    } else if (status === "delivered") {
      text = "🎉 Buyurtmangiz yetib keldi. Siz bilan bog‘lanamiz.";
    } else if (status === "cancelled") {
      text = "❌ Buyurtmangiz bekor qilindi.";
    } else {
      text = "📦 Buyurtmangiz yangilandi.";
    }

    const tgRes = await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        chat_id: chatId,
        text,
      }
    );

    res.json({
      success: true,
      telegram: tgRes.data,
    });
  } catch (error) {
    console.error("send-status xato:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data || error.message,
    });
  }
});

// ===============================
// SEND ORDER
// ===============================
app.post("/send-order", async (req, res) => {
  try {
    console.log("send-order body:", req.body);

    const {
      fullName,
      phone,
      address,
      productName,
      productPrice,
      selectedSize,
      deliveryText,
      receiptUrl,
    } = req.body;

    const text = `🛒 Yangi buyurtma!

👤 Ism: ${fullName}
📞 Telefon: ${phone}
📍 Manzil: ${address}

📦 Mahsulot: ${productName}
📏 O'lcham: ${selectedSize || "Tanlanmagan"}
💰 Narx: ${Number(productPrice || 0).toLocaleString()} so'm
🚚 Yetkazib berish: ${deliveryText || "10-12 kun"}

🧾 Chek pastda yuborildi.`;

    const msgRes = await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        chat_id: CHAT_ID,
        text,
      }
    );

    if (receiptUrl) {
      const isImage =
        receiptUrl.endsWith(".jpg") ||
        receiptUrl.endsWith(".jpeg") ||
        receiptUrl.endsWith(".png") ||
        receiptUrl.includes(".jpg?") ||
        receiptUrl.includes(".jpeg?") ||
        receiptUrl.includes(".png?");

      if (isImage) {
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
          chat_id: CHAT_ID,
          photo: receiptUrl,
          caption: `🧾 To'lov cheki\n👤 ${fullName}\n📦 ${productName}`,
        });
      } else {
        await axios.post(
          `https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`,
          {
            chat_id: CHAT_ID,
            document: receiptUrl,
            caption: `🧾 To'lov cheki\n👤 ${fullName}\n📦 ${productName}`,
          }
        );
      }
    }

    res.json({
      success: true,
      message: "Botga yuborildi",
      telegram: msgRes.data,
    });
  } catch (error) {
    console.error("send-order xato:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data || error.message,
    });
  }
});

app.listen(5000, () => {
  console.log("Server ishlayapti: http://localhost:5000");
});