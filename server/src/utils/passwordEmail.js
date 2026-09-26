function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function createPasswordEmail({ mode, name, email, url, expiresIn }) {
  const isReset = mode === "reset";
  const title = isReset ? "Reset your password" : "Welcome to Rehoboth Prime Years";
  const action = isReset ? "Choose a new password" : "Set your password";
  const preheader = isReset
    ? "Use your secure link to reset your Rehoboth Prime Years admin password."
    : "Your Rehoboth Prime Years admin account is ready to set up.";
  const intro = isReset
    ? "We received a request to reset the password for your admin account."
    : "Your admin account is ready. Set a password to finish activating it.";
  const greeting = name ? `Hello ${name},` : "Hello,";
  const safeUrl = escapeHtml(url);
  const text = [
    greeting,
    "",
    intro,
    !isReset && email ? `Login email: ${email}` : "",
    "",
    `${action}: ${url}`,
    `This one-time link expires in ${expiresIn}.`,
    "If you did not request this, you can ignore this email."
  ].filter(Boolean).join("\n");
  const html = `<!doctype html>
<html lang="en">
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"></head>
  <body style="margin:0;padding:0;background-color:#f2f6ef;font-family:Arial,Helvetica,sans-serif;color:#172026;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f2f6ef;width:100%;">
      <tr><td align="center" style="padding:36px 14px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;background-color:#ffffff;border:1px solid #dce6d6;border-radius:8px;overflow:hidden;">
          <tr><td style="height:6px;background-color:#ffd200;font-size:0;line-height:0;">&nbsp;</td></tr>
          <tr><td style="padding:25px 34px;background-color:#00843d;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr>
              <td width="46" valign="middle"><div style="width:38px;height:38px;line-height:38px;text-align:center;border-radius:50%;background-color:#ffffff;color:#00843d;font-size:14px;font-weight:700;">RP</div></td>
              <td valign="middle" style="padding-left:12px;color:#ffffff;font-size:16px;font-weight:700;">Rehoboth Prime Years</td>
            </tr></table>
          </td></tr>
          <tr><td style="padding:36px 34px 22px;">
            <p style="margin:0 0 12px;color:#00843d;font-size:11px;line-height:16px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Admin account security</p>
            <h1 style="margin:0 0 18px;color:#172026;font-size:28px;line-height:35px;font-weight:700;">${escapeHtml(title)}</h1>
            <p style="margin:0 0 16px;color:#39443d;font-size:16px;line-height:25px;">${escapeHtml(greeting)}</p>
            <p style="margin:0 0 16px;color:#39443d;font-size:15px;line-height:24px;">${escapeHtml(intro)}</p>
            ${!isReset && email ? `<p style="margin:0 0 22px;color:#39443d;font-size:14px;line-height:22px;"><strong>Login email:</strong> ${escapeHtml(email)}</p>` : ""}
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:26px 0 22px;"><tr>
              <td align="center" bgcolor="#00843d" style="border-radius:5px;"><a href="${safeUrl}" style="display:inline-block;padding:14px 22px;color:#ffffff;text-decoration:none;font-size:15px;line-height:20px;font-weight:700;border:1px solid #00843d;border-radius:5px;">${escapeHtml(action)}</a></td>
            </tr></table>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f2f6ef;border-left:4px solid #00843d;"><tr>
              <td style="padding:13px 15px;color:#39443d;font-size:13px;line-height:20px;"><strong>This secure link expires in ${escapeHtml(expiresIn)}.</strong> It can only be used once.</td>
            </tr></table>
            <p style="margin:24px 0 7px;color:#65716a;font-size:12px;line-height:19px;">If the button does not work, copy and paste this link into your browser:</p>
            <p style="margin:0;color:#0057b8;font-size:12px;line-height:19px;word-break:break-all;"><a href="${safeUrl}" style="color:#0057b8;word-break:break-all;">${safeUrl}</a></p>
            <p style="margin:24px 0 0;color:#65716a;font-size:13px;line-height:21px;">If you did not request this, you can safely ignore this email.</p>
          </td></tr>
          <tr><td style="padding:18px 34px;background-color:#f8faf7;border-top:1px solid #e5ebe1;color:#65716a;font-size:12px;line-height:18px;">Rehoboth Prime Years<br>Administrative account notification</td></tr>
        </table>
        <p style="margin:16px 0 0;color:#7b857e;font-size:11px;line-height:16px;">This is an automated message. Please do not reply.</p>
      </td></tr>
    </table>
  </body>
</html>`;

  return { text, html };
}

module.exports = createPasswordEmail;