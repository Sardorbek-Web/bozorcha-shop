const axios = require("axios");

const BOT_TOKEN = "8651080112:AAFMc7kqkCkh2p-6C5mz9OiTgejZ8ZSUOzg";
const WEB_APP_URL = "https://bozorchashop.netlify.app/";

async function setupBot() {
  try {
    // 1. Menu button
    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/setChatMenuButton`, {
      menu_button: {
        type: "web_app",
        text: "Bozorcha",
        web_app: {
          url: WEB_APP_URL,
        },
      },
    });

    // 2. Commands
    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/setMyCommands`, {
      commands: [
        { command: "start", description: "Botni ishga tushirish" },
        { command: "shop", description: "Do'konni ochish" },
        { command: "orders", description: "Buyurtmalar haqida" },
        { command: "help", description: "Yordam" },
      ],
    });

    console.log("Bot muvaffaqiyatli sozlandi ✅");
  } catch (error) {
    console.error(
      "Bot setup xatolik:",
      error.response?.data || error.message
    );
  }
}

setupBot();