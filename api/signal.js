/**
 * 邮件自动回信模板（可选 · 未启用）
 * --------------------------------------
 * 作为 Vercel Serverless Function（托管于 /api/signal.js）。
 * 上游：Resend「Inbound email」把邮件通过 Webhook POST 到本函数，
 *       本函数解析来信后用 Resend 自动回信。
 *
 * 需要配置的环境变量：
 *   RESEND_API_KEY         Resend API Key（用于发送回信）
 *   SIGNAL_WEBHOOK_SECRET  回调签名密钥（可选）
 *   REPLY_FROM_ADDRESS     回信发件地址
 *   REPLY_TO_ADDRESS       收件地址（用于判断来信是否属于本节点）
 *   REPLY_TEXT             回信正文
 *
 * 验证你自己的发信域名：在 Resend 控制台配置 MX/TXT 记录，
 * 并把本函数地址填到 Inbound 的 Webhook 里即可。
 * --------------------------------------
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const REPLY_FROM_ADDRESS = process.env.REPLY_FROM_ADDRESS || 'no-reply@example.com';
const REPLY_TO_ADDRESS = process.env.REPLY_TO_ADDRESS || 'no-reply@example.com';
const REPLY_TEXT = process.env.REPLY_TEXT || '收到。感谢来信。\n—— MAKE STUDIO';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'method not allowed' });
    return;
  }

  // 1) 可选：校验 Webhook 签名（生产环境建议接入 Svix 校验，防止伪造回调）
  const secret = process.env.SIGNAL_WEBHOOK_SECRET;
  if (secret && req.headers['svix-signature']) {
    // TODO: 替换为真实 Svix 校验。目前仅做存在性检查，仅用于本地联调。
  }

  // 2) 解析来信。Resend Inbound 格式：
  //    { type:'email.received', data:{ from, to:[...], subject, text, html, ... } }
  const payload = req.body || {};
  const data = payload.data || payload;
  const sender = data.from || (data.headers && data.headers.from) || '';
  const to = Array.isArray(data.to) ? data.to : (data.to ? [data.to] : []);
  const subject = data.subject || 'MAIL';

  const isForUs = to.some(function (a) {
    return String(a).toLowerCase().indexOf(REPLY_TO_ADDRESS.toLowerCase()) !== -1;
  });
  if (!isForUs || !sender) {
    res.status(200).json({ ok: true, ignored: true });
    return;
  }

  // 3) 自动回信
  if (!RESEND_API_KEY) {
    console.error('[signal] 缺少 RESEND_API_KEY');
    res.status(500).json({ ok: false, error: 'RESEND_API_KEY not configured' });
    return;
  }

  const mail = {
    from: REPLY_FROM_ADDRESS,
    to: [sender],
    subject: 'RE: ' + subject,
    text: REPLY_TEXT
  };

  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + RESEND_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(mail)
    });

    if (!resp.ok) {
      const body = await resp.text();
      console.error('[signal] Resend 发送失败', resp.status, body);
      res.status(502).json({ ok: false, error: body });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[signal] 发送异常', err);
    res.status(500).json({ ok: false, error: String(err) });
  }
};