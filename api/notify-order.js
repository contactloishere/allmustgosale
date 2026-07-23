// Runs on Vercel's server, NOT in the customer's browser — this is what
// keeps the Telegram bot token secret. It reads the token from an
// environment variable set in the Vercel dashboard (Settings → Environment
// Variables), never from the request itself.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID environment variable');
    return res.status(500).json({ error: 'Server not configured for notifications' });
  }

  try {
    const {
      name, contact, address, region, paymentMethod,
      items, subtotal, shipping, total, proofUrl
    } = req.body;

    const itemLines = (items || [])
      .map(i => `• ${i.name} x${i.qty} — ₱${i.price.toLocaleString('en-PH')}`)
      .join('\n');

    const shippingLine = shipping === null
      ? 'To be confirmed (over 5kg)'
      : `₱${shipping.toLocaleString('en-PH')}`;

    const totalLine = total === null
      ? `₱${subtotal.toLocaleString('en-PH')} + shipping (TBD)`
      : `₱${total.toLocaleString('en-PH')}`;

    const text =
      `🛍️ New order — Lois T.'s Clearance Sale\n\n` +
      `Name: ${name}\n` +
      `Contact: ${contact}\n` +
      `Address: ${address}\n` +
      `Region: ${region}\n` +
      `Payment method: ${paymentMethod}\n\n` +
      `Items:\n${itemLines}\n\n` +
      `Subtotal: ₱${subtotal.toLocaleString('en-PH')}\n` +
      `Shipping: ${shippingLine}\n` +
      `Total: ${totalLine}\n\n` +
      `Proof of payment: ${proofUrl}`;

    const tgResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text })
    });

    const tgData = await tgResponse.json();
    if (!tgData.ok) {
      throw new Error(tgData.description || 'Telegram API error');
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Telegram notify failed:', err);
    res.status(500).json({ error: err.message });
  }
}
