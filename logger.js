const axios = require("axios");


async function sendLog(message) {
  try {
    const url = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`;
    await axios.post(url, {
      chat_id: process.env.CHAT_ID,
      text: message,
    });
    console.log("Log sent to Telegram!");
  } catch (error) {
    console.error("Error sending log:", error.response?.data || error.message);
  }
}

module.exports = sendLog;