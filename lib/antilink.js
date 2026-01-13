const config = require("../config");
const isAdmin = require("./admin");

const URL_REGEX = /https?:\/\/[^\s]+|chat\.whatsapp\.com\/[\w-]+|whatsapp\.com\/channel\/[\w-]+/i;

global.userWarnings = global.userWarnings || {};

async function antiLink(conn, mek, m, data) {
    const { from, isGroup, body, sender, isOwner } = data;

    if (!isGroup || !body || isOwner) return;
    if (!URL_REGEX.test(body)) return;

    const { isBotAdmin, isSenderAdmin } = await isAdmin(conn, from, sender);
    if (isSenderAdmin || !isBotAdmin) return;

    const warnKey = `${from}_${sender}`;
    const senderTag = `@${sender.split("@")[0]}`;

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
            console.log("❌ Delete failed:", e);
        }
    };

    // 🔥 BAN MODE
    if (config.ANTILINK === true || config.ANTILINK === "ban") {
        await Promise.all([
            deleteMsg(),
            conn.sendMessage(from, {
                text: `⚠️ ${senderTag} *removed for sharing links.*`,
                mentions: [sender]
            })
        ]);
        return conn.groupParticipantsUpdate(from, [sender], "remove");
    }

    // ⚠️ WARN MODE
    if (config.ANTILINK === "warn") {
        global.userWarnings[warnKey] = (global.userWarnings[warnKey] || 0) + 1;
        const warnCount = global.userWarnings[warnKey];

        await deleteMsg();

        if (warnCount < 3) {
            return conn.sendMessage(from, {
                text: `⚠️ ${senderTag} warning ${warnCount}/3`,
                mentions: [sender]
            });
        }

        delete global.userWarnings[warnKey];
        await conn.sendMessage(from, {
            text: `❌ ${senderTag} removed (warn limit exceeded)`,
            mentions: [sender]
        });

        return conn.groupParticipantsUpdate(from, [sender], "remove");
    }

    // 🧹 DELETE MODE
    if (config.ANTILINK === "delete") {
        await Promise.all([
            deleteMsg(),
            conn.sendMessage(from, {
                text: `🚫 ${senderTag} links are not allowed.`,
                mentions: [sender]
            })
        ]);
    }
}

module.exports = antiLink;
