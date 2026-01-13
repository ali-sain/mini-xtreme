const config = require("../config");
const isAdmin = require("./admin");

// ================= REGEX =================
// No global flag → safe with .test()
const URL_REGEX =
  /https?:\/\/[^\s]+|chat\.whatsapp\.com\/[\w-]+|whatsapp\.com\/channel\/[\w-]+/i;

// ================= WARN STORE =================
global.userWarnings = global.userWarnings || {};

async function antiLink(conn, mek, m, data) {
  const { from, isGroup, body, sender, isOwner } = data;

  // ================= MODE FIX =================
  // Private mode → only bot/owner messages pass
  if (config.MODE === "private" && !mek.key.fromMe) return;

  // ================= BASIC FILTER =================
  if (!isGroup || !body || isOwner) return;

  // ================= LINK CHECK =================
  if (!URL_REGEX.test(body)) return;

  // ================= ADMIN CHECK =================
  const { isBotAdmin, isSenderAdmin } = await isAdmin(conn, from, sender);
  if (!isBotAdmin || isSenderAdmin) return;

  const warnKey = `${from}_${sender}`;
  const senderTag = `@${sender.split("@")[0]}`;

  // ================= DELETE HELPER =================
  const deleteMsg = async () => {
    try {
      await conn.sendMessage(from, {
        delete: {
          remoteJid: from,
          fromMe: false,
          id: mek.key.id,
          participant: mek.key.participant || sender
        }
      });
    } catch (e) {
      console.log("❌ AntiLink delete failed:", e?.message);
    }
  };

  // =================================================
  // 🔥 BAN MODE
  // =================================================
  if (config.ANTILINK === "true") {
    await deleteMsg();

    await conn.sendMessage(from, {
      text:
`*⌈⚠️ LINK DETECTED ⌋*
╭──────────────────
│ 👤 User : ${senderTag}
│ 🚫 Action : Kicked
│ 📑 Reason : Link Sending
╰──────────────────`,
      mentions: [sender]
    });

    return conn.groupParticipantsUpdate(from, [sender], "remove");
  }

  // =================================================
  // ⚠️ WARN MODE
  // =================================================
  if (config.ANTILINK === "warn") {
    global.userWarnings[warnKey] = (global.userWarnings[warnKey] || 0) + 1;
    const warnCount = global.userWarnings[warnKey];

    await deleteMsg();

    if (warnCount < 3) {
      return conn.sendMessage(from, {
        text:
`*⌈⚠️ LINK WARNING ⌋*
╭──────────────────
│ 👤 User : ${senderTag}
│ ⚠️ Count : ${warnCount}/3
╰──────────────────`,
        mentions: [sender]
      });
    }

    delete global.userWarnings[warnKey];

    await conn.sendMessage(from, {
      text: `${senderTag} *WARN LIMIT EXCEEDED!*`,
      mentions: [sender]
    });

    return conn.groupParticipantsUpdate(from, [sender], "remove");
  }

  // =================================================
  // 🧹 DELETE MODE
  // =================================================
  if (config.ANTILINK === "delete") {
    await deleteMsg();

    return conn.sendMessage(from, {
      text: `🚫 ${senderTag} *Links are not allowed here.*`,
      mentions: [sender]
    });
  }
}

module.exports = antiLink;
