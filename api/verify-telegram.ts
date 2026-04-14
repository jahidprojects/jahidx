import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, link } = req.body || {};
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    return res.status(500).json({ error: "TELEGRAM_BOT_TOKEN not configured" });
  }

  if (!userId || !link) {
    return res.status(400).json({ error: "userId and link are required" });
  }

  try {
    let chatId = '';
    try {
      const url = new URL(link);
      const pathParts = url.pathname.split('/').filter(Boolean);
      if (pathParts.length > 0) {
        chatId = pathParts[0];
      }
    } catch (e) {
      chatId = link;
    }

    if (chatId.startsWith('+')) {
      return res.status(400).json({ ok: false, error: "Invite links (+...) are not supported for verification. Please use the channel @username or numeric ID." });
    }

    if (!chatId.startsWith('@') && !chatId.startsWith('-') && isNaN(Number(chatId))) {
      chatId = '@' + chatId;
    }

    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/getChatMember?chat_id=${chatId}&user_id=${userId}`
    );
    const data = await response.json();

    if (data.ok) {
      const status = data.result.status;
      const isMember = ["member", "administrator", "creator"].includes(status);
      return res.status(200).json({ ok: true, isMember });
    } else {
      console.error("Telegram API Error:", data);
      return res.status(200).json({ ok: false, error: data.description });
    }
  } catch (error) {
    console.error("Verification Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
