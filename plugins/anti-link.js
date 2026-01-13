const antiLink = require("../lib/antilink");
const { cmd } = require("../command");
const config = require("../config");

cmd(
  {
    on: "body",
    fromMe: false // public + private dono me fire hoga
  },
  async (conn, mek, store, data) => {
    try {
      // Private mode safety (extra layer)
      if (config.MODE === "private" && !mek.key.fromMe) return;

      await antiLink(conn, mek, mek, {
        ...data,
        isOwner: data.isOwner || mek.key.fromMe
      });

    } catch (err) {
      console.error("❌ AntiLink Plugin Error:", err);
    }
  }
);
