const config = require("../config");
const isAdmin = require("./admin");

// Cache regex outside function
const URL_REGEX = /https?:\/\/[^\s]+|chat\.whatsapp\.com\/[\w-]+|whatsapp\.com\/channel\/[\w-]+/i;

// Global warnings
global.userWarnings = global.userWarnings || {};

async function antiLink(conn, mek, m, data) {
    const { from, isGroup, body, sender, isOwner } = data;

    // Fast exits
    if (!isGroup || !body || isOwner) return;

    // Quick link check
    if (!URL_REGEX.test(body)) return;

    // Admin check (only if link detected)
    const { isBotAdmin, isSenderAdmin } = await isAdmin(conn, from, sender);
    if (isSenderAdmin || !isBotAdmin) return;

    const warnKey = `${from}_${sender}`;
    const senderTag = `@${sender.split("@")[0]}`;

    // Delete message helper
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

    // =================================================
    // 🔥 BAN MODE
    // =================================================
    if (config.ANTILINK === "true") {
        await Promise.all([
            deleteMsg(),
            conn.sendMessage(from, {
                text: `*⌈⚠️ ℓιɴк ∂єтє¢тє∂ ⌋*
*╭────────────────┄┈┈*
*│👤 ᴜsєʀ:* ${senderTag}
*│🛩️ кι¢кє∂: ѕυ¢¢єѕѕfυℓℓу*
*│📑 ʀєαѕσɴ: ℓιикѕ ɴσт αℓℓσωє∂*
*╰────────────────┄┈┈*`,
                mentions: [sender]
            })
        ]);

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
                text: `*⌈⚠️ ℓιɴк ∂єтє¢тє∂ ⌋*
*╭────────────────┄┈*
*│👤 ᴜsєʀ:* ${senderTag}
*│⭕ ᴄσᴜɴᴛ : ${warnCount}*
*│🪦 ᴡαʀɴ ℓιмιт: 3*
*╰────────────────┄┈*`,
                mentions: [sender]
            });
        }

        // Kick after 3 warnings
        delete global.userWarnings[warnKey];

        await conn.sendMessage(from, {
            text: `${senderTag} *ᴡαʀɴ ℓιмιт єχᴄєє∂є∂!*`,
            mentions: [sender]
        });

        return conn.groupParticipantsUpdate(from, [sender], "remove");
    }

    // =================================================
    // 🧹 DELETE MODE
    // =================================================
    if (config.ANTILINK === "delete") {
        await Promise.all([
            deleteMsg(),
            conn.sendMessage(from, {
                text: `⎙ ${senderTag}, *ℓιɴкѕ αʀє ɴσт αℓℓσωє∂.*`,
                mentions: [sender]
            })
        ]);
    }
}

module.exports = antiLink;
