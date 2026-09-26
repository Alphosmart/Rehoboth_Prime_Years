const configured = Boolean(process.env.BREVO_API_KEY && process.env.BREVO_SENDER_EMAIL);

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

async function sendEmail({ to, subject, text, html }) {
  if (!configured) {
    const error = new Error("Brevo email is not configured. Set BREVO_API_KEY and BREVO_SENDER_EMAIL.");
    error.statusCode = 503;
    throw error;
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": process.env.BREVO_API_KEY,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      sender: {
        email: process.env.BREVO_SENDER_EMAIL,
        name: process.env.BREVO_SENDER_NAME || "Rehoboth Prime"
      },
      to: [{ email: to }],
      subject,
      textContent: text,
      htmlContent: html || `<p>${escapeHtml(text || "").replace(/\n/g, "<br>")}</p>`
    }),
    signal: AbortSignal.timeout(15000)
  });

  if (!response.ok) {
    const details = (await response.text()).slice(0, 300);
    const error = new Error(`Brevo email request failed (${response.status}): ${details}`);
    error.statusCode = 502;
    throw error;
  }

  return { delivered: true };
}

module.exports = { sendEmail, emailConfigured: configured };
