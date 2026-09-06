const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
});

async function sendOtpEmail(to, otp, purpose = 'login') {
    const isNew    = purpose === 'signup';
    const year     = new Date().getFullYear();
    const expiry   = '10 minutes';

    const subject = isNew
        ? '🏡 Welcome to StayNest — Verify your email'
        : '🔐 Your StayNest login OTP';

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0"
          style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:520px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#ff385c 0%,#e0304e 100%);padding:36px 40px 32px;text-align:center;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <!-- Logo mark -->
                    <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:50%;width:52px;height:52px;line-height:52px;text-align:center;margin-bottom:14px;">
                      <span style="font-size:26px;">🏡</span>
                    </div>
                    <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:800;letter-spacing:-0.5px;">StayNest</h1>
                    <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;font-weight:400;">
                      ${isNew ? 'Welcome! One last step to get started.' : 'Your one-time login code is here.'}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">

              <p style="margin:0 0 8px;color:#111;font-size:22px;font-weight:700;">
                ${isNew ? 'Welcome to StayNest! 👋' : 'Hello again! 👋'}
              </p>
              <p style="margin:0 0 28px;color:#555;font-size:15px;line-height:1.7;">
                ${isNew
                  ? 'Thanks for joining StayNest. Use the OTP below to verify your email and complete your registration.'
                  : 'We received a login request for your StayNest account. Use the OTP below to log in securely.'
                }
              </p>

              <!-- OTP Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td align="center"
                    style="background:#fff8f9;border:2px dashed #ff385c;border-radius:12px;padding:28px 20px;">
                    <p style="margin:0 0 8px;color:#888;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;">
                      Your one-time password
                    </p>
                    <p style="margin:0;color:#ff385c;font-size:42px;font-weight:900;letter-spacing:0.3em;line-height:1;">
                      ${otp}
                    </p>
                    <p style="margin:10px 0 0;color:#aaa;font-size:12px;">
                      ⏱ Expires in <strong>${expiry}</strong>
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Steps hint -->
              <table width="100%" cellpadding="0" cellspacing="0"
                style="background:#f9fafb;border-radius:10px;padding:20px;margin-bottom:28px;">
                <tr>
                  <td style="padding:0 0 12px;">
                    <p style="margin:0;color:#333;font-size:13px;font-weight:700;">How to use it:</p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <p style="margin:0 0 6px;color:#555;font-size:13px;">
                      1️⃣ &nbsp;Go back to the StayNest login page
                    </p>
                    <p style="margin:0 0 6px;color:#555;font-size:13px;">
                      2️⃣ &nbsp;Enter the 6-digit code shown above
                    </p>
                    <p style="margin:0;color:#555;font-size:13px;">
                      3️⃣ &nbsp;${isNew ? 'Your account will be activated!' : 'You\'ll be logged in instantly!'}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Warning -->
              <table width="100%" cellpadding="0" cellspacing="0"
                style="background:#fff3cd;border-left:4px solid #ffc107;border-radius:0 8px 8px 0;padding:14px 16px;margin-bottom:8px;">
                <tr>
                  <td>
                    <p style="margin:0;color:#7a5c00;font-size:13px;line-height:1.6;">
                      ⚠️ &nbsp;<strong>Never share this OTP</strong> with anyone.
                      StayNest will never ask for your OTP over call or chat.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:20px 0 0;color:#999;font-size:12px;line-height:1.7;">
                If you didn't request this, you can safely ignore this email.
                Your account will remain secure.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none;border-top:1px solid #f0f0f0;margin:0;" />
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px 32px;text-align:center;">
              <p style="margin:0 0 6px;color:#bbb;font-size:12px;">
                © ${year} StayNest &nbsp;·&nbsp; Find your perfect stay
              </p>
              <p style="margin:0;color:#ddd;font-size:11px;">
                This email was sent to ${to}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;

    await transporter.sendMail({
        from: `"StayNest 🏡" <${process.env.GMAIL_USER}>`,
        to,
        subject,
        html,
    });
}

module.exports = { sendOtpEmail };
