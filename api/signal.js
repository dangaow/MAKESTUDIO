/**
 * ARG 第二幕 · 邮件自动回信
 * ------------------------------------------------------------------
 * 部署：作为 Vercel Serverless Function（托管于 /api/signal.js）。
 * 上游：Resend「Inbound email」把发往 noise@make-studio.example 的邮件
 *      通过 Webhook POST 到本函数，本函数解析来信后用 Resend 自动回信，
 *      把玩家引向第三幕（社交媒体的隐写图片）。
 *
 * 需要配置的环境变量：
 *   RESEND_API_KEY        Resend API Key（用于发送回信）
 *   SIGNAL_WEBHOOK_SECRET Resend/Svix 签名密钥（用于校验回调真实性，可选但强烈建议）
 *   ARG_SOCIAL_URL        第三幕线索所在（隐写图片的地址，如微博/B站动态）
 *   ARG_SOCIAL_HINT       回信正文里附带的一句话线索
 *
 *  验证你自己的发信域名：在 Resend 控制台把 make-studio.example 的
 *  MX/TXT 记录配好，并把本函数地址填到 Inbound 的 Webhook 里。
 *  占位域名 make-studio.example 仅供本地骨架演示，上线前必须换成真实域名。
 * ------------------------------------------------------------------
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
// 收信/发信地址 —— 与 signal.html 里暴露的邮箱保持一致
const FROM_ADDRESS = 'noise@make-studio.example';
const ARG_SOCIAL_URL = process.env.ARG_SOCIAL_URL || 'https://weibo.com/u/你的账号/隐写图片动态';
const ARG_SOCIAL_HINT = process.env.ARG_SOCIAL_HINT || '一张看起来再普通不过的图，藏着一段没被放完的频率';

const REPLY_TEXT = (subject) => `收到。这不是自动回复。

你要找的声音不在空气里，而在光里。
${ARG_SOCIAL_HINT}。

去这里：
${ARG_SOCIAL_URL}

把图下载下来，读它的「最低有效位」（least significant bit）。
解出来的那一串东西，就是通往第五首歌的坐标。

—— 88.7
`;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'method not allowed' });
    return;
  }

  // 1) 校验 Webhook 签名（占位）。生产环境请改用 Svix 校验回调：
  //    const { Webhook } = require('svix');
  //    const wh = new Webhook(process.env.SIGNAL_WEBHOOK_SECRET);
  //    用原始请求体 + 请求头里的 svix-id / svix-timestamp / svix-signature 做 wh.verify()，
  //    校验失败直接 return res.status(401).end();
  const secret = process.env.SIGNAL_WEBHOOK_SECRET;
  if (secret && req.headers['svix-signature']) {
    // TODO: 替换为真实 Svix 校验，防止伪造回调触发无限回信。
    // 目前仅做存在性检查，仅用于本地联调。
  }

  // 2) 解析来信。Resend Inbound 格式：
  //    { type:'email.received', data:{ from, to:[...], subject, text, html, ... } }
  const payload = req.body || {};
  const data = payload.data || payload;
  const sender = data.from || (data.headers && data.headers.from) || '';
  const to = Array.isArray(data.to) ? data.to : (data.to ? [data.to] : []);
  const subject = data.subject || 'SIGNAL';

  const isForUs = to.some(function (a) {
    return String(a).toLowerCase().indexOf('noise@make-studio.example') !== -1;
  });
  if (!isForUs || !sender) {
    // 非本节点来信或缺失发件人，直接忽略，避免误回信
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
    from: FROM_ADDRESS,
    to: [sender],
    subject: 'RE: ' + subject,
    text: REPLY_TEXT(subject)
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