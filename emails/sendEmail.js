// Placeholder email helper (SendGrid)
// Safe MVP: no automation, no real domain required.

const sendEmail = async ({ to, subject, html }) => {
  const apiKey = process.env.SENDGRID_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    return {
      ok: false,
      error: 'Missing SENDGRID_API_KEY or EMAIL_FROM',
    };
  }

  // Placeholder: real SendGrid integration will be added later.
  return {
    ok: true,
    message: 'Email queued (placeholder)',
    to,
    subject,
  };
};

module.exports = {
  sendEmail,
};
