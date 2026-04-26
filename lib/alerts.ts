const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_FOUNDER_CHAT_ID

export async function alertFounder(message: string) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: `🚨 *cekwajar.id Alert*\n\n${message}`,
        parse_mode: 'Markdown',
      }),
    })
  } catch (err) {
    console.error('[alerts] Failed to send Telegram alert:', err)
  }
}

export async function alertFunnelDrop(alerts: string[]) {
  const msg =
    `Funnel health check — 24h window\n\n` +
    alerts.map((a) => `• ${a}`).join('\n') +
    `\n\nDashboard: https://cekwajar.id/admin/revenue`
  await alertFounder(msg)
}