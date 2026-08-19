const { Resend } = require('resend');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

function clean(value, fallback = '') {
  return typeof value === 'string' ? value.trim().slice(0, 240) : fallback;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CERTIFICATE_FROM_EMAIL;
  if (!apiKey || !from) {
    return res.status(503).json({ error: 'Email delivery is not configured. Add RESEND_API_KEY and CERTIFICATE_FROM_EMAIL in Vercel.' });
  }

  const body = req.body || {};
  const recipientName = clean(body.recipientName, 'Certificate recipient');
  const recipientEmail = clean(body.recipientEmail);
  const certificateId = clean(body.certificateId, `CERT-${Date.now()}`);
  const title = clean(body.title, 'Certificate of excellence');
  const organization = clean(body.organization, 'JAIVA Creative Labs');
  const signer = clean(body.signer, 'Program Director');

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
    return res.status(400).json({ error: 'A valid recipient email is required.' });
  }

  try {
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([842, 595]);
    const regular = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const italic = await pdf.embedFont(StandardFonts.TimesRomanItalic);
    const accent = rgb(0.12, 0.42, 0.33);
    page.drawRectangle({ x: 24, y: 24, width: 794, height: 547, borderColor: accent, borderWidth: 2, color: rgb(0.91, 0.96, 0.93) });
    page.drawText(organization.toUpperCase(), { x: 250, y: 470, size: 13, font: bold, color: accent });
    page.drawText('CERTIFICATE', { x: 255, y: 390, size: 36, font: bold, color: accent });
    page.drawText('OF RECOGNITION', { x: 304, y: 360, size: 15, font: italic, color: accent });
    page.drawText('This certificate is presented to', { x: 317, y: 305, size: 13, font: regular, color: accent });
    page.drawText(recipientName, { x: 421 - (bold.widthOfTextAtSize(recipientName, 27) / 2), y: 255, size: 27, font: bold, color: accent });
    page.drawText(title, { x: 421 - (italic.widthOfTextAtSize(title, 17) / 2), y: 215, size: 17, font: italic, color: accent });
    page.drawLine({ start: { x: 300, y: 168 }, end: { x: 542, y: 168 }, thickness: 1, color: accent });
    page.drawText(`${signer}  |  ${organization}`, { x: 300, y: 145, size: 10, font: regular, color: accent });
    page.drawText(certificateId, { x: 350, y: 62, size: 9, font: regular, color: accent });
    const pdfBytes = await pdf.save();
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from,
      to: [recipientEmail],
      subject: `${title} | ${organization}`,
      text: `Hi ${recipientName},\n\nYour certificate from ${organization} is attached.\n\nCertificate ID: ${certificateId}`,
      attachments: [{ filename: `${recipientName.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'certificate'}-${certificateId}.pdf`, content: Buffer.from(pdfBytes) }]
    });
    if (result.error) return res.status(502).json({ error: result.error.message || 'Email provider rejected the message.' });
    return res.status(200).json({ delivered: true, id: result.data?.id, recipientEmail, certificateId });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Certificate delivery failed.' });
  }
};
