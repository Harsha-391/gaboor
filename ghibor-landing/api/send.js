const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  const { name, phone, email, message } = req.body || {};

  // Validate
  if (!name || name.length < 2)            return res.status(400).json({ success: false, error: 'Name required' });
  if (!phone || phone.replace(/\D/g,'').length < 7) return res.status(400).json({ success: false, error: 'Valid phone required' });
  if (!email || !email.includes('@'))      return res.status(400).json({ success: false, error: 'Valid email required' });
  if (!message || message.length < 5)     return res.status(400).json({ success: false, error: 'Message too short' });

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASS,
    },
  });

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0a0908;font-family:monospace">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0908;padding:40px 0">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#0f0d0c;border:1px solid #2a2622;border-radius:4px;overflow:hidden">
        <tr>
          <td style="padding:28px 32px 24px;border-bottom:1px solid #1e1c1a">
            <p style="margin:0;font-size:9px;letter-spacing:5px;text-transform:uppercase;color:#5c5854">New Registration</p>
            <h1 style="margin:8px 0 0;font-size:22px;letter-spacing:3px;color:#e2dcd2;font-weight:400">Ghubor</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:0 0 18px;width:90px;vertical-align:top;font-size:8px;letter-spacing:3px;text-transform:uppercase;color:#5c5854">Name</td>
                <td style="padding:0 0 18px;vertical-align:top;font-size:13px;color:#e2dcd2">${name}</td>
              </tr>
              <tr>
                <td style="padding:0 0 18px;vertical-align:top;font-size:8px;letter-spacing:3px;text-transform:uppercase;color:#5c5854">Phone</td>
                <td style="padding:0 0 18px;vertical-align:top;font-size:13px;color:#e2dcd2">${phone}</td>
              </tr>
              <tr>
                <td style="padding:0 0 18px;vertical-align:top;font-size:8px;letter-spacing:3px;text-transform:uppercase;color:#5c5854">Email</td>
                <td style="padding:0 0 18px;vertical-align:top;font-size:13px;color:#a07848">${email}</td>
              </tr>
              <tr>
                <td style="padding:0;vertical-align:top;font-size:8px;letter-spacing:3px;text-transform:uppercase;color:#5c5854">Message</td>
                <td style="padding:0;vertical-align:top;font-size:13px;color:#e2dcd2;line-height:1.8">${message.replace(/\n/g, '<br>')}</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px;border-top:1px solid #1e1c1a;font-size:8px;letter-spacing:2px;text-transform:uppercase;color:#3a3834">
            © 2026 Ghubor Studios
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from: `"Ghubor Website" <${process.env.GMAIL_USER}>`,
      to:   process.env.GMAIL_USER,
      replyTo: `"${name}" <${email}>`,
      subject: 'Ghubor — New Early Access Registration',
      html,
      text: `Name: ${name}\nPhone: ${phone}\nEmail: ${email}\n\nMessage:\n${message}`,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Mail error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};
